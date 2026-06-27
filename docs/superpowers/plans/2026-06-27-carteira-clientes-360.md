# Carteira de Clientes 360 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a Carteira de Clientes numa ferramenta de inteligência comercial: segmentação RFM, KPIs macro, mix de categoria por cliente (via mock item-level), ficha drawer e modal de histórico — para admin e vendedor.

**Architecture:** Lógica pura testável em `src/lib/carteira/*` (segmentação, pareto) e `src/lib/mock/*` (gerador item-level determinístico). Componente client unificado `CarteiraClient` consumido pela página admin e pela aba do vendedor. Categoria mora em `products.category`; `sale_items` (já existe) junta por `product_code`; quando `sale_items` vazia, server actions caem no mock generator derivado de `sales_records`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Supabase (`@supabase/ssr` + admin client), vitest (env node, sem jsdom — testes só de lógica pura), inline styles com CSS vars (padrão do projeto).

**Spec:** `docs/superpowers/specs/2026-06-27-carteira-clientes-360-design.md`

**Contrato visual:** layout aprovado no brainstorming (v4): KPIs macro + pills de segmento + lista (Cliente · Segmento · Cat. principal · Total · Ticket méd. · Tendência · Última) + ficha drawer enxuta com botões + modal histórico. Referência de estilo in-repo: `src/app/dashboard/ClientsTabClient.tsx`.

---

## Convenções de teste

- vitest já configurado (`vitest.config.ts`, env `node`, `globals: false`, alias `@`→`src`). Importar APIs: `import { describe, it, expect } from 'vitest'`.
- Rodar um teste: `npm test -- src/lib/carteira/segmentation.test.ts`
- Rodar todos: `npm test`
- **Sem jsdom/RTL no repo** — não adicionar (YAGNI). Componentes UI validam via `npm run build` + verificação manual. Tasks de UI não têm step de teste unitário; têm step de build.
- `npm run build` DEVE passar antes de cada commit de fase (regra do projeto).

---

## File Structure

**Criar:**
- `src/lib/carteira/types.ts` — interfaces compartilhadas (`CarteiraClient`, `AnalyzedClient`, `Segment`, `RfmScore`).
- `src/lib/carteira/segmentation.ts` — `analyzeCarteira`, `paretoTop20Share`, `segmentCounts`. Lógica pura.
- `src/lib/carteira/segmentation.test.ts` — testes.
- `src/lib/carteira/categories.ts` — `aggregateCategoryMix`, `findCategoryGaps`. Lógica pura.
- `src/lib/carteira/categories.test.ts` — testes.
- `src/lib/mock/carteira-items.ts` — gerador item-level determinístico a partir de notas.
- `src/lib/mock/carteira-items.test.ts` — testes.
- `src/app/dashboard/carteira/CarteiraClient.tsx` — componente client unificado (macro + pills + lista + ficha).
- `src/app/dashboard/carteira/ClientHistoryModal.tsx` — modal histórico/nota (abas).
- `src/app/dashboard/carteira/carteiraActions.ts` — server actions item-level (`fetchClientItemHistory`, `fetchClientCategoryMix`).
- `supabase/migrations/<ts>_carteira_category.sql` — colunas + view.

**Modificar:**
- `src/app/dashboard/ClientsTab.tsx` — passar a renderizar `CarteiraClient` (admin).
- `src/app/vendedor/meu-resultado/page.tsx` — aba "Minha Carteira" passa a usar `CarteiraClient`.
- `src/app/dashboard/ClientsTabClient.tsx` — aposentado (substituído por `CarteiraClient`); remover após paridade (Task 12).

---

## FASE 1 — Segmentação + lista + macro (sem item-level)

### Task 1: Tipos da carteira

**Files:**
- Create: `src/lib/carteira/types.ts`

- [ ] **Step 1: Criar o arquivo de tipos**

```ts
// src/lib/carteira/types.ts
export interface CarteiraClient {
  client_id: string
  client_name: string
  vendor_id: string
  vendor_name?: string
  total_spent: number
  visit_days: number
  total_orders: number
  total_items: number
  avg_items_per_order: number
  avg_ticket: number
  first_purchase: string
  last_purchase: string
  last_purchase_time: string
  days_since_last: number
}

export type Segment = 'vip' | 'recorrente' | 'novo' | 'em_risco' | 'perdido'

export interface RfmScore {
  r: number // 1..5
  f: number // 1..5
  m: number // 1..5
}

export interface AnalyzedClient extends CarteiraClient {
  rfm: RfmScore
  rfmSum: number
  segment: Segment
}

export const SEGMENT_LABELS: Record<Segment, string> = {
  vip: 'VIP',
  recorrente: 'Recorrente',
  novo: 'Novo',
  em_risco: 'Em risco',
  perdido: 'Perdido',
}

export const SEGMENT_COLORS: Record<Segment, string> = {
  vip: '#10b981',
  recorrente: '#6b6f7a',
  novo: '#f5a742',
  em_risco: '#f43f5e',
  perdido: '#8b5cf6',
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros novos referentes a esse arquivo.

- [ ] **Step 3: Commit**

```bash
git add src/lib/carteira/types.ts
git commit -m "feat(carteira): tipos compartilhados de segmentação"
```

---

### Task 2: Segmentação RFM (lógica pura, TDD)

**Files:**
- Create: `src/lib/carteira/segmentation.ts`
- Test: `src/lib/carteira/segmentation.test.ts`

Regras (defaults v1, sem cross-período):
- **Quintil R**: menor `days_since_last` → score 5 (mais recente melhor). F: maior `total_orders` → 5. M: maior `total_spent` → 5.
- **Segmento**: `novo` se `total_orders === 1`; senão `em_risco` se `days_since_last > 14`; senão `vip` se `rfmSum >= 12`; senão `recorrente`. (`perdido` é cross-período — Task 5.)

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/carteira/segmentation.test.ts
import { describe, it, expect } from 'vitest'
import { analyzeCarteira, paretoTop20Share } from './segmentation'
import type { CarteiraClient } from './types'

function mk(p: Partial<CarteiraClient>): CarteiraClient {
  return {
    client_id: 'c', client_name: 'C', vendor_id: 'v',
    total_spent: 0, visit_days: 1, total_orders: 1, total_items: 1,
    avg_items_per_order: 1, avg_ticket: 0, first_purchase: '2026-01-01',
    last_purchase: '2026-01-01', last_purchase_time: '10:00', days_since_last: 0,
    ...p,
  }
}

describe('analyzeCarteira', () => {
  it('marca cliente de 1 compra como novo', () => {
    const out = analyzeCarteira([mk({ client_id: 'a', total_orders: 1 })])
    expect(out[0].segment).toBe('novo')
  })

  it('marca recorrente inativo (>14d) como em_risco', () => {
    const out = analyzeCarteira([mk({ client_id: 'a', total_orders: 5, days_since_last: 30 })])
    expect(out[0].segment).toBe('em_risco')
  })

  it('marca topo (rfmSum alto) como vip', () => {
    const clients = [
      mk({ client_id: 'top', total_orders: 20, total_spent: 100000, days_since_last: 0 }),
      mk({ client_id: 'low', total_orders: 2,  total_spent: 100,    days_since_last: 5 }),
    ]
    const out = analyzeCarteira(clients)
    expect(out.find(c => c.client_id === 'top')!.segment).toBe('vip')
  })

  it('atribui scores RFM entre 1 e 5', () => {
    const out = analyzeCarteira([mk({}), mk({ client_id: 'b', total_spent: 999 })])
    for (const c of out) {
      for (const k of ['r', 'f', 'm'] as const) {
        expect(c.rfm[k]).toBeGreaterThanOrEqual(1)
        expect(c.rfm[k]).toBeLessThanOrEqual(5)
      }
    }
  })
})

describe('paretoTop20Share', () => {
  it('retorna fração da receita concentrada no top 20%', () => {
    const clients = Array.from({ length: 10 }, (_, i) =>
      mk({ client_id: String(i), total_spent: i === 0 ? 800 : 22 }))
    // top 20% = 2 clientes (800 + 22 = 822) de total 998 ≈ 0.82
    const share = paretoTop20Share(clients)
    expect(share).toBeGreaterThan(0.8)
    expect(share).toBeLessThanOrEqual(1)
  })

  it('retorna 0 para carteira vazia', () => {
    expect(paretoTop20Share([])).toBe(0)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/lib/carteira/segmentation.test.ts`
