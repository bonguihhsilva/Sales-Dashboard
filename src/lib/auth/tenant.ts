import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function getTenantContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, tenant_id, vendor_id')
    .eq('id', user.id)
    .single()

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  const role = profile?.role || jwtRole
  let activeTenantId = profile?.tenant_id

  // Se o usuário for super_admin, ele pode usar o cookie para "incorporar" (masquerade) outra empresa
  if (role === 'super_admin') {
    const cookieStore = await cookies()
    const masqueradeTenantId = cookieStore.get('active_tenant_id')?.value

    if (masqueradeTenantId) {
      activeTenantId = masqueradeTenantId
    } else {
      activeTenantId = null
    }
  }

  return {
    user,
    profile: {
      ...profile,
      role,
      tenant_id: activeTenantId,
      original_tenant_id: profile?.tenant_id // Guarda o tenant real do perfil
    }
  }
}
