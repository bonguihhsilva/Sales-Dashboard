---
phase: 03-auth-users
verified: "2026-05-22T21:00:00Z"
status: human_needed
score: 4/5
overrides_applied: 0
gaps:
  - truth: "Gerente cria convite em /dashboard/usuarios, link /convite/[token] e-mail e abre pagina de definicao de senha"
    status: partial
    reason: "Migration 0014_auth_roles.sql foi criada mas NAO foi aplicada ao banco Supabase. Sem ela: (1) CHECK constraint ainda restringe role a 'adm|vendedor' — gerentes/super_admin nao podem ser atribuidos; (2) coluna 'convites.loja' nao existe — POST /api/admin/invite falha ao tentar inserir o campo loja; (3) coluna ainda pode se chamar 'active' em vez de 'ativo' na tabela profiles. O codigo esta correto; o banco nao esta sincronizado."
    artifacts:
      - path: "supabase/migrations/0014_auth_roles.sql"
        issue: "Arquivo criado mas nao aplicado ao banco Supabase zsczxblhtdhpdqvkpuwz. SUMMARY 03-01 documenta explicitamente: 'Aplicar manualmente no Supabase SQL Editor'."
    missing:
      - "Aplicar supabase/migrations/0014_auth_roles.sql no banco via Supabase SQL Editor ou CLI"
human_verification:
  - test: "Verificar se migration 0014 foi aplicada ao banco"
    expected: "SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='ativo' retorna 1 linha. SELECT column_name FROM information_schema.columns WHERE table_name='convites' AND column_name='loja' retorna 1 linha."
    why_human: "Requer acesso ao banco Supabase zsczxblhtdhpdqvkpuwz para executar query ao information_schema."
  - test: "Teste end-to-end do fluxo de convite"
    expected: "Gerente logado em /dashboard/usuarios clica 'Convidar usuario', preenche role=gerente, loja=Jebai, gera convite. Link /convite/[token] abre tela 'Definir senha'. Novo usuario define senha, faz login, profiles.role = 'gerente' e profiles.store = 'Jebai'."
    why_human: "Fluxo completo requer navegador com sessao ativa, banco com migration aplicada e verificacao visual de UI e dados."
  - test: "Verificar isolamento multi-tenant na tabela de usuarios"
    expected: "Gerente logado no tenant gds-interno ve apenas usuarios do seu tenant — sem usuarios do PetHub ou outros tenants que compartilham o banco."
    why_human: "Requer acesso ao banco com multiplos tenants para confirmar que o filtro por tenant_id funciona corretamente."
  - test: "Teste de RBAC: vendedor nao acessa /dashboard"
    expected: "Usuario com role=vendedor ao navegar para /dashboard e redirecionado para /meu-resultado automaticamente pelo middleware."
    why_human: "Requer sessao de usuario com role=vendedor setado em app_metadata para testar o redirect do middleware."
---

# Fase 03: Auth & Users — Relatório de Verificação

**Objetivo da Fase:** Usuarios acessam o sistema com roles corretos e gerentes convidam novos membros sem intervencao tecnica
**Verificado:** 2026-05-22T21:00:00Z
**Status:** human_needed
**Re-verificacao:** Nao — verificacao inicial

## Conquista do Objetivo

### Verdades Observaveis

