# Requirements: GDS Frame Dashboard v2 + LMS

**Defined:** 2026-05-19
**Core Value:** Gerentes enxergam performance real de cada vendedor e calculam comissões corretamente — e vendedores sabem exatamente o que precisam aprender para vender mais.

## v1 Requirements

### Foundation (Sprint 0)

- [ ] **FOUND-01**: Schema atual do Supabase extraído e versionado em supabase/migrations/0001_schema_inicial.sql
- [ ] **FOUND-02**: Rotas mortas (/mapeamento, /dashboard/metas vazio) deletadas e build passa sem erros
- [ ] **FOUND-03**: shadcn/ui instalado e configurado com tema GDS (dark: #0e0f11 bg, #c8f542 accent; light alternativo)
- [ ] **FOUND-04**: Fontes Syne e DM Mono carregadas via next/font (não CDN link tag)
- [ ] **FOUND-05**: Componentes base criados: stat-card, data-table, period-selector, loja-badge, progress-ring, empty-state, page-header
- [ ] **FOUND-06**: Layout v2 implementado: sidebar colapsável no desktop, hamburger + Sheet no mobile, topbar com seletor de período/loja/avatar/toggle dark-light
- [ ] **FOUND-07**: `npm run build` e `npm run lint` passam sem erros críticos

### Schema v2 (Sprint 1)

- [ ] **SCHEMA-01**: Migration tenants com campos: slug, plano, cor_primaria, moeda_padrao, locale, ativo
- [ ] **SCHEMA-02**: Migration produtos e categorias com hierarquia (pai_id)
- [ ] **SCHEMA-03**: Migration vendas e itens_venda substituindo vendor_summary como fonte primária
- [ ] **SCHEMA-04**: Migration motor de comissão: regras_comissao (jsonb condições+ação) e comissoes_calculadas
- [ ] **SCHEMA-05**: Migration dashboard_layouts com jsonb de widgets por usuário
- [ ] **SCHEMA-06**: Migration convites com token, role, expiry
- [ ] **SCHEMA-07**: Migration LMS completo: trilhas, modulos, licoes, quiz_questoes, progresso_usuario, quiz_resultados, gamificacao
- [ ] **SCHEMA-08**: RLS policies em todas as tabelas com isolamento por tenant_id
- [ ] **SCHEMA-09**: Seeds: 7 widget_types, trilha "Vendas no Varejo CDE" com 8 módulos + quizzes, tenant GDS Interno
- [ ] **SCHEMA-10**: TypeScript types gerados via supabase gen types e exportados de src/types/supabase.ts

### Auth & Users (Sprint 2)

- [ ] **AUTH-01**: Middleware protege rotas por role: /dashboard/* (adm/gerente/super_admin), /meu-resultado/* (vendedor), /treinamento/* (qualquer autenticado), /admin/* (super_admin)
- [ ] **AUTH-02**: Página /login redesenhada com design system v2 (sem opção de auto-cadastro)
- [ ] **AUTH-03**: Gerente cria convite (email opcional + role + loja) em /dashboard/usuarios e sistema gera link /convite/[token]
- [ ] **AUTH-04**: Novo usuário acessa /convite/[token], define senha, perfil criado automaticamente com role e loja corretos
- [ ] **AUTH-05**: Envio de email de convite via Supabase Edge Function com Resend
- [ ] **AUTH-06**: Tabela de usuários com: nome, número vendedor, loja, role, ativo, último acesso; filtro por loja e role; ações: editar role, desativar, reenviar convite

### Import CEC (Sprint 3)

- [ ] **IMPORT-01**: Parser CEC detecta formato automaticamente por MIME type e extensão (HTML/PDF/XLSX)
- [ ] **IMPORT-02**: Parser HTML usa cheerio para extrair tabelas do CEC Consfot
- [ ] **IMPORT-03**: Parser PDF usa pdf-parse + regex para estruturar dados
- [ ] **IMPORT-04**: Parser XLSX usa sheetjs com mapeamento tolerante por cabeçalho de coluna
- [ ] **IMPORT-05**: Todos os parsers normalizam para interface CECItem[] unificada
- [ ] **IMPORT-06**: UI /dashboard/vendas/importar com dropzone (aceita .html, .pdf, .xlsx), preview de linhas parseadas + warnings, confirmação antes de importar
- [ ] **IMPORT-07**: Histórico de imports com: data, formato, arquivo, registros, status
- [ ] **IMPORT-08**: Vendedor_codigo mapeado para profiles.numero_vendedor; produtos não encontrados criados como rascunho
- [ ] **IMPORT-09**: /dashboard/vendas com tabela filtrada por período/loja/vendedor/categoria, gráfico de evolução (Recharts), breakdown por categoria, top produtos

### Commissions (Sprint 4)

- [ ] **COMM-01**: Interface /dashboard/comissoes/regras: CRUD de regras com nome, condições (builder visual AND/OR), ação (percentual/fixo/multiplicador)
- [ ] **COMM-02**: Engine server-side avalia regras por prioridade e acumula ações para cada vendedor
- [ ] **COMM-03**: Valores formatados com Intl.NumberFormat usando locale e moeda do tenant (nunca hardcoded)
- [ ] **COMM-04**: /dashboard/comissoes: tabela por vendedor (base + bonuses + total), detalhe de regras aplicadas, botão "Aprovar comissões do período"
- [ ] **COMM-05**: Log de auditoria registra quais regras foram aplicadas com valores e moeda

### Dashboard Widgets (Sprint 5)

- [ ] **DASH-01**: react-grid-layout instalado com grid 12 colunas, altura de linha 80px
- [ ] **DASH-02**: 7 componentes de widget implementados: ranking_vendedores, evolucao_vendas, vendas_por_categoria, kpi_periodo, top_produtos, comissoes_periodo, progresso_treinamento
- [ ] **DASH-03**: Modo "editar layout" com drag-and-drop, resize e botão "Adicionar widget"
- [ ] **DASH-04**: Config por widget via modal de engrenagem; layout salvo automaticamente em dashboard_layouts
- [ ] **DASH-05**: Layout padrão para novos usuários: KPI + Ranking + Evolução
- [ ] **DASH-06**: Mobile (375px): widgets empilhados verticalmente

### LMS (Sprint 6)

- [ ] **LMS-01**: Player /treinamento/[trilha_id]/[modulo_id] com sidebar de lições + progresso e área de conteúdo por tipo (texto/diálogo/checklist)
- [ ] **LMS-02**: Engine de quiz: uma questão por vez, barra de progresso, salva respostas localmente, submete ao final
- [ ] **LMS-03**: Tela de resultado do quiz: pontuação, aprovado/reprovado (≥70%), feedback por questão
- [ ] **LMS-04**: Se aprovado: XP concedido e próximo módulo desbloqueado; se reprovado: questões erradas + botão "Tentar novamente"
- [ ] **LMS-05**: Limite de 3 tentativas por sessão; após isso, novo acesso em 24h
- [ ] **LMS-06**: Gamificação: XP por lição/quiz (com bônus 90-100%), badges automáticos, streak diário
- [ ] **LMS-07**: /meu-resultado/treinamento: trilhas disponíveis, próximo módulo, XP total, nível, badges, posição no ranking
- [ ] **LMS-08**: /dashboard/treinamento: tabela de progresso da equipe por loja, exportar CSV
- [ ] **LMS-09**: Widget progresso_treinamento disponível no dashboard de widgets

### Deploy (Sprint 7)

- [ ] **DEPLOY-01**: Dockerfile multi-stage (base/deps/builder/runner) com output: standalone e node:20-alpine
- [ ] **DEPLOY-02**: docker-compose.yml em /docker/da-silva-dashboard/ com Traefik labels para gds-frame.com + letsencrypt
- [ ] **DEPLOY-03**: Script deploy.sh no VPS: git pull + docker compose build + up -d + logs
- [ ] **DEPLOY-04**: https://gds-frame.com operacional com SSL válido, todas as rotas testadas em produção

## v2 Requirements

### Admin SaaS

- **ADMIN-01**: /admin/tenants — gestão de tenants para produto SaaS
- **ADMIN-02**: /admin/conteudo — gestão global de trilhas e módulos cross-tenant
- **ADMIN-03**: Onboarding de novo tenant com criação de slug, logo e configuração de moeda

### Notifications

- **NOTF-01**: Notificação para gerente quando vendedor completa um módulo
- **NOTF-02**: Notificação push mobile (PWA) para vendedores sobre novas trilhas

### LMS Avançado

- **LMS-ADV-01**: Lições tipo "vídeo" com player integrado
- **LMS-ADV-02**: Certificado PDF ao completar trilha
- **LMS-ADV-03**: Ranking global cross-tenant para o produto SaaS

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth/social login | Lojas não usam Google auth — email/senha suficiente |
| App mobile nativo | Responsivo web suficiente para vendedores de piso |
| Integração direta API CEC | CEC Consfot não tem API pública — export HTML/PDF é o fluxo real |
| Relatórios financeiros P&L | Foco é performance de vendas e comissão |
| Nome/identidade visual do SaaS LMS | Definir após validação interna |
| Sincronização offline | Complexidade desnecessária para o contexto atual |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 — Foundation | Pending |
| FOUND-02 | Phase 1 — Foundation | Pending |
| FOUND-03 | Phase 1 — Foundation | Pending |
| FOUND-04 | Phase 1 — Foundation | Pending |
| FOUND-05 | Phase 1 — Foundation | Pending |
| FOUND-06 | Phase 1 — Foundation | Pending |
| FOUND-07 | Phase 1 — Foundation | Pending |
| SCHEMA-01 | Phase 2 — Schema v2 | Pending |
| SCHEMA-02 | Phase 2 — Schema v2 | Pending |
| SCHEMA-03 | Phase 2 — Schema v2 | Pending |
| SCHEMA-04 | Phase 2 — Schema v2 | Pending |
| SCHEMA-05 | Phase 2 — Schema v2 | Pending |
| SCHEMA-06 | Phase 2 — Schema v2 | Pending |
| SCHEMA-07 | Phase 2 — Schema v2 | Pending |
| SCHEMA-08 | Phase 2 — Schema v2 | Pending |
| SCHEMA-09 | Phase 2 — Schema v2 | Pending |
| SCHEMA-10 | Phase 2 — Schema v2 | Pending |
| AUTH-01 | Phase 3 — Auth & Users | Pending |
| AUTH-02 | Phase 3 — Auth & Users | Pending |
| AUTH-03 | Phase 3 — Auth & Users | Pending |
| AUTH-04 | Phase 3 — Auth & Users | Pending |
| AUTH-05 | Phase 3 — Auth & Users | Pending |
| AUTH-06 | Phase 3 — Auth & Users | Pending |
| IMPORT-01 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-02 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-03 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-04 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-05 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-06 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-07 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-08 | Phase 4 — Import CEC + Sales | Pending |
| IMPORT-09 | Phase 4 — Import CEC + Sales | Pending |
| COMM-01 | Phase 5 — Commission Engine | Pending |
| COMM-02 | Phase 5 — Commission Engine | Pending |
| COMM-03 | Phase 5 — Commission Engine | Pending |
| COMM-04 | Phase 5 — Commission Engine | Pending |
| COMM-05 | Phase 5 — Commission Engine | Pending |
| DASH-01 | Phase 6 — Dashboard Widgets | Pending |
| DASH-02 | Phase 6 — Dashboard Widgets | Pending |
| DASH-03 | Phase 6 — Dashboard Widgets | Pending |
| DASH-04 | Phase 6 — Dashboard Widgets | Pending |
| DASH-05 | Phase 6 — Dashboard Widgets | Pending |
| DASH-06 | Phase 6 — Dashboard Widgets | Pending |
| LMS-01 | Phase 7 — LMS Training | Pending |
| LMS-02 | Phase 7 — LMS Training | Pending |
| LMS-03 | Phase 7 — LMS Training | Pending |
| LMS-04 | Phase 7 — LMS Training | Pending |
| LMS-05 | Phase 7 — LMS Training | Pending |
| LMS-06 | Phase 7 — LMS Training | Pending |
| LMS-07 | Phase 7 — LMS Training | Pending |
| LMS-08 | Phase 7 — LMS Training | Pending |
| LMS-09 | Phase 7 — LMS Training | Pending |
| DEPLOY-01 | Phase 8 — Docker + Deploy | Pending |
| DEPLOY-02 | Phase 8 — Docker + Deploy | Pending |
| DEPLOY-03 | Phase 8 — Docker + Deploy | Pending |
| DEPLOY-04 | Phase 8 — Docker + Deploy | Pending |

**Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0

---
*Requirements defined: 2026-05-19*
*Last updated: 2026-05-19 — traceability expanded to individual rows after roadmap creation*
