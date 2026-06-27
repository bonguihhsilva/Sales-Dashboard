// src/lib/carteira/types.ts
export interface CarteiraClient {
  client_id: string
  client_name: string
  vendor_id: string
  vendor_name?: string
  total_spent: number
  visit_days: number
  total_orders: number
  total_items: number
  avg_items_per_order: number
  avg_ticket: number
  first_purchase: string
  last_purchase: string
  last_purchase_time: string
  days_since_last: number
  prev_total_spent?: number
}

export type Segment = 'vip' | 'recorrente' | 'novo' | 'em_risco' | 'perdido'

export interface RfmScore {
  r: number // 1..5
  f: number // 1..5
  m: number // 1..5
}

export interface AnalyzedClient extends CarteiraClient {
  rfm: RfmScore
  rfmSum: number
  segment: Segment
  trendPct: number | null
}

export const SEGMENT_LABELS: Record<Segment, string> = {
  vip: 'VIP',
  recorrente: 'Recorrente',
  novo: 'Novo',
  em_risco: 'Em risco',
  perdido: 'Perdido',
}

export const SEGMENT_COLORS: Record<Segment, string> = {
  vip: '#10b981',
  recorrente: '#6b6f7a',
  novo: '#f5a742',
  em_risco: '#f43f5e',
  perdido: '#8b5cf6',
}
