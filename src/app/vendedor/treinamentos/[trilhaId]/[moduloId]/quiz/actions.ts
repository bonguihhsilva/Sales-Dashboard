'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitQuiz(
  moduloId: string,
  respostas: Record<string, number> // id_questao -> index_alternativa
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const adminDb = createAdminClient()

  // 1. Limite de tentativas (cooldown) nas últimas 24 horas
  const umDiaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: tentativasRecentes, error: countErr } = await adminDb
    .from('quiz_resultados')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('modulo_id', moduloId)
    .gt('criado_em', umDiaAtras)

  if (countErr) throw countErr

  if (tentativasRecentes && tentativasRecentes.length >= 5) {
    throw new Error('Limite diário de tentativas atingido. Você excedeu o limite de 5 tentativas a cada 24 horas para este módulo.')
  }

  const { data: modulo } = await adminDb
    .from('modulos').select('xp_reward').eq('id', moduloId).single()
  if (!modulo) throw new Error('Módulo não encontrado')

  const { data: aulas, error: aulasErr } = await adminDb
    .from('aulas')
    .select('id')
    .eq('modulo_id', moduloId)

  if (aulasErr) throw aulasErr

  if (aulas && aulas.length > 0) {
    const aulaIds = aulas.map(a => a.id)
    const { data: progresso, error: progressoErr } = await adminDb
      .from('progresso_aulas')
      .select('aula_id')
      .eq('usuario_id', user.id)
      .in('aula_id', aulaIds)

    if (progressoErr) throw progressoErr

    const concluidasCount = progresso ? progresso.length : 0
    if (concluidasCount < aulas.length) {
      throw new Error('Complete todas as aulas do módulo antes de realizar a prova.')
    }
  }

  const { data: prova } = await adminDb
    .from('provas').select('id, nota_minima').eq('modulo_id', moduloId).single()
  if (!prova) throw new Error('Prova deste módulo não configurada')

  // Gabarito real do banco — nunca exposto ao client antes do envio
  const { data: questoesReais } = await adminDb
    .from('questoes_prova')
    .select('id, indice_correta, explicacao')
    .eq('prova_id', prova.id)

  if (!questoesReais || questoesReais.length === 0) {
    throw new Error('Nenhuma questão cadastrada para este quiz')
  }

  let acertos = 0
  const gabarito: Record<string, { correta: number; explicacao: string | null; acertou: boolean }> = {}
  for (const q of questoesReais) {
    const escolhida = respostas[q.id]
    const acertou = escolhida !== undefined && escolhida === q.indice_correta
    if (acertou) acertos++
    gabarito[q.id] = { correta: q.indice_correta, explicacao: q.explicacao ?? null, acertou }
  }

  const pontuacao = Math.round((acertos / questoesReais.length) * 100)
  const aprovado = pontuacao >= (prova.nota_minima || 70)

  const { data: profile } = await adminDb
    .from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) throw new Error('Tenant não configurado')

  const { data: maxTentativa } = await adminDb
    .from('quiz_resultados')
    .select('tentativa')
    .eq('usuario_id', user.id)
    .eq('modulo_id', moduloId)
    .order('tentativa', { ascending: false })
    .limit(1)
    .maybeSingle()

  const proximaTentativa = maxTentativa ? (maxTentativa.tentativa + 1) : 1

  const { error: logError } = await adminDb
    .from('quiz_resultados')
    .insert({
      usuario_id: user.id,
      modulo_id: moduloId,
      pontuacao,
      aprovado,
      tentativa: proximaTentativa,
      respostas
    })

  if (logError) throw logError

  // Estado de aprovação ANTES desta tentativa (evita XP duplicado em re-tentativas)
  const { data: progressoAnterior } = await adminDb
    .from('progresso_modulos')
    .select('aprovado')
    .eq('usuario_id', user.id)
    .eq('modulo_id', moduloId)
    .maybeSingle()

  const jaEstavaAprovado = progressoAnterior?.aprovado === true

  const { error: resError } = await adminDb
    .from('progresso_modulos')
    .upsert({
      tenant_id: profile.tenant_id,
      usuario_id: user.id,
      modulo_id: moduloId,
      nota_prova: pontuacao,
      aprovado,
      concluido_em: new Date().toISOString()
    }, { onConflict: 'usuario_id,modulo_id' })

  if (resError) throw resError

  // XP só na 1a aprovação
  if (aprovado && !jaEstavaAprovado) {
    const xpGanhado = modulo.xp_reward || 0
    if (xpGanhado > 0) {
      const { error: xpError } = await adminDb.rpc('lms_grant_xp', {
        p_user: user.id,
        p_amount: xpGanhado,
      })
      if (xpError) throw xpError
    }
  }

  return { pontuacao, aprovado, gabarito }
}
