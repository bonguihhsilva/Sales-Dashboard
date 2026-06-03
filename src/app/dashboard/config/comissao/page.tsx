import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ConfigComissaoClient from './ConfigComissaoClient'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function ConfigComissaoPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  const adminDb = createAdminClient()

  // Buscar lojas do tenant
  const { data: stores } = await adminDb
    .from('stores')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('name', { ascending: true })

  // Buscar regras de comissão ativas do tenant
  const { data: regras } = await adminDb
    .from('regras_comissao')
    .select('*')
    .eq('tenant_id', profile.tenant_id)

  return (
    <div className="min-h-full bg-background flex flex-col p-6">
      <div className="mb-8">
        <PageHeader
          title="Configuração de Comissões por Loja"
          subtitle="Defina as porcentagens de comissão, bônus e metas aplicáveis a cada uma de suas lojas."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Configurações', href: '/dashboard/config' },
            { label: 'Comissão' },
          ]}
        />
      </div>

      <div className="flex-1 glass-card rounded-2xl p-6 border border-white/5 bg-surface-container-low/40">
        <ConfigComissaoClient
          stores={stores || []}
          regras={regras || []}
          tenantId={profile.tenant_id}
        />
      </div>
    </div>
  )
}
