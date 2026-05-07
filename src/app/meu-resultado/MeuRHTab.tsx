'use client'

import { useState } from 'react'
import type { HRFreeDay, HRAbsence, HRVacation, HRPermission } from '@/types'

interface Props {
  freeDays: HRFreeDay[]
  absences: HRAbsence[]
  vacations: HRVacation[]
  permissions: HRPermission[]
}

const thStyle = {
  fontFamily: 'DM Mono, monospace',
  fontSize: '0.6rem',
  color: 'var(--muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.07em',
  padding: '6px 8px',
  textAlign: 'left' as const,
}
const tdStyle = {
  padding: '8px',
  fontSize: '0.8rem',
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

export default function MeuRHTab({ freeDays, absences, vacations, permissions }: Props) {
  const [showModal, setShowModal] = useState(false)
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
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
              background: 'var(--accent)',
              color: '#0e0f11',
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
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

      {/* Modal */}
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
