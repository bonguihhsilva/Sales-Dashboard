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
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

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
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let listResult: any = { data: { users: [] } }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      listResult = await admin.auth.admin.listUsers({ perPage: 1000 })
    } catch (err) {
      // silently ignore fetch failed when running without valid Service Role Key
    }
  }

  const { data: profiles } = await supabase.from('profiles').select('*').eq('tenant_id', tenantId).order('name')
  
  const authUsers = listResult?.data?.users ?? []

  const users: UserRow[] = (profiles ?? []).map((p) => ({
    ...(p as Profile),
    last_sign_in_at: authUsers.find((u: any) => u.id === p.id)?.last_sign_in_at ?? null,
  }))

  // Filtros em memoria (lista pequena — 3 lojas)
  const { role, loja } = await searchParams
  const filteredUsers = users.filter((u) => {
    if (role && u.role !== role) return false
    if (loja && u.store !== loja) return false
    return true
  })

  // Fetch stores for the tenant
  const { data: dbStores } = await supabase.from('stores').select('*').eq('tenant_id', tenantId).order('name')
  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name, color: s.color }))

  return (
    <UsersClient
      users={filteredUsers}
      activeRole={role ?? null}
      activeLoja={loja ?? null}
      stores={stores}
    />
  )
}


