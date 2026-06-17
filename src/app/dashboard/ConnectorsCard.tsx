'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type ConnectorStatus = 'not_configured' | 'stub' | 'connected' | 'syncing' | 'error'

interface ConnectorState {
  status: ConnectorStatus
  lastSync?: string
  errorMsg?: string
}

const SYSTEMS = ['pegasus', 'isrp'] as const
type ConnectorSystem = typeof SYSTEMS[number]

const STATUS_CONFIG: Record<ConnectorStatus, { icon: string; label: () => string; color: string }> = {
  not_configured: {
    icon: 'radio_button_unchecked',
    label: () => 'Nao configurado',
    color: 'var(--muted)',
  },
  stub: {
    icon: 'construction',
    label: () => 'Aguardando credenciais da API',
    color: 'var(--muted)',
  },
  connected: {
    icon: 'check_circle',
    label: () => 'Conectado',
    color: 'var(--meta1)',
  },
  syncing: {
    icon: 'sync',
    label: () => 'Sincronizando...',
    color: 'var(--accent)',
  },
  error: {
    icon: 'error',
    label: () => 'Erro -- ver log',
    color: '#ef4444',
  },
}

export default function ConnectorsCard() {
  const [states, setStates] = useState<Record<ConnectorSystem, ConnectorState>>({
    pegasus: { status: 'not_configured' },
    isrp:    { status: 'not_configured' },
  })
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    setStates(prev => ({
      pegasus: { ...prev.pegasus, status: 'syncing' },
      isrp:    { ...prev.isrp,    status: 'syncing' },
    }))

    try {
      const results = await Promise.allSettled(
        SYSTEMS.map(system =>
          fetch('/api/admin/sync-connector', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system }),
          }).then(r => r.json())
        )
      )

      const newStates = { ...states }
      results.forEach((result, idx) => {
        const system = SYSTEMS[idx]
        if (result.status === 'fulfilled') {
          const data = result.value as { status: string; message?: string; transactions_imported?: number }
          if (data.status === 'success') {
            newStates[system] = { status: 'connected', lastSync: new Date().toLocaleString('pt-BR') }
            toast.success(`Sincronizacao concluida -- ${data.transactions_imported ?? 0} transacoes importadas`)
          } else if (data.status === 'stub') {
            newStates[system] = { status: 'stub' }
            toast.info(`Conector ${system.toUpperCase()} aguarda credenciais da API`, { duration: 4000 })
          } else if (data.status === 'not_configured') {
            newStates[system] = { status: 'not_configured' }
          } else {
            newStates[system] = { status: 'error', errorMsg: data.message }
            toast.error(`Falha na sincronizacao -- tente novamente ou verifique as credenciais`)
          }
        } else {
          newStates[system] = { status: 'error', errorMsg: 'Falha na conexao' }
          toast.error(`Falha na sincronizacao -- tente novamente ou verifique as credenciais`)
        }
      })
      setStates(newStates)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '1rem',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'var(--surface2)',
        borderRadius: '0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
        color: 'var(--accent)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>database_search</span>
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text)', marginBottom: '0.5rem' }}>
        Conectores de Sistema
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Integracao direta com Pegasus e ISRP. Sincronizacao automatica a cada hora ou sob demanda.
      </p>

      {/* Status por sistema */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {SYSTEMS.map(system => {
          const state = states[system]
          const cfg = STATUS_CONFIG[state.status]
          return (
            <div key={system} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '0.75rem',
                fontFamily: 'DM Mono, monospace',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {system}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: cfg.color }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 16,
                    animation: state.status === 'syncing' ? 'spin 1s linear infinite' : undefined,
                  }}
                >
                  {cfg.icon}
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace' }}>
                  {cfg.label()}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            height: 44,
            background: 'none',
            border: 'none',
            cursor: syncing ? 'not-allowed' : 'pointer',
            opacity: syncing ? 0.5 : 1,
            color: 'var(--accent)',
            fontFamily: 'DM Mono, monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            padding: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 16,
              animation: syncing ? 'spin 1s linear infinite' : undefined,
            }}
          >
            {syncing ? 'sync' : 'download_done'}
          </span>
          {syncing ? 'Sincronizando...' : 'Forcar Sincronizacao'}
        </button>
      </div>
    </div>
  )
}
