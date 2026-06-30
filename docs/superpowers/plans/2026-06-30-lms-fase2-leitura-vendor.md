# LMS Fase 2 — Leitura Vendor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir toda leitura estática (`src/lib/lms/*.ts`) nas rotas vendor do LMS por consultas reais ao Supabase, aposentando os IDs fake e exibindo conteúdo, progresso e questões vindos do banco.

**Architecture:** Novo módulo `src/lib/lms/queries.ts` centraliza as 4 funções de leitura DB-bound; cada Server Component de rota vendor chama diretamente a função adequada via `createClient()` (client RLS-bound — sem API route intermediária). `TrilhaCard` recebe nova interface com shape do DB. Quiz page continua passando `correctAnswers` ao cliente nesta fase (Phase 3 moverá para Server Action). Imports de `@/lib/lms` estático permanecem só em `src/lib/lms/index.ts` — nenhuma rota vendor importará mais `LMS_TRILHAS`, `SKINCARE_TRILHAS` ou `ALL_TRILHAS`.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Supabase SSR (`createClient` de `@/lib/supabase/server`), LMS theme tokens (`LMS as C` de `@/lib/lms/theme`)

---

## Pré-condições (verificar antes de começar)

- Branch ativa: `feat/lms-db-migration`
- Fase 1 aplicada: `trilhas.tenant_id` nullable, `trilhas.icon`, `trilhas.cor`, `trilhas.is_global`, `aulas.xp_reward`, `questoes_prova.explicacao` existem
- Tabelas `progresso_aulas`, `progresso_modulos`, `gamificacao` presentes com RLS que filtra por `auth.uid()`
- RLS de `trilhas` já permite `(is_global = true OR tenant_id = get_user_tenant_id())` para SELECT

---

## Mapa de mudanças

| Arquivo | Ação |
|---|---|
| `src/lib/lms/queries.ts` | **Criar** — 4 funções DB |
| `src/app/vendedor/treinamentos/page.tsx` | **Modificar** — hub usa `getCatalogo()` |
| `src/app/vendedor/treinamentos/TrilhaCard.tsx` | **Modificar** — props DB shape |
| `src/app/vendedor/treinamentos/[trilhaId]/page.tsx` | **Modificar** — usa `getTrilha()` |
| `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/page.tsx` | **Modificar** — usa `getModulo()`, lista aulas, remove `dangerouslySetInnerHTML` |
| `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/page.tsx` | **Modificar** — usa `getProva()` |

Não tocar:
- `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/[licaoId]/page.tsx`
- `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/[licaoId]/LicaoClient.tsx`
- `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/QuizClient.tsx`
- `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/actions.ts`
- `src/lib/lms/index.ts` e demais arquivos estáticos (permanecem para uso futuro)

---

### Task 1: Criar `src/lib/lms/queries.ts` com as 4 funções DB

**Files:**
- Create: `src/lib/lms/queries.ts`

#### Objetivo

Centralizar toda leitura LMS do DB num único módulo. Cada função usa `createClient()` (RLS-bound), portanto a visibilidade global∪tenant é automaticamente aplicada pela policy do Supabase sem nenhum filtro extra no código.

#### Tipos auxiliares (definir no topo do arquivo)

Os tipos abaixo descrevem o shape que cada query retorna. Definir inline no arquivo (não exportar para `@/types` ainda — escopo desta fase é só leitura vendor).

```typescript
// Shape retornado por getCatalogo()
export interface CatalogoTrilha {
  id: string
  titulo: string
  descricao: string | null
  icon: string | null
  cor: string | null
  is_global: boolean
  ordem: number
  moduloCount: number
  totalXp: number          // soma de xp_reward dos módulos
  progressoPct: number     // 0-100, % de aulas concluídas pelo user
}

// Shape retornado por getTrilha()
export interface TrilhaDetalhe {
  id: string
  titulo: string
  descricao: string | null
  icon: string | null
  cor: string | null
  is_global: boolean
  modulos: ModuloResumo[]
}

export interface ModuloResumo {
  id: string
  titulo: string
  descricao: string | null
  ordem: number
  xp_reward: number
  aprovacao_minima: number | null
  aulaCount: number
  questaoCount: number
  aprovado: boolean        // true se user tem progresso_modulos.aprovado = true
}

// Shape retornado por getModulo()
export interface ModuloDetalhe {
  id: string
  trilha_id: string
  titulo: string
  descricao: string | null
  xp_reward: number
  aprovacao_minima: number | null
  aulas: AulaResumo[]
  temProva: boolean
}

export interface AulaResumo {
  id: string
  titulo: string
  tipo_conteudo: string | null
  ordem: number
  xp_reward: number
  concluida: boolean       // true se user tem progresso_aulas com aula_id = this.id
}

// Shape retornado por getProva()
export interface ProvaComQuestoes {
  id: string
  titulo: string
  nota_minima: number
  questoes: QuestaoProva[]
}

export interface QuestaoProva {
  id: string
  pergunta: string
  opcoes: string[]         // jsonb → string[]
  indice_correta: number   // Phase 2: ainda enviado ao client
  explicacao: string | null
}
```

