# Phase 3: Auth & Users — Research

**Researched:** 2026-05-21
**Domain:** Supabase Auth (JWT/app_metadata), Next.js 15 middleware RBAC, invite flow, Edge Functions
**Confidence:** HIGH (stack verificado no codebase; APIs confirmadas via docs oficiais)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `gerente` ⊂ `adm`. Gerente acessa todo `/dashboard/*` EXCETO `/dashboard/config`. Roles definitivos: `vendedor | adm | gerente | super_admin`.
- **D-02:** Podem criar convites: `adm`, `gerente`, `super_admin`.
- **D-03:** Route mapping — `/dashboard/*` → adm + gerente + super_admin; `/dashboard/config` → apenas adm + super_admin; `/meu-resultado/*` → vendedor; `/treinamento/*` → qualquer autenticado; `/admin/*` → super_admin.
- **D-04:** Role verificado via JWT `app_metadata.role` no middleware — sem query DB. Ao criar/atualizar role: atualizar `profiles.role` E `auth.users.app_metadata.role` via admin API. Mudança de role reflete após logout/login.
- **D-05:** Convite: UI sempre mostra link gerado para cópia. Email via Resend/Edge Function é adicional, nunca obrigatório.
- **D-06:** Expiração do convite: 7 dias (já em `0007_convites.sql`).
- **D-07:** `/convite/[token]`: apenas senha + confirmar senha. Role e loja pré-configurados via token.
- **D-08:** Editar usuário: Sheet lateral (não dropdown inline).
- **D-09:** Desativar usuário: `admin.updateUserById({ ban_duration: '876600h' })` via service role — invalida sessões ativas.

### Claude's Discretion

- Visual da página /login: usar shadcn `Card`, `Input`, `Button`, `Label` com tema dark GDS. Manter identidade "DA SILVA / Painel de Vendas". Sem auto-cadastro.
- UI do formulário de criação de convite: Sheet ou Dialog lateral. Campos: email (opcional), role (select), loja (select).
- Filtros da tabela de usuários: por role e por loja (dropdowns acima da tabela).
- Skeleton loading para tabela durante fetch.

### Deferred Ideas (OUT OF SCOPE)

