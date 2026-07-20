# Phase 09: Role compras + telas /dashboard/compras — Context

**Gathered:** 2026-07-19
**Status:** Ready for planning — dependência da Fase 08 RECONCILIADA em 2026-07-20 (ver `<phase08_reconciliation>` no fim; substitui `<phase08_dependencies>`)

<domain>
## Phase Boundary

**Goal:** Dar ao comprador uma área própria (`/dashboard/compras`) sob uma role `compras` dedicada, onde ele decide **o que comprar, quanto comprar e por qual custo** — consumindo as views/RPCs de métricas de inventário criadas na Fase 08 e editando o custo vigente em `product_costs`.

Esta fase é **consumo e controle de acesso**, não modelagem. Todo o cálculo de DoS/WoS, giro, quebra, curva ABC e classificação slow/fast mover pertence à Fase 08. Aqui apenas se lê o resultado, se apresenta, e se escreve custo.

**Fora do escopo:** qualquer view, RPC, tabela, coluna ou fórmula de métrica (Fase 08); ordens de compra / pedidos a fornecedor; cadastro de fornecedores; qualquer recorte de estoque por loja; qualquer série temporal de preço ou margem.

</domain>

<decisions>
## Implementation Decisions

### Role `compras` — schema e identidade

- **D-01:** Adicionar `'compras'` ao `profiles_role_check` via nova migration (`ALTER TABLE profiles DROP CONSTRAINT profiles_role_check; ADD CONSTRAINT ... CHECK (role IN ('vendedor','adm','gerente','super_admin','compras'))`). Não editar `0014_auth_roles.sql` — migrations são imutáveis. A role passa a ser a **5ª** do sistema.
- **D-02:** `compras` é uma role **plana**, sem sub-permissões. Não replicar o modelo de `gerente_permissions` — o gerente tem flags porque acumula funções heterogêneas (RH, comissão, relatórios); o comprador tem um escopo único e coeso. Se surgir a necessidade de "comprador que só lê", vira flag depois.
- **D-03:** Como toda role, `compras` precisa de `app_metadata.role` no JWT **e** `profiles.role` no banco em sincronia — os dois padrões coexistem no projeto (middleware e RLS de `sales_records`/`goals` leem o JWT; RLS de `products`/`stock_snapshots` lê `profiles`). A criação de usuário `compras` deve passar pelo mesmo fluxo de convite existente, e a UI de gestão de usuários deve oferecer `compras` como opção de role.

### O que `compras` PODE e NÃO PODE ver

- **D-04:** `compras` **NÃO vê comissões**, em nenhuma forma. `comissoes_calculadas`, `regras_comissao` e a coluna de comissão de `vendor_summary` ficam fechadas. Justificativa: comissão é remuneração individual — dado de RH/financeiro, não de suprimentos. Um comprador saber quanto cada vendedor ganha não melhora nenhuma decisão de compra e cria exposição desnecessária de dado sensível. A regra é a mesma que já protege `audit_logs` (`adm`/`gerente`/`super_admin` apenas): **`compras` não entra nessa lista**.
- **D-05:** `compras` **NÃO vê performance nominal de vendedor**: nada de ranking de vendedores, metas, `vendor_summary`, `/dashboard/vendedor/[id]`, RH ou LMS. O comprador precisa saber **o que vende**, não **quem vendeu**.
- **D-06:** `compras` **vê dados de venda agregados por produto** — quantidade vendida, receita, margem por `product_code`, derivados de `sale_items`. A leitura é sempre agregada; nenhuma tela de compras expõe `vendor_id` em linha de detalhe. Onde a agregação por loja for possível (venda tem `store`), o recorte por loja é permitido — mas somente em telas de **venda**, nunca de estoque (ver D-24).
- **D-07:** `compras` vê **estoque, custo e catálogo de produtos** integralmente: `stock_snapshots`, `products`, `product_costs` e todas as views de métrica da Fase 08.

