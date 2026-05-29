import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton, SectionTitle } from '@/components/ui'
import Link from 'next/link'
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

  // Verificar se o usuário completou as lições deste módulo
  const { data: licoes } = await supabase
    .from('licoes').select('id').eq('modulo_id', moduloId)
  
  const { data: progresso } = await supabase
    .from('progresso_usuario')
    .select('licao_id')
    .eq('usuario_id', userId)
    .eq('concluida', true)
  
  const licoesIds = new Set(licoes?.map(l => l.id) || [])
  const concluidas = new Set(progresso?.map(p => p.licao_id) || [])
  
  const allDone = Array.from(licoesIds).every(id => concluidas.has(id))
  
  if (!allDone) {
    redirect(`/vendedor/treinamentos/${trilhaId}/${moduloId}`) // Bloqueado, precisa fazer as lições
  }

  // Buscar resultado anterior se houver
  const { data: quizResult } = await supabase
    .from('quiz_resultados')
    .select('pontuacao, aprovado')
    .eq('usuario_id', userId)
    .eq('modulo_id', moduloId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: questoes } = await supabase
    .from('quiz_questoes')
    .select('*')
    .eq('modulo_id', moduloId)
    .order('ordem', { ascending: true })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href={`/vendedor/treinamentos/${trilhaId}/${moduloId}`} style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Voltar para Módulo
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Quiz: {modulo.titulo}
          </h1>
        </div>
        <div>
          <LogoutButton />
        </div>
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
            quizResult={quizResult?.aprovado ? quizResult : null} // Passa resultado se já aprovado
          />
        )}
      </div>
    </div>
  )
}
