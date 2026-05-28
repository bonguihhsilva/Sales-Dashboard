'use client'

import { useState } from 'react'
import {
  createTrilhaAction, updateTrilhaAction, deleteTrilhaAction,
  createModuloAction, updateModuloAction, deleteModuloAction,
  createLicaoAction, updateLicaoAction, deleteLicaoAction,
  createQuestaoAction, updateQuestaoAction, deleteQuestaoAction
} from './actions'

export default function AdminLmsClient({
  initialTrilhas,
  initialModulos,
  initialLicoes,
  initialQuestoes,
}: {
  initialTrilhas: any[]
  initialModulos: any[]
  initialLicoes: any[]
  initialQuestoes: any[]
}) {
  const [activeTrilha, setActiveTrilha] = useState<number | null>(null)
  const [activeModulo, setActiveModulo] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAction = async (actionFn: () => Promise<void>) => {
    setLoading(true)
    setErrorMsg('')
    try {
      await actionFn()
    } catch (e: any) {
      setErrorMsg(e.message || 'Ocorreu um erro')
    }
    setLoading(false)
  }

  // Styles
  const btnStyle = {
    background: 'var(--accent)', color: '#0e0f11', border: 'none', borderRadius: '6px',
    padding: '8px 16px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.8rem',
    cursor: 'pointer'
  }
  const dangerBtnStyle = { ...btnStyle, background: 'rgba(245,92,66,0.1)', color: '#f55c42', border: '1px solid rgba(245,92,66,0.3)' }
  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', padding: '8px 12px', width: '100%', marginBottom: '10px'
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
      {/* TRILHAS SIDEBAR */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Trilhas</h2>
          <button style={btnStyle} onClick={() => {
            const t = prompt('Título da Trilha:')
            if (t) handleAction(() => createTrilhaAction({ titulo: t, descricao: '', ativo: true }))
          }}>+</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {initialTrilhas.map(t => (
            <div 
              key={t.id} 
              onClick={() => { setActiveTrilha(t.id); setActiveModulo(null); }}
              style={{
                padding: '12px', borderRadius: '8px', cursor: 'pointer',
                background: activeTrilha === t.id ? 'rgba(200,245,66,0.1)' : 'var(--surface)',
                border: `1px solid ${activeTrilha === t.id ? 'var(--accent)' : 'var(--border)'}`
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.titulo}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{t.ativo ? 'Ativo' : 'Inativo'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        {errorMsg && <div style={{ color: '#f55c42', marginBottom: '1rem', fontSize: '0.8rem' }}>{errorMsg}</div>}
        
        {!activeTrilha ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '2rem' }}>Selecione uma trilha para gerenciar</div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2>Módulos da Trilha</h2>
              <button style={btnStyle} onClick={() => {
                const title = prompt('Título do Módulo:')
                if (title) handleAction(() => createModuloAction({ trilha_id: activeTrilha, titulo: title, descricao: '', xp_reward: 100 }))
              }}>+ Novo Módulo</button>
            </div>

            {initialModulos.filter(m => m.trilha_id === activeTrilha).map(m => (
              <div key={m.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                <div 
                  style={{ background: 'var(--surface2)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setActiveModulo(activeModulo === m.id ? null : m.id)}
                >
                  <strong style={{ fontSize: '1rem' }}>{m.titulo}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>XP: {m.xp_reward}</span>
                </div>

                {activeModulo === m.id && (
                  <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    {/* LIÇÕES */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: 'var(--muted)' }}>Lições</h4>
                        <button style={{ ...btnStyle, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)' }} onClick={() => {
                          const titulo = prompt('Título da Lição:')
                          const video_url = prompt('URL do Vídeo (YouTube/Vimeo) - opcional:') || ''
                          if (titulo) handleAction(() => createLicaoAction({ modulo_id: m.id, titulo, video_url, conteudo: '' }))
                        }}>+ Lição</button>
                      </div>
                      
                      {initialLicoes.filter(l => l.modulo_id === m.id).map(l => (
                        <div key={l.id} style={{ padding: '8px', borderBottom: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem' }}>{l.titulo}</span>
                          <button onClick={() => {
                            if (confirm('Excluir lição?')) handleAction(() => deleteLicaoAction(l.id))
                          }} style={{ background: 'transparent', border: 'none', color: '#f55c42', cursor: 'pointer' }}>Excluir</button>
                        </div>
                      ))}
                    </div>

                    {/* QUESTÕES */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: 'var(--muted)' }}>Quiz (Questões)</h4>
                        <button style={{ ...btnStyle, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)' }} onClick={() => {
                          const pergunta = prompt('Pergunta:')
                          if (pergunta) handleAction(() => createQuestaoAction({ 
                            modulo_id: m.id, pergunta, 
                            opcao_a: 'Opção A', opcao_b: 'Opção B', opcao_c: 'Opção C', opcao_d: 'Opção D', 
                            resposta_correta: 'opcao_a', explicacao: '' 
                          }))
                        }}>+ Questão</button>
                      </div>

                      {initialQuestoes.filter(q => q.modulo_id === m.id).map(q => (
                        <div key={q.id} style={{ padding: '8px', borderBottom: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem' }}>{q.pergunta}</span>
                          <button onClick={() => {
                            if (confirm('Excluir questão?')) handleAction(() => deleteQuestaoAction(q.id))
                          }} style={{ background: 'transparent', border: 'none', color: '#f55c42', cursor: 'pointer' }}>Excluir</button>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
