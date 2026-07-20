# Phase 08: Schema de inventário + métricas de estoque — Context

**Gathered:** 2026-07-19
**Status:** Ready for planning

<domain>
## Phase Boundary

**Goal:** Transformar os snapshots diários de estoque (Fase 07) e o histórico de vendas por item em um conjunto de métricas de inventário consultáveis — DoS, WoS, giro, cobertura, quebra de estoque, classificação de movimentação e curva ABC — expostas como views/RPCs no Postgres, mais a tabela `product_costs` que fornece o custo vigente por produto.

Esta fase é **exclusivamente camada de dados**: uma tabela nova (`product_costs`), uma tabela de configuração (`inventory_settings`), views SQL, RPCs e índices. Zero UI, zero rota de API, zero mudança de comportamento de ingest.

O consumidor imediato é a Fase 09 (role compras, telas `/dashboard/compras`, ranking de produtos, alertas de reposição). O contrato de saída está formalizado abaixo em `<contract>` — a Fase 09 é planejada em paralelo contra ele.

**Fora do escopo (exclusões explícitas):**
- **Granularidade de loja no ESTOQUE.** Mantém D-10 da Fase 07: estoque é agregado por tenant. Nenhuma coluna `store` em `stock_snapshots`, em `product_inventory_metrics`, em `product_daily_sales` ou em qualquer view de métrica de inventário desta fase. Reposição inter-loja, transferência entre lojas e alerta por loja não existem. (Exceção deliberada e restrita: a view de **ranking de VENDAS** `product_sales_ranking` — D-23/contrato — carrega `store`, porque venda tem loja na origem e a Fase 09 D-17 filtra ranking por loja. Isso é dado de venda, não de estoque, e nunca cruza com quantidade em estoque.)
- **Histórico de preço.** Nenhuma tabela `price_history`, nenhuma versionagem de `sale_price`. Preço continua sobrescrito por período em `products`.
- **Mudança de semântica de `products`.** A tabela `products` (PK `(tenant_id, period_id, product_code)`) permanece sendo o snapshot histórico de catálogo por período que alimenta o motor de comissão por lucro. Nada nesta fase altera suas colunas, sua chave ou a forma como `sale_items.unit_cost` é gravado.
- Qualquer UI, componente, página ou rota (Fase 09).
- Alertas, notificações, sugestão de compra, ponto de pedido, lead time de fornecedor (Fase 09 ou posterior).
- Role `compras` e RBAC associado (Fase 09).
- Backfill/limpeza das tabelas legadas `produtos`/`categorias` — são schema morto, nenhuma tela lê, nada é construído em cima delas.

</domain>

<decisions>
## Implementation Decisions

### Schema: custo vigente

- **D-01:** Nova tabela `product_costs` com o **custo vigente** por produto, sem `period_id`:
  ```
  product_costs (
    tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_code  text NOT NULL,
    unit_cost     numeric(12,2),          -- NULL permitido = custo desconhecido
    name          text,                   -- nome corrente do produto (display)
    source        text NOT NULL DEFAULT 'catalog',  -- 'catalog' | 'manual' | 'api'
    updated_at    timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, product_code)
  )
  ```
  PK composta `(tenant_id, product_code)` — um custo vigente por produto por tenant, sem dimensão temporal. `unit_cost` é nullable de propósito (ver D-16).

- **D-02:** RLS habilitada em `product_costs` com a policy `tenant_isolation`, idêntica em forma à de `products`/`stock_snapshots`:
  ```sql
  ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "tenant_isolation" ON product_costs
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())));
  ```
  Wrapper `(SELECT auth.uid())` obrigatório — é o padrão de initplan já adotado no projeto (`20260603000022_perf_rls_initplan_wrap_auth_calls.sql`).

- **D-03:** `product_costs` é populada por **upsert derivado do catálogo**: a rota existente `upload-catalog` passa a gravar em `products` (como hoje, por período) **e** fazer upsert em `product_costs` com o custo do arquivo mais recente. Regra de precedência: `source='manual'` nunca é sobrescrito por `source='catalog'`; `catalog` sobrescreve `catalog` e `api`. Nenhum backfill automático de períodos antigos — `product_costs` nasce do próximo upload; um script de seed único a partir do `products` do período mais recente é aceitável no plano.

