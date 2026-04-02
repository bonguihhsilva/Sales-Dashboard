import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  const { data: profiles } = await supabase.from('profiles').select('*').order('name')
  const { data: periods }  = await supabase.from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })
  const { data: goals }    = await supabase.from('goals').select('*').order('vendor_name')

  // Use the all_vendors view which deduplicates across goals + sales_records
  const { data: vendorRows } = await supabase
    .from('all_vendors')
    .select('vendor_id, vendor_name, store, has_goals, linked_user')
    .order('vendor_name')

  const allVendors = (vendorRows ?? []).map(v => ({
    vendor_id:  v.vendor_id,
    vendor_name: v.vendor_name,
    store:      v.store,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/dashboard" style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>← Voltar ao dashboard</a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Gestão <span style={{ color: 'var(--accent)' }}>// Usuários · Mapeamento · Metas</span>
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <UsersClient
          profiles={profiles ?? []}
          periods={periods ?? []}
          goals={goals ?? []}
          allVendors={allVendors}
        />
      </div>
    </div>
  )
}
