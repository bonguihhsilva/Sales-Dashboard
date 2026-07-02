// Motor de avaliação das regras de comissão definidas pelos gerentes
// (/dashboard/regras-comissao → tabela regras_comissao).
//
// Semântica:
// - Regras ativas do tenant, ordenadas por prioridade asc (1 = mais alta).
// - Uma regra casa quando TODAS as suas condições são verdadeiras
//   (condições vazias = casa sempre).
// - acao comissao_percentual: a regra de maior prioridade que casar define o
//   percentual (substitui goals.commission_pct). Valor em % humano (5 = 5%).
// - acao bonus_fixo: TODAS as regras que casarem acumulam o bônus.
// - Nenhuma regra ativa → retorno neutro (caller usa goals.commission_pct).

export type RegraCondicao =
  | { tipo: 'atingimento_meta'; meta: 'meta1' | 'meta2' | 'meta3'; comparador: string }
  | { tipo: 'volume_venda'; comparador: string; valor?: number }

export interface RegraComissao {
  id: string
  nome: string
  prioridade: number
  condicoes: RegraCondicao[]
  acao: { tipo: 'comissao_percentual' | 'bonus_fixo'; valor: number }
}

export interface VendorMetrics {
  total_sold: number
  meta1: number
  meta2: number
  meta3: number
}

export interface RuleEvaluation {
  // Fração (0.05 = 5%) ou null quando nenhuma regra percentual casou
  commissionPct: number | null
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

function condicaoMatches(cond: RegraCondicao, m: VendorMetrics): boolean {
  if (cond.tipo === 'atingimento_meta') {
    const metaValor = Number(m[cond.meta] ?? 0)
    // Meta não definida (0) nunca casa — evita comissionar sem meta configurada
    if (metaValor <= 0) return false
    return compare(m.total_sold, cond.comparador, metaValor)
  }
  if (cond.tipo === 'volume_venda') {
    const valor = Number(cond.valor)
    if (!Number.isFinite(valor)) return false
    return compare(m.total_sold, cond.comparador, valor)
  }
  return false
}

export function evaluateRules(rules: RegraComissao[], metrics: VendorMetrics): RuleEvaluation {
  const result: RuleEvaluation = { commissionPct: null, extraBonus: 0, appliedRules: [] }

  const ordered = [...rules].sort((a, b) => a.prioridade - b.prioridade)

  for (const rule of ordered) {
    const condicoes = Array.isArray(rule.condicoes) ? rule.condicoes : []
    const matches = condicoes.every(c => condicaoMatches(c, metrics))
    if (!matches) continue

    const valor = Number(rule.acao?.valor)
    if (!Number.isFinite(valor)) continue

    if (rule.acao.tipo === 'comissao_percentual') {
      // Primeira (maior prioridade) vence; demais percentuais ignorados
      if (result.commissionPct === null) {
        result.commissionPct = valor / 100
        result.appliedRules.push({ id: rule.id, nome: rule.nome, tipo: rule.acao.tipo, valor })
      }
    } else if (rule.acao.tipo === 'bonus_fixo') {
      result.extraBonus += valor
      result.appliedRules.push({ id: rule.id, nome: rule.nome, tipo: rule.acao.tipo, valor })
    }
  }

  return result
}
