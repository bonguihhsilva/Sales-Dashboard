import { MOCK_CATALOG } from '@/lib/mock/carteira-items'

export const CATEGORY_UNIVERSE: string[] = [...new Set(MOCK_CATALOG.map(p => p.category))]

export interface CategoryItem { category: string; total_price: number }
export interface CategoryMix { category: string; total: number; pct: number }

export function aggregateCategoryMix(items: CategoryItem[]): CategoryMix[] {
  if (items.length === 0) return []
  const map = new Map<string, number>()
  for (const it of items) map.set(it.category, (map.get(it.category) ?? 0) + it.total_price)
  const total = [...map.values()].reduce((s, v) => s + v, 0)
  return [...map.entries()]
    .map(([category, t]) => ({ category, total: t, pct: total ? Math.round((t / total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)
}

export function findCategoryGaps(clientCategories: string[], universe: string[]): string[] {
  const has = new Set(clientCategories)
  return universe.filter(c => !has.has(c))
}
