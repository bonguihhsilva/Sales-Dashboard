---
phase: 02-schema-v2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/0002_tenants.sql
  - supabase/migrations/0003_produtos_categorias.sql
  - supabase/migrations/0004_vendas_itens.sql
  - supabase/migrations/0005_motor_comissao.sql
  - supabase/migrations/0006_dashboard_widgets.sql
  - supabase/migrations/0007_convites.sql
  - supabase/migrations/0008_lms_schema.sql
  - supabase/migrations/0009_gamificacao.sql
  - supabase/migrations/0010_rls_policies.sql
  - supabase/migrations/0011_seed_widget_types.sql
  - supabase/migrations/0012_seed_lms_conteudo.sql
  - supabase/migrations/0013_seed_tenant_inicial.sql
  - src/types/supabase.ts
autonomous: false
requirements:
  - SCHEMA-01
  - SCHEMA-02
  - SCHEMA-03
  - SCHEMA-04
  - SCHEMA-05
  - SCHEMA-06
  - SCHEMA-07
  - SCHEMA-08
  - SCHEMA-09
  - SCHEMA-10

must_haves:
  truths:
    - "Todas as migrations (0002–0013) aparecem como 'Applied' em `npx supabase migration list --linked`"
    - "RLS ativo em todas as tabelas novas — nenhuma query retorna dados de outro tenant"
    - "Seeds executados: 7 widget_types, 8 módulos LMS, tenant 'gds-interno' existem no banco"
    - "`src/types/supabase.ts` gerado via CLI reflete o schema atual e `npm run build` passa sem erros"
  artifacts:
    - path: "supabase/migrations/0002_tenants.sql"
      provides: "Tabela tenants com campos slug, plano, cor_primaria, moeda_padrao, locale, ativo"
    - path: "supabase/migrations/0003_produtos_categorias.sql"
      provides: "Tabelas categorias (hierarquia pai_id) e produtos com tenant_id"
    - path: "supabase/migrations/0004_vendas_itens.sql"
      provides: "Tabelas vendas e itens_venda; alter em profiles com tenant_id/numero_vendedor; periodo_id INTEGER"
    - path: "supabase/migrations/0005_motor_comissao.sql"
      provides: "Tabelas regras_comissao (jsonb condicoes/acao) e comissoes_calculadas"
    - path: "supabase/migrations/0006_dashboard_widgets.sql"
      provides: "Tabelas widget_types e dashboard_layouts"
    - path: "supabase/migrations/0007_convites.sql"
      provides: "Tabela convites com token único e expiry 7 dias"
    - path: "supabase/migrations/0008_lms_schema.sql"
      provides: "Tabelas trilhas, modulos, licoes, quiz_questoes, progresso_usuario, quiz_resultados"
    - path: "supabase/migrations/0009_gamificacao.sql"
      provides: "Tabela gamificacao com xp_total, nivel, streak_dias, badges jsonb"
    - path: "supabase/migrations/0010_rls_policies.sql"
      provides: "RLS completo em todas as tabelas novas; atualização do trigger handle_new_user; backfill tenant_id em profiles"
    - path: "supabase/migrations/0011_seed_widget_types.sql"
      provides: "7 widget_types inseridos com ON CONFLICT DO NOTHING"
    - path: "supabase/migrations/0012_seed_lms_conteudo.sql"
      provides: "Trilha 'Vendas no Varejo CDE' com 8 módulos, lições e quiz_questoes"
    - path: "supabase/migrations/0013_seed_tenant_inicial.sql"
      provides: "Tenant 'gds-interno' criado; profiles existentes com backfill de tenant_id"
    - path: "src/types/supabase.ts"
      provides: "Types TypeScript gerados via supabase gen types; exporta Database interface"
  key_links:
    - from: "vendas.periodo_id"
      to: "periods.id"
      via: "FK integer (NÃO uuid)"
      pattern: "periodo_id integer REFERENCES periods"
    - from: "comissoes_calculadas.periodo_id"
      to: "periods.id"
      via: "FK integer (NÃO uuid)"
      pattern: "periodo_id integer REFERENCES periods"
    - from: "RLS policies"
      to: "profiles.tenant_id"
      via: "SELECT tenant_id FROM profiles WHERE id = auth.uid()"
      pattern: "\\(SELECT tenant_id FROM profiles WHERE id = auth.uid\\(\\)\\)"
    - from: "src/types/supabase.ts"
      to: "schema remoto"
      via: "npx supabase gen types typescript --linked"
      pattern: "export type Database"
---

<objective>
Banco de dados totalmente versionado com isolamento multi-tenant e tipos TypeScript sincronizados.

Propósito: Prover a fundação de dados que todas as fases seguintes (Auth, Import, Comissão, LMS) dependem. Sem este schema, nenhuma feature do v2 pode ser implementada.

Output: 12 arquivos SQL em `supabase/migrations/`, todos aplicados no projeto remoto `zsczxblhtdhpdqvkpuwz`, e `src/types/supabase.ts` gerado e válido.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-schema-v2/02-RESEARCH.md
@.planning/phases/02-schema-v2/02-VALIDATION.md
@CLAUDE.md
@CLAUDE_2.md
@supabase/migrations/0001_schema_inicial.sql
</context>

<tasks>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- TAREFA 1 — Reparar migration history (BLOQUEADOR)                  -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<task type="auto">
  <name>Tarefa 1: Reparar divergência de migration history</name>

  <read_first>
    - .planning/phases/02-schema-v2/02-RESEARCH.md (seção "Correção da divergência de history")
    - supabase/migrations/0001_schema_inicial.sql (schema local v1)
  </read_first>

  <files>
    (nenhum arquivo de código — apenas comandos CLI que alteram estado remoto)
  </files>

  <action>
O banco remoto `zsczxblhtdhpdqvkpuwz` tem 15 timestamps de migrations na tabela
`supabase_migrations.schema_migrations` que não existem localmente. Isso bloqueia qualquer
`db push`. Deve-se marcar cada um como "revertido" antes de avançar.

**Passo 1 — Marcar as 15 migrations remotas como revertidas:**

```bash
for ts in 20260327230352 20260327230403 20260327230415 20260327230432 20260327230454 20260327233818 20260327234025 20260328012132 20260328014402 20260331200722 20260331201131 20260402115534 20260402115551 20260402135359 20260510000622; do
  npx supabase migration repair --status reverted $ts --linked
done
```

**Passo 2 — Verificar estado após repair:**

```bash
npx supabase migration list --linked
```

Resultado esperado: as 15 migrations remotas aparecem como "reverted"; a migration local
`0001_schema_inicial.sql` aparece como pendente (não aplicada remotamente).

**Passo 3 — Resolver status da 0001:**

A migration `0001_schema_inicial.sql` foi criada localmente como documentação, mas o schema v1
já existe no banco remoto (aplicado por outros meios). Para evitar que `db push` tente aplicá-la
novamente e falhe com erros de "already exists", marcar como aplicada:

```bash
npx supabase migration repair --status applied 0001_schema_inicial --linked
```

