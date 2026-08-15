'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import { TenantSwitcher } from './TenantSwitcher'
import { useState } from 'react'
import { hasModule, type TenantModule, type TenantModules } from '@/lib/modules'

type NavLink = { href: string; label: string; icon: string; mod?: TenantModule }

export function Sidebar({ role, name, tenants = [], activeTenantId, modules }: { role: string, name: string, tenants?: Array<{ id: string; nome: string }>, activeTenantId?: string | null, modules?: Partial<TenantModules> | null }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const adminLinks: NavLink[] = [
    { href: '/dashboard', label: 'Visão Geral', icon: 'dashboard' },
    { href: '/dashboard/metas', label: 'Metas', icon: 'flag' },
    { href: '/dashboard/comissao', label: 'Comissões', icon: 'payments', mod: 'comissao' as const },
    { href: '/dashboard/regras-comissao', label: 'Regras', icon: 'rule' },
    { href: '/dashboard/mapeamento', label: 'Mapeamento', icon: 'map' },
    { href: '/dashboard/treinamentos', label: 'Treinamentos', icon: 'school', mod: 'treinamentos' as const },
    { href: '/dashboard/relatorios', label: 'Relatórios', icon: 'summarize', mod: 'relatorios' as const },
    { href: '/dashboard/rh', label: 'Recursos Humanos', icon: 'groups', mod: 'rh' as const },
    { href: '/dashboard/usuarios', label: 'Usuários', icon: 'manage_accounts' },
  ]

  const vendorLinks: NavLink[] = [
    { href: '/vendedor/meu-resultado', label: 'Meu Resultado', icon: 'payments' },
    { href: '/vendedor/treinamentos', label: 'Treinamentos', icon: 'school', mod: 'treinamentos' as const },
    { href: '/vendedor/regras', label: 'Regras de Comissão', icon: 'rule' },
    { href: '/vendedor/rh', label: 'Recursos Humanos', icon: 'groups', mod: 'rh' as const },
  ]

  // Role 'compras' ve apenas seu proprio setor — sem comissao, RH ou
  // performance nominal de vendedor (D-04/D-05 da Fase 09).
  const comprasLinks: NavLink[] = [
    { href: '/dashboard/compras', label: 'Compras', icon: 'inventory_2' },
  ]

  const links =
    role === 'vendedor' ? vendorLinks :
    role === 'compras'  ? comprasLinks :
    adminLinks

  // adm/gerente/super_admin acessam o setor de compras pelo menu completo.
  if (role !== 'vendedor' && role !== 'compras') {
    links.push({ href: '/dashboard/compras', label: 'Compras', icon: 'inventory_2', mod: 'compras' as const })
  }

  const visibleLinks = links.filter(l => !l.mod || hasModule(modules, l.mod))

  if (role === 'super_admin') {
    links.push({ href: '/dashboard/super-admin', label: 'Super Admin', icon: 'admin_panel_settings' })
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-4 z-[60] p-1 bg-surface-container rounded shadow-sm border border-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined text-on-surface">menu</span>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-[100dvh] w-[280px] flex flex-col py-stack-lg border-r border-white/5 bg-surface-container z-40
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md text-on-surface">Operações</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow space-y-1">
          {visibleLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
            return (
              <div key={link.href} className="px-2">
                <Link 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-label-sm text-label-sm transition-all duration-300 ease-in-out
                    ${isActive 
                      ? 'bg-primary-container text-on-primary-container font-bold' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}
                  `}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </div>
            )
          })}
        </nav>



        <div className="border-t border-white/5 pt-4 space-y-1">
          {role === 'super_admin' && (
            <div className="px-4 pb-2">
              <TenantSwitcher tenants={tenants} activeTenantId={activeTenantId} />
            </div>
          )}
          {role !== 'vendedor' && (
            <div className="px-2">
              <Link
                href="/dashboard/config"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-all"
              >
                <span className="material-symbols-outlined">settings</span>
                <span>Configurações</span>
              </Link>
            </div>
          )}
          <div className="px-2">
            <Link
              href="/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-all"
            >
              <span className="material-symbols-outlined">person</span>
              <span className="truncate">{name}</span>
            </Link>
          </div>
          <div className="px-2 pt-1 pb-4">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
