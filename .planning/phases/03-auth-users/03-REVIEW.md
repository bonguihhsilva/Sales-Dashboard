---
phase: 03-auth-users
reviewed: 2026-05-22T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/app/api/admin/accept-invite/route.ts
  - src/app/api/admin/disable-user/route.ts
  - src/app/api/admin/invite/route.ts
  - src/app/api/admin/update-user/route.ts
  - src/app/convite/[token]/ConviteForm.tsx
  - src/app/convite/[token]/page.tsx
  - src/app/dashboard/usuarios/UsersClient.tsx
  - src/app/dashboard/usuarios/page.tsx
  - src/app/login/page.tsx
  - src/lib/auth/roles.ts
  - supabase/functions/send-invite-email/index.ts
  - tsconfig.json
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 03: Relatório de Code Review — Auth & Usuários

**Revisado:** 2026-05-22
**Profundidade:** standard
**Arquivos revisados:** 12
**Status:** issues_found

## Resumo

Fluxo de convites, criação de usuários e gestão de roles revisado em profundidade. A arquitetura está bem estruturada: a separação entre cliente de serviço (`service_role`) e cliente de sessão (`@supabase/ssr`) é mantida corretamente em todos os route handlers. O design de roles via `app_metadata` está consistente com o padrão definido no CLAUDE.md.

Foram encontrados **3 problemas críticos**: dois de segurança (escalada de privilégios por falta de validação de role hierárquico, e CORS aberto na Edge Function) e uma condição de corrida que permite tokens de convite serem consumidos duas vezes. Há também 4 avisos de bugs/lógica que podem causar comportamentos incorretos em produção.

---

## Problemas Críticos

### CR-01: Escalada de privilégio — qualquer gerente pode atribuir `super_admin`

**Arquivo:** `src/app/api/admin/update-user/route.ts:22-24` e `src/app/api/admin/invite/route.ts:26-28`

**Problema:** A validação de role aceita qualquer valor retornado por `isValidRole`, que inclui `'super_admin'`. Um gerente autenticado (role `gerente`) pode invocar `POST /api/admin/update-user` ou `POST /api/admin/invite` com `role: "super_admin"` e o payload passará pela verificação `isValidRole`. A restrição `ASSIGNABLE_ROLES` existe apenas no frontend (SelectItem) — não é aplicada no servidor.

`isValidRole` em `src/lib/auth/roles.ts` retorna `true` para `'super_admin'`. O servidor aceita esse valor sem verificar se o `callerRole` tem permissão para atribuí-lo.

**Correção:** Adicionar verificação de hierarquia no servidor. O `super_admin` nunca deve ser atribuível via UI por outros roles:

```typescript
// src/app/api/admin/update-user/route.ts e invite/route.ts
// Após validar callerRole e isValidRole(role):

const MAX_ASSIGNABLE_ROLE: Record<string, UserRole[]> = {
  super_admin: ['vendedor', 'adm', 'gerente', 'super_admin'],
  gerente: ['vendedor', 'adm', 'gerente'],
  adm: ['vendedor', 'adm'],
}

const assignable = MAX_ASSIGNABLE_ROLE[callerRole ?? ''] ?? []
if (!assignable.includes(role as UserRole)) {
  return NextResponse.json({ error: 'Voce nao pode atribuir este role' }, { status: 403 })
}
```

Alternativamente, aplicar `ASSIGNABLE_ROLES` no servidor (sem `super_admin`) para todos que não forem `super_admin`.

---

### CR-02: Condição de corrida em `accept-invite` — token pode ser consumido duas vezes

**Arquivo:** `src/app/api/admin/accept-invite/route.ts:29-91`

**Problema:** O fluxo atual é:
1. Ler o convite e verificar `usado = false`
2. Criar o usuário no Auth
3. Atualizar profile
4. Marcar `usado = true`

Entre os passos 1 e 4, duas requisições simultâneas com o mesmo token passam pela verificação `usado = false` (linha 38), e ambas criam usuários com o mesmo email — ou, se o email já foi tomado na segunda tentativa, uma delas falha silenciosamente mas o token fica marcado como usado após a primeira. Num cenário de duplo-clique ou retry automático do cliente, o token pode criar dois usuários (se email for `null`, gerando dois `convite-{uuid}@dasilva.local`).

**Correção:** Usar `UPDATE ... WHERE usado = false RETURNING *` como operação atômica para "consumir" o convite antes de criar o usuário:

