import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, name').eq('id', user.id).single()

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  
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
