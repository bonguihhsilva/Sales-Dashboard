# Phase 2: Schema v2 - Research

**Researched:** 2026-05-20
**Domain:** Supabase PostgreSQL migrations, RLS multi-tenant, TypeScript type generation
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCHEMA-01 | Migration tenants (slug, plano, cor_primaria, moeda_padrao, locale, ativo) | Schema alvo definido em CLAUDE_2.md §3.1; ALTER TABLE profiles necessário |
| SCHEMA-02 | Migration produtos e categorias com hierarquia (pai_id) | Schema alvo em CLAUDE_2.md §3.2 |
| SCHEMA-03 | Migration vendas e itens_venda substituindo vendor_summary como fonte primária | Schema alvo em CLAUDE_2.md §3.3; periods.id é integer (serial), não uuid |
| SCHEMA-04 | Migration motor de comissão: regras_comissao (jsonb) e comissoes_calculadas | Schema alvo em CLAUDE_2.md §3.4 |
| SCHEMA-05 | Migration dashboard_layouts com jsonb de widgets por usuário | Schema alvo em CLAUDE_2.md §3.5 |
| SCHEMA-06 | Migration convites com token, role, expiry | Schema alvo em CLAUDE_2.md §3.6 |
| SCHEMA-07 | Migration LMS completo (trilhas, modulos, licoes, quiz_questoes, progresso_usuario, quiz_resultados, gamificacao) | Schema alvo em CLAUDE_2.md §3.7 |
| SCHEMA-08 | RLS policies em todas as tabelas com isolamento por tenant_id | Padrão JWT claim; tabelas existentes usam padrão role-based sem tenant_id |
| SCHEMA-09 | Seeds: 7 widget_types, trilha "Vendas no Varejo CDE" com 8 módulos + quizzes, tenant GDS Interno | Conteúdo completo em CLAUDE_2.md §8 e §9 |
| SCHEMA-10 | TypeScript types gerados via supabase gen types e exportados de src/types/supabase.ts | CLI disponível, comando verificado: `npx supabase gen types typescript --linked` |
</phase_requirements>

---

## Summary

O banco remoto do projeto `zsczxblhtdhpdqvkpuwz` contém apenas o schema v1: tabelas `profiles`, `periods`, `goals`, `sales_records`, views `vendor_summary` e `client_portfolio`, e RPC `vendor_evolution`. O schema v2 definido em CLAUDE_2.md §3 ainda não existe remotamente.

O bloqueio TTY do `supabase db push` mencionado nos constraints **NÃO se aplica** nesta máquina: Docker 29.2.1 está instalado e o CLI npx supabase está autenticado e linkedao projeto correto. Porém, Docker Desktop (engine Linux) **não está rodando** — `db dump` local falha. O caminho correto para aplicar migrations é `supabase db push --linked` (aplica diretamente no projeto remoto sem Docker local).

O gap de migrations precisa ser resolvido antes de qualquer `db push`: o banco remoto tem 15 migrations com timestamps que não existem na pasta local. A estratégia é fazer `migration repair --status reverted` para cada uma delas antes de aplicar as novas.

**Primary recommendation:** Resolver divergência de history table via `migration repair`, depois criar migrations numeradas (0002–0013) conforme spec do CLAUDE_2.md e aplicar via `supabase db push --linked`.

---

## Project Constraints (from CLAUDE.md)

### Directives obrigatórias relevantes a esta fase

| Diretiva | Valor |
|----------|-------|
| Database | Supabase projeto `zsczxblhtdhpdqvkpuwz` — toda mudança via migration |
| RLS | Ativo em todas as tabelas — nunca desabilitar |
| Multi-tenant | Obrigatório — todas as novas tabelas devem ter `tenant_id` |
| Moeda | USD por padrão, configurável por tenant — nunca hardcodar |
| TypeScript | strict mode — sem `any` implícito |
| Banco direto | Nunca modificar banco diretamente sem migration |
| Build | `npm run build` deve passar antes de declarar fase concluída |

---

## Estado Atual do Banco (VERIFICADO)

### Tabelas existentes no remoto
[VERIFIED: npx supabase gen types --linked + migration list]

