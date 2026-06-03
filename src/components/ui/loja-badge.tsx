import { cn } from '@/lib/utils'

interface LojaBadgeProps {
  loja: string
  color?: string | null
  className?: string
}

export function LojaBadge({ loja, color, className }: LojaBadgeProps) {
  // Cor vem do DB (stores.color) — nunca hardcodar por nome de loja (multi-tenant)
  const c = color || 'var(--muted)'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[12px] uppercase',
        className,
      )}
      style={{ background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {loja}
    </span>
  )
}