Se o comando acima falhar por formato de nome (não timestamp), usar `--dry-run` primeiro para
verificar o que seria executado:

```bash
npx supabase db push --linked --dry-run
```

Se o dry-run mostrar que tentaria executar `0001`, aplicar o repair. Se mostrar "No migrations
to apply" ou "already up to date", prosseguir sem o repair da 0001.

**Importante:** usar sempre `--linked`, nunca `--db-url` nem flags que exijam Docker local.
  </action>

  <verify>
    <automated>npx supabase migration list --linked</automated>
  </verify>

  <acceptance_criteria>
Saída do `migration list --linked` mostra:
- As 15 migrations remotas aparecem com status "reverted" (ou ausentes da lista local)
- `0001_schema_inicial` aparece como "applied" ou "up to date" (não como "pending")
- Nenhuma divergência de "Remote migration versions not found in local migrations directory"
- `npx supabase db push --linked --dry-run` não retorna erro de divergência
  </acceptance_criteria>

  <done>Migration history local e remoto estão sincronizados. `db push` pode ser executado sem erros de history conflict.</done>
</task>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- TAREFA 2 — Escrever migrations 0002–0009 (DDL puro)               -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<task type="auto">
  <name>Tarefa 2: Criar arquivos de migration 0002 a 0009</name>

  <read_first>
    - CLAUDE_2.md §3.1 até §3.7 (schema alvo completo)
    - supabase/migrations/0001_schema_inicial.sql (schema existente — não duplicar)
    - .planning/phases/02-schema-v2/02-RESEARCH.md (pitfalls + padrões)
  </read_first>

  <files>
    supabase/migrations/0002_tenants.sql
    supabase/migrations/0003_produtos_categorias.sql
    supabase/migrations/0004_vendas_itens.sql
    supabase/migrations/0005_motor_comissao.sql
    supabase/migrations/0006_dashboard_widgets.sql
    supabase/migrations/0007_convites.sql
    supabase/migrations/0008_lms_schema.sql
    supabase/migrations/0009_gamificacao.sql
  </files>

  <action>
Criar os 8 arquivos SQL abaixo. Cada um deve:
- Começar com o cabeçalho padrão do projeto
- Usar `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- Ser idempotente (safe para re-execução)
- Comentários em português explicando o propósito

---

**`0002_tenants.sql`** — Multi-tenancy (SCHEMA-01, SCHEMA-02)

```sql
-- =============================================================
-- Migration 0002 — Tenants e extensão de profiles
-- Phase 2 — Schema v2
-- =============================================================

-- Tabela de tenants: cada loja/cliente do sistema é um tenant
CREATE TABLE IF NOT EXISTS tenants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         text NOT NULL,
  slug         text UNIQUE NOT NULL,       -- ex: 'jebai', 'gds-interno'
  plano        text NOT NULL DEFAULT 'basico', -- basico | profissional | enterprise
  cor_primaria text NOT NULL DEFAULT '#c8f542',
  logo_url     text,
  moeda_padrao text NOT NULL DEFAULT 'USD',   -- USD | BRL | PYG
  locale       text NOT NULL DEFAULT 'es-PY', -- para Intl.NumberFormat
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

-- Vincular profiles ao tenant e adicionar campos v2
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tenant_id      uuid REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS numero_vendedor text,
  ADD COLUMN IF NOT EXISTS data_admissao  date,
  ADD COLUMN IF NOT EXISTS ativo          boolean NOT NULL DEFAULT true;
```

---

**`0003_produtos_categorias.sql`** — Catálogo de produtos (SCHEMA-02 suporte)

```sql
-- =============================================================
-- Migration 0003 — Categorias e Produtos
-- Phase 2 — Schema v2
-- =============================================================

-- Categorias com hierarquia (pai_id = self-reference)
CREATE TABLE IF NOT EXISTS categorias (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  nome      text NOT NULL,
  pai_id    uuid REFERENCES categorias(id), -- null = categoria raiz
  cor       text -- hex para uso em charts
);

-- Catálogo de produtos do tenant
CREATE TABLE IF NOT EXISTS produtos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid REFERENCES tenants(id),
  nome         text NOT NULL,
  modelo       text,
  marca        text,
  sku          text,
  categoria_id uuid REFERENCES categorias(id),
  ativo        boolean NOT NULL DEFAULT true
);
```

---

**`0004_vendas_itens.sql`** — Schema de vendas v2 (SCHEMA-03)

ATENÇÃO CRÍTICA: `periodo_id` é `integer` (FK para `periods.id` que é `serial`), não `uuid`.

```sql
-- =============================================================
-- Migration 0004 — Vendas e Itens de Venda
-- Phase 2 — Schema v2
-- ATENÇÃO: periodo_id é integer (periods.id é serial), não uuid
-- =============================================================

-- Cabeçalho da venda (agrega itens)
CREATE TABLE IF NOT EXISTS vendas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  vendedor_id uuid REFERENCES profiles(id),
  periodo_id  integer REFERENCES periods(id), -- integer, não uuid
  loja_id     uuid REFERENCES tenants(id),    -- loja onde ocorreu a venda
  data_venda  date NOT NULL,
  total       numeric(12,2),
  fonte       text NOT NULL DEFAULT 'upload', -- upload | cec_sync | manual
  raw_ref     text,                           -- referência ao arquivo de origem
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Itens individuais da venda (produtos vendidos)
CREATE TABLE IF NOT EXISTS itens_venda (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id      uuid NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id    uuid REFERENCES produtos(id),
  produto_raw   text,      -- nome bruto se produto não estiver no catálogo
  categoria_raw text,      -- categoria bruta do arquivo importado
  quantidade    integer NOT NULL DEFAULT 1,
  valor_unit    numeric(12,2),
  valor_total   numeric(12,2)
);

CREATE INDEX IF NOT EXISTS vendas_tenant_idx    ON vendas(tenant_id);
CREATE INDEX IF NOT EXISTS vendas_periodo_idx   ON vendas(periodo_id);
CREATE INDEX IF NOT EXISTS vendas_vendedor_idx  ON vendas(vendedor_id);
CREATE INDEX IF NOT EXISTS itens_venda_idx      ON itens_venda(venda_id);
```

---

**`0005_motor_comissao.sql`** — Motor de comissão (SCHEMA-04)

ATENÇÃO CRÍTICA: `periodo_id` em `comissoes_calculadas` também é `integer`.

```sql
-- =============================================================
-- Migration 0005 — Motor de Comissão
-- Phase 2 — Schema v2
-- ATENÇÃO: comissoes_calculadas.periodo_id é integer
-- =============================================================

