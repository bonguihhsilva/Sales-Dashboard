import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import Link from 'next/link'
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href={`/vendedor/treinamentos/${trilhaId}/${moduloId}`} style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Voltar para {modulo?.titulo || 'Módulo'}
          </Link>
          <p style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>
            Lição {licao.ordem}
          </p>
        </div>
        <div>
          <LogoutButton />
        </div>
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
