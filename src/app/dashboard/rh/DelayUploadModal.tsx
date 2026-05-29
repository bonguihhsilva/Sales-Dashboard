'use client'

import React, { useState, useRef } from 'react'
import * as xlsx from 'xlsx'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  name: string
  role: string
  active: boolean
}

interface DelayUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  profiles: Profile[]
}

export default function DelayUploadModal({ open, onOpenChange, onSuccess, profiles }: DelayUploadModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [parsedData, setParsedData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<{ emailOrName: string; date: string; minutes: string }>({
    emailOrName: '',
    date: '',
    minutes: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = xlsx.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = xlsx.utils.sheet_to_json(ws, { defval: '' }) as any[]
        
        if (data.length > 0) {
          setParsedData(data)
          const cols = Object.keys(data[0])
          setColumns(cols)
          
          // Tentar adivinhar as colunas
          const guessCol = (keywords: string[]) => cols.find(c => keywords.some(k => c.toLowerCase().includes(k))) || ''
          setMapping({
            emailOrName: guessCol(['nome', 'name', 'funcionario', 'email', 'vendedor']),
            date: guessCol(['data', 'date', 'dia']),
            minutes: guessCol(['minuto', 'atraso', 'delay', 'tempo'])
          })
        } else {
          setError('O arquivo está vazio.')
        }
      } catch (err: any) {
        setError('Erro ao ler arquivo: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (!mapping.emailOrName || !mapping.date || !mapping.minutes) {
      setError('Por favor, selecione todas as colunas necessárias.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const inserts: any[] = []
      
      for (const row of parsedData) {
        const identifier = row[mapping.emailOrName]?.toString().trim()
        const dateRaw = row[mapping.date]
        const minutesRaw = row[mapping.minutes]

        if (!identifier || !dateRaw) continue

        // Tentar achar o profile (por nome ou email)
        const profile = profiles.find(p => 
          p.name.toLowerCase() === identifier.toLowerCase() || 
          p.id.toLowerCase() === identifier.toLowerCase()
        )

        if (!profile) continue // Pula se não achar o vendedor

        // Parse date (xlsx dates or strings)
        let delayDate = new Date()
        if (typeof dateRaw === 'number') {
          delayDate = new Date(Math.round((dateRaw - 25569) * 86400 * 1000))
        } else {
          delayDate = new Date(dateRaw)
        }
        
        // Parse minutes
        let delayMinutes = parseInt(minutesRaw, 10)
        if (isNaN(delayMinutes)) delayMinutes = 0

        if (delayMinutes <= 0) continue

        inserts.push({
          user_id: profile.id,
          delay_date: delayDate.toISOString().split('T')[0],
          delay_minutes: delayMinutes,
          status: 'pending'
        })
      }

      if (inserts.length === 0) {
        throw new Error('Nenhum atraso válido encontrado ou não foi possível cruzar os nomes com os vendedores ativos.')
      }

      const { error: insertError } = await supabase.from('hr_delays').insert(inserts)
      if (insertError) throw insertError

      onSuccess()
      setParsedData([])
      setColumns([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px' }} className="border border-white/10 shadow-2xl glass-card relative">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Importar Atrasos (Biometria)</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Faça o upload do relatório extraído do leitor biométrico em `.xlsx` ou `.csv`.
        </p>

        {error && (
          <div style={{ background: 'var(--destructive)22', color: 'var(--destructive)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {parsedData.length === 0 ? (
          <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--muted)', marginBottom: '1rem' }}>upload_file</span>
            <div style={{ marginBottom: '1rem' }}>Arraste o arquivo ou clique para selecionar</div>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFile}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="delay-upload"
            />
            <label htmlFor="delay-upload" style={{ cursor: 'pointer', background: 'var(--accent)', color: '#000', padding: '8px 16px', borderRadius: '6px', fontWeight: 600 }}>
              {loading ? 'Lendo...' : 'Selecionar Arquivo'}
            </label>
          </div>
        ) : (
          <div>
            <div style={{ background: 'var(--surface-container-high)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Mapeamento de Colunas ({parsedData.length} linhas lidas)</div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Coluna de Nome do Funcionário</label>
                  <select 
                    value={mapping.emailOrName} 
                    onChange={e => setMapping(prev => ({ ...prev, emailOrName: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent' }}
                  >
                    <option value="">Selecione...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Coluna de Data do Atraso</label>
                  <select 
                    value={mapping.date} 
                    onChange={e => setMapping(prev => ({ ...prev, date: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent' }}
                  >
                    <option value="">Selecione...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>Coluna de Minutos de Atraso</label>
                  <select 
                    value={mapping.minutes} 
                    onChange={e => setMapping(prev => ({ ...prev, minutes: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent' }}
                  >
                    <option value="">Selecione...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => { setParsedData([]); setColumns([]); if(fileInputRef.current) fileInputRef.current.value = ''; onOpenChange(false); }}
                style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', color: 'var(--text)' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleImport}
                disabled={loading}
                style={{ padding: '8px 16px', background: 'var(--accent)', color: '#000', borderRadius: '6px', fontWeight: 600, border: 'none', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Importando...' : 'Confirmar Importação'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
