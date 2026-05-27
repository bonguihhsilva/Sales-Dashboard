'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SectionTitle } from '@/components/ui'
import { useRouter } from 'next/navigation'

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
      alert(err.message)
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
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <SectionTitle>Regras Configuradas</SectionTitle>
        <button
          onClick={() => router.push('/dashboard/regras-comissao/nova')}
          style={{
            background: 'var(--accent)', color: 'var(--bg)', border: 'none',
            padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', fontFamily: 'Syne, sans-serif'
          }}
        >
          + Nova Regra
        </button>
      </div>

      {regras.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Nenhuma regra de comissão configurada.</p>
          <button
            onClick={() => router.push('/dashboard/regras-comissao/nova')}
            style={{
              background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)',
              padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer'
            }}
          >
            Criar a primeira regra
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {regras.map((regra) => (
            <div key={regra.id} style={{ 
              background: 'var(--surface)', 
              border: `1px solid ${regra.ativo ? 'var(--border)' : 'var(--border)'}`, 
              opacity: regra.ativo ? 1 : 0.6,
              borderRadius: '8px', 
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{regra.nome}</h3>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: regra.ativo ? 'var(--meta1)' : 'var(--muted)',
                    color: 'var(--bg)'
                  }}>
                    {regra.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>
                    Prioridade: {regra.prioridade}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, maxWidth: '600px' }}>
                  {regra.descricao || 'Sem descrição'}
                </p>
                
                <div style={{ marginTop: '12px', display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ color: 'var(--muted)', marginRight: '6px' }}>Condição:</strong>
                    <span>{Array.isArray(regra.condicoes) ? `${regra.condicoes.length} configurada(s)` : 'Nenhuma'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ color: 'var(--muted)', marginRight: '6px' }}>Ação:</strong>
                    <span>{regra.acao?.tipo === 'comissao_percentual' ? `${regra.acao.valor}% sobre vendas` : (regra.acao?.tipo === 'bonus_fixo' ? `Bônus de $${regra.acao.valor}` : 'Personalizada')}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={loading}
                  onClick={() => toggleAtivo(regra.id, regra.ativo)}
                  style={{
                    background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
                  }}
                >
                  {regra.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  disabled={loading}
                  onClick={() => router.push(`/dashboard/regras-comissao/${regra.id}`)}
                  style={{
                    background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
                  }}
                >
                  Editar
                </button>
                <button
                  disabled={loading}
                  onClick={() => apagarRegra(regra.id)}
                  style={{
                    background: 'transparent', color: 'var(--destructive, #ef4444)', border: '1px solid var(--destructive, #ef4444)',
                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
                  }}
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
