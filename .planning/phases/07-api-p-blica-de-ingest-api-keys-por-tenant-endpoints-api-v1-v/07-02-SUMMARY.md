---
phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v
plan: 02
subsystem: auth
tags: [api-key, sha256, timingSafeEqual, zod, middleware, rate-limit, supabase]

# Dependency graph
requires:
  - phase: 07-01
    provides: "tabelas api_keys, stock_snapshots, connector_id_mappings; RPC ingest_sales_records; src/types/supabase.ts regenerado"
provides:
  - "getApiKeyContext(req) — autenticação de API pública por Bearer token, paralela a getTenantContext()"
  - "ensurePeriodForDate(admin, tenantId, saleDate) — resolução/criação de period reusável (admin UI + API pública)"
  - "saleSchema/saleItemSchema/stockItemSchema (Zod) — contratos de validação dos payloads de ingest"
  - "/api/v1 liberado no middleware (PUBLIC_PREFIXES) + apiV1RateLimiter (60/min)"
affects: ["07-03 (rota POST /api/v1/sales)", "07-04 (rota POST /api/v1/stock)", "07-05 (UI de gestão de keys)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Autenticação por API key: hash SHA-256 + lookup por key_prefix + comparação timingSafeEqual (nunca ===)"
    - "Middleware libera passagem por prefixo; autenticação real fica no route handler (defesa em profundidade, CVE-2025-29927)"
    - "Validação de payload externo com Zod safeParse item a item (suporta aceitação parcial em batch)"

key-files:
  created:
    - src/lib/auth/apiKey.ts
    - src/lib/auth/apiKey.test.ts
    - src/lib/periods/ensurePeriod.ts
    - src/lib/periods/ensurePeriod.test.ts
    - src/lib/validation/ingest.ts
  modified:
    - src/app/api/admin/ensure-period/route.ts
    - src/middleware.ts
    - src/lib/ratelimit.ts

key-decisions:
  - "Resposta de /api/admin/ensure-period preservada como { id, label, created } — 'created' derivado de uma checagem de existência feita antes de chamar ensurePeriodForDate, já que a função extraída retorna apenas o id (assinatura fixada em <interfaces> do plano)"
  - "sanitizeString() intencionalmente NÃO aplicada em ingest.ts — faz HTML-encode e corromperia nomes com & / ' no banco (Pitfall 3 do research)"
  - "last_used_at atualizado fire-and-forget (sem await bloqueante) em getApiKeyContext — não penaliza latência da resposta"

requirements-completed: [D-01, D-04, D-05, D-06, D-08, D-13]

# Metrics
duration: 6min
completed: 2026-07-17
---

# Phase 07 Plan 02: Camada de bibliotecas da API pública — Auth por key, resolução de period e validação Zod Summary

**Autenticação por API key (SHA-256 + timingSafeEqual), extração de ensurePeriodForDate reusável e schemas Zod de ingest, com /api/v1 liberado no middleware e rate limiter dedicado de 60 req/min**

## Performance

- **Duration:** 6 min
- **Started:** 2026-07-17T20:43:00-03:00 (aprox.)
- **Completed:** 2026-07-17T20:47:59-03:00
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- `getApiKeyContext(req)` resolve `tenant_id` a partir de `Authorization: Bearer gds_live_...`, rejeitando header ausente, prefixo inválido, key revogada e hash divergente — comparação sempre via `timingSafeEqual`, nunca `===`
- Lógica de resolução/criação de period (antes inline em `ensure-period/route.ts`) extraída para `ensurePeriodForDate()`, reusável tanto pela rota admin quanto pelos futuros endpoints `/api/v1/sales` e `/api/v1/stock`
- Schemas Zod (`saleSchema`, `saleItemSchema`, `stockItemSchema`) prontos para validação parcial item a item nos Plans 03/04
- `/api/v1` liberado em `PUBLIC_PREFIXES` do middleware (a autenticação real acontece no route handler, não no middleware) + `apiV1RateLimiter` (60 req/min) exportado

## Task Commits

Each task was committed atomically:

1. **Task 1: Autenticação por API key (apiKey.ts) + testes** - `db94282` (feat, tdd)
2. **Task 2: Extrair ensurePeriodForDate + refatorar rota ensure-period + teste** - `e4012ad` (refactor, tdd)
3. **Task 3: Schemas Zod de ingest + liberar /api/v1 no middleware + rate limiter** - `ba65da0` (feat)

_TDD: Tasks 1 e 2 seguiram RED→GREEN diretamente com o arquivo de teste completo por task (sem commits intermediários de RED separados) — todos os testes foram escritos e verificados verdes antes do commit único por task._

## Files Created/Modified
- `src/lib/auth/apiKey.ts` - `generateApiKey()`, `getApiKeyContext()`, `KEY_PREFIX` — hashing SHA-256 + comparação timing-safe
- `src/lib/auth/apiKey.test.ts` - 10 casos: geração de key, header ausente/inválido, prefixo errado, revogada, hash divergente, key válida
- `src/lib/periods/ensurePeriod.ts` - `ensurePeriodForDate(admin, tenantId, saleDate)` — busca/cria period, roda `calculate_vendor_goals`, fallback de cópia de metas
- `src/lib/periods/ensurePeriod.test.ts` - 3 casos: period existente, criação + RPC, derivação de year/month
- `src/lib/validation/ingest.ts` - `saleSchema`, `saleItemSchema`, `stockItemSchema` (Zod)
- `src/app/api/admin/ensure-period/route.ts` - refatorada para consumir `ensurePeriodForDate`, mantendo guards de auth/role e formato de resposta
- `src/middleware.ts` - `/api/v1` adicionado a `PUBLIC_PREFIXES`
- `src/lib/ratelimit.ts` - `apiV1RateLimiter` (60 req/min) exportado

## Decisions Made
- `ensure-period/route.ts` mantém uma checagem de existência (`select id`) antes de chamar `ensurePeriodForDate`, apenas para poder reportar `created: true/false` no envelope de resposta atual da UI (`UploadModal.tsx` depende de `data.created` para exibir "criado"/"encontrado") — a assinatura de `ensurePeriodForDate` fixada no plano retorna apenas o `id`, então esse dado extra é resolvido no nível da rota, não da função reusável.
- `sanitizeString()` deliberadamente não usada em `ingest.ts`, conforme Pitfall 3 do research (HTML-encode corromperia dados armazenados).

## Deviations from Plan

None - plan executado exatamente como escrito.

## Issues Encountered
None.

## User Setup Required

None - nenhuma configuração externa necessária.

## Next Phase Readiness
- `getApiKeyContext`, `ensurePeriodForDate` e os schemas Zod estão prontos para serem consumidos pelas rotas `POST /api/v1/sales` (Plan 03) e `POST /api/v1/stock` (Plan 04).
- `apiV1RateLimiter` pronto para uso nessas rotas.
- Nenhum bloqueio identificado para os próximos planos.

---
*Phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v*
*Completed: 2026-07-17*

## Self-Check: PASSED

Todos os arquivos criados/modificados confirmados no disco e todos os hashes de commit (`db94282`, `e4012ad`, `ba65da0`) confirmados em `git log`.