- **D-04:** **`products` não muda.** Nenhum ALTER, nenhuma coluna nova, nenhuma alteração de PK. As métricas de inventário desta fase usam exclusivamente `product_costs.unit_cost` como custo. `sale_items.unit_cost` (custo congelado no momento da venda) continua sendo a fonte de custo para lucro histórico e comissão — as duas fontes coexistem e servem propósitos diferentes.

### Schema: configuração de thresholds

- **D-05:** Nova tabela `inventory_settings`, **uma linha por tenant**, com todos os thresholds das métricas configuráveis e valores DEFAULT no schema:
  ```
  inventory_settings (
    tenant_id            uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    sales_window_days    integer NOT NULL DEFAULT 30,   -- janela curta (ADS, DoS, WoS, quebra)
    long_window_days     integer NOT NULL DEFAULT 90,   -- janela longa (giro, ABC, slow-mover)
    fast_mover_dos_max   numeric NOT NULL DEFAULT 15,   -- DoS abaixo disso = fast
    slow_mover_dos_min   numeric NOT NULL DEFAULT 120,  -- DoS acima disso = slow
    dead_stock_days      integer NOT NULL DEFAULT 90,   -- zero venda nesse período + estoque > 0 = parado
    stale_snapshot_days  integer NOT NULL DEFAULT 7,    -- snapshot mais velho que isso = 'stale'
    abc_cut_a            numeric NOT NULL DEFAULT 0.80,
    abc_cut_b            numeric NOT NULL DEFAULT 0.95,
    updated_at           timestamptz NOT NULL DEFAULT now()
  )
  ```
  RLS `tenant_isolation` igual a D-02.

- **D-06:** **Ausência de linha em `inventory_settings` não quebra nada.** Todas as views fazem `LEFT JOIN inventory_settings` e aplicam `COALESCE(setting, <default literal>)`. Um tenant sem configuração recebe exatamente os defaults de D-05. Nenhuma UI de edição desses valores nesta fase (Fase 09 ou posterior); a linha é criada por SQL/seed quando o tenant quiser divergir do padrão.

### Fonte de dados: venda diária por produto

- **D-07:** A série de venda diária por produto **não existe hoje**: `sale_items` tem `period_id` mas não tem `sale_date`. A ligação canônica é `sale_items.order_id = sales_records.order_ref` dentro do mesmo `tenant_id`. Verificado: tanto o upload CEC (`parse-upload/route.ts`) quanto a API pública (`api/v1/sales/route.ts`) gravam `order_ref` em `sales_records` e o mesmo valor em `sale_items.order_id`.

- **D-08:** Criar a view base `product_daily_sales`, que materializa logicamente essa junção e é o insumo de todas as métricas de velocidade:
  ```
  product_daily_sales (tenant_id, product_code, sale_date, qty_sold, revenue, cogs, profit)
  ```
  `cogs` e `profit` vêm de `sale_items.unit_cost`/`total_profit` (custo congelado da venda), **não** de `product_costs` — lucro realizado não é reescrito por mudança de custo vigente. Linhas de `sale_items` sem `sales_records` correspondente (order_ref órfão) são **excluídas** da view; a contagem de órfãos é uma métrica de saúde a verificar no plano.

- **D-09:** **Não usar `period_id` como proxy de data.** Todas as janelas são em dias corridos a partir de `CURRENT_DATE`, não em períodos. Períodos são mensais e uma janela de 30 dias cruza fronteira de período com frequência; ancorar em `period_id` distorceria DoS no início de cada mês.

### Definição matemática das métricas

Notação: `W` = `sales_window_days` (default 30), `L` = `long_window_days` (default 90), `D0` = `CURRENT_DATE`.

- **D-10 — ADS (Average Daily Sales):**
  ```
  ADS_W = SUM(qty_sold) sobre sale_date ∈ [D0 - W, D0) / W
  ```
  Denominador é **W fixo**, não o número de dias com venda. Dias de venda zero (inclusive dias de quebra) puxam o ADS para baixo — é o comportamento correto para dimensionar reposição. `ADS_W = 0` quando não houve venda alguma na janela.

