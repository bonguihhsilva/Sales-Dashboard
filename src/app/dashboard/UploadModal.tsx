'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseSalesHtml, toIsoDate } from '@/lib/parser'
import type { Period } from '@/types'

export default function UploadModal({ periods }: { periods: Period[] }) {
  const [open, setOpen]         = useState(false)
  const [periodId, setPeriodId] = useState(periods[0]?.id?.toString() ?? '')
  const [file, setFile]         = useState<File | null>(null)
  const [mode, setMode]         = useState<'incremental' | 'replace'>('incremental')
  const [status, setStatus]     = useState<'idle' | 'parsing' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage]   = useState('')
  const [stats, setStats]       = useState<{ inserted: number; skipped: number } | null>(null)
  const supabase = createClient()

  async function handleUpload() {
    if (!file || !periodId) return
    setStatus('parsing')
    setStats(null)
    setMessage('Lendo arquivo...')

    try {
      const html = await file.text()
      const transactions = parseSalesHtml(html)
      setMessage(`${transactions.length} transações encontradas. Processando...`)
      setStatus('uploading')

      // Build vendor name/store map from goals
      const { data: goals } = await supabase
        .from('goals').select('vendor_id, vendor_name, store').eq('period_id', periodId)
      const vendorMap = Object.fromEntries(
        (goals ?? []).map(g => [g.vendor_id, { name: g.vendor_name, store: g.store }])
      )

      const pid = parseInt(periodId)

      if (mode === 'replace') {
        // Full replace: delete all records for this period first
        await supabase.from('sales_records').delete().eq('period_id', pid)
      }

      // Build rows
      const rows = transactions
        .filter(t => vendorMap[t.vendor_id])
        .map(t => ({
          period_id:   pid,
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

      let inserted = 0
      let skipped  = 0
      const chunkSize = 500

      if (mode === 'incremental') {
        // Get existing order_refs for this period to avoid duplicates
        const { data: existing } = await supabase
          .from('sales_records')
          .select('order_ref')
          .eq('period_id', pid)
        const existingRefs = new Set((existing ?? []).map(r => r.order_ref))

        const newRows = rows.filter(r => !existingRefs.has(r.order_ref))
        skipped = rows.length - newRows.length

        for (let i = 0; i < newRows.length; i += chunkSize) {
          const { error } = await supabase.from('sales_records').insert(newRows.slice(i, i + chunkSize))
          if (error) throw error
          inserted = Math.min(i + chunkSize, newRows.length)
          setMessage(`Inserindo novas transações... ${inserted} / ${newRows.length}`)
        }
        inserted = newRows.length
      } else {
        // Full replace mode
        for (let i = 0; i < rows.length; i += chunkSize) {
          const { error } = await supabase.from('sales_records').insert(rows.slice(i, i + chunkSize))
          if (error) throw error
          inserted = Math.min(i + chunkSize, rows.length)
          setMessage(`Inserindo... ${inserted} / ${rows.length}`)
        }
        inserted = rows.length
      }

      setStats({ inserted, skipped })
      setMessage(mode === 'incremental'
        ? `✓ ${inserted} novas transações adicionadas. ${skipped} já existiam (ignoradas).`
        : `✓ ${inserted} transações importadas com sucesso.`
      )
      setStatus('done')
      setFile(null)
    } catch (err: unknown) {
      setStatus('error')
      setMessage(`Erro: ${err instanceof Error ? err.message : 'Falha ao importar'}`)
    }
  }

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.82rem',
    padding: '9px 12px', outline: 'none', width: '100%', marginBottom: '0.85rem',
  }
  const labelStyle = {
    display: 'block' as const, fontSize: '0.65rem', fontFamily: 'DM Mono, monospace',
    color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '5px',
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setStatus('idle'); setMessage(''); setStats(null) }}
        style={{ background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer' }}
      >
        + Upload HTML
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '460px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Importar Vendas</h2>
            <p style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Carregue o HTML exportado do sistema de vendas.
            </p>

            <label style={labelStyle}>Período</label>
            <select style={{ ...inputStyle }} value={periodId} onChange={e => setPeriodId(e.target.value)}>
              {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>

            {/* Mode toggle */}
            <label style={labelStyle}>Modo de importação</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.85rem' }}>
              {[
                { v: 'incremental', label: '⚡ Incremental', desc: 'Adiciona apenas novas transações' },
                { v: 'replace',     label: '🔄 Substituir',  desc: 'Apaga tudo e reimporta' },
              ].map(opt => (
                <div
                  key={opt.v}
                  onClick={() => setMode(opt.v as typeof mode)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${mode === opt.v ? 'var(--accent)' : 'var(--border)'}`,
                    background: mode === opt.v ? 'rgba(200,245,66,0.08)' : 'var(--surface2)',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: mode === opt.v ? 'var(--accent)' : 'var(--text)', marginBottom: '3px' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>{opt.desc}</div>
                </div>
              ))}
            </div>

            <label style={labelStyle}>Arquivo HTML</label>
            <input
              type="file" accept=".html,.htm"
              onChange={e => { setFile(e.target.files?.[0] ?? null); setStatus('idle'); setMessage('') }}
              style={{ ...inputStyle, cursor: 'pointer' }}
            />

            {message && (
              <div style={{
                padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem',
                fontSize: '0.75rem', fontFamily: 'DM Mono, monospace',
                background: status === 'error' ? 'rgba(245,92,66,0.1)' : status === 'done' ? 'rgba(200,245,66,0.1)' : 'rgba(66,148,245,0.1)',
                color: status === 'error' ? '#f55c42' : status === 'done' ? 'var(--meta1)' : 'var(--mkt)',
                border: `1px solid ${status === 'error' ? 'rgba(245,92,66,0.3)' : status === 'done' ? 'rgba(200,245,66,0.3)' : 'rgba(66,148,245,0.3)'}`,
              }}>
                {message}
              </div>
            )}

            {stats && status === 'done' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ flex: 1, background: 'rgba(200,245,66,0.08)', border: '1px solid rgba(200,245,66,0.2)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--meta1)' }}>{stats.inserted.toLocaleString()}</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase' }}>inseridas</div>
                </div>
                {stats.skipped > 0 && (
                  <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--muted)' }}>{stats.skipped.toLocaleString()}</div>
                    <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase' }}>já existiam</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setOpen(false); setStatus('idle'); setMessage(''); setFile(null); setStats(null) }}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer' }}
              >
                {status === 'done' ? 'Fechar' : 'Cancelar'}
              </button>
              {status !== 'done' && (
                <button
                  onClick={handleUpload}
                  disabled={!file || status === 'uploading' || status === 'parsing'}
                  style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', opacity: (!file || status === 'uploading' || status === 'parsing') ? 0.6 : 1 }}
                >
                  {status === 'parsing' || status === 'uploading' ? 'Processando...' : 'Importar'}
                </button>
              )}
              {status === 'done' && (
                <button
                  onClick={() => window.location.reload()}
                  style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}
                >
                  Atualizar Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
