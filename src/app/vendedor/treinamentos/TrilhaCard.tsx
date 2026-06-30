'use client'

import Link from 'next/link'
import type { LmsTrilha } from '@/lib/lms'

const C = {
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
  deep:        '#141418',
} as const

export function TrilhaCard({ trilha }: { trilha: LmsTrilha }) {
  const isGold = trilha.color === '#C9933A' || trilha.color.includes('C993')
  const accent       = isGold ? C.gold : C.blue
  const accentBg     = isGold ? C.goldBg : C.blueBg
  const accentBorder = isGold ? C.goldBorder : C.blueBorder

  return (
    <Link href={`/vendedor/treinamentos/${trilha.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: C.elevated,
          border: `1px solid ${C.border}`,
          borderRadius: '0.875rem',
          padding: '1.375rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          height: '100%',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = accentBorder)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.375rem', lineHeight: 1 }}>{trilha.icon}</span>
          <div style={{
            fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '0.25rem 0.5rem', borderRadius: '0.3125rem',
            background: accentBg, border: `1px solid ${accentBorder}`, color: accent,
          }}>
            {trilha.lessons.length} módulos
          </div>
        </div>

        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.0625rem', fontWeight: 700,
          color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>
          {trilha.title}
        </div>

        <div style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.6, flex: 1 }}>
          {trilha.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace', color: accent, fontWeight: 700 }}>
            +{trilha.xpReward} XP
          </span>
          <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>
            Iniciar →
          </span>
        </div>
      </div>
    </Link>
  )
}
