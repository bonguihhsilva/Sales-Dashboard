'use client'

import { useState, useTransition } from 'react'
import { fmtCurrency } from '@/lib/utils'
import { STORE_COLORS, STORE_LABELS } from '@/lib/utils'

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
}

export default function ComissaoClient({ vendorRows, periodId, role }: Props) {
  const [rows, setRows] = useState(vendorRows)
  const [isPending, startTransition] = useTransition()
  const [calcError, setCalcError] = useState<string | null>(null)

  const hasCalculated = rows.some(r => r.comissao !== null)
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

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <KpiCard label="Total Comissão" value={fmtCurrency(totalPreview)} sub={`${rows.length} vendedores`} color="var(--accent)" />
        <KpiCard label="Total Aprovado" value={fmtCurrency(totalAprovado)} sub={`${rows.filter(r => r.comissao?.aprovado).length} aprovados`} color="#22c55e" />
        <KpiCard label="Aguardando" value={String(pendentes)} sub={hasCalculated ? 'pendentes de aprovação' : 'período não calculado'} color="var(--muted)" />
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
          {hasCalculated ? '✓ Comissões calculadas' : '— Período ainda não calculado'}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {calcError && (
            <span style={{ fontSize: '0.7rem', color: '#ef4444', fontFamily: 'DM Mono, monospace' }}>
              {calcError}
            </span>
          )}
          {canApprove && (
            <button
              onClick={handleCalcular}
              disabled={isPending}
              style={{
                background: 'var(--accent)', color: '#0e0f11', border: 'none', borderRadius: '6px',
                padding: '8px 16px', fontWeight: 700, fontSize: '0.78rem', cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.6 : 1, fontFamily: 'DM Mono, monospace',
              }}
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
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem' }}>
                    Sem dados para o período selecionado
                  </td>
                </tr>
              )}
              {rows.map((row, i) => {
                const storeColor = STORE_COLORS[row.store] || 'var(--muted)'
                const storeLabel = STORE_LABELS[row.store] || row.store
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
                        <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>—</span>
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.55rem', fontWeight: 800, lineHeight: 1, color: color || 'var(--text)' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>
          {sub}
        </div>
      )}
    </div>
  )
}
