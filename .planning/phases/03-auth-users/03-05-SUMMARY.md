---
phase: 03-auth-users
plan: 05
subsystem: auth
tags: [edge-function, email, resend, invite, deno]
dependency_graph:
  requires: [03-03]
  provides: [send-invite-email-edge-function, email-integration-invite-route]
  affects: [invite-flow, AUTH-05]
tech_stack:
  added: []
  patterns: [supabase-edge-function-deno, resend-http-api, graceful-degradation-optional-feature]
key_files:
  created:
    - supabase/functions/send-invite-email/index.ts
  modified:
    - src/app/api/admin/invite/route.ts
    - tsconfig.json
decisions:
  - "Edge Function usa fetch HTTP direto para Resend — sem SDK npm, runtime Deno puro"
  - "supabase/functions/ excluido do tsconfig.json para evitar erro Deno is not defined no build Next.js"
  - "Email e canal adicional (D-05): ausencia de RESEND_API_KEY retorna sent:false com status 200, nao erro"
metrics:
  duration_minutes: 15
  completed_date: "2026-05-22"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
requirements: [AUTH-05]
---

# Phase 03 Plan 05: Edge Function send-invite-email + Integracao no Invite Route Summary

**One-liner:** Edge Function Deno com Resend HTTP API para email de convite, integrada no POST /api/admin/invite com degradacao gracosa quando RESEND_API_KEY ausente.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar Edge Function send-invite-email | ede0126 | supabase/functions/send-invite-email/index.ts |
| 2 | Integrar chamada de email no route handler | 9acd648 | src/app/api/admin/invite/route.ts, tsconfig.json |

## What Was Built

### Task 1 — Edge Function supabase/functions/send-invite-email/index.ts

Edge Function Deno que envia email de convite via Resend API (HTTP direto, sem SDK npm). Caracteristicas:

- Responde `OPTIONS` com CORS headers (preflight)
- Sem `RESEND_API_KEY`: retorna `{ sent: false, reason: '...' }` com status 200 — nao e erro (D-05)
- JSON invalido ou campos ausentes (`to`, `inviteLink`): retorna 400
- Chama `https://api.resend.com/emails` com template HTML do Painel Da Silva
- Remetente: `onboarding@resend.dev` (dominio de teste Resend, nao exige verificacao)
- Resposta: `{ sent: boolean, result: ResendApiResponse }`

**Deploy necessario (CLI nao disponivel no ambiente de execucao):**
```bash
supabase functions deploy send-invite-email --no-verify-jwt
supabase secrets set RESEND_API_KEY=re_xxx
```

### Task 2 — Integracao no POST /api/admin/invite

Adicionado entre a insercao do convite e o `return`:

- Busca nome do sender em `profiles.name` para personalizar o email
- `admin.functions.invoke('send-invite-email', { body: { to, inviteLink, senderName } })`
- Toda logica de email dentro de `try/catch` — falha nunca quebra o convite (D-05)
- `emailSent = !fnError && fnData?.sent === true`
- Response agora inclui `email_sent: boolean`

**Correcao de bloqueio (Regra 3):** `tsconfig.json` excluia apenas `node_modules`. O arquivo Deno em `supabase/functions/` causava `Cannot find name 'Deno'` no type-check do Next.js. Adicionado `"supabase/functions"` ao `exclude` para isolar o runtime Deno do compilador TypeScript do Next.js.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] tsconfig.json nao excluia supabase/functions/**
- **Found during:** Task 2 verification (`npm run build`)
- **Issue:** `include: ["**/*.ts"]` incluia o arquivo Deno na compilacao TypeScript do Next.js, causando `Type error: Cannot find name 'Deno'`
- **Fix:** Adicionado `"supabase/functions"` ao array `exclude` do `tsconfig.json`
- **Files modified:** `tsconfig.json`
- **Commit:** 9acd648 (incluso no commit da Task 2)

## Deploy Status

| Item | Status |
|------|--------|
| Edge Function arquivo criado | DONE |
| `supabase functions deploy send-invite-email --no-verify-jwt` | PENDENTE — CLI nao disponivel no worktree |
| `supabase secrets set RESEND_API_KEY=re_xxx` | PENDENTE — aguarda chave do Resend Dashboard |
| Resend domain verification | PENDENTE — usando onboarding@resend.dev para testes |

**Nota:** O convite funciona completamente pelo link mesmo sem o deploy da Edge Function. O `try/catch` no route handler garante degradacao gracosa — `email_sent: false` quando a funcao nao esta deployada.

## Threat Model Coverage

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-3-21: RESEND_API_KEY exposta | Lida via `Deno.env.get` — nunca no codigo | DONE |
| T-3-23: Remetente falsificado | `from` fixo no codigo da Edge Function | DONE |
| T-3-24: Falha email impede convite | `try/catch` + `emailSent=false` em qualquer erro | DONE |
| T-3-22: Spam via Edge Function publica | Accept — Resend rate limiting + template fixo | ACCEPTED |
| T-3-25: inviteLink no corpo do email | Accept — token expira em 7 dias, single-use | ACCEPTED |

## Known Stubs

Nenhum. Edge Function completa — sem dados hardcoded que afetam funcionalidade principal.

## Self-Check: PASSED

- `supabase/functions/send-invite-email/index.ts`: FOUND
- `src/app/api/admin/invite/route.ts`: FOUND (contem functions.invoke + email_sent)
- `tsconfig.json`: FOUND (contem supabase/functions no exclude)
- Commit ede0126: FOUND
- Commit 9acd648: FOUND
- `npm run build`: exit code 0
