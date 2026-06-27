'use client'

import { useEffect, useState } from 'react'
import { fmtCurrency } from '@/lib/utils'
import { fetchClientItemHistory } from './carteiraActions'

interface Item { order_id?: string; order_ref?: string; product_code: string; product_name?: string; category?: string; qty?: number; quantity?: number; unit_price?: number; total_price?: number }

export default function ClientHistoryModal({ clientId, clientName, initialTab, onClose, vendorId }: {
  clientId: string; clientName: string; initialTab: 'ultima' | 'todas'; onClose: () => void; vendorId: string
}) {
  const [tab, setTab] = useState<'ultima' | 'todas' | 'produtos'>(initialTab)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchClientItemHistory(clientId, vendorId).then(d => { if (alive) setItems((d as Item[]) ?? []) }).catch(() => {}).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [clientId, vendorId])

  const key = (i: Item) => i.order_id ?? i.order_ref ?? ''
  const orders = [...new Set(items.map(key))]
  const lastKey = orders[0]
  const lastItems = items.filter(i => key(i) === lastKey)

  const byProduct = new Map<string, { name: string; qty: number; times: number }>()
  for (const i of items) {
    const k = i.product_name ?? i.product_code
    const cur = byProduct.get(k) ?? { name: k, qty: 0, times: 0 }
    cur.qty += Number(i.qty ?? i.quantity ?? 0); cur.times += 1
    byProduct.set(k, cur)
  }

  const th = { textAlign: 'left' as const, padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.62rem' }
  const td = { padding: '8px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', width: '640px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{clientName} — Histórico</strong>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '1.3rem', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', padding: '12px 18px 0' }}>
          {([['ultima','Última nota'],['todas','Todas as notas'],['produtos','Produtos comprados']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '5px 12px', borderRadius: '7px 7px 0 0', cursor: 'pointer', border: '1px solid var(--border)', borderBottom: 'none', background: tab === k ? 'var(--surface)' : 'transparent', color: tab === k ? 'var(--text)' : 'var(--muted)' }}>{l}</button>
          ))}
        </div>
        <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Carregando…</div>
          : tab === 'produtos' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}><th style={th}>PRODUTO</th><th style={{ ...th, textAlign: 'right' }}>QTD TOTAL</th><th style={{ ...th, textAlign: 'right' }}>VEZES</th></tr></thead>
              <tbody>{[...byProduct.values()].sort((a, b) => b.qty - a.qty).map(p => (
                <tr key={p.name} style={{ borderBottom: '1px solid var(--border)' }}><td style={td}>{p.name}</td><td style={{ ...td, textAlign: 'right' }}>{p.qty}</td><td style={{ ...td, textAlign: 'right' }}>{p.times}</td></tr>
              ))}</tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}><th style={th}>NOTA</th><th style={th}>PRODUTO</th><th style={{ ...th, textAlign: 'right' }}>QTD</th><th style={{ ...th, textAlign: 'right' }}>TOTAL</th></tr></thead>
              <tbody>{(tab === 'ultima' ? lastItems : items).map((i, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={td}>{key(i)}</td>
                  <td style={{ ...td, fontFamily: 'inherit' }}>{i.product_name ?? i.product_code}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{i.qty ?? i.quantity}</td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--accent)' }}>{fmtCurrency(Number(i.total_price ?? 0))}</td>
                </tr>
              ))}
              {(tab === 'ultima' ? lastItems : items).length === 0 && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Sem registros</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
