'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { VendorEvolution } from '@/types'
import { fmtK, fmtCurrency } from '@/lib/utils'

const META_COLORS = ['#6b6f7a', '#c8f542', '#42d9f5', '#f5a742']

export default function EvolutionChart({ data, vendorName }: { data: VendorEvolution[]; vendorName: string }) {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', padding: '3rem' }}>
        Ainda não há histórico disponível para este vendedor.
      </div>
    )
  }

  const chartData = data.map(d => ({
    name: d.period_label.replace(' 20', ' \''),
    total: Number(d.total_sold),
    meta1: Number(d.meta1),
    meta3: Number(d.meta3),
    metaLevel: d.meta_level,
    clients: Number(d.unique_clients),
    bonus: Number(d.bonus_earned),
  }))

  return (
    <div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Evolução de Vendas — {vendorName}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#6b6f7a', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fill: '#6b6f7a', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#16181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}
              labelStyle={{ color: '#f0f0ee', fontWeight: 700 }}
              formatter={(value: number, name: string) => {
                if (name === 'total') return [fmtCurrency(value), 'Total vendido']
                return [value, name]
              }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={META_COLORS[entry.metaLevel]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Período', 'Total Vendido', '1ª Meta', '3ª Meta', 'Meta', 'Bônus', 'Clientes'].map(h => (
                <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', textAlign: h === 'Período' ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => {
              const lvl = d.meta_level
              const col = META_COLORS[lvl]
              return (
                <tr key={`${d.year}-${d.month}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{d.period_label}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: col }}>{fmtCurrency(Number(d.total_sold))}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{fmtK(Number(d.meta1))}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{fmtK(Number(d.meta3))}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: col + '22', color: col }}>
                      {lvl > 0 ? `${lvl}ª meta` : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: col }}>{Number(d.bonus_earned) > 0 ? `+$${Number(d.bonus_earned)}` : '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{Number(d.unique_clients).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
