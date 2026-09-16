'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'
import { toast } from 'sonner'

// v0-2: admitimos os novos tipos sem violar a discrição frouxa do form.
// O motor (commission-rules.ts) valida o discriminator em runtime.
type Condicao = {
  tipo: 'atingimento_meta' | 'volume_venda' | 'marca' | 'volume_marca' | 'meta_marca' | 'vendedor'
  meta?: 'meta1' | 'meta2' | 'meta3'
  marca?: string
  vendor_id?: string
  comparador?: '>=' | '>' | '==' | '<=' | '<'
  valor?: number | string
  meta_valor?: number | string
}

type Acao = {
  tipo: 'comissao_percentual' | 'bonus_fixo' | 'comissao_percentual_marca' | 'bonus_por_unidade'
  valor?: number | string
  marca?: string
  unidade?: 'cliente_ativo' | 'cliente_reativado'
  valor_por_unidade?: number | string
}

type Regra = {
  id?: string
  nome: string
  descricao: string
  ativo: boolean
  prioridade: number
  condicoes: Condicao[]
  acao: Acao
  tenant_id?: string
}

type VendedorOption = { id: string; name: string | null; vendor_id: string | null }

const CONDICAO_LABELS: Record<Condicao['tipo'], string> = {
  atingimento_meta: 'Atingimento de Meta',
  volume_venda: 'Volume de Venda ($)',
  marca: 'Marca — valor vendido ≥',
  volume_marca: 'Volume por Marca',
  meta_marca: 'Meta por Marca',
  vendedor: 'Vendedor Específico',
}

const ACAO_LABELS: Record<Acao['tipo'], string> = {
  comissao_percentual: 'Comissão Percentual (%)',
  bonus_fixo: 'Bônus Fixo ($)',
  comissao_percentual_marca: 'Comissão % por Marca',
  bonus_por_unidade: 'Bônus por Cliente',
}

