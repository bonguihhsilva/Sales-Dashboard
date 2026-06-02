export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { fmtCurrency, fmtK, metaLevel, bonusAmount } from '@/lib/utils'
import { KpiCard, StorePill, ProgressBar, SectionTitle, LogoutButton } from '@/components/ui'
import ClientsTab from '../../ClientsTab'
import EvolutionChart from './EvolutionChart'
import type { Period } from '@/types'

export default async function VendorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ vendor_id: string }>
  searchParams: Promise<{ period?: string; tab?: string }>
}) {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  
  let currentProfile = profile
  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (!currentProfile) {
    currentProfile = { role: jwtRole, tenant_id: user.id }
  }

  const effectiveRole = currentProfile.role || jwtRole
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/vendedor/meu-resultado')
  }

  const { vendor_id } = await params
  const sp = await searchParams

  const { data: periods } = await supabase
    .from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })

  const activePeriod = sp.period ? parseInt(sp.period) : (periods?.[0]?.id ?? 1)
  const activeTab    = sp.tab ?? 'performance'

  // vendor_summary tem SELECT revogado de authenticated (hardening) — leitura via service_role, escopada ao tenant.
  const adminDb = createAdminClient()
  const { data: summary } = await adminDb
    .from('vendor_summary').select('*').eq('period_id', activePeriod).eq('vendor_id', vendor_id).eq('tenant_id', currentProfile?.tenant_id).single()

  const { data: evolution } = await supabase.rpc('vendor_evolution', { p_vendor_id: vendor_id })

  if (!summary) notFound()

  const sold  = Number(summary.total_sold)
  const m1 = Number(summary.meta1), m2 = Number(summary.meta2), m3 = Number(summary.meta3)
  const lvl = metaLevel(sold, m1, m2, m3)
  const b   = bonusAmount(lvl, Number(summary.bonus1), Number(summary.bonus2), Number(summary.bonus3))
  const commission = sold * Number(summary.commission_pct) + b

  // How much is missing to reach the next meta
  const nextMetaValue = lvl === 0 ? m1 : lvl === 1 ? m2 : lvl === 2 ? m3 : null
  const nextMetaLabel = lvl === 0 ? '1ª meta' : lvl === 1 ? '2ª meta' : lvl === 2 ? '3ª meta' : null
  const nextMetaDiff  = nextMetaValue !== null ? nextMetaValue - sold : null
  const nextMetaPct   = nextMetaValue !== null ? Math.round(sold / nextMetaValue * 100) : 100
  const { data: dbStores } = await supabase.from('stores').select('*').eq('tenant_id', profile?.tenant_id)
  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name, color: s.color }))
  const storeObj = stores.find(s => s.key === summary.store)
  const col = storeObj?.color || 'var(--accent)'

  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  // Ranking position
  const { data: allSummaries } = await adminDb
    .from('vendor_summary').select('vendor_id, total_sold, store').eq('period_id', activePeriod).eq('tenant_id', currentProfile?.tenant_id).order('total_sold', { ascending: false })
  const rankAll   = (allSummaries ?? []).findIndex(s => s.vendor_id === vendor_id) + 1
  const rankStore = (allSummaries ?? []).filter(s => s.store === summary.store).findIndex(s => s.vendor_id === vendor_id) + 1

  const pctRef = lvl === 0
    ? `da 1ª meta (${fmtK(m1)})`
    : lvl === 1 ? `da 1ª meta atingida (${fmtK(m1)})`
    : lvl === 2 ? `da 2ª meta atingida (${fmtK(m2)})`
    : `da 3ª meta atingida (${fmtK(m3)})`

  const pctBase = lvl === 0 ? m1 : lvl === 1 ? m1 : lvl === 2 ? m2 : m3
  const pctLabel = Math.round(sold / pctBase * 100)

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <a href={`/dashboard?period=${activePeriod}`} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar ao dashboard
          </a>
          <h1 className="font-display-lg text-display-lg text-on-surface">{summary.vendor_name}</h1>
        </div>
        <div className="flex gap-stack-sm flex-wrap items-center">
          <StorePill store={summary.store} label={storeObj?.label} colorClass={storeObj?.color} />
          <div className="px-4 py-2 bg-surface-container-high rounded-xl border border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-muted-foreground text-sm">calendar_month</span>
            <span className="text-xs font-mono font-bold text-on-surface-variant">{activePeriodLabel}</span>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex gap-stack-sm overflow-x-auto pb-4 no-scrollbar mb-6 border-b border-white/5">
          {[
            { key: 'performance', label: 'Performance', icon: 'monitoring' },
            { key: 'carteira',    label: 'Carteira de Clientes', icon: 'groups' },
            { key: 'evolucao',    label: 'Evolução', icon: 'trending_up' },
          ].map(tab => (
            <a key={tab.key}
              href={`/dashboard/vendedor/${vendor_id}?period=${activePeriod}&tab=${tab.key}`}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.key 
                  ? 'bg-tertiary-container text-on-tertiary-container' 
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </a>
          ))}
        </div>

        {activeTab === 'performance' && (
          <div className="flex flex-col gap-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KpiCard label="Total Vendido"  value={fmtCurrency(sold)} valueClassName="text-accent" />
              <KpiCard label="Clientes"       value={Number(summary.unique_clients).toLocaleString()} />
              <KpiCard label="Ticket Médio"   value={fmtCurrency(Number(summary.avg_ticket))} />
              <KpiCard label="Alcance Meta"   value={`${pctLabel}%`} sub={pctRef} valueClassName={['text-muted-foreground','text-meta1','text-meta2','text-meta3'][lvl]} />
              <KpiCard
                label="Comissão Total"
                value={fmtCurrency(commission)}
                sub={`0,3% × vendas + bônus $${b}`}
                valueClassName={['text-muted-foreground','text-meta1','text-meta2','text-meta3'][lvl]}
              />
            </div>

            {/* Progress */}
            <div className="glass-card rounded-2xl p-card-padding border border-white/5">
              <SectionTitle>Progresso das Metas</SectionTitle>
              <div className="mt-4">
                <ProgressBar sold={sold} meta1={m1} meta2={m2} meta3={m3} metaLevel={lvl} />
              </div>

              {/* Current % + next meta gap */}
              <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${['text-muted-foreground','text-meta1','text-meta2','text-meta3'][lvl]}`}>{pctLabel}%</span>
                  <span className="text-xs font-mono text-muted-foreground">{pctRef}</span>
                </div>

                {nextMetaDiff !== null && nextMetaDiff > 0 ? (
                  <div className="flex items-center gap-6 bg-surface-container-high rounded-xl p-4 border border-white/5">
                    <div>
                      <div className="text-[0.6rem] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                        Falta para {nextMetaLabel}
                      </div>
                      <div className={`text-xl font-bold ${['text-meta1','text-meta2','text-meta3'][lvl]}`}>
                        {fmtCurrency(nextMetaDiff)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[0.6rem] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                        Progresso
                      </div>
                      <div className={`text-xl font-bold ${['text-meta1','text-meta2','text-meta3'][lvl]}`}>
                        {nextMetaPct}%
                      </div>
                    </div>
                    {/* Mini progress bar for next meta only */}
                    <div className="w-24 ml-2">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${['bg-meta1','bg-meta2','bg-meta3'][lvl]}`}
                          style={{ width: `${isNaN(nextMetaPct) ? 0 : Math.min(nextMetaPct, 100)}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[0.55rem] font-mono text-muted-foreground">{fmtK(sold)}</span>
                        <span className="text-[0.55rem] font-mono text-muted-foreground">{fmtK(nextMetaValue!)}</span>
                      </div>
                    </div>
                  </div>
                ) : lvl === 3 ? (
                  <div className="flex items-center gap-3 bg-meta3/10 border border-meta3/30 rounded-xl px-4 py-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="text-sm font-bold text-meta3">3ª meta atingida!</div>
                      <div className="text-[0.65rem] font-mono text-muted-foreground mt-0.5">
                        +{fmtCurrency(sold - m3)} acima do teto
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Ranking + Bonus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`rounded-2xl p-8 text-center border ${
                ['bg-surface-container-high/50 border-white/5', 'bg-meta1/10 border-meta1/30', 'bg-meta2/10 border-meta2/30', 'bg-meta3/10 border-meta3/30'][lvl]
              }`}>
                <div className={`text-[0.65rem] font-mono uppercase tracking-widest mb-2 ${['text-muted-foreground','text-meta1','text-meta2','text-meta3'][lvl]}`}>Bônus</div>
                <div className={`text-4xl font-bold ${['text-muted-foreground','text-meta1','text-meta2','text-meta3'][lvl]}`}>{b > 0 ? `+$${b}` : '—'}</div>
                <div className={`text-xs font-mono mt-3 opacity-80 ${['text-muted-foreground','text-meta1','text-meta2','text-meta3'][lvl]}`}>
                  {['Ainda não atingiu a 1ª meta','1ª meta atingida!','2ª meta atingida!','3ª meta atingida! 🏆'][lvl]}
                </div>
              </div>
              <div className="bg-surface-container-high rounded-2xl p-8 text-center border border-white/5 flex flex-col justify-center items-center">
                <div className="text-[0.65rem] font-mono text-muted-foreground uppercase tracking-widest mb-2">Ranking</div>
                <div className="text-4xl font-bold text-accent">#{rankAll} <span className="text-2xl font-medium text-on-surface">geral</span></div>
                <div className="text-xs font-mono text-muted-foreground mt-3">de {allSummaries?.length ?? 0} vendedores no período</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'carteira' && (
          <ClientsTab periodId={activePeriod} vendorId={vendor_id} />
        )}

        {activeTab === 'evolucao' && (
          <EvolutionChart data={evolution ?? []} vendorName={summary.vendor_name} />
        )}
      </div>
    </div>
  )
}