### Middleware e roteamento

- **D-08:** Registrar em `ROLE_RULES` (`src/middleware.ts`), respeitando a ordem "prefixo mais específico primeiro":
  - `/dashboard/compras` → `['compras', 'adm', 'gerente', 'super_admin']` — inserido **antes** da regra `/dashboard`
  - `/dashboard` → adicionar `compras`? **Não.** A regra genérica `/dashboard` permanece `['adm','gerente','super_admin']`, de modo que `compras` cai no redirect para qualquer sub-rota não-compras.
- **D-09:** Redirect de fallback: o bloco atual manda `role === 'vendedor'` para `/vendedor/meu-resultado` e todo o resto para `/dashboard`. Isso criaria **loop de redirect** para `compras` (bloqueado em `/dashboard` → redirecionado para `/dashboard` → bloqueado…). O destino de fallback precisa ser resolvido por role, com `compras` → `/dashboard/compras`. É um bug latente que a fase obrigatoriamente corrige.
- **D-10:** Rotas de API de escrita da fase vivem em namespace próprio **`/api/compras/*`**, com regra `{ prefix: '/api/compras', allowed: ['compras','adm','gerente','super_admin'] }`. Não adicionar `compras` à regra `/api/admin` — isso liberaria de uma vez todas as rotas admin existentes (comissão, RH, usuários, convites) no nível do middleware. A única exceção é D-22.
- **D-11:** `Sidebar` (`src/components/ui/Sidebar.tsx`) ganha um terceiro conjunto de links (`comprasLinks`), selecionado como os atuais `adminLinks`/`vendorLinks`. `adm`/`gerente`/`super_admin` ganham um item "Compras" no menu existente. Corrigir de passagem o `links.push()` mutante na branch `super_admin` (muta o array literal do módulo).

### RLS — como estender sem vazar

- **D-12:** Duas famílias de policy convivem no banco e a fase deve tratá-las separadamente:
  - **Tabelas de domínio de compras** (`products`, `stock_snapshots`, nova `product_costs`, views/RPCs da Fase 08): policy de isolamento por tenant via `profiles` — `compras` já é atendido automaticamente, pois a policy só checa `tenant_id`, não role. **Nada a mudar para leitura.**
  - **Tabelas hardened por role via JWT** (`sales_records`, `goals`, `vendor_exclusions`, `audit_logs`, `comissoes_calculadas`): as policies listam explicitamente `('adm','gerente','super_admin')`. **Não adicionar `compras` a nenhuma delas.**
- **D-13:** O acesso de `compras` a dados de venda (D-06) é feito **exclusivamente por view/RPC agregada** da Fase 08, nunca por `SELECT` direto em `sales_records`/`sale_items`. Isso mantém a policy hardened intacta e garante que a agregação (sem `vendor_id`) é a própria fronteira de segurança, e não uma escolha de UI.
- **D-14:** Escrita em `product_costs` exige policy própria com `WITH CHECK` limitando a `('compras','adm','gerente','super_admin')` no padrão JWT já usado no projeto. Vendedor e gerente-sem-permissão não escrevem custo.

### Telas — `/dashboard/compras`

