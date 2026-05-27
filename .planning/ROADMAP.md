# Roadmap: GDS Dashboard v2 + LMS

## Overview

O GDS Dashboard evoluiu de um leitor de ranking para uma plataforma completa de gestão comercial. Este milestone (v1.0) fecha as lacunas críticas: segurança pendente do auth, motor de comissão que ancora o valor do produto, LMS que entrega o "learn to sell more" para os vendedores, e exports que os gerentes precisam no fim do mês.

## Milestones

- 🚧 **v1.0 Ferramenta Escalável** — Phases 01–04 (em progresso)

## 🚧 v1.0 Ferramenta Escalável (Em progresso)

**Milestone Goal:** Plataforma confiável com motor de comissão operacional, LMS funcional e exports — pronta para onboarding de novos tenants.

---

### Phase 01: Segurança & Estabilidade

**Goal**: Resolver pendências críticas de segurança e fechar o UAT de auth — base sólida antes de construir features.
**Depends on**: Nada (primeira fase)
**Success Criteria** (what must be TRUE):
  1. JWT service role key rotada — chave antiga inválida
  2. Site URL Supabase apontando para `https://dashboard.gds-frame.com` (não localhost)
  3. Todos os 47 usuários com `app_metadata.role` correto no Supabase Auth
  4. Edge Function `send-invite-email` deployada e funcional
  5. Fluxo completo de convite (gerar → email → aceitar → login) testado e2e
**Plans**: 2 planos

Plans:
- [x] 01-01: Segurança crítica (JWT, Site URL, bulk update roles)
- [x] 01-02: Edge Function invite + UAT fluxo convite e2e

---

### Phase 02: Motor de Comissão

**Goal**: Gerentes configuram regras de comissão, o sistema calcula automaticamente ao fechar o período, e gerentes aprovam antes do pagamento.
**Depends on**: Phase 01
**Success Criteria** (what must be TRUE):
  1. Gerente configura pelo menos uma regra em `regras_comissao` via UI
  2. Ao fechar período, `comissoes_calculadas` é populado para todos os vendedores do período
  3. Gerente pode aprovar ou rejeitar comissão individual de cada vendedor
  4. Vendedor vê comissão calculada (base + bônus) em `meu-resultado`
  5. Comissões aprovadas ficam imutáveis (sem edição após aprovação)
**Plans**: 4 planos

Plans:
- [x] 02-01: UI configuração de regras_comissao (tiers, percentuais, bonuses por meta)
- [x] 02-02: Engine de cálculo (SQL function/Edge Function → popula comissoes_calculadas)
- [x] 02-03: Workflow de aprovação (gerente aprova/rejeita por vendedor, histórico)
- [x] 02-04: Display comissão em meu-resultado + dashboard admin

---

### Phase 03: LMS / Treinamento

**Goal**: Vendedores acessam trilhas de treinamento, fazem quiz por módulo e acumulam XP/badges visíveis em seu perfil.
**Depends on**: Phase 01
**Success Criteria** (what must be TRUE):
  1. Vendedor vê lista de trilhas disponíveis e progresso de cada módulo
  2. Vendedor completa lição e o progresso é salvo em `progresso_usuario`
  3. Vendedor faz quiz e vê resultado (aprovado/reprovado com nota mínima)
  4. XP é creditado em `gamificacao` após módulo aprovado
  5. Vendedor vê XP total, nível e badges em `meu-resultado`
**Plans**: 3 planos

Plans:
- [x] 03-01: Trilhas viewer + progresso tracking (lista trilhas → módulos → lições)
- [x] 03-02: Quiz flow (questões, resultado, aprovação mínima, XP reward)
- [x] 03-03: Gamificação display (XP, nível, badges, streak no meu-resultado)

---

### Phase 04: Relatórios & Export

**Goal**: Gerentes exportam dados consolidados para Excel por período e visualizam sumário de comissões aprovadas.
**Depends on**: Phase 02
**Success Criteria** (what must be TRUE):
  1. Botão "Exportar Excel" no dashboard gera arquivo `.xlsx` com vendas do período selecionado
  2. Export inclui: vendedor, loja, total vendido, meta atingida, bônus, comissão calculada
  3. Gerente vê tabela de comissões aprovadas com total a pagar por período
**Plans**: 2 planos

Plans:
- [x] 04-01: Export Excel por período (completar rota `/api/admin/relatorio-excel`)
- [x] 04-02: Tabela de comissões aprovadas por período (sumário financeiro)

---

### Phase 05: Portal de Gestão do LMS (CMS)

**Goal**: Criar interface administrativa para o gerente cadastrar trilhas, módulos, aulas e testes diretamente pelo painel.
**Depends on**: Phase 03
**Success Criteria** (what must be TRUE):
  1. ADM tem acesso a `/dashboard/treinamentos`
  2. Pode criar Trilhas, Módulos, Lições e Questões pela UI sem acessar banco
**Plans**: 1 plano

Plans:
- [x] 05-01: Mini-CMS LMS completo integrado com as rotas.

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 01. Segurança & Estabilidade | 2/2 | Complete | - |
| 02. Motor de Comissão | 4/4 | Complete | - |
| 03. LMS / Treinamento | 3/3 | Complete | - |
| 04. Relatórios & Export | 2/2 | Complete | - |
| 05. Portal LMS (CMS) | 1/1 | Complete | - |
