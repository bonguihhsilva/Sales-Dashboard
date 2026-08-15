'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtK, fmtCurrency } from '@/lib/utils'

interface Props {
  data: { label: string; total: number }[]
}

export default function CommissionTrendChart({ data }: Props) {
  if (!data.length) return null

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 mt-3">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
        Evolução — Total Vendido por Período
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: '#6b6f7a', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtK} tick={{ fill: '#6b6f7a', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#16181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}
            labelStyle={{ color: '#f0f0ee', fontWeight: 700 }}
            formatter={(value: number) => [fmtCurrency(value), 'Total vendido']}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#c8f542" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
