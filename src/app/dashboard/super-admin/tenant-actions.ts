'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function switchTenantAction(tenantId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // Validar se o usuário é de fato super_admin no banco
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    throw new Error('Acesso negado: Apenas super administradores podem alternar de organização.')
  }

  const cookieStore = await cookies()
  if (tenantId) {
    cookieStore.set('active_tenant_id', tenantId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 semana
    })
  } else {
    cookieStore.delete('active_tenant_id')
  }
  revalidatePath('/', 'layout')
}

