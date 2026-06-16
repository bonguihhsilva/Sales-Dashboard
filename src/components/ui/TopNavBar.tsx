'use client'

import Link from 'next/link'
import { TenantSwitcher } from './TenantSwitcher'

export function TopNavBar({ name, role = 'super_admin', tenants = [], activeTenantId }: { name: string, role?: string, tenants?: any[], activeTenantId?: string | null }) {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-page h-16 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
      <div className="flex items-center gap-stack-lg">
        <Link href="/dashboard" className="font-headline-lg text-headline-lg font-bold text-primary">GDS</Link>
      </div>
      <div className="flex items-center gap-stack-md">
        <button
          type="button"
          disabled
          title="Notificações — em breve"
          aria-label="Notificações (em breve)"
          className="material-symbols-outlined text-on-surface-variant/40 p-2 rounded-full cursor-not-allowed"
        >
          notifications
        </button>
        {role === 'super_admin' && (
          <div className="mr-4 border-r border-border pr-4">
            <TenantSwitcher tenants={tenants} activeTenantId={activeTenantId} />
          </div>
        )}
        <Link
          href="/dashboard/config"
          aria-label="Configurações"
          className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-white/5 active:scale-95"
        >settings</Link>
        <Link href="/perfil" aria-label={`Perfil de ${name}`} className="ml-2">
          <div className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden active:scale-95 transition-transform cursor-pointer bg-surface-variant flex items-center justify-center font-bold text-on-surface">
            {name.charAt(0)}
          </div>
        </Link>
      </div>
    </nav>
  )
}
