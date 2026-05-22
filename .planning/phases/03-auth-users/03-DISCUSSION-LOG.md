# Phase 3: Auth & Users - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 03-auth-users
**Areas discussed:** Hierarquia de Roles, Fluxo de Convite, Middleware, Tabela de Usuários

---

## Hierarquia de Roles

| Option | Description | Selected |
|--------|-------------|----------|
| adm = gerente (mesmo poder) | Ambos idênticos, apenas nomes diferentes | |
| gerente ⊂ adm (gerente mais restrito) | adm configura sistema; gerente gerencia equipe | ✓ |
| Manter só adm, eliminar gerente | Simplificar para 3 roles | |

**User's choice:** gerente ⊂ adm — gerente tem acesso a todo /dashboard/* exceto /dashboard/config

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas gerente | Só gerente pode convidar | |
| adm e gerente | Ambos podem convidar | |
| qualquer adm/gerente/super_admin | Todos os roles de alto nível | ✓ |

**User's choice:** adm, gerente, super_admin podem todos criar convites

| Option | Description | Selected |
|--------|-------------|----------|
| Regras de comissão (CRUD) | Gerente não edita regras | |
| Importação CEC | Gerente não importa dados | |
| Configurações do tenant | Gerente não acessa /dashboard/config | ✓ |
| Claude's Discretion | Definir pela rota | |

**User's choice:** Gerente bloqueado apenas de /dashboard/config (configurações do tenant)

---

## Fluxo de Convite

| Option | Description | Selected |
|--------|-------------|----------|
| UI mostra link para copiar | Link gerado sempre visível | |
| Email sempre obrigatório | Sem email, sem convite | |
| Ambos: link na tela + email se preenchido | Link sempre, email opcional como canal adicional | ✓ |

**User's choice:** Ambos — link sempre na UI, email enviado se preenchido

| Option | Description | Selected |
|--------|-------------|----------|
| 7 dias | Já definido no schema Phase 2 | ✓ |
| 24 horas | Mais seguro | |
| 30 dias | Para contratações antecipadas | |

**User's choice:** 7 dias

| Option | Description | Selected |
|--------|-------------|----------|
| Mínimo: apenas definir senha | Só senha + confirmar senha | ✓ |
| Senha + nome completo | Vendedor confirma próprio nome | |
| Senha + mostrar role/loja atribuídos | Transparente sobre o que está sendo aceito | |

**User's choice:** Formulário mínimo — apenas senha + confirmar senha

---

## Middleware

| Option | Description | Selected |
|--------|-------------|----------|
| JWT app_metadata | Role no token — zero queries extras | ✓ |
| Query DB a cada request | Atual, sempre atualizado, mais lento | |

**User's choice:** JWT app_metadata — role lido do token no middleware

**Notes:** Consequência: ao criar/atualizar role, update em `profiles.role` AND `auth.users.app_metadata.role` via service role.

---

## Tabela de Usuários

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown inline na linha | Select direto na célula | |
| Sheet lateral ao clicar no usuário | Painel com todos os campos editáveis | ✓ |

**User's choice:** Sheet lateral com todos os campos (nome, role, loja, ativo)

| Option | Description | Selected |
|--------|-------------|----------|
| Sim — banir usuário no Supabase | admin.updateUserById({ banned: true }) — sessão revogada | ✓ |
| Não — apenas active: false no profile | Usuário fica logado até token expirar | |

**User's choice:** Banir no Supabase — invalida sessões ativas imediatamente

---

## Claude's Discretion

- Visual do /login redesign (shadcn components, tema dark GDS, sem mudança no layout geral)
- Form de criação de convite em Sheet/Dialog
- Skeleton loading na tabela de usuários

## Deferred Ideas

Nenhuma ideia fora de escopo mencionada.
