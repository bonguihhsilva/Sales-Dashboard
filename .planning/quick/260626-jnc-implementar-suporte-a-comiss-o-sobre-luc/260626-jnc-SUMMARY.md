---
phase: quick
plan: 260626-jnc
subsystem: commission-engine
tags: [commission, profit, sale-items, products, migration, upload]
decisions:
  - "vendor_summary é VIEW (não tabela) — recriada via DROP/CREATE para incluir total_profit e commission_type"
  - "sale_items enrichment em parse-upload é best-effort (não falha o parse se tabela não existir ainda)"
  - "upload-catalog retorna apenas { imported: N } — tenant_id sempre do JWT, nunca do body (T-jnc-01)"
  - "UNIQUE constraint em sale_items: (tenant_id, period_id, order_id, product_code) adicionada na migration"
tech-stack:
  added: []
  patterns:
    - "Flexible header detection para catálogos HTML/XLSX (por nome de coluna, não posição fixa)"
    - "commission_type como discriminante de base de cálculo: revenue → total_sold, profit → total_profit"
key-files:
  created:
    - supabase/migrations/20260626171308_profit_commission.sql
    - src/app/api/admin/upload-catalog/route.ts
  modified:
    - src/types/index.ts
    - src/lib/parser.ts
    - src/app/api/admin/parse-upload/route.ts
    - src/app/api/admin/calcular-comissao/route.ts
    - src/app/dashboard/UploadModal.tsx
metrics:
  duration: ~35min
  completed: "2026-06-26"
  tasks: 3
  files: 7
---

# Quick 260626-jnc: Comissão sobre Lucro — Summary

**One-liner:** Schema migration + upload de catálogo + sale_items enrichment + engine commission_type-aware com UI de catálogo no UploadModal.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Migration — products, sale_items, goals.commission_type, vendor_summary | 300d1ab | supabase/migrations/20260626171308_profit_commission.sql |
| 2 | Parser + types + upload-catalog endpoint | ed784f4 | src/types/index.ts, src/lib/parser.ts, src/app/api/admin/upload-catalog/route.ts |
| 3 | sale_items enrichment + engine comissão + UI catálogo | 590929b | parse-upload/route.ts, calcular-comissao/route.ts, UploadModal.tsx |

## What Was Built

### Migration (Task 1)
- `products` table: catálogo versionado por `(tenant_id, period_id, product_code)` — RLS habilitado
- `sale_items` table: itens individuais com `total_profit` calculado, index em `(tenant_id, period_id, vendor_id)`, UNIQUE em `(tenant_id, period_id, order_id, product_code)` — RLS habilitado
- `goals.commission_type TEXT DEFAULT 'revenue' CHECK IN ('revenue','profit')`
- `vendor_summary` VIEW recriada com `total_profit` (subquery de sale_items) e `commission_type` (de goals)

### Parser + Types + Upload Catalog (Task 2)
- `SaleTransaction`: campos opcionais `product_code?`, `unit_price?`, `unit_cost?`, `margin_pct?`
- `Goal`: campo `commission_type: 'revenue' | 'profit'`
- `VendorSummary`: campos `commission_type` e `total_profit`
- `Product` interface adicionada
- `POST /api/admin/upload-catalog`: aceita HTML ou XLSX, detecta colunas por header text (case-insensitive, PT/EN), upsert idempotente por `(tenant_id, period_id, product_code)`, limite 10MB, auth adm/gerente/super_admin

### Enrichment + Engine + UI (Task 3)
- `parse-upload/route.ts`: após parse, se transactions têm `product_code` e período existe no DB, busca costs de `products`, calcula `total_profit` por item, upserta em `sale_items` — best-effort (não quebra fluxo se catálogo não foi carregado)
- `calcular-comissao/route.ts`: seleciona base de cálculo por `commission_type` (`total_profit` vs `total_sold`), inclui `commission_type`, `total_profit`, `base_value` no `detalhamento`
- `UploadModal.tsx`: tab "Vendas" (existente, inalterada) + tab "Catálogo de Produtos" com seletor de período, file picker (.html/.xlsx), status e botão Importar

## Deviations from Plan

### Auto-applied

**1. [Rule 2 - Security] tenant_id nunca aceito do body em upload-catalog**
- Threat model T-jnc-01 exigia isso explicitamente — implementado via `profile.tenant_id` do JWT

**2. [Rule 2 - Missing] UNIQUE constraint em sale_items adicionada na migration**
- Plan mencionava no comentário do código mas não na DDL — adicionada diretamente na migration para garantir idempotência do upsert

**3. [Rule 3 - Blocking] vendor_summary DROP CASCADE**
- vendor_summary é VIEW, não tabela — DROP VIEW ... CASCADE usado; funções SQL que referenciam a view (vendor_evolution) não são afetadas pelo CASCADE pois são SECURITY DEFINER functions, não views dependentes

## Known Stubs

Nenhum stub de dados — todos os campos novos são calculados server-side.

## Threat Surface

| Flag | File | Description |
|------|------|-------------|
| (mitigated) T-jnc-01 | upload-catalog/route.ts | tenant_id sempre do JWT; role check adm/gerente/super_admin |
| (mitigated) T-jnc-02 | parse-upload/route.ts | total_profit calculado server-side de products.cost_price |
| (mitigated) T-jnc-04 | upload-catalog/route.ts | Limite 10MB aplicado antes do parse |

## Pending (Manual)

- **Aplicar migration ao banco**: o arquivo `supabase/migrations/20260626171308_profit_commission.sql` está commitado mas precisa ser aplicado via Supabase MCP (`mcp__supabase__apply_migration`) ou dashboard SQL editor. Sem credenciais de DB disponíveis no ambiente de execução.

## Self-Check: PASSED

- [x] `supabase/migrations/20260626171308_profit_commission.sql` — existe
- [x] `src/app/api/admin/upload-catalog/route.ts` — existe  
- [x] `src/types/index.ts` — Goal.commission_type, VendorSummary.total_profit, Product interface adicionados
- [x] `src/lib/parser.ts` — SaleTransaction campos opcionais adicionados
- [x] Commits: 300d1ab, ed784f4, 590929b — presentes
- [x] `npm run build` — passou sem erros TypeScript
