'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { createTenant, toggleTenantStatus } from './actions'

type TenantRow = {
  id: string
  nome: string
  slug: string
  ativo: boolean
  cor_primaria: string | null
  user_count?: number
}

import { useRouter } from 'next/navigation'
import { switchTenantAction } from './tenant-actions'

export default function SuperAdminClient({ tenants }: { tenants: TenantRow[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreate(formData: FormData) {
    setLoading(true)
    setError(null)
    const res = await createTenant(formData)
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      // Clear form (could use a ref, but simple enough here)
      const form = document.getElementById('tenant-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total de Empresas</span>
          <span className="text-3xl font-bold text-on-surface">{tenants.length}</span>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Empresas Ativas</span>
          <span className="text-3xl font-bold text-primary">{tenants.filter(t => t.ativo).length}</span>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total de Usuários</span>
          <span className="text-3xl font-bold text-accent">{tenants.reduce((acc, t) => acc + (t.user_count || 0), 0)}</span>
        </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Nova Empresa (Tenant)</h2>
        <form id="tenant-form" action={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input id="name" name="name" required placeholder="Ex: Mega Store" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug (URL amigável)</Label>
              <Input id="slug" name="slug" required placeholder="Ex: mega-store" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="color">Cor Primária (Hex)</Label>
              <Input id="color" name="color" placeholder="Ex: #3B82F6" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end mt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Adicionar Empresa'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Empresas Cadastradas</h2>
        </div>
        <DataTable
          data={tenants}
          columns={[
            {
              key: 'nome',
              header: 'Empresa',
              render: (r) => <span className="font-medium">{r.nome as string}</span>
            },
            {
              key: 'slug',
              header: 'Slug',
              render: (r) => <span className="text-muted-foreground">{r.slug as string}</span>
            },
            {
              key: 'user_count',
              header: 'Usuários',
              render: (r) => <Badge variant="outline">{r.user_count || 0}</Badge>
            },
            {
              key: 'ativo',
              header: 'Status',
              render: (r) => (
                <Badge variant={r.ativo ? 'default' : 'secondary'}>
                  {r.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              )
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={async () => {
                      await switchTenantAction(r.id as string)
                      router.push('/dashboard')
                    }}
                  >
                    Acessar Painel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      await toggleTenantStatus(r.id as string, !r.ativo)
                    }}
                  >
                    {r.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  )
}
