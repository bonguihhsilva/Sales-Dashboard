'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function markLicaoComplete(licaoId: string, moduloId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const adminDb = createAdminClient()

  // Valida que a lição pertence ao módulo informado (evita inserção de aula_id arbitrário)
  const { data: licao } = await adminDb
    .from('aulas')
    .select('id, modulo_id')
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

  // Já concluída? Upsert silencioso
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
}
