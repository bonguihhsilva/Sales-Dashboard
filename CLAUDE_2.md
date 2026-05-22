# CLAUDE.md — GDS Frame Dashboard v2 + LMS
> Este documento é a fonte de verdade para o Claude Code.
> Leia-o integralmente antes de qualquer ação. Nunca assuma — consulte aqui primeiro.
> Versão: 1.1 — decisões de produto finalizadas.

---

## 0. CONTEXTO DO PROJETO

### Quem é o operador
Guilherme Da Silva — desenvolvedor independente, opera sua própria infra (VPS Hostinger Ubuntu 24.04).
Dono de 3 lojas em Ciudad del Este, Paraguai: **Jebai**, **Pajé 1**, **Pajé 2**.
Equipe atual: ~50 vendedores, acesso via celular e computador.

### O que está sendo construído
Dois produtos integrados dentro do mesmo repositório Next.js:

1. **GDS Dashboard v2** — sistema de gestão comercial para gerentes
   - Ranking e performance de vendedores
   - Importação e análise de vendas por produto/categoria/modelo
   - Motor de regras de comissão configurável pelo gerente
   - Dashboard de widgets configuráveis por gerente
   - Gestão de usuários com convite por email/link

2. **LMS (nome a definir)** — plataforma de treinamento para vendedores
   - Trilhas de aprendizado com módulos e lições
   - Quiz por módulo com critério mínimo de aprovação (70%)
   - Gamificação persistente (XP, níveis, badges, ranking)
   - Painel gerencial de progresso da equipe
   - Conteúdo focado em varejo de fronteira (CDE, turistas BR/PY, atacado web)

### Potencial de produto
O LMS será oferecido como SaaS para outras lojas de CDE — nome de produto e identidade
a definir futuramente. Por ora vive em subdomínio `*.gds-frame.com`.
A arquitetura multi-tenant deve estar presente desde o início.

---

## 1. STACK TÉCNICA

### Obrigatório — não alterar sem aprovação explícita
```
Framework:     Next.js 15.2.4 (App Router, React Server Components)
Runtime:       React 19, TypeScript strict
UI:            shadcn/ui (customizado) + Tailwind CSS
Auth:          Supabase Auth (email/password + magic link)
Database:      Supabase (PostgreSQL) — projeto zsczxblhtdhpdqvkpuwz
ORM:           Supabase JS client (createServerClient / createBrowserClient)
Charts:        Recharts
Deployment:    VPS Hostinger — Ubuntu 24.04, IP 72.61.46.184
Container:     Docker + Traefik v3 (padrão do stack existente)
Fonts:         Syne (headings) + DM Mono (dados/labels/números)
```

### Infra VPS — padrão obrigatório
```
Traefik:       /docker/traefik/docker-compose.yml
Certresolver:  letsencrypt
Email cert:    guilherme.starcompany@gmail.com
Network:       proxy (external)
Volume:        traefik_data (external)
App location:  /docker/da-silva-dashboard/
Docker syntax: docker compose (sem hífen)
Domínio prod:  gds-frame.com
Domínio test:  guidasilva.in
```

### Tema visual — identidade GDS (PRESERVAR)
```css
/* Tema Dark — padrão */
--background:        #0e0f11
--foreground:        #f4f4f5
--accent:            #c8f542   /* verde-limão — cor primária da marca */
--accent-foreground: #0e0f11
--muted:             #1a1b1e
--muted-foreground:  #71717a
--border:            #27272a
--card:              #141517
--card-foreground:   #f4f4f5

/* Cores por loja */
--jebai:   #9333ea   /* roxo */
--paje1:   #06b6d4   /* ciano */
--paje2:   #f97316   /* laranja */

/* Tema Light — neutro/profissional (alternativa) */
--background:        #f8f9fa
--foreground:        #0e0f11
--accent:            #16a34a   /* verde mais neutro no light */
--accent-foreground: #ffffff
--muted:             #f1f5f9
--muted-foreground:  #64748b
--border:            #e2e8f0
--card:              #ffffff
--card-foreground:   #0e0f11
```

---

## 2. ESTADO ATUAL DO REPOSITÓRIO

### Repo
```
GitHub: bonguihhsilva/da-silva-dashboard
Branch principal: main
Deploy: Vercel (Hobby) — apenas commits do GitHub user bonguihhsilva trigam deploy
```

### Estrutura de rotas existentes
```
/login                          público — Supabase Auth
/dashboard                      role=adm — ranking, KPIs, filtro por loja, tab Clientes
/dashboard/vendedor/[vendor_id] role=adm — view individual de vendedor
/dashboard/usuarios             role=adm — CRUD de usuários
/dashboard/metas                role=adm — gestão de metas por período
/meu-resultado                  role=vendedor — performance pessoal + clientes
/mapeamento                     ROTA MORTA — deletar
```

### Banco atual (schema inferido — VERIFICAR com dump)
```sql
-- Tabelas confirmadas
profiles          -- usuários com role (adm/vendedor), loja vinculada
periods           -- períodos de análise (mês/ano)
vendor_summary    -- view/mat.view: agregação de vendas por vendedor+período

-- RPC confirmada
vendor_evolution(vendor_id, period_id) -- histórico de evolução do vendedor

-- Inferido (confirmar)
metas             -- metas por período com bonus1/2/3
lojas             -- Jebai, Pajé 1, Pajé 2
```

### Problemas conhecidos
```
- supabase/migrations/ vazio — schema não versionado
- /mapeamento sem page.tsx — rota morta
- components/ui ausente ou em path incorreto — imports quebrados
- Inline styles misturados com Tailwind — sem design system
- Motor de comissão hardcoded (não configurável pelo gerente)
- Import de dados aceita apenas valor total por vendedor (sem itens/produtos)
- Sem sistema de convite para cadastro de usuários
- Recharts importado mas subutilizado
- Sem tema light implementado
```

---

## 3. SCHEMA ALVO — v2

> Claude Code deve executar `supabase db dump --project-ref zsczxblhtdhpdqvkpuwz > /tmp/schema_atual.sql`
> na primeira tarefa para comparar com o schema alvo e gerar migrations incrementais.

