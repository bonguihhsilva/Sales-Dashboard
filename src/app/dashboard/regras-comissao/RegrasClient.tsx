'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Acao =
  | { tipo: 'comissao_percentual' | 'bonus_fixo'; valor?: number }
  | { tipo: 'comissao_percentual_marca'; marca?: string; valor?: number }
  | { tipo: 'bonus_por_unidade'; unidade?: 'cliente_ativo' | 'cliente_reativado'; valor_por_unidade?: number }
  | null

type Regra = {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  prioridade: number
  escopo?: string | null
  vendor_id?: string | null
  condicoes: unknown
  acao: Acao
}

function descricaoAcao(a: Acao): string {
  if (!a?.tipo) return 'Personalizada'
  switch (a.tipo) {
    case 'comissao_percentual': return `${a.valor}% sobre vendas gerais`
    case 'bonus_fixo': return `Bônus fixo de $${a.valor}`
    case 'comissao_percentual_marca': return `${a.valor}% na marca ${a.marca || '—'}`
    case 'bonus_por_unidade':
      return `Bônus de $${a.valor_por_unidade} por ${a.unidade === 'cliente_reativado' ? 'cliente reativado' : 'cliente ativo'}`
    default: return 'Personalizada'
  }
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro', { description: message })
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro', { description: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle>Regras de Comissão Configuradas</SectionTitle>
        <button
          onClick={() => router.push('/dashboard/regras-comissao/nova')}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-6 py-3 rounded-xl transition-colors font-sans"
        >
          + Nova Regra
        </button>
      </div>

      {regras.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5 border-dashed">
          <p className="text-muted-foreground font-mono mb-4">Nenhuma regra de comissão configurada.</p>
          <button
            onClick={() => router.push('/dashboard/regras-comissao/nova')}
            className="bg-transparent hover:bg-primary/10 border border-primary text-primary font-bold px-4 py-2 rounded-xl transition-colors text-sm font-sans"
          >
            Criar a primeira regra
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {regras.map((regra) => {
            const isIndividual = regra.escopo === 'individual' || Boolean(regra.vendor_id)
            const condCount = Array.isArray(regra.condicoes)
              ? regra.condicoes.filter(c => c.tipo !== 'vendedor').length
              : 0

            return (
              <div
                key={regra.id}
                className={`glass-card rounded-2xl p-6 border flex flex-col md:flex-row justify-between md:items-center gap-4 transition-colors ${
                  regra.ativo ? 'border-white/5 hover:bg-surface-container-highest' : 'border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h3 className="text-lg font-bold text-on-surface m-0">{regra.nome}</h3>

                    <span
                      className={`text-[0.65rem] font-mono tracking-widest px-2 py-1 rounded-md uppercase font-bold ${
                        regra.ativo
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-surface-container-highest text-muted-foreground'
                      }`}
                    >
                      {regra.ativo ? 'Ativo' : 'Inativo'}
                    </span>

                    {/* Badge de Escopo (Passo 2) */}
                    {isIndividual ? (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2.5 py-1 rounded-md uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-bold">
                        <span>👤</span> Individual: {regra.vendor_id || 'ID não informado'}
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2.5 py-1 rounded-md uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                        <span>🌐</span> Coletiva (Todos)
                      </span>
                    )}

                    <span className="text-[0.65rem] font-mono tracking-widest px-2 py-1 rounded-md uppercase bg-surface-container text-muted-foreground">
                      Prioridade: {regra.prioridade}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant max-w-2xl m-0 mb-3">
                    {regra.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex flex-wrap gap-6 pt-2 border-t border-white/5">
                    <div className="text-xs">
                      <strong className="text-muted-foreground mr-2 uppercase tracking-widest font-mono">Condições (Se):</strong>
                      <span className="text-on-surface font-mono">
                        {condCount > 0 ? `${condCount} critério(s) configurado(s)` : 'Sem condições (Sempre)'}
                      </span>
                    </div>
                    <div className="text-xs">
                      <strong className="text-muted-foreground mr-2 uppercase tracking-widest font-mono">Resultado (Ação):</strong>
                      <span className="text-primary font-mono font-bold">{descricaoAcao(regra.acao)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 self-end md:self-center shrink-0">
                  <button
                    disabled={loading}
                    onClick={() => toggleAtivo(regra.id, regra.ativo)}
                    className="bg-transparent hover:bg-white/5 border border-white/10 text-on-surface font-bold px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 font-sans"
                  >
                    {regra.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => router.push(`/dashboard/regras-comissao/${regra.id}`)}
                    className="bg-transparent hover:bg-white/5 border border-white/10 text-on-surface font-bold px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 font-sans"
                  >
                    Editar
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => apagarRegra(regra.id)}
                    className="bg-error/10 hover:bg-error/20 border border-error/20 text-error font-bold px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 font-sans"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
