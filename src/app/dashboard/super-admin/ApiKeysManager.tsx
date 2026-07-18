'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { createApiKey, revokeApiKey, type ApiKeyRow } from './api-key-actions'

type TenantOption = { id: string; nome: string }

function fmtDate(value: string | null): string {
  if (!value) return 'Nunca'
  return new Date(value).toLocaleString('pt-BR')
}

export default function ApiKeysManager({ tenants, keys }: { tenants: TenantOption[]; keys: ApiKeyRow[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const tenantNameById = tenants.reduce<Record<string, string>>((acc, t) => {
    acc[t.id] = t.nome
    return acc
  }, {})

  async function handleCreate(formData: FormData) {
    setLoading(true)
    setError(null)
    setNewRawKey(null)
    setCopied(false)
    const res = await createApiKey(formData)
    setLoading(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    if (res?.rawKey) {
      setNewRawKey(res.rawKey)
      const form = document.getElementById('api-key-form') as HTMLFormElement
      form?.reset()
    }
  }

  async function handleRevoke(id: string) {
    setRevokingId(id)
    setError(null)
    const res = await revokeApiKey(id)
    setRevokingId(null)
    if (res?.error) {
      setError(res.error)
    }
  }

  async function handleCopy() {
    if (!newRawKey) return
    await navigator.clipboard.writeText(newRawKey)
    setCopied(true)
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Nova API Key</h2>
        <form id="api-key-form" action={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tenant_id">Empresa</Label>
              <select
                id="tenant_id"
                name="tenant_id"
                required
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Selecione...</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Rótulo</Label>
              <Input id="name" name="name" placeholder="Ex: ERP Loja Jebai" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end mt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar API Key'}
            </Button>
          </div>
        </form>

        {newRawKey && (
          <div className="mt-6 p-4 rounded-lg border border-primary/40 bg-primary/5 flex flex-col gap-3">
            <p className="text-sm font-medium text-primary">
              Copie agora — esta chave não será exibida novamente.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs break-all bg-background border border-border rounded px-3 py-2">
                {newRawKey}
              </code>
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">API Keys Emitidas</h2>
        </div>
        <DataTable
          data={keys}
          emptyTitle="Nenhuma API key emitida"
          emptyDescription="Gere uma key acima para liberar acesso à API pública de ingest."
          columns={[
            {
              key: 'tenant_id',
              header: 'Empresa',
              render: (r) => <span className="font-medium">{tenantNameById[r.tenant_id] ?? r.tenant_id}</span>
            },
            {
              key: 'name',
              header: 'Rótulo',
              render: (r) => <span className="text-muted-foreground">{r.name || '—'}</span>
            },
            {
              key: 'key_prefix',
              header: 'Prefixo',
              render: (r) => <span className="font-mono">{r.key_prefix}…</span>
            },
            {
              key: 'last_used_at',
              header: 'Último uso',
              render: (r) => <span>{fmtDate(r.last_used_at)}</span>
            },
            {
              key: 'revoked_at',
              header: 'Status',
              render: (r) => (
                <Badge variant={r.revoked_at ? 'secondary' : 'default'}>
                  {r.revoked_at ? 'Revogada' : 'Ativa'}
                </Badge>
              )
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (r) => (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!r.revoked_at || revokingId === r.id}
                  onClick={() => handleRevoke(r.id)}
                >
                  {revokingId === r.id ? 'Revogando...' : 'Revogar'}
                </Button>
              )
            }
          ]}
        />
      </div>
    </div>
  )
}
