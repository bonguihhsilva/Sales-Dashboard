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

  return <CarteiraClient clients={(clients ?? []) as Client[]} color="var(--accent)" />
}
