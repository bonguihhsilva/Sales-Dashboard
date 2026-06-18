'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { toIsoDate } from '@/lib/parser'
import type { Period } from '@/types'
import type { SaleTransaction } from '@/lib/parser'

interface DetectedInfo {
  year: number
  month: number
  label: string
  start_date: string
  end_date: string
  period_id?: number
  is_new?: boolean
}

export default function UploadModal({ periods, tenantId }: { periods: Period[], tenantId: string }) {
  const [open, setOpen]               = useState(false)
  const [file, setFile]               = useState<File | null>(null)
  const [mode, setMode]               = useState<'incremental' | 'replace'>('incremental')
  const [detected, setDetected]       = useState<DetectedInfo | null>(null)
  const [detecting, setDetecting]     = useState(false)
  const [status, setStatus]           = useState<'idle' | 'parsing' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage]         = useState('')
  const [stats, setStats]             = useState<{ inserted: number; skipped: number; period: string } | null>(null)
  const [parsedData, setParsedData]   = useState<SaleTransaction[]>([])
  const [detectedSystem, setDetectedSystem] = useState<string | null>(null)
  const [selectedSystem, setSelectedSystem] = useState<string>('generic')
  const fileRef   = useRef<HTMLInputElement>(null)
  const modalRef  = useRef<HTMLDivElement>(null)
  const router    = useRouter()
  const supabase  = createClient()

  useEffect(() => {
    if (!open) return
    const modal = modalRef.current
    if (!modal) return

    const focusable = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([type="radio"]), input[type="radio"]:checked, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    first?.focus()

    function trapTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    function closeOnEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', trapTab)
    document.addEventListener('keydown', closeOnEsc)
    return () => {
      document.removeEventListener('keydown', trapTab)
      document.removeEventListener('keydown', closeOnEsc)
    }
  }, [open])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setStatus('idle')
    setMessage('')
    setDetected(null)
    setStats(null)
    setDetectedSystem(null)
    setSelectedSystem('generic')

    if (!f) return
    setDetecting(true)

    try {
      const formData = new FormData()
      formData.append('file', f)

      const res = await fetch('/api/admin/parse-upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setParsedData(data.transactions)
      setDetectedSystem(data.detected_system ?? null)
      setSelectedSystem(data.detected_system ?? 'generic')

      if (!data.detected) {
        setMessage('⚠ Não foi possível detectar o período automaticamente.')
        setDetecting(false)
        return
      }

      const info = data.detected
      const existing = periods.find(p => p.year === info.year && p.month === info.month)
      setDetected({
        ...info,
        period_id: existing?.id,
        is_new: !existing,
      })
    } catch (err: any) {
      setMessage(`⚠ Erro ao processar o arquivo: ${err.message}`)
    }
    setDetecting(false)
  }

  async function handleUpload() {
    if (!file || !detected) return
    if (detectedSystem === null && !selectedSystem) {
      setMessage('⚠ Selecione o formato do arquivo para continuar')
      return
    }
    setStatus('parsing')
    setStats(null)
    setMessage('Lendo arquivo...')

    try {
      const transactions = parsedData
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
        tenant_id:   tenantId,
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
            tenant_id: tenantId,
            period_id: periodId!,
            vendor_id,
            vendor_name: sample.vendor_name,
            store: sample.store,
            meta1: 0, meta2: 0, meta3: 0,
            bonus1: 100, bonus2: 150, bonus3: 200,
            commission_pct: 0.003,
          }
        })
        const { error: goalError } = await supabase.from('goals').insert(placeholders)
        if (goalError) {
          console.warn('Auto-registro de vendedores falhou:', goalError.message)
        }
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
      toast.success(`Importação concluída — ${detected.label}`, {
        description: mode === 'incremental'
          ? `${inserted} adicionadas${skipped > 0 ? `, ${skipped} ignoradas` : ''}`
          : `${inserted} transações importadas`,
      })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: unknown) {
      setStatus('error')
      const msg = err instanceof Error ? err.message : 'Falha ao importar'
      setMessage(`Erro: ${msg}`)
      toast.error('Erro na importação', { description: msg })
    }
  }

  function handleClose() {
    setOpen(false); setStatus('idle'); setMessage('')
    setFile(null); setDetected(null); setStats(null)
    setDetectedSystem(null); setSelectedSystem('generic')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setStatus('idle'); setMessage(''); setStats(null); setDetected(null) }}
        className="bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs px-4 py-[0.6rem] rounded-xl transition-colors flex items-center gap-2 h-full"
      >
        <span className="material-symbols-outlined text-sm">upload_file</span>
        Upload Relatório
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
            className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90svh] overflow-y-auto shadow-2xl glass-card"
          >
            <h2 id="upload-modal-title" className="text-xl font-bold mb-2 text-on-surface">Importar Vendas</h2>
            <p className="text-xs font-mono text-muted-foreground mb-6">
              Faça upload de planilhas (XLSX, CSV), Word (DOCX), PDF ou relatórios HTML.
            </p>

            {/* File picker */}
            <label className="block text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wider mb-2">Arquivo</label>
            <input
              ref={fileRef}
              type="file" accept=".html,.htm,.xlsx,.xls,.csv,.pdf,.docx"
              onChange={handleFileChange}
              className="bg-surface-container border border-white/5 rounded-xl text-on-surface font-mono text-sm px-4 py-3 outline-none w-full mb-4 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary/90 transition-all"
            />

            {/* Sistema detectado (D-05/D-06) */}
            {file && !detecting && (
              <div className="mt-2 mb-4">
                {detectedSystem !== null ? (
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Formato detectado: {detectedSystem === 'cec' ? 'CEC (Relatório HTML)' : detectedSystem.toUpperCase()}
                  </span>
                ) : (
                  <div>
                    <label className="block text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                      Sistema não identificado — selecione manualmente:
                    </label>
                    <select
                      value={selectedSystem}
                      onChange={e => setSelectedSystem(e.target.value)}
                      className="bg-surface-container border border-white/5 rounded-xl text-sm text-on-surface px-3 py-2 w-full"
                    >
                      <option value="cec">CEC (Relatório HTML)</option>
                      <option value="pegasus">Pegasus</option>
                      <option value="isrp">ISRP</option>
                      <option value="generic">Genérico</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Detected period info */}
            {detecting && (
              <div className="p-3 rounded-xl mb-4 text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Detectando período...
              </div>
            )}

            {detected && !detecting && (
              <div className={`p-4 rounded-xl mb-4 border ${detected.is_new ? 'border-primary/30 bg-primary/10' : 'border-white/5 bg-surface-container'}`}>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[0.6rem] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
                      Período detectado
                    </div>
                    <div className={`text-base font-bold ${detected.is_new ? 'text-primary' : 'text-on-surface'}`}>
                      {detected.label}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    {detected.is_new ? (
                      <span className="text-[0.65rem] font-mono px-2 py-1 rounded bg-primary/20 text-primary font-bold">
                        Novo período
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-mono px-2 py-1 rounded bg-surface border border-white/10 text-muted-foreground">
                        Já cadastrado
                      </span>
                    )}
                  </div>
                </div>
                {detected.is_new && (
                  <div className="text-[0.62rem] font-mono text-muted-foreground mt-2">
                    O período será criado automaticamente. As metas serão copiadas do mês anterior — ajuste depois em <strong className="text-on-surface">Dashboard → Metas</strong>.
                  </div>
                )}
              </div>
            )}

            {/* Import mode */}
            {detected && (
              <>
                <fieldset className="mb-4">
                  <legend className="block text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wider mb-2">Modo de importação</legend>
                  <div className="flex gap-2">
                    {[
                      { v: 'incremental', icon: 'bolt',  label: 'Incremental', desc: 'Adiciona apenas novas transações' },
                      { v: 'replace',     icon: 'sync',  label: 'Substituir',  desc: 'Apaga tudo e reimporta' },
                    ].map(opt => (
                      <label
                        key={opt.v}
                        className={`flex-1 p-3 rounded-xl cursor-pointer border transition-colors ${
                          mode === opt.v
                            ? 'border-primary bg-primary/10'
                            : 'border-white/5 bg-surface-container-high hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="import-mode"
                          value={opt.v}
                          checked={mode === opt.v}
                          onChange={() => setMode(opt.v as typeof mode)}
                          className="sr-only"
                        />
                        <div className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${mode === opt.v ? 'text-primary' : 'text-on-surface'}`}>
                          <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                          {opt.label}
                        </div>
                        <div className="text-[0.65rem] font-mono text-muted-foreground leading-snug">{opt.desc}</div>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {/* Status message */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={message ? `p-3 rounded-xl mb-4 text-xs font-mono border ${
                status === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                status === 'done'  ? 'bg-primary/10 text-primary border-primary/30' :
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }` : 'sr-only'}
              aria-hidden={!message}
            >
              {message}
            </div>

            {/* Done stats */}
            {stats && status === 'done' && (
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-primary">{stats.inserted.toLocaleString()}</div>
                  <div className="text-[0.6875rem] font-mono text-muted-foreground uppercase tracking-widest mt-1">inseridas</div>
                </div>
                {stats.skipped > 0 && (
                  <div className="flex-1 bg-surface-container border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-muted-foreground">{stats.skipped.toLocaleString()}</div>
                    <div className="text-[0.6875rem] font-mono text-muted-foreground uppercase tracking-widest mt-1">já existiam</div>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button onClick={handleClose} className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 rounded-xl text-muted-foreground font-bold text-sm py-2.5 transition-colors">
                {status === 'done' ? 'Fechar' : 'Cancelar'}
              </button>
              {status !== 'done' && (
                <button
                  onClick={handleUpload}
                  disabled={!file || !detected || status === 'uploading' || status === 'parsing' || detecting}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm rounded-xl py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'parsing' || status === 'uploading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      Processando...
                    </span>
                  ) : detected ? `Importar ${detected.label}` : 'Selecione um arquivo'}
                </button>
              )}
              {status === 'done' && (
                <button onClick={() => { router.refresh(); handleClose() }} className="flex-[2] bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm rounded-xl py-2.5 transition-colors">
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
