import { getTenantContext } from '@/lib/auth/tenant'
import { Sidebar } from '@/components/ui/Sidebar'

export const dynamic = 'force-dynamic'

export default async function MuralLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getTenantContext()
  const userName = profile.name || 'Usuário'

  return (
    <div className="bg-background min-h-screen text-body-base font-body-base">
      <Sidebar role={profile.role} name={userName} activeTenantId={profile.tenant_id} modules={profile.modules} />
      <main className="lg:ml-[280px] pt-14 lg:pt-0 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