### 3.1 Multi-tenancy
```sql
-- Todas as lojas são tenants. Tenant 1 = uso interno Guilherme.
CREATE TABLE tenants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         text NOT NULL,
  slug         text UNIQUE NOT NULL,  -- ex: "jebai", "paje1", "gds-interno"
  plano        text DEFAULT 'basico', -- basico | profissional | enterprise
  cor_primaria text DEFAULT '#c8f542',
  logo_url     text,
  moeda_padrao text DEFAULT 'USD',    -- USD | BRL | PYG — configurável por tenant
  locale       text DEFAULT 'es-PY',  -- para Intl.NumberFormat
  ativo        boolean DEFAULT true,
  criado_em    timestamptz DEFAULT now()
);

-- profiles vinculados a tenant
ALTER TABLE profiles ADD COLUMN tenant_id uuid REFERENCES tenants(id);
ALTER TABLE profiles ADD COLUMN numero_vendedor text; -- código no sistema CEC
ALTER TABLE profiles ADD COLUMN data_admissao date;
ALTER TABLE profiles ADD COLUMN ativo boolean DEFAULT true;
```

### 3.2 Produtos e Categorias
```sql
CREATE TABLE categorias (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  nome      text NOT NULL,
  pai_id    uuid REFERENCES categorias(id), -- hierarquia
  cor       text  -- para charts
);

CREATE TABLE produtos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid REFERENCES tenants(id),
  nome       text NOT NULL,
  modelo     text,
  marca      text,
  sku        text,
  categoria_id uuid REFERENCES categorias(id),
  ativo      boolean DEFAULT true
);
```

### 3.3 Vendas com Itens (substituir vendor_summary como fonte primária)
```sql
CREATE TABLE vendas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid REFERENCES tenants(id),
  vendedor_id  uuid REFERENCES profiles(id),
  periodo_id   uuid REFERENCES periods(id),
  loja_id      uuid REFERENCES tenants(id), -- loja onde ocorreu
  data_venda   date NOT NULL,
  total        numeric(12,2),
  fonte        text DEFAULT 'upload', -- upload | cec_sync | manual
  raw_ref      text, -- referência ao arquivo de origem
  criado_em    timestamptz DEFAULT now()
);

CREATE TABLE itens_venda (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id     uuid REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id   uuid REFERENCES produtos(id),
  -- se produto não existir no catálogo, guardar raw
  produto_raw  text,
  categoria_raw text,
  quantidade   integer NOT NULL DEFAULT 1,
  valor_unit   numeric(12,2),
  valor_total  numeric(12,2)
);
```

### 3.4 Motor de Comissão
```sql
CREATE TABLE regras_comissao (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid REFERENCES tenants(id),
  nome         text NOT NULL,
  descricao    text,
  ativo        boolean DEFAULT true,
  prioridade   integer DEFAULT 0, -- ordem de avaliação
  condicoes    jsonb NOT NULL,    -- ver spec abaixo
  acao         jsonb NOT NULL,    -- ver spec abaixo
  criado_por   uuid REFERENCES profiles(id),
  criado_em    timestamptz DEFAULT now()
);

-- Spec de condicoes (jsonb):
-- {
--   "operador": "AND" | "OR",
--   "regras": [
--     { "campo": "vendas_total", "op": ">=", "valor": 50000 },
--     { "campo": "categoria", "op": "=", "valor": "Eletrônicos" },
--     { "campo": "tempo_casa_meses", "op": ">=", "valor": 12 }
--   ]
-- }
--
-- Spec de acao (jsonb):
-- {
--   "tipo": "percentual" | "fixo" | "multiplicador",
--   "valor": 0.05,          -- 5% sobre comissão base
--   "base": "comissao_base" | "vendas_total" | "vendas_categoria"
-- }

CREATE TABLE comissoes_calculadas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid REFERENCES tenants(id),
  vendedor_id     uuid REFERENCES profiles(id),
  periodo_id      uuid REFERENCES periods(id),
  comissao_base   numeric(12,2),
  bonus_total     numeric(12,2),
  total           numeric(12,2),
  detalhamento    jsonb, -- regras aplicadas + valores
  calculado_em    timestamptz DEFAULT now(),
  aprovado        boolean DEFAULT false,
  aprovado_por    uuid REFERENCES profiles(id)
);
```

### 3.5 Dashboard de Widgets
```sql
CREATE TABLE widget_types (
  id          text PRIMARY KEY, -- ex: 'ranking_vendedores', 'evolucao_categoria'
  nome        text NOT NULL,
  descricao   text,
  config_schema jsonb -- JSON Schema dos parâmetros configuráveis
);

CREATE TABLE dashboard_layouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid REFERENCES profiles(id),
  tenant_id   uuid REFERENCES tenants(id),
  nome        text DEFAULT 'Meu Dashboard',
  widgets     jsonb NOT NULL DEFAULT '[]',
  -- widgets: [{ id, type_id, x, y, w, h, config }]
  updated_at  timestamptz DEFAULT now()
);
```

### 3.6 Convites de Usuário
```sql
CREATE TABLE convites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES tenants(id),
  email       text,
  role        text NOT NULL, -- adm | vendedor | gerente
  loja_id     uuid REFERENCES tenants(id),
  token       text UNIQUE DEFAULT gen_random_uuid()::text,
  usado       boolean DEFAULT false,
  expira_em   timestamptz DEFAULT now() + interval '7 days',
  criado_por  uuid REFERENCES profiles(id),
  criado_em   timestamptz DEFAULT now()
);
```

