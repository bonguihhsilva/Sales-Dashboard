---
phase: 03-auth-users
plan: "06"
subsystem: usuarios-management
tags: [auth, usuarios, disable-user, update-user, data-table, shadcn, multi-tenant]
dependency_graph:
  requires: ["03-01", "03-03"]
  provides: ["disable-user-route", "update-user-route", "users-table-v2", "invite-sheet", "edit-sheet", "disable-dialog"]
  affects: ["dashboard/usuarios", "api/admin/disable-user", "api/admin/update-user"]
tech_stack:
  added: []
  patterns:
    - "ban_duration via admin.auth.admin.updateUserById para desativacao reversivel"
    - "DataTable com Column<Record<string,unknown>> + cast interno para tipos concretos"
    - "base-ui Select onValueChange tipado como (string|null) — requer wrapper handlers"
    - "Sheets controlados por estado (open/onOpenChange) sem SheetTrigger inline"
key_files:
  created:
    - src/app/api/admin/disable-user/route.ts
    - src/app/api/admin/update-user/route.ts
  modified:
    - src/app/dashboard/usuarios/page.tsx
    - src/app/dashboard/usuarios/UsersClient.tsx
decisions:
  - "Skeleton omitido: page.tsx e server component — dados chegam prontos sem estado de loading de tabela"
  - "Tasks 3/4/5 implementadas no mesmo commit de UsersClient para resolver conflito de tipos entre page.tsx e UsersClient"
  - "Column<Record<string,unknown>> com cast r as unknown as UserRow no render — contorna invariancia do generic DataTable"
  - "handleReenviarConvite gera convite link-only (sem email) pois profiles nao tem coluna email confiavel"
metrics:
  duration: "~25 min"
  completed_date: "2026-05-22T20:07:42Z"
  tasks_completed: 5
  files_changed: 4
---

# Phase 03 Plan 06: Tabela de Usuarios Completa (AUTH-06) Summary

Tabela `/dashboard/usuarios` reescrita com DataTable shadcn, filtros de role/loja, Sheet de convite (email opcional + link copiar), Sheet de edicao (update-user + disable-user sequencial), Dialog de desativacao (ban_duration) e acao Reenviar convite funcional. Resolve definitivamente a falha de build do Plan 01 (UsersClient usava `p.active`).

## Tasks Completed

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| 1 | Criar disable-user e atualizar update-user | f6d34a5 | Done |
| 2 | Reescrever page.tsx com guard 4 roles e fetch tenant | 67664eb | Done |
| 3 | UsersClient — estrutura base, DataTable, filtros | 06a9a4b | Done |
| 4 | UsersClient — Sheet de convite | 06a9a4b | Done |
| 5 | UsersClient — Sheet de edicao, Dialog desativacao, handleReenviarConvite | 06a9a4b | Done |

## Key Artifacts

### src/app/api/admin/disable-user/route.ts
- POST handler que bane usuario via `ban_duration: '876600h'` (desativar) ou `'none'` (reativar)
- Bloqueia auto-desativacao: `userId === user.id` retorna 400
- Sincroniza `profiles.ativo` apos ban
- Guard: `canInvite(callerRole)` — aceita adm|gerente|super_admin via `app_metadata`

### src/app/api/admin/update-user/route.ts
- POST handler para editar name, role, store de um usuario
- Usa `setUserRole` quando role muda (atualiza `app_metadata` + `profiles.role` atomicamente)
- Guard: `canInvite(callerRole)` — substitui o guard antigo de 1 role (`profile?.role !== 'adm'`)
- Valida role com `isValidRole` (nao aceita super_admin via UI — T-3-28)

### src/app/dashboard/usuarios/page.tsx
- Server component sem `'use client'`
- Guard: `['adm', 'gerente', 'super_admin'].includes(callerRole)` via `app_metadata.role`
- Fetch de profiles filtrado por `tenant_id` do caller (Pitfall 4 — T-3-07)
- Merge de `last_sign_in_at` via `admin.auth.admin.listUsers({ perPage: 1000 })`
- Exporta `UserRow = Profile & { last_sign_in_at: string | null }`
- Filtros `role` e `loja` aplicados em memoria sobre lista pequena
- `from('goals')` removido (fora do escopo desta fase)

