export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fmtCurrency, fmtK, metaLevel, bonusAmount, STORE_COLORS } from '@/lib/utils'
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  const { vendor_id } = await params
  const sp = await searchParams

  const { data: periods } = await supabase
    .from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })

  const activePeriod = sp.period ? parseInt(sp.period) : (periods?.[0]?.id ?? 1)
  const activeTab    = sp.tab ?? 'performance'

  const { data: summary } = await supabase
    .from('vendor_summary').select('*').eq('period_id', activePeriod).eq('vendor_id', vendor_id).single()

  const { data: evolution } = await supabase.rpc('vendor_evolution', { p_vendor_id: vendor_id })

  if (!summary) redirect('/dashboard')

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
  const col = STORE_COLORS[summary.store] || 'var(--accent)'

  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  // Ranking position
  const { data: allSummaries } = await supabase
    .from('vendor_summary').select('vendor_id, total_sold').eq('period_id', activePeriod).order('total_sold', { ascending: false })
  const rankAll   = (allSummaries ?? []).findIndex(s => s.vendor_id === vendor_id) + 1
  const rankStore = (allSummaries ?? []).filter(s => {}).findIndex(s => s.vendor_id === vendor_id) + 1

  const pctRef = lvl === 0
    ? `da 1ª meta (${fmtK(m1)})`
    : lvl === 1 ? `da 1ª meta atingida (${fmtK(m1)})`
    : lvl === 2 ? `da 2ª meta atingida (${fmtK(m2)})`
    : `da 3ª meta atingida (${fmtK(m3)})`

  const pctBase = lvl === 0 ? m1 : lvl === 1 ? m1 : lvl === 2 ? m2 : m3
  const pctLabel = Math.round(sold / pctBase * 100)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <a href={`/dashboard?period=${activePeriod}`} style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>← Voltar ao dashboard</a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{summary.vendor_name}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StorePill store={summary.store} />
          <span style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px' }}>{activePeriodLabel}</span>
          <LogoutButton />
        </div>
      </div>

      <div style={{ padding: '1.5rem 2.5rem 3rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'performance', label: 'Performance' },
            { key: 'carteira',    label: 'Carteira de Clientes' },
            { key: 'evolucao',    label: 'Evolução' },
          ].map(tab => (
            <a key={tab.key}
              href={`/dashboard/vendedor/${vendor_id}?period=${activePeriod}&tab=${tab.key}`}
              style={{
                padding: '8px 20px', borderRadius: '6px 6px 0 0', fontSize: '0.8rem', fontWeight: 600,
                border: '1px solid transparent', borderBottom: 'none', textDecoration: 'none',
                background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                borderColor: activeTab === tab.key ? 'var(--border)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text)' : 'var(--muted)',
              }}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {activeTab === 'performance' && (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '1.5rem' }}>
              <KpiCard label="Total Vendido"  value={fmtCurrency(sold)} color={col} />
              <KpiCard label="Clientes"       value={Number(summary.unique_clients).toLocaleString()} />
              <KpiCard label="Ticket Médio"   value={fmtCurrency(Number(summary.avg_ticket))} />
              <KpiCard label="Alcance Meta"   value={`${pctLabel}%`} sub={pctRef} color={['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl]} />
              <KpiCard
                label="Comissão Total"
                value={fmtCurrency(commission)}
                sub={`0,3% × vendas + bônus $${b}`}
                color={['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl]}
              />
            </div>

            {/* Progress */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
              <SectionTitle>Progresso das Metas</SectionTitle>
              <ProgressBar sold={sold} meta1={m1} meta2={m2} meta3={m3} metaLevel={lvl} />

              {/* Current % + next meta gap */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: ['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl] }}>{pctLabel}%</span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{pctRef}</span>
                </div>

                {nextMetaDiff !== null && nextMetaDiff > 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'var(--surface2)', borderRadius: '8px',
                    padding: '8px 14px', border: '1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.58rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                        Falta para {nextMetaLabel}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: ['var(--meta1)','var(--meta2)','var(--meta3)'][lvl] }}>
                        {fmtCurrency(nextMetaDiff)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                        Progresso
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: ['var(--meta1)','var(--meta2)','var(--meta3)'][lvl] }}>
                        {nextMetaPct}%
                      </div>
                    </div>
                    {/* Mini progress bar for next meta only */}
                    <div style={{ width: '80px' }}>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '4px',
                          width: `${Math.min(nextMetaPct, 100)}%`,
                          background: ['var(--meta1)','var(--meta2)','var(--meta3)'][lvl],
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                        <span style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{fmtK(sold)}</span>
                        <span style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{fmtK(nextMetaValue!)}</span>
                      </div>
                    </div>
                  </div>
                ) : lvl === 3 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245,167,66,0.08)', border: '1px solid rgba(245,167,66,0.3)', borderRadius: '8px', padding: '8px 14px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏆</span>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--meta3)' }}>3ª meta atingida!</div>
                      <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
                        +{fmtCurrency(sold - m3)} acima do teto
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Ranking + Bonus */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                borderRadius: '10px', padding: '1.25rem', textAlign: 'center', border: '1px solid',
                background: ['rgba(107,111,122,0.1)','rgba(200,245,66,0.08)','rgba(66,217,245,0.08)','rgba(245,167,66,0.08)'][lvl],
                borderColor: ['rgba(107,111,122,0.3)','rgba(200,245,66,0.3)','rgba(66,217,245,0.3)','rgba(245,167,66,0.3)'][lvl],
              }}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: ['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl] }}>Bônus</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: ['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl] }}>{b > 0 ? `+$${b}` : '—'}</div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', marginTop: '5px', opacity: 0.75, color: ['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl] }}>
                  {['Ainda não atingiu a 1ª meta','1ª meta atingida!','2ª meta atingida!','3ª meta atingida! 🏆'][lvl]}
                </div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Ranking</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: col }}>#{rankAll} geral</div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>de {allSummaries?.length ?? 0} vendedores</div>
              </div>
            </div>
          </>
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
