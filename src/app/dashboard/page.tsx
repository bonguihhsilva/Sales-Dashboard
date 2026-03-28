export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fmtCurrency, fmtK, metaLevel, bonusAmount, STORE_COLORS, STORE_LABELS } from '@/lib/utils'
import { KpiCard, StorePill, ProgressBar, BonusBadge, SectionTitle, LogoutButton } from '@/components/ui'
import type { VendorSummary, Period } from '@/types'
import UploadModal from './UploadModal'
import PeriodSelector from './PeriodSelector'
import ClientsTab from './ClientsTab'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; store?: string; tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, name').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  // Load periods
  const { data: periods } = await supabase
    .from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })

  const params = await searchParams
  const activePeriod = params.period
    ? parseInt(params.period)
    : (periods?.[0]?.id ?? 1)
  const activeStore = params.store || 'all'
  const activeTab   = params.tab   || 'ranking'

  // Load vendor summaries for this period
  const { data: summaries } = await supabase
    .from('vendor_summary')
    .select('*')
    .eq('period_id', activePeriod)
    .order('total_sold', { ascending: false })

  const filtered = activeStore === 'all'
    ? (summaries ?? [])
    : (summaries ?? []).filter(s => s.store === activeStore)

  const grandTotal   = filtered.reduce((s, v) => s + Number(v.total_sold), 0)
  const totalM1      = filtered.reduce((s, v) => s + Number(v.meta1), 0)
  const hitMeta      = filtered.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 1).length
  const totalBonus   = filtered.reduce((v, s) => v + Number(s.bonus_earned), 0)
  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  const stores = [
    { key: 'Jebai',       label: 'Jebai',   color: STORE_COLORS.Jebai },
    { key: 'Paje-MKT',    label: 'Pajé 1',  color: STORE_COLORS['Paje-MKT'] },
    { key: 'Paje-Caixa',  label: 'Pajé 2',  color: STORE_COLORS['Paje-Caixa'] },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Sales Dashboard <span style={{ color: 'var(--accent)' }}>// {activePeriodLabel}</span>
          </h1>
          <p style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '3px' }}>
            DA SILVA · ADM · {profile?.name}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PeriodSelector periods={periods as Period[]} activePeriod={activePeriod} />
          <UploadModal periods={periods as Period[]} />
          <a href="/dashboard/usuarios" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', padding: '6px 12px', textDecoration: 'none' }}>
            Usuários
          </a>
          <LogoutButton />
        </div>
      </div>

      {/* Store tabs */}
      <div style={{
        display: 'flex', gap: '4px', padding: '1rem 2.5rem 0',
        borderBottom: '1px solid var(--border)', overflowX: 'auto',
      }}>
        {[{ key: 'all', label: 'Todos', color: 'var(--accent)' }, ...stores.map(s => ({ key: s.key, label: s.label, color: s.color }))].map(tab => (
          <a key={tab.key}
            href={`/dashboard?period=${activePeriod}&store=${tab.key}&tab=${activeTab}`}
            style={{
              padding: '8px 20px', borderRadius: '6px 6px 0 0', fontSize: '0.8rem', fontWeight: 600,
              border: '1px solid transparent', borderBottom: 'none', textDecoration: 'none', transition: 'all 0.15s',
              background: activeStore === tab.key ? 'var(--surface)' : 'transparent',
              borderColor: activeStore === tab.key ? 'var(--border)' : 'transparent',
              color: activeStore === tab.key ? tab.color : 'var(--muted)',
            }}
          >
            {tab.label}
          </a>
        ))}
        <a
          href={`/dashboard?period=${activePeriod}&store=${activeStore}&tab=clientes`}
          style={{
            padding: '8px 20px', borderRadius: '6px 6px 0 0', fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid transparent', borderBottom: 'none', textDecoration: 'none', transition: 'all 0.15s',
            background: activeTab === 'clientes' ? 'var(--surface)' : 'transparent',
            borderColor: activeTab === 'clientes' ? 'var(--border)' : 'transparent',
            color: activeTab === 'clientes' ? 'var(--text)' : 'var(--muted)',
            marginLeft: '8px',
          }}
        >
          Clientes
        </a>
      </div>

      <div style={{ padding: '1.5rem 2.5rem 3rem' }}>
        {activeTab === 'clientes' ? (
          <ClientsTab periodId={activePeriod} vendorId={null} />
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '1.5rem' }}>
              <KpiCard label="Total Vendido" value={fmtCurrency(grandTotal)} sub={`${((grandTotal / totalM1) * 100).toFixed(1)}% da 1ª meta`} color="var(--accent)" />
              <KpiCard label="Vendedores" value={String(filtered.length)} sub={`${hitMeta} na meta`} />
              <KpiCard label="Na Meta" value={`${hitMeta} / ${filtered.length}`} sub={`${filtered.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 2).length} na 2ª+`} color="var(--meta1)" />
              <KpiCard label="Bônus Total" value={`$${totalBonus.toLocaleString()}`} color="var(--mkt)" />
              {activeStore === 'all' && stores.map(s => {
                const sv = (summaries ?? []).filter(v => v.store === s.key)
                const st = sv.reduce((a, v) => a + Number(v.total_sold), 0)
                return <KpiCard key={s.key} label={s.label} value={fmtCurrency(st)} sub={`${(st / grandTotal * 100).toFixed(1)}% do total`} color={s.color} />
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
                        {sv.length} vendedores · {hit} na meta · {(st / grandTotal * 100).toFixed(1)}% do total
                      </div>
                      <div style={{ height: '3px', borderRadius: '2px', marginTop: '10px', background: s.color, width: `${(st / grandTotal * 100).toFixed(1)}%` }} />
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'32px' }}>#</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px' }}>Vendedor</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'76px' }}>Loja</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'68px', textAlign:'right' }}>Clientes</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'100px', textAlign:'right' }}>Total</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--meta1)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'72px', textAlign:'right' }}>1ª Meta</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--meta2)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'72px', textAlign:'right' }}>2ª Meta</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--meta3)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'72px', textAlign:'right' }}>3ª Meta</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'200px' }}>Progresso</th>
                    <th style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', width:'58px', textAlign:'right' }}>Bônus</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => {
                    const sold = Number(v.total_sold)
                    const m1 = Number(v.meta1), m2 = Number(v.meta2), m3 = Number(v.meta3)
                    const lvl = metaLevel(sold, m1, m2, m3)
                    const b   = bonusAmount(lvl, Number(v.bonus1), Number(v.bonus2), Number(v.bonus3))
                    const rankColors = ['#f5c842', '#a8abb2', '#cd7f32']
                    return (
                      <tr key={v.vendor_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 8px', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: i < 3 ? rankColors[i] : 'var(--muted)' }}>{i + 1}</td>
                        <td style={{ padding: '8px 8px', fontWeight: 600 }}>
                          <a href={`/dashboard/vendedor/${v.vendor_id}?period=${activePeriod}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {v.vendor_name}
                          </a>
                        </td>
                        <td style={{ padding: '8px 8px' }}><StorePill store={v.store} /></td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{Number(v.unique_clients).toLocaleString()}</td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{fmtCurrency(sold)}</td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: lvl >= 1 ? 'var(--meta1)' : 'var(--muted)' }}>{fmtK(m1)}</td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: lvl >= 2 ? 'var(--meta2)' : 'var(--muted)' }}>{fmtK(m2)}</td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: lvl >= 3 ? 'var(--meta3)' : 'var(--muted)' }}>{fmtK(m3)}</td>
                        <td style={{ padding: '8px 8px' }}>
                          <ProgressBar sold={sold} meta1={m1} meta2={m2} meta3={m3} metaLevel={lvl} />
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'right' }}><BonusBadge level={lvl} amount={b} /></td>
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
