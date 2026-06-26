import { getTenantContext } from '@/lib/auth/tenant'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LMS_TRILHAS } from '@/lib/lms'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const C = {
  deep:        '#141418',
  elevated:    '#1C1C22',
  border:      'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',
  text:        '#F0F0F3',
  muted:       '#6B6B78',
  gold:        '#C9933A',
  amber:       '#f5a742',
  green:       '#22c55e',
  blue:        '#3B82F6',
} as const

export default async function TreinamentosAdminPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const role = profile.role || 'vendedor'
  if (role === 'vendedor') redirect('/vendedor/treinamentos')

  const supabase = await createClient()

  // vendedores do tenant
  const { data: vendedores } = await supabase
    .from('profiles')
    .select('id, name, vendor_id')
    .eq('role', 'vendedor')
    .order('name')

  // XP de cada vendedor (tabela pode não existir — fallback silencioso)
  const { data: gamificacao } = await supabase
    .from('gamificacao')
    .select('usuario_id, xp_total, nivel')

  const xpMap: Record<string, { xp: number; nivel: number }> = {}
  for (const g of gamificacao || []) {
    xpMap[g.usuario_id] = { xp: g.xp_total, nivel: g.nivel }
  }

  const totalXP    = LMS_TRILHAS.reduce((a, t) => a + t.xpReward, 0)
  const totalMods  = LMS_TRILHAS.reduce((a, t) => a + t.lessons.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text, padding: '1.5rem 2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em' }}>
          Treinamentos — Visão Gerencial
        </div>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
          {LMS_TRILHAS.length} trilhas · {totalMods} módulos · {totalXP} XP total disponível
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Trilhas', value: LMS_TRILHAS.length, color: C.gold },
          { label: 'Módulos', value: totalMods, color: C.amber },
          { label: 'XP disponível', value: totalXP, color: C.blue },
          { label: 'Vendedores', value: vendedores?.length ?? 0, color: C.green },
        ].map(k => (
          <div key={k.label} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.75rem', padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Trilhas overview */}
        <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>Conteúdo disponível</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {LMS_TRILHAS.map((trilha, i) => (
              <div key={trilha.id} style={{
                padding: '0.75rem 1rem',
                borderBottom: i < LMS_TRILHAS.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1rem' }}>{trilha.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text }}>{trilha.title}</div>
                    <div style={{ fontSize: '0.6rem', color: C.muted, fontFamily: 'DM Mono, monospace' }}>{trilha.lessons.length} módulos</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: C.amber, fontWeight: 700 }}>+{trilha.xpReward} XP</span>
                  <Link href={`/vendedor/treinamentos/${trilha.id}`} style={{
                    fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: C.muted,
                    textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: '0.25rem',
                    padding: '0.2rem 0.5rem',
                  }}>
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progresso dos vendedores */}
        <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>XP por vendedor</span>
          </div>
          {(!vendedores || vendedores.length === 0) ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: C.muted, fontSize: '0.75rem', fontFamily: 'DM Mono, monospace' }}>Nenhum vendedor cadastrado.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {vendedores
                .map(v => ({ ...v, xp: xpMap[v.id]?.xp ?? 0, nivel: xpMap[v.id]?.nivel ?? 0 }))
                .sort((a, b) => b.xp - a.xp)
                .map((v, i) => {
                  const pct = totalXP > 0 ? Math.round((v.xp / totalXP) * 100) : 0
                  return (
                    <div key={v.id} style={{
                      padding: '0.625rem 1rem',
                      borderBottom: i < vendedores.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.75rem', color: C.text, fontWeight: v.xp > 0 ? 600 : 400 }}>{v.name}</span>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          {v.nivel > 0 && (
                            <span style={{ fontSize: '0.55rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>Nv {v.nivel}</span>
                          )}
                          <span style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: v.xp > 0 ? C.amber : C.muted, fontWeight: 700 }}>{v.xp} XP</span>
                        </div>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: 3, width: `${pct}%`, background: C.amber, borderRadius: 2, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
          {(!gamificacao || gamificacao.length === 0) && vendedores && vendedores.length > 0 && (
            <div style={{ padding: '0.5rem 1rem', borderTop: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: C.muted, margin: 0 }}>
                Progresso zerado — vendedores ainda não iniciaram os treinamentos.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