- **D-15:** Estrutura: uma rota-mãe `/dashboard/compras` com **abas** (mesmo padrão de `ClientsTab`/`EvolucaoTab` do dashboard atual), estado dirigido por `searchParams` (padrão URL-driven já validado no projeto). Abas: `Visão Geral` (default) · `Ranking` · `Estoque` · `Curva ABC` · `Preços`.
- **D-16: Visão Geral / alertas de reposição.** Topo com KPIs (valor total em estoque a custo, nº de SKUs, nº em ruptura iminente, nº parados) + a **lista de alertas de reposição** como conteúdo principal. Consome a métrica de cobertura (DoS/WoS) da Fase 08. Decisão do comprador: *o que eu preciso comprar esta semana antes de faltar.*
- **D-17: Ranking de mais vendidos.** Tabela ordenável por quantidade vendida, receita ou margem, com filtro de período e **filtro por loja permitido** (venda tem `store`). Consome a agregação de vendas por produto. Decisão: *quais produtos merecem espaço, verba e negociação de volume com fornecedor.*
- **D-18: Produtos parados (slow movers).** Lista de SKUs com giro abaixo do limiar ou sem venda em N dias, ordenada por **capital imobilizado** (quantidade × custo vigente), não por quantidade — o que dói é dinheiro parado, não peça parada. Decisão: *o que liquidar, remarcar ou parar de comprar.*
- **D-19: Alta rotatividade (fast movers).** Lista de SKUs de maior giro, com cobertura em dias/semanas ao lado. Sobreposição intencional com D-16: fast mover com cobertura baixa é a prioridade máxima de compra. Decisão: *o que nunca pode faltar.*
- **D-20: Curva ABC.** Classificação A/B/C vinda da Fase 08, apresentada como tabela agrupada + indicador de concentração (participação acumulada). Filtro pelo critério de classificação (receita ou margem) se a Fase 08 expuser mais de um. Decisão: *onde concentrar atenção de gestão e capital de giro.*
- **D-21: Visão de estoque.** Tabela mestre de SKUs — código, nome, quantidade atual, custo vigente, valor total, giro, cobertura, classe ABC, data do último snapshot. É a tela de consulta/busca; as demais são recortes opinativos dela. **Sem filtro por loja** (D-24). Decisão: *conferência pontual e ponto de partida para editar custo.*

### Gestão de preços

- **D-22: Edição individual** é o caminho principal: célula de custo editável na aba `Preços` (e atalho a partir da visão de estoque), salvando em `product_costs` via server action em `/api/compras/*`. Um custo vigente por produto por tenant; escrita nova versiona ou substitui conforme o schema definido na Fase 08 (ver `<phase08_dependencies>`).
- **D-23: Edição em massa** reusa a rota **existente** `/api/admin/upload-catalog` (planilha XLSX/HTML), não uma UI nova de bulk-edit. A rota hoje bloqueia `compras` (allowlist `['adm','gerente','super_admin']`) — deve passar a aceitá-la. Como o middleware gateia `/api/admin` inteiro, adicionar uma regra de prefixo **mais específica** `{ prefix: '/api/admin/upload-catalog', allowed: [...,'compras'] }` **antes** da regra `/api/admin` em `ROLE_RULES`. Atualizar catálogo é a função nuclear do comprador; negar isso esvazia a role.
- **D-24: Auditoria de mudança de custo é obrigatória.** Custo alimenta margem, que alimenta comissão por lucro (`goals.commission_type = 'profit'`) — uma edição de custo mexe indiretamente no pagamento de vendedor. Reusar a infra `audit_logs` + `process_financial_audit()` já existente (hoje ligada a `goals` e `comissoes_calculadas`), anexando trigger `AFTER INSERT OR UPDATE OR DELETE` em `product_costs`. Registra quem, quando, valor antigo e novo — sem código novo de auditoria.
- **D-25:** Quem edita custo: `compras`, `adm`, `gerente`, `super_admin`. `vendedor` nunca.

### Permissões de escrita — resumo

- **D-26:** `compras` **pode**: editar `product_costs` (D-22), fazer upload de catálogo (D-23).
- **D-27:** `compras` **não pode**: importar vendas (`/api/admin/parse-upload`), criar/fechar período, calcular ou aprovar comissão, gerenciar usuários ou convites, acessar RH, LMS ou relatórios de vendedor. Nenhuma dessas rotas ganha `compras` na allowlist.

### Claude's Discretion

