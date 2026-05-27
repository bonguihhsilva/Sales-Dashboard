export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'
import UsersClient from './UsersClient'

export type UserRow = Profile & { last_sign_in_at: string | null }

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; loja?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Guard: somente adm/gerente/super_admin (D-01). Via app_metadata.
  const callerRole = user.app_metadata?.role as string | undefined
  if (!callerRole || !['adm', 'gerente', 'super_admin'].includes(callerRole)) {
    redirect('/meu-resultado')
  }

  // tenant_id do caller — para isolar a listagem (Pitfall 4)
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = callerProfile?.tenant_id

  // Profiles do tenant + last_sign_in_at via admin API
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const [{ data: profiles }, listResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('tenant_id', tenantId).order('name'),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])
  const authUsers = listResult.data?.users ?? []

  const users: UserRow[] = (profiles ?? []).map((p) => ({
    ...(p as Profile),
    last_sign_in_at: authUsers.find((u) => u.id === p.id)?.last_sign_in_at ?? null,
  }))

  // Filtros em memoria (lista pequena — 3 lojas)
  const { role, loja } = await searchParams
  const filteredUsers = users.filter((u) => {
    if (role && u.role !== role) return false
    if (loja && u.store !== loja) return false
    return true
  })

  return (
    <UsersClient
      users={filteredUsers}
      activeRole={role ?? null}
      activeLoja={loja ?? null}
    />
  )
}
