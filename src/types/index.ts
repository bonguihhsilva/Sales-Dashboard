export type UserRole = 'vendedor' | 'adm' | 'gerente' | 'super_admin'

export interface Profile {
  id: string
  name: string
  role: UserRole
  vendor_id: string | null
  numero_vendedor: string | null
  store: string | null
  tenant_id: string | null
  data_admissao: string | null
  ativo: boolean
  created_at: string
}

export interface Period {
  id: number
  year: number
  month: number
  label: string
  start_date: string
  end_date: string
  closed: boolean
}

export interface Goal {
  id: number
  period_id: number
  vendor_id: string
  vendor_name: string
  store: string
  meta1: number
  meta2: number
  meta3: number
  bonus1: number
  bonus2: number
  bonus3: number
  commission_pct: number
}

export interface VendorSummary {
  period_id: number
  period_label: string
  year: number
  month: number
  vendor_id: string
  vendor_name: string
  store: string
  total_sold: number
  unique_clients: number
  total_orders: number
  total_items: number
  avg_ticket: number
  last_sale_date: string
  last_sale_time: string
  meta1: number
  meta2: number
  meta3: number
  bonus1: number
  bonus2: number
  bonus3: number
  commission_pct: number
  meta_level: number
  bonus_earned: number
  total_commission: number
}

export interface ClientPortfolio {
  period_id: number
  vendor_id: string
  client_id: string
  client_name: string
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
}

export interface VendorEvolution {
  year: number
  month: number
  period_label: string
  total_sold: number
  meta1: number
  meta2: number
  meta3: number
  meta_level: number
  bonus_earned: number
  unique_clients: number
  total_items: number
}

export const STORE_COLORS: Record<string, string> = {
  'Jebai': '#7b61ff',
  'Paje-MKT': '#42d9f5',
  'Paje-Caixa': '#f5a742',
}

export const STORE_LABELS: Record<string, string> = {
  'Jebai': 'Jebai',
  'Paje-MKT': 'Paje 1',
  'Paje-Caixa': 'Paje 2',
}
