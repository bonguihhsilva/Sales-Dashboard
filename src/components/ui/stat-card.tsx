import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  delta?: number
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, delta, icon, className }: StatCardProps) {
  const deltaSign = delta === undefined ? null : delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'zero'
  return (
    <div className={cn('min-h-[88px] rounded-xl border border-border bg-card p-4 flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <div className="font-sans text-[28px] font-bold leading-[1.2] text-foreground">
        {value}
      </div>
      {deltaSign && (
        <div className={cn(
          'font-mono text-[12px]',
          deltaSign === 'pos' && 'text-accent',
          deltaSign === 'neg' && 'text-destructive',
          deltaSign === 'zero' && 'text-muted-foreground',
        )}>
          {deltaSign === 'pos' && '▲ '}
          {deltaSign === 'neg' && '▼ '}
          {deltaSign === 'zero' && '— '}
          {delta !== undefined && `${Math.abs(delta).toFixed(1)}%`}
        </div>
      )}
    </div>
  )
}
