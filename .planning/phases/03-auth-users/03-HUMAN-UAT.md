---
status: partial
phase: 03-auth-users
source: [03-VERIFICATION.md]
started: 2026-05-22T00:00:00Z
updated: 2026-05-22T00:00:00Z
---

## Current Test

[aguardando testes manuais]

## Tests

### 1. Aplicar migration 0014
expected: `supabase/migrations/0014_auth_roles.sql` aplicada ao projeto `zsczxblhtdhpdqvkpuwz`. Sem ela: `convites.loja` não existe, POST /api/admin/invite falha, CHECK de role ainda restringe 2 valores.
result: [pending]

### 2. Fluxo de convite end-to-end
expected: Link gerado abre tela de definição de senha (sem redirect para /login). Novo usuário criado tem role e loja do convite pré-configurados.
result: [pending]

### 3. Isolamento multi-tenant
expected: /dashboard/usuarios não exibe usuários do PetHub (banco compartilhado zsczxblhtdhpdqvkpuwz). Somente usuários do mesmo tenant_id do caller.
result: [pending]

### 4. RBAC no middleware
expected: Login como vendedor → tentar acessar /dashboard → redireciona para /meu-resultado. Login como adm → acessa /dashboard. Super_admin → acessa /admin/*.
result: [pending]

### 5. Deploy da Edge Function (opcional)
expected: `supabase functions deploy send-invite-email --no-verify-jwt` + `supabase secrets set RESEND_API_KEY=re_xxx`. Fluxo de convite funciona por link independentemente deste deploy.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
