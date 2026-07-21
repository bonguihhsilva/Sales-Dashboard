import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import ComprasClient from './ComprasClient'
import type { InventoryMetric, AbcRow, RankingRow, InventorySummary } from './types'

export const dynamic = 'force-dynamic'

const ALLOWED = ['compras', 'adm', 'gerente', 'super_admin']

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; store?: string }>
}) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')
  if (!ALLOWED.includes(profile.role)) redirect('/vendedor/meu-resultado')

  // super_admin sem tenant "incorporado" nao tem escopo — pede selecao.
  if (!profile.tenant_id) {
    return (
      <div className="min-h-full bg-background flex flex-col p-margin-page">
        <PageHeader
          title="Compras"
          subtitle="Selecione uma empresa no seletor de tenant para ver o inventario."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Compras' }]}
        />
      </div>
    )
  }

  const params = await searchParams
  const tab = params.tab ?? 'visao'
  const store = params.store ?? ''

  const adminDb = createAdminClient()
  const tenantId = profile.tenant_id

  // Todas as leituras via service-role COM .eq('tenant_id') explicito:
  // as views sao REVOKE anon/authenticated (D-21), entao o isolamento de
  // tenant e responsabilidade do codigo, nao do RLS.
  const [metricsRes, abcRes, rankingRes, summaryRes] = await Promise.all([
    adminDb
      .from('product_inventory_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('product_code'),
    adminDb
      .from('product_abc_curve')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('abc_rank'),
    adminDb
      .from('product_sales_ranking')
      .select('*')
      .eq('tenant_id', tenantId),
    adminDb.rpc('inventory_summary', { p_tenant_id: tenantId }),
  ])

  const metrics = (metricsRes.data ?? []) as InventoryMetric[]
  const abc = (abcRes.data ?? []) as AbcRow[]
  const ranking = (rankingRes.data ?? []) as RankingRow[]
  const summaryRow = Array.isArray(summaryRes.data) ? summaryRes.data[0] : summaryRes.data
  const summary = (summaryRow ?? null) as InventorySummary | null

  const loadError =
    metricsRes.error?.message ??
    abcRes.error?.message ??
    rankingRes.error?.message ??
    summaryRes.error?.message ??
    null

  const stores = Array.from(
    new Set(ranking.map(r => r.store).filter((s): s is string => Boolean(s)))
  ).sort()

  const canEditCost = ['compras', 'adm', 'gerente', 'super_admin'].includes(profile.role)

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      <div className="mb-8">
        <PageHeader
          title="Compras"
          subtitle="O que repor, o que liquidar e por qual custo — giro, ruptura e curva ABC do estoque."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Compras' }]}
        />
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-body-sm text-on-surface">
          Falha ao carregar dados de inventario: {loadError}
        </div>
      )}

      <ComprasClient
        tab={tab}
        store={store}
        stores={stores}
        metrics={metrics}
        abc={abc}
        ranking={ranking}
        summary={summary}
        canEditCost={canEditCost}
      />
    </div>
  )
}