### 3.7 LMS — Treinamento
```sql
CREATE TABLE trilhas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES tenants(id), -- null = conteúdo global
  titulo      text NOT NULL,
  descricao   text,
  publico_alvo text, -- 'vendedor_varejo' | 'vendedor_atacado' | 'gerente'
  ordem       integer DEFAULT 0,
  ativo       boolean DEFAULT true
);

CREATE TABLE modulos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trilha_id   uuid REFERENCES trilhas(id),
  titulo      text NOT NULL,
  descricao   text,
  ordem       integer DEFAULT 0,
  xp_reward   integer DEFAULT 50,
  aprovacao_minima integer DEFAULT 70 -- % mínimo no quiz
);

CREATE TABLE licoes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id   uuid REFERENCES modulos(id),
  titulo      text NOT NULL,
  tipo        text DEFAULT 'texto', -- texto | video | dialogo | checklist
  conteudo    jsonb NOT NULL, -- estrutura depende do tipo
  ordem       integer DEFAULT 0
);

CREATE TABLE quiz_questoes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id    uuid REFERENCES modulos(id),
  enunciado    text NOT NULL,
  alternativas jsonb NOT NULL,
  -- [{ "id": "a", "texto": "...", "correta": true/false, "feedback": "..." }]
  ordem        integer DEFAULT 0
);

CREATE TABLE progresso_usuario (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      uuid REFERENCES profiles(id),
  licao_id        uuid REFERENCES licoes(id),
  concluida       boolean DEFAULT false,
  concluida_em    timestamptz,
  UNIQUE(usuario_id, licao_id)
);

CREATE TABLE quiz_resultados (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   uuid REFERENCES profiles(id),
  modulo_id    uuid REFERENCES modulos(id),
  pontuacao    integer NOT NULL, -- 0-100
  aprovado     boolean NOT NULL,
  tentativa    integer DEFAULT 1,
  respostas    jsonb, -- detalhamento por questão
  criado_em    timestamptz DEFAULT now()
);

CREATE TABLE gamificacao (
  usuario_id   uuid PRIMARY KEY REFERENCES profiles(id),
  xp_total     integer DEFAULT 0,
  nivel        integer DEFAULT 1,
  streak_dias  integer DEFAULT 0,
  ultimo_acesso date,
  badges       jsonb DEFAULT '[]' -- [{ "id", "conquistado_em" }]
);
```

---

## 4. ARQUITETURA DE ROTAS — v2

```
/                              redirect → /dashboard ou /meu-resultado por role

/login                         público
/convite/[token]               público — aceitar convite + criar senha

/dashboard                     role: adm | gerente
/dashboard/widgets             configurar layout pessoal
/dashboard/vendas              histórico + análise por categoria/produto
/dashboard/vendas/importar     upload CSV/HTML do sistema CEC
/dashboard/vendedores          lista + perfis
/dashboard/vendedores/[id]     perfil individual com evolução
/dashboard/comissoes           visualização de comissões calculadas
/dashboard/comissoes/regras    CRUD de regras do motor de comissão
/dashboard/metas               gestão de metas por período
/dashboard/usuarios            CRUD + convites
/dashboard/treinamento         progresso da equipe no LMS

/meu-resultado                 role: vendedor
/meu-resultado/treinamento     trilhas + progresso pessoal

/treinamento/[trilha_id]              player de trilha
/treinamento/[trilha_id]/[modulo_id]  player de módulo + lições + quiz

/admin                         role: super_admin (Guilherme)
/admin/tenants                 gestão de tenants (para o produto SaaS)
/admin/conteudo                gestão global de trilhas e módulos
```

---

## 5. ESTRUTURA DE PASTAS — v2

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── convite/[token]/
│   ├── (dashboard)/
│   │   ├── layout.tsx           -- sidebar + topbar + auth guard
│   │   ├── dashboard/
│   │   │   ├── page.tsx         -- widgets configuráveis
│   │   │   ├── widgets/
│   │   │   ├── vendas/
│   │   │   │   ├── page.tsx
│   │   │   │   └── importar/
│   │   │   ├── vendedores/
│   │   │   ├── comissoes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── regras/
│   │   │   ├── metas/
│   │   │   ├── usuarios/
│   │   │   └── treinamento/
│   │   └── meu-resultado/
│   │       ├── page.tsx
│   │       └── treinamento/
│   ├── treinamento/
│   │   └── [trilha_id]/
│   │       └── [modulo_id]/
│   └── admin/
│       ├── tenants/
│       └── conteudo/
├── components/
│   ├── ui/                      -- shadcn + customizações
│   ├── dashboard/               -- widgets, charts, tabelas
│   ├── treinamento/             -- player, quiz, progress
│   └── shared/                  -- layout, nav, modais
├── lib/
│   ├── supabase/
│   │   ├── server.ts            -- createServerClient
│   │   ├── client.ts            -- createBrowserClient
│   │   └── middleware.ts
│   ├── comissao/
│   │   └── engine.ts            -- motor de avaliação de regras
│   ├── parsers/
│   │   └── cec.ts               -- parser HTML/PDF do sistema CEC Consfot
│   ├── widgets/
│   │   └── registry.ts          -- catálogo de widget types
│   └── utils.ts
├── hooks/                       -- custom React hooks
├── types/                       -- TypeScript types centralizados
└── supabase/
    └── migrations/              -- TODAS as migrations versionadas aqui
```

---

## 6. PARSER CEC CONSFOT

O sistema CEC da Consfot (usado pelas lojas em CDE) exporta relatórios em HTML e PDF.
O parser também aceita XLSX para compatibilidade futura com outras fontes de dados.

### Formatos suportados e prioridade
```
1. HTML  — formato primário do CEC Consfot (usar DOMParser/cheerio)
2. PDF   — exportação alternativa do CEC (usar pdf-parse + regex)
3. XLSX  — planilhas Excel de terceiros ou exportações futuras (usar xlsx/sheetjs)
```

### Detecção automática de formato
```typescript
// Detectar por MIME type e extensão do File
// text/html | .html → parser HTML
// application/pdf | .pdf → parser PDF
// application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | .xlsx → parser XLSX
// application/vnd.ms-excel | .xls → rejeitar com mensagem: "Use formato .xlsx"
```

### Estratégia de parsing
```typescript
// src/lib/parsers/cec.ts

// O parser deve:
// 1. Aceitar File (HTML, PDF ou XLSX) no upload
// 2. Detectar o formato automaticamente
// 3. Normalizar para CECItem[] independente do formato de entrada
// 4. Extrair os campos abaixo
// 5. Retornar CECReport[] para preview antes de confirmar import

