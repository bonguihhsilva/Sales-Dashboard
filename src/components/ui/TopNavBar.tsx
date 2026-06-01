'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TenantSwitcher } from './TenantSwitcher'

export function TopNavBar({ name, role = 'super_admin', tenants = [], activeTenantId }: { name: string, role?: string, tenants?: any[], activeTenantId?: string | null }) {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-page h-16 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
      <div className="flex items-center gap-stack-lg">
        <span className="font-headline-lg text-headline-lg font-bold text-primary">EliteExec</span>
        {role !== 'vendedor' && (
          <div className="hidden md:flex gap-stack-md ml-stack-lg">
            <Link href="/dashboard" className={`font-body-base text-body-base transition-colors ${pathname === '/dashboard' ? 'text-primary border-b-2 border-primary pb-1 font-bold' : 'text-on-surface-variant hover:text-primary'}`}>Dashboard</Link>
            <Link href="/dashboard/treinamentos" className={`font-body-base text-body-base transition-colors ${pathname.includes('/treinamentos') ? 'text-primary border-b-2 border-primary pb-1 font-bold' : 'text-on-surface-variant hover:text-primary'}`}>Learning</Link>
            <Link href="/dashboard/comissao" className={`font-body-base text-body-base transition-colors ${pathname.includes('/comissao') ? 'text-primary border-b-2 border-primary pb-1 font-bold' : 'text-on-surface-variant hover:text-primary'}`}>Comissões</Link>
            <Link href="/dashboard/rh" className={`font-body-base text-body-base transition-colors ${pathname.includes('/rh') ? 'text-primary border-b-2 border-primary pb-1 font-bold' : 'text-on-surface-variant hover:text-primary'}`}>HR Panel</Link>
          </div>
        )}
      </div>
      <div className="flex items-center gap-stack-md">
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-white/5 active:scale-95">notifications</button>
        {role === 'super_admin' && (
          <div className="mr-4 border-r border-border pr-4">
            <TenantSwitcher tenants={tenants} activeTenantId={activeTenantId} />
          </div>
        )}
        <Link href="/configuracoes">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-white/5 active:scale-95">settings</button>
        </Link>
        <Link href="/perfil">
          <div className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden ml-2 active:scale-95 transition-transform cursor-pointer bg-surface-variant flex items-center justify-center font-bold text-on-surface">
            {name.charAt(0)}
          </div>
        </Link>
      </div>
    </nav>
  )
}
