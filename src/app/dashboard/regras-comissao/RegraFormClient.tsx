'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'
import { toast } from 'sonner'
import type { RegraEscopo } from '@/lib/commission-rules'

type Condicao = {
  tipo: 'atingimento_meta' | 'volume_venda' | 'marca' | 'volume_marca' | 'meta_marca'
  meta?: 'meta1' | 'meta2' | 'meta3'
  marca?: string
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
  escopo?: RegraEscopo | string
  vendor_id?: string | null
  condicoes: Array<Condicao | { tipo: string; vendor_id?: string }>
  acao: Acao
  tenant_id?: string
}

type VendedorOption = { id: string; name: string | null; vendor_id: string | null }

const CONDICAO_LABELS: Record<Condicao['tipo'], string> = {
  atingimento_meta: '🎯 Atingimento de Meta (Meta 1, 2 ou 3)',
  volume_venda: '💵 Volume de Venda Geral ($)',
  marca: '🏷️ Volume por Marca ($)',
  meta_marca: '🏁 Meta por Marca (Configurada em Metas por Marca)',
  volume_marca: '🏷️ Volume por Marca ($)',
}

const ACAO_LABELS: Record<Acao['tipo'], string> = {
  comissao_percentual: '📈 Comissão Percentual (%) sobre Vendas Gerais',
  bonus_fixo: '🏆 Bônus Fixo ($)',
  comissao_percentual_marca: '🏷️ Comissão % por Marca Específica',
  bonus_por_unidade: '👥 Bônus por Cliente (Ativo / Reativado)',
}

