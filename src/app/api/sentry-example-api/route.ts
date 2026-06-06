import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Rota de verificação do Sentry server-side (capturada via instrumentation onRequestError).
export function GET() {
  throw new Error('Sentry backend test — GDS Dashboard API route')
  // eslint-disable-next-line no-unreachable
  return NextResponse.json({ ok: true })
}
