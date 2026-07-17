---
phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v
plan: 01
subsystem: database
tags: [supabase, postgres, migrations, rls, plpgsql, api-keys, sha-256]

# Dependency graph
requires:
  - phase: 06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend
    provides: connector_id_mappings (tabela estendida por este plano com 'api'/'product')
provides:
  - Tabela api_keys (hash SHA-256, key_prefix único, scopes default ['*'], last_used_at, revoked_at, RLS negando acesso direto)
  - Tabela stock_snapshots agregada por tenant com UNIQUE(tenant_id, product_code, snapshot_date)
  - connector_id_mappings aceita source_system='api' e entity_type='product'
  - RPC ingest_sales_records(p_tenant_id, p_rows): delete+insert transacional de vendas por order_ref
  - src/types/supabase.ts regenerado com as novas tabelas e a RPC
affects: [07-02, 07-03, 07-04, 07-05, fase-08-inventario]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RLS deny-all (USING false) para tabelas gerenciadas exclusivamente via service-role"
    - "RPC plpgsql para delete+insert atômico (transação implícita de corpo de função)"

key-files:
  created:
    - supabase/migrations/20260714000001_api_keys_and_stock_snapshots.sql
  modified:
    - src/types/supabase.ts
    - .gitignore

key-decisions:
  - "Nome da série de estoque desta fase: stock_snapshots — a Fase 08 consome esta série"
  - "api_keys nunca armazena a key crua: só key_hash (SHA-256 hex) + key_prefix para lookup/exibição"
  - "Drift legado de migration history (~45 versões) NÃO foi reparado — só as versões 20260617000001 e 20260714000001 foram marcadas applied"

patterns-established:
  - "RLS deny-all: CREATE POLICY ... FOR ALL USING (false) quando gestão é exclusiva do service-role"
  - "Idempotência de ingest via delete+insert por order_ref dentro de função plpgsql (rollback automático em falha)"

requirements-completed: [D-02, D-04, D-07, D-09, D-10, D-11, D-12, D-15]

# Metrics
duration: 10min
completed: 2026-07-17
---

# Phase 07 Plan 01: Schema api_keys + stock_snapshots + RPC ingest_sales_records Summary

**Schema da API pública de ingest aplicado ao banco remoto: api_keys com SHA-256 e RLS deny-all, stock_snapshots com upsert diário por tenant, connector_id_mappings estendido para 'api'/'product', e RPC transacional ingest_sales_records — tipos TS regenerados.**

## Performance

- **Duration:** ~10 min (com pausa de checkpoint human-action no meio)
- **Started:** 2026-07-17T23:30:53Z
- **Completed:** 2026-07-17T23:40:40Z
- **Tasks:** 2/2
- **Files modified:** 4 (migration, types, .gitignore, STATE.md)

## Accomplishments

- Migration `20260714000001_api_keys_and_stock_snapshots.sql` criada e aplicada ao projeto remoto `zsczxblhtdhpdqvkpuwz` (via MCP `apply_migration` pelo orquestrador, após falha do `supabase db push`)
- `api_keys`: key_prefix UNIQUE, key_hash SHA-256 (nunca a key crua), scopes `ARRAY['*']`, RLS `FOR ALL USING (false)` — acesso só via service-role (T-7-07 mitigado)
- `stock_snapshots`: agregado por tenant, `UNIQUE(tenant_id, product_code, snapshot_date)` para upsert diário, sem coluna de custo (D-12), RLS `tenant_isolation` via join em profiles (T-7-09 mitigado)
- `connector_id_mappings` aceita `source_system='api'` e `entity_type='product'` (D-15)
- RPC `ingest_sales_records`: delete+insert de vendas por `order_ref` numa única transação plpgsql, delete sempre escopado a `tenant_id = p_tenant_id` (T-7-14 mitigado)
- `src/types/supabase.ts` regenerado — inclui `api_keys`, `stock_snapshots`, `connectors`, `connector_id_mappings` e a Function `ingest_sales_records`; `npm run build` passa

## Task Commits

1. **Task 1: Criar migration api_keys + stock_snapshots + ALTER + RPC** - `a670fc5` (feat)
2. **(docs) Registrar blocker de drift de migration history** - `8a494c7` (docs)
3. **Task 2: Aplicar schema remoto + regenerar tipos** - `f374fd0` (feat)

