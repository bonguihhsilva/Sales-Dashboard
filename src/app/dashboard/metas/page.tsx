import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import MetasClient from './MetasClient'
import type { GoalBrand } from '@/types'

export const dynamic = 'force-dynamic'

type MetasClientProps = Parameters<typeof MetasClient>[0]

export default async function MetasPage() {
  // getTenantContext resolve o tenant respeitando masquerade do super_admin (cookie active_tenant_id)
  const { profile } = await getTenantContext()
  const role = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(role)) {
    redirect('/vendedor/meu-resultado')
  }

  const tenantId = profile.tenant_id
  let periods: MetasClientProps['periods'] = []
  let goals: MetasClientProps['goals'] = []
  let stores: MetasClientProps['stores'] = []
  let goalsBrand: GoalBrand[] = []
  let brands: string[] = []
  let vendors: MetasClientProps['vendors'] = []

  // tenantId null = super_admin sem tenant selecionado → listas vazias (escolher via switcher)
  if (tenantId) {
    const adminDb = createAdminClient()
    const [periodsRes, goalsRes, storesRes, goalsBrandRes, productCostsRes, profilesRes] = await Promise.all([
      adminDb.from('periods').select('*').eq('tenant_id', tenantId).order('id', { ascending: false }),
      adminDb.from('goals').select('*').eq('tenant_id', tenantId).order('vendor_name'),
      adminDb.from('stores').select('name, color').eq('tenant_id', tenantId).eq('ativo', true).order('name'),
      adminDb.from('goals_brand').select('*').eq('tenant_id', tenantId).order('brand'),
      adminDb.from('product_costs').select('brand').eq('tenant_id', tenantId).not('brand', 'is', null),
      adminDb.from('profiles').select('id, name, vendor_id, store').eq('tenant_id', tenantId).eq('role', 'vendedor'),
    ])

    periods = periodsRes.data ?? []
    goals = goalsRes.data ?? []
    stores = storesRes.data ?? []
    goalsBrand = (goalsBrandRes.data ?? []) as GoalBrand[]

    // Extrai lista única de marcas conhecidas do tenant
    const uniqueBrands = new Set<string>()
    for (const p of productCostsRes.data ?? []) {
      const b = p.brand?.trim()
      if (b) uniqueBrands.add(b)
    }
    for (const g of goalsBrand) {
      if (g.brand?.trim()) uniqueBrands.add(g.brand.trim())
    }
    brands = Array.from(uniqueBrands).sort()

    vendors = ((profilesRes.data ?? []).filter(p => p.vendor_id != null) as MetasClientProps['vendors']) ?? []
  }

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page gap-6">
      <PageHeader
        title="Gestão de Períodos e Metas"
        subtitle="Configure os objetivos de venda gerais e por marca de cada vendedor"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Metas' }
        ]}
      />
      <div>
        <MetasClient
          periods={periods}
          goals={goals}
          stores={stores}
          goalsBrand={goalsBrand}
          brands={brands}
          vendors={vendors}
        />
      </div>
    </div>
  )
}
