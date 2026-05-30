'use client'

import { useState } from 'react'
import type { HRFreeDay, HRAbsence, HRVacation, HRPermission } from '@/types'
import DelayUploadModal from './DelayUploadModal'

interface Props {
  profiles: Array<{ id: string; name: string; role: string; active: boolean }>
  freeDays: HRFreeDay[]
  absences: HRAbsence[]
  vacations: HRVacation[]
  permissions: HRPermission[]
  delays: any[]
}

// ── Badge helpers ──────────────────────────────────────────────────────────────

const badge = (colorClass: string) => "px-2.5 py-0.5 rounded-full text-[11px] font-mono inline-block " + colorClass;

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
  none:            badge('bg-surface-container-highest text-muted-foreground'),
};

// ── Shared UI primitives ───────────────────────────────────────────────────────

const INPUT_STYLE = "w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm font-mono text-on-surface focus:outline-none focus:border-primary transition-colors";
const LABEL_STYLE = "block text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 font-bold";
const TH_STYLE = "font-mono text-[0.65rem] uppercase tracking-wider py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap text-left border-b border-white/5";
const TD_STYLE = "py-3 px-4 text-sm border-b border-white/5";
const BTN_PRIMARY = "bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-lg px-4 py-2.5 font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer font-display-lg";
const BTN_GHOST = "bg-transparent hover:bg-white/5 text-muted-foreground border border-white/10 rounded-lg px-4 py-2.5 font-bold text-sm transition-colors cursor-pointer font-display-lg";
const MODAL_OVERLAY = "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4";
const MODAL_BOX = "glass-card border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('T')[0].split('-')
  return `${day}/${m}/${y}`
}

function daysBetween(start: string, end: string) {
  const a = new Date(start)
  const b = new Date(end)
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1
}

const ABSENCE_LABELS: Record<string, string> = {
  deduct_free_day: 'Descontou dia livre',
  justified:       'Justificada',
  no_balance:      'Falta sem saldo',
}

const PERMISSION_TYPE_LABELS: Record<string, string> = {
  medical_certificate: 'Atestado médico',
  appointment:         'Consulta médica',
  document:            'Gestão de documentos',
}

