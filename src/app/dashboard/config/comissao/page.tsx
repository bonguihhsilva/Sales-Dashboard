import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ConfigComissaoClient from './ConfigComissaoClient'

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
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          Configuração de Comissões por Loja
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Defina as porcentagens de comissão, bônus e metas aplicáveis a cada uma de suas lojas.
        </p>
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
