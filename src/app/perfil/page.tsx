export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/login')
  // }

  const userId = user?.id
  if (!userId) redirect('/login')

  let profile: any = null
  if (user) {
    const { data: dbProfile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    profile = dbProfile
  } else {
    profile = {
      id: 'mock-user-id',
      vendor_id: 'mock-v-1',
      name: 'Vendedor Teste',
      tenant_id: 'mock-tenant-id',
      role: 'vendedor',
      store: 'Matriz'
    }
  }

  const role = profile?.role || user.app_metadata?.role || 'vendedor'
  const backLink = role === 'vendedor' ? '/vendedor/meu-resultado' : '/dashboard'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-block', background: '#2563eb', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>GDS - PERFIL</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Meu Perfil</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Visualize suas informações de conta</p>
          </div>
          <Link href={backLink}>
            <button className="nav-button">Voltar</button>
          </Link>
        </header>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', 
              color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800 
            }}>
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{profile?.name || 'Usuário'}</h2>
              <div style={{ display: 'inline-block', background: 'var(--surface2)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px' }}>
                {role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            
            <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>mail</span>
              <div>
                <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>E-mail</label>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>{user?.email || 'vendedor@teste.com'}</div>
              </div>
            </div>
            
            <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>work</span>
              <div>
                <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Cargo</label>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{role.replace('_', ' ')}</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>domain</span>
              <div>
                <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Telefone Corporativo</label>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>{profile?.telefone_corporativo || 'Não informado'}</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>smartphone</span>
              <div>
                <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Telefone Pessoal</label>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>{profile?.telefone_pessoal || 'Não informado'}</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>cake</span>
              <div>
                <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Data de Nascimento</label>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>{profile?.data_nascimento || 'Não informada'}</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>calendar_month</span>
              <div>
                <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Início na Empresa</label>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>
                  {profile?.data_admissao ? new Date(profile.data_admissao).toLocaleDateString('pt-BR') : 'Não informada'}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>store</span>
              <div>
                <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Loja / Unidade</label>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>{profile?.store || 'Matriz'}</div>
              </div>
            </div>

            {role === 'vendedor' && (
              <div style={{ background: 'var(--surface2)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.5rem', opacity: 0.8 }}>badge</span>
                <div>
                  <label style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>ID Vendedor</label>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>{profile?.vendor_id || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