interface CECItem {
  vendedor_codigo: string  // número do vendedor no sistema
  vendedor_nome:  string
  data_venda:     string   // DD/MM/YYYY
  produto_nome:   string
  modelo:         string
  categoria:      string
  quantidade:     number
  valor_unit:     number
  valor_total:    number
}

interface CECReport {
  periodo:  string
  loja:     string
  itens:    CECItem[]
  total:    number
  warnings: string[]  // linhas não parseadas
}
```

### Notas importantes
- O HTML do CEC usa tabelas — usar DOMParser no client ou cheerio no server
- PDF: usar pdf-parse para extração de texto, depois regex para estruturar
- XLSX: usar a biblioteca `xlsx` (sheetjs) — `npm install xlsx`
- Para XLSX, mapear colunas por cabeçalho (case-insensitive) — o layout pode variar
- Sempre mostrar preview com contagem de linhas parseadas + warnings antes de confirmar
- Mapear `vendedor_codigo` → `profiles.numero_vendedor` para vincular ao usuário correto
- Produtos não encontrados no catálogo são criados automaticamente como rascunho
- O parser XLSX deve ser tolerante a colunas faltando — registrar como warning, não erro fatal

### Dependências do parser
```bash
npm install cheerio pdf-parse xlsx
npm install -D @types/cheerio @types/pdf-parse
```

---

## 7. MOTOR DE COMISSÃO

### Moeda e localização
```typescript
// Moeda padrão do sistema: USD (dólar)
// Configurável por tenant em tenants.moeda_padrao
type Moeda = 'USD' | 'BRL' | 'PYG'

// A tabela tenants deve ter:
// moeda_padrao text DEFAULT 'USD'
// locale       text DEFAULT 'es-PY'  -- para formatação de números

// Formatar valores sempre pelo locale + moeda do tenant
// Nunca hardcodar símbolo de moeda no código — usar Intl.NumberFormat
// Exemplo:
const fmt = (valor: number, moeda: Moeda) =>
  new Intl.NumberFormat('es-PY', { style: 'currency', currency: moeda }).format(valor)
```

### Campos disponíveis para condições
```typescript
type CampoCondicao =
  | 'vendas_total'          // valor total no período
  | 'vendas_quantidade'     // quantidade de itens vendidos
  | 'vendas_categoria'      // valor em categoria específica
  | 'meta_atingida'         // boolean — atingiu meta do período
  | 'percentual_meta'       // % da meta atingida
  | 'tempo_casa_meses'      // tempo de empresa em meses
  | 'loja'                  // identificador da loja
  | 'nivel_vendedor'        // se tiver sistema de níveis

type Operador = '>=' | '<=' | '>' | '<' | '=' | '!='

type TipoAcao = 
  | 'percentual'      // % sobre base
  | 'fixo'            // valor fixo em guarani/real
  | 'multiplicador'   // multiplica comissão base
```

### Engine de avaliação (server-side)
```typescript
// src/lib/comissao/engine.ts
// Função principal — chamada ao calcular comissões do período

async function calcularComissao(
  vendedorId: string,
  periodoId: string,
  tenantId: string
): Promise<ComissaoCalculada>

// Deve:
// 1. Buscar dados de vendas do vendedor no período
// 2. Buscar regras ativas do tenant ordenadas por prioridade
// 3. Avaliar cada regra contra os dados
// 4. Acumular ações das regras que passaram
// 5. Retornar total + detalhamento (quais regras foram aplicadas)
// 6. Salvar em comissoes_calculadas
```

---

## 8. SISTEMA DE WIDGETS

### Widget types a implementar (fase inicial)
```typescript
const WIDGET_TYPES = [
  {
    id: 'ranking_vendedores',
    nome: 'Ranking de Vendedores',
    config: { periodo: 'required', loja: 'optional', limite: 'number' }
  },
  {
    id: 'evolucao_vendas',
    nome: 'Evolução de Vendas',
    config: { periodo_inicio: 'required', periodo_fim: 'required', agrupar_por: 'mes|semana' }
  },
  {
    id: 'vendas_por_categoria',
    nome: 'Vendas por Categoria',
    config: { periodo: 'required', tipo_chart: 'pizza|barras' }
  },
  {
    id: 'kpi_periodo',
    nome: 'KPI do Período',
    config: { metrica: 'total_vendas|ticket_medio|qtd_vendedores_meta' }
  },
  {
    id: 'top_produtos',
    nome: 'Top Produtos',
    config: { periodo: 'required', categoria: 'optional', limite: 'number' }
  },
  {
    id: 'comissoes_periodo',
    nome: 'Resumo de Comissões',
    config: { periodo: 'required', status: 'calculado|aprovado' }
  },
  {
    id: 'progresso_treinamento',
    nome: 'Progresso do Treinamento',
    config: { trilha: 'optional' }
  }
]
```

### Layout engine
- Usar `react-grid-layout` para drag-and-drop e resize
- Grid de 12 colunas, altura de linha = 80px
- Persistir layout em `dashboard_layouts.widgets` (jsonb)
- Cada widget tem config própria editável via modal

---

## 9. LMS — CONTEÚDO INICIAL

### Trilha padrão: "Vendas no Varejo CDE"
Inserir via migration seed após criar schema:

```
Módulo 1 — Perfil do Cliente CDE (xp: 50)
  Lição 1: O Turista Brasileiro
  Lição 2: O Turista Paraguaio  
  Lição 3: O Atacadista Online
  Quiz: 5 questões — aprovação 70%

Módulo 2 — Abordagem & Rapport (xp: 60)
  Lição 1: Os Primeiros 10 Segundos
  Lição 2: O Protocolo de Abordagem CDE
  Lição 3: A Técnica do Espelho
  Quiz: 5 questões — aprovação 70%

Módulo 3 — Sondagem & Necessidades (xp: 70)
  Lição 1: Por Que Perguntar é Vender
  Lição 2: O Funil de Sondagem em 5 Passos
  Lição 3: Vocabulário que Vende
  Quiz: 6 questões — aprovação 70%

Módulo 4 — Apresentação do Produto (xp: 80)
  Lição 1: Técnica FAB
  Lição 2: Como Apresentar o Preço
  Lição 3: A Importância do "Deixa Eu Mostrar"
  Quiz: 6 questões — aprovação 70%

