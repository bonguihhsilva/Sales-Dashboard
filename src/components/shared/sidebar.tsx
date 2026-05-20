'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, DollarSign, Users, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',             label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/dashboard/vendas',      label: 'Vendas',      icon: TrendingUp },
  { href: '/dashboard/comissoes',   label: 'Comissões',   icon: DollarSign },
  { href: '/dashboard/usuarios',    label: 'Usuários',    icon: Users },
  { href: '/dashboard/treinamento', label: 'Treinamento', icon: GraduationCap },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle, hydrated } = useSidebar()
  const width = collapsed ? 64 : 240

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-border bg-background"
      style={{ width, transition: hydrated ? 'width 200ms ease' : 'none' }}
      aria-label="Navegação principal"
    >
      <div className={cn('flex items-center px-4 h-14 border-b border-border', collapsed ? 'justify-center' : 'justify-start')}>
        <span className="font-sans font-bold text-base text-foreground">
          {collapsed ? 'G' : 'GDS Frame'}
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <TooltipProvider delay={0}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            const link = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 font-sans text-base transition-colors',
                  collapsed && 'justify-center px-0',
                  active
                    ? 'bg-accent/10 text-accent border-l-[3px] border-accent rounded-l-none pl-[9px]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className={cn('h-[18px] w-[18px]', active && 'text-accent')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger render={link} />
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            )
          })}
        </TooltipProvider>
      </nav>
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={toggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