- Layout visual exato das abas e das tabelas (seguir padrão inline-style + CSS custom properties de `src/app/dashboard/`)
- Limiares default de "produto parado" e "cobertura baixa" — se a Fase 08 já os parametrizar, consumir; senão, constante nomeada no front, nunca número mágico espalhado
- Se `Visão Geral` e `Ranking` merecem paginação server-side ou client-side, conforme volume real de SKUs
- Componentização: reaproveitar ou não `PeriodSelector`/`StoreSelector` existentes
- Ordem de implementação dos planos dentro da fase

</decisions>

<phase08_dependencies>
## Dependências da Fase 08 a confirmar

`.planning/phases/08-*/08-CONTEXT.md` **ainda não existia** quando este documento foi escrito. Tudo abaixo é referência **conceitual**, não nome definitivo. Reconciliar antes de `/gsd-plan-phase 9`; se um nome real divergir, este documento é que se ajusta.

| # | Assumido (conceito) | Shape esperado pelas telas | Consumido por |
|---|---|---|---|
| A | Agregação de vendas por produto e período | `product_code`, `name`, `qty_sold`, `revenue`, `profit`, `store` (opcional) — **sem `vendor_id`** | D-17 (ranking), D-06 |
| B | Métricas de inventário por SKU | `product_code`, `qty_on_hand`, `avg_daily_sales`, `days_of_supply`, `weeks_of_supply`, `turnover` | D-16, D-19, D-21 |
| C | Classificação slow/fast mover | flag ou enum por `product_code` + limiar usado | D-18, D-19 |
| D | Curva ABC | `product_code`, `abc_class` (A/B/C), `cumulative_share`, critério (receita/margem) | D-20 |
| E | Quebra de estoque / ruptura | sinal de ruptura ocorrida ou iminente por SKU | D-16 (alertas) |
| F | Custo vigente | tabela `product_costs` — **nome confirmado** por decisão do dono do projeto; colunas (produto, custo, vigência, autor) **a confirmar** | D-21, D-22, D-24 |
| G | Valor de estoque a custo | agregado tenant-wide (KPI) | D-16 |

**Premissas adicionais assumidas — confirmar:**

1. Todas as métricas são **por tenant, sem dimensão de loja** — consistente com D-10 da Fase 07 e com a decisão travada.
2. As métricas são expostas como **views ou RPCs `SECURITY INVOKER`** sujeitas ao RLS de tenant via `profiles`, e portanto legíveis por `compras` sem policy adicional. Se a Fase 08 usar `SECURITY DEFINER`, D-12/D-13 precisam de revisão de segurança.
3. A agregação de vendas (item A) **não expõe `vendor_id`**. Se expuser, D-13 deixa de ser garantia de segurança e a fase precisa de uma view derivada própria.
4. Métricas são **calculadas on-read** (view), não materializadas por job. Se forem materializadas, as telas precisam exibir a data de atualização.

</phase08_dependencies>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Controle de acesso
- `src/middleware.ts` — `ROLE_RULES`, `GERENTE_PERM_RULES`, `PUBLIC_PREFIXES`, redirect de fallback (D-08/D-09/D-10/D-23)
- `supabase/migrations/0014_auth_roles.sql:11` — `profiles_role_check` atual, base do ALTER de D-01
- `supabase/migrations/20260601000003_hardening_definitivo.sql` — padrão RLS por `app_metadata.role` no JWT (D-12, D-14)
- `supabase/migrations/20260601000005_audit_logs.sql` — `audit_logs` + `process_financial_audit()` a reusar em D-24
- `src/lib/permissions.ts` — `PERMISSION_KEYS` do gerente (referência do que **não** replicar, D-02)

### Schema de produto e venda
- `supabase/migrations/20260626171308_profit_commission.sql` — `products`, `sale_items`, `goals.commission_type` (RLS por `profiles`, D-12)
- `supabase/migrations/20260714000001_api_keys_and_stock_snapshots.sql` — `stock_snapshots` (agregado por tenant, sem loja)
- `src/app/api/admin/upload-catalog/route.ts` — allowlist a estender (D-23)

