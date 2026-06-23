import { getTenantContext } from '@/lib/auth/tenant'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SectionTitle, PageHeader } from '@/components/ui'
import { TrilhaCard } from './TrilhaCard'

export const dynamic = 'force-dynamic'

export default async function TreinamentosPage() {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')

  const jwtRole = profile.role || 'vendedor'
  if (jwtRole !== 'vendedor' && jwtRole !== 'super_admin') redirect('/dashboard')

  const supabase = await createClient()

  const { data: gamificacao } = await supabase
    .from('gamificacao').select('*').eq('usuario_id', user.id).maybeSingle()

  const { data: trilhas } = await supabase
    .from('trilhas').select('*').eq('ativo', true).order('ordem', { ascending: true })

  const xp = gamificacao?.xp_total || 0
  const nivel = gamificacao?.nivel || 1

  // Fetch Top Estudantes (Ranking)
  const { data: topGamificacao } = await supabase
    .from('gamificacao')
    .select('usuario_id, xp_total, nivel')
    .order('xp_total', { ascending: false })
    .limit(5)

  let topEstudantes: any[] = []
  if (topGamificacao && topGamificacao.length > 0) {
    const userIds = topGamificacao.map((g) => g.usuario_id)
    const { data: profilesList } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds)
    
    topEstudantes = topGamificacao.map((g, index) => {
      const p = profilesList?.find((p) => p.id === g.usuario_id)
      return {
        pos: index + 1,
        name: p?.name || 'Vendedor',
        nivel: g.nivel,
        xp: g.xp_total,
        isMe: g.usuario_id === user.id
      }
    })
  }

  // Fetch Historico (Últimas lições)
  const { data: historicoRows } = await supabase
    .from('progresso_aulas')
    .select('aula_id, concluida_em')
    .eq('usuario_id', user.id)
    .order('concluida_em', { ascending: false })
    .limit(5)

  let historico: any[] = []
  if (historicoRows && historicoRows.length > 0) {
    const licoesIds = historicoRows.map((h) => h.aula_id)
    const { data: licoesList } = await supabase
      .from('aulas')
      .select('id, titulo')
      .in('id', licoesIds)

    historico = historicoRows.map((h) => {
      const l = licoesList?.find((l) => l.id === h.aula_id)
      return {
        titulo: l?.titulo || 'Lição',
        data: h.concluida_em,
        xp: 10
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title="Trilhas de Aprendizado"
          subtitle="Aumente seu conhecimento e ganhe XP"
          breadcrumbs={[
            { label: 'Meu Resultado', href: '/vendedor/meu-resultado' },
            { label: 'Treinamentos' },
          ]}
          actions={
            <div style={{ display: 'flex', gap: '10px', background: 'var(--surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>Seu Nível</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>Nível {nivel}</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }}></div>
              <div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>XP Total</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--meta3, #f5a742)' }}>{xp} XP</div>
              </div>
            </div>
          }
        />
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <SectionTitle>Trilhas Disponíveis</SectionTitle>
        
        {(!trilhas || trilhas.length === 0) ? (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', marginTop: '1rem' }}>
            <p style={{ color: 'var(--muted)' }}>Nenhuma trilha disponível no momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {trilhas.map((trilha) => (
              <TrilhaCard key={trilha.id} trilha={trilha} />
            ))}
          </div>
        )}
      </div>

      {/* Tabelas Adicionais */}
      <div style={{ padding: '0 2.5rem 2rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Histórico */}
        <div>
          <SectionTitle>Meu Histórico</SectionTitle>
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {historico.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Nenhum treinamento concluído recentemente.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Treinamento</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Data</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>XP</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text)', fontWeight: 500 }}>{h.titulo}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{new Date(h.data).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--meta3, #f5a742)', fontWeight: 700 }}>+{h.xp}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ background: '#10b98122', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>Concluído</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Ranking de Aprendizado */}
        <div>
          <SectionTitle>Top Estudantes</SectionTitle>
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {topEstudantes.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Ranking indisponível.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', width: '50px' }}>Pos</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Vendedor</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Nível</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', textAlign: 'right' }}>XP Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topEstudantes.map((t) => {
                    let posColor = 'var(--muted)'
                    if (t.pos === 1) posColor = '#f5a742'
                    if (t.pos === 2) posColor = '#94a3b8'
                    if (t.pos === 3) posColor = '#b45309'

                    return (
                      <tr key={t.pos} style={{ borderBottom: '1px solid var(--border)', background: t.isMe ? 'var(--surface2)' : 'transparent' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: posColor }}>{t.pos}º</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text)', fontWeight: 500 }}>{t.isMe ? 'Você' : t.name}</td>
                        <td style={{ padding: '12px 16px', color: t.isMe ? 'var(--accent)' : 'var(--muted)' }}>Lvl {t.nivel}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text)', fontWeight: 700, textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{t.xp}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
