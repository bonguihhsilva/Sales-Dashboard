---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Ferramenta Escalável
status: planning
stopped_at: Phase 6 context gathered
last_updated: "2026-06-17T13:56:31.424Z"
last_activity: 2026-05-26 — Auditoria real executada via Supabase MCP. Bloqueadores revisados.
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-24)

**Core value:** Gerentes enxergam performance real de cada vendedor e calculam comissões corretamente.
**Current focus:** Phase 01 — Segurança & Estabilidade

## Current Position

Phase: 1 of 4 (Segurança & Estabilidade)
Plan: 0 of 2 in current phase
Status: Ready to plan
Last activity: 2026-05-26 — Auditoria real executada via Supabase MCP. Bloqueadores revisados.

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

## Accumulated Context

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

## Session Continuity

Last session: 2026-06-17T13:56:31.416Z
Stopped at: Phase 6 context gathered
Resume file: .planning/phases/06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend/06-CONTEXT.md
