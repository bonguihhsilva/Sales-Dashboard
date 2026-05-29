'use client'

import { useState } from 'react'
import { fmtCurrency } from '@/lib/utils'

interface SaleItem {
  product_name: string
  category: string
  qty: number
  total: number
}

interface ClientItem {
  client_id: string
  client_name: string
  total_spent: number
  total_orders: number
  visit_days: number
  avg_ticket: number
  days_since_last: number
  last_purchase: string
}

interface Props {
  sold: number
  meta1: number
  meta2: number
  meta3: number
  bonus1: number
  bonus2: number
  bonus3: number
  metaLevel: number
  uniqueClients: number
  totalOrders: number
  totalItems: number
  avgTicket: number
  color: string
  items?: SaleItem[]
  clientList?: ClientItem[]
}

const MOCK_ITEMS: SaleItem[] = []
const MOCK_CLIENTS: ClientItem[] = []

export default function AnaliseTab({
  sold, meta1, meta2, meta3, bonus1, bonus2, bonus3,
  metaLevel: lvl, uniqueClients, totalOrders, totalItems, avgTicket,
  color, items, clientList,
}: Props) {

  const [expandedSegment, setExpandedSegment] = useState<'recorrentes' | 'novos' | null>(null)

  const data = items?.length ? items : []
  const clients = clientList?.length ? clientList : []

  // Segmentar clientes
  const recorrentes = clients.filter(c => c.total_orders >= 2).sort((a, b) => b.total_spent - a.total_spent)
  const novos       = clients.filter(c => c.total_orders === 1).sort((a, b) => b.total_spent - a.total_spent)

  const recClients = recorrentes.length || Math.round(uniqueClients * 0.68)
  const newClients = novos.length       || Math.round(uniqueClients * 0.32)
  const totalCli   = Math.max(uniqueClients, recClients + newClients, 1)

  // Produtos top 5
  const topProducts = [...data].sort((a, b) => b.total - a.total).slice(0, 5)
  const maxProd = topProducts[0]?.total || 1

  // Categorias
  const catMap: Record<string, number> = {}
  data.forEach(it => { catMap[it.category] = (catMap[it.category] || 0) + it.total })
  const totalAll = Object.values(catMap).reduce((s, v) => s + v, 0)
  const cats = Object.entries(catMap).sort(([, a], [, b]) => b - a)
    .map(([name, val]) => ({ name, val, pct: Math.round(val / totalAll * 100) }))

  const itemsPerOrder = totalOrders > 0 ? (totalItems / totalOrders).toFixed(1) : '0'

  const pctM1 = meta1 > 0 ? Math.min(Math.round(sold / meta1 * 100), 100) : 0
  const pctM2 = meta2 > 0 ? Math.min(Math.round(sold / meta2 * 100), 100) : 0
  const pctM3 = meta3 > 0 ? Math.min(Math.round(sold / meta3 * 100), 100) : 0

  const CAT_COLORS = ['#2563eb', '#10b981', '#f5a742', '#f43f5e', '#8b5cf6', '#06b6d4']

  const segmentData = expandedSegment === 'recorrentes' ? recorrentes : novos
  const segmentColor = expandedSegment === 'recorrentes' ? '#10b981' : '#f5a742'
  const segmentLabel = expandedSegment === 'recorrentes' ? 'Recorrentes' : 'Novos'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Row 1 — KPIs rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Ticket Médio',   value: fmtCurrency(avgTicket),          color: color },
          { label: 'Itens por Nota', value: itemsPerOrder,                    color: 'var(--accent)' },
          { label: 'Clientes Ativos',value: uniqueClients.toLocaleString(),   color: '#10b981' },
          { label: 'Notas Emitidas', value: totalOrders.toLocaleString(),     color: 'var(--muted)' },
          { label: 'Total de Itens', value: totalItems.toLocaleString(),      color: 'var(--muted)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{k.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Row 2 — Infográfico de Metas + Share de Clientes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Metas */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Infográfico de Metas</div>
          {[
            { label: '1ª Meta', target: meta1, bonus: bonus1, pct: pctM1, col: '#c8f542', reached: lvl >= 1 },
            { label: '2ª Meta', target: meta2, bonus: bonus2, pct: pctM2, col: '#42d9f5', reached: lvl >= 2 },
            { label: '3ª Meta', target: meta3, bonus: bonus3, pct: pctM3, col: '#f5a742', reached: lvl >= 3 },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: m.reached ? m.col : 'var(--text)' }}>
                  {m.reached ? '✓ ' : ''}{m.label}
                </span>
                <span style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
                  {m.target > 0 ? `${fmtCurrency(m.target)} • +R$${m.bonus}` : 'Não configurada'}
                </span>
              </div>
              <div style={{ position: 'relative', height: '8px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%', width: `${m.pct}%`,
                  background: m.reached ? `linear-gradient(90deg, ${m.col}99, ${m.col})` : `linear-gradient(90deg, ${m.col}44, ${m.col}66)`,
                  borderRadius: '4px', transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: m.reached ? m.col : 'var(--muted)', marginTop: '3px' }}>
                {m.pct}%
              </div>
            </div>
          ))}
        </div>

        {/* Share de Clientes */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Share de Clientes</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '90px', height: '90px' }}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface2)" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4"
                  strokeDasharray={`${Math.round(recClients / totalCli * 88)} 88`} strokeLinecap="round" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f5a742" strokeWidth="4"
                  strokeDasharray={`${Math.round(newClients / totalCli * 88)} 88`}
                  strokeDashoffset={`-${Math.round(recClients / totalCli * 88)}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{uniqueClients}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {[
                { key: 'recorrentes' as const, label: 'Recorrentes', value: recClients, pct: Math.round(recClients / totalCli * 100), col: '#10b981' },
                { key: 'novos'       as const, label: 'Novos',       value: newClients, pct: Math.round(newClients / totalCli * 100), col: '#f5a742' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.75rem', color: s.col, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.col }} />
                      {s.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>
                        {s.value} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({s.pct}%)</span>
                      </span>
                      {/* Botão expandir */}
                      <button
                        onClick={() => setExpandedSegment(expandedSegment === s.key ? null : s.key)}
                        style={{
                          background: expandedSegment === s.key ? s.col : 'var(--surface2)',
                          color: expandedSegment === s.key ? '#fff' : s.col,
                          border: `1px solid ${s.col}55`,
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.6rem',
                          fontFamily: 'DM Mono, monospace',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {expandedSegment === s.key ? 'FECHAR' : 'VER TOP'}
                      </button>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'var(--surface2)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: s.col, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequência */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Compras/cliente</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{uniqueClients > 0 ? (totalOrders / uniqueClients).toFixed(1) : '0'}x</div>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Valor/cliente</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{uniqueClients > 0 ? fmtCurrency(sold / uniqueClients) : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel expandível de clientes */}
      {expandedSegment && (
        <div style={{
          background: 'var(--surface)', border: `1px solid ${segmentColor}44`,
          borderRadius: '12px', overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Header do painel */}
          <div style={{
            background: `${segmentColor}11`, borderBottom: `1px solid ${segmentColor}33`,
            padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: segmentColor }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Melhores Clientes — <span style={{ color: segmentColor }}>{segmentLabel}</span>
              </span>
              <span style={{
                background: `${segmentColor}22`, color: segmentColor,
                padding: '2px 8px', borderRadius: '10px',
                fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', fontWeight: 700,
              }}>
                {segmentData.length} clientes
              </span>
            </div>
            <button
              onClick={() => setExpandedSegment(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          {/* Tabela */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Cliente', 'Total Comprado', 'Visitas', 'Ticket Médio', 'Última Compra'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                      fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase',
                      letterSpacing: '0.05em', textAlign: h === '#' || h === 'Cliente' ? 'left' : 'right',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentData.slice(0, 10).map((c, i) => (
                  <tr key={c.client_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text)' }}>{c.client_name}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: segmentColor }}>
                      {fmtCurrency(c.total_spent)}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
                      {c.visit_days}x
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--text)' }}>
                      {fmtCurrency(c.avg_ticket)}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: c.days_since_last <= 7 ? '#10b981' : c.days_since_last <= 14 ? '#f5a742' : 'var(--muted)' }}>
                      {c.last_purchase}
                      <span style={{ fontSize: '0.62rem', color: 'var(--muted)', marginLeft: '4px' }}>
                        ({c.days_since_last}d atrás)
                      </span>
                    </td>
                  </tr>
                ))}
                {segmentData.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
                      Nenhum cliente {segmentLabel.toLowerCase()} encontrado neste período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 3 — Top Produtos + Categorias */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>

        {/* Top Produtos */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Top Produtos por Faturamento</div>
          {topProducts.map((p, i) => (
            <div key={p.product_name} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', minWidth: '16px' }}>#{i + 1}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.product_name}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{p.qty} un.</span>
                  <span style={{ fontSize: '0.82rem', fontFamily: 'DM Mono, monospace', fontWeight: 700, color }}>{fmtCurrency(p.total)}</span>
                </div>
              </div>
              <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(p.total / maxProd * 100)}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Categorias */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Mix por Categoria</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cats.map((c, i) => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: CAT_COLORS[i % CAT_COLORS.length] }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: CAT_COLORS[i % CAT_COLORS.length], fontWeight: 700 }}>{c.pct}%</span>
                </div>
                <div style={{ height: '5px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.pct}%`, background: CAT_COLORS[i % CAT_COLORS.length], borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {items && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', background: 'var(--surface2)', borderRadius: '8px' }}>
          Nenhum item vendido registrado neste período.
        </div>
      )}
    </div>
  )
}
