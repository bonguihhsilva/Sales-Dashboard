'use client'

import { useState } from 'react'

type Gerente = {
  id: string
  name: string
  permissions: Record<string, boolean>
}

const PERMISSIONS: { key: string; label: string; desc: string }[] = [
  { key: 'ver_comissoes', label: 'Ver Comissões', desc: 'Acessa o painel de comissões calculadas' },
  { key: 'aprovar_comissoes', label: 'Aprovar Comissões', desc: 'Pode aprovar e reprovar comissões de vendedores' },
  { key: 'ver_rh', label: 'Ver RH', desc: 'Acessa o módulo de RH (faltas, atrasos, férias)' },
  { key: 'importar_dados', label: 'Importar Dados', desc: 'Pode fazer upload de arquivos CEC' },
  { key: 'ver_relatorios', label: 'Exportar Relatórios', desc: 'Pode baixar relatórios Excel' },
  { key: 'gerenciar_usuarios', label: 'Gerenciar Usuários', desc: 'Pode convidar e desativar membros da equipe' },
]

export default function PermissoesClient({ gerentes: initial }: { gerentes: Gerente[] }) {
  const [gerentes, setGerentes] = useState<Gerente[]>(initial)
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const gerente = gerentes.find(g => g.id === selected)

  function togglePermission(key: string) {
    if (!selected) return
    setGerentes(prev => prev.map(g =>
      g.id === selected
        ? { ...g, permissions: { ...g.permissions, [key]: !g.permissions[key] } }
        : g
    ))
  }

  async function handleSave() {
    if (!gerente) return
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/admin/gerente-permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: gerente.id, permissions: gerente.permissions }),
    })
    const json = await res.json()
    setSaving(false)
    setMsg(res.ok ? 'Salvo!' : (json.error ?? 'Erro'))
  }

  if (gerentes.length === 0) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--text)', margin: 0 }}>Permissões de Gerentes</h1>
          <a href="/dashboard/config" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>← Config</a>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Nenhum gerente cadastrado ainda.</p>
          <a href="/dashboard/usuarios" style={{ color: 'var(--accent)', fontSize: 14, display: 'block', marginTop: 8 }}>
            Convidar gerente →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--text)', margin: 0 }}>Permissões</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Controle o que cada gerente pode acessar</p>
        </div>
        <a href="/dashboard/config" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>← Config</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>

        {/* Gerente list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {gerentes.map(g => {
            const activeCount = Object.values(g.permissions).filter(Boolean).length
            return (
              <div key={g.id} onClick={() => { setSelected(g.id); setMsg(null) }} style={{
                padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: selected === g.id ? 'var(--surface2)' : 'transparent',
                borderLeft: selected === g.id ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'background .1s',
              }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{g.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{activeCount} permiss{activeCount === 1 ? 'ão' : 'ões'}</div>
              </div>
            )
          })}
        </div>

        {/* Permission toggles */}
        {gerente && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                {gerente.name}
              </span>
              <button onClick={handleSave} disabled={saving} style={{
                background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8,
                padding: '8px 18px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13
              }}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>

            {PERMISSIONS.map((p, i) => (
              <div key={p.key} onClick={() => togglePermission(p.key)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0', borderBottom: i < PERMISSIONS.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{p.label}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{p.desc}</div>
                </div>

                {/* Toggle */}
                <div style={{
                  width: 44, height: 24, borderRadius: 12, flexShrink: 0, transition: 'background .15s',
                  background: gerente.permissions[p.key] ? 'var(--accent)' : 'var(--border)',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: gerente.permissions[p.key] ? 22 : 3,
                    width: 18, height: 18, borderRadius: 9, background: '#fff', transition: 'left .15s'
                  }} />
                </div>
              </div>
            ))}

            {msg && (
              <p style={{ marginTop: 12, fontSize: 13, color: msg === 'Salvo!' ? '#4ade80' : '#f87171' }}>{msg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