- **D-11 — DoS (Days of Supply) e WoS (Weeks of Supply):**
  ```
  DoS = current_qty / ADS_W          -- NULL quando ADS_W = 0
  WoS = DoS / 7                      -- NULL quando DoS é NULL
  ```
  `current_qty` = `quantity` do snapshot mais recente do produto (D-17). `ADS_W = 0` produz **NULL, nunca infinito e nunca 0** — semanticamente "cobertura indeterminada, produto sem giro". A Fase 09 trata NULL como categoria própria na UI. DoS é arredondado a 1 casa decimal na view.

- **D-12 — Giro de estoque (inventory turnover):**
  ```
  COGS_L        = SUM(cogs) sobre sale_date ∈ [D0 - L, D0)
  avg_inventory = AVG(quantity * product_costs.unit_cost) sobre os snapshots diários em [D0 - L, D0)
  turnover_L    = COGS_L / NULLIF(avg_inventory, 0)
  turnover_anual = turnover_L * (365.0 / L)
  ```
  Média de estoque é a média dos **snapshots existentes** na janela (não interpolação de dias faltantes). Produto sem `unit_cost` → `avg_inventory` NULL → `turnover` NULL (D-16).

- **D-13 — Cobertura:**
  Neste sistema **cobertura ≠ DoS**. Cobertura é métrica de **nível de serviço**, não de duração de estoque:
  ```
  dias_com_snapshot   = COUNT(snapshots) em [D0 - W, D0)
  dias_com_estoque    = COUNT(snapshots com quantity > 0) em [D0 - W, D0)
  cobertura_pct       = dias_com_estoque / NULLIF(dias_com_snapshot, 0)
  ```
  Resposta a "em que fração dos dias observados eu tinha o produto para vender". A duração em dias/semanas é DoS/WoS (D-11) e não deve ser renomeada como cobertura em nenhuma view ou tela.

- **D-14 — Quebra de estoque (stockout):**
  Como só existe snapshot diário de posição (sem movimentações), quebra é definida **no nível do dia observado**:
  - Um dia conta como quebra para o produto P quando **existe** snapshot daquele dia e `quantity <= 0`.
  - Dia **sem snapshot** é desconhecido: não entra no numerador nem no denominador. Nunca é presumido como quebra.
  ```
  stockout_days_W  = COUNT(snapshots com quantity <= 0) em [D0 - W, D0)
  stockout_rate_W  = stockout_days_W / NULLIF(dias_com_snapshot, 0)
  is_stockout_now  = (quantity do snapshot mais recente) <= 0
  ```
  `is_stockout_now` só é confiável se o snapshot mais recente não estiver stale — a Fase 09 deve ler `stock_status` junto (D-17).

- **D-15 — Classificação de movimentação (`movement_class`):**
  Coluna única com quatro valores, avaliados nesta ordem de precedência:
  1. `'dead'`  — `qty_sold` em `[D0 - dead_stock_days, D0)` = 0 **e** `current_qty > 0`. Estoque parado: capital imobilizado sem giro.
  2. `'slow'`  — `DoS` NÃO nulo e `DoS >= slow_mover_dos_min` (default 120).
  3. `'fast'`  — `DoS` NÃO nulo e `DoS <= fast_mover_dos_max` (default 15).
  4. `'normal'` — demais casos com dados suficientes.
  Produto sem estoque conhecido e sem venda na janela longa → `NULL` (indeterminado), não `'dead'`. Todos os cortes vêm de `inventory_settings` (D-05), portanto **configuráveis por tenant**.

