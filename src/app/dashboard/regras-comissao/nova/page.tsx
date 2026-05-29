import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import RegraFormClient from '../RegraFormClient'

export const dynamic = 'force-dynamic'

export default async function NovaRegraPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  const { data: profile } = await supabase
    .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()
  
  const effectiveRole = profile?.role || jwtRole
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  let finalTenant = profile?.tenant_id
  if (!finalTenant) {
    const adminDb = await import('@/lib/supabase/admin').then(m => m.createAdminClient())
    await adminDb.from('profiles').update({ tenant_id: user.id }).eq('id', user.id)
    finalTenant = user.id
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <a href="/dashboard/regras-comissao" style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Voltar para regras
          </a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Nova Regra de Comissão
          </h1>
          <p style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '3px' }}>
            GDS - FRAME · {effectiveRole.toUpperCase()} · {profile?.name || 'Admin'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogoutButton />
        </div>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <RegraFormClient tenantId={finalTenant} />
      </div>
    </div>
  )
}


