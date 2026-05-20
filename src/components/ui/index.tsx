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

// ── Progress Bar ──────────────────────────────────────────────────────────
interface ProgressBarProps {
  sold: number
  meta1: number
  meta2: number
  meta3: number
  metaLevel: number
}

const META_COLORS = ['var(--muted)', 'var(--meta1)', 'var(--meta2)', 'var(--meta3)']

export function ProgressBar({ sold, meta1, meta2, meta3, metaLevel }: ProgressBarProps) {
  const scale = meta3
  const barW  = Math.min(sold / scale * 100, 100).toFixed(1)
  const m1pct = (meta1 / scale * 100).toFixed(1)
  const m2pct = (meta2 / scale * 100).toFixed(1)
  const m3pct = Math.min(meta3 / scale * 100, 99).toFixed(1)
  const mc    = META_COLORS[metaLevel]

  return (
    <div>
      <div style={{ position: 'relative', height: '12px', background: 'var(--surface2)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${barW}%`, height: '100%', borderRadius: '8px', background: mc }} />
      </div>
      {/* Marker lines */}
      <div style={{ position: 'relative', height: '26px', marginTop: '2px' }}>
        {[
          { pct: m1pct, label: `1ª ${fmtK(meta1)}`, color: metaLevel >= 1 ? 'var(--meta1)' : 'var(--muted)' },
          { pct: m2pct, label: `2ª ${fmtK(meta2)}`, color: metaLevel >= 2 ? 'var(--meta2)' : 'var(--muted)' },
          { pct: m3pct, label: `3ª ${fmtK(meta3)}`, color: metaLevel >= 3 ? 'var(--meta3)' : 'var(--muted)' },
        ].map(({ pct, label, color }) => (
          <div key={pct} style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)', textAlign: 'center' }}>
            <div style={{ width: '1px', height: '5px', background: color, margin: '0 auto' }} />
            <div style={{ fontSize: '0.56rem', fontFamily: 'DM Mono, monospace', color, whiteSpace: 'nowrap', marginTop: '1px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

// ── GDS v2 base components (barrel re-exports) ────────────────────────────
export { StatCard } from './stat-card'
export { DataTable, type Column } from './data-table'
export { PeriodSelector, type Period as PeriodOption } from './period-selector'
export { LojaBadge, type LojaName } from './loja-badge'
export { ProgressRing } from './progress-ring'
export { EmptyState } from './empty-state'
export { PageHeader } from './page-header'

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
