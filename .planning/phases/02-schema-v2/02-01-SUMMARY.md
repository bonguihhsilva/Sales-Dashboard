---
phase: 02-schema-v2
plan: 01
status: complete
completed: 2026-05-21
build: passing
migrations_applied: 13
---

# Phase 2 — Schema v2 — SUMMARY

## O Que Foi Construído

### Migrations aplicadas (0001–0013)

| Migration | Conteúdo | Status |
|-----------|----------|--------|
| 0001 | Schema v1 (profiles, periods, goals, sales_records, views, RPCs) | Applied (repair) |
| 0002 | Tabela `tenants` + colunas v2 em `profiles` | Applied |
| 0003 | Tabelas `categorias` e `produtos` (hierarquia pai_id) | Applied |
| 0004 | Tabelas `vendas` e `itens_venda` — **periodo_id INTEGER** | Applied |
| 0005 | Tabelas `regras_comissao` e `comissoes_calculadas` — **periodo_id INTEGER** | Applied |
| 0006 | Tabelas `widget_types` (global) e `dashboard_layouts` | Applied |
| 0007 | Tabela `convites` (token + expiry 7 dias) | Applied |
| 0008 | LMS: `trilhas`, `modulos`, `licoes`, `quiz_questoes`, `progresso_usuario`, `quiz_resultados` | Applied |
| 0009 | `gamificacao` (xp, nivel, streak, badges jsonb) | Applied |
| 0010 | RLS completo em todas as 17 tabelas novas + `handle_new_user` atualizado | Applied |
| 0011 | Seed: 7 `widget_types` | Applied |
| 0012 | Seed: Trilha "Vendas no Varejo CDE" — 8 módulos, 24 lições, 12 quiz_questoes | Applied |
| 0013 | Seed: tenant `gds-interno` + backfill profiles.tenant_id | Applied |

## Decisões Críticas para Fases Seguintes

### 1. `periodo_id` é INTEGER (não uuid)
`periods.id` é `serial` (integer) no schema original. Todas as FKs para `periods` devem usar `integer`.
- Afeta: Phase 3 (Auth), Phase 4 (Import CEC), Phase 5 (Comissão)
- Arquivos: `0004_vendas_itens.sql`, `0005_motor_comissao.sql`

### 2. Padrão RLS: tenant via profiles
```sql
(SELECT tenant_id FROM profiles WHERE id = auth.uid())
```
Não usar `auth.jwt() ->> 'tenant_id'` — JWT custom claim não está configurado (requer Auth Hook no plano atual).

### 3. UUID fixos dos seeds

| Entidade | UUID |
|----------|------|
| tenant `gds-interno` | `aaaaaaaa-0000-0000-0000-000000000001` |
| trilha "Vendas no Varejo CDE" | `11111111-0000-0000-0000-000000000001` |
| módulos (8) | `22222222-0000-0000-0000-0000000000{01..08}` |

### 4. `profiles.role` é ENUM
Valores válidos: `adm` | `vendedor` apenas. Não usar `'gerente'` ou `'super_admin'` em SQL sem primeiro adicionar ao enum.

### 5. `widget_types` sem `tenant_id`
Global por design — sem dados sensíveis. Qualquer autenticado pode ler via RLS.

### 6. `trilhas.tenant_id` permite NULL
`NULL` = conteúdo global acessível por todos os tenants. Conteúdo exclusivo de um tenant usa `tenant_id NOT NULL`.

## Artefatos Gerados

- `src/types/supabase.ts` — gerado via `supabase gen types typescript --linked 2>/dev/null`
- Contém: `tenants`, `vendas`, `trilhas`, `gamificacao`, `widget_types` e demais tabelas novas

## Verificações Automáticas

- `npm run build` — PASSOU (9 rotas, 0 erros TypeScript)
- `npx supabase migration list --linked` — 0001–0013 todos Local=Remote

## Verificações Manuais Pendentes (Tarefa 4 — checkpoint humano)

Executar no SQL Editor do Studio (`zsczxblhtdhpdqvkpuwz`):

```sql
SELECT count(*) FROM widget_types;                            -- esperado: 7
SELECT count(*) FROM modulos;                                 -- esperado: 8
SELECT * FROM tenants WHERE slug = 'gds-interno';             -- esperado: 1 row
SELECT count(*) FROM profiles WHERE tenant_id IS NULL;        -- esperado: 0
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;               -- rowsecurity=true nas novas
```

## Desvios do Spec Original

| Desvio | Motivo |
|--------|--------|
| `profiles.role IN ('adm','gerente','super_admin')` removido das RLS | `profiles.role` é ENUM com apenas `adm\|vendedor` — valores extras causariam erro de cast |
| Migration `0001` marcada como `applied` via repair (não executada) | Schema v1 já existia no banco remoto; re-executar causaria erro em `CREATE POLICY` duplicado |
| stderr redirecionado para `/dev/null` no `gen types` | CLI imprime "Initialising login role..." no stdout junto com os tipos quando não há TTY |

## key-files.created

- `supabase/migrations/0002_tenants.sql`
- `supabase/migrations/0003_produtos_categorias.sql`
- `supabase/migrations/0004_vendas_itens.sql`
- `supabase/migrations/0005_motor_comissao.sql`
- `supabase/migrations/0006_dashboard_widgets.sql`
- `supabase/migrations/0007_convites.sql`
- `supabase/migrations/0008_lms_schema.sql`
- `supabase/migrations/0009_gamificacao.sql`
- `supabase/migrations/0010_rls_policies.sql`
- `supabase/migrations/0011_seed_widget_types.sql`
- `supabase/migrations/0012_seed_lms_conteudo.sql`
- `supabase/migrations/0013_seed_tenant_inicial.sql`
- `src/types/supabase.ts`
