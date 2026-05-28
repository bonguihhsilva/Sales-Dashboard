import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: profile } = await supabase
    .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'

  if (!profile) {
    const adminDb = createAdminClient()
    const { data: newProfile, error } = await adminDb.from('profiles').insert({
      id: user.id,
      role: jwtRole,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      tenant_id: jwtRole === 'super_admin' ? user.id : null
    }).select('role, name, tenant_id').single()
    
    if (!error && newProfile) {
      profile = newProfile
    }
  } else if (!profile.tenant_id && (jwtRole === 'super_admin' || profile.role === 'super_admin')) {
    const adminDb = createAdminClient()
    await adminDb.from('profiles').update({ tenant_id: user.id }).eq('id', user.id)
    profile.tenant_id = user.id
  }

  if (jwtRole === 'vendedor') {
    // Vendedores have their own layout/pages or just redirect them
    redirect('/meu-resultado')
  }

  const role = profile?.role || jwtRole

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={role} name={profile?.name || 'Usuário'} />
      <main className="flex-1 overflow-y-auto relative bg-background">
        {children}
      </main>
    </div>
  )
}
