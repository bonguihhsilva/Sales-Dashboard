# Roadmap: GDS Frame Dashboard v2 + LMS

## Overview

Upgrade do dashboard interno da familia Da Silva de um codebase com inline styles e schema nao versionado para um sistema de gestao comercial + LMS completo, com design system shadcn/ui, schema multi-tenant versionado, motor de comissao configuravel, widgets drag-and-drop, plataforma de treinamento gamificada e deploy em VPS proprio via Docker/Traefik.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Fundacao tecnica: design system, componentes base e layout v2
- [x] **Phase 2: Schema v2** - Migrations versionadas, RLS multi-tenant, seeds e types TypeScript
- [ ] **Phase 3: Auth & Users** - Middleware por role, login redesenhado, fluxo de convites e gestao de usuarios
- [ ] **Phase 4: Import CEC + Sales** - Parsers multi-formato, UI de importacao, historico e analise de vendas
- [ ] **Phase 5: Commission Engine** - Motor de comissao server-side, condition builder visual e aprovacao por periodo
- [ ] **Phase 6: Dashboard Widgets** - Grid drag-and-drop com 7 widgets configurveis e persistencia por usuario
- [ ] **Phase 7: LMS Training** - Player de modulos, quiz engine, gamificacao XP/badges e paineis de progresso
- [ ] **Phase 8: Docker + Deploy** - Containerizacao multi-stage, Traefik + SSL e script de deploy no VPS

## Phase Details

