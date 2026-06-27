'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { generateMockItems, type MockItem } from '@/lib/mock/carteira-items'
import { aggregateCategoryMix } from '@/lib/carteira/categories'


async function clientMockItems(clientId: string, tenantId: string): Promise<MockItem[]> {
  const admin = createAdminClient()
  const { data: notas } = await admin
    .from('sales_records')
    .select('order_ref, client_id, valor, quantity, sale_date')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .order('sale_date', { ascending: false })
    .limit(300)
  return generateMockItems((notas ?? []).map(n => ({
    order_ref: String(n.order_ref ?? n.client_id),
    client_id: clientId,
    valor: Number(n.valor),
    quantity: Number(n.quantity),
    sale_date: String(n.sale_date),
  })))
}

export async function fetchClientCategoryMix(clientId: string, periodId: number) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile?.tenant_id) throw new Error('Unauthorized')
  const admin = createAdminClient()

  const { data: real } = await admin
    .from('client_category_mix')
    .select('category, total')
    .eq('client_id', clientId)
    .eq('tenant_id', profile.tenant_id)
    .eq('period_id', periodId)

  if (real && real.length) {
    return aggregateCategoryMix(
      (real as { category: string; total: number }[]).map(r => ({
        category: r.category,
        total_price: Number(r.total),
      }))
    )
  }
  const items = await clientMockItems(clientId, profile.tenant_id)
  return aggregateCategoryMix(items.map(i => ({ category: i.category, total_price: i.total_price })))
}

export async function fetchClientItemHistory(clientId: string) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile?.tenant_id) throw new Error('Unauthorized')
  const admin = createAdminClient()

  // ordens reais do cliente — escopa sale_items ao cliente (evita retornar itens de outros)
  const { data: notas } = await admin
    .from('sales_records')
    .select('order_ref')
    .eq('client_id', clientId)
    .eq('tenant_id', profile.tenant_id)
    .limit(300)
  const orderRefs = [...new Set((notas ?? []).map(n => String(n.order_ref)))]

  if (orderRefs.length) {
    const { data: real } = await admin
      .from('sale_items')
      .select('order_id, product_code, qty, unit_price, total_price, category')
      .eq('tenant_id', profile.tenant_id)
      .in('order_id', orderRefs)
      .limit(500)
    if (real && real.length) return real
  }
  return clientMockItems(clientId, profile.tenant_id)
}