- **D-16 — Curva ABC:**
  - **Critério: lucro bruto acumulado** na janela longa `L` (default 90 dias), usando `profit` de `product_daily_sales` (custo congelado da venda). Justificativa: o produto já tem motor de comissão por lucro (`goals.commission_type = 'profit'`, `sale_items.total_profit`); classificar compras por receita premiaria produtos de alto faturamento e margem irrisória, contradizendo a lógica comercial já implementada.
  - **Fallback:** produtos sem `total_profit` utilizável (custo ausente na venda) entram pela **receita** e são marcados com `abc_basis = 'revenue'`; os demais com `abc_basis = 'profit'`. A coluna torna o fallback auditável na UI da Fase 09 em vez de silencioso.
  - **Cortes:** ordena desc por métrica, calcula percentual acumulado sobre o total do tenant:
    - `cum_pct <= abc_cut_a` (0.80) → `'A'`
    - `cum_pct <= abc_cut_b` (0.95) → `'B'`
    - resto → `'C'`
  - Produto com métrica `<= 0` (sem venda ou prejuízo na janela) → `abc_class = 'C'`, `rank` no fim da lista. Cortes configuráveis por tenant (D-05).

### Buracos de dados

- **D-17 — Produto sem snapshot recente:** toda linha de `product_inventory_metrics` carrega `last_snapshot_date`, `snapshot_staleness_days` (`D0 - last_snapshot_date`) e `stock_status`:
  - `'ok'`      — `staleness <= stale_snapshot_days` (default 7)
  - `'stale'`   — snapshot existe mas é mais velho que o limite. `current_qty`, `DoS` e `WoS` **continuam sendo calculados** a partir do último valor conhecido, e a Fase 09 os exibe com marcação de desatualizado. Nunca zerar silenciosamente.
  - `'unknown'` — nenhum snapshot jamais recebido. `current_qty`, `DoS`, `WoS`, `stock_value` = NULL.
  Produtos que só têm venda e nunca tiveram snapshot **aparecem** na view com `stock_status = 'unknown'` — a Fase 09 usa isso para listar produtos vendidos mas fora do inventário reportado.

- **D-18 — Produto sem custo cadastrado:** `has_cost boolean` na view. Quando `product_costs.unit_cost` é NULL ou ausente, todas as métricas monetárias derivadas (`stock_value`, `turnover_L`, `turnover_anual`) são **NULL, nunca 0**. Métricas de quantidade (`current_qty`, `ADS`, `DoS`, `WoS`, `cobertura_pct`, `stockout_*`, `movement_class`) continuam válidas. Zero e "desconhecido" jamais colapsam no mesmo valor.

- **D-19 — Universo de produtos da view:** `product_inventory_metrics` é a **união** dos `product_code` presentes em (a) snapshots dentro da janela longa, (b) vendas dentro da janela longa, (c) `product_costs`. Um produto nunca some da análise por faltar em uma das três fontes. `name` resolvido por `COALESCE(product_costs.name, products.name mais recente, product_code)`.

### Onde cada métrica é calculada

- **D-20 — Tudo em SQL (views + RPC), nada em TypeScript.** Justificativa: o dashboard lê Supabase direto em Server Components, sem camada de API de leitura (decisão registrada em PROJECT.md). Calcular em TS exigiria trafegar toda a série de snapshots e `sale_items` até o servidor Next a cada render — com 63k+ registros de venda e um snapshot por produto por dia, é inviável. Agregar no Postgres devolve uma linha por produto.
  - **Views** (`product_daily_sales`, `product_inventory_metrics`, `product_abc_curve`): tudo que é "uma linha por produto, sem parâmetro". Views são composáveis e filtráveis com `.eq()/.order()/.limit()` do supabase-js, o que a Fase 09 precisa para ranking e paginação.
  - **RPCs** (`product_stock_history`, `inventory_summary`): tudo que precisa de **parâmetro variável** (código do produto, número de dias) ou que retorna um agregado escalar do tenant. View não aceita parâmetro; RPC sim.
  - **TypeScript** fica apenas com formatação de exibição (`fmtCurrency`, arredondamento visual) na Fase 09.

- **D-21 — Segurança das views:** seguir exatamente o padrão de `vendor_summary` (`20260601000019_p0_security_closeout.sql`):
  ```sql
  REVOKE ALL ON public.<view> FROM anon, authenticated;
  GRANT SELECT ON public.<view> TO service_role;
  ```
  As leituras da Fase 09 usam `createAdminClient()` **com `.eq('tenant_id', profile.tenant_id)` explícito e obrigatório em toda query** — é como `vendor_summary` e `client_portfolio` já são lidos em `src/app/dashboard/page.tsx`. RPCs declaradas `SECURITY INVOKER` e recebendo `p_tenant_id` explícito, seguindo `store_daily_evolution_multi`.

