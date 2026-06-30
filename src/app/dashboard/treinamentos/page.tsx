import { getTenantContext } from '@/lib/auth/tenant'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LMS as C } from '@/lib/lms/theme'
import Link from 'next/link'
import AdminLmsClient from './AdminLmsClient'

export const dynamic = 'force-dynamic'

export default async function TreinamentosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const role = profile.role || 'vendedor'
  if (role === 'vendedor') redirect('/vendedor/treinamentos')

  const { tab } = await searchParams
  const activeTab = tab === 'progresso' ? 'progresso' : 'conteudo'

  const supabase = await createClient()

  const [
    { data: trilhas },
    { data: modulos },
    { data: aulas },
    { data: provas },
    { data: questoesProva },
    { data: vendedores },
    { data: gamificacao },
  ] = await Promise.all([
    supabase.from('trilhas').select('*').order('ordem', { ascending: true }),
    supabase.from('modulos').select('*').order('ordem', { ascending: true }),
    supabase.from('aulas').select('*').order('ordem', { ascending: true }),
    supabase.from('provas').select('*'),
    supabase.from('questoes_prova').select('*'),
    supabase.from('profiles').select('id, name, vendor_id').eq('role', 'vendedor').order('name'),
    supabase.from('gamificacao').select('usuario_id, xp_total, nivel'),
  ])

  const xpMap: Record<string, { xp: number; nivel: number }> = {}
  for (const g of gamificacao || []) {
    xpMap[g.usuario_id] = { xp: g.xp_total, nivel: g.nivel }
  }

  const totalModulos = (modulos || []).length
  const totalXP = (modulos || []).reduce((acc, m) => acc + (m.xp_reward ?? 0), 0)

  const tabLink = (t: string) => `/dashboard/treinamentos${t === 'conteudo' ? '' : `?tab=${t}`}`
  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700,
    fontFamily: 'Syne, sans-serif', textDecoration: 'none', cursor: 'pointer',
    background: activeTab === t ? C.gold : 'transparent',
    color: activeTab === t ? C.bg : C.muted,
    border: `1px solid ${activeTab === t ? C.gold : C.border}`,
  })

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text }}>

      {/* Header + tabs */}
      <div style={{ padding: '1.5rem 2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em' }}>
              Treinamentos — Visão Gerencial
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
              {(trilhas || []).length} trilhas · {totalModulos} módulos · {totalXP} XP total disponível
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href={tabLink('conteudo')} style={tabStyle('conteudo')}>Conteúdo</Link>
            <Link href={tabLink('progresso')} style={tabStyle('progresso')}>Progresso</Link>
          </div>
        </div>
      </div>

      {activeTab === 'conteudo' ? (
        <AdminLmsClient
          initialTrilhas={trilhas || []}
          initialModulos={modulos || []}
          initialAulas={aulas || []}
          initialProvas={provas || []}
          initialQuestoesProva={(questoesProva || []).map(q => ({ ...q, opcoes: Array.isArray(q.opcoes) ? q.opcoes : [] }))}
          isSuperAdmin={profile.role === 'super_admin'}
        />
      ) : (
        <div style={{ padding: '1.5rem 2rem' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Trilhas', value: (trilhas || []).length, color: C.gold },
              { label: 'Módulos', value: totalModulos, color: C.amber },
              { label: 'XP disponível', value: totalXP, color: C.blue },
              { label: 'Vendedores', value: vendedores?.length ?? 0, color: C.green },
            ].map(k => (
              <div key={k.label} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.75rem', padding: '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Trilhas overview */}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
              <div style={{ padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>Conteúdo disponível</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(trilhas || []).map((trilha, i) => {
                  const modCount = (modulos || []).filter(m => m.trilha_id === trilha.id).length
                  const xp = (modulos || []).filter(m => m.trilha_id === trilha.id).reduce((a, m) => a + (m.xp_reward ?? 0), 0)
                  return (
                    <div key={trilha.id} style={{
                      padding: '0.625rem 1rem',
                      borderBottom: i < (trilhas || []).length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        {trilha.icon && <span style={{ fontSize: '1rem' }}>{trilha.icon}</span>}
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text }}>{trilha.titulo}</div>
                          <div style={{ fontSize: '0.625rem', color: C.muted, fontFamily: 'DM Mono, monospace' }}>{modCount} módulos</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.amber, fontWeight: 700 }}>+{xp} XP</span>
                        <Link href={`/vendedor/treinamentos/${trilha.id}`} className="lms-chip" style={{
                          fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted,
                          textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: '0.375rem',
                          padding: '0.25rem 0.5rem',
                        }}>Ver →</Link>
                      </div>
                    </div>
                  )
                })}
                {(trilhas || []).length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: C.muted, fontSize: '0.75rem', fontFamily: 'DM Mono, monospace' }}>Nenhuma trilha cadastrada ainda.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progresso dos vendedores */}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
              <div style={{ padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>XP por vendedor</span>
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
                                <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>Nv {v.nivel}</span>
                              )}
                              <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: v.xp > 0 ? C.amber : C.muted, fontWeight: 700 }}>{v.xp} XP</span>
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
                  <p style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, margin: 0 }}>
                    Progresso zerado — vendedores ainda não iniciaram os treinamentos.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
