# GDS Dashboard v2 + LMS

## What This Is

Dashboard comercial interno para as 3 lojas Da Silva em Ciudad del Este (Jebai, Pajé 1, Pajé 2). Permite que gerentes acompanhem performance de vendedores, calculem comissões e configurem metas — e que vendedores vejam seus próprios resultados e avancem em trilhas de treinamento. Arquitetura multi-tenant preparada para oferta futura como SaaS para outras lojas de CDE.

## Core Value

Gerentes enxergam performance real de cada vendedor e calculam comissões corretamente — e vendedores sabem exatamente o que precisam aprender para vender mais.

## Requirements

### Validated

<!-- Funcionalidades já em produção com dados reais (47 usuários, 63.906 registros de venda) -->

- ✓ Login/logout Supabase Auth com roles `adm` e `vendedor` — v0.1
- ✓ Dashboard admin com ranking de vendedores, KPIs, selector de período e filtro por loja — v0.1
- ✓ Upload de dados CEC (HTML parser) via UploadModal — v0.1
- ✓ Motor de metas (meta1/meta2/meta3 + bonuses configuráveis por vendedor por período) — v0.1
- ✓ Página de vendedor com histórico de evolução (Recharts) — v0.1
- ✓ Portfólio de clientes com recência e frequência (ClientsTab) — v0.1
- ✓ Sistema de convites (email + token) + gestão de usuários — v0.3
- ✓ Módulo RH (ausências, dias livres, férias, permissões) — v0.3
- ✓ Multi-tenant: tabela `tenants` + `tenant_id` em `profiles` — v0.1

### Active

<!-- Escopo do Milestone v1.0 — construindo agora -->

- [ ] Rodar segurança crítica: rotar JWT key, corrigir Site URL Auth, bulk update `app_metadata.role`
- [ ] Deploy Edge Function `send-invite-email` + fluxo de convite e2e funcional
- [ ] Motor de comissão: UI de configuração de regras + engine de cálculo automático por período
- [ ] Workflow de aprovação de comissões (gerente aprova/rejeita por vendedor)
- [ ] Vendedores veem comissão calculada em `meu-resultado`
- [ ] LMS: trilhas → módulos → lições com tracking de progresso
- [ ] Quiz por módulo com aprovação mínima + XP reward
- [ ] Gamificação: display de XP total, nível, badges em `meu-resultado`
- [ ] Export Excel por período (rota `/api/admin/relatorio-excel` já existe, completar)

### Out of Scope

<!-- Não construir neste milestone — com razão para não re-adicionar -->

- Dashboard customizável com widgets (`dashboard_layouts`) — UX muito complexa para v1.0, schema existe para v2.0
- Pipeline vendas v2 (`vendas` + `itens_venda`) — schema existe mas sem parser CEC mapeado, adiar
- Módulo financeiro (`organizations`, `bookings`, `pets`, etc.) — vestígio PetHub no mesmo banco, ignorar até migração
- Relatório de categoria de produto — sem dados de categoria no upload CEC atual

## Context

- **Banco Supabase** `zsczxblhtdhpdqvkpuwz` compartilhado com PetHub (que está inativo) — migrar PetHub para projeto próprio antes de escalar
- 47 usuários em produção, 63.906 registros de venda em `sales_records`
- `comissoes_calculadas` (0 linhas) e `regras_comissao` (0 linhas): schema pronto, engine não rodou ainda
- `trilhas` (1), `modulos` (8), `licoes` (24), `quiz_questoes` (12): conteúdo LMS criado, sem UI
- `gamificacao` (47 linhas): rows criados por trigger, sem display
- Deploy atual: Vercel Hobby (conta `bonguihhsilva`), futuro: Coolify no VPS
- RBAC enum tem 4 roles (`adm`, `vendedor`, `gerente`, `super_admin`) — só adm/vendedor usados no middleware
- Supabase MCP falha em `apply_migration` com frequência — workaround: Edge Functions com `postgres.js`

## Constraints

- **Stack**: Next.js 15.2.4, React 19, TypeScript strict, shadcn/ui, Supabase `@supabase/ssr` — não alterar sem aprovação explícita
- **Banco**: Toda mudança de schema via migration SQL (nunca editar direto)
- **Moeda**: USD padrão, configurável por tenant (USD | BRL | PYG) — nunca hardcodar
- **RLS**: Ativo em todas as tabelas — nunca desabilitar
- **Multi-tenant**: Todas as queries devem filtrar por `tenant_id` — obrigatório desde o início
- **Segurança**: Service role key não deve aparecer em nenhum arquivo commitado

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| URL-driven state (searchParams) para filtros de período e loja | Evita React state global, mantém URLs compartilháveis | ✓ Bom |
| Inline styles com CSS custom properties em vez de Tailwind classes | Design system consistente sem purge complexity | ✓ Bom |
| Server Components fazem fetch direto, sem API layer para leituras | Simplicidade e performance no App Router | ✓ Bom |
| Dois clientes Supabase separados: browser e server | Obrigatório com @supabase/ssr para evitar vazamento de contexto | ✓ Bom |
| Multi-tenant com `tenant_id` em profiles (não em sessions) | Simplicidade para tenant único por usuário, escalável | — Pendente |
| `sales_records` como tabela principal (não `vendas` v2) | Upload CEC já mapeado, migrar seria retrabalho agora | — Pendente |

---
*Last updated: 2026-05-24 — bootstrap GSD para milestone v1.0*
