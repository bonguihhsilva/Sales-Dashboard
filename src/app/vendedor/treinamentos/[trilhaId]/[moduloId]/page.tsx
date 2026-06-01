import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton, SectionTitle } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ModuloPage({ params }: { params: Promise<{ trilhaId: string, moduloId: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')
  const userId = user?.id
  if (!userId) redirect('/login')

  const { trilhaId, moduloId } = await params

  const { data: modulo } = await supabase
    .from('modulos').select('*').eq('id', moduloId).single()
  if (!modulo) redirect(`/vendedor/treinamentos/${trilhaId}`)

  const { data: licoes } = await supabase
    .from('aulas').select('*').eq('modulo_id', moduloId).order('ordem', { ascending: true })

  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('aula_id')
    .eq('usuario_id', userId)

  const licoesConcluidas = new Set(progresso?.map(p => p.aula_id) || [])

  const { data: quizResultDb } = await supabase
    .from('progresso_modulos')
    .select('aprovado, nota_prova')
    .eq('usuario_id', userId)
    .eq('modulo_id', moduloId)
    .eq('aprovado', true)
    .maybeSingle()

  const quizResult = quizResultDb ? { aprovado: quizResultDb.aprovado, pontuacao: Number(quizResultDb.nota_prova) } : null

  const allLessonsDone = (licoes || []).every(l => licoesConcluidas.has(l.id))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href={`/vendedor/treinamentos/${trilhaId}`} style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Voltar para Módulos
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            {modulo.titulo}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            {modulo.descricao}
          </p>
        </div>
        <div>
          <LogoutButton />
        </div>
      </div>

      <div style={{ padding: '2rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionTitle>Lições</SectionTitle>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {(licoes || []).map((licao, index) => {
            const concluida = licoesConcluidas.has(licao.id)
            const isUnlocked = index === 0 || licoesConcluidas.has(licoes![index - 1]?.id) || concluida

            return (
              <Link key={licao.id} href={isUnlocked ? `/vendedor/treinamentos/${trilhaId}/${moduloId}/${licao.id}` : '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  background: 'var(--surface)', 
                  border: `1px solid ${concluida ? '#22c55e' : 'var(--border)'}`, 
                  borderRadius: '12px', 
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  opacity: isUnlocked ? 1 : 0.6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', background: concluida ? '#22c55e22' : 'var(--surface2)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: concluida ? '#22c55e' : 'var(--muted)',
                      fontSize: '1.2rem'
                    }}>
                      {licao.tipo_conteudo === 'video' ? '▶' : '📄'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                        {index + 1}. {licao.titulo}
                      </h3>
                      {!isUnlocked && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          Conclua a lição anterior para desbloquear
                        </span>
                      )}
                    </div>
                  </div>
                  {concluida && (
                    <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>✓ Concluída</span>
                  )}
                </div>
              </Link>
            )
          })}

          {/* Quiz Card */}
          <Link href={allLessonsDone ? `/vendedor/treinamentos/${trilhaId}/${moduloId}/quiz` : '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ 
              background: 'var(--surface)', 
              border: `2px dashed ${quizResult ? '#22c55e' : (allLessonsDone ? 'var(--meta3, #f5a742)' : 'var(--border)')}`, 
              borderRadius: '12px', 
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: allLessonsDone ? 'pointer' : 'default',
              opacity: allLessonsDone ? 1 : 0.6,
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', background: quizResult ? '#22c55e22' : 'var(--surface2)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: quizResult ? '#22c55e' : 'var(--muted)',
                  fontSize: '1.2rem'
                }}>
                  🏆
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Quiz do Módulo
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
                    {quizResult ? `Aprovado com ${quizResult.pontuacao}% de acerto` : 'Teste seus conhecimentos e ganhe XP'}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {quizResult ? (
                  <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>Quiz Concluído ✓</span>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: allLessonsDone ? 'var(--meta3, #f5a742)' : 'var(--muted)', fontWeight: 600 }}>
                    {allLessonsDone ? 'Iniciar Quiz →' : 'Bloqueado'}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
