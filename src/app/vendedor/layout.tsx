import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'

export const dynamic = 'force-dynamic'

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role = 'vendedor'
  let userName = 'Usuário Vendedor'

  if (user) {
    const { data: dbProfile } = await supabase
      .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()

    const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
    role = dbProfile?.role || jwtRole
    userName = dbProfile?.name || 'Usuário'
  }

  if (role !== 'vendedor' && role !== 'super_admin' && role !== 'adm' && role !== 'gerente') {
    redirect('/login')
  }

  return (
    <div className="bg-background min-h-screen text-body-base font-body-base">
      <Sidebar role="vendedor" name={userName} />
      <main className="lg:ml-[280px] pt-14 lg:pt-0 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
