import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { LMS_TRILHAS } from '@/lib/lms'
import { PageHeader, LogoutButton } from '@/components/ui'
import QuizClient from './QuizClient'

export const dynamic = 'force-dynamic'

export default async function QuizPage({ params }: { params: Promise<{ trilhaId: string; moduloId: string }> }) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')

  const { trilhaId, moduloId } = await params
  const trilha = LMS_TRILHAS.find(t => t.id === trilhaId)
  if (!trilha) redirect('/vendedor/treinamentos')

  const lesson = trilha.lessons.find(l => l.id === moduloId)
  if (!lesson) redirect(`/vendedor/treinamentos/${trilhaId}`)

  const questoes = lesson.quiz.map((q, i) => ({
    id: String(i),
    pergunta: q.question,
    opcoes: q.options,
  }))

  const correctAnswers = lesson.quiz.map(q => q.correct)
  const explanations   = lesson.quiz.map(q => q.explanation)

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E' }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={`Quiz: ${lesson.title}`}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha.title, href: `/vendedor/treinamentos/${trilhaId}` },
            { label: lesson.title, href: `/vendedor/treinamentos/${trilhaId}/${moduloId}` },
            { label: 'Quiz' },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 3rem', maxWidth: '800px' }}>
        <QuizClient
          questoes={questoes}
          trilhaId={trilhaId}
          moduloId={moduloId}
          correctAnswers={correctAnswers}
          explanations={explanations}
        />
      </div>
    </div>
  )
}