Expected: FAIL ("Failed to resolve import './segmentation'").

- [ ] **Step 3: Implementar**

```ts
// src/lib/carteira/segmentation.ts
import type { CarteiraClient, AnalyzedClient, RfmScore, Segment } from './types'

const EM_RISCO_DAYS = 14
const VIP_RFM_SUM = 12

/** Score de quintil 1..5; maior `value` → maior score (a menos que invert=true). */
function quintile(value: number, sortedAsc: number[], invert: boolean): number {
  if (sortedAsc.length <= 1) return 3
  // posição (0..1) de value na distribuição
  let rank = sortedAsc.findIndex(v => v >= value)
  if (rank < 0) rank = sortedAsc.length - 1
  const pct = rank / (sortedAsc.length - 1)
  const score = Math.min(5, Math.max(1, Math.round(pct * 4) + 1))
  return invert ? 6 - score : score
}

export function analyzeCarteira(clients: CarteiraClient[]): AnalyzedClient[] {
  const recency  = [...clients].map(c => Number(c.days_since_last)).sort((a, b) => a - b)
  const freq     = [...clients].map(c => Number(c.total_orders)).sort((a, b) => a - b)
  const monetary = [...clients].map(c => Number(c.total_spent)).sort((a, b) => a - b)

  return clients.map(c => {
    const rfm: RfmScore = {
      r: quintile(Number(c.days_since_last), recency, true), // menos dias = melhor
      f: quintile(Number(c.total_orders), freq, false),
      m: quintile(Number(c.total_spent), monetary, false),
    }
    const rfmSum = rfm.r + rfm.f + rfm.m
    let segment: Segment
    if (Number(c.total_orders) === 1) segment = 'novo'
    else if (Number(c.days_since_last) > EM_RISCO_DAYS) segment = 'em_risco'
    else if (rfmSum >= VIP_RFM_SUM) segment = 'vip'
    else segment = 'recorrente'
    return { ...c, rfm, rfmSum, segment }
  })
}

export function paretoTop20Share(clients: CarteiraClient[]): number {
  if (clients.length === 0) return 0
  const sorted = [...clients].sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
  const total = sorted.reduce((s, c) => s + Number(c.total_spent), 0)
  if (total === 0) return 0
  const topN = Math.max(1, Math.ceil(sorted.length * 0.2))
  const topSum = sorted.slice(0, topN).reduce((s, c) => s + Number(c.total_spent), 0)
  return topSum / total
}

export function segmentCounts(clients: AnalyzedClient[]): Record<Segment, number> {
  const acc: Record<Segment, number> = { vip: 0, recorrente: 0, novo: 0, em_risco: 0, perdido: 0 }
  for (const c of clients) acc[c.segment]++
  return acc
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- src/lib/carteira/segmentation.test.ts`
Expected: PASS (todos os casos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/carteira/segmentation.ts src/lib/carteira/segmentation.test.ts
git commit -m "feat(carteira): segmentação RFM e curva de Pareto"
```

---

### Task 3: Componente unificado `CarteiraClient` — macro + pills + lista

**Files:**
- Create: `src/app/dashboard/carteira/CarteiraClient.tsx`

Responsabilidade: receber `clients: CarteiraClient[]` + `color: string`, computar `analyzeCarteira` (client-side, é puro), renderizar KPIs macro, pills de segmento (filtro), e a tabela com coluna Ticket médio + Segmento + Tendência (Tendência fica "—" nesta fase; vira real na Task 5). Clique na linha seta `selectedClientId` (ficha entra na Task 6). Estilo: copiar padrões de `ClientsTabClient.tsx` (inline styles, DM Mono, vars).

- [ ] **Step 1: Criar o componente**

```tsx
// src/app/dashboard/carteira/CarteiraClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { fmtCurrency, recencyColor, recencyLabel } from '@/lib/utils'
import { analyzeCarteira, paretoTop20Share, segmentCounts } from '@/lib/carteira/segmentation'
import { SEGMENT_LABELS, SEGMENT_COLORS, type CarteiraClient as Client, type Segment } from '@/lib/carteira/types'

type Filter = 'all' | Segment

export default function CarteiraClient({ clients, color }: { clients: Client[]; color: string }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const analyzed = useMemo(() => analyzeCarteira(clients), [clients])
  const counts   = useMemo(() => segmentCounts(analyzed), [analyzed])
  const pareto   = useMemo(() => paretoTop20Share(clients), [clients])

  const total     = clients.reduce((s, c) => s + Number(c.total_spent), 0)
  const novos     = counts.novo
  const emRisco   = counts.em_risco

  const filtered = useMemo(() => {
    let list = analyzed
    if (filter !== 'all') list = list.filter(c => c.segment === filter)
    if (search) list = list.filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()))
    return [...list].sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
  }, [analyzed, filter, search])

  const kpis = [
    { label: 'Clientes', value: clients.length.toLocaleString() },
    { label: 'Volume', value: fmtCurrency(total), color },
    { label: 'Em risco', value: emRisco.toLocaleString(), color: SEGMENT_COLORS.em_risco },
    { label: 'Novos', value: novos.toLocaleString(), color: SEGMENT_COLORS.novo },
    { label: 'Top 20% receita', value: `${Math.round(pareto * 100)}%` },
  ]

  const pills: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: clients.length },
    { key: 'vip', label: SEGMENT_LABELS.vip, count: counts.vip },
    { key: 'recorrente', label: SEGMENT_LABELS.recorrente, count: counts.recorrente },
    { key: 'novo', label: SEGMENT_LABELS.novo, count: counts.novo },
    { key: 'em_risco', label: SEGMENT_LABELS.em_risco, count: counts.em_risco },
    { key: 'perdido', label: SEGMENT_LABELS.perdido, count: counts.perdido },
  ]

  return (
    <div>
      {/* KPIs macro */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '1rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>{k.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: k.color || 'var(--text)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Pills de segmento */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {pills.map(p => {
          const on = filter === p.key
          const col = p.key === 'all' ? 'var(--accent)' : SEGMENT_COLORS[p.key as Segment]
          return (
            <button key={p.key} onClick={() => setFilter(p.key)} style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '4px 11px', borderRadius: '20px',
              cursor: 'pointer', border: `1px solid ${on ? col : 'var(--border)'}`,
              background: on ? `${col}22` : 'transparent', color: on ? col : 'var(--muted)',
            }}>
              {p.label} · {p.count}
            </button>
          )
        })}
        <input
          type="text" placeholder="Buscar cliente..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '6px 10px', width: '200px', outline: 'none' }}
        />
      </div>

      {/* Lista */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Cliente', 'Segmento', 'Total', 'Ticket méd.', 'Tend.', 'Última compra'].map((h, i) => (
                <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', textAlign: i >= 3 && i <= 5 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const daysAgo = Number(c.days_since_last)
              return (
                <tr key={`${c.client_id}-${c.vendor_id}`} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '7px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px', fontWeight: 500, fontSize: '0.78rem' }}>{c.client_name}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', padding: '2px 7px', borderRadius: '5px', background: `${SEGMENT_COLORS[c.segment]}22`, color: SEGMENT_COLORS[c.segment] }}>{SEGMENT_LABELS[c.segment]}</span>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--accent)' }}>{fmtCurrency(Number(c.total_spent))}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{fmtCurrency(Number(c.avg_ticket))}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>—</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: recencyColor(daysAgo), marginRight: '6px', verticalAlign: 'middle' }} />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem' }}>{c.last_purchase}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', marginLeft: '4px' }}>({recencyLabel(daysAgo)})</span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build passa sem erros de tipo.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/carteira/CarteiraClient.tsx
