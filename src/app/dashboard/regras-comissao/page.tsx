import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import RegrasClient from './RegrasClient'

export const dynamic = 'force-dynamic'

export default async function RegrasComissaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  const { data: profile } = await supabase
    .from('profiles').select('role, name, tenant_id').eq('id', user.id).single()
  
  const effectiveRole = profile?.role || jwtRole

  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  if (!profile?.tenant_id) {
    const adminDb = createAdminClient()
    await adminDb.from('profiles').update({ tenant_id: user.id }).eq('id', user.id)
    if (profile) {
      profile.tenant_id = user.id
    } else {
      // should not happen, but just to satisfy typescript
      redirect('/dashboard')
    }
  }

  // Buscar regras ativas e inativas (admin ve tudo)
  const adminDb = createAdminClient()
  const { data: regras } = await adminDb
    .from('regras_comissao')
    .select('*')
    .eq('tenant_id', profile.tenant_id!)
    .order('prioridade', { ascending: true })
    .order('criado_em', { ascending: false })

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>
      {/* Top App Bar */}
      <div style={{
        padding: '1rem 2rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', zIndex: 10, position: 'sticky', top: 0
      }}>
        <div className="flex items-center gap-4">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Regras de Comissão
          </h1>
        </div>
      </div>

      <div style={{ padding: '1.5rem 2.5rem' }}>
        <RegrasClient regras={regras || []} />
      </div>
    </div>
  )
}