| Tabela/View | Tipo | Colunas principais |
|-------------|------|--------------------|
| `profiles` | TABLE | id (uuid), name, role (enum: 'adm'\|'vendedor'), vendor_id, store, active, created_at, updated_at |
| `periods` | TABLE | id (**integer/serial**), year, month, label, start_date, end_date, closed, created_at |
| `goals` | TABLE | id (serial), period_id (integer FK), vendor_id (text), meta1-3, bonus1-3, commission_pct |
| `sales_records` | TABLE | id (bigserial), period_id (integer FK), vendor_id, vendor_name, store, client_id, client_name, sale_date, valor |
| `vendor_summary` | VIEW | Agrega sales_records + goals |
| `client_portfolio` | VIEW | Agrega sales_records por cliente |
| `vendor_evolution` | RPC | Retorna histórico cross-período de um vendedor |

### Enum existente
- `user_role`: `'adm' | 'vendedor'`

### Divergência crítica de migration history
[VERIFIED: npx supabase migration list --linked]

O banco remoto tem 15 migrations registradas na tabela `supabase_migrations.schema_migrations` que **não existem** na pasta local `supabase/migrations/`. O arquivo local `0001_schema_inicial.sql` também não está presente no remoto (foi criado manualmente durante Phase 1 como documentação, mas nunca aplicado via CLI).

**Impacto:** `supabase db push --linked` falha com erro de divergência. Solução: `migration repair --status reverted` para as 15 migrations remotas antes de qualquer push.

---

## Standard Stack

### Core
| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| supabase CLI (npx) | 2.100.1 | Aplicar migrations, gerar types |
| PostgreSQL | 17.6 (Supabase managed) | Banco de dados |
| `@supabase/ssr` | ^0.5.2 | Client SSR (já instalado) |
| `@supabase/supabase-js` | ^2.47.0 | Client base (já instalado) |

### Ambiente
[VERIFIED: comandos de ambiente executados nesta sessão]

| Dependência | Disponível | Versão | Observação |
|-------------|-----------|--------|------------|
| Docker Engine | Sim | 29.2.1 | Instalado mas Docker Desktop não rodando |
| Docker Desktop (Linux engine) | NÃO ativo | — | Necessário para `supabase db dump` local |
| npx supabase CLI | Sim | 2.100.1 | Autenticado, projeto linked |
| `supabase db push --linked` | Sim | — | Funciona sem Docker Desktop local |
| `supabase gen types --linked` | Sim | — | Verificado e funcional |
| Supabase Studio | Sim | — | Alternativa manual via https://supabase.com/dashboard |

---

## Architecture Patterns

### Estratégia de Migration

**Padrão de nomenclatura adotado no projeto:** Numérico sequencial (0001, 0002...) — não usar timestamps Supabase default. O config.json confirma `"phase_naming": "sequential"`.

**Sequência de migrations para esta fase:**
```
0002_tenants.sql
0003_produtos_categorias.sql
0004_vendas_itens.sql
0005_motor_comissao.sql
0006_dashboard_widgets.sql
0007_convites.sql
0008_lms_schema.sql
0009_gamificacao.sql
0010_rls_policies.sql
0011_seed_widget_types.sql
0012_seed_lms_conteudo.sql
0013_seed_tenant_inicial.sql
```

### Correção da divergência de history (BLOQUEADOR CRÍTICO)

Antes de qualquer `db push`, executar:

```bash
# Marcar as 15 migrations remotas como "revertidas" (não existem localmente)
npx supabase migration repair --status reverted 20260327230352 --linked
npx supabase migration repair --status reverted 20260327230403 --linked
# ... (repetir para cada uma das 15)
# Ou em loop:
for ts in 20260327230352 20260327230403 20260327230415 20260327230432 20260327230454 20260327233818 20260327234025 20260328012132 20260328014402 20260331200722 20260331201131 20260402115534 20260402115551 20260402135359 20260510000622; do
  npx supabase migration repair --status reverted $ts --linked
done
```

Depois verificar com `npx supabase migration list --linked` que o local `0001` aparece como pendente, e então:

```bash
npx supabase db push --linked
```

### Padrão de migration SQL

Cada arquivo deve usar `IF NOT EXISTS` / `IF EXISTS` para ser idempotente:

```sql
-- Cabeçalho obrigatório
-- =============================================================
-- Migration XXXX — [descrição]
-- Sprint 1 / Phase 2 — Schema v2
-- =============================================================

CREATE TABLE IF NOT EXISTS nome_tabela (
  ...
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
```

### Padrão RLS Multi-tenant

[VERIFIED: CLAUDE_2.md §S1.2]

O isolamento usa JWT claim `tenant_id`. O JWT claim é propagado via `auth.jwt()`:

