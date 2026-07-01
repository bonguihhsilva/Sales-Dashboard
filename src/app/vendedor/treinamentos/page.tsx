import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCatalogo } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'
import { TrilhaCard } from './TrilhaCard'
import { categorizarTrilhas } from './categorias'

export const dynamic = 'force-dynamic'

export default async function TreinamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const trilhas = await getCatalogo(user.id)
  const grupos = categorizarTrilhas(trilhas)

  const totalModulos = trilhas.reduce((acc, t) => acc + t.moduloCount, 0)
  const totalXP      = trilhas.reduce((acc, t) => acc + t.totalXp, 0)
  const concluidas   = trilhas.filter(t => t.progressoPct === 100).length

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text, padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '2.5rem', gap: '1rem',
        }}>
          <div>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.5rem',
              color: C.text, letterSpacing: '-0.02em', lineHeight: 1.15,
            }}>
              Centro de Treinamentos
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: C.muted, marginTop: 6 }}>
              {trilhas.length} trilhas · {totalModulos} módulos
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 20, alignItems: 'stretch',
            background: C.elevated, border: `1px solid ${C.borderStrong}`,
            borderRadius: '0.75rem', padding: '0.75rem 1.25rem',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>XP disponível</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.amber, marginTop: 2 }}>{totalXP}</div>
            </div>
            <div style={{ width: '1px', background: C.border }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concluídas</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.green, marginTop: 2 }}>{concluidas}/{trilhas.length}</div>
            </div>
          </div>
        </div>

        {/* Grid de trilhas */}
        {trilhas.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
          }}>
            Nenhuma trilha disponível no momento.
          </div>
        ) : (
          grupos.map((grupo, idx) => (
            <div key={grupo.categoria} style={{ marginTop: idx === 0 ? 0 : '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.0625rem',
                  color: C.text, letterSpacing: '-0.01em',
                }}>
                  {grupo.categoria}
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: C.muted }}>
                  · {grupo.trilhas.length} trilha{grupo.trilhas.length === 1 ? '' : 's'}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {grupo.trilhas.map(trilha => (
                  <TrilhaCard key={trilha.id} trilha={trilha} />
                ))}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  )
}
