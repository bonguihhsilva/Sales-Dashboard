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
  const [links, setLinks] = useState<Record<string, string>>(() =>
    Object.fromEntries(profiles.filter(p => p.vendor_id).map(p => [p.vendor_id!, p.id]))
  )
  const [saving, setSaving]     = useState<string | null>(null)
  const [msg, setMsg]           = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const [addVendor, setAddVendor] = useState<Vendor | null>(null)
  const [addName, setAddName]     = useState('')
  const [addStore, setAddStore]   = useState(stores.length > 0 ? stores[0].key : '')
  const [addUserId, setAddUserId] = useState('')
  const [addM1, setAddM1]         = useState('')
  const [addM2, setAddM2]         = useState('')
  const [addM3, setAddM3]         = useState('')
  const [addPeriod, setAddPeriod] = useState(1)
  const [addingVendor, setAddingVendor] = useState(false)

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

  const selStyle = "w-full bg-surface-container-high/50 border border-white/10 rounded-lg text-white font-mono text-xs px-3 py-2 outline-none focus:border-accent transition-colors cursor-pointer"
  const inputStyle = "w-full bg-surface-container-high/50 border border-white/10 rounded-lg text-white font-mono text-xs px-3 py-2 outline-none focus:border-accent transition-colors"
  const labelStyle = "block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1"

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
      <tr className="hover:bg-secondary/10 transition-colors">
        <td className="px-4 py-3 font-semibold">{v.vendor_name}</td>
        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.store}</td>
        <td className="px-4 py-3 font-mono text-xs text-accent">{v.vendor_id}</td>
        <td className="px-4 py-3 min-w-[240px]">
          <select value={selected} onChange={e => setSelected(e.target.value)} className={selStyle}>
            <option value="">— Selecionar usuário —</option>
            {profiles.filter(p => p.role === 'vendedor').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          {currentUserId && !changed ? (
            <span className="font-mono text-[11px] text-green-400">✓ Vinculado</span>
          ) : (
            <button
              onClick={() => { if (selected) saveMapping(v.vendor_id, selected) }}
              disabled={!selected || !changed || saving === v.vendor_id}
              className={`font-display font-bold text-[11px] border rounded-md px-3 py-1.5 whitespace-nowrap transition-colors ${
                changed 
                  ? 'bg-accent text-bg border-accent cursor-pointer' 
                  : 'bg-transparent text-muted-foreground border-white/10 cursor-default'
              } ${saving === v.vendor_id ? 'opacity-60' : ''}`}
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
      <p className="text-xs font-mono text-muted-foreground mb-6 leading-relaxed">
        Vincule cada vendedor do HTML ao usuário do sistema. Vendedores do HTML não registrados aparecem na seção abaixo para cadastro.
      </p>

      {msg && (
        <div className={`px-4 py-3 rounded-lg mb-6 text-xs font-mono border ${msg.startsWith('✓') ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {msg}
        </div>
      )}

      {/* Summary pills */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 text-xs font-mono">
          <span className="text-green-400 font-bold">{mappedCount}</span>
          <span className="text-muted-foreground"> vinculados</span>
        </div>
        <div className={`border rounded-lg px-4 py-2 text-xs font-mono ${unmappedCount > 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-surface-container-high/30 border-white/5'}`}>
          <span className={`font-bold ${unmappedCount > 0 ? 'text-yellow-400' : 'text-muted-foreground'}`}>{unmappedCount}</span>
          <span className="text-muted-foreground"> sem usuário</span>
        </div>
        {orphanVendors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-xs font-mono">
            <span className="text-red-400 font-bold">{orphanVendors.length}</span>
            <span className="text-muted-foreground"> não registrados</span>
          </div>
        )}
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto bg-accent text-bg font-display font-bold text-xs border-none rounded-lg px-4 py-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          + Adicionar Novo Vendedor
        </button>
      </div>

      {/* === REGISTERED VENDORS TABLE === */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 mb-10">
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-surface-container-high/50 border-b border-white/5">
              <tr>
                {['Vendedor (HTML)', 'Loja', 'ID', 'Usuário do sistema', ''].map(h => (
                  <th key={h} className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-mono text-xs">
                  Nenhum vendedor registrado ainda.
                </td></tr>
              ) : vendors.map(v => <VendorRow key={v.vendor_id} v={v} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* === ORPHAN VENDORS === */}
      {orphanVendors.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-red-400 font-display-lg">
              ⚠ Vendedores não registrados
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Estes IDs aparecem nas vendas importadas mas não têm metas cadastradas. Clique em "Registrar" para adicionar.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-container-high/50 border-b border-white/5">
                  <tr>
                    {['Nome (no HTML)', 'Loja', 'ID', ''].map(h => (
                      <th key={h} className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orphanVendors.map(v => (
                    <tr key={v.vendor_id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-3 font-semibold">{v.vendor_name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.store}</td>
                      <td className="px-4 py-3 font-mono text-xs text-red-400">{v.vendor_id}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setAddVendor(v)
                            setAddName(v.vendor_name)
                            setAddStore(v.store)
                            setShowAddModal(true)
                          }}
                          className="bg-red-500/10 text-red-400 font-display font-bold text-[11px] border border-red-500/30 rounded-md px-3 py-1.5 cursor-pointer whitespace-nowrap hover:bg-red-500/20 transition-colors"
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
        </div>
      )}

      {/* === ADD VENDOR MODAL === */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card shadow-2xl">
            <h2 className="text-xl font-bold mb-2 font-display-lg">
              {addVendor ? `Registrar ${addVendor.vendor_name}` : 'Adicionar Novo Vendedor'}
            </h2>
            <p className="text-xs font-mono text-muted-foreground mb-6">
              {addVendor
                ? `ID ${addVendor.vendor_id} encontrado nas vendas. Defina as metas e vincule ao usuário.`
                : 'Cadastre um novo vendedor manualmente com metas e usuário vinculado.'}
            </p>

            {addVendor ? (
              <div className="flex gap-4 mb-4 p-4 bg-surface-container-high/30 rounded-xl border border-white/5">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">ID</div>
                  <div className="font-bold text-accent font-mono text-sm">{addVendor.vendor_id}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Nome</div>
                  <div className="font-semibold text-sm">{addVendor.vendor_name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Loja</div>
                  <div className="font-mono text-xs">{addVendor.store}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelStyle}>Nome completo</label>
                  <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ex: João Silva" className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Loja</label>
                  <select value={addStore} onChange={e => setAddStore(e.target.value)} className={selStyle}>
                    {stores.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            <label className={labelStyle}>Período das metas</label>
            <select value={addPeriod} onChange={e => setAddPeriod(Number(e.target.value))} className={`${selStyle} mb-3`}>
              {periodOptions.map(p => <option key={p.label} value={0}>{p.label}</option>)}
            </select>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['1ª Meta ($)', addM1, setAddM1], ['2ª Meta ($)', addM2, setAddM2], ['3ª Meta ($)', addM3, setAddM3]].map(([label, val, set]) => (
                <div key={label as string}>
                  <label className={labelStyle}>{label as string}</label>
                  <input type="number" value={val as string} onChange={e => (set as (v:string)=>void)(e.target.value)} className={`${inputStyle} text-right`} />
                </div>
              ))}
            </div>

            <label className={labelStyle}>Vincular ao usuário (opcional)</label>
            <select value={addUserId} onChange={e => setAddUserId(e.target.value)} className={`${selStyle} mb-6`}>
              <option value="">— Sem vínculo por enquanto —</option>
              {profiles.filter(p => p.role === 'vendedor').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { setShowAddModal(false); setAddVendor(null); setAddName(''); setAddM1(''); setAddM2(''); setAddM3(''); setAddUserId('') }}
                className="flex-1 bg-transparent border border-white/10 rounded-lg text-muted-foreground font-display font-semibold text-sm p-3 cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={registerAndLink}
                disabled={addingVendor || (!addVendor && !addName)}
                className={`flex-[2] bg-accent text-bg font-display font-bold text-sm border-none rounded-lg p-3 cursor-pointer transition-opacity ${(addingVendor || (!addVendor && !addName)) ? 'opacity-50' : 'hover:opacity-90'}`}
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
