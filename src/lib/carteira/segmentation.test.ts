import { describe, it, expect } from 'vitest'
import { analyzeCarteira, paretoTop20Share } from './segmentation'
import type { CarteiraClient } from './types'

function mk(p: Partial<CarteiraClient>): CarteiraClient {
  return {
    client_id: 'c', client_name: 'C', vendor_id: 'v',
    total_spent: 0, visit_days: 1, total_orders: 1, total_items: 1,
    avg_items_per_order: 1, avg_ticket: 0, first_purchase: '2026-01-01',
    last_purchase: '2026-01-01', last_purchase_time: '10:00', days_since_last: 0,
    ...p,
  }
}

describe('analyzeCarteira', () => {
  it('marca cliente de 1 compra como novo', () => {
    const out = analyzeCarteira([mk({ client_id: 'a', total_orders: 1 })])
    expect(out[0].segment).toBe('novo')
  })

  it('marca recorrente inativo (>14d) como em_risco', () => {
    const out = analyzeCarteira([mk({ client_id: 'a', total_orders: 5, days_since_last: 30 })])
    expect(out[0].segment).toBe('em_risco')
  })

  it('marca topo (rfmSum alto) como vip', () => {
    const clients = [
      mk({ client_id: 'top', total_orders: 20, total_spent: 100000, days_since_last: 0 }),
      mk({ client_id: 'low', total_orders: 2,  total_spent: 100,    days_since_last: 5 }),
    ]
    const out = analyzeCarteira(clients)
    expect(out.find(c => c.client_id === 'top')!.segment).toBe('vip')
  })

  it('atribui scores RFM entre 1 e 5', () => {
    const out = analyzeCarteira([mk({}), mk({ client_id: 'b', total_spent: 999 })])
    for (const c of out) {
      for (const k of ['r', 'f', 'm'] as const) {
        expect(c.rfm[k]).toBeGreaterThanOrEqual(1)
        expect(c.rfm[k]).toBeLessThanOrEqual(5)
      }
    }
  })
})

describe('paretoTop20Share', () => {
  it('retorna fração da receita concentrada no top 20%', () => {
    const clients = Array.from({ length: 10 }, (_, i) =>
      mk({ client_id: String(i), total_spent: i === 0 ? 800 : 22 }))
    const share = paretoTop20Share(clients)
    expect(share).toBeGreaterThan(0.8)
    expect(share).toBeLessThanOrEqual(1)
  })

  it('retorna 0 para carteira vazia', () => {
    expect(paretoTop20Share([])).toBe(0)
  })
})

describe('tendência', () => {
  it('calcula variação % vs período anterior', () => {
    const out = analyzeCarteira([mk({ total_spent: 120, prev_total_spent: 100 })])
    expect(out[0].trendPct).toBeCloseTo(20)
  })
  it('trendPct é null sem período anterior', () => {
    const out = analyzeCarteira([mk({ total_spent: 120 })])
    expect(out[0].trendPct).toBeNull()
  })
  it('cliente com total_spent 0 e prev>0 é perdido', () => {
    const out = analyzeCarteira([mk({ total_orders: 0, total_spent: 0, prev_total_spent: 500, days_since_last: 99 })])
    expect(out[0].segment).toBe('perdido')
  })
})
