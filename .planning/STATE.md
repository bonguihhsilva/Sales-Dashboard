---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Ferramenta Escalável
status: verifying
stopped_at: "Completed quick task 260701-s5o: separar trilhas do Centro de Treinamentos em 3 categorias"
last_updated: "2026-07-01T23:23:40.132Z"
last_activity: "2026-06-26 - Completed quick task 260626-jnc: comissão sobre lucro (products, sale_items, engine, UI)"
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-24)

**Core value:** Gerentes enxergam performance real de cada vendedor e calculam comissões corretamente.
**Current focus:** Phase 06 — formatos-de-upload-download-e-conectores-de-sistemas-de-vend

## Current Position

Phase: 06
Plan: Not started
Status: Phase complete — ready for verification
Last activity: 2026-07-01 - Completed quick task 260701-s5o: separar trilhas do Centro de Treinamentos em 3 categorias

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 3
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 06 | 3 | - | - |

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

Last session: 2026-07-01T23:23:40.129Z
Stopped at: Completed quick task 260701-s5o: separar trilhas do Centro de Treinamentos em 3 categorias
Resume file: None