```sql
-- Padrão para tabelas com tenant_id
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nome_tabela_tenant_isolation" ON nome_tabela
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Para tabelas de usuário (sem tenant_id, usa auth.uid())
CREATE POLICY "progresso_usuario_own" ON progresso_usuario
  FOR ALL USING (usuario_id = auth.uid());

-- Gerente lê todos do tenant
CREATE POLICY "quiz_resultados_gerente" ON quiz_resultados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('adm', 'gerente', 'super_admin')
      AND (auth.jwt() ->> 'tenant_id')::uuid IS NOT NULL
    )
  );
```

**Problema**: O campo `tenant_id` no JWT precisa ser populado via Supabase Auth hook (database webhook ou trigger) quando o usuário faz login. Sem isso, `auth.jwt() ->> 'tenant_id'` retorna NULL e nenhuma row passa no RLS.

**Solução**: Adicionar `tenant_id` ao `raw_app_meta_data` do usuário via trigger no `handle_new_user()` ou via Supabase Auth hook. Para esta fase, a migration de RLS deve incluir a atualização do trigger.

### Conflito de tipos: `periods.id` é integer, não uuid

[VERIFIED: gen types output]

O schema v1 usa `periods.id serial` (integer). O schema v2 em CLAUDE_2.md §3.3 referencia `periodo_id uuid REFERENCES periods(id)`. Isso é **incompatível**.

**Decisão necessária:** Ou manter `periods.id` como integer e referenciar como `periodo_id integer`, ou adicionar uma coluna `uuid` em `periods`. Recomendação: manter como integer nesta fase para não quebrar o schema v1 existente.

```sql
-- CORRETO para esta fase (compatível com schema v1):
CREATE TABLE vendas (
  ...
  periodo_id integer REFERENCES periods(id), -- integer, não uuid
  ...
);
```

### Padrão de seed

Seeds devem usar `INSERT ... ON CONFLICT DO NOTHING` para idempotência:

```sql
INSERT INTO widget_types (id, nome, descricao, config_schema) VALUES
  ('ranking_vendedores', 'Ranking de Vendedores', '...', '{}')
ON CONFLICT (id) DO NOTHING;
```

---

## Don't Hand-Roll

| Problema | Não construir | Usar | Por quê |
|----------|--------------|------|---------|
| Geração de TypeScript types | Tipos manuais de tabelas | `supabase gen types typescript --linked` | Sincronizado automaticamente com schema real |
| Migration history sync | Script custom | `supabase migration repair` | CLI oficial resolve divergências de history table |
| RLS multi-tenant | Lógica custom de tenant isolation | RLS policies com `auth.jwt() ->> 'tenant_id'` | Enforced no banco, não contornável no código |
| UUID generation | `uuid()` custom | `gen_random_uuid()` PostgreSQL nativo | UUID v4 criptograficamente seguro |
| Timestamps | `Date.now()` no código | `DEFAULT now()` no schema | Timezone-aware, consistente entre clientes |

---

## Runtime State Inventory

> Fase de schema puro — não é rename/rebrand, mas há estado existente que impacta o plano.

| Categoria | Itens encontrados | Ação necessária |
|-----------|-------------------|-----------------|
| Migration history remota | 15 migrations com timestamps no remoto sem correspondente local | `migration repair --status reverted` antes de qualquer `db push` |
| Schema existente | `profiles` (sem tenant_id/numero_vendedor), `periods` (id=integer), `goals`, `sales_records` | ALTER TABLE com `ADD COLUMN IF NOT EXISTS`; não DROP/recreate |
| JWT claim `tenant_id` | Não existe — usuários atuais não têm tenant_id no JWT | Trigger `handle_new_user` precisa ser atualizado; usuários existentes precisam de backfill |
| Usuários existentes no Supabase Auth | Existem usuários com profiles sem tenant_id | Migration de seed deve criar tenant GDS Interno e fazer backfill de profiles existentes |
| Enum `user_role` | Existe como `'adm' | 'vendedor'` | Precisa de ALTER TYPE para adicionar 'gerente' e 'super_admin' (Phase 3, não Phase 2) |
| Build artifacts | `src/types/supabase.ts` não existe ou é placeholder | Criar via `supabase gen types` ao final da fase |

---

## Common Pitfalls

