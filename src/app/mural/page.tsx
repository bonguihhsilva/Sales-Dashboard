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

  // Only load summaries for the active period to calculate ranking
  const { data: summaries } = await supabase
    .from('vendor_summary')
    .select('*')
    .eq('period_id', activePeriod)
    .eq('tenant_id', profile?.tenant_id)

  const { data: dbStores } = await supabase
    .from('stores')
    .select('*')

  const stores = (dbStores || []).map(s => ({ key: s.name, label: s.name }))

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
        />
      </div>
    </div>
  )
}
