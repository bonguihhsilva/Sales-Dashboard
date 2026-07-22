---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Ferramenta Escalável
status: executing
stopped_at: Fase 08 fechada (8/8, 91 asserts verdes em prod); Fase 09 implementada; 07/08/09 em produção
last_updated: "2026-07-22T00:00:00.000Z"
last_activity: 2026-07-22 -- deploy de 44 commits + 08-06 executado em prod (91/91) + R-02
progress:
  total_phases: 9
  completed_phases: 7
  total_plans: 25
  completed_plans: 25
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-24)

**Core value:** Gerentes enxergam performance real de cada vendedor e calculam comissões corretamente.
**Current focus:** Fechar pendências de verificação das Fases 08/09 — o código já está em produção.

## Current Position

Phase: 8 (inventário) — 8/8 COMPLETA; Phase 9 (role compras) — implementada
Status: Código de 07/08/09 EM PRODUÇÃO desde 2026-07-22
Last activity: 2026-07-22 -- deploy de 44 commits; 08-06 rodado em prod (91/91); R-02 medido

### Deploy (2026-07-22)

`origin/main` = `f000cc3`. Vercel → `https://dashboard.gds-frame.com`.
Antes deste push, `origin/main` estava 44 commits atrás: as Fases 07, 08 e 09 estavam prontas mas invisíveis em produção. O gargalo era push, não código.

Verificação pós-deploy (sem login):
- `GET /api/v1/sales` → **405** = rota existe = Fase 07 no ar
- `/dashboard/compras` → redirect para `/login` = rota existe + guard do middleware OK = Fase 09 no ar
- Landing renderiza normal — middleware não quebrou nada

Migrations: as 10 da Fase 08/09 já estavam aplicadas no banco de prod ANTES do deploy do código (conferido via MCP `list_migrations`). Banco à frente do código = direção segura.

### Pendências abertas