#### Step 1: Criar o arquivo com `getCatalogo`

- [ ] Criar `src/lib/lms/queries.ts` com o seguinte conteúdo (incluir todos os tipos acima e as 4 funções):

```typescript
import { createClient } from '@/lib/supabase/server'

// ── Tipos ─────────────────────────────────────────────────────

export interface CatalogoTrilha {
  id: string
  titulo: string
  descricao: string | null
  icon: string | null
  cor: string | null
  is_global: boolean
  ordem: number
  moduloCount: number
  totalXp: number
  progressoPct: number
}

export interface TrilhaDetalhe {
  id: string
  titulo: string
  descricao: string | null
  icon: string | null
  cor: string | null
  is_global: boolean
  modulos: ModuloResumo[]
}

export interface ModuloResumo {
  id: string
  titulo: string
  descricao: string | null
  ordem: number
  xp_reward: number
  aprovacao_minima: number | null
  aulaCount: number
  questaoCount: number
  aprovado: boolean
}

export interface ModuloDetalhe {
  id: string
  trilha_id: string
  titulo: string
  descricao: string | null
  xp_reward: number
  aprovacao_minima: number | null
  aulas: AulaResumo[]
  temProva: boolean
}

export interface AulaResumo {
  id: string
  titulo: string
  tipo_conteudo: string | null
  ordem: number
  xp_reward: number
  concluida: boolean
}

export interface ProvaComQuestoes {
  id: string
  titulo: string
  nota_minima: number
  questoes: QuestaoProva[]
}

export interface QuestaoProva {
  id: string
  pergunta: string
  opcoes: string[]
  indice_correta: number
  explicacao: string | null
}

// ── getCatalogo ───────────────────────────────────────────────
// Retorna trilhas ativas visíveis ao user (global ∪ tenant via RLS),
// ordenadas por `ordem`. Para cada trilha: contagem de módulos, XP
// total (soma xp_reward dos módulos) e % progresso do user.

export async function getCatalogo(userId: string): Promise<CatalogoTrilha[]> {
  const supabase = await createClient()

  // Trilhas ativas — RLS filtra global ∪ tenant automaticamente
  const { data: trilhas, error } = await supabase
    .from('trilhas')
    .select('id, titulo, descricao, icon, cor, is_global, ordem')
    .eq('ativa', true)
    .order('ordem', { ascending: true })

  if (error || !trilhas) return []

  // Para cada trilha, buscar módulos e progresso em paralelo
  const result = await Promise.all(
    trilhas.map(async (trilha): Promise<CatalogoTrilha> => {
      // Módulos da trilha (id e xp_reward)
      const { data: modulos } = await supabase
        .from('modulos')
        .select('id, xp_reward')
        .eq('trilha_id', trilha.id)

      const moduloIds = (modulos ?? []).map(m => m.id)
      const totalXp = (modulos ?? []).reduce((acc, m) => acc + (m.xp_reward ?? 0), 0)

      // Aulas totais dos módulos desta trilha
      let totalAulas = 0
      let aulasConcluidas = 0

      if (moduloIds.length > 0) {
        const { data: aulas } = await supabase
          .from('aulas')
          .select('id')
          .in('modulo_id', moduloIds)

        const aulaIds = (aulas ?? []).map(a => a.id)
        totalAulas = aulaIds.length

        if (aulaIds.length > 0) {
          const { data: progresso } = await supabase
            .from('progresso_aulas')
            .select('aula_id')
            .eq('usuario_id', userId)
            .in('aula_id', aulaIds)

          aulasConcluidas = (progresso ?? []).length
        }
      }

      const progressoPct =
        totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

      return {
        id: trilha.id,
        titulo: trilha.titulo,
        descricao: trilha.descricao ?? null,
        icon: trilha.icon ?? null,
        cor: trilha.cor ?? null,
        is_global: trilha.is_global ?? false,
        ordem: trilha.ordem ?? 0,
        moduloCount: moduloIds.length,
        totalXp,
        progressoPct,
      }
    })
  )

  return result
}

// ── getTrilha ─────────────────────────────────────────────────
// Retorna uma trilha com seus módulos ordenados. Para cada módulo:
// contagem de aulas, contagem de questões (via prova) e se o user
// já foi aprovado naquele módulo.

export async function getTrilha(
  trilhaId: string,
  userId: string
): Promise<TrilhaDetalhe | null> {
  const supabase = await createClient()

  const { data: trilha, error } = await supabase
    .from('trilhas')
    .select('id, titulo, descricao, icon, cor, is_global')
    .eq('id', trilhaId)
    .eq('ativa', true)
    .single()

  if (error || !trilha) return null

  const { data: modulosRaw } = await supabase
    .from('modulos')
    .select('id, titulo, descricao, ordem, xp_reward, aprovacao_minima')
    .eq('trilha_id', trilhaId)
    .order('ordem', { ascending: true })

  const modulos: ModuloResumo[] = await Promise.all(
    (modulosRaw ?? []).map(async (m): Promise<ModuloResumo> => {
      // Contagem de aulas
      const { count: aulaCount } = await supabase
        .from('aulas')
        .select('id', { count: 'exact', head: true })
        .eq('modulo_id', m.id)

      // Questões via prova do módulo
      let questaoCount = 0
      const { data: prova } = await supabase
        .from('provas')
        .select('id')
        .eq('modulo_id', m.id)
        .maybeSingle()

      if (prova) {
        const { count: qCount } = await supabase
          .from('questoes_prova')
          .select('id', { count: 'exact', head: true })
          .eq('prova_id', prova.id)
        questaoCount = qCount ?? 0
      }

      // Aprovação do user
      const { data: prog } = await supabase
        .from('progresso_modulos')
        .select('aprovado')
        .eq('usuario_id', userId)
        .eq('modulo_id', m.id)
        .maybeSingle()

      return {
        id: m.id,
        titulo: m.titulo,
        descricao: m.descricao ?? null,
        ordem: m.ordem ?? 0,
        xp_reward: m.xp_reward ?? 0,
        aprovacao_minima: m.aprovacao_minima ?? null,
        aulaCount: aulaCount ?? 0,
        questaoCount,
        aprovado: prog?.aprovado === true,
      }
    })
  )

  return {
    id: trilha.id,
    titulo: trilha.titulo,
    descricao: trilha.descricao ?? null,
    icon: trilha.icon ?? null,
    cor: trilha.cor ?? null,
    is_global: trilha.is_global ?? false,
    modulos,
  }
}

// ── getModulo ─────────────────────────────────────────────────
// Retorna um módulo com suas aulas ordenadas. Para cada aula indica
// se o user já concluiu. Também informa se existe prova neste módulo.

export async function getModulo(
  moduloId: string,
  userId: string
): Promise<ModuloDetalhe | null> {
  const supabase = await createClient()

  const { data: modulo, error } = await supabase
    .from('modulos')
    .select('id, trilha_id, titulo, descricao, xp_reward, aprovacao_minima')
    .eq('id', moduloId)
    .single()

  if (error || !modulo) return null

  const { data: aulasRaw } = await supabase
    .from('aulas')
    .select('id, titulo, tipo_conteudo, ordem, xp_reward')
    .eq('modulo_id', moduloId)
    .order('ordem', { ascending: true })

  const aulaIds = (aulasRaw ?? []).map(a => a.id)

  // Progresso do user neste módulo (quais aulas concluiu)
  let concluidasSet = new Set<string>()
  if (aulaIds.length > 0) {
    const { data: progressoAulas } = await supabase
      .from('progresso_aulas')
      .select('aula_id')
      .eq('usuario_id', userId)
      .in('aula_id', aulaIds)

    concluidasSet = new Set((progressoAulas ?? []).map(p => p.aula_id))
  }

  const aulas: AulaResumo[] = (aulasRaw ?? []).map(a => ({
    id: a.id,
    titulo: a.titulo,
    tipo_conteudo: a.tipo_conteudo ?? null,
    ordem: a.ordem ?? 0,
    xp_reward: a.xp_reward ?? 0,
    concluida: concluidasSet.has(a.id),
  }))

  // Verifica se existe prova
  const { data: prova } = await supabase
    .from('provas')
    .select('id')
    .eq('modulo_id', moduloId)
    .maybeSingle()

  return {
    id: modulo.id,
    trilha_id: modulo.trilha_id,
    titulo: modulo.titulo,
    descricao: modulo.descricao ?? null,
    xp_reward: modulo.xp_reward ?? 0,
    aprovacao_minima: modulo.aprovacao_minima ?? null,
    aulas,
    temProva: !!prova,
  }
}

// ── getProva ──────────────────────────────────────────────────
// Retorna a prova do módulo com todas as questões ordenadas.
// Phase 2: indice_correta ainda é incluído (Phase 3 remove do client).

export async function getProva(
  moduloId: string
): Promise<ProvaComQuestoes | null> {
  const supabase = await createClient()

  const { data: prova, error } = await supabase
    .from('provas')
    .select('id, titulo, nota_minima')
    .eq('modulo_id', moduloId)
    .single()

  if (error || !prova) return null

  const { data: questoesRaw } = await supabase
    .from('questoes_prova')
    .select('id, pergunta, opcoes, indice_correta, explicacao')
    .eq('prova_id', prova.id)
    .order('id', { ascending: true })

  const questoes: QuestaoProva[] = (questoesRaw ?? []).map(q => ({
    id: q.id,
    pergunta: q.pergunta,
    opcoes: Array.isArray(q.opcoes) ? q.opcoes as string[] : [],
    indice_correta: q.indice_correta,
    explicacao: q.explicacao ?? null,
  }))

  return {
    id: prova.id,
    titulo: prova.titulo,
    nota_minima: prova.nota_minima ?? 70,
    questoes,
  }
}
```

