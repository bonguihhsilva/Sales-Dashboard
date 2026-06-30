'use client'

import Link from 'next/link'
import type { CatalogoTrilha } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'

interface Props {
  trilha: CatalogoTrilha
}

export function TrilhaCard({ trilha }: Props) {
  const accentHex    = trilha.cor ?? C.gold
  const accentBg     = `${accentHex}1A`
  const accentBorder = `${accentHex}40`

  return (
    <Link
      href={`/vendedor/treinamentos/${trilha.id}`}
      className="lms-lift"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '0.875rem' }}
    >
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
        {/* Ícone + badge módulos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {trilha.icon && (
            <span style={{ fontSize: '1.375rem', lineHeight: 1 }}>{trilha.icon}</span>
          )}
          <div style={{
            fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '0.25rem 0.5rem', borderRadius: '0.3125rem',
            background: accentBg, border: `1px solid ${accentBorder}`, color: accentHex,
          }}>
            {trilha.moduloCount} módulos
          </div>
          {trilha.is_global && (
            <div style={{
              fontSize: '0.5625rem', fontFamily: 'DM Mono, monospace',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '0.2rem 0.4rem', borderRadius: '0.25rem',
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
              color: C.muted,
            }}>
              Global
            </div>
          )}
        </div>

        {/* Título */}
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.0625rem', fontWeight: 700,
          color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>
          {trilha.titulo}
        </div>

        {/* Descrição */}
        <div style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.6, flex: 1 }}>
          {trilha.descricao}
        </div>

        {/* Barra de progresso */}
        <div>
          <div style={{
            height: '3px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${trilha.progressoPct}%`,
              background: trilha.progressoPct === 100 ? C.green : accentHex,
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
              color: accentHex, fontWeight: 700,
            }}>
              +{trilha.totalXp} XP
            </span>
            <span style={{
              fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
              color: trilha.progressoPct === 100 ? C.green : C.muted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {trilha.progressoPct === 100
                ? 'Concluída ✓'
                : trilha.progressoPct > 0
                  ? `${trilha.progressoPct}% →`
                  : 'Iniciar →'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
