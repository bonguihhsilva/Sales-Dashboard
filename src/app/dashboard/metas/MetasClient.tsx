'use client'

import { useState } from 'react'

interface Period { id: number; label: string; year: number; month: number; start_date: string; end_date: string; closed: boolean }
interface Goal { id: number; period_id: number; vendor_id: string; vendor_name: string; store: string; meta1: number; meta2: number; meta3: number; bonus1: number; bonus2: number; bonus3: number; history_months: number | null }

const STORES = ['Jebai', 'Paje-MKT', 'Paje-Caixa']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const inputStyle = {
  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
  color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem',
  padding: '6px 8px', outline: 'none', width: '100%', textAlign: 'left' as const,
}
const labelStyle = {
  display: 'block' as const, fontSize: '0.62rem', fontFamily: 'DM Mono, monospace',
  color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px',
}

export default function MetasClient({ periods, goals }: { periods: Period[]; goals: Goal[] }) {
  const [activePeriod, setActivePeriod] = useState<number>(periods[0]?.id ?? 0)
  const [showNewPeriod, setShowNewPeriod] = useState(false)
  const [showNewVendor, setShowNewVendor] = useState(false)
  const [msg, setMsg] = useState('')

  // New period form
  const [npYear,  setNpYear]  = useState(new Date().getFullYear())
  const [npMonth, setNpMonth] = useState(new Date().getMonth() + 1)

  // New vendor form
  const [nvId,    setNvId]    = useState('')
  const [nvName,  setNvName]  = useState('')
  const [nvStore, setNvStore] = useState('Jebai')

  const periodGoals = goals.filter(g => g.period_id === activePeriod)

  function fmt(n: number) {
    return n.toLocaleString('pt-BR')
  }

  async function createPeriod() {
    const label = `${MONTHS[npMonth - 1]} ${npYear}`
    const start = `${npYear}-${String(npMonth).padStart(2,'0')}-01`
    const lastDay = new Date(npYear, npMonth, 0).getDate()
    const end   = `${npYear}-${String(npMonth).padStart(2,'0')}-${lastDay}`
    const res = await fetch('/api/admin/create-period', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: npYear, month: npMonth, label, start_date: start, end_date: end }),
    })
    const data = await res.json()
    if (data.error) { setMsg(`Erro: ${data.error}`); return }
    setMsg(`✓ Período ${label} criado! Agora adicione as metas dos vendedores.`)
    setTimeout(() => window.location.reload(), 1500)
  }

  async function addVendorGoal() {
    const res = await fetch('/api/admin/update-goals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        create: true, period_id: activePeriod,
        vendor_id: nvId, vendor_name: nvName, store: nvStore,
        meta1: 0, meta2: 0, meta3: 0,
        bonus1: 100, bonus2: 150, bonus3: 200,
      }),
    })
    const data = await res.json()
    if (data.error) { setMsg(`Erro: ${data.error}`); return }
    setMsg(`✓ ${nvName} adicionado!`)
    setShowNewVendor(false)
    setNvId(''); setNvName(''); setNvStore('Jebai')
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select
          value={activePeriod}
          onChange={e => setActivePeriod(Number(e.target.value))}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', padding: '8px 12px', outline: 'none' }}
        >
          {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <button onClick={() => setShowNewPeriod(true)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '8px 14px', cursor: 'pointer' }}>
          + Novo Período
        </button>
        <button onClick={() => setShowNewVendor(true)} style={{ background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', marginLeft: 'auto' }}>
          + Adicionar Vendedor
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)' : 'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)' : '#f55c42', border: `1px solid ${msg.startsWith('✓') ? 'rgba(200,245,66,0.3)' : 'rgba(245,92,66,0.3)'}` }}>
          {msg}
        </div>
      )}

      {/* Info banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.9rem' }}>ℹ</span>
        <span>Metas calculadas automaticamente: média dos 3 meses anteriores × 1,20 / 1,44 / 1,73</span>
      </div>

      {/* Goals table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {([
                { h: 'Vendedor',    a: 'left'  },
                { h: 'Loja',        a: 'left'  },
                { h: 'ID',          a: 'left'  },
                { h: '1ª Meta',    a: 'right' },
                { h: '2ª Meta',    a: 'right' },
                { h: '3ª Meta',    a: 'right' },
                { h: 'Bônus 1',    a: 'right' },
                { h: 'Bônus 2',    a: 'right' },
                { h: 'Bônus 3',    a: 'right' },
              ] as {h:string;a:string}[]).map(col => (
                <th key={col.h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 10px', textAlign: col.a as 'left'|'right'|'center', whiteSpace: 'nowrap' }}>{col.h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodGoals.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
                Nenhuma meta cadastrada para este período. Clique em &quot;+ Adicionar Vendedor&quot;.
              </td></tr>
            ) : periodGoals.map(g => {
              const awaitingHistory = g.history_months !== null && g.history_months < 3
              return (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{g.vendor_name}</span>
                      {awaitingHistory && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.35)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>
                          Aguardando histórico ({g.history_months ?? 0}/3 meses)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{g.store}</td>
                  <td style={{ padding: '8px 10px', fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{g.vendor_id}</td>
                  {(['meta1','meta2','meta3','bonus1','bonus2','bonus3'] as const).map(field => (
                    <td key={field} style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', color: awaitingHistory ? 'var(--muted)' : 'var(--text)' }}>
                      {awaitingHistory ? '—' : fmt(g[field])}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* New Period Modal */}
      {showNewPeriod && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '380px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Novo Período</h2>
            <label style={labelStyle}>Ano</label>
            <input type="number" value={npYear} onChange={e => setNpYear(Number(e.target.value))} style={{ ...inputStyle, marginBottom: '0.85rem' }} />
            <label style={labelStyle}>Mês</label>
            <select value={npMonth} onChange={e => setNpMonth(Number(e.target.value))} style={{ ...inputStyle, marginBottom: '1.25rem', cursor: 'pointer' }}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowNewPeriod(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={createPeriod} style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>Criar Período</button>
            </div>
          </div>
        </div>
      )}

      {/* New Vendor Goal Modal */}
      {showNewVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '420px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Adicionar Vendedor ao Período</h2>
            <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              As metas serão calculadas automaticamente após 3 meses de histórico.
            </p>
            <label style={labelStyle}>ID do vendedor (número do HTML)</label>
            <input value={nvId} onChange={e => setNvId(e.target.value)} placeholder="Ex: 35" style={{ ...inputStyle, marginBottom: '0.85rem' }} />
            <label style={labelStyle}>Nome completo</label>
            <input value={nvName} onChange={e => setNvName(e.target.value)} placeholder="Ex: Tania Velazquez" style={{ ...inputStyle, marginBottom: '0.85rem' }} />
            <label style={labelStyle}>Loja</label>
            <select value={nvStore} onChange={e => setNvStore(e.target.value)} style={{ ...inputStyle, marginBottom: '1.25rem', cursor: 'pointer' }}>
              {STORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowNewVendor(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={addVendorGoal} disabled={!nvId || !nvName} style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', opacity: (!nvId || !nvName) ? 0.6 : 1 }}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