const PERMISSION_STATUS_LABELS: Record<string, string> = {
  pending:  'Pendente',
  approved: 'Aprovada',
  denied:   'Negada',
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════

export default function RHClient({ profiles, freeDays, absences, vacations, permissions, delays }: Props) {
  const [activeTab, setActiveTab] = useState<string>('dia-livre')

  const tabs = [
    { key: 'dia-livre',  label: 'Dia Livre' },
    { key: 'faltas',     label: 'Faltas' },
    { key: 'atrasos',    label: 'Atrasos' },
    { key: 'ferias',     label: 'Férias' },
    { key: 'permissoes', label: 'Permissões' },
  ]

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{
        display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem', overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 20px', borderRadius: '6px 6px 0 0', fontSize: '0.8rem', fontWeight: 600,
              border: '1px solid transparent', borderBottom: 'none', cursor: 'pointer',
              transition: 'all 0.15s', fontFamily: 'Syne, sans-serif',
              background:   activeTab === t.key ? 'var(--surface)' : 'transparent',
              borderColor:  activeTab === t.key ? 'var(--border)'  : 'transparent',
              color:        activeTab === t.key ? 'var(--text)'    : 'var(--muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'dia-livre'  && <DiaLivreTab  profiles={profiles} freeDays={freeDays} />}
      {activeTab === 'faltas'     && <FaltasTab     profiles={profiles} absences={absences} freeDays={freeDays} />}
      {activeTab === 'atrasos'    && <AtrasosTab    profiles={profiles} delays={delays} />}
      {activeTab === 'ferias'     && <FeriasTab     profiles={profiles} vacations={vacations} />}
      {activeTab === 'permissoes' && <PermissoesTab profiles={profiles} permissions={permissions} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Dia Livre
// ══════════════════════════════════════════════════════════════════════════════

function DiaLivreTab({
  profiles,
  freeDays,
}: {
  profiles: Props['profiles']
  freeDays: HRFreeDay[]
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Compute per-user summary
  const summaryMap: Record<string, {
    user_id: string; user_name: string;
    available: number; next_expiry: string | null
  }> = {}

  for (const fd of freeDays) {
    if (!summaryMap[fd.user_id]) {
      summaryMap[fd.user_id] = {
        user_id: fd.user_id,
        user_name: fd.user_name ?? '',
        available: 0,
        next_expiry: null,
      }
    }
    if (fd.status === 'available' && fd.expires_at >= today) {
      summaryMap[fd.user_id].available++
      if (!summaryMap[fd.user_id].next_expiry || fd.expires_at < summaryMap[fd.user_id].next_expiry!) {
        summaryMap[fd.user_id].next_expiry = fd.expires_at
      }
    }
  }

  // Add profiles that have no free days recorded
  for (const p of profiles) {
    if (!summaryMap[p.id]) {
      summaryMap[p.id] = { user_id: p.id, user_name: p.name, available: 0, next_expiry: null }
    } else if (!summaryMap[p.id].user_name) {
      summaryMap[p.id].user_name = p.name
    }
  }

  const summary = Object.values(summaryMap).sort((a, b) => a.user_name.localeCompare(b.user_name))

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? profiles.map(p => p.id) : [])
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleAssign() {
    if (!selectedIds.length) return
    setLoading(true)
    try {
      await fetch('/api/admin/hr/free-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: selectedIds, notes }),
      })
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Section 1 — Atribuir dia livre */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h2 className="text-base font-bold mb-4 font-display-lg">
          Atribuir dia livre
        </h2>

        <div className="mb-4">
          <label className={LABEL_STYLE}>Motivo (opcional)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: folga compensatória"
            className={INPUT_STYLE}
          />
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-surface-container-high/50 border-b border-white/5">
              <tr className="hover:bg-secondary/10 transition-colors">
                <th className={`${TH_STYLE} w-[40px]`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === profiles.length && profiles.length > 0}
                    onChange={e => toggleAll(e.target.checked)}
                  />
                </th>
                <th className={TH_STYLE}>Funcionário</th>
                <th className={TH_STYLE}>Cargo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map(p => (
                <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                  <td className={TD_STYLE}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleOne(p.id)}
                    />
                  </td>
                  <td className={TD_STYLE}>{p.name}</td>
                  <td className={TD_STYLE}>
                    <span className="font-mono text-xs text-muted-foreground">
                      {p.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleAssign}
          disabled={loading || selectedIds.length === 0}
          className={`${BTN_PRIMARY} ${selectedIds.length ? "opacity-50" : ""}`}
        >
          {loading ? 'Atribuindo…' : `Atribuir dia livre aos selecionados (${selectedIds.length})`}
        </button>
      </div>

      {/* Section 2 — Status atual */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h2 className="text-base font-bold mb-4 font-display-lg">
          Status atual — dias livres
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-surface-container-high/50 border-b border-white/5">
              <tr className="hover:bg-secondary/10 transition-colors">
                <th className={TH_STYLE}>Funcionário</th>
                <th className={`${TH_STYLE} text-center`}>Dias livres ativos</th>
                <th className={TH_STYLE}>Próximo vencimento</th>
                <th className={TH_STYLE}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summary.map(s => {
                const statusBadge = s.available > 0
                  ? <span className={BADGES.available}>Disponível</span>
                  : freeDays.some(fd => fd.user_id === s.user_id)
                    ? <span className={BADGES.expired}>Vencido</span>
                    : <span className={BADGES.none}>Sem dia livre</span>

                return (
                  <tr key={s.user_id} className="hover:bg-secondary/10 transition-colors">
                    <td className={TD_STYLE}>{s.user_name}</td>
                    <td className={`${TD_STYLE} text-center font-mono font-bold`}>
                      {s.available}
                    </td>
                    <td className={`${TD_STYLE} font-mono`}>
                      {s.next_expiry ? fmtDate(s.next_expiry) : '—'}
                    </td>
                    <td className={TD_STYLE}>{statusBadge}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Faltas
// ══════════════════════════════════════════════════════════════════════════════

function FaltasTab({
  profiles,
  absences,
  freeDays,
}: {
  profiles: Props['profiles']
  absences: HRAbsence[]
  freeDays: HRFreeDay[]
}) {
  const [showModal, setShowModal] = useState(false)
  const [userId, setUserId] = useState('')
  const [absenceDate, setAbsenceDate] = useState('')
  const [absenceType, setAbsenceType] = useState<'deduct_free_day' | 'justified' | 'no_balance'>('justified')
  const [freeDayId, setFreeDayId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const availableFreeDays = freeDays.filter(
    fd => fd.user_id === userId && fd.status === 'available' && fd.expires_at >= today
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/admin/hr/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          absence_date: absenceDate,
          type: absenceType,
          free_day_id: absenceType === 'deduct_free_day' && freeDayId ? freeDayId : null,
          notes,
        }),
      })
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Faltas</h2>
        <button onClick={() => setShowModal(true)} className={BTN_PRIMARY}>+ Registrar falta</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-surface-container-high/50 border-b border-white/5">
            <tr className="hover:bg-secondary/10 transition-colors">
              <th className={TH_STYLE}>Data</th>
              <th className={TH_STYLE}>Funcionário</th>
              <th className={TH_STYLE}>Tipo</th>
              <th className={TH_STYLE}>Obs.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {absences.map(a => (
              <tr key={a.id} className="hover:bg-secondary/10 transition-colors">
                <td className={`${TD_STYLE} font-mono`}>{fmtDate(a.absence_date)}</td>
                <td className={TD_STYLE}>{a.user_name}</td>
                <td className={TD_STYLE}>
                  <span className={BADGES[a.type] ?? BADGES.none}>{ABSENCE_LABELS[a.type] ?? a.type}</span>
                </td>
                <td className={`${TD_STYLE} text-muted-foreground text-xs`}>{a.notes ?? '—'}</td>
              </tr>
            ))}
            {absences.length === 0 && (
              <tr>
                <td colSpan={4} className={`${TD_STYLE} text-center text-muted-foreground p-8`}>
                  Nenhuma falta registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={MODAL_OVERLAY} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className={MODAL_BOX}>
            <h3 className="text-base font-bold mb-5 font-display-lg">
              Registrar falta
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={LABEL_STYLE}>Funcionário</label>
                <select value={userId} onChange={e => { setUserId(e.target.value); setFreeDayId('') }} required className={INPUT_STYLE}>
                  <option value="">Selecionar…</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_STYLE}>Data da falta</label>
                <input type="date" value={absenceDate} onChange={e => setAbsenceDate(e.target.value)} required className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Tipo</label>
                <select
                  value={absenceType}
                  onChange={e => setAbsenceType(e.target.value as typeof absenceType)}
                  className={INPUT_STYLE}
                >
                  <option value="justified">Justificada</option>
                  <option value="deduct_free_day">Descontar dia livre</option>
                  <option value="no_balance">Falta sem saldo</option>
                </select>
              </div>
              {absenceType === 'deduct_free_day' && (
                <div>
                  <label className={LABEL_STYLE}>Dia livre a descontar</label>
                  <select value={freeDayId} onChange={e => setFreeDayId(e.target.value)} className={INPUT_STYLE}>
                    <option value="">Automático (mais antigo)</option>
                    {availableFreeDays.map(fd => (
                      <option key={fd.id} value={fd.id}>
                        Emitido {fmtDate(fd.issued_at)} — vence {fmtDate(fd.expires_at)}
                        {fd.notes ? ` — ${fd.notes}` : ''}
                      </option>
                    ))}
                  </select>
                  {availableFreeDays.length === 0 && userId && (
                    <p className="text-xs text-red-500 mt-1 font-mono">
                      Nenhum dia livre disponível para este funcionário
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className={LABEL_STYLE}>Observações</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`${INPUT_STYLE} resize-y`} />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className={BTN_GHOST}>Cancelar</button>
                <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                  {loading ? 'Salvando…' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Férias
// ══════════════════════════════════════════════════════════════════════════════

function FeriasTab({
  profiles,
  vacations,
}: {
  profiles: Props['profiles']
  vacations: HRVacation[]
}) {
  const [showModal, setShowModal] = useState(false)
  const [userId, setUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/admin/hr/vacations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, start_date: startDate, end_date: endDate, notes }),
      })
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Férias</h2>
        <button onClick={() => setShowModal(true)} className={BTN_PRIMARY}>+ Novo registro</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-surface-container-high/50 border-b border-white/5">
            <tr className="hover:bg-secondary/10 transition-colors">
              <th className={TH_STYLE}>Funcionário</th>
              <th className={TH_STYLE}>Início</th>
              <th className={TH_STYLE}>Fim</th>
              <th className={`${TH_STYLE} text-center`}>Duração</th>
              <th className={TH_STYLE}>Obs.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vacations.map(v => (
              <tr key={v.id} className="hover:bg-secondary/10 transition-colors">
                <td className={TD_STYLE}>{v.user_name}</td>
                <td className={`${TD_STYLE} font-mono`}>{fmtDate(v.start_date)}</td>
                <td className={`${TD_STYLE} font-mono`}>{fmtDate(v.end_date)}</td>
                <td className={`${TD_STYLE} text-center font-mono`}>
                  {daysBetween(v.start_date, v.end_date)} dias
                </td>
                <td className={`${TD_STYLE} text-muted-foreground text-xs`}>{v.notes ?? '—'}</td>
              </tr>
            ))}
            {vacations.length === 0 && (
              <tr>
                <td colSpan={5} className={`${TD_STYLE} text-center text-muted-foreground p-8`}>
                  Nenhum registro de férias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={MODAL_OVERLAY} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className={MODAL_BOX}>
            <h3 className="text-base font-bold mb-5 font-display-lg">
              Novo registro de férias
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={LABEL_STYLE}>Funcionário</label>
                <select value={userId} onChange={e => setUserId(e.target.value)} required className={INPUT_STYLE}>
                  <option value="">Selecionar…</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_STYLE}>Data de início</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Data de fim</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className={INPUT_STYLE} />
              </div>
              {startDate && endDate && endDate >= startDate && (
                <p className="text-xs text-muted-foreground font-mono">
                  Duração: {daysBetween(startDate, endDate)} dias
                </p>
              )}
              <div>
                <label className={LABEL_STYLE}>Observações</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`${INPUT_STYLE} resize-y`} />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className={BTN_GHOST}>Cancelar</button>
                <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                  {loading ? 'Salvando…' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Permissões
// ══════════════════════════════════════════════════════════════════════════════

function PermissoesTab({
  profiles,
  permissions,
}: {
  profiles: Props['profiles']
  permissions: HRPermission[]
}) {
  const [showModal, setShowModal] = useState(false)
  const [userId, setUserId] = useState('')
  const [permType, setPermType] = useState<'medical_certificate' | 'appointment' | 'document'>('appointment')
  const [requestedDate, setRequestedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/admin/hr/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, type: permType, requested_date: requestedDate, notes }),
      })
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(id: string, status: 'approved' | 'denied') {
    setActionLoading(id + status)
    try {
      await fetch(`/api/admin/hr/permissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      window.location.reload()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Permissões</h2>
        <button onClick={() => setShowModal(true)} className={BTN_PRIMARY}>+ Registrar pelo RH</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-surface-container-high/50 border-b border-white/5">
            <tr className="hover:bg-secondary/10 transition-colors">
              <th className={TH_STYLE}>Funcionário</th>
              <th className={TH_STYLE}>Tipo</th>
              <th className={TH_STYLE}>Data solicitada</th>
              <th className={TH_STYLE}>Status</th>
              <th className={TH_STYLE}>Obs.</th>
              <th className={TH_STYLE}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {permissions.map(p => (
              <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                <td className={TD_STYLE}>{p.user_name}</td>
                <td className={TD_STYLE}>
                  {PERMISSION_TYPE_LABELS[p.type] ?? p.type}
                </td>
                <td className={`${TD_STYLE} font-mono`}>{fmtDate(p.requested_date)}</td>
                <td className={TD_STYLE}>
                  <span className={BADGES[p.status] ?? BADGES.none}>
                    {PERMISSION_STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </td>
                <td className={`${TD_STYLE} text-muted-foreground text-xs`}>{p.notes ?? '—'}</td>
                <td className={TD_STYLE}>
                  {p.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(p.id, 'approved')}
                        disabled={actionLoading === p.id + 'approved'}
                        className={`px-3 py-1.5 rounded-md text-xs cursor-pointer font-display-lg font-bold border-none bg-green-500/20 text-green-500 transition-colors hover:bg-green-500/30 ${actionLoading ? "opacity-60" : ""}`}
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReview(p.id, 'denied')}
                        disabled={actionLoading === p.id + 'denied'}
                        className={`px-3 py-1.5 rounded-md text-xs cursor-pointer font-display-lg font-bold border-none bg-red-500/20 text-red-500 transition-colors hover:bg-red-500/30 ${actionLoading ? "opacity-60" : ""}`}
                      >
                        Negar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={6} className={`${TD_STYLE} text-center text-muted-foreground p-8`}>
                  Nenhuma permissão registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={MODAL_OVERLAY} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className={MODAL_BOX}>
            <h3 className="text-base font-bold mb-5 font-display-lg">
              Registrar permissão pelo RH
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={LABEL_STYLE}>Funcionário</label>
                <select value={userId} onChange={e => setUserId(e.target.value)} required className={INPUT_STYLE}>
                  <option value="">Selecionar…</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_STYLE}>Tipo</label>
                <select value={permType} onChange={e => setPermType(e.target.value as typeof permType)} className={INPUT_STYLE}>
                  <option value="appointment">Consulta médica</option>
                  <option value="medical_certificate">Atestado médico</option>
                  <option value="document">Gestão de documentos</option>
                </select>
              </div>
              <div>
                <label className={LABEL_STYLE}>Data</label>
                <input type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)} required className={INPUT_STYLE} />
              </div>
              <div>
                <label className={LABEL_STYLE}>Observações</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`${INPUT_STYLE} resize-y`} />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className={BTN_GHOST}>Cancelar</button>
                <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                  {loading ? 'Salvando…' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab: Atrasos
// ══════════════════════════════════════════════════════════════════════════════

function AtrasosTab({
  profiles,
  delays,
}: {
  profiles: Props['profiles']
  delays: any[]
}) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleReview(id: string, status: 'approved' | 'rejected') {
    setActionLoading(id + status)
    try {
      await fetch(`/api/admin/hr/delays/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      window.location.reload()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Controle de Atrasos</h2>
        <button onClick={() => setShowUploadModal(true)} className={BTN_PRIMARY}>Importar Biometria</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-surface-container-high/50 border-b border-white/5">
            <tr className="hover:bg-secondary/10 transition-colors">
              <th className={TH_STYLE}>Data</th>
              <th className={TH_STYLE}>Funcionário</th>
              <th className={`${TH_STYLE} text-center`}>Minutos</th>
              <th className={TH_STYLE}>Status</th>
              <th className={TH_STYLE}>Justificativa do Vendedor</th>
              <th className={TH_STYLE}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {delays.map(d => (
              <tr key={d.id} className="hover:bg-secondary/10 transition-colors">
                <td className={`${TD_STYLE} font-mono`}>{fmtDate(d.delay_date)}</td>
                <td className={TD_STYLE}>{d.user_name}</td>
                <td className={`${TD_STYLE} text-center font-bold text-red-500`}>{d.delay_minutes}m</td>
                <td className={TD_STYLE}>
                  <span className={BADGES[d.status as keyof typeof BADGES] ?? BADGES.none}>
                    {d.status === 'pending' ? 'Pendente' : d.status === 'justified' ? 'Justificado' : d.status === 'approved' ? 'Abonado' : 'Descontar'}
                  </span>
                </td>
                <td className={`${TD_STYLE} text-muted-foreground text-xs max-w-[200px] truncate`}>{d.justification ?? '—'}</td>
                <td className={TD_STYLE}>
                  {d.status === 'justified' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(d.id, 'approved')}
                        disabled={actionLoading === d.id + 'approved'}
                        className={`px-3 py-1.5 rounded-md text-xs cursor-pointer font-display-lg font-bold border-none bg-green-500/20 text-green-500 transition-colors hover:bg-green-500/30 ${actionLoading ? "opacity-60" : ""}`}
                      >
                        Abonar
                      </button>
                      <button
                        onClick={() => handleReview(d.id, 'rejected')}
                        disabled={actionLoading === d.id + 'rejected'}
                        className={`px-3 py-1.5 rounded-md text-xs cursor-pointer font-display-lg font-bold border-none bg-red-500/20 text-red-500 transition-colors hover:bg-red-500/30 ${actionLoading ? "opacity-60" : ""}`}
                      >
                        Rejeitar (Descontar)
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {delays.length === 0 && (
              <tr>
                <td colSpan={6} className={`${TD_STYLE} text-center text-muted-foreground p-8`}>
                  Nenhum atraso registrado. Importe um relatório biométrico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DelayUploadModal 
        open={showUploadModal} 
        onOpenChange={setShowUploadModal} 
        onSuccess={() => window.location.reload()} 
        profiles={profiles}
      />
    </div>
  )
}
