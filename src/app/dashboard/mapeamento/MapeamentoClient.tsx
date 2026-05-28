'use client'

import { useState } from 'react'
import type { Profile } from '@/types'

interface Vendor { vendor_id: string; vendor_name: string; store: string }

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function MapeamentoClient({
  profiles,
  vendors,
  orphanVendors,
  stores,
}: {
  profiles: Profile[]
  vendors: Vendor[]
  orphanVendors: Vendor[]
  stores: { key: string; label: string; color: string }[]
}) {
  // Current vendor_id → user_id mapping (from profiles)
  const [links, setLinks] = useState<Record<string, string>>(() =>
    Object.fromEntries(profiles.filter(p => p.vendor_id).map(p => [p.vendor_id!, p.id]))
  )
  const [saving, setSaving]     = useState<string | null>(null)
  const [msg, setMsg]           = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Add new vendor form state
  const [addVendor, setAddVendor] = useState<Vendor | null>(null)
  const [addName, setAddName]     = useState('')
  const [addStore, setAddStore]   = useState(stores.length > 0 ? stores[0].key : '')
  const [addUserId, setAddUserId] = useState('')
  const [addM1, setAddM1]         = useState('')
  const [addM2, setAddM2]         = useState('')
  const [addM3, setAddM3]         = useState('')
  const [addPeriod, setAddPeriod] = useState(1)
  const [addingVendor, setAddingVendor] = useState(false)

  // Periods for goal assignment
  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const periodOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - i, 1)
    return {
      label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    }
  })

  const selStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem',
    padding: '7px 10px', outline: 'none', cursor: 'pointer', width: '100%',
  }
  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem',
    padding: '7px 10px', outline: 'none', width: '100%',
  }
  const labelStyle = {
    display: 'block' as const, fontSize: '0.62rem', fontFamily: 'DM Mono, monospace',
    color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px',
  }

  async function saveMapping(vendor_id: string, user_id: string) {
    setSaving(vendor_id); setMsg('')
    const res = await fetch('/api/admin/update-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, vendor_id }),
    })
    const data = await res.json()
    if (data.error) setMsg(`Erro: ${data.error}`)
    else {
      setLinks(l => ({ ...l, [vendor_id]: user_id }))
      setMsg('✓ Mapeamento salvo!')
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(null)
  }

  async function registerAndLink() {
    if (!addVendor && !addName) return
    setAddingVendor(true); setMsg('')

    const vendor_id   = addVendor?.vendor_id ?? `new_${Date.now()}`
    const vendor_name = addVendor ? addVendor.vendor_name : addName
    const store       = addVendor ? addVendor.store : addStore

    try {
      // 1. Create goal entry for this vendor
      const goalRes = await fetch('/api/admin/update-goals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          create: true,
          period_id: addPeriod,
          vendor_id, vendor_name, store,
          meta1: Number(addM1) || 0,
          meta2: Number(addM2) || 0,
          meta3: Number(addM3) || 0,
          bonus1: 100, bonus2: 150, bonus3: 200,
        }),
      })
      const goalData = await goalRes.json()
      if (goalData.error) throw new Error(goalData.error)

      // 2. Link to user if selected
      if (addUserId) {
        const linkRes = await fetch('/api/admin/update-user', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: addUserId, vendor_id }),
        })
        const linkData = await linkRes.json()
        if (linkData.error) throw new Error(linkData.error)
        setLinks(l => ({ ...l, [vendor_id]: addUserId }))
      }

      setMsg(`✓ ${vendor_name} registrado${addUserId ? ' e vinculado' : ''}!`)
      setShowAddModal(false)
      setAddVendor(null); setAddName(''); setAddM1(''); setAddM2(''); setAddM3(''); setAddUserId('')
      setTimeout(() => window.location.reload(), 1200)
    } catch (e: unknown) {
      setMsg(`Erro: ${e instanceof Error ? e.message : 'Falha'}`)
    }
    setAddingVendor(false)
  }

  const mappedCount   = vendors.filter(v => links[v.vendor_id]).length
  const unmappedCount = vendors.filter(v => !links[v.vendor_id]).length

  function VendorRow({ v }: { v: Vendor }) {
    const currentUserId = links[v.vendor_id] ?? ''
    const [selected, setSelected] = useState(currentUserId)
    const changed = selected !== currentUserId && selected !== ''
    return (
      <tr style={{ borderBottom: '1px solid var(--border)' }}>
        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.vendor_name}</td>
        <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{v.store}</td>
        <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--accent)' }}>{v.vendor_id}</td>
        <td style={{ padding: '10px 12px', minWidth: '240px' }}>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={selStyle}>
            <option value="">— Selecionar usuário —</option>
            {profiles.filter(p => p.role === 'vendedor').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </td>
        <td style={{ padding: '10px 12px' }}>
          {currentUserId && !changed ? (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--meta1)' }}>✓ Vinculado</span>
          ) : (
            <button
              onClick={() => { if (selected) saveMapping(v.vendor_id, selected) }}
              disabled={!selected || !changed || saving === v.vendor_id}
              style={{
                background: changed ? 'var(--accent)' : 'transparent',
                color: changed ? '#0e0f11' : 'var(--muted)',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.72rem',
                border: '1px solid var(--border)', borderRadius: '6px',
                padding: '6px 14px', cursor: changed ? 'pointer' : 'default',
                opacity: saving === v.vendor_id ? 0.6 : 1, whiteSpace: 'nowrap',
              }}
            >
              {saving === v.vendor_id ? '...' : 'Vincular'}
            </button>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div>
      <p style={{ fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Vincule cada vendedor do HTML ao usuário do sistema. Vendedores do HTML não registrados aparecem na seção abaixo para cadastro.
      </p>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)' : 'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)' : '#f55c42', border: `1px solid ${msg.startsWith('✓') ? 'rgba(200,245,66,0.3)' : 'rgba(245,92,66,0.3)'}` }}>
          {msg}
        </div>
      )}

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: 'rgba(200,245,66,0.08)', border: '1px solid rgba(200,245,66,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>
          <span style={{ color: 'var(--meta1)', fontWeight: 700 }}>{mappedCount}</span>
          <span style={{ color: 'var(--muted)' }}> vinculados</span>
        </div>
        <div style={{ background: unmappedCount > 0 ? 'rgba(245,200,66,0.08)' : 'var(--surface2)', border: `1px solid ${unmappedCount > 0 ? 'rgba(245,200,66,0.25)' : 'var(--border)'}`, borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>
          <span style={{ color: unmappedCount > 0 ? '#f5c842' : 'var(--muted)', fontWeight: 700 }}>{unmappedCount}</span>
          <span style={{ color: 'var(--muted)' }}> sem usuário</span>
        </div>
        {orphanVendors.length > 0 && (
          <div style={{ background: 'rgba(245,92,66,0.08)', border: '1px solid rgba(245,92,66,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>
            <span style={{ color: '#f55c42', fontWeight: 700 }}>{orphanVendors.length}</span>
            <span style={{ color: 'var(--muted)' }}> não registrados</span>
          </div>
        )}
        <button
          onClick={() => setShowAddModal(true)}
          style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}
        >
          + Adicionar Novo Vendedor
        </button>
      </div>

      {/* === REGISTERED VENDORS TABLE === */}
      <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Vendedor (HTML)', 'Loja', 'ID', 'Usuário do sistema', ''].map(h => (
                <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
                Nenhum vendedor registrado ainda.
              </td></tr>
            ) : vendors.map(v => <VendorRow key={v.vendor_id} v={v} />)}
          </tbody>
        </table>
      </div>

      {/* === ORPHAN VENDORS (in HTML but not in goals) === */}
      {orphanVendors.length > 0 && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f55c42' }}>
              ⚠ Vendedores não registrados
            </h2>
            <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>
              Estes IDs aparecem nas vendas importadas mas não têm metas cadastradas. Clique em "Registrar" para adicionar.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nome (no HTML)', 'Loja', 'ID', ''].map(h => (
                    <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orphanVendors.map(v => (
                  <tr key={v.vendor_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.vendor_name}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{v.store}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#f55c42' }}>{v.vendor_id}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={() => {
                          setAddVendor(v)
                          setAddName(v.vendor_name)
                          setAddStore(v.store)
                          setShowAddModal(true)
                        }}
                        style={{ background: 'rgba(245,92,66,0.15)', color: '#f55c42', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(245,92,66,0.3)', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Registrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === ADD VENDOR MODAL === */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              {addVendor ? `Registrar ${addVendor.vendor_name}` : 'Adicionar Novo Vendedor'}
            </h2>
            <p style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              {addVendor
                ? `ID ${addVendor.vendor_id} encontrado nas vendas. Defina as metas e vincule ao usuário.`
                : 'Cadastre um novo vendedor manualmente com metas e usuário vinculado.'}
            </p>

            {/* Vendor info — editable if manual, locked if from orphan */}
            {addVendor ? (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '0.85rem', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '3px' }}>ID</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{addVendor.vendor_id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '3px' }}>Nome</div>
                  <div style={{ fontWeight: 600 }}>{addVendor.vendor_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '3px' }}>Loja</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>{addVendor.store}</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={labelStyle}>Nome completo</label>
                    <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ex: João Silva" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Loja</label>
                    <select value={addStore} onChange={e => setAddStore(e.target.value)} style={selStyle}>
                      {stores.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Period */}
            <label style={labelStyle}>Período das metas</label>
            <select value={addPeriod} onChange={e => setAddPeriod(Number(e.target.value))} style={{ ...selStyle, marginBottom: '0.85rem' }}>
              {periodOptions.map(p => <option key={p.label} value={0}>{p.label}</option>)}
            </select>

            {/* Meta values */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '0.85rem' }}>
              {[['1ª Meta ($)', addM1, setAddM1], ['2ª Meta ($)', addM2, setAddM2], ['3ª Meta ($)', addM3, setAddM3]].map(([label, val, set]) => (
                <div key={label as string}>
                  <label style={labelStyle}>{label as string}</label>
                  <input type="number" value={val as string} onChange={e => (set as (v:string)=>void)(e.target.value)} style={{ ...inputStyle, textAlign: 'right' }} />
                </div>
              ))}
            </div>

            {/* Link to user */}
            <label style={labelStyle}>Vincular ao usuário (opcional)</label>
            <select value={addUserId} onChange={e => setAddUserId(e.target.value)} style={{ ...selStyle, marginBottom: '1.5rem' }}>
              <option value="">— Sem vínculo por enquanto —</option>
              {profiles.filter(p => p.role === 'vendedor').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowAddModal(false); setAddVendor(null); setAddName(''); setAddM1(''); setAddM2(''); setAddM3(''); setAddUserId('') }}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={registerAndLink}
                disabled={addingVendor || (!addVendor && !addName)}
                style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', opacity: (addingVendor || (!addVendor && !addName)) ? 0.6 : 1 }}
              >
                {addingVendor ? 'Salvando...' : 'Registrar Vendedor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
