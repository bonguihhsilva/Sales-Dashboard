'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import { useState } from 'react'

export function Sidebar({ role, name }: { role: string, name: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/dashboard', label: 'Vendas', icon: '📊' },
    { href: '/dashboard/comissao', label: 'Comissões', icon: '💰' },
    { href: '/dashboard/regras-comissao', label: 'Regras', icon: '⚙️' },
    { href: '/dashboard/treinamentos', label: 'Treinamentos', icon: '🎓' },
    { href: '/dashboard/rh', label: 'RH', icon: '👥' },
    { href: '/dashboard/usuarios', label: 'Gestão de Usuários', icon: '🔑' },
  ]

  if (role === 'super_admin') {
    links.push({ href: '/dashboard/super-admin', label: 'Super Admin', icon: '🛡️' })
  }

  return (
    <>
      {/* Mobile toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-md shadow-sm border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-200 ease-in-out
        flex flex-col
      `}>
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-accent-foreground font-bold text-xl">
            G
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight leading-none text-foreground">GDS Frame</h2>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Menu</div>
          {links.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                  borderRadius: '8px', textDecoration: 'none',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--surface2)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ fontSize: '1.2rem', opacity: isActive ? 1 : 0.7 }}>{link.icon}</span>
                <span style={{ fontSize: '0.85rem' }}>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-sm font-bold text-muted-foreground">
              {name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{name}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
