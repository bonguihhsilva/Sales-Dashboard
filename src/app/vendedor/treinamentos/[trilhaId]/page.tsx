import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton, SectionTitle, PageHeader } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TrilhaPage({ params }: { params: Promise<{ trilhaId: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')
  const userId = user?.id
  if (!userId) redirect('/login')

  const { trilhaId } = await params

  const { data: trilha } = await supabase
    .from('trilhas').select('*').eq('id', trilhaId).single()

  if (!trilha) redirect('/vendedor/treinamentos')

  const { data: modulos } = await supabase
    .from('modulos').select('*').eq('trilha_id', trilhaId).order('ordem', { ascending: true })

  // Pegar progresso do quiz (para saber se o modulo foi concluído pelo user)
  const { data: resultados } = await supabase
    .from('quiz_resultados')
    .select('modulo_id, aprovado')
    .eq('usuario_id', userId)
    .eq('aprovado', true)

  const modulosAprovados = new Set(resultados?.map(r => r.modulo_id) || [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={trilha.titulo}
          subtitle={trilha.descricao}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha.titulo },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '2rem 2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionTitle>Módulos da Trilha</SectionTitle>
        
        {(!modulos || modulos.length === 0) ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', marginTop: '1rem' }}>
            <p style={{ color: 'var(--muted)' }}>Nenhum módulo cadastrado nesta trilha.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {modulos.map((mod, index) => {
              const concluido = modulosAprovados.has(mod.id)
              return (
                <Link key={mod.id} href={`/vendedor/treinamentos/${trilhaId}/${mod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ 
                    background: 'var(--surface)', 
                    border: `1px solid ${concluido ? '#22c55e' : 'var(--border)'}`, 
                    borderRadius: '12px', 
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    opacity: index === 0 || modulosAprovados.has(modulos[index - 1]?.id) || concluido ? 1 : 0.6,
                    pointerEvents: index === 0 || modulosAprovados.has(modulos[index - 1]?.id) || concluido ? 'auto' : 'none'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                          {index + 1}. {mod.titulo}
                        </h3>
                        {concluido && (
                          <span style={{ background: '#22c55e22', color: '#22c55e', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                            Concluído ✓
                          </span>
                        )}
                        {!concluido && index > 0 && !modulosAprovados.has(modulos[index - 1]?.id) && (
                          <span style={{ background: 'var(--surface2)', color: 'var(--muted)', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                            Bloqueado 🔒
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                        {mod.descricao || 'Sem descrição.'}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>Recompensa</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--meta3, #f5a742)' }}>+{mod.xp_reward} XP</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
