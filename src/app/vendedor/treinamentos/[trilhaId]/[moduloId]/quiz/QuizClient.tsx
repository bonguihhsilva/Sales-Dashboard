'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LMS as C } from '@/lib/lms/theme'
import { submitQuiz } from './actions'

interface Questao {
  id: string
  pergunta: string
  opcoes: string[]
}

interface Props {
  questoes: Questao[]
  trilhaId: string
  moduloId: string
}

interface GabaritoItem {
  correta: number
  explicacao: string | null
  acertou: boolean
}

interface Resultado {
  pontuacao: number
  aprovado: boolean
  gabarito: Record<string, GabaritoItem>
}

export default function QuizClient({ questoes, trilhaId, moduloId }: Props) {
  const router = useRouter()
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleChange = (questaoId: string, index: number) => {
    if (resultado) return
    setRespostas(prev => ({ ...prev, [questaoId]: index }))
  }

  const handleSubmeter = () => {
    if (Object.keys(respostas).length < questoes.length) {
      alert('Responda todas as questões antes de submeter.')
      return
    }
    setErro(null)
    startTransition(async () => {
      try {
        const res = await submitQuiz(moduloId, respostas)
        setResultado(res)
      } catch (err: any) {
        setErro(err.message ?? 'Erro ao enviar prova.')
      }
    })
  }

  if (resultado) {
    const acertosCount = Object.values(resultado.gabarito).filter(g => g.acertou).length
    return (
      <div>
        {/* Resultado header */}
        <div style={{
          padding: '2rem', textAlign: 'center',
          background: C.surface, borderRadius: '0.875rem',
          border: `2px solid ${resultado.aprovado ? C.green : C.red}`,
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {resultado.aprovado ? '🎉' : '📚'}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, margin: '0 0 0.5rem', color: resultado.aprovado ? C.green : C.red }}>
            {resultado.aprovado ? 'Aprovado!' : 'Continue estudando'}
          </h2>
          <p style={{ color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem' }}>
            {resultado.pontuacao}% de acerto · {acertosCount} de {questoes.length} corretas
          </p>
        </div>

        {/* Gabarito */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {questoes.map((q, idx) => {
            const g = resultado.gabarito[q.id]
            const resposta = respostas[q.id]
            return (
              <div key={q.id} style={{
                background: C.surface, borderRadius: '0.75rem',
                border: `1px solid ${g.acertou ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{g.acertou ? '✅' : '❌'}</span>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                    {idx + 1}. {q.pergunta}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.875rem' }}>
                  {q.opcoes.map((op, aIdx) => {
                    const isCorreta  = aIdx === g.correta
                    const isResposta = aIdx === resposta
                    const bg = isCorreta
                      ? 'rgba(34,197,94,0.1)'
                      : (isResposta && !g.acertou ? 'rgba(239,68,68,0.1)' : 'transparent')
                    const borderColor = isCorreta
                      ? 'rgba(34,197,94,0.4)'
                      : (isResposta && !g.acertou ? 'rgba(239,68,68,0.4)' : C.border)
                    const color = isCorreta ? C.green : (isResposta && !g.acertou ? C.red : C.muted)

                    return (
                      <div key={aIdx} style={{
                        padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                        border: `1px solid ${borderColor}`, background: bg,
                        fontSize: '0.875rem', color,
                      }}>
                        {op}
                        {isCorreta && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>← correta</span>}
                      </div>
                    )
                  })}
                </div>

                {g.explicacao && (
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.8125rem', color: C.muted, lineHeight: 1.55,
                  }}>
                    <span style={{ color: C.gold, fontWeight: 700, fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Explicação — </span>
                    {g.explicacao}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {!resultado.aprovado && (
            <button
              onClick={() => { setResultado(null); setRespostas({}) }}
              className="lms-chip"
              style={{
                background: 'transparent', color: C.text,
                border: `1px solid ${C.border}`,
                padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              Tentar novamente
            </button>
          )}
          <button
            onClick={() => router.push(`/vendedor/treinamentos/${trilhaId}`)}
            className="lms-cta"
            style={{
              background: C.gold, color: C.bg, border: 'none',
              padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
              fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            Voltar para a Trilha
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {erro && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.625rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem',
          color: C.red, fontSize: '0.8125rem',
        }}>
          {erro}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {questoes.map((q, idx) => (
          <div key={q.id} style={{ background: C.surface, padding: '1.25rem 1.5rem', borderRadius: '0.75rem', border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.875rem', margin: '0 0 0.875rem', color: C.text, lineHeight: 1.4 }}>
              {idx + 1}. {q.pergunta}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.opcoes.map((opcao, aIdx) => {
                const selected = respostas[q.id] === aIdx
                return (
                  <label key={aIdx} className={selected ? undefined : 'lms-opt'} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                    cursor: 'pointer', padding: '0.625rem 0.75rem',
                    border: `1px solid ${selected ? 'rgba(201,147,58,0.4)' : C.border}`,
                    borderRadius: '0.5rem',
                    background: selected ? 'rgba(201,147,58,0.08)' : 'transparent',
                    transition: 'all 0.15s',
                  }}>
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      checked={selected}
                      onChange={() => handleChange(q.id, aIdx)}
                      style={{ accentColor: C.gold, marginTop: '0.2rem', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '0.9rem', color: selected ? C.text : C.muted, lineHeight: 1.5 }}>{opcao}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>
          {Object.keys(respostas).length} / {questoes.length} respondidas
        </span>
        <button
          onClick={handleSubmeter}
          disabled={Object.keys(respostas).length < questoes.length || pending}
          className="lms-cta"
          style={{
            background: Object.keys(respostas).length < questoes.length ? C.surface2 : C.gold,
            color: Object.keys(respostas).length < questoes.length ? C.muted : C.bg,
            border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
            fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'Syne, sans-serif',
            cursor: Object.keys(respostas).length < questoes.length ? 'default' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {pending ? 'Enviando...' : 'Submeter Quiz'}
        </button>
      </div>
    </div>
  )
}
