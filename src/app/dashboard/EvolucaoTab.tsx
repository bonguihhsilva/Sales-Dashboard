'use client'

import { useMemo, useState } from 'react'
import { fmtCurrency } from '@/lib/utils'

interface DayData {
  period_id:    number
  period_label: string
  period_month: number
  period_year:  number
  day_of_month: number
  sale_date:    string
  store:        string
  clients:      number
  vendors_active: number
  transactions: number
  total:        number
  avg_ticket:   number
}

interface Period { id: number; label: string; year: number; month: number }

interface VendorPeriodSummary {
  vendor_id: string
  vendor_name: string
  store: string
  period_id: number
  total_sold: number
  unique_clients: number
  avg_ticket: number
  total_orders: number
}

interface Props {
  data:             DayData[]
  periods:          Period[]
  vendorSummaries:  VendorPeriodSummary[]
}

const STORE_COLORS: Record<string, string> = {
  'Jebai':      '#c8f542',
  'Paje-MKT':   '#42d9f5',
  'Paje-Caixa': '#f5a742',
}

const STORE_LABELS: Record<string, string> = {
  'Jebai':      'Jebai',
  'Paje-MKT':   'Pajé 1',
  'Paje-Caixa': 'Pajé 2',
}

const STORES = ['Jebai', 'Paje-MKT', 'Paje-Caixa']

const PERIOD_PALETTES = [
  { Jebai: '#c8f542', 'Paje-MKT': '#42d9f5', 'Paje-Caixa': '#f5a742' },
  { Jebai: '#7ab833', 'Paje-MKT': '#2491a8', 'Paje-Caixa': '#c27a1a' },
  { Jebai: '#e8ff80', 'Paje-MKT': '#80eeff', 'Paje-Caixa': '#ffe080' },
  { Jebai: '#a0c830', 'Paje-MKT': '#30b8d8', 'Paje-Caixa': '#d89030' },
]

type Metric   = 'total' | 'clients' | 'avg_ticket' | 'transactions'
type ViewMode = 'month' | 'overlay' | 'cumulative'
type SubTab   = 'lojas' | 'vendedores'

const METRIC_LABELS: Record<Metric, string> = {
  total:        'Volume ($)',
  clients:      'Clientes únicos',
  avg_ticket:   'Ticket médio ($)',
  transactions: 'Transações',
}

const VENDOR_METRIC_FIELD: Record<Metric, keyof VendorPeriodSummary> = {
  total:        'total_sold',
  clients:      'unique_clients',
  avg_ticket:   'avg_ticket',
  transactions: 'total_orders',
}

