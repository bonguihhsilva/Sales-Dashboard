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
  const mc     = META_COLORS[metaLevel]
  const scale  = meta3
  const barW   = Math.min(sold / scale * 100, 100).toFixed(1)
  const m1pct  = (meta1 / scale * 100).toFixed(1)
  const m2pct  = (meta2 / scale * 100).toFixed(1)
  const m3pct  = Math.min(meta3 / scale * 100, 99).toFixed(1)

  return (
    <div style={{ width: '100%', minWidth: '160px' }}>
      {/* Bar track */}
      <div style={{ position: 'relative', height: '8px', background: 'var(--surface2)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${barW}%`, height: '100%', background: mc, borderRadius: '6px' }} />
        {/* Marker lines inside bar */}
        <div style={{ position: 'absolute', top: 0, left: `${m1pct}%`, width: '1.5px', height: '100%', background: 'rgba(255,255,255,0.25)' }} />
        <div style={{ position: 'absolute', top: 0, left: `${m2pct}%`, width: '1.5px', height: '100%', background: 'rgba(255,255,255,0.25)' }} />
        <div style={{ position: 'absolute', top: 0, left: `${m3pct}%`, width: '1.5px', height: '100%', background: 'rgba(255,255,255,0.25)' }} />
      </div>
      {/* Labels below bar — fixed width per slot so they always align */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span style={{ fontSize: '0.56rem', fontFamily: 'DM Mono, monospace', color: metaLevel >= 1 ? 'var(--meta1)' : 'var(--muted)', textAlign: 'center', flex: 1 }}>
          {fmtK(meta1)}
        </span>
        <span style={{ fontSize: '0.56rem', fontFamily: 'DM Mono, monospace', color: metaLevel >= 2 ? 'var(--meta2)' : 'var(--muted)', textAlign: 'center', flex: 1 }}>
          {fmtK(meta2)}
        </span>
        <span style={{ fontSize: '0.56rem', fontFamily: 'DM Mono, monospace', color: metaLevel >= 3 ? 'var(--meta3)' : 'var(--muted)', textAlign: 'center', flex: 1 }}>
          {fmtK(meta3)}
        </span>
      </div>
    </div>
  )
}
