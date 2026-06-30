'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function markLicaoComplete(licaoId: string, moduloId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const adminDb = createAdminClient()

  const { data: licao } = await adminDb
    .from('aulas')
    .select('id, modulo_id, xp_reward')
    .eq('id', licaoId)
    .eq('modulo_id', moduloId)
    .maybeSingle()

  if (!licao) {
    throw new Error('Lição não encontrada neste módulo')
  }

  const { data: profile } = await adminDb
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) throw new Error('Empresa do usuário não configurada')

  // Verifica se já estava concluída ANTES do upsert (evita XP duplicado)
  const { data: jaExistia } = await adminDb
    .from('progresso_aulas')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('aula_id', licaoId)
    .maybeSingle()

  const { error } = await adminDb
    .from('progresso_aulas')
    .upsert(
      {
        tenant_id: profile.tenant_id,
        usuario_id: user.id,
        aula_id: licaoId,
        concluida_em: new Date().toISOString(),
      },
      { onConflict: 'usuario_id,aula_id' }
    )

  if (error) throw new Error(error.message)

  // Credita XP só na primeira conclusão
  if (!jaExistia && licao.xp_reward > 0) {
    const { error: xpError } = await adminDb.rpc('lms_grant_xp', {
      p_user: user.id,
      p_amount: licao.xp_reward,
    })
    if (xpError) throw new Error(xpError.message)
  }
}
