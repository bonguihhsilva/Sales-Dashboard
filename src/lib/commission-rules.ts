// Motor de avaliação das regras de comissão definidas pelos gerentes
// (/dashboard/regras-comissao → tabela regras_comissao).
//
// Semântica:
// - Regras ativas do tenant, ordenadas por prioridade asc (1 = mais alta).
// - Escopo da regra:
//   - 'coletivo' (padrão): aplica-se a todos os vendedores do tenant.
//   - 'individual': aplica-se estritamente ao vendor_id especificado.
// - Uma regra casa quando seu escopo é válido E TODAS as suas condições são
//   verdadeiras (condições vazias = casa sempre para o escopo alvo).
// - acao comissao_percentual: a regra de maior prioridade que casar define o
//   percentual (substitui goals.commission_pct). Valor em % humano (5 = 5%).
// - acao bonus_fixo:
//   - Para regras de meta escalonada (atingimento_meta): a de maior nível/prioridade
//     atingida concede o bônus e substitui metas inferiores (ex: bater meta 2 dá o
//     bônus da meta 2 sem somar indevidamente o da meta 1).
//   - Para demais regras de bônus fixo (volume geral, marca, etc.): acumulam somando.
// - acao comissao_percentual_marca: percentual específico de uma marca,
//   aplicado sobre a base da marca (vendas_por_marca[marca]). Por marca,
//   a de maior prioridade vence. Coexiste com o percentual geral: o geral
//   incide sobre a base total menos as bases de marcas com percentual próprio.
// - acao bonus_por_unidade: bônus que multiplica por uma contagem de negócio
//   (clientes ativos no período / clientes reativados no período).
// - Nenhuma regra ativa → retorno neutro (caller usa goals.commission_pct).
//
// Neutralidade defensiva: campos ausentes de VendorMetrics (ou marca não
// configurada) tratados como 0 — uma regra nunca casa contra dado inexistente
// (mesma regra da meta zerada: evita comissionar sem categoria configurada).

export type RegraEscopo = 'coletivo' | 'individual'

export type RegraCondicao =
  | { tipo: 'atingimento_meta'; meta: 'meta1' | 'meta2' | 'meta3'; comparador: string }
  | { tipo: 'volume_venda'; comparador: string; valor?: number }
  | { tipo: 'marca'; marca: string; comparador: string; valor?: number }
  | { tipo: 'volume_marca'; marca: string; comparador: string; valor?: number }
  | { tipo: 'meta_marca'; marca: string }
  | { tipo: 'vendedor'; vendor_id: string } // compatibilidade defensiva legada

export type RegraAcao =
  | { tipo: 'comissao_percentual'; valor: number }
  | { tipo: 'bonus_fixo'; valor: number }
  | { tipo: 'comissao_percentual_marca'; marca: string; valor: number }
  | { tipo: 'bonus_por_unidade'; unidade: 'cliente_ativo' | 'cliente_reativado'; valor_por_unidade: number }

export interface RegraComissao {
  id: string
  nome: string
  descricao?: string | null
  ativo?: boolean
  prioridade: number
  escopo?: RegraEscopo | string
  vendor_id?: string | null
  condicoes: RegraCondicao[]
  acao: RegraAcao
}

export interface VendorMetrics {
  vendor_id: string
  total_sold: number
  total_profit: number
  meta1: number
  meta2: number
  meta3: number
  // Nova v0-2: marca |-> valor vendido no período (0 = sem vendas da marca)
  vendas_por_marca: Record<string, number>
  // Nova v0-2: marca |-> meta configurada em goals_brand (0 = não configurada)
  metas_por_marca: Record<string, number>
  // Nova v0-2: contagens usadas por bonus_por_unidade
  clientes_ativos: number
  clientes_reativados: number
}

export interface RuleEvaluation {
  // Fração (0.05 = 5%) ou null quando nenhuma regra percentual casou
  commissionPct: number | null
  // Percentuais por marca (fração) — regras comissao_percentual_marca que casaram
  perMarcas: Record<string, number>
  extraBonus: number
  appliedRules: Array<{ id: string; nome: string; tipo: string; valor: number }>
}

function compare(left: number, comparador: string, right: number): boolean {
  switch (comparador) {
    case '>=': return left >= right
    case '>':  return left > right
    case '==': return left === right
    case '<=': return left <= right
    case '<':  return left < right
    default:   return false
  }
}

/** Retorna o volume da marca (0 se a marca não aparece em vendas_por_marca). */
function marcaVol(cond: Extract<RegraCondicao, { marca: string }>, m: VendorMetrics): number {
  return Number(m.vendas_por_marca?.[cond.marca] ?? 0)
}

