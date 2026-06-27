import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { LMS_TRILHAS, SKINCARE_TRILHAS } from '@/lib/lms'
import { TrilhaCard } from './TrilhaCard'

export const dynamic = 'force-dynamic'

const C = {
  abyss:       '#0C0C0E',
  deep:        '#141418',
  elevated:    '#1C1C22',
  border:      'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',
  text:        '#F0F0F3',
  muted:       '#6B6B78',
  gold:        '#C9933A',
  amber:       '#f5a742',
} as const

export default async function TreinamentosPage() {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')

  const role = profile.role || 'vendedor'
  // Training accessible to all roles — adm/gerente redirected from /dashboard/treinamentos
  if (!role) redirect('/dashboard')

  const totalModulos = [...LMS_TRILHAS, ...SKINCARE_TRILHAS].reduce((acc, t) => acc + t.lessons.length, 0)
  const totalXP      = [...LMS_TRILHAS, ...SKINCARE_TRILHAS].reduce((acc, t) => acc + t.xpReward, 0)

  const skincareXP = SKINCARE_TRILHAS.reduce((acc, t) => acc + t.xpReward, 0)

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text, padding: '1.5rem 2rem' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.0625rem', color: C.text, letterSpacing: '-0.02em' }}>
            Centro de Treinamentos
          </div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
            {LMS_TRILHAS.length + SKINCARE_TRILHAS.length} trilhas · {totalModulos} módulos
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 10, alignItems: 'stretch',
          background: C.elevated, border: `1px solid ${C.borderStrong}`,
          borderRadius: '0.625rem', padding: '0.5rem 0.75rem',
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>XP disponível</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.amber }}>{totalXP}</div>
          </div>
        </div>
      </div>

      {/* Vendas section */}
      <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600, marginBottom: '0.75rem' }}>
        Técnicas de Vendas — {LMS_TRILHAS.length} trilhas · {LMS_TRILHAS.reduce((a, t) => a + t.lessons.length, 0)} módulos
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}>
        {LMS_TRILHAS.map(trilha => (
          <TrilhaCard key={trilha.id} trilha={trilha} />
        ))}
      </div>

      {/* Skincare section */}
      <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: '#E91E8C', fontWeight: 600, marginBottom: '0.75rem' }}>
        Skincare Profissional — {SKINCARE_TRILHAS.length} trilhas · {SKINCARE_TRILHAS.reduce((a, t) => a + t.lessons.length, 0)} módulos · {skincareXP} XP
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
        {SKINCARE_TRILHAS.map(trilha => (
          <TrilhaCard key={trilha.id} trilha={trilha} />
        ))}
      </div>

    </div>
  )
}
