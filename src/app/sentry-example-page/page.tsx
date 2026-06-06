'use client'

import * as Sentry from '@sentry/nextjs'
import { useState } from 'react'

// Página de verificação do Sentry. Atrás de auth (middleware). Remover após validar.
export default function SentryExamplePage() {
  const [msg, setMsg] = useState('')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-page">
      <div className="glass-card border border-border rounded-2xl p-10 max-w-md w-full text-center flex flex-col gap-4">
        <h1 className="text-lg font-bold text-foreground">Sentry — Teste</h1>
        <p className="text-sm text-muted-foreground font-mono">
          Dispare erros de teste. Confirme em Sentry → Issues.
        </p>
        <button
          onClick={() => {
            throw new Error('Sentry frontend test — GDS Dashboard')
          }}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
        >
          Disparar erro de frontend
        </button>
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/sentry-example-api')
              setMsg(res.ok ? 'ok' : `backend status ${res.status} (erro disparado)`)
            } catch (e) {
              Sentry.captureException(e)
              setMsg('falha de rede')
            }
          }}
          className="bg-surface-container hover:bg-surface-container-high border border-border text-muted-foreground hover:text-foreground font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
        >
          Disparar erro de backend (API)
        </button>
        {msg && <p className="text-xs font-mono text-muted-foreground">{msg}</p>}
      </div>
    </div>
  )
}