git commit -m "feat(carteira): componente unificado com macro, pills e lista"
```

---

### Task 4: Plugar `CarteiraClient` no admin e no vendedor

**Files:**
- Modify: `src/app/dashboard/ClientsTab.tsx`
- Modify: `src/app/vendedor/meu-resultado/page.tsx:324-326` (bloco `activeTab === 'carteira'`)

- [ ] **Step 1: Admin — `ClientsTab` renderiza `CarteiraClient`**

Substituir o corpo de `ClientsTab.tsx` (mantendo a query) por: buscar `client_portfolio`, derivar a cor da loja como hoje em uso (`var(--accent)` se admin agregado) e passar ao componente.

```tsx
// src/app/dashboard/ClientsTab.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import CarteiraClient from './carteira/CarteiraClient'
import type { CarteiraClient as Client } from '@/lib/carteira/types'

export default async function ClientsTab({
  periodId,
  vendorId,
}: {
  periodId: number
  vendorId: string | null
}) {
  const { profile } = await getTenantContext()
  const admin = createAdminClient()

  let query = admin
    .from('client_portfolio')
    .select('*')
    .eq('period_id', periodId)
    .eq('tenant_id', profile.tenant_id)
    .order('total_spent', { ascending: false })
    .limit(1000)

  if (vendorId) query = query.eq('vendor_id', vendorId) as typeof query

  const { data: clients } = await query

  return <CarteiraClient clients={(clients ?? []) as Client[]} color="var(--accent)" />
}
```

- [ ] **Step 2: Vendedor — aba carteira usa `CarteiraClient`**

Em `src/app/vendedor/meu-resultado/page.tsx`, trocar o import e o render da aba carteira:

```tsx
// substituir: import ClientsTabClient from './ClientsTabClient'
import CarteiraClient from '@/app/dashboard/carteira/CarteiraClient'
import type { CarteiraClient as Client } from '@/lib/carteira/types'

// no bloco activeTab === 'carteira':
{activeTab === 'carteira' && (
  <CarteiraClient clients={(clientsData ?? []) as Client[]} color={col} />
)}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: passa. (Se `ClientsTabClient` ficar sem uso, lint pode avisar import não usado em `meu-resultado` — garantir que o import antigo foi removido.)

- [ ] **Step 4: Verificação manual**

