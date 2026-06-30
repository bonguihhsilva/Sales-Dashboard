import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getModulo } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'
import { PageHeader, LogoutButton } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function tipoIcon(tipo: string | null): string {
  switch (tipo) {
    case 'video':  return '▶'
    case 'slides': return '◫'
    case 'texto':  return '≡'
    default:       return '◉'
  }
}

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ trilhaId: string; moduloId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { trilhaId, moduloId } = await params
  const modulo = await getModulo(moduloId, user.id)
  if (!modulo) redirect(`/vendedor/treinamentos/${trilhaId}`)

  const { data: trilha } = await supabase
    .from('trilhas')
    .select('titulo')
    .eq('id', trilhaId)
    .single()

  const aulasConcluidas = modulo.aulas.filter(a => a.concluida).length
  const totalAulas      = modulo.aulas.length
  const progressoPct    = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={modulo.titulo}
          subtitle={modulo.descricao ?? undefined}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha?.titulo ?? 'Trilha', href: `/vendedor/treinamentos/${trilhaId}` },
            { label: modulo.titulo },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 3rem', maxWidth: '820px' }}>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>
            {totalAulas} aulas
          </span>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace', color: C.amber, fontWeight: 700 }}>
            +{modulo.xp_reward} XP
          </span>
          {progressoPct > 0 && (
            <span style={{
              fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
              color: progressoPct === 100 ? C.green : C.muted,
            }}>
              {aulasConcluidas}/{totalAulas} concluídas
            </span>
          )}
        </div>

        {totalAulas > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              height: '3px', borderRadius: '2px',
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progressoPct}%`,
                background: progressoPct === 100 ? C.green : C.gold,
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {modulo.aulas.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
          }}>
            Este módulo ainda não tem aulas.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
            {modulo.aulas.map((aula, idx) => (
              <Link
                key={aula.id}
                href={`/vendedor/treinamentos/${trilhaId}/${moduloId}/${aula.id}`}
                className="lms-row"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '0.625rem' }}
              >
                <div style={{
                  background: C.surface,
                  border: `1px solid ${aula.concluida ? 'rgba(34,197,94,0.2)' : C.border}`,
                  borderRadius: '0.625rem',
                  padding: '0.875rem 1.125rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                      background: aula.concluida ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${aula.concluida ? 'rgba(34,197,94,0.3)' : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                      color: aula.concluida ? C.green : C.muted, fontWeight: 700, flexShrink: 0,
                    }}>
                      {aula.concluida ? '✓' : String(idx + 1).padStart(2, '0')}
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '0.875rem',
                        fontWeight: 700, color: C.text,
                      }}>
                        {aula.titulo}
                      </div>
                      <div style={{
                        fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
                        color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {tipoIcon(aula.tipo_conteudo)} {aula.tipo_conteudo ?? 'aula'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.amber }}>
                      +{aula.xp_reward} XP
                    </span>
                    <span style={{ fontSize: '0.75rem', color: C.muted }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {modulo.temProva && (
          <div style={{
            background: 'rgba(201,147,58,0.06)',
            border: '1px solid rgba(201,147,58,0.25)',
            borderRadius: '0.875rem',
            padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: C.text }}>
                Prova do Módulo
              </div>
              <div style={{ fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
                {progressoPct < 100
                  ? 'Conclua todas as aulas antes de fazer a prova'
                  : `Teste seu conhecimento e ganhe +${modulo.xp_reward} XP`}
              </div>
            </div>
            <Link
              href={`/vendedor/treinamentos/${trilhaId}/${moduloId}/quiz`}
              className="lms-cta"
              style={{
                background: progressoPct < 100 ? C.surface2 : C.gold,
                color: progressoPct < 100 ? C.muted : C.bg,
                border: 'none',
                padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
                fontWeight: 800, fontFamily: 'Syne, sans-serif',
                fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap',
                pointerEvents: progressoPct < 100 ? 'none' : 'auto',
              }}
            >
              Fazer Prova →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
