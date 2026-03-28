'use client'

import { useState, useMemo } from 'react'
import { fmtCurrency, recencyColor, recencyLabel } from '@/lib/utils'

interface Client {
  period_id: number
  vendor_id: string
  client_id: string
  client_name: string
  total_spent: number
  visit_days: number
  total_orders: number
  total_items: number
  avg_items_per_order: number
  avg_ticket: number
  first_purchase: string
  last_purchase: string
  last_purchase_time: string
  days_since_last: number
}

type SortKey = 'total_spent' | 'visit_days' | 'total_orders' | 'total_items' | 'avg_items_per_order' | 'avg_ticket' | 'days_since_last' | 'client_name'

export default function ClientsTabClient({ clients, color }: { clients: Client[]; color: string }) {
  const [search, setSearch]     = useState('')
  const [sortKey, setSortKey]   = useState<SortKey>('total_spent')
  const [sortDir, setSortDir]   = useState<1 | -1>(-1)
  const [recFilter, setRecFilter] = useState<'all' | 'today' | 'week' | 'inactive'>('all')

  const filtered = useMemo(() => {
    let list = [...clients]

    // Search filter
    if (search) list = list.filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()))

    // Recency filter
    if (recFilter === 'today')    list = list.filter(c => Number(c.days_since_last) <= 1)
    if (recFilter === 'week')     list = list.filter(c => Number(c.days_since_last) <= 7)
    if (recFilter === 'inactive') list = list.filter(c => Number(c.days_since_last) > 7)

    // Sort
    list.sort((a, b) => {
      const av = sortKey === 'client_name' ? a.client_name : Number(a[sortKey])
      const bv = sortKey === 'client_name' ? b.client_name : Number(b[sortKey])
      if (typeof av === 'string') return sortDir * av.localeCompare(bv as string)
      return sortDir * ((av as number) - (bv as number))
    })
    return list
  }, [clients, search, sortKey, sortDir, recFilter])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === -1 ? 1 : -1)
    else { setSortKey(key); setSortDir(key === 'client_name' || key === 'days_since_last' ? 1 : -1) }
  }

  function SortTh({ label, k, right }: { label: string; k: SortKey; right?: boolean }) {
    const active = sortKey === k
    return (
      <th onClick={() => toggleSort(k)} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: active ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', textAlign: right ? 'right' : 'left', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>
        {label} {active ? (sortDir === -1 ? '↓' : '↑') : '↕'}
      </th>
    )
  }

  const total     = clients.reduce((s, c) => s + Number(c.total_spent), 0)
  const active7   = clients.filter(c => Number(c.days_since_last) <= 7).length
  const avgTicket = clients.length ? total / clients.length : 0

  const selectStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
    padding: '6px 10px', cursor: 'pointer', outline: 'none',
  }

  return (
    <div>
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '10px', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total clientes', value: clients.length.toLocaleString() },
          { label: 'Volume total',   value: fmtCurrency(total), color: color },
          { label: 'Ativos (7d)',    value: active7.toLocaleString(), color: 'var(--mkt)' },
          { label: 'Ticket médio',   value: fmtCurrency(avgTicket) },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>{k.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: k.color || 'var(--text)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Buscar cliente..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...selectStyle, width: '220px' }}
        />
        <select value={recFilter} onChange={e => setRecFilter(e.target.value as typeof recFilter)} style={selectStyle}>
          <option value="all">Todos os clientes</option>
          <option value="today">Ativos hoje</option>
          <option value="week">Ativos esta semana</option>
          <option value="inactive">Inativos (+7d)</option>
        </select>
        <select value={sortKey} onChange={e => { setSortKey(e.target.value as SortKey); setSortDir(-1) }} style={selectStyle}>
          <option value="total_spent">Ordenar: Total vendido</option>
          <option value="visit_days">Ordenar: Visitas</option>
          <option value="avg_ticket">Ordenar: Ticket médio</option>
          <option value="total_items">Ordenar: Itens total</option>
          <option value="avg_items_per_order">Ordenar: Itens/nota</option>
          <option value="days_since_last">Ordenar: Última compra</option>
          <option value="client_name">Ordenar: Nome</option>
        </select>
        <span style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginLeft: 'auto' }}>
          {filtered.length} clientes
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', padding: '6px 10px', width: '32px' }}>#</th>
              <SortTh label="Cliente"      k="client_name" />
              <SortTh label="Total"        k="total_spent"        right />
              <SortTh label="Visitas"      k="visit_days"         right />
              <SortTh label="Itens total"  k="total_items"        right />
              <SortTh label="Itens/nota"   k="avg_items_per_order" right />
              <SortTh label="Freq."        k="total_orders"       right />
              <SortTh label="Última compra" k="days_since_last" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const daysAgo  = Number(c.days_since_last)
              const recColor = recencyColor(daysAgo)
              const timeStr  = c.last_purchase_time ? String(c.last_purchase_time).slice(0, 5) : ''
              return (
                <tr key={c.client_id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '7px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px', fontWeight: 500, fontSize: '0.78rem' }}>{c.client_name}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color }}>{fmtCurrency(Number(c.total_spent))}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{c.visit_days}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{Number(c.total_items).toLocaleString()}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{c.avg_items_per_order}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{c.total_orders}x</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: recColor, marginRight: '6px', verticalAlign: 'middle' }} />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem' }}>{c.last_purchase}</span>
                    {timeStr && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: 'var(--muted)', marginLeft: '4px' }}>{timeStr}</span>}
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', marginLeft: '4px' }}>({recencyLabel(daysAgo)})</span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
