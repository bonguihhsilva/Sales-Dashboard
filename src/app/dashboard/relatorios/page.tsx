import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Period, VendorSummary } from '@/types'
import UploadModal from '../UploadModal'
import PeriodSelector from '../PeriodSelector'
import ExportButton from '../ExportButton'
import { KpiCard, PageHeader, SectionTitle } from '@/components/ui'
import { hasModule } from '@/lib/modules'
import { fmtCurrency } from '@/lib/utils'
import type { InventorySummary } from '../compras/types'
import CommissionTrendChart from './CommissionTrendChart'

export const dynamic = 'force-dynamic'

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) redirect('/login')
  if (profile.role === 'vendedor') redirect('/vendedor/meu-resultado')
  if (!hasModule(profile.modules, 'relatorios')) redirect('/dashboard')

  const adminDb = createAdminClient()
  const tenantId = profile.tenant_id
  const { data: periods } = await adminDb
    .from('periods').select('*').eq('tenant_id', tenantId)
    .order('year', { ascending: false }).order('month', { ascending: false })

  const params = await searchParams
  const activePeriod = params.period
    ? parseInt(params.period)
    : (periods?.[0]?.id ?? 1)

  // KPIs por módulo — cada bloco só roda a query se o tenant tiver acesso ao módulo.
  const showComissao = hasModule(profile.modules, 'comissao')
  const showRh = hasModule(profile.modules, 'rh')
  const showCompras = hasModule(profile.modules, 'compras')
  const showTreinamentos = hasModule(profile.modules, 'treinamentos')

  const trendPeriodIds = (periods ?? []).slice(0, 12).map(p => p.id)

  const [comissaoRes, rhRes, comprasRes, treinoRes, trendRes] = await Promise.all([
    showComissao
      ? adminDb.from('vendor_summary').select('total_sold, meta_level, total_commission')
          .eq('period_id', activePeriod).eq('tenant_id', tenantId)
      : Promise.resolve({ data: null }),
    showRh
      ? adminDb.from('profiles').select('id, ativo').eq('tenant_id', tenantId).eq('role', 'vendedor')
      : Promise.resolve({ data: null }),
    showCompras
      ? adminDb.rpc('inventory_summary', { p_tenant_id: tenantId })
      : Promise.resolve({ data: null }),
    showTreinamentos
      ? adminDb.from('trilhas').select('id, ativo')
      : Promise.resolve({ data: null }),
    showComissao && trendPeriodIds.length
      ? adminDb.from('vendor_summary').select('period_id, total_sold')
          .in('period_id', trendPeriodIds).eq('tenant_id', tenantId)
      : Promise.resolve({ data: null }),
  ])

  const comissaoSummaries = (comissaoRes.data ?? []) as Pick<VendorSummary, 'total_sold' | 'meta_level' | 'total_commission'>[]
  const totalVendido = comissaoSummaries.reduce((s, v) => s + (v.total_sold ?? 0), 0)
  const totalComissao = comissaoSummaries.reduce((s, v) => s + (v.total_commission ?? 0), 0)
  const vendedoresNaMeta = comissaoSummaries.filter(v => v.meta_level > 0).length

  const rhProfiles = (rhRes.data ?? []) as { id: string; ativo: boolean | null }[]
  const vendedoresAtivos = rhProfiles.filter(p => p.ativo !== false).length

  const comprasSummaryRow = Array.isArray(comprasRes.data) ? comprasRes.data[0] : comprasRes.data
  const comprasSummary = (comprasSummaryRow ?? null) as InventorySummary | null

  const trilhas = (treinoRes.data ?? []) as { id: string; ativo: boolean | null }[]
  const trilhasAtivas = trilhas.filter(t => t.ativo !== false).length

  const trendRows = (trendRes.data ?? []) as { period_id: number; total_sold: number }[]
  const trendByPeriod = new Map<number, number>()
  for (const r of trendRows) trendByPeriod.set(r.period_id, (trendByPeriod.get(r.period_id) ?? 0) + (r.total_sold ?? 0))
  const trendData = [...(periods ?? [])].slice(0, 12).reverse().map(p => ({
    label: p.label.replace(' 20', ' \''),
    total: trendByPeriod.get(p.id) ?? 0,
  }))

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10">
        <PageHeader
          title="Relatórios"
          subtitle="Visão consolidada dos KPIs por área, exportação e importação de dados."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Relatórios' }]}
        />
      </div>

      {/* KPI overview — modular por módulo do tenant */}
      <div className="mb-10 max-w-6xl">
        {showComissao && (
          <div className="mb-8">
            <SectionTitle>Comissão</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <KpiCard label="Total Vendido" value={fmtCurrency(totalVendido)} />
              <KpiCard label="Comissão Total" value={fmtCurrency(totalComissao)} />
              <KpiCard label="Vendedores na Meta" value={`${vendedoresNaMeta}/${comissaoSummaries.length}`} />
            </div>
            <CommissionTrendChart data={trendData} />
          </div>
        )}

        {showRh && (
          <div className="mb-8">
            <SectionTitle>RH</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <KpiCard label="Vendedores Ativos" value={String(vendedoresAtivos)} />
              <KpiCard label="Total no Cadastro" value={String(rhProfiles.length)} />
            </div>
          </div>
        )}

        {showCompras && comprasSummary && (
          <div className="mb-8">
            <SectionTitle>Compras</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <KpiCard label="Valor em Estoque" value={fmtCurrency(comprasSummary.total_stock_value ?? 0)} />
              <KpiCard label="SKUs em Quebra" value={String(comprasSummary.skus_em_quebra)} />
              <KpiCard label="SKUs Parados" value={String(comprasSummary.skus_parados)} />
            </div>
          </div>
        )}

        {showTreinamentos && (
          <div className="mb-8">
            <SectionTitle>Treinamentos</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <KpiCard label="Trilhas Ativas" value={String(trilhasAtivas)} />
              <KpiCard label="Total de Trilhas" value={String(trilhas.length)} />
            </div>
          </div>
        )}
      </div>

      <SectionTitle>Importar / Exportar</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mt-3">
        {/* Export Card */}
        <div className="glass-card rounded-2xl p-8 flex flex-col border border-white/5">
          <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-2xl">download</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Exportar Relatório</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Selecione o período e o formato para baixar o relatório consolidado de comissões e vendas.
          </p>
          
          <div className="mt-auto flex flex-col gap-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Selecione o período</label>
              <div className="h-[44px]">
                <PeriodSelector periods={(periods || []) as Period[]} activePeriod={activePeriod} />
              </div>
            </div>
            <ExportButton activePeriod={activePeriod} />
          </div>
        </div>

        {/* Import Card */}
        <div className="glass-card rounded-2xl p-8 flex flex-col border border-white/5">
          <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-2xl">upload_file</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Importar Vendas (HTML)</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Faça o upload do relatório da Hubspot em formato HTML. O sistema detectará automaticamente o período e os vendedores.
          </p>
          
          <div className="mt-auto">
            <div className="h-[44px]">
              <UploadModal periods={(periods || []) as Period[]} tenantId={profile.tenant_id!} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
