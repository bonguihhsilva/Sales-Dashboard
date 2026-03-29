'use client'

import { useState } from 'react'
import type { Profile } from '@/types'

interface Vendor { vendor_id: string; vendor_name: string; store: string }

export default function MapeamentoClient({
  profiles,
  vendors,
}: {
  profiles: Profile[]
  vendors: Vendor[]
}) {
  const [links, setLinks]   = useState<Record<string, string>>(() =>
    Object.fromEntries(profiles.filter(p => p.vendor_id).map(p => [p.vendor_id!, p.id]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg]       = useState('')

  async function saveMapping(vendor_id: string, user_id: string) {
    setSaving(vendor_id); setMsg('')
    const res = await fetch('/api/admin/update-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, vendor_id }),
    })
    const data = await res.json()
    if (data.error) setMsg(`Erro: ${data.error}`)
    else {
      setMsg(`✓ Mapeamento salvo!`)
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(null)
  }

  const unmappedVendors = vendors.filter(v => !Object.keys(links).includes(v.vendor_id))
  const mappedVendors   = vendors.filter(v =>  Object.keys(links).includes(v.vendor_id))

  const selStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem',
    padding: '7px 10px', outline: 'none', cursor: 'pointer', width: '100%',
  }

  function VendorRow({ v }: { v: Vendor }) {
    const currentUserId = links[v.vendor_id] ?? ''
    const [selected, setSelected] = useState(currentUserId)
    return (
      <tr style={{ borderBottom: '1px solid var(--border)' }}>
        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.vendor_name}</td>
        <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{v.store}</td>
        <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--accent)' }}>{v.vendor_id}</td>
        <td style={{ padding: '10px 12px', minWidth: '260px' }}>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={selStyle}>
            <option value="">— Selecionar usuário —</option>
            {profiles.filter(p => p.role === 'vendedor').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </td>
        <td style={{ padding: '10px 12px' }}>
          <button
            onClick={() => { if (selected) { saveMapping(v.vendor_id, selected); setLinks(l => ({ ...l, [v.vendor_id]: selected })) } }}
            disabled={!selected || saving === v.vendor_id || selected === currentUserId}
            style={{ background: selected && selected !== currentUserId ? 'var(--accent)' : 'transparent', color: selected && selected !== currentUserId ? '#0e0f11' : 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.72rem', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', opacity: saving === v.vendor_id ? 0.6 : 1, whiteSpace: 'nowrap' }}
          >
            {saving === v.vendor_id ? '...' : currentUserId && selected === currentUserId ? '✓ Vinculado' : 'Vincular'}
          </button>
        </td>
      </tr>
    )
  }

  return (
    <div>
      <p style={{ fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Vincule cada vendedor do HTML (identificado pelo ID numérico) ao usuário correspondente no sistema.
        O usuário vinculado terá acesso aos seus próprios dados no painel de vendedor.
      </p>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)' : 'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)' : '#f55c42', border: `1px solid ${msg.startsWith('✓') ? 'rgba(200,245,66,0.3)' : 'rgba(245,92,66,0.3)'}` }}>
          {msg}
        </div>
      )}

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(200,245,66,0.08)', border: '1px solid rgba(200,245,66,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>
          <span style={{ color: 'var(--meta1)', fontWeight: 700 }}>{mappedVendors.length}</span> <span style={{ color: 'var(--muted)' }}>vinculados</span>
        </div>
        <div style={{ background: unmappedVendors.length > 0 ? 'rgba(245,92,66,0.08)' : 'var(--surface2)', border: `1px solid ${unmappedVendors.length > 0 ? 'rgba(245,92,66,0.2)' : 'var(--border)'}`, borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>
          <span style={{ color: unmappedVendors.length > 0 ? '#f55c42' : 'var(--muted)', fontWeight: 700 }}>{unmappedVendors.length}</span> <span style={{ color: 'var(--muted)' }}>sem vínculo</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Vendedor (HTML)', 'Loja', 'ID', 'Usuário do sistema', ''].map(h => (
                <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => <VendorRow key={v.vendor_id} v={v} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
