import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SectionTitle } from '@/components/ui'
import TrilhasClient from './TrilhasClient'

export const dynamic = 'force-dynamic'

export default async function TreinamentosAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (jwtRole === 'vendedor') redirect('/treinamentos')

  // Buscar trilhas
  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('*')
    .order('ordem', { ascending: true })

  return (
    <div style={{ padding: '2rem 2.5rem', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← Voltar ao Dashboard
          </Link>
          <SectionTitle>Gestão de Treinamentos (LMS)</SectionTitle>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            Crie e organize as trilhas de aprendizado para os vendedores.
          </p>
        </div>
      </div>

      <TrilhasClient initialTrilhas={trilhas || []} />
    </div>
  )
}
