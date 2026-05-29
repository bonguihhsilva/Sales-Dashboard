import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SectionTitle } from '@/components/ui'
import ModulosClient from './ModulosClient'

export const dynamic = 'force-dynamic'

export default async function ModulosAdminPage({ params }: { params: Promise<{ trilhaId: string }> }) {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (jwtRole === 'vendedor') redirect('/treinamentos')

  const { trilhaId } = await params

  // Buscar trilha
  const { data: trilha } = await supabase
    .from('trilhas')
    .select('*')
    .eq('id', trilhaId)
    .single()

  if (!trilha) redirect('/dashboard/treinamentos')

  // Buscar módulos da trilha
  const { data: modulos } = await supabase
    .from('modulos')
    .select('*')
    .eq('trilha_id', trilhaId)
    .order('ordem', { ascending: true })

  return (
    <div style={{ padding: '2rem 2.5rem', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href="/dashboard/treinamentos" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← Voltar para Trilhas
          </Link>
          <SectionTitle>Módulos: {trilha.titulo}</SectionTitle>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            Adicione os módulos e as recompensas de XP para esta trilha.
          </p>
        </div>
      </div>

      <ModulosClient initialModulos={modulos || []} trilhaId={trilhaId} />
    </div>
  )
}
