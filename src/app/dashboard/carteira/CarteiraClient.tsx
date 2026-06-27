'use client'

import { useState, useMemo } from 'react'
import { fmtCurrency, recencyColor, recencyLabel } from '@/lib/utils'
import { analyzeCarteira, paretoTop20Share, segmentCounts } from '@/lib/carteira/segmentation'
import { SEGMENT_LABELS, SEGMENT_COLORS, type CarteiraClient as Client, type Segment } from '@/lib/carteira/types'

type Filter = 'all' | Segment

export default function CarteiraClient({ clients, color }: { clients: Client[]; color: string }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const analyzed = useMemo(() => analyzeCarteira(clients), [clients])
  const counts   = useMemo(() => segmentCounts(analyzed), [analyzed])
  const pareto   = useMemo(() => paretoTop20Share(clients), [clients])

  const total   = clients.reduce((s, c) => s + Number(c.total_spent), 0)
  const novos   = counts.novo
  const emRisco = counts.em_risco

  const filtered = useMemo(() => {
    let list = analyzed
    if (filter !== 'all') list = list.filter(c => c.segment === filter)
    if (search) list = list.filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()))
    return [...list].sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
  }, [analyzed, filter, search])

  const kpis = [
    { label: 'Clientes', value: clients.length.toLocaleString() },
    { label: 'Volume', value: fmtCurrency(total), color },
    { label: 'Em risco', value: emRisco.toLocaleString(), color: SEGMENT_COLORS.em_risco },
    { label: 'Novos', value: novos.toLocaleString(), color: SEGMENT_COLORS.novo },
    { label: 'Top 20% receita', value: `${Math.round(pareto * 100)}%` },
  ]

  const pills: { key: Filter; label: string; count: number }[] = [
    { key: 'all',        label: 'Todos',                   count: clients.length },
    { key: 'vip',        label: SEGMENT_LABELS.vip,        count: counts.vip },
    { key: 'recorrente', label: SEGMENT_LABELS.recorrente, count: counts.recorrente },
    { key: 'novo',       label: SEGMENT_LABELS.novo,       count: counts.novo },
    { key: 'em_risco',   label: SEGMENT_LABELS.em_risco,   count: counts.em_risco },
    { key: 'perdido',    label: SEGMENT_LABELS.perdido,    count: counts.perdido },
  ]

  return (
    <div>
      {/* KPIs macro */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '1rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>{k.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: k.color || 'var(--text)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Pills de segmento */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {pills.map(p => {
          const on  = filter === p.key
          const col = p.key === 'all' ? 'var(--accent)' : SEGMENT_COLORS[p.key as Segment]
          return (
            <button key={p.key} onClick={() => setFilter(p.key)} style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '4px 11px', borderRadius: '20px',
              cursor: 'pointer', border: `1px solid ${on ? col : 'var(--border)'}`,
              background: on ? `${col}22` : 'transparent', color: on ? col : 'var(--muted)',
            }}>
              {p.label} · {p.count}
            </button>
          )
        })}
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '6px 10px', width: '200px', outline: 'none' }}
        />
      </div>

      {/* Lista */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Cliente', 'Segmento', 'Total', 'Ticket méd.', 'Tend.', 'Última compra'].map((h, i) => (
                <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', textAlign: i >= 3 && i <= 5 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const daysAgo = Number(c.days_since_last)
              return (
                <tr
                  key={`${c.client_id}-${c.vendor_id}`}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '7px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px', fontWeight: 500, fontSize: '0.78rem' }}>{c.client_name}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', padding: '2px 7px', borderRadius: '5px', background: `${SEGMENT_COLORS[c.segment]}22`, color: SEGMENT_COLORS[c.segment] }}>{SEGMENT_LABELS[c.segment]}</span>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--accent)' }}>{fmtCurrency(Number(c.total_spent))}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{fmtCurrency(Number(c.avg_ticket))}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>—</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: recencyColor(daysAgo), marginRight: '6px', verticalAlign: 'middle' }} />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem' }}>{c.last_purchase}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', marginLeft: '4px' }}>({recencyLabel(daysAgo)})</span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
