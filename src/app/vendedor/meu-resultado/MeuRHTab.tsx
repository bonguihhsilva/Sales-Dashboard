'use client'

import { useState } from 'react'
import type { HRFreeDay, HRAbsence, HRVacation, HRPermission } from '@/types'

interface Props {
  freeDays: HRFreeDay[]
  absences: HRAbsence[]
  vacations: HRVacation[]
  permissions: HRPermission[]
  delays?: any[]
}

const thStyle = {
  padding: '12px 16px',
  fontWeight: 600,
  color: 'var(--muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  fontSize: '0.7rem',
  textAlign: 'left' as const,
}
const tdStyle = {
  padding: '12px 16px',
  color: 'var(--text)',
  fontSize: '0.85rem',
  fontFamily: 'DM Mono, monospace',
  borderBottom: '1px solid var(--border)',
}
const inputStyle = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text)',
  fontFamily: 'DM Mono, monospace',
  fontSize: '0.8rem',
  padding: '6px 8px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
}
const labelStyle = {
  display: 'block' as const,
  fontSize: '0.62rem',
  fontFamily: 'DM Mono, monospace',
  color: 'var(--muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: '4px',
}

function badge(color: string, bg: string, text: string) {
  return (
    <span
      style={{
        background: bg,
        color,
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontFamily: 'DM Mono, monospace',
      }}
    >
      {text}
    </span>
  )
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export default function MeuRHTab({ freeDays, absences, vacations, permissions, delays = [] }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [showDelayModal, setShowDelayModal] = useState(false)
  const [selectedDelay, setSelectedDelay] = useState<any>(null)
  const [delayJustification, setDelayJustification] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: 'medical_certificate',
    requested_date: '',
    notes: '',
  })

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
      return badge('#166534', '#dcfce7', 'Disponível')
    if (day.status === 'expired' || (day.status === 'available' && day.expires_at < today))
      return badge('#991b1b', '#fef2f2', 'Vencido')
    if (day.status === 'used')
      return badge('var(--muted)', 'var(--surface2)', `Utilizado — ${day.used_at ? fmtDate(day.used_at) : ''}`)
    if (day.status === 'deducted')
      return badge('var(--muted)', 'var(--surface2)', `Descontado — ${day.used_at ? fmtDate(day.used_at) : ''}`)
    return null
  }

  function absenceBadge(type: HRAbsence['type']) {
    if (type === 'deduct_free_day') return badge('#1e40af', '#dbeafe', 'Descontou dia livre')
    if (type === 'justified') return badge('#92400e', '#fef3c7', 'Justificada')
    return badge('#991b1b', '#fef2f2', 'Falta sem saldo')
  }

  function permissionStatusBadge(status: HRPermission['status']) {
    if (status === 'pending') return badge('#92400e', '#fef3c7', 'Pendente')
    if (status === 'approved') return badge('#166534', '#dcfce7', 'Aprovada')
    return badge('#991b1b', '#fef2f2', 'Negada')
  }

  function permissionTypeLabel(type: HRPermission['type']) {
    if (type === 'medical_certificate') return 'Atestado médico'
    if (type === 'appointment') return 'Consulta médica'
    return 'Gestão de documentos'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/vendor/hr/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Falha ao enviar')
      setShowModal(false)
      setForm({ type: 'medical_certificate', requested_date: '', notes: '' })
      window.location.reload()
    } catch {
      alert('Erro ao enviar solicitação. Tente novamente.')
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
      alert('Erro ao enviar justificativa. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Section 1 — Dias Livres */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🗓 Dias Livres
        </h3>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: '#dcfce7',
              borderRadius: '10px',
              padding: '12px 20px',
              minWidth: '110px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', fontFamily: 'DM Mono, monospace' }}>
              {available}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#166534', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>
              DISPONÍVEL
            </div>
          </div>
          <div
            style={{
              background: '#fef2f2',
              borderRadius: '10px',
              padding: '12px 20px',
              minWidth: '110px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b', fontFamily: 'DM Mono, monospace' }}>
              {expired}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#991b1b', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>
              VENCIDO
            </div>
          </div>
          <div
            style={{
              background: 'var(--surface2)',
              borderRadius: '10px',
              padding: '12px 20px',
              minWidth: '110px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
              {used}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>
              UTILIZADOS
            </div>
          </div>
        </div>

        {freeDays.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
            Nenhum dia livre registrado.
          </p>
        ) : (
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Emissão', 'Vencimento', 'Motivo', 'Status'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {freeDays.map((d) => (
                  <tr key={d.id}>
                    <td style={tdStyle}>{fmtDate(d.issued_at)}</td>
                    <td style={tdStyle}>{fmtDate(d.expires_at)}</td>
                    <td style={tdStyle}>{d.notes ?? '—'}</td>
                    <td style={tdStyle}>{freeDayBadge(d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2 — Férias */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🌴 Férias
        </h3>

        {vacations.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
            Nenhum período de férias registrado.
          </p>
        ) : (
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Início', 'Fim', 'Duração', 'Obs.'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vacations.map((v) => {
                  const duration =
                    Math.round(
                      (new Date(v.end_date).getTime() - new Date(v.start_date).getTime()) /
                        86400000
                    ) + 1
                  return (
                    <tr key={v.id}>
                      <td style={tdStyle}>{fmtDate(v.start_date)}</td>
                      <td style={tdStyle}>{fmtDate(v.end_date)}</td>
                      <td style={tdStyle}>{duration} dias</td>
                      <td style={tdStyle}>{v.notes ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3 — Faltas */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📋 Faltas
        </h3>

        {absences.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
            Nenhuma falta registrada.
          </p>
        ) : (
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Data', 'Tipo', 'Obs.'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {absences.map((a) => (
                  <tr key={a.id}>
                    <td style={tdStyle}>{fmtDate(a.absence_date)}</td>
                    <td style={tdStyle}>{absenceBadge(a.type)}</td>
                    <td style={tdStyle}>{a.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4 — Permissões */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              fontFamily: 'Syne, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0,
            }}
          >
            📝 Permissões
          </h3>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontFamily: 'DM Mono, monospace',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Solicitar permissão
          </button>
        </div>

        {permissions.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
            Nenhuma permissão solicitada.
          </p>
        ) : (
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Tipo', 'Data solicitada', 'Status', 'Obs.'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p.id}>
                    <td style={tdStyle}>{permissionTypeLabel(p.type)}</td>
                    <td style={tdStyle}>{fmtDate(p.requested_date)}</td>
                    <td style={tdStyle}>{permissionStatusBadge(p.status)}</td>
                    <td style={tdStyle}>{p.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 5 — Atrasos */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ⏱️ Atrasos
        </h3>

        {delays.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
            Nenhum atraso registrado.
          </p>
        ) : (
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Data', 'Minutos', 'Status', 'Ações'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {delays.map((d) => (
                  <tr key={d.id}>
                    <td style={tdStyle}>{fmtDate(d.delay_date)}</td>
                    <td style={{ ...tdStyle, color: 'var(--destructive)', fontWeight: 700 }}>{d.delay_minutes}m</td>
                    <td style={tdStyle}>
                      {d.status === 'pending' ? badge('#92400e', '#fef3c7', 'Pendente de Justificativa') :
                       d.status === 'justified' ? badge('#1e40af', '#dbeafe', 'Aguardando Aprovação') :
                       d.status === 'approved' ? badge('#166534', '#dcfce7', 'Abonado') :
                       badge('#991b1b', '#fef2f2', 'Descontado')}
                    </td>
                    <td style={tdStyle}>
                      {d.status === 'pending' && (
                        <button
                          onClick={() => { setSelectedDelay(d); setShowDelayModal(true); }}
                          style={{
                            background: 'var(--surface2)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.7rem',
                            fontFamily: 'Syne, sans-serif',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '2rem',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'Syne, sans-serif',
                marginBottom: '1.5rem',
                marginTop: 0,
              }}
            >
              Solicitar Permissão
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Tipo</label>
                <select
                  style={inputStyle}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  required
                >
                  <option value="medical_certificate">Atestado médico</option>
                  <option value="appointment">Consulta médica</option>
                  <option value="document">Gestão de documentos</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Data</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={form.requested_date}
                  onChange={(e) => setForm((f) => ({ ...f, requested_date: e.target.value }))}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Observações (opcional)</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Detalhes adicionais..."
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'var(--surface2)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '6px 16px',
                    fontSize: '0.78rem',
                    fontFamily: 'DM Mono, monospace',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 16px',
                    fontSize: '0.78rem',
                    fontFamily: 'DM Mono, monospace',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delay Justification Modal */}
      {showDelayModal && selectedDelay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDelayModal(false) }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '2rem',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'Syne, sans-serif',
                marginBottom: '1rem',
                marginTop: 0,
              }}
            >
              Justificar Atraso
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.5rem', fontFamily: 'DM Mono, monospace' }}>
              Atraso de <strong>{selectedDelay.delay_minutes} minutos</strong> no dia <strong>{fmtDate(selectedDelay.delay_date)}</strong>.
            </p>
            <form onSubmit={handleJustifyDelay}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Sua Justificativa</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
                  value={delayJustification}
                  onChange={(e) => setDelayJustification(e.target.value)}
                  placeholder="Explique o motivo do atraso..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDelayModal(false)}
                  style={{
                    background: 'var(--surface2)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '6px 16px',
                    fontSize: '0.78rem',
                    fontFamily: 'DM Mono, monospace',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'var(--accent)',
                    color: '#0e0f11',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 16px',
                    fontSize: '0.78rem',
                    fontFamily: 'DM Mono, monospace',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
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