### Padrões de tela
- `src/app/dashboard/page.tsx`, `src/app/dashboard/ClientsTab.tsx`, `EvolucaoTab.tsx` — abas + `searchParams` + inline style com CSS custom properties
- `src/app/dashboard/PeriodSelector.tsx`, `StoreSelector.tsx` — filtros reusáveis
- `src/components/ui/Sidebar.tsx` — navegação por role (D-11)
- `src/app/dashboard/layout.tsx` — resolução de role no server layout

### Planejamento
- `.planning/phases/07-.../07-CONTEXT.md` — D-09..D-12 (modelo de snapshot, agregação por tenant, custo catálogo-only)
- `.planning/phases/08-.../08-CONTEXT.md` — **ler assim que existir**; seção "Contrato de saída para a Fase 9" substitui `<phase08_dependencies>`
- `.planning/ROADMAP.md` — Fase 9 depende da Fase 8

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `audit_logs` + `process_financial_audit()`: auditoria genérica e imutável já pronta — D-24 é só um `CREATE TRIGGER`
- `upload-catalog`: ingestão de catálogo XLSX/HTML funcionando — resolve edição em massa sem UI nova (D-23)
- Policy `tenant_isolation` de `products`/`stock_snapshots` checa só `tenant_id`: leitura de `compras` já funciona sem mudança
- `PeriodSelector` / `StoreSelector` / padrão de abas por `searchParams`: telas novas não partem do zero

### Established Patterns
- Role vem do JWT no middleware (sem query ao banco) e de `profiles` no RLS de tabelas de produto — **os dois precisam estar sincronizados** para `compras` (D-03)
- `ROLE_RULES` é avaliado por `find` na ordem do array: prefixo específico precisa vir antes do genérico (comentário já no topo do arquivo)
- Server Components leem Supabase direto; API routes só para escrita
- Envelope `{ error }` / `NextResponse.json` nas rotas admin

### Integration Points
- Nova migration: `profiles_role_check` + policy de escrita em `product_costs` + trigger de auditoria
- `src/middleware.ts`: 2 regras novas em `ROLE_RULES` + correção do fallback de redirect
- `src/components/ui/Sidebar.tsx`: terceiro conjunto de links
- `src/app/api/admin/upload-catalog/route.ts`: allowlist
- Novo diretório `src/app/dashboard/compras/` e `src/app/api/compras/`
- UI de gestão de usuários: `compras` como opção de role

### Riscos técnicos já identificados no código
- Redirect de fallback do middleware assume só 2 destinos (`vendedor` vs. resto) — quebra com a 5ª role (D-09)
- `Sidebar` faz `links.push()` sobre array declarado no escopo do módulo — mutação acumulativa entre renders
- Regra `/api/admin` é grosseira: qualquer role adicionada ali ganha comissão, RH e usuários junto (D-10)

</code_context>

<specifics>
## Specific Ideas

- O comprador é o primeiro usuário do sistema cujo trabalho é **decidir gasto**, não medir receita. As telas devem responder a "compro ou não compro", não "quanto vendemos".
- Ordenar produtos parados por capital imobilizado (e não por quantidade) é o que transforma a lista em decisão financeira.
- Fast mover com cobertura baixa é o alerta mais valioso do sistema — deve ser o primeiro elemento visível na Visão Geral.
- Visão SaaS: `compras` é a primeira role de "departamento" do produto — o padrão de isolamento adotado aqui (namespace de API próprio + leitura só via view agregada) vira o molde para roles futuras.

</specifics>

<deferred>
## Deferred Ideas

- **Ordens de compra / pedido a fornecedor** — a fase para de decidir; executar a compra é produto próprio
- **Cadastro e performance de fornecedores** (lead time, OTIF) — pré-requisito para sugestão automática de quantidade de compra
- **Sugestão automática de quantidade a comprar** (ponto de pedido = cobertura × lead time) — depende de lead time por fornecedor
- **Alertas por email/push** — MVP é in-app (D-16); notificação ativa quando houver demanda comprovada
- **Sub-permissões de `compras`** (ex.: leitura sem direito de editar custo) — role plana no MVP (D-02)
- **Histórico de custo/margem no tempo** — decisão travada: não existe nesta fase
- **Estoque por loja** — decisão travada; herda o deferimento de D-10 da Fase 07
- **Exportação XLSX/PDF das telas de compras** — reusar a infra da Fase 06 quando pedido