-- Regras configuráveis pelo gerente (condições + ação em jsonb)
CREATE TABLE IF NOT EXISTS regras_comissao (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  nome        text NOT NULL,
  descricao   text,
  ativo       boolean NOT NULL DEFAULT true,
  prioridade  integer NOT NULL DEFAULT 0, -- menor = avaliado primeiro
  -- condicoes: { "operador": "AND"|"OR", "regras": [{ "campo", "op", "valor" }] }
  condicoes   jsonb NOT NULL,
  -- acao: { "tipo": "percentual"|"fixo"|"multiplicador", "valor": 0.05, "base": "..." }
  acao        jsonb NOT NULL,
  criado_por  uuid REFERENCES profiles(id),
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Resultado do cálculo por vendedor por período
CREATE TABLE IF NOT EXISTS comissoes_calculadas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  vendedor_id    uuid NOT NULL REFERENCES profiles(id),
  periodo_id     integer NOT NULL REFERENCES periods(id), -- integer, não uuid
  comissao_base  numeric(12,2),
  bonus_total    numeric(12,2),
  total          numeric(12,2),
  detalhamento   jsonb, -- regras aplicadas + valores calculados
  calculado_em   timestamptz NOT NULL DEFAULT now(),
  aprovado       boolean NOT NULL DEFAULT false,
  aprovado_por   uuid REFERENCES profiles(id),
  UNIQUE(tenant_id, vendedor_id, periodo_id)
);
```

---

**`0006_dashboard_widgets.sql`** — Dashboard configurável (SCHEMA-05)

```sql
-- =============================================================
-- Migration 0006 — Dashboard Widgets
-- Phase 2 — Schema v2
-- =============================================================

-- Catálogo global de tipos de widget (sem tenant_id — é global)
CREATE TABLE IF NOT EXISTS widget_types (
  id            text PRIMARY KEY, -- ex: 'ranking_vendedores'
  nome          text NOT NULL,
  descricao     text,
  config_schema jsonb -- JSON Schema dos parâmetros configuráveis do widget
);

-- Layout personalizado por usuário (widgets: [{ id, type_id, x, y, w, h, config }])
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid NOT NULL REFERENCES profiles(id),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  nome        text NOT NULL DEFAULT 'Meu Dashboard',
  widgets     jsonb NOT NULL DEFAULT '[]',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, tenant_id)
);
```

---

**`0007_convites.sql`** — Convites de usuário (SCHEMA-06)

```sql
-- =============================================================
-- Migration 0007 — Convites de Usuário
-- Phase 2 — Schema v2
-- =============================================================

-- Convites gerados pelo gerente para novos usuários
CREATE TABLE IF NOT EXISTS convites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  email       text,                                 -- opcional: sem email = link manual
  role        text NOT NULL,                        -- adm | vendedor | gerente
  loja_id     uuid REFERENCES tenants(id),          -- loja pré-atribuída
  token       text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  usado       boolean NOT NULL DEFAULT false,
  expira_em   timestamptz NOT NULL DEFAULT now() + interval '7 days',
  criado_por  uuid NOT NULL REFERENCES profiles(id),
  criado_em   timestamptz NOT NULL DEFAULT now()
);
```

---

**`0008_lms_schema.sql`** — LMS completo (SCHEMA-07)

```sql
-- =============================================================
-- Migration 0008 — LMS: Trilhas, Módulos, Lições, Quiz e Progresso
-- Phase 2 — Schema v2
-- =============================================================

-- Trilhas de aprendizado (tenant_id null = conteúdo global disponível para todos)
CREATE TABLE IF NOT EXISTS trilhas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid REFERENCES tenants(id), -- null = global
  titulo       text NOT NULL,
  descricao    text,
  publico_alvo text, -- 'vendedor_varejo' | 'vendedor_atacado' | 'gerente'
  ordem        integer NOT NULL DEFAULT 0,
  ativo        boolean NOT NULL DEFAULT true
);

-- Módulos dentro de uma trilha
CREATE TABLE IF NOT EXISTS modulos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trilha_id         uuid NOT NULL REFERENCES trilhas(id) ON DELETE CASCADE,
  titulo            text NOT NULL,
  descricao         text,
  ordem             integer NOT NULL DEFAULT 0,
  xp_reward         integer NOT NULL DEFAULT 50,
  aprovacao_minima  integer NOT NULL DEFAULT 70 -- % mínimo para aprovação no quiz
);

-- Lições de cada módulo (conteúdo varia por tipo)
CREATE TABLE IF NOT EXISTS licoes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  titulo    text NOT NULL,
  tipo      text NOT NULL DEFAULT 'texto', -- texto | video | dialogo | checklist
  conteudo  jsonb NOT NULL,                -- estrutura depende do tipo
  ordem     integer NOT NULL DEFAULT 0
);

-- Questões do quiz por módulo
CREATE TABLE IF NOT EXISTS quiz_questoes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id    uuid NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  enunciado    text NOT NULL,
  -- alternativas: [{ "id": "a", "texto": "...", "correta": bool, "feedback": "..." }]
  alternativas jsonb NOT NULL,
  ordem        integer NOT NULL DEFAULT 0
);

-- Progresso individual por lição (uma linha por usuário por lição)
CREATE TABLE IF NOT EXISTS progresso_usuario (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   uuid NOT NULL REFERENCES profiles(id),
  licao_id     uuid NOT NULL REFERENCES licoes(id),
  concluida    boolean NOT NULL DEFAULT false,
  concluida_em timestamptz,
  UNIQUE(usuario_id, licao_id)
);

