'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '1rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '2.5rem 2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-block', background: 'var(--accent)',
            borderRadius: '10px', padding: '8px 16px', marginBottom: '1rem'
          }}>
            <span style={{ color: '#0e0f11', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.5px' }}>
              GDS - FRAME
            </span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
            Painel de Vendas
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
            Entre com suas credenciais
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: '8px',
                color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                fontSize: '0.85rem', padding: '10px 12px', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: '8px',
                color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                fontSize: '0.85rem', padding: '10px 12px', outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(245,92,66,0.1)', border: '1px solid rgba(245,92,66,0.3)',
              borderRadius: '8px', padding: '10px 12px', marginBottom: '1rem',
              fontSize: '0.78rem', color: '#f55c42', fontFamily: 'DM Mono, monospace',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: 'var(--accent)', color: '#0e0f11',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem',
              border: 'none', borderRadius: '8px', padding: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
