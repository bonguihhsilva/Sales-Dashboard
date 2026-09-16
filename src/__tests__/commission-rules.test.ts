import { describe, it, expect } from 'vitest'
import { evaluateRules, type RegraComissao, type VendorMetrics } from '@/lib/commission-rules'

const baseMetrics: VendorMetrics = {
  vendor_id: 'v',
  total_sold: 12000,
  total_profit: 4800,
  meta1: 10000,
  meta2: 15000,
  meta3: 20000,
  vendas_por_marca: {},
  metas_por_marca: {},
  clientes_ativos: 0,
  clientes_reativados: 0,
}

// compat: testes antigos usam campos escalares apenas
const metrics: VendorMetrics = baseMetrics

function regra(partial: Partial<RegraComissao>): RegraComissao {
  return {
    id: partial.id ?? 'r1',
    nome: partial.nome ?? 'Regra',
    prioridade: partial.prioridade ?? 1,
    condicoes: partial.condicoes ?? [],
    acao: partial.acao ?? { tipo: 'comissao_percentual', valor: 5 },
  }
}

describe('evaluateRules', () => {
  it('retorna neutro sem regras', () => {
    const r = evaluateRules([], metrics)
    expect(r.commissionPct).toBeNull()
    expect(r.perMarcas).toEqual({})
    expect(r.extraBonus).toBe(0)
    expect(r.appliedRules).toHaveLength(0)
  })

  it('regra sem condições casa sempre e converte % para fração', () => {
    const r = evaluateRules([regra({ acao: { tipo: 'comissao_percentual', valor: 5 } })], metrics)
    expect(r.commissionPct).toBe(0.05)
  })

  it('atingimento_meta: total_sold >= meta1 casa, >= meta2 não casa', () => {
    const casa = evaluateRules(
      [regra({ condicoes: [{ tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' }] })],
      metrics,
    )
    expect(casa.commissionPct).toBe(0.05)

    const naoCasa = evaluateRules(
      [regra({ condicoes: [{ tipo: 'atingimento_meta', meta: 'meta2', comparador: '>=' }] })],
      metrics,
    )
    expect(naoCasa.commissionPct).toBeNull()
  })

  it('meta zerada nunca casa', () => {
    const r = evaluateRules(
      [regra({ condicoes: [{ tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' }] })],
      { ...metrics, meta1: 0 },
    )
    expect(r.commissionPct).toBeNull()
  })

  it('volume_venda compara total_sold com valor', () => {
    const r = evaluateRules(
      [regra({ condicoes: [{ tipo: 'volume_venda', comparador: '>', valor: 11000 }] })],
      metrics,
    )
    expect(r.commissionPct).toBe(0.05)
  })

  it('múltiplas condições exigem todas verdadeiras', () => {
    const r = evaluateRules(
      [regra({
        condicoes: [
          { tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' },
          { tipo: 'volume_venda', comparador: '>=', valor: 99999 },
        ],
      })],
      metrics,
    )
    expect(r.commissionPct).toBeNull()
  })

  it('percentual: maior prioridade (menor número) vence', () => {
    const r = evaluateRules(
      [
        regra({ id: 'b', prioridade: 2, acao: { tipo: 'comissao_percentual', valor: 3 } }),
        regra({ id: 'a', prioridade: 1, acao: { tipo: 'comissao_percentual', valor: 7 } }),
      ],
      metrics,
    )
    expect(r.commissionPct).toBe(0.07)
    expect(r.appliedRules).toHaveLength(1)
    expect(r.appliedRules[0].id).toBe('a')
  })

  it('bonus_fixo acumula todos que casam', () => {
    const r = evaluateRules(
      [
        regra({ id: 'a', acao: { tipo: 'bonus_fixo', valor: 100 } }),
        regra({ id: 'b', prioridade: 2, acao: { tipo: 'bonus_fixo', valor: 50 } }),
      ],
      metrics,
    )
    expect(r.extraBonus).toBe(150)
    expect(r.appliedRules).toHaveLength(2)
  })

  it('percentual e bônus combinam', () => {
    const r = evaluateRules(
      [
        regra({ id: 'a', acao: { tipo: 'comissao_percentual', valor: 4 } }),
        regra({ id: 'b', prioridade: 2, acao: { tipo: 'bonus_fixo', valor: 200 } }),
      ],
      metrics,
    )
    expect(r.commissionPct).toBe(0.04)
    expect(r.extraBonus).toBe(200)
  })

  it('acao com valor inválido é ignorada', () => {
    const r = evaluateRules(
      [regra({ acao: { tipo: 'comissao_percentual', valor: NaN } })],
      metrics,
    )
    expect(r.commissionPct).toBeNull()
  })

  // ── v0-2: marca, vendedor e unidade ───────────────────────────────
  it('condição marca casa com volume da marca acima do valor', () => {
    const r = evaluateRules(
      [regra({ condicoes: [{ tipo: 'marca', marca: 'Nike', comparador: '>=', valor: 5000 }] })],
      { ...metrics, vendor_id: 'v', vendas_por_marca: { Nike: 6000 } },
    )
    expect(r.commissionPct).toBe(0.05)
  })

  it('marca não configurada (sem linha) nunca casa', () => {
    const r = evaluateRules(
      [regra({ condicoes: [{ tipo: 'marca', marca: 'Nike', comparador: '>=', valor: 5000 }] })],
      { ...metrics, vendor_id: 'v', vendas_por_marca: {} },
    )
    expect(r.commissionPct).toBeNull()
  })

  it('condição vendedor casa só para o vendedor da regra', () => {
    const casa = evaluateRules(
      [regra({ condicoes: [{ tipo: 'vendedor', vendor_id: 'v-1' }] })],
      { ...metrics, vendor_id: 'v-1' },
    )
    expect(casa.commissionPct).toBe(0.05)

    const nao = evaluateRules(
      [regra({ condicoes: [{ tipo: 'vendedor', vendor_id: 'v-1' }] })],
      { ...metrics, vendor_id: 'v-2' },
    )
    expect(nao.commissionPct).toBeNull()
  })

  it('meta_marca casa quando vendas da marca >= meta configurada (>0)', () => {
    const r = evaluateRules(
      [regra({ condicoes: [{ tipo: 'meta_marca', marca: 'Nike' }] })],
      { ...metrics, vendor_id: 'v', vendas_por_marca: { Nike: 7000 }, metas_por_marca: { Nike: 5000 } },
    )
    expect(r.commissionPct).toBe(0.05)
  })

  it('meta_marca sem meta configurada (0) nunca casa', () => {
    const r = evaluateRules(
      [regra({ condicoes: [{ tipo: 'meta_marca', marca: 'Nike' }] })],
      { ...metrics, vendor_id: 'v', vendas_por_marca: { Nike: 7000 }, metas_por_marca: {} },
    )
    expect(r.commissionPct).toBeNull()
  })

  it('bonus_por_unidade multiplica pela contagem (cliente_ativo)', () => {
    const r = evaluateRules(
      [regra({ acao: { tipo: 'bonus_por_unidade', unidade: 'cliente_ativo', valor_por_unidade: 10 } })],
      { ...metrics, vendor_id: 'v', clientes_ativos: 7, clientes_reativados: 2 },
    )
    expect(r.extraBonus).toBe(70)
  })

  it('bonus_por_unidade multiplica pela contagem (cliente_reativado)', () => {
    const r = evaluateRules(
      [regra({ acao: { tipo: 'bonus_por_unidade', unidade: 'cliente_reativado', valor_por_unidade: 25 } })],
      { ...metrics, vendor_id: 'v', clientes_ativos: 7, clientes_reativados: 3 },
    )
    expect(r.extraBonus).toBe(75)
  })

  it('comissao_percentual_marca usa base da marca e convive com percentual geral', () => {
    const r = evaluateRules(
      [
        regra({ id: 'g', acao: { tipo: 'comissao_percentual', valor: 3 } }),
        regra({ id: 'n', prioridade: 2, acao: { tipo: 'comissao_percentual_marca', marca: 'Nike', valor: 5 } }),
      ],
      { ...metrics, vendor_id: 'v', vendas_por_marca: { Nike: 2000 } },
    )
    expect(r.commissionPct).toBe(0.03)
    expect(r.perMarcas).toEqual({ Nike: 0.05 })
  })

  it('comissao_percentual_marca: maior prioridade vence por marca', () => {
    const r = evaluateRules(
      [
        regra({ id: 'a', prioridade: 1, acao: { tipo: 'comissao_percentual_marca', marca: 'Nike', valor: 7 } }),
        regra({ id: 'b', prioridade: 2, acao: { tipo: 'comissao_percentual_marca', marca: 'Nike', valor: 3 } }),
      ],
      { ...metrics, vendor_id: 'v', vendas_por_marca: { Nike: 6000 } },
    )
    expect(r.perMarcas).toEqual({ Nike: 0.07 })
  })
})