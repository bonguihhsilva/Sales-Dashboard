'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { generateMockItems, type MockItem } from '@/lib/mock/carteira-items'
import { aggregateCategoryMix } from '@/lib/carteira/categories'

async function clientMockItems(clientId: string, tenantId: string, vendorId: string | null): Promise<MockItem[]> {
  const admin = createAdminClient()
  let q = admin
    .from('sales_records')
    .select('order_ref, client_id, valor, quantity, sale_date')
    .eq('client_id', clientId).eq('tenant_id', tenantId)
  if (vendorId) q = q.eq('vendor_id', vendorId) as typeof q
  const { data: notas } = await q.order('sale_date', { ascending: false }).limit(300)
  return generateMockItems((notas ?? []).map(n => ({
    order_ref: String(n.order_ref ?? n.client_id),
    client_id: clientId, valor: Number(n.valor), quantity: Number(n.quantity), sale_date: String(n.sale_date),
  })))
}

/** Vendedores só enxergam o próprio vínculo com o cliente; admin/gerente usam o vendor da linha selecionada. */
function scopeVendor(role: string | undefined, ownVendorId: string | null, requested?: string | null): string | null {
  if (role === 'vendedor') return ownVendorId ?? null
  return requested ?? null
}

export async function fetchClientCategoryMix(clientId: string, periodId: number, vendorId?: string | null) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile?.tenant_id) throw new Error('Unauthorized')
  const admin = createAdminClient()
  const vendor = scopeVendor(profile.role, profile.vendor_id ?? null, vendorId)

  let q = admin
    .from('client_category_mix')
    .select('category, total')
    .eq('client_id', clientId).eq('tenant_id', profile.tenant_id).eq('period_id', periodId)
  if (vendor) q = q.eq('vendor_id', vendor) as typeof q
  const { data: real } = await q

  if (real && real.length) {
    return aggregateCategoryMix(
      (real as { category: string; total: number }[]).map(r => ({ category: r.category, total_price: Number(r.total) }))
    )
  }
  const items = await clientMockItems(clientId, profile.tenant_id, vendor)
  return aggregateCategoryMix(items.map(i => ({ category: i.category, total_price: i.total_price })))
}

export async function fetchClientItemHistory(clientId: string, vendorId?: string | null) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile?.tenant_id) throw new Error('Unauthorized')
  const admin = createAdminClient()
  const vendor = scopeVendor(profile.role, profile.vendor_id ?? null, vendorId)

  // ordens reais do cliente (escopadas ao vendor quando aplicável)
  let nq = admin
    .from('sales_records')
    .select('order_ref')
    .eq('client_id', clientId).eq('tenant_id', profile.tenant_id)
  if (vendor) nq = nq.eq('vendor_id', vendor) as typeof nq
  const { data: notas } = await nq.limit(300)
  const orderRefs = [...new Set((notas ?? []).map(n => String(n.order_ref)))]

  if (orderRefs.length) {
    let iq = admin
      .from('sale_items')
      .select('order_id, product_code, qty, unit_price, total_price, category')
      .eq('tenant_id', profile.tenant_id)
      .in('order_id', orderRefs)
    if (vendor) iq = iq.eq('vendor_id', vendor) as typeof iq
    const { data: real } = await iq.limit(500)
    if (real && real.length) return real
  }
  return clientMockItems(clientId, profile.tenant_id, vendor)
}
