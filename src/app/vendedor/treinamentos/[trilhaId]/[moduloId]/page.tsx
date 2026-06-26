import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { LMS_TRILHAS } from '@/lib/lms'
import { PageHeader, LogoutButton } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const C = {
  bg:      '#0C0C0E',
  surface: '#1C1C22',
  border:  'rgba(255,255,255,0.06)',
  text:    '#F0F0F3',
  muted:   '#6B6B78',
  gold:    '#C9933A',
  amber:   '#f5a742',
} as const

export default async function ModuloPage({ params }: { params: Promise<{ trilhaId: string; moduloId: string }> }) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')

  const { trilhaId, moduloId } = await params
  const trilha = LMS_TRILHAS.find(t => t.id === trilhaId)
  if (!trilha) redirect('/vendedor/treinamentos')

  const lesson = trilha.lessons.find(l => l.id === moduloId)
  if (!lesson) redirect(`/vendedor/treinamentos/${trilhaId}`)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={lesson.title}
          subtitle={lesson.description}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha.title, href: `/vendedor/treinamentos/${trilhaId}` },
            { label: lesson.title },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 3rem', maxWidth: '820px' }}>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>{lesson.duration} min de leitura</span>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>{lesson.quiz.length} questões no quiz</span>
        </div>

        {/* Content */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '0.875rem',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1.5rem',
            fontSize: '0.9375rem',
            lineHeight: 1.75,
            color: C.text,
          }}
          className="lms-content"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />

        {/* Quiz CTA */}
        <div style={{
          background: 'rgba(201,147,58,0.06)',
          border: '1px solid rgba(201,147,58,0.25)',
          borderRadius: '0.875rem',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: C.text }}>
              Quiz do Módulo
            </div>
            <div style={{ fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
              {lesson.quiz.length} questões · Teste seu conhecimento
            </div>
          </div>
          <Link
            href={`/vendedor/treinamentos/${trilhaId}/${moduloId}/quiz`}
            style={{
              background: C.gold,
              color: '#0C0C0E',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: 800,
              fontFamily: 'Syne, sans-serif',
              fontSize: '0.875rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Fazer Quiz →
          </Link>
        </div>

      </div>

      <style>{`
        .lms-content h2 { color: #C9933A; font-family: 'Syne', sans-serif; font-size: 1.1rem; margin: 2rem 0 0.75rem; }
        .lms-content h3 { color: #F0F0F3; font-family: 'DM Mono', monospace; font-size: 0.875rem; margin: 1.5rem 0 0.5rem; letter-spacing: 0.02em; }
        .lms-content p  { color: #A0A0AA; margin: 0 0 0.875rem; }
        .lms-content ul, .lms-content ol { color: #A0A0AA; padding-left: 1.5rem; margin: 0 0 0.875rem; }
        .lms-content li { margin-bottom: 0.35rem; }
        .lms-content strong { color: #F0F0F3; font-weight: 700; }
        .lms-content em { color: #6B6B78; font-style: italic; }
        .lms-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
        .lms-content th { background: rgba(255,255,255,0.05); color: #C9933A; font-family: 'DM Mono', monospace; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.08); }
        .lms-content td { color: #A0A0AA; padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.06); }
        .lms-content tr:hover td { background: rgba(255,255,255,0.02); }
      `}</style>
    </div>
  )
}
