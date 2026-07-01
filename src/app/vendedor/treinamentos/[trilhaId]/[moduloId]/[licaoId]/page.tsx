import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton, PageHeader } from '@/components/ui'
import LicaoClient from './LicaoClient'

export const dynamic = 'force-dynamic'

export default async function LicaoPage({ params }: { params: Promise<{ trilhaId: string, moduloId: string, licaoId: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')
  const userId = user?.id
  if (!userId) redirect('/login')

  const { trilhaId, moduloId, licaoId } = await params

  const { data: modulo } = await supabase
    .from('modulos').select('titulo').eq('id', moduloId).single()
    
  const { data: licao } = await supabase
    .from('aulas').select('*').eq('id', licaoId).single()
    
  if (!licao) redirect(`/vendedor/treinamentos/${trilhaId}/${moduloId}`)

  // Verifica se já concluiu
  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('id')
    .eq('usuario_id', userId)
    .eq('aula_id', licaoId)
    .maybeSingle()

  const jaConcluida = !!progresso

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={`Lição ${licao.ordem}`}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: modulo?.titulo || 'Módulo', href: `/vendedor/treinamentos/${trilhaId}/${moduloId}` },
            { label: `Lição ${licao.ordem}` },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <LicaoClient 
        licao={licao} 
        trilhaId={trilhaId} 
        moduloId={moduloId} 
        jaConcluida={jaConcluida} 
      />
    </div>
  )
}
