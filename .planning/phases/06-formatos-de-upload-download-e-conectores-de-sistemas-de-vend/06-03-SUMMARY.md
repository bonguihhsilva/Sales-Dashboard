---
phase: "06"
plan: "03"
subsystem: connectors-architecture
tags: [connectors, pegasus, isrp, sync, migration, rls, tdd]
dependency_graph:
  requires:
    - 06-01 (vitest infra)
    - 06-02 (relatorios page grid lg:grid-cols-3)
  provides:
    - src/lib/connectors/base.ts (BaseConnector, ConnectorConfig, SyncResult, applySystemPrefix, SYSTEM_PREFIXES)
    - src/lib/connectors/pegasus.ts (PegasusConnector stub)
    - src/lib/connectors/isrp.ts (ISRPConnector stub)
    - src/lib/connectors/registry.ts (getConnector)
    - supabase/migrations/20260617000001_connectors.sql (tabelas connectors + connector_id_mappings com RLS)
    - /api/admin/sync-connector POST (auth dupla CRON_SECRET + getTenantContext)
    - src/app/dashboard/ConnectorsCard.tsx (status por sistema + botão sync manual)
  affects:
    - src/app/dashboard/relatorios/page.tsx (ConnectorsCard adicionado ao grid)
    - .env.example (CRON_SECRET placeholder adicionado)
tech_stack:
  added: []
  patterns:
    - TDD RED/GREEN para connectors (11 testes)
    - Auth dupla: CRON_SECRET (cron job) + getTenantContext (trigger manual)
    - Namespace por prefixo de sistema: CEC_/PEG_/ISRP_ para IDs externos (D-08/D-09)
    - Stubs com TODOs detalhados — não bloqueiam merge (D-03)
key_files:
  created:
    - supabase/migrations/20260617000001_connectors.sql
    - src/lib/connectors/base.ts
    - src/lib/connectors/pegasus.ts
    - src/lib/connectors/isrp.ts
    - src/lib/connectors/registry.ts
    - src/app/api/admin/sync-connector/route.ts
    - src/app/dashboard/ConnectorsCard.tsx
  modified:
    - src/__tests__/connectors.test.ts (substituídos it.todo por testes reais)
    - src/app/dashboard/relatorios/page.tsx (ConnectorsCard adicionado)
    - .env.example (CRON_SECRET placeholder)
decisions:
  - "applySystemPrefix é idempotente — não duplica prefixo se ID já tem o prefixo correto"
  - "sync-connector retorna 200 (não 5xx) para status stub/not_configured — comportamento esperado nesta fase, não erro de infra"
  - "ConnectorsCard usa inline styles (padrão do projeto) em vez de classes Tailwind"
metrics:
  duration_minutes: 4
  completed_date: "2026-06-17"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 3
---

# Phase 06 Plan 03: Arquitetura de Conectores (Pegasus/ISRP) — Summary

**One-liner:** Arquitetura de conectores REST completa — interfaces BaseConnector/applySystemPrefix, stubs PegasusConnector/ISRPConnector com TODOs, migration SQL com RLS por tenant, rota sync-connector com auth dupla CRON_SECRET+JWT, e ConnectorsCard na página de relatórios.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Migration SQL, interfaces base e stubs de conectores | 5a83037 | supabase/migrations/20260617000001_connectors.sql, src/lib/connectors/{base,pegasus,isrp,registry}.ts, src/__tests__/connectors.test.ts |
| 2 | Rota sync-connector e card Conectores na UI | 79cc58e | src/app/api/admin/sync-connector/route.ts, src/app/dashboard/ConnectorsCard.tsx, src/app/dashboard/relatorios/page.tsx |

## What Was Built

### Migration SQL

`supabase/migrations/20260617000001_connectors.sql` cria duas tabelas:

- `connectors`: uma linha por tenant+system (`UNIQUE(tenant_id, system)`), armazena `base_url`, `credential_secret_id` (UUID do Vault, nunca o valor bruto — D-04), `enabled`, `last_sync_at`, `last_sync_error`. Trigger `updated_at` automático.
- `connector_id_mappings`: mapeamento source_id → canonical_id por tenant, sistema e tipo de entidade (vendor/client). `canonical_id` nullable — NULL = ainda não mapeado manualmente (normal).
- RLS habilitada em ambas as tabelas com policy de isolamento por tenant via JOIN em `profiles`.

### src/lib/connectors/

