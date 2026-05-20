'use client'

import { useState } from 'react'
import { Menu, LogOut, User } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ThemeToggle } from './theme-toggle'

interface TopbarProps {
  userInitials?: string
  onLogout?: () => void
}

export function Topbar({ userInitials = 'GD', onLogout }: TopbarProps) {
  const [period, setPeriod] = useState<string>('')
  const [loja, setLoja] = useState<string>('all')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-30 h-14 border-b border-border bg-card flex items-center gap-2 px-4">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger render={
          <Button variant="ghost" size="icon" className="md:hidden h-11 w-11" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
        } />
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="px-4 h-14 flex items-center border-b border-border">
            <span className="font-sans font-bold text-base">GDS Frame</span>
          </div>
          <nav className="px-2 py-4 space-y-1 font-sans text-base">
            <a href="/dashboard"             className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Dashboard</a>
            <a href="/dashboard/vendas"      className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Vendas</a>
            <a href="/dashboard/comissoes"   className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Comissões</a>
            <a href="/dashboard/usuarios"    className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Usuários</a>
            <a href="/dashboard/treinamento" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Treinamento</a>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex items-center gap-2 justify-end md:justify-start md:pl-4">
        <Select value={period} onValueChange={(v) => setPeriod(v ?? '')}>
          <SelectTrigger className="w-[140px] font-mono text-[12px]" aria-label="Período">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current" className="font-mono text-[12px]">Período atual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={loja} onValueChange={(v) => setLoja(v ?? 'all')}>
          <SelectTrigger className="w-[120px] font-mono text-[12px]" aria-label="Loja">
            <SelectValue placeholder="Loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all"        className="font-mono text-[12px]">Todas</SelectItem>
            <SelectItem value="Jebai"      className="font-mono text-[12px]">Jebai</SelectItem>
            <SelectItem value="Paje-MKT"   className="font-mono text-[12px]">Pajé 1</SelectItem>
            <SelectItem value="Paje-Caixa" className="font-mono text-[12px]">Pajé 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Menu do usuário">
              <Avatar className="h-8 w-8"><AvatarFallback className="font-mono text-[12px]">{userInitials}</AvatarFallback></Avatar>
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-sans"><User className="h-4 w-4 mr-2" />Perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-sans" onClick={onLogout}><LogOut className="h-4 w-4 mr-2" />Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
