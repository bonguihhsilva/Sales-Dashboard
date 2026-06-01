import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import AdminLmsClient from './AdminLmsClient'

export const dynamic = 'force-dynamic'

export default async function AdminLmsPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role || 'vendedor'
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard/treinamentos')
  }

  const tenantId = profile.tenant_id
  const adminDb = createAdminClient()

  // 1. Fetch trilhas
  const { data: trilhas } = await adminDb
    .from('trilhas')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })

  // 2. Fetch modulos
  let modulosQuery = adminDb.from('modulos').select('*').order('ordem')
  if (tenantId) modulosQuery = modulosQuery.eq('tenant_id', tenantId)
  const { data: modulos } = await modulosQuery

  // 3. Fetch aulas
  let aulasQuery = adminDb.from('aulas').select('*').order('ordem')
  if (tenantId) aulasQuery = aulasQuery.eq('tenant_id', tenantId)
  const { data: aulas } = await aulasQuery

  // 4. Fetch quizzes
  let quizzesQuery = adminDb.from('quizzes').select('*').order('id')
  if (tenantId) quizzesQuery = quizzesQuery.eq('tenant_id', tenantId)
  const { data: quizzes } = await quizzesQuery

  // 5. Fetch provas
  let provasQuery = adminDb.from('provas').select('*').order('id')
  if (tenantId) provasQuery = provasQuery.eq('tenant_id', tenantId)
  const { data: provas } = await provasQuery

  // 6. Fetch questoes_prova
  let questoesQuery = adminDb.from('questoes_prova').select('*').order('id')
  if (tenantId) questoesQuery = questoesQuery.eq('tenant_id', tenantId)
  const { data: questoesProva } = await questoesQuery

  const tenantTrilhaIds = new Set((trilhas || []).map(t => t.id))
  
  const filteredModulos = (modulos || []).filter(m => tenantTrilhaIds.has(m.trilha_id))
  const tenantModuloIds = new Set(filteredModulos.map(m => m.id))

  const filteredAulas = (aulas || []).filter(a => tenantModuloIds.has(a.modulo_id))
  const filteredQuizzes = (quizzes || []).filter(q => filteredAulas.some(a => a.id === q.aula_id))
  
  const filteredProvas = (provas || []).filter(p => tenantModuloIds.has(p.modulo_id))
  const filteredQuestoesProva = (questoesProva || []).filter(qp => filteredProvas.some(p => p.id === qp.prova_id))

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
          initialAulas={filteredAulas} 
          initialQuizzes={filteredQuizzes} 
          initialProvas={filteredProvas}
          initialQuestoesProva={filteredQuestoesProva}
        />
      </div>
    </div>
  )
}
