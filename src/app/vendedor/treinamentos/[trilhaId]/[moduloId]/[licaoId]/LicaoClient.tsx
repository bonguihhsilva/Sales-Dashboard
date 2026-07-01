'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { markLicaoComplete } from './actions'
import { toast } from 'sonner'
import { LMS as C } from '@/lib/lms/theme'

// ── Slide model ──────────────────────────────────────────────
interface Slide {
  titulo?: string | null
  corpo: string
  tipo?: 'texto' | 'bullets' | 'video' | string
  videoUrl?: string | null
}

// Renderiza **negrito** inline dentro de um texto
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: C.text, fontWeight: 800 }}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  )
}

// Corpo markdown-lite: linhas "- " viram bullets; resto vira parágrafos
function SlideBody({ corpo }: { corpo: string }) {
  const lines = corpo.split('\n').map(l => l.trim()).filter(Boolean)
  const blocks: { type: 'bullet' | 'p'; text: string }[] = lines.map(l =>
    l.startsWith('- ') ? { type: 'bullet', text: l.slice(2) } : { type: 'p', text: l }
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {blocks.map((b, i) =>
        b.type === 'bullet' ? (
          <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <span style={{ color: C.gold, fontWeight: 900, lineHeight: '1.7', flexShrink: 0 }}>•</span>
            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.7', color: C.muted }}>
              {renderInline(b.text)}
            </p>
          </div>
        ) : (
          <p key={i} style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.7', color: C.muted }}>
            {renderInline(b.text)}
          </p>
        )
      )}
    </div>
  )
}

export default function LicaoClient({
  licao,
  trilhaId,
  moduloId,
  jaConcluida
}: {
  licao: any,
  trilhaId: string,
  moduloId: string,
  jaConcluida: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [maxReached, setMaxReached] = useState(0)
  const touchX = useRef<number | null>(null)

  // Monta os slides: slides JSONB > fallback dividindo conteudo_texto
  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = []

    if (licao.url_midia) {
      out.push({ titulo: licao.titulo, tipo: 'video', videoUrl: licao.url_midia, corpo: '' })
    }

    if (Array.isArray(licao.slides) && licao.slides.length > 0) {
      for (const s of licao.slides) out.push(s as Slide)
    } else if (licao.conteudo_texto) {
      // Divide por bloco (linha em branco ou ---); fallback: 1 slide por linha agrupada
      const raw: string = licao.conteudo_texto
      const chunks = raw
        .split(/\n\s*(?:---|\n)\s*\n?/)
        .map(c => c.trim())
        .filter(Boolean)
      const finalChunks = chunks.length > 0 ? chunks : [raw.trim()]
      for (const c of finalChunks) out.push({ corpo: c, tipo: 'texto' })
    }

    if (out.length === 0) {
      out.push({ corpo: 'Conteúdo da lição em construção.', tipo: 'texto' })
    }
    return out
  }, [licao])

  const total = slides.length
  const isLast = index === total - 1
  const current = slides[index]

  useEffect(() => {
    setMaxReached(m => Math.max(m, index))
  }, [index])

  const go = (next: number) => {
    if (next < 0 || next > total - 1) return
    setDir(next > index ? 1 : -1)
    setIndex(next)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total])

  const handleConcluir = async () => {
    if (jaConcluida) {
      router.push(`/vendedor/treinamentos/${trilhaId}/${moduloId}`)
      return
    }
    setLoading(true)
    try {
      await markLicaoComplete(licao.id, moduloId)
      router.push(`/vendedor/treinamentos/${trilhaId}/${moduloId}`)
      router.refresh()
    } catch (err: any) {
      toast.error('Erro', { description: err.message })
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem 1.25rem 3rem', maxWidth: '820px', margin: '0 auto' }}>
      {/* Contador */}
      <div style={{
        fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', color: C.muted,
        letterSpacing: '0.05em', marginBottom: '1rem'
      }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Palco do slide */}
      <div
        onTouchStart={e => { touchX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          if (dx < -50) go(index + 1)
          if (dx > 50) go(index - 1)
          touchX.current = null
        }}
        style={{
          position: 'relative',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 5vw, 3rem)',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Trilho de progresso superior */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.75rem' }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              height: '4px', flex: 1, borderRadius: '4px',
              background: i <= index ? C.gold : C.surface2,
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <div
          key={index}
          className="lms-slide"
          style={{
            animation: `${dir === 1 ? 'slideInRight' : 'slideInLeft'} 0.32s ease`,
            display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1,
          }}
        >
          {current.tipo === 'video' && current.videoUrl ? (
            <>
              {current.titulo && (
                <h2 style={slideTitleStyle}>{current.titulo}</h2>
              )}
              <div style={{
                width: '100%', aspectRatio: '16/9', background: C.surface2,
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: `1px solid ${C.border}`,
              }}>
                <span style={{ color: C.muted, fontFamily: 'DM Mono, monospace' }}>
                  Video Player: {current.videoUrl}
                </span>
              </div>
            </>
          ) : (
            <>
              {current.titulo && (
                <h2 style={slideTitleStyle}>{current.titulo}</h2>
              )}
              <SlideBody corpo={current.corpo} />
            </>
          )}
        </div>
      </div>

      {/* Navegação */}
      <div style={{
        marginTop: '1.5rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem',
      }}>
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Slide anterior"
          className="lms-cta"
          style={{ ...navBtnStyle, opacity: index === 0 ? 0.35 : 1, cursor: index === 0 ? 'default' : 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Pontos */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Ir para slide ${i + 1}`}
              style={{
                width: i === index ? '22px' : '8px', height: '8px', borderRadius: '4px',
                border: 'none', cursor: 'pointer', padding: 0,
                background: i === index ? C.gold : C.surface2,
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            onClick={() => go(index + 1)}
            aria-label="Próximo slide"
            className="lms-cta"
            style={{ ...navBtnStyle, cursor: 'pointer' }}
          >
            <ChevronRight size={20} />
          </button>
        ) : (
          <div style={{ ...navBtnStyle, opacity: 0, pointerEvents: 'none' }}>
            <ChevronRight size={20} />
          </div>
        )}
      </div>

      {/* Concluir — só no último slide */}
      {isLast && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', animation: 'slideInRight 0.32s ease' }}>
          <button
            onClick={handleConcluir}
            disabled={loading}
            className="lms-cta"
            style={{
              background: jaConcluida ? C.surface : C.gold,
              color: jaConcluida ? C.text : C.bg,
              border: jaConcluida ? `1px solid ${C.border}` : 'none',
              padding: '14px 32px', borderRadius: '10px', fontWeight: 800,
              cursor: loading ? 'default' : 'pointer', fontSize: '1rem',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {loading ? 'Salvando...' : jaConcluida ? 'Voltar para o Módulo' : 'Concluir Lição ✓'}
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lms-slide { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

const slideTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'DM Mono, monospace',
  fontSize: 'clamp(1.25rem, 4vw, 1.6rem)',
  fontWeight: 600,
  color: C.gold,
  letterSpacing: '-0.01em',
  lineHeight: '1.3',
}

const navBtnStyle: React.CSSProperties = {
  width: '44px', height: '44px', borderRadius: '50%',
  background: C.surface, border: `1px solid ${C.border}`,
  color: C.text, display: 'flex', alignItems: 'center',
  justifyContent: 'center', flexShrink: 0,
}
