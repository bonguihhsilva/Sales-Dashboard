'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionTitle } from '@/components/ui'
import { submitQuiz } from './actions'

export default function QuizClient({ 
  questoes, 
  trilhaId, 
  moduloId,
  quizResult
}: { 
  questoes: any[], 
  trilhaId: string, 
  moduloId: string,
  quizResult: any
}) {
  const router = useRouter()
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(quizResult)

  const handleChange = (questaoId: string, index: number) => {
    setRespostas(prev => ({ ...prev, [questaoId]: index }))
  }

  const handleSubmeter = async () => {
    if (Object.keys(respostas).length < questoes.length) {
      alert('Por favor, responda todas as questões.')
      return
    }

    setLoading(true)
    try {
      const res = await submitQuiz(moduloId, respostas, questoes)
      setResultado(res)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (resultado) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px', border: `2px solid ${resultado.aprovado ? '#22c55e' : 'var(--destructive, #ef4444)'}` }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: resultado.aprovado ? '#22c55e' : 'var(--destructive, #ef4444)' }}>
          {resultado.aprovado ? 'Aprovado! 🎉' : 'Reprovado'}
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text)' }}>
          Você acertou <strong>{resultado.pontuacao}%</strong> do quiz.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => router.push(`/treinamentos/${trilhaId}`)}
            style={{ 
              background: 'var(--accent)', color: 'var(--bg)', border: 'none', 
              padding: '12px 24px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' 
            }}
          >
            Voltar para a Trilha
          </button>
          {!resultado.aprovado && (
            <button 
              onClick={() => { setResultado(null); setRespostas({}); }}
              style={{ 
                background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', 
                padding: '12px 24px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' 
              }}
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {questoes.map((q, idx) => (
          <div key={q.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              {idx + 1}. {q.enunciado}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(q.alternativas || []).map((alt: any, aIdx: number) => (
                <label key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', background: respostas[q.id] === aIdx ? 'var(--surface2)' : 'transparent' }}>
                  <input 
                    type="radio" 
                    name={`questao_${q.id}`} 
                    checked={respostas[q.id] === aIdx}
                    onChange={() => handleChange(q.id, aIdx)}
                    style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.95rem' }}>{alt.texto}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSubmeter}
          disabled={loading}
          style={{ 
            background: 'var(--accent)', color: 'var(--bg)', border: 'none', 
            padding: '12px 24px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer',
            fontSize: '1rem', fontFamily: 'Syne, sans-serif'
          }}
        >
          {loading ? 'Calculando...' : 'Submeter Quiz'}
        </button>
      </div>
    </div>
  )
}