function toNum(v: number | string | undefined): number {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

export default function RegraFormClient({ regraInicial, tenantId }: { regraInicial?: Regra, tenantId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [nome, setNome] = useState(regraInicial?.nome || '')
  const [descricao, setDescricao] = useState(regraInicial?.descricao || '')
  const [ativo, setAtivo] = useState(regraInicial?.ativo ?? true)
  const [prioridade, setPrioridade] = useState(regraInicial?.prioridade || 1)

  const [vendedores, setVendedores] = useState<VendedorOption[]>([])
  const [condicoes, setCondicoes] = useState<Condicao[]>(regraInicial?.condicoes || [])
  const [acao, setAcao] = useState<Acao>(regraInicial?.acao || { tipo: 'comissao_percentual', valor: 0 })

  // Lista de vendedores do tenant p/ condição "vendedor específico".
  // Se a consulta falhar (RLS) ou não retornar nada, o campo vira texto livre.
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id,name,vendor_id')
      .eq('role', 'vendedor')
      .then(({ data, error }) => {
        if (!error) setVendedores((data ?? []).filter(p => p.vendor_id != null) as VendedorOption[])
      })
  }, [supabase])

  const addCondicao = () => {
    setCondicoes([...condicoes, { tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' }])
  }

  const removeCondicao = (index: number) => {
    setCondicoes(condicoes.filter((_, i) => i !== index))
  }

  const updateCondicao = (index: number, key: keyof Condicao, value: string | number) => {
    const newCondicoes = [...condicoes]
    newCondicoes[index] = { ...newCondicoes[index], [key]: value }
    // Ao trocar o tipo, limpa campos irrelevantes do tipo anterior
    if (key === 'tipo') {
      const tipo = value as Condicao['tipo']
      newCondicoes[index] = { tipo } as Condicao
      if (tipo === 'meta_marca' || tipo === 'vendedor') {
        // campos específicos serão preenchidos pela UI
        if (tipo === 'meta_marca') newCondicoes[index] = { tipo, marca: '' }
        if (tipo === 'vendedor') newCondicoes[index] = { tipo, vendor_id: '' }
      }
    }
    setCondicoes(newCondicoes)
  }

  // Normaliza o payload: números para campos monetários numéricos.
  const normalizeCondicoes = (conds: Condicao[]): Condicao[] =>
    conds.map(c => {
      const out: Condicao = { ...c }
      if (c.valor != null) out.valor = toNum(c.valor)
      if (c.meta_valor != null) out.meta_valor = toNum(c.meta_valor)
      return out
    })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        tenant_id: tenantId,
        nome,
        descricao,
        ativo,
        prioridade: Number(prioridade),
        condicoes: normalizeCondicoes(condicoes),
        acao: {
          ...acao,
          valor: acao.tipo === 'comissao_percentual' || acao.tipo === 'bonus_fixo' ? toNum(acao.valor) : undefined,
          valor_por_unidade: acao.tipo === 'bonus_por_unidade' ? toNum(acao.valor_por_unidade) : undefined,
        }
      }

      if (regraInicial?.id) {
        // Edit
        const { error } = await supabase
          .from('regras_comissao')
          .update(payload)
          .eq('id', regraInicial.id)
        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('regras_comissao')
          .insert(payload)
        if (error) throw error
      }

      router.push('/dashboard/regras-comissao')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao salvar regra', { description: message })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-sans text-sm"
  const labelClass = "block text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2"
  const boxClass = "glass-card rounded-2xl p-card-padding border border-white/5 mb-6"
  const selectClass = `${inputClass} flex-1 min-w-[200px]`

  return (
    <form onSubmit={handleSave} className="w-full max-w-3xl mx-auto flex flex-col gap-2">
      
      <div className={boxClass}>
        <SectionTitle>Detalhes da Regra</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome da Regra</label>
            <input required className={inputClass} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Bônus Meta 1" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Descrição (opcional)</label>
            <textarea className={`${inputClass} resize-y min-h-[100px]`} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Explicação detalhada da regra..." />
          </div>
          <div>
            <label className={labelClass}>Prioridade (1 = mais alta)</label>
            <input type="number" min={1} required className={inputClass} value={prioridade} onChange={e => setPrioridade(parseInt(e.target.value))} />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 text-sm text-on-surface-variant cursor-pointer group font-bold">
              <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-background bg-background" />
              Regra Ativa
            </label>
          </div>
        </div>
      </div>

      <div className={boxClass}>
        <div className="flex justify-between items-center mb-6">
          <SectionTitle>Condições (Se...)</SectionTitle>
          <button type="button" onClick={addCondicao} className="bg-transparent hover:bg-primary/10 border border-primary text-primary font-bold px-4 py-2 rounded-xl transition-colors text-sm">
            + Condição
          </button>
        </div>
        
        {condicoes.length === 0 ? (
          <p className="text-muted-foreground font-mono italic text-sm">Nenhuma condição específica. A regra será aplicada a todas as vendas/vendedores.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {condicoes.map((c, idx) => (
              <div key={idx} className="flex flex-wrap gap-4 items-center bg-surface-container-high/50 p-4 rounded-xl border border-white/5">
                <select className={selectClass} value={c.tipo} onChange={e => updateCondicao(idx, 'tipo', e.target.value)}>
                  {(Object.keys(CONDICAO_LABELS) as Condicao['tipo'][]).map(t => (
                    <option key={t} value={t}>{CONDICAO_LABELS[t]}</option>
                  ))}
                </select>

                {c.tipo === 'atingimento_meta' ? (
                  <select className={selectClass} value={c.meta} onChange={e => updateCondicao(idx, 'meta', e.target.value)}>
                    <option value="meta1">1ª Meta</option>
                    <option value="meta2">2ª Meta</option>
                    <option value="meta3">3ª Meta</option>
                  </select>
                ) : null}

                {/* marca / volume_marca: marca (texto) + comparador + valor */}
                {c.tipo === 'marca' || c.tipo === 'volume_marca' ? (
                  <>
                    <input
                      type="text"
                      className={`${inputClass} flex-1 min-w-[140px]`}
                      placeholder="Marca (ex: Nike)"
                      value={c.marca || ''}
                      onChange={e => updateCondicao(idx, 'marca', e.target.value)}
                    />
                    <select className={selectClass} value={c.comparador} onChange={e => updateCondicao(idx, 'comparador', e.target.value)}>
                      <option value=">=">Maior ou igual a</option>
                      <option value=">">Maior que</option>
                      <option value="<=">Menor ou igual a</option>
                      <option value="<">Menor que</option>
                      <option value="==">Igual a</option>
                    </select>
                    <input
                      type="number"
                      className={`${inputClass} flex-1 min-w-[140px]`}
                      placeholder="Valor ($)"
                      value={c.valor || ''}
                      onChange={e => updateCondicao(idx, 'valor', parseFloat(e.target.value))}
                    />
                    {c.tipo === 'marca' ? (
                      <span className="text-xs font-mono text-muted-foreground w-full">Casa quando o valor vendido da marca atinge o valor acima.</span>
                    ) : null}
                  </>
                ) : null}

                {/* meta_marca: só a marca (a meta vem de goals_brand) */}
                {c.tipo === 'meta_marca' ? (
                  <>
                    <input
                      type="text"
                      className={`${inputClass} flex-1 min-w-[140px]`}
                      placeholder="Marca (ex: Nike)"
                      value={c.marca || ''}
                      onChange={e => updateCondicao(idx, 'marca', e.target.value)}
                    />
                    <span className="text-xs font-mono text-muted-foreground w-full">
                      Casa quando vendas da marca ≥ meta configurada em <strong>Metas por Marca</strong>.
                    </span>
                  </>
                ) : null}

                {/* vendedor: select de vendedores do tenant, com fallback texto */}
                {c.tipo === 'vendedor' ? (
                  vendedores.length > 0 ? (
                    <select className={selectClass} value={c.vendor_id || ''} onChange={e => updateCondicao(idx, 'vendor_id', e.target.value)}>
                      <option value="">Selecione o vendedor</option>
                      {vendedores.map(v => (
                        <option key={v.id} value={v.vendor_id || ''}>{v.name || v.vendor_id}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={`${inputClass} flex-1 min-w-[140px]`}
                      placeholder="ID do vendedor"
                      value={c.vendor_id || ''}
                      onChange={e => updateCondicao(idx, 'vendor_id', e.target.value)}
                    />
                  )
                ) : null}

                {c.tipo === 'volume_venda' || c.tipo === 'atingimento_meta' ? (
                  <select className={selectClass} value={c.comparador} onChange={e => updateCondicao(idx, 'comparador', e.target.value)}>
                    <option value=">=">Maior ou igual a</option>
                    <option value=">">Maior que</option>
                    <option value="==">Igual a</option>
                    <option value="<=">Menor ou igual a</option>
                  </select>
                ) : null}

                {c.tipo === 'volume_venda' ? (
                  <input type="number" className={`${inputClass} flex-1 min-w-[140px]`} placeholder="Valor ($)" value={c.valor || ''} onChange={e => updateCondicao(idx, 'valor', parseFloat(e.target.value))} />
                ) : null}

                <button type="button" onClick={() => removeCondicao(idx)} className="text-error hover:bg-error/10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={boxClass}>
        <SectionTitle>Ação (Então...)</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className={labelClass}>Tipo de Ação</label>
            <select className={inputClass} value={acao.tipo} onChange={e => setAcao({ tipo: e.target.value as Acao['tipo'] })}>
              {(Object.keys(ACAO_LABELS) as Acao['tipo'][]).map(t => (
                <option key={t} value={t}>{ACAO_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {acao.tipo === 'comissao_percentual' || acao.tipo === 'bonus_fixo' ? (
            <div>
              <label className={labelClass}>Valor</label>
              <input required type="number" step="0.01" className={inputClass} value={acao.valor} onChange={e => setAcao({ ...acao, valor: e.target.value })} />
            </div>
          ) : null}

          {acao.tipo === 'comissao_percentual_marca' ? (
            <>
              <div>
                <label className={labelClass}>Marca</label>
                <input required type="text" className={inputClass} placeholder="Ex: Nike" value={acao.marca || ''} onChange={e => setAcao({ ...acao, marca: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Percentual (%)</label>
                <input required type="number" step="0.01" className={inputClass} value={acao.valor} onChange={e => setAcao({ ...acao, valor: e.target.value })} />
              </div>
            </>
          ) : null}

          {acao.tipo === 'bonus_por_unidade' ? (
            <>
              <div>
                <label className={labelClass}>Unidade</label>
                <select className={inputClass} value={acao.unidade || 'cliente_ativo'} onChange={e => setAcao({ ...acao, unidade: e.target.value as Acao['unidade'] })}>
                  <option value="cliente_ativo">Cliente ativo no período</option>
                  <option value="cliente_reativado">Cliente reativado (6+ meses)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Valor por Cliente</label>
                <input required type="number" step="0.01" className={inputClass} value={acao.valor_por_unidade || ''} onChange={e => setAcao({ ...acao, valor_por_unidade: e.target.value })} />
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex gap-4 justify-end mt-4">
        <button type="button" onClick={() => router.back()} disabled={loading} className="py-3 px-8 bg-transparent border border-white/10 hover:bg-white/5 text-on-surface rounded-xl transition-colors font-bold disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="py-3 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-xl transition-colors font-bold disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar Regra'}
        </button>
      </div>

    </form>
  )
}