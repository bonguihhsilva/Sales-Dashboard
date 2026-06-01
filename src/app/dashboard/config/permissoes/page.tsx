import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import PermissoesClient from './PermissoesClient'

export const dynamic = 'force-dynamic'

export default async function PermissoesPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')
  if (!['adm', 'super_admin'].includes(profile?.role || '')) redirect('/dashboard')

  const admin = createAdminClient()

  const { data: gerentes } = await admin
    .from('profiles')
    .select('id, name')
    .eq('tenant_id', profile.tenant_id)
    .eq('role', 'gerente')

  const { data: perms } = await admin
    .from('gerente_permissions')
    .select('user_id, permissions')
    .eq('tenant_id', profile.tenant_id)

  const permsMap = new Map((perms ?? []).map(p => [p.user_id, p.permissions as Record<string, boolean>]))

  const gerentesWithPerms = (gerentes ?? []).map(g => ({
    ...g,
    permissions: permsMap.get(g.id) ?? {},
  }))

  return <PermissoesClient gerentes={gerentesWithPerms} />
}
