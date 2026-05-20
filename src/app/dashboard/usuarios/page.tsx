import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('name')

  const { data: goals } = await supabase
    .from('goals')
    .select('vendor_id, vendor_name, store')
    .eq('period_id', 1)

  const vendorOptions = (goals ?? []).map(g => ({
    vendor_id: g.vendor_id,
    vendor_name: g.vendor_name,
    store: g.store,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/dashboard" style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>← Voltar ao dashboard</a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Usuários <span style={{ color: 'var(--accent)' }}>{'// '}Gestão de Acesso</span>
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <UsersClient profiles={profiles ?? []} vendorOptions={vendorOptions} />
      </div>
    </div>
  )
}
