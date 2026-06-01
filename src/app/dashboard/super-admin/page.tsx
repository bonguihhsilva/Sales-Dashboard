import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
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
      {/* Top App Bar */}
      <div style={{
        padding: '1rem 2rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', zIndex: 10, position: 'sticky', top: 0
      }}>
        <div className="flex flex-col">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Painel Super Admin
          </h1>
          <span className="text-sm text-muted-foreground mt-1">Gestão global de empresas parceiras (Tenants)</span>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        <SuperAdminClient tenants={tenants || []} />
      </div>
    </div>
  )
}


