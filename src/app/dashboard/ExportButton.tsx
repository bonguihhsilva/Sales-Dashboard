'use client'

import { useState } from 'react'
import type { Period } from '@/types'

export default function ExportButton({ periods }: { periods: Period[] }) {
  const [loading, setLoading] = useState(false)
  const [periodId, setPeriodId] = useState(periods[0]?.id?.toString() ?? '1')

  async function handleExport() {
    setLoading(true)
    try {
      // Fetch data from API
      const res = await fetch(`/api/admin/relatorio-excel?period=${periodId}`)
      const data = await res.json()
      if (data.error) { alert(data.error); return }

      const { period: periodLabel, vendors } = data as {
        period: string
        vendors: {
          nome: string; loja: string; total_vendido: number
          comissao_pct: number; comissao: number
          meta_atingida: string; bonus: number; total_ganhos: number
        }[]
      }

      // Build CSV with BOM for Excel to recognize UTF-8
      const BOM = '\uFEFF'
      const sep = ';' // semicolon for better Excel PT-BR compatibility

      const headers = [
        '#', 'Vendedor', 'Loja', 'Total Vendido ($)',
        'Comissão % Vendas', 'Comissão ($)',
        'Meta Atingida', 'Bônus ($)', 'Total Ganhos ($)'
      ]

      const fmt = (n: number) => n.toFixed(2).replace('.', ',')
      const fmtPct = (n: number) => (n * 100).toFixed(1).replace('.', ',') + '%'

      const rows = vendors.map((v, i) => [
        i + 1,
        v.nome,
        v.loja,
        fmt(v.total_vendido),
        fmtPct(v.comissao_pct),
        fmt(v.comissao),
        v.meta_atingida,
        fmt(v.bonus),
        fmt(v.total_ganhos),
      ])

      // Totals row
      const totals = [
        'TOTAL', '', '',
        fmt(vendors.reduce((s, v) => s + v.total_vendido, 0)),
        '',
        fmt(vendors.reduce((s, v) => s + v.comissao, 0)),
        '',
        fmt(vendors.reduce((s, v) => s + v.bonus, 0)),
        fmt(vendors.reduce((s, v) => s + v.total_ganhos, 0)),
      ]

      const lines = [
        `Relatório de Comissões — ${periodLabel}`,
        '',
        headers.join(sep),
        ...rows.map(r => r.join(sep)),
        '',
        totals.join(sep),
      ]

      const csv = BOM + lines.join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `relatorio-comissoes-${periodLabel.toLowerCase().replace(/\s+/g, '-')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <select
        value={periodId}
        onChange={e => setPeriodId(e.target.value)}
        style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
          fontSize: '0.68rem', padding: '5px 10px', outline: 'none', cursor: 'pointer',
        }}
      >
        {periods.map(p => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: loading ? 'var(--muted)' : 'var(--text)',
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.68rem',
          padding: '5px 12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '5px',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = loading ? 'var(--muted)' : 'var(--text)' }}
      >
        {loading ? '⏳ Gerando...' : '📊 Relatório'}
      </button>
    </div>
  )
}