Run: `npm run dev` → abrir `/dashboard` (aba Clientes) e `/vendedor/meu-resultado?tab=carteira`. Conferir: KPIs macro, pills filtram, coluna Ticket médio aparece, segmento colorido por linha.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/ClientsTab.tsx src/app/vendedor/meu-resultado/page.tsx
git commit -m "feat(carteira): plugar componente unificado em admin e vendedor"
```

---

### Task 5: Tendência vs período anterior + segmento "perdido" (cross-período)

**Files:**
- Modify: `src/lib/carteira/types.ts` (adicionar `prev_total_spent?: number` em `CarteiraClient`, `trendPct: number | null` em `AnalyzedClient`)
- Modify: `src/lib/carteira/segmentation.ts` (calcular trend; flag perdido)
- Modify: `src/lib/carteira/segmentation.test.ts` (casos)
- Modify: `src/app/dashboard/ClientsTab.tsx` e `meu-resultado/page.tsx` (carregar período anterior, montar `prev_total_spent` e clientes perdidos)
- Modify: `src/app/dashboard/carteira/CarteiraClient.tsx` (render Tendência real)

- [ ] **Step 1: Atualizar tipos**

Em `types.ts`: adicionar a `CarteiraClient` o campo opcional `prev_total_spent?: number`. Adicionar a `AnalyzedClient` o campo `trendPct: number | null`.

- [ ] **Step 2: Escrever teste de tendência (falha)**

Adicionar a `segmentation.test.ts`:

```ts
describe('tendência', () => {
  it('calcula variação % vs período anterior', () => {
    const out = analyzeCarteira([mk({ total_spent: 120, prev_total_spent: 100 })])
    expect(out[0].trendPct).toBeCloseTo(20)
  })
  it('trendPct é null sem período anterior', () => {
    const out = analyzeCarteira([mk({ total_spent: 120 })])
    expect(out[0].trendPct).toBeNull()
  })
  it('cliente com total_spent 0 e prev>0 é perdido', () => {
    const out = analyzeCarteira([mk({ total_orders: 0, total_spent: 0, prev_total_spent: 500, days_since_last: 99 })])
    expect(out[0].segment).toBe('perdido')
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test -- src/lib/carteira/segmentation.test.ts`
Expected: FAIL (trendPct undefined; perdido não implementado).

- [ ] **Step 4: Implementar trend + perdido**

Em `segmentation.ts`, dentro do `.map`, antes do return:

```ts
const prev = c.prev_total_spent
const trendPct = (prev != null && prev > 0) ? ((Number(c.total_spent) - prev) / prev) * 100 : null

let segment: Segment
if (Number(c.total_spent) === 0 && prev != null && prev > 0) segment = 'perdido'
else if (Number(c.total_orders) === 1) segment = 'novo'
else if (Number(c.days_since_last) > EM_RISCO_DAYS) segment = 'em_risco'
else if (rfmSum >= VIP_RFM_SUM) segment = 'vip'
else segment = 'recorrente'

return { ...c, rfm, rfmSum, segment, trendPct }
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test -- src/lib/carteira/segmentation.test.ts`
Expected: PASS.

- [ ] **Step 6: Carregar período anterior nas páginas**

Em `ClientsTab.tsx` e `meu-resultado/page.tsx`: depois de buscar `client_portfolio` do período atual, buscar o período imediatamente anterior (id anterior, ou por `periods` ordenado) e montar um `Map<client_id, total_spent>`. Anexar `prev_total_spent` a cada cliente atual; e adicionar como linhas "perdido" os clientes presentes no anterior e ausentes no atual (com `total_spent: 0, total_orders: 0, days_since_last` grande, `prev_total_spent` setado).

Helper sugerido em `carteiraActions.ts` (Task 7 já cria o arquivo; se executar Task 5 antes, criar função inline na página):

```ts
// pseudo-passo dentro da página (server):
const prevPeriodId = /* id do período anterior, via lista de periods */ null
let prevMap = new Map<string, number>()
if (prevPeriodId) {
  const { data: prev } = await admin.from('client_portfolio')
    .select('client_id, client_name, vendor_id, total_spent')
    .eq('period_id', prevPeriodId).eq('tenant_id', profile.tenant_id)
    .eq(...vendorScope)
  prevMap = new Map((prev ?? []).map(p => [p.client_id, Number(p.total_spent)]))
}
const currentIds = new Set((clients ?? []).map(c => c.client_id))
const enriched = (clients ?? []).map(c => ({ ...c, prev_total_spent: prevMap.get(c.client_id) }))
const lost = [...prevMap.entries()]
  .filter(([id]) => !currentIds.has(id))
  .map(([id, prevTotal]) => /* montar CarteiraClient mínimo perdido */ )
const allClients = [...enriched, ...lost]
```

Passar `allClients` ao `CarteiraClient`.

- [ ] **Step 7: Render Tendência real no componente**

Em `CarteiraClient.tsx`, trocar a célula de Tendência (`—`) por:

```tsx
<td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
  color: c.trendPct == null ? 'var(--muted)' : c.trendPct > 2 ? '#10b981' : c.trendPct < -2 ? '#f43f5e' : 'var(--muted)' }}>
  {c.trendPct == null ? (c.segment === 'novo' ? 'novo' : '—')
    : `${c.trendPct > 0 ? '▲' : c.trendPct < 0 ? '▼' : ''} ${Math.abs(Math.round(c.trendPct))}%`}
</td>
```

- [ ] **Step 8: Build + manual**

Run: `npm run build` → passa. `npm run dev` → conferir setas ▲▼ e pill "Perdido" com contagem.

- [ ] **Step 9: Commit**

```bash
git add src/lib/carteira/ src/app/dashboard/ClientsTab.tsx src/app/vendedor/meu-resultado/page.tsx src/app/dashboard/carteira/CarteiraClient.tsx
git commit -m "feat(carteira): tendência vs período anterior e segmento perdido"
```

---

## FASE 2 — Item-level + mock + categoria

### Task 6: Migration — categoria em produtos + view de itens

**Files:**
- Create: `supabase/migrations/<timestamp>_carteira_category.sql`

> Regra do projeto: mudança de banco só via migration. Aplicar com a ferramenta de migration do projeto (MCP `apply_migration` ou CLI), nunca SQL solto em prod.

- [ ] **Step 1: Escrever a migration**

```sql
-- supabase/migrations/<timestamp>_carteira_category.sql
alter table public.products  add column if not exists category text;
alter table public.sale_items add column if not exists category text; -- denormalizado p/ leitura rápida; preenchido via join no app

-- View: mix de categoria por (period, vendor, client)
create or replace view public.client_category_mix as
select
  si.tenant_id,
  si.period_id,
  si.vendor_id,
  sr.client_id,
  coalesce(p.category, si.category, 'Sem categoria') as category,
  sum(si.total_price) as total,
  sum(si.qty)         as qty
from public.sale_items si
join public.sales_records sr
  on sr.tenant_id = si.tenant_id and sr.period_id = si.period_id and sr.order_ref = si.order_id
left join public.products p
  on p.tenant_id = si.tenant_id and p.product_code = si.product_code
group by si.tenant_id, si.period_id, si.vendor_id, sr.client_id, coalesce(p.category, si.category, 'Sem categoria');
```

- [ ] **Step 2: Aplicar a migration**

Aplicar via ferramenta de migration (não SQL direto). Confirmar com `list_migrations`/`list_tables` que `products.category`, `sale_items.category` e a view `client_category_mix` existem.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations
git commit -m "feat(carteira): categoria em products/sale_items e view client_category_mix"
```

---

### Task 7: Gerador mock item-level (lógica pura, TDD)

**Files:**
- Create: `src/lib/mock/carteira-items.ts`
- Test: `src/lib/mock/carteira-items.test.ts`

Responsabilidade: dado um conjunto de notas (`order_ref`, `valor`, `quantity`, `client_id`, `sale_date`) e um catálogo de produtos (seeds: nome, sku, categoria, preço aproximado), explodir cada nota em 1–3 linhas de produto **determinísticas** (hash do `order_ref`), cujo somatório ≈ `valor`. Sem aleatoriedade real (determinístico por `order_ref`).

- [ ] **Step 1: Escrever teste (falha)**

```ts
// src/lib/mock/carteira-items.test.ts
import { describe, it, expect } from 'vitest'
import { generateMockItems, MOCK_CATALOG } from './carteira-items'

const notas = [
  { order_ref: 'A1', client_id: 'c1', valor: 1000, quantity: 3, sale_date: '2026-05-03' },
  { order_ref: 'A2', client_id: 'c1', valor: 250,  quantity: 1, sale_date: '2026-05-10' },
]

describe('generateMockItems', () => {
  it('é determinístico (mesmo input → mesmo output)', () => {
    const a = generateMockItems(notas)
    const b = generateMockItems(notas)
    expect(a).toEqual(b)
  })

  it('soma das linhas ≈ valor da nota (tolerância 1%)', () => {
    const items = generateMockItems(notas)
    for (const nota of notas) {
      const sum = items.filter(i => i.order_ref === nota.order_ref).reduce((s, i) => s + i.total_price, 0)
      expect(Math.abs(sum - nota.valor)).toBeLessThanOrEqual(nota.valor * 0.01)
    }
  })

  it('só usa categorias do catálogo', () => {
    const cats = new Set(MOCK_CATALOG.map(p => p.category))
    for (const i of generateMockItems(notas)) expect(cats.has(i.category)).toBe(true)
  })

  it('gera 1 a 3 linhas por nota', () => {
    const items = generateMockItems(notas)
    const perOrder = new Map<string, number>()
    for (const i of items) perOrder.set(i.order_ref, (perOrder.get(i.order_ref) ?? 0) + 1)
    for (const n of perOrder.values()) { expect(n).toBeGreaterThanOrEqual(1); expect(n).toBeLessThanOrEqual(3) }
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/lib/mock/carteira-items.test.ts`
Expected: FAIL (import não resolve).

- [ ] **Step 3: Implementar**

```ts
// src/lib/mock/carteira-items.ts
export interface MockProduct { sku: string; name: string; category: string; price: number }
export interface MockNota { order_ref: string; client_id: string; valor: number; quantity: number; sale_date: string }
export interface MockItem {
  order_ref: string; client_id: string; sale_date: string
  product_code: string; product_name: string; category: string
  qty: number; unit_price: number; total_price: number
}

// Catálogo derivado dos seeds reais (eletrônicos/perfumaria de CDE).
export const MOCK_CATALOG: MockProduct[] = [
  { sku: 'APL-IP15P-256', name: 'iPhone 15 Pro 256GB',     category: 'Celulares',     price: 1070 },
  { sku: 'SAM-S24U-512',  name: 'Galaxy S24 Ultra 512GB',  category: 'Celulares',     price: 1150 },
  { sku: 'XIA-RN13P-256', name: 'Redmi Note 13 Pro 256GB', category: 'Celulares',     price: 320 },
  { sku: 'APL-MBA-M3-256',name: 'MacBook Air M3 13"',      category: 'Notebooks',     price: 1200 },
  { sku: 'ASU-ROG-G16',   name: 'ROG Strix G16 RTX4060',   category: 'Notebooks',     price: 1500 },
  { sku: 'LG-OLED55C4',   name: 'Smart TV OLED 55" C4',    category: 'TVs',           price: 1400 },
  { sku: 'SAM-QN90-65',   name: 'Smart TV Neo QLED 65"',   category: 'TVs',           price: 1900 },
  { sku: 'SON-PS5-SLIM',  name: 'PlayStation 5 Slim',      category: 'Games',         price: 550 },
  { sku: 'DIO-SAUV-100',  name: 'Sauvage EDP 100ml',       category: 'Perfumaria',    price: 130 },
  { sku: 'CHA-BLEU-100',  name: 'Bleu de Chanel 100ml',    category: 'Perfumaria',    price: 120 },
  { sku: 'APL-APP2-USBC', name: 'AirPods Pro 2 USB-C',     category: 'Áudio/Acess.',  price: 166 },
  { sku: 'SON-XM5',       name: 'WH-1000XM5',              category: 'Áudio/Acess.',  price: 300 },
  { sku: 'CAS-GA2100',    name: 'G-Shock GA-2100',         category: 'Relógios',      price: 110 },
  { sku: 'APL-AWS9-45',   name: 'Apple Watch Series 9',    category: 'Relógios',      price: 430 },
]

// Hash determinístico simples (FNV-1a) — sem Math.random.
function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0)
}

export function generateMockItems(notas: MockNota[]): MockItem[] {
  const out: MockItem[] = []
  for (const nota of notas) {
    const h = hash(nota.order_ref)
    const nLines = (h % 3) + 1 // 1..3
    // escolher produtos determinísticos
    const chosen: MockProduct[] = []
    for (let i = 0; i < nLines; i++) chosen.push(MOCK_CATALOG[(h + i * 7) % MOCK_CATALOG.length])
    // distribuir o valor proporcional ao preço-base dos produtos escolhidos
    const baseSum = chosen.reduce((s, p) => s + p.price, 0)
    let allocated = 0
    chosen.forEach((p, i) => {
      const isLast = i === chosen.length - 1
      const share = isLast ? (nota.valor - allocated) : Math.round((p.price / baseSum) * nota.valor)
      allocated += share
      const qty = Math.max(1, Math.round(share / p.price))
      out.push({
        order_ref: nota.order_ref, client_id: nota.client_id, sale_date: nota.sale_date,
        product_code: p.sku, product_name: p.name, category: p.category,
        qty, unit_price: Math.round(share / qty), total_price: share,
      })
    })
  }
  return out
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- src/lib/mock/carteira-items.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mock/carteira-items.ts src/lib/mock/carteira-items.test.ts
git commit -m "feat(carteira): gerador mock item-level determinístico"
```

---

### Task 8: Agregação de categoria + lacunas (lógica pura, TDD)

**Files:**
- Create: `src/lib/carteira/categories.ts`
- Test: `src/lib/carteira/categories.test.ts`

- [ ] **Step 1: Escrever teste (falha)**

```ts
// src/lib/carteira/categories.test.ts
import { describe, it, expect } from 'vitest'
import { aggregateCategoryMix, findCategoryGaps } from './categories'

const items = [
  { category: 'Celulares', total_price: 1000 },
  { category: 'Celulares', total_price: 500 },
  { category: 'Perfumaria', total_price: 500 },
]

describe('aggregateCategoryMix', () => {
  it('soma por categoria e calcula %', () => {
    const mix = aggregateCategoryMix(items)
    expect(mix[0]).toMatchObject({ category: 'Celulares', total: 1500, pct: 75 })
    expect(mix.find(m => m.category === 'Perfumaria')!.pct).toBe(25)
  })
  it('retorna [] para vazio', () => {
    expect(aggregateCategoryMix([])).toEqual([])
  })
})

describe('findCategoryGaps', () => {
  it('lista categorias do universo que o cliente nunca comprou', () => {
    const gaps = findCategoryGaps(['Celulares'], ['Celulares', 'Notebooks', 'TVs'])
    expect(gaps).toEqual(['Notebooks', 'TVs'])
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/lib/carteira/categories.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

```ts
// src/lib/carteira/categories.ts
export interface CategoryItem { category: string; total_price: number }
export interface CategoryMix { category: string; total: number; pct: number }

export function aggregateCategoryMix(items: CategoryItem[]): CategoryMix[] {
  if (items.length === 0) return []
  const map = new Map<string, number>()
  for (const it of items) map.set(it.category, (map.get(it.category) ?? 0) + it.total_price)
  const total = [...map.values()].reduce((s, v) => s + v, 0)
  return [...map.entries()]
    .map(([category, t]) => ({ category, total: t, pct: total ? Math.round((t / total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)
}

export function findCategoryGaps(clientCategories: string[], universe: string[]): string[] {
  const has = new Set(clientCategories)
  return universe.filter(c => !has.has(c))
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- src/lib/carteira/categories.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/carteira/categories.ts src/lib/carteira/categories.test.ts
git commit -m "feat(carteira): agregação de mix de categoria e lacunas"
```

---

### Task 9: Server actions item-level com fallback mock

**Files:**
- Create: `src/app/dashboard/carteira/carteiraActions.ts`

Responsabilidade: `fetchClientCategoryMix(clientId, periodId, vendorId)` e `fetchClientItemHistory(clientId)`. Ler `sale_items`/`client_category_mix`; se vazio, gerar via `generateMockItems` a partir das notas reais de `sales_records` daquele cliente. Auth via `getTenantContext` (mesmo padrão do `clientsActions.ts` existente).

- [ ] **Step 1: Criar as actions**

```ts
// src/app/dashboard/carteira/carteiraActions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext } from '@/lib/auth/tenant'
import { generateMockItems, MOCK_CATALOG, type MockItem } from '@/lib/mock/carteira-items'
import { aggregateCategoryMix } from '@/lib/carteira/categories'

export const CATEGORY_UNIVERSE = [...new Set(MOCK_CATALOG.map(p => p.category))]

async function clientMockItems(clientId: string, tenantId: string): Promise<MockItem[]> {
  const admin = createAdminClient()
  const { data: notas } = await admin
    .from('sales_records')
    .select('order_ref, client_id, valor, quantity, sale_date')
    .eq('client_id', clientId).eq('tenant_id', tenantId)
    .order('sale_date', { ascending: false })
    .limit(300)
  return generateMockItems((notas ?? []).map(n => ({
    order_ref: String(n.order_ref ?? n.client_id),
    client_id: clientId, valor: Number(n.valor), quantity: Number(n.quantity), sale_date: String(n.sale_date),
  })))
}

export async function fetchClientCategoryMix(clientId: string, periodId: number) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile?.tenant_id) throw new Error('Unauthorized')
  const admin = createAdminClient()

  const { data: real } = await admin
    .from('client_category_mix')
    .select('category, total')
    .eq('client_id', clientId).eq('tenant_id', profile.tenant_id).eq('period_id', periodId)

  if (real && real.length) {
    return aggregateCategoryMix(real.map(r => ({ category: r.category, total_price: Number(r.total) })))
  }
  // fallback mock
  const items = await clientMockItems(clientId, profile.tenant_id)
  return aggregateCategoryMix(items.map(i => ({ category: i.category, total_price: i.total_price })))
}

export async function fetchClientItemHistory(clientId: string) {
  const { user, profile } = await getTenantContext()
  if (!user || !profile?.tenant_id) throw new Error('Unauthorized')
  const admin = createAdminClient()

  const { data: real } = await admin
    .from('sale_items')
    .select('order_id, product_code, qty, unit_price, total_price, category')
    .eq('tenant_id', profile.tenant_id)
    .order('order_id', { ascending: false })
    .limit(300)

  if (real && real.length) return real
  return clientMockItems(clientId, profile.tenant_id)
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/carteira/carteiraActions.ts
git commit -m "feat(carteira): server actions de mix de categoria e histórico item-level com fallback mock"
```

---

### Task 10: Ficha do cliente (drawer) com mix de categoria + lacunas

**Files:**
- Modify: `src/app/dashboard/carteira/CarteiraClient.tsx` (estado `selectedClient`, drawer)

Responsabilidade: clicar numa linha abre drawer à direita com header (nome, RFM tags, segmento), mix de categoria (carregado via `fetchClientCategoryMix`), lacunas (`findCategoryGaps` contra `CATEGORY_UNIVERSE`), e dois botões (🧾 Abrir última nota / 📜 Abrir histórico) que setam estado pra modal (Task 11). Layout: barra empilhada + lista %, conforme contrato visual v4.

- [ ] **Step 1: Adicionar estado e fetch ao componente**

Adicionar imports e estado:

```tsx
import { useEffect } from 'react'
import { fetchClientCategoryMix, CATEGORY_UNIVERSE } from './carteiraActions'
import { findCategoryGaps } from '@/lib/carteira/categories'
import type { CategoryMix } from '@/lib/carteira/categories'

// props: adicionar periodId
export default function CarteiraClient({ clients, color, periodId }: { clients: Client[]; color: string; periodId: number }) {
  // ...estado existente...
  const [selected, setSelected] = useState<(typeof analyzed)[number] | null>(null)
  const [mix, setMix] = useState<CategoryMix[]>([])
  const [loadingMix, setLoadingMix] = useState(false)

  useEffect(() => {
    if (!selected) return
    let alive = true
    setLoadingMix(true); setMix([])
    fetchClientCategoryMix(selected.client_id, periodId)
      .then(m => { if (alive) setMix(m) })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingMix(false) })
    return () => { alive = false }
  }, [selected, periodId])
```

- [ ] **Step 2: Tornar a linha clicável**

Na `<tr>` da lista, adicionar `onClick={() => setSelected(c)}`.

- [ ] **Step 3: Renderizar o drawer**

Após a `</table>` div, antes do fechamento do componente, com `CAT_COLORS = ['#2563eb','#10b981','#f5a742','#8b5cf6','#06b6d4','#f43f5e']`:

```tsx
{selected && (
  <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }}>
    <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '360px', background: 'var(--bg)', borderLeft: '1px solid var(--border)', overflowY: 'auto', zIndex: 9999 }}>
      {/* header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{selected.client_name}</div>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: 'var(--muted)', marginTop: '3px' }}>
          {selected.vendor_name ?? selected.vendor_id} · {selected.total_orders} compras
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', padding: '2px 7px', borderRadius: '5px', background: `${SEGMENT_COLORS[selected.segment]}22`, color: SEGMENT_COLORS[selected.segment] }}>{SEGMENT_LABELS[selected.segment]}</span>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', padding: '2px 7px', borderRadius: '5px', background: '#2563eb22', color: '#5b9bff' }}>R{selected.rfm.r} F{selected.rfm.f} M{selected.rfm.m}</span>
        </div>
      </div>
      {/* ações */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={() => setHistoryTab('ultima')} style={{ padding: '9px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>🧾 Abrir última nota</button>
        <button onClick={() => setHistoryTab('todas')} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer' }}>📜 Abrir histórico do cliente</button>
      </div>
      {/* mix de categoria */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Mix por categoria</div>
        {loadingMix ? <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--muted)' }}>Carregando…</div>
        : mix.length === 0 ? <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--muted)' }}>Nenhum item registrado neste período.</div>
        : (<>
          <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            {mix.map((m, i) => <div key={m.category} style={{ width: `${m.pct}%`, background: CAT_COLORS[i % CAT_COLORS.length] }} />)}
          </div>
          {mix.map((m, i) => (
            <div key={m.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '5px' }}>
              <span><span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], marginRight: '6px' }} />{m.category}</span>
              <span style={{ fontFamily: 'DM Mono, monospace' }}>{m.pct}%</span>
            </div>
          ))}
        </>)}
      </div>
      {/* lacunas */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Oportunidades (lacunas)</div>
        {findCategoryGaps(mix.map(m => m.category), CATEGORY_UNIVERSE).map(g => (
          <div key={g} style={{ fontSize: '0.72rem', padding: '6px 9px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', marginBottom: '6px' }}>{g} — nunca comprou</div>
        ))}
      </div>
    </div>
  </div>
)}
```

(`setHistoryTab` é estado introduzido na Task 11; nesta task, declarar `const [historyTab, setHistoryTab] = useState<null | 'ultima' | 'todas'>(null)` já agora para os botões compilarem.)

- [ ] **Step 4: Passar `periodId` nas páginas**

Em `ClientsTab.tsx` e `meu-resultado/page.tsx`, passar `periodId={periodId}`/`periodId={activePeriod}` ao `CarteiraClient`.

- [ ] **Step 5: Build + manual**

Run: `npm run build` → passa. `npm run dev` → clicar num cliente abre drawer com mix (mock) e lacunas.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/carteira/CarteiraClient.tsx src/app/dashboard/ClientsTab.tsx src/app/vendedor/meu-resultado/page.tsx
git commit -m "feat(carteira): ficha drawer com mix de categoria e lacunas"
```

