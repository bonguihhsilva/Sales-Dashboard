'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function VendedorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-margin-page">
      <div className="text-center space-y-2">
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Erro inesperado</p>
        <h2 className="text-2xl font-bold text-foreground">Algo deu errado</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Não foi possível carregar seus dados. Tente novamente.
        </p>
      </div>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Tentar novamente
      </button>
    </div>
  )
}
