'use client'

import { Sidebar } from '@/components/shared/sidebar'
import { Topbar } from '@/components/shared/topbar'
import { useSidebar } from '@/hooks/use-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const sidebarWidth = collapsed ? 64 : 240

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <Topbar onLogout={handleLogout} />
      <main className="pt-14 px-4 md:px-6">
        <div
          className="md:ml-[var(--sidebar-w)]"
          style={{ ['--sidebar-w' as never]: `${sidebarWidth}px`, transition: 'margin-left 200ms ease' }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