```typescript
// Substituir a leitura + verificação de usado por uma operação atômica:
const { data: convite, error: convErr } = await admin
  .from('convites')
  .update({ usado: true })
  .eq('token', token)
  .eq('usado', false)           // guard atômico
  .gt('expira_em', new Date().toISOString()) // guard atômico de expiração
  .select('id, email, role, loja, tenant_id, expira_em')
  .single()

if (convErr || !convite) {
  // Convite não encontrado, já usado, ou expirado
  return NextResponse.json({ error: 'Convite invalido, ja utilizado ou expirado' }, { status: 409 })
}
// Não precisa mais checar convite.usado ou convite.expira_em — já foram filtrados atomicamente.
```

Isso garante que apenas uma requisição consegue marcar o convite como usado e prosseguir.

---

### CR-03: CORS aberto na Edge Function sem validação de origem

**Arquivo:** `supabase/functions/send-invite-email/index.ts:7-10`

**Problema:** O header `Access-Control-Allow-Origin: *` expõe a Edge Function a chamadas diretas de qualquer origem. A função não valida se o `Authorization` header contém uma chave de serviço válida (a opção `--no-verify-jwt` no deploy desabilita a verificação JWT do Supabase). Qualquer pessoa com a URL da função pode invocar o envio de emails com destinatário e corpo arbitrários, usando o domínio remetente do projeto.

Contexto: a função é chamada apenas pelo route handler interno (`/api/admin/invite`), não por clientes browser.

**Correção:** Restringir CORS à origem da aplicação e adicionar verificação de segredo compartilhado:

```typescript
// Substituir corsHeaders por:
const ALLOWED_ORIGIN = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://seu-dominio.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// No handler, antes de processar:
const internalSecret = Deno.env.get('INTERNAL_FUNCTIONS_SECRET')
if (internalSecret && req.headers.get('x-internal-secret') !== internalSecret) {
  return new Response('Unauthorized', { status: 401, headers: corsHeaders })
}
```

O route handler `/api/admin/invite` deve passar `'x-internal-secret': process.env.INTERNAL_FUNCTIONS_SECRET` no invoke.

---

## Avisos

### WR-01: `update-user` permite alterar `ativo` sem passar pelo ban do Auth

**Arquivo:** `src/app/api/admin/update-user/route.ts:40-53`

**Problema:** O campo `ativo` é aceito no payload e atualizado diretamente em `profiles.ativo` (linha 44), mas o route handler `update-user` não chama `admin.auth.admin.updateUserById` com `ban_duration`. Isso cria inconsistência: o profile diz `ativo: false` mas o usuário ainda pode fazer login.

O frontend `UsersClient.tsx` faz duas chamadas separadas (`update-user` para dados + `disable-user` para ban) quando `ativo` muda, mas isso depende do cliente ser bem-comportado. O servidor deveria ser autoritativo.

**Correção:** Em `update-user`, remover `ativo` do `patch` de profiles (linhas 44-45) e, se `ativo` vier no payload, delegar ao mesmo mecanismo de `disable-user` (ou extrair a lógica para uma função compartilhada em `lib/auth/`):

```typescript
// src/app/api/admin/update-user/route.ts
// Remover: if (ativo !== undefined) patch.ativo = ativo

// Se ativo foi enviado, chamar a mesma lógica de ban:
if (ativo !== undefined) {
  const banDuration = ativo ? 'none' : '876600h'
  const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: banDuration })
  if (banError) return NextResponse.json({ error: banError.message }, { status: 400 })
  
  const { error: atvError } = await admin.from('profiles').update({ ativo }).eq('id', userId)
  if (atvError) return NextResponse.json({ error: atvError.message }, { status: 400 })
}
```

---

### WR-02: `listUsers` sem paginação — limite silencioso de 1000 usuários

**Arquivo:** `src/app/dashboard/usuarios/page.tsx:40`

**Problema:** `admin.auth.admin.listUsers({ perPage: 1000 })` retorna no máximo 1000 usuários e não pagina. Se o tenant crescer além disso, os `last_sign_in_at` de usuários acima do limite simplesmente retornam `null` sem erro ou aviso. Com arquitetura multi-tenant (mencionada no CLAUDE.md), este limite pode ser atingido antes do esperado se futuramente múltiplos tenants compartilharem o mesmo projeto Supabase.

**Correção:** Fazer a busca de `authUsers` filtrada pelos IDs dos profiles já conhecidos, evitando a listagem total:

```typescript
// Substituir listResult por lookup nos IDs do tenant:
const profileIds = (profiles ?? []).map(p => p.id)
// Buscar apenas os auth users correspondentes ao tenant:
const authUsersMap: Record<string, string | null> = {}
await Promise.all(
  profileIds.map(async (id) => {
    const { data } = await admin.auth.admin.getUserById(id)
    authUsersMap[id] = data.user?.last_sign_in_at ?? null
  })
)
```

Ou, se a quantidade for pequena (<=50), usar `getUserById` em paralelo. Para escala maior, armazenar `last_sign_in_at` no próprio profile via trigger Supabase.

---

