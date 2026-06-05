'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // TODO(Sentry): reportar `error` quando o DSN estiver configurado
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-page">
      <div className="glass-card border border-border rounded-2xl p-10 max-w-md w-full text-center flex flex-col gap-4">
        <span className="material-symbols-outlined text-5xl text-red-400 mx-auto">error</span>
        <h1 className="text-xl font-bold text-foreground">Algo deu errado</h1>
        <p className="text-sm text-muted-foreground font-mono">
          Ocorreu um erro inesperado. Tente novamente — se persistir, contate o suporte.
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground/60 font-mono">ref: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
          >
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="bg-surface-container hover:bg-surface-container-high border border-border text-muted-foreground hover:text-foreground font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  )
}
