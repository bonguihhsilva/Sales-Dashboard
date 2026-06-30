# LMS Fase 3 — Gamificação App (grading seguro + XP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar a brecha de segurança do quiz (client computava a nota com gabarito recebido em `correctAnswers`) e ligar a função atômica `lms_grant_xp` (Fase 1) às duas fontes reais de XP: aula concluída e módulo aprovado.

**Architecture:** `submitQuiz` (server action, já existe) já fazia correção server-side com `adminDb`, mas o `QuizClient` nunca a chamava — calculava localmente com o prop `correctAnswers`, que ia ao browser sem proteção. Esta fase remove `correctAnswers`/`explanations` do client, faz `QuizClient` chamar `submitQuiz` via `useTransition`, e a action retorna um `gabarito` por questão (`correta`, `explicacao`, `acertou`) só após o envio. XP passa a ser creditado via `lms_grant_xp` (RPC da Fase 1) em vez do antigo `increment_user_xp`, com checagem de idempotência (não credita 2x se já aprovado/concluído).

**Tech Stack:** Next.js 15 Server Actions, `createAdminClient()` (service-role), RPC `lms_grant_xp` (Fase 1).

**Spec:** `docs/superpowers/specs/2026-06-30-lms-db-migration-design.md` (seção 6.2, 6.3).

---

### Task 1: `markLicaoComplete` credita XP da aula (1ª vez só)

**Files:**
- Modify: `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/[licaoId]/actions.ts`

- [ ] Substituir todo o conteúdo pelo seguinte:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function markLicaoComplete(licaoId: string, moduloId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const adminDb = createAdminClient()

  const { data: licao } = await adminDb
    .from('aulas')
    .select('id, modulo_id, xp_reward')
    .eq('id', licaoId)
    .eq('modulo_id', moduloId)
    .maybeSingle()

  if (!licao) {
    throw new Error('Lição não encontrada neste módulo')
  }

  const { data: profile } = await adminDb
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) throw new Error('Empresa do usuário não configurada')

  // Verifica se já estava concluída ANTES do upsert (evita XP duplicado)
  const { data: jaExistia } = await adminDb
    .from('progresso_aulas')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('aula_id', licaoId)
    .maybeSingle()

  const { error } = await adminDb
    .from('progresso_aulas')
    .upsert(
      {
        tenant_id: profile.tenant_id,
        usuario_id: user.id,
        aula_id: licaoId,
        concluida_em: new Date().toISOString(),
      },
      { onConflict: 'usuario_id,aula_id' }
    )

  if (error) throw new Error(error.message)

  // Credita XP só na primeira conclusão
  if (!jaExistia && licao.xp_reward > 0) {
    const { error: xpError } = await adminDb.rpc('lms_grant_xp', {
      p_user: user.id,
      p_amount: licao.xp_reward,
    })
    if (xpError) throw new Error(xpError.message)
  }
}
```

- [ ] Commit:

```bash
git add "src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/[licaoId]/actions.ts"
git commit -m "feat(lms): markLicaoComplete credita XP via lms_grant_xp na 1a conclusao

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: `submitQuiz` usa `lms_grant_xp` + retorna gabarito pós-envio

**Files:**
- Modify: `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/actions.ts`

- [ ] Substituir todo o conteúdo pelo seguinte:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitQuiz(
  moduloId: string,
  respostas: Record<string, number> // id_questao -> index_alternativa
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const adminDb = createAdminClient()

  // 1. Limite de tentativas (cooldown) nas últimas 24 horas
  const umDiaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: tentativasRecentes, error: countErr } = await adminDb
    .from('quiz_resultados')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('modulo_id', moduloId)
    .gt('criado_em', umDiaAtras)

  if (countErr) throw countErr

  if (tentativasRecentes && tentativasRecentes.length >= 5) {
    throw new Error('Limite diário de tentativas atingido. Você excedeu o limite de 5 tentativas a cada 24 horas para este módulo.')
  }

  const { data: modulo } = await adminDb
    .from('modulos').select('xp_reward').eq('id', moduloId).single()
  if (!modulo) throw new Error('Módulo não encontrado')

  const { data: aulas, error: aulasErr } = await adminDb
    .from('aulas')
    .select('id')
    .eq('modulo_id', moduloId)

  if (aulasErr) throw aulasErr

  if (aulas && aulas.length > 0) {
    const aulaIds = aulas.map(a => a.id)
    const { data: progresso, error: progressoErr } = await adminDb
      .from('progresso_aulas')
      .select('aula_id')
      .eq('usuario_id', user.id)
      .in('aula_id', aulaIds)

    if (progressoErr) throw progressoErr

    const concluidasCount = progresso ? progresso.length : 0
    if (concluidasCount < aulas.length) {
      throw new Error('Complete todas as aulas do módulo antes de realizar a prova.')
    }
  }

  const { data: prova } = await adminDb
    .from('provas').select('id, nota_minima').eq('modulo_id', moduloId).single()
  if (!prova) throw new Error('Prova deste módulo não configurada')

  // Gabarito real do banco — nunca exposto ao client antes do envio
  const { data: questoesReais } = await adminDb
    .from('questoes_prova')
    .select('id, indice_correta, explicacao')
    .eq('prova_id', prova.id)

  if (!questoesReais || questoesReais.length === 0) {
    throw new Error('Nenhuma questão cadastrada para este quiz')
  }

  let acertos = 0
  const gabarito: Record<string, { correta: number; explicacao: string | null; acertou: boolean }> = {}
  for (const q of questoesReais) {
    const escolhida = respostas[q.id]
    const acertou = escolhida !== undefined && escolhida === q.indice_correta
    if (acertou) acertos++
    gabarito[q.id] = { correta: q.indice_correta, explicacao: q.explicacao ?? null, acertou }
  }

  const pontuacao = Math.round((acertos / questoesReais.length) * 100)
  const aprovado = pontuacao >= (prova.nota_minima || 70)

  const { data: profile } = await adminDb
    .from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) throw new Error('Tenant não configurado')

  const { data: maxTentativa } = await adminDb
    .from('quiz_resultados')
    .select('tentativa')
    .eq('usuario_id', user.id)
    .eq('modulo_id', moduloId)
    .order('tentativa', { ascending: false })
    .limit(1)
    .maybeSingle()

  const proximaTentativa = maxTentativa ? (maxTentativa.tentativa + 1) : 1

  const { error: logError } = await adminDb
    .from('quiz_resultados')
    .insert({
      usuario_id: user.id,
      modulo_id: moduloId,
      pontuacao,
      aprovado,
      tentativa: proximaTentativa,
      respostas
    })

  if (logError) throw logError

  // Estado de aprovação ANTES desta tentativa (evita XP duplicado em re-tentativas)
  const { data: progressoAnterior } = await adminDb
    .from('progresso_modulos')
    .select('aprovado')
    .eq('usuario_id', user.id)
    .eq('modulo_id', moduloId)
    .maybeSingle()

  const jaEstavaAprovado = progressoAnterior?.aprovado === true

  const { error: resError } = await adminDb
    .from('progresso_modulos')
    .upsert({
      tenant_id: profile.tenant_id,
      usuario_id: user.id,
      modulo_id: moduloId,
      nota_prova: pontuacao,
      aprovado,
      concluido_em: new Date().toISOString()
    }, { onConflict: 'usuario_id,modulo_id' })

  if (resError) throw resError

  // XP só na 1a aprovação
  if (aprovado && !jaEstavaAprovado) {
    const xpGanhado = modulo.xp_reward || 0
    if (xpGanhado > 0) {
      const { error: xpError } = await adminDb.rpc('lms_grant_xp', {
        p_user: user.id,
        p_amount: xpGanhado,
      })
      if (xpError) throw xpError
    }
  }

  return { pontuacao, aprovado, gabarito }
}
```

- [ ] Commit:

```bash
git add "src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/actions.ts"
git commit -m "feat(lms): submitQuiz usa lms_grant_xp e retorna gabarito pos-envio

