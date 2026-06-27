import { describe, it, expect } from 'vitest'
import { aggregateCategoryMix, findCategoryGaps } from './categories'

const items = [
  { category: 'Celulares', total_price: 1000 },
  { category: 'Celulares', total_price: 500 },
  { category: 'Perfumaria', total_price: 500 },
]

describe('aggregateCategoryMix', () => {
  it('soma por categoria e calcula %', () => {
    const mix = aggregateCategoryMix(items)
    expect(mix[0]).toMatchObject({ category: 'Celulares', total: 1500, pct: 75 })
    expect(mix.find(m => m.category === 'Perfumaria')!.pct).toBe(25)
  })
  it('retorna [] para vazio', () => {
    expect(aggregateCategoryMix([])).toEqual([])
  })
})

describe('findCategoryGaps', () => {
  it('lista categorias do universo que o cliente nunca comprou', () => {
    const gaps = findCategoryGaps(['Celulares'], ['Celulares', 'Notebooks', 'TVs'])
    expect(gaps).toEqual(['Notebooks', 'TVs'])
  })
})
