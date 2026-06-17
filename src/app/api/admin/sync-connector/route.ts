import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { strictRateLimiter } from '@/lib/ratelimit'
import { getConnector } from '@/lib/connectors/registry'
import type { ConnectorConfig } from '@/lib/connectors/base'

export async function POST(req: NextRequest) {
  // Rate limiting -- mesma estrategia do parse-upload
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  // Auth dupla: CRON_SECRET para chamadas agendadas, getTenantContext para triggers manuais (D-02)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isCronCall = !!(cronSecret && authHeader === `Bearer ${cronSecret}`)

  let tenantId: string | null = null

  if (!isCronCall) {
    const { user, profile } = await getTenantContext()
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    tenantId = profile.tenant_id ?? null
  }

  try {
    const body = await req.json().catch(() => ({}))
    const system = (body.system as string) || 'pegasus'
    const periodStart = body.period_start ? new Date(body.period_start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const periodEnd   = body.period_end   ? new Date(body.period_end)   : new Date()

    if (!['pegasus', 'isrp'].includes(system)) {
      return NextResponse.json({ error: `Sistema invalido: ${system}` }, { status: 400 })
    }

    const admin = createAdminClient()

    // Buscar configuracao do conector para o tenant
    let connectorQuery = admin
      .from('connectors')
      .select('*')
      .eq('system', system)
      .eq('enabled', true)
      .limit(1)

    if (tenantId) {
      connectorQuery = connectorQuery.eq('tenant_id', tenantId)
    }

    const { data: connectorRows } = await connectorQuery
    const connectorRow = connectorRows?.[0]

    if (!connectorRow) {
      // Conector nao configurado -- comportamento esperado em stubs (D-03)
      return NextResponse.json({
        status: 'not_configured',
        system,
        message: `Conector ${system.toUpperCase()} nao configurado para este tenant`,
      }, { status: 200 })
    }

    const config: ConnectorConfig = {
      id:                   connectorRow.id,
      tenant_id:            connectorRow.tenant_id,
      system:               connectorRow.system,
      base_url:             connectorRow.base_url,
      credential_secret_id: connectorRow.credential_secret_id,
      settings:             connectorRow.settings ?? {},
      enabled:              connectorRow.enabled,
    }

    const connector = getConnector(system as 'pegasus' | 'isrp')

    // Tentar sync -- stubs lancarao Error (comportamento esperado nesta fase)
    let result
    try {
      result = await connector.fetchTransactions(config, periodStart, periodEnd)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const isStub = msg.includes('nao implementado') || msg.includes('aguardando documentacao')

      // Registrar erro na tabela para visibilidade
      await admin
        .from('connectors')
        .update({ last_sync_error: msg, updated_at: new Date().toISOString() })
        .eq('id', connectorRow.id)

      return NextResponse.json({
        status: isStub ? 'stub' : 'error',
        system,
        message: msg,
      }, { status: 200 })
    }

    // Sync bem-sucedido (sera executado quando os stubs forem implementados)
    await admin
      .from('connectors')
      .update({
        last_sync_at: result.fetched_at,
        last_sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectorRow.id)

    return NextResponse.json({
      status: 'success',
      system,
      transactions_imported: result.transactions.length,
      fetched_at: result.fetched_at,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('sync-connector error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
