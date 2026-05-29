import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopNavBar } from '@/components/ui/TopNavBar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let profile: { role: string; name: string; tenant_id: string | null } | null = null
  let jwtRole = 'vendedor'

  if (user) {
    let { data: dbProfile } = await supabase
      .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()
    jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'

    if (!dbProfile) {
      const adminDb = createAdminClient()
      const { data: newProfile, error } = await adminDb.from('profiles').insert({
        id: user.id,
        role: jwtRole,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        tenant_id: jwtRole === 'super_admin' ? user.id : null
      }).select('role, name, tenant_id').single()
      
      if (!error && newProfile) {
        dbProfile = newProfile
      }
    } else if (!dbProfile.tenant_id && (jwtRole === 'super_admin' || dbProfile.role === 'super_admin')) {
      const adminDb = createAdminClient()
      await adminDb.from('profiles').update({ tenant_id: user.id }).eq('id', user.id)
      dbProfile.tenant_id = user.id
    }
    
    if (dbProfile) profile = dbProfile
  }

  const role = profile?.role || jwtRole
  const userName = profile?.name || user.email?.split('@')[0] || 'Usuário'

  return (
    <div className="bg-background min-h-screen text-body-base font-body-base">
      <TopNavBar name={userName} role={role} />
      <Sidebar role={role} name={userName} />
      <main className="lg:ml-[280px] pt-16 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
