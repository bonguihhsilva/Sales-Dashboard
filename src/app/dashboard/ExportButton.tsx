'use client'

import { useState, useEffect } from 'react'

interface Period { id: number; label: string }

export default function ExportButton() {
  const [periods, setPeriods]   = useState<Period[]>([])
  const [periodId, setPeriodId] = useState('')
  const [loading, setLoading]   = useState(false)

  // Fetch periods client-side via API (bypasses RLS)
  useEffect(() => {
    fetch('/api/admin/periods')
      .then(r => r.json())
      .then((data: Period[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setPeriods(data)
          setPeriodId(String(data[0].id))
        }
      })
      .catch(console.error)
  }, [])

  async function handleExport() {
    if (!periodId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/relatorio-excel?period=${periodId}`)
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
        ['#','Vendedor','Loja','Total Vendido ($)','Comissão % Vendas','Comissão ($)','Meta Atingida','Bônus ($)','Total Ganhos ($)','Status'].join(SEP),
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

  // Don't render until periods are loaded
  if (periods.length === 0) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <select
        value={periodId}
        onChange={e => setPeriodId(e.target.value)}
        style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
          fontSize: '0.68rem', padding: '5px 8px', outline: 'none', cursor: 'pointer',
        }}
      >
        {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          background: 'rgba(200,245,66,0.12)',
          border: '1px solid var(--accent)',
          borderRadius: '6px',
          color: loading ? 'var(--muted)' : 'var(--accent)',
          fontFamily: 'DM Mono, monospace', fontWeight: 700,
          fontSize: '0.68rem', padding: '5px 12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? '⏳ Gerando...' : '⬇ Relatório CSV'}
      </button>
    </div>
  )
}
