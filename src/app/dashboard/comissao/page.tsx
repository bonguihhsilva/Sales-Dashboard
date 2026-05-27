import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import type { Period } from '@/types'
import PeriodSelector from '../PeriodSelector'
import ComissaoClient, { type VendorRow } from './ComissaoClient'
import ExportButton from '../ExportButton'

export const dynamic = 'force-dynamic'

export default async function ComissaoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  
  const { data: profile } = await supabase
    .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()
  
  const effectiveRole = profile?.role || jwtRole

  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        Acesso Negado. Seu perfil ({effectiveRole}) não tem permissão para acessar esta página.
        <br/><br/>
        <a href="/dashboard" style={{ color: 'white', textDecoration: 'underline' }}>Voltar ao Dashboard</a>
      </div>
    )
  }

  const adminDb = createAdminClient()
  const { data: periods } = await adminDb
    .from('periods').select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const params = await searchParams
  const activePeriod = params.period ? parseInt(params.period) : (periods?.[0]?.id ?? 1)
  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  const { data: summaries } = await adminDb
    .from('vendor_summary')
    .select('*')
    .eq('period_id', activePeriod)
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <a href="/dashboard" style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Voltar ao dashboard
          </a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Comissões <span style={{ color: 'var(--accent)' }}>// {activePeriodLabel}</span>
          </h1>
          <p style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '3px' }}>
            GDS - FRAME · {effectiveRole.toUpperCase()} · {profile?.name || 'Administrador'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExportButton />
          <PeriodSelector periods={periods as Period[]} activePeriod={activePeriod} />
          <LogoutButton />
        </div>
      </div>

      <div style={{ padding: '1.5rem 2.5rem' }}>
        <ComissaoClient
          vendorRows={vendorRows}
          periodId={activePeriod}
          role={effectiveRole}
        />
      </div>
    </div>
  )
}
