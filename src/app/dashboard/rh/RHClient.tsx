'use client'

import { useState } from 'react'
import type { HRFreeDay, HRAbsence, HRVacation, HRPermission } from '@/types'

interface Props {
  profiles: Array<{ id: string; name: string; role: string; active: boolean }>
  freeDays: HRFreeDay[]
  absences: HRAbsence[]
  vacations: HRVacation[]
  permissions: HRPermission[]
}

// ── Badge helpers ──────────────────────────────────────────────────────────────

const badge = (color: string, bg: string) => ({
  padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
  background: bg, color, fontFamily: 'DM Mono, monospace',
  display: 'inline-block',
} as const)

const BADGES = {
  available:       badge('#166534', '#dcfce7'),
  approved:        badge('#166534', '#dcfce7'),
  expired:         badge('#991b1b', '#fef2f2'),
  denied:          badge('#991b1b', '#fef2f2'),
  used:            badge('#374151', '#f3f4f6'),
  deducted:        badge('#374151', '#f3f4f6'),
  pending:         badge('#854d0e', '#fef9c3'),
  deduct_free_day: badge('#0369a1', '#e0f2fe'),
  justified:       badge('#854d0e', '#fef9c3'),
  no_balance:      badge('#991b1b', '#fef2f2'),
  none:            badge('var(--muted)', 'var(--surface2)' as string),
} as const

// ── Shared UI primitives ───────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: 'var(--surface2)',
  border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)',
  fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.68rem', fontFamily: 'DM Mono, monospace',
  color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '4px',
}

const TH_STYLE: React.CSSProperties = {
  fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 10px',
  textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)',
}

const TD_STYLE: React.CSSProperties = {
  padding: '9px 10px', fontSize: '0.8rem', borderBottom: '1px solid var(--border)',
}

const BTN_PRIMARY: React.CSSProperties = {
  background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px',
  padding: '8px 16px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
  fontSize: '0.8rem', cursor: 'pointer',
}

const BTN_GHOST: React.CSSProperties = {
  background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)',
  borderRadius: '6px', padding: '7px 14px', fontFamily: 'Syne, sans-serif',
  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
}

const MODAL_OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}

const MODAL_BOX: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '420px',
}

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