- Troca increment_user_xp por lms_grant_xp (nivel/badges/streak)
- XP do modulo so na 1a aprovacao (idempotente)
- Retorna gabarito por questao (correta/explicacao/acertou) na resposta

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: `QuizClient` chama `submitQuiz` (remove gabarito do client antes do envio)

**Files:**
- Modify: `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/QuizClient.tsx`

- [ ] Substituir todo o conteúdo pelo seguinte:

```tsx
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
```

- [ ] Commit:

```bash
git add "src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/QuizClient.tsx"
git commit -m "fix(lms): QuizClient chama submitQuiz no servidor, remove grading no client

- Remove props correctAnswers/explanations (nunca mais vao ao browser pre-envio)
- handleSubmeter usa useTransition + server action submitQuiz
- Resultado/gabarito vem 100% do servidor pos-envio
- Exibe erro de cooldown/validacao inline

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: `quiz/page.tsx` para de mandar gabarito ao client

**Files:**
- Modify: `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/page.tsx`

- [ ] Substituir todo o conteúdo pelo seguinte:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProva } from '@/lib/lms/queries'
import { PageHeader, LogoutButton } from '@/components/ui'
import QuizClient from './QuizClient'

export const dynamic = 'force-dynamic'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ trilhaId: string; moduloId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { trilhaId, moduloId } = await params

  const prova = await getProva(moduloId)
  if (!prova || prova.questoes.length === 0) {
    redirect(`/vendedor/treinamentos/${trilhaId}/${moduloId}`)
  }

  const [{ data: trilha }, { data: modulo }] = await Promise.all([
    supabase.from('trilhas').select('titulo').eq('id', trilhaId).single(),
    supabase.from('modulos').select('titulo').eq('id', moduloId).single(),
  ])

  // Só id/pergunta/opcoes vão ao client — gabarito fica só no servidor (submitQuiz)
  const questoes = prova.questoes.map(q => ({
    id: q.id,
    pergunta: q.pergunta,
    opcoes: q.opcoes,
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E' }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={`Prova: ${modulo?.titulo ?? prova.titulo}`}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha?.titulo ?? 'Trilha', href: `/vendedor/treinamentos/${trilhaId}` },
            { label: modulo?.titulo ?? 'Módulo', href: `/vendedor/treinamentos/${trilhaId}/${moduloId}` },
            { label: 'Prova' },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 3rem', maxWidth: '800px' }}>
        <QuizClient
          questoes={questoes}
          trilhaId={trilhaId}
          moduloId={moduloId}
        />
      </div>
    </div>
  )
}
```

- [ ] `npx tsc --noEmit` — zero erros.
- [ ] `npm run build` — build de produção passa.
- [ ] Commit:

```bash
git add "src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/page.tsx"
git commit -m "fix(lms): quiz page nao manda mais correctAnswers/explanations ao client

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Riscos / notas

1. `lms_grant_xp` exige `p_user`/`p_amount` exatamente (nomes dos parâmetros da função plpgsql da Fase 1) — RPC com named args do supabase-js precisa bater com esses nomes.
2. Idempotência dupla: aula usa `jaExistia` (select antes do upsert); módulo usa `jaEstavaAprovado` (aprovado antes desta tentativa). Sem isso, refazer prova já aprovada infla XP.
3. `increment_user_xp` (RPC antiga) fica no banco sem uso — não remover nesta fase (fora de escopo, sem risco).
