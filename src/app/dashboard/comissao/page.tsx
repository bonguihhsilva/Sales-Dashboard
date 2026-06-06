import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import type { Period } from '@/types'
import PeriodSelector from '../PeriodSelector'
import ComissaoClient, { type VendorRow } from './ComissaoClient'
import ExportButton from '../ExportButton'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function ComissaoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  // getTenantContext resolve o tenant respeitando masquerade do super_admin (cookie active_tenant_id)
  const { profile } = await getTenantContext()
  const effectiveRole = profile.role

  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        Acesso Negado. Seu perfil ({effectiveRole}) não tem permissão para acessar esta página.
        <br/><br/>
        <a href="/dashboard" style={{ color: 'white', textDecoration: 'underline' }}>Voltar ao Dashboard</a>
      </div>
    )
  }

  const tenantId = profile.tenant_id

  const adminDb = createAdminClient()
  const { data: periods } = await adminDb
    .from('periods').select('*')
    .eq('tenant_id', tenantId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const params = await searchParams
  const activePeriod = params.period ? parseInt(params.period) : (periods?.[0]?.id ?? 1)
  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  const { data: summaries } = await adminDb
    .from('vendor_summary')
    .select('*')
    .eq('period_id', activePeriod)
    .eq('tenant_id', profile?.tenant_id)
    .order('total_sold', { ascending: false })

  // Resolve vendor text IDs → profile UUIDs for FK into comissoes_calculadas
  const vendorIds = (summaries ?? []).map(s => s.vendor_id as string)
  let vendorProfiles: { id: string; vendor_id: string }[] = []
  if (vendorIds.length > 0) {
    const r = await adminDb.from('profiles').select('id, vendor_id').in('vendor_id', vendorIds)
    vendorProfiles = r.data ?? []
  }

  const vendorToProfileId = new Map(vendorProfiles.map(p => [p.vendor_id, p.id]))
  const profileIds = [...vendorToProfileId.values()]

  let comissoes: { vendedor_id: string; id: string; comissao_base: number; bonus_total: number; total: number; aprovado: boolean; aprovado_por: string | null }[] = []
  if (profileIds.length > 0) {
    const r = await adminDb
      .from('comissoes_calculadas')
      .select('vendedor_id, id, comissao_base, bonus_total, total, aprovado, aprovado_por')
      .eq('periodo_id', activePeriod)
      .in('vendedor_id', profileIds)
    comissoes = (r.data ?? []).map(c => ({
      vendedor_id: c.vendedor_id as string,
      id: c.id as string,
      comissao_base: Number(c.comissao_base),
      bonus_total: Number(c.bonus_total),
      total: Number(c.total),
      aprovado: Boolean(c.aprovado),
      aprovado_por: c.aprovado_por as string | null,
    }))
  }

  const comissaoMap = new Map(comissoes.map(c => [c.vendedor_id, c]))

  const vendorRows: VendorRow[] = (summaries ?? []).map(s => {
    const profileId = vendorToProfileId.get(s.vendor_id as string) ?? null
    return {
      vendor_id: s.vendor_id as string,
      vendor_name: s.vendor_name as string,
      store: s.store as string,
      total_sold: Number(s.total_sold),
      commission_pct: Number(s.commission_pct),
      bonus_earned: Number(s.bonus_earned),
      total_commission: Number(s.total_commission),
      profile_id: profileId,
      comissao: profileId ? (comissaoMap.get(profileId) ?? null) : null,
    }
  })

  const { data: dbStores } = await adminDb
    .from('stores')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('name')

  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name, color: s.color }))

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10">
        <PageHeader
          title="Comissões"
          subtitle="Acompanhe e aprove o cálculo mensal de comissões e bônus dos vendedores."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Comissões' }]}
          actions={
            <>
              <PeriodSelector periods={(periods || []) as Period[]} activePeriod={activePeriod} />
              <ExportButton activePeriod={activePeriod} />
            </>
          }
        />
      </div>

      <div className="flex-1 glass-card rounded-2xl p-6 border border-white/5">
        <ComissaoClient
          vendorRows={vendorRows}
          periodId={activePeriod}
          role={effectiveRole}
          stores={stores as any}
        />
      </div>
    </div>
  )
}


