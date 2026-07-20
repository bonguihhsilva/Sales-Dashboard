---
phase: 8
slug: schema-de-invent-rio-m-tricas-dos-wos-giro-e-quebra-de-estoq
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-20
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Fase é SQL puro (migrations + views + RPCs). Não há framework de teste SQL no repo hoje;
> a validação usa um script `BEGIN;...ROLLBACK;` com dados sintéticos e `RAISE EXCEPTION` por fórmula
> (proposto no 08-RESEARCH.md), mais os diagnósticos de banco de Wave 0.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | SQL verification script (transacional, sem lib nova) — Vitest do repo cobre só TS |
| **Config file** | none — script vive em `supabase/tests/08_inventory_metrics_verify.sql` |
| **Quick run command** | `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/08_inventory_metrics_verify.sql` |
| **Full suite command** | `npm run test -- --run && psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/08_inventory_metrics_verify.sql` |
| **Estimated runtime** | ~5 segundos (script SQL sintético em transação) |

---

## Sampling Rate

- **After every task commit:** Rodar o script SQL de verificação (quando a view/RPC do commit já existir)
- **After every plan wave:** Full suite (Vitest + script SQL)
- **Before `/gsd-verify-work`:** Script SQL verde + build TS verde
- **Max feedback latency:** ~10 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 8-00-01 | 00 | 0 | R-01 órfãos | — | N/A (diagnóstico) | manual/MCP | query orphan-rate via Supabase MCP | ❌ W0 | ⬜ pending |
| 8-00-02 | 00 | 0 | R-02 custo view | — | N/A (diagnóstico) | manual/MCP | `EXPLAIN ANALYZE product_inventory_metrics` | ❌ W0 | ⬜ pending |
| 8-01-01 | 01 | 1 | D-01/D-02 product_costs | — | RLS tenant_isolation ativa | SQL | script verifica `rowsecurity=true` em product_costs | ❌ W0 | ⬜ pending |
| 8-01-02 | 01 | 1 | D-05/D-06 inventory_settings | — | COALESCE default sem linha | SQL | script: tenant sem settings recebe defaults D-05 | ❌ W0 | ⬜ pending |
| 8-02-01 | 02 | 1 | D-22 índices | — | N/A | SQL | script: `pg_indexes` contém os 4 índices D-22 | ❌ W0 | ⬜ pending |
| 8-03-01 | 03 | 2 | D-08 product_daily_sales | — | exclui order_ref órfão | SQL | script: linha órfã sintética não aparece na view | ❌ W0 | ⬜ pending |
| 8-03-02 | 03 | 2 | D-10/D-11 ADS/DoS/WoS | — | NULL quando ADS=0 | SQL | script: DoS calculado = valor à mão; ADS=0 → DoS NULL | ❌ W0 | ⬜ pending |
| 8-03-03 | 03 | 2 | D-12 giro | — | NULL sem custo | SQL | script: turnover à mão; produto sem custo → NULL | ❌ W0 | ⬜ pending |
| 8-03-04 | 03 | 2 | D-13/D-14 cobertura/quebra | — | dia sem snapshot não conta | SQL | script: stockout_rate ignora dias sem snapshot | ❌ W0 | ⬜ pending |
| 8-03-05 | 03 | 2 | D-15 movement_class | — | precedência dead>slow>fast | SQL | script: 4 produtos sintéticos → classes esperadas | ❌ W0 | ⬜ pending |
| 8-04-01 | 04 | 2 | D-16 curva ABC | — | fallback receita marca abc_basis | SQL | script: cortes 80/95; item sem lucro → basis=revenue | ❌ W0 | ⬜ pending |
| 8-04-02 | 04 | 2 | D-23 product_sales_ranking | — | sem vendor_id, com store | SQL | script: coluna vendor_id ausente; store presente | ❌ W0 | ⬜ pending |
| 8-05-01 | 05 | 3 | RPCs history/summary | — | REVOKE anon/authenticated | SQL | script: grants corretos; RPC retorna shape do contrato | ❌ W0 | ⬜ pending |
| 8-05-02 | 05 | 3 | D-21 segurança views | — | GRANT só service_role | SQL | script: `has_table_privilege('anon', view, 'SELECT')`=false | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*IDs de plano/task são provisórios — o planner define a numeração real; esta tabela é o mapa de cobertura que os planos devem satisfazer.*

---

## Wave 0 Requirements

- [ ] `supabase/tests/08_inventory_metrics_verify.sql` — script de verificação transacional com dados sintéticos e `RAISE EXCEPTION` por fórmula (D-08 a D-16, D-23)
- [ ] Diagnóstico R-01: medir taxa de `sale_items` com `order_ref` órfão (sem `sales_records` correspondente) via Supabase MCP — decide se a exclusão do D-08 é aceitável
- [ ] Diagnóstico R-02: `EXPLAIN ANALYZE` de `product_inventory_metrics` no tenant de produção após índices — decide materialização (view vs materialized view)
- [ ] Diagnóstico seed: `COUNT(DISTINCT product_code)` e quantos SKUs ficam sem custo no dia 1 do seed de `product_costs`

*Sem framework novo a instalar — o script SQL roda com o `psql` já disponível ou via Supabase MCP `execute_sql`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Aplicação das migrations no banco de produção | D-01..D-23 | PORTÃO HUMANO — não manipular banco de prod autonomamente (CLAUDE.md) | Dono aprova; `supabase db push` ou aplicar migration via painel/MCP com SUPABASE_ACCESS_TOKEN |
| Custo real das views em produção (R-02) | D-20/D-22 | Depende de volume real de dados (63k+ vendas) que não existe em ambiente sintético | Rodar `EXPLAIN ANALYZE` contra o banco de prod após push |

---

## Validation Sign-Off

- [ ] Todas as tasks têm verificação SQL automatizada ou dependência de Wave 0
- [ ] Continuidade de amostragem: sem 3 tasks consecutivas sem verificação
- [ ] Wave 0 cobre todas as referências MISSING (script SQL + diagnósticos)
- [ ] Sem flags de watch-mode
- [ ] Latência de feedback < 10s
- [ ] `nyquist_compliant: true` setado no frontmatter após planner alinhar IDs

**Approval:** pending
