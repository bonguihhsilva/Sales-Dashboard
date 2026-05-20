interface ProgressRingProps {
  value: number       // 0..100+
  size?: number       // px
  color?: string      // CSS color override
  label?: string
}

export function ProgressRing({ value, size = 64, color, label }: ProgressRingProps) {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  const resolvedColor = color
    ?? (value >= 100 ? 'hsl(var(--accent))' : value >= 70 ? 'rgb(var(--paje1))' : 'hsl(var(--muted-foreground))')

  return (
    <div
      className="relative inline-flex items-center justify-center motion-reduce:[&_circle]:transition-none"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progresso'}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={resolvedColor} strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
        />
      </svg>
      <span className="absolute font-mono text-[12px] text-foreground">
        {Math.round(clamped)}%
      </span>
    </div>
  )
}
