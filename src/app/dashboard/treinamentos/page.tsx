import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AdminLmsClient from './AdminLmsClient'

export const dynamic = 'force-dynamic'

export default async function TreinamentosAdminPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role || 'vendedor'
  if (effectiveRole === 'vendedor') {
    redirect('/vendedor/treinamentos')
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
    <div className="min-h-full bg-background flex flex-col p-0">
      <AdminLmsClient 
        initialTrilhas={trilhas || []} 
        initialModulos={filteredModulos} 
        initialAulas={filteredAulas} 
        initialQuizzes={filteredQuizzes} 
        initialProvas={filteredProvas}
        initialQuestoesProva={filteredQuestoesProva}
      />
    </div>
  )
}
