'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// Captura erros lançados no layout raiz (fora do alcance de app/error.tsx).
// Precisa renderizar suas próprias tags <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // No-op se NEXT_PUBLIC_SENTRY_DSN não estiver setado.
    Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <html lang="pt" className="dark">
      <body style={{ margin: 0, background: '#0b1326', color: '#e8edf7', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Falha crítica</h1>
            <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 24 }}>
              O aplicativo encontrou um erro grave. Recarregue a página.
            </p>
            {error.digest && (
              <p style={{ fontSize: 11, opacity: 0.4, marginBottom: 16 }}>ref: {error.digest}</p>
            )}
            <button
              onClick={reset}
              style={{
                background: '#c8f542', color: '#0b1326', fontWeight: 700,
                padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13,
              }}
            >
              Recarregar
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
