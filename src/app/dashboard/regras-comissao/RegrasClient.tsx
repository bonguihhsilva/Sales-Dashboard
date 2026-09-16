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

type CondicaoItem = {
  tipo?: string
  meta?: string
  marca?: string
  valor?: number
  vendor_id?: string
}

type Regra = {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  prioridade: number
  escopo?: string | null
  vendor_id?: string | null
  condicoes: CondicaoItem[] | unknown
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

export default function RegrasClient({
  regras: initialRegras,
  tenantId,
}: {
  regras: Regra[]
  tenantId?: string
}) {
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
      toast.success(atual ? 'Regra desativada' : 'Regra ativada')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao alterar status', { description: message })
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
      toast.success('Regra excluída')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao excluir regra', { description: message })
    } finally {
      setLoading(false)
    }
  }

  async function restaurarMetasPadrao() {
    if (!tenantId) {
      toast.error('Tenant ID não encontrado')
      return
    }

    setLoading(true)
    try {
      const defaultRules = [
        {
          tenant_id: tenantId,
          nome: 'Bônus 1ª Meta',
          descricao: 'Bônus fixo concedido aos vendedores que atingirem a 1ª Meta do período.',
          prioridade: 3,
          ativo: true,
          escopo: 'coletivo',
          vendor_id: null,
          condicoes: [{ tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' }],
          acao: { tipo: 'bonus_fixo', valor: 100 },
        },
        {
          tenant_id: tenantId,
          nome: 'Bônus 2ª Meta',
          descricao: 'Bônus fixo concedido aos vendedores que atingirem a 2ª Meta do período (substitui a 1ª Meta).',
          prioridade: 2,
          ativo: true,
          escopo: 'coletivo',
          vendor_id: null,
          condicoes: [{ tipo: 'atingimento_meta', meta: 'meta2', comparador: '>=' }],
          acao: { tipo: 'bonus_fixo', valor: 150 },
        },
        {
          tenant_id: tenantId,
          nome: 'Bônus 3ª Meta (Super Meta)',
          descricao: 'Bônus fixo máximo concedido aos vendedores que superarem a 3ª Meta do período (substitui as anteriores).',
          prioridade: 1,
          ativo: true,
          escopo: 'coletivo',
          vendor_id: null,
          condicoes: [{ tipo: 'atingimento_meta', meta: 'meta3', comparador: '>=' }],
          acao: { tipo: 'bonus_fixo', valor: 200 },
        },
      ]

      const { data, error } = await supabase
        .from('regras_comissao')
        .insert(defaultRules)
        .select('*')

      if (error) throw error

      setRegras([...(data ?? []), ...regras])
      toast.success('Metas 1, 2 e 3 adicionadas com sucesso!')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao restaurar metas', { description: message })
    } finally {
      setLoading(false)
    }
  }

  const temMetaPreProgramada = regras.some(r =>
    Array.isArray(r.condicoes) && (r.condicoes as CondicaoItem[]).some(c => c.tipo === 'atingimento_meta')
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Banner Informativo sobre Metas e Regras Flexíveis */}
      <div className="p-4 rounded-xl bg-surface-container-high/40 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="text-sm font-bold text-on-surface m-0">Controle Total de Bonificação e Metas</h4>
            <p className="text-xs text-muted-foreground font-mono m-0 mt-0.5 max-w-2xl">
              As <strong>Metas Pré-programadas (1, 2 e 3)</strong> podem ser ativadas ou desativadas a qualquer momento.
              Você também pode criar regras personalizadas por <strong>Valor Total ($)</strong>, <strong>Valor por Cliente (Ativo/Reativado)</strong> e <strong>Metas por Marca</strong>.
            </p>
          </div>
        </div>

        {!temMetaPreProgramada && (
          <button
            type="button"
            disabled={loading}
            onClick={restaurarMetasPadrao}
            className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-on-surface whitespace-nowrap transition-colors"
          >
            + Adicionar Metas 1, 2 e 3
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <SectionTitle>Regras de Comissão Configuradas</SectionTitle>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/regras-comissao/nova')}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-6 py-3 rounded-xl transition-colors font-sans text-sm"
          >
            + Nova Regra
          </button>
        </div>
      </div>

      {regras.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5 border-dashed">
          <p className="text-muted-foreground font-mono mb-4">Nenhuma regra de comissão configurada para este tenant.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={restaurarMetasPadrao}
              className="bg-primary/10 hover:bg-primary/20 border border-primary text-primary font-bold px-4 py-2 rounded-xl transition-colors text-sm font-sans"
            >
              Criar Metas Padrão (1, 2 e 3)
            </button>
            <button
              onClick={() => router.push('/dashboard/regras-comissao/nova')}
              className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-4 py-2 rounded-xl transition-colors text-sm font-sans"
            >
              Criar Regra Personalizada
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {regras.map((regra) => {
            const isIndividual = regra.escopo === 'individual' || Boolean(regra.vendor_id)
            const condArray = (Array.isArray(regra.condicoes) ? regra.condicoes : []) as CondicaoItem[]
            const isMetaPreProgramada = condArray.some(c => c.tipo === 'atingimento_meta')
            const isMarcaRule = condArray.some(c => c.tipo === 'marca' || c.tipo === 'meta_marca') || regra.acao?.tipo === 'comissao_percentual_marca'
            const isClienteRule = regra.acao?.tipo === 'bonus_por_unidade'
            const isVolumeRule = condArray.some(c => c.tipo === 'volume_venda')

            const condCount = condArray.filter(c => c.tipo !== 'vendedor').length

            return (
              <div
                key={regra.id}
                className={`glass-card rounded-2xl p-6 border flex flex-col md:flex-row justify-between md:items-center gap-4 transition-colors ${
                  regra.ativo
                    ? 'border-white/5 hover:bg-surface-container-highest'
                    : 'border-white/5 opacity-50 bg-black/20'
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-on-surface m-0">{regra.nome}</h3>

                    {/* Status Badge */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => toggleAtivo(regra.id, regra.ativo)}
                      className={`text-[0.65rem] font-mono tracking-widest px-2.5 py-1 rounded-md uppercase font-bold transition-all cursor-pointer ${
                        regra.ativo
                          ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                          : 'bg-surface-container-highest text-muted-foreground hover:text-on-surface'
                      }`}
                      title={regra.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      {regra.ativo ? '● Ativo' : '○ Inativo'}
                    </button>

                    {/* Badge de Tipo / Finalidade */}
                    {isMetaPreProgramada && (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 font-bold">
                        Meta Pré-programada
                      </span>
                    )}
                    {isMarcaRule && (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold">
                        Regra de Marca
                      </span>
                    )}
                    {isClienteRule && (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25 font-bold">
                        Bônus Carteira/Cliente
                      </span>
                    )}
                    {isVolumeRule && (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25 font-bold">
                        Volume Total ($)
                      </span>
                    )}

                    {/* Badge de Escopo */}
                    {isIndividual ? (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-bold">
                        <span>👤</span> Individual ({regra.vendor_id})
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10 flex items-center gap-1 font-bold">
                        <span>🌐</span> Coletiva
                      </span>
                    )}

                    <span className="text-[0.65rem] font-mono tracking-widest px-2 py-0.5 rounded bg-surface-container text-muted-foreground">
                      Prioridade: {regra.prioridade}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant max-w-2xl m-0 mb-3">
                    {regra.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex flex-wrap gap-6 pt-2 border-t border-white/5">
                    <div className="text-xs">
                      <strong className="text-muted-foreground mr-2 uppercase tracking-widest font-mono">Condições (Se):</strong>
                      <span className="text-on-surface font-mono">
                        {condCount > 0 ? `${condCount} critério(s)` : 'Sem condições (Incondicional)'}
                      </span>
                    </div>
                    <div className="text-xs">
                      <strong className="text-muted-foreground mr-2 uppercase tracking-widest font-mono">Resultado (Ação):</strong>
                      <span className="text-primary font-mono font-bold">{descricaoAcao(regra.acao)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    disabled={loading}
                    onClick={() => toggleAtivo(regra.id, regra.ativo)}
                    className={`border font-bold px-3 py-1.5 rounded-lg transition-colors text-xs disabled:opacity-50 font-sans ${
                      regra.ativo
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300'
                        : 'bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary'
                    }`}
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
