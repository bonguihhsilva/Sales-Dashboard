'use client'

import { useState } from 'react'
import type { Profile } from '@/types'

interface Vendor   { vendor_id: string; vendor_name: string; store: string }
interface Period   { id: number; label: string; year: number; month: number }
interface Goal     { id: number; period_id: number; vendor_id: string; vendor_name: string; store: string; meta1: number; meta2: number; meta3: number; bonus1: number; bonus2: number; bonus3: number }

const STORES = ['Jebai', 'Paje-MKT', 'Paje-Caixa']

export default function UsersClient({ profiles, periods, goals, allVendors }: {
  profiles: Profile[]; periods: Period[]; goals: Goal[]; allVendors: Vendor[]
}) {
  const [tab, setTab]           = useState<'usuarios' | 'metas'>('usuarios')
  const [list, setList]         = useState<Profile[]>(profiles)
  const [editGoals, setEditGoals] = useState<Goal[]>(goals)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<Profile & { email?: string; newPwd?: string; store?: string | null } | null>(null)
  const [activePeriod, setActivePeriod] = useState(periods[0]?.id ?? 0)
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState<number | null>(null)
  const [msg, setMsg]           = useState('')

  // Create form
  const [newName, setNewName]     = useState('')
  const [newEmail, setNewEmail]   = useState('')
  const [newPwd, setNewPwd]       = useState('')
  const [newRole, setNewRole]     = useState<'adm'|'vendedor'>('vendedor')
  const [newVendor, setNewVendor] = useState('')
  const [newStore, setNewStore]   = useState('')

  const s = { // shared styles
    input:  { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'DM Mono,monospace', fontSize:'0.82rem', padding:'9px 12px', outline:'none', width:'100%', marginBottom:'0.85rem' } as React.CSSProperties,
    label:  { display:'block' as const, fontSize:'0.62rem', fontFamily:'DM Mono,monospace', color:'var(--muted)', textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:'5px' },
    btnP:   { background:'var(--accent)', color:'#0e0f11', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.85rem', border:'none', borderRadius:'8px', padding:'10px', cursor:'pointer' } as React.CSSProperties,
    btnS:   { background:'transparent', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--muted)', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.85rem', padding:'10px', cursor:'pointer' } as React.CSSProperties,
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 4000) }

  async function api(url: string, body: Record<string, unknown>) {
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    return r.json()
  }

  async function createUser() {
    setLoading(true)
    const data = await api('/api/admin/create-user', { email:newEmail, password:newPwd, name:newName, role:newRole, vendor_id:newVendor||null, store:newStore||null })
    if (data.error) { flash(`Erro: ${data.error}`); setLoading(false); return }
    flash(`✓ Usuário ${newName} criado!`)
    setShowCreate(false); setNewName(''); setNewEmail(''); setNewPwd(''); setNewVendor(''); setNewStore('')
    setTimeout(() => window.location.reload(), 800)
    setLoading(false)
  }

  async function saveUser() {
    if (!editUser) return
    setLoading(true)
    const body: Record<string, unknown> = { user_id: editUser.id, name: editUser.name, role: editUser.role, vendor_id: editUser.vendor_id || null, active: editUser.active, store: editUser.store || null }
    if (editUser.email)  body.email    = editUser.email
    if (editUser.newPwd) body.password = editUser.newPwd
    const data = await api('/api/admin/update-user', body)
    if (data.error) { flash(`Erro: ${data.error}`); setLoading(false); return }
    const savedStore = editUser.store ?? null
    setList(l => l.map(p => p.id === editUser!.id ? { ...p, name: editUser!.name, role: editUser!.role, vendor_id: editUser!.vendor_id, active: editUser!.active, store: savedStore } : p))
    flash('✓ Usuário atualizado!')
    setEditUser(null)
    setLoading(false)
  }

  async function saveGoal(goal: Goal) {
    setSaving(goal.id)
    const data = await api('/api/admin/update-goals', { id:goal.id, meta1:goal.meta1, meta2:goal.meta2, meta3:goal.meta3, bonus1:goal.bonus1, bonus2:goal.bonus2, bonus3:goal.bonus3 })
    if (data.error) flash(`Erro: ${data.error}`)
    else flash(`✓ Meta de ${goal.vendor_name} salva!`)
    setSaving(null)
  }

  function updateGoal(id: number, field: keyof Goal, value: string) {
    setEditGoals(gs => gs.map(g => g.id === id ? { ...g, [field]: Number(value) } : g))
  }

  const periodGoals = editGoals.filter(g => g.period_id === activePeriod)

  // Linked vendor lookup
  const vendorById = Object.fromEntries(allVendors.map(v => [v.vendor_id, v]))

  // Vendors not linked to any user
  const linkedVendorIds = new Set(list.map(p => p.vendor_id).filter(Boolean) as string[])
  // Sort: orphan vendors (no goals/name) first, then by name
  const unlinkedVendors = allVendors
    .filter(v => !linkedVendorIds.has(v.vendor_id))
    .sort((a, b) => {
      const aOrphan = a.vendor_name === `Vendedor ${a.vendor_id}` || a.store === 'Sem loja'
      const bOrphan = b.vendor_name === `Vendedor ${b.vendor_id}` || b.store === 'Sem loja'
      if (aOrphan && !bOrphan) return -1
      if (!aOrphan && bOrphan) return 1
      return a.vendor_name.localeCompare(b.vendor_name)
    })

  const TAB_STYLE = (active: boolean) => ({
    padding:'8px 20px', borderRadius:'6px 6px 0 0', fontSize:'0.82rem', fontWeight:600 as const,
    border:'1px solid transparent', borderBottom:'none', cursor:'pointer' as const,
    background: active ? 'var(--surface)' : 'transparent',
    borderColor: active ? 'var(--border)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--muted)',
    fontFamily: 'Syne, sans-serif',
  })

  return (
    <div>
      {msg && (
        <div style={{ padding:'10px 14px', borderRadius:'8px', marginBottom:'1rem', fontSize:'0.78rem', fontFamily:'DM Mono,monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)':'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)':'#f55c42', border:`1px solid ${msg.startsWith('✓')?'rgba(200,245,66,0.3)':'rgba(245,92,66,0.3)'}` }}>
          {msg}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display:'flex', gap:'4px', borderBottom:'1px solid var(--border)', marginBottom:'1.5rem' }}>
        <button style={TAB_STYLE(tab==='usuarios')} onClick={() => setTab('usuarios')}>Usuários & Mapeamento</button>
        <button style={TAB_STYLE(tab==='metas')} onClick={() => setTab('metas')}>Metas por Período</button>
      </div>

      {/* ══════════════ TAB: USUARIOS ══════════════ */}
      {tab === 'usuarios' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <span style={{ fontSize:'0.68rem', fontFamily:'DM Mono,monospace', color:'var(--muted)' }}>{list.length} usuários</span>
            <button onClick={() => setShowCreate(true)} style={{ ...s.btnP, fontSize:'0.78rem', padding:'7px 14px' }}>+ Novo Usuário</button>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem', tableLayout:'fixed' }}>
              <colgroup>
                <col style={{ width:'18%' }} /><col style={{ width:'7%' }} />
                <col style={{ width:'18%' }} /><col style={{ width:'10%' }} />
                <col style={{ width:'7%' }} /><col style={{ width:'12%' }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Nome','Role','Vendedor vinculado','Loja','Status','Ações'].map(h => (
                    <th key={h} style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'6px 10px', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map(p => {
                  const v = vendorById[p.vendor_id ?? '']
                  return (
                    <tr key={p.id} style={{ borderBottom:'1px solid var(--border)', opacity: p.active ? 1 : 0.5 }}>
                      <td style={{ padding:'9px 10px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</td>
                      <td style={{ padding:'9px 10px' }}>
                        <span style={{ fontFamily:'DM Mono,monospace', fontSize:'0.63rem', padding:'2px 7px', borderRadius:'4px', background: p.role==='adm'?'rgba(200,245,66,0.15)':'rgba(66,217,245,0.12)', color: p.role==='adm'?'var(--meta1)':'var(--mkt)' }}>{p.role}</span>
                      </td>
                      <td style={{ padding:'9px 10px', fontFamily:'DM Mono,monospace', fontSize:'0.73rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {v ? v.vendor_name : p.vendor_id ? <span style={{ color:'#f55c42' }}>ID {p.vendor_id} (não mapeado)</span> : <span style={{ color:'var(--muted)' }}>—</span>}
                      </td>
                      <td style={{ padding:'9px 10px', fontFamily:'DM Mono,monospace', fontSize:'0.7rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v?.store ?? '—'}</td>
                      <td style={{ padding:'9px 10px' }}>
                        <span style={{ fontFamily:'DM Mono,monospace', fontSize:'0.63rem', padding:'2px 7px', borderRadius:'4px', background: p.active?'rgba(200,245,66,0.1)':'rgba(107,111,122,0.15)', color: p.active?'var(--meta1)':'var(--muted)' }}>{p.active?'ativo':'inativo'}</span>
                      </td>
                      <td style={{ padding:'9px 10px' }}>
                        <button onClick={() => setEditUser({ ...p, email:'', newPwd:'', store: p.store ?? vendorById[p.vendor_id ?? '']?.store ?? '' })} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:'5px', color:'var(--muted)', fontFamily:'DM Mono,monospace', fontSize:'0.65rem', padding:'3px 10px', cursor:'pointer' }}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: METAS ══════════════ */}
      {tab === 'metas' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'1.25rem', flexWrap:'wrap' }}>
            <select value={activePeriod} onChange={e => setActivePeriod(Number(e.target.value))}
              style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontFamily:'DM Mono,monospace', fontSize:'0.8rem', padding:'8px 12px', outline:'none' }}>
              {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <span style={{ fontSize:'0.68rem', fontFamily:'DM Mono,monospace', color:'var(--muted)' }}>{periodGoals.length} vendedores</span>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8rem', tableLayout:'fixed' }}>
              <colgroup>
                <col style={{ width:'16%' }} /><col style={{ width:'9%' }} /><col style={{ width:'5%' }} />
                <col style={{ width:'10%' }} /><col style={{ width:'10%' }} /><col style={{ width:'10%' }} />
                <col style={{ width:'8%' }} /><col style={{ width:'8%' }} /><col style={{ width:'8%' }} />
                <col style={{ width:'9%' }} />
                <col style={{ width:'7%' }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {[
                    {h:'Vendedor',a:'left'},{h:'Loja',a:'left'},{h:'ID',a:'left'},
                    {h:'1ª Meta ($)',a:'right'},{h:'2ª Meta ($)',a:'right'},{h:'3ª Meta ($)',a:'right'},
                    {h:'Bônus 1',a:'right'},{h:'Bônus 2',a:'right'},{h:'Bônus 3',a:'right'},
                    {h:'Usuário',a:'left'},
                    {h:'',a:'left'},
                  ].map(col => (
                    <th key={col.h} style={{ fontFamily:'DM Mono,monospace', fontSize:'0.58rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 8px', textAlign:col.a as 'left'|'right', whiteSpace:'nowrap' }}>{col.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periodGoals.length === 0 ? (
                  <tr><td colSpan={11} style={{ padding:'2rem', textAlign:'center', color:'var(--muted)', fontFamily:'DM Mono,monospace' }}>Nenhuma meta para este período.</td></tr>
                ) : periodGoals.map(g => {
                  const linkedUser = list.find(p => p.vendor_id === g.vendor_id)
                  const cur = editGoals.find(eg => eg.id === g.id) ?? g
                  const inputStyle = { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'5px', color:'var(--text)', fontFamily:'DM Mono,monospace', fontSize:'0.75rem', padding:'5px 6px', outline:'none', width:'100%', textAlign:'right' as const }
                  return (
                    <tr key={g.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'6px 8px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.vendor_name}</td>
                      <td style={{ padding:'6px 8px', fontFamily:'DM Mono,monospace', fontSize:'0.7rem', color:'var(--muted)' }}>{g.store}</td>
                      <td style={{ padding:'6px 8px', fontFamily:'DM Mono,monospace', fontSize:'0.7rem', color:'var(--accent)' }}>{g.vendor_id}</td>
                      {(['meta1','meta2','meta3','bonus1','bonus2','bonus3'] as const).map(field => (
                        <td key={field} style={{ padding:'4px 6px', textAlign:'right' }}>
                          <input type="number" value={cur[field]} onChange={e => updateGoal(g.id, field, e.target.value)} style={inputStyle} />
                        </td>
                      ))}
                      <td style={{ padding:'6px 8px', fontSize:'0.7rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {linkedUser
                          ? <span style={{ color:'var(--meta1)', fontFamily:'DM Mono,monospace' }}>✓ {linkedUser.name}</span>
                          : <span style={{ color:'#f5c842', fontFamily:'DM Mono,monospace', fontSize:'0.65rem' }}>Não vinculado</span>
                        }
                      </td>
                      <td style={{ padding:'6px 8px' }}>
                        <button onClick={() => saveGoal(cur)} disabled={saving === g.id}
                          style={{ background:'var(--accent)', color:'#0e0f11', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.68rem', border:'none', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', opacity:saving===g.id?0.6:1, whiteSpace:'nowrap' }}>
                          {saving === g.id ? '...' : 'Salvar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ CREATE USER MODAL ══════ */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'2rem', width:'100%', maxWidth:'460px', maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>Criar Novo Usuário</h2>
            <label style={s.label}>Nome completo</label>
            <input style={s.input} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Tania Velazquez" />
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="tania@dasilva.com" />
            <label style={s.label}>Senha inicial</label>
            <input style={s.input} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
            <label style={s.label}>Role</label>
            <select style={{ ...s.input }} value={newRole} onChange={e => setNewRole(e.target.value as 'adm'|'vendedor')}>
              <option value="vendedor">Vendedor</option>
              <option value="adm">ADM</option>
            </select>
            <label style={s.label}>Vincular ao vendedor (opcional)</label>
            <select style={{ ...s.input }} value={newVendor} onChange={e => {
              setNewVendor(e.target.value)
              const v = allVendors.find(x => x.vendor_id === e.target.value)
              if (v?.store && v.store !== 'Sem loja') setNewStore(v.store)
            }}>
              <option value="">— Não vinculado por enquanto —</option>
              {unlinkedVendors.length === 0
                ? <option disabled>Todos os vendedores já têm usuário</option>
                : unlinkedVendors.map(v => (
                    <option key={v.vendor_id} value={v.vendor_id}>
                      {v.vendor_name === `Vendedor ${v.vendor_id}` ? `ID ${v.vendor_id} (sem nome)` : v.vendor_name} — ID {v.vendor_id}{v.store && v.store !== 'Sem loja' ? ` (${v.store})` : ''}
                    </option>
                  ))
              }
            </select>
            <label style={s.label}>Loja</label>
            <select style={{ ...s.input }} value={newStore} onChange={e => setNewStore(e.target.value)}>
              <option value="">— Selecionar loja —</option>
              <option value="Jebai">Jebai</option>
              <option value="Paje-MKT">Paje-MKT</option>
              <option value="Paje-Caixa">Paje-Caixa</option>
            </select>
            <div style={{ display:'flex', gap:'10px', marginTop:'0.5rem' }}>
              <button onClick={() => setShowCreate(false)} style={{ ...s.btnS, flex:1 }}>Cancelar</button>
              <button onClick={createUser} disabled={loading || !newEmail || !newName || !newPwd} style={{ ...s.btnP, flex:2, opacity:loading?0.7:1 }}>
                {loading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ EDIT USER MODAL ══════ */}
      {editUser && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'2rem', width:'100%', maxWidth:'480px', maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>
              Editar — <span style={{ color:'var(--accent)' }}>{list.find(p => p.id === editUser.id)?.name}</span>
            </h2>

            <label style={s.label}>Nome</label>
            <input style={s.input} value={editUser.name} onChange={e => setEditUser(u => u ? {...u, name:e.target.value} : u)} />

            <label style={s.label}>Novo email (vazio = não alterar)</label>
            <input style={s.input} type="email" value={editUser.email ?? ''} placeholder="novo@email.com" onChange={e => setEditUser(u => u ? {...u, email:e.target.value} : u)} />

            <label style={s.label}>Nova senha (vazio = não alterar)</label>
            <input style={s.input} type="password" value={editUser.newPwd ?? ''} placeholder="Nova senha..." onChange={e => setEditUser(u => u ? {...u, newPwd:e.target.value} : u)} />

            <label style={s.label}>Role</label>
            <select style={{ ...s.input }} value={editUser.role} onChange={e => setEditUser(u => u ? {...u, role:e.target.value as 'adm'|'vendedor'} : u)}>
              <option value="vendedor">Vendedor</option>
              <option value="adm">ADM</option>
            </select>

            <label style={s.label}>Vendedor vinculado (ID)</label>
            <select style={{ ...s.input }} value={editUser.vendor_id ?? ''} onChange={e => {
              const v = allVendors.find(x => x.vendor_id === e.target.value)
              setEditUser(u => u ? {
                ...u,
                vendor_id: e.target.value || null,
                store: v?.store && v.store !== 'Sem loja' ? v.store : (u.store ?? ''),
              } : u)
            }}>
              <option value="">— Não vinculado —</option>
              {allVendors
                .filter(v => !linkedVendorIds.has(v.vendor_id) || v.vendor_id === editUser.vendor_id)
                .sort((a, b) => {
                  // Current vendor first
                  if (a.vendor_id === editUser.vendor_id) return -1
                  if (b.vendor_id === editUser.vendor_id) return 1
                  // Orphans (no name/store) second
                  const aOrphan = a.vendor_name === `Vendedor ${a.vendor_id}` || a.store === 'Sem loja'
                  const bOrphan = b.vendor_name === `Vendedor ${b.vendor_id}` || b.store === 'Sem loja'
                  if (aOrphan && !bOrphan) return -1
                  if (!aOrphan && bOrphan) return 1
                  return a.vendor_name.localeCompare(b.vendor_name)
                })
                .map(v => (
                  <option key={v.vendor_id} value={v.vendor_id}>
                    {v.vendor_name === `Vendedor ${v.vendor_id}` ? `ID ${v.vendor_id} (sem nome)` : v.vendor_name} — ID {v.vendor_id}{v.store && v.store !== 'Sem loja' ? ` (${v.store})` : ''}
                  </option>
                ))
              }
            </select>

            <label style={s.label}>Loja</label>
            <select style={{ ...s.input }} value={editUser.store ?? ''} onChange={e => setEditUser(u => u ? {...u, store: e.target.value} : u)}>
              <option value="">— Selecionar loja —</option>
              <option value="Jebai">Jebai</option>
              <option value="Paje-MKT">Paje-MKT</option>
              <option value="Paje-Caixa">Paje-Caixa</option>
            </select>

            <label style={s.label}>Status</label>
            <select style={{ ...s.input }} value={editUser.active?'true':'false'} onChange={e => setEditUser(u => u ? {...u, active:e.target.value==='true'} : u)}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => { setEditUser(null) }} style={{ ...s.btnS, flex:1 }}>Cancelar</button>
              <button onClick={saveUser} disabled={loading} style={{ ...s.btnP, flex:2, opacity:loading?0.7:1 }}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
