import { createClient } from '@/lib/supabase/server'

// ── Tipos ─────────────────────────────────────────────────────

export interface CatalogoTrilha {
  id: string
  titulo: string
  descricao: string | null
  icon: string | null
  cor: string | null
  is_global: boolean
  ordem: number
  moduloCount: number
  totalXp: number
  progressoPct: number
}

export interface TrilhaDetalhe {
  id: string
  titulo: string
  descricao: string | null
  icon: string | null
  cor: string | null
  is_global: boolean
  modulos: ModuloResumo[]
}

export interface ModuloResumo {
  id: string
  titulo: string
  descricao: string | null
  ordem: number
  xp_reward: number
  aprovacao_minima: number | null
  aulaCount: number
  questaoCount: number
  aprovado: boolean
}

export interface ModuloDetalhe {
  id: string
  trilha_id: string
  titulo: string
  descricao: string | null
  xp_reward: number
  aprovacao_minima: number | null
  aulas: AulaResumo[]
  temProva: boolean
}

export interface AulaResumo {
  id: string
  titulo: string
  tipo_conteudo: string | null
  ordem: number
  xp_reward: number
  concluida: boolean
}

export interface ProvaComQuestoes {
  id: string
  titulo: string
  nota_minima: number
  questoes: QuestaoProva[]
}

export interface QuestaoProva {
  id: string
  pergunta: string
  opcoes: string[]
  indice_correta: number
  explicacao: string | null
}

// ── getCatalogo ───────────────────────────────────────────────
export async function getCatalogo(userId: string): Promise<CatalogoTrilha[]> {
  const supabase = await createClient()

  const { data: trilhas, error } = await supabase
    .from('trilhas')
    .select('id, titulo, descricao, icon, cor, is_global, ordem')
    .eq('ativa', true)
    .order('ordem', { ascending: true })

  if (error || !trilhas) return []

  const result = await Promise.all(
    trilhas.map(async (trilha): Promise<CatalogoTrilha> => {
      const { data: modulos } = await supabase
        .from('modulos')
        .select('id, xp_reward')
        .eq('trilha_id', trilha.id)

      const moduloIds = (modulos ?? []).map(m => m.id)
      const totalXp = (modulos ?? []).reduce((acc, m) => acc + (m.xp_reward ?? 0), 0)

      let totalAulas = 0
      let aulasConcluidas = 0

      if (moduloIds.length > 0) {
        const { data: aulas } = await supabase
          .from('aulas')
          .select('id')
          .in('modulo_id', moduloIds)

        const aulaIds = (aulas ?? []).map(a => a.id)
        totalAulas = aulaIds.length

        if (aulaIds.length > 0) {
          const { data: progresso } = await supabase
            .from('progresso_aulas')
            .select('aula_id')
            .eq('usuario_id', userId)
            .in('aula_id', aulaIds)

          aulasConcluidas = (progresso ?? []).length
        }
      }

      const progressoPct =
        totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

      return {
        id: trilha.id,
        titulo: trilha.titulo,
        descricao: trilha.descricao ?? null,
        icon: trilha.icon ?? null,
        cor: trilha.cor ?? null,
        is_global: trilha.is_global ?? false,
        ordem: trilha.ordem ?? 0,
        moduloCount: moduloIds.length,
        totalXp,
        progressoPct,
      }
    })
  )

  return result
}

