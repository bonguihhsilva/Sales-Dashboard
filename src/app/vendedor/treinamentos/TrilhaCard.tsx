'use client'

import Link from 'next/link'

const C = {
  deep:        '#141418',
  elevated:    '#1C1C22',
  border:      'rgba(255,255,255,0.06)',
  text:        '#F0F0F3',
  muted:       '#6B6B78',
  gold:        '#C9933A',
  goldBg:      'rgba(201,147,58,0.10)',
  goldBorder:  'rgba(201,147,58,0.25)',
  blue:        '#3B82F6',
  blueBg:      'rgba(59,130,246,0.10)',
  blueBorder:  'rgba(59,130,246,0.25)',
} as const

interface TrilhaCardProps {
  trilha: { id: string; titulo: string; descricao: string | null }
  cor: 'gold' | 'blue'
  progress: { concluidas: number; total: number }
}

export function TrilhaCard({ trilha, cor, progress }: TrilhaCardProps) {
  const accent      = cor === 'gold' ? C.gold   : C.blue
  const accentBg    = cor === 'gold' ? C.goldBg  : C.blueBg
  const accentBorder = cor === 'gold' ? C.goldBorder : C.blueBorder
  const pct     = progress.total > 0 ? Math.round((progress.concluidas / progress.total) * 100) : 0
  const started = progress.concluidas > 0

  return (
    <Link href={`/vendedor/treinamentos/${trilha.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: C.elevated,
          border: `1px solid ${started ? accentBorder : C.border}`,
          borderRadius: '0.875rem',
          padding: '1rem',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          height: '100%',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = accentBorder)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = started ? accentBorder : C.border)}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          fontSize: '0.5rem', fontFamily: 'DM Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '0.09em',
          padding: '0.2rem 0.5rem', borderRadius: '0.25rem',
          background: accentBg, border: `1px solid ${accentBorder}`, color: accent,
          alignSelf: 'flex-start',
        }}>
          {progress.total} aulas
        </div>

        <div style={{
          fontFamily: 'Syne, var(--font-sans)',
          fontSize: '0.875rem', fontWeight: 700,
          color: C.text, letterSpacing: '-0.01em', lineHeight: 1.25,
        }}>
          {trilha.titulo}
        </div>

        <div style={{ fontSize: '0.6875rem', color: C.muted, lineHeight: 1.55, flex: 1 }}>
          {trilha.descricao || 'Sem descrição.'}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>
              {progress.concluidas} de {progress.total} lições
            </span>
            <span style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: pct > 0 ? accent : C.muted }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 3, background: C.deep, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: 3, width: `${pct}%`, background: accent, borderRadius: 2 }} />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '0.5rem', fontFamily: 'DM Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: started ? accent : C.muted,
          }}>
            {started ? 'Continuar →' : 'Iniciar →'}
          </span>
        </div>
      </div>
    </Link>
  )
}
