'use client'

import { useState, useMemo } from 'react'
import { fmtCurrency, recencyColor, recencyLabel } from '@/lib/utils'
import { fetchClientHistory } from './clientsActions'

interface Client {
  client_id: string
  client_name: string
  vendor_id: string
  vendor_name?: string
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

export default function ClientsTabClient({ clients }: { clients: Client[] }) {
  const [search, setSearch]       = useState('')
  const [sortKey, setSortKey]     = useState<SortKey>('total_spent')
  const [sortDir, setSortDir]     = useState<1 | -1>(-1)
  const [recFilter, setRecFilter] = useState<'all' | 'today' | 'week' | 'inactive'>('all')

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientHistory, setClientHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  async function openClientDetails(client: Client) {
    setSelectedClient(client)
    setLoadingHistory(true)
    setClientHistory([])
    try {
      const history = await fetchClientHistory(client.client_id)
      setClientHistory(history || [])
    } catch (e) {
      console.error('Failed to fetch client history', e)
    } finally {
      setLoadingHistory(false)
    }
  }

  const filtered = useMemo(() => {
    let list = [...clients]
    if (search)
      list = list.filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()))
    if (recFilter === 'today')    list = list.filter(c => Number(c.days_since_last) <= 1)
    if (recFilter === 'week')     list = list.filter(c => Number(c.days_since_last) <= 7)
    if (recFilter === 'inactive') list = list.filter(c => Number(c.days_since_last) > 7)
    list.sort((a, b) => {
      if (sortKey === 'client_name')
        return sortDir * a.client_name.localeCompare(b.client_name)
      return sortDir * (Number(a[sortKey]) - Number(b[sortKey]))
    })
    return list
  }, [clients, search, sortKey, sortDir, recFilter])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === -1 ? 1 : -1)
    else { setSortKey(key); setSortDir(key === 'client_name' || key === 'days_since_last' ? 1 : -1) }
  }

  const total    = clients.reduce((s, c) => s + Number(c.total_spent), 0)
  const active7  = clients.filter(c => Number(c.days_since_last) <= 7).length
  const avgTicket = clients.length ? total / clients.length : 0

  const selStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
    padding: '6px 10px', cursor: 'pointer', outline: 'none',
  }

  function Th({ label, k, right }: { label: string; k: SortKey; right?: boolean }) {
    const active = sortKey === k
    return (
      <th onClick={() => toggleSort(k)} style={{
        fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em',
        color: active ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase',
        padding: '6px 10px', textAlign: right ? 'right' : 'left',
        whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
      }}>
        {label}{active ? (sortDir === -1 ? ' ↓' : ' ↑') : ' ↕'}
      </th>
    )
  }

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '1.25rem' }}>
        {[
          { label: 'Clientes únicos', value: clients.length.toLocaleString() },
          { label: 'Volume total',    value: fmtCurrency(total),    color: 'var(--accent)' },
          { label: 'Ativos (7d)',     value: active7.toLocaleString(), color: 'var(--mkt)' },
          { label: 'Ticket médio',    value: fmtCurrency(avgTicket) },
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
          style={{ ...selStyle, width: '220px' }}
        />
        <select value={recFilter} onChange={e => setRecFilter(e.target.value as typeof recFilter)} style={selStyle}>
          <option value="all">Todos os clientes</option>
          <option value="today">Ativos hoje</option>
          <option value="week">Ativos esta semana</option>
          <option value="inactive">Inativos (+7d)</option>
        </select>
        <select value={sortKey} onChange={e => { setSortKey(e.target.value as SortKey); setSortDir(-1) }} style={selStyle}>
          <option value="total_spent">Ordenar: Total comprado</option>
          <option value="visit_days">Ordenar: Visitas</option>
          <option value="avg_ticket">Ordenar: Ticket médio</option>
          <option value="total_items">Ordenar: Itens total</option>
          <option value="avg_items_per_order">Ordenar: Itens/nota</option>
          <option value="days_since_last">Ordenar: Última compra</option>
          <option value="client_name">Ordenar: Nome A→Z</option>
        </select>
        <span style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginLeft: 'auto' }}>
          {filtered.length.toLocaleString()} clientes
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', padding: '6px 10px', width: '36px' }}>#</th>
              <Th label="Cliente"       k="client_name" />
              <Th label="Total"         k="total_spent"         right />
              <Th label="Visitas"       k="visit_days"          right />
              <Th label="Itens total"   k="total_items"         right />
              <Th label="Itens/nota"    k="avg_items_per_order" right />
              <Th label="Freq."         k="total_orders"        right />
              <Th label="Última compra" k="days_since_last" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const daysAgo  = Number(c.days_since_last)
              const recColor = recencyColor(daysAgo)
              const timeStr  = c.last_purchase_time ? String(c.last_purchase_time).slice(0, 5) : ''
              return (
                <tr 
                  key={`${c.client_id}-${c.vendor_id}`} 
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => openClientDetails(c)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '7px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px', fontWeight: 500, fontSize: '0.78rem' }}>{c.client_name}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--accent)' }}>{fmtCurrency(Number(c.total_spent))}</td>
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
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALHES DO CLIENTE */}
      {selectedClient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedClient(null)}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', width: '900px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: '0 0 5px 0' }}>{selectedClient.client_name}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
                  Total: <span style={{ color: 'var(--accent)' }}>{fmtCurrency(Number(selectedClient.total_spent))}</span> &nbsp;|&nbsp; 
                  Visitas: {selectedClient.visit_days} &nbsp;|&nbsp; 
                  Última compra: {selectedClient.last_purchase}
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--muted)' }}>Últimas compras (Até 100)</h3>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Carregando histórico...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem' }}>DATA / HORA</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem' }}>PRODUTO</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem' }}>VENDEDOR</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem' }}>CANAL DE VENDA</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem' }}>QTD</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem' }}>VALOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientHistory.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>
                          {String(r.sale_date)} <span style={{ color: 'var(--muted)' }}>{r.sale_time ? String(r.sale_time).slice(0,5) : ''}</span>
                        </td>
                        <td style={{ padding: '8px' }}>{r.product_code || '---'}</td>
                        <td style={{ padding: '8px' }}>{r.vendor_name}</td>
                        <td style={{ padding: '8px' }}>{r.store}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{r.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--accent)' }}>{fmtCurrency(Number(r.valor))}</td>
                      </tr>
                    ))}
                    {clientHistory.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Nenhum registro encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