Módulo 5 — Objeções & Reversões (xp: 90)
  Lição 1: Por Que o Cliente Objeta
  Lição 2: As 4 Objeções Mais Comuns em CDE
  Lição 3: Scripts de Reversão Prontos
  Quiz: 8 questões — aprovação 70%

Módulo 6 — Gatilhos Mentais (xp: 80)
  Lição 1: Como Funcionam os Gatilhos
  Lição 2: Os 8 Gatilhos do Varejo CDE
  Lição 3: Quando Usar Cada Gatilho
  Quiz: 8 questões — aprovação 70%

Módulo 7 — Fechamento & Upsell (xp: 100)
  Lição 1: Sinais de Compra
  Lição 2: Técnicas de Fechamento
  Lição 3: Upsell e Cross-sell Naturais
  Quiz: 8 questões — aprovação 70%

Módulo 8 — Atendimento Atacado Web (xp: 90)
  Lição 1: O Perfil do Atacadista Online
  Lição 2: Atendimento por WhatsApp
  Lição 3: Proposta e Follow-up
  Quiz: 6 questões — aprovação 70%
```

---

## 10. GAMIFICAÇÃO

### Regras de XP
```
Completar lição:          +10 XP
Completar quiz (70-89%):  +xp_reward do módulo
Completar quiz (90-100%): +xp_reward * 1.5 (arredondado)
Streak 7 dias:            +50 XP bonus
Primeiro módulo:          badge "Primeiro Passo"
5 módulos:                badge "Estudioso"
Todos módulos:            badge "Mestre CDE"
Top 3 ranking semana:     badge "Destaque da Semana"
Quiz 100% na 1ª tentativa: badge "Perfeccionista"
```

### Níveis
```
Nível 1 — Iniciante:     0-199 XP
Nível 2 — Aprendiz:      200-499 XP
Nível 3 — Profissional:  500-999 XP
Nível 4 — Especialista:  1000-1999 XP
Nível 5 — Mestre CDE:    2000+ XP
```

---

## 11. AUTENTICAÇÃO E ROLES

### Roles do sistema
```
super_admin   — Guilherme — acesso total a todos os tenants + /admin
adm           — gerente da loja — acesso ao /dashboard do tenant
gerente       — subgerente — acesso limitado (sem gestão de usuários)
vendedor      — acesso apenas a /meu-resultado e /treinamento
```

> ⚠️ **ENUM constraint (Phase 2):** `profiles.role` é `user_role` ENUM com apenas `adm` e `vendedor`.
> `gerente` e `super_admin` NÃO existem no banco ainda. Antes de usar qualquer um desses roles
> em SQL, policies ou código, executar:
> ```sql
> ALTER TYPE user_role ADD VALUE 'gerente';
> ALTER TYPE user_role ADD VALUE 'super_admin';
> ```
> Via migration (ex: `0014_extend_role_enum.sql`) — não executar diretamente.

### Fluxo de convite
```
1. Gerente acessa /dashboard/usuarios → cria convite (email + role + loja)
2. Sistema insere em convites + envia email com link /convite/[token]
3. Novo usuário acessa link, define senha, perfil criado automaticamente
4. Alternativa: gerar link de convite sem email (compartilhar manualmente)
```

### Middleware de autenticação
```typescript
// Proteger rotas por role — middleware.ts
// /dashboard/* → role: adm, gerente, super_admin
// /meu-resultado/* → role: vendedor
// /treinamento/* → qualquer role autenticada
// /admin/* → role: super_admin
// /convite/* → público
```

---

## 12. ORDEM DE EXECUÇÃO — SPRINTS

> Claude Code deve executar os sprints nesta ordem.
> Concluir completamente cada sprint antes de iniciar o próximo.
> Ao final de cada sprint, executar os testes descritos e reportar resultado.

---

### SPRINT 0 — Fundação (executar primeiro, sem exceção)

**Objetivo:** Base técnica sólida antes de qualquer feature.

**Tarefas:**

**S0.1 — Extrair schema atual**
```bash
supabase db dump --project-ref zsczxblhtdhpdqvkpuwz > /tmp/schema_atual.sql
cat /tmp/schema_atual.sql
```
Analisar o output e registrar todas as tabelas, views, RPCs e policies existentes.

**S0.2 — Limpar repositório**
- Deletar /app/mapeamento/ (rota morta)
- Identificar e remover imports quebrados
- Garantir que `npm run build` passa sem erros

**S0.3 — Instalar e configurar shadcn**
```bash
npx shadcn@latest init
# Responder: TypeScript=yes, style=default, baseColor=slate, cssVariables=yes
```
Após instalar, substituir TODAS as CSS vars do shadcn pelas vars do tema GDS definidas na seção 1.
Instalar os componentes base:
```bash
npx shadcn@latest add button card badge table tabs select dialog sheet
npx shadcn@latest add dropdown-menu avatar separator skeleton tooltip
npx shadcn@latest add form input label textarea switch
```

**S0.4 — Criar design tokens globais**
Atualizar `globals.css` com as CSS vars completas do tema dark (padrão) e light (alternativa).
Implementar toggle de tema com `next-themes`.
Adicionar as fontes Syne e DM Mono via `next/font`.

**S0.5 — Criar componentes base**
Criar em `src/components/ui/` (além dos shadcn):
- `stat-card.tsx` — card de métrica com label + valor + variação
- `data-table.tsx` — tabela com sort, filter, pagination
- `period-selector.tsx` — seletor de período reutilizável
- `loja-badge.tsx` — badge colorido por loja (usa --jebai, --paje1, --paje2)
- `progress-ring.tsx` — círculo de progresso SVG para metas
- `empty-state.tsx` — estado vazio padronizado
- `page-header.tsx` — header de página com title + breadcrumb + actions

**S0.6 — Escrever migrations do schema atual**
Com base no output do S0.1, escrever `supabase/migrations/0001_schema_inicial.sql`
cobrindo todas as tabelas, views, policies e RPCs existentes.
Verificar que `supabase db push` funciona sem erros.

**S0.7 — Criar layout base v2**
Reescrever o layout do dashboard com:
- **Desktop:** sidebar fixa colapsável (ícone + label → só ícone)
- **Mobile:** topbar com botão hamburger → drawer lateral (Sheet do shadcn)
- Topbar: seletor de período global, seletor de loja, avatar + menu do usuário, toggle dark/light
- Tratamento de loading com Skeleton em todas as páginas
- Tratamento de erro com Error Boundary global
- Tema padrão: **dark** — toggle disponível para light quando necessário

**Teste S0:**
```bash
npm run build   # zero erros
npm run lint    # zero warnings críticos
# Navegar: /login → /dashboard → /meu-resultado — sem crashes
```

---

### SPRINT 1 — Schema v2 + Migrations

**Objetivo:** Banco de dados completo e versionado.

**S1.1 — Migrations incrementais**
Criar uma migration por grupo de tabelas:
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
```