| # | Verdade | Status | Evidencia |
|---|---------|--------|-----------|
| 1 | Rotas protegidas bloqueiam acesso fora do role — vendedor nao acessa /dashboard/*, super_admin acessa /admin/* | VERIFICADO | `src/middleware.ts` contem ROLE_RULES com 5 entradas, PUBLIC_PREFIXES com '/convite', le role de `user.app_metadata?.role` sem query ao banco, usa `getUser()` nao `getSession()` |
| 2 | Pagina /login usa design system v2 e nao oferece auto-cadastro | VERIFICADO | `src/app/login/page.tsx` importa Card, Input, Label, Button de `@/components/ui`, contem `role="alert"` no bloco de erro, contem `signInWithPassword`, zero `style={{`, sem link de cadastro/recuperacao |
| 3 | Gerente cria convite em /dashboard/usuarios, link /convite/[token] gerado e pagina de definicao de senha funciona | PARCIAL | Codigo correto (invite route, accept-invite, ConviteForm), MAS migration 0014 nao aplicada ao banco — `convites.loja` ainda nao existe, CHECK constraint ainda restringe roles a 2 valores |
| 4 | Novo usuario define senha via link, faz login e tem role + loja pre-configurados automaticamente | VERIFICADO (codigo) | `accept-invite/route.ts` valida token, cria user, chama `setUserRole` (app_metadata + profiles.role), atualiza `profiles.store` e `profiles.tenant_id`, marca `usado=true`. Dependente da migration estar aplicada. |
| 5 | Tabela de usuarios mostra nome, numero vendedor, loja, role, ativo, ultimo acesso com filtros e acoes inline | VERIFICADO | `UsersClient.tsx` tem 7 colunas (name/numero_vendedor/store/role/ativo/last_sign_in_at/acoes), filtros Select por role e loja via searchParams, Sheet de convite com email opcional + link copiar, Sheet de edicao, Dialog desativacao, handleReenviarConvite funcional |

**Pontuacao:** 4/5 verdades verificadas (a #3 e parcial — codigo OK, banco pendente)

### Itens Diferidos

Nenhum — todos os criterios de sucesso da fase 3 sao autocontidos.

## Artefatos Obrigatorios

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|---------|
| `supabase/migrations/0014_auth_roles.sql` | Migration de schema (4 roles + rename ativo + convites.loja) | CRIADO, NAO APLICADO | Arquivo existe e contem `profiles_role_check`, `RENAME COLUMN active TO ativo`, `ALTER TABLE convites ADD COLUMN IF NOT EXISTS loja text`. Pendente aplicacao manual no banco. |
| `src/types/index.ts` | UserRole com 4 valores e Profile atualizado | VERIFICADO | `UserRole = 'vendedor' \| 'adm' \| 'gerente' \| 'super_admin'`, `ativo: boolean`, `numero_vendedor`, `tenant_id` presentes; `active: boolean` removido; STORE_LABELS e VendorSummary intactos |
| `src/middleware.ts` | RBAC por app_metadata.role com 5 grupos de rotas | VERIFICADO | ROLE_RULES com 5 entradas, PUBLIC_PREFIXES inclui '/convite', zero referencias a 'profiles', zero `getSession`, usa `app_metadata?.role` |
| `src/app/login/page.tsx` | Tela de login redesenhada com design system v2 | VERIFICADO | Card/Input/Label/Button shadcn, zero inline styles, `signInWithPassword` preservado, sem auto-cadastro |
| `src/lib/auth/roles.ts` | Constantes de roles e funcao setUserRole | VERIFICADO | Exporta INVITE_ALLOWED_ROLES, ASSIGNABLE_ROLES, isValidRole, canInvite, setUserRole; setUserRole atualiza `updateUserById` + `profiles.role` |
| `src/app/api/admin/invite/route.ts` | Route handler POST que cria convite e retorna link | VERIFICADO | from('convites').insert, canInvite(callerRole), app_metadata, /convite/ no link, try/catch para email, email_sent no response |
| `src/app/api/admin/accept-invite/route.ts` | Route handler que valida token, cria user, corrige profile, marca convite usado | VERIFICADO | Checa `usado` (409), `expira_em` (410), chama setUserRole, atualiza store/tenant_id, marca `usado: true` |
| `src/app/convite/[token]/page.tsx` | Server component que valida token e renderiza form ou card de erro | VERIFICADO | Sem 'use client', await params, from('convites'), 3 estados de erro (Link invalido/expirado/ja utilizado), renderiza ConviteForm quando valido |
| `src/app/convite/[token]/ConviteForm.tsx` | Client component com formulario de senha | VERIFICADO | 'use client', accept-invite no fetch, validacoes password.length e confirm, sem campos de role/loja |
| `supabase/functions/send-invite-email/index.ts` | Edge Function Deno que envia email via Resend | VERIFICADO | Deno.serve, OPTIONS/CORS, checagem RESEND_API_KEY com degradacao gracosa (sent:false), fetch api.resend.com |
| `src/app/api/admin/disable-user/route.ts` | Route handler que bane usuario e sincroniza profiles.ativo | VERIFICADO | ban_duration '876600h'/'none', bloqueia auto-desativacao (userId === user.id), profiles.ativo sincronizado |
| `src/app/api/admin/update-user/route.ts` | Route handler que atualiza user com 4 roles | VERIFICADO | setUserRole quando role muda, canInvite para autorizacao, isValidRole, sem guard antigo de 1 role |
| `src/app/dashboard/usuarios/page.tsx` | Server component com guard de 4 roles e fetch de profiles + last_sign_in_at | VERIFICADO | Sem 'use client', guard app_metadata, listUsers({ perPage: 1000 }), .eq('tenant_id', tenantId), exporta UserRow |
| `src/app/dashboard/usuarios/UsersClient.tsx` | Tabela com DataTable, filtros, Sheets e acao reenviar convite | VERIFICADO | DataTable, Select filtros, inviteOpen/editingUser/disablingUser, EmptyState, Sheet convite, Sheet edicao, Dialog desativacao, handleReenviarConvite chamando /api/admin/invite |

## Verificacao de Links Chave

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `src/middleware.ts` | `user.app_metadata.role` | leitura do JWT retornado por getUser() | WIRED | `(user.app_metadata?.role as string \| undefined) ?? 'vendedor'` |
| `src/middleware.ts` | `/convite` como rota publica | PUBLIC_PREFIXES antes do auth guard | WIRED | `PUBLIC_PREFIXES = ['/login', '/convite', '/api']` |
| `src/app/api/admin/invite/route.ts` | tabela `convites` | admin.from('convites').insert | WIRED (cod.) | Codigo correto, mas `convites.loja` nao existe no banco ate migration ser aplicada |
| `src/app/api/admin/invite/route.ts` | `app_metadata.role` do caller | getUser() + checagem de INVITE_ALLOWED_ROLES | WIRED | `callerRole = user.app_metadata?.role`, `canInvite(callerRole)` retorna 403 |
| `src/app/convite/[token]/page.tsx` | tabela `convites` | select por token + checagem usado/expira_em | WIRED | `from('convites').select('usado, expira_em').eq('token', token).maybeSingle()` |
| `src/app/convite/[token]/ConviteForm.tsx` | `/api/admin/accept-invite` | fetch no submit | WIRED | `fetch('/api/admin/accept-invite', { method: 'POST', ... })` |
| `src/app/api/admin/accept-invite/route.ts` | `convites.usado` | update usado=true apos criar user | WIRED | `.update({ usado: true }).eq('id', convite.id)` |
| `src/app/dashboard/usuarios/page.tsx` | `admin.auth.admin.listUsers` | merge de last_sign_in_at com profiles do tenant | WIRED | `admin.auth.admin.listUsers({ perPage: 1000 })` com merge por id |
| `src/app/dashboard/usuarios/UsersClient.tsx` | `/api/admin/invite` | fetch no submit do Sheet de convite E na acao reenviar convite | WIRED | Duas chamadas a `/api/admin/invite`: handleGerarConvite (linha 141) e handleReenviarConvite (linha 196) |
| `src/app/dashboard/usuarios/UsersClient.tsx` | `/api/admin/disable-user` | fetch na confirmacao do Dialog | WIRED | handleDisable e handleSave (quando ativo muda) ambos chamam `/api/admin/disable-user` |

## Rastreio de Fluxo de Dados (Nivel 4)

| Artefato | Variavel de Dados | Fonte | Produz Dados Reais | Status |
|----------|-------------------|-------|---------------------|--------|
| `UsersClient.tsx` | `users: UserRow[]` | props de `page.tsx` via server component | Sim — page.tsx busca profiles por tenant_id + merge com listUsers | FLOWING |
| `page.tsx` | `profiles` | `supabase.from('profiles').select('*').eq('tenant_id', tenantId)` | Sim — query ao banco com filtro por tenant | FLOWING |
| `ConviteForm.tsx` | feedback de submit | fetch POST /api/admin/accept-invite | Sim — resposta real da API | FLOWING |

## Verificacoes Comportamentais (Nivel 7b)

| Comportamento | Comando | Resultado | Status |
|---------------|---------|-----------|--------|
| Build passa sem erros | `npm run build` | Exit 0, todas as rotas compiladas | PASS |
| Lint sem erros | `npm run lint` | "No ESLint warnings or errors" | PASS |
| ROLE_RULES tem 5 entradas | Inspecao do arquivo | 5 prefixos: /admin, /dashboard/config, /dashboard, /meu-resultado, /treinamento | PASS |
| Middleware sem query ao banco | `grep profiles src/middleware.ts` | Nenhum match | PASS |
| UsersClient sem .active legado | `grep '\.active' src/...UsersClient.tsx` | Nenhum match | PASS |
| handleReenviarConvite nao e stub | Inspecao de codigo | Faz fetch real para /api/admin/invite, sem `disabled` nem "Em breve" | PASS |

## Cobertura de Requisitos

| Requisito | Plano Fonte | Descricao | Status | Evidencia |
|-----------|-------------|-----------|--------|-----------|
| AUTH-01 | 03-01 | Middleware protege rotas por role (4 roles, 5 grupos) | SATISFEITO | `src/middleware.ts` com ROLE_RULES de 5 entradas, app_metadata.role |
| AUTH-02 | 03-02 | /login redesenhada com design system v2 | SATISFEITO | shadcn Card/Input/Label/Button, zero inline styles, sem auto-cadastro |
| AUTH-03 | 03-03 | Gerente cria convite com email opcional, sistema gera link | PARCIAL | Codigo correto; migration 0014 nao aplicada — `convites.loja` ausente no banco bloqueia insercao |
| AUTH-04 | 03-04 | Novo usuario acessa /convite/[token], define senha, perfil com role+loja corretos | PARCIAL | Codigo correto e completo; dependente da migration 0014 estar aplicada |
| AUTH-05 | 03-05 | Envio de email de convite via Edge Function com Resend | SATISFEITO (cod.) | Edge Function criada com degradacao gracosa; deploy pendente (CLI nao disponivel); convite funciona por link sem o deploy |
| AUTH-06 | 03-06 | Tabela de usuarios com 6 colunas, filtros, acoes inline | SATISFEITO | DataTable 7 colunas, filtros Select, Sheet convite+edicao, Dialog desativacao, Reenviar convite funcional |

## Anti-Padroes Encontrados

| Arquivo | Linha | Padrao | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `supabase/migrations/0014_auth_roles.sql` | — | Migration criada mas nao aplicada ao banco | BLOCKER | Sem aplicacao: `convites.loja` nao existe (POST /api/admin/invite falha), CHECK ainda restringe 2 roles, coluna `active` ainda existe em profiles |
| `supabase/functions/send-invite-email/index.ts` | — | Edge Function nao deployada (CLI nao disponivel no worktree) | INFO | Nao bloqueia o fluxo — try/catch no invite route garante degradacao gracosa; convite funciona por link sem email |

## Verificacao Humana Necessaria

### 1. Aplicacao da Migration 0014

**Teste:** Executar no SQL Editor do Supabase (projeto zsczxblhtdhpdqvkpuwz):
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name='profiles' AND column_name='ativo';

SELECT column_name FROM information_schema.columns 
WHERE table_name='convites' AND column_name='loja';
```
Se a primeira query retornar vazio, aplicar `supabase/migrations/0014_auth_roles.sql` no SQL Editor.
**Esperado:** Ambas retornam 1 linha apos a migration estar aplicada.
**Por que humano:** Requer acesso ao banco Supabase com credenciais.

### 2. Teste End-to-End do Fluxo de Convite

**Teste:** Com migration aplicada, logar como gerente em /dashboard/usuarios. Clicar "Convidar usuario", preencher role=Gerente, loja=Jebai, gerar convite. Copiar o link /convite/[token]. Abrir em aba anonima — deve exibir "Definir senha" sem redirecionar para /login. Definir senha. Logar com o novo usuario.
**Esperado:** Novo usuario logado tem profiles.role = 'gerente' e profiles.store = 'Jebai'. Middleware redireciona para /dashboard (nao /meu-resultado).
**Por que humano:** Fluxo completo requer browser com sessao ativa e banco com migration.

### 3. Isolamento Multi-Tenant

**Teste:** Logar como gerente do tenant gds-interno. Verificar que a tabela /dashboard/usuarios nao mostra usuarios do PetHub ou outros tenants que compartilham o banco zsczxblhtdhpdqvkpuwz.
**Esperado:** Apenas usuarios com `profiles.tenant_id` igual ao do gerente logado aparecem na tabela.
**Por que humano:** Requer banco com multiplos tenants para confirmar o isolamento.

### 4. RBAC: Vendedor Nao Acessa /dashboard

**Teste:** Logar como usuario com `app_metadata.role = 'vendedor'`. Tentar navegar para /dashboard.
**Esperado:** Middleware redireciona automaticamente para /meu-resultado.
**Por que humano:** Requer sessao de usuario com role=vendedor configurado em app_metadata (exige acesso ao painel Supabase Auth ou ao banco para setar app_metadata).

### 5. Deploy da Edge Function send-invite-email

**Teste:** Executar `supabase functions deploy send-invite-email --no-verify-jwt` (requer CLI autenticada). Depois criar convite com email preenchido.
**Esperado:** Response inclui `email_sent: true` e email de convite chega na caixa de entrada.
**Por que humano:** Requer CLI Supabase autenticada e chave RESEND_API_KEY configurada.

## Resumo dos Gaps

O codigo da Fase 3 esta completo e correto — `npm run build` e `npm run lint` passam sem erros. Todos os artefatos existem, sao substantivos e estao conectados (wiring).

**Gap critico:** A migration `0014_auth_roles.sql` foi criada mas nao foi aplicada ao banco Supabase. Esta pendencia foi documentada explicitamente no 03-01-SUMMARY.md como acao manual necessaria. Sem a migration:

1. O CHECK constraint de `profiles.role` ainda restringe a `adm | vendedor` — gerentes e super_admin nao podem ser criados
2. A coluna `convites.loja` nao existe — `POST /api/admin/invite` falhara com erro de coluna ao tentar inserir
3. A coluna `profiles.ativo` pode ainda se chamar `active` — o código que escreve `ativo` funcionaria, mas o código que le pode retornar `null`

**Acao necessaria:** Aplicar `supabase/migrations/0014_auth_roles.sql` no SQL Editor do Supabase antes de testar o fluxo de convite em producao.

**Nota:** AUTH-01 (middleware), AUTH-02 (login page) e AUTH-06 (tabela de usuarios) sao independentes da migration e estao totalmente funcionais. AUTH-05 (email) funciona por link mesmo sem deploy da Edge Function.

---

_Verificado: 2026-05-22T21:00:00Z_
_Verificador: Claude (gsd-verifier)_