### WR-03: `convite/[token]/page.tsx` lê `convites` com cliente anon — depende de RLS aberta para a tabela

**Arquivo:** `src/app/convite/[token]/page.tsx:11-16`

**Problema:** A página usa `createClient()` (cliente com anon key) para ler `convites`. Se a tabela `convites` não tiver uma policy RLS `SELECT` pública (ou para anon), a query retorna `null` silenciosamente e o usuário vê "Link inválido" mesmo com um token válido. Não há tratamento do `error` da query — apenas `{ data: convite }` é desestruturado.

Comparativamente, o route handler `accept-invite` usa o cliente admin para a mesma consulta, o que garante acesso.

**Correção:** Verificar se a policy RLS existe. Se não, usar o cliente admin server-side (não há problema de segurança pois a página apenas lê `usado` e `expira_em`, sem expor dados sensíveis):

```typescript
// Alternativa sem alterar RLS — usar createClient com service role apenas para esta leitura:
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
const { data: convite } = await admin
  .from('convites')
  .select('usado, expira_em')
  .eq('token', token)
  .maybeSingle()
```

Ou, documentar explicitamente que a tabela `convites` precisa de policy `SELECT` para anon com `USING (true)` — o que expõe a existência de convites mas não dados sensíveis (a coluna `token` já é o segredo de acesso).

---

### WR-04: `handleSave` em `UsersClient` faz duas requisições sequenciais sem rollback

**Arquivo:** `src/app/dashboard/usuarios/UsersClient.tsx:216-257`

**Problema:** `handleSave` primeiro chama `update-user` (linhas 222-236) e depois `disable-user` (linhas 239-250) se o status `ativo` mudou. Se a primeira chamada for bem-sucedida e a segunda falhar, o state do servidor fica inconsistente (nome/role atualizados, mas ban não aplicado), e o frontend mostra erro sem reverter o primeiro update.

O usuário pode re-tentar, mas a UI não indica que uma atualização parcial ocorreu.

**Correção:** A solução preferível é corrigir WR-01 (mover o ban para dentro de `update-user`) tornando a operação atômica no servidor. Como solução de frontend interim, reportar ao usuário que a atualização foi parcial:

```typescript
// Após falha no segundo fetch:
if (!disRes.ok) {
  setError(`Dados salvos, mas falha ao atualizar status: ${disData.error ?? 'erro desconhecido'}. Tente novamente.`)
  router.refresh() // atualizar tabela para refletir estado real
  return
}
```

---

## Informacional

### IN-01: Importação duplicada de `setUserRole` e `isValidRole` em `accept-invite`

**Arquivo:** `src/app/api/admin/accept-invite/route.ts:3-4`

**Problema:** As linhas 3 e 4 fazem dois imports separados do mesmo módulo `@/lib/auth/roles`:
```typescript
import { setUserRole } from '@/lib/auth/roles'
import { isValidRole } from '@/lib/auth/roles'
```

**Correção:**
```typescript
import { setUserRole, isValidRole } from '@/lib/auth/roles'
```

---

### IN-02: Placeholder de email `convite-{uuid}@dasilva.local` pode conflitar com domínio real

**Arquivo:** `src/app/api/admin/accept-invite/route.ts:51`

**Problema:** O email placeholder `convite-${convite.id}@dasilva.local` usa `.local`, que é um domínio mDNS reservado. Se `dasilva.local` estiver configurado na rede local da empresa, o Supabase Auth pode tentar validar/enviar emails para esse domínio. É improvável mas vale documentar.

**Sugestão:** Usar um domínio sem ambiguidade como `noreply.invalid` (domínio reservado pelo RFC 2606 para exatamente este caso):
```typescript
const userEmail = convite.email ?? `convite-${convite.id}@noreply.invalid`
```

---

### IN-03: `send-invite-email` renderiza `inviteLink` diretamente em HTML sem escape

**Arquivo:** `supabase/functions/send-invite-email/index.ts:49`

**Problema:** A linha `<a href="${inviteLink}">` e `<p>${senderName ?? 'Sua equipe'} convidou voce...</p>` interpolam valores sem escape HTML. O `inviteLink` é construído pelo route handler a partir de `process.env.NEXT_PUBLIC_APP_URL` (confiável), mas `senderName` vem de `profiles.name` — um campo editável pelo usuário. Um `senderName` contendo `<script>` ou `</p><img onerror=...>` injetaria HTML no email.

O risco é baixo pois apenas gerentes/adms podem editar nomes, mas é um vetor de injeção em email.

**Sugestão:** Aplicar escape de HTML básico em `senderName` antes da interpolação:
```typescript
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
// Uso:
<p>${escapeHtml(senderName ?? 'Sua equipe')} convidou voce...</p>
```

---

_Revisado: 2026-05-22_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidade: standard_
