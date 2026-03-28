'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseSalesHtml, toIsoDate } from '@/lib/parser'
import type { Period } from '@/types'

export default function UploadModal({ periods }: { periods: Period[] }) {
  const [open, setOpen]           = useState(false)
  const [periodId, setPeriodId]   = useState(periods[0]?.id?.toString() ?? '')
  const [file, setFile]           = useState<File | null>(null)
  const [status, setStatus]       = useState<'idle' | 'parsing' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage]     = useState('')
  const supabase = createClient()

  async function handleUpload() {
    if (!file || !periodId) return
    setStatus('parsing')
    setMessage('Lendo arquivo...')

    try {
      const html = await file.text()
      const transactions = parseSalesHtml(html)
      setMessage(`${transactions.length} transações encontradas. Inserindo...`)
      setStatus('uploading')

      // Delete existing records for this period to avoid duplicates
      await supabase.from('sales_records').delete().eq('period_id', parseInt(periodId))

      // Build vendor name/store map from goals
      const { data: goals } = await supabase
        .from('goals').select('vendor_id, vendor_name, store').eq('period_id', periodId)
      const vendorMap = Object.fromEntries(
        (goals ?? []).map(g => [g.vendor_id, { name: g.vendor_name, store: g.store }])
      )

      // Batch insert in chunks of 500
      const rows = transactions
        .filter(t => vendorMap[t.vendor_id])
        .map(t => ({
          period_id:   parseInt(periodId),
          vendor_id:   t.vendor_id,
          vendor_name: vendorMap[t.vendor_id]?.name ?? t.vendor_id,
          store:       vendorMap[t.vendor_id]?.store ?? '',
          client_id:   t.client_id,
          client_name: t.client_name,
          sale_date:   toIsoDate(t.sale_date),
          sale_time:   t.sale_time || null,
          order_ref:   t.order_ref,
          valor:       t.valor,
          quantity:    t.quantity,
        }))

      const chunkSize = 500
      for (let i = 0; i < rows.length; i += chunkSize) {
        const { error } = await supabase.from('sales_records').insert(rows.slice(i, i + chunkSize))
        if (error) throw error
        setMessage(`Inserindo... ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`)
      }

      setStatus('done')
      setMessage(`✓ ${rows.length} registros importados com sucesso!`)
      setTimeout(() => { setOpen(false); window.location.reload() }, 2000)
    } catch (err: unknown) {
      setStatus('error')
      setMessage(`Erro: ${err instanceof Error ? err.message : 'Falha na importação'}`)
    }
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif',
        fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px',
        padding: '7px 14px', cursor: 'pointer',
      }}
    >
      + Upload HTML
    </button>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '420px',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Importar Vendas
        </h2>

        <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          Período
        </label>
        <select
          value={periodId}
          onChange={e => setPeriodId(e.target.value)}
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
            fontSize: '0.82rem', padding: '10px 12px', marginBottom: '1rem', outline: 'none',
          }}
        >
          {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>

        <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          Arquivo HTML (Listado de Ventas)
        </label>
        <input
          type="file"
          accept=".html,.htm"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
            fontSize: '0.78rem', padding: '10px 12px', marginBottom: '1.25rem', outline: 'none',
          }}
        />

        {message && (
          <div style={{
            padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem',
            fontFamily: 'DM Mono, monospace',
            background: status === 'error' ? 'rgba(245,92,66,0.1)' : status === 'done' ? 'rgba(200,245,66,0.1)' : 'var(--surface2)',
            color: status === 'error' ? '#f55c42' : status === 'done' ? 'var(--meta1)' : 'var(--muted)',
            border: `1px solid ${status === 'error' ? 'rgba(245,92,66,0.3)' : status === 'done' ? 'rgba(200,245,66,0.3)' : 'var(--border)'}`,
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setOpen(false); setStatus('idle'); setMessage('') }}
            disabled={status === 'uploading' || status === 'parsing'}
            style={{
              flex: 1, background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif',
              fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !periodId || status === 'uploading' || status === 'parsing' || status === 'done'}
            style={{
              flex: 2, background: 'var(--accent)', color: '#0e0f11',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem',
              border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer',
              opacity: (!file || status !== 'idle') ? 0.6 : 1,
            }}
          >
            {status === 'parsing' || status === 'uploading' ? 'Processando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  )
}
