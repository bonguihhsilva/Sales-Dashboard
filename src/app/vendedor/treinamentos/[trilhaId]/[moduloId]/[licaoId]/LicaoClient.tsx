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

interface Licao {
  id: string
  titulo?: string | null
  url_midia?: string | null
  conteudo_texto?: string | null
  slides?: Slide[] | null
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

// Conteúdo das lições é HTML (autoria admin) — detecta tags de bloco
function isHtml(text: string) {
  return /<(h[1-6]|p|ul|ol|li|table|tr|td|th|pre|code|strong|em|br|blockquote)\b/i.test(text)
}

// Sanitização defensiva: conteúdo vem de admin/gerente (role-gated), mas
// removemos vetores óbvios de XSS antes de injetar como HTML.
function sanitizeHtml(html: string) {
  return html
    .replace(/<\/?(script|style|iframe|object|embed|link|meta)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2')
}

// Corpo HTML (prose) ou markdown-lite (fallback)
function SlideBody({ corpo }: { corpo: string }) {
  if (isHtml(corpo)) {
    return (
      <div
        className="lms-prose"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(corpo) }}
      />
    )
  }

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
  licao: Licao,
  trilhaId: string,
  moduloId: string,
  jaConcluida: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [, setMaxReached] = useState(0)
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro', { description: message })
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

        /* Prose — renderização do conteúdo HTML das lições */
        .lms-prose {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          font-size: 1.05rem;
          line-height: 1.7;
          color: ${C.muted};
        }
        .lms-prose > * { margin: 0; }
        .lms-prose h1, .lms-prose h2, .lms-prose h3 {
          font-family: 'DM Mono', monospace;
          color: ${C.gold};
          letter-spacing: -0.01em;
          line-height: 1.3;
          margin-top: 0.75rem;
        }
        .lms-prose h1 { font-size: clamp(1.35rem, 4.5vw, 1.75rem); }
        .lms-prose h2 { font-size: clamp(1.2rem, 4vw, 1.5rem); }
        .lms-prose h3 { font-size: clamp(1.05rem, 3.5vw, 1.25rem); color: ${C.text}; }
        .lms-prose p { color: ${C.muted}; }
        .lms-prose strong { color: ${C.text}; font-weight: 800; }
        .lms-prose em { color: ${C.text}; font-style: italic; }
        .lms-prose a { color: ${C.gold}; text-decoration: underline; }
        .lms-prose ul, .lms-prose ol {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding-left: 1.4rem;
          margin: 0;
        }
        .lms-prose li { color: ${C.muted}; padding-left: 0.2rem; }
        .lms-prose ul li::marker { color: ${C.gold}; }
        .lms-prose ol li::marker { color: ${C.gold}; font-family: 'DM Mono', monospace; }
        .lms-prose code {
          font-family: 'DM Mono', monospace;
          background: ${C.surface2};
          color: ${C.text};
          padding: 0.1em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .lms-prose pre {
          font-family: 'DM Mono', monospace;
          background: ${C.surface2};
          border: 1px solid ${C.border};
          border-radius: 10px;
          padding: 1rem;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.5;
          color: ${C.text};
        }
        .lms-prose pre code { background: none; padding: 0; }
        .lms-prose table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          display: block;
          overflow-x: auto;
        }
        .lms-prose th, .lms-prose td {
          border: 1px solid ${C.border};
          padding: 0.55rem 0.7rem;
          text-align: left;
          vertical-align: top;
        }
        .lms-prose th {
          background: ${C.surface2};
          color: ${C.text};
          font-family: 'DM Mono', monospace;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .lms-prose blockquote {
          border-left: 3px solid ${C.gold};
          padding-left: 1rem;
          color: ${C.text};
          font-style: italic;
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
