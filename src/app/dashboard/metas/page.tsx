import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import MetasClient from './MetasClient'

export const dynamic = 'force-dynamic'

export default async function MetasPage() {
  // getTenantContext resolve o tenant respeitando masquerade do super_admin (cookie active_tenant_id)
  const { profile } = await getTenantContext()
  const role = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(role)) {
    redirect('/vendedor/meu-resultado')
  }

  const tenantId = profile.tenant_id
  let periods: any[] = []
  let goals: any[] = []
  let stores: any[] = []

  // tenantId null = super_admin sem tenant selecionado → listas vazias (escolher via switcher)
  if (tenantId) {
    const adminDb = createAdminClient()
    const [periodsRes, goalsRes, storesRes] = await Promise.all([
      adminDb.from('periods').select('*').eq('tenant_id', tenantId).order('id', { ascending: false }),
      adminDb.from('goals').select('*').eq('tenant_id', tenantId).order('vendor_name'),
      adminDb.from('stores').select('name, color').eq('tenant_id', tenantId).eq('ativo', true).order('name'),
    ])
    periods = periodsRes.data ?? []
    goals = goalsRes.data ?? []
    stores = storesRes.data ?? []
  }

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page gap-6">
      <PageHeader
        title="Gestão de Períodos e Metas"
        subtitle="Configure os objetivos de venda de cada vendedor por período"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Metas' }
        ]}
      />
      <div>
        <MetasClient periods={periods} goals={goals} stores={stores} />
      </div>
    </div>
  )
}
