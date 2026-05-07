'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseSalesHtml, toIsoDate, detectPeriodFromHtml } from '@/lib/parser'
import type { Period } from '@/types'

interface DetectedInfo {
  year: number
  month: number
  label: string
  start_date: string
  end_date: string
  period_id?: number
  is_new?: boolean
}

export default function UploadModal({ periods }: { periods: Period[] }) {
  const [open, setOpen]           = useState(false)
  const [file, setFile]           = useState<File | null>(null)
  const [mode, setMode]           = useState<'incremental' | 'replace'>('incremental')
  const [detected, setDetected]   = useState<DetectedInfo | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [status, setStatus]       = useState<'idle' | 'parsing' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage]     = useState('')
  const [stats, setStats]         = useState<{ inserted: number; skipped: number; period: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setStatus('idle')
    setMessage('')
    setDetected(null)
    setStats(null)

    if (!f) return
    setDetecting(true)

    try {
      const html  = await f.text()
      const info  = detectPeriodFromHtml(html)
      if (!info) {
        setMessage('⚠ Não foi possível detectar o período automaticamente.')
        setDetecting(false)
        return
      }

      // Check if period already exists in the list passed from server
      const existing = periods.find(p => p.year === info.year && p.month === info.month)
      setDetected({
        ...info,
        period_id: existing?.id,
        is_new: !existing,
      })
    } catch {
      setMessage('⚠ Erro ao ler o arquivo.')
    }
    setDetecting(false)
  }

  async function handleUpload() {
    if (!file || !detected) return
    setStatus('parsing')
    setStats(null)
    setMessage('Lendo arquivo...')

    try {
      const html = await file.text()
      const transactions = parseSalesHtml(html)
      setMessage(`${transactions.length} transações encontradas. Verificando período...`)
      setStatus('uploading')

      // Ensure period exists (create if new, copy goals from previous month)
      let periodId = detected.period_id
      if (!periodId) {
        const res = await fetch('/api/admin/ensure-period', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: detected.year, month: detected.month,
            label: detected.label, start_date: detected.start_date, end_date: detected.end_date,
          }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        periodId = data.id
        setMessage(`Período "${data.label}" ${data.created ? 'criado' : 'encontrado'}. Importando...`)
      }

      // Fetch excluded vendors and filter them out completely
      const { data: exclusions } = await supabase.from('vendor_exclusions').select('vendor_id')
      const excludedIds = new Set((exclusions ?? []).map(e => e.vendor_id))
      const filteredTransactions = transactions.filter(t => !excludedIds.has(t.vendor_id))

      // Build vendor map from goals (may be empty — that's OK)
      const { data: goals } = await supabase
        .from('goals').select('vendor_id, vendor_name, store').eq('period_id', periodId)
      const vendorMap = Object.fromEntries(
        (goals ?? []).map(g => [g.vendor_id, { name: g.vendor_name, store: g.store }])
      )

      // Build rows — if no goals for a vendor, use name/store from the HTML data itself
      const rows = filteredTransactions.map(t => ({
        period_id:   periodId!,
        vendor_id:   t.vendor_id,
        vendor_name: vendorMap[t.vendor_id]?.name ?? `Vendedor ${t.vendor_id}`,
        store:       vendorMap[t.vendor_id]?.store ?? 'Sem loja',
        client_id:   t.client_id,
        client_name: t.client_name,
        sale_date:   toIsoDate(t.sale_date),
        sale_time:   t.sale_time || null,
        order_ref:   t.order_ref,
        valor:       t.valor,
        quantity:    t.quantity,
      }))

      // Auto-register vendors that have no goal for this period
      const goalVendorIds = new Set((goals ?? []).map(g => g.vendor_id))
      const newVendorIds = [...new Set(rows.map(r => r.vendor_id))].filter(id => !goalVendorIds.has(id))
      if (newVendorIds.length > 0) {
        const placeholders = newVendorIds.map(vendor_id => {
          const sample = rows.find(r => r.vendor_id === vendor_id)!
          return {
            period_id: periodId!,
            vendor_id,
            vendor_name: sample.vendor_name,
            store: sample.store,
            meta1: 0, meta2: 0, meta3: 0,
            bonus1: 100, bonus2: 150, bonus3: 200,
            commission_pct: 0.003,
          }
        })
        await supabase.from('goals').insert(placeholders)
      }

      let inserted = 0
      let skipped  = 0
      const chunkSize = 500

      if (mode === 'replace') {
        await supabase.from('sales_records').delete().eq('period_id', periodId)
        for (let i = 0; i < rows.length; i += chunkSize) {
          const { error } = await supabase.from('sales_records').insert(rows.slice(i, i + chunkSize))
          if (error) throw error
          inserted = Math.min(i + chunkSize, rows.length)
          setMessage(`Inserindo... ${inserted} / ${rows.length}`)
        }
        inserted = rows.length
      } else {
        // Incremental: skip existing order_refs
        const { data: existing } = await supabase
          .from('sales_records').select('order_ref').eq('period_id', periodId)
        const existingRefs = new Set((existing ?? []).map(r => r.order_ref))
        const newRows = rows.filter(r => !existingRefs.has(r.order_ref))
        skipped = rows.length - newRows.length

        for (let i = 0; i < newRows.length; i += chunkSize) {
          const { error } = await supabase.from('sales_records').insert(newRows.slice(i, i + chunkSize))
          if (error) throw error
          inserted = Math.min(i + chunkSize, newRows.length)
          setMessage(`Inserindo novas... ${inserted} / ${newRows.length}`)
        }
        inserted = newRows.length
      }

      setStats({ inserted, skipped, period: detected.label })
      setMessage(mode === 'incremental'
        ? `✓ ${inserted} novas transações adicionadas em "${detected.label}". ${skipped > 0 ? `${skipped} já existiam (ignoradas).` : ''}`
        : `✓ ${inserted} transações importadas em "${detected.label}".`
      )
      setStatus('done')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: unknown) {
      setStatus('error')
      setMessage(`Erro: ${err instanceof Error ? err.message : 'Falha ao importar'}`)
    }
  }

  function handleClose() {
    setOpen(false); setStatus('idle'); setMessage('')
    setFile(null); setDetected(null); setStats(null)
    if (fileRef.current) fileRef.current.value = ''
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
        onClick={() => { setOpen(true); setStatus('idle'); setMessage(''); setStats(null); setDetected(null) }}
        style={{ background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer' }}
      >
        + Upload HTML
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Importar Vendas</h2>
            <p style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              O período é detectado automaticamente pelo arquivo HTML.
            </p>

            {/* File picker */}
            <label style={labelStyle}>Arquivo HTML</label>
            <input
              ref={fileRef}
              type="file" accept=".html,.htm"
              onChange={handleFileChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
            />

            {/* Detected period info */}
            {detecting && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '0.85rem', fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', background: 'rgba(66,148,245,0.08)', color: 'var(--mkt)', border: '1px solid rgba(66,148,245,0.2)' }}>
                Detectando período...
              </div>
            )}

            {detected && !detecting && (
              <div style={{ padding: '12px 14px', borderRadius: '10px', marginBottom: '0.85rem', border: `1px solid ${detected.is_new ? 'rgba(200,245,66,0.3)' : 'var(--border)'}`, background: detected.is_new ? 'rgba(200,245,66,0.06)' : 'var(--surface2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                      Período detectado
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: detected.is_new ? 'var(--accent)' : 'var(--text)' }}>
                      {detected.label}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    {detected.is_new ? (
                      <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: '4px', background: 'rgba(200,245,66,0.15)', color: 'var(--accent)', fontWeight: 700 }}>
                        Novo período
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: '4px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        Já cadastrado
                      </span>
                    )}
                  </div>
                </div>
                {detected.is_new && (
                  <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '6px' }}>
                    O período será criado automaticamente. As metas serão copiadas do mês anterior — ajuste depois em <strong style={{ color: 'var(--text)' }}>Dashboard → Metas</strong>.
                  </div>
                )}
              </div>
            )}

            {/* Import mode */}
            {detected && (
              <>
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
              </>
            )}

            {/* Status message */}
            {message && (
              <div style={{
                padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem',
                fontSize: '0.75rem', fontFamily: 'DM Mono, monospace',
                background: status === 'error' ? 'rgba(245,92,66,0.1)' : status === 'done' ? 'rgba(200,245,66,0.1)' : 'rgba(66,148,245,0.08)',
                color: status === 'error' ? '#f55c42' : status === 'done' ? 'var(--meta1)' : 'var(--mkt)',
                border: `1px solid ${status === 'error' ? 'rgba(245,92,66,0.3)' : status === 'done' ? 'rgba(200,245,66,0.3)' : 'rgba(66,148,245,0.2)'}`,
              }}>
                {message}
              </div>
            )}

            {/* Done stats */}
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

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer' }}>
                {status === 'done' ? 'Fechar' : 'Cancelar'}
              </button>
              {status !== 'done' && (
                <button
                  onClick={handleUpload}
                  disabled={!file || !detected || status === 'uploading' || status === 'parsing' || detecting}
                  style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', opacity: (!file || !detected || status === 'uploading' || status === 'parsing' || detecting) ? 0.5 : 1 }}
                >
                  {status === 'parsing' || status === 'uploading' ? 'Processando...' : detected ? `Importar ${detected.label}` : 'Selecione um arquivo'}
                </button>
              )}
              {status === 'done' && (
                <button onClick={() => window.location.reload()} style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
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
