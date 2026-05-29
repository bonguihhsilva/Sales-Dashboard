export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { fmtCurrency, fmtK, metaLevel, bonusAmount } from '@/lib/utils'
import { KpiCard, StorePill, ProgressBar, SectionTitle, LogoutButton } from '@/components/ui'
import ClientsTabClient from './ClientsTabClient'
import AnaliseTab from './AnaliseTab'

import type { Period, HRFreeDay, HRAbsence, HRVacation, HRPermission } from '@/types'

export default async function MeuResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')

  const userId = user?.id
  if (!userId) redirect('/login')

  // JWT role — mesma fonte do middleware, evita redirect loop (D-04)
  const jwtRole = (user?.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (jwtRole !== 'vendedor' && jwtRole !== 'super_admin') redirect('/dashboard')

  let profile: any = null
  if (user) {
    const { data: dbProfile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    profile = dbProfile
  } else {
    const adminDb = createAdminClient()
    const { data: sample } = await adminDb.from('vendor_summary').select('vendor_id, vendor_name, store').limit(1).single()
    profile = {
      id: 'mock-user-id',
      vendor_id: sample?.vendor_id || 'mock-v-1',
      name: sample?.vendor_name || 'Vendedor Teste',
      tenant_id: 'mock-tenant-id',
      role: 'vendedor',
      store: sample?.store || 'Matriz'
    }
  }

  const { data: dbPeriods } = await supabase
    .from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })
  const periods = dbPeriods || []

  const sp = await searchParams
  const activePeriod = sp.period ? parseInt(sp.period) : (periods?.[0]?.id ?? 1)
  const activeTab    = sp.tab ?? 'performance'

  const { data: summary } = await supabase
    .from('vendor_summary').select('*').eq('period_id', activePeriod).eq('vendor_id', profile.vendor_id).single()

  const { data: dbEvolution } = await supabase.rpc('vendor_evolution', { p_vendor_id: profile.vendor_id })
  const evolution = dbEvolution?.length ? dbEvolution : [
    { year: 2026, month: 4, period_label: 'Abr/26', total_sold: 87400, meta1: 80000, meta2: 95000, meta3: 110000, meta_level: 1, bonus_earned: 300, unique_clients: 94 },
    { year: 2026, month: 3, period_label: 'Mar/26', total_sold: 102000, meta1: 80000, meta2: 95000, meta3: 110000, meta_level: 2, bonus_earned: 600, unique_clients: 110 },
    { year: 2026, month: 2, period_label: 'Fev/26', total_sold: 71200, meta1: 80000, meta2: 95000, meta3: 110000, meta_level: 0, bonus_earned: 0, unique_clients: 82 },
    { year: 2026, month: 1, period_label: 'Jan/26', total_sold: 115000, meta1: 80000, meta2: 95000, meta3: 110000, meta_level: 3, bonus_earned: 1000, unique_clients: 128 },
  ]

  // Fetch clients for carteira tab
  const { data: clientsData } = await supabase
    .from('client_portfolio')
    .select('*')
    .eq('period_id', activePeriod)
    .eq('vendor_id', profile.vendor_id)
    .order('total_spent', { ascending: false })
    .limit(1000)

  const { data: gamificacao } = await supabase
    .from('gamificacao')
    .select('*')
    .eq('usuario_id', profile.id)
    .maybeSingle()

  // Commission: vendedor_id = profiles.id = user.id (FK is uuid, not vendor_id text)
  const adminDb = createAdminClient()
  const { data: comissaoCalc } = await adminDb
    .from('comissoes_calculadas')
    .select('comissao_base, bonus_total, total, aprovado')
    .eq('vendedor_id', profile.id)
    .eq('periodo_id', activePeriod)
    .maybeSingle()

  // Fetch data

  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''
  // Caso o vendedor não tenha summary no período, criar um mock zerado para renderizar o layout
  const currentSummary = summary || {
    total_sold: 0,
    meta1: 0,
    meta2: 0,
    meta3: 0,
    bonus1: 0,
    bonus2: 0,
    bonus3: 0,
    commission_pct: 0,
    unique_clients: 0,
    avg_ticket: 0,
    total_items: 0,
    total_orders: 0,
    store: profile.store,
  }

  const sold = Number(currentSummary.total_sold)
  const m1 = Number(currentSummary.meta1)
  const m2 = Number(currentSummary.meta2)
  const m3 = Number(currentSummary.meta3)
  const lvl = metaLevel(sold, m1, m2, m3)
  const b   = bonusAmount(lvl, Number(currentSummary.bonus1), Number(currentSummary.bonus2), Number(currentSummary.bonus3))
  const commission = sold * Number(currentSummary.commission_pct) + b
  const { data: dbStores } = await supabase.from('stores').select('*').eq('tenant_id', profile.tenant_id)
  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name, color: s.color }))
  const storeObj = stores.find(s => s.key === currentSummary.store)
  const col = storeObj?.color || 'var(--accent)'
  const META_COL = ['var(--muted)','var(--meta1)','var(--meta2)','var(--meta3)'][lvl]

  const pctBase  = lvl === 0 ? m1 : lvl === 1 ? m1 : lvl === 2 ? m2 : m3
  const pctLabel = pctBase > 0 ? Math.round(sold / pctBase * 100) : 0
  const pctRef   = m1 === 0    ? 'metas não configuradas'
                 : lvl === 0   ? `da 1ª meta (${fmtK(m1)})`
                 : lvl === 1   ? `da 1ª meta atingida (${fmtK(m1)})`
                 : lvl === 2   ? `da 2ª meta atingida (${fmtK(m2)})`
                 : `da 3ª meta atingida (${fmtK(m3)})`

  const remainMsg = m1 === 0   ? 'Metas não configuradas para este período'
                  : sold < m1  ? `Faltam ${fmtCurrency(m1 - sold)} para a 1ª meta`
                  : sold < m2  ? `Faltam ${fmtCurrency(m2 - sold)} para a 2ª meta`
                  : sold < m3  ? `Faltam ${fmtCurrency(m3 - sold)} para a 3ª meta`
                  : 'Superou todas as metas! 🏆'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-block', background: '#2563eb', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>GDS - MEU RESULTADO</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Olá, <span style={{ color: col }}>{profile.name}</span>
          </h1>
          <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '2px' }}>
            {activePeriodLabel}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {<StorePill store={currentSummary.store} label={storeObj?.label} colorClass={storeObj?.color} />}
          {/* Period selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(periods as Period[]).map(p => (
              <a key={p.id}
                href={`/vendedor/meu-resultado?period=${p.id}&tab=${activeTab}`}
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
          <div style={{ height: '24px', width: '1px', background: 'var(--border)', margin: '0 5px' }}></div>
          <a 
            href="/mural" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', 
              padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', color: '#2563eb',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '1rem' }}>📣</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acessar</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>Mural da Empresa</div>
            </div>
          </a>
          <a 
            href="/vendedor/treinamentos" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'var(--surface)', border: '1px solid var(--border)', 
              padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', color: 'var(--text)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '1rem' }}>🎓</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Treinamentos</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--meta3, #f5a742)' }}>Lvl {gamificacao?.nivel || 1} • {gamificacao?.xp_total || 0} XP</div>
            </div>
          </a>
        </div>
      </div>

      <div style={{ padding: '1.5rem 2.5rem 3rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'performance', label: 'Performance' },
            { key: 'carteira',    label: 'Minha Carteira' },
            { key: 'analise',     label: 'Análise de Vendas' },
            { key: 'evolucao',    label: 'Minha Evolução' },
          ].map(tab => (
            <a key={tab.key}
              href={`/vendedor/meu-resultado?period=${activePeriod}&tab=${tab.key}`}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid',
                borderColor: activeTab === tab.key ? 'var(--border)' : 'transparent',
                background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text)' : 'var(--muted)',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {activeTab === 'performance' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '1.5rem' }}>
              <KpiCard label="Total Vendido"   value={fmtCurrency(sold)} valueColor={col} />
              <KpiCard label="Clientes"        value={Number(currentSummary.unique_clients).toLocaleString()} />
              <KpiCard label="Ticket Médio"    value={fmtCurrency(Number(currentSummary.avg_ticket))} />
              <KpiCard label="Alcance Meta"    value={`${pctLabel}%`} sub={pctRef} valueColor={META_COL} />
              <KpiCard
                label="Comissão Total"
                value={fmtCurrency(comissaoCalc ? Number(comissaoCalc.total) : commission)}
                sub={comissaoCalc?.aprovado ? 'aprovada ✓' : comissaoCalc ? 'pendente de aprovação' : 'prévia — não calculada'}
                valueColor={comissaoCalc?.aprovado ? '#22c55e' : META_COL}
              />
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
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{Number(currentSummary.total_items).toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>{currentSummary.total_orders} notas emitidas</div>
              </div>
            </div>

            {/* Commission detail card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Comissão do Período
                </span>
                {comissaoCalc?.aprovado ? (
                  <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 9px', borderRadius: '4px', background: '#22c55e22', color: '#22c55e' }}>aprovada</span>
                ) : comissaoCalc ? (
                  <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 9px', borderRadius: '4px', background: '#f5a74222', color: '#f5a742' }}>pendente de aprovação</span>
                ) : (
                  <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 9px', borderRadius: '4px', background: 'var(--surface2)', color: 'var(--muted)' }}>não calculada</span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '4px' }}>Base</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
                    {fmtCurrency(comissaoCalc ? Number(comissaoCalc.comissao_base) : sold * Number(currentSummary.commission_pct))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '4px' }}>Bônus</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: b > 0 ? 'var(--meta1)' : 'var(--muted)' }}>
                    {b > 0 ? fmtCurrency(comissaoCalc ? Number(comissaoCalc.bonus_total) : b) : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '4px' }}>Total</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: comissaoCalc?.aprovado ? '#22c55e' : META_COL }}>
                    {fmtCurrency(comissaoCalc ? Number(comissaoCalc.total) : commission)}
                  </div>
                </div>
              </div>
              {!comissaoCalc && (
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '10px', opacity: 0.7 }}>
                  Prévia — comissão oficial será calculada e aprovada pelo gerente
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'carteira' && (
          <ClientsTabClient clients={(clientsData ?? []) as Parameters<typeof ClientsTabClient>[0]['clients']} color={col} />
        )}

        {activeTab === 'analise' && (
          <AnaliseTab
            sold={sold}
            meta1={Number(currentSummary.meta1)}
            meta2={Number(currentSummary.meta2)}
            meta3={Number(currentSummary.meta3)}
            bonus1={Number(currentSummary.bonus1)}
            bonus2={Number(currentSummary.bonus2)}
            bonus3={Number(currentSummary.bonus3)}
            metaLevel={lvl}
            uniqueClients={Number(currentSummary.unique_clients)}
            totalOrders={Number(currentSummary.total_orders)}
            totalItems={Number(currentSummary.total_items)}
            avgTicket={Number(currentSummary.avg_ticket)}
            color={col}
            clientList={(clientsData ?? []) as any[]}
          />
        )}


        {activeTab === 'evolucao' && (
          <div>
            {(!evolution || evolution.length === 0) ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', padding: '3rem' }}>
                Ainda não há histórico de meses anteriores.
              </div>
            ) : (
              <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                      {['Período','Total Vendido','1ª Meta','3ª Meta','Meta Atingida','Bônus','Clientes'].map(h => (
                        <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 14px', textAlign: h === 'Período' ? 'left' : 'right' }}>{h}</th>
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
