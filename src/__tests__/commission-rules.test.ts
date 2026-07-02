import { describe, it, expect } from 'vitest'
import { evaluateRules, type RegraComissao, type VendorMetrics } from '@/lib/commission-rules'

const metrics: VendorMetrics = { total_sold: 12000, meta1: 10000, meta2: 15000, meta3: 20000 }

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
})
