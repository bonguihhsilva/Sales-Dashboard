import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProva } from '@/lib/lms/queries'
import { PageHeader, LogoutButton } from '@/components/ui'
import QuizClient from './QuizClient'

export const dynamic = 'force-dynamic'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ trilhaId: string; moduloId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { trilhaId, moduloId } = await params

  const prova = await getProva(moduloId)
  if (!prova || prova.questoes.length === 0) {
    redirect(`/vendedor/treinamentos/${trilhaId}/${moduloId}`)
  }

  const [{ data: trilha }, { data: modulo }] = await Promise.all([
    supabase.from('trilhas').select('titulo').eq('id', trilhaId).single(),
    supabase.from('modulos').select('titulo').eq('id', moduloId).single(),
  ])

  // Só id/pergunta/opcoes vão ao client — gabarito fica só no servidor (submitQuiz)
  const questoes = prova.questoes.map(q => ({
    id: q.id,
    pergunta: q.pergunta,
    opcoes: q.opcoes,
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E' }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={`Prova: ${modulo?.titulo ?? prova.titulo}`}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha?.titulo ?? 'Trilha', href: `/vendedor/treinamentos/${trilhaId}` },
            { label: modulo?.titulo ?? 'Módulo', href: `/vendedor/treinamentos/${trilhaId}/${moduloId}` },
            { label: 'Prova' },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 3rem', maxWidth: '800px' }}>
        <QuizClient
          questoes={questoes}
          trilhaId={trilhaId}
          moduloId={moduloId}
        />
      </div>
    </div>
  )
}
