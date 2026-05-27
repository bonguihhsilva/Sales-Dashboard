'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ModulosClient({ initialModulos, trilhaId }: { initialModulos: any[], trilhaId: string }) {
  const [modulos, setModulos] = useState(initialModulos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ titulo: '', descricao: '', xp_reward: 100 })
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch(`/api/admin/lms/modulos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, trilha_id: trilhaId })
      })
      if (res.ok) {
        const { data } = await res.json()
        setModulos([...modulos, data])
        setIsModalOpen(false)
        setFormData({ titulo: '', descricao: '', xp_reward: 100 })
        router.refresh()
      } else {
        alert('Erro ao salvar módulo.')
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
          + Novo Módulo
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {modulos.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--muted)' }}>Nenhum módulo cadastrado nesta trilha.</p>
          </div>
        ) : (
          modulos.map((modulo, index) => (
            <Link key={modulo.id} href={`/dashboard/treinamentos/${trilhaId}/${modulo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text)' }}>
                    {index + 1}. {modulo.titulo}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>{modulo.descricao}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--meta3, #f5a742)', fontWeight: 800, marginBottom: '5px' }}>+{modulo.xp_reward} XP</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Gerenciar Conteúdo →</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Novo Módulo</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--muted)' }}>Título do Módulo</label>
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
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--muted)' }}>Recompensa (XP ao passar no Quiz)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="10"
                  value={formData.xp_reward}
                  onChange={e => setFormData({ ...formData, xp_reward: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', color: '#000', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Salvando...' : 'Salvar Módulo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
