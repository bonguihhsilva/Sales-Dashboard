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
    escopo: partial.escopo ?? 'coletivo',
    vendor_id: partial.vendor_id ?? null,
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

  it('bonus_fixo de regras gerais acumula todos que casam', () => {
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

  it('bônus de metas escalonadas (atingimento_meta): meta superior substitui meta inferior', () => {
    const metaRules = [
      regra({ id: 'm3', prioridade: 1, condicoes: [{ tipo: 'atingimento_meta', meta: 'meta3', comparador: '>=' }], acao: { tipo: 'bonus_fixo', valor: 200 } }),
      regra({ id: 'm2', prioridade: 2, condicoes: [{ tipo: 'atingimento_meta', meta: 'meta2', comparador: '>=' }], acao: { tipo: 'bonus_fixo', valor: 150 } }),
      regra({ id: 'm1', prioridade: 3, condicoes: [{ tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' }], acao: { tipo: 'bonus_fixo', valor: 100 } }),
      regra({ id: 'vol', prioridade: 4, condicoes: [{ tipo: 'volume_venda', comparador: '>=', valor: 10000 }], acao: { tipo: 'bonus_fixo', valor: 50 } }),
    ]

    // Atingiu apenas meta 1 (12.000 >= 10.000, mas < 15.000)
    const r1 = evaluateRules(metaRules, { ...metrics, total_sold: 12000 })
    expect(r1.extraBonus).toBe(150) // 100 (meta1) + 50 (volume)
    expect(r1.appliedRules.map(a => a.id)).toEqual(['m1', 'vol'])

    // Atingiu meta 2 (16.000 >= 15.000, mas < 20.000) -> ganha meta 2, substitui meta 1
    const r2 = evaluateRules(metaRules, { ...metrics, total_sold: 16000 })
    expect(r2.extraBonus).toBe(200) // 150 (meta2) + 50 (volume)
    expect(r2.appliedRules.map(a => a.id)).toEqual(['m2', 'vol'])

    // Atingiu meta 3 (22.000 >= 20.000) -> ganha meta 3, substitui meta 1 e 2
    const r3 = evaluateRules(metaRules, { ...metrics, total_sold: 22000 })
    expect(r3.extraBonus).toBe(250) // 200 (meta3) + 50 (volume)
    expect(r3.appliedRules.map(a => a.id)).toEqual(['m3', 'vol'])
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

  // ── Escopo: Coletiva vs Individual ───────────────────────────────
  it('escopo coletivo aplica para qualquer vendedor', () => {
    const r = evaluateRules(
      [regra({ escopo: 'coletivo', acao: { tipo: 'comissao_percentual', valor: 4 } })],
      { ...metrics, vendor_id: 'vendedor-qualquer' },
    )
    expect(r.commissionPct).toBe(0.04)
  })

  it('escopo individual casa apenas para o vendedor específico definido no escopo', () => {
    const rules = [
      regra({ escopo: 'individual', vendor_id: 'v-joao', acao: { tipo: 'comissao_percentual', valor: 6 } }),
    ]

    const joao = evaluateRules(rules, { ...metrics, vendor_id: 'v-joao' })
    expect(joao.commissionPct).toBe(0.06)

    const maria = evaluateRules(rules, { ...metrics, vendor_id: 'v-maria' })
    expect(maria.commissionPct).toBeNull()
  })

  it('regra individual sobrepõe regra coletiva quando tem maior prioridade', () => {
    const rules = [
      regra({ id: 'ind', prioridade: 1, escopo: 'individual', vendor_id: 'v-top', acao: { tipo: 'comissao_percentual', valor: 8 } }),
      regra({ id: 'col', prioridade: 2, escopo: 'coletivo', acao: { tipo: 'comissao_percentual', valor: 3 } }),
    ]

    const topVendor = evaluateRules(rules, { ...metrics, vendor_id: 'v-top' })
    expect(topVendor.commissionPct).toBe(0.08)

    const normalVendor = evaluateRules(rules, { ...metrics, vendor_id: 'v-normal' })
    expect(normalVendor.commissionPct).toBe(0.03)
  })

  // ── Marca, metas e unidade ───────────────────────────────
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
