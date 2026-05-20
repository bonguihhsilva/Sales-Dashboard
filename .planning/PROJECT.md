# GDS Frame Dashboard v2 + LMS

## What This Is

Sistema integrado de gestão comercial e treinamento para as 3 lojas da família Da Silva em Ciudad del Este (Jebai, Pajé 1, Pajé 2). Inclui dois produtos: **GDS Dashboard v2** (ranking de vendedores, importação CEC, motor de comissão configurável, widgets) e **LMS** (trilhas de treinamento, quiz, gamificação XP/badges). Arquitetura multi-tenant desde o início para futura oferta como SaaS para outras lojas de CDE.

## Core Value

Gerentes enxergam performance real de cada vendedor e calculam comissões corretamente — e vendedores sabem exatamente o que precisam aprender para vender mais.

## Requirements

### Validated

(Existente no codebase atual — v1 funcional em Vercel)

- ✓ Autenticação email/senha com Supabase (roles: adm, vendedor) — existente
- ✓ Dashboard de ranking de vendedores com KPIs e filtro por loja — existente
- ✓ Seletor de período para análise de vendas — existente
- ✓ View individual de vendedor com gráfico de evolução — existente
- ✓ CRUD de usuários com gestão de roles — existente
- ✓ Upload de dados de vendas via CSV/HTML — existente (parser básico)
- ✓ Tela meu-resultado para vendedor — existente

### Active

**Sprint 0 — Fundação técnica**
- [ ] S0.1: Extrair schema atual do Supabase e versionar em migrations
- [ ] S0.2: Deletar rotas mortas (/mapeamento, /dashboard/metas vazio)
- [ ] S0.3: Instalar e configurar shadcn/ui com tema GDS
- [ ] S0.4: Criar design tokens globais (dark/light) + next/font
- [ ] S0.5: Criar componentes base (stat-card, data-table, period-selector, loja-badge, progress-ring, empty-state, page-header)
- [ ] S0.6: Escrever migration 0001_schema_inicial.sql
- [ ] S0.7: Reescrever layout base v2 (sidebar colapsável, mobile drawer, topbar)

**Sprint 1 — Schema v2 + Migrations**
- [ ] S1.1: Migrations incrementais (tenants, produtos, vendas+itens, comissão, widgets, convites, LMS, gamificação)
- [ ] S1.2: RLS policies para multi-tenancy
- [ ] S1.3: Seeds (widget_types, trilha LMS inicial, tenant GDS interno)
- [ ] S1.4: TypeScript types gerados do Supabase

**Sprint 2 — Auth & Usuários**
- [ ] S2.1: Middleware com proteção por role (adm/gerente/vendedor/super_admin)
- [ ] S2.2: Redesign /login com design system v2
- [ ] S2.3: Fluxo de convite por email/link (Resend)
- [ ] S2.4: Gestão de usuários com filtros e ações inline

**Sprint 3 — Importação CEC + Análise de Vendas**
- [ ] S3.1: Parser CEC multi-formato (HTML/PDF/XLSX) com detecção automática
- [ ] S3.2: UI de importação com preview e histórico
- [ ] S3.3: Análise de vendas por categoria/produto/período

**Sprint 4 — Motor de Comissão**
- [ ] S4.1: Interface de regras com condition builder visual
- [ ] S4.2: Engine de avaliação server-side (src/lib/comissao/engine.ts)
- [ ] S4.3: Visualização e aprovação de comissões por período

**Sprint 5 — Dashboard de Widgets**
- [ ] S5.1: react-grid-layout instalado e configurado
- [ ] S5.2: 7 componentes de widget implementados
- [ ] S5.3: Layout engine drag-and-drop com persistência
- [ ] S5.4: Dashboard principal com layout padrão para novos usuários

**Sprint 6 — LMS (Treinamento)**
- [ ] S6.1: Player de módulo com sidebar de progresso
- [ ] S6.2: Engine de quiz (uma questão por vez, limite 3 tentativas)
- [ ] S6.3: Gamificação (XP, níveis, badges, streak)
- [ ] S6.4: Dashboard do vendedor /meu-resultado/treinamento
- [ ] S6.5: Painel gerencial de progresso da equipe

**Sprint 7 — Docker + Deploy VPS**
- [ ] S7.1: Dockerfile multi-stage (node:20-alpine, output: standalone)
- [ ] S7.2: docker-compose.yml com Traefik labels
- [ ] S7.3: Script deploy.sh no VPS

### Out of Scope

- OAuth/social login — apenas email/senha e magic link (lojas não usam Google auth)
- App mobile nativo — responsivo web é suficiente para vendedores de piso
- Integração direta com sistema CEC via API — export HTML/PDF/XLSX é o fluxo real
- Relatórios financeiros completos (P&L) — foco é performance de vendas e comissões
- Nome/identidade visual do produto SaaS LMS — definir após validar internamente

## Context

- **Operador:** Guilherme Da Silva, desenvolvedor independente, dono das 3 lojas
- **Stack atual:** Next.js 15.2.4, React 19, TypeScript, Supabase (`zsczxblhtdhpdqvkpuwz`), Tailwind (instalado mas não usado — 100% inline styles), Recharts, Vercel
- **Stack alvo:** adicionar shadcn/ui, Docker/Traefik, react-grid-layout, cheerio, pdf-parse, xlsx
- **Deploy atual:** Vercel (push main = deploy automático via bonguihhsilva/da-silva-dashboard)
- **Deploy alvo:** VPS Hostinger Ubuntu 24.04 (IP 72.61.46.184) em /docker/da-silva-dashboard/
- **Domínio prod alvo:** gds-frame.com (via Traefik + letsencrypt)
- **Equipe:** ~50 vendedores, acesso via celular e computador
- **Problema central do codebase atual:** 100% inline styles, shadcn não instalado, schema não versionado, motor de comissão hardcoded, rota /mapeamento morta, bugs conhecidos (rankStore, hardcoded "0,3%", window.reload)

## Constraints

- **Stack:** Next.js 15.2.4, React 19, TypeScript strict, shadcn/ui, Supabase — não alterar sem aprovação explícita
- **Banco:** Supabase projeto `zsczxblhtdhpdqvkpuwz` — toda mudança via migration
- **Moeda:** USD por padrão, configurável por tenant (USD | BRL | PYG) — nunca hardcodar
- **RLS:** Ativo em todas as tabelas — nunca desabilitar
- **Multi-tenant:** Obrigatório desde Sprint 1 — arquitetura deve suportar SaaS futuro
- **Commits:** npm run build deve passar antes de qualquer commit de fase

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tema dark (`#0e0f11` bg, `#c8f542` accent) | Identidade GDS — cor-marca verde-limão | — Pending |
| Mobile: hamburger → Sheet lateral | shadcn Sheet component, sem biblioteca extra | — Pending |
| Importação: HTML prioritário + PDF + XLSX | CEC Consfot exporta HTML nativo | — Pending |
| Moeda padrão: USD configurável por tenant | CDE opera em dólar, mas clientes BR/PY precisam de flexibilidade | — Pending |
| Quiz: uma questão por vez | Melhor UX mobile para vendedores de piso | — Pending |
| LMS em gds-frame.com por ora | Subdomínio quando nome for definido | — Pending |
| 1 sprint CLAUDE_2.md = 1 fase GSD | Alinha doc de spec com roadmap de execução | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-19 after initialization*
