import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import RegrasClient from './RegrasClient'

export const dynamic = 'force-dynamic'

export default async function RegrasComissaoPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  const { data: profile } = await supabase
    .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()
  let currentProfile = profile
  if (!currentProfile) {
    currentProfile = { role: jwtRole, name: 'Mock', tenant_id: user.id }
  }

  const effectiveRole = currentProfile.role || jwtRole

  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  if (!currentProfile.tenant_id) {
    const adminDb = createAdminClient()
    await adminDb.from('profiles').update({ tenant_id: user.id }).eq('id', user.id)
    currentProfile.tenant_id = user.id
  }

  // Buscar regras ativas e inativas (admin ve tudo)
  const adminDb = createAdminClient()
  const { data: regras } = await adminDb
    .from('regras_comissao')
    .select('*')
    .eq('tenant_id', currentProfile.tenant_id!)
    .order('prioridade', { ascending: true })
    .order('criado_em', { ascending: false })

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
            Regras de Comissão
          </h1>
          <p className="text-on-surface-variant max-w-2xl">Gerencie as porcentagens, metas e bônus aplicáveis por canal de vendas ou usuário.</p>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl p-6 border border-white/5">
        <RegrasClient regras={regras || []} />
      </div>
    </div>
  )
}


