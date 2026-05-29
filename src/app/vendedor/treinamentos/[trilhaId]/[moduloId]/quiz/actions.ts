'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitQuiz(
  moduloId: string, 
  respostas: Record<string, number>, // id_questao -> index_alternativa
  questoes: any[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const adminDb = createAdminClient()

  // Buscar detalhes do módulo
  const { data: modulo } = await adminDb
    .from('modulos').select('aprovacao_minima, xp_reward').eq('id', moduloId).single()
  if (!modulo) throw new Error('Módulo não encontrado')

  // Calcular acertos
  let acertos = 0
  for (const q of questoes) {
    const escolhida = respostas[q.id]
    if (escolhida !== undefined) {
      if (q.alternativas[escolhida]?.correta) {
        acertos++
      }
    }
  }

  const pontuacao = Math.round((acertos / questoes.length) * 100)
  const aprovado = pontuacao >= (modulo.aprovacao_minima || 70)

  // Salvar resultado
  const { error: resError } = await adminDb
    .from('quiz_resultados')
    .insert({
      usuario_id: user.id,
      modulo_id: moduloId,
      pontuacao,
      aprovado,
      respostas,
      tentativa: 1
    })

  if (resError) throw resError

  // Se aprovado, dar XP
  if (aprovado) {
    const { data: gamificacao } = await adminDb
      .from('gamificacao')
      .select('*')
      .eq('usuario_id', user.id)
      .maybeSingle()

    if (gamificacao) {
      const novoXp = gamificacao.xp_total + (modulo.xp_reward || 0)
      const novoNivel = Math.floor(novoXp / 1000) + 1 // Regra simples: 1 nível a cada 1000 XP

      await adminDb
        .from('gamificacao')
        .update({ xp_total: novoXp, nivel: novoNivel })
        .eq('usuario_id', user.id)
    } else {
      await adminDb
        .from('gamificacao')
        .insert({
          usuario_id: user.id,
          xp_total: modulo.xp_reward || 0,
          nivel: 1,
          badges: []
        })
    }
  }

  return { pontuacao, aprovado }
}
