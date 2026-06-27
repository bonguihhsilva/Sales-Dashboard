import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { ALL_TRILHAS } from '@/lib/lms'
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
  green:   '#22c55e',
} as const

export default async function TrilhaPage({ params }: { params: Promise<{ trilhaId: string }> }) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')

  const { trilhaId } = await params
  const trilha = ALL_TRILHAS.find(t => t.id === trilhaId)
  if (!trilha) redirect('/vendedor/treinamentos')

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={trilha.title}
          subtitle={trilha.description}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha.title },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 2rem', maxWidth: '900px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2rem' }}>{trilha.icon}</span>
          <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.amber, fontWeight: 700 }}>
            +{trilha.xpReward} XP ao concluir
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {trilha.lessons.map((lesson, idx) => (
            <Link key={lesson.id} href={`/vendedor/treinamentos/${trilhaId}/${lesson.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: C.muted, fontWeight: 700,
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.875rem', fontWeight: 700, color: C.text }}>
                      {lesson.title}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: C.muted, marginTop: 2 }}>
                      {lesson.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>{lesson.duration} min</div>
                    <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>{lesson.quiz.length} questões</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: C.muted }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
