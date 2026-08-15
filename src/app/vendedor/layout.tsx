import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import type { TenantModules } from '@/lib/modules'

export const dynamic = 'force-dynamic'

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role = 'vendedor'
  let userName = 'Usuário Vendedor'
  let modules: Partial<TenantModules> | null = null

  if (user) {
    const { data: dbProfile } = await supabase
      .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()

    const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
    role = dbProfile?.role || jwtRole
    userName = dbProfile?.name || 'Usuário'

    if (dbProfile?.tenant_id) {
      const { data: tenant } = await supabase.from('tenants').select('modules').eq('id', dbProfile.tenant_id).single()
      modules = (tenant?.modules as Partial<TenantModules> | null) ?? null
    }
  }

  if (role !== 'vendedor' && role !== 'super_admin' && role !== 'adm' && role !== 'gerente') {
    redirect('/login')
  }

  return (
    <div className="bg-background min-h-screen text-body-base font-body-base">
      <Sidebar role="vendedor" name={userName} modules={modules} />
      <main className="lg:ml-[280px] pt-14 lg:pt-0 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
