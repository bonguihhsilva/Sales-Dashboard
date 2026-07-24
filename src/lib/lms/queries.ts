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

  const trilhaIds = trilhas.map(t => t.id)
  if (trilhaIds.length === 0) return []

  // 1. Buscar todos os módulos de todas as trilhas ativas de uma vez
  const { data: todosModulos } = await supabase
    .from('modulos')
    .select('id, trilha_id, xp_reward')
    .in('trilha_id', trilhaIds)

  const modulosPorTrilha = new Map<string, Array<{ id: string; xp_reward: number }>>()
  const todosModuloIds: string[] = []
  for (const m of todosModulos ?? []) {
    todosModuloIds.push(m.id)
    const list = modulosPorTrilha.get(m.trilha_id) ?? []
    list.push({ id: m.id, xp_reward: m.xp_reward ?? 0 })
    modulosPorTrilha.set(m.trilha_id, list)
  }

  let todasAulas: Array<{ id: string; modulo_id: string }> = []
  if (todosModuloIds.length > 0) {
    // 2. Buscar todas as aulas dos módulos de uma vez
    const { data } = await supabase
      .from('aulas')
      .select('id, modulo_id')
      .in('modulo_id', todosModuloIds)
    todasAulas = data ?? []
  }

  const aulasPorModulo = new Map<string, string[]>()
  const todasAulaIds: string[] = []
  for (const a of todasAulas) {
    todasAulaIds.push(a.id)
    const list = aulasPorModulo.get(a.modulo_id) ?? []
    list.push(a.id)
    aulasPorModulo.set(a.modulo_id, list)
  }

  let progressoSet = new Set<string>()
  if (todasAulaIds.length > 0) {
    // 3. Buscar progresso das aulas do usuário em lote
    const { data: progresso } = await supabase
      .from('progresso_aulas')
      .select('aula_id')
      .eq('usuario_id', userId)
      .in('aula_id', todasAulaIds)
    progressoSet = new Set((progresso ?? []).map(p => p.aula_id))
  }

  // 4. Montar o catálogo em memória
  const result: CatalogoTrilha[] = trilhas.map(trilha => {
    const modulos = modulosPorTrilha.get(trilha.id) ?? []
    const moduloIds = modulos.map(m => m.id)
    const totalXp = modulos.reduce((acc, m) => acc + m.xp_reward, 0)

    let totalAulas = 0
    let aulasConcluidas = 0

    for (const moduloId of moduloIds) {
      const aulaIds = aulasPorModulo.get(moduloId) ?? []
      totalAulas += aulaIds.length
      for (const aulaId of aulaIds) {
        if (progressoSet.has(aulaId)) {
          aulasConcluidas++
        }
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

  const modulosRawList = modulosRaw ?? []
  const moduloIds = modulosRawList.map(m => m.id)

  const aulaCountMap = new Map<string, number>()
  const questaoCountMap = new Map<string, number>()
  const progressoMap = new Map<string, boolean>()

  if (moduloIds.length > 0) {
    const [aulasResult, provasResult, progressoResult] = await Promise.all([
      supabase
        .from('aulas')
        .select('id, modulo_id')
        .in('modulo_id', moduloIds),
      supabase
        .from('provas')
        .select('id, modulo_id')
        .in('modulo_id', moduloIds),
      supabase
        .from('progresso_modulos')
        .select('modulo_id, aprovado')
        .eq('usuario_id', userId)
        .in('modulo_id', moduloIds),
    ])

    const aulasData = aulasResult.data
    const provasData = provasResult.data
    const progressoData = progressoResult.data

    for (const a of aulasData ?? []) {
      aulaCountMap.set(a.modulo_id, (aulaCountMap.get(a.modulo_id) ?? 0) + 1)
    }

    const provas = provasData ?? []
    const provaIds = provas.map(p => p.id)
    const provaIdToModuloId = new Map<string, string>()
    for (const p of provas) {
      provaIdToModuloId.set(p.id, p.modulo_id)
    }

    if (provaIds.length > 0) {
      const { data: questoesData } = await supabase
        .from('questoes_prova')
        .select('id, prova_id')
        .in('prova_id', provaIds)

      for (const q of questoesData ?? []) {
        const moduloId = provaIdToModuloId.get(q.prova_id)
        if (moduloId) {
          questaoCountMap.set(moduloId, (questaoCountMap.get(moduloId) ?? 0) + 1)
        }
      }
    }

    for (const p of progressoData ?? []) {
      progressoMap.set(p.modulo_id, p.aprovado === true)
    }
  }

  const modulos: ModuloResumo[] = modulosRawList.map(m => ({
    id: m.id,
    titulo: m.titulo,
    descricao: m.descricao ?? null,
    ordem: m.ordem ?? 0,
    xp_reward: m.xp_reward ?? 0,
    aprovacao_minima: m.aprovacao_minima ?? null,
    aulaCount: aulaCountMap.get(m.id) ?? 0,
    questaoCount: questaoCountMap.get(m.id) ?? 0,
    aprovado: progressoMap.get(m.id) === true,
  }))

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

  // Busca aulas e prova em paralelo
  const [aulasResult, provaResult] = await Promise.all([
    supabase
      .from('aulas')
      .select('id, titulo, tipo_conteudo, ordem, xp_reward')
      .eq('modulo_id', moduloId)
      .order('ordem', { ascending: true }),
    supabase
      .from('provas')
      .select('id')
      .eq('modulo_id', moduloId)
      .maybeSingle(),
  ])

  const aulasRaw = aulasResult.data
  const prova = provaResult.data

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
