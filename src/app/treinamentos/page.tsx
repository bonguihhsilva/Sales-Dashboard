import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton, SectionTitle } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TreinamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (jwtRole !== 'vendedor') redirect('/dashboard')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) redirect('/login')

  const { data: gamificacao } = await supabase
    .from('gamificacao').select('*').eq('usuario_id', user.id).maybeSingle()

  const { data: trilhas } = await supabase
    .from('trilhas').select('*').eq('ativo', true).order('ordem', { ascending: true })

  const xp = gamificacao?.xp_total || 0
  const nivel = gamificacao?.nivel || 1

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-block', background: 'var(--accent)', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
            <span style={{ color: '#0e0f11', fontWeight: 800, fontSize: '0.75rem' }}>GDS - TREINAMENTOS</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Trilhas de Aprendizado
          </h1>
          <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '2px' }}>
            Aumente seu conhecimento e ganhe XP
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', background: 'var(--surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>Seu Nível</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>Nível {nivel}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }}></div>
            <div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>XP Total</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--meta3, #f5a742)' }}>{xp} XP</div>
            </div>
          </div>
          <a href="/meu-resultado" style={{ fontSize: '0.8rem', textDecoration: 'none', color: 'var(--text)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px' }}>Meu Resultado</a>
          <LogoutButton />
        </div>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <SectionTitle>Trilhas Disponíveis</SectionTitle>
        
        {(!trilhas || trilhas.length === 0) ? (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', marginTop: '1rem' }}>
            <p style={{ color: 'var(--muted)' }}>Nenhuma trilha disponível no momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {trilhas.map((trilha) => (
              <Link key={trilha.id} href={`/treinamentos/${trilha.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px', 
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{trilha.titulo}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', minHeight: '40px' }}>
                    {trilha.descricao || 'Sem descrição.'}
                  </p>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent)22', padding: '4px 10px', borderRadius: '4px' }}>
                      Acessar Trilha →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
