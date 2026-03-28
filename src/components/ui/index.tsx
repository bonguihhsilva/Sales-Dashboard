'use client'

import { fmtK, STORE_COLORS, STORE_LABELS } from '@/lib/utils'

// ── KPI Card ──────────────────────────────────────────────────────────────
interface KpiProps {
  label: string
  value: string
  sub?: string
  color?: string
}

export function KpiCard({ label, value, sub, color }: KpiProps) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '1rem 1.25rem',
    }}>
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

// ── Store Pill ────────────────────────────────────────────────────────────
export function StorePill({ store }: { store: string }) {
  const col = STORE_COLORS[store] || 'var(--muted)'
  const label = STORE_LABELS[store] || store
  return (
    <span style={{
      fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', padding: '2px 7px',
      borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap',
      background: col + '22', color: col,
    }}>
      {label}
    </span>
  )
}

// ── Progress Bar (see ProgressBar.tsx) ────────────────────────────────────
export { ProgressBar } from './ProgressBar'

// ── Bonus Badge ───────────────────────────────────────────────────────────
export function BonusBadge({ level, amount }: { level: number; amount: number }) {
  const configs = [
    { bg: 'rgba(107,111,122,0.15)', color: 'var(--muted)' },
    { bg: 'rgba(200,245,66,0.12)',  color: 'var(--meta1)' },
    { bg: 'rgba(66,217,245,0.12)', color: 'var(--meta2)' },
    { bg: 'rgba(245,167,66,0.12)', color: 'var(--meta3)' },
  ]
  const { bg, color } = configs[level]
  return (
    <span style={{
      fontFamily: 'DM Mono, monospace', fontSize: '0.63rem', padding: '2px 8px',
      borderRadius: '4px', whiteSpace: 'nowrap', background: bg, color,
    }}>
      {level > 0 ? `+$${amount}` : '—'}
    </span>
  )
}

// ── Section Title ─────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', marginTop: '1.5rem',
    }}>
      {children}
    </div>
  )
}

// ── Logout Button ─────────────────────────────────────────────────────────
export function LogoutButton() {
  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
        color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
        padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--text)' }}
      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--muted)' }}
    >
      Sair
    </button>
  )
}
