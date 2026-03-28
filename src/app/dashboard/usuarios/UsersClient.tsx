'use client'

import { useState } from 'react'
import type { Profile } from '@/types'

interface VendorOption { vendor_id: string; vendor_name: string; store: string }

interface EditState {
  user_id: string
  name: string
  email: string
  password: string
  role: 'adm' | 'vendedor'
  vendor_id: string
  active: boolean
}

export default function UsersClient({
  profiles,
  vendorOptions,
}: {
  profiles: Profile[]
  vendorOptions: VendorOption[]
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser]     = useState<EditState | null>(null)
  const [newEmail, setNewEmail]     = useState('')
  const [newName, setNewName]       = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [newRole, setNewRole]       = useState<'adm' | 'vendedor'>('vendedor')
  const [newVendor, setNewVendor]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [msg, setMsg]               = useState('')
  const [list, setList]             = useState<Profile[]>(profiles)

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
    fontSize: '0.82rem', padding: '9px 12px', outline: 'none', marginBottom: '0.85rem',
  }
  const labelStyle = {
    display: 'block' as const, fontSize: '0.65rem', fontFamily: 'DM Mono, monospace',
    color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '5px',
  }
  const btnPrimary = {
    background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif',
    fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px',
    padding: '10px', cursor: 'pointer',
  }
  const btnSecondary = {
    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600,
    fontSize: '0.85rem', padding: '10px', cursor: 'pointer',
  }

  async function callApi(url: string, body: Record<string, unknown>) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async function createUser() {
    setLoading(true); setMsg('')
    const data = await callApi('/api/admin/create-user', {
      email: newEmail, password: newPwd, name: newName, role: newRole,
      vendor_id: newVendor || null,
    })
    if (data.error) { setMsg(`Erro: ${data.error}`); setLoading(false); return }
    setMsg(`✓ Usuário ${newName} criado!`)
    setShowCreate(false); setNewEmail(''); setNewName(''); setNewPwd(''); setNewVendor('')
    setTimeout(() => window.location.reload(), 1000)
    setLoading(false)
  }

  async function saveEdit() {
    if (!editUser) return
    setLoading(true); setMsg('')
    const body: Record<string, unknown> = { user_id: editUser.user_id, name: editUser.name, role: editUser.role, vendor_id: editUser.vendor_id || null, active: editUser.active }
    if (editUser.email)    body.email    = editUser.email
    if (editUser.password) body.password = editUser.password
    const data = await callApi('/api/admin/update-user', body)
    if (data.error) { setMsg(`Erro: ${data.error}`); setLoading(false); return }
    setMsg('✓ Usuário atualizado!')
    setList(l => l.map(p => p.id === editUser.user_id
      ? { ...p, name: editUser.name, role: editUser.role, vendor_id: editUser.vendor_id || null, active: editUser.active }
      : p
    ))
    setEditUser(null)
    setLoading(false)
    setTimeout(() => setMsg(''), 3000)
  }

  function openEdit(p: Profile) {
    setEditUser({
      user_id: p.id, name: p.name, email: '', password: '',
      role: p.role, vendor_id: p.vendor_id || '', active: p.active,
    })
    setMsg('')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
          {list.length} usuários cadastrados
        </div>
        <button onClick={() => { setShowCreate(true); setMsg('') }} style={{ ...btnPrimary, fontSize: '0.78rem', padding: '7px 14px' }}>
          + Novo Usuário
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)' : 'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)' : '#f55c42', border: `1px solid ${msg.startsWith('✓') ? 'rgba(200,245,66,0.3)' : 'rgba(245,92,66,0.3)'}` }}>
          {msg}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Nome', 'Role', 'Vendedor', 'Loja', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', opacity: p.active ? 1 : 0.5 }}>
                <td style={{ padding: '9px 10px', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '9px 10px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: p.role === 'adm' ? 'rgba(200,245,66,0.15)' : 'rgba(66,217,245,0.12)', color: p.role === 'adm' ? 'var(--meta1)' : 'var(--mkt)' }}>
                    {p.role}
                  </span>
                </td>
                <td style={{ padding: '9px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: p.vendor_id ? 'var(--text)' : 'var(--muted)' }}>
                  {vendorOptions.find(v => v.vendor_id === p.vendor_id)?.vendor_name ?? (p.vendor_id || '—')}
                </td>
                <td style={{ padding: '9px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {vendorOptions.find(v => v.vendor_id === p.vendor_id)?.store ?? '—'}
                </td>
                <td style={{ padding: '9px 10px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: p.active ? 'rgba(200,245,66,0.1)' : 'rgba(107,111,122,0.15)', color: p.active ? 'var(--meta1)' : 'var(--muted)' }}>
                    {p.active ? 'ativo' : 'inativo'}
                  </span>
                </td>
                <td style={{ padding: '9px 10px' }}>
                  <button onClick={() => openEdit(p)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', padding: '3px 10px', cursor: 'pointer', marginRight: '6px' }}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '440px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Criar Novo Usuário</h2>
            <label style={labelStyle}>Nome completo</label>
            <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Tania Velazquez" />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="tania@dasilva.com" />
            <label style={labelStyle}>Senha inicial</label>
            <input style={inputStyle} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
            <label style={labelStyle}>Role</label>
            <select style={{ ...inputStyle }} value={newRole} onChange={e => setNewRole(e.target.value as 'adm' | 'vendedor')}>
              <option value="vendedor">Vendedor</option>
              <option value="adm">ADM</option>
            </select>
            {newRole === 'vendedor' && (
              <>
                <label style={labelStyle}>Vincular ao vendedor</label>
                <select style={{ ...inputStyle }} value={newVendor} onChange={e => setNewVendor(e.target.value)}>
                  <option value="">— Selecionar —</option>
                  {vendorOptions.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name} ({v.store})</option>)}
                </select>
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button onClick={() => setShowCreate(false)} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
              <button onClick={createUser} disabled={loading || !newEmail || !newName || !newPwd} style={{ ...btnPrimary, flex: 2, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Editar Usuário — <span style={{ color: 'var(--accent)' }}>{list.find(p => p.id === editUser.user_id)?.name}</span>
            </h2>

            <label style={labelStyle}>Nome</label>
            <input style={inputStyle} value={editUser.name} onChange={e => setEditUser(s => s ? {...s, name: e.target.value} : s)} />

            <label style={labelStyle}>Novo email (deixe vazio para não alterar)</label>
            <input style={inputStyle} type="email" value={editUser.email} placeholder="novo@email.com" onChange={e => setEditUser(s => s ? {...s, email: e.target.value} : s)} />

            <label style={labelStyle}>Nova senha (deixe vazio para não alterar)</label>
            <input style={inputStyle} type="password" value={editUser.password} placeholder="Nova senha..." onChange={e => setEditUser(s => s ? {...s, password: e.target.value} : s)} />

            <label style={labelStyle}>Role</label>
            <select style={{ ...inputStyle }} value={editUser.role} onChange={e => setEditUser(s => s ? {...s, role: e.target.value as 'adm' | 'vendedor'} : s)}>
              <option value="vendedor">Vendedor</option>
              <option value="adm">ADM</option>
            </select>

            <label style={labelStyle}>Vendedor vinculado</label>
            <select style={{ ...inputStyle }} value={editUser.vendor_id} onChange={e => setEditUser(s => s ? {...s, vendor_id: e.target.value} : s)}>
              <option value="">— Nenhum (ADM) —</option>
              {vendorOptions.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name} ({v.store})</option>)}
            </select>

            <label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle }} value={editUser.active ? 'true' : 'false'} onChange={e => setEditUser(s => s ? {...s, active: e.target.value === 'true'} : s)}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>

            {msg && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)' : 'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)' : '#f55c42' }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setEditUser(null); setMsg('') }} style={{ ...btnSecondary, flex: 1 }}>Cancelar</button>
              <button onClick={saveEdit} disabled={loading} style={{ ...btnPrimary, flex: 2, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