**S1.2 — RLS Policies**
Para cada tabela nova, implementar RLS:
- `(SELECT tenant_id FROM profiles WHERE id = auth.uid())` para isolamento multi-tenant
  > ⚠️ **NÃO usar** `auth.jwt() ->> 'tenant_id'` — JWT custom claim não configurado (requer Auth Hook no plano atual). Ver §16 Decisões Phase 2.
- Vendedor só lê os próprios dados em progresso_usuario, quiz_resultados, gamificacao
- Gerente lê todos do tenant, escreve em regras_comissao, convites, metas
  > ⚠️ **`gerente` não existe no ENUM** `user_role` ainda. Policies que verificam role usam `role = 'adm'` até o ENUM ser estendido.
- Super_admin bypassa RLS com service role

**S1.3 — Seed de dados iniciais**
```
0011_seed_widget_types.sql    -- inserir os 7 widget types definidos na seção 8
0012_seed_lms_conteudo.sql    -- inserir trilha + módulos + lições + quizzes da seção 9
0013_seed_tenant_inicial.sql  -- criar tenant "GDS Interno" com as 3 lojas
```

**S1.4 — TypeScript types**
Gerar types do Supabase:
```bash
supabase gen types typescript --project-id zsczxblhtdhpdqvkpuwz > src/types/supabase.ts
```
Criar `src/types/index.ts` com types de domínio derivados dos types do banco.

**Teste S1:**
```bash
supabase db push   # todas as migrations aplicadas sem erro
# Verificar no Studio: todas as tabelas criadas, RLS ativo
```

---

### SPRINT 2 — Auth & Usuários

**Objetivo:** Sistema de autenticação completo com convites.

**S2.1 — Middleware**
Implementar `middleware.ts` com proteção por role conforme seção 11.

**S2.2 — Página de login**
Redesenhar `/login` com o novo design system.
- Form email + senha
- Link "Esqueci a senha" (Supabase reset)
- Sem opção de auto-cadastro (apenas via convite)

**S2.3 — Fluxo de convite**
- `/dashboard/usuarios` — tabela de usuários + botão "Convidar"
- Modal de criação de convite: email (opcional), role, loja
- Geração de link `/convite/[token]`
- Envio de email via Supabase Edge Function (usar Resend)
- `/convite/[token]` — validar token, form de criação de perfil + senha

**S2.4 — Gestão de usuários**
- Tabela com: nome, número vendedor, loja, role, ativo, último acesso
- Ações inline: editar role, desativar, reenviar convite
- Filtro por loja e role

**Teste S2:**
```bash
# Criar convite → receber email → aceitar → fazer login como novo usuário
# Verificar redirecionamento correto por role
# Verificar que vendedor não acessa /dashboard
```

---

### SPRINT 3 — Importação CEC + Schema de Vendas

**Objetivo:** Parser do sistema CEC + histórico de vendas por itens.

**S3.1 — Parser CEC**
Implementar `src/lib/parsers/cec.ts` conforme spec da seção 6.
- Suporte a **HTML** (cheerio) — formato primário, prioridade máxima
- Suporte a **PDF** (pdf-parse + regex)
- Suporte a **XLSX** (sheetjs/xlsx) — mapeamento por cabeçalho de coluna
- Detecção automática de formato por MIME type e extensão
- Interface `ParseResult` unificada independente do formato de entrada
- Preview antes de confirmar import
- Mapeamento vendedor_codigo → profiles.numero_vendedor
- Auto-criação de produtos não encontrados no catálogo (status: rascunho)

**S3.2 — UI de importação**
- `/dashboard/vendas/importar` — dropzone que aceita `.html`, `.pdf`, `.xlsx`
- Label informativo: "HTML (recomendado) · PDF · XLSX"
- Indicador visual do formato detectado após seleção do arquivo
- Preview table: linhas parseadas, warnings, contagem por vendedor
- Seção de warnings colapsável (erros não fatais)
- Confirmação com botão "Importar X registros"
- Histórico de imports anteriores com: data, formato, arquivo, registros, status

**S3.3 — Análise de vendas**
- `/dashboard/vendas` — tabela principal com filtros: período, loja, vendedor, categoria
- Gráfico de evolução temporal (Recharts LineChart)
- Breakdown por categoria (Recharts PieChart)
- Top produtos do período (tabela ranqueada)
- Drill-down: clicar em categoria → ver produtos dessa categoria

**Teste S3:**
```bash
# Exportar um relatório real do CEC (HTML e PDF)
# Fazer upload → verificar preview → confirmar import
# Verificar dados no banco: vendas + itens_venda
# Verificar análises atualizadas
```

---

### SPRINT 4 — Motor de Comissão

**Objetivo:** Regras configuráveis pelo gerente, cálculo automático.

**S4.1 — Interface de regras**
- `/dashboard/comissoes/regras` — lista de regras ativas por prioridade
- Criar/editar regra: nome, condições (builder visual), ação
- Builder de condições: campo + operador + valor, suporte a AND/OR
- Preview: testar regra contra dados do último período

