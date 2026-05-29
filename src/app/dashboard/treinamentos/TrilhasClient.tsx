'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTrilhaAction } from './admin/actions'

export default function TrilhasClient({ initialTrilhas }: { initialTrilhas: any[] }) {
  const [trilhas, setTrilhas] = useState(initialTrilhas)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ titulo: '', descricao: '', ativo: true })
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await createTrilhaAction(formData)
      if (res && res.error) {
        throw new Error(res.error)
      }
      setIsModalOpen(false)
      setFormData({ titulo: '', descricao: '', ativo: true })
      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert('Erro ao salvar trilha: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-6 py-3 rounded-xl transition-colors"
        >
          + Nova Trilha
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {trilhas.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5 border-dashed">
            <p className="text-muted-foreground font-mono">Nenhuma trilha cadastrada.</p>
          </div>
        ) : (
          trilhas.map((trilha) => (
            <Link key={trilha.id} href={`/dashboard/treinamentos/${trilha.id}`}>
              <div className="glass-card hover:bg-surface-container-highest transition-colors border border-white/5 p-6 rounded-2xl flex justify-between items-center group cursor-pointer">
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2 flex items-center gap-3">
                    {trilha.titulo}
                    {!trilha.ativo && (
                      <span className="text-[0.65rem] font-mono tracking-widest bg-error/10 text-error px-2 py-1 rounded-md uppercase">
                        Inativo
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-on-surface-variant max-w-2xl">{trilha.descricao}</p>
                </div>
                <div className="text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Gerenciar Módulos <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-high border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-display-sm text-on-surface mb-6">Nova Trilha</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Título da Trilha</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors resize-y"
                />
              </div>
              <label className="flex items-center gap-3 text-sm text-on-surface-variant cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-background bg-background"
                />
                Trilha Ativa (visível para vendedores)
              </label>
              
              <div className="flex gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 px-4 bg-transparent border border-white/10 hover:bg-white/5 text-on-surface rounded-xl transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl transition-colors font-bold disabled:opacity-50"
                >
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
