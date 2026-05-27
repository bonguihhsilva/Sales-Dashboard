'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'

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
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '6px', 
    border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', 
    fontSize: '0.85rem', fontFamily: 'Syne, sans-serif'
  }

  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, 
    color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase' as const, 
    letterSpacing: '0.05em', fontFamily: 'DM Mono, monospace'
  }

  const boxStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)', 
    borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem'
  }

  return (
    <form onSubmit={handleSave} style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={boxStyle}>
        <SectionTitle>Detalhes da Regra</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Nome da Regra</label>
            <input required style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Bônus Meta 1" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descrição (opcional)</label>
            <textarea style={{ ...inputStyle, minHeight: '80px' }} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Explicação detalhada da regra..." />
          </div>
          <div>
            <label style={labelStyle}>Prioridade (1 = mais alta)</label>
            <input type="number" min={1} required style={inputStyle} value={prioridade} onChange={e => setPrioridade(parseInt(e.target.value))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
              Regra Ativa
            </label>
          </div>
        </div>
      </div>

      <div style={boxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <SectionTitle>Condições (Se...)</SectionTitle>
          <button type="button" onClick={addCondicao} style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>+ Condição</button>
        </div>
        
        {condicoes.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Nenhuma condição específica. A regra será aplicada a todas as vendas/vendedores.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {condicoes.map((cond, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <select style={inputStyle} value={cond.tipo} onChange={e => updateCondicao(idx, 'tipo', e.target.value)}>
                  <option value="atingimento_meta">Atingimento de Meta</option>
                  <option value="volume_venda">Volume de Venda ($)</option>
                </select>
                
                {cond.tipo === 'atingimento_meta' ? (
                  <select style={inputStyle} value={cond.meta} onChange={e => updateCondicao(idx, 'meta', e.target.value)}>
                    <option value="meta1">1ª Meta</option>
                    <option value="meta2">2ª Meta</option>
                    <option value="meta3">3ª Meta</option>
                  </select>
                ) : null}

                <select style={inputStyle} value={cond.comparador} onChange={e => updateCondicao(idx, 'comparador', e.target.value)}>
                  <option value=">=">Maior ou igual a</option>
                  <option value=">">Maior que</option>
                  <option value="==">Igual a</option>
                  <option value="<=">Menor ou igual a</option>
                </select>

                {cond.tipo === 'volume_venda' ? (
                  <input type="number" style={inputStyle} placeholder="Valor ($)" value={cond.valor || ''} onChange={e => updateCondicao(idx, 'valor', parseFloat(e.target.value))} />
                ) : null}

                <button type="button" onClick={() => removeCondicao(idx)} style={{ background: 'transparent', color: 'var(--destructive, #ef4444)', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 8px' }}>&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={boxStyle}>
        <SectionTitle>Ação (Então...)</SectionTitle>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Tipo de Ação</label>
            <select style={inputStyle} value={acao.tipo} onChange={e => setAcao({ ...acao, tipo: e.target.value })}>
              <option value="comissao_percentual">Comissão Percentual (%)</option>
              <option value="bonus_fixo">Bônus Fixo ($)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Valor</label>
            <input required type="number" step="0.01" style={inputStyle} value={acao.valor} onChange={e => setAcao({ ...acao, valor: e.target.value })} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.back()} disabled={loading} style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Salvando...' : 'Salvar Regra'}
        </button>
      </div>

    </form>
  )
}