#### Step 2: Verificar tipos

- [ ] Rodar `npx tsc --noEmit` e garantir que `src/lib/lms/queries.ts` compila sem erros antes de prosseguir.

```bash
cd C:\Projetos\da-silva-dashboard && npx tsc --noEmit 2>&1 | head -30
```

#### Step 3: Commit

- [ ] Commitar o arquivo isolado:

```bash
git add src/lib/lms/queries.ts
git commit -m "feat(lms): criar queries.ts com getCatalogo/getTrilha/getModulo/getProva

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Hub page + TrilhaCard — dados reais do DB

**Files:**
- Modify: `src/app/vendedor/treinamentos/page.tsx`
- Modify: `src/app/vendedor/treinamentos/TrilhaCard.tsx`

#### Objetivo

Substituir a leitura de `LMS_TRILHAS`/`SKINCARE_TRILHAS` por `getCatalogo(userId)`. `TrilhaCard` deixa de aceitar `LmsTrilha` e passa a aceitar `CatalogoTrilha`. O layout do hub muda para um grid único ordenado por `ordem` (sem separação manual "Vendas / Skincare" hardcoded — essa separação passa a ser opcional, baseada em `is_global`). A barra de progresso é nova (não existia no estático).

#### Step 1: Reescrever `TrilhaCard.tsx`

- [ ] Substituir todo o conteúdo de `src/app/vendedor/treinamentos/TrilhaCard.tsx` pelo seguinte:

```tsx
'use client'

