'use client'

import Link from 'next/link'
import type { CategoriaResumo } from './categorias'
import { LMS as C } from '@/lib/lms/theme'

interface Props {
  resumo: CategoriaResumo
}

export function CategoriaCard({ resumo }: Props) {
  const { nome, icon, cor, trilhaCount, moduloCount, totalXp, concluidas, progressoPct } = resumo
  const vazia = trilhaCount === 0

  const accentBg = `${cor}1A`
  const accentBorder = `${cor}40`

  const inner = (
    <div
      style={{
        background: C.elevated,
        border: `1px solid ${C.border}`,
        borderRadius: '0.875rem',
        padding: '1.5rem',
        cursor: vazia ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        height: '100%',
        opacity: vazia ? 0.55 : 1,
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        if (!vazia) e.currentTarget.style.borderColor = accentBorder
      }}
      onMouseLeave={e => {
        if (!vazia) e.currentTarget.style.borderColor = C.border
      }}
    >
      {/* Ícone em disco de acento */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', lineHeight: 1,
            background: accentBg, border: `1px solid ${accentBorder}`,
          }}
        >
          {icon}
        </div>
        {vazia ? (
          <span style={{
            fontSize: '0.5625rem', fontFamily: 'var(--font-jetbrains), monospace',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '0.25rem 0.5rem', borderRadius: '0.3125rem',
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
            color: C.muted,
          }}>
            Em breve
          </span>
        ) : (
          <span style={{ fontSize: '1.125rem', color: cor, fontWeight: 700 }}>→</span>
        )}
      </div>

      {/* Nome */}
      <div style={{
        fontFamily: 'var(--font-hanken), sans-serif', fontSize: '1.125rem', fontWeight: 700,
        color: C.text, letterSpacing: '-0.01em', lineHeight: 1.25,
      }}>
        {nome}
      </div>

      {/* Meta / progresso */}
      {vazia ? (
        <div style={{
          fontSize: '0.75rem', fontFamily: 'var(--font-jetbrains), monospace', color: C.muted,
        }}>
          Trilhas em produção
        </div>
      ) : (
        <>
          <div style={{
            fontSize: '0.75rem', fontFamily: 'var(--font-jetbrains), monospace', color: C.muted,
            display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
          }}>
            <span>{trilhaCount} trilha{trilhaCount === 1 ? '' : 's'}</span>
            <span>·</span>
            <span>{moduloCount} módulo{moduloCount === 1 ? '' : 's'}</span>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{
              height: '3px', borderRadius: '2px',
              background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progressoPct}%`,
                background: progressoPct === 100 ? C.green : cor,
                borderRadius: '2px', transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.6875rem', fontFamily: 'var(--font-jetbrains), monospace',
                color: cor, fontWeight: 700,
              }}>
                {totalXp} XP
              </span>
              <span style={{
                fontSize: '0.625rem', fontFamily: 'var(--font-jetbrains), monospace',
                color: concluidas === trilhaCount ? C.green : C.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {concluidas}/{trilhaCount} concluída{trilhaCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (vazia) {
    return <div style={{ display: 'block', height: '100%' }}>{inner}</div>
  }

  return (
    <Link
      href={`/vendedor/treinamentos?cat=${encodeURIComponent(nome)}`}
      className="lms-lift"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '0.875rem', height: '100%' }}
    >
      {inner}
    </Link>
  )
}
