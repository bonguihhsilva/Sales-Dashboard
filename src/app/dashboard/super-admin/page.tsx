import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import SuperAdminClient from './SuperAdminClient'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  const adminDb = createAdminClient()
  const { data: tenantsData } = await adminDb.from('tenants').select('*').order('nome')

  // Get user counts
  const { data: profiles } = await adminDb.from('profiles').select('tenant_id')
  
  const userCounts = (profiles || []).reduce((acc: Record<string, number>, p: any) => {
    if (p.tenant_id) {
      acc[p.tenant_id] = (acc[p.tenant_id] || 0) + 1
    }
    return acc
  }, {})

  const tenants = (tenantsData || []).map((t: any) => ({
    ...t,
    user_count: userCounts[t.id] || 0
  }))

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2rem 0' }}>
        <PageHeader
          title="Painel Super Admin"
          subtitle="Gestão global de empresas parceiras (Tenants)"
        />
      </div>

      <div style={{ padding: '2rem' }}>
        <SuperAdminClient tenants={tenants || []} />
      </div>
    </div>
  )
}


