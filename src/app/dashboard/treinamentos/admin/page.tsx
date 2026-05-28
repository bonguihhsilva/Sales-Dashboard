import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import AdminLmsClient from './AdminLmsClient'

export const dynamic = 'force-dynamic'

export default async function AdminLmsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (profile?.role !== 'adm' && profile?.role !== 'gerente') {
    redirect('/dashboard/treinamentos')
  }

  // 1. Fetch trilhas for this tenant
  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('ordem')

  // 2. Fetch modulos
  const { data: modulos } = await supabase
    .from('modulos')
    .select('*')
    .order('ordem')

  // 3. Fetch licoes
  const { data: licoes } = await supabase
    .from('licoes')
    .select('*')
    .order('ordem')

  // 4. Fetch questoes
  const { data: questoes } = await supabase
    .from('quiz_questoes')
    .select('*')
    .order('id')

  // We filter modulos, licoes, and questoes on the client or here.
  // Since we only want them for the tenant's trilhas:
  const tenantTrilhaIds = new Set((trilhas || []).map(t => t.id))
  
  const filteredModulos = (modulos || []).filter(m => tenantTrilhaIds.has(m.trilha_id))
  const tenantModuloIds = new Set(filteredModulos.map(m => m.id))

  const filteredLicoes = (licoes || []).filter(l => tenantModuloIds.has(l.modulo_id))
  const filteredQuestoes = (questoes || []).filter(q => tenantModuloIds.has(q.modulo_id))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/dashboard/treinamentos" style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>← Voltar a Treinamentos</a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            LMS Admin <span style={{ color: 'var(--accent)' }}>// Gestão de Conteúdo</span>
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <AdminLmsClient 
          initialTrilhas={trilhas || []} 
          initialModulos={filteredModulos} 
          initialLicoes={filteredLicoes} 
          initialQuestoes={filteredQuestoes} 
        />
      </div>
    </div>
  )
}