</deferred>

<risks>
## Riscos / Questões Abertas

1. **Bloqueio duro na Fase 08.** Sem os nomes e o shape reais das views/RPCs, nenhum plano de tela é executável. `<phase08_dependencies>` deve ser reconciliado com `08-CONTEXT.md` **antes** de `/gsd-plan-phase 9`. Risco alto, mitigação conhecida.
2. **Vazamento por view mal desenhada.** Se a agregação de vendas da Fase 08 carregar `vendor_id`, `compras` passa a ver performance individual pela porta dos fundos (D-13). Verificar a definição da view, não confiar na UI.
3. **Loop de redirect no middleware.** D-09 é pré-requisito de qualquer tela: sem corrigir o fallback, o usuário `compras` não consegue entrar em lugar nenhum. Deve ser o primeiro plano da fase, com teste explícito.
4. **Dessincronia `app_metadata.role` × `profiles.role`.** Já mordeu o projeto na Fase 01 (bulk update dos 47 usuários). Um usuário `compras` com JWT desatualizado passa no RLS e é barrado no middleware — ou o inverso, pior. Validar os dois caminhos no UAT.
5. **`compras` com poder de mexer em comissão indiretamente.** Editar custo altera margem, que altera comissão por lucro. A auditoria (D-24) registra, mas não impede. Questão aberta: **edição de custo deve ser bloqueada em período com comissão já aprovada?** As comissões aprovadas são imutáveis por policy (`fix_vuln04`), mas o custo que as originou não é. Decisão do dono do projeto necessária.
6. **Granularidade de `product_costs` indefinida.** Se o custo for por período (como `products` hoje, que tem `period_id` no UNIQUE) em vez de vigente-único, a UI de edição muda de forma. Depende do schema da Fase 08.
7. **Volume de SKUs desconhecido.** Nenhuma medição de quantos produtos distintos existem no catálogo real. Se forem dezenas de milhares, as tabelas precisam de paginação server-side desde o primeiro plano, não como refinamento.
8. **Regra `/api/admin/upload-catalog` (D-23) depende da ordem do array.** Se alguém reordenar `ROLE_RULES` depois, `compras` perde silenciosamente o acesso ao upload. Vale um teste de middleware que fixe o comportamento.

</risks>

<phase08_reconciliation>
## Reconciliação com a Fase 08 (2026-07-20) — NORMATIVA

O `08-CONTEXT.md` existe e seu `<contract>` é autoritativo. Esta seção **substitui `<phase08_dependencies>`** acima e corrige decisões deste doc onde divergiram. Onde este bloco conflitar com D-01..D-27 acima, este bloco vence.

### Nomes reais das views/RPCs (troca a tabela A–G assumida)

| Consumo (telas D-16..D-21) | Artefato real da Fase 08 | Observações |
|---|---|---|
| Métricas por SKU (estoque, DoS, WoS, giro, cobertura, quebra, movimento) | view `product_inventory_metrics` | uma linha por `(tenant_id, product_code)` |
| Ranking de mais vendidos COM loja (D-17) | view `product_sales_ranking` | tem `store`; **única** com loja |
| Curva ABC (D-20) | view `product_abc_curve` | base única = lucro, com fallback receita |
| Série p/ sparkline de 1 produto | RPC `product_stock_history(p_tenant_id, p_product_code, p_days)` | |
| KPIs de topo (D-16) | RPC `inventory_summary(p_tenant_id)` | total_skus, total_stock_value, skus_em_quebra, skus_parados, etc. |
| Edição de custo (D-22) | tabela `product_costs (tenant_id, product_code, unit_cost, name, source, updated_at)` | |