### Phase 1: Foundation
**Goal**: Codebase limpo com design system funcional e layout v2 operacional
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Success Criteria** (what must be TRUE):
  1. Schema inicial esta em supabase/migrations/0001_schema_inicial.sql e `npm run build` passa sem erros
  2. Nenhuma rota morta existe — /mapeamento e /dashboard/metas retornam 404 ou foram removidas
  3. shadcn/ui esta configurado com tema dark (#0e0f11 bg, #c8f542 accent) e todos os 7 componentes base existem e renderizam sem erro
  4. Layout v2 e visivel: sidebar colapsavel no desktop e hamburger + Sheet no mobile, topbar com seletor de periodo/loja/avatar
  5. `npm run lint` passa sem erros criticos e fontes Syne/DM Mono carregam via next/font
**Plans**: TBD
**UI hint**: yes

### Phase 2: Schema v2
**Goal**: Banco de dados totalmente versionado com isolamento multi-tenant e tipos TypeScript sincronizados
**Depends on**: Phase 1
**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05, SCHEMA-06, SCHEMA-07, SCHEMA-08, SCHEMA-09, SCHEMA-10
**Success Criteria** (what must be TRUE):
  1. Todas as migrations (tenants, produtos, vendas, comissao, widgets, convites, LMS, gamificacao) aplicadas no Supabase sem erro
  2. RLS ativo em todas as tabelas — nenhuma query retorna dados de outro tenant
  3. Seeds executados: 7 widget_types, trilha "Vendas no Varejo CDE" com 8 modulos e tenant GDS Interno existem no banco
  4. `src/types/supabase.ts` gerado via `supabase gen types` e reflete o schema atual sem divergencias
**Plans**: TBD

### Phase 3: Auth & Users
**Goal**: Usuarios acessam o sistema com roles corretos e gerentes convidam novos membros sem intervencao tecnica
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. Rotas protegidas bloqueiam acesso fora do role — vendedor nao acessa /dashboard/*, super_admin acessa /admin/*
  2. Pagina /login usa design system v2 e nao oferece auto-cadastro
  3. Gerente cria convite em /dashboard/usuarios, link /convite/[token] e-mail e abre pagina de definicao de senha
  4. Novo usuario define senha via link, faz login e tem role + loja pre-configurados automaticamente
  5. Tabela de usuarios mostra nome, numero vendedor, loja, role, ativo, ultimo acesso com filtros e acoes inline
**Plans**: 6 plans
- [ ] 03-01-PLAN.md — Migration de schema (4 roles + rename ativo), tipos TypeScript e middleware RBAC via app_metadata
- [ ] 03-02-PLAN.md — Redesign da pagina /login com componentes shadcn
- [ ] 03-03-PLAN.md — Utilitario de roles e backend de criacao de convites (POST /api/admin/invite)
- [ ] 03-04-PLAN.md — Pagina /convite/[token] e backend de aceite (POST /api/admin/accept-invite)
- [ ] 03-05-PLAN.md — Edge Function send-invite-email (Resend) e integracao no route de convite
- [ ] 03-06-PLAN.md — Tabela de usuarios v2: DataTable, filtros, Sheet de edicao e Sheet de convite
**UI hint**: yes

### Phase 4: Import CEC + Sales
**Goal**: Gerente importa exportacao do CEC Consfot em qualquer formato e visualiza analise de vendas completa
**Depends on**: Phase 3
**Requirements**: IMPORT-01, IMPORT-02, IMPORT-03, IMPORT-04, IMPORT-05, IMPORT-06, IMPORT-07, IMPORT-08, IMPORT-09
**Success Criteria** (what must be TRUE):
  1. Upload de arquivo HTML, PDF ou XLSX e detectado pelo MIME type/extensao e parseado pelo parser correto automaticamente
  2. Todos os parsers produzem CECItem[] identico — UI de preview mostra linhas e warnings antes de confirmar
  3. Historico de imports lista data, formato, arquivo, registros e status para cada importacao realizada
  4. Vendedor_codigo mapeado para profiles.numero_vendedor; produtos novos criados como rascunho sem falhar o import
  5. /dashboard/vendas exibe tabela filtravel por periodo/loja/vendedor/categoria com grafico de evolucao e top produtos
**Plans**: TBD
**UI hint**: yes

### Phase 5: Commission Engine
**Goal**: Gerente configura regras de comissao e aprova comissoes calculadas automaticamente por periodo
**Depends on**: Phase 4
**Requirements**: COMM-01, COMM-02, COMM-03, COMM-04, COMM-05
**Success Criteria** (what must be TRUE):
  1. Gerente cria, edita e remove regras de comissao via condition builder visual (AND/OR) em /dashboard/comissoes/regras
  2. Engine server-side avalia regras por prioridade e produz comissoes calculadas por vendedor sem valores hardcoded
  3. Todos os valores monetarios exibidos com Intl.NumberFormat usando locale e moeda do tenant
  4. /dashboard/comissoes mostra base + bonuses + total por vendedor com detalhe de regras aplicadas e botao de aprovacao
  5. Log de auditoria registra quais regras foram aplicadas, com valores e moeda, para cada calculo aprovado
**Plans**: TBD
**UI hint**: yes

### Phase 6: Dashboard Widgets
**Goal**: Usuario monta seu proprio dashboard arrastando e configurando widgets que persistem entre sessoes
**Depends on**: Phase 5
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. Dashboard carrega com react-grid-layout (12 colunas, row height 80px) e exibe layout padrao (KPI + Ranking + Evolucao) para novos usuarios
  2. Os 7 tipos de widget (ranking_vendedores, evolucao_vendas, vendas_por_categoria, kpi_periodo, top_produtos, comissoes_periodo, progresso_treinamento) renderizam com dados reais
  3. Modo "editar layout" ativa drag-and-drop e resize; botao "Adicionar widget" abre seletor
  4. Config por widget salva via modal de engrenagem e persiste em dashboard_layouts no banco
  5. Em mobile (375px) todos os widgets empilham verticalmente sem overflow ou sobreposicao
**Plans**: TBD
**UI hint**: yes

### Phase 7: LMS Training
**Goal**: Vendedores completam trilhas de treinamento, fazem quizzes e acumulam XP/badges; gerentes acompanham progresso da equipe
**Depends on**: Phase 6
**Requirements**: LMS-01, LMS-02, LMS-03, LMS-04, LMS-05, LMS-06, LMS-07, LMS-08, LMS-09
**Success Criteria** (what must be TRUE):
  1. Vendedor acessa /treinamento/[trilha_id]/[modulo_id], ve sidebar de licoes com progresso e consome conteudo (texto/dialogo/checklist)
  2. Quiz apresenta uma questao por vez com barra de progresso; vendedor submete ao final e ve pontuacao + aprovado/reprovado (>=70%)
  3. Aprovacao concede XP e desbloqueia proximo modulo; reprovacao mostra questoes erradas e permite nova tentativa (limite 3/sessao, cooldown 24h)
  4. Gamificacao funciona: XP e concedido por licao/quiz, badges sao atribuidos automaticamente, streak diario e calculado
  5. /meu-resultado/treinamento mostra trilhas, proximo modulo, XP total, nivel, badges e posicao no ranking
  6. /dashboard/treinamento mostra progresso da equipe por loja com exportacao CSV; widget progresso_treinamento disponivel no dashboard
**Plans**: TBD
**UI hint**: yes

### Phase 8: Docker + Deploy
**Goal**: Aplicacao rodando em producao no VPS com SSL valido em gds-frame.com via Docker + Traefik
**Depends on**: Phase 7
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04
**Success Criteria** (what must be TRUE):
  1. `docker build` constroi imagem multi-stage (base/deps/builder/runner) com output standalone em node:20-alpine sem erros
  2. docker-compose.yml inicia stack completa com Traefik labels configurados para gds-frame.com + letsencrypt
  3. deploy.sh executa git pull + build + up -d + logs no VPS sem intervencao manual
  4. https://gds-frame.com abre com SSL valido e todas as rotas principais funcionam em producao
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/? | Not started | - |
| 2. Schema v2 | 1/1 | Complete (verified) | 2026-05-22 |
| 3. Auth & Users | 0/6 | Planned | - |
| 4. Import CEC + Sales | 0/? | Not started | - |
| 5. Commission Engine | 0/? | Not started | - |
| 6. Dashboard Widgets | 0/? | Not started | - |
| 7. LMS Training | 0/? | Not started | - |
| 8. Docker + Deploy | 0/? | Not started | - |