export default function RHClient({ profiles, freeDays, absences, vacations, permissions }: Props) {
  const [activeTab, setActiveTab] = useState<string>('dia-livre')

  const tabs = [
    { key: 'dia-livre',  label: 'Dia Livre' },
    { key: 'faltas',     label: 'Faltas' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Section 1 — Atribuir dia livre */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'Syne, sans-serif' }}>
          Atribuir dia livre
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={LABEL_STYLE}>Motivo (opcional)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: folga compensatória"
            style={INPUT_STYLE}
          />
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...TH_STYLE, width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === profiles.length && profiles.length > 0}
                    onChange={e => toggleAll(e.target.checked)}
                  />
                </th>
                <th style={TH_STYLE}>Funcionário</th>
                <th style={TH_STYLE}>Cargo</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id}>
                  <td style={TD_STYLE}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleOne(p.id)}
                    />
                  </td>
                  <td style={TD_STYLE}>{p.name}</td>
                  <td style={TD_STYLE}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
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
          style={{ ...BTN_PRIMARY, opacity: selectedIds.length === 0 ? 0.5 : 1 }}
        >
          {loading ? 'Atribuindo…' : `Atribuir dia livre aos selecionados (${selectedIds.length})`}
        </button>
      </div>

      {/* Section 2 — Status atual */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'Syne, sans-serif' }}>
          Status atual — dias livres
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH_STYLE}>Funcionário</th>
                <th style={{ ...TH_STYLE, textAlign: 'center' }}>Dias livres ativos</th>
                <th style={TH_STYLE}>Próximo vencimento</th>
                <th style={TH_STYLE}>Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(s => {
                const statusBadge = s.available > 0
                  ? <span style={BADGES.available}>Disponível</span>
                  : freeDays.some(fd => fd.user_id === s.user_id)
                    ? <span style={BADGES.expired}>Vencido</span>
                    : <span style={BADGES.none}>Sem dia livre</span>

                return (
                  <tr key={s.user_id}>
                    <td style={TD_STYLE}>{s.user_name}</td>
                    <td style={{ ...TD_STYLE, textAlign: 'center', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>
                      {s.available}
                    </td>
                    <td style={{ ...TD_STYLE, fontFamily: 'DM Mono, monospace' }}>
                      {s.next_expiry ? fmtDate(s.next_expiry) : '—'}
                    </td>
                    <td style={TD_STYLE}>{statusBadge}</td>
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Faltas</h2>
        <button onClick={() => setShowModal(true)} style={BTN_PRIMARY}>+ Registrar falta</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH_STYLE}>Data</th>
              <th style={TH_STYLE}>Funcionário</th>
              <th style={TH_STYLE}>Tipo</th>
              <th style={TH_STYLE}>Obs.</th>
            </tr>
          </thead>
          <tbody>
            {absences.map(a => (
              <tr key={a.id}>
                <td style={{ ...TD_STYLE, fontFamily: 'DM Mono, monospace' }}>{fmtDate(a.absence_date)}</td>
                <td style={TD_STYLE}>{a.user_name}</td>
                <td style={TD_STYLE}>
                  <span style={BADGES[a.type] ?? BADGES.none}>{ABSENCE_LABELS[a.type] ?? a.type}</span>
                </td>
                <td style={{ ...TD_STYLE, color: 'var(--muted)', fontSize: '0.75rem' }}>{a.notes ?? '—'}</td>
              </tr>
            ))}
            {absences.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...TD_STYLE, textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                  Nenhuma falta registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={MODAL_OVERLAY} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={MODAL_BOX}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Syne, sans-serif' }}>
              Registrar falta
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={LABEL_STYLE}>Funcionário</label>
                <select value={userId} onChange={e => { setUserId(e.target.value); setFreeDayId('') }} required style={INPUT_STYLE}>
                  <option value="">Selecionar…</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>Data da falta</label>
                <input type="date" value={absenceDate} onChange={e => setAbsenceDate(e.target.value)} required style={INPUT_STYLE} />
              </div>
              <div>
                <label style={LABEL_STYLE}>Tipo</label>
                <select
                  value={absenceType}
                  onChange={e => setAbsenceType(e.target.value as typeof absenceType)}
                  style={INPUT_STYLE}
                >
                  <option value="justified">Justificada</option>
                  <option value="deduct_free_day">Descontar dia livre</option>
                  <option value="no_balance">Falta sem saldo</option>
                </select>
              </div>
              {absenceType === 'deduct_free_day' && (
                <div>
                  <label style={LABEL_STYLE}>Dia livre a descontar</label>
                  <select value={freeDayId} onChange={e => setFreeDayId(e.target.value)} style={INPUT_STYLE}>
                    <option value="">Automático (mais antigo)</option>
                    {availableFreeDays.map(fd => (
                      <option key={fd.id} value={fd.id}>
                        Emitido {fmtDate(fd.issued_at)} — vence {fmtDate(fd.expires_at)}
                        {fd.notes ? ` — ${fd.notes}` : ''}
                      </option>
                    ))}
                  </select>
                  {availableFreeDays.length === 0 && userId && (
                    <p style={{ fontSize: '0.72rem', color: '#991b1b', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>
                      Nenhum dia livre disponível para este funcionário
                    </p>
                  )}
                </div>
              )}
              <div>
                <label style={LABEL_STYLE}>Observações</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...INPUT_STYLE, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={BTN_GHOST}>Cancelar</button>
                <button type="submit" disabled={loading} style={BTN_PRIMARY}>
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Férias</h2>
        <button onClick={() => setShowModal(true)} style={BTN_PRIMARY}>+ Novo registro</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH_STYLE}>Funcionário</th>
              <th style={TH_STYLE}>Início</th>
              <th style={TH_STYLE}>Fim</th>
              <th style={{ ...TH_STYLE, textAlign: 'center' }}>Duração</th>
              <th style={TH_STYLE}>Obs.</th>
            </tr>
          </thead>
          <tbody>
            {vacations.map(v => (
              <tr key={v.id}>
                <td style={TD_STYLE}>{v.user_name}</td>
                <td style={{ ...TD_STYLE, fontFamily: 'DM Mono, monospace' }}>{fmtDate(v.start_date)}</td>
                <td style={{ ...TD_STYLE, fontFamily: 'DM Mono, monospace' }}>{fmtDate(v.end_date)}</td>
                <td style={{ ...TD_STYLE, textAlign: 'center', fontFamily: 'DM Mono, monospace' }}>
                  {daysBetween(v.start_date, v.end_date)} dias
                </td>
                <td style={{ ...TD_STYLE, color: 'var(--muted)', fontSize: '0.75rem' }}>{v.notes ?? '—'}</td>
              </tr>
            ))}
            {vacations.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...TD_STYLE, textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                  Nenhum registro de férias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={MODAL_OVERLAY} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={MODAL_BOX}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Syne, sans-serif' }}>
              Novo registro de férias
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={LABEL_STYLE}>Funcionário</label>
                <select value={userId} onChange={e => setUserId(e.target.value)} required style={INPUT_STYLE}>
                  <option value="">Selecionar…</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>Data de início</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={INPUT_STYLE} />
              </div>
              <div>
                <label style={LABEL_STYLE}>Data de fim</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={INPUT_STYLE} />
              </div>
              {startDate && endDate && endDate >= startDate && (
                <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
                  Duração: {daysBetween(startDate, endDate)} dias
                </p>
              )}
              <div>
                <label style={LABEL_STYLE}>Observações</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...INPUT_STYLE, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={BTN_GHOST}>Cancelar</button>
                <button type="submit" disabled={loading} style={BTN_PRIMARY}>
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Permissões</h2>
        <button onClick={() => setShowModal(true)} style={BTN_PRIMARY}>+ Registrar pelo RH</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH_STYLE}>Funcionário</th>
              <th style={TH_STYLE}>Tipo</th>
              <th style={TH_STYLE}>Data solicitada</th>
              <th style={TH_STYLE}>Status</th>
              <th style={TH_STYLE}>Obs.</th>
              <th style={TH_STYLE}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map(p => (
              <tr key={p.id}>
                <td style={TD_STYLE}>{p.user_name}</td>
                <td style={TD_STYLE}>
                  {PERMISSION_TYPE_LABELS[p.type] ?? p.type}
                </td>
                <td style={{ ...TD_STYLE, fontFamily: 'DM Mono, monospace' }}>{fmtDate(p.requested_date)}</td>
                <td style={TD_STYLE}>
                  <span style={BADGES[p.status] ?? BADGES.none}>
                    {PERMISSION_STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </td>
                <td style={{ ...TD_STYLE, color: 'var(--muted)', fontSize: '0.75rem' }}>{p.notes ?? '—'}</td>
                <td style={TD_STYLE}>
                  {p.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleReview(p.id, 'approved')}
                        disabled={actionLoading === p.id + 'approved'}
                        style={{
                          padding: '3px 10px', borderRadius: '5px', fontSize: '0.72rem', cursor: 'pointer',
                          fontFamily: 'Syne, sans-serif', fontWeight: 600, border: 'none',
                          background: '#dcfce7', color: '#166534',
                          opacity: actionLoading ? 0.6 : 1,
                        }}
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReview(p.id, 'denied')}
                        disabled={actionLoading === p.id + 'denied'}
                        style={{
                          padding: '3px 10px', borderRadius: '5px', fontSize: '0.72rem', cursor: 'pointer',
                          fontFamily: 'Syne, sans-serif', fontWeight: 600, border: 'none',
                          background: '#fef2f2', color: '#991b1b',
                          opacity: actionLoading ? 0.6 : 1,
                        }}
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
                <td colSpan={6} style={{ ...TD_STYLE, textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                  Nenhuma permissão registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={MODAL_OVERLAY} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={MODAL_BOX}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Syne, sans-serif' }}>
              Registrar permissão pelo RH
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={LABEL_STYLE}>Funcionário</label>
                <select value={userId} onChange={e => setUserId(e.target.value)} required style={INPUT_STYLE}>
                  <option value="">Selecionar…</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>Tipo</label>
                <select value={permType} onChange={e => setPermType(e.target.value as typeof permType)} style={INPUT_STYLE}>
                  <option value="appointment">Consulta médica</option>
                  <option value="medical_certificate">Atestado médico</option>
                  <option value="document">Gestão de documentos</option>
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>Data</label>
                <input type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)} required style={INPUT_STYLE} />
              </div>
              <div>
                <label style={LABEL_STYLE}>Observações</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...INPUT_STYLE, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={BTN_GHOST}>Cancelar</button>
                <button type="submit" disabled={loading} style={BTN_PRIMARY}>
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
