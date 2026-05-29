import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import MapeamentoClient from './MapeamentoClient'

export const dynamic = 'force-dynamic'

export default async function MapeamentoPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  const { data: storesData } = await supabase
    .from('stores')
    .select('key, label, color')
    .eq('tenant_id', profile.tenant_id)
    .order('label')

  const stores = storesData ?? []

  // All user profiles
  const { data: profiles } = await supabase
    .from('profiles').select('*').order('name')

  // All vendor goals (vendor_ids that have metas defined)
  const { data: goals } = await supabase
    .from('goals').select('vendor_id, vendor_name, store').order('vendor_name')

  // Vendor_ids from sales that are NOT in goals (appeared in HTML but never registered)
  const { data: orphanSales } = await supabase
    .from('sales_records')
    .select('vendor_id, vendor_name, store')
    .order('vendor_name')

  // Deduplicate goals vendors
  const uniqueVendors = Array.from(
    new Map((goals ?? []).map(g => [g.vendor_id, g])).values()
  ).sort((a, b) => a.vendor_name.localeCompare(b.vendor_name))

  // Deduplicate orphan vendors (in sales but NOT in goals)
  const goalIds = new Set((goals ?? []).map(g => g.vendor_id))
  const orphanVendors = Array.from(
    new Map(
      (orphanSales ?? [])
        .filter(s => !goalIds.has(s.vendor_id))
        .map(s => [s.vendor_id, s])
    ).values()
  ).sort((a, b) => a.vendor_name.localeCompare(b.vendor_name))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/dashboard" style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>← Voltar ao dashboard</a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            Mapeamento <span style={{ color: 'var(--accent)' }}>// Vendedor → Usuário</span>
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <MapeamentoClient
          profiles={profiles ?? []}
          vendors={uniqueVendors}
          orphanVendors={orphanVendors}
          stores={stores}
        />
      </div>
    </div>
  )
}