-- Resultados de quiz por tentativa
CREATE TABLE IF NOT EXISTS quiz_resultados (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES profiles(id),
  modulo_id  uuid NOT NULL REFERENCES modulos(id),
  pontuacao  integer NOT NULL, -- 0 a 100
  aprovado   boolean NOT NULL,
  tentativa  integer NOT NULL DEFAULT 1,
  respostas  jsonb, -- detalhamento por questão
  criado_em  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS progresso_usuario_idx ON progresso_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS quiz_resultados_usuario_idx ON quiz_resultados(usuario_id, modulo_id);
```

---

**`0009_gamificacao.sql`** — Gamificação (SCHEMA-07 complemento)

```sql
-- =============================================================
-- Migration 0009 — Gamificação (XP, nível, streak, badges)
-- Phase 2 — Schema v2
-- =============================================================

-- Uma linha por usuário — atualizada progressivamente
CREATE TABLE IF NOT EXISTS gamificacao (
  usuario_id    uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp_total      integer NOT NULL DEFAULT 0,
  nivel         integer NOT NULL DEFAULT 1,
  streak_dias   integer NOT NULL DEFAULT 0,
  ultimo_acesso date,
  -- badges: [{ "id": "primeiro_passo", "conquistado_em": "2026-01-01T..." }]
  badges        jsonb NOT NULL DEFAULT '[]'
);
```

**Regras de negócio da gamificação (documentadas aqui para referência das fases seguintes):**

```
Completar lição:           +10 XP
Quiz aprovado (70–89%):    +xp_reward do módulo
Quiz aprovado (90–100%):   +xp_reward * 1.5 (arredondado)
Streak 7 dias:             +50 XP bonus
Nível 1 — Iniciante:       0–199 XP
Nível 2 — Aprendiz:        200–499 XP
Nível 3 — Profissional:    500–999 XP
Nível 4 — Especialista:    1000–1999 XP
Nível 5 — Mestre CDE:      2000+ XP
Badges: "Primeiro Passo", "Estudioso" (5 módulos), "Mestre CDE" (todos),
        "Destaque da Semana" (top 3 ranking), "Perfeccionista" (100% na 1ª tentativa)
```
  </action>

  <verify>
    <automated>npx supabase db push --linked --dry-run</automated>
  </verify>

  <acceptance_criteria>
- Os 8 arquivos SQL existem em `supabase/migrations/`
- `npx supabase db push --linked --dry-run` executa sem erros de sintaxe
- Cada arquivo começa com o cabeçalho padrão e usa `IF NOT EXISTS`
- `0004_vendas_itens.sql` e `0005_motor_comissao.sql` usam `periodo_id integer` (não uuid)
- `widget_types` não tem `tenant_id` (é global)
- `trilhas.tenant_id` permite NULL (conteúdo global)
  </acceptance_criteria>

  <done>8 migrations DDL escritas, idempotentes, prontas para aplicação no banco remoto.</done>
</task>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- TAREFA 3 — RLS completo + seeds + push + gen types                 -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<task type="auto">
  <name>Tarefa 3: RLS policies, seeds, db push e geração de types</name>

  <read_first>
    - .planning/phases/02-schema-v2/02-RESEARCH.md (seção "Padrão RLS Multi-tenant" e "Pitfall 3")
    - CLAUDE_2.md §8 (widget_types), §9 (LMS conteúdo), §10 (gamificação)
  </read_first>

  <files>
    supabase/migrations/0010_rls_policies.sql
    supabase/migrations/0011_seed_widget_types.sql
    supabase/migrations/0012_seed_lms_conteudo.sql
    supabase/migrations/0013_seed_tenant_inicial.sql
    src/types/supabase.ts
  </files>

  <action>
### Passo 1 — Criar `0010_rls_policies.sql`

RLS para todas as tabelas novas. Usar `(SELECT tenant_id FROM profiles WHERE id = auth.uid())`
como padrão (não `auth.jwt() ->> 'tenant_id'` diretamente, pois o claim pode não estar
populado antes de configurar Auth Hook).

```sql
-- =============================================================
-- Migration 0010 — RLS Policies (isolamento multi-tenant)
-- Phase 2 — Schema v2
-- Padrão: tenant_id via profiles para evitar dependência de JWT custom claim
-- =============================================================

-- ── tenants ────────────────────────────────────────────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Usuário lê apenas seu próprio tenant
CREATE POLICY "tenants_select_own" ON tenants
  FOR SELECT USING (
    id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- super_admin pode gerenciar todos os tenants (via service role — sem policy restritiva)

-- ── profiles ───────────────────────────────────────────────
-- (RLS já ativo da migration 0001 — adicionar policy de tenant)
CREATE POLICY IF NOT EXISTS "profiles_tenant_select" ON profiles
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR id = auth.uid()
  );

-- ── categorias ─────────────────────────────────────────────
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_tenant" ON categorias
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR tenant_id IS NULL -- categorias globais
  );

-- ── produtos ───────────────────────────────────────────────
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produtos_tenant" ON produtos
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── vendas ─────────────────────────────────────────────────
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendas_tenant" ON vendas
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── itens_venda ────────────────────────────────────────────
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "itens_venda_via_vendas" ON itens_venda
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendas v
      WHERE v.id = itens_venda.venda_id
        AND v.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── regras_comissao ────────────────────────────────────────
ALTER TABLE regras_comissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regras_comissao_tenant" ON regras_comissao
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── comissoes_calculadas ───────────────────────────────────
ALTER TABLE comissoes_calculadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comissoes_tenant" ON comissoes_calculadas
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── widget_types ───────────────────────────────────────────
-- widget_types é global: qualquer autenticado pode ler
ALTER TABLE widget_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "widget_types_authenticated" ON widget_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── dashboard_layouts ──────────────────────────────────────
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Usuário lê e atualiza apenas seu próprio layout
CREATE POLICY "dashboard_layouts_own" ON dashboard_layouts
  FOR ALL USING (usuario_id = auth.uid());

-- ── convites ───────────────────────────────────────────────
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "convites_tenant" ON convites
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Convite por token: público pode ler apenas para validar (token é o segredo)
CREATE POLICY "convites_token_select" ON convites
  FOR SELECT USING (true); -- token já é segredo suficiente; restrito por application layer

-- ── trilhas ────────────────────────────────────────────────
ALTER TABLE trilhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trilhas_tenant_or_global" ON trilhas
  FOR SELECT USING (
    tenant_id IS NULL
    OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "trilhas_tenant_write" ON trilhas
  FOR INSERT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── modulos, licoes, quiz_questoes ─────────────────────────
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE licoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modulos_via_trilha" ON modulos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trilhas t WHERE t.id = modulos.trilha_id
        AND (t.tenant_id IS NULL OR t.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    )
  );

CREATE POLICY "licoes_via_modulo" ON licoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modulos m
      JOIN trilhas t ON t.id = m.trilha_id
      WHERE m.id = licoes.modulo_id
        AND (t.tenant_id IS NULL OR t.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    )
  );

CREATE POLICY "quiz_questoes_via_modulo" ON quiz_questoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modulos m
      JOIN trilhas t ON t.id = m.trilha_id
      WHERE m.id = quiz_questoes.modulo_id
        AND (t.tenant_id IS NULL OR t.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    )
  );

-- ── progresso_usuario ──────────────────────────────────────
ALTER TABLE progresso_usuario ENABLE ROW LEVEL SECURITY;

-- Vendedor lê/escreve apenas seu próprio progresso
CREATE POLICY "progresso_proprio" ON progresso_usuario
  FOR ALL USING (usuario_id = auth.uid());

-- Gerente/adm lê progresso do tenant
CREATE POLICY "progresso_tenant_read" ON progresso_usuario
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('adm', 'gerente', 'super_admin')
        AND (SELECT tenant_id FROM profiles WHERE id = progresso_usuario.usuario_id)
            = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── quiz_resultados ────────────────────────────────────────
ALTER TABLE quiz_resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_resultados_proprio" ON quiz_resultados
  FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "quiz_resultados_tenant_read" ON quiz_resultados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('adm', 'gerente', 'super_admin')
        AND (SELECT tenant_id FROM profiles WHERE id = quiz_resultados.usuario_id)
            = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── gamificacao ────────────────────────────────────────────
ALTER TABLE gamificacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gamificacao_proprio" ON gamificacao
  FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "gamificacao_tenant_read" ON gamificacao
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('adm', 'gerente', 'super_admin')
        AND (SELECT tenant_id FROM profiles WHERE id = gamificacao.usuario_id)
            = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── Atualizar trigger handle_new_user ──────────────────────
