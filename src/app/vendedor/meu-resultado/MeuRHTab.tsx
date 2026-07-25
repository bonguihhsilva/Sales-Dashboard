'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { HRFreeDay, HRAbsence, HRVacation, HRPermission } from '@/types'

export interface HRDelay {
  id: string
  delay_date: string
  delay_minutes: number
  status: 'pending' | 'justified' | 'approved' | 'rejected'
}

interface Props {
  freeDays: HRFreeDay[]
  absences: HRAbsence[]
  vacations: HRVacation[]
  permissions: HRPermission[]
  delays?: HRDelay[]
}

// ── Shared UI primitives (mirrors dashboard/rh/RHClient.tsx) ───────────────
const badge = (colorClass: string) => 'px-2.5 py-0.5 rounded-full text-[11px] font-mono inline-block ' + colorClass

const BADGES: Record<string, string> = {
  available:       badge('bg-green-500/20 text-green-500'),
  approved:        badge('bg-green-500/20 text-green-500'),
  expired:         badge('bg-red-500/20 text-red-500'),
  denied:          badge('bg-red-500/20 text-red-500'),
  used:            badge('bg-surface-container-highest text-muted-foreground'),
  deducted:        badge('bg-surface-container-highest text-muted-foreground'),
  pending:         badge('bg-yellow-500/20 text-yellow-500'),
  deduct_free_day: badge('bg-blue-500/20 text-blue-500'),
  justified:       badge('bg-yellow-500/20 text-yellow-500'),
  no_balance:      badge('bg-red-500/20 text-red-500'),
}

const TH_STYLE = 'font-mono text-[0.65rem] uppercase tracking-wider py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap text-left border-b border-white/5'
const TD_STYLE = 'py-3 px-4 text-sm border-b border-white/5'
const INPUT_STYLE = 'w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm font-mono text-on-surface focus:outline-none focus:border-primary transition-colors'
const LABEL_STYLE = 'block text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 font-bold'
const BTN_PRIMARY = 'bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-lg px-3.5 py-2 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer font-display-lg'
const BTN_GHOST = 'bg-transparent hover:bg-white/5 text-muted-foreground border border-white/10 rounded-lg px-4 py-2.5 font-bold text-sm transition-colors cursor-pointer font-display-lg'
const MODAL_OVERLAY = 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'
const MODAL_BOX = 'glass-card border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl'

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: 'success' | 'error' | 'muted' }) {
  const toneClasses = {
    success: 'bg-green-500/10 text-green-500',
    error: 'bg-red-500/10 text-red-500',
    muted: 'bg-surface-container-highest text-muted-foreground',
  }[tone]
  return (
    <div className={`rounded-xl px-5 py-3 min-w-[110px] text-center ${toneClasses}`}>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-[0.65rem] font-mono uppercase tracking-wider mt-0.5 opacity-80">{label}</div>
    </div>
  )
}