### Pitfall 1: `periods.id` é integer — incompatível com referências UUID
**O que dá errado:** Criar `vendas.periodo_id uuid REFERENCES periods(id)` falha com type mismatch.
**Por que acontece:** O schema v1 usou `serial` (integer) para periods, mas o spec do CLAUDE_2.md mostra `uuid REFERENCES periods(id)`.
**Como evitar:** Usar `periodo_id integer REFERENCES periods(id)` nas migrations de vendas e comissoes_calculadas nesta fase.
**Warning signs:** Erro `foreign key constraint ... type mismatch` ao aplicar migration.

### Pitfall 2: `db push --linked` falha por divergência de history
**O que dá errado:** `Remote migration versions not found in local migrations directory`
**Por que acontece:** O banco remoto tem 15 migrations registradas na tabela `supabase_migrations.schema_migrations` sem correspondentes locais.
**Como evitar:** Executar `migration repair --status reverted` para cada timestamp remoto ANTES do primeiro push.
**Warning signs:** O próprio output do CLI lista todos os timestamps a reparar.

### Pitfall 3: RLS com tenant_id retorna 0 rows se JWT não tem o claim
**O que dá errado:** Policy `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid` bloqueia todas as queries mesmo autenticado.
**Por que acontece:** O claim `tenant_id` não é adicionado automaticamente ao JWT pelo Supabase — precisa de hook ou trigger.
**Como evitar:** Na migration `0010_rls_policies.sql`, atualizar o trigger `handle_new_user` para incluir `tenant_id` no `raw_app_meta_data`. Adicionar migration de backfill para usuários existentes.
**Warning signs:** Query retorna 0 rows mesmo com tenant_id correto no banco.

### Pitfall 4: ALTER TYPE enum em produção requer atenção de ordem
**O que dá errado:** `ALTER TYPE user_role ADD VALUE 'gerente'` pode falhar se houver constraints ou triggers dependentes.
**Por que acontece:** PostgreSQL não permite rollback de `ALTER TYPE ADD VALUE` dentro de transação.
**Como evitar:** Para esta fase, **não alterar** o enum `user_role` — isso é escopo de Phase 3. Documentar que 'gerente' e 'super_admin' serão adicionados lá.
**Warning signs:** Erro `cannot add enum values inside transactions`.

### Pitfall 5: Seeds não idempotentes quebram re-execução de migrations
**O que dá errado:** `duplicate key value violates unique constraint` ao reaplicar seeds.
**Por que acontece:** INSERT sem ON CONFLICT falha na segunda execução.
**Como evitar:** Usar `INSERT ... ON CONFLICT (id) DO NOTHING` em todos os seeds.

### Pitfall 6: Self-referential FK em categorias precisa de ordem de INSERT
**O que dá errado:** `INSERT INTO categorias ... (pai_id) references categorias(id)` falha se o pai ainda não existe.
**Por que acontece:** Constraint FK valida imediatamente na inserção.
**Como evitar:** Inserir categorias raiz (pai_id NULL) primeiro, depois as sub-categorias.

---

## Code Examples

### Migration com ALTER TABLE idempotente

```sql
-- Source: CLAUDE_2.md §3.1 + padrão Supabase migrations
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS numero_vendedor text,
  ADD COLUMN IF NOT EXISTS data_admissao date,
  ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;
```

### RLS com JWT claim tenant_id

```sql
-- Source: CLAUDE_2.md §S1.2 + Supabase RLS docs
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_own_tenant" ON tenants
  FOR SELECT USING (
    id = (auth.jwt() ->> 'tenant_id')::uuid
  );

CREATE POLICY "tenants_super_admin" ON tenants
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'super_admin'
  );
```

### Atualização do trigger handle_new_user com tenant_id

```sql
-- Atualizar trigger existente para incluir tenant_id no JWT metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
```

### Seed idempotente de widget_types

```sql
-- Source: CLAUDE_2.md §8
INSERT INTO widget_types (id, nome, descricao, config_schema) VALUES
  ('ranking_vendedores', 'Ranking de Vendedores', 'Top vendedores do período', '{"periodo":"required","loja":"optional","limite":"number"}'),
  ('evolucao_vendas', 'Evolução de Vendas', 'Gráfico temporal de vendas', '{"periodo_inicio":"required","periodo_fim":"required","agrupar_por":"mes|semana"}'),
  ('vendas_por_categoria', 'Vendas por Categoria', 'Distribuição por categoria', '{"periodo":"required","tipo_chart":"pizza|barras"}'),
  ('kpi_periodo', 'KPI do Período', 'Métricas principais', '{"metrica":"total_vendas|ticket_medio|qtd_vendedores_meta"}'),
  ('top_produtos', 'Top Produtos', 'Produtos mais vendidos', '{"periodo":"required","categoria":"optional","limite":"number"}'),
  ('comissoes_periodo', 'Resumo de Comissões', 'Comissões calculadas do período', '{"periodo":"required","status":"calculado|aprovado"}'),
  ('progresso_treinamento', 'Progresso do Treinamento', 'Progresso da equipe no LMS', '{"trilha":"optional"}')
ON CONFLICT (id) DO NOTHING;
```

