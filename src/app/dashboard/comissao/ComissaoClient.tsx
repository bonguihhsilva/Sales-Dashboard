'use client'

import { useState, useTransition } from 'react'
import { fmtCurrency } from '@/lib/utils'
import type { Store } from '@/types'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

type ComissaoRecord = {
  id: string
  comissao_base: number
  bonus_total: number
  total: number
  aprovado: boolean
  aprovado_por: string | null
}

export type VendorRow = {
  vendor_id: string
  vendor_name: string
  store: string
  total_sold: number
  commission_pct: number
  bonus_earned: number
  total_commission: number
  profile_id: string | null
  comissao: ComissaoRecord | null
}

interface Props {
  vendorRows: VendorRow[]
  periodId: number
  role: string
  stores: Store[]
}

export default function ComissaoClient({ vendorRows, periodId, role, stores }: Props) {
  const [rows, setRows] = useState(vendorRows)
  const [isPending, startTransition] = useTransition()
  const [calcError, setCalcError] = useState<string | null>(null)
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const hasCalculated = rows.some(r => r.comissao !== null)
  const unlinkedCount = rows.filter(r => r.profile_id === null).length
  const totalPreview  = rows.reduce((s, r) => s + r.total_commission, 0)
  const totalAprovado = rows.filter(r => r.comissao?.aprovado).reduce((s, r) => s + r.comissao!.total, 0)
  const pendentes     = rows.filter(r => r.comissao && !r.comissao.aprovado).length

  function handleCalcular() {
    setCalcError(null)
    startTransition(async () => {
      const res = await fetch('/api/admin/calcular-comissao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_id: periodId }),
      })
      const json = await res.json()
      if (!res.ok) { setCalcError(json.error); return }
      window.location.reload()
    })
  }

  async function handleAprovar(comissaoId: string, aprovado: boolean) {
    const res = await fetch(`/api/admin/comissoes/${comissaoId}/aprovar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aprovado }),
    })
    if (!res.ok) return
    setRows(prev => prev.map(r =>
      r.comissao?.id === comissaoId
        ? { ...r, comissao: { ...r.comissao!, aprovado } }
        : r
    ))
  }

  const canApprove = ['adm', 'gerente', 'super_admin'].includes(role)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ids = rows
        .filter(r => r.comissao !== null && !r.comissao.aprovado)
        .map(r => r.comissao!.id)
      setSelectedIds(new Set(ids))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  async function handleAprovarLote() {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const list = Array.from(selectedIds)
      await Promise.all(
        list.map(id =>
          fetch(`/api/admin/comissoes/${id}/aprovar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aprovado: true }),
          })
        )
      )
      
      setRows(prev => prev.map(r =>
        r.comissao && selectedIds.has(r.comissao.id)
          ? { ...r, comissao: { ...r.comissao, aprovado: true } }
          : r
      ))
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Erro na aprovação em lote:', err)
    } finally {
      setBulkLoading(false)
    }
  }

  function handleExportPagamento() {
    const targets = rows.filter(r => {
      if (r.comissao === null) return false
      if (selectedIds.size > 0) return selectedIds.has(r.comissao.id)
      return r.comissao.aprovado
    })

    if (targets.length === 0) {
      toast.warning("Nenhuma comissão aprovada ou selecionada para exportação de pagamento.")
      return
    }

    const data = targets.map(r => ({
      'Vendedor': r.vendor_name,
      'Loja': r.store,
      'Comissão Base': r.comissao!.comissao_base,
      'Bônus': r.comissao!.bonus_total,
      'Total a Pagar': r.comissao!.total,
      'Status': r.comissao!.aprovado ? 'Aprovado' : 'Pendente',
      'Banco': '',
      'Agência': '',
      'Conta Corrente': ''
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pagamentos")

    ws['!cols'] = [
      { wch: 25 }, // Vendedor
      { wch: 15 }, // Loja
      { wch: 15 }, // Comissão Base
      { wch: 10 }, // Bônus
      { wch: 15 }, // Total a Pagar
      { wch: 12 }, // Status
      { wch: 12 }, // Banco
      { wch: 10 }, // Agência
      { wch: 15 }  // Conta Corrente
    ]

    XLSX.writeFile(wb, `pagamento-comissoes-periodo-${periodId}.xlsx`)
  }

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard label="Total Comissão" value={fmtCurrency(totalPreview)} sub={`${rows.length} vendedores`} color="text-primary" />
        <KpiCard label="Total Aprovado" value={fmtCurrency(totalAprovado)} sub={`${rows.filter(r => r.comissao?.aprovado).length} aprovados`} color="text-success" />
        <KpiCard label="Aguardando" value={String(pendentes)} sub={hasCalculated ? 'pendentes de aprovação' : 'período não calculado'} color="text-muted-foreground" />
      </div>

      {/* Aviso: vendedores sem conta vinculada */}
      {unlinkedCount > 0 && (
        <div style={{ background: '#f5a74215', border: '1px solid #f5a74244', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ color: '#f5a742', fontSize: '18px' }}>warning</span>
          <span style={{ fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', color: '#f5a742' }}>
            {unlinkedCount} vendedor{unlinkedCount > 1 ? 'es' : ''} sem conta vinculada — comissões não serão calculadas para eles. Configure o código CEC em <a href="/dashboard/usuarios" style={{ textDecoration: 'underline' }}>Usuários</a>.
          </span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mb-6 bg-surface-container-high/30 p-4 rounded-xl border border-white/5">
        <span className="text-sm font-mono text-muted-foreground flex items-center gap-2">
          {hasCalculated ? <><span className="material-symbols-outlined text-success">check_circle</span> Comissões calculadas</> : <><span className="material-symbols-outlined text-muted-foreground">pending</span> Período ainda não calculado</>}
        </span>
        <div className="flex gap-4 items-center">
          {calcError && (
            <span className="text-sm text-error font-mono font-bold">
              {calcError}
            </span>
          )}
          {selectedIds.size > 0 && canApprove && (
            <button
              onClick={handleAprovarLote}
              disabled={bulkLoading}
              className="bg-success hover:bg-success/90 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm disabled:opacity-50 cursor-pointer"
            >
              {bulkLoading ? 'Aprovando...' : `Aprovar Selecionados (${selectedIds.size})`}
            </button>
          )}
          {hasCalculated && (
            <button
              onClick={handleExportPagamento}
              className="bg-surface-container-highest hover:bg-surface-container-high border border-white/5 text-primary font-bold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer"
            >
              Exportar para Pagamento
            </button>
          )}
          {canApprove && (
            <button
              onClick={handleCalcular}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Calculando...' : hasCalculated ? 'Recalcular' : 'Calcular Período'}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {canApprove && hasCalculated && (
                  <th style={{ padding: '10px 14px', width: '40px', textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      className="rounded border-white/20 text-primary bg-background w-4 h-4 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={
                        rows.filter(r => r.comissao !== null && !r.comissao.aprovado).length > 0 &&
                        selectedIds.size === rows.filter(r => r.comissao !== null && !r.comissao.aprovado).length
                      }
                    />
                  </th>
                )}
                {['Vendedor', 'Loja', 'Vendido', 'Com%', 'Base', 'Bônus', 'Total', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left', fontFamily: 'DM Mono, monospace',
                    fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={canApprove && hasCalculated ? 10 : 9} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem' }}>
                    Sem dados para o período selecionado
                  </td>
                </tr>
              )}
              {rows.map((row, i) => {
                const storeObj   = stores.find(s => s.name === row.store)
                const storeColor = storeObj?.color || 'var(--muted)'
                const storeLabel = storeObj?.name  || row.store
                const comPct     = (row.commission_pct * 100).toFixed(2)
                const base       = row.comissao ? row.comissao.comissao_base : row.total_sold * row.commission_pct
                const bonus      = row.comissao ? row.comissao.bonus_total   : row.bonus_earned
                const total      = row.comissao ? row.comissao.total         : row.total_commission
                const isCalculated = row.comissao !== null

                return (
                  <tr
                    key={row.vendor_id}
                    style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    {canApprove && hasCalculated && (
                      <td style={{ padding: '12px 14px', width: '40px' }}>
                        {isCalculated && !row.comissao!.aprovado ? (
                          <input
                            type="checkbox"
                            className="rounded border-white/20 text-primary bg-background w-4 h-4 cursor-pointer"
                            checked={selectedIds.has(row.comissao!.id)}
                            onChange={(e) => handleSelectOne(row.comissao!.id, e.target.checked)}
                          />
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', paddingLeft: '4px' }}>
                            {isCalculated ? '✓' : '—'}
                          </span>
                        )}
                      </td>
                    )}
                    <td style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {row.vendor_name}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: '0.65rem', fontFamily: 'DM Mono, monospace',
                        padding: '2px 7px', borderRadius: '4px',
                        background: storeColor + '22', color: storeColor,
                      }}>
                        {storeLabel}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>
                      {fmtCurrency(row.total_sold)}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
                      {comPct}%
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap', color: isCalculated ? 'var(--text)' : 'var(--muted)' }}>
                      {fmtCurrency(base)}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap', color: bonus > 0 ? 'var(--meta1)' : 'var(--muted)' }}>
                      {fmtCurrency(bonus)}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'DM Mono, monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {fmtCurrency(total)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {!isCalculated ? (
                        row.profile_id === null ? (
                          <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: '4px', background: '#f5a74222', color: '#f5a742' }}>
                            sem conta
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>—</span>
                        )
                      ) : row.comissao!.aprovado ? (
                        <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: '4px', background: '#22c55e22', color: '#22c55e' }}>
                          aprovado
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: '4px', background: '#f5a74222', color: '#f5a742' }}>
                          pendente
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {isCalculated && canApprove && (
                        row.comissao!.aprovado ? (
                          <button
                            onClick={() => handleAprovar(row.comissao!.id, false)}
                            style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '4px 8px', borderRadius: '4px', background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', cursor: 'pointer' }}
                          >
                            Rejeitar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAprovar(row.comissao!.id, true)}
                            style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '4px 8px', borderRadius: '4px', background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e44', cursor: 'pointer' }}
                          >
                            Aprovar
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!hasCalculated && rows.length > 0 && (
        <p style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '10px' }}>
          Valores acima são uma prévia baseada em vendor_summary. Clique em "Calcular Período" para registrar e habilitar aprovações.
        </p>
      )}
    </div>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-center animate-fade-in bg-surface-container-low/40">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className={`text-3xl font-display-sm font-bold leading-none ${color || 'text-on-surface'}`}>
        {value}
      </div>
      {sub && (
        <div className="text-xs text-muted-foreground mt-2 font-mono">
          {sub}
        </div>
      )}
    </div>
  )
}
