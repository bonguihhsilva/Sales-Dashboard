---
phase: 03-auth-users
plan: 03
subsystem: auth
tags: [supabase, invite, rbac, jwt, app_metadata, roles, route-handler]

# Dependency graph
requires:
  - phase: 03-auth-users/03-01
    provides: "UserRole expandido para 4 valores (vendedor|adm|gerente|super_admin) em src/types/index.ts"
provides:
  - "src/lib/auth/roles.ts — utilitario centralizado de roles com setUserRole, canInvite, isValidRole, INVITE_ALLOWED_ROLES, ASSIGNABLE_ROLES"
  - "POST /api/admin/invite — cria convite na tabela convites e retorna link /convite/[token]"
affects:
  - 03-auth-users/03-04
  - 03-auth-users/03-06

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "setUserRole como ponto unico de mutacao de role: atualiza app_metadata + profiles.role simultaneamente (D-04)"
    - "caller verificado via app_metadata.role do JWT, nao via query DB"
    - "token de convite gerado pelo DEFAULT gen_random_uuid()::text do Postgres — nunca Math.random()"
    - "tenant_id do convite lido de profiles do caller, nao aceito do body (T-3-15)"

key-files:
  created:
    - src/lib/auth/roles.ts
    - src/app/api/admin/invite/route.ts
  modified:
    - src/app/dashboard/usuarios/UsersClient.tsx

key-decisions:
  - "Token de convite nao gerado no JS — vem do DEFAULT gen_random_uuid()::text do Postgres para garantir 122 bits de entropia"
  - "tenant_id nao aceito do body — lido de profiles.tenant_id do caller para prevenir spoofing entre tenants (T-3-15)"
  - "envio de email nao ocorre neste handler — deferred para Plan 05; handler retorna email_requested para UI saber"
  - "setUserRole centralizado em src/lib/auth/roles.ts para ser reutilizado pelos Plans 04 e 06"

patterns-established:
  - "Pattern: canInvite(callerRole) verifica via JWT app_metadata, nao via query DB"
  - "Pattern: admin client criado inline nos route handlers (service role key nunca prefixada com NEXT_PUBLIC_)"

requirements-completed: [AUTH-03]

# Metrics
duration: 18min
completed: 2026-05-22
---

# Phase 03 Plan 03: Backend de Criacao de Convites Summary

**Utilitario `src/lib/auth/roles.ts` com setUserRole (D-04) e route handler `POST /api/admin/invite` que valida caller via JWT, insere em `convites` com token UUID do Postgres e retorna link `/convite/[token]`**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-22T19:47:00Z
- **Completed:** 2026-05-22T20:05:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- `src/lib/auth/roles.ts` exporta `INVITE_ALLOWED_ROLES`, `ASSIGNABLE_ROLES`, `isValidRole`, `canInvite`, `setUserRole` — reutilizavel pelos Plans 04 e 06
- `POST /api/admin/invite` retorna 403 para vendedor, cria convite para adm/gerente/super_admin, retorna `{ link, token, expira_em, email_requested }`
- Token de convite com 122 bits de entropia via `gen_random_uuid()` do Postgres — sem `Math.random()`

## Task Commits

1. **Task 1: Criar utilitario src/lib/auth/roles.ts** - `9d0ccfe` (feat)
2. **Task 2: Criar route handler POST /api/admin/invite** - `9b19a0e` (feat)

## Files Created/Modified
- `src/lib/auth/roles.ts` — constantes e funcoes de role; setUserRole atualiza app_metadata + profiles juntos
- `src/app/api/admin/invite/route.ts` — POST handler com auth check, validacao de payload, insert em convites e retorno de link
- `src/app/dashboard/usuarios/UsersClient.tsx` — fix de tipo: `profile.active` -> `profile.ativo` (alinhado com Profile type da Plan 03-01)

## Decisions Made
- Token gerado pelo Postgres (nao pelo JS) para garantir entropia criptografica
- `tenant_id` lido de `profiles` do caller (nao do body) para prevenir spoofing cross-tenant (T-3-15)
- Email de convite deferido para Plan 05; este handler apenas retorna `email_requested: boolean`
- `setUserRole` centralizado como unico ponto de mutacao de role (D-04) para evitar dessincronizacao app_metadata/profiles

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrigido profile.active -> profile.ativo em UsersClient.tsx**
- **Found during:** Task 1 (verificacao de build)
- **Issue:** `UsersClient.tsx` usava `profile.active` mas o tipo `Profile` foi atualizado para `ativo` na Plan 03-01. Build falhava com erro de tipo TypeScript.
- **Fix:** Substituidas 4 referencias: `toggleActive`, `opacity` condicional, badge de status e texto do botao
- **Files modified:** `src/app/dashboard/usuarios/UsersClient.tsx`
- **Verification:** `npm run build` passou apos a correcao
- **Committed in:** `9d0ccfe` (incluido no commit da Task 1)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug de tipo pre-existente)
**Impact on plan:** Fix necessario para o build passar. Sem escopo adicional.

## Issues Encountered
- `.env.local` nao existia na worktree — copiado do projeto principal para permitir o build (prerender de `/login` requeria variaveis Supabase)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `setUserRole` disponivel para Plans 04 (accept-invite) e 06 (edit-user sheet)
- `canInvite` disponivel para UI do Sheet de convite (Plan 06)
- `ASSIGNABLE_ROLES` disponivel para o select de role no formulario de convite
- Blocker: migration 0014 (coluna `loja` na tabela `convites`) deve estar aplicada no Supabase antes de usar o endpoint em producao

## Self-Check: PASSED
- `src/lib/auth/roles.ts`: FOUND
- `src/app/api/admin/invite/route.ts`: FOUND
- Commit `9d0ccfe`: FOUND
- Commit `9b19a0e`: FOUND

---
*Phase: 03-auth-users*
*Completed: 2026-05-22*
