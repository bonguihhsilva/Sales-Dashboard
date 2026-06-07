'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Regra = {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  prioridade: number
  condicoes: any
  acao: any
}

export default function RegrasClient({ regras: initialRegras }: { regras: Regra[] }) {
  const [regras, setRegras] = useState(initialRegras)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleAtivo(id: string, atual: boolean) {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('regras_comissao')
        .update({ ativo: !atual })
        .eq('id', id)
      
      if (error) throw error
      setRegras(regras.map(r => r.id === id ? { ...r, ativo: !atual } : r))
      router.refresh()
    } catch (err: any) {
      toast.error('Erro', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function apagarRegra(id: string) {
    if (!confirm('Tem certeza que deseja apagar esta regra?')) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('regras_comissao')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setRegras(regras.filter(r => r.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error('Erro', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle>Regras Configuradas</SectionTitle>
        <button
          onClick={() => router.push('/dashboard/regras-comissao/nova')}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-6 py-3 rounded-xl transition-colors"
        >
          + Nova Regra
        </button>
      </div>

      {regras.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5 border-dashed">
          <p className="text-muted-foreground font-mono mb-4">Nenhuma regra de comissão configurada.</p>
          <button
            onClick={() => router.push('/dashboard/regras-comissao/nova')}
            className="bg-transparent hover:bg-primary/10 border border-primary text-primary font-bold px-4 py-2 rounded-xl transition-colors text-sm"
          >
            Criar a primeira regra
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {regras.map((regra) => (
            <div key={regra.id} className={`glass-card rounded-2xl p-6 border flex justify-between items-center transition-colors ${regra.ativo ? 'border-white/5 hover:bg-surface-container-highest' : 'border-white/5 opacity-60'}`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-on-surface m-0">{regra.nome}</h3>
                  <span className={`text-[0.65rem] font-mono tracking-widest px-2 py-1 rounded-md uppercase ${regra.ativo ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-muted-foreground'}`}>
                    {regra.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="text-[0.65rem] font-mono tracking-widest px-2 py-1 rounded-md uppercase bg-surface-container text-muted-foreground">
                    Prioridade: {regra.prioridade}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant max-w-2xl m-0">
                  {regra.descricao || 'Sem descrição'}
                </p>
                
                <div className="mt-4 flex gap-6">
                  <div className="text-xs">
                    <strong className="text-muted-foreground mr-2 uppercase tracking-widest font-mono">Condição:</strong>
                    <span className="text-on-surface-variant">{Array.isArray(regra.condicoes) ? `${regra.condicoes.length} configurada(s)` : 'Nenhuma'}</span>
                  </div>
                  <div className="text-xs">
                    <strong className="text-muted-foreground mr-2 uppercase tracking-widest font-mono">Ação:</strong>
                    <span className="text-on-surface-variant">{regra.acao?.tipo === 'comissao_percentual' ? `${regra.acao.valor}% sobre vendas` : (regra.acao?.tipo === 'bonus_fixo' ? `Bônus de $${regra.acao.valor}` : 'Personalizada')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  disabled={loading}
                  onClick={() => toggleAtivo(regra.id, regra.ativo)}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-on-surface font-bold px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50"
                >
                  {regra.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  disabled={loading}
                  onClick={() => router.push(`/dashboard/regras-comissao/${regra.id}`)}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-on-surface font-bold px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  disabled={loading}
                  onClick={() => apagarRegra(regra.id)}
                  className="bg-error/10 hover:bg-error/20 border border-error/20 text-error font-bold px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
