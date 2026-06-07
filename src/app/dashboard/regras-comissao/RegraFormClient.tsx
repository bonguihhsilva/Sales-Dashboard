'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'
import { toast } from 'sonner'

type Regra = {
  id?: string
  nome: string
  descricao: string
  ativo: boolean
  prioridade: number
  condicoes: any[]
  acao: any
  tenant_id?: string
}

export default function RegraFormClient({ regraInicial, tenantId }: { regraInicial?: Regra, tenantId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [nome, setNome] = useState(regraInicial?.nome || '')
  const [descricao, setDescricao] = useState(regraInicial?.descricao || '')
  const [ativo, setAtivo] = useState(regraInicial?.ativo ?? true)
  const [prioridade, setPrioridade] = useState(regraInicial?.prioridade || 1)
  
  const [condicoes, setCondicoes] = useState<any[]>(regraInicial?.condicoes || [])
  const [acao, setAcao] = useState<any>(regraInicial?.acao || { tipo: 'comissao_percentual', valor: 0 })

  const addCondicao = () => {
    setCondicoes([...condicoes, { tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' }])
  }

  const removeCondicao = (index: number) => {
    setCondicoes(condicoes.filter((_, i) => i !== index))
  }

  const updateCondicao = (index: number, key: string, value: any) => {
    const newCondicoes = [...condicoes]
    newCondicoes[index] = { ...newCondicoes[index], [key]: value }
    setCondicoes(newCondicoes)
  }

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
        condicoes,
        acao: { ...acao, valor: Number(acao.valor) }
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
    } catch (err: any) {
      toast.error('Erro ao salvar regra', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-sans text-sm"
  const labelClass = "block text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2"
  const boxClass = "glass-card rounded-2xl p-card-padding border border-white/5 mb-6"

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
            {condicoes.map((cond, idx) => (
              <div key={idx} className="flex flex-wrap gap-4 items-center bg-surface-container-high/50 p-4 rounded-xl border border-white/5">
                <select className={`${inputClass} flex-1 min-w-[200px]`} value={cond.tipo} onChange={e => updateCondicao(idx, 'tipo', e.target.value)}>
                  <option value="atingimento_meta">Atingimento de Meta</option>
                  <option value="volume_venda">Volume de Venda ($)</option>
                </select>
                
                {cond.tipo === 'atingimento_meta' ? (
                  <select className={`${inputClass} flex-1 min-w-[150px]`} value={cond.meta} onChange={e => updateCondicao(idx, 'meta', e.target.value)}>
                    <option value="meta1">1ª Meta</option>
                    <option value="meta2">2ª Meta</option>
                    <option value="meta3">3ª Meta</option>
                  </select>
                ) : null}

                <select className={`${inputClass} flex-1 min-w-[200px]`} value={cond.comparador} onChange={e => updateCondicao(idx, 'comparador', e.target.value)}>
                  <option value=">=">Maior ou igual a</option>
                  <option value=">">Maior que</option>
                  <option value="==">Igual a</option>
                  <option value="<=">Menor ou igual a</option>
                </select>

                {cond.tipo === 'volume_venda' ? (
                  <input type="number" className={`${inputClass} flex-1 min-w-[150px]`} placeholder="Valor ($)" value={cond.valor || ''} onChange={e => updateCondicao(idx, 'valor', parseFloat(e.target.value))} />
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
            <select className={inputClass} value={acao.tipo} onChange={e => setAcao({ ...acao, tipo: e.target.value })}>
              <option value="comissao_percentual">Comissão Percentual (%)</option>
              <option value="bonus_fixo">Bônus Fixo ($)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Valor</label>
            <input required type="number" step="0.01" className={inputClass} value={acao.valor} onChange={e => setAcao({ ...acao, valor: e.target.value })} />
          </div>
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