| Item | Status | Bloqueia? |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` na Vercel | NÃO VERIFICADA — só o dono acessa | Se inválida, telas de Compras e rotas admin renderizam vazio **em silêncio**. App não cai (`f000cc3`). |
| `SUPABASE_SERVICE_ROLE_KEY` em `.env.local` | CORROMPIDA (60 chars, segs 36/11/11, payload não decodifica) | Dev local: `createAdminClient` falha. Corrigir com `node scripts/fix-service-role.mjs` |
| 08-06 script SQL de verificação | FECHADO — 91/91 asserts passaram contra prod, zero resíduo | Não |
| 08-07 plano formal de push | FECHADO — push era obsoleto; EXPLAIN R-02 executado | Não |
| UAT manual (07-05 e2e, 09-UAT) | NUNCA executado com login real | Não bloqueia deploy, mas nenhuma tela foi aberta por um usuário |
| 12 erros de tipo em `src/__tests__/api-v1-sales.test.ts` | PRÉ-EXISTENTES (Fase 7, mocks mal tipados) | Não — não entram no `npm run build` |

### R-02 — EXPLAIN ANALYZE de `product_inventory_metrics` (2026-07-22, tenant loja-demo)

`Execution Time: 9.809 ms`, `Planning Time: 7.180 ms`. Todos os buffers `shared hit` — zero leitura de disco. Os 4 índices do D-22 aparecem no plano (`idx_stock_snapshots_tenant_product_date`, `stock_snapshots_tenant_date`, `product_costs_pkey`, `products_tenant_id_period_id_product_code_key`).

Passa hoje, mas com dois achados de escala:

1. **Seq scan sem pushdown de tenant.** O CTE `window_sales` varre `sale_items` (438 linhas) e `sales_records` (558) inteiras e só depois filtra por tenant. Irrelevante neste volume; com centenas de milhares de linhas vira o gargalo da tela de Compras. Se for otimizar, é aqui.
2. **Estatísticas desatualizadas.** O planner estima `rows=1` onde o real é 438, e `rows=2` onde é 1685 — erro de 100-400x. Nessa escala ele acerta o plano mesmo assim; com volume real pode escolher plano ruim. Um `ANALYZE` em `sale_items`, `sales_records` e `stock_snapshots` resolve. NÃO executado: o CLAUDE.md do projeto proíbe manipular o banco diretamente.

### Verificação do 08-06 (2026-07-22)

Script rodado contra o banco de PRODUÇÃO em uma única chamada, envelope `BEGIN`/`ROLLBACK` intacto. **91/91 asserts passaram.** Antes de rodar, o canal MCP foi testado com uma probe (`CREATE TABLE` + `ROLLBACK` → `to_regclass` null) provando que ele honra transação; sem isso os INSERTs sintéticos teriam persistido. Depois, `SELECT` confirmou zero resíduo em `tenants`, `product_costs`, `stock_snapshots`, `sales_records` e `periods`.

### Branches

Todas as branches antigas (`feat/lms-db-migration`, `fix/criticos-auth-rotas-rbac`, `fix/masquerade-tenant-consistency`, `fix/quick-wins-2026-06-05`, `fix/verificacao-2026-06-03`) já estão em `main` — 0 commits à frente, podem ser deletadas.
`origin/vercel/react-server-components-cve-*` é obsoleta: `next@15.5.18` já é versão corrigida.

Progress: [██████████] 100% dos planos — restam apenas os UATs manuais

## Performance Metrics

**Velocity:**

- Total plans completed: 3
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 06 | 3 | - | - |
| Phase 07 P01 | 10min | 2 tasks | 4 files |
| Phase 07 P02 | 6min | 3 tasks | 8 files |
| Phase 07 P03 | 8min | 2 tasks | 2 files |
| Phase 07 P04 | 10min | 2 tasks | 2 files |

## Accumulated Context

| Phase 06 P01 | 8 | 2 tasks | 8 files |
| Phase 06 P02 | 12 | 2 tasks | 8 files |
| Phase 06 P03 | 4 | 2 tasks | 10 files |

### Decisions

- [Bootstrap]: `sales_records` mantido como tabela principal — `vendas` v2 adiada (sem parser CEC mapeado)
- [Bootstrap]: Worktrees desabilitados (`use_worktrees: false`) — solo developer, sem necessidade de isolamento
- [Auth]: Role lida de `user.app_metadata.role` (JWT), não de `profiles.role` (DB) — elimina redirect loop e DB round-trip
- [Schema]: `goals.period_id` é `integer` (NÃO `periodo_id` — nome em inglês)
- [Schema]: `periods` usa `year` e `month` (NÃO `ano`/`mes` — nomes em inglês)
- [Schema]: RLS usa join via `profiles` table, NÃO `auth.jwt() ->> 'tenant_id'`
- [Schema]: ENUM `user_role` tem apenas 2 valores: `adm`, `vendedor` — `gerente` e `super_admin` NÃO existem no ENUM (requerem `ALTER TYPE` se adicionados)
- [Schema]: UUIDs de seed são fixos (não gerados dinamicamente)
- [Schema]: `widget_types` é global (não por tenant)
- [Schema]: `trilhas` são nullable (módulo LMS pode não estar configurado por tenant)
- [Schema]: Migration 0001 foi reparada — não re-aplicar do zero
- [Tooling]: `supabase gen types` usar com `2>/dev/null` para suprimir warnings de stderr
- [Phase 06]: detectFileSystem retorna null (não 'generic') para CSV/XLSX sem assinatura conhecida — força dropdown D-06
- [Phase 06]: looksLikeCecHtml requer 3+ linhas de dado para evitar falsos positivos
- [Phase 06]: Buffer → Uint8Array para Web Response: TypeScript strict rejeita Buffer como BodyInit — cast explícito para Uint8Array resolve sem perda de dados
- [Phase 06]: Roundtrip bold via Styles.Fonts: xlsx-js-style persiste font.bold no XML mas popula wb.Styles.Fonts, não cell.s.font — teste verifica via array de fontes do workbook
- [Phase 06]: applySystemPrefix é idempotente — não duplica prefixo se ID já contém o prefixo correto
- [Phase 06]: sync-connector retorna 200 para status stub/not_configured — comportamento esperado, não erro de infra
- [Phase 07]: stock_snapshots e o nome da serie de estoque desta fase — Fase 08 (inventario/giro/quebra) consome esta serie
- [Phase 07]: api_keys nunca armazena a key crua: so key_hash (SHA-256 hex) + key_prefix; RLS deny-all (USING false), gestao exclusiva via service-role
- [Phase 07]: Drift legado de migration history (~45 versoes) NAO reparado — padrao desta base: aplicar migrations novas via MCP apply_migration + migration repair --status applied pontual
- [Phase 07]: ensure-period/route.ts mantem checagem de existencia previa para reportar created:true/false na resposta, ja que ensurePeriodForDate() retorna apenas o id (assinatura fixada no plano)
- [Phase 07]: D-15 (07-03): deteccao de vendor/product desconhecido reusa queries ja necessarias (goals/products) em vez de query dedicada
- [Phase 07]: [Phase 07 P04]: D-15 para /api/v1/stock simplificado — upsert incondicional em connector_id_mappings com ignoreDuplicates:true (sem query previa de 'conhecidos'), pois o endpoint nao consulta products/goals

### Blockers/Concerns

- **⚠️ SEMPRE**: Rodar comandos GSD de `C:\Projetos\da-silva-dashboard` — nunca do umbrella `C:\Projetos` (GSD não detecta .planning/ e retorna planning_exists: false)
- **Housekeeping**: `02-VALIDATION.md` (old roadmap Phase 2) ainda com `status: draft` / `nyquist_compliant: false` — não bloqueia nada
- **✅ RESOLVIDO**: 47/47 users têm `role` em `app_metadata` — bulk update foi feito (verificado 2026-05-26 via SQL)
- **✅ RESOLVIDO**: Edge Function `send-invite-email` ACTIVE v1 — deployada (verificado 2026-05-26 via MCP)
- **CRÍTICO — MANUAL**: `goals.meta1/meta2/meta3 = 0` para todos os 69 registros de Maio 2026 → rankings quebrados. **Ação:** acessar `/dashboard/metas` e setar thresholds reais. NÃO via SQL (por design).
- **CRÍTICO — MANUAL**: `SUPABASE_SERVICE_ROLE_KEY` no Vercel — verificar se está atualizado após rotação → pode causar `/dashboard/usuarios` vazia. **Ação:** Vercel → Settings → Env Vars
- **CRÍTICO — MANUAL**: Site URL Supabase Auth — confirmar se está `https://dashboard.gds-frame.com` (não localhost:3000). **Ação:** Supabase → Auth → URL Configuration → Site URL
- **Pendente**: `suporte@gds-frame.com` (super_admin) não existe no Supabase Auth — criar via painel
- Banco compartilhado com PetHub (`zsczxblhtdhpdqvkpuwz`) — migrar PetHub antes de escalar multi-tenant
- **✅ RESOLVIDO (parcial)**: Blocker do push da migration 20260714000001 — Opção A executada: `20260617000001_connectors.sql` (fase 6, nunca aplicada no remoto — root cause) e `20260714000001` aplicadas via MCP `apply_migration` + `migration repair --status applied` pontual. **Drift legado (~45 versões) permanece**: futuros `supabase db push` continuarão falhando — usar MCP apply_migration + repair pontual como padrão desta base.

