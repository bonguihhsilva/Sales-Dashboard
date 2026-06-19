import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { Sidebar } from '@/components/ui/Sidebar'

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[9999] focus:bg-surface focus:border focus:border-primary focus:text-on-surface focus:text-sm focus:font-bold focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>
      <Sidebar role={role} name={userName} tenants={tenants} activeTenantId={profile.tenant_id} />
      <main id="main-content" className="lg:ml-[280px] pt-14 lg:pt-0 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
