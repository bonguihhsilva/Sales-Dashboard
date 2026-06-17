'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type ExportFormat = 'csv' | 'xlsx' | 'pdf'

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'Relatório CSV',
  xlsx: 'Relatório XLSX',
  pdf: 'Relatório PDF',
}

export default function ExportButton({ activePeriod }: { activePeriod?: number }) {
  const [loading, setLoading]               = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')

  async function handleExport() {
    if (!activePeriod) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/relatorio-excel?period=${activePeriod}&format=${selectedFormat}`)

      if (selectedFormat === 'xlsx' || selectedFormat === 'pdf') {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Falha ao gerar relatório' }))
          toast.error('Falha ao gerar relatório', { description: err.error })
          return
        }
        const blob = await res.blob()
        const ext = selectedFormat
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `comissoes-periodo-${activePeriod}.${ext}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      // CSV — lógica original preservada
      const data = await res.json()
      if (data.error) { toast.error('Falha ao gerar relatório', { description: data.error }); return }

      const { period: periodLabel, vendors } = data as {
        period: string
        vendors: {
          nome: string; loja: string; total_vendido: number
          comissao_pct: number; comissao: number
          meta_atingida: string; bonus: number; total_ganhos: number; status_aprovacao: string
        }[]
      }

      const BOM = '﻿'
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Falha ao gerar relatório', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Seletor de formato segmentado — per UI-SPEC D-10 */}
      <div className="flex rounded-xl overflow-hidden border border-white/5 h-[44px]">
        {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map(f => (
          <button
            key={f}
            onClick={() => setSelectedFormat(f)}
            className={[
              'flex-1 text-xs font-mono font-bold uppercase transition-colors',
              selectedFormat === f
                ? 'neon-border-active bg-surface-container text-primary'
                : 'bg-surface-container-high text-muted-foreground hover:bg-surface-container',
            ].join(' ')}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Botão de download */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-surface-container-high hover:bg-surface-container-highest border border-white/5 rounded-xl text-primary font-mono font-bold text-xs px-4 py-[0.6rem] cursor-pointer whitespace-nowrap transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[44px] w-full justify-center"
      >
        <span className="material-symbols-outlined text-sm">{loading ? 'hourglass_empty' : 'download'}</span>
        {loading ? 'Gerando...' : FORMAT_LABELS[selectedFormat]}
      </button>
    </div>
  )
}
