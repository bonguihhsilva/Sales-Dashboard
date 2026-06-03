'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui'

type Store = { id: string; name: string; color: string; ativo: boolean }

const PRESET_COLORS = ['#c8f542', '#42d9f5', '#f5a742', '#7b61ff', '#f87171', '#4ade80', '#60a5fa', '#e879f9']

export default function LojasClient({ stores: initial }: { stores: Store[] }) {
  const [stores, setStores] = useState<Store[]>(initial)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleCreate() {
    if (!newName.trim()) { setError('Nome obrigatório'); return }
    setError(null)
    const res = await fetch('/api/admin/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); return }
    setStores(prev => [...prev, json])
    setNewName('')
    startTransition(() => router.refresh())
  }

  async function handleToggle(id: string, ativo: boolean) {
    const res = await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    if (!res.ok) return
    setStores(prev => prev.map(s => s.id === id ? { ...s, ativo: !ativo } : s))
  }

  async function handleUpdateColor(id: string, color: string) {
    await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color }),
    })
    setStores(prev => prev.map(s => s.id === id ? { ...s, color } : s))
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      <PageHeader
        title="Lojas"
        subtitle="Canais de venda do seu tenant"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Configurações', href: '/dashboard/config' },
          { label: 'Lojas' },
        ]}
      />

      {/* Existing stores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stores.map(s => (
          <div key={s.id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
            opacity: s.ativo ? 1 : 0.5,
          }}>
            {/* Color picker */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: s.color, cursor: 'pointer', border: '2px solid var(--border)' }} />
              <input type="color" defaultValue={s.color}
                onChange={e => handleUpdateColor(s.id, e.target.value)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
            </div>

            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text)', flex: 1, fontSize: 15 }}>
              {s.name}
            </span>

            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: s.ativo ? '#4ade8022' : '#94a3b822', color: s.ativo ? '#4ade80' : '#94a3b8'
            }}>
              {s.ativo ? 'ATIVA' : 'INATIVA'}
            </span>

            <button onClick={() => handleToggle(s.id, s.ativo)} style={{
              background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12
            }}>
              {s.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
      </div>

      {/* Add new store */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', margin: '0 0 16px' }}>
          Nova Loja
        </h3>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nome da loja"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            style={{
              flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text)', fontSize: 14
            }}
          />

          {/* Color presets */}
          <div style={{ display: 'flex', gap: 6 }}>
            {PRESET_COLORS.map(c => (
              <div key={c} onClick={() => setNewColor(c)} style={{
                width: 26, height: 26, borderRadius: 6, background: c, cursor: 'pointer',
                border: newColor === c ? '2px solid var(--text)' : '2px solid transparent',
                transition: 'border-color .1s'
              }} />
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={isPending}
            style={{
              background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8,
              padding: '10px 20px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13
            }}
          >
            Adicionar
          </button>
        </div>

        {error && <p style={{ marginTop: 10, color: '#f87171', fontSize: 13 }}>{error}</p>}
      </div>
    </div>
  )
}
