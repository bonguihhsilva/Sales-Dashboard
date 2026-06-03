'use client'

import { fmtK } from '@/lib/utils'

// ── KPI Card ──────────────────────────────────────────────────────────────
interface KpiProps {
  label: string
  value: string
  sub?: string
  className?: string
  valueClassName?: string
  valueColor?: string
}

export function KpiCard({ label, value, sub, className, valueClassName, valueColor }: KpiProps) {
  return (
    <div className={`glass-card rounded-xl p-card-padding flex flex-col gap-stack-sm hover:border-primary/40 transition-colors ${className || ''}`}>
      <div className="font-label-sm text-label-sm text-muted-foreground uppercase tracking-widest mb-1.5">
        {label}
      </div>
      <div className={`font-headline-lg text-3xl font-bold text-on-surface ${valueClassName || ''}`} style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      {sub && (
        <div className="text-[0.68rem] text-on-surface-variant mt-2 font-mono">
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Store Pill ────────────────────────────────────────────────────────────
export function StorePill({ store, label, colorClass }: { store: string; label?: string; colorClass?: string }) {
  const col = colorClass || 'text-muted-foreground bg-muted'
  const displayLabel = label || store
  return (
    <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded font-medium whitespace-nowrap ${col}`}>
      {displayLabel}
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

const META_BG_COLORS = ['bg-muted', 'bg-meta1', 'bg-meta2', 'bg-meta3']

export function ProgressBar({ sold, meta1, meta2, meta3, metaLevel }: ProgressBarProps) {
  const scale = meta3 || 1 // prevent div by zero
  const barW  = Math.min((sold / scale) * 100, 100).toFixed(1)
  const m1pct = ((meta1 / scale) * 100).toFixed(1)
  const m2pct = ((meta2 / scale) * 100).toFixed(1)
  const m3pct = Math.min((meta3 / scale) * 100, 99).toFixed(1)
  const mcBg  = META_BG_COLORS[metaLevel] || 'bg-muted'

  return (
    <div>
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${mcBg} transition-all duration-500`} style={{ width: `${barW}%` }} />
      </div>
      {/* Marker lines */}
      <div className="relative h-6 mt-1.5">
        {[
          { pct: m1pct, label: `1ª ${fmtK(meta1)}`, colorClass: metaLevel >= 1 ? 'bg-meta1 text-meta1' : 'bg-border text-muted-foreground' },
          { pct: m2pct, label: `2ª ${fmtK(meta2)}`, colorClass: metaLevel >= 2 ? 'bg-meta2 text-meta2' : 'bg-border text-muted-foreground' },
          { pct: m3pct, label: `3ª ${fmtK(meta3)}`, colorClass: metaLevel >= 3 ? 'bg-meta3 text-meta3' : 'bg-border text-muted-foreground' },
        ].map(({ pct, label, colorClass }, idx) => {
          const isBg = colorClass.split(' ')[0]
          const isText = colorClass.split(' ')[1]
          return (
            <div key={`${pct}-${idx}`} className="absolute text-center" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
              <div className={`w-px h-1.5 mx-auto ${isBg}`} />
              <div className={`text-[0.56rem] font-mono whitespace-nowrap mt-[1px] ${isText}`}>
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Bonus Badge ───────────────────────────────────────────────────────────
export function BonusBadge({ level, amount }: { level: number; amount: number }) {
  const configs = [
    'bg-muted/30 text-muted-foreground',
    'bg-meta1/15 text-meta1',
    'bg-meta2/15 text-meta2',
    'bg-meta3/15 text-meta3',
  ]
  const cls = configs[level] || configs[0]
  return (
    <span className={`font-mono text-[0.65rem] px-2 py-1 rounded whitespace-nowrap font-medium ${cls}`}>
      {level > 0 ? `+$${amount}` : '—'}
    </span>
  )
}

// ── Section Title ─────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 mt-8 font-semibold">
      {children}
    </div>
  )
}

// ── GDS v2 base components (barrel re-exports) ────────────────────────────
export { StatCard } from './stat-card'
export { DataTable, type Column } from './data-table'
export { PeriodSelector, type Period as PeriodOption } from './period-selector'
export { LojaBadge } from './loja-badge'
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
      className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg font-label-sm text-label-sm transition-colors w-full"
    >
      <span className="material-symbols-outlined">logout</span>
      <span>Sair</span>
    </button>
  )
}