- **base.ts**: `ConnectorSystem`, `ConnectorConfig`, `SyncResult`, `BaseConnector`, `SYSTEM_PREFIXES` (`CEC_`, `PEG_`, `ISRP_`), `applySystemPrefix(id, system)` — idempotente (não duplica prefixo).
- **pegasus.ts**: `PegasusConnector` implementa `BaseConnector`, lança `Error('PegasusConnector: nao implementado...')` com TODO detalhado listando 5 perguntas a responder quando a documentação da API chegar.
- **isrp.ts**: `ISRPConnector` — mesma estrutura, adaptado para ISRP.
- **registry.ts**: `getConnector(system)` — mapa estático singleton, lança Error para sistema desconhecido.

### /api/admin/sync-connector

`POST` com:
1. `strictRateLimiter` (5 req/min)
2. Auth dupla: CRON_SECRET via `Authorization: Bearer` (cron job) OU `getTenantContext()` com roles `adm/gerente/super_admin` (trigger manual — D-02)
3. Validação explícita de `system` contra `['pegasus', 'isrp']` → 400 para valor inválido (T-06-03-04)
4. Query na tabela `connectors` pelo tenant — retorna `not_configured` se não houver linha
5. Stubs lançam Error — rota captura, detecta se é stub vs erro real, registra `last_sync_error` na tabela e retorna `{ status: 'stub' }` com 200

### ConnectorsCard.tsx

Card Client Component na página de relatórios:
- Status por sistema (`not_configured` / `stub` / `connected` / `syncing` / `error`) com ícone material-symbols e cor semântica
- Botão "Forcar Sincronizacao" dispara `Promise.allSettled` para pegasus e isrp em paralelo
- `toast.info` para status `stub` (diferenciado de `toast.error` para falha real — critério do plano)
- Inline styles seguindo padrão do projeto (CSS custom properties via `var()`)

## Testes

```
Test Files  3 passed (3)
Tests       24 passed (24)
```

- 11 testes connectors: PASS (applySystemPrefix ×4, PegasusConnector stub ×2, ISRPConnector stub ×2, getConnector registry ×3)
- 6 testes export: PASS (sem regressão)
- 7 testes fingerprint: PASS (sem regressão)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Security] CRON_SECRET ausente do .env.example**
- **Found during:** Task 2 — verificação do threat model T-06-03-01
- **Issue:** `.env.example` não tinha entrada para `CRON_SECRET` — desenvolvedor novo não saberia que a variável é necessária para autenticar cron jobs
- **Fix:** Adicionado `CRON_SECRET=<gere com: openssl rand -hex 32>` ao `.env.example` como placeholder (sem valor real)
- **Files modified:** `.env.example`
- **Commit:** cc15d0e

## Known Stubs

| Stub | Arquivo | Razão |
|------|---------|-------|
| `PegasusConnector.fetchTransactions` lança Error | src/lib/connectors/pegasus.ts | D-03: documentação e credenciais da API Pegasus ainda não disponíveis |
| `ISRPConnector.fetchTransactions` lança Error | src/lib/connectors/isrp.ts | D-03: documentação e credenciais da API ISRP ainda não disponíveis |

Stubs são intencionais e documentados — D-03 explicita que credenciais não estão disponíveis. A arquitetura está completa para receber a implementação quando as credenciais chegarem.

## Threat Surface

Todos os itens do `<threat_model>` foram mitigados:

- T-06-03-01: `CRON_SECRET` adicionado ao `.env.example`; `isCronCall = false` se variável não definida (fail-safe)
- T-06-03-02: `getTenantContext()` + roles check — replicado do parse-upload
- T-06-03-03: `credential_secret_id` é UUID de referência ao Vault, nunca o valor bruto
- T-06-03-04: Validação `['pegasus', 'isrp'].includes(system)` → 400
- T-06-03-05: `strictRateLimiter` aplicado
- T-06-03-06: RLS `connectors_tenant_isolation` e `mappings_tenant_isolation` em ambas as tabelas

## Self-Check: PASSED

```
FOUND: supabase/migrations/20260617000001_connectors.sql
FOUND: src/lib/connectors/base.ts
FOUND: src/lib/connectors/registry.ts
FOUND: src/lib/connectors/pegasus.ts
FOUND: src/lib/connectors/isrp.ts
FOUND: src/app/api/admin/sync-connector/route.ts
FOUND: src/app/dashboard/relatorios/page.tsx
FOUND: src/app/dashboard/ConnectorsCard.tsx
FOUND: src/__tests__/connectors.test.ts
FOUND: commit 5a83037
FOUND: commit 79cc58e
FOUND: commit cc15d0e
```
