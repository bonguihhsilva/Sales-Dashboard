export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { fmtCurrency, fmtK, metaLevel, bonusAmount } from '@/lib/utils'
import { KpiCard, StorePill, ProgressBar, BonusBadge, SectionTitle, LogoutButton } from '@/components/ui'
import type { VendorSummary, Period } from '@/types'
import UploadModal from './UploadModal'
import PeriodSelector from './PeriodSelector'
import ClientsTab from './ClientsTab'
import ClientsTabClient from './ClientsTabClient'
import EvolucaoTab from './EvolucaoTab'
import ExportButton from './ExportButton'
import Link from 'next/link'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; store?: string; tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // JWT role — mesma fonte do middleware (D-04)
  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (jwtRole === 'vendedor') redirect('/meu-resultado')

  const { data: profile } = await supabase
    .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()

  const adminDb = createAdminClient()

  // Auto-fix admin role in DB if missing (since they already bypassed the vendedor check)
  if (profile?.role !== 'adm' && profile?.role !== 'gerente' && profile?.role !== 'super_admin') {
    await adminDb.from('profiles').update({ role: 'adm' }).eq('id', user.id)
    await adminDb.auth.admin.updateUserById(user.id, { app_metadata: { role: 'adm' } })
    // We don't need to refresh the page, the DB is updated for the next clicks
  }

  // Auto-fix tenant_id if missing
  if (profile && !profile.tenant_id) {
    await adminDb.from('profiles').update({ tenant_id: user.id }).eq('id', user.id)
    profile.tenant_id = user.id
  }

  // Load periods
  const { data: periods } = await adminDb
    .from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })

  const params = await searchParams
  const activePeriod = params.period
    ? parseInt(params.period)
    : (periods?.[0]?.id ?? 1)
  const activeStore = params.store || 'all'
  const activeTab   = params.tab   || 'ranking'

  // Load vendor summaries for this period
  const { data: summaries } = await adminDb
    .from('vendor_summary')
    .select('*')
    .eq('period_id', activePeriod)
    .order('total_sold', { ascending: false })

  // Fetch daily evolution data for ALL periods (supports multi-period comparison)
  const allPeriodIds = (periods ?? []).map(p => p.id)
  const { data: evolutionData } = await adminDb
    .rpc('store_daily_evolution_multi', { p_period_ids: allPeriodIds })

  // Fetch vendor summaries for ALL periods (for multi-period vendor evolution view)
  const { data: allVendorSummaries } = await adminDb
    .from('vendor_summary')
    .select('vendor_id, vendor_name, store, period_id, total_sold, unique_clients, avg_ticket, total_orders')
    .in('period_id', allPeriodIds)

  // Fetch clients for interactive tab
  const { data: allClients } = await adminDb
    .from('client_portfolio')
    .select('*')
    .eq('period_id', activePeriod)
    .order('total_spent', { ascending: false })
    .limit(2000)

  // Remove the linkedVendorIds filter to show all vendors in ranking/evolution
  // Previously we filtered `summaries` by `linkedVendorIds`, now we use all of them.
  const filtered = activeStore === 'all'
    ? summaries ?? []
    : (summaries ?? []).filter(s => s.store === activeStore)

  const grandTotal   = filtered.reduce((s, v) => s + Number(v.total_sold), 0)
  const totalM1      = filtered.reduce((s, v) => s + Number(v.meta1), 0)
  const hitMeta      = filtered.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 1).length
  const totalBonus   = filtered.reduce((v, s) => v + Number(s.bonus_earned), 0)
  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  const { data: dbStores } = await adminDb
    .from('stores')
    .select('*')
    .eq('tenant_id', profile?.tenant_id)
    .order('name')

  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name, color: s.color }))

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>
      {/* Top App Bar (Google Style) */}
      <div style={{
        padding: '1rem 2rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', zIndex: 10, position: 'sticky', top: 0
      }}>
        <div className="flex items-center gap-4">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Visão Geral de Vendas
          </h1>
          <div style={{ padding: '4px 10px', background: 'var(--surface2)', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>
            {activePeriodLabel}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PeriodSelector periods={periods as Period[]} activePeriod={activePeriod} />
          <UploadModal periods={periods as Period[]} />
          <ExportButton activePeriod={activePeriod} />
        </div>
      </div>

      {/* Canais de Venda tabs */}
      <div style={{
        display: 'flex', gap: '4px', padding: '1rem 2rem 0',
        borderBottom: '1px solid var(--border)', overflowX: 'auto', background: 'var(--surface)'
      }}>
        {[{ key: 'all', label: 'Todos', color: 'var(--accent)' }, ...stores.map(s => ({ key: s.key, label: s.label, color: s.color }))].map(tab => (
          <Link key={tab.key}
            href={`/dashboard?period=${activePeriod}&store=${tab.key}&tab=${activeTab}`}
            style={{
              padding: '8px 20px', borderRadius: '8px 8px 0 0', fontSize: '0.85rem', fontWeight: 500,
              border: '1px solid transparent', borderBottom: 'none', textDecoration: 'none', transition: 'all 0.15s',
              background: activeStore === tab.key ? 'var(--bg)' : 'transparent',
              borderColor: activeStore === tab.key ? 'var(--border)' : 'transparent',
              color: activeStore === tab.key ? 'var(--text)' : 'var(--muted-foreground)',
              marginBottom: '-1px', zIndex: activeStore === tab.key ? 1 : 0
            }}
          >
            {tab.label}
          </Link>
        ))}
        <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px', height: '24px', alignSelf: 'center' }} />
        <Link
          href={`/dashboard?period=${activePeriod}&store=${activeStore}&tab=ranking`}
          style={{
            padding: '8px 20px', borderRadius: '8px 8px 0 0', fontSize: '0.85rem', fontWeight: 500,
            border: '1px solid transparent', borderBottom: 'none', textDecoration: 'none', transition: 'all 0.15s',
            background: activeTab === 'ranking' ? 'var(--bg)' : 'transparent',
            borderColor: activeTab === 'ranking' ? 'var(--border)' : 'transparent',
            color: activeTab === 'ranking' ? 'var(--text)' : 'var(--muted-foreground)',
            marginBottom: '-1px', zIndex: activeTab === 'ranking' ? 1 : 0
          }}
        >
          Ranking
        </Link>
        <Link
          href={`/dashboard?period=${activePeriod}&store=${activeStore}&tab=evolucao`}
          style={{
            padding: '8px 20px', borderRadius: '8px 8px 0 0', fontSize: '0.85rem', fontWeight: 500,
            border: '1px solid transparent', borderBottom: 'none', textDecoration: 'none', transition: 'all 0.15s',
            background: activeTab === 'evolucao' ? 'var(--bg)' : 'transparent',
            borderColor: activeTab === 'evolucao' ? 'var(--border)' : 'transparent',
            color: activeTab === 'evolucao' ? 'var(--text)' : 'var(--muted-foreground)',
            marginBottom: '-1px', zIndex: activeTab === 'evolucao' ? 1 : 0
          }}
        >
          Evolução
        </Link>
        <Link
          href={`/dashboard?period=${activePeriod}&store=${activeStore}&tab=clientes`}
          style={{
            padding: '8px 20px', borderRadius: '8px 8px 0 0', fontSize: '0.85rem', fontWeight: 500,
            border: '1px solid transparent', borderBottom: 'none', textDecoration: 'none', transition: 'all 0.15s',
            background: activeTab === 'clientes' ? 'var(--bg)' : 'transparent',
            borderColor: activeTab === 'clientes' ? 'var(--border)' : 'transparent',
            color: activeTab === 'clientes' ? 'var(--text)' : 'var(--muted-foreground)',
            marginBottom: '-1px', zIndex: activeTab === 'clientes' ? 1 : 0
          }}
        >
          Clientes
        </Link>
      </div>

      <div style={{ padding: '1.5rem 2.5rem 3rem' }}>
        {activeTab === 'evolucao' ? (
          <EvolucaoTab
            data={(evolutionData ?? []) as Parameters<typeof EvolucaoTab>[0]['data']}
            periods={(periods ?? []) as Parameters<typeof EvolucaoTab>[0]['periods']}
            vendorSummaries={(allVendorSummaries ?? []) as Parameters<typeof EvolucaoTab>[0]['vendorSummaries']}
            stores={stores}
          />
        ) : activeTab === 'clientes' ? (
          <ClientsTabClient clients={(allClients ?? []) as Parameters<typeof ClientsTabClient>[0]['clients']} />
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '1.5rem' }}>
              <KpiCard label="Total Vendido" value={fmtCurrency(grandTotal)} sub={totalM1 > 0 ? `${((grandTotal / totalM1) * 100).toFixed(1)}% da 1ª meta` : 'metas não configuradas'} color="var(--accent)" />
              <KpiCard label="Vendedores" value={String(filtered.length)} sub={`${hitMeta} na meta`} />
              <KpiCard label="Na Meta" value={`${hitMeta} / ${filtered.length}`} sub={`${filtered.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 2).length} na 2ª+`} color="var(--meta1)" />
              <KpiCard label="Bônus Total" value={`$${totalBonus.toLocaleString()}`} color="var(--mkt)" />
              {activeStore === 'all' && stores.map(s => {
                const sv = (summaries ?? []).filter(v => v.store === s.key)
                const st = sv.reduce((a, v) => a + Number(v.total_sold), 0)
                return <KpiCard key={s.key} label={s.label} value={fmtCurrency(st)} sub={grandTotal > 0 ? `${(st / grandTotal * 100).toFixed(1)}% do total` : '—'} color={s.color} />
              })}
            </div>

            {/* Store summary cards */}
            {activeStore === 'all' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                {stores.map(s => {
                  const sv = (summaries ?? []).filter(v => v.store === s.key)
                  const st = sv.reduce((a, v) => a + Number(v.total_sold), 0)
                  const hit = sv.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 1).length
                  return (
                    <div key={s.key} style={{ background: 'var(--surface)', border: `1px solid ${s.color}33`, borderRadius: '10px', padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: s.color, marginBottom: '6px' }}>{s.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{fmtCurrency(st)}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', marginTop: '3px' }}>
                        {sv.length} vendedores · {hit} na meta · {grandTotal > 0 ? (st / grandTotal * 100).toFixed(1) : '0'}% do total
                      </div>
                      <div style={{ height: '3px', borderRadius: '2px', marginTop: '10px', background: s.color, width: `${grandTotal > 0 ? (st / grandTotal * 100).toFixed(1) : 0}%` }} />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {[
                { color: 'var(--meta1)', label: '1ª Meta (+$100)' },
                { color: 'var(--meta2)', label: '2ª Meta (+$150)' },
                { color: 'var(--meta3)', label: '3ª Meta (+$200)' },
                { color: 'var(--muted)', label: 'Abaixo da 1ª meta' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>

            <SectionTitle>Ranking de Vendedores</SectionTitle>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '3%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '7%' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {([
                      { h:'#',         align:'left'  },
                      { h:'Vendedor',  align:'left'  },
                      { h:'Canal de Venda', align:'left' },
                      { h:'Clientes',  align:'right' },
                      { h:'Total',     align:'right' },
                      { h:'1ª Meta',   align:'right', color:'var(--meta1)' },
                      { h:'2ª Meta',   align:'right', color:'var(--meta2)' },
                      { h:'3ª Meta',   align:'right', color:'var(--meta3)' },
                      { h:'Progresso', align:'left'  },
                      { h:'Bônus',     align:'right' },
                    ] as {h:string;align:string;color?:string}[]).map(col => (
                      <th key={col.h} style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                        color: col.color ?? 'var(--muted)',
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                        padding: '6px 10px', textAlign: col.align as 'left'|'right',
                        whiteSpace: 'nowrap',
                      }}>{col.h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => {
                    const sold = Number(v.total_sold)
                    const m1 = Number(v.meta1), m2 = Number(v.meta2), m3 = Number(v.meta3)
                    const lvl = metaLevel(sold, m1, m2, m3)
                    const b   = bonusAmount(lvl, Number(v.bonus1), Number(v.bonus2), Number(v.bonus3))
                    const rankColors = ['#f5c842', '#a8abb2', '#cd7f32']
                    const td = { padding: '9px 10px' }
                    return (
                      <tr key={v.vendor_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ ...td, fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: i < 3 ? rankColors[i] : 'var(--muted)' }}>{i + 1}</td>
                        <td style={{ ...td, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <a href={`/dashboard/vendedor/${v.vendor_id}?period=${activePeriod}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {v.vendor_name}
                          </a>
                        </td>
                        <td style={td}>
                          <StorePill 
                            store={v.store} 
                            label={stores.find(s => s.key === v.store)?.label} 
                            color={stores.find(s => s.key === v.store)?.color} 
                          />
                        </td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.76rem' }}>{Number(v.unique_clients).toLocaleString()}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{fmtCurrency(sold)}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.76rem', color: lvl >= 1 ? 'var(--meta1)' : 'var(--muted)' }}>{fmtK(m1)}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.76rem', color: lvl >= 2 ? 'var(--meta2)' : 'var(--muted)' }}>{fmtK(m2)}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.76rem', color: lvl >= 3 ? 'var(--meta3)' : 'var(--muted)' }}>{fmtK(m3)}</td>
                        <td style={td}>
                          <ProgressBar sold={sold} meta1={m1} meta2={m2} meta3={m3} metaLevel={lvl} />
                        </td>
                        <td style={{ ...td, textAlign: 'right' }}><BonusBadge level={lvl} amount={b} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
