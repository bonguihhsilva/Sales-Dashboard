import { fmtK } from '@/lib/utils'

interface ProgressBarProps {
  sold: number
  meta1: number
  meta2: number
  meta3: number
  metaLevel: number
}

// Segment colors for each zone
const SEG_COLORS = [
  'var(--muted)',   // zone 0: 0 → meta1
  'var(--meta1)',   // zone 1: meta1 → meta2
  'var(--meta2)',   // zone 2: meta2 → meta3
  'var(--meta3)',   // zone 3: meta3 → beyond
]

export function ProgressBar({ sold, meta1, meta2, meta3, metaLevel }: ProgressBarProps) {
  // Scale: meta3 × 1.2 so zone 3 (beyond) is visible
  const scale = meta3 * 1.2

  // Segment boundaries as % of total scale
  const s0 = 0
  const s1 = (meta1 / scale) * 100   // end of zone 0 / start zone 1
  const s2 = (meta2 / scale) * 100   // end of zone 1 / start zone 2
  const s3 = (meta3 / scale) * 100   // end of zone 2 / start zone 3 (≈83.3%)
  const s4 = 100                      // end of zone 3

  // How far sold fills each segment
  const soldPct = Math.min((sold / scale) * 100, 100)

  function segFill(start: number, end: number): number {
    if (soldPct <= start) return 0
    if (soldPct >= end)   return 100
    return ((soldPct - start) / (end - start)) * 100
  }

  const GAP = 2 // px gap between segments

  const segments = [
    { start: s0, end: s1, color: SEG_COLORS[0], fill: segFill(s0, s1) },
    { start: s1, end: s2, color: SEG_COLORS[1], fill: segFill(s1, s2) },
    { start: s2, end: s3, color: SEG_COLORS[2], fill: segFill(s2, s3) },
    { start: s3, end: s4, color: SEG_COLORS[3], fill: segFill(s3, s4) },
  ]

  const labels = [
    { pct: s1, label: fmtK(meta1), color: metaLevel >= 1 ? 'var(--meta1)' : 'var(--muted)' },
    { pct: s2, label: fmtK(meta2), color: metaLevel >= 2 ? 'var(--meta2)' : 'var(--muted)' },
    { pct: s3, label: fmtK(meta3), color: metaLevel >= 3 ? 'var(--meta3)' : 'var(--muted)' },
  ]

  return (
    <div style={{ width: '100%', minWidth: '160px' }}>
      {/* 4-segment track */}
      <div style={{ display: 'flex', height: '8px', gap: `${GAP}px`, borderRadius: '6px', overflow: 'visible' }}>
        {segments.map((seg, i) => {
          const width = seg.end - seg.start
          return (
            <div
              key={i}
              style={{
                flex: `0 0 calc(${width}% - ${GAP * 3 / 4}px)`,
                height: '100%',
                borderRadius: '4px',
                background: 'var(--surface2)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Filled portion of this segment */}
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${seg.fill}%`, height: '100%',
                background: seg.color,
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          )
        })}
      </div>

      {/* Labels at each meta boundary — positioned absolutely relative to full bar */}
      <div style={{ position: 'relative', height: '16px', marginTop: '3px' }}>
        {labels.map(({ pct, label, color }) => (
          <span
            key={label}
            style={{
              position: 'absolute',
              left: `${pct}%`,
              transform: 'translateX(-50%)',
              fontSize: '0.56rem',
              fontFamily: 'DM Mono, monospace',
              color,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