**Colunas-chave a usar (não os nomes conceituais antigos):** `current_qty` (não `qty_on_hand`), `ads` (não `avg_daily_sales`), `dos`/`wos` (não `days_of_supply`), `movement_class` ∈ `{fast,normal,slow,dead,NULL}`, `abc_class` ∈ `{A,B,C}`, `stock_status` ∈ `{ok,stale,unknown}`, `has_cost`, `stock_value`.

### Correção D-12/D-13 — RLS NÃO é a fronteira de tenant

As views da Fase 08 são `REVOKE ALL FROM anon, authenticated` + `GRANT SELECT TO service_role` (D-21 da Fase 08, padrão `vendor_summary`) — **não** são `SECURITY INVOKER` sob RLS de `profiles`, como este doc assumiu na premissa 2.

Consequências obrigatórias:
- Leitura das views/RPCs de compras é via `createAdminClient()` **com `.eq('tenant_id', profile.tenant_id)` explícito e obrigatório em toda query**. O isolamento de tenant é responsabilidade do código, não do RLS. Um `SELECT` sem o filtro vaza todos os tenants.
- D-12 deste doc ("`compras` já é atendido automaticamente pela policy de tenant") vale só para as **tabelas** (`products`, `stock_snapshots`, `product_costs`), não para as **views** — que nem passam por RLS.
- D-13 sobrevive e fica **mais forte**: `product_inventory_metrics`, `product_abc_curve` e `product_sales_ranking` não têm coluna `vendor_id`. O comprador não vê performance individual porque a coluna não existe — garantia estrutural, não de UI.

### Correção D-20 (curva ABC) — sem filtro de critério

A Fase 08 entrega base **única** (lucro, com fallback auditável para receita via coluna `abc_basis`), não dois critérios selecionáveis. A tela D-20 exibe `abc_class`, `cum_pct` e `abc_basis` (para o usuário ver quando um item caiu no fallback de receita). **Não** há toggle receita/margem.

### Correção D-22 / risco 6 — granularidade de custo RESOLVIDA

`product_costs` é **vigente-único**: PK `(tenant_id, product_code)`, sem `period_id`. UPDATE de `unit_cost` substitui o valor (não versiona). Ao escrever pela UI de compras, gravar `source='manual'` — a regra de precedência D-03 da Fase 08 impede que um upload de catálogo (`source='catalog'`) sobrescreva um custo editado à mão. Risco 6 deste doc encerrado.

### Decisões do dono do projeto (2026-07-20)

- **Risco 5 (editar custo em período com comissão aprovada):** decisão = **só auditar, não bloquear**. O trigger de D-24 registra a mudança; nenhuma trava impede a edição. Se virar problema real, cria-se a regra depois. Não implementar bloqueio nesta fase.
- **Filtro de loja no ranking (D-17):** **mantido** — consome `product_sales_ranking` (que tem `store`). Estoque (D-21) e todas as métricas de inventário continuam sem loja. A fronteira: loja aparece só em telas de venda.

### Premissa 4 (materialização) — confirmada

Métricas são calculadas **on-read** (views/RPCs), não materializadas por job. Sem necessidade de exibir "data de atualização" além de `last_snapshot_date`, que já vem por SKU em `product_inventory_metrics`.

### Ainda aberto (não bloqueia planejamento)

- **Volume de SKUs** (risco 7): sem medição. Se o catálogo real tiver dezenas de milhares de produtos, paginação server-side nas tabelas (D-17, D-21) é requisito do primeiro plano, não refinamento. Verificar no início do `/gsd-plan-phase 9` com um `COUNT(DISTINCT product_code)`.

</phase08_reconciliation>

---

*Phase: 09-role-compras-telas-dashboard-compras*
*Context gathered: 2026-07-19 · Reconciled: 2026-07-20*
