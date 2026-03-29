import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import MapeamentoClient from './MapeamentoClient'

export const dynamic = 'force-dynamic'

export default async function MapeamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  // All user profiles
  const { data: profiles } = await supabase
    .from('profiles').select('*').order('name')

  // All vendor goals (to show which vendor_ids exist in the system)
  const { data: goals } = await supabase
    .from('goals').select('vendor_id, vendor_name, store').order('vendor_name')

  // Deduplicate vendor_ids
  const uniqueVendors = Array.from(
    new Map((goals ?? []).map(g => [g.vendor_id, g])).values()
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
        <MapeamentoClient profiles={profiles ?? []} vendors={uniqueVendors} />
      </div>
    </div>
  )
}