-- O trigger agora também cria entrada em gamificacao para novos usuários
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

  -- Inicializar gamificação para o novo usuário
  INSERT INTO gamificacao (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;

  RETURN NEW;
END;
$$;
```

---

### Passo 2 — Criar `0011_seed_widget_types.sql` (SCHEMA-09)

```sql
-- =============================================================
-- Migration 0011 — Seed: 7 Widget Types
-- Phase 2 — Schema v2
-- =============================================================

INSERT INTO widget_types (id, nome, descricao, config_schema) VALUES
  ('ranking_vendedores',    'Ranking de Vendedores',    'Top vendedores do período por valor vendido',         '{"periodo":"required","loja":"optional","limite":"number"}'),
  ('evolucao_vendas',       'Evolução de Vendas',       'Gráfico temporal de vendas no período selecionado',   '{"periodo_inicio":"required","periodo_fim":"required","agrupar_por":"mes|semana"}'),
  ('vendas_por_categoria',  'Vendas por Categoria',     'Distribuição de vendas por categoria de produto',     '{"periodo":"required","tipo_chart":"pizza|barras"}'),
  ('kpi_periodo',           'KPI do Período',           'Métricas principais do período ativo',                '{"metrica":"total_vendas|ticket_medio|qtd_vendedores_meta"}'),
  ('top_produtos',          'Top Produtos',             'Produtos mais vendidos no período',                   '{"periodo":"required","categoria":"optional","limite":"number"}'),
  ('comissoes_periodo',     'Resumo de Comissões',      'Comissões calculadas e aprovadas do período',         '{"periodo":"required","status":"calculado|aprovado"}'),
  ('progresso_treinamento', 'Progresso do Treinamento', 'Progresso da equipe nas trilhas de treinamento LMS',  '{"trilha":"optional"}')
ON CONFLICT (id) DO NOTHING;
```

---

### Passo 3 — Criar `0012_seed_lms_conteudo.sql` (SCHEMA-09)

Inserir trilha "Vendas no Varejo CDE" com 8 módulos conforme CLAUDE_2.md §9.
Usar UUIDs fixos para permitir referências entre os INSERTs.

```sql
-- =============================================================
-- Migration 0012 — Seed: Trilha LMS "Vendas no Varejo CDE"
-- Phase 2 — Schema v2
-- UUIDs fixos para garantir referências consistentes
-- =============================================================

-- Trilha principal (tenant_id null = conteúdo global)
INSERT INTO trilhas (id, titulo, descricao, publico_alvo, ordem, ativo) VALUES
  ('11111111-0000-0000-0000-000000000001',
   'Vendas no Varejo CDE',
   'Treinamento completo para vendedores nas lojas de Ciudad del Este',
   'vendedor_varejo', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 8 módulos da trilha
INSERT INTO modulos (id, trilha_id, titulo, ordem, xp_reward, aprovacao_minima) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Perfil do Cliente CDE',         1,  50, 70),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Abordagem e Rapport',           2,  60, 70),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Sondagem e Necessidades',       3,  70, 70),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Apresentação do Produto',       4,  80, 70),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Objeções e Reversões',          5,  90, 70),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'Gatilhos Mentais',              6,  80, 70),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'Fechamento e Upsell',           7, 100, 70),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000001', 'Atendimento Atacado Web',       8,  90, 70)
ON CONFLICT (id) DO NOTHING;

-- Lições do Módulo 1 — Perfil do Cliente CDE
INSERT INTO licoes (id, modulo_id, titulo, tipo, conteudo, ordem) VALUES
  ('33333333-0001-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
   'O Turista Brasileiro', 'texto',
   '{"paragrafos": ["O turista brasileiro é o principal cliente das lojas de CDE.", "Caracteriza-se por buscar eletrônicos, perfumes e roupas com preço inferior ao Brasil.", "Estratégia: destacar a diferença de preço e facilitar a compra rápida."]}',
   1),
  ('33333333-0001-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001',
   'O Turista Paraguaio', 'texto',
   '{"paragrafos": ["O turista paraguaio busca produtos importados de qualidade.", "Valoriza marcas reconhecidas e atendimento em espanhol ou guarani.", "Estratégia: destacar autenticidade e garantia do produto."]}',
   2),
  ('33333333-0001-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001',
   'O Atacadista Online', 'texto',
   '{"paragrafos": ["O atacadista online compra em volume para revender no Brasil via redes sociais.", "Busca o menor preço e está disposto a esperar por bons negócios.", "Estratégia: oferecer desconto progressivo por quantidade e agilidade no atendimento."]}',
   3)
ON CONFLICT (id) DO NOTHING;

-- Quiz do Módulo 1 — 5 questões
INSERT INTO quiz_questoes (id, modulo_id, enunciado, alternativas, ordem) VALUES
  ('44444444-0001-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
   'Qual é a principal motivação do turista brasileiro ao comprar em CDE?',
   '[{"id":"a","texto":"Comprar produtos raros","correta":false,"feedback":"Raridade não é o fator principal."},{"id":"b","texto":"Pagar menos do que pagaria no Brasil","correta":true,"feedback":"Correto! A diferença de preço é o principal atrativo."},{"id":"c","texto":"Comprar marcas desconhecidas","correta":false,"feedback":"O turista prefere marcas conhecidas."},{"id":"d","texto":"Evitar impostos paraguaios","correta":false,"feedback":"Impostos paraguaios não são a motivação primária."}]',
   1),
  ('44444444-0001-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001',
   'O que um atacadista online prioriza na compra?',
   '[{"id":"a","texto":"Design do produto","correta":false,"feedback":"Design é secundário para atacadistas."},{"id":"b","texto":"Exclusividade do item","correta":false,"feedback":"Atacadistas buscam itens com demanda comprovada."},{"id":"c","texto":"Menor preço possível para revenda","correta":true,"feedback":"Correto! Margem de revenda é o que importa."},{"id":"d","texto":"Atendimento em português","correta":false,"feedback":"Idioma não é prioridade para atacadistas."}]',
   2),
  ('44444444-0001-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001',
   'Qual idioma o turista paraguaio valoriza no atendimento?',
   '[{"id":"a","texto":"Inglês","correta":false,"feedback":"Inglês não é comum entre turistas paraguaios locais."},{"id":"b","texto":"Espanhol ou guarani","correta":true,"feedback":"Correto! Atender em espanhol ou guarani cria conexão."},{"id":"c","texto":"Português","correta":false,"feedback":"Português é a escolha para turistas brasileiros."},{"id":"d","texto":"Mandarim","correta":false,"feedback":"Mandarim é irrelevante aqui."}]',
   3),
  ('44444444-0001-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001',
   'Qual estratégia aumenta conversão com turistas brasileiros?',
   '[{"id":"a","texto":"Mostrar apenas produtos sem etiqueta de preço","correta":false,"feedback":"Transparência no preço é essencial."},{"id":"b","texto":"Destacar a diferença de preço Brasil x CDE","correta":true,"feedback":"Correto! O gatilho de economia é o mais poderoso."},{"id":"c","texto":"Falar apenas em espanhol","correta":false,"feedback":"Atender em português melhora a experiência."},{"id":"d","texto":"Não abordar o cliente proativamente","correta":false,"feedback":"Abordagem proativa aumenta conversão."}]',
   4),
  ('44444444-0001-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001',
   'Qual é uma característica do atacadista online que afeta a estratégia de venda?',
   '[{"id":"a","texto":"Compra apenas à vista","correta":false,"feedback":"Forma de pagamento varia."},{"id":"b","texto":"Tem pressa e quer fechar rápido","correta":false,"feedback":"Atacadistas frequentemente negociam mais."},{"id":"c","texto":"Está disposto a esperar por bons negócios","correta":true,"feedback":"Correto! Paciência para fechar bom preço é característica do atacadista."},{"id":"d","texto":"Compra apenas marcas de luxo","correta":false,"feedback":"Atacadistas priorizam margem, não luxo."}]',
   5)