---

## FASE 3 — Modal histórico/nota

### Task 11: `ClientHistoryModal` (abas última nota / todas / produtos)

**Files:**
- Create: `src/app/dashboard/carteira/ClientHistoryModal.tsx`
- Modify: `src/app/dashboard/carteira/CarteiraClient.tsx` (renderizar modal quando `historyTab` setado)

Responsabilidade: modal sobreposta com 3 abas. Carrega itens via `fetchClientItemHistory`. **Última nota**: agrupa por `order_id`, mostra a mais recente com linhas (produto, qtd, preço unit, total). **Todas as notas**: lista de notas agrupadas. **Produtos comprados**: agregado por produto (qtd total, vezes).

- [ ] **Step 1: Criar a modal**

```tsx
// src/app/dashboard/carteira/ClientHistoryModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { fmtCurrency } from '@/lib/utils'
import { fetchClientItemHistory } from './carteiraActions'

interface Item { order_id?: string; order_ref?: string; product_code: string; product_name?: string; category?: string; qty?: number; quantity?: number; unit_price?: number; total_price?: number }

export default function ClientHistoryModal({ clientId, clientName, initialTab, onClose }: {
  clientId: string; clientName: string; initialTab: 'ultima' | 'todas'; onClose: () => void
}) {
  const [tab, setTab] = useState<'ultima' | 'todas' | 'produtos'>(initialTab)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchClientItemHistory(clientId).then(d => { if (alive) setItems((d as Item[]) ?? []) }).catch(() => {}).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [clientId])

  const key = (i: Item) => i.order_id ?? i.order_ref ?? ''
  const orders = [...new Set(items.map(key))]
  const lastKey = orders[0]
  const lastItems = items.filter(i => key(i) === lastKey)

  const byProduct = new Map<string, { name: string; qty: number; times: number }>()
  for (const i of items) {
    const k = i.product_name ?? i.product_code
    const cur = byProduct.get(k) ?? { name: k, qty: 0, times: 0 }
    cur.qty += Number(i.qty ?? i.quantity ?? 0); cur.times += 1
    byProduct.set(k, cur)
  }

  const th = { textAlign: 'left' as const, padding: '8px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.62rem' }
  const td = { padding: '8px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', width: '640px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{clientName} — Histórico</strong>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '1.3rem', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', padding: '12px 18px 0' }}>
          {([['ultima','Última nota'],['todas','Todas as notas'],['produtos','Produtos comprados']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', padding: '5px 12px', borderRadius: '7px 7px 0 0', cursor: 'pointer', border: '1px solid var(--border)', borderBottom: 'none', background: tab === k ? 'var(--surface)' : 'transparent', color: tab === k ? 'var(--text)' : 'var(--muted)' }}>{l}</button>
          ))}
        </div>
        <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Carregando…</div>
          : tab === 'produtos' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}><th style={th}>PRODUTO</th><th style={{ ...th, textAlign: 'right' }}>QTD TOTAL</th><th style={{ ...th, textAlign: 'right' }}>VEZES</th></tr></thead>
              <tbody>{[...byProduct.values()].sort((a, b) => b.qty - a.qty).map(p => (
                <tr key={p.name} style={{ borderBottom: '1px solid var(--border)' }}><td style={td}>{p.name}</td><td style={{ ...td, textAlign: 'right' }}>{p.qty}</td><td style={{ ...td, textAlign: 'right' }}>{p.times}</td></tr>
              ))}</tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}><th style={th}>NOTA</th><th style={th}>PRODUTO</th><th style={{ ...th, textAlign: 'right' }}>QTD</th><th style={{ ...th, textAlign: 'right' }}>TOTAL</th></tr></thead>
              <tbody>{(tab === 'ultima' ? lastItems : items).map((i, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={td}>{key(i)}</td>
                  <td style={{ ...td, fontFamily: 'inherit' }}>{i.product_name ?? i.product_code}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{i.qty ?? i.quantity}</td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--accent)' }}>{fmtCurrency(Number(i.total_price ?? 0))}</td>
                </tr>
              ))}
              {(tab === 'ultima' ? lastItems : items).length === 0 && <tr><td colSpan={4} style={{ ...td, textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Sem registros</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Renderizar a modal no `CarteiraClient`**

No fim do `CarteiraClient.tsx`, depois do drawer:

```tsx
{selected && historyTab && (
  <ClientHistoryModal
    clientId={selected.client_id}
    clientName={selected.client_name}
    initialTab={historyTab}
    onClose={() => setHistoryTab(null)}
  />
)}
```

E adicionar o import: `import ClientHistoryModal from './ClientHistoryModal'`.

- [ ] **Step 3: Build + manual**

Run: `npm run build` → passa. `npm run dev` → na ficha, "Abrir última nota" abre modal na aba certa; trocar abas funciona; "Produtos comprados" agrega.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/carteira/ClientHistoryModal.tsx src/app/dashboard/carteira/CarteiraClient.tsx
git commit -m "feat(carteira): modal de histórico com abas última nota/todas/produtos"
```

