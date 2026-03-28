'use client'

import { useState } from 'react'

export default function ChangePassword() {
  const [open, setOpen]       = useState(false)
  const [current, setCurrent] = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirm) { setMsg('As senhas não coincidem.'); return }
    if (newPwd.length < 6)  { setMsg('Senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true); setMsg('')

    const res = await fetch('/api/vendor/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: current, new_password: newPwd }),
    })
    const data = await res.json()

    if (data.error) {
      setMsg(data.error)
    } else {
      setMsg('✓ Senha alterada com sucesso!')
      setCurrent(''); setNewPwd(''); setConfirm('')
      setTimeout(() => { setOpen(false); setMsg('') }, 2000)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
    fontSize: '0.82rem', padding: '9px 12px', outline: 'none', marginBottom: '0.85rem',
  }
  const labelStyle = {
    display: 'block' as const, fontSize: '0.65rem', fontFamily: 'DM Mono, monospace',
    color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '5px',
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setMsg('') }}
        style={{
          background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
          color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
          padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        🔑 Alterar Senha
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Alterar Senha</h2>
            <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Recomendamos usar uma senha forte com letras, números e símbolos.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Senha atual</label>
              <input style={inputStyle} type="password" value={current} onChange={e => setCurrent(e.target.value)} required placeholder="Sua senha atual" />

              <label style={labelStyle}>Nova senha</label>
              <input style={inputStyle} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required placeholder="Mínimo 6 caracteres" />

              <label style={labelStyle}>Confirmar nova senha</label>
              <input style={inputStyle} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repetir nova senha" />

              {msg && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)' : 'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)' : '#f55c42', border: `1px solid ${msg.startsWith('✓') ? 'rgba(200,245,66,0.3)' : 'rgba(245,92,66,0.3)'}` }}>
                  {msg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setOpen(false); setMsg('') }} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Salvando...' : 'Alterar senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
