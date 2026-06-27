import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import CarteiraClient from './carteira/CarteiraClient'
import type { CarteiraClient as Client } from '@/lib/carteira/types'

export default async function ClientsTab({
  periodId,
  vendorId,
}: {
  periodId: number
  vendorId: string | null
}) {
  const { profile } = await getTenantContext()
  const admin = createAdminClient()

  let query = admin
    .from('client_portfolio')
    .select('*')
    .eq('period_id', periodId)
    .eq('tenant_id', profile.tenant_id)
    .order('total_spent', { ascending: false })
    .limit(1000)

  if (vendorId) query = query.eq('vendor_id', vendorId) as typeof query

  const { data: clients } = await query

  // período anterior (para tendência + perdidos)
  const { data: periodsList } = await admin
    .from('periods')
    .select('id, year, month')
    .eq('tenant_id', profile.tenant_id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const idx = (periodsList ?? []).findIndex(p => p.id === periodId)
  const prevPeriodId = idx >= 0 && idx < (periodsList ?? []).length - 1 ? periodsList![idx + 1].id : null

  const prevMap = new Map<string, { total: number; name: string; vendor_id: string }>()
  if (prevPeriodId) {
    let prevQuery = admin
      .from('client_portfolio')
      .select('client_id, client_name, vendor_id, total_spent')
      .eq('period_id', prevPeriodId)
      .eq('tenant_id', profile.tenant_id)
    if (vendorId) prevQuery = prevQuery.eq('vendor_id', vendorId) as typeof prevQuery
    const { data: prev } = await prevQuery
    for (const p of prev ?? []) {
      prevMap.set(`${p.client_id}::${p.vendor_id}`, { total: Number(p.total_spent), name: p.client_name as string, vendor_id: p.vendor_id as string })
    }
  }

  const currentKeys = new Set((clients ?? []).map(c => `${c.client_id}::${c.vendor_id}`))
  const enriched = (clients ?? []).map(c => ({ ...c, prev_total_spent: prevMap.get(`${c.client_id}::${c.vendor_id}`)?.total }))
  const lost = [...prevMap.entries()]
    .filter(([key]) => !currentKeys.has(key))
    .map(([key, p]) => ({
      client_id: key.split('::')[0], client_name: p.name, vendor_id: p.vendor_id,
      total_spent: 0, visit_days: 0, total_orders: 0, total_items: 0, avg_items_per_order: 0,
      avg_ticket: 0, first_purchase: '', last_purchase: '', last_purchase_time: '',
      days_since_last: 9999, prev_total_spent: p.total,
    }))

  return <CarteiraClient clients={[...enriched, ...lost] as Client[]} color="var(--accent)" />
}
