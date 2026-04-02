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

  // All unique vendors: from goals + from sales_records (orphans not in goals)
  // This ensures even unregistered vendors show up for linking
  const { data: salesVendors } = await supabase
    .from('sales_records')
    .select('vendor_id, vendor_name, store')
    .order('vendor_name')

  const vendorMap = new Map<string, { vendor_id: string; vendor_name: string; store: string }>()
  
  // First add from goals (have store/name properly set)
  ;(goals ?? []).forEach(g => {
    if (!vendorMap.has(g.vendor_id)) {
      vendorMap.set(g.vendor_id, { vendor_id: g.vendor_id, vendor_name: g.vendor_name, store: g.store })
    }
  })
  // Then add any from sales that aren't in goals yet
  ;(salesVendors ?? []).forEach(s => {
    if (!vendorMap.has(s.vendor_id)) {
      vendorMap.set(s.vendor_id, { vendor_id: s.vendor_id, vendor_name: s.vendor_name, store: s.store })
    }
  })

  const allVendors = [...vendorMap.values()].sort((a, b) => a.vendor_name.localeCompare(b.vendor_name))

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
