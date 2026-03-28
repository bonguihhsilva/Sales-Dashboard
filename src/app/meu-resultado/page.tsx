export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fmtCurrency, fmtK, metaLevel, bonusAmount, STORE_COLORS } from '@/lib/utils'
import { KpiCard, StorePill, ProgressBar, SectionTitle, LogoutButton } from '@/components/ui'
import ClientsTabClient from './ClientsTabClient'
import ChangePassword from '@/components/ui/ChangePassword'
import type { Period } from '@/types'

export default async function MeuResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // ADM should never land here - redirect to dashboard
  if (profile?.role === 'adm') redirect('/dashboard')

  if (!profile?.vendor_id) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
          <p>Seu perfil ainda não está vinculado a um vendedor.</p>
          <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>Entre em contato com o administrador.</p>
        </div>
      </div>
    )
  }

  const { data: periods } = await supabase
    .from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })

  const sp = await searchParams
  const activePeriod = sp.period ? parseInt(sp.period) : (periods?.[0]?.id ?? 1)
  const activeTab    = sp.tab ?? 'performance'

  const { data: summary } = await supabase
    .from('vendor_summary').select('*').eq('period_id', activePeriod).eq('vendor_id', profile.vendor_id).single()

  const { data: evolution } = await supabase.rpc('vendor_evolution', { p_vendor_id: profile.vendor_id })

  // Fetch clients for carteira tab
  const { data: clientsData } = await supabase
    .from('client_portfolio')
    .select('*')
    .eq('period_id', activePeriod)
    .eq('vendor_id', profile.vendor_id)
    .order('total_spent', { ascending: false })
    .limit(1000)

  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  if (!summary) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Sem dados para este período.</p>
      </div>
    )
  }

  const sold = Number(summary.total_sold)
  const m1 = Number(summary.meta1), m2 = Number(summary.meta2), m3 = Number(summary.meta3)
  const lvl = metaLevel(sold, m1, m2, m3)
  const b   = bonusAmount(lvl, Number(summary.bonus1), Number(summary.bonus2), Number(summary.bonus3))
  const commission = sold * Number(summary.commission_pct) + b
  const col = STORE_COLORS[summary.store] || 'var(--accent)'
  const META_COL = ['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl]

  const pctBase  = lvl === 0 ? m1 : lvl === 1 ? m1 : lvl === 2 ? m2 : m3
  const pctLabel = Math.round(sold / pctBase * 100)
  const pctRef   = lvl === 0 ? `da 1ª meta (${fmtK(m1)})`
                 : lvl === 1 ? `da 1ª meta atingida (${fmtK(m1)})`
                 : lvl === 2 ? `da 2ª meta atingida (${fmtK(m2)})`
                 : `da 3ª meta atingida (${fmtK(m3)})`

  const remainMsg = sold < m1 ? `Faltam ${fmtCurrency(m1 - sold)} para a 1ª meta`
                  : sold < m2 ? `Faltam ${fmtCurrency(m2 - sold)} para a 2ª meta`
                  : sold < m3 ? `Faltam ${fmtCurrency(m3 - sold)} para a 3ª meta`
                  : 'Superou todas as metas! 🏆'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-block', background: 'var(--accent)', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
            <span style={{ color: '#0e0f11', fontWeight: 800, fontSize: '0.75rem' }}>DA SILVA</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Olá, <span style={{ color: col }}>{profile.name}</span>
          </h1>
          <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '2px' }}>
            {activePeriodLabel}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StorePill store={summary.store} />
          {/* Period selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(periods as Period[]).map(p => (
              <a key={p.id}
                href={`/meu-resultado?period=${p.id}&tab=${activeTab}`}
                style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace',
                  textDecoration: 'none', background: activePeriod === p.id ? 'var(--surface2)' : 'transparent',
                  border: '1px solid', borderColor: activePeriod === p.id ? 'var(--border)' : 'transparent',
                  color: activePeriod === p.id ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {p.label}
              </a>
            ))}
          </div>
          <ChangePassword />
          <LogoutButton />
        </div>
      </div>

      <div style={{ padding: '1.5rem 2.5rem 3rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'performance', label: 'Performance' },
            { key: 'carteira',    label: 'Minha Carteira' },
            { key: 'evolucao',    label: 'Minha Evolução' },
          ].map(tab => (
            <a key={tab.key}
              href={`/meu-resultado?period=${activePeriod}&tab=${tab.key}`}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '1.5rem' }}>
              <KpiCard label="Total Vendido"   value={fmtCurrency(sold)} color={col} />
              <KpiCard label="Clientes"        value={Number(summary.unique_clients).toLocaleString()} />
              <KpiCard label="Ticket Médio"    value={fmtCurrency(Number(summary.avg_ticket))} />
              <KpiCard label="Alcance Meta"    value={`${pctLabel}%`} sub={pctRef} color={META_COL} />
              <KpiCard label="Comissão Total"  value={fmtCurrency(commission)} sub={`0,3% × vendas + bônus $${b}`} color={META_COL} />
            </div>

            <div style={{ background: 'var(--surface)', border: `1px solid ${col}22`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: col }} />
              <SectionTitle>Progresso das Metas</SectionTitle>
              <ProgressBar sold={sold} meta1={m1} meta2={m2} meta3={m3} metaLevel={lvl} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: META_COL }}>{pctLabel}%</span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{pctRef}</span>
              </div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>{remainMsg}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                borderRadius: '10px', padding: '1.25rem', textAlign: 'center', border: '1px solid',
                background: ['rgba(107,111,122,0.1)','rgba(200,245,66,0.08)','rgba(66,217,245,0.08)','rgba(245,167,66,0.08)'][lvl],
                borderColor: ['rgba(107,111,122,0.3)','rgba(200,245,66,0.3)','rgba(66,217,245,0.3)','rgba(245,167,66,0.3)'][lvl],
              }}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: META_COL }}>Bônus</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: META_COL }}>{b > 0 ? `+$${b}` : '—'}</div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', marginTop: '5px', opacity: 0.75, color: META_COL }}>
                  {['Ainda não atingiu a 1ª meta','1ª meta atingida!','2ª meta atingida!','3ª meta atingida! 🏆'][lvl]}
                </div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Itens Vendidos</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{Number(summary.total_items).toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>{summary.total_orders} notas emitidas</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'carteira' && (
          <ClientsTabClient clients={(clientsData ?? []) as Parameters<typeof ClientsTabClient>[0]['clients']} color={col} />
        )}

        {activeTab === 'evolucao' && (
          <div>
            {(!evolution || evolution.length === 0) ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', padding: '3rem' }}>
                Ainda não há histórico de meses anteriores.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Período','Total Vendido','1ª Meta','3ª Meta','Meta Atingida','Bônus','Clientes'].map(h => (
                        <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', textAlign: h === 'Período' ? 'left' : 'right' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evolution.map((d: { year: number; month: number; period_label: string; total_sold: number; meta1: number; meta3: number; meta_level: number; bonus_earned: number; unique_clients: number }) => {
                      const eLvl = d.meta_level
                      const eCol = ['#6b6f7a','#c8f542','#42d9f5','#f5a742'][eLvl]
                      return (
                        <tr key={`${d.year}-${d.month}`} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600 }}>{d.period_label}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: eCol }}>{fmtCurrency(Number(d.total_sold))}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{fmtK(Number(d.meta1))}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{fmtK(Number(d.meta3))}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: eCol + '22', color: eCol }}>
                              {eLvl > 0 ? `${eLvl}ª meta` : '—'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: eCol }}>{Number(d.bonus_earned) > 0 ? `+$${Number(d.bonus_earned)}` : '—'}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{Number(d.unique_clients).toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