ON CONFLICT (id) DO NOTHING;

-- Lições dos demais módulos (estrutura mínima — conteúdo completo pode ser expandido na Phase 7)
INSERT INTO licoes (id, modulo_id, titulo, tipo, conteudo, ordem) VALUES
  ('33333333-0002-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'Os Primeiros 10 Segundos', 'texto', '{"paragrafos": ["Os primeiros 10 segundos determinam a impressão do cliente.", "Sorria, faça contato visual e cumprimente com energia."]}', 1),
  ('33333333-0002-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'O Protocolo de Abordagem CDE', 'texto', '{"paragrafos": ["Protocolo padrão: aproximar-se pelo lado direito, iniciar com pergunta aberta."]}', 2),
  ('33333333-0002-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'A Técnica do Espelho', 'texto', '{"paragrafos": ["Espelhar o comportamento e ritmo do cliente cria rapport natural."]}', 3),
  ('33333333-0003-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003', 'Por Que Perguntar é Vender', 'texto', '{"paragrafos": ["Vendedor que pergunta controla a conversa e identifica a necessidade real."]}', 1),
  ('33333333-0003-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', 'O Funil de Sondagem em 5 Passos', 'texto', '{"paragrafos": ["1. Para quem é? 2. Qual o uso principal? 3. Tem preferência de marca? 4. Qual a verba? 5. Quando precisa?"]}', 2),
  ('33333333-0003-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Vocabulário que Vende', 'texto', '{"paragrafos": ["Trocar palavras negativas por positivas: não diga ''não temos'', diga ''temos algo melhor''."]}', 3),
  ('33333333-0004-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', 'Técnica FAB', 'texto', '{"paragrafos": ["FAB: Feature (Característica) → Advantage (Vantagem) → Benefit (Benefício para o cliente)."]}', 1),
  ('33333333-0004-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004', 'Como Apresentar o Preço', 'texto', '{"paragrafos": ["Nunca fale o preço antes de apresentar o valor. Preço deve ser a conclusão, não a abertura."]}', 2),
  ('33333333-0004-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004', 'A Importância do "Deixa Eu Mostrar"', 'texto', '{"paragrafos": ["Colocar o produto nas mãos do cliente aumenta a taxa de fechamento."]}', 3),
  ('33333333-0005-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', 'Por Que o Cliente Objeta', 'texto', '{"paragrafos": ["Objeção = interesse disfarçado. Cliente sem interesse não objeta, simplesmente vai embora."]}', 1),
  ('33333333-0005-0000-0000-000000000002', '22222222-0000-0000-0000-000000000005', 'As 4 Objeções Mais Comuns em CDE', 'texto', '{"paragrafos": ["1. Está caro. 2. Vou pensar. 3. Preciso ver com meu marido/esposa. 4. Encontrei mais barato."]}', 2),
  ('33333333-0005-0000-0000-000000000003', '22222222-0000-0000-0000-000000000005', 'Scripts de Reversão Prontos', 'texto', '{"paragrafos": ["Para ''Está caro'': ''Caro comparado com o quê? Posso mostrar o que está incluído?''"]}', 3),
  ('33333333-0006-0000-0000-000000000001', '22222222-0000-0000-0000-000000000006', 'Como Funcionam os Gatilhos', 'texto', '{"paragrafos": ["Gatilhos mentais são atalhos cognitivos que facilitam a decisão de compra."]}', 1),
  ('33333333-0006-0000-0000-000000000002', '22222222-0000-0000-0000-000000000006', 'Os 8 Gatilhos do Varejo CDE', 'texto', '{"paragrafos": ["Escassez, urgência, prova social, autoridade, reciprocidade, compromisso, afinidade, novidade."]}', 2),
  ('33333333-0006-0000-0000-000000000003', '22222222-0000-0000-0000-000000000006', 'Quando Usar Cada Gatilho', 'texto', '{"paragrafos": ["Escassez: ''Só temos 2 unidades''. Urgência: ''Promoção até hoje''. Prova social: ''Muito vendido para brasileiros''."]}', 3),
  ('33333333-0007-0000-0000-000000000001', '22222222-0000-0000-0000-000000000007', 'Sinais de Compra', 'texto', '{"paragrafos": ["Cliente olha o produto várias vezes, pergunta sobre garantia ou toca com frequência = pronto para fechar."]}', 1),
  ('33333333-0007-0000-0000-000000000002', '22222222-0000-0000-0000-000000000007', 'Técnicas de Fechamento', 'texto', '{"paragrafos": ["Fechamento presumido: ''Vai querer na caixa ou vou embalar para presente?''"]}', 2),
  ('33333333-0007-0000-0000-000000000003', '22222222-0000-0000-0000-000000000007', 'Upsell e Cross-sell Naturais', 'texto', '{"paragrafos": ["Após fechar a venda principal, ofereça complemento: ''Tenho o carregador portátil perfeito para esse celular''."]}', 3),
  ('33333333-0008-0000-0000-000000000001', '22222222-0000-0000-0000-000000000008', 'O Perfil do Atacadista Online', 'texto', '{"paragrafos": ["Compra para revender via Shopee, Instagram ou WhatsApp. Decisão baseada em margem."]}', 1),
  ('33333333-0008-0000-0000-000000000002', '22222222-0000-0000-0000-000000000008', 'Atendimento por WhatsApp', 'texto', '{"paragrafos": ["Responder em até 5 minutos. Mandar foto real, não foto do site. Incluir preço e disponibilidade no primeiro retorno."]}', 2),
  ('33333333-0008-0000-0000-000000000003', '22222222-0000-0000-0000-000000000008', 'Proposta e Follow-up', 'texto', '{"paragrafos": ["Enviar proposta formal com quantidade, preço e prazo. Follow-up em 24h se não houver resposta."]}', 3)
ON CONFLICT (id) DO NOTHING;

-- Quiz mínimo para módulos 2–8 (1 questão cada para garantir funcionalidade)
INSERT INTO quiz_questoes (id, modulo_id, enunciado, alternativas, ordem) VALUES
  ('44444444-0002-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002',
   'Qual é a melhor forma de iniciar o rapport com um cliente novo?',
   '[{"id":"a","texto":"Perguntar imediatamente o que quer comprar","correta":false,"feedback":"Abordagem direta pode parecer agressiva."},{"id":"b","texto":"Sorrir, fazer contato visual e cumprimentar com energia","correta":true,"feedback":"Correto! A primeira impressão define o tom."},{"id":"c","texto":"Esperar o cliente falar primeiro","correta":false,"feedback":"Abordagem proativa é mais eficaz."},{"id":"d","texto":"Mostrar o produto mais caro","correta":false,"feedback":"Iniciar com preço alto afasta clientes."}]',
   1),
  ('44444444-0003-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003',
   'No funil de sondagem, qual pergunta ajuda a entender o orçamento do cliente?',
   '[{"id":"a","texto":"Para quem é o produto?","correta":false,"feedback":"Essa identifica o usuário, não o orçamento."},{"id":"b","texto":"Qual a verba disponível?","correta":true,"feedback":"Correto! Entender o orçamento evita sugerir produtos fora do alcance."},{"id":"c","texto":"Quando precisa?","correta":false,"feedback":"Essa identifica urgência, não orçamento."},{"id":"d","texto":"Tem preferência de marca?","correta":false,"feedback":"Essa identifica preferência, não orçamento."}]',
   1),
  ('44444444-0004-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004',
   'Na técnica FAB, o que representa o "B"?',
   '[{"id":"a","texto":"Brand (marca)","correta":false,"feedback":"Brand não faz parte do FAB."},{"id":"b","texto":"Budget (orçamento)","correta":false,"feedback":"Budget não faz parte do FAB."},{"id":"c","texto":"Benefit (benefício para o cliente)","correta":true,"feedback":"Correto! Benefit é o impacto real na vida do cliente."},{"id":"d","texto":"Buy (comprar)","correta":false,"feedback":"Buy não faz parte do FAB."}]',
   1),
  ('44444444-0005-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005',
   'O que uma objeção do cliente geralmente indica?',
   '[{"id":"a","texto":"Que o cliente não tem interesse","correta":false,"feedback":"Sem interesse, o cliente simplesmente vai embora."},{"id":"b","texto":"Que o produto é caro","correta":false,"feedback":"Nem sempre — pode ser insegurança."},{"id":"c","texto":"Interesse disfarçado que precisa de mais informação","correta":true,"feedback":"Correto! Objeção é sinal de engajamento."},{"id":"d","texto":"Que você deve desistir da venda","correta":false,"feedback":"Desistir na objeção é perder a venda."}]',
   1),
  ('44444444-0006-0000-0000-000000000001', '22222222-0000-0000-0000-000000000006',
   'Qual gatilho mental usar quando restam poucas unidades em estoque?',
   '[{"id":"a","texto":"Reciprocidade","correta":false,"feedback":"Reciprocidade é sobre dar algo antes de pedir."},{"id":"b","texto":"Autoridade","correta":false,"feedback":"Autoridade é sobre credibilidade e expertise."},{"id":"c","texto":"Escassez","correta":true,"feedback":"Correto! ''Só temos 2'' ativa o medo de perder a oportunidade."},{"id":"d","texto":"Novidade","correta":false,"feedback":"Novidade é sobre ser o primeiro a ter algo novo."}]',
   1),
  ('44444444-0007-0000-0000-000000000001', '22222222-0000-0000-0000-000000000007',
   'Qual é um exemplo de técnica de fechamento presumido?',
   '[{"id":"a","texto":"''Você quer comprar esse produto?''","correta":false,"feedback":"Pergunta aberta dá opção de dizer não."},{"id":"b","texto":"''Vai querer na caixa ou embalo para presente?''","correta":true,"feedback":"Correto! Fecha presumindo a compra, só deixando escolha de detalhe."},{"id":"c","texto":"''Posso te mostrar algo mais barato?''","correta":false,"feedback":"Isso desce no preço sem fechar."},{"id":"d","texto":"''Você tem certeza que quer isso?''","correta":false,"feedback":"Gera dúvida no cliente."}]',
   1),
  ('44444444-0008-0000-0000-000000000001', '22222222-0000-0000-0000-000000000008',
   'Qual é o tempo ideal de resposta para um atacadista online no WhatsApp?',
   '[{"id":"a","texto":"Até 24 horas","correta":false,"feedback":"24h é lento demais — o atacadista já comprou de outro."},{"id":"b","texto":"Até 1 hora","correta":false,"feedback":"1h ainda é muito para o ritmo do atacado online."},{"id":"c","texto":"Até 5 minutos","correta":true,"feedback":"Correto! Velocidade de resposta é diferencial competitivo no atacado online."},{"id":"d","texto":"Quando tiver disponível","correta":false,"feedback":"Sem prazo definido = perda de venda garantida."}]',
   1)
ON CONFLICT (id) DO NOTHING;
```

---

### Passo 4 — Criar `0013_seed_tenant_inicial.sql` (SCHEMA-09)

```sql
-- =============================================================
-- Migration 0013 — Seed: Tenant GDS Interno
-- Phase 2 — Schema v2
-- Cria o tenant padrão e faz backfill dos profiles existentes
-- =============================================================

-- Tenant GDS Interno (uso das 3 lojas da família Da Silva)
INSERT INTO tenants (id, nome, slug, plano, cor_primaria, moeda_padrao, locale, ativo) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001',
   'GDS Interno',
   'gds-interno',
   'enterprise',
   '#c8f542',
   'USD',
   'es-PY',
   true)
ON CONFLICT (slug) DO NOTHING;

-- Backfill: profiles sem tenant_id recebem o tenant gds-interno
UPDATE profiles
SET tenant_id = 'aaaaaaaa-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Inicializar gamificacao para profiles existentes sem entrada
INSERT INTO gamificacao (usuario_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT usuario_id FROM gamificacao)
ON CONFLICT (usuario_id) DO NOTHING;
```

---

### Passo 5 — Aplicar todas as migrations no banco remoto

```bash
npx supabase db push --linked
```

Verificar que todas as migrations aparecem como "Applied":

```bash
npx supabase migration list --linked
```

---

### Passo 6 — Gerar `src/types/supabase.ts`

```bash
npx supabase gen types typescript --linked > src/types/supabase.ts
```

Verificar que o arquivo foi gerado e contém as novas tabelas:

```bash
# Deve retornar linhas com os nomes das tabelas novas
grep -E "tenants:|vendas:|trilhas:|gamificacao:" src/types/supabase.ts
```

---

### Passo 7 — Verificar build

```bash
npm run build
```

Se houver erros de TypeScript relacionados ao `supabase.ts`, corrigir imports que usavam
tipos placeholder ou `any` implícito para usar os tipos gerados.
  </action>

  <verify>
    <automated>npm run build</automated>
  </verify>

  <acceptance_criteria>
- `npx supabase migration list --linked` mostra 0002 até 0013 como "Applied"
- `SELECT count(*) FROM widget_types` retorna 7
- `SELECT count(*) FROM modulos` retorna 8
- `SELECT count(*) FROM tenants WHERE slug = 'gds-interno'` retorna 1
- `SELECT count(*) FROM profiles WHERE tenant_id IS NULL` retorna 0
- `src/types/supabase.ts` existe e contém `tenants:`, `vendas:`, `trilhas:`, `gamificacao:`
- `npm run build` passa sem erros
- `npm run lint` passa sem warnings críticos
  </acceptance_criteria>

  <done>
Banco totalmente versionado com RLS ativo, seeds aplicados e types TypeScript gerados.
`npm run build` passa. Phase 2 completa.
  </done>
</task>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- TAREFA 4 — Checkpoint: verificação manual no Supabase Studio       -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<task type="checkpoint:human-verify" gate="blocking">
  <name>Tarefa 4: Verificar schema e RLS no Supabase Studio</name>

  <what-built>
12 migrations aplicadas no projeto Supabase `zsczxblhtdhpdqvkpuwz`:
- Tabelas: tenants, categorias, produtos, vendas, itens_venda, regras_comissao,
  comissoes_calculadas, widget_types, dashboard_layouts, convites, trilhas, modulos,
  licoes, quiz_questoes, progresso_usuario, quiz_resultados, gamificacao
- RLS ativo em todas as tabelas novas
- Seeds: 7 widget_types, 8 módulos LMS, tenant gds-interno
- `src/types/supabase.ts` gerado
  </what-built>

  <how-to-verify>
1. Acessar https://supabase.com/dashboard/project/zsczxblhtdhpdqvkpuwz/editor

2. Verificar tabelas no Table Editor ou executar no SQL Editor:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```
Deve listar: categorias, comissoes_calculadas, convites, dashboard_layouts, gamificacao,
goals, itens_venda, licoes, modulos, periods, produtos, profiles, progresso_usuario,
quiz_questoes, quiz_resultados, regras_comissao, sales_records, tenants, trilhas,
vendas, widget_types

3. Verificar seeds:
```sql
SELECT count(*) FROM widget_types;       -- deve retornar 7
SELECT count(*) FROM modulos;            -- deve retornar 8
SELECT * FROM tenants WHERE slug = 'gds-interno';  -- deve retornar 1 row
SELECT count(*) FROM profiles WHERE tenant_id IS NULL; -- deve retornar 0
```

4. Verificar RLS ativo em todas as novas tabelas:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tenants', 'categorias', 'produtos', 'vendas', 'itens_venda',
    'regras_comissao', 'comissoes_calculadas', 'widget_types', 'dashboard_layouts',
    'convites', 'trilhas', 'modulos', 'licoes', 'quiz_questoes',
    'progresso_usuario', 'quiz_resultados', 'gamificacao'
  )
ORDER BY tablename;
```
Todas devem ter `rowsecurity = true`.

5. Verificar que `profiles` tem as novas colunas:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public';
```
Deve incluir: tenant_id, numero_vendedor, data_admissao, ativo (além das originais).
  </how-to-verify>

  <resume-signal>
Se tudo correto: escreva "aprovado".
Se houver problemas: descreva o que está faltando ou incorreto para que eu corrija.
  </resume-signal>
</task>

</tasks>

<threat_model>
## Limites de Confiança

| Limite | Descrição |
|--------|-----------|
| cliente → banco | Queries de clientes podem tentar acessar dados de outros tenants via RLS bypass |
| migration CLI → banco remoto | CLI com credenciais linkadas pode aplicar migrations incorretas se history estiver dessincronizado |
| tipos TypeScript → schema real | `supabase.ts` pode ficar desatualizado se schema mudar sem regerar types |

## Registro de Ameaças STRIDE

| ID | Categoria | Componente | Disposição | Plano de Mitigação |
|----|-----------|------------|------------|-------------------|
| T-02-01 | Tampering | `tenant_id` em queries | mitigar | RLS com `(SELECT tenant_id FROM profiles WHERE id = auth.uid())` — não depende de input do cliente; enforced no banco |
| T-02-02 | Information Disclosure | Cross-tenant data leakage | mitigar | Todas as tabelas com `tenant_id` têm policy FOR ALL USING com isolamento; `widget_types` é global por design (sem dados sensíveis) |
| T-02-03 | Tampering | NULL tenant_id no JWT bypass | mitigar | Políticas RLS usam `profiles` como fonte de verdade, não JWT claim diretamente; `UPDATE profiles SET tenant_id` no seed garante que profiles existentes não ficam com NULL |
| T-02-04 | Denial of Service | Migration history desync causar push parcial | mitigar | Tarefa 1 obrigatoriamente repara os 15 timestamps antes de qualquer push; `--dry-run` valida antes do push real |
| T-02-05 | Information Disclosure | `src/types/supabase.ts` desatualizado | mitigar | `supabase gen types` é a última tarefa antes do build; se schema mudar, regerar types é obrigatório antes de commit |
| T-02-06 | Elevation of Privilege | SECURITY DEFINER functions | aceitar | `handle_new_user` e `vendor_evolution` usam SECURITY DEFINER; escopo limitado a operações de INSERT/SELECT seguras; sem input externo direto |
| T-02-07 | Information Disclosure | Seeds LMS visíveis para todos os tenants | aceitar | `trilhas` com `tenant_id IS NULL` são conteúdo global intencional; não contêm dados sensíveis de negócio |
</threat_model>

<verification>
Verificações finais da Phase 2:

```bash
# 1. Todas as migrations aplicadas
npx supabase migration list --linked
# Esperado: 0001 a 0013 com status Applied

# 2. Seeds verificados (SQL Editor no Studio)
# SELECT count(*) FROM widget_types; → 7
# SELECT count(*) FROM modulos; → 8
# SELECT * FROM tenants WHERE slug = 'gds-interno'; → 1 row

# 3. RLS ativo em todas as novas tabelas (SQL Editor no Studio)
# SELECT tablename, rowsecurity FROM pg_tables
# WHERE schemaname = 'public' ORDER BY tablename;
# → rowsecurity = true para todas as 17 tabelas novas

# 4. Types gerados e build passando
grep -E "tenants:|vendas:|trilhas:|gamificacao:" src/types/supabase.ts
npm run build
npm run lint
```
</verification>

<success_criteria>
Phase 2 completa quando:

1. `npx supabase migration list --linked` mostra todas as 13 migrations (0001–0013) como "Applied" sem divergências
2. RLS ativo (`rowsecurity = true`) em todas as 17 tabelas novas — confirmado via Studio
3. Seeds: `SELECT count(*) FROM widget_types` = 7, `SELECT count(*) FROM modulos` = 8, `SELECT * FROM tenants WHERE slug = 'gds-interno'` retorna 1 row
4. `SELECT count(*) FROM profiles WHERE tenant_id IS NULL` retorna 0 (backfill completo)
5. `src/types/supabase.ts` existe, contém `tenants:`, `vendas:`, `trilhas:`, `gamificacao:`
6. `npm run build` passa sem erros
7. Checkpoint Tarefa 4 aprovado pelo usuário
</success_criteria>

<output>
Após conclusão, criar `.planning/phases/02-schema-v2/02-01-SUMMARY.md` com:
- Migrations criadas e aplicadas (lista)
- Decisão de `periodo_id` como integer (não uuid) — critical para fases seguintes
- Padrão RLS adotado (`SELECT tenant_id FROM profiles WHERE id = auth.uid()`)
- UUID do tenant gds-interno (`aaaaaaaa-0000-0000-0000-000000000001`)
- Quaisquer desvios do spec original e motivos
</output>
