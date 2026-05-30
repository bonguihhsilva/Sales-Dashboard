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
  
  let currentProfile = profile
  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (!currentProfile) {
    currentProfile = { role: jwtRole, tenant_id: user.id }
  }

  const effectiveRole = currentProfile.role || jwtRole
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/vendedor/meu-resultado')
  }

  const tenant_id = currentProfile.tenant_id || user.id

  const { data: storesData } = await supabase
    .from('stores')
    .select('key, label, color')
    .eq('tenant_id', tenant_id)
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
    <div className="min-h-screen bg-bg">
      <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-surface-container-high/30">
        <div>
          <a href="/dashboard" className="text-[11px] font-mono text-muted-foreground hover:text-white transition-colors no-underline">
            ← Voltar ao dashboard
          </a>
          <h1 className="text-2xl font-bold mt-1 font-display-lg tracking-tight">
            Mapeamento <span className="text-accent font-normal">// Vendedor → Usuário</span>
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div className="p-10">
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


