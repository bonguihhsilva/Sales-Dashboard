import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton, SectionTitle, PageHeader } from '@/components/ui'
import QuizClient from './QuizClient'

export const dynamic = 'force-dynamic'

export default async function QuizPage({ params }: { params: Promise<{ trilhaId: string, moduloId: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')
  const userId = user?.id
  if (!userId) redirect('/login')

  const { trilhaId, moduloId } = await params

  const { data: modulo } = await supabase
    .from('modulos').select('titulo').eq('id', moduloId).single()
  if (!modulo) redirect(`/vendedor/treinamentos/${trilhaId}`)

  // Verificar se o usuário completou as aulas deste módulo
  const { data: aulas } = await supabase
    .from('aulas').select('id').eq('modulo_id', moduloId)
  
  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('aula_id')
    .eq('usuario_id', userId)
  
  const aulasIds = new Set(aulas?.map(a => a.id) || [])
  const concluidas = new Set(progresso?.map(p => p.aula_id) || [])
  
  const allDone = Array.from(aulasIds).every(id => concluidas.has(id))
  
  if (!allDone) {
    redirect(`/vendedor/treinamentos/${trilhaId}/${moduloId}`) // Bloqueado, precisa fazer as lições
  }

  // Buscar resultado anterior se houver na tabela progresso_modulos
  const { data: quizResult } = await supabase
    .from('progresso_modulos')
    .select('nota_prova, aprovado')
    .eq('usuario_id', userId)
    .eq('modulo_id', moduloId)
    .maybeSingle()

  // Buscar prova do módulo
  const { data: prova } = await supabase
    .from('provas')
    .select('id')
    .eq('modulo_id', moduloId)
    .maybeSingle()

  // Buscar questões da prova
  let questoes: any[] = []
  if (prova) {
    const { data } = await supabase
      .from('questoes_prova')
      .select('*')
      .eq('prova_id', prova.id)
      .order('id', { ascending: true })
    questoes = data || []
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={`Quiz: ${modulo.titulo}`}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: modulo.titulo, href: `/vendedor/treinamentos/${trilhaId}/${moduloId}` },
            { label: 'Quiz' },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '2rem 2.5rem', maxWidth: '800px', margin: '0 auto' }}>
        {(!questoes || questoes.length === 0) ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--muted)' }}>Este módulo não possui quiz configurado.</p>
          </div>
        ) : (
          <QuizClient 
            questoes={questoes} 
            trilhaId={trilhaId} 
            moduloId={moduloId} 
            quizResult={quizResult?.aprovado ? { pontuacao: Number(quizResult.nota_prova), aprovado: quizResult.aprovado } : null} 
          />
        )}
      </div>
    </div>
  )
}
