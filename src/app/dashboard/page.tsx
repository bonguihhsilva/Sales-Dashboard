export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { fmtCurrency, fmtK, metaLevel, bonusAmount } from '@/lib/utils'
import { KpiCard, StorePill, ProgressBar, BonusBadge, SectionTitle, LogoutButton, PageHeader } from '@/components/ui'
import type { VendorSummary, Period } from '@/types'
import UploadModal from './UploadModal'
import PeriodSelector from './PeriodSelector'
import StoreSelector from './StoreSelector'
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
  const { user, profile } = await getTenantContext()
  const adminDb = createAdminClient()

  if (profile.role === 'vendedor') redirect('/vendedor/meu-resultado')

  if (profile.role === 'super_admin' && !profile.tenant_id) {
    redirect('/dashboard/super-admin')
  }

  const { data: periods } = await adminDb
    .from('periods')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const params = await searchParams
  const activePeriod = params.period
    ? parseInt(params.period)
    : (periods?.[0]?.id ?? 1)
  const activeStore = params.store || 'all'
  const activeTab   = params.tab   || 'performance'

  const { data: summaries } = await adminDb
    .from('vendor_summary')
    .select('*')
    .eq('period_id', activePeriod)
    .eq('tenant_id', profile.tenant_id)
    .order('total_sold', { ascending: false })

  const allPeriodIds = (periods ?? []).map(p => p.id)
  const { data: evolutionData } = await adminDb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .rpc('store_daily_evolution_multi', { p_period_ids: allPeriodIds, p_tenant_id: profile.tenant_id } as any)

  const { data: allVendorSummaries } = await adminDb
    .from('vendor_summary')
    .select('vendor_id, vendor_name, store, period_id, total_sold, unique_clients, avg_ticket, total_orders')
    .in('period_id', allPeriodIds)
    .eq('tenant_id', profile.tenant_id)

  const { data: allClients } = await adminDb
    .from('client_portfolio')
    .select('*')
    .eq('period_id', activePeriod)
    .eq('tenant_id', profile.tenant_id)
    .order('total_spent', { ascending: false })
    .limit(2000)

  const filtered = activeStore === 'all'
    ? summaries ?? []
    : (summaries ?? []).filter(s => s.store === activeStore)

  const grandTotal   = filtered.reduce((s, v) => s + Number(v.total_sold), 0)
  const totalM1      = filtered.reduce((s, v) => s + Number(v.meta1), 0)
  const hitMeta      = filtered.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 1).length
  const totalBonus   = filtered.reduce((v, s) => v + Number(s.bonus_earned), 0)
  const activePeriodLabel = (periods as Period[])?.find(p => p.id === activePeriod)?.label ?? ''

  let storesQuery = adminDb.from('stores').select('*')
  if (profile?.tenant_id) {
    storesQuery = storesQuery.eq('tenant_id', profile.tenant_id)
  }
  const { data: dbStores } = await storesQuery.order('name')

  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name, color: s.color }))

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10">
        <PageHeader
          title="Visão Geral de Vendas"
          subtitle="Acompanhe a performance do seu time de vendas e evolução de metas do período."
          actions={
            <>
              <div className="bg-surface-container-high px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                <div>
                  <div className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Período Ativo</div>
                  <div className="font-title-md text-title-md text-secondary">{activePeriodLabel}</div>
                </div>
              </div>
              <StoreSelector stores={stores} activeStore={activeStore} />
              <PeriodSelector periods={(periods || []) as Period[]} activePeriod={activePeriod} />
            </>
          }
        />
      </div>

      {/* Canal filter */}
      <div className="flex items-center gap-3 mb-2 overflow-x-auto no-scrollbar">
        <div className="text-[0.6875rem] font-mono text-on-surface-variant uppercase tracking-widest shrink-0">Canal</div>
        <div className="flex gap-2 shrink-0">
          {[{ key: 'all', label: 'Todos' }, ...stores].map(tab => (
            <Link key={tab.key}
              href={`/dashboard?period=${activePeriod}&store=${tab.key}&tab=${activeTab}`}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeStore === tab.key
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/5'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Visão tabs */}
      <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
        <div className="text-[0.6875rem] font-mono text-on-surface-variant uppercase tracking-widest shrink-0">Visão</div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/mural"
            className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/5"
          >
            <span className="material-symbols-outlined text-sm">campaign</span>
            Mural Geral
          </Link>
          <Link
            href={`/dashboard?period=${activePeriod}&store=${activeStore}&tab=ranking`}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'ranking'
                ? 'bg-tertiary-container text-on-tertiary-container'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-sm">leaderboard</span>
            Ranking
          </Link>
          <Link
            href={`/dashboard?period=${activePeriod}&store=${activeStore}&tab=evolucao`}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'evolucao'
                ? 'bg-tertiary-container text-on-tertiary-container'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-sm">trending_up</span>
            Evolução
          </Link>
          <Link
            href={`/dashboard?period=${activePeriod}&store=${activeStore}&tab=clientes`}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'clientes'
                ? 'bg-tertiary-container text-on-tertiary-container'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            Clientes
          </Link>
        </div>
      </div>

      <div className="flex-1">
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <KpiCard className="lg:col-span-2 featured-gradient border-primary/20" label="Total Vendido" value={fmtCurrency(grandTotal)} sub={totalM1 > 0 ? `${((grandTotal / totalM1) * 100).toFixed(1)}% da 1ª meta` : 'metas não configuradas'} valueClassName="text-secondary lg:text-[2.75rem] lg:leading-[1.1]" />
              <KpiCard label="Vendedores" value={String(filtered.length)} sub={`${hitMeta} na meta`} />
              <KpiCard label="Na Meta" value={`${hitMeta} / ${filtered.length}`} sub={`${filtered.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 2).length} na 2ª+`} valueClassName="text-meta1" />
              <KpiCard label="Bônus Total" value={`$${totalBonus.toLocaleString()}`} valueClassName="text-mkt" />
            </div>

            {/* Store summary cards */}
            {activeStore === 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {stores.map(s => {
                  const sv = (summaries ?? []).filter(v => v.store === s.key)
                  const st = sv.reduce((a, v) => a + Number(v.total_sold), 0)
                  const hit = sv.filter(v => metaLevel(Number(v.total_sold), Number(v.meta1), Number(v.meta2), Number(v.meta3)) >= 1).length
                  return (
                    <div key={s.key} className="glass-card rounded-xl p-card-padding flex flex-col group hover:border-primary/40 transition-colors">
                      <div className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-widest mb-1.5">{s.label}</div>
                      <div className="font-headline-lg text-2xl font-bold text-on-surface">{fmtCurrency(st)}</div>
                      <div className="text-xs text-on-surface-variant font-mono mt-1.5 mb-4">
                        {sv.length} vendedores · {hit} na meta · {grandTotal > 0 ? (st / grandTotal * 100).toFixed(1) : '0'}% do total
                      </div>
                      <div className="h-1.5 rounded-full mt-auto bg-surface-container-highest overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${grandTotal > 0 ? (st / grandTotal * 100).toFixed(1) : 0}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-6 mb-3">
              {[
                { colorClass: 'bg-meta1', label: '1ª Meta (+$100)' },
                { colorClass: 'bg-meta2', label: '2ª Meta (+$150)' },
                { colorClass: 'bg-meta3', label: '3ª Meta (+$200)' },
                { colorClass: 'bg-muted', label: 'Abaixo da 1ª meta' },
              ].map(({ colorClass, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <div className={`w-2.5 h-2.5 rounded-[2px] ${colorClass} shrink-0`} />
                  {label}
                </div>
              ))}
            </div>

            <SectionTitle>Ranking de Vendedores</SectionTitle>

            <div className="glass-card rounded-xl overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse" aria-label="Ranking de vendedores">
                <thead className="bg-surface-container-high/50 border-b border-white/5">
                  <tr>
                    {([
                      { h:'#',         align:'left',  sticky: true },
                      { h:'Vendedor',  align:'left'  },
                      { h:'Canal',     align:'left'  },
                      { h:'Clientes',  align:'right' },
                      { h:'Total',     align:'right' },
                      { h:'1ª Meta',   align:'right', color:'text-meta1' },
                      { h:'2ª Meta',   align:'right', color:'text-meta2' },
                      { h:'3ª Meta',   align:'right', color:'text-meta3' },
                      { h:'Progresso', align:'left'  },
                      { h:'Bônus',     align:'right' },
                    ] as {h:string;align:string;color?:string;sticky?:boolean}[]).map(col => (
                      <th key={col.h} scope="col" className={`font-mono text-[0.6875rem] uppercase tracking-wider py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap ${col.color || ''} ${col.sticky ? 'sticky left-0 z-20 bg-surface-container-high' : ''}`} style={{ textAlign: col.align as 'left'|'right' }}>
                        {col.h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((v, i) => {
                    const sold = Number(v.total_sold)
                    const m1 = Number(v.meta1), m2 = Number(v.meta2), m3 = Number(v.meta3)
                    const lvl = metaLevel(sold, m1, m2, m3)
                    const b   = bonusAmount(lvl, Number(v.bonus1), Number(v.bonus2), Number(v.bonus3))
                    const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600']

                    return (
                      <tr key={v.vendor_id} className="hover:bg-secondary/20 transition-colors">
                        <td className={`sticky left-0 z-10 bg-surface-container py-3 px-4 font-mono text-xs ${i < 3 ? rankColors[i] : 'text-muted-foreground'}`}>{i + 1}</td>
                        <td className="py-3 px-4 font-semibold whitespace-nowrap">
                          <Link href={`/dashboard/vendedor/${v.vendor_id}?period=${activePeriod}`} className="hover:text-primary transition-colors">
                            {v.vendor_name}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <StorePill store={v.store} label={stores.find(s => s.key === v.store)?.label} />
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs">{Number(v.unique_clients).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">{fmtCurrency(sold)}</td>
                        <td className={`py-3 px-4 text-right font-mono text-xs ${lvl >= 1 ? 'text-meta1' : 'text-muted-foreground'}`}>{fmtK(m1)}</td>
                        <td className={`py-3 px-4 text-right font-mono text-xs ${lvl >= 2 ? 'text-meta2' : 'text-muted-foreground'}`}>{fmtK(m2)}</td>
                        <td className={`py-3 px-4 text-right font-mono text-xs ${lvl >= 3 ? 'text-meta3' : 'text-muted-foreground'}`}>{fmtK(m3)}</td>
                        <td className="py-3 px-4 w-48">
                          <ProgressBar sold={sold} meta1={m1} meta2={m2} meta3={m3} metaLevel={lvl} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <BonusBadge level={lvl} amount={b} />
                        </td>
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
