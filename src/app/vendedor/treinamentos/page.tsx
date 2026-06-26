import { getTenantContext } from '@/lib/auth/tenant'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
  goldBg:      'rgba(201,147,58,0.10)',
  goldBorder:  'rgba(201,147,58,0.25)',
  amber:       '#f5a742',
} as const

const CORES = ['gold', 'blue', 'gold', 'blue', 'gold', 'blue'] as const

export default async function TreinamentosPage() {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')

  const jwtRole = profile.role || 'vendedor'
  if (jwtRole !== 'vendedor' && jwtRole !== 'super_admin') redirect('/dashboard')

  const supabase = await createClient()

  // ── XP / nível do usuário ──────────────────────────────────────────────────
  const { data: gamificacao } = await supabase
    .from('gamificacao').select('xp_total, nivel').eq('usuario_id', user.id).maybeSingle()

  const xp    = gamificacao?.xp_total || 0
  const nivel = gamificacao?.nivel    || 1

  // ── Trilhas ────────────────────────────────────────────────────────────────
  const { data: trilhas } = await supabase
    .from('trilhas').select('id, titulo, descricao').eq('ativo', true).order('ordem', { ascending: true })

  // ── Progresso por trilha ───────────────────────────────────────────────────
  const trilhaIds = trilhas?.map(t => t.id) || []

  let progressoPorTrilha: Record<string, { concluidas: number; total: number }> = {}

  if (trilhaIds.length > 0) {
    const { data: modulos } = await supabase
      .from('modulos').select('id, trilha_id').in('trilha_id', trilhaIds)

    const moduloIds = modulos?.map(m => m.id) || []

    if (moduloIds.length > 0) {
      const { data: aulas } = await supabase
        .from('aulas').select('id, modulo_id').in('modulo_id', moduloIds)

      const aulaIds = aulas?.map(a => a.id) || []

      const { data: progresso } = await supabase
        .from('progresso_aulas').select('aula_id')
        .eq('usuario_id', user.id)
        .in('aula_id', aulaIds)

      const concluidasSet = new Set(progresso?.map(p => p.aula_id) || [])

      for (const trilhaId of trilhaIds) {
        const modulosDaTrilha = modulos?.filter(m => m.trilha_id === trilhaId).map(m => m.id) || []
        const aulasDaTrilha   = aulas?.filter(a => modulosDaTrilha.includes(a.modulo_id)).map(a => a.id) || []
        const concluidas      = aulasDaTrilha.filter(id => concluidasSet.has(id)).length
        progressoPorTrilha[trilhaId] = { concluidas, total: aulasDaTrilha.length }
      }
    }
  }

  // ── Top Estudantes ─────────────────────────────────────────────────────────
  const { data: topGamificacao } = await supabase
    .from('gamificacao').select('usuario_id, xp_total, nivel')
    .order('xp_total', { ascending: false }).limit(5)

  let topEstudantes: { pos: number; name: string; nivel: number; xp: number; isMe: boolean }[] = []
  if (topGamificacao && topGamificacao.length > 0) {
    const userIds = topGamificacao.map(g => g.usuario_id)
    const { data: profilesList } = await supabase
      .from('profiles').select('id, name').in('id', userIds)
    topEstudantes = topGamificacao.map((g, i) => {
      const p = profilesList?.find(p => p.id === g.usuario_id)
      return { pos: i + 1, name: p?.name || 'Vendedor', nivel: g.nivel, xp: g.xp_total, isMe: g.usuario_id === user.id }
    })
  }

  // ── Histórico recente ──────────────────────────────────────────────────────
  const { data: historicoRows } = await supabase
    .from('progresso_aulas').select('aula_id, concluida_em')
    .eq('usuario_id', user.id).order('concluida_em', { ascending: false }).limit(5)

  let historico: { titulo: string; data: string; xp: number }[] = []
  if (historicoRows && historicoRows.length > 0) {
    const licaoIds = historicoRows.map(h => h.aula_id)
    const { data: licoesList } = await supabase
      .from('aulas').select('id, titulo').in('id', licaoIds)
    historico = historicoRows.map(h => {
      const l = licoesList?.find(l => l.id === h.aula_id)
      return { titulo: l?.titulo || 'Lição', data: h.concluida_em, xp: 10 }
    })
  }

  // ── Ranking position highlight ─────────────────────────────────────────────
  const posColors: Record<number, string> = { 1: C.amber, 2: '#94a3b8', 3: '#b45309' }

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text, padding: '1.5rem 2rem' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.0625rem', color: C.text, letterSpacing: '-0.02em' }}>
            Trilhas de Aprendizado
          </div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
            Evolua suas habilidades e ganhe XP
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 10, alignItems: 'stretch',
          background: C.elevated, border: `1px solid ${C.borderStrong}`,
          borderRadius: '0.625rem', padding: '0.5rem 0.75rem',
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nível</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.gold }}>{nivel}</div>
          </div>
          <div style={{ width: 1, background: C.borderStrong }} />
          <div>
            <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>XP Total</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.amber }}>{xp}</div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600, marginBottom: '0.75rem' }}>
        Trilhas disponíveis
      </div>

      {/* Trilhas grid */}
      {(!trilhas || trilhas.length === 0) ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: `1px dashed ${C.border}`, borderRadius: '0.875rem', marginBottom: '1.5rem' }}>
          <p style={{ color: C.muted, fontFamily: 'Manrope, sans-serif', fontSize: '0.875rem' }}>Nenhuma trilha disponível no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {trilhas.map((trilha, i) => (
            <TrilhaCard
              key={trilha.id}
              trilha={trilha}
              cor={CORES[i % CORES.length]}
              progress={progressoPorTrilha[trilha.id] ?? { concluidas: 0, total: 0 }}
            />
          ))}
        </div>
      )}

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.875rem' }}>

        {/* Ranking */}
        <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.5rem 0.875rem', borderBottom: `1px solid ${C.border}`, fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>
            Top estudantes
          </div>
          {topEstudantes.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: C.muted, fontSize: '0.75rem', fontFamily: 'Manrope, sans-serif' }}>Ranking indisponível.</p>
            </div>
          ) : (
            topEstudantes.map(t => (
              <div key={t.pos} style={{
                display: 'grid', gridTemplateColumns: '20px 1fr 48px',
                alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                borderBottom: `1px solid rgba(255,255,255,0.03)`,
                background: t.isMe ? 'rgba(201,147,58,0.04)' : 'transparent',
              }}>
                <span style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', fontWeight: 800, color: posColors[t.pos] || C.muted }}>{t.pos}º</span>
                <span style={{ fontSize: '0.6rem', fontFamily: 'Manrope, sans-serif', color: t.isMe ? C.gold : C.text, fontWeight: t.isMe ? 700 : 400 }}>
                  {t.isMe ? 'Você' : t.name}
                </span>
                <span style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: t.isMe ? C.gold : C.muted, textAlign: 'right' }}>{t.xp} xp</span>
              </div>
            ))
          )}
        </div>

        {/* Histórico */}
        <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.5rem 0.875rem', borderBottom: `1px solid ${C.border}`, fontSize: '0.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>
            Meu histórico
          </div>
          {historico.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: C.muted, fontSize: '0.75rem', fontFamily: 'Manrope, sans-serif' }}>Nenhum treinamento concluído.</p>
            </div>
          ) : (
            historico.map((h, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 44px 40px',
                alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                borderBottom: `1px solid rgba(255,255,255,0.03)`,
              }}>
                <span style={{ fontSize: '0.6rem', fontFamily: 'Manrope, sans-serif', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.titulo}</span>
                <span style={{ fontSize: '0.55rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>{new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                <span style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: C.amber, fontWeight: 700, textAlign: 'right' }}>+{h.xp}</span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
