'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/auth/apiKey'
import { revalidatePath } from 'next/cache'

const UNIQUE_VIOLATION = '23505'
const MAX_ATTEMPTS = 3

export type ApiKeyRow = {
  id: string
  tenant_id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  revoked_at: string | null
  created_at: string
}

export async function createApiKey(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado.' }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return { error: 'Permissão negada. Apenas Super Admin.' }
  }

  const tenantId = formData.get('tenant_id') as string
  const name = formData.get('name') as string

  if (!tenantId) {
    return { error: 'Selecione uma empresa.' }
  }

  const adminDb = createAdminClient()

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()

    const { error: insertError } = await adminDb.from('api_keys').insert({
      tenant_id: tenantId,
      name: name ?? '',
      key_prefix: keyPrefix,
      key_hash: keyHash,
      created_by: user.id,
    })

    if (!insertError) {
      revalidatePath('/dashboard/super-admin')
      return { success: true, rawKey }
    }

    if (insertError.code !== UNIQUE_VIOLATION) {
      console.error('Error creating API key:', insertError)
      return { error: 'Erro ao gerar a API key: ' + insertError.message }
    }
    // colisão de key_prefix — tenta novamente com uma key nova
  }

  return { error: 'Não foi possível gerar uma API key única. Tente novamente.' }
}

export async function revokeApiKey(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return { error: 'Permissão negada. Apenas Super Admin.' }
  }

  const adminDb = createAdminClient()
  const { error } = await adminDb.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/super-admin')
  return { success: true }
}

export async function listApiKeys(): Promise<{ data?: ApiKeyRow[]; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return { error: 'Permissão negada. Apenas Super Admin.' }
  }

  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('api_keys')
    .select('id, tenant_id, name, key_prefix, last_used_at, revoked_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: (data ?? []) as ApiKeyRow[] }
}