### Índices

- **D-22 — Índices obrigatórios** (as métricas fazem varredura por tenant + janela de data; sem eles as views degradam linearmente com o histórico):
  - `stock_snapshots (tenant_id, product_code, snapshot_date DESC)` — resolve o "snapshot mais recente por produto" via `DISTINCT ON` e as janelas por produto. O índice existente `(tenant_id, snapshot_date)` cobre o filtro de janela mas não o agrupamento por produto.
  - `sales_records (tenant_id, order_ref)` — chave da junção de D-07. Hoje inexistente; sem ela a junção com `sale_items` é o gargalo dominante.
  - `sales_records (tenant_id, sale_date)` — filtro de janela; verificar no plano se já existe antes de criar duplicata.
  - `sale_items (tenant_id, product_code)` — agregação por produto. O índice existente é `(tenant_id, period_id, vendor_id)`, inútil para este acesso.
  - `product_costs` — PK `(tenant_id, product_code)` já cobre todos os acessos previstos.
  - Verificar `EXPLAIN ANALYZE` de `product_inventory_metrics` para o tenant de produção no plano; se ficar acima de ~2s, a decisão de materialização vira questão aberta (ver `<risks>` R-02).

### Claude's Discretion

- Nome exato das colunas internas das views auxiliares (as colunas do contrato em `<contract>` são fixas).
- Se `product_daily_sales` deve ser view simples ou CTE inline dentro de `product_inventory_metrics` — desde que a série diária por produto continue acessível para `product_stock_history`.
- Estratégia de arredondamento (`round(x, 2)` vs `numeric` cru) em colunas não monetárias.
- Como o seed inicial de `product_costs` a partir do `products` do período mais recente é executado (migration com INSERT ... SELECT vs script separado).
- Se `inventory_summary` retorna `TABLE(...)` de uma linha ou `jsonb`.
- Ordem e nomes dos arquivos de migration.

</decisions>

<contract>
## Contrato de saída para a Fase 09

**Esta seção é normativa.** A Fase 09 é planejada em paralelo contra estes nomes e shapes. Qualquer alteração aqui exige sincronizar as duas fases.

### View: `product_inventory_metrics`

Uma linha por `(tenant_id, product_code)`. Sempre filtrar por `tenant_id`.

| coluna | tipo | notas |
|---|---|---|
| `tenant_id` | uuid | filtro obrigatório |
| `product_code` | text | |
| `product_name` | text | COALESCE conforme D-19 |
| `current_qty` | numeric | NULL se `stock_status='unknown'` |
| `last_snapshot_date` | date | NULL se nunca houve snapshot |
| `snapshot_staleness_days` | integer | NULL se nunca houve snapshot |
| `stock_status` | text | `'ok'` \| `'stale'` \| `'unknown'` |
| `unit_cost` | numeric | custo vigente (`product_costs`), NULL permitido |
| `has_cost` | boolean | |
| `stock_value` | numeric | `current_qty * unit_cost`; NULL se falta qualquer um |
| `qty_sold_short` | numeric | quantidade vendida na janela `W` |
| `qty_sold_long` | numeric | quantidade vendida na janela `L` |
| `revenue_short` | numeric | |
| `revenue_long` | numeric | |
| `profit_long` | numeric | lucro na janela `L`; NULL se custo da venda ausente |
| `ads` | numeric | D-10; 0 quando não houve venda |
| `dos` | numeric | D-11; **NULL quando `ads = 0`** |
| `wos` | numeric | D-11; NULL quando `dos` é NULL |
| `turnover` | numeric | giro na janela `L` (D-12); NULL sem custo |
| `turnover_annualized` | numeric | D-12; NULL sem custo |
| `cobertura_pct` | numeric | 0..1 (D-13); NULL sem snapshot na janela |
| `stockout_days` | integer | D-14, janela `W` |
| `stockout_rate` | numeric | 0..1 (D-14); NULL sem snapshot na janela |
| `is_stockout_now` | boolean | D-14; NULL se `stock_status='unknown'` |
| `movement_class` | text | `'fast'` \| `'normal'` \| `'slow'` \| `'dead'` \| NULL (D-15) |
| `window_days` | integer | `W` efetivo usado (eco de `inventory_settings`) |
| `long_window_days` | integer | `L` efetivo usado |

