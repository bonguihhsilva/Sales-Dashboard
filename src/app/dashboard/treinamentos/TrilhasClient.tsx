'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TrilhasClient({ initialTrilhas }: { initialTrilhas: any[] }) {
  const [trilhas, setTrilhas] = useState(initialTrilhas)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ titulo: '', descricao: '', ativo: true })
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    // Server action in actions.ts would be better, but we can call a generic API or supabase from client
    // For simplicity, we will use a server action or route. Let's create an API route next.
    try {
      const res = await fetch('/api/admin/lms/trilhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const { data } = await res.json()
        setTrilhas([...trilhas, data])
        setIsModalOpen(false)
        setFormData({ titulo: '', descricao: '', ativo: true })
        router.refresh()
      } else {
        alert('Erro ao salvar trilha.')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Nova Trilha
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {trilhas.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--muted)' }}>Nenhuma trilha cadastrada.</p>
          </div>
        ) : (
          trilhas.map((trilha) => (
            <Link key={trilha.id} href={`/dashboard/treinamentos/${trilha.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text)' }}>
                    {trilha.titulo} {trilha.ativo ? '' : <span style={{ fontSize: '0.7rem', background: 'var(--surface2)', padding: '2px 6px', borderRadius: '4px' }}>Inativo</span>}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>{trilha.descricao}</p>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Gerenciar Módulos →</div>
              </div>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Nova Trilha</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--muted)' }}>Título da Trilha</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--muted)' }}>Descrição</label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', resize: 'vertical' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                />
                Trilha Ativa (visível para vendedores)
              </label>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', color: '#000', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Salvando...' : 'Salvar Trilha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