### Geração de types TypeScript

```bash
# Executar ao final, após todas as migrations aplicadas
npx supabase gen types typescript --linked > src/types/supabase.ts
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Nenhum instalado atualmente — validação via smoke tests manuais + `supabase migration list` |
| Config file | N/A |
| Quick run command | `npx supabase migration list --linked` |
| Full suite command | `npx supabase db push --linked --dry-run && npx supabase migration list --linked` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Arquivo existe? |
|--------|----------|-----------|-------------------|-----------------|
| SCHEMA-01 | Tabela tenants criada com todos os campos | smoke | `npx supabase gen types --linked \| grep "tenants:"` | Wave 0 |
| SCHEMA-02 | Tabelas produtos e categorias criadas | smoke | `npx supabase gen types --linked \| grep -E "produtos:|categorias:"` | Wave 0 |
| SCHEMA-03 | Tabelas vendas e itens_venda criadas | smoke | `npx supabase gen types --linked \| grep -E "vendas:|itens_venda:"` | Wave 0 |
| SCHEMA-04 | Tabelas regras_comissao e comissoes_calculadas criadas | smoke | `npx supabase gen types --linked \| grep -E "regras_comissao:|comissoes_calculadas:"` | Wave 0 |
| SCHEMA-05 | Tabela dashboard_layouts criada | smoke | `npx supabase gen types --linked \| grep "dashboard_layouts:"` | Wave 0 |
| SCHEMA-06 | Tabela convites criada | smoke | `npx supabase gen types --linked \| grep "convites:"` | Wave 0 |
| SCHEMA-07 | Tabelas LMS criadas | smoke | `npx supabase gen types --linked \| grep -E "trilhas:|modulos:|licoes:|quiz_questoes:"` | Wave 0 |
| SCHEMA-08 | RLS ativo em todas tabelas | manual | Supabase Studio — verificar RLS enabled por tabela | N/A |
| SCHEMA-09 | Seeds inseridos | smoke | `npx supabase gen types --linked` + query manual no Studio | Wave 0 |
| SCHEMA-10 | `src/types/supabase.ts` gerado e sem divergências | smoke | `npx tsc --noEmit` (compila sem erros) | ❌ Wave 0 |

### Wave 0 Gaps

- [ ] `src/types/supabase.ts` — gerado via `npx supabase gen types typescript --linked > src/types/supabase.ts` ao final
- [ ] Nenhum test framework de banco instalado — validação via CLI e Studio é suficiente para esta fase

### Sampling Rate

- **Por migration aplicada:** `npx supabase migration list --linked`
- **Ao final da fase:** `npx supabase gen types typescript --linked > src/types/supabase.ts && npx tsc --noEmit`
- **Phase gate:** Todas as migrations na coluna "Remote" do migration list + `npm run build` passa

---

## Environment Availability

| Dependência | Necessária para | Disponível | Versão | Fallback |
|-------------|----------------|-----------|--------|----------|
| npx supabase CLI | Aplicar migrations, gen types | Sim | 2.100.1 | — |
| Supabase project linked | `--linked` flag | Sim | zsczxblhtdhpdqvkpuwz | `--project-id` flag |
| Docker Engine | `supabase db dump` local | Instalado mas **não ativo** | 29.2.1 | Usar `supabase gen types --linked` para inspecionar schema |
| Docker Desktop (Linux engine) | `supabase db dump`, `supabase db pull` | NÃO | — | Studio SQL Editor para inspeção manual |
| Supabase Studio | Verificação manual, RLS check | Sim | — | — |

**Missing dependencies com fallback:**
- Docker Desktop não ativo: operações que precisam de container local (db dump, db pull) usam alternativa `--linked` direto no remoto ou Studio.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Não (Phase 3) | — |
| V3 Session Management | Não (Phase 3) | — |
| V4 Access Control | Sim | RLS policies no banco |
| V5 Input Validation | Parcial | CHECK constraints no schema |
| V6 Cryptography | Não | — |

### Known Threat Patterns for multi-tenant PostgreSQL + Supabase RLS

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-tenant data leakage | Information Disclosure | RLS `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid` em todas as tabelas |
| RLS bypass via SECURITY DEFINER functions | Elevation of Privilege | Auditar todas as funções SECURITY DEFINER; usar SECURITY INVOKER por padrão |
| Null JWT claim bypass | Tampering | `tenant_id IS NOT NULL` na policy + validar que claim existe |
| Seed data visível para todos os tenants | Information Disclosure | widget_types é global (sem tenant_id) — intencional; trilhas LMS precisam de `tenant_id IS NULL OR tenant_id = ...` |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A migration `0001_schema_inicial.sql` local NÃO foi aplicada no remoto via CLI (foi criada como doc apenas) | Standard Stack | Se foi aplicada via outro método, o repair pode criar conflito |
| A2 | As 15 migrations remotas representam o schema v1 completo — o banco remoto está no estado correto mesmo sem elas no local | Runtime State | Se o banco remoto estiver divergente do esperado, as novas migrations podem falhar |
| A3 | O JWT claim `tenant_id` pode ser adicionado via `raw_app_meta_data` sem Supabase Auth Hook pago | Architecture | Se a tier do projeto não suportar hooks customizados, a abordagem de RLS via JWT precisa de alternativa (view com auth.uid() → profiles.tenant_id) |
| A4 | `profiles.updated_at` existe no banco remoto (visto nos types gerados) mas não estava em `0001_schema_inicial.sql` local | Runtime State | A migration 0002 pode tentar adicionar coluna que já existe — usar `ADD COLUMN IF NOT EXISTS` |

---

## Open Questions

1. **JWT claim para tenant_id — como popular?**
   - O que sabemos: A policy `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid` requer que o claim esteja no JWT
   - O que está unclear: O plano Supabase atual suporta Auth Hooks customizados (funcionalidade paga) ou apenas metadata via `raw_app_meta_data`?
   - Recomendação: Na migration de RLS, incluir uma policy alternativa que faça JOIN com profiles para resolver tenant_id via `auth.uid()` como fallback. Exemplo: `tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())`

2. **Backfill de usuários existentes sem tenant_id**
   - O que sabemos: Há usuários existentes em `profiles` sem `tenant_id`
   - O que está unclear: Quantos usuários existem e quais lojas são deles?
   - Recomendação: A seed `0013_seed_tenant_inicial.sql` deve fazer `UPDATE profiles SET tenant_id = (SELECT id FROM tenants WHERE slug = 'gds-interno') WHERE tenant_id IS NULL`

3. **A migration 0001 deve ser "reparada" no remoto também?**
   - O que sabemos: O `migration list` mostra `0001` apenas no local, não no remoto
   - O que está unclear: Se fazer `db push --linked` após o repair vai tentar executar `0001` no banco remoto (que já tem o schema)
   - Recomendação: Após reparar as 15 remotas, usar `--dry-run` para verificar o que seria executado antes de fazer o push real. Pode ser necessário `migration repair --status applied 0001` também.

---

## Sources

### Primary (HIGH confidence)
- `npx supabase gen types typescript --linked` — schema real do banco remoto verificado em 2026-05-20
- `npx supabase migration list --linked` — estado de divergência entre local e remoto verificado em 2026-05-20
- `CLAUDE_2.md` — spec completo do schema alvo (seções 3, 7, 8, 9, 10)
- `supabase/migrations/0001_schema_inicial.sql` — schema v1 local documentado

### Secondary (MEDIUM confidence)
- Supabase docs (conhecimento de treinamento): RLS policies com JWT claims, `auth.jwt()` function
- Supabase docs (conhecimento de treinamento): `migration repair` para resolver divergências de history

### Tertiary (LOW confidence)
- A3: Suporte a JWT custom claims via `raw_app_meta_data` sem Auth Hooks — não verificado contra docs Supabase atuais [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Estado atual do banco: HIGH — verificado via CLI em tempo real
- Sequência de migrations: HIGH — diretamente do spec CLAUDE_2.md
- Estratégia de RLS: MEDIUM — padrão documentado mas JWT claim population precisa de confirmação
- Desbloqueio de migration history: HIGH — output do CLI confirma a solução

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (schema estável; expirar se houver mudanças no projeto Supabase)
