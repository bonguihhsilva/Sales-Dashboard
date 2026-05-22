'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  Pencil,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { LojaBadge, type LojaName } from '@/components/ui/loja-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ASSIGNABLE_ROLES } from '@/lib/auth/roles'
import { STORE_LABELS } from '@/types'
import type { UserRow } from './page'

// ── Helpers ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  vendedor: 'Vendedor',
  adm: 'ADM',
  gerente: 'Gerente',
  super_admin: 'Super Admin',
}

const STORE_OPTIONS = [
  { value: 'Jebai', label: 'Jebai' },
  { value: 'Paje-MKT', label: 'Paje 1' },
  { value: 'Paje-Caixa', label: 'Paje 2' },
]

function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return 'Nunca'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ha 1 dia'
  return `Ha ${diff} dias`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// ── Componente principal ────────────────────────────────────────────────────

export default function UsersClient({
  users,
  activeRole,
  activeLoja,
}: {
  users: UserRow[]
  activeRole: string | null
  activeLoja: string | null
}) {
  const router = useRouter()

  // Estados de UI principal
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [disablingUser, setDisablingUser] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados do Sheet de convite
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState(ASSIGNABLE_ROLES[0])
  const [inviteLoja, setInviteLoja] = useState(STORE_OPTIONS[0].value)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteEmailSent, setInviteEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)

  // Estados do Sheet de edicao
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState(ASSIGNABLE_ROLES[0])
  const [editStore, setEditStore] = useState(STORE_OPTIONS[0].value)
  const [editAtivo, setEditAtivo] = useState(true)

  // Sincronizar campos do Sheet de edicao quando editingUser mudar
  useEffect(() => {
    if (editingUser) {
      setEditName(editingUser.name)
      setEditRole(
        (ASSIGNABLE_ROLES as string[]).includes(editingUser.role)
          ? editingUser.role
          : ASSIGNABLE_ROLES[0]
      )
      setEditStore(editingUser.store ?? STORE_OPTIONS[0].value)
      setEditAtivo(editingUser.ativo)
      setError(null)
    }
  }, [editingUser])

  // ── Handlers de convite ────────────────────────────────────────────────

  async function handleGerarConvite() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail || undefined,
          role: inviteRole,
          loja: inviteLoja,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Falha ao gerar convite.')
        return
      }
      setInviteLink(data.link)
      setInviteEmailSent(!!data.email_sent)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopiarLink() {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard indisponivel — link visivel para copia manual
    }
  }

  function handleCloseInvite(open: boolean) {
    if (!open) {
      setInviteLink(null)
      setInviteEmailSent(false)
      setCopied(false)
      setError(null)
      setInviteEmail('')
      setInviteRole(ASSIGNABLE_ROLES[0])
      setInviteLoja(STORE_OPTIONS[0].value)
    }
    setInviteOpen(open)
  }

  // ── Handler de reenvio de convite ─────────────────────────────────────

  async function handleReenviarConvite(row: UserRow) {
    setLoading(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        role: row.role,
        loja: row.store ?? STORE_OPTIONS[0].value,
      }
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Falha ao reenviar convite.')
        return
      }
      setInviteLink(data.link)
      setInviteEmailSent(false)
      setInviteOpen(true)
    } finally {
      setLoading(false)
    }
  }

  // ── Handler de edicao ──────────────────────────────────────────────────

  async function handleSave() {
    if (!editingUser) return
    setLoading(true)
    setError(null)
    try {
      // 1. update-user: name, role, store
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName,
          role: editRole,
          store: editStore,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Falha ao salvar alteracoes.')
        return
      }

      // 2. Se ativo mudou, chamar disable-user
      if (editAtivo !== editingUser.ativo) {
        const disRes = await fetch('/api/admin/disable-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: editingUser.id, ativo: editAtivo }),
        })
        const disData = await disRes.json()
        if (!disRes.ok) {
          setError(disData.error ?? 'Falha ao atualizar status do usuario.')
          return
        }
      }

      router.refresh()
      setEditingUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ── Handler de desativacao ────────────────────────────────────────────

  async function handleDisable() {
    if (!disablingUser) return
    setLoading(true)
    setError(null)
    try {
      const novoAtivo = !disablingUser.ativo
      const res = await fetch('/api/admin/disable-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: disablingUser.id, ativo: novoAtivo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Falha ao alterar status do usuario.')
        return
      }
      router.refresh()
      setDisablingUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ── Navegacao de filtros ───────────────────────────────────────────────

  function handleFilterRole(value: string | null) {
    const params = new URLSearchParams()
    if (value && value !== '_all') params.set('role', value)
    if (activeLoja) params.set('loja', activeLoja)
    router.push(`/dashboard/usuarios${params.toString() ? '?' + params.toString() : ''}`)
  }

  function handleFilterLoja(value: string | null) {
    const params = new URLSearchParams()
    if (activeRole) params.set('role', activeRole)
    if (value && value !== '_all') params.set('loja', value)
    router.push(`/dashboard/usuarios${params.toString() ? '?' + params.toString() : ''}`)
  }

  // ── Colunas da tabela ──────────────────────────────────────────────────
  // Usando Record<string, unknown> para compatibilidade com DataTable e cast
  // interno de `r` para UserRow dentro de cada render.

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (r) => {
        const row = r as unknown as UserRow
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted font-mono text-[11px] text-muted-foreground shrink-0">
              {getInitials(row.name)}
            </span>
            <span className="font-medium text-foreground">{row.name}</span>
          </div>
        )
      },
    },
    {
      key: 'numero_vendedor',
      header: 'N Vendedor',
      render: (r) => {
        const row = r as unknown as UserRow
        return <span className="text-muted-foreground">{row.numero_vendedor ?? '—'}</span>
      },
    },
    {
      key: 'store',
      header: 'Loja',
      render: (r) => {
        const row = r as unknown as UserRow
        const storeLabel = row.store ? (STORE_LABELS[row.store] ?? row.store) : null
        if (!storeLabel) return <span className="text-muted-foreground">—</span>
        const lojaMap: Record<string, LojaName> = {
          'Jebai': 'Jebai',
          'Paje-MKT': 'Pajé 1',
          'Paje-Caixa': 'Pajé 2',
        }
        const lojaName = row.store ? lojaMap[row.store] : undefined
        if (lojaName) return <LojaBadge loja={lojaName} />
        return <span className="text-muted-foreground">{storeLabel}</span>
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (r) => {
        const row = r as unknown as UserRow
        return <Badge variant="outline">{ROLE_LABELS[row.role] ?? row.role}</Badge>
      },
    },
    {
      key: 'ativo',
      header: 'Ativo',
      render: (r) => {
        const row = r as unknown as UserRow
        return (
          <Badge variant={row.ativo ? 'default' : 'secondary'}>
            {row.ativo ? 'ativo' : 'inativo'}
          </Badge>
        )
      },
    },
    {
      key: 'last_sign_in_at',
      header: 'Ultimo acesso',
      render: (r) => {
        const row = r as unknown as UserRow
        return <span className="text-muted-foreground">{formatLastSeen(row.last_sign_in_at)}</span>
      },
    },
    {
      key: 'id',
      header: 'Acoes',
      render: (r) => {
        const row = r as unknown as UserRow
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon-sm" aria-label="Acoes" />
            }>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem onSelect={() => setEditingUser(row)}>
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDisablingUser(row)}>
                {row.ativo ? 'Desativar' : 'Reativar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleReenviarConvite(row)}>
                <UserPlus className="h-4 w-4" />
                Reenviar convite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <PageHeader
        title="Usuarios"
        subtitle="Gerencie acessos e convites da equipe"
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Convidar usuario
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={activeRole ?? '_all'} onValueChange={handleFilterRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos os roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos os roles</SelectItem>
            <SelectItem value="vendedor">Vendedor</SelectItem>
            <SelectItem value="adm">ADM</SelectItem>
            <SelectItem value="gerente">Gerente</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activeLoja ?? '_all'} onValueChange={handleFilterLoja}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todas as lojas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas as lojas</SelectItem>
            {STORE_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(activeRole || activeLoja) && (
          <a
            href="/dashboard/usuarios"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Limpar filtros
          </a>
        )}
      </div>

      {/* Mensagem de erro global */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tabela */}
      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="Nenhum usuario encontrado"
          description="Tente ajustar os filtros ou convide um novo membro."
        />
      ) : (
        <DataTable
          columns={columns}
          data={users as unknown as Record<string, unknown>[]}
        />
      )}

      {/* ── Sheet de convite ───────────────────────────────────────────── */}
      <Sheet open={inviteOpen} onOpenChange={handleCloseInvite}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Convidar usuario</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-4">
            {!inviteLink ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite-email">Email (opcional)</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="email@dasilva.com — opcional"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                    <SelectTrigger id="invite-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r] ?? r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite-loja">Loja</Label>
                  <Select value={inviteLoja} onValueChange={(v) => { if (v) setInviteLoja(v) }}>
                    <SelectTrigger id="invite-loja" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STORE_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button onClick={handleGerarConvite} disabled={loading}>
                  {loading ? 'Gerando...' : 'Gerar convite'}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Link de convite gerado com sucesso.</p>

                <div className="rounded-md border border-border bg-card p-3 font-mono text-[12px] break-all">
                  {inviteLink}
                </div>

                <Button
                  variant="outline"
                  onClick={handleCopiarLink}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Link copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar link
                    </>
                  )}
                </Button>

                {inviteEmailSent && inviteEmail && (
                  <p className="text-sm text-muted-foreground">
                    Email enviado para {inviteEmail}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">Link valido por 7 dias.</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Sheet de edicao ────────────────────────────────────────────── */}
      <Sheet open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null) }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar usuario</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as typeof editRole)}>
                <SelectTrigger id="edit-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r] ?? r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-store">Loja</Label>
              <Select value={editStore} onValueChange={(v) => { if (v) setEditStore(v) }}>
                <SelectTrigger id="edit-store" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORE_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="edit-ativo">Ativo</Label>
              <Switch
                id="edit-ativo"
                checked={editAtivo}
                onCheckedChange={setEditAtivo}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Descartar alteracoes
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alteracoes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Dialog de desativacao ──────────────────────────────────────── */}
      <Dialog open={!!disablingUser} onOpenChange={(open) => { if (!open) setDisablingUser(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {disablingUser?.ativo ? 'Desativar usuario' : 'Reativar usuario'}
            </DialogTitle>
            <DialogDescription>
              {disablingUser?.ativo
                ? `Isso encerrara a sessao ativa de ${disablingUser?.name} imediatamente. Esta acao pode ser revertida reativando o usuario.`
                : `Isso reativara o acesso de ${disablingUser?.name}.`}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-destructive px-1">{error}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisablingUser(null)}>
              Manter usuario ativo
            </Button>
            <Button
              variant={disablingUser?.ativo ? 'destructive' : 'default'}
              onClick={handleDisable}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : (disablingUser?.ativo ? 'Desativar' : 'Reativar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