function condicaoMatches(cond: RegraCondicao, m: VendorMetrics): boolean {
  switch (cond.tipo) {
    case 'atingimento_meta': {
      const metaValor = Number(m[cond.meta] ?? 0)
      // Meta não definida (0) nunca casa — evita comissionar sem meta configurada
      if (metaValor <= 0) return false
      return compare(m.total_sold, cond.comparador, metaValor)
    }
    case 'volume_venda': {
      const valor = Number(cond.valor)
      if (!Number.isFinite(valor)) return false
      return compare(m.total_sold, cond.comparador, valor)
    }
    case 'marca':
    case 'volume_marca': {
      // Marca sem vendas (0) nunca casa — mesma regra da meta zerada
      if (marcaVol(cond, m) <= 0) return false
      const valor = Number(cond.valor)
      if (!Number.isFinite(valor)) return false
      return compare(marcaVol(cond, m), cond.comparador, valor)
    }
    case 'meta_marca': {
      const meta = Number(m.metas_por_marca?.[cond.marca] ?? 0)
      // Meta de marca não configurada (0) nunca casa
      if (meta <= 0) return false
      return compare(marcaVol(cond, m), '>=', meta)
    }
    case 'vendedor':
      // Compatibilidade legada
      return m.vendor_id === cond.vendor_id
    default:
      return false
  }
}

export function evaluateRules(rules: RegraComissao[], metrics: VendorMetrics): RuleEvaluation {
  const result: RuleEvaluation = { commissionPct: null, perMarcas: {}, extraBonus: 0, appliedRules: [] }

  const ordered = [...rules].sort((a, b) => a.prioridade - b.prioridade)
  let metaTierBonusAwarded = false

  for (const rule of ordered) {
    // 1. Verificação de Escopo (Coletiva vs Individual)
    const isIndividual = rule.escopo === 'individual' || (rule.vendor_id != null && rule.vendor_id.trim() !== '')
    if (isIndividual && rule.vendor_id && rule.vendor_id !== metrics.vendor_id) {
      continue
    }

    // 2. Verificação de Condições (Se...)
    const condicoes = Array.isArray(rule.condicoes) ? rule.condicoes : []
    const isMetaTierRule = condicoes.some(c => c.tipo === 'atingimento_meta')

    // Se já foi concedido um bônus de atingimento de meta de maior prioridade,
    // ignora metas inferiores para respeitar o escalonamento (substituição).
    if (isMetaTierRule && metaTierBonusAwarded && rule.acao?.tipo === 'bonus_fixo') {
      continue
    }

    const matches = condicoes.every(c => condicaoMatches(c, metrics))
    if (!matches) continue

    // 3. Aplicação do Resultado / Ação
    const acao = rule.acao
    if (!acao) continue

    if (acao.tipo === 'comissao_percentual') {
      const valor = Number(acao.valor)
      if (!Number.isFinite(valor)) continue
      // Primeira (maior prioridade) vence; demais percentuais ignorados
      if (result.commissionPct === null) {
        result.commissionPct = valor / 100
        result.appliedRules.push({ id: rule.id, nome: rule.nome, tipo: acao.tipo, valor })
      }
    } else if (acao.tipo === 'comissao_percentual_marca') {
      const valor = Number(acao.valor)
      if (!Number.isFinite(valor)) continue
      // Maior prioridade vence por marca
      if (!(acao.marca in result.perMarcas)) {
        result.perMarcas[acao.marca] = valor / 100
        result.appliedRules.push({ id: rule.id, nome: rule.nome, tipo: acao.tipo, valor })
      }
    } else if (acao.tipo === 'bonus_fixo') {
      const valor = Number(acao.valor)
      if (!Number.isFinite(valor)) continue
      result.extraBonus += valor
      if (isMetaTierRule) {
        metaTierBonusAwarded = true
      }
      result.appliedRules.push({ id: rule.id, nome: rule.nome, tipo: acao.tipo, valor })
    } else if (acao.tipo === 'bonus_por_unidade') {
      const valor = Number(acao.valor_por_unidade)
      if (!Number.isFinite(valor)) continue
      const n = acao.unidade === 'cliente_ativo' ? Number(metrics.clientes_ativos ?? 0) : Number(metrics.clientes_reativados ?? 0)
      const total = n * valor
      result.extraBonus += total
      result.appliedRules.push({ id: rule.id, nome: rule.nome, tipo: acao.tipo, valor: total })
    }
  }

  return result
}