export default function EvolucaoTab({ data, periods, vendorSummaries }: Props) {
  const [metric, setMetric]             = useState<Metric>('total')
  const [activeStores, setActiveStores] = useState<Set<string>>(new Set(STORES))
  const [viewMode, setViewMode]         = useState<ViewMode>('month')
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('lojas')
  const [selectedPeriods, setSelectedPeriods] = useState<Set<number>>(
    new Set(periods.map(p => p.id))
  )

  const activePeriods = periods.filter(p => selectedPeriods.has(p.id))

  // Periods sorted oldest → newest (for vendor table columns)
  const sortedPeriodsAsc = useMemo(() =>
    [...activePeriods].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month),
    [activePeriods]
  )

  // ── Lojas chart data ──────────────────────────────────────────────────────

  const filtered = useMemo(() =>
    data.filter(d => selectedPeriods.has(d.period_id) && activeStores.has(d.store)),
    [data, selectedPeriods, activeStores]
  )

  const series = useMemo(() => {
    const result: { id: string; label: string; color: string; points: { x: number | string; value: number }[] }[] = []

    if (viewMode === 'month' && activePeriods.length === 1) {
      const pid = activePeriods[0].id
      for (const store of STORES) {
        if (!activeStores.has(store)) continue
        const storeData = filtered.filter(d => d.period_id === pid && d.store === store)
          .sort((a, b) => a.sale_date.localeCompare(b.sale_date))
        result.push({
          id: store, label: store, color: STORE_COLORS[store],
          points: storeData.map(d => ({ x: d.sale_date, value: Number(d[metric]) })),
        })
      }
    } else if (viewMode === 'overlay') {
      for (const store of STORES) {
        if (!activeStores.has(store)) continue
        activePeriods.forEach((period, pi) => {
          const palette = PERIOD_PALETTES[pi % PERIOD_PALETTES.length]
          const storeData = filtered.filter(d => d.period_id === period.id && d.store === store)
            .sort((a, b) => a.day_of_month - b.day_of_month)
          result.push({
            id: `${store}-${period.id}`,
            label: `${store} (${period.label})`,
            color: palette[store as keyof typeof palette] ?? '#999',
            points: storeData.map(d => ({ x: d.day_of_month, value: Number(d[metric]) })),
          })
        })
      }
    } else {
      for (const store of STORES) {
        if (!activeStores.has(store)) continue
        const byDate = new Map<string, number>()
        filtered.filter(d => d.store === store).forEach(d => {
          byDate.set(d.sale_date, (byDate.get(d.sale_date) ?? 0) + Number(d[metric]))
        })
        const sorted = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b))
        let cum = 0
        result.push({
          id: store, label: store, color: STORE_COLORS[store],
          points: sorted.map(([date, val]) => { cum += val; return { x: date, value: cum } }),
        })
      }
    }
    return result
  }, [filtered, metric, viewMode, activePeriods, activeStores])

  const xValues = useMemo(() => {
    const all = series.flatMap(s => s.points.map(p => p.x))
    return [...new Set(all)].sort((a, b) => String(a).localeCompare(String(b)))
  }, [series])

  const W = 920, H = 260
  const PADL = 72, PADR = 16, PADT = 16, PADB = 42
  const innerW = W - PADL - PADR
  const innerH = H - PADT - PADB

  const allVals = series.flatMap(s => s.points.map(p => p.value))
  const maxVal  = Math.max(...allVals, 1)

  function xPos(xi: number) { return PADL + (xi / Math.max(xValues.length - 1, 1)) * innerW }
  function yPos(v: number)  { return PADT + innerH - (v / maxVal) * innerH }

  const yTicks = Array.from({ length: 5 }, (_, i) => maxVal * (i / 4))
  const xStep  = Math.ceil(xValues.length / 14)
  const xLabels = xValues.filter((_, i) => i % xStep === 0 || i === xValues.length - 1)

  function fmtTick(v: number) {
    if (metric === 'total' || metric === 'avg_ticket') {
      if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
      if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`
      return `$${v.toFixed(0)}`
    }
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))
  }
  function fmtX(x: number | string) {
    if (typeof x === 'number') return `D${x}`
    const d = new Date(x + 'T12:00:00')
    return `${d.getDate()}/${d.getMonth() + 1}`
  }
  function fmtVal(v: number) {
    if (metric === 'total' || metric === 'avg_ticket') return fmtCurrency(v)
    return v.toLocaleString()
  }

  const [tooltip, setTooltip] = useState<{ xi: number; values: { id: string; label: string; color: string; value: number }[] } | null>(null)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX  = (e.clientX - rect.left) * (W / rect.width)
    const innerX = svgX - PADL
    if (innerX < 0 || innerX > innerW || xValues.length === 0) { setTooltip(null); return }
    const xi = Math.round((innerX / innerW) * (xValues.length - 1))
    const x  = xValues[Math.min(xi, xValues.length - 1)]
    const values = series.map(s => {
      const pt = s.points.find(p => p.x === x) ?? { x, value: 0 }
      return { id: s.id, label: s.label, color: s.color, value: pt.value }
    })
    setTooltip({ xi, values })
  }

  const storePeriodTotals = useMemo(() => {
    return activePeriods.map(period => ({
      period,
      stores: STORES.map(store => ({
        store,
        color: STORE_COLORS[store],
        total:  data.filter(d => d.period_id === period.id && d.store === store).reduce((s, d) => s + Number(d.total), 0),
        clients: data.filter(d => d.period_id === period.id && d.store === store).reduce((s, d) => s + Number(d.clients), 0),
        avgTicket: (() => {
          const rows = data.filter(d => d.period_id === period.id && d.store === store)
          return rows.length ? rows.reduce((s, d) => s + Number(d.avg_ticket), 0) / rows.length : 0
        })(),
      })),
    }))
  }, [data, activePeriods])

  // ── Vendedores table data ─────────────────────────────────────────────────

  const vendorRows = useMemo(() => {
    const field = VENDOR_METRIC_FIELD[metric]
    const filt = vendorSummaries.filter(
      s => selectedPeriods.has(s.period_id) && activeStores.has(s.store)
    )
    const byVendor = new Map<string, { name: string; store: string; byPeriod: Map<number, number> }>()
    for (const s of filt) {
      if (!byVendor.has(s.vendor_id)) {
        byVendor.set(s.vendor_id, { name: s.vendor_name, store: s.store, byPeriod: new Map() })
      }
      byVendor.get(s.vendor_id)!.byPeriod.set(s.period_id, Number(s[field]))
    }
    const lastPid = sortedPeriodsAsc[sortedPeriodsAsc.length - 1]?.id ?? 0
    return [...byVendor.entries()]
      .map(([id, v]) => ({ vendor_id: id, ...v }))
      .sort((a, b) => (b.byPeriod.get(lastPid) ?? 0) - (a.byPeriod.get(lastPid) ?? 0))
  }, [vendorSummaries, selectedPeriods, activeStores, metric, sortedPeriodsAsc])

  // ── Shared UI helpers ─────────────────────────────────────────────────────

  const selStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
    padding: '6px 10px', outline: 'none', cursor: 'pointer',
  }

  function togglePeriod(id: number) {
    setSelectedPeriods(prev => {
      const next = new Set(prev)
      if (next.has(id) && next.size > 1) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleStore(s: string) {
    setActiveStores(prev => {
      const next = new Set(prev)
      if (next.has(s) && next.size > 1) next.delete(s)
      else next.add(s)
      return next
    })
  }
  function growthColor(pct: number) {
    if (pct > 0) return '#c8f542'
    if (pct < 0) return '#f55442'
    return 'var(--muted)'
  }
  function fmtGrowth(pct: number) {
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  }

  const thBase: React.CSSProperties = {
    fontFamily: 'DM Mono, monospace', fontSize: '0.58rem', color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 10px',
    whiteSpace: 'nowrap',
  }

  return (
    <div>
      {/* ── Sub-tab switcher ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
        {([
          { key: 'lojas',      label: 'Lojas' },
          { key: 'vendedores', label: 'Vendedores' },
        ] as { key: SubTab; label: string }[]).map(t => {
          const on = activeSubTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveSubTab(t.key)}
              style={{
                background: on ? 'rgba(200,245,66,0.1)' : 'transparent',
                border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '6px', color: on ? 'var(--accent)' : 'var(--muted)',
                fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
                padding: '7px 18px', cursor: 'pointer', fontWeight: on ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Period selector (shared) ─────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Períodos selecionados
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {periods.map(p => {
            const on = selectedPeriods.has(p.id)
            return (
              <button
                key={p.id}
                onClick={() => togglePeriod(p.id)}
                style={{
                  background: on ? 'rgba(200,245,66,0.1)' : 'transparent',
                  border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px', color: on ? 'var(--accent)' : 'var(--muted)',
                  fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
                  padding: '6px 14px', cursor: 'pointer', transition: 'all 0.15s',
                  fontWeight: on ? 700 : 400,
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Metric + store controls (shared) ────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select value={metric} onChange={e => setMetric(e.target.value as Metric)} style={selStyle}>
          {(Object.entries(METRIC_LABELS) as [Metric, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {activeSubTab === 'lojas' && (
          <>
            {[
              { v: 'month',      label: 'Por mês',   tip: 'Evolução diária do período selecionado' },
              { v: 'overlay',    label: 'Sobrepor',   tip: 'Alinha períodos pelo dia do mês para comparar' },
              { v: 'cumulative', label: 'Acumulado',  tip: 'Soma cumulativa ao longo dos dias' },
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => setViewMode(opt.v as ViewMode)}
                title={opt.tip}
                style={{
                  background: viewMode === opt.v ? 'rgba(200,245,66,0.1)' : 'transparent',
                  border: `1px solid ${viewMode === opt.v ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px', color: viewMode === opt.v ? 'var(--accent)' : 'var(--muted)',
                  fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
                  padding: '6px 12px', cursor: 'pointer', fontWeight: viewMode === opt.v ? 700 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </>
        )}

        <div style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
          {STORES.map(store => {
            const active = activeStores.has(store)
            return (
              <button
                key={store}
                onClick={() => toggleStore(store)}
                style={{
                  background: active ? `${STORE_COLORS[store]}15` : 'transparent',
                  border: `1px solid ${active ? STORE_COLORS[store] : 'var(--border)'}`,
                  borderRadius: '6px', color: active ? STORE_COLORS[store] : 'var(--muted)',
                  fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                  padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {STORE_LABELS[store] ?? store}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SUB-TAB: LOJAS                                        */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeSubTab === 'lojas' && (
        <>
          {/* Summary cards per period */}
          {storePeriodTotals.map(({ period, stores }) => {
            const periodTotal = stores.reduce((s, x) => s + x.total, 0)
            return (
              <div key={period.id} style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {period.label} — {fmtCurrency(periodTotal)} total
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {stores.map(s => (
                    <div key={s.store} style={{ background: 'var(--surface)', border: `1px solid ${s.color}28`, borderRadius: '10px', padding: '1rem 1.25rem', borderLeft: `3px solid ${s.color}` }}>
                      <div style={{ fontSize: '0.58rem', fontFamily: 'DM Mono, monospace', color: s.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', fontWeight: 700 }}>{s.store}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{fmtCurrency(s.total)}</div>
                      <div style={{ height: '3px', background: 'var(--surface2)', borderRadius: '2px', marginBottom: '8px' }}>
                        <div style={{ height: '100%', width: `${periodTotal > 0 ? (s.total / periodTotal) * 100 : 0}%`, background: s.color, borderRadius: '2px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { label: 'Clientes', value: s.clients.toLocaleString() },
                          { label: 'Ticket',   value: fmtCurrency(s.avgTicket) },
                          { label: 'Part.%',   value: `${periodTotal > 0 ? ((s.total / periodTotal) * 100).toFixed(1) : 0}%` },
                        ].map(k => (
                          <div key={k.label} style={{ flex: 1, background: 'var(--surface2)', borderRadius: '5px', padding: '5px 6px' }}>
                            <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{k.label}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>{k.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: '100%', height: 'auto', cursor: 'crosshair' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(null)}
            >
              {yTicks.map((v, i) => (
                <g key={i}>
                  <line x1={PADL} y1={yPos(v)} x2={W - PADR} y2={yPos(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <text x={PADL - 6} y={yPos(v) + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="DM Mono, monospace">{fmtTick(v)}</text>
                </g>
              ))}
              {xLabels.map(x => {
                const xi = xValues.indexOf(x)
                return (
                  <text key={String(x)} x={xPos(xi)} y={H - PADB + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="DM Mono, monospace">
                    {fmtX(x)}
                  </text>
                )
              })}
              {series.map(s => {
                if (s.points.length < 2) return null
                const pts = s.points.map(p => `${xPos(xValues.indexOf(p.x))},${yPos(p.value)}`).join(' ')
                const fx  = xPos(xValues.indexOf(s.points[0].x))
                const lx  = xPos(xValues.indexOf(s.points[s.points.length - 1].x))
                return <polygon key={`a-${s.id}`} points={`${fx},${yPos(0)} ${pts} ${lx},${yPos(0)}`} fill={s.color} opacity={0.05} />
              })}
              {series.map(s => {
                if (s.points.length < 2) return null
                const d = s.points.map((p, i) => {
                  const xi = xValues.indexOf(p.x)
                  return `${i === 0 ? 'M' : 'L'}${xPos(xi)},${yPos(p.value)}`
                }).join(' ')
                return <path key={`l-${s.id}`} d={d} fill="none" stroke={s.color} strokeWidth={activePeriods.length > 1 ? 1.5 : 2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.id.includes('-') && s.id.split('-').pop() !== String(activePeriods[0]?.id) ? '5,3' : undefined} />
              })}
              {tooltip && <line x1={xPos(tooltip.xi)} y1={PADT} x2={xPos(tooltip.xi)} y2={H - PADB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4,3" />}
              {tooltip && series.map(s => {
                const x  = xValues[tooltip.xi]
                const pt = s.points.find(p => p.x === x)
                if (!pt) return null
                const xi = xValues.indexOf(x)
                return <circle key={s.id} cx={xPos(xi)} cy={yPos(pt.value)} r={4} fill={s.color} stroke="var(--bg)" strokeWidth={2} />
              })}
            </svg>

            {tooltip && (
              <div style={{ marginTop: '8px', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginRight: '2px' }}>
                  {fmtX(xValues[tooltip.xi])}
                </span>
                {tooltip.values.filter(v => v.value > 0).map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{v.label}:</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: v.color }}>
                      {(metric === 'total' || metric === 'avg_ticket') ? fmtCurrency(v.value) : v.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {series.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
                <svg width={24} height={8}>
                  <line x1={0} y1={4} x2={24} y2={4} stroke={s.color} strokeWidth={2} strokeDasharray={viewMode === 'overlay' && s.id.split('-').pop() !== String(activePeriods[0]?.id) ? '5,3' : undefined} />
                </svg>
                {s.label}
              </div>
            ))}
          </div>

          {/* Daily table */}
          {activePeriods.length === 1 && (
            <div>
              <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Detalhe diário</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ ...thBase, textAlign: 'left' }}>Data</th>
                      {STORES.flatMap(s => [
                        <th key={`${s}v`} style={{ ...thBase, color: STORE_COLORS[s], textAlign: 'right' }}>{s} ($)</th>,
                        <th key={`${s}c`} style={{ ...thBase, textAlign: 'right' }}>Cli.</th>,
                        <th key={`${s}a`} style={{ ...thBase, textAlign: 'right' }}>Ticket</th>,
                      ])}
                    </tr>
                  </thead>
                  <tbody>
                    {[...new Set(data.filter(d => d.period_id === activePeriods[0].id).map(d => d.sale_date))].sort().map(date => {
                      const row = STORES.map(store => data.find(d => d.sale_date === date && d.store === store && d.period_id === activePeriods[0].id))
                      const dayTotal = row.reduce((s, d) => s + (d ? Number(d.total) : 0), 0)
                      return (
                        <tr key={date} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '5px 8px', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem' }}>
                            {(() => { const dt = new Date(date + 'T12:00:00'); return `${dt.getDate()}/${dt.getMonth() + 1}` })()}
                            <span style={{ fontSize: '0.58rem', color: 'var(--muted)', marginLeft: '6px' }}>{fmtCurrency(dayTotal)}</span>
                          </td>
                          {row.flatMap((d, i) => [
                            <td key={`v${i}`} style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: STORE_COLORS[STORES[i]], fontSize: '0.7rem' }}>{d ? fmtCurrency(Number(d.total)) : '—'}</td>,
                            <td key={`c${i}`} style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>{d ? d.clients : '—'}</td>,
                            <td key={`a${i}`} style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>{d ? fmtCurrency(Number(d.avg_ticket)) : '—'}</td>,
                          ])}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* SUB-TAB: VENDEDORES                                   */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeSubTab === 'vendedores' && (
        <div>
          {vendorRows.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
              Nenhum dado encontrado para os filtros selecionados.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ ...thBase, textAlign: 'left', width: '24px' }}>#</th>
                    <th style={{ ...thBase, textAlign: 'left', minWidth: '130px' }}>Vendedor</th>
                    <th style={{ ...thBase, textAlign: 'left', minWidth: '70px' }}>Loja</th>
                    {sortedPeriodsAsc.map((p, pi) => (
                      <th key={p.id} style={{ ...thBase, textAlign: 'right', minWidth: '120px' }}>
                        <span style={{ color: pi === sortedPeriodsAsc.length - 1 ? 'var(--accent)' : 'var(--muted)' }}>
                          {p.label}
                        </span>
                        {pi > 0 && (
                          <span style={{ display: 'block', fontSize: '0.5rem', color: 'var(--muted)', fontWeight: 400, marginTop: '1px' }}>
                            vs {sortedPeriodsAsc[pi - 1].label}
                          </span>
                        )}
                      </th>
                    ))}
                    {sortedPeriodsAsc.length > 1 && (
                      <th style={{ ...thBase, textAlign: 'right', minWidth: '80px' }}>
                        Var. Total
                        <span style={{ display: 'block', fontSize: '0.5rem', fontWeight: 400, marginTop: '1px' }}>
                          {sortedPeriodsAsc[0]?.label} → {sortedPeriodsAsc[sortedPeriodsAsc.length - 1]?.label}
                        </span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {vendorRows.map((row, i) => {
                    const firstVal = row.byPeriod.get(sortedPeriodsAsc[0]?.id ?? 0) ?? 0
                    const lastVal  = row.byPeriod.get(sortedPeriodsAsc[sortedPeriodsAsc.length - 1]?.id ?? 0) ?? 0
                    const totalGrowth = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : null
                    const rankColors  = ['#f5c842', '#a8abb2', '#cd7f32']
                    const col = STORE_COLORS[row.store] ?? 'var(--muted)'
                    const storeLabel = STORE_LABELS[row.store] ?? row.store

                    return (
                      <tr key={row.vendor_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: i < 3 ? rankColors[i] : 'var(--muted)', width: '24px' }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                          <a
                            href={`/dashboard/vendedor/${row.vendor_id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {row.name}
                          </a>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', padding: '2px 7px',
                            borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap',
                            background: col + '22', color: col,
                          }}>
                            {storeLabel}
                          </span>
                        </td>
                        {sortedPeriodsAsc.map((p, pi) => {
                          const val     = row.byPeriod.get(p.id) ?? 0
                          const prevVal = pi > 0 ? (row.byPeriod.get(sortedPeriodsAsc[pi - 1].id) ?? 0) : null
                          const growth  = prevVal !== null && prevVal > 0 ? ((val - prevVal) / prevVal) * 100 : null
                          const isLatest = pi === sortedPeriodsAsc.length - 1
                          return (
                            <td key={p.id} style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
                              <span style={{ fontWeight: isLatest ? 700 : 500, fontSize: '0.76rem', color: isLatest ? 'var(--text)' : 'var(--muted)' }}>
                                {val > 0 ? fmtVal(val) : <span style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>—</span>}
                              </span>
                              {growth !== null && val > 0 && (
                                <span style={{
                                  display: 'block', fontSize: '0.6rem', marginTop: '1px',
                                  color: growthColor(growth), fontWeight: 600,
                                }}>
                                  {fmtGrowth(growth)}
                                </span>
                              )}
                            </td>
                          )
                        })}
                        {sortedPeriodsAsc.length > 1 && (
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
                            {totalGrowth !== null ? (
                              <span style={{
                                fontSize: '0.72rem', fontWeight: 700,
                                color: growthColor(totalGrowth),
                                padding: '2px 7px', borderRadius: '4px',
                                background: growthColor(totalGrowth) + '18',
                              }}>
                                {fmtGrowth(totalGrowth)}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                {/* Totals row */}
                {vendorRows.length > 1 && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                      <td colSpan={3} style={{ padding: '8px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Total
                      </td>
                      {sortedPeriodsAsc.map((p, pi) => {
                        const total    = vendorRows.reduce((s, r) => s + (r.byPeriod.get(p.id) ?? 0), 0)
                        const prevTotal = pi > 0 ? vendorRows.reduce((s, r) => s + (r.byPeriod.get(sortedPeriodsAsc[pi - 1].id) ?? 0), 0) : null
                        const growth   = prevTotal !== null && prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null
                        const isLatest = pi === sortedPeriodsAsc.length - 1
                        return (
                          <td key={p.id} style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.76rem', color: isLatest ? 'var(--accent)' : 'var(--text)' }}>
                              {fmtVal(total)}
                            </span>
                            {growth !== null && (
                              <span style={{ display: 'block', fontSize: '0.6rem', marginTop: '1px', color: growthColor(growth), fontWeight: 700 }}>
                                {fmtGrowth(growth)}
                              </span>
                            )}
                          </td>
                        )
                      })}
                      {sortedPeriodsAsc.length > 1 && (
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
                          {(() => {
                            const firstTotal = vendorRows.reduce((s, r) => s + (r.byPeriod.get(sortedPeriodsAsc[0]?.id ?? 0) ?? 0), 0)
                            const lastTotal  = vendorRows.reduce((s, r) => s + (r.byPeriod.get(sortedPeriodsAsc[sortedPeriodsAsc.length - 1]?.id ?? 0) ?? 0), 0)
                            const g = firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : null
                            return g !== null ? (
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: growthColor(g), padding: '2px 7px', borderRadius: '4px', background: growthColor(g) + '18' }}>
                                {fmtGrowth(g)}
                              </span>
                            ) : '—'
                          })()}
                        </td>
                      )}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
