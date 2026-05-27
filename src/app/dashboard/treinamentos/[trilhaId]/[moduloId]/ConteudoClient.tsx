'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConteudoClient({ initialLicoes, initialQuestoes, moduloId }: { initialLicoes: any[], initialQuestoes: any[], moduloId: string }) {
  const [licoes, setLicoes] = useState(initialLicoes)
  const [questoes, setQuestoes] = useState(initialQuestoes)
  
  const [isLicaoModalOpen, setIsLicaoModalOpen] = useState(false)
  const [isQuestaoModalOpen, setIsQuestaoModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [licaoForm, setLicaoForm] = useState({ titulo: '', conteudo: '', video_url: '' })
  const [questaoForm, setQuestaoForm] = useState({ 
    pergunta: '', 
    opcao_a: '', opcao_b: '', opcao_c: '', opcao_d: '', 
    resposta_correta: 'A',
    explicacao: '' 
  })
  
  const router = useRouter()

  async function handleSaveLicao(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/lms/licoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...licaoForm, modulo_id: moduloId })
      })
      if (res.ok) {
        const { data } = await res.json()
        setLicoes([...licoes, data])
        setIsLicaoModalOpen(false)
        setLicaoForm({ titulo: '', conteudo: '', video_url: '' })
        router.refresh()
      } else {
        alert('Erro ao salvar lição.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveQuestao(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/lms/questoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...questaoForm, modulo_id: moduloId })
      })
      if (res.ok) {
        const { data } = await res.json()
        setQuestoes([...questoes, data])
        setIsQuestaoModalOpen(false)
        setQuestaoForm({ pergunta: '', opcao_a: '', opcao_b: '', opcao_c: '', opcao_d: '', resposta_correta: 'A', explicacao: '' })
        router.refresh()
      } else {
        alert('Erro ao salvar questão.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
      {/* SEÇÃO LIÇÕES */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Lições (Aulas)</h2>
          <button onClick={() => setIsLicaoModalOpen(true)} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
            + Nova Lição
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {licoes.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhuma lição cadastrada.</p>
            </div>
          ) : (
            licoes.map((licao, i) => (
              <div key={licao.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{i + 1}. {licao.titulo}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {licao.conteudo || licao.video_url || 'Sem conteúdo'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border)', margin: '1rem 0' }} />

      {/* SEÇÃO QUIZ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Questões do Quiz</h2>
          <button onClick={() => setIsQuestaoModalOpen(true)} style={{ background: 'var(--meta3, #f5a742)', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
            + Nova Questão
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questoes.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhuma questão cadastrada para o quiz final.</p>
            </div>
          ) : (
            questoes.map((q, i) => (
              <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{i + 1}. {q.pergunta}</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  <li style={{ color: q.resposta_correta === 'A' ? '#22c55e' : 'inherit' }}>A: {q.opcao_a}</li>
                  <li style={{ color: q.resposta_correta === 'B' ? '#22c55e' : 'inherit' }}>B: {q.opcao_b}</li>
                  <li style={{ color: q.resposta_correta === 'C' ? '#22c55e' : 'inherit' }}>C: {q.opcao_c}</li>
                  <li style={{ color: q.resposta_correta === 'D' ? '#22c55e' : 'inherit' }}>D: {q.opcao_d}</li>
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL LIÇÃO */}
      {isLicaoModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Nova Lição</h2>
            <form onSubmit={handleSaveLicao} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required placeholder="Título da Lição" value={licaoForm.titulo} onChange={e => setLicaoForm({...licaoForm, titulo: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              <input placeholder="URL do Vídeo (Youtube/Vimeo) opcional" value={licaoForm.video_url} onChange={e => setLicaoForm({...licaoForm, video_url: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              <textarea placeholder="Conteúdo em Texto/HTML" rows={5} value={licaoForm.conteudo} onChange={e => setLicaoForm({...licaoForm, conteudo: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsLicaoModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', color: '#000', borderRadius: '6px', fontWeight: 600 }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QUESTÃO */}
      {isQuestaoModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Nova Questão (Quiz)</h2>
            <form onSubmit={handleSaveQuestao} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <textarea required placeholder="Pergunta" rows={2} value={questaoForm.pergunta} onChange={e => setQuestaoForm({...questaoForm, pergunta: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              <input required placeholder="Opção A" value={questaoForm.opcao_a} onChange={e => setQuestaoForm({...questaoForm, opcao_a: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              <input required placeholder="Opção B" value={questaoForm.opcao_b} onChange={e => setQuestaoForm({...questaoForm, opcao_b: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              <input placeholder="Opção C" value={questaoForm.opcao_c} onChange={e => setQuestaoForm({...questaoForm, opcao_c: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              <input placeholder="Opção D" value={questaoForm.opcao_d} onChange={e => setQuestaoForm({...questaoForm, opcao_d: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Qual a alternativa correta?</label>
              <select value={questaoForm.resposta_correta} onChange={e => setQuestaoForm({...questaoForm, resposta_correta: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}>
                <option value="A">Opção A</option>
                <option value="B">Opção B</option>
                <option value="C">Opção C</option>
                <option value="D">Opção D</option>
              </select>

              <textarea placeholder="Explicação (exibida após errar)" rows={2} value={questaoForm.explicacao} onChange={e => setQuestaoForm({...questaoForm, explicacao: e.target.value})} style={{ padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsQuestaoModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', color: '#000', borderRadius: '6px', fontWeight: 600 }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
