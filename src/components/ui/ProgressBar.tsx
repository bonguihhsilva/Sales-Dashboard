import { fmtK } from '@/lib/utils'

const META_COLORS = ['var(--muted)', 'var(--meta1)', 'var(--meta2)', 'var(--meta3)']

interface ProgressBarProps {
  sold: number
  meta1: number
  meta2: number
  meta3: number
  metaLevel: number
}

export function ProgressBar({ sold, meta1, meta2, meta3, metaLevel }: ProgressBarProps) {
  const mc = META_COLORS[metaLevel]

  // Scale: always use meta3 * 1.2 as the max so there's always space beyond the 3rd marker.
  // This means: the bar never overflows past the track, markers always sit at their
  // correct proportional positions, and "beyond meta3" is visually shown within the bar.
  const scale = meta3 * 1.2

  const barW  = Math.min((sold  / scale) * 100, 100)
  const m1pct = (meta1 / scale) * 100
  const m2pct = (meta2 / scale) * 100
  const m3pct = (meta3 / scale) * 100  // ≈ 83.3% of track width

  return (
    <div style={{ width: '100%', minWidth: '160px' }}>
      {/* Bar track */}
      <div style={{ position: 'relative', height: '8px', background: 'var(--surface2)', borderRadius: '6px', overflow: 'hidden' }}>
        {/* Filled bar */}
        <div style={{ width: `${barW}%`, height: '100%', background: mc, borderRadius: '6px', transition: 'width 0.3s ease' }} />
        {/* Marker lines at each meta position */}
        <div style={{ position: 'absolute', top: 0, left: `${m1pct}%`, width: '2px', height: '100%', background: 'rgba(255,255,255,0.3)' }} />
        <div style={{ position: 'absolute', top: 0, left: `${m2pct}%`, width: '2px', height: '100%', background: 'rgba(255,255,255,0.3)' }} />
        <div style={{ position: 'absolute', top: 0, left: `${m3pct}%`, width: '2px', height: '100%', background: 'rgba(255,255,255,0.5)' }} />
      </div>

      {/* Labels aligned to marker positions */}
      <div style={{ position: 'relative', height: '16px', marginTop: '2px' }}>
        {[
          { pct: m1pct, label: fmtK(meta1), color: metaLevel >= 1 ? 'var(--meta1)' : 'var(--muted)' },
          { pct: m2pct, label: fmtK(meta2), color: metaLevel >= 2 ? 'var(--meta2)' : 'var(--muted)' },
          { pct: m3pct, label: fmtK(meta3), color: metaLevel >= 3 ? 'var(--meta3)' : 'var(--muted)' },
        ].map(({ pct, label, color }) => (
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
