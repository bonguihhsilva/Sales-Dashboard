export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import MuralClient from './MuralClient'
import type { Period } from '@/types'
import Link from 'next/link'

export default async function MuralPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const jwtRole = (user?.app_metadata?.role as string | undefined) ?? 'vendedor'

  // Decide if we should show monetary values based on the role
  const showValues = jwtRole === 'super_admin' || jwtRole === 'adm' || jwtRole === 'gerente'

  let profile: any = null
  if (!user) {
    redirect('/login')
  } else {
    const { data: dbProfile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    profile = dbProfile
  }

  const sp = await searchParams

  const { data: dbPeriods } = await supabase.from('periods').select('*').order('start_date', { ascending: false })
  const periods = dbPeriods || [{ id: 1, label: 'Período Atual' }]
  const activePeriod = sp.period ? parseInt(sp.period) : (periods?.[0]?.id ?? 1)

  // vendor_summary tem SELECT revogado de authenticated (hardening) — ranking via service_role, escopado ao tenant.
  const adminDb = createAdminClient()
  const { data: summaries } = await adminDb
    .from('vendor_summary')
    .select('*')
    .eq('period_id', activePeriod)
    .eq('tenant_id', profile?.tenant_id)

  const { data: dbStores } = await supabase
    .from('stores')
    .select('*')

  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name }))

  // Top 3 alunos (LMS) por XP — dado real, escopado ao tenant
  const { data: tenantPeople } = await adminDb
    .from('profiles').select('id, name').eq('tenant_id', profile?.tenant_id)
  const peopleIds = (tenantPeople ?? []).map(p => p.id)
  const nameById = new Map((tenantPeople ?? []).map(p => [p.id, p.name as string]))
  let topStudents: { nome: string; xp: number; nivel: number }[] = []
  if (peopleIds.length) {
    const { data: gam } = await adminDb
      .from('gamificacao').select('usuario_id, xp_total, nivel')
      .in('usuario_id', peopleIds).order('xp_total', { ascending: false }).limit(3)
    topStudents = (gam ?? [])
      .filter(g => Number(g.xp_total) > 0)
      .map(g => ({ nome: nameById.get(g.usuario_id) ?? '—', xp: Number(g.xp_total), nivel: Number(g.nivel) }))
  }

  // Helper function to navigate back depending on role
  const backLink = showValues ? '/dashboard' : '/vendedor/meu-resultado'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-block', background: '#2563eb', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>GDS - MURAL</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Mural da Empresa</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Informações e recados gerais</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href={backLink}>
              <button className="nav-button">Voltar</button>
            </Link>
          </div>
        </header>

        {/* Client Component */}
        <MuralClient
          summaries={summaries || []}
          stores={stores}
          showValues={showValues}
          topStudents={topStudents}
        />
      </div>
    </div>
  )
}
