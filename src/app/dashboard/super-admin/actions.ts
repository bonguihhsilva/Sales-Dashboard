'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTenant(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado.' }
  }

  // Verifica se é super admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return { error: 'Permissão negada. Apenas Super Admin.' }
  }

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const color = formData.get('color') as string

  if (!name || !slug) {
    return { error: 'Nome e Slug são obrigatórios.' }
  }

  const adminDb = createAdminClient()

  // Verifica se o slug já existe
  const { data: existing } = await adminDb.from('tenants').select('id').eq('slug', slug).single()
  if (existing) {
    return { error: 'Já existe uma empresa com este slug.' }
  }

  // Cria a empresa
  const { error: insertError } = await adminDb.from('tenants').insert({
    nome: name,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    cor_primaria: color || null,
    ativo: true,
  })

  if (insertError) {
    console.error('Error creating tenant:', insertError)
    return { error: 'Erro ao criar a empresa: ' + insertError.message }
  }

  revalidatePath('/dashboard/super-admin')
  return { success: true }
}

export async function toggleTenantStatus(id: string, active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return { error: 'Permissão negada.' }
  }

  const adminDb = createAdminClient()
  const { error } = await adminDb.from('tenants').update({ ativo: active }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/super-admin')
  return { success: true }
}