**S4.2 — Engine de avaliação**
Implementar `src/lib/comissao/engine.ts` conforme spec da seção 7.
- Tipagem forte para condições e ações
- Função `avaliarRegra(regra, dadosVendedor): boolean`
- Função `calcularComissao(vendedorId, periodoId, tenantId): ComissaoCalculada`
- Moeda: ler `tenants.moeda_padrao` (default: `USD`) — nunca hardcodar
- Formatar valores com `Intl.NumberFormat` usando locale e moeda do tenant
- Log de auditoria: quais regras foram aplicadas + valores + moeda utilizada

**S4.3 — Visualização de comissões**
- `/dashboard/comissoes` — tabela de comissões do período
- Por vendedor: comissão base + bonuses + total
- Detalhe: expandir para ver quais regras foram aplicadas
- Ação: "Aprovar comissões do período" (muda aprovado = true)

**Teste S4:**
```bash
# Criar 3 regras com condições diferentes
# Calcular comissões para um período com dados importados
# Verificar detalhamento por regra
# Testar edge cases: vendedor sem vendas, regras conflitantes
```

---

### SPRINT 5 — Dashboard de Widgets

**Objetivo:** Painel configurável por gerente.

**S5.1 — Instalar react-grid-layout**
```bash
npm install react-grid-layout
npm install -D @types/react-grid-layout
```

**S5.2 — Widget components**
Criar um componente para cada widget type:
```
src/components/dashboard/widgets/
├── ranking-vendedores.tsx
├── evolucao-vendas.tsx
├── vendas-por-categoria.tsx
├── kpi-periodo.tsx
├── top-produtos.tsx
├── comissoes-periodo.tsx
└── progresso-treinamento.tsx
```
Cada widget recebe sua config e busca dados via Server Action ou SWR.

**S5.3 — Layout engine**
- Grid drag-and-drop com react-grid-layout
- Modo "editar layout" (toggle) vs. modo visualização
- Botão "Adicionar widget" → modal com catálogo
- Config por widget: clicar no ícone de engrenagem
- Salvar layout automaticamente no banco

**S5.4 — Dashboard principal**
`/dashboard/page.tsx` — renderizar widgets do layout salvo do usuário.
Layout padrão para novos usuários: KPI + Ranking + Evolução.

**Teste S5:**
```bash
# Adicionar 5 widgets diferentes
# Reordenar e redimensionar
# Recarregar página — layout deve persistir
# Testar em mobile (375px) — deve mostrar stacked
```

---

### SPRINT 6 — LMS (Treinamento)

**Objetivo:** Plataforma de treinamento completa para vendedores.

**S6.1 — Player de módulo**
`/treinamento/[trilha_id]/[modulo_id]` — interface do vendedor:
- Sidebar com lista de lições + progresso
- Área principal: renderizar lição por tipo (texto/diálogo/checklist)
- Navegação: anterior / próximo
- Ao completar todas as lições: desbloquear quiz

**S6.2 — Engine de quiz**
- Renderizar **uma questão por vez** — navegação anterior/próximo (melhor UX mobile)
- Barra de progresso: "Questão 3 de 8"
- Salvar resposta por questão localmente antes de submeter
- Ao finalizar: enviar todas as respostas de uma vez ao servidor
- Calcular pontuação e mostrar tela de resultado
- Tela de resultado: pontuação, aprovado/reprovado, feedback por questão
- Se aprovado (≥70%): conceder XP + desbloquear próximo módulo
- Se reprovado: mostrar questões erradas com explicação + botão "Tentar novamente"
- Limitar a 3 tentativas por sessão — após isso, liberar novo acesso em 24h

**S6.3 — Gamificação**
- Atualizar `gamificacao` após cada quiz
- Verificar e conceder badges automaticamente (via Supabase Function ou server action)
- Streak: atualizar `ultimo_acesso` + incrementar `streak_dias`
- Ranking semanal de XP (query com window function)

**S6.4 — Dashboard do vendedor (/meu-resultado/treinamento)**
- Trilhas disponíveis + % de progresso
- Próximo módulo recomendado
- XP total + nível + badges conquistados
- Posição no ranking da loja

**S6.5 — Painel gerencial (/dashboard/treinamento)**
- Tabela: vendedor + módulos concluídos + XP + último acesso
- Filtro por loja
- Exportar relatório de progresso (CSV)
- Widget "progresso_treinamento" para o dashboard

**Teste S6:**
```bash
# Fazer login como vendedor
# Completar módulo 1 do início ao fim
# Responder quiz — testar aprovação e reprovação
# Verificar XP atualizado + badge concedido
# Fazer login como gerente — verificar progresso da equipe
```

---

### SPRINT 7 — Docker + Deploy VPS

**Objetivo:** Deploy production-ready no VPS.

**S7.1 — Dockerfile**
```dockerfile
# Padrão do stack existente (mesmo do Miti Miti)
FROM node:20-alpine AS base
# multi-stage: deps → builder → runner
# output: standalone
# NEXT_PUBLIC_* vars em build time
# Runtime vars via docker-compose
```

**S7.2 — docker-compose.yml**
```yaml
# /docker/da-silva-dashboard/docker-compose.yml
services:
  app:
    build: .
    container_name: da-silva-dashboard-app-1
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_SUPABASE_URL
      - NEXT_PUBLIC_SUPABASE_ANON_KEY
      - SUPABASE_SERVICE_ROLE_KEY
      - NEXTAUTH_SECRET
      - RESEND_API_KEY
    networks:
      - proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.dashboard.rule=Host(`gds-frame.com`)
      - traefik.http.routers.dashboard.tls.certresolver=letsencrypt
      - traefik.http.services.dashboard.loadbalancer.server.port=3000
      # LMS acessível via subdomínio futuro — configurar quando nome for definido
      # - traefik.http.routers.lms.rule=Host(`[nome].gds-frame.com`)

networks:
  proxy:
    external: true
```

**S7.3 — CI simplificado**
Script `deploy.sh` no VPS:
```bash
#!/bin/bash
cd /docker/da-silva-dashboard
git pull origin main
docker compose build --no-cache
docker compose up -d
docker compose logs -f --tail=50
```

**Teste S7:**
```bash
# SSH no VPS → executar deploy.sh
# Verificar https://gds-frame.com — SSL válido
# Testar todas as rotas em produção
# Verificar logs: sem erros críticos
```

