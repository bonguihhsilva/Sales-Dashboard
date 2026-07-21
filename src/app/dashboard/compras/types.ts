// Shapes espelham o <contract> da Fase 08. Nomes de coluna sao normativos:
// mudar aqui exige mudar a view correspondente.

export type StockStatus = 'ok' | 'stale' | 'unknown'
export type MovementClass = 'fast' | 'normal' | 'slow' | 'dead'

export interface InventoryMetric {
  tenant_id: string
  product_code: string
  product_name: string | null
  current_qty: number | null
  last_snapshot_date: string | null
  snapshot_staleness_days: number | null
  stock_status: StockStatus
  unit_cost: number | null
  has_cost: boolean
  stock_value: number | null
  qty_sold_short: number
  qty_sold_long: number
  revenue_short: number
  revenue_long: number
  profit_long: number | null
  ads: number
  dos: number | null
  wos: number | null
  turnover: number | null
  turnover_annualized: number | null
  cobertura_pct: number | null
  stockout_days: number | null
  stockout_rate: number | null
  is_stockout_now: boolean | null
  movement_class: MovementClass | null
  window_days: number
  long_window_days: number
}

export interface AbcRow {
  tenant_id: string
  product_code: string
  abc_basis: 'profit' | 'revenue'
  abc_metric: number
  abc_rank: number
  cum_pct: number | null
  abc_class: 'A' | 'B' | 'C'
}

export interface RankingRow {
  tenant_id: string
  product_code: string
  product_name: string | null
  store: string | null
  qty_sold: number
  revenue: number
  profit: number | null
  window_days: number
}

export interface InventorySummary {
  total_skus: number
  total_stock_value: number | null
  skus_sem_custo: number
  skus_em_quebra: number
  skus_parados: number
  skus_stale: number
  dos_medio: number | null
  turnover_medio: number | null
}