import Link from 'next/link'
import type { CatalogoTrilha } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'

interface Props {
  trilha: CatalogoTrilha
}

export function TrilhaCard({ trilha }: Props) {
  // Cor do acento: usa trilha.cor se preenchida, fallback gold
  const accentHex    = trilha.cor ?? C.gold
  const accentBg     = `${accentHex}1A`  // 10% opacity
  const accentBorder = `${accentHex}40`  // 25% opacity

  return (
    <Link
      href={`/vendedor/treinamentos/${trilha.id}`}
      className="lms-lift"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '0.875rem' }}
    >
      <div
        style={{
          background: C.elevated,
          border: `1px solid ${C.border}`,
          borderRadius: '0.875rem',
          padding: '1.375rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          height: '100%',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = accentBorder)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
      >
        {/* Ícone + badge módulos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {trilha.icon && (
            <span style={{ fontSize: '1.375rem', lineHeight: 1 }}>{trilha.icon}</span>
          )}
          <div style={{
            fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '0.25rem 0.5rem', borderRadius: '0.3125rem',
            background: accentBg, border: `1px solid ${accentBorder}`, color: accentHex,
          }}>
            {trilha.moduloCount} módulos
          </div>
          {trilha.is_global && (
            <div style={{
              fontSize: '0.5625rem', fontFamily: 'DM Mono, monospace',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '0.2rem 0.4rem', borderRadius: '0.25rem',
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
              color: C.muted,
            }}>
              Global
            </div>
          )}
        </div>

        {/* Título */}
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.0625rem', fontWeight: 700,
          color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>
          {trilha.titulo}
        </div>

        {/* Descrição */}
        <div style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.6, flex: 1 }}>
          {trilha.descricao}
        </div>

        {/* Barra de progresso */}
        <div>
          <div style={{
            height: '3px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${trilha.progressoPct}%`,
              background: trilha.progressoPct === 100 ? C.green : accentHex,
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
              color: accentHex, fontWeight: 700,
            }}>
              +{trilha.totalXp} XP
            </span>
            <span style={{
              fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
              color: trilha.progressoPct === 100 ? C.green : C.muted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {trilha.progressoPct === 100
                ? 'Concluída ✓'
                : trilha.progressoPct > 0
                  ? `${trilha.progressoPct}% →`
                  : 'Iniciar →'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

#### Step 2: Reescrever `page.tsx` do hub

- [ ] Substituir todo o conteúdo de `src/app/vendedor/treinamentos/page.tsx` pelo seguinte:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCatalogo } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'
import { TrilhaCard } from './TrilhaCard'

export const dynamic = 'force-dynamic'

export default async function TreinamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const trilhas = await getCatalogo(user.id)

  const totalModulos = trilhas.reduce((acc, t) => acc + t.moduloCount, 0)
  const totalXP      = trilhas.reduce((acc, t) => acc + t.totalXp, 0)
  const concluidas   = trilhas.filter(t => t.progressoPct === 100).length

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text, padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '2.5rem', gap: '1rem',
        }}>
          <div>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.5rem',
              color: C.text, letterSpacing: '-0.02em', lineHeight: 1.15,
            }}>
              Centro de Treinamentos
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: C.muted, marginTop: 6 }}>
              {trilhas.length} trilhas · {totalModulos} módulos
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 20, alignItems: 'stretch',
            background: C.elevated, border: `1px solid ${C.borderStrong}`,
            borderRadius: '0.75rem', padding: '0.75rem 1.25rem',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>XP disponível</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.amber, marginTop: 2 }}>{totalXP}</div>
            </div>
            <div style={{ width: '1px', background: C.border }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concluídas</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.green, marginTop: 2 }}>{concluidas}/{trilhas.length}</div>
            </div>
          </div>
        </div>

        {/* Grid de trilhas */}
        {trilhas.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
          }}>
            Nenhuma trilha disponível no momento.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {trilhas.map(trilha => (
              <TrilhaCard key={trilha.id} trilha={trilha} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
```

#### Step 3: Verificar build

- [ ] Rodar `npx tsc --noEmit` — garantir zero erros.

#### Step 4: Commit

- [ ] Commitar os dois arquivos:

```bash
git add src/app/vendedor/treinamentos/page.tsx src/app/vendedor/treinamentos/TrilhaCard.tsx
git commit -m "feat(lms): hub vendor lê catálogo do DB via getCatalogo()

- TrilhaCard aceita CatalogoTrilha (DB shape)
- Barra de progresso real por trilha
- Badge 'Global' para trilhas is_global
- Empty state quando sem trilhas

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Trilha detail page — módulos do DB

**Files:**
- Modify: `src/app/vendedor/treinamentos/[trilhaId]/page.tsx`

#### Objetivo

A página de detalhe de trilha deixa de buscar `ALL_TRILHAS.find(t => t.id === trilhaId)` e passa a chamar `getTrilha(trilhaId, userId)`. O layout lista módulos reais com estado aprovado (checkmark verde), contagem de aulas e questões, link correto para `[moduloId]` (UUID do banco).

#### Step 1: Reescrever `[trilhaId]/page.tsx`

- [ ] Substituir todo o conteúdo pelo seguinte:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrilha } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'
import { PageHeader, LogoutButton } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TrilhaPage({
  params,
}: {
  params: Promise<{ trilhaId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { trilhaId } = await params
  const trilha = await getTrilha(trilhaId, user.id)
  if (!trilha) redirect('/vendedor/treinamentos')

  const totalXp    = trilha.modulos.reduce((acc, m) => acc + m.xp_reward, 0)
  const aprovados  = trilha.modulos.filter(m => m.aprovado).length

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={trilha.titulo}
          subtitle={trilha.descricao ?? undefined}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha.titulo },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 2rem', maxWidth: '900px' }}>

        {/* Cabeçalho visual da trilha */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {trilha.icon && (
              <span style={{ fontSize: '2rem' }}>{trilha.icon}</span>
            )}
            <div style={{
              fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: C.amber, fontWeight: 700,
            }}>
              +{totalXp} XP ao concluir
            </div>
          </div>
          <div style={{
            fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
            color: aprovados === trilha.modulos.length && trilha.modulos.length > 0
              ? C.green : C.muted,
          }}>
            {aprovados}/{trilha.modulos.length} módulos aprovados
          </div>
        </div>

        {/* Lista de módulos */}
        {trilha.modulos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
          }}>
            Esta trilha ainda não tem módulos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {trilha.modulos.map((modulo, idx) => (
              <Link
                key={modulo.id}
                href={`/vendedor/treinamentos/${trilhaId}/${modulo.id}`}
                className="lms-row"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '0.75rem' }}
              >
                <div style={{
                  background: C.surface,
                  border: `1px solid ${modulo.aprovado ? 'rgba(34,197,94,0.25)' : C.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    {/* Número do módulo */}
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '50%',
                      background: modulo.aprovado ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${modulo.aprovado ? 'rgba(34,197,94,0.3)' : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                      color: modulo.aprovado ? C.green : C.muted, fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {modulo.aprovado ? '✓' : String(idx + 1).padStart(2, '0')}
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '0.875rem',
                        fontWeight: 700, color: C.text,
                      }}>
                        {modulo.titulo}
                      </div>
                      {modulo.descricao && (
                        <div style={{ fontSize: '0.6875rem', color: C.muted, marginTop: 2 }}>
                          {modulo.descricao}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
                        color: C.muted,
                      }}>
                        {modulo.aulaCount} aulas
                      </div>
                      {modulo.questaoCount > 0 && (
                        <div style={{
                          fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
                          color: C.muted, marginTop: 1,
                        }}>
                          {modulo.questaoCount} questões
                        </div>
                      )}
                      <div style={{
                        fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
                        color: C.amber, marginTop: 1,
                      }}>
                        +{modulo.xp_reward} XP
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: C.muted }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### Step 2: Verificar tipos

- [ ] `npx tsc --noEmit` — zero erros.

#### Step 3: Commit

- [ ] Commitar:

```bash
git add src/app/vendedor/treinamentos/[trilhaId]/page.tsx
git commit -m "feat(lms): trilha detail lê módulos reais via getTrilha()

- Remove ALL_TRILHAS.find() estático
- Lista módulos do DB com estado aprovado, contagem de aulas/questões
- Borda verde em módulos aprovados

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Módulo page — lista de aulas, remove dangerouslySetInnerHTML

**Files:**
- Modify: `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/page.tsx`

#### Objetivo

A maior mudança semântica desta fase. A página de módulo deixa de renderizar conteúdo HTML (que estava em `lesson.content` estático via `dangerouslySetInnerHTML`) e passa a **listar as aulas** do módulo, cada uma linkando para `[licaoId]` (já DB-backed). A lógica de renderizar o conteúdo em si pertence ao `LicaoClient`, que já existe e não muda. O CTA da prova aparece somente se `temProva === true`.

#### Atenção sobre path params

O parâmetro de rota permanece `[moduloId]` no Next.js, mas agora é um UUID real do banco (não mais o ID string estático como `'mod-1-fundamentos'`). O link de cada aula usa `[licaoId]` = `aula.id` (UUID).

#### Step 1: Reescrever `[trilhaId]/[moduloId]/page.tsx`

- [ ] Substituir todo o conteúdo pelo seguinte:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getModulo } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'
import { PageHeader, LogoutButton } from '@/components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Ícone por tipo de aula
function tipoIcon(tipo: string | null): string {
  switch (tipo) {
    case 'video':  return '▶'
    case 'slides': return '◫'
    case 'texto':  return '≡'
    default:       return '◉'
  }
}

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ trilhaId: string; moduloId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { trilhaId, moduloId } = await params
  const modulo = await getModulo(moduloId, user.id)
  if (!modulo) redirect(`/vendedor/treinamentos/${trilhaId}`)

  // Breadcrumb: buscar título da trilha para exibição
  const { data: trilha } = await supabase
    .from('trilhas')
    .select('titulo')
    .eq('id', trilhaId)
    .single()

  const aulasConcluidas = modulo.aulas.filter(a => a.concluida).length
  const totalAulas      = modulo.aulas.length
  const progressoPct    = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={modulo.titulo}
          subtitle={modulo.descricao ?? undefined}
          breadcrumbs={[
            { label: 'Treinamentos', href: '/vendedor/treinamentos' },
            { label: trilha?.titulo ?? 'Trilha', href: `/vendedor/treinamentos/${trilhaId}` },
            { label: modulo.titulo },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '0 2.5rem 3rem', maxWidth: '820px' }}>

        {/* Meta do módulo */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>
            {totalAulas} aulas
          </span>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace', color: C.amber, fontWeight: 700 }}>
            +{modulo.xp_reward} XP
          </span>
          {progressoPct > 0 && (
            <span style={{
              fontSize: '0.6875rem', fontFamily: 'DM Mono, monospace',
              color: progressoPct === 100 ? C.green : C.muted,
            }}>
              {aulasConcluidas}/{totalAulas} concluídas
            </span>
          )}
        </div>

        {/* Barra de progresso do módulo */}
        {totalAulas > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              height: '3px', borderRadius: '2px',
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progressoPct}%`,
                background: progressoPct === 100 ? C.green : C.gold,
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Lista de aulas */}
        {modulo.aulas.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
          }}>
            Este módulo ainda não tem aulas.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
            {modulo.aulas.map((aula, idx) => (
              <Link
                key={aula.id}
                href={`/vendedor/treinamentos/${trilhaId}/${moduloId}/${aula.id}`}
                className="lms-row"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '0.625rem' }}
              >
                <div style={{
                  background: C.surface,
                  border: `1px solid ${aula.concluida ? 'rgba(34,197,94,0.2)' : C.border}`,
                  borderRadius: '0.625rem',
                  padding: '0.875rem 1.125rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Número / status */}
                    <div style={{
                      width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                      background: aula.concluida ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${aula.concluida ? 'rgba(34,197,94,0.3)' : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'DM Mono, monospace', fontSize: '0.6rem',
                      color: aula.concluida ? C.green : C.muted, fontWeight: 700, flexShrink: 0,
                    }}>
                      {aula.concluida ? '✓' : String(idx + 1).padStart(2, '0')}
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '0.875rem',
                        fontWeight: 700, color: C.text,
                      }}>
                        {aula.titulo}
                      </div>
                      <div style={{
                        fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
                        color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {tipoIcon(aula.tipo_conteudo)} {aula.tipo_conteudo ?? 'aula'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
                      color: C.amber,
                    }}>
                      +{aula.xp_reward} XP
                    </span>
                    <span style={{ fontSize: '0.75rem', color: C.muted }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Prova — só exibe se módulo tem prova */}
        {modulo.temProva && (
          <div style={{
            background: 'rgba(201,147,58,0.06)',
            border: '1px solid rgba(201,147,58,0.25)',
            borderRadius: '0.875rem',
            padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '0.9375rem', color: C.text,
              }}>
                Prova do Módulo
              </div>
              <div style={{ fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
                {progressoPct < 100
                  ? `Conclua todas as aulas antes de fazer a prova`
                  : `Teste seu conhecimento e ganhe +${modulo.xp_reward} XP`}
              </div>
            </div>
            <Link
              href={`/vendedor/treinamentos/${trilhaId}/${moduloId}/quiz`}
              className="lms-cta"
              style={{
                background: progressoPct < 100 ? C.surface2 : C.gold,
                color: progressoPct < 100 ? C.muted : C.bg,
                border: 'none',
                padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
                fontWeight: 800, fontFamily: 'Syne, sans-serif',
                fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap',
                pointerEvents: progressoPct < 100 ? 'none' : 'auto',
              }}
            >
              Fazer Prova →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
```

#### Step 2: Verificar tipos e build

- [ ] `npx tsc --noEmit` — zero erros.

#### Step 3: Commit

- [ ] Commitar:

```bash
git add "src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/page.tsx"
git commit -m "feat(lms): módulo page lista aulas do DB via getModulo()

- Remove dangerouslySetInnerHTML e lesson.content estático
- Lista aulas reais com estado concluída por user
- CTA prova condicional (só se temProva e todas aulas concluídas)
- Barra de progresso do módulo

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Quiz page — questões do DB + verificação final

**Files:**
- Modify: `src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/page.tsx`

#### Objetivo

A quiz page deixa de buscar `lesson.quiz` do array estático e passa a chamar `getProva(moduloId)`. O `QuizClient` existente **não muda** — ele já aceita `questoes`, `correctAnswers` e `explanations` como props, e esse contrato é mantido nesta fase. Se `getProva()` retornar `null` (prova não cadastrada), redireciona para a página do módulo.

#### Step 1: Reescrever `[trilhaId]/[moduloId]/quiz/page.tsx`

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

  // Breadcrumb: buscar títulos de trilha e módulo para exibição
  const [{ data: trilha }, { data: modulo }] = await Promise.all([
    supabase.from('trilhas').select('titulo').eq('id', trilhaId).single(),
    supabase.from('modulos').select('titulo').eq('id', moduloId).single(),
  ])

  // Mapear para o contrato que QuizClient já espera
  const questoes = prova.questoes.map(q => ({
    id: q.id,
    pergunta: q.pergunta,
    opcoes: q.opcoes,
  }))

  const correctAnswers = prova.questoes.map(q => q.indice_correta)
  const explanations   = prova.questoes.map(q => q.explicacao ?? '')

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
          correctAnswers={correctAnswers}
          explanations={explanations}
        />
      </div>
    </div>
  )
}
```

#### Step 2: Verificar tipos e build completo

- [ ] `npx tsc --noEmit` — zero erros.
- [ ] `npm run build` — build de produção deve passar sem erros.

#### Step 3: Verificação funcional mínima

- [ ] `npm run dev`, acessar `/vendedor/treinamentos` logado como vendedor:
  - Grid exibe trilhas do DB (não os 11 cards estáticos hardcoded)
  - Clicar numa trilha abre `[trilhaId]` com UUIDs reais na URL
  - Clicar num módulo abre lista de aulas (não HTML renderizado)
  - Clicar numa aula abre `LicaoClient` (já funcionava antes)
  - "Fazer Prova" aparece somente em módulos com prova cadastrada
- [ ] Se o DB tiver 0 trilhas ativas visíveis ao user: hub exibe empty state em vez de crash.

#### Step 4: Commit final

- [ ] Commitar:

```bash
git add "src/app/vendedor/treinamentos/[trilhaId]/[moduloId]/quiz/page.tsx"
git commit -m "feat(lms): quiz page lê prova e questões reais via getProva()

- Remove ALL_TRILHAS.find() e lesson.quiz estático
- Redireciona se prova não cadastrada
- QuizClient mantém contrato (Phase 3 removerá correctAnswers do client)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Auto-revisão do plano

### Cobertura de spec

| Rota | Tratada? |
|---|---|
| `vendedor/treinamentos` (hub) | Task 2 |
| `[trilhaId]` | Task 3 |
| `[trilhaId]/[moduloId]` | Task 4 |
| `[trilhaId]/[moduloId]/quiz` | Task 5 |
| `[trilhaId]/[moduloId]/[licaoId]` | Não tocado (já DB-backed) |
| `queries.ts` novo módulo | Task 1 |
| `TrilhaCard` novo shape | Task 2 |

Todas as 6 rotas/arquivos citados no spec estão cobertos.

### Sem placeholders

Cada step contém o código completo. Nenhum "implementar X de forma similar ao Task N" ou "adicionar lógica aqui".

### Consistência de tipos entre tasks

| Tipo | Definido em | Usado em |
|---|---|---|
| `CatalogoTrilha` | `queries.ts` Task 1 | `TrilhaCard` Task 2, hub `page.tsx` Task 2 |
| `TrilhaDetalhe` / `ModuloResumo` | `queries.ts` Task 1 | `[trilhaId]/page.tsx` Task 3 |
| `ModuloDetalhe` / `AulaResumo` | `queries.ts` Task 1 | `[moduloId]/page.tsx` Task 4 |
| `ProvaComQuestoes` / `QuestaoProva` | `queries.ts` Task 1 | `quiz/page.tsx` Task 5 |

`QuizClient` mantém seu contrato original (`questoes: {id, pergunta, opcoes}[]`, `correctAnswers: number[]`, `explanations: string[]`) — Task 5 mapeia `ProvaComQuestoes` para esse shape sem alterar o cliente.

### Riscos conhecidos / notas para executor

1. **DB sem dados:** Se o projeto Supabase `zsczxblhtdhpdqvkpuwz` não tiver trilhas ativas com tenant_id do user (ou `is_global = true`), o hub mostrará empty state. Verificar se as 2 trilhas semeadas têm `ativa = true` e `is_global = true` (ou tenant correto) antes de testar.

2. **`progresso_aulas.usuario_id` vs `auth.uid()`:** A RLS de `progresso_aulas` deve permitir o user ler seus próprios registros. Se retornar vazio inesperadamente, verificar a policy com `get_advisors`.

3. **`opcoes` jsonb shape:** `getProva` assume `q.opcoes` é `string[]` diretamente. Se o seed gravou como objeto JSONB aninhado (ex: `[{"texto":"..."}]`), o cast vai silenciar. Verificar com `execute_sql`: `SELECT opcoes FROM questoes_prova LIMIT 1;`.

4. **N+1 queries em `getCatalogo`:** A implementação faz queries sequenciais por trilha. Para <= 20 trilhas é aceitável; se o catálogo crescer muito, substituir por uma RPC Postgres que retorna tudo em uma query.

5. **Phase 3 lembrete:** `correctAnswers` ainda vai ao cliente em `quiz/page.tsx`. Issue de segurança conhecida. `actions.ts` já corrigiu isso no server (faz correção server-side), mas o client exibe gabarito antecipadamente no resultado. Phase 3 resolve movendo a verificação inteiramente para `submitQuiz`.
