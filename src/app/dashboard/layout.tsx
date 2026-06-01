import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopNavBar } from '@/components/ui/TopNavBar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getTenantContext()
  const role = profile.role
  const userName = profile.name || user.email?.split('@')[0] || 'Usuário'

  let tenants: any[] = []
  if (role === 'super_admin') {
    const adminDb = createAdminClient()
    const { data } = await adminDb.from('tenants').select('id, nome').order('nome')
    if (data) tenants = data
  }

  return (
    <div className="bg-background min-h-screen text-body-base font-body-base">
      <TopNavBar name={userName} role={role} tenants={tenants} activeTenantId={profile.tenant_id} />
      <Sidebar role={role} name={userName} />
      <main className="lg:ml-[280px] pt-16 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
