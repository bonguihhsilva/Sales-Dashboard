---
phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v
plan: 03
subsystem: api
tags: [nextjs, route-handler, api-key-auth, zod, idempotency, rpc, vitest]

# Dependency graph
requires:
  - phase: 07-01
    provides: "RPC ingest_sales_records, sales_records sem UNIQUE em order_ref, connector_id_mappings estendido para 'api'/'product'"
  - phase: 07-02
    provides: "getApiKeyContext, ensurePeriodForDate, saleSchema (Zod), apiV1RateLimiter, /api/v1 liberado no middleware"
provides:
  - "POST /api/v1/sales — endpoint de ingest de vendas em batch autenticado por API key"
  - "Padrão de teste de rota HTTP para o projeto (vi.mock de createAdminClient/getApiKeyContext/ensurePeriodForDate/apiV1RateLimiter com fake client thenable)"
affects: ["07-04 (rota POST /api/v1/stock reusa o mesmo padrão de teste e o mesmo limite MAX_BODY_BYTES)", "07-05 (UI de keys — endpoint já consumível)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Envelope de resposta { success, data, error, accepted, rejected, errors[] } — novo padrão da API pública, não propagado às rotas /api/admin/*"
    - "Limite de body 413 em duas etapas: fast-path por header content-length + reconferência real via Buffer.byteLength antes de processar"
    - "Fake Supabase client thenable em testes: chain.then resolve direto, sem precisar de .single()/.maybeSingle() explícito nas queries de select em array"

key-files:
  created:
    - src/app/api/v1/sales/route.ts
    - src/__tests__/api-v1-sales.test.ts
  modified: []

key-decisions:
  - "Detecção de vendor 'desconhecido' (D-15) usa a tabela goals do(s) period(s) do batch como fonte de vendors conhecidos — se vendor_id não aparece em goals para nenhum period do batch, é considerado desconhecido e registrado em connector_id_mappings"
  - "Detecção de product_code 'desconhecido' (D-15) usa o costMap já buscado de products (mesma query usada para enriquecer sale_items) — evita uma segunda query"
  - "Quantity do row de sales_records: soma de qty dos items quando presentes, senão 1 (a tabela sales_records não tem coluna própria para 'quantidade de itens', é um total inteiro por venda)"

requirements-completed: [D-05, D-06, D-07, D-08, D-13, D-14, D-15]

# Metrics
duration: 8min
completed: 2026-07-17
---

# Phase 07 Plan 03: POST /api/v1/sales — Ingest de vendas em batch Summary

**Endpoint de ingest de vendas autenticado por API key, com idempotência transacional via RPC `ingest_sales_records`, validação parcial em batch, limite de body (413) e namespacing de vendedor/produto desconhecido — 9 testes cobrindo auth, DoS, idempotência e isolamento de tenant.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-07-17T23:49:10Z (leitura de contexto)
- **Completed:** 2026-07-17T23:55:25Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- `src/__tests__/api-v1-sales.test.ts` estabelece o **primeiro** padrão de teste de rota HTTP do projeto: `vi.mock` de `@/lib/auth/apiKey`, `@/lib/periods/ensurePeriod`, `@/lib/ratelimit`, `@/lib/supabase/admin`, com um fake Supabase client thenable (spies `vi.fn()` em `rpc`, `upsert` por tabela) — reusável pela Fase 07-04 (`/api/v1/stock`)
- 9 casos de teste cobrindo: 401 sem auth, 400 no limite de 500 vendas (D-06), 413 por `content-length` acima de 4MB, validação parcial 1 inválida/1 válida (D-13), RPC `ingest_sales_records` chamada com `p_tenant_id` do contexto (D-07/T-7-02), `sale_items.upsert` com `onConflict` contendo `order_id`, `ensurePeriodForDate` chamado 1x para 3 vendas do mesmo mês (D-08), mapping de vendor desconhecido em `connector_id_mappings` com `source_system:'api'` (D-15), e confirmação de que `tenant_id` do body é ignorado (T-7-02)
- `src/app/api/v1/sales/route.ts` implementado: auth por key → rate limit por `api_key_id` → limite de body 4MB (413, fast-path por header + reconferência real) → parse/validação parcial (Zod `safeParse` item a item) → period resolvido 1x por mês do batch → `sales_records` via RPC transacional `ingest_sales_records` (delete+insert atômico, sem perda parcial) → `sale_items` com enriquecimento de custo do catálogo (`products`) via `upsert` idempotente → namespacing de vendedor/produto desconhecido em `connector_id_mappings` (best-effort) → envelope de resposta consistente
- `npx vitest run src/__tests__/api-v1-sales.test.ts` verde (9/9); suite completa do projeto verde (72/72); `npm run build` passa

## Task Commits

1. **Task 1: Testes de /api/v1/sales (RED)** - `ec60d79` (test)
2. **Task 2: Implementar POST /api/v1/sales** - `761d562` (feat)

## Files Created/Modified

- `src/app/api/v1/sales/route.ts` - `POST` handler: auth, rate limit, 413, validação parcial, period por mês, RPC de idempotência, sale_items, D-15, envelope
- `src/__tests__/api-v1-sales.test.ts` - 9 casos de teste + padrão de mock de rota HTTP reusável

## Decisions Made

- Ver `key-decisions` no frontmatter — detecção de "desconhecido" via `goals`/`products` já carregados, sem query extra dedicada
- `client_id` do row de `sales_records` recebe `data.client_id ?? data.order_id` quando o integrador não envia identificação de cliente — evita string vazia no dashboard sem inventar dado

## Deviations from Plan

None - plan executado exatamente como escrito. As decisões de "como detectar desconhecido" (D-15) ficavam a critério da implementação (não especificadas em `<interfaces>` do plano) — resolvidas reusando queries já necessárias para custo/goals.

## Issues Encountered

None.

## User Setup Required

None - nenhuma configuração externa necessária.

## Next Phase Readiness

- `POST /api/v1/sales` pronto para uso por integradores com key válida
- Padrão de mock de rota HTTP (`vi.mock` de `createAdminClient` + fake client thenable) estabelecido e pronto para reuso direto na Fase 07-04 (`/api/v1/stock`) — mesma estrutura de `MAX_BODY_BYTES`, envelope de resposta e limite de batch pode ser copiada
- Nenhum bloqueio identificado para os próximos planos (07-04, 07-05)

## Self-Check: PASSED

- `src/app/api/v1/sales/route.ts` existe e exporta `POST`
- `src/__tests__/api-v1-sales.test.ts` existe, 9/9 testes passam
- Commits `ec60d79` e `761d562` existem no histórico
- `npm run build` passa; suite completa (72/72) verde

---
*Phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v*
*Completed: 2026-07-17*
