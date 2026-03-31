'use client'

import { useMemo, useState } from 'react'
import { fmtCurrency } from '@/lib/utils'

interface DayData {
  sale_date: string
  store: string
  clients: number
  vendors_active: number
  transactions: number
  total: number
  avg_ticket: number
}

interface Props {
  data: DayData[]
}

const STORE_COLORS: Record<string, string> = {
  'Jebai':      '#c8f542',
  'Paje-MKT':   '#42d9f5',
  'Paje-Caixa': '#f5a742',
}

const STORES = ['Jebai', 'Paje-MKT', 'Paje-Caixa']

type Metric = 'total' | 'clients' | 'avg_ticket' | 'transactions'

const METRIC_LABELS: Record<Metric, string> = {
  total:        'Volume ($)',
  clients:      'Clientes únicos',
  avg_ticket:   'Ticket médio ($)',
  transactions: 'Transações',
}

export default function EvolucaoTab({ data }: Props) {
  const [metric, setMetric]           = useState<Metric>('total')
  const [activeStores, setActiveStores] = useState<Set<string>>(new Set(STORES))
  const [cumulative, setCumulative]   = useState(false)

  // Get sorted unique dates
  const dates = useMemo(() =>
    [...new Set(data.map(d => d.sale_date))].sort(), [data])

  // Build series per store
  const series = useMemo(() => {
    return STORES.filter(s => activeStores.has(s)).map(store => {
      const storeData = data.filter(d => d.store === store)
      let cumSum = 0
      const points = dates.map(date => {
        const day = storeData.find(d => d.sale_date === date)
        const val = day ? Number(day[metric]) : 0
        cumSum += val
        return { date, value: cumulative ? cumSum : val, raw: val }
      })
      return { store, color: STORE_COLORS[store], points }
    })
  }, [data, metric, activeStores, dates, cumulative])

  // Chart dimensions
  const W = 900, H = 260
  const PADL = 70, PADR = 20, PADT = 16, PADB = 40
  const innerW = W - PADL - PADR
  const innerH = H - PADT - PADB

  const allValues = series.flatMap(s => s.points.map(p => p.value))
  const maxVal    = Math.max(...allValues, 1)
  const minVal    = 0

  function xPos(i: number) { return PADL + (i / Math.max(dates.length - 1, 1)) * innerW }
  function yPos(v: number) { return PADT + innerH - ((v - minVal) / (maxVal - minVal)) * innerH }

  // Y axis ticks
  const ticks = 5
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => minVal + (maxVal - minVal) * (i / ticks))

  // X axis labels — show every Nth date to avoid crowding
  const step = Math.ceil(dates.length / 12)
  const xLabels = dates.filter((_, i) => i % step === 0 || i === dates.length - 1)

  // Store summaries
  const summaries = STORES.map(store => {
    const storeData = data.filter(d => d.store === store)
    return {
      store,
      color: STORE_COLORS[store],
      total:        storeData.reduce((s, d) => s + Number(d.total), 0),
      clients:      storeData.reduce((s, d) => s + Number(d.clients), 0),
      transactions: storeData.reduce((s, d) => s + Number(d.transactions), 0),
      avg_ticket:   storeData.length ? storeData.reduce((s, d) => s + Number(d.avg_ticket), 0) / storeData.length : 0,
      days:         storeData.length,
    }
  })

  const grandTotal = summaries.reduce((s, x) => s + x.total, 0)

  function fmtTick(v: number) {
    if (metric === 'total' || metric === 'avg_ticket') {
      if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(1)}M`
      if (v >= 1_000)     return `$${(v/1_000).toFixed(0)}k`
      return `$${v.toFixed(0)}`
    }
    if (v >= 1_000) return `${(v/1_000).toFixed(1)}k`
    return String(Math.round(v))
  }

  function formatDate(d: string) {
    const dt = new Date(d + 'T12:00:00')
    return `${dt.getDate()}/${dt.getMonth() + 1}`
  }

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; values: { store: string; color: string; value: number }[] } | null>(null)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX  = (e.clientX - rect.left) * (W / rect.width)
    const innerX = svgX - PADL
    if (innerX < 0 || innerX > innerW) { setTooltip(null); return }
    const idx = Math.round((innerX / innerW) * (dates.length - 1))
    const date = dates[Math.min(idx, dates.length - 1)]
    const values = series.map(s => ({
      store: s.store,
      color: s.color,
      value: s.points[Math.min(idx, s.points.length - 1)]?.value ?? 0,
    }))
    setTooltip({ x: xPos(idx), y: PADT, date, values })
  }

  const selStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
    padding: '6px 12px', outline: 'none', cursor: 'pointer',
  }

  return (
    <div>
      {/* Summary KPI cards per store */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.75rem' }}>
        {summaries.map(s => (
          <div key={s.store} style={{ background: 'var(--surface)', border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '1.25rem 1.5rem', borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: s.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 }}>{s.store}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>{fmtCurrency(s.total)}</div>
            <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '2px' }}>
              {((s.total / grandTotal) * 100).toFixed(1)}% do total
            </div>
            <div style={{ height: '3px', background: 'var(--surface2)', borderRadius: '2px', marginBottom: '10px' }}>
              <div style={{ height: '100%', width: `${(s.total / grandTotal) * 100}%`, background: s.color, borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Clientes',   value: s.clients.toLocaleString() },
                { label: 'Tx/dia',     value: Math.round(s.transactions / s.days).toLocaleString() },
                { label: 'Ticket méd', value: fmtCurrency(s.avg_ticket) },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--surface2)', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '0.55rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>{k.label}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{k.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={metric} onChange={e => setMetric(e.target.value as Metric)} style={selStyle}>
          {(Object.entries(METRIC_LABELS) as [Metric, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {/* Store toggles */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {STORES.map(store => {
            const active = activeStores.has(store)
            return (
              <button
                key={store}
                onClick={() => setActiveStores(prev => {
                  const next = new Set(prev)
                  if (next.has(store) && next.size > 1) next.delete(store)
                  else next.add(store)
                  return next
                })}
                style={{
                  background: active ? `${STORE_COLORS[store]}18` : 'transparent',
                  border: `1px solid ${active ? STORE_COLORS[store] : 'var(--border)'}`,
                  borderRadius: '6px', color: active ? STORE_COLORS[store] : 'var(--muted)',
                  fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
                  padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {store}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setCumulative(c => !c)}
          style={{
            background: cumulative ? 'rgba(200,245,66,0.1)' : 'transparent',
            border: `1px solid ${cumulative ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '6px', color: cumulative ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
            padding: '5px 12px', cursor: 'pointer',
          }}
        >
          Acumulado
        </button>

        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
          {dates.length} dias com vendas
        </span>
      </div>

      {/* SVG Line Chart */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Grid lines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PADL} y1={yPos(v)} x2={W - PADR} y2={yPos(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              <text x={PADL - 6} y={yPos(v) + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="DM Mono, monospace">
                {fmtTick(v)}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {xLabels.map(date => {
            const i = dates.indexOf(date)
            return (
              <text key={date} x={xPos(i)} y={H - PADB + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="DM Mono, monospace">
                {formatDate(date)}
              </text>
            )
          })}

          {/* Area fills */}
          {series.map(s => {
            if (s.points.length < 2) return null
            const pts = s.points.map((p, i) => `${xPos(i)},${yPos(p.value)}`).join(' ')
            const firstX = xPos(0), lastX = xPos(s.points.length - 1)
            const bottomY = yPos(0)
            return (
              <polygon
                key={`area-${s.store}`}
                points={`${firstX},${bottomY} ${pts} ${lastX},${bottomY}`}
                fill={s.color}
                opacity={0.06}
              />
            )
          })}

          {/* Lines */}
          {series.map(s => {
            if (s.points.length < 2) return null
            const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(p.value)}`).join(' ')
            return (
              <path key={`line-${s.store}`} d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )
          })}

          {/* Tooltip vertical line */}
          {tooltip && (
            <line x1={tooltip.x} y1={PADT} x2={tooltip.x} y2={H - PADB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4,3" />
          )}

          {/* Dots at tooltip position */}
          {tooltip && series.map(s => {
            const tv = tooltip.values.find(v => v.store === s.store)
            if (!tv) return null
            const idx = dates.indexOf(tooltip.date)
            return (
              <circle key={s.store} cx={xPos(idx)} cy={yPos(tv.value)} r={4} fill={s.color} stroke="var(--bg)" strokeWidth={2} />
            )
          })}
        </svg>

        {/* Tooltip box */}
        {tooltip && (
          <div style={{ marginTop: '8px', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'inline-flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginRight: '4px', alignSelf: 'center' }}>
              {formatDate(tooltip.date)}
            </div>
            {tooltip.values.map(v => (
              <div key={v.store} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{v.store}:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: v.color }}>
                  {(metric === 'total' || metric === 'avg_ticket') ? fmtCurrency(v.value) : v.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily breakdown table */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Detalhe diário por loja
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data', ...STORES.flatMap(s => [`${s} ($)`, 'Clientes', 'Ticket'])].map(h => (
                  <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '5px 8px', textAlign: h === 'Data' ? 'left' : 'right', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map(date => {
                const row = STORES.map(store => data.find(d => d.sale_date === date && d.store === store))
                const dayTotal = row.reduce((s, d) => s + (d ? Number(d.total) : 0), 0)
                return (
                  <tr key={date} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem' }}>
                      {formatDate(date)}
                      <span style={{ fontSize: '0.58rem', color: 'var(--muted)', marginLeft: '6px' }}>{fmtCurrency(dayTotal)}</span>
                    </td>
                    {row.map((d, i) => (
                      <>
                        <td key={`t${i}`} style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: STORE_COLORS[STORES[i]], fontSize: '0.72rem' }}>
                          {d ? fmtCurrency(Number(d.total)) : '—'}
                        </td>
                        <td key={`c${i}`} style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {d ? d.clients : '—'}
                        </td>
                        <td key={`a${i}`} style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {d ? fmtCurrency(Number(d.avg_ticket)) : '—'}
                        </td>
                      </>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