Nenhum — discussão manteve-se dentro do escopo da fase.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Middleware protege rotas por role: /dashboard/* (adm/gerente/super_admin), /meu-resultado/* (vendedor), /treinamento/* (qualquer autenticado), /admin/* (super_admin) | Seções "Middleware RBAC" e "app_metadata JWT" |
| AUTH-02 | Página /login redesenhada com design system v2 (sem auto-cadastro) | Seção "Login Redesign"; componentes já instalados per UI-SPEC |
| AUTH-03 | Gerente cria convite (email opcional + role + loja) em /dashboard/usuarios e sistema gera link /convite/[token] | Seção "Invite Flow"; schema 0007 verificado |
| AUTH-04 | Novo usuário acessa /convite/[token], define senha, perfil criado automaticamente com role e loja corretos | Seção "Accept Invite"; trigger handle_new_user + update via accept-invite route |
| AUTH-05 | Envio de email de convite via Supabase Edge Function com Resend | Seção "Edge Functions + Resend" |
| AUTH-06 | Tabela de usuários com: nome, número vendedor, loja, role, ativo, último acesso; filtro por loja e role; ações: editar role, desativar, reenviar convite | Seção "Users Table"; DataTable existente; last_sign_in_at via admin API |

</phase_requirements>

---

## Summary

A fase 3 constrói sobre infraestrutura existente (middleware atual com 2 roles, tabela `convites` já migrada, componentes shadcn todos instalados). O trabalho é principalmente expansão e substituição — não criação do zero.

O middleware atual faz query DB em todo request (`profiles.select('role')`). A decisão D-04 elimina esse anti-pattern ao mover o role para `app_metadata` no JWT: `supabase.auth.getUser()` já retorna `user.app_metadata` sem query adicional, pois o campo é embutido no token e validado pelo servidor Supabase Auth. A troca exige que toda operação de criação/edição de usuário atualize simultaneamente `profiles.role` e `auth.users.app_metadata.role` via admin API.

O fluxo de convite substitui a criação direta por senha (atual `POST /api/admin/create-user`). O novo fluxo: gera token na tabela `convites` → exibe link → envia email opcional via Edge Function → usuário acessa `/convite/[token]` → define senha → `handle_new_user` trigger cria profile com role/loja corretos vindos do token.

`last_sign_in_at` vive em `auth.users` (schema `auth`, não exposto via anon key). Acesso requer admin API (`auth.admin.listUsers()`) ou uma PostgreSQL View com `SECURITY DEFINER` que faça JOIN. A abordagem mais simples para server components: chamar `admin.auth.listUsers()` no route handler da página e fazer merge com profiles no servidor.

**Recomendação primária:** Migrar middleware para `user.app_metadata.role` primeiro (Wave 1), depois construir invite flow (Wave 2), depois tabela de usuários v2 (Wave 3), depois login redesign + Edge Function (Wave 4).

---

## Standard Stack

### Core (já instalado no projeto)

| Library | Version instalada | Purpose | Status |
|---------|-----------------|---------|--------|
| `@supabase/ssr` | 0.5.2 | Server/browser clients, middleware cookie refresh | INSTALLED |
| `@supabase/supabase-js` | 2.100.1 (latest: 2.106.1) | Admin client com service role | INSTALLED |
| Next.js | 15.2.4 | App Router, middleware, route handlers | INSTALLED |
| shadcn/ui (todos componentes) | — | Card, Sheet, Dialog, DataTable, Badge, etc. | INSTALLED |

### Novo (a instalar nesta fase)

| Library | Version | Purpose | Por que não hand-roll |
|---------|---------|---------|----------------------|
| (nenhum) | — | Todos os componentes necessários já estão instalados | — |

**Edge Function (Deno runtime — não npm):**

| Dependency | Versão | Purpose |
|------------|--------|---------|
| Resend API (HTTP direto) | — | Envio de email; chamada fetch para `https://api.resend.com/emails` |

**Verificação:** `@supabase/supabase-js@2.100.1` está instalado. Versão latest é 2.106.1 — atualização não é obrigatória para esta fase; API `auth.admin.updateUserById` e `auth.admin.listUsers` estão disponíveis na versão atual. [VERIFIED: npm registry]

---

## Architecture Patterns

### Estrutura de arquivos da fase

```
src/
  app/
    login/
      page.tsx                     # REWRITE: inline styles → shadcn components
    convite/
      [token]/
        page.tsx                   # NEW: server component — token validation
        ConviteForm.tsx            # NEW: client component — password form
    dashboard/
      usuarios/
        page.tsx                   # REWRITE: expandir auth guard (4 roles) + fetch admin
        UsersClient.tsx            # REWRITE: DataTable + Sheet actions
      config/
        page.tsx                   # guard extra: apenas adm + super_admin
    api/
      admin/
        invite/
          route.ts                 # NEW: POST — cria convite, retorna link
        accept-invite/
          route.ts                 # NEW: POST — valida token, cria user, atualiza profile
        update-user/
          route.ts                 # NEW: POST — edita nome/role/loja/ativo
        disable-user/
          route.ts                 # NEW: POST — ban_duration + profiles.ativo=false
  middleware.ts                    # REWRITE: migrar para app_metadata.role, 4 roles, 5 route groups
  types/
    index.ts                       # UPDATE: UserRole expandido para 4 roles
supabase/
  functions/
    send-invite-email/
      index.ts                     # NEW: Deno Edge Function + Resend
```

### Pattern 1: Middleware RBAC via app_metadata

**O que é:** Ler `user.app_metadata.role` retornado por `supabase.auth.getUser()` — sem query DB adicional.

**Por que funciona:** `getUser()` faz request ao Supabase Auth server para validar o token. O objeto `user` retornado inclui `app_metadata` que foi embutido no JWT na emissão. Não é necessária query ao banco.

```typescript
// src/middleware.ts — padrão verificado via discussões Supabase GitHub #32746
const { data: { user } } = await supabase.auth.getUser()
const role = user?.app_metadata?.role as string | undefined
// role é 'vendedor' | 'adm' | 'gerente' | 'super_admin' | undefined
```

**Atenção — NUNCA usar `getSession()` em middleware:** [CITED: supabase.com/docs/guides/auth/server-side/nextjs]
> "Never trust `supabase.auth.getSession()` inside server code such as middleware. It isn't guaranteed to revalidate the Auth token."

**Regras de route mapping (D-03):**

```typescript
const ROLE_RULES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: '/admin',            allowed: ['super_admin'] },
  { prefix: '/dashboard/config', allowed: ['adm', 'super_admin'] },
  { prefix: '/dashboard',        allowed: ['adm', 'gerente', 'super_admin'] },
  { prefix: '/meu-resultado',    allowed: ['vendedor'] },
  { prefix: '/treinamento',      allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
]
// Avaliar na ordem acima (mais específico primeiro)
```

**Rotas públicas — NÃO proteger:**
- `/login` — sempre pública
- `/convite/[token]` — NEW: deve ser explicitamente excluída do middleware
- `/api/*` — já excluída no matcher atual
- `/_next/*`, `/favicon.ico` — já excluídos pelo matcher

### Pattern 2: Atualizar app_metadata + profiles em conjunto

Toda operação que muda role deve tocar dois lugares:

```typescript
// Em qualquer route handler admin — padrão D-04
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// 1. Atualizar JWT app_metadata
await admin.auth.admin.updateUserById(userId, {
  app_metadata: { role: newRole }
})

// 2. Atualizar profiles (fonte de verdade para queries)
await admin.from('profiles').update({ role: newRole }).eq('id', userId)
```

[CITED: supabase.com/docs/reference/javascript/auth-admin-updateuserbyid]

### Pattern 3: Criação de convite

```typescript
// POST /api/admin/invite
// 1. Verificar caller é adm|gerente|super_admin via app_metadata
// 2. Inserir em convites(tenant_id, email?, role, loja_id, criado_por)
// 3. Construir link: `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}`
// 4. Se email preenchido: chamar Edge Function send-invite-email
// 5. Retornar { link, token }
```

### Pattern 4: Accept invite flow

```typescript
// POST /api/admin/accept-invite
// 1. Buscar convite por token (SELECT * FROM convites WHERE token = $1)
// 2. Validar: existe + !usado + expira_em > now()
// 3. Criar user via admin.auth.admin.createUser({ email: convite.email || gerado, password, email_confirm: true })
// 4. Atualizar profile via trigger handle_new_user (já existe) — mas role/loja vêm do convite, não do trigger
//    → UPDATE profiles SET role = convite.role, loja_id = convite.loja_id, tenant_id = convite.tenant_id WHERE id = newUser.id
// 5. Atualizar app_metadata: admin.auth.admin.updateUserById(newUser.id, { app_metadata: { role: convite.role } })
// 6. Marcar convite como usado: UPDATE convites SET usado = true WHERE id = convite.id
```

**PROBLEMA IDENTIFICADO:** O trigger `handle_new_user` em `0010_rls_policies.sql` lê `raw_user_meta_data->>'role'` para definir o role inicial do profile. No fluxo de convite, o role vem do token (tabela `convites`), não de `user_metadata`. O accept-invite route handler precisa fazer UPDATE explícito no profile após a criação do usuário.

### Pattern 5: Edge Function send-invite-email

```typescript
// supabase/functions/send-invite-email/index.ts (Deno)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

Deno.serve(async (req: Request) => {
  // CORS headers obrigatórios para chamada de route handler Next.js
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const { to, inviteLink, senderName } = await req.json()
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'noreply@dasilva.com',  // domínio verificado no Resend
      to,
      subject: 'Seu acesso ao Painel Da Silva',
      html: `<p>Link de acesso: <a href="${inviteLink}">${inviteLink}</a></p>`,
    }),
  })
  
  return new Response(JSON.stringify(await res.json()), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```

[CITED: supabase.com/docs/guides/functions/examples/send-emails]

**Deploy:**
```bash
supabase functions deploy send-invite-email --no-verify-jwt
supabase secrets set RESEND_API_KEY=re_xxx  # via dashboard ou CLI
```

### Pattern 6: Expor last_sign_in_at para server component

`auth.users.last_sign_in_at` não é acessível via anon key (schema `auth` não exposto). Abordagem via admin API no server component:

```typescript
// src/app/dashboard/usuarios/page.tsx
const admin = createClient(url, serviceRoleKey, { auth: { ... } })
const { data: { users } } = await admin.auth.admin.listUsers()

// Merge com profiles
const usersWithLastSeen = profiles.map(p => ({
  ...p,
  last_sign_in_at: users.find(u => u.id === p.id)?.last_sign_in_at ?? null,
}))
```

`admin.auth.admin.listUsers()` retorna array com campos: `id`, `email`, `last_sign_in_at`, `banned_until`, `app_metadata`, `created_at`. [VERIFIED: supabase/supabase-js tipos TypeScript]

**Atenção:** `listUsers()` retorna todos os usuários do projeto (não filtrado por tenant). Para multi-tenant: filtrar pelo `tenant_id` dos profiles antes de retornar à UI.

### Anti-Patterns a Evitar

- **Query DB no middleware:** Atual `profiles.select('role')` em todo request. Remover — usar `user.app_metadata.role`.
- **Criar usuário sem app_metadata:** `handle_new_user` trigger não seta `app_metadata`. Deve ser chamado `updateUserById({ app_metadata: { role } })` logo após `createUser`.
- **Rota `/convite/[token]` protegida no middleware:** Deve ser rota pública — usuário ainda não tem sessão ao acessar o link.
- **Usar `getSession()` em server code:** Sempre `getUser()`.
- **`ban_duration` vs `banned: true`:** O parâmetro correto no SDK JS é `ban_duration: 'string'` (ex: `'876600h'` = ~100 anos = ban permanente). O campo `banned: true` aparece em exemplos mais antigos e não é o parâmetro atual da API JS. [VERIFIED: supabase.com/docs/reference/javascript/auth-admin-updateuserbyid]

---

## Don't Hand-Roll

| Problema | Não construir | Usar em vez | Por quê |
|---------|---------------|-------------|---------|
| Proteção de rotas por role | Guard manual em cada page.tsx | middleware.ts centralizado | DRY; sem bypass via acesso direto à URL |
| Geração de token seguro | `Math.random()` ou UUID manual | `gen_random_uuid()` no Postgres (já em schema 0007) | Criptograficamente seguro, sem colisão |
| Envio de email | SMTP manual, nodemailer | Resend via Edge Function | Rate limiting, bounce handling, logs |
| Banimento de usuário | `profiles.ativo = false` apenas | `admin.updateUserById({ ban_duration })` + `profiles.ativo = false` | Invalida tokens JWT ativos imediatamente |
| Validação de formulários | State manual + regex | Validação inline simples com `minLength` e comparação direta (não necessita zod para formulário tão simples) | Formulário tem apenas 2 campos — overhead de zod não justificado |
| Tabela de usuários | `<table>` manual (código atual) | `DataTable` existente em `ui/data-table.tsx` | Já tem sort, skeleton, empty-state integrados |

---

## Common Pitfalls

### Pitfall 1: Middleware bloqueia /convite/[token]

**O que acontece:** Se `/convite` não for adicionado nas rotas públicas do middleware, usuário sem sessão é redirecionado para /login ao acessar o link de convite.

**Por que acontece:** Middleware atual só exclui `/login` e `/api` das rotas públicas.

**Como evitar:** Adicionar `pathname.startsWith('/convite')` na lista de rotas públicas do middleware, junto com `/login`.

**Sinal de alerta:** QA recebe redirect para /login ao clicar no link de convite.

### Pitfall 2: app_metadata desincronizado com profiles.role

**O que acontece:** Admin atualiza `profiles.role` via Supabase dashboard sem chamar `updateUserById`, ou o middleware passa a ler `app_metadata.role` mas a UI faz queries ao `profiles.role` — os dois ficam dessincronizados.

**Por que acontece:** Dois sistemas de verdade para o mesmo dado.

**Como evitar:** Encapsular toda mutação de role na função utilitária `setUserRole(userId, role)` que chama tanto `profiles.update` quanto `admin.updateUserById`. Documentar no código que `app_metadata.role` é a fonte de verdade para o middleware e `profiles.role` é a fonte para queries de UI.

**Sinal de alerta:** Usuário com role `gerente` em profiles mas `vendedor` em app_metadata consegue ver /dashboard mas é redirecionado para /meu-resultado após reload da sessão.

### Pitfall 3: handle_new_user trigger com role errado

**O que acontece:** Trigger `handle_new_user` em `0010_rls_policies.sql` insere profile com `role = COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')`. Se o accept-invite criar o usuário sem passar `user_metadata: { role }`, o profile recebe role `vendedor` por default, ignorando o role do convite.

**Por que acontece:** O trigger não tem acesso à tabela `convites` — ele apenas lê `user_metadata`.

**Como evitar:** No `POST /api/admin/accept-invite`: após `createUser`, sempre fazer `UPDATE profiles SET role = convite.role, loja_id = convite.loja_id WHERE id = newUser.id`. O trigger cria o profile inicial; o route handler o corrige em seguida com os dados do convite.

**Sinal de alerta:** Novo usuário criado via convite com role `gerente` aparece como `vendedor` na tabela de usuários.

### Pitfall 4: listUsers() retorna usuários de outros tenants

**O que acontece:** `admin.auth.admin.listUsers()` retorna todos os usuários do projeto Supabase — incluindo os do banco compartilhado com PetHub (13 tabelas legadas, conforme STATE.md).

**Por que acontece:** `auth.users` não tem coluna `tenant_id` — o isolamento é no nível de `profiles.tenant_id`.

**Como evitar:** Após buscar `listUsers()`, filtrar cruzando com profiles do tenant atual: `profiles.map(p => users.find(u => u.id === p.id))`.

**Sinal de alerta:** Tabela de usuários mostra registros com emails do domínio do PetHub.

### Pitfall 5: /convite/[token] expõe role/loja na URL

**O que acontece:** Token é opaco (UUID). Não inclui role ou loja na URL — estão na tabela `convites`. Não há risco de exposição por si.

**O risco real:** Token na URL em `window.location` pode vazar em logs de servidor ou analytics. O token é o segredo que autoriza criação da conta.

**Como evitar:** Após aceite bem-sucedido, marcar `convites.usado = true` antes de redirecionar. Tokens usados rejeitados na validação.

### Pitfall 6: ban_duration e sessões existentes

**O que acontece:** `admin.updateUserById({ ban_duration: '876600h' })` invalida refresh tokens. Sessões ativas existentes retornam erro `user_banned` na próxima tentativa de refresh (geralmente ≤1h). Há uma janela em que o usuário banido ainda tem uma sessão válida se não fez refresh recentemente.

**Por que acontece:** JWTs expiram periodicamente (padrão Supabase: 1 hora). Até o próximo refresh, o token continua válido.

**Como evitar:** Aceitável para caso de demissão (janela máxima ~1h). Se invalidação imediata absoluta for necessária, adicionar check em page-level server component: `if (profile.ativo === false) redirect('/login')`. Isso cobre o edge case da janela de 1h.

---

## Code Examples

### Middleware expandido para 4 roles

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROLE_RULES = [
  { prefix: '/admin',            allowed: ['super_admin'] },
  { prefix: '/dashboard/config', allowed: ['adm', 'super_admin'] },
  { prefix: '/dashboard',        allowed: ['adm', 'gerente', 'super_admin'] },
  { prefix: '/meu-resultado',    allowed: ['vendedor'] },
  { prefix: '/treinamento',      allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
] as const

const PUBLIC_PREFIXES = ['/login', '/convite', '/api']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Rotas públicas — sem auth check
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role via app_metadata — sem query DB
  const role = (user.app_metadata?.role as string | undefined) ?? 'vendedor'

  const rule = ROLE_RULES.find(r => pathname.startsWith(r.prefix))
  if (rule && !rule.allowed.includes(role)) {
    const url = request.nextUrl.clone()
    // Redirecionar para a rota correta para o role
    url.pathname = role === 'vendedor' ? '/meu-resultado' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Desativar usuário (ban + profiles.ativo)

```typescript
// src/app/api/admin/disable-user/route.ts
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = user.app_metadata?.role as string | undefined
  if (!['adm', 'gerente', 'super_admin'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { userId } = await req.json()

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Banir o usuário (invalida refresh tokens)
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876600h', // ~100 anos = ban permanente
  })
  if (banError) return NextResponse.json({ error: banError.message }, { status: 400 })

  // Sincronizar profiles.ativo
  await admin.from('profiles').update({ ativo: false }).eq('id', userId)

  return NextResponse.json({ success: true })
}
```

### Buscar usuários com last_sign_in_at

```typescript
// Dentro de src/app/dashboard/usuarios/page.tsx (server component)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const [{ data: profiles }, { data: { users } }] = await Promise.all([
  supabase.from('profiles').select('*, lojas:loja_id(nome)').eq('tenant_id', currentTenantId).order('name'),
  admin.auth.admin.listUsers({ perPage: 1000 }),
])

const usersWithLastSeen = (profiles ?? []).map(p => ({
  ...p,
  last_sign_in_at: users.find(u => u.id === p.id)?.last_sign_in_at ?? null,
}))
```

---

## State of the Art

| Abordagem antiga | Abordagem atual | Quando mudou | Impacto |
|-----------------|-----------------|-------------|---------|
| `getSession()` em server code | `getUser()` obrigatório em server | @supabase/ssr v0.1+ | Segurança: getSession não valida token no servidor |
| Query DB para role no middleware | `user.app_metadata.role` do JWT | Prática estabelecida em 2024-2025 | Performance: elimina round-trip DB por request |
| `auth.admin.updateUser({ banned: true })` | `auth.admin.updateUserById({ ban_duration: 'Xh' })` | supabase-js v2 | API mudou — `banned: true` não é parâmetro atual no SDK JS |
| Criação direta com senha (atual create-user) | Invite flow com token | Esta fase | UX gerencial sem expor senhas temporárias |

**Deprecated/desatualizado no projeto atual:**
- `profiles.vendor_id` (texto) → Phase 3 usa `profiles.loja_id` (uuid ref tenants). O campo antigo `store: text` em profiles também é legado — esta fase usa `loja_id`.
- `UserRole = 'adm' | 'vendedor'` em `src/types/index.ts` → expandir para 4 roles nesta fase.
- Auth guard em `usuarios/page.tsx` verifica apenas role `adm` — expandir para adm|gerente|super_admin.

---

## Schema Notes (Issues identificados no codebase)

### profiles.ativo vs profiles.active

Migration 0001 cria campo `active boolean`. Migration 0002 adiciona campos mas não renomeia. O código atual (`UsersClient.tsx`) usa `p.active`. O CONTEXT.md (D-09) e UI-SPEC referem `ativo`. **Verificar nome real do campo antes de implementar** — pode necessitar migration de rename ou usar o nome existente `active`.

### convites.loja_id referencia tenants(id)

A tabela `convites` tem `loja_id uuid REFERENCES tenants(id)`. O design atual usa 1 tenant (`gds-interno`) para as 3 lojas. As "lojas" (Jebai, Pajé 1, Pajé 2) são representadas pelo campo `profiles.store text` (legado) — não há tenants separados por loja. **Consequência para invite flow:** O select de "loja" no formulário de convite precisa de definição de como as lojas são identificadas. Opções:

1. Criar 3 tenants separados (Jebai, Pajé 1, Pajé 2) e tratar `loja_id` como referência correta [requer migration]
2. Ignorar `convites.loja_id` e usar um campo text `loja` no convite para compatibilidade com `profiles.store` [workaround]
3. Adicionar uma tabela `lojas` separada [requer migration]

[ASSUMED] A abordagem mais simples que mantém compatibilidade com o schema existente é a opção 2 (campo text para loja no convite), deferindo a normalização de lojas para fases futuras. O planner deve confirmar com o usuário ou escolher dentro do escopo de discretion.

### profiles não tem campo ativo/loja_id em tipo TypeScript

`src/types/index.ts` tem `Profile` com campos da migration 0001 mas NÃO inclui `tenant_id`, `numero_vendedor`, `loja_id`, nem `ativo` (adicionados em migrations posteriores). **O TypeScript type está desatualizado.** A fase 3 deve atualizar `Profile` em `src/types/index.ts` e/ou depender do `src/types/supabase.ts` gerado.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | ✓ | v24.11.0 | — |
| Supabase CLI | Edge Function deploy | ✓ | 2.101.0 | — |
| Supabase project | Auth, DB | ✓ | zsczxblhtdhpdqvkpuwz | — |
| SUPABASE_SERVICE_ROLE_KEY | Admin API | ✓ | .env.local existe | — |
| Resend account/API key | AUTH-05 (email) | ? | Não verificado | Email = opcional (D-05); pode omitir Edge Function call se não configurado |
| supabase/functions dir | Edge Function | ✗ | Não existe | Criar durante Wave 0 |

**Missing com fallback:**
- `RESEND_API_KEY`: não verificado se conta Resend existe. Como D-05 define email como canal adicional/não obrigatório, a Edge Function pode ser deployada mas o route handler de convite deve tratar `RESEND_API_KEY` ausente como skip silencioso de email.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Nenhum detectado no projeto |
| Config file | Não existe |
| Quick run | `npm run build` (validação de types + lint) |
| Full suite | `npm run build && npm run lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Existe? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Middleware bloqueia /dashboard/* para vendedor | manual | Acessar /dashboard com user vendedor | ❌ |
| AUTH-01 | Middleware permite /dashboard/* para gerente | manual | Acessar /dashboard com user gerente | ❌ |
| AUTH-01 | /admin/* só acessível para super_admin | manual | Verificar redirect para /dashboard | ❌ |
| AUTH-02 | /login renderiza sem auto-cadastro | build | `npm run build` | ❌ (rewrite) |
| AUTH-03 | Gerar convite retorna link válido | manual | POST /api/admin/invite, verificar token em DB | ❌ |
| AUTH-04 | Accept invite cria user com role correto | manual | Verificar profile.role após accept | ❌ |
| AUTH-05 | Edge Function responde sem erro | manual | `supabase functions serve` local + curl | ❌ |
| AUTH-06 | Tabela exibe todos os campos definidos | manual | Visual check na página | ❌ (rewrite) |

### Sampling Rate

- **Por commit:** `npm run build` — garante TypeScript strict sem erros
- **Por wave:** `npm run build && npm run lint`
- **Gate da fase:** Build verde + testes manuais de todos os route maps de AUTH-01

### Wave 0 Gaps

- [ ] `supabase/functions/send-invite-email/index.ts` — criar diretório e função
- [ ] Framework de teste: nenhum instalado — usar validação manual + build checks

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | sim | Supabase Auth `signInWithPassword` — não hand-roll |
| V3 Session Management | sim | `getUser()` sempre (não `getSession()`); `ban_duration` para invalidação |
| V4 Access Control | sim | middleware.ts com app_metadata.role; page-level guard como belt-and-suspenders |
| V5 Input Validation | sim | Validação inline no `/convite/[token]`: minLength(8), confirmação de senha |
| V6 Cryptography | sim | Token = `gen_random_uuid()` no Postgres — nunca hand-roll |

### Known Threat Patterns

| Pattern | STRIDE | Mitigação Padrão |
|---------|--------|-----------------|
| Token de convite brute-force | Tampering | UUID v4 = 122 bits de entropia — impossível via força bruta |
| Token reutilizado | Elevation of Privilege | `usado = true` após aceite; validação no server component antes de mostrar form |
| Privilege escalation via convite | Elevation of Privilege | Apenas adm/gerente/super_admin criam convites (D-02); verificação no route handler via app_metadata.role do caller |
| Middleware bypass via direct page access | Spoofing | Page-level guard em server components como segunda linha de defesa |
| Token exposto em logs de servidor | Information Disclosure | Token na URL path (não query string) — menos provável de logar; marcar como usado após aceite |
| Session ativa após banimento | Denial of Service (reverse) | `ban_duration` invalida refresh tokens; janela máxima ~1h até expiração do JWT |

---

## Assumptions Log

| # | Claim | Section | Risk se errado |
|---|-------|---------|---------------|
| A1 | `profiles.active` é o nome real do campo (não `ativo`) — migrations usam `active` mas docs e UI-SPEC usam `ativo` | Schema Notes | Erros TypeScript em runtime; requer verificação no banco antes de implementar |
| A2 | As 3 lojas (Jebai, Pajé 1, Pajé 2) não são tenants separados — são valores text em `profiles.store` | Schema Notes / Invite Flow | Se forem tenants, `convites.loja_id` já tem o tipo certo e Select de lojas precisa buscar tenants; se não forem, precisa de workaround |
| A3 | `RESEND_API_KEY` ainda não está configurado no projeto | Environment | Edge Function falhará silenciosamente se não configurada; aceitável pois email é opcional (D-05) |
| A4 | `admin.auth.admin.listUsers()` sem paginação retorna todos os usuários num projeto com < 1000 usuários | Users Table | Se > 1000 usuários: necessário paginação. Improvável no contexto atual (3 lojas, ~20-50 vendedores) |

---

## Open Questions

1. **Campo `active` vs `ativo` nos profiles**
   - O que sabemos: migration 0001 cria `active boolean`; CONTEXT.md e UI-SPEC referenciam `ativo`; código atual usa `p.active`
   - O que não está claro: se migration de rename foi planejada ou se o nome é `active` mesmo
   - Recomendação: Planner deve inspecionar o banco real via `supabase.from('profiles').select('active').limit(1)` e usar o nome que existir; se necessário adicionar migration de rename

2. **Lojas como tenants ou campo text**
   - O que sabemos: `convites.loja_id` é `uuid REFERENCES tenants(id)`; schema atual tem apenas 1 tenant; `profiles.store` é text com valores 'Jebai'/'Paje-MKT'/'Paje-Caixa'
   - O que não está claro: se a intenção é ter 3 tenants (um por loja) ou 1 tenant com lojas como sub-entidade
   - Recomendação: Para esta fase, usar abordagem pragmática — se 3 tenants separados existirem no banco, usar `loja_id`; se não, adicionar campo `loja text` na tabela `convites` ou criar seed das 3 lojas como tenants

---

## Sources

### Primary (HIGH confidence)
- `src/middleware.ts` — implementação atual, lida diretamente [VERIFIED: codebase]
- `supabase/migrations/0007_convites.sql` — schema de convites [VERIFIED: codebase]
- `supabase/migrations/0010_rls_policies.sql` — trigger handle_new_user [VERIFIED: codebase]
- `supabase/migrations/0001_schema_inicial.sql` — profiles schema [VERIFIED: codebase]
- `src/components/ui/data-table.tsx` — DataTable API [VERIFIED: codebase]
- [supabase.com/docs/reference/javascript/auth-admin-updateuserbyid](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid) — updateUserById API
- [supabase.com/docs/guides/functions/examples/send-emails](https://supabase.com/docs/guides/functions/examples/send-emails) — Edge Function + Resend
- npm registry — `@supabase/supabase-js@2.100.1` instalado, latest 2.106.1 [VERIFIED: npm view]

### Secondary (MEDIUM confidence)
- [github.com/orgs/supabase/discussions/32746](https://github.com/orgs/supabase/discussions/32746) — `user.app_metadata.role` em middleware sem DB query (community verified)
- [github.com/orgs/supabase/discussions/36574](https://github.com/orgs/supabase/discussions/36574) — estratégias para persistência de role com Next.js 15.3
- [supabase.com/docs/guides/auth/jwt-fields](https://supabase.com/docs/guides/auth/jwt-fields) — estrutura do JWT Supabase

### Tertiary (LOW confidence)
- Comportamento de `ban_duration` e janela de sessão ativa: documentação oficial não é explícita sobre a janela de ~1h; baseado em issues e discussões da comunidade.

---

## Metadata

**Confidence breakdown:**
- Middleware RBAC: HIGH — padrão verificado em docs oficiais e discussões Supabase
- Invite flow: HIGH — schema 0007 verificado no codebase; padrão de route handler já existe
- Edge Function: MEDIUM — padrão verificado em docs; detalhes de CORS e deploy via CLI verificados; configuração Resend [ASSUMED] não verificada
- last_sign_in_at via admin API: MEDIUM — API verificada; merge com profiles é pattern razoável mas não testado no projeto
- Schema issues (active vs ativo, lojas): LOW — requer verificação no banco real

**Research date:** 2026-05-21
**Valid until:** 2026-07-01 (APIs Supabase estáveis; Edge Functions pattern estável)