function SectionHeader({ icon, title, action }: { icon: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h2 className="text-base font-bold font-display-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-muted-foreground">{icon}</span>
        {title}
      </h2>
      {action}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-mono text-muted-foreground py-1">{children}</p>
}

export default function MeuRHTab({ freeDays, absences, vacations, permissions, delays = [] }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [showDelayModal, setShowDelayModal] = useState(false)
  const [selectedDelay, setSelectedDelay] = useState<HRDelay | null>(null)
  const [delayJustification, setDelayJustification] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: 'medical_certificate',
    requested_date: '',
    end_date: '',
    notes: '',
  })

  function openRequestModal(type: typeof form.type) {
    setForm({ type, requested_date: '', end_date: '', notes: '' })
    setShowModal(true)
  }

  const today = new Date().toISOString().slice(0, 10)

  const available = freeDays.filter(
    (d) => d.status === 'available' && d.expires_at >= today
  ).length
  const expired = freeDays.filter(
    (d) => d.status === 'expired' || (d.status === 'available' && d.expires_at < today)
  ).length
  const used = freeDays.filter(
    (d) => d.status === 'used' || d.status === 'deducted'
  ).length

  function freeDayBadge(day: HRFreeDay) {
    if (day.status === 'available' && day.expires_at >= today)
      return <span className={BADGES.available}>Disponível</span>
    if (day.status === 'expired' || (day.status === 'available' && day.expires_at < today))
      return <span className={BADGES.expired}>Vencido</span>
    if (day.status === 'used')
      return <span className={BADGES.used}>Utilizado — {day.used_at ? fmtDate(day.used_at) : ''}</span>
    if (day.status === 'deducted')
      return <span className={BADGES.deducted}>Descontado — {day.used_at ? fmtDate(day.used_at) : ''}</span>
    return null
  }

  function absenceBadge(type: HRAbsence['type']) {
    if (type === 'deduct_free_day') return <span className={BADGES.deduct_free_day}>Descontou dia livre</span>
    if (type === 'justified') return <span className={BADGES.justified}>Justificada</span>
    return <span className={BADGES.no_balance}>Falta sem saldo</span>
  }

  function permissionStatusBadge(status: HRPermission['status']) {
    if (status === 'pending') return <span className={BADGES.pending}>Pendente</span>
    if (status === 'approved') return <span className={BADGES.approved}>Aprovada</span>
    return <span className={BADGES.denied}>Negada</span>
  }

  function delayBadge(status: HRDelay['status']) {
    if (status === 'pending') return <span className={badge('bg-yellow-500/20 text-yellow-500')}>Pendente de Justificativa</span>
    if (status === 'justified') return <span className={badge('bg-blue-500/20 text-blue-500')}>Aguardando Aprovação</span>
    if (status === 'approved') return <span className={badge('bg-green-500/20 text-green-500')}>Abonado</span>
    return <span className={badge('bg-red-500/20 text-red-500')}>Descontado</span>
  }

  function permissionTypeLabel(type: HRPermission['type']) {
    if (type === 'medical_certificate') return 'Atestado médico'
    if (type === 'appointment') return 'Consulta médica'
    if (type === 'day_off') return 'Dia livre'
    if (type === 'vacation') return 'Férias'
    return 'Gestão de documentos'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/vendor/hr/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          end_date: form.type === 'vacation' ? form.end_date : undefined,
        }),
      })
      if (!res.ok) throw new Error('Falha ao enviar')
      setShowModal(false)
      setForm({ type: 'medical_certificate', requested_date: '', end_date: '', notes: '' })
      window.location.reload()
    } catch {
      toast.error('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJustifyDelay(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDelay) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/vendor/hr/delays/${selectedDelay.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justification: delayJustification, status: 'justified' }),
      })
      if (!res.ok) throw new Error('Falha ao enviar justificativa')
      setShowDelayModal(false)
      setSelectedDelay(null)
      setDelayJustification('')
      window.location.reload()
    } catch {
      toast.error('Erro ao enviar justificativa. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Section 1 — Dias Livres */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <SectionHeader
          icon="event_available"
          title="Dias Livres"
          action={
            <button onClick={() => openRequestModal('day_off')} className={BTN_PRIMARY}>
              + Solicitar dia livre
            </button>
          }
        />

        <div className="flex gap-2.5 flex-wrap mb-4">
          <SummaryTile label="Disponível" value={available} tone="success" />
          <SummaryTile label="Vencido" value={expired} tone="error" />
          <SummaryTile label="Utilizados" value={used} tone="muted" />
        </div>

        {freeDays.length === 0 ? (
          <Empty>Nenhum dia livre registrado.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface-container-high/50 border-b border-white/5">
                <tr>
                  {['Emissão', 'Vencimento', 'Motivo', 'Status'].map((h) => (
                    <th key={h} className={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {freeDays.map((d) => (
                  <tr key={d.id} className="hover:bg-secondary/10 transition-colors">
                    <td className={TD_STYLE}>{fmtDate(d.issued_at)}</td>
                    <td className={TD_STYLE}>{fmtDate(d.expires_at)}</td>
                    <td className={TD_STYLE}>{d.notes ?? '—'}</td>
                    <td className={TD_STYLE}>{freeDayBadge(d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2 — Férias */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <SectionHeader
          icon="beach_access"
          title="Férias"
          action={
            <button onClick={() => openRequestModal('vacation')} className={BTN_PRIMARY}>
              + Solicitar férias
            </button>
          }
        />

        {vacations.length === 0 ? (
          <Empty>Nenhum período de férias registrado.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface-container-high/50 border-b border-white/5">
                <tr>
                  {['Início', 'Fim', 'Duração', 'Obs.'].map((h) => (
                    <th key={h} className={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vacations.map((v) => {
                  const duration =
                    Math.round(
                      (new Date(v.end_date).getTime() - new Date(v.start_date).getTime()) /
                        86400000
                    ) + 1
                  return (
                    <tr key={v.id} className="hover:bg-secondary/10 transition-colors">
                      <td className={TD_STYLE}>{fmtDate(v.start_date)}</td>
                      <td className={TD_STYLE}>{fmtDate(v.end_date)}</td>
                      <td className={TD_STYLE}>{duration} dias</td>
                      <td className={TD_STYLE}>{v.notes ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3 — Faltas */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <SectionHeader icon="event_busy" title="Faltas" />

        {absences.length === 0 ? (
          <Empty>Nenhuma falta registrada.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface-container-high/50 border-b border-white/5">
                <tr>
                  {['Data', 'Tipo', 'Obs.'].map((h) => (
                    <th key={h} className={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {absences.map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/10 transition-colors">
                    <td className={TD_STYLE}>{fmtDate(a.absence_date)}</td>
                    <td className={TD_STYLE}>{absenceBadge(a.type)}</td>
                    <td className={TD_STYLE}>{a.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4 — Permissões */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <SectionHeader
          icon="edit_note"
          title="Permissões"
          action={
            <button onClick={() => setShowModal(true)} className={BTN_PRIMARY}>
              + Solicitar permissão
            </button>
          }
        />

        {permissions.length === 0 ? (
          <Empty>Nenhuma permissão solicitada.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface-container-high/50 border-b border-white/5">
                <tr>
                  {['Tipo', 'Data solicitada', 'Até', 'Status', 'Obs.'].map((h) => (
                    <th key={h} className={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                    <td className={TD_STYLE}>{permissionTypeLabel(p.type)}</td>
                    <td className={TD_STYLE}>{fmtDate(p.requested_date)}</td>
                    <td className={TD_STYLE}>{p.end_date ? fmtDate(p.end_date) : '—'}</td>
                    <td className={TD_STYLE}>{permissionStatusBadge(p.status)}</td>
                    <td className={TD_STYLE}>{p.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 5 — Atrasos */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <SectionHeader icon="schedule" title="Atrasos" />

        {delays.length === 0 ? (
          <Empty>Nenhum atraso registrado.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface-container-high/50 border-b border-white/5">
                <tr>
                  {['Data', 'Minutos', 'Status', 'Ações'].map((h) => (
                    <th key={h} className={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {delays.map((d) => (
                  <tr key={d.id} className="hover:bg-secondary/10 transition-colors">
                    <td className={TD_STYLE}>{fmtDate(d.delay_date)}</td>
                    <td className={`${TD_STYLE} text-destructive font-bold`}>{d.delay_minutes}m</td>
                    <td className={TD_STYLE}>{delayBadge(d.status)}</td>
                    <td className={TD_STYLE}>
                      {d.status === 'pending' && (
                        <button
                          onClick={() => { setSelectedDelay(d); setShowDelayModal(true); }}
                          className="px-3 py-1.5 rounded-md text-xs cursor-pointer font-display-lg font-bold border border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground transition-colors"
                        >
                          Justificar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Permissões */}
      {showModal && (
        <div className={MODAL_OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className={MODAL_BOX}>
            <h3 className="text-base font-bold font-display-lg mb-6">
              {form.type === 'day_off' ? 'Solicitar Dia Livre' : form.type === 'vacation' ? 'Solicitar Férias' : 'Solicitar Permissão'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className={LABEL_STYLE}>Tipo</label>
                <select
                  className={INPUT_STYLE}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  required
                >
                  <option value="medical_certificate">Atestado médico</option>
                  <option value="appointment">Consulta médica</option>
                  <option value="document">Gestão de documentos</option>
                  <option value="day_off">Dia livre</option>
                  <option value="vacation">Férias</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={LABEL_STYLE}>{form.type === 'vacation' ? 'Início' : 'Data'}</label>
                <input
                  type="date"
                  className={INPUT_STYLE}
                  value={form.requested_date}
                  onChange={(e) => setForm((f) => ({ ...f, requested_date: e.target.value }))}
                  required
                />
              </div>

              {form.type === 'vacation' && (
                <div className="mb-4">
                  <label className={LABEL_STYLE}>Até</label>
                  <input
                    type="date"
                    className={INPUT_STYLE}
                    value={form.end_date}
                    min={form.requested_date || undefined}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="mb-6">
                <label className={LABEL_STYLE}>Observações (opcional)</label>
                <textarea
                  className={`${INPUT_STYLE} resize-y min-h-[72px]`}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Detalhes adicionais..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className={BTN_GHOST}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className={BTN_PRIMARY}>
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delay Justification Modal */}
      {showDelayModal && selectedDelay && (
        <div className={MODAL_OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) setShowDelayModal(false) }}>
          <div className={MODAL_BOX}>
            <h3 className="text-base font-bold font-display-lg mb-4">
              Justificar Atraso
            </h3>
            <p className="text-sm font-mono text-muted-foreground mb-6">
              Atraso de <strong>{selectedDelay.delay_minutes} minutos</strong> no dia <strong>{fmtDate(selectedDelay.delay_date)}</strong>.
            </p>
            <form onSubmit={handleJustifyDelay}>
              <div className="mb-6">
                <label className={LABEL_STYLE}>Sua Justificativa</label>
                <textarea
                  className={`${INPUT_STYLE} resize-y min-h-[90px]`}
                  value={delayJustification}
                  onChange={(e) => setDelayJustification(e.target.value)}
                  placeholder="Explique o motivo do atraso..."
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowDelayModal(false)} className={BTN_GHOST}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className={BTN_PRIMARY}>
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
