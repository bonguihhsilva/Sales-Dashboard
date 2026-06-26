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
  commission_type: 'revenue' | 'profit'
}

export interface Product {
  id: string
  tenant_id: string
  period_id: number
  product_code: string
  name: string | null
  cost_price: number | null
  sale_price: number | null
  margin_pct: number | null
  updated_at: string
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
  commission_type: 'revenue' | 'profit'
  meta_level: number
  bonus_earned: number
  total_commission: number
  total_profit: number
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

export interface Tenant {
  id: string
  nome: string
  slug: string
  ativo: boolean
  cor_primaria?: string
  logo_url?: string
}

export interface Store {
  id: string
  tenant_id: string
  name: string
  color: string
}

// HR types (from main branch features)
export type HRFreeDayStatus = 'available' | 'used' | 'expired' | 'deducted';
export type HRAbsenceType   = 'deduct_free_day' | 'justified' | 'no_balance';
export type HRPermissionType   = 'medical_certificate' | 'appointment' | 'document';
export type HRPermissionStatus = 'pending' | 'approved' | 'denied';

export interface HRFreeDay {
  id: string;
  user_id: string;
  issued_at: string;
  expires_at: string;
  status: HRFreeDayStatus;
  used_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  user_name?: string;
}

export interface HRAbsence {
  id: string;
  user_id: string;
  absence_date: string;
  type: HRAbsenceType;
  free_day_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  user_name?: string;
}

export interface HRVacation {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  user_name?: string;
}

export interface HRPermission {
  id: string;
  user_id: string;
  type: HRPermissionType;
  requested_date: string;
  status: HRPermissionStatus;
  requested_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  user_name?: string;
}

export interface HRUserFreeDaySummary {
  user_id: string;
  user_name: string;
  available: number;
  expired: number;
  used: number;
  next_expiry: string | null;
}