### View: `product_abc_curve`

Uma linha por `(tenant_id, product_code)` com venda na janela `L`.

| coluna | tipo | notas |
|---|---|---|
| `tenant_id` | uuid | |
| `product_code` | text | |
| `abc_basis` | text | `'profit'` \| `'revenue'` (D-16) |
| `abc_metric` | numeric | valor usado na ordenação |
| `abc_rank` | integer | 1 = maior; contíguo por tenant |
| `cum_pct` | numeric | 0..1, acumulado |
| `abc_class` | text | `'A'` \| `'B'` \| `'C'` |

### View: `product_sales_ranking` (D-23 — recorte de VENDAS, com loja)

Agregação de vendas por produto **e loja**, para o ranking da Fase 09 D-17. Única view desta fase com `store`. Não contém quantidade em estoque, DoS nem qualquer métrica de inventário — é puramente venda. Sempre filtrar por `tenant_id`; `store` opcional (NULL/omitido = todas as lojas somadas).

| coluna | tipo | notas |
|---|---|---|
| `tenant_id` | uuid | filtro obrigatório |
| `product_code` | text | |
| `product_name` | text | COALESCE conforme D-19 |
| `store` | text | loja de origem da venda; agregar sem esta coluna dá o total do tenant |
| `qty_sold` | numeric | quantidade na janela `L` |
| `revenue` | numeric | |
| `profit` | numeric | NULL se custo da venda ausente |
| `window_days` | integer | janela `L` efetiva |

`vendor_id` **nunca** aparece aqui — a fronteira de D-13 da Fase 09 (comprador não vê performance individual) é preservada estruturalmente: a coluna não existe.

### View: `product_daily_sales`

Série diária por produto (D-08), **sem loja** — insumo das métricas de velocidade, que são tenant-wide. Consumo direto pela Fase 09 é opcional; existe para gráficos e para `product_stock_history`.

`(tenant_id uuid, product_code text, sale_date date, qty_sold numeric, revenue numeric, cogs numeric, profit numeric)`

### RPC: `product_stock_history(p_tenant_id uuid, p_product_code text, p_days integer DEFAULT 90)`

Série temporal para sparkline/gráfico de um produto. Retorna uma linha por dia do intervalo, incluindo dias sem snapshot (`quantity` NULL) para o gráfico não mentir sobre continuidade:

`RETURNS TABLE (day date, quantity numeric, qty_sold numeric)`

### RPC: `inventory_summary(p_tenant_id uuid)`

KPIs de topo da tela `/dashboard/compras`:

`RETURNS TABLE (total_skus integer, total_stock_value numeric, skus_sem_custo integer, skus_em_quebra integer, skus_parados integer, skus_stale integer, dos_medio numeric, turnover_medio numeric)`

### Tabelas legíveis diretamente

- `product_costs (tenant_id, product_code, unit_cost, name, source, updated_at)` — a Fase 09 pode fazer UPDATE de `unit_cost` com `source='manual'` (a UI de edição de custo, se existir, é da Fase 09; a tabela e a regra de precedência D-03 são desta fase).
- `inventory_settings (tenant_id, ...)` — leitura para exibir thresholds vigentes; UI de edição é fora do escopo da Fase 08.
- `stock_snapshots` — inalterada desde a Fase 07.

### Garantias que a Fase 09 pode assumir

1. Toda view/RPC é **por tenant** e exige `tenant_id` explícito — nenhuma faz inferência de tenant a partir da sessão.
2. Leitura via `createAdminClient()` + `.eq('tenant_id', ...)`, nunca via cliente `authenticated` (D-21).
3. `NULL` significa sempre "desconhecido", nunca "zero" (D-11, D-16, D-18).
4. Nenhuma coluna de loja/`store` existe em qualquer artefato desta fase.
5. Nomes de colunas acima são estáveis; renomeações exigem revisão conjunta das duas fases.

