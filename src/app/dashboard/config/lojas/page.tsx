import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import LojasClient from './LojasClient'

export const dynamic = 'force-dynamic'

export default async function LojasPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')
  if (!['adm', 'super_admin'].includes(profile?.role || '')) redirect('/dashboard')

  const admin = createAdminClient()
  const { data: stores } = await admin
    .from('stores')
    .select('id, name, color, ativo')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true })

  return <LojasClient stores={stores ?? []} />
}
