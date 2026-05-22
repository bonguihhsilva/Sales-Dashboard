---
phase: 03-auth-users
plan: 01
status: completed
completed_at: "2026-05-22"
executed_by: cowork
---

# Plan 03-01 Summary — Wave 1: Schema + Types + Middleware

## Status: COMPLETED

## Tasks Executed

### Task 1: Migration 0014_auth_roles.sql
- **Status:** Created. Aplicar manualmente no Supabase SQL Editor.
- **Path:** `supabase/migrations/0014_auth_roles.sql`
- **Conteudo:**
  - `profiles_role_check` expandido para 4 roles: `vendedor | adm | gerente | super_admin`
  - `profiles.active` renomeado para `ativo`
  - `convites.loja text` adicionado
- **Nota:** Migration e idempotente exceto pelo RENAME (falha se ja aplicada — sinal de ja ter sido executada).

### Task 2: src/types/index.ts
- **Status:** Completed OK
- `UserRole` expandido de 2 para 4 valores
- `Profile.active` -> `Profile.ativo`
- Campos adicionados: `numero_vendedor`, `tenant_id`, `data_admissao`, `created_at`
- `STORE_LABELS`, `STORE_COLORS`, `VendorSummary`, `ClientPortfolio`, `VendorEvolution` intactos

### Task 3: src/middleware.ts
- **Status:** Completed OK
- RBAC via `user.app_metadata?.role` — zero queries ao banco
- 5 grupos de rotas em `ROLE_RULES` (ordem: especifico antes de geral)
- `/convite` em `PUBLIC_PREFIXES` — acesso sem sessao
- `getUser()` valida JWT server-side a cada request
- Default role: `vendedor` (menor privilegio)

## TypeScript Check
- `npx tsc --noEmit` retorna APENAS erros em `src/app/dashboard/usuarios/UsersClient.tsx` (`.active` x7)
- **Esperado e previsto** — UsersClient.tsx sera reescrito no Plan 06
- **Nenhum outro erro TypeScript**

## Plan 03-02 (executado na mesma sessao)
- `src/app/login/page.tsx` reescrito com shadcn (Card, CardContent, CardHeader, Input, Button, Label)
- Logica `signInWithPassword` mantida identica
- Sem link de auto-cadastro ou recuperacao de senha
- Identidade visual DA SILVA preservada (wordmark chip accent + "Painel de Vendas")
- Todos os inline styles substituidos por classes Tailwind + CSS vars

## Pendencias
- [ ] Aplicar `0014_auth_roles.sql` no Supabase SQL Editor manualmente
- [ ] Setar `app_metadata.role` nos usuarios existentes via Supabase Auth Admin
- [ ] Plans 03-03 a 03-0N continuam (convite, tabela usuarios, etc.)