</contract>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema existente
- `supabase/migrations/20260714000001_api_keys_and_stock_snapshots.sql` — `stock_snapshots` (fonte de posição de estoque), padrão de policy `tenant_isolation`
- `supabase/migrations/20260626171308_profit_commission.sql` — `products`, `sale_items`, view `vendor_summary` (padrão de view agregadora do projeto)
- `supabase/migrations/20260601000019_p0_security_closeout.sql` — padrão de grants/revokes de view (D-21)
- `supabase/migrations/20260603000022_perf_rls_initplan_wrap_auth_calls.sql` — padrão `(SELECT auth.uid())` em RLS (D-02)
- `supabase/migrations/20260603000021_perf_add_covering_indexes_for_fks.sql` — convenção de nomeação de índice

### Código
- `src/app/dashboard/page.tsx` (linhas ~47-70) — padrão de leitura de view em Server Component: `createAdminClient()` + `.eq('tenant_id', ...)` + `.rpc(...)`
- `src/app/api/admin/upload-catalog/route.ts` — origem do custo; ponto de alteração de D-03
- `src/app/api/admin/parse-upload/route.ts` (linha ~94) — grava `sale_items.order_id = order_ref`, base da junção D-07
- `src/app/api/v1/sales/route.ts` (linha ~151) — grava `sales_records.order_ref` no ingest da API
- `src/lib/supabase/admin.ts` — `createAdminClient()`

### Planejamento
- `.planning/phases/07-api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v/07-CONTEXT.md` — D-09..D-12 (modelo de snapshot), D-10 (agregado por tenant, reafirmado aqui)
- `.planning/ROADMAP.md` — Fases 08/09
- `.planning/PROJECT.md` — constraints de multi-tenant, RLS e leitura direta em Server Components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `stock_snapshots` já tem `UNIQUE(tenant_id, product_code, snapshot_date)` e índice `(tenant_id, snapshot_date)` — a série diária necessária para DoS/giro/quebra já está sendo acumulada desde a Fase 07.
- `sale_items.total_profit` e `unit_cost` já populados pelo motor de comissão por lucro — lucro por item não precisa ser recalculado.
- `vendor_summary` é o modelo de referência para uma view agregadora multi-tenant com grants restritos.
- `client_portfolio` (view existente) mostra o padrão de view com métricas de recência/frequência lida direto por Server Component — mesmo formato de consumo previsto para a Fase 09.

### Established Patterns
- Toda tabela tem `tenant_id` + RLS `tenant_isolation`.
- Views são revogadas de `anon`/`authenticated` e concedidas a `service_role`; a autorização real acontece no Server Component.
- RPCs recebem `p_tenant_id` explícito (ex.: `store_daily_evolution_multi`).
- Migrations nomeadas `YYYYMMDDHHMMSS_descricao.sql`, comentadas em português com separadores `-- ── N. titulo ───`.

### Integration Points
- `upload-catalog` ganha um segundo destino de escrita (`product_costs`) — única mudança de código de aplicação da fase, e é aditiva.
- Nenhuma alteração em `api/v1/stock`, `api/v1/sales`, middleware ou qualquer tela.

### Gaps confirmados no código
- `sale_items` **não tem** `sale_date` — a junção via `order_ref` (D-07) é obrigatória. Confirmar no plano a taxa de `order_id` órfão (sem `sales_records` correspondente) no tenant de produção antes de assumir que a view cobre todas as vendas.
- Não existe índice em `sales_records (tenant_id, order_ref)` — criar (D-22).
- Tabelas legadas `produtos`/`categorias` existem e são schema morto: nenhuma tela lê, nada nesta fase as toca.

</code_context>

<specifics>
## Specific Ideas

- Estoque agregado por tenant é suficiente porque as 3 lojas de CDE operam com compras centralizadas — a decisão de compra é do tenant, não da loja.
- A separação `products` (custo histórico por período, para comissão) vs `product_costs` (custo vigente, para inventário) é intencional: comissão precisa de custo congelado; compra precisa de custo atual. Misturar os dois quebraria o motor de comissão retroativamente.
- `movement_class` e `abc_class` juntos formam a matriz de decisão de compra da Fase 09 (ex.: classe A + `dead` = capital preso em item que já foi importante; classe C + `fast` = candidato a aumento de mix).

