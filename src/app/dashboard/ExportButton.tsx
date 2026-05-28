'use client'

import { useState, useEffect } from 'react'

export default function ExportButton({ activePeriod }: { activePeriod?: number }) {
  const [loading, setLoading]   = useState(false)

  async function handleExport() {
    if (!activePeriod) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/relatorio-excel?period=${activePeriod}`)
      const data = await res.json()
      if (data.error) { alert(data.error); return }

      const { period: periodLabel, vendors } = data as {
        period: string
        vendors: {
          nome: string; loja: string; total_vendido: number
          comissao_pct: number; comissao: number
          meta_atingida: string; bonus: number; total_ganhos: number; status_aprovacao: string
        }[]
      }

      const BOM = '\uFEFF'
      const SEP = ';'
      const fmt    = (n: number) => n.toFixed(2).replace('.', ',')
      const fmtPct = (n: number) => (n * 100).toFixed(1).replace('.', ',') + '%'

      const lines: string[] = [
        `Relatório de Comissões${SEP}${periodLabel}`,
        '',
        ['#','Vendedor','Canal de Venda','Total Vendido ($)','Comissão % Vendas','Comissão ($)','Meta Atingida','Bônus ($)','Total Ganhos ($)','Status'].join(SEP),
        ...vendors.map((v, i) => [
          i + 1, v.nome, v.loja,
          fmt(v.total_vendido), fmtPct(v.comissao_pct), fmt(v.comissao),
          v.meta_atingida, fmt(v.bonus), fmt(v.total_ganhos), v.status_aprovacao
        ].join(SEP)),
        '',
        ['TOTAL','','',
          fmt(vendors.reduce((s,v) => s + v.total_vendido, 0)),'',
          fmt(vendors.reduce((s,v) => s + v.comissao, 0)),'',
          fmt(vendors.reduce((s,v) => s + v.bonus, 0)),
          fmt(vendors.reduce((s,v) => s + v.total_ganhos, 0)),
          ''
        ].join(SEP),
      ]

      const blob = new Blob([BOM + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `comissoes-${periodLabel.toLowerCase().replace(/\s+/g, '-')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: loading ? 'var(--muted)' : 'var(--accent)',
          fontFamily: 'DM Mono, monospace', fontWeight: 700,
          fontSize: '0.68rem', padding: '7px 12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          height: '100%',
        }}
      >
        {loading ? '⏳ Gerando...' : '⬇ Relatório CSV'}
      </button>
    </div>
  )
}
