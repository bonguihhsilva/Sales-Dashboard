# Campanha de Verificação — GDS Dashboard (2026-06-03)

> Objetivo: fechar todas as pendências p/ go-live interno + abertura SaaS na **segunda 2026-06-08**.
> Escopo aprovado: **Ambos** (interno + SaaS) · **Descobrir tudo** · **Achar+corrigir+commitar**.

## Estado real (auditado via Supabase MCP + git)
- Build `npm run build`: **VERDE** (exit 0)
- Segurança (advisor): só 3 lints — cross-tenant REST **já fechado** (P0 2026-06-01)
- Metas: **OK** — `meta1_zero=0` em todos os períodos (blocker do ESTADO resolvido)
- Tenants: GDS Interno (plataforma) · **Star Company** (cliente real, 59.363 vendas) · Loja Demo (120)
- Usuários: Star = 1 adm · Demo = adm+gerente+vendedor · plataforma = 1 super_admin
- `gerente_permissions`: vocabulário pronto, falta enforcement

## Achados priorizados

### P0 — bloqueia segunda
| # | Achado | Track | Ação |
|---|--------|-------|------|
| P0-1 | 3 arquivos WIP não-commitados (redesign metas incompleto) | A | Finalizar padronização OU isolar; chegar a working tree limpo |
| P0-2 | Star Company sem período de **Junho** (go-live é Junho) | C | MANUAL usuário: criar período + metas + upload CEC Junho |
| P0-3 | Engine RBAC gerente não enforçada (gerente ≈ adm) | Feature | Construir enforcement de gerente_permissions (SaaS-crítico) |
| P0-4 | UAT por papel no deploy real não confirmado pós-últimos commits | D | Playwright em todos os papéis |

### P1 — bug visível / qualidade
| # | Achado | Track |
|---|--------|-------|
| P1-1 | ~22 arquivos misturam header inline antigo vs `<PageHeader>` (inconsistência visual) | E |
| P1-2 | Clareza do motor de comissão: tabelas `regras_comissao`/`comissoes_calculadas` vazias vs `goals.commission_pct` | F |
| P1-3 | `vendor_evolution` SECURITY DEFINER WARN — confirmar authz interna | B |
| P1-4 | Upload CEC com arquivo real (precisa amostra do usuário) | D |

### P2 — performance / limpeza
| # | Achado | Track |
|---|--------|-------|
| P2-1 | Perf RLS: 70 Multiple Permissive Policies + 45 Auth RLS InitPlan + 45 FK sem índice | B |
| P2-2 | Tabelas legadas mortas: `vendas`/`itens_venda`/`produtos`/`categorias`/`comissoes_calculadas`/`regras_comissao` (0 linhas) | C |
| P2-3 | Leaked Password Protection desligado (toggle manual) | B |

### P3 — pós-launch
- Sentry DSN · drop completo do schema legado · meta2/meta3 audit completo

## Checklist manual (só o usuário faz)
- [ ] Criar período Junho/2026 p/ Star + setar metas (`/dashboard/metas`) + upload CEC Junho
- [ ] Verificar `SUPABASE_SERVICE_ROLE_KEY` no Vercel
- [ ] Toggle Leaked Password Protection (Supabase Auth)
- [ ] Reverter `guisilvafoz@gmail.com` super_admin→adm
- [ ] Convidar vendedores reais da Star (ou confirmar go-live adm-only)

## Ferramentas por track
A: Bash/build · B: Supabase advisors + semgrep + /security-review · C: Supabase execute_sql + apply_migration · D: Playwright MCP + get_logs · E: Playwright screenshots + /gsd-ui-review · F: /gsd-code-review + coderabbit · Feature: edição direta + migration

## Achados UAT no deploy (2026-06-03, demo adm via Playwright)
- **RBAC gerente = adm (P0 confirmado em código):** `middleware.ts` libera gerente em todo `/dashboard` e `/api/admin`. `gerente_permissions` (gerenciar_usuarios/aprovar_comissoes=false etc.) NÃO enforçado. Gerente de cliente teria poder de adm. → engine deve enforçar os flags
- **Navegação dupla + idioma misto (P1):** `TopNavBar.tsx` (top, EN: "Learning"/"HR Panel") coexiste com sidebar (PT: "Treinamentos"/"Recursos Humanos"). Redundante e inconsistente
- **Console erro (P2):** `Invalid Refresh Token: Refresh Token Not Found` + 400 em `/auth/v1/token` no load → possível logout aleatório/instabilidade de sessão
- **favicon.ico 404 (P3)**
- **Isolamento de tenant OK (✓):** demo adm vê só lojas demo (Loja Centro/Online/Shopping), não Jebai/Pajé da Star
- Token foundation (Wave 1) já corrige muted/destructive/accent app-wide quando deployado

## Wave 1 — FEITO (branch fix/verificacao-2026-06-03)
- commit `3ded881` tokens shadcn completos · `f644b80` metas edit + PageHeader · `73e5a22` doc

## Log de execução
- 2026-06-03: diagnóstico completo; board criado; metas e cross-tenant confirmados resolvidos.
- 2026-06-03: Wave 1 commitada (tokens + metas). UAT adm no deploy → achados acima. RBAC gerente confirmado como P0.
