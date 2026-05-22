---
phase: 03-auth-users
plan: "04"
subsystem: auth
tags: [invite-accept, convite, user-creation, role-correction]
dependency_graph:
  requires: [03-01, 03-03]
  provides: [invite-accept-flow, convite-page]
  affects: [profiles, convites]
tech_stack:
  added: []
  patterns: [server-component-token-validation, client-form-submit, role-correction-after-trigger]
key_files:
  created:
    - src/app/api/admin/accept-invite/route.ts
    - src/app/convite/[token]/page.tsx
    - src/app/convite/[token]/ConviteForm.tsx
  modified: []
decisions:
  - "Importar Card/Input/Label/Button diretamente dos arquivos shadcn (nao pelo barrel index.tsx) — padrao estabelecido pela /login/page.tsx do Plan 02"
  - "placeholder email dasilva.local para convites sem email — coordenacao de credenciais fica com o gerente"
metrics:
  duration_minutes: 15
  completed_date: "2026-05-22"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 0
---

# Phase 03 Plan 04: Fluxo de Aceite de Convite Summary

**One-liner:** Route handler accept-invite com validacao de token + criacao de usuario + correcao de role via setUserRole, e pagina /convite/[token] com server-side token validation e ConviteForm client component.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar route handler POST /api/admin/accept-invite | ef2d0a2 | src/app/api/admin/accept-invite/route.ts |
| 2 | Criar pagina /convite/[token] e ConviteForm | 2fe88fe | src/app/convite/[token]/page.tsx, src/app/convite/[token]/ConviteForm.tsx |

## What Was Built

**POST /api/admin/accept-invite** (rota publica — seguranca via token):
- Valida input: token presente + password minLength 8
- Busca convite por token; retorna 404 (inexistente), 409 (usado), 410 (expirado)
- Cria usuario via `admin.auth.admin.createUser` com `email_confirm: true`
- Resolve Pitfall 3: chama `setUserRole(admin, newUserId, convite.role)` para sobrescrever o role default `vendedor` do trigger `handle_new_user` com o role do convite
- Atualiza `profiles.store` e `profiles.tenant_id` com dados do convite
- Marca `convites.usado = true` — token single-use (T-3-17)

**GET /convite/[token] — server component:**
- Async params (Next.js 15): `const { token } = await params`
- Query server-side via anon client (RLS policy `convites_token_select` permite leitura publica)
- Tres estados de erro renderizados inline (sem redirect): `invalid`, `expired`, `used`
- Estado `used` inclui link para `/login`
- Estado valido renderiza heading + subtext + ConviteForm

**ConviteForm.tsx — client component:**
- Validacao inline: `password.length < 8` e `password !== confirm`
- Submit para `/api/admin/accept-invite` via fetch POST
- Estado success: mensagem + redirect para `/login` apos 2s
- Nenhum campo de role ou loja (D-07 — vem pre-configurados do token)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] .env.local ausente no worktree**
- **Found during:** Task 1 — primeira execucao de `npm run build`
- **Issue:** O worktree nao tinha `.env.local`, causando falha de pre-render em `/login` por falta das env vars do Supabase
- **Fix:** Copiado `.env.local` do projeto principal para o worktree
- **Files modified:** `.env.local` (nao commitado — arquivo de segredo)

None other — plano executado conforme especificado.

## Security Notes (STRIDE mitigations implemented)

| Threat | Mitigation |
|--------|------------|
| T-3-05: Token expirado cria conta | `new Date(convite.expira_em) < new Date()` retorna 410 antes de createUser |
| T-3-06: Profile criado com role errado | `setUserRole` apos createUser sobrescreve role default do trigger |
| T-3-17: Reuso do token | `update({ usado: true })` apos criacao; server component e handler rejeitam `usado === true` |
| T-3-18: Client envia role/loja para escalar privilegio | role, loja, tenant_id lidos exclusivamente da tabela convites (token) |

## Self-Check

Verified:
- `src/app/api/admin/accept-invite/route.ts` exists and exports POST
- `src/app/convite/[token]/page.tsx` exists without 'use client'
- `src/app/convite/[token]/ConviteForm.tsx` exists with 'use client' as first line
- Both commits exist: ef2d0a2, 2fe88fe
- `npm run build` exit code 0

## Self-Check: PASSED
