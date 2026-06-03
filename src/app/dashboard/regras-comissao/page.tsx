import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import RegrasClient from './RegrasClient'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function RegrasComissaoPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  // Buscar regras ativas e inativas (admin ve tudo)
  const adminDb = createAdminClient()
  const { data: regras } = await adminDb
    .from('regras_comissao')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('prioridade', { ascending: true })
    .order('criado_em', { ascending: false })

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10">
        <PageHeader
          title="Regras de Comissão"
          subtitle="Gerencie as porcentagens, metas e bônus aplicáveis por canal de vendas ou usuário."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Regras de Comissão' }]}
        />
      </div>

      <div className="flex-1 glass-card rounded-2xl p-6 border border-white/5">
        <RegrasClient regras={regras || []} />
      </div>
    </div>
  )
}