### Roadmap Evolution

- Phase 6 added: Formatos de upload/download e conectores de sistemas de vendas (CEC, Pegasus, ISRP)

### Pending Todos

- [ ] Setar thresholds reais em `/dashboard/metas` para Maio 2026 (meta1/meta2/meta3) — **você faz**
- [ ] Verificar/atualizar `SUPABASE_SERVICE_ROLE_KEY` no Vercel env vars — **você faz**
- [ ] Confirmar Site URL = `https://dashboard.gds-frame.com` no Supabase Auth — **você faz**
- [ ] Criar usuário `suporte@gds-frame.com` com role `super_admin` no Supabase Auth — **pode delegar**

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260626-jq5 | Tour guiado na landing page com seleção de papel (admin/gerente/vendedor) | 2026-06-26 | f3f3656 | [260626-jq5-adicionar-tour-guiado-de-visita-auto-gui](.planning/quick/260626-jq5-adicionar-tour-guiado-de-visita-auto-gui/) |
| 260626-jnc | Implementar suporte a comissão sobre lucro: migration products+sale_items+goals.commission_type, parser catálogo HTML+Excel, estender parser vendas, enriquecimento sale_items, total_profit em vendor_summary, engine comissão, UI upload catálogo | 2026-06-26 | 590929b | [260626-jnc-implementar-suporte-a-comiss-o-sobre-luc](.planning/quick/260626-jnc-implementar-suporte-a-comiss-o-sobre-luc/) |
| 260701-rm0 | Adicionar trilha Perfumaria (13 modulos) ao LMS | 2026-07-01 | (pending) | [260701-rm0-adicionar-trilha-perfumaria-13-modulos-a](.planning/quick/260701-rm0-adicionar-trilha-perfumaria-13-modulos-a/) |
| 260701-s5o | Separar as 14 trilhas do Centro de Treinamentos em 3 categorias visuais (Vendas e Atendimento, Skin Care, Perfumes) via mapa estático front-end | 2026-07-01 | 31e3e83 | [260701-s5o-separar-trilhas-do-centro-de-treinamento](.planning/quick/260701-s5o-separar-trilhas-do-centro-de-treinamento/) |

## Session Continuity

Last session: 2026-07-18T00:01:00.725Z
Stopped at: Completed 07-04-PLAN.md
Resume file: None
