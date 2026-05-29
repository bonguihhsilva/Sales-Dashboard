'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'

export default function LicaoClient({ 
  licao, 
  trilhaId, 
  moduloId, 
  jaConcluida 
}: { 
  licao: any, 
  trilhaId: string, 
  moduloId: string, 
  jaConcluida: boolean 
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleConcluir = async () => {
    if (jaConcluida) {
      router.push(`/vendedor/treinamentos/${trilhaId}/${moduloId}`)
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('progresso_usuario')
        .insert({
          usuario_id: user.id,
          licao_id: licao.id,
          concluida: true,
          concluida_em: new Date().toISOString()
        })

      if (error) throw error

      router.push(`/vendedor/treinamentos/${trilhaId}/${moduloId}`)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  // licao.conteudo pode ser JSON { texto: '...', video_url: '...' }
  const conteudo = licao.conteudo || {}

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <SectionTitle>{licao.titulo}</SectionTitle>
      
      <div style={{ marginTop: '2rem', fontSize: '1rem', lineHeight: '1.6', color: 'var(--text)' }}>
        {conteudo.video_url && (
          <div style={{ marginBottom: '2rem' }}>
            {/* Mock video player se houver URL */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--surface2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Video Player: {conteudo.video_url}</span>
            </div>
          </div>
        )}
        
        {conteudo.texto && (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {conteudo.texto}
          </div>
        )}

        {!conteudo.video_url && !conteudo.texto && (
          <p style={{ color: 'var(--muted)' }}>Conteúdo da lição em construção.</p>
        )}
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleConcluir}
          disabled={loading}
          style={{ 
            background: jaConcluida ? 'var(--surface)' : 'var(--accent)', 
            color: jaConcluida ? 'var(--text)' : 'var(--bg)', 
            border: jaConcluida ? '1px solid var(--border)' : 'none', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            fontWeight: 800, 
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'Syne, sans-serif'
          }}
        >
          {loading ? 'Salvando...' : jaConcluida ? 'Voltar para o Módulo' : 'Concluir Lição ✓'}
        </button>
      </div>
    </div>
  )
}
