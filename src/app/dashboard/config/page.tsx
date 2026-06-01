import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ConfigIndexClient from './ConfigIndexClient'

export const dynamic = 'force-dynamic'

export default async function ConfigPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')
  if (!['adm', 'super_admin'].includes(profile?.role || '')) redirect('/dashboard')

  const admin = createAdminClient()

  const [{ data: tenant }, { count: storesCount }, { count: gerentesCount }] =
    await Promise.all([
      admin.from('tenants').select('id, nome, slug, plano, cor_primaria, moeda_padrao, locale, commission_pct_default').eq('id', profile.tenant_id).single(),
      admin.from('stores').select('*', { count: 'exact', head: true }).eq('tenant_id', profile.tenant_id).eq('ativo', true),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', profile.tenant_id).eq('role', 'gerente'),
    ])

  return <ConfigIndexClient tenant={tenant} storesCount={storesCount ?? 0} gerentesCount={gerentesCount ?? 0} />
}
