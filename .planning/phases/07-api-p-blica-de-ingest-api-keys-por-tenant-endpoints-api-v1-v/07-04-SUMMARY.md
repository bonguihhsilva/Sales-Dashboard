---
phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v
plan: 04
subsystem: api
tags: [nextjs, route-handler, api-key-auth, zod, upsert, vitest]

# Dependency graph
requires:
  - phase: 07-01
    provides: "tabela stock_snapshots com UNIQUE(tenant_id, product_code, snapshot_date); connector_id_mappings estendido para 'api'/'product'"
  - phase: 07-02
    provides: "getApiKeyContext, stockItemSchema (Zod), apiV1RateLimiter, /api/v1 liberado no middleware"
  - phase: 07-03
    provides: "Padrão de teste de rota HTTP (vi.mock de createAdminClient/getApiKeyContext/apiV1RateLimiter com fake client), padrão de envelope de resposta e MAX_BODY_BYTES"
provides:
  - "POST /api/v1/stock — endpoint de ingest de snapshot diário de estoque autenticado por API key"
affects: ["07-05 (UI de gestão de keys — endpoint já consumível)", "Fase 08 (DoS/WoS/giro/quebra de estoque consome a série stock_snapshots)", "Fase 09 (telas de compras)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Namespacing de desconhecidos simplificado via upsert incondicional com ignoreDuplicates:true — dispensa query prévia de 'conhecidos' quando não há enriquecimento de custo/goals no endpoint (diferente do padrão usado em /api/v1/sales)"

key-files:
  created:
    - src/app/api/v1/stock/route.ts
    - src/__tests__/api-v1-stock.test.ts
  modified: []

key-decisions:
  - "D-15 para /api/v1/stock: como o endpoint não consulta products/goals (sem enriquecimento de custo), o namespacing de connector_id_mappings faz upsert incondicional de todo product_code do batch com ignoreDuplicates:true, em vez de checar previamente uma lista de 'conhecidos' (padrão usado em /api/v1/sales) — mais simples e igualmente idempotente"
  - "data.snapshot_date da resposta reflete a data padrão (hoje) usada quando o item não especifica snapshot_date — não é um resumo por item, apenas o valor de fallback aplicado no batch"

requirements-completed: [D-09, D-10, D-11, D-12, D-13, D-14, D-15]

# Metrics
duration: 10min
completed: 2026-07-17
---

# Phase 07 Plan 04: POST /api/v1/stock — Ingest de snapshot diário de estoque Summary

**Endpoint de ingest de snapshot de estoque autenticado por API key, agregado por tenant (sem loja/custo), com upsert diário por (tenant, produto, dia), validação parcial em batch, limite de body (413) e namespacing best-effort de produtos desconhecidos — 7 testes cobrindo auth, DoS, upsert e isolamento de tenant.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-07-17T23:58:00Z (leitura de contexto)
- **Completed:** 2026-07-18T00:00:16Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- `src/__tests__/api-v1-stock.test.ts` reusa o padrão de mock de rota HTTP estabelecido em 07-03 (`vi.mock` de `@/lib/auth/apiKey`, `@/lib/ratelimit`, `@/lib/supabase/admin`, spies `vi.fn()` em `.upsert` por tabela) — 7 casos cobrindo: 401 sem auth, upsert diário com `onConflict` contendo `snapshot_date` (default para hoje quando ausente no item), 413 por `content-length` acima de 4MB, validação parcial 1 inválido/1 válido (D-13), mapping de produto em `connector_id_mappings` com `source_system:'api'`/`entity_type:'product'` (D-15), confirmação de que `tenant_id` do body é ignorado (T-7-02) e confirmação de que `cost`/`unit_cost`/`store` nunca chegam à row gravada (D-10/D-12)
- `src/app/api/v1/stock/route.ts` implementado: auth por key → rate limit por `api_key_id` → limite de body 4MB (413, fast-path por header + reconferência real) → parse/validação parcial (Zod `safeParse` item a item) → upsert em `stock_snapshots` com `onConflict: 'tenant_id,product_code,snapshot_date'` (D-11, último POST do dia vence) → namespacing best-effort de produtos em `connector_id_mappings` com `ignoreDuplicates:true` (D-15) → envelope de resposta consistente com o padrão de `/api/v1/sales`
- `npx vitest run src/__tests__/api-v1-stock.test.ts` verde (7/7); suite completa do projeto verde (79/79); `npm run build` passa

## Task Commits

1. **Task 1: Testes de /api/v1/stock (RED)** - `7d1ec8e` (test)
2. **Task 2: Implementar POST /api/v1/stock** - `df5e4d8` (feat)

## Files Created/Modified

- `src/app/api/v1/stock/route.ts` - `POST` handler: auth, rate limit, 413, validação parcial, upsert diário, D-15, envelope
- `src/__tests__/api-v1-stock.test.ts` - 7 casos de teste reusando o padrão de mock de rota HTTP de 07-03

## Decisions Made

Ver `key-decisions` no frontmatter — a simplificação do namespacing D-15 (upsert incondicional + `ignoreDuplicates`) foi possível porque o endpoint de estoque não precisa consultar `products`/`goals` para nenhum outro propósito (ao contrário de `/api/v1/sales`, que já tinha essas queries disponíveis para enriquecimento de custo).

## Deviations from Plan

None - plan executado exatamente como escrito.

## Issues Encountered

None.

## User Setup Required

None - nenhuma configuração externa necessária.

## Next Phase Readiness

- `POST /api/v1/stock` pronto para uso por integradores com key válida
- Série `stock_snapshots` pronta para ser consumida pela Fase 08 (DoS/WoS/giro/quebra de estoque)
- Nenhum bloqueio identificado para o próximo plano (07-05 — UI de gestão de keys)

---
*Phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v*
*Completed: 2026-07-17*

## Self-Check: PASSED

- `src/app/api/v1/stock/route.ts` existe e exporta `POST`
- `src/__tests__/api-v1-stock.test.ts` existe, 7/7 testes passam
- Commits `7d1ec8e` e `df5e4d8` confirmados em `git log`
- `npm run build` passa; suite completa (79/79) verde