</specifics>

<risks>
## Riscos / Questões abertas

- **R-01 — Órfãos na junção `order_ref`.** Se uma fração relevante de `sale_items` não casar com `sales_records`, `product_daily_sales` subestima a venda e infla o DoS de forma silenciosa. **Resolver no plano:** medir a taxa de órfãos com uma query de diagnóstico antes de escrever a view; se for não-trivial, decidir entre (a) fallback de data pelo `periods` do item ou (b) aceitar e expor a lacuna numa métrica de saúde.
- **R-02 — Custo de cálculo das views.** `product_inventory_metrics` faz varredura de `stock_snapshots` (uma linha por produto por dia) e junção `sale_items`×`sales_records` a cada render de Server Component. **Resolver no plano:** `EXPLAIN ANALYZE` com dados de produção; se passar de ~2s, decidir entre MATERIALIZED VIEW com refresh agendado (`pg_cron`) e cache de aplicação. Materialização não é decisão desta fase a priori — só se a medição exigir.
- **R-03 — Densidade histórica dos snapshots.** `stock_snapshots` só existe desde a Fase 07. Uma janela de 90 dias para giro/ABC pode não ter dados suficientes no primeiro trimestre de operação. **Resolver no plano:** definir se as métricas de janela longa retornam NULL ou calculam sobre o histórico parcial disponível, e como sinalizar isso (candidato a coluna `history_days_available`).
- **R-04 — Ausência total de `product_costs` no dia 1.** Até o primeiro `upload-catalog` pós-migration, todas as métricas monetárias são NULL para todos os produtos. **Resolver no plano:** o seed a partir do `products` do período mais recente é suficiente? Cobre quantos SKUs?
- **R-05 — `cobertura` vs DoS (D-13).** A escolha de definir cobertura como nível de serviço, e não como sinônimo de DoS, diverge do uso coloquial em varejo. Risco de confusão na UI da Fase 09. **Resolver:** validar a nomenclatura com o dono antes de a Fase 09 rotular a coluna na tela; se ele esperar "cobertura = dias de cobertura", renomear `cobertura_pct` para `in_stock_rate` e sincronizar o contrato.
- **R-06 — Snapshot de quantidade negativa.** `stock_snapshots.quantity` é `numeric` sem CHECK; sistemas de ERP às vezes reportam negativo. D-14 trata `<= 0` como quebra, o que é seguro, mas `stock_value` de quantidade negativa produz valor negativo. **Resolver no plano:** decidir entre `GREATEST(quantity, 0)` em `stock_value` ou expor o negativo como sinal de erro de integração.
- **R-07 — `inventory_settings` sem UI.** Thresholds ficam configuráveis por SQL apenas. Se o dono quiser ajustar `slow_mover_dos_min` sem migration, é trabalho de Fase 09. Confirmar que isso é aceitável para o MVP.

</risks>

<deferred>
## Deferred Ideas

- **Estoque por loja** — reafirmação de D-10 da Fase 07; revisitar só quando houver reposição inter-loja como necessidade real.
- **Histórico de preço (`price_history`)** — explicitamente fora; preço continua sobrescrito por período.
- **Ponto de pedido / lead time de fornecedor / sugestão de quantidade de compra** — depende de dados de fornecedor que não existem no schema.
- **Sazonalidade e previsão de demanda** (média móvel ponderada, ajuste sazonal) — ADS simples basta no MVP.
- **Categoria de produto nas métricas** — não há dado de categoria confiável no ingest atual (limitação já registrada em PROJECT.md).
- **Materialized view + `pg_cron`** — só se R-02 exigir.
- **UI de edição de `inventory_settings`** — Fase 09 ou posterior.
- **Métricas de estoque no export Excel/PDF** — fase própria.

</deferred>

---

*Phase: 08-schema-de-inventario-metricas*
*Context gathered: 2026-07-19*
