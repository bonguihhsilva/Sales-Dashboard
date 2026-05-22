---
phase: 02
slug: schema-v2
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-21
---

# Phase 2 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

> ASVS Level 1 applied: Phase 2 is a database schema/DDL phase (no runtime request handling,
> no new external input surface). L1 verification — control presence and correct configuration —
> is the appropriate depth. Tenant-isolation controls are themselves DB-enforced (RLS).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| cliente → banco | Queries autenticadas de clientes podem tentar acessar dados de outro tenant; RLS é a única barreira | Linhas de tabelas tenant-scoped (vendas, comissões, produtos, layouts, progresso LMS) |
| migration CLI → banco remoto | CLI linkada com credenciais pode aplicar migrations incorretas se o history estiver dessincronizado | DDL (CREATE TABLE, CREATE POLICY, CREATE FUNCTION) |
| tipos TypeScript → schema real | `src/types/supabase.ts` pode divergir do schema se mudanças não regerarem os types | Definições de tipo consumidas no build |
| auth.users (trigger) → schema GDS | `handle_new_user` (SECURITY DEFINER) escreve em `profiles` + `gamificacao` a cada novo signup — global ao projeto Supabase compartilhado | INSERT em profiles/gamificacao por usuário criado em qualquer app do projeto |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-02-01 | Tampering | `tenant_id` em queries | mitigate | RLS resolve tenant via `(SELECT tenant_id FROM profiles WHERE id = auth.uid())` — não depende de input do cliente. Verificado em `0010_rls_policies.sql` (16 usos do padrão, linhas 13/21/31/40/48/59/68/75/97/110/115/126/139/153/172/189/206). | closed |
| T-02-02 | Information Disclosure | Cross-tenant data leakage | mitigate | Toda tabela tenant-scoped tem policy de isolamento; tabelas-filhas isolam via EXISTS-join ao tenant do pai; tabelas user-scoped isolam por `usuario_id = auth.uid()`; `widget_types` global por design (sem dados sensíveis). 17 `ENABLE ROW LEVEL SECURITY` + 23 `CREATE POLICY` em `0010`; live `rowsecurity = true` confirmado pelo orquestrador. | closed |
| T-02-03 | Tampering | NULL `tenant_id` JWT bypass | mitigate | RLS lê o tenant da tabela `profiles` (fonte de verdade), não de claim JWT — documentado em `0010:4-5`. `0013:20-22` faz `UPDATE profiles SET tenant_id ... WHERE tenant_id IS NULL`. Live `count(*) FROM profiles WHERE tenant_id IS NULL = 0` confirmado pelo orquestrador. | closed |
| T-02-04 | Denial of Service | Migration history desync causando push parcial | mitigate | Controle de processo: Tarefa 1 reparou os 15 timestamps remotos antes do push; `--dry-run` validou. `02-VERIFICATION.md` confirma migrations 0002–0013 Applied (Local=Remote) e `npm run build` verde. | closed |
| T-02-05 | Information Disclosure | `src/types/supabase.ts` desatualizado vs schema real | mitigate | `supabase gen types` executado como última tarefa antes do build. `src/types/supabase.ts` exporta `Database` (linha 9) e contém os blocos de todas as tabelas GDS (tenants:1507, vendas:1584, trilhas:1546, gamificacao:548, widget_types:1667, modulos:937, comissoes_calculadas:268, convites:339). `02-VERIFICATION.md` confirma build verde e ausência de divergência vs schema live. | closed |
| T-02-06 | Elevation of Privilege | Funções SECURITY DEFINER | accept | `handle_new_user` (`0010:213-234`) é `SECURITY DEFINER SET search_path = public`, apenas INSERT em `profiles`/`gamificacao`, sem input externo direto. Aceito COM ressalva — ver Accepted Risks Log (blast radius expandido por DB compartilhado). | closed |
| T-02-07 | Information Disclosure | Seeds LMS visíveis para todos os tenants | accept | `trilhas.tenant_id` nullable por design (`0008:9`); policy `trilhas_tenant_or_global` (`0010:107-111`) expõe intencionalmente linhas com `tenant_id IS NULL`. Conteúdo de treinamento global, sem dados sensíveis de negócio. Ver Accepted Risks Log. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

### Verification Evidence — Mitigate Threats

- **T-02-01** — `supabase/migrations/0010_rls_policies.sql`: padrão `(SELECT tenant_id FROM profiles WHERE id = auth.uid())` presente em 16 policies tenant-scoped. Tenant resolvido server-side a partir de `profiles`, nunca de input do cliente nem de claim JWT.
- **T-02-02** — `supabase/migrations/0010_rls_policies.sql`: cross-check tabela a tabela —
  - Coluna `tenant_id` direta + policy de isolamento: `tenants` (`tenants_select_own`), `categorias` (`categorias_tenant`), `produtos` (`produtos_tenant`), `vendas` (`vendas_tenant`), `regras_comissao` (`regras_comissao_tenant`), `comissoes_calculadas` (`comissoes_tenant`), `convites` (`convites_tenant`).
  - Tabela-filha isolada via EXISTS-join ao tenant do pai: `itens_venda` (→ `vendas`), `modulos`/`licoes`/`quiz_questoes` (→ `trilhas`).
  - Tabela user-scoped isolada por `usuario_id = auth.uid()`: `dashboard_layouts`, `progresso_usuario`, `quiz_resultados`, `gamificacao` (com leitura adicional `role = 'adm'` restrita ao mesmo tenant).
  - `widget_types`: global por design — policy `widget_types_authenticated` (SELECT para qualquer autenticado); sem `tenant_id` e sem dados sensíveis.
  - Observação não-bloqueante: `convites_token_select` (`0010:101-102`) usa `FOR SELECT USING (true)` — leitura pública do token de convite, intencional (o token é o próprio segredo). Pertence à superfície da Phase 3 (Auth) e deve ser revisada lá; não é uma falha de isolamento de tenant da Phase 2.
