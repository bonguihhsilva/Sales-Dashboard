'use client'

import { useState } from 'react'
import type { Period } from '@/types'

export default function ExportButton({ periods }: { periods: Period[] }) {
  const [loading, setLoading] = useState(false)
  const [periodId, setPeriodId] = useState(periods[0]?.id?.toString() ?? '1')

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/relatorio-excel?period=${periodId}`)
      const data = await res.json()
      if (data.error) { alert(data.error); return }

      // Generate Excel using ExcelJS-style CSV then convert, or use SheetJS via dynamic import
      // We'll build it as a proper Excel file using the XLSX library loaded dynamically
      const XLSX = await import('xlsx')

      const periodLabel = data.period
      const rows = data.vendors as {
        nome: string; loja: string; total_vendido: number; comissao_pct: number;
        comissao: number; meta_atingida: string; bonus: number; total_ganhos: number
      }[]

      // Build worksheet data
      const wsData = [
        [`Relatório de Comissões — ${periodLabel}`],
        [],
        ['#', 'Vendedor', 'Loja', 'Total Vendido ($)', 'Comissão % Vendas', 'Comissão ($)', 'Meta Atingida', 'Bônus ($)', 'Total Ganhos ($)'],
        ...rows.map((r, i) => [
          i + 1,
          r.nome,
          r.loja,
          r.total_vendido,
          r.comissao_pct,
          r.comissao,
          r.meta_atingida,
          r.bonus,
          r.total_ganhos,
        ]),
        [],
        ['', 'TOTAL', '', `=SUM(D4:D${rows.length + 3})`, '', `=SUM(F4:F${rows.length + 3})`, '', `=SUM(H4:H${rows.length + 3})`, `=SUM(I4:I${rows.length + 3})`],
      ]

      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Column widths
      ws['!cols'] = [
        { wch: 4 },  // #
        { wch: 24 }, // Vendedor
        { wch: 12 }, // Loja
        { wch: 18 }, // Total Vendido
        { wch: 14 }, // Comissão %
        { wch: 16 }, // Comissão $
        { wch: 18 }, // Meta Atingida
        { wch: 12 }, // Bônus
        { wch: 16 }, // Total Ganhos
      ]

      // Merge title row
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]

      // Number formats
      const fmtCurrency = '$#,##0.00'
      const fmtPct      = '0.0%'
      const dataStart   = 3 // row index 3 = Excel row 4
      const dataEnd     = dataStart + rows.length - 1

      for (let r = dataStart; r <= dataEnd; r++) {
        const colsToFmt: [string, string][] = [
          [XLSX.utils.encode_cell({ r, c: 3 }), fmtCurrency],
          [XLSX.utils.encode_cell({ r, c: 4 }), fmtPct],
          [XLSX.utils.encode_cell({ r, c: 5 }), fmtCurrency],
          [XLSX.utils.encode_cell({ r, c: 7 }), fmtCurrency],
          [XLSX.utils.encode_cell({ r, c: 8 }), fmtCurrency],
        ]
        for (const [cell, fmt] of colsToFmt) {
          if (ws[cell]) ws[cell].z = fmt
        }
      }

      // Format totals row
      const totalRow = dataEnd + 2
      for (const c of [3, 5, 7, 8]) {
        const cell = XLSX.utils.encode_cell({ r: totalRow, c })
        if (ws[cell]) ws[cell].z = fmtCurrency
      }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Comissões')

      // Download
      const filename = `relatorio-comissoes-${periodLabel.toLowerCase().replace(/\s/g, '-')}.xlsx`
      XLSX.writeFile(wb, filename)
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
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: '6px', color: loading ? 'var(--muted)' : 'var(--text)',
          fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
          padding: '5px 12px', cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '5px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = loading ? 'var(--muted)' : 'var(--text)' }}
      >
        {loading ? '⏳ Gerando...' : '📊 Excel'}
      </button>
    </div>
  )
}