## Files Created/Modified

- `supabase/migrations/20260714000001_api_keys_and_stock_snapshots.sql` - Schema completo da fase: api_keys, stock_snapshots, ALTER CHECKs, RPC ingest_sales_records
- `src/types/supabase.ts` - Tipos regenerados do banco remoto (inclui também connectors/connector_id_mappings pela primeira vez, ver deviation 2)
- `.gitignore` - `supabase/.temp/` ignorado (metadata de link do CLI contém project refs)

## Decisions Made

- **`stock_snapshots` é o nome da série de estoque desta fase** — a Fase 08 (inventário/giro/quebra) consome esta série (registrado conforme nota de design do plano)
- **Drift legado de migration history NÃO reparado** — ~45 versões remotas com timestamps divergentes dos arquivos locais permanecem em drift; só `20260617000001` e `20260714000001` foram marcadas `applied`. Repará-las com `--status reverted` arriscaria re-execução de seeds/ALTERs não-idempotentes em produção (47 usuários, 63.906 vendas)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Migration da fase 6 (`20260617000001_connectors.sql`) ausente no banco remoto**
- **Found during:** Task 2 (aplicação do schema remoto)
- **Issue:** A migration de conectores da fase 6 (cria `connectors` + `connector_id_mappings`) nunca tinha sido aplicada ao remoto — o `ALTER TABLE connector_id_mappings` desta fase falhava por tabela inexistente. Root cause da falha do `supabase db push`, além do drift legado pré-existente.
- **Fix:** Orquestrador aplicou `20260617000001_connectors.sql` e depois `20260714000001_api_keys_and_stock_snapshots.sql` via MCP `apply_migration`, seguido de `supabase migration repair --status applied` para ambas as versões (somente elas).
- **Files modified:** nenhum arquivo local — mudança no banco remoto + tabela de histórico de migrations
- **Verification:** SQL confirmou existência de `api_keys`, `stock_snapshots`, `connector_id_mappings`, RPC `ingest_sales_records` e CHECKs com 'api'/'product'; tipos regenerados contêm as 4 tabelas + RPC; `npm run build` passa
- **Committed in:** f374fd0 (Task 2 — tipos refletem o estado remoto corrigido)

**2. [Rule 2 - Missing Critical] `supabase/.temp/` adicionado ao .gitignore**
- **Found during:** Task 2 (após `supabase link`)
- **Issue:** O CLI gerou `supabase/.temp/` untracked com project refs e pooler URL — CLAUDE.md proíbe commitar identificadores de projeto
- **Fix:** Entrada `supabase/.temp/` adicionada ao `.gitignore`
- **Files modified:** `.gitignore`
- **Verification:** `git status` limpo quanto a `supabase/.temp/`
- **Committed in:** f374fd0

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Deviation 1 era pré-requisito real do schema desta fase (dependência da fase 6 não materializada no remoto). Sem scope creep.

## Issues Encountered

- **`supabase db push` falhou por drift de migration history** — ~45 versões remotas registradas sob timestamps diferentes dos arquivos locais atuais (drift pré-existente, anterior a esta fase). Checkpoint human-action acionado; usuário/orquestrador escolheu a Opção A (aplicar só as migrations novas via MCP + repair pontual), preservando o histórico legado intacto. Blocker documentado em STATE.md.

## Threat Flags

Nenhuma superfície nova além das previstas no `<threat_model>` do plano (T-7-07, T-7-09, T-7-10, T-7-14 — todas endereçadas na migration).

## User Setup Required

None - no external service configuration required. (A aplicação remota já foi feita durante a execução.)

## Next Phase Readiness

- Fundação de banco pronta: Plans 07-02 (helper de auth), 07-03 (endpoint de vendas → `ingest_sales_records`), 07-04 (endpoint de estoque → `stock_snapshots`) e 07-05 (UI de keys → `api_keys`) podem executar
- Atenção residual: drift legado de migration history permanece — futuros `supabase db push` continuarão reclamando das ~45 versões antigas; usar MCP `apply_migration` + `migration repair --status applied <versão>` pontual como padrão desta base

## Self-Check: PASSED

- Arquivos criados/modificados existem (migration, types, SUMMARY)
- Commits a670fc5, 8a494c7, f374fd0 existem no histórico

---
*Phase: 07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v*
*Completed: 2026-07-17*