---

## FASE 4 — Limpeza e paridade

### Task 12: Aposentar `ClientsTabClient` e validar paridade

**Files:**
- Modify/Delete: `src/app/dashboard/ClientsTabClient.tsx`
- Modify: `src/app/dashboard/clientsActions.ts` (manter só se ainda referenciado; senão remover)

- [ ] **Step 1: Conferir referências**

Run: `git grep -n "ClientsTabClient\|fetchClientHistory"`
Expected: nenhuma referência ativa após Tasks 4/10/11 (vendedor já usa `CarteiraClient`).

- [ ] **Step 2: Remover arquivos órfãos**

Se `git grep` não retornar uso de `ClientsTabClient`, remover o arquivo. Se `fetchClientHistory` (em `clientsActions.ts`) ficou órfão, remover — ele referencia colunas inexistentes (`product_code`, `nota_fiscal`) em `sales_records` e está superado por `fetchClientItemHistory`.

```bash
git rm src/app/dashboard/ClientsTabClient.tsx
# remover clientsActions.ts apenas se git grep confirmar órfão
```

- [ ] **Step 3: Build + manual (paridade)**

Run: `npm run build` → passa. `npm run dev` → conferir que admin (`/dashboard`) e vendedor (`/vendedor/meu-resultado?tab=carteira`) têm a MESMA experiência (macro, pills, ficha, modal), vendedor escopado ao próprio book.

