import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrilha } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'
import { PageHeader, LogoutButton } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TrilhaPage({
  params,
}: {
  params: Promise<{ trilhaId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { trilhaId } = await params
  const trilha = await getTrilha(trilhaId, user.id)
  if (!trilha) redirect('/vendedor/treinamentos')

  const totalXp   = trilha.modulos.reduce((acc, m) => acc + m.xp_reward, 0)
  const aprovados = trilha.modulos.filter(m => m.aprovado).length

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={trilha.titulo}
          subtitle={trilha.descricao ?? undefined}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha.titulo },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 2rem', maxWidth: '900px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {trilha.icon && (
              <span style={{ fontSize: '2rem' }}>{trilha.icon}</span>
            )}
            <div style={{
              fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: C.amber, fontWeight: 700,
            }}>
              +{totalXp} XP ao concluir
            </div>
          </div>
          <div style={{
            fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
            color: aprovados === trilha.modulos.length && trilha.modulos.length > 0
              ? C.green : C.muted,
          }}>
            {aprovados}/{trilha.modulos.length} módulos aprovados
          </div>
        </div>

        {trilha.modulos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
          }}>
            Esta trilha ainda não tem módulos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {trilha.modulos.map((modulo, idx) => (
              <Link
                key={modulo.id}
                href={`/vendedor/treinamentos/${trilhaId}/${modulo.id}`}
                className="lms-row"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '0.75rem' }}
              >
                <div style={{
                  background: C.surface,
                  border: `1px solid ${modulo.aprovado ? 'rgba(34,197,94,0.25)' : C.border}`,
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
                      background: modulo.aprovado ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${modulo.aprovado ? 'rgba(34,197,94,0.3)' : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                      color: modulo.aprovado ? C.green : C.muted, fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {modulo.aprovado ? '✓' : String(idx + 1).padStart(2, '0')}
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '0.875rem',
                        fontWeight: 700, color: C.text,
                      }}>
                        {modulo.titulo}
                      </div>
                      {modulo.descricao && (
                        <div style={{ fontSize: '0.6875rem', color: C.muted, marginTop: 2 }}>
                          {modulo.descricao}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>
                        {modulo.aulaCount} aulas
                      </div>
                      {modulo.questaoCount > 0 && (
                        <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, marginTop: 1 }}>
                          {modulo.questaoCount} questões
                        </div>
                      )}
                      <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.amber, marginTop: 1 }}>
                        +{modulo.xp_reward} XP
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: C.muted }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
