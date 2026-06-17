import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Period } from '@/types'
import UploadModal from '../UploadModal'
import PeriodSelector from '../PeriodSelector'
import ExportButton from '../ExportButton'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { user, profile } = await getTenantContext()

  if (user) {
    const jwtRole = profile.role
    if (jwtRole === 'vendedor') redirect('/vendedor/meu-resultado')
  }

  const adminDb = createAdminClient()
  const { data: periods } = await adminDb
    .from('periods').select('*').eq('tenant_id', profile.tenant_id)
    .order('year', { ascending: false }).order('month', { ascending: false })

  const params = await searchParams
  const activePeriod = params.period
    ? parseInt(params.period)
    : (periods?.[0]?.id ?? 1)

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10">
        <PageHeader
          title="Relatórios e Importação"
          subtitle="Exporte relatórios de comissões ou importe novos dados de vendas da Hubspot."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Relatórios' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
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
