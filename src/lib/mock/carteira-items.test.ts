import { describe, it, expect } from 'vitest'
import { generateMockItems, MOCK_CATALOG } from './carteira-items'

const notas = [
  { order_ref: 'A1', client_id: 'c1', valor: 1000, quantity: 3, sale_date: '2026-05-03' },
  { order_ref: 'A2', client_id: 'c1', valor: 250,  quantity: 1, sale_date: '2026-05-10' },
]

describe('generateMockItems', () => {
  it('é determinístico (mesmo input → mesmo output)', () => {
    const a = generateMockItems(notas)
    const b = generateMockItems(notas)
    expect(a).toEqual(b)
  })

  it('soma das linhas ≈ valor da nota (tolerância 1%)', () => {
    const items = generateMockItems(notas)
    for (const nota of notas) {
      const sum = items.filter(i => i.order_ref === nota.order_ref).reduce((s, i) => s + i.total_price, 0)
      expect(Math.abs(sum - nota.valor)).toBeLessThanOrEqual(nota.valor * 0.01)
    }
  })

  it('só usa categorias do catálogo', () => {
    const cats = new Set(MOCK_CATALOG.map(p => p.category))
    for (const i of generateMockItems(notas)) expect(cats.has(i.category)).toBe(true)
  })

  it('gera 1 a 3 linhas por nota', () => {
    const items = generateMockItems(notas)
    const perOrder = new Map<string, number>()
    for (const i of items) perOrder.set(i.order_ref, (perOrder.get(i.order_ref) ?? 0) + 1)
    for (const n of perOrder.values()) { expect(n).toBeGreaterThanOrEqual(1); expect(n).toBeLessThanOrEqual(3) }
  })
})
