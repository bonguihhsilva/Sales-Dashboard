export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user?.app_metadata?.role || 'vendedor'
  const backLink = role === 'vendedor' ? '/vendedor/meu-resultado' : '/dashboard'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-block', background: '#2563eb', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>GDS - CONFIGURAÇÕES</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Configurações</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Gerencie as preferências da sua conta</p>
          </div>
          <Link href={backLink}>
            <button className="nav-button">Voltar</button>
          </Link>
        </header>

        {/* Settings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Segurança</h2>
            
            <div style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alterar Senha</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Atualize sua senha de acesso periodicamente</div>
              </div>
              <button style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                Alterar
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Notificações</h2>
            
            <div style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alertas de Comissão</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Receba avisos quando atingir uma nova meta</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
            </div>

            <div style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Atualizações do Mural</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Seja notificado sobre novos recados importantes</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