// ── getTrilha ─────────────────────────────────────────────────
export async function getTrilha(
  trilhaId: string,
  userId: string
): Promise<TrilhaDetalhe | null> {
  const supabase = await createClient()

  const { data: trilha, error } = await supabase
    .from('trilhas')
    .select('id, titulo, descricao, icon, cor, is_global')
    .eq('id', trilhaId)
    .eq('ativa', true)
    .single()

  if (error || !trilha) return null

  const { data: modulosRaw } = await supabase
    .from('modulos')
    .select('id, titulo, descricao, ordem, xp_reward, aprovacao_minima')
    .eq('trilha_id', trilhaId)
    .order('ordem', { ascending: true })

  const modulos: ModuloResumo[] = await Promise.all(
    (modulosRaw ?? []).map(async (m): Promise<ModuloResumo> => {
      const { count: aulaCount } = await supabase
        .from('aulas')
        .select('id', { count: 'exact', head: true })
        .eq('modulo_id', m.id)

      let questaoCount = 0
      const { data: prova } = await supabase
        .from('provas')
        .select('id')
        .eq('modulo_id', m.id)
        .maybeSingle()

      if (prova) {
        const { count: qCount } = await supabase
          .from('questoes_prova')
          .select('id', { count: 'exact', head: true })
          .eq('prova_id', prova.id)
        questaoCount = qCount ?? 0
      }

      const { data: prog } = await supabase
        .from('progresso_modulos')
        .select('aprovado')
        .eq('usuario_id', userId)
        .eq('modulo_id', m.id)
        .maybeSingle()

      return {
        id: m.id,
        titulo: m.titulo,
        descricao: m.descricao ?? null,
        ordem: m.ordem ?? 0,
        xp_reward: m.xp_reward ?? 0,
        aprovacao_minima: m.aprovacao_minima ?? null,
        aulaCount: aulaCount ?? 0,
        questaoCount,
        aprovado: prog?.aprovado === true,
      }
    })
  )

  return {
    id: trilha.id,
    titulo: trilha.titulo,
    descricao: trilha.descricao ?? null,
    icon: trilha.icon ?? null,
    cor: trilha.cor ?? null,
    is_global: trilha.is_global ?? false,
    modulos,
  }
}

// ── getModulo ─────────────────────────────────────────────────
export async function getModulo(
  moduloId: string,
  userId: string
): Promise<ModuloDetalhe | null> {
  const supabase = await createClient()

  const { data: modulo, error } = await supabase
    .from('modulos')
    .select('id, trilha_id, titulo, descricao, xp_reward, aprovacao_minima')
    .eq('id', moduloId)
    .single()

  if (error || !modulo) return null

  const { data: aulasRaw } = await supabase
    .from('aulas')
    .select('id, titulo, tipo_conteudo, ordem, xp_reward')
    .eq('modulo_id', moduloId)
    .order('ordem', { ascending: true })

  const aulaIds = (aulasRaw ?? []).map(a => a.id)

  let concluidasSet = new Set<string>()
  if (aulaIds.length > 0) {
    const { data: progressoAulas } = await supabase
      .from('progresso_aulas')
      .select('aula_id')
      .eq('usuario_id', userId)
      .in('aula_id', aulaIds)

    concluidasSet = new Set((progressoAulas ?? []).map(p => p.aula_id))
  }

  const aulas: AulaResumo[] = (aulasRaw ?? []).map(a => ({
    id: a.id,
    titulo: a.titulo,
    tipo_conteudo: a.tipo_conteudo ?? null,
    ordem: a.ordem ?? 0,
    xp_reward: a.xp_reward ?? 0,
    concluida: concluidasSet.has(a.id),
  }))

  const { data: prova } = await supabase
    .from('provas')
    .select('id')
    .eq('modulo_id', moduloId)
    .maybeSingle()

  return {
    id: modulo.id,
    trilha_id: modulo.trilha_id,
    titulo: modulo.titulo,
    descricao: modulo.descricao ?? null,
    xp_reward: modulo.xp_reward ?? 0,
    aprovacao_minima: modulo.aprovacao_minima ?? null,
    aulas,
    temProva: !!prova,
  }
}

// ── getProva ──────────────────────────────────────────────────
// Phase 2: indice_correta ainda incluído (Phase 3 remove do client)
export async function getProva(
  moduloId: string
): Promise<ProvaComQuestoes | null> {
  const supabase = await createClient()

  const { data: prova, error } = await supabase
    .from('provas')
    .select('id, titulo, nota_minima')
    .eq('modulo_id', moduloId)
    .single()

  if (error || !prova) return null

  const { data: questoesRaw } = await supabase
    .from('questoes_prova')
    .select('id, pergunta, opcoes, indice_correta, explicacao')
    .eq('prova_id', prova.id)
    .order('id', { ascending: true })

  const questoes: QuestaoProva[] = (questoesRaw ?? []).map(q => ({
    id: q.id,
    pergunta: q.pergunta,
    opcoes: Array.isArray(q.opcoes) ? q.opcoes as string[] : [],
    indice_correta: q.indice_correta,
    explicacao: q.explicacao ?? null,
  }))

  return {
    id: prova.id,
    titulo: prova.titulo,
    nota_minima: prova.nota_minima ?? 70,
    questoes,
  }
}
