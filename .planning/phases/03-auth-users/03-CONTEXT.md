# Phase 3: Auth & Users - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Proteção de rotas por role, redesign da página /login com design system v2, fluxo de convite por link/email substituindo criação direta por senha, e gestão completa de usuários (tabela, filtros, ações inline).

Não inclui: OAuth, auto-cadastro, configurações de tenant, importação de dados.

</domain>

<decisions>
## Implementation Decisions

### Hierarquia de Roles

- **D-01:** `gerente` ⊂ `adm`. Gerente acessa todo `/dashboard/*` EXCETO `/dashboard/config` (configurações do tenant: moeda, nome da loja). adm acessa tudo. Roles definitivos: `vendedor | adm | gerente | super_admin`.
- **D-02:** Podem criar convites: `adm`, `gerente`, `super_admin`. Qualquer role de alto nível pode convidar novos membros.
- **D-03:** Route mapping (AUTH-01): `/dashboard/*` → adm + gerente + super_admin; `/dashboard/config` → apenas adm + super_admin; `/meu-resultado/*` → vendedor; `/treinamento/*` → qualquer autenticado; `/admin/*` → super_admin.

### Middleware

- **D-04:** Role verificado via JWT `app_metadata.role` — sem query DB no middleware a cada request. Consequência: ao criar ou atualizar role de usuário, atualizar tanto `profiles.role` quanto `auth.users.app_metadata.role` via service role admin. Mudança de role reflete após logout/login do usuário.

### Fluxo de Convite

- **D-05:** Ao criar convite: UI sempre mostra o link gerado para cópia (clipboard). Se gerente preencheu email, também envia via Resend (Supabase Edge Function). Email é canal adicional, nunca obrigatório.
- **D-06:** Expiração do convite: 7 dias (já definido em `supabase/migrations/0007_convites.sql`).
- **D-07:** Página `/convite/[token]`: formulário mínimo — apenas campo senha + confirmar senha. Role e loja já vêm pré-configurados automaticamente no perfil via token. Nenhum dado adicional pedido ao usuário.

### Tabela de Usuários

- **D-08:** Ação "editar usuário": abre Sheet lateral com todos os campos editáveis: nome, role, loja, ativo. Não inline dropdown.
- **D-09:** Desativar usuário: chama `admin.updateUserById({ ban_duration: '876600h' })` via service role — invalida sessões ativas imediatamente. (~100 anos = ban permanente efetivo). Mais seguro para caso de demissão. _API atualizada conforme RESEARCH.md: o SDK JS v2 não aceita `banned: true` — o parâmetro correto é `ban_duration` (string); usar `'none'` para reativar o usuário._

### Claude's Discretion

- Visual da página /login redesenhada: usar shadcn `Card`, `Input`, `Button`, `Label` com o tema dark GDS já configurado. Manter identidade "DA SILVA / Painel de Vendas". Sem auto-cadastro.
- UI do formulário de criação de convite em `/dashboard/usuarios`: Sheet ou Dialog lateral triggered pelo botão "Convidar usuário". Campos: email (opcional), role (select), loja (select).
- Filtros da tabela de usuários: por role e por loja (dropdowns acima da tabela). Usar componentes shadcn Select já instalados.
- Skeleton loading state para tabela de usuários durante fetch.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth & Middleware
- `src/middleware.ts` — middleware atual com lógica de roles (expandir de 2 para 4 roles, migrar de DB query para JWT)
- `src/app/api/admin/create-user/route.ts` — API atual de criação direta por senha (substituir/complementar com invite flow)
- `src/lib/supabase/server.ts` — client SSR para server components e route handlers

### Schema
- `supabase/migrations/0007_convites.sql` — schema da tabela convites: token, role, loja_id, email?, expiry, usado
- `supabase/migrations/0010_rls_policies.sql` — RLS policies; app_metadata.role é fonte de verdade para acesso

### UI Existente
- `src/app/login/page.tsx` — login atual (100% inline styles, redesign com shadcn)
- `src/app/dashboard/usuarios/page.tsx` — server component de usuários (redesign)
- `src/app/dashboard/usuarios/UsersClient.tsx` — tabela atual (substituir por data-table com Sheet)

### Componentes Disponíveis
- `src/components/ui/data-table.tsx` — data-table shadcn para nova tabela de usuários
- `src/components/ui/sheet.tsx` — Sheet lateral para editar usuário
- `src/components/ui/form.tsx`, `input.tsx`, `select.tsx` — formulários de convite e /convite/[token]
- `src/components/ui/dialog.tsx` — confirmação de ações destrutivas (desativar)

### Requirements
- `.planning/REQUIREMENTS.md` §AUTH-01..AUTH-06 — critérios de aceitação exatos

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `data-table.tsx`: componente shadcn completo — usar para tabela de usuários com filtros
- `sheet.tsx`: painel lateral — usar para editar usuário e criar convite
- `form.tsx` + `input.tsx` + `select.tsx`: formulários com validação — usar em /convite/[token] e form de convite
- `dialog.tsx`: confirmação antes de desativar usuário
- `skeleton.tsx`: loading states durante fetch de dados

### Established Patterns
- Server components buscam dados e verificam auth; client components recebem dados via props (padrão atual em `/dashboard/usuarios/page.tsx` + `UsersClient.tsx`)
- Supabase service role em route handlers (`/api/admin/create-user`) para operações admin que exigem bypass de RLS
- `createServerClient` (SSR) para server components; `createClient` para client components

### Integration Points
- `src/middleware.ts` — ponto central de proteção; migrar de `profiles.select('role')` para `user.app_metadata.role`
- `src/app/api/admin/` — route handlers existentes; adicionar `POST /api/admin/invite` e `POST /api/admin/accept-invite`
- Supabase Edge Functions: criar `send-invite-email` usando Resend (AUTH-05)
- `/convite/[token]` — nova rota pública (não protegida pelo middleware)

</code_context>

<specifics>
## Specific Ideas

- O link de convite deve ter um botão "Copiar link" com feedback visual (ícone check após cópia) — UX para gerentes que compartilham via WhatsApp/Telegram
- Tabela de usuários deve mostrar "último acesso" (campo `last_sign_in_at` do Supabase auth.users, não do profiles — requer JOIN ou view separada)
- `/convite/[token]` deve verificar se token existe E não expirou E não foi usado antes de mostrar o formulário; mostrar erro claro para tokens inválidos/expirados

</specifics>

<deferred>
## Deferred Ideas

Nenhum — discussão manteve-se dentro do escopo da fase.

</deferred>

---

*Phase: 03-auth-users*
*Context gathered: 2026-05-21*
