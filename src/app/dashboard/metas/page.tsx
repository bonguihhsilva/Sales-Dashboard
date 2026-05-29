import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import MetasClient from './MetasClient'

export const dynamic = 'force-dynamic'

export default async function MetasPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  const { data: periods } = await supabase.from('periods').select('*').order('id', { ascending: false })
  const { data: goals }   = await supabase.from('goals').select('*').order('vendor_name')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/dashboard" style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>← Voltar ao dashboard</a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Metas <span style={{ color: 'var(--accent)' }}>// Gestão de Períodos</span>
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <MetasClient periods={periods ?? []} goals={goals ?? []} />
      </div>
    </div>
  )
}