### src/app/dashboard/usuarios/UsersClient.tsx
- Client component com DataTable shadcn (7 colunas)
- Filtros de role e loja via Select + `useRouter().push` para searchParams
- PageHeader com botao "Convidar usuario"
- EmptyState quando lista vazia
- Sheet de convite: email opcional, role/loja, POST /api/admin/invite, link + botao copiar (feedback Check/1500ms)
- Sheet de edicao: pre-preenchido de `editingUser`, salva update-user DEPOIS disable-user se ativo mudou (D-08, D-09)
- Dialog de desativacao: textos adaptativos ativo/inativo, chama disable-user
- `handleReenviarConvite`: POST /api/admin/invite com role e loja do usuario (link-only sem email)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tasks 3/4/5 implementadas em conjunto por bloqueio de tipos**
- **Found during:** Task 3 — após escrever page.tsx, o build falhou porque UsersClient ainda tinha props antigas (`profiles`, `vendorOptions`)
- **Issue:** page.tsx reescrito (Task 2) passa `users: UserRow[]` mas UsersClient esperava `profiles: Profile[]`
- **Fix:** UsersClient foi reescrito completamente (Tasks 3+4+5 em sequência) para resolver o erro de compilação
- **Files modified:** src/app/dashboard/usuarios/UsersClient.tsx
- **Commit:** 06a9a4b

**2. [Rule 1 - Bug] DataTable generic incompativel com UserRow**
- **Found during:** Task 3
- **Issue:** `DataTable<T extends Record<string,unknown>>` nao aceita `Column<UserRow>[]` por invariancia de generics TypeScript strict
- **Fix:** Colunas declaradas como `Column<Record<string,unknown>>[]` com cast `r as unknown as UserRow` dentro de cada `render`
- **Files modified:** src/app/dashboard/usuarios/UsersClient.tsx
- **Commit:** 06a9a4b

**3. [Rule 1 - Bug] base-ui Select onValueChange recebe string|null**
- **Found during:** Task 3
- **Issue:** `Select.onValueChange` do base-ui tem assinatura `(value: string|null, ...) => void` — setters `setState<string>` nao sao diretamente atribuiveis
- **Fix:** Handlers de filtro tipados como `(value: string|null)`, setters de form wrapped em `(v) => { if (v) setter(v) }`
- **Files modified:** src/app/dashboard/usuarios/UsersClient.tsx
- **Commit:** 06a9a4b

### Design Decisions

**Skeleton omitido:**
O plan menciona skeleton como opcional. Como page.tsx e server component, os dados chegam prontos — nao ha estado de loading da tabela. O `DataTable` ja inclui skeleton via prop `loading` para uso futuro, mas a lista de usuarios e servida pre-populada pelo server. Documentado conforme instrucao do plan.

**handleReenviarConvite — email omitido:**
`UserRow` e derivado de `profiles` que nao tem coluna `email` confiavel (alguns usuarios criados com placeholder `@dasilva.local`). O convite e gerado como link-only, compativel com o comportamento documentado na interface `/api/admin/invite`.

## Known Stubs

Nenhum. Todos os dados fluem do servidor para a tabela sem valores hardcoded ou placeholders.

## Threat Flags

Nenhuma superficie nova alem do que o threat model do plan ja cobre (T-3-07, T-3-26, T-3-27, T-3-28, T-3-29, T-3-30, T-3-31).

## Self-Check: PASSED

- FOUND: src/app/api/admin/disable-user/route.ts
- FOUND: src/app/api/admin/update-user/route.ts
- FOUND: src/app/dashboard/usuarios/page.tsx
- FOUND: src/app/dashboard/usuarios/UsersClient.tsx
- FOUND: .planning/phases/03-auth-users/03-06-SUMMARY.md
- FOUND commit f6d34a5 (disable-user + update-user routes)
- FOUND commit 67664eb (page.tsx rewrite)
- FOUND commit 06a9a4b (UsersClient rewrite)
- Build: verde (exit code 0)