---

## 13. REGRAS PARA O CLAUDE CODE

### Sempre
- Ler este CLAUDE.md integralmente antes de qualquer sprint
- Usar TypeScript strict — sem `any` implícito
- Usar Server Components por padrão — Client Components apenas quando necessário (interatividade, hooks)
- Escrever migrations para toda mudança de schema — nunca modificar banco direto
- Manter RLS ativo em todas as tabelas — nunca desabilitar
- Testar o build (`npm run build`) antes de declarar sprint concluído

### Nunca
- Instalar bibliotecas fora do stack definido sem registrar o motivo
- Modificar o projeto Supabase `zsczxblhtdhpdqvkpuwz` diretamente sem migration
- Fazer commits no branch main sem o build passar
- Criar rotas sem proteção de autenticação (exceto as declaradas como públicas)
- Hardcodar IDs, URLs ou secrets — usar variáveis de ambiente

### Padrão de Server Actions
```typescript
'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function minhaAction(data: MeuType) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')
  // ... lógica
  revalidatePath('/dashboard')
}
```

### Padrão de página com RSC
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // tenant_id NÃO está no JWT — buscar via profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  if (!profile?.tenant_id) redirect('/login')

  const { data } = await supabase
    .from('tabela')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
  
  return <MeuComponente data={data} />
}
```

---

## 14. VARIÁVEIS DE AMBIENTE

```env
# .env.local (desenvolvimento)
NEXT_PUBLIC_SUPABASE_URL=https://zsczxblhtdhpdqvkpuwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...              # para envio de convites por email
NEXTAUTH_SECRET=...             # gerar com: openssl rand -base64 32
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Produção (VPS — definir no docker-compose ou .env do servidor)
NEXT_PUBLIC_APP_URL=https://gds-frame.com
# Quando subdomínio LMS for definido:
# NEXT_PUBLIC_LMS_URL=https://[nome].gds-frame.com
```

---

## 15. DECISÕES DE PRODUTO — FINALIZADAS

> Todas as decisões abaixo estão fechadas. Não questionar durante a implementação.

| # | Decisão | Valor definido |
|---|---------|---------------|
| D1 | Tema padrão | **Dark** — `#0e0f11` bg, `#c8f542` accent. Toggle para light disponível |
| D2 | Navegação mobile | **Hamburger** → Sheet/Drawer lateral (shadcn Sheet component) |
| D3 | Formatos de importação | **HTML (prioritário) + PDF + XLSX** — detecção automática por MIME/extensão |
| D4 | Moeda do sistema | **USD por padrão** — configurável por tenant (USD \| BRL \| PYG) em `tenants.moeda_padrao` |
| D5 | Quiz UX | **Uma questão por vez** — barra de progresso, navegação anterior/próximo |
| D6 | Domínio do LMS | **`gds-frame.com`** por ora — subdomínio `[nome].gds-frame.com` quando nome for definido |

---

---

## 16. DECISÕES DE IMPLEMENTAÇÃO — PHASE 2 (maio 2026)

> Registradas após execução das migrations 0001–0013. Críticas para fases 3+.

### D-P2.1 — `periodo_id` é INTEGER, não UUID
`periods.id` é `serial` (integer) no schema original (migration 0001).
Todas as FKs que referenciam `periods` devem ser `integer`, não `uuid`.
- **Afeta:** Sprint 3 (import CEC), Sprint 4 (comissão)
- **Arquivos:** `0004_vendas_itens.sql`, `0005_motor_comissao.sql`
- **Erro se errar:** `foreign key constraint violation` em insert de vendas/comissoes

### D-P2.2 — RLS usa profiles, não JWT claim
`auth.jwt() ->> 'tenant_id'` **não funciona** — JWT custom claim não configurado.
Padrão correto em todas as policies:
```sql
(SELECT tenant_id FROM profiles WHERE id = auth.uid())
```
No código TypeScript (RSC), buscar `tenant_id` via query na tabela `profiles` — não via `user.user_metadata`.

### D-P2.3 — `profiles.role` é ENUM com 2 valores apenas
Tipo: `user_role` ENUM. Valores válidos: **`adm`** e **`vendedor`** apenas.
`gerente` e `super_admin` **não existem** — qualquer SQL com esses valores lança `invalid input value for enum user_role`.
Para adicionar: criar migration `ALTER TYPE user_role ADD VALUE '...'` antes de usar.

### D-P2.4 — UUIDs fixos dos seeds
| Entidade | UUID |
|----------|------|
| tenant `gds-interno` | `aaaaaaaa-0000-0000-0000-000000000001` |
| trilha "Vendas no Varejo CDE" | `11111111-0000-0000-0000-000000000001` |
| módulo 1..8 | `22222222-0000-0000-0000-0000000000{01..08}` |

### D-P2.5 — `supabase gen types` requer `2>/dev/null`
Sem o redirect, CLI imprime `Initialising login role...` no stdout junto ao TypeScript, corrompendo o arquivo.
```bash
# Correto:
npx supabase gen types typescript --linked 2>/dev/null > src/types/supabase.ts
```

### D-P2.6 — Migration 0001 reparada (não re-executada)
Schema v1 já existia no banco remoto antes do GSD Workflow.
`supabase migration repair --status applied 20250101000000` foi usado para sincronizar histórico.
Re-executar causaria `ERROR: policy already exists` (CREATE POLICY sem IF NOT EXISTS).

### D-P2.7 — `widget_types` sem `tenant_id`
Global por design — sem dados sensíveis. RLS permite SELECT para qualquer `authenticated`.
**Não adicionar `tenant_id`** a esta tabela sem revisão da arquitetura.

### D-P2.8 — `trilhas.tenant_id` nullable
`NULL` = conteúdo global (acessível a todos os tenants).
`tenant_id NOT NULL` = conteúdo exclusivo do tenant.
A trilha seed "Vendas no Varejo CDE" tem `tenant_id = NULL` (global).

---

*Documento gerado em: maio 2026*
*Versão: 1.2 — Phase 2 decisions adicionadas*
*Próxima revisão: após Sprint 3*
