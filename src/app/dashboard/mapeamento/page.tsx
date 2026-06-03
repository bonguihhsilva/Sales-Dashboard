import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { LogoutButton, PageHeader } from '@/components/ui'
import MapeamentoClient from './MapeamentoClient'

export const dynamic = 'force-dynamic'

export default async function MapeamentoPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/vendedor/meu-resultado')
  }

  const tenant_id = profile.tenant_id
  const admin = createAdminClient()

  const { data: storesData } = await admin
    .from('stores')
    .select('key, label, color')
    .eq('tenant_id', tenant_id)
    .order('label')

  const stores = storesData ?? []

  // All user profiles
  let profilesQuery = admin.from('profiles').select('*').order('name')
  if (tenant_id) profilesQuery = profilesQuery.eq('tenant_id', tenant_id)
  const { data: profiles } = await profilesQuery

  // All vendor goals (vendor_ids that have metas defined)
  let goalsQuery = admin.from('goals').select('vendor_id, vendor_name, store').order('vendor_name')
  if (tenant_id) goalsQuery = goalsQuery.eq('tenant_id', tenant_id)
  const { data: goals } = await goalsQuery

  // Vendor_ids from sales that are NOT in goals (appeared in HTML but never registered)
  let orphanQuery = admin.from('sales_records').select('vendor_id, vendor_name, store').order('vendor_name')
  if (tenant_id) orphanQuery = orphanQuery.eq('tenant_id', tenant_id)
  const { data: orphanSales } = await orphanQuery

  // Deduplicate goals vendors
  const uniqueVendors = Array.from(
    new Map((goals ?? []).map(g => [g.vendor_id, g])).values()
  ).sort((a, b) => a.vendor_name.localeCompare(b.vendor_name))

  // Deduplicate orphan vendors (in sales but NOT in goals)
  const goalIds = new Set((goals ?? []).map(g => g.vendor_id))
  const orphanVendors = Array.from(
    new Map(
      (orphanSales ?? [])
        .filter(s => !goalIds.has(s.vendor_id))
        .map(s => [s.vendor_id, s])
    ).values()
  ).sort((a, b) => a.vendor_name.localeCompare(b.vendor_name))

  return (
    <div className="min-h-screen bg-bg">
      <div className="px-10 pt-6">
        <PageHeader
          title="Mapeamento"
          subtitle="Vendedor → Usuário"
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Mapeamento' }]}
          actions={<LogoutButton />}
        />
      </div>
      <div className="p-10">
        <MapeamentoClient
          profiles={profiles ?? []}
          vendors={uniqueVendors}
          orphanVendors={orphanVendors}
          stores={stores}
        />
      </div>
    </div>
  )
}