- **T-02-03** — `0010_rls_policies.sql:4-5` documenta a escolha de ler de `profiles` em vez de `auth.jwt() ->> 'tenant_id'`; `0013_seed_tenant_inicial.sql:20-22` faz o backfill. Efetividade confirmada na DB live pelo orquestrador.
- **T-02-04** — `02-VERIFICATION.md` (Truth 1, status passed): migrations 0002–0013 presentes e Applied; `npm run build` verde. Mitigação de processo julgada pela evidência de verificação.
- **T-02-05** — `src/types/supabase.ts:9` exporta `Database`; blocos de tipo de todas as tabelas GDS presentes; `02-VERIFICATION.md` (Truth 4) confirma build verde e nenhuma divergência vs schema live.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-06 | Funções SECURITY DEFINER (`handle_new_user`) — aceito COM RESSALVA. Ver detalhamento abaixo. | Orquestrador /gsd-secure-phase (em nome do dono do projeto) | 2026-05-21 |
| AR-02-02 | T-02-07 | Seeds LMS globais visíveis a todos os tenants. `trilhas` com `tenant_id IS NULL` são conteúdo de treinamento global intencional ("Vendas no Varejo CDE"). Não contêm dados sensíveis de negócio nem dados de cliente — apenas material didático destinado a ser compartilhado. Policy `trilhas_tenant_or_global` (`0010:107-111`) expõe essas linhas de propósito; `INSERT` continua restrito ao tenant do autor (`trilhas_tenant_insert`, `0010:113-116`). Risco residual nulo. | Orquestrador /gsd-secure-phase (em nome do dono do projeto) | 2026-05-21 |

### AR-02-01 — Detalhamento (T-02-06, SECURITY DEFINER) — ACEITO COM RESSALVA

`handle_new_user` (`supabase/migrations/0010_rls_policies.sql:213-234`):
- É `SECURITY DEFINER SET search_path = public` — `search_path` fixado mitiga sequestro de resolução de nomes.
- Escopo restrito a `INSERT ... ON CONFLICT DO NOTHING` em `profiles` e `gamificacao`. Sem `UPDATE`/`DELETE`, sem SQL dinâmico, sem input externo direto além de `NEW.raw_user_meta_data` (consumido apenas via `COALESCE` em colunas de texto).

**RESSALVA — blast radius expandido por banco compartilhado:**
A DB `zsczxblhtdhpdqvkpuwz` é COMPARTILHADA com um app de teste separado (pet-shop), que contribui com 13 tabelas estrangeiras (`bookings`, `pets`, `organizations`, `clients`, `services`, `cash_registers`, `financial_*`, `hr_*`). A migration `0010` usa `CREATE OR REPLACE FUNCTION handle_new_user()` — uma função global ao projeto Supabase. Consequência: a reescrita da Phase 2 dessa função SECURITY DEFINER agora dispara TAMBÉM para signups do app pet-shop, inserindo linhas em `profiles` e `gamificacao` (tabelas GDS) para todo usuário criado em `auth.users` no projeto inteiro.

A disposição original ("escopo limitado a operações INSERT/SELECT seguras; sem input externo direto") subestimou esse alcance: o gatilho é project-wide, não app-wide. As operações em si permanecem seguras (INSERT idempotente, sem privilégio adicional explorável), por isso a ameaça **permanece ACEITA, não OPEN** — não há vulnerabilidade explorável introduzida. Porém o acoplamento entre dois apps não relacionados via uma função SECURITY DEFINER compartilhada é uma fragilidade arquitetural registrada aqui.

**Recomendação (não-bloqueante para a Phase 2):** mover o app pet-shop para o seu próprio projeto Supabase, eliminando a `auth.users` compartilhada e isolando o gatilho `handle_new_user` ao escopo GDS. Até lá, qualquer alteração futura em `handle_new_user` deve considerar que ela executa para signups de ambos os apps.

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-21 | 7 | 7 | 0 | Claude (gsd-security-auditor) |

Notas da auditoria:
- 5 ameaças `mitigate` (T-02-01..05) verificadas por presença do controle declarado nos arquivos citados; todas CLOSED.
- 2 ameaças `accept` (T-02-06, T-02-07) registradas no Accepted Risks Log; T-02-06 com ressalva de banco compartilhado conforme contexto crítico do orquestrador.
- `02-01-SUMMARY.md` não possui seção `## Threat Flags` — nenhuma flag não-registrada a processar.
- Estado live da DB (`rowsecurity = true` em 17 tabelas, `profiles.tenant_id IS NULL` = 0, migrations 0002–0013 Applied, build verde) confirmado autoritativamente pelo orquestrador via SQL — auditor sem acesso direto à DB.
- Nenhum arquivo de implementação (migrations, `src/`) foi modificado.
- Item de acompanhamento para a Phase 3 (Auth), não-bloqueante para a Phase 2: a policy `convites_token_select` (`0010:101-102`) permite SELECT público em `convites`; revisar o modelo de exposição do token no contexto do fluxo de convite.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-21
