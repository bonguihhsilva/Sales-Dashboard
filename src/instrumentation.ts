import * as Sentry from '@sentry/nextjs'

// Carrega a config do Sentry conforme o runtime. Sem este hook (v8+), os
// sentry.server.config.ts / sentry.edge.config.ts não são inicializados e
// erros server-side (RSC, API routes, middleware) não chegam ao Sentry.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Captura erros de request aninhados (nested React Server Components) — v8+.
export const onRequestError = Sentry.captureRequestError
