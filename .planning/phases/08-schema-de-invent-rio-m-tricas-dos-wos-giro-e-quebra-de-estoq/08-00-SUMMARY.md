---
phase: 08-schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq
plan: 00
subsystem: database
tags: [supabase, postgres, diagnostics, mcp, read-only]

# Dependency graph
requires: []
provides:
  - "08-DIAGNOSTICS.md com as queries prontas de R-01 (órfãos order_ref) e R-04 (cobertura do seed de product_costs), status PENDENTE de execução"
  - "Registro explícito de que a decisão D-08 (excluir órfãos vs. fallback) está bloqueada até execução manual das queries"
affects: [08-01, 08-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Diagnóstico read-only via Supabase MCP execute_sql antes de escrever views que dependem de junções não verificadas (padrão a repetir em fases futuras com riscos de dados)"

key-files:
  created:
    - .planning/phases/08-schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq/08-DIAGNOSTICS.md
  modified: []

key-decisions:
  - "Diagnósticos R-01 e R-04 marcados como PENDENTE em vez de inventar números — ferramenta MCP Supabase (execute_sql) e ToolSearch não estavam disponíveis neste agente executor, e não há conexão Postgres direta (.env.local só tem credenciais REST/PostgREST)"
  - "Nenhuma alternativa não-sancionada (ex. script supabase-js com service_role key) foi usada para contornar a indisponibilidade do MCP — seguiu-se literalmente a instrução de fallback do orquestrador (registrar PENDENTE, não inventar números)"

patterns-established:
  - "Quando o executor não tem a ferramenta MCP Supabase disponível, documentar o PENDENTE com as queries verbatim + instruções de execução manual, em vez de bloquear silenciosamente ou simular resultados"

requirements-completed: [D-03, D-07, D-08]

# Metrics
duration: ~10min
completed: 2026-07-20
---

# Phase 08 Plan 00: Diagnósticos read-only pré-view (R-01 órfãos / R-04 cobertura seed) Summary

**Diagnósticos de produção (taxa de órfãos `order_ref` e cobertura do seed de `product_costs`) documentados em `08-DIAGNOSTICS.md` como PENDENTE — a ferramenta MCP Supabase `execute_sql` não estava disponível neste agente executor, então nenhum número foi medido nem inventado; a decisão D-08 fica bloqueada até uma execução manual.**

## Performance

- **Duration:** ~10 min
- **Tasks:** 2/2 completadas (ambas resultaram em registro PENDENTE, não em números reais)
- **Files modified:** 1 (`08-DIAGNOSTICS.md`, criado)

## Accomplishments
- `08-DIAGNOSTICS.md` criado com as 4 queries de diagnóstico (2 de R-01, 2 de R-04) copiadas verbatim de `08-RESEARCH.md`, prontas para execução.
- Critério de decisão de D-08 (limiar de 1% de `orphan_pct`) documentado explicitamente, aguardando os números reais.
- Confirmado e documentado: nenhuma escrita ocorreu no banco de produção em nenhum momento desta execução.
- Bloqueio explícito registrado para o Plano 08-02 (`product_daily_sales`), que depende do resultado de R-01.

## Task Commits

Each task was committed atomically:

1. **Task 1: Medir taxa de órfãos order_ref (R-01) por tenant** - `d957483` (docs) — registrado como PENDENTE, não medido
2. **Task 2: Dimensionar cobertura do seed de product_costs (R-04)** - `16f0be7` (docs) — registrado como PENDENTE, não medido

**Plan metadata:** (este commit de SUMMARY, ver commit seguinte)

## Files Created/Modified
- `.planning/phases/08-schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq/08-DIAGNOSTICS.md` - Queries de diagnóstico R-01/R-04, status PENDENTE, decisão D-08 documentada como bloqueada

## Decisions Made
- **Registrar PENDENTE em vez de tentar um caminho alternativo de acesso ao banco:** o ambiente deste agente executor não expõe nenhuma ferramenta `mcp__supabase__*` nem `ToolSearch`; `.env.local` só contém `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (credenciais REST/PostgREST, não uma connection string de `psql`), e não há `supabase/config.toml` de stack local. As `critical_constraints` do plano previam exatamente este cenário e instruíam explicitamente registrar PENDENTE sem inventar números — essa instrução foi seguida literalmente, sem improvisar um script supabase-js de leitura direta em produção como workaround não sancionado.
- **Nenhuma decisão de design foi tomada** (D-08 excluir órfãos vs. fallback; suficiência do seed de `product_costs`) — ambas ficam explicitamente em aberto até a medição real acontecer.

## Deviations from Plan

### Auto-fixed Issues

Nenhum desvio de código — este plano é 100% diagnóstico/documentação, sem código de aplicação ou migration.

**1. [Rule 3 - Blocking] Ferramenta MCP Supabase indisponível — plano ajustado para caminho de fallback já previsto**
- **Found during:** Task 1 (medição de órfãos `order_ref`)
- **Issue:** O plano instruía rodar `execute_sql` via MCP Supabase; essa ferramenta (e `ToolSearch` para carregá-la) não estava disponível na lista de ferramentas deste agente executor, nem havia connection string Postgres direta em `.env.local` para um caminho alternativo via `psql`.
- **Fix:** Seguido o comportamento de fallback já especificado nas `critical_constraints` do plano: `08-DIAGNOSTICS.md` registra o diagnóstico como PENDENTE, com as queries prontas e a decisão explicitamente marcada como bloqueada — nenhum número foi inventado.
- **Files modified:** `.planning/phases/08-schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq/08-DIAGNOSTICS.md`
- **Verification:** `grep -q "orphan_pct"`, `grep -q "DECISÃO:"`, `grep -q "R-04"`, `grep -q "skus_periodo_recente"` — todos retornam match (critério de aceitação automatizado do plano).
- **Committed in:** `d957483` (Task 1), `16f0be7` (Task 2)

---

**Total deviations:** 1 auto-fixed (1 blocking — caminho de fallback previamente especificado no próprio plano, não uma decisão nova)
**Impact on plan:** Nenhum scope creep. O objetivo do plano ("resultado vai para 08-DIAGNOSTICS.md com a decisão registrada") foi cumprido no sentido de que a decisão registrada é "PENDENTE, bloqueante" — que é o resultado correto quando a medição não pode ser feita com segurança, em vez de uma decisão fabricada.

## Issues Encountered
- Nenhuma ferramenta de acesso a banco de dados (MCP Supabase, `ToolSearch`, ou connection string Postgres) estava disponível para este agente executor. Resolvido documentando o PENDENTE em vez de improvisar acesso não sancionado a produção.

## User Setup Required

**Ação manual necessária antes do Plano 08-02.** Rodar as 4 queries em `08-DIAGNOSTICS.md` (seções R-01 e R-04) via uma sessão com a ferramenta Supabase MCP `execute_sql` disponível, ou via SQL Editor do Supabase Studio (projeto `zsczxblhtdhpdqvkpuwz`), e atualizar o arquivo com:
1. Os valores reais de `orphan_pct` por tenant e a linha `DECISÃO:` (excluir órfãos se `orphan_pct < 1%` em todos os tenants, ou escalar/fallback se `>= 1%` em qualquer um).
2. Os valores reais de `skus_periodo_recente` / `vendidos_sem_catalogo_recente` e a conclusão sobre suficiência do seed de `product_costs`.

## Next Phase Readiness
- **Bloqueado:** o Plano 08-02 (`product_daily_sales`) depende da decisão D-08, que por sua vez depende da medição real de `orphan_pct` — não deve prosseguir com a suposição de que a taxa é baixa.
- O Plano 08-01 (schema/seed de `product_costs`) pode em princípio prosseguir com a estrutura de tabela (D-01/D-02/D-05/D-06), mas a decisão sobre se o seed simples do período mais recente é suficiente (R-04) também está pendente da mesma medição manual.
- Nenhuma escrita ocorreu no banco de produção nesta execução — estado do banco inalterado.

---
*Phase: 08-schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq*
*Completed: 2026-07-20*

## Self-Check: PASSED

- FOUND: `.planning/phases/08-schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq/08-DIAGNOSTICS.md`
- FOUND: `.planning/phases/08-schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq/08-00-SUMMARY.md`
- FOUND commit: `d957483` (Task 1)
- FOUND commit: `16f0be7` (Task 2)