function toNum(v: number | string | undefined): number {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

export default function RegraFormClient({ regraInicial, tenantId }: { regraInicial?: Regra, tenantId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  // 1. Detalhes da Regra
  const [nome, setNome] = useState(regraInicial?.nome || '')
  const [descricao, setDescricao] = useState(regraInicial?.descricao || '')
  const [ativo, setAtivo] = useState(regraInicial?.ativo ?? true)
  const [prioridade, setPrioridade] = useState(regraInicial?.prioridade || 1)

  // 2. Escopo da Regra (Coletiva vs Individual)
  const legacyVendedorCond = Array.isArray(regraInicial?.condicoes)
    ? (regraInicial?.condicoes.find(c => c.tipo === 'vendedor') as { vendor_id?: string } | undefined)
    : undefined

  const initialEscopo: RegraEscopo =
    regraInicial?.escopo === 'individual' || Boolean(regraInicial?.vendor_id) || Boolean(legacyVendedorCond?.vendor_id)
      ? 'individual'
      : 'coletivo'

  const initialVendorId: string =
    regraInicial?.vendor_id || legacyVendedorCond?.vendor_id || ''

  const [escopo, setEscopo] = useState<RegraEscopo>(initialEscopo)
  const [vendorId, setVendorId] = useState<string>(initialVendorId)
  const [vendedores, setVendedores] = useState<VendedorOption[]>([])

  // 3. Condições a Cumprir (filtra qualquer condição legada de vendedor)
  const initialCondicoes: Condicao[] = Array.isArray(regraInicial?.condicoes)
    ? (regraInicial.condicoes.filter(c => c.tipo !== 'vendedor') as Condicao[])
    : []
  const [condicoes, setCondicoes] = useState<Condicao[]>(initialCondicoes)

  // 4. Resultado da Regra (Ação)
  const [acao, setAcao] = useState<Acao>(regraInicial?.acao || { tipo: 'comissao_percentual', valor: 0 })

  // Carrega lista de vendedores do tenant
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id,name,vendor_id')
      .eq('role', 'vendedor')
      .then(({ data, error }) => {
        if (!error && data) {
          setVendedores(data.filter(p => p.vendor_id != null) as VendedorOption[])
        }
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

    if (key === 'tipo') {
      const tipo = value as Condicao['tipo']
      if (tipo === 'atingimento_meta') {
        newCondicoes[index] = { tipo, meta: 'meta1', comparador: '>=' }
      } else if (tipo === 'volume_venda') {
        newCondicoes[index] = { tipo, comparador: '>=', valor: 0 }
      } else if (tipo === 'marca' || tipo === 'volume_marca') {
        newCondicoes[index] = { tipo: 'marca', marca: '', comparador: '>=', valor: 0 }
      } else if (tipo === 'meta_marca') {
        newCondicoes[index] = { tipo, marca: '' }
      }
    }
    setCondicoes(newCondicoes)
  }

  const normalizeCondicoes = (conds: Condicao[]): Condicao[] =>
    conds.map(c => {
      const out: Condicao = { ...c }
      if (c.valor != null) out.valor = toNum(c.valor)
      if (c.meta_valor != null) out.meta_valor = toNum(c.meta_valor)
      return out
    })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (escopo === 'individual' && (!vendorId || vendorId.trim() === '')) {
      toast.error('Selecione ou informe o vendedor para a regra individual.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        tenant_id: tenantId,
        nome,
        descricao,
        ativo,
        prioridade: Number(prioridade),
        escopo,
        vendor_id: escopo === 'individual' ? vendorId.trim() : null,
        condicoes: normalizeCondicoes(condicoes),
        acao: {
          ...acao,
          valor: acao.tipo === 'comissao_percentual' || acao.tipo === 'bonus_fixo' || acao.tipo === 'comissao_percentual_marca' ? toNum(acao.valor) : undefined,
          valor_por_unidade: acao.tipo === 'bonus_por_unidade' ? toNum(acao.valor_por_unidade) : undefined,
        }
      }

      if (regraInicial?.id) {
        const { error } = await supabase
          .from('regras_comissao')
          .update(payload)
          .eq('id', regraInicial.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('regras_comissao')
          .insert(payload)
        if (error) throw error
      }

      toast.success('Regra salva com sucesso!')
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

      {/* ── 1. DETALHES DA REGRA ── */}
      <div className={boxClass}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold">1</span>
          <SectionTitle>Detalhes da Regra</SectionTitle>
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-4">Informações gerais de identificação e prioridade.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome da Regra</label>
            <input required className={inputClass} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Bônus Meta 1 ou Campanha Linha Premium" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Descrição (opcional)</label>
            <textarea className={`${inputClass} resize-y min-h-[90px]`} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva os objetivos e condições gerais desta regra..." />
          </div>
          <div>
            <label className={labelClass}>Prioridade (1 = mais alta)</label>
            <input type="number" min={1} required className={inputClass} value={prioridade} onChange={e => setPrioridade(parseInt(e.target.value) || 1)} />
            <span className="text-[11px] font-mono text-muted-foreground mt-1 block">Regras de menor número vencem em caso de conflito de percentual.</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-high/40 border border-white/5 self-start mt-4">
            <input
              type="checkbox"
              id="ativo-checkbox"
              checked={ativo}
              onChange={e => setAtivo(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-background bg-background cursor-pointer"
            />
            <label htmlFor="ativo-checkbox" className="text-sm font-bold text-on-surface cursor-pointer select-none">
              Regra Ativa no Cálculo
            </label>
          </div>
        </div>
      </div>

      {/* ── 2. ESCOPO DA REGRA (COLETIVA OU INDIVIDUAL) ── */}
      <div className={boxClass}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold">2</span>
          <SectionTitle>Público-Alvo / Escopo</SectionTitle>
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-4">Escolha se esta regra se aplica a todos os vendedores ou exclusivamente a um vendedor específico.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <button
            type="button"
            onClick={() => setEscopo('coletivo')}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
              escopo === 'coletivo'
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                : 'bg-surface-container-high/30 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-on-surface flex items-center gap-2">
                <span>🌐</span> Regra Coletiva
              </span>
              {escopo === 'coletivo' && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary text-on-primary">ATIVO</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono m-0">
              Aplica-se a <strong>todos os vendedores</strong> do time simultaneamente.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setEscopo('individual')}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
              escopo === 'individual'
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                : 'bg-surface-container-high/30 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-on-surface flex items-center gap-2">
                <span>👤</span> Regra Individual
              </span>
              {escopo === 'individual' && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary text-on-primary">ATIVO</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono m-0">
              Aplica-se <strong>exclusivamente</strong> a um vendedor selecionado.
            </p>
          </button>
        </div>

        {escopo === 'individual' && (
          <div className="mt-5 p-4 rounded-xl bg-surface-container-high/60 border border-primary/20 flex flex-col gap-2 animate-fadeIn">
            <label className={labelClass}>Vendedor Selecionado *</label>
            {vendedores.length > 0 ? (
              <select
                required
                className={inputClass}
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
              >
                <option value="">Selecione um vendedor da lista...</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.vendor_id || ''}>
                    {v.name || v.vendor_id} {v.vendor_id ? `(ID: ${v.vendor_id})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                type="text"
                className={inputClass}
                placeholder="Informe o identificador do vendedor (ex: v1, joao)"
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
              />
            )}
            <span className="text-[11px] font-mono text-muted-foreground">
              Esta regra só será avaliada e computada para o vendedor acima.
            </span>
          </div>
        )}
      </div>

      {/* ── 3. CONDIÇÕES A SEREM CUMPRIDAS ── */}
      <div className={boxClass}>
        <div className="flex justify-between items-start mb-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold">3</span>
              <SectionTitle>Condições a Cumprir (Se...)</SectionTitle>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1 mb-4">
              Critérios de atingimento. Se não houver condições, a regra será aplicada incondicionalmente ao público selecionado.
            </p>
          </div>
          <button
            type="button"
            onClick={addCondicao}
            className="bg-transparent hover:bg-primary/10 border border-primary text-primary font-bold px-4 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            + Adicionar Condição
          </button>
        </div>

        {condicoes.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface-container-high/20 border border-white/5 text-center">
            <p className="text-muted-foreground font-mono text-xs m-0">
              Sem condições adicionais: o resultado será concedido automaticamente ao público escolhido no passo 2.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            {condicoes.map((c, idx) => (
              <div key={idx} className="flex flex-wrap gap-3 items-center bg-surface-container-high/50 p-4 rounded-xl border border-white/5">
                <select className={selectClass} value={c.tipo} onChange={e => updateCondicao(idx, 'tipo', e.target.value)}>
                  {(Object.keys(CONDICAO_LABELS) as Condicao['tipo'][]).map(t => (
                    <option key={t} value={t}>{CONDICAO_LABELS[t]}</option>
                  ))}
                </select>

                {c.tipo === 'atingimento_meta' ? (
                  <>
                    <select className={selectClass} value={c.meta} onChange={e => updateCondicao(idx, 'meta', e.target.value)}>
                      <option value="meta1">1ª Meta</option>
                      <option value="meta2">2ª Meta</option>
                      <option value="meta3">3ª Meta</option>
                    </select>
                    <select className={selectClass} value={c.comparador} onChange={e => updateCondicao(idx, 'comparador', e.target.value)}>
                      <option value=">=">Maior ou igual a (≥)</option>
                      <option value=">">Maior que (&gt;)</option>
                      <option value="==">Igual a (==)</option>
                      <option value="<=">Menor ou igual a (≤)</option>
                    </select>
                  </>
                ) : null}

                {c.tipo === 'volume_venda' ? (
                  <>
                    <select className={selectClass} value={c.comparador} onChange={e => updateCondicao(idx, 'comparador', e.target.value)}>
                      <option value=">=">Maior ou igual a (≥)</option>
                      <option value=">">Maior que (&gt;)</option>
                      <option value="==">Igual a (==)</option>
                      <option value="<=">Menor ou igual a (≤)</option>
                      <option value="<">Menor que (&lt;)</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      className={`${inputClass} flex-1 min-w-[140px]`}
                      placeholder="Valor Total ($)"
                      value={c.valor ?? ''}
                      onChange={e => updateCondicao(idx, 'valor', parseFloat(e.target.value))}
                    />
                  </>
                ) : null}

                {(c.tipo === 'marca' || c.tipo === 'volume_marca') ? (
                  <>
                    <input
                      type="text"
                      className={`${inputClass} flex-1 min-w-[140px]`}
                      placeholder="Nome da Marca (ex: Nike)"
                      value={c.marca || ''}
                      onChange={e => updateCondicao(idx, 'marca', e.target.value)}
                    />
                    <select className={selectClass} value={c.comparador} onChange={e => updateCondicao(idx, 'comparador', e.target.value)}>
                      <option value=">=">Maior ou igual a (≥)</option>
                      <option value=">">Maior que (&gt;)</option>
                      <option value="==">Igual a (==)</option>
                      <option value="<=">Menor ou igual a (≤)</option>
                      <option value="<">Menor que (&lt;)</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      className={`${inputClass} flex-1 min-w-[140px]`}
                      placeholder="Valor ($)"
                      value={c.valor ?? ''}
                      onChange={e => updateCondicao(idx, 'valor', parseFloat(e.target.value))}
                    />
                  </>
                ) : null}

                {c.tipo === 'meta_marca' ? (
                  <>
                    <input
                      type="text"
                      className={`${inputClass} flex-1 min-w-[160px]`}
                      placeholder="Nome da Marca (ex: Apple)"
                      value={c.marca || ''}
                      onChange={e => updateCondicao(idx, 'marca', e.target.value)}
                    />
                    <span className="text-xs font-mono text-muted-foreground w-full">
                      Casa quando o vendedor atingir a meta da marca configurada em <strong>Metas por Marca</strong>.
                    </span>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => removeCondicao(idx)}
                  className="text-error hover:bg-error/10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
                  title="Remover condição"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. RESULTADO DA REGRA (AÇÃO) ── */}
      <div className={boxClass}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold">4</span>
          <SectionTitle>Resultado da Regra (Ação / Então...)</SectionTitle>
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-4">A comissão ou bônus concedido quando as condições forem cumpridas.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Tipo de Recompensa</label>
            <select
              className={inputClass}
              value={acao.tipo}
              onChange={e => setAcao({ tipo: e.target.value as Acao['tipo'] })}
            >
              {(Object.keys(ACAO_LABELS) as Acao['tipo'][]).map(t => (
                <option key={t} value={t}>{ACAO_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {acao.tipo === 'comissao_percentual' ? (
            <div>
              <label className={labelClass}>Percentual de Comissão (%)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                max="100"
                className={inputClass}
                placeholder="Ex: 5 para 5%"
                value={acao.valor ?? ''}
                onChange={e => setAcao({ ...acao, valor: e.target.value })}
              />
              <span className="text-[11px] font-mono text-muted-foreground mt-1 block">Substitui o percentual padrão caso seja a regra de maior prioridade.</span>
            </div>
          ) : null}

          {acao.tipo === 'bonus_fixo' ? (
            <div>
              <label className={labelClass}>Valor do Bônus Fixo ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="Ex: 250"
                value={acao.valor ?? ''}
                onChange={e => setAcao({ ...acao, valor: e.target.value })}
              />
              <span className="text-[11px] font-mono text-muted-foreground mt-1 block">Bônus monetário cumulativo pago ao vendedor.</span>
            </div>
          ) : null}

          {acao.tipo === 'comissao_percentual_marca' ? (
            <>
              <div>
                <label className={labelClass}>Marca Específica</label>
                <input
                  required
                  type="text"
                  className={inputClass}
                  placeholder="Ex: Nike"
                  value={acao.marca || ''}
                  onChange={e => setAcao({ ...acao, marca: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Percentual sobre a Marca (%)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className={inputClass}
                  placeholder="Ex: 7"
                  value={acao.valor ?? ''}
                  onChange={e => setAcao({ ...acao, valor: e.target.value })}
                />
              </div>
            </>
          ) : null}

          {acao.tipo === 'bonus_por_unidade' ? (
            <>
              <div>
                <label className={labelClass}>Métrica de Carteira</label>
                <select
                  className={inputClass}
                  value={acao.unidade || 'cliente_ativo'}
                  onChange={e => setAcao({ ...acao, unidade: e.target.value as Acao['unidade'] })}
                >
                  <option value="cliente_ativo">Cliente ativo no período</option>
                  <option value="cliente_reativado">Cliente reativado (ausente há 6+ meses)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Valor por Cliente ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  placeholder="Ex: 15"
                  value={acao.valor_por_unidade ?? ''}
                  onChange={e => setAcao({ ...acao, valor_por_unidade: e.target.value })}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end mt-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="py-3 px-8 bg-transparent border border-white/10 hover:bg-white/5 text-on-surface rounded-xl transition-colors font-bold disabled:opacity-50 font-sans"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-8 bg-primary hover:bg-primary/90 text-on-primary rounded-xl transition-colors font-bold disabled:opacity-50 font-sans"
        >
          {loading ? 'Salvando...' : 'Salvar Regra'}
        </button>
      </div>

    </form>
  )
}
