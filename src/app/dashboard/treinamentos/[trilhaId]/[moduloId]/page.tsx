import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SectionTitle } from '@/components/ui'
import ConteudoClient from './ConteudoClient'

export const dynamic = 'force-dynamic'

export default async function ModuloConteudoAdminPage({ params }: { params: Promise<{ trilhaId: string, moduloId: string }> }) {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (jwtRole === 'vendedor') redirect('/treinamentos')

  const { trilhaId, moduloId } = await params

  // Buscar módulo
  const { data: modulo } = await supabase
    .from('modulos')
    .select('*, trilhas(titulo)')
    .eq('id', moduloId)
    .single()

  if (!modulo) redirect(`/dashboard/treinamentos/${trilhaId}`)

  // Buscar lições
  const { data: licoes } = await supabase
    .from('licoes')
    .select('*')
    .eq('modulo_id', moduloId)
    .order('ordem', { ascending: true })

  // Buscar questões do quiz
  const { data: questoes } = await supabase
    .from('quiz_questoes')
    .select('*')
    .eq('modulo_id', moduloId)
    .order('id', { ascending: true })

  return (
    <div style={{ padding: '2rem 2.5rem', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/dashboard/treinamentos/${trilhaId}`} style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
          ← Voltar para Módulos
        </Link>
        <SectionTitle>Módulo: {modulo.titulo}</SectionTitle>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
          Gerencie as lições e as questões do quiz deste módulo. Recompensa: {modulo.xp_reward} XP.
        </p>
      </div>

      <ConteudoClient initialLicoes={licoes || []} initialQuestoes={questoes || []} moduloId={moduloId} />
    </div>
  )
}