- [ ] **Step 4: Rodar toda a suíte de testes**

Run: `npm test`
Expected: todos os testes (carteira + mock + existentes) PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(carteira): aposentar ClientsTabClient e validar paridade admin/vendedor"
```

---

## Self-Review (preenchido)

- **Cobertura do spec:** Segmentação RFM (Task 2,5) · macro/Pareto (Task 2,3) · pills/lista/ticket médio (Task 3) · tendência+perdido (Task 5) · migration categoria (Task 6) · mock item-level (Task 7) · mix+lacunas (Task 8,10) · server actions fallback (Task 9) · ficha drawer (Task 10) · modal histórico abas (Task 11) · paridade admin/vendedor (Task 4,12). Fora de escopo (oferta/estoque, thresholds configuráveis, pipeline real) permanecem fora — conforme spec.
- **Placeholders:** nenhum passo deixa "TBD"; código completo nos passos de lógica; passos de UI trazem o JSX e apontam estilo de referência in-repo.
- **Consistência de tipos:** `CarteiraClient`/`AnalyzedClient`/`Segment` definidos na Task 1 e usados consistentemente; `analyzeCarteira`, `paretoTop20Share`, `segmentCounts`, `aggregateCategoryMix`, `findCategoryGaps`, `generateMockItems`, `fetchClientCategoryMix`, `fetchClientItemHistory` mantêm assinatura entre tasks. `historyTab` declarado na Task 10 (botões) e consumido na Task 11 (modal).

## Riscos / notas

- **Aplicação de migration** depende da ferramenta do projeto (MCP/CLI); não rodar SQL solto em prod.
- **`order_ref` vs `order_id`**: a view `client_category_mix` junta `sale_items.order_id = sales_records.order_ref`. Confirmar no momento da Task 6 que o import real popula `sale_items.order_id` com o mesmo valor de `order_ref`.
- **Mock vs real**: enquanto `sale_items` estiver vazia, todas as telas de categoria mostram dados mock determinísticos — deixar isso claro na UI é opcional (badge "dados de exemplo") e fica como melhoria futura, não bloqueia.
