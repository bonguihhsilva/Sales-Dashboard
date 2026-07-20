# Phase 8: Schema de inventário + métricas DoS, WoS, giro e quebra de estoque - Research

**Researched:** 2026-07-20
**Domain:** Postgres/Supabase — views, RPCs e tabelas de configuração para métricas de inventário multi-tenant
**Confidence:** MEDIUM-HIGH (schema real confirmado por leitura direta das migrations; taxa de órfãos e custo das views em produção não podem ser medidos nesta sessão de pesquisa — sem acesso a ferramentas de banco em runtime)

<user_constraints>
## User Constraints (from CONTEXT.md)

O `08-CONTEXT.md` desta fase é **normativo e integral** — contém D-01 a D-23 com fórmulas matemáticas exatas, schema de tabelas, contrato de saída (`<contract>`) e riscos (`<risks>`). Esta pesquisa **não rediscute nem substitui** essas decisões; documenta apenas COMO implementá-las corretamente em Postgres. O planner deve ler `08-CONTEXT.md` na íntegra — o resumo abaixo preserva a íntegra das seções normativas para consumo direto.

### Locked Decisions (copiado de 08-CONTEXT.md `<decisions>`)

**Schema — custo vigente:**
- **D-01:** Tabela `product_costs (tenant_id, product_code, unit_cost, name, source, updated_at)`, PK `(tenant_id, product_code)`, `unit_cost` nullable.
- **D-02:** RLS `tenant_isolation` idêntica à de `products`/`stock_snapshots`, com `(SELECT auth.uid())`.
- **D-03:** Upsert derivado do catálogo via `upload-catalog`; precedência `manual` > `catalog`/`api`; seed único a partir de `products` do período mais recente é aceitável no plano.
- **D-04:** `products` não muda — nenhum ALTER, nenhuma coluna nova.

**Schema — thresholds:**
- **D-05:** Tabela `inventory_settings` (uma linha por tenant) — `sales_window_days=30`, `long_window_days=90`, `fast_mover_dos_max=15`, `slow_mover_dos_min=120`, `dead_stock_days=90`, `stale_snapshot_days=7`, `abc_cut_a=0.80`, `abc_cut_b=0.95`. RLS igual a D-02.
- **D-06:** Ausência de linha não quebra nada — `LEFT JOIN` + `COALESCE` com defaults literais em toda view.

**Fonte de dados — venda diária:**
- **D-07:** Junção canônica `sale_items.order_id = sales_records.order_ref` dentro do mesmo `tenant_id`. Verificado em `parse-upload/route.ts` e `api/v1/sales/route.ts`.
- **D-08:** View `product_daily_sales (tenant_id, product_code, sale_date, qty_sold, revenue, cogs, profit)`. `cogs`/`profit` vêm de `sale_items.unit_cost`/`total_profit` (custo congelado), nunca de `product_costs`. Órfãos são excluídos; contagem é métrica de saúde.
- **D-09:** Nunca usar `period_id` como proxy de data — todas as janelas são dias corridos a partir de `CURRENT_DATE`.

**Métricas (notação: `W`=sales_window_days, `L`=long_window_days, `D0`=CURRENT_DATE):**
- **D-10 (ADS):** `SUM(qty_sold) em [D0-W, D0) / W`. Denominador fixo em W. `0` quando não houve venda.
- **D-11 (DoS/WoS):** `DoS = current_qty / ADS_W` — **NULL quando ADS_W=0** (nunca infinito/zero). `WoS = DoS/7`. Arredondar DoS a 1 casa decimal.
- **D-12 (Giro):** `turnover_L = COGS_L / NULLIF(avg_inventory, 0)`; `avg_inventory` = média dos snapshots existentes (não interpola dias faltantes) × `product_costs.unit_cost`; `turnover_anual = turnover_L * (365.0/L)`. Sem `unit_cost` → NULL.
- **D-13 (Cobertura ≠ DoS):** `cobertura_pct = dias_com_estoque / NULLIF(dias_com_snapshot, 0)` — nível de serviço, não duração. Nunca renomear como sinônimo de DoS.
- **D-14 (Quebra):** Dia conta como quebra quando existe snapshot e `quantity <= 0`. Dia sem snapshot é desconhecido — nunca presumido quebra. `stockout_rate_W = stockout_days_W / NULLIF(dias_com_snapshot, 0)`.
- **D-15 (movement_class):** Ordem de precedência: `dead` (zero venda em `dead_stock_days` E `current_qty>0`) → `slow` (`DoS>=slow_mover_dos_min`) → `fast` (`DoS<=fast_mover_dos_max`) → `normal`. Sem dados suficientes → NULL.
- **D-16 (ABC):** Critério = lucro bruto acumulado em `L` (via `profit` de `product_daily_sales`). Fallback para receita quando `total_profit` indisponível, marcado `abc_basis='revenue'`. Cortes por `cum_pct` sobre `abc_cut_a`/`abc_cut_b`. Métrica `<=0` → classe `C`, rank no fim.

**Buracos de dados:**
- **D-17 (stock_status):** `ok` (staleness <= stale_snapshot_days) / `stale` (métricas continuam calculadas, nunca zeradas) / `unknown` (current_qty, DoS, WoS, stock_value = NULL). Produtos só-venda-sem-snapshot aparecem com `unknown`.
- **D-18 (has_cost):** Sem `unit_cost` → métricas monetárias NULL, métricas de quantidade continuam válidas. Zero e desconhecido nunca colapsam.
- **D-19 (universo):** União de product_code em (a) snapshots na janela longa, (b) vendas na janela longa, (c) `product_costs`. `name` = `COALESCE(product_costs.name, products.name mais recente, product_code)`.

**Onde calcular:**
- **D-20:** Tudo em SQL (views + RPC), nada em TypeScript. Views = "uma linha por produto, sem parâmetro". RPCs = parâmetro variável ou agregado escalar.
- **D-21 (segurança):** `REVOKE ALL ON public.<view> FROM anon, authenticated; GRANT SELECT ON public.<view> TO service_role;` — padrão exato de `vendor_summary`. Leituras via `createAdminClient()` + `.eq('tenant_id', ...)` obrigatório. RPCs `SECURITY INVOKER` (default, sem declaração), recebendo `p_tenant_id` explícito.

**Índices:**
- **D-22:** `stock_snapshots(tenant_id, product_code, snapshot_date DESC)`; `sales_records(tenant_id, order_ref)`; `sales_records(tenant_id, sale_date)` (verificar duplicata); `sale_items(tenant_id, product_code)`. `product_costs` PK já cobre. `EXPLAIN ANALYZE` obrigatório no plano — se >2s, materialização vira questão aberta (R-02).

### Claude's Discretion (copiado de 08-CONTEXT.md)
- Nome exato das colunas internas das views auxiliares (contrato em `<contract>` é fixo).
- `product_daily_sales` como view simples vs. CTE inline em `product_inventory_metrics` — desde que a série diária continue acessível para `product_stock_history`.
- Estratégia de arredondamento (`round(x,2)` vs numeric cru) em colunas não monetárias.
- Execução do seed de `product_costs` (migration INSERT...SELECT vs script separado).
- `inventory_summary` retorna `TABLE(...)` de uma linha ou `jsonb`.
- Ordem e nomes dos arquivos de migration.

### Deferred Ideas (OUT OF SCOPE)
- Estoque por loja (reafirma D-10 da Fase 07).
- Histórico de preço (`price_history`).
- Ponto de pedido / lead time de fornecedor / sugestão de quantidade de compra.
- Sazonalidade e previsão de demanda.
- Categoria de produto nas métricas (sem dado confiável no ingest).
- Materialized view + `pg_cron` — só se R-02 exigir.
- UI de edição de `inventory_settings`.
- Métricas de estoque no export Excel/PDF.

### Contrato de saída (normativo — copiado de 08-CONTEXT.md `<contract>`)

O planner **deve** usar exatamente estes nomes de view/RPC, colunas e tipos — a Fase 09 é planejada em paralelo contra eles. Ver `08-CONTEXT.md` seção `<contract>` para as tabelas completas de colunas. Resumo:

| Artefato | Tipo | Parâmetros | Notas |
|---|---|---|---|
| `product_inventory_metrics` | view | — (filtrar `.eq('tenant_id',...)`) | 1 linha por `(tenant_id, product_code)`; 25 colunas incluindo `dos`, `wos`, `turnover`, `movement_class`, `stock_status` |
| `product_abc_curve` | view | — | 1 linha por produto com venda na janela `L`; `abc_basis`, `abc_rank`, `cum_pct`, `abc_class` |
| `product_sales_ranking` | view | — | D-23: única view com `store`; sem `vendor_id`; puramente venda |
| `product_daily_sales` | view | — | série diária, sem loja, insumo de `product_stock_history` |
| `product_stock_history` | RPC | `p_tenant_id uuid, p_product_code text, p_days integer DEFAULT 90` | inclui dias sem snapshot (`quantity` NULL) |
| `inventory_summary` | RPC | `p_tenant_id uuid` | KPIs agregados do tenant |

Garantias que a Fase 09 pode assumir: toda view/RPC exige `tenant_id` explícito; leitura sempre via `createAdminClient()`; `NULL` sempre significa "desconhecido"; nenhuma coluna de loja fora de `product_sales_ranking`; nomes de colunas são estáveis.

</user_constraints>

## Project Constraints (from CLAUDE.md)

- Stack fixa: Next.js 15.2.4, React 19, TypeScript strict, Supabase — não alterar sem aprovação.
- **Banco:** "não manipular o banco diretamente" (regra do projeto) — toda mudança de schema via migration SQL versionada em `supabase/migrations/`, nunca via edição direta. Diagnósticos read-only (SELECT) via MCP/CLI são aceitáveis para medir R-01/R-02, mas não substituem a migration.
- **Moeda:** configurável por tenant (USD | BRL | PYG) — nenhuma métrica desta fase deve hardcodar símbolo/formatação de moeda (isso é UI, Fase 09); os valores numéricos em `product_costs.unit_cost` e derivados são armazenados sem conversão.
- **RLS:** ativo em todas as tabelas, nunca desabilitado — `product_costs` e `inventory_settings` precisam de RLS desde o CREATE TABLE.
- **Multi-tenant:** toda query filtra por `tenant_id` — reforçado pelo D-21 (views revogadas de `authenticated`, RPCs com `p_tenant_id` explícito).
- **Migrations imutáveis:** nunca editar uma migration já commitada — nova migration para qualquer correção.
- `npm run build` deve passar antes de qualquer commit de fase (aplica-se mesmo a fases sem código TS novo, pois a fase adiciona zero arquivos `.ts` — mas se D-03 tocar `upload-catalog/route.ts`, isso está fora do escopo da Fase 08 conforme o domínio declarado; **nota de risco:** o `<contract>` e as decisões falam em D-03 alterar `upload-catalog` para popular `product_costs`, o que É uma mudança de código de aplicação incluída nesta fase — não confundir com o "zero UI, zero rota de API" do domínio, que se refere a rotas/telas *novas*, não à extensão aditiva do upload existente).
- Segurança: nunca commitar credenciais; nenhuma chave real em migration SQL (não há necessidade nesta fase, mas vale o lembrete).

## Summary

Esta fase é pura camada de dados Postgres: duas tabelas novas (`product_costs`, `inventory_settings`), quatro views (`product_daily_sales`, `product_inventory_metrics`, `product_abc_curve`, `product_sales_ranking`) e duas RPCs (`product_stock_history`, `inventory_summary`), mais índices de suporte. Todas as fórmulas já estão fixadas em `08-CONTEXT.md`; o trabalho de implementação é 100% sobre **como expressar essas fórmulas em SQL idiomático do Postgres 15+** seguindo os padrões já estabelecidos no projeto (`vendor_summary`, `client_portfolio`, `store_daily_evolution_multi`).

Os padrões-chave confirmados por leitura direta do schema real: `sale_items.order_id` (text) casa com `sales_records.order_ref` (text) dentro do mesmo `tenant_id` — essa junção já é usada em produção pela view `client_category_mix` (`20260627000000_carteira_category.sql`), inclusive com `period_id` adicional no `ON`. Views seguem sempre o padrão `REVOKE ALL FROM anon, authenticated; GRANT SELECT TO service_role` (confirmado em `vendor_summary` e no security closeout). RPCs de agregação por tenant não declaram `SECURITY DEFINER`/`SECURITY INVOKER` explicitamente (portanto usam o default `INVOKER`) e recebem `p_tenant_id` como parâmetro explícito — `store_daily_evolution_multi(p_period_ids bigint[], p_tenant_id uuid)` é o modelo exato citado no `<contract>`.

Dois riscos do `<risks>` do CONTEXT (R-01 órfãos de `order_ref`, R-02 custo das views em produção) **não puderam ser medidos nesta sessão de pesquisa** — não há ferramenta de acesso a banco de dados disponível neste agente de pesquisa. As queries de diagnóstico estão prontas abaixo; o plano deve incluir uma tarefa de Wave 0 para rodá-las via Supabase MCP (`execute_sql`, somente leitura) antes de finalizar a decisão de materialização.

**Primary recommendation:** implementar as 4 views como SQL puro (view simples, sem materialização a priori — R-02 decide depois), usar `DISTINCT ON` para snapshot mais recente, CTEs nomeadas para legibilidade (uma por métrica: `latest_snapshot`, `window_sales`, `window_snapshots`, `abc_ranked`), e replicar literalmente o bloco de grants de `vendor_summary` em cada view nova.

## Standard Stack

### Core

| Componente | Versão | Propósito | Por que é o padrão do projeto |
|---|---|---|---|
| PostgreSQL (Supabase managed) | 15+ (verificar `SELECT version()` no projeto `zsczxblhtdhpdqvkpuwz`) [ASSUMED] | Motor de execução das views/RPCs | Já em uso; toda a stack de dados do projeto é Postgres/Supabase |
| Supabase CLI | 2.109.1 [VERIFIED: `npx supabase --version` neste ambiente] | Gestão de migrations locais | Já instalado como devDependency do projeto |
| supabase-js | ^2.47.0 [VERIFIED: package.json] | Cliente admin para leitura das views na Fase 09 | Já em uso em todo o projeto (`createAdminClient()`) |

**Não há biblioteca nova a instalar** — esta fase é 100% SQL declarativo (`CREATE TABLE`, `CREATE VIEW`, `CREATE FUNCTION`). Nenhum pacote npm é necessário.

### Alternatives Considered

| Em vez de | Poderia usar | Tradeoff |
|---|---|---|
| Views simples (recalculadas a cada SELECT) | `MATERIALIZED VIEW` + `pg_cron` | Só se `EXPLAIN ANALYZE` mostrar >2s (R-02); projeto ainda não tem extensão `pg_cron` habilitada — adicionaria complexidade operacional (refresh scheduling, staleness da própria materialização) que o CONTEXT explicitamente not aprova a priori |
| `RETURNS TABLE` nas RPCs | `RETURNS jsonb` | `<contract>` já fixa `TABLE(...)` para `product_stock_history`; para `inventory_summary` a Claude's Discretion permite escolher — `TABLE(...)` de uma linha é mais consistente com o resto do projeto (todas as RPCs existentes usam `RETURNS TABLE`) e compõe melhor com `.single()` do supabase-js |
| CTEs nomeadas dentro da view | Subqueries aninhadas inline | CTEs são mais legíveis e depuráveis via `EXPLAIN`; o projeto já usa subquery correlacionada simples em `vendor_summary` (para `total_profit`) mas essa fase tem muito mais métricas — CTEs evitam repetir a mesma agregação de janela várias vezes |

## Architecture Patterns

### Recommended Migration Structure

Seguindo a convenção `YYYYMMDDHHMMSS_descricao.sql` (última migration existente: `20260714000001`), e a diretriz de "migrations imutáveis" — nenhuma edita as anteriores. Dividir em migrations menores e sequenciais facilita revisão e rollback parcial:

```
supabase/migrations/
├── 20260720000001_product_costs_and_inventory_settings.sql   # D-01, D-02, D-05, D-06 (tabelas + RLS)
├── 20260720000002_product_daily_sales_view.sql                # D-07, D-08, D-09
├── 20260720000003_product_inventory_metrics_view.sql          # D-10..D-19 (a view principal)
├── 20260720000004_product_abc_curve_and_sales_ranking_views.sql  # D-16, D-23
├── 20260720000005_inventory_rpcs.sql                           # product_stock_history, inventory_summary
├── 20260720000006_inventory_indexes.sql                        # D-22
└── 20260720000007_product_costs_seed.sql                       # D-03 seed inicial (opcional, Claude's Discretion)
```

Ajustar timestamps para o momento real da implementação (usar `date +%Y%m%d%H%M%S` ou incrementar manualmente se todas forem geradas no mesmo plano, para preservar ordem de aplicação).

### Pattern 1: `DISTINCT ON` para "snapshot mais recente por produto"

**O quê:** Obter uma linha por `(tenant_id, product_code)` com o snapshot de data mais recente, sem agregação.
**Quando usar:** `current_qty`, `last_snapshot_date`, `snapshot_staleness_days`, `stock_status`, `is_stockout_now` — todos derivam do snapshot mais recente, não de agregação de janela.

```sql
-- Fonte: padrão idiomático Postgres (DISTINCT ON depende de ORDER BY casado
-- com a expressão do DISTINCT ON — verificado contra o índice D-22
-- stock_snapshots(tenant_id, product_code, snapshot_date DESC), que cobre
-- exatamente este acesso sem sort adicional).
latest_snapshot AS (
  SELECT DISTINCT ON (s.tenant_id, s.product_code)
    s.tenant_id,
    s.product_code,
    s.quantity      AS current_qty,
    s.snapshot_date AS last_snapshot_date
  FROM stock_snapshots s
  WHERE s.tenant_id = p_tenant_id  -- ou filtro de view sem parâmetro, se for view
  ORDER BY s.tenant_id, s.product_code, s.snapshot_date DESC
)
```

Atenção: `DISTINCT ON` exige que as colunas do `DISTINCT ON (...)` sejam um prefixo do `ORDER BY`. Sem o índice `(tenant_id, product_code, snapshot_date DESC)` (D-22), o Postgres faz sort completo da tabela a cada execução da view — este é exatamente o índice que falta hoje (só existe `(tenant_id, snapshot_date)`, que não ajuda o agrupamento por produto).

### Pattern 2: Window functions para curva ABC (percentual acumulado)

**O quê:** Ordenar produtos por métrica desc, calcular `SUM(...) OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING)` dividido pelo total do tenant.
**Quando usar:** `product_abc_curve` (D-16).

```sql
-- cum_pct = soma acumulada da métrica até a linha atual / soma total do tenant
abc_ranked AS (
  SELECT
    tenant_id,
    product_code,
    abc_basis,
    abc_metric,
    row_number() OVER (PARTITION BY tenant_id ORDER BY abc_metric DESC) AS abc_rank,
    sum(abc_metric) OVER (
      PARTITION BY tenant_id
      ORDER BY abc_metric DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) / NULLIF(sum(abc_metric) OVER (PARTITION BY tenant_id), 0) AS cum_pct
  FROM abc_base
)
SELECT
  tenant_id, product_code, abc_basis, abc_metric, abc_rank, cum_pct,
  CASE
    WHEN cum_pct <= (SELECT COALESCE(s.abc_cut_a, 0.80) FROM inventory_settings s WHERE s.tenant_id = abc_ranked.tenant_id) THEN 'A'
    WHEN cum_pct <= (SELECT COALESCE(s.abc_cut_b, 0.95) FROM inventory_settings s WHERE s.tenant_id = abc_ranked.tenant_id) THEN 'B'
    ELSE 'C'
  END AS abc_class
FROM abc_ranked
```

**Cuidado (D-16):** produtos com métrica `<= 0` devem cair em `'C'` e ir para o fim do rank — como `ORDER BY abc_metric DESC` já os empurra para o final quando a métrica é baixa/negativa, isso é natural, mas o `cum_pct` de uma métrica negativa pode produzir valores `>1` ou inconsistentes no acumulado se houver produtos com lucro negativo somados antes do total. Testar explicitamente esse caso (ver Validation Architecture) — é o tipo de aresta que só aparece com dados sintéticos, porque a soma acumulada assume implicitamente que a métrica de corte é não-negativa.

### Pattern 3: `LEFT JOIN inventory_settings` + `COALESCE` para defaults por tenant (D-06)

```sql
-- Toda view que usa qualquer threshold configurável faz este LEFT JOIN.
-- Nunca INNER JOIN — tenant sem linha em inventory_settings não pode sumir da view.
FROM product_inventory_metrics_base m
LEFT JOIN inventory_settings s ON s.tenant_id = m.tenant_id
-- ...
, COALESCE(s.sales_window_days, 30)   AS window_days
, COALESCE(s.long_window_days, 90)    AS long_window_days
, COALESCE(s.fast_mover_dos_max, 15)  AS fast_mover_dos_max
, COALESCE(s.slow_mover_dos_min, 120) AS slow_mover_dos_min
, COALESCE(s.dead_stock_days, 90)     AS dead_stock_days
, COALESCE(s.stale_snapshot_days, 7)  AS stale_snapshot_days
```

**Pitfall real:** como `sales_window_days`/`long_window_days` controlam o `WHERE sale_date >= CURRENT_DATE - W` dentro de uma CTE, e W só é conhecido depois do `LEFT JOIN` a `inventory_settings`, a janela **não pode** ser um simples `WHERE` fixo em uma CTE anterior ao join — ou o CTE precisa receber o tenant como parâmetro de RPC (fácil), ou a view precisa fazer o `LEFT JOIN inventory_settings` **antes** de agregar por janela, usando o valor coalescido diretamente na cláusula `WHERE`/`FILTER`. Em view (sem parâmetro), a forma correta é usar `FILTER (WHERE sale_date >= CURRENT_DATE - COALESCE(s.sales_window_days, 30))` dentro do agregado, não um `WHERE` de linha — porque `WHERE` filtraria as linhas de venda antes de saber o `W` de cada tenant caso a query precise, por exemplo, tanto `W` quanto `L` no mesmo `SELECT` (que é exatamente o caso de `product_inventory_metrics`, que expõe `qty_sold_short`/`qty_sold_long`).

```sql
SELECT
  ds.tenant_id, ds.product_code,
  sum(ds.qty_sold) FILTER (WHERE ds.sale_date >= CURRENT_DATE - COALESCE(s.sales_window_days, 30))  AS qty_sold_short,
  sum(ds.qty_sold) FILTER (WHERE ds.sale_date >= CURRENT_DATE - COALESCE(s.long_window_days, 90))    AS qty_sold_long
FROM product_daily_sales ds
LEFT JOIN inventory_settings s ON s.tenant_id = ds.tenant_id
WHERE ds.sale_date >= CURRENT_DATE - GREATEST(COALESCE(s.long_window_days, 90), 365)  -- limita a leitura ao maior horizonte necessário; nunca filtra pelo menor
GROUP BY ds.tenant_id, ds.product_code
```

Note o `WHERE` externo usando `GREATEST(..., 365)` como teto de segurança apenas para limitar quanto histórico é lido (poda de partição lógica), nunca como filtro definitivo da janela — o filtro real é o `FILTER` por agregado. Isso resolve o pitfall sem duplicar o scan.

### Pattern 4: `NULLIF` para divisão segura mantendo semântica NULL="desconhecido"

Todas as divisões desta fase seguem o mesmo idioma — dividendo é a métrica, divisor pode ser zero, e o resultado de "zero/zero" deve ser **NULL, nunca erro nem zero silencioso**:

```sql
DoS         := current_qty / NULLIF(ads, 0)                    -- D-11
turnover    := cogs_long / NULLIF(avg_inventory, 0)             -- D-12
cobertura   := dias_com_estoque / NULLIF(dias_com_snapshot, 0)  -- D-13
stockout_rt := stockout_days / NULLIF(dias_com_snapshot, 0)     -- D-14
```

`NULLIF(x, 0)` retorna `NULL` quando `x = 0`, e qualquer aritmética com `NULL` propaga `NULL` automaticamente — não é necessário `CASE WHEN x = 0 THEN NULL ELSE a/x END`, `NULLIF` já cobre o caso com uma função. Isso é o mecanismo que implementa D-11/D-12/D-13/D-14 de forma direta.

### Pattern 5: Construindo a "união de produtos" (D-19) sem perder nenhuma fonte

```sql
all_product_codes AS (
  SELECT DISTINCT tenant_id, product_code FROM stock_snapshots
  WHERE snapshot_date >= CURRENT_DATE - <long_window_days por tenant>
  UNION
  SELECT DISTINCT tenant_id, product_code FROM product_daily_sales
  WHERE sale_date >= CURRENT_DATE - <long_window_days por tenant>
  UNION
  SELECT DISTINCT tenant_id, product_code FROM product_costs
)
```

Como `long_window_days` é por-tenant (via `inventory_settings`), o filtro de janela nesta CTE de universo não pode usar um literal fixo sem antes fazer o `LEFT JOIN` — a forma mais simples e correta é usar um teto generoso aqui (ex.: `CURRENT_DATE - 365`) só para limitar o scan, e deixar o cálculo exato de `L` por tenant acontecer nas CTEs de métrica downstream, que já fazem o join com `inventory_settings`. Um produto que caiu fora do teto de 365 dias mas está dentro do `long_window_days` configurado (o que só aconteceria se um tenant configurasse `long_window_days > 365`, fora dos defaults) é uma aresta que vale documentar como não coberta — 365 dias é ~4x o default de 90 e cobre qualquer configuração razoável.

Depois do `all_product_codes`, todas as métricas entram via `LEFT JOIN` a partir dessa base — nunca `INNER JOIN` — garantindo que um produto com dado em só uma das três fontes ainda aparece na view final.

### Anti-Patterns to Avoid

- **`WHERE ads > 0` para evitar `NULLIF`:** filtraria a linha inteira do produto em vez de produzir `DoS = NULL` — quebra D-11/D-19 (produto teria que aparecer sempre, com métricas parcialmente NULL, não desaparecer).
- **`COALESCE(dos, 0)` em qualquer lugar da view:** colapsa "zero" e "desconhecido" no mesmo valor — proibido explicitamente por D-11, D-16, D-18 e pela garantia #3 do contrato. `COALESCE` só é apropriado para os *thresholds de configuração* (D-06), nunca para os *valores calculados* de métrica.
- **Materializar a view "preventivamente" sem medir:** o CONTEXT é explícito (R-02, seção Deferred) — materialização só entra em cena se `EXPLAIN ANALYZE` mostrar necessidade real.
- **Juntar `sale_items` a `sales_records` sem `tenant_id` no `ON`:** mesmo que `order_ref`/`order_id` sejam prováveis de ser globalmente únicos na prática, omitir `tenant_id` no `JOIN` é uma falha de isolamento multi-tenant caso dois tenants compartilhem um valor de `order_ref` por coincidência (ex.: ambos usam sequenciais simples do próprio ERP). Todo `JOIN` desta fase inclui `tenant_id` nas duas pontas.

## Don't Hand-Roll

| Problema | Não construir | Usar em vez disso | Por quê |
|---|---|---|---|
| "Linha mais recente por grupo" | `ROW_NUMBER() OVER (...) WHERE rn = 1` manual, ou subquery correlacionada `MAX(snapshot_date)` + join de volta | `DISTINCT ON (tenant_id, product_code) ORDER BY ... snapshot_date DESC` | `DISTINCT ON` é a forma idiomática do Postgres, uma passada só, sem join extra; `ROW_NUMBER` exige uma CTE + filtro extra para o mesmo resultado, mais verboso e mais lento sem ganho |
| Percentual acumulado (curva ABC) | Loop `plpgsql` calculando acumulado linha a linha | Window function `SUM(...) OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING)` | Postgres computa em uma passada com sort único; loop procedural é O(n²) na prática e não pode ser otimizado pelo planner |
| Divisão segura com semântica NULL | `CASE WHEN x=0 THEN NULL ELSE a/x END` repetido dezenas de vezes | `a / NULLIF(x, 0)` | Mesma semântica, uma função, menos superfície de erro de copiar/colar o `CASE` errado |
| Série de dias contínua para gráfico (RPC `product_stock_history`) | Gerar dias em TypeScript a partir do resultado esparso do SQL | `generate_series(CURRENT_DATE - p_days, CURRENT_DATE, '1 day') LEFT JOIN stock_snapshots` dentro da própria RPC | `<contract>` exige que a RPC já retorne uma linha por dia, incluindo dias sem snapshot (`quantity` NULL) — fazer isso em SQL evita round-trip extra e mantém D-20 (nada de cálculo em TS) |

**Key insight:** todo problema desta fase — "linha mais recente", "acumulado ordenado", "série de dias com buracos" — tem solução nativa no dialeto SQL do Postgres (`DISTINCT ON`, window functions, `generate_series`). Reimplementar qualquer um deles em `plpgsql` procedural ou em TypeScript viola D-20 e introduz uma segunda fonte de verdade para lógica que já existe no motor.

## Common Pitfalls

### Pitfall 1: Índice do `DISTINCT ON` não bate com o `ORDER BY`

**O que dá errado:** Postgres aceita `DISTINCT ON (a, b) ... ORDER BY a, b, c DESC, d` mas exige que as colunas do `DISTINCT ON` sejam um prefixo do `ORDER BY` na mesma ordem — inverter a ordem ou omitir uma coluna produz erro de sintaxe, não um resultado errado silencioso, então o risco real não é lógico, é o índice.
**Por que acontece:** o índice `stock_snapshots(tenant_id, product_code, snapshot_date DESC)` (D-22) só é usado sem sort adicional se a query filtrar E ordenar exatamente nessa ordem de colunas. Um `WHERE tenant_id = X ORDER BY product_code, snapshot_date DESC` sem o `tenant_id` também na cláusula de igualdade do índice ainda funciona, mas se a view tiver `p_tenant_id` como filtro de linha vindo de fora (RLS), o planner precisa que o índice comece por `tenant_id`.
**Como evitar:** sempre escrever `ORDER BY tenant_id, product_code, snapshot_date DESC` e criar o índice na mesma ordem — exatamente como D-22 especifica.
**Sinais de alerta:** `EXPLAIN ANALYZE` mostrando `Sort` antes do `Unique`/`DISTINCT ON` em vez de `Index Scan` direto.

### Pitfall 2: Contagem de "dias com snapshot" via `COUNT(*)` em vez de `COUNT(DISTINCT snapshot_date)`

**O que dá errado:** `stock_snapshots` tem `UNIQUE(tenant_id, product_code, snapshot_date)`, então em teoria `COUNT(*)` e `COUNT(DISTINCT snapshot_date)` são equivalentes por produto — mas se qualquer CTE intermediária fizer um `JOIN` antes de agregar (ex.: juntar com `product_costs` antes de contar dias), o `COUNT(*)` passa a contar linhas duplicadas pelo produto cartesiano do join, inflando `dias_com_snapshot` e subestimando `stockout_rate`/`cobertura_pct`.
**Por que acontece:** é fácil adicionar um `JOIN` "inocente" (ex. para pegar `product_costs.unit_cost`) dentro da mesma CTE que agrega dias, sem perceber que isso multiplica linhas antes do `COUNT`.
**Como evitar:** agregar `dias_com_snapshot`/`dias_com_estoque`/`stockout_days` em uma CTE isolada, contendo **apenas** `stock_snapshots`, e só depois fazer `LEFT JOIN` dessa CTE já agregada com as demais fontes.
**Sinais de alerta:** `cobertura_pct` ou `stockout_rate` > 1 ou inconsistente com uma contagem manual — sintoma direto de contagem duplicada.

### Pitfall 3: `movement_class` calculado antes do `LEFT JOIN` a `inventory_settings`

**O que dá errado:** os cortes `fast_mover_dos_max`/`slow_mover_dos_min`/`dead_stock_days` são por-tenant (D-15). Um `CASE WHEN dos <= 15 THEN 'fast' ...` com valores literais hardcoded ignora a configuração do tenant e quebra silenciosamente a fase seguinte (Fase 09 espera cortes configuráveis).
**Por que acontece:** os valores default (15, 120, 90) são fáceis de "esquecer que são configuráveis" e escrever como constantes ao traduzir a fórmula do CONTEXT para SQL.
**Como evitar:** todo literal de threshold na fórmula deve vir de `COALESCE(s.<coluna>, <default>)`, nunca do número puro — usar as mesmas expressões nomeadas do Pattern 3.
**Sinais de alerta:** revisão de código encontrando `15`, `120` ou `90` como número mágico dentro do `CASE` de `movement_class` em vez de referenciar `inventory_settings`.

### Pitfall 4: Ordem de precedência de `movement_class` invertida

**O que dá errado:** D-15 define a ordem `dead` → `slow` → `fast` → `normal`. Um produto pode simultaneamente ter `DoS` alto (candidato a `slow`) e zero venda no período curto mas alguma venda no período longo (não `dead`) — a ordem do `CASE`/`CASE WHEN` importa porque as condições não são mutuamente exclusivas por construção.
**Por que acontece:** ao traduzir para SQL é tentador reordenar as condições "por importância percebida" (ex.: testar `fast` antes de `slow` porque parece mais comum) — isso muda o resultado quando as condições se sobrepõem.
**Como evitar:** replicar a ordem exata do CONTEXT no `CASE WHEN ... WHEN ... WHEN ... ELSE 'normal' END`, com um teste unitário sintético cobrindo o caso de sobreposição (produto com `dead_stock_days` zerado E `DoS` alto simultaneamente — deve ganhar `dead`).
**Sinais de alerta:** teste sintético (ver Validation Architecture) com um produto desenhado para cair em duas categorias falha ao verificar qual delas venceu.

### Pitfall 5: RPC de série temporal (`product_stock_history`) sem `LEFT JOIN` a partir do `generate_series`

**O que dá errado:** se a RPC fizer `SELECT snapshot_date, quantity FROM stock_snapshots WHERE ...` diretamente, dias sem snapshot simplesmente não aparecem na saída — violando o requisito explícito do `<contract>` ("incluindo dias sem snapshot, `quantity` NULL, para o gráfico não mentir sobre continuidade").
**Por que acontece:** é o caminho "óbvio" de implementar a série, e funciona para o caso feliz (produto com snapshot todo dia) — só quebra visualmente quando há gaps, que é justamente o caso que a Fase 09 precisa detectar.
**Como evitar:** `generate_series(CURRENT_DATE - p_days, CURRENT_DATE, interval '1 day')::date AS day` como base, com `LEFT JOIN stock_snapshots`/`product_daily_sales` por dia — nunca o inverso.
**Sinais de alerta:** gráfico de sparkline na Fase 09 mostrando uma linha contínua interpolada onde deveria haver um buraco visível.

### Pitfall 6: Migration que cria a view antes do índice que ela precisa

**O que dá errado:** criar `product_inventory_metrics` (que faz `DISTINCT ON` em `stock_snapshots`) antes de criar o índice `stock_snapshots(tenant_id, product_code, snapshot_date DESC)` não quebra a view (Postgres não exige o índice para compilar), mas a primeira execução em produção sofre um full scan + sort até o índice existir — se a ordem das migrations no plano inverter view-antes-de-índice, a janela entre as duas migrations aplicadas fica lenta sem necessidade.
**Como evitar:** ordenar as migrations com os índices (D-22) **antes** das views que dependem deles, ou pelo menos na mesma migration.

## Code Examples

### Grants de segurança de view (padrão exato do projeto)

```sql
-- Fonte: supabase/migrations/20260601000019_p0_security_closeout.sql
-- e supabase/migrations/20260626171308_profit_commission.sql (linha 127-129)
-- Repetir para CADA view nova desta fase (product_daily_sales,
-- product_inventory_metrics, product_abc_curve, product_sales_ranking).
REVOKE ALL ON public.product_inventory_metrics FROM anon, authenticated;
GRANT SELECT ON public.product_inventory_metrics TO service_role;
```

Nota: `vendor_summary` usa a ordem `GRANT` depois `REVOKE`; `p0_security_closeout.sql` usa `REVOKE` primeiro. A ordem não importa semanticamente (grants/revokes para roles diferentes são independentes), mas para consistência visual usar a ordem de `p0_security_closeout.sql` (REVOKE primeiro, como "fechar a porta antes de abrir para o role certo") é a convenção mais recente do projeto.

### Assinatura de RPC com `p_tenant_id` (padrão exato do projeto)

```sql
-- Fonte: supabase/migrations/20260528_multi_tenant_arch.sql, linha 140
-- store_daily_evolution_multi é o modelo citado no <contract> D-21.
-- Note: SEM "SECURITY DEFINER" declarado → default SECURITY INVOKER.
-- Chamada apenas via service-role (createAdminClient()), que já bypassa RLS,
-- então INVOKER é seguro aqui — RLS nunca entra em jogo para o service_role.
CREATE OR REPLACE FUNCTION product_stock_history(
  p_tenant_id    uuid,
  p_product_code text,
  p_days         integer DEFAULT 90
)
RETURNS TABLE(day date, quantity numeric, qty_sold numeric)
LANGUAGE sql
SET search_path = public   -- P0-4 do security closeout: search_path fixo em toda função nova
AS $$
  SELECT
    d.day,
    s.quantity,
    coalesce(ds.qty_sold, 0) AS qty_sold
  FROM generate_series(CURRENT_DATE - p_days, CURRENT_DATE, interval '1 day')::date AS d(day)
  LEFT JOIN stock_snapshots s
    ON s.tenant_id = p_tenant_id
   AND s.product_code = p_product_code
   AND s.snapshot_date = d.day
  LEFT JOIN product_daily_sales ds
    ON ds.tenant_id = p_tenant_id
   AND ds.product_code = p_product_code
   AND ds.sale_date = d.day
  ORDER BY d.day;
$$;
```

`SET search_path = public` replica o hardening feito em `p0_security_closeout.sql` (P0-4) para todas as funções existentes — toda função nova desta fase deve nascer já com isso, em vez de precisar de um `ALTER FUNCTION` corretivo depois.

### Diagnóstico de órfãos `order_ref` (R-01) — query pronta, não executada nesta sessão

```sql
-- Rodar via Supabase MCP execute_sql (somente leitura) no plano/Wave 0,
-- por tenant de produção, ANTES de decidir se D-08 precisa de fallback.
SELECT
  si.tenant_id,
  count(*) AS total_sale_items,
  count(*) FILTER (WHERE sr.order_ref IS NULL) AS orphan_items,
  round(
    100.0 * count(*) FILTER (WHERE sr.order_ref IS NULL) / NULLIF(count(*), 0),
    2
  ) AS orphan_pct
FROM sale_items si
LEFT JOIN sales_records sr
  ON sr.tenant_id = si.tenant_id
 AND sr.order_ref  = si.order_id
GROUP BY si.tenant_id
ORDER BY orphan_pct DESC;
```

### Seed inicial de `product_costs` (D-03, Claude's Discretion: migration INSERT...SELECT)

```sql
-- Período mais recente por tenant = maior (year, month), não MAX(id) —
-- id é serial mas não há garantia formal de que id cresce com a data
-- em todos os tenants (edge case de seed/import fora de ordem).
WITH latest_period AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, id AS period_id
  FROM periods
  ORDER BY tenant_id, year DESC, month DESC
)
INSERT INTO product_costs (tenant_id, product_code, unit_cost, name, source, updated_at)
SELECT
  p.tenant_id,
  p.product_code,
  p.cost_price,
  p.name,
  'catalog',
  now()
FROM products p
JOIN latest_period lp
  ON lp.tenant_id = p.tenant_id AND lp.period_id = p.period_id
ON CONFLICT (tenant_id, product_code) DO NOTHING;  -- nunca sobrescreve custo já existente (ex.: 'manual')
```

`DO NOTHING` (não `DO UPDATE`) porque este é um seed de bootstrap — se a migration rodar depois de o tenant já ter `product_costs` populado por upload real (D-03), o seed não deve reverter nada. `ON CONFLICT ... DO UPDATE` só faria sentido no fluxo normal de upsert do `upload-catalog` (fora desta migration).

### Índices (D-22) — sintaxe e verificação de duplicata

```sql
-- 1. Novo — resolve DISTINCT ON e janelas por produto (Pattern 1).
--    Substitui o uso do índice existente stock_snapshots_tenant_date
--    para este acesso específico; NÃO remover o índice antigo, ele
--    ainda serve o filtro de janela sem agrupamento por produto usado
--    em outras queries.
CREATE INDEX IF NOT EXISTS idx_stock_snapshots_tenant_product_date
  ON stock_snapshots (tenant_id, product_code, snapshot_date DESC);

-- 2. Novo — chave da junção D-07. Confirmado inexistente: o único índice
--    hoje sobre order_ref é o UNIQUE CONSTRAINT
--    uq_sales_records_tenant_period_ref (tenant_id, period_id, order_ref),
--    que NÃO cobre eficientemente um filtro por (tenant_id, order_ref)
--    sem period_id — order_ref não é a coluna líder nem a segunda.
CREATE INDEX IF NOT EXISTS idx_sales_records_tenant_order_ref
  ON sales_records (tenant_id, order_ref);

-- 3. Verificar antes de criar — idx_sales_records_tenant_id já existe
--    (20260601000002_hardening_and_unification.sql:120), cobrindo só
--    tenant_id. Um índice (tenant_id, sale_date) é mais específico e
--    não duplica o anterior (prefixo diferente) — criar via IF NOT EXISTS
--    é seguro de qualquer forma.
CREATE INDEX IF NOT EXISTS idx_sales_records_tenant_sale_date
  ON sales_records (tenant_id, sale_date);

-- 4. Novo — agregação por produto. Existente hoje: sale_items_period_vendor
--    (tenant_id, period_id, vendor_id) e idx_sale_items_period_id
--    (period_id) — nenhum cobre (tenant_id, product_code).
CREATE INDEX IF NOT EXISTS idx_sale_items_tenant_product
  ON sale_items (tenant_id, product_code);
```

## State of the Art

| Abordagem antiga (não usar) | Abordagem atual (usar) | Motivo |
|---|---|---|
| Subquery correlacionada `MAX(snapshot_date)` + self-join para pegar a linha mais recente | `DISTINCT ON` | Uma passada, sem join extra; idiomático desde Postgres 9.x, sem mudança recente — não é "novo", é apenas o padrão correto vs. o padrão ingênuo |
| Loop `plpgsql` para acumulado (curva ABC) | Window function `SUM() OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING)` | Window functions com frame `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` são padrão SQL desde Postgres 8.4 — mesma observação, escolha de padrão correto |

Não há mudança de versão do Postgres relevante para esta fase — todas as construções usadas (`DISTINCT ON`, window functions, `FILTER (WHERE ...)`, `generate_series`, `NULLIF`) existem desde Postgres 9.4 ou antes, e o projeto já roda em Supabase managed Postgres (tipicamente 15+). Não há uso de recursos "de ponta" (ex. `MERGE`, introduzido no Postgres 15) necessário aqui.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | Versão do Postgres do projeto Supabase (`zsczxblhtdhpdqvkpuwz`) é 15+ | Standard Stack | Baixo — todas as construções usadas são compatíveis com Postgres 9.4+; o risco só existiria se o projeto rodasse uma versão muito antiga, o que é improbável em um projeto Supabase criado em 2026 |
| A2 | `sales_records.order_ref` é `text` (não `bigint`/`uuid`) | Standard Stack / Pattern | Baixo — inferido do uso consistente em código (`elem->>'order_ref'`, comparação direta com `sale_items.order_id text`) e da presença em `UNIQUE (tenant_id, period_id, order_ref)` sem cast; nunca visto um `CREATE TABLE sales_records` completo nas migrations rastreadas (schema pré-data o histórico de migrations, conforme nota em STATE.md sobre "drift legado ~45 versões") |
| A3 | Taxa de órfãos `order_ref` em produção é baixa o suficiente para não exigir fallback | Common Pitfalls / R-01 | Alto se errado — se a taxa for material, `product_daily_sales` subestima venda silenciosamente e infla DoS/turnover para todos os produtos. **Não verificado nesta sessão** — query de diagnóstico está pronta, mas não há acesso a ferramenta de banco neste researcher. Tratar como bloqueante de Wave 0 no plano. |
| A4 | Custo de execução das 4 views (`EXPLAIN ANALYZE`) fica abaixo de ~2s com os volumes atuais (63.906 sales_records) sem materialização | Architecture Patterns / R-02 | Médio — se errado, a Fase 09 sofre latência perceptível a cada render de Server Component; mitigação (materialized view) está desenhada mas não implementada nesta fase a priori, por decisão explícita do CONTEXT |
| A5 | `periods.id` não é garantidamente monotônico com `(year, month)` por tenant, por isso o seed usa `ORDER BY year DESC, month DESC` em vez de `MAX(id)` | Code Examples (seed) | Baixo — é uma escolha defensiva; se `id` for de fato sempre monotônico, o resultado é idêntico, só um pouco mais verboso |

**Se esta tabela parecer vazia:** não está — A3 e A4 são os dois riscos que o próprio `08-CONTEXT.md` já sinalizava (R-01, R-02) e que esta pesquisa não pôde resolver por falta de acesso a ferramentas de banco de dados na sessão. Isso não é uma lacuna desta pesquisa especificamente — é uma limitação de ambiente que o plano deve herdar como tarefa de Wave 0 executável (o executor de fase normalmente tem acesso a MCP Supabase).

## Open Questions (RESOLVED via Wave 0 — ver 08-00-PLAN.md)

1. **Taxa real de órfãos `order_ref` em produção** — ✅ RESOLVIDO operacionalmente pelo Plano 08-00 (Wave 0): a query de diagnóstico de órfãos roda via MCP `execute_sql` antes de `product_daily_sales`; a decisão (aceitar taxa baixa vs. fallback) é registrada no 08-00.
   - O que sabemos: a junção `sale_items.order_id = sales_records.order_ref` já é usada em produção (`client_category_mix`), então uma taxa alta de órfãos já afetaria essa view existente hoje — não há relato de bug conhecido sobre isso no STATE.md, o que é um sinal fraco (não uma prova) de que a taxa é baixa.
   - O que é incerto: o número exato, e se ele varia por tenant/período de ingest (upload manual antigo vs. API nova).
   - Recomendação: rodar a query de diagnóstico (seção Code Examples) como primeira tarefa do plano, antes de escrever `product_daily_sales`. Se a taxa for < 1%, seguir com D-08 como está (excluir órfãos). Se for maior, decidir entre as duas opções já listadas no R-01 do CONTEXT.

2. **Custo real das views em produção (`EXPLAIN ANALYZE`)** — ✅ RESOLVIDO operacionalmente pelo Plano 08-00 (Wave 0): `EXPLAIN ANALYZE` das 4 views roda após os índices D-22; se >2s, a decisão de materialização é registrada no 08-00.
   - O que sabemos: 63.906 registros em `sales_records` hoje, mais `sale_items` (volume não confirmado, mas correlacionado), mais um snapshot diário por produto desde a Fase 07 (poucas semanas de histórico, portanto `stock_snapshots` ainda é pequeno — o que é bom para R-02 no curto prazo, mas o volume só cresce).
   - O que é incerto: se os índices de D-22 sozinhos bastam ou se a v1 de `product_inventory_metrics` já precisa de materialização mesmo com dataset pequeno (ex., por causa de um plano de query ruim independente de volume).
   - Recomendação: medir com `EXPLAIN ANALYZE` **depois** de criar os índices de D-22, nunca antes — comparar with/without para confirmar que os índices realmente resolvem o gargalo antes de considerar materialização.

3. **`product_costs` seed cobre quantos SKUs?** (R-04) — ✅ RESOLVIDO operacionalmente pelo Plano 08-00 (Wave 0): a contagem de SKUs do período mais recente vs. histórico completo roda via MCP e dimensiona o gap antes de aceitar o seed simples.
   - O que sabemos: o seed do Code Examples usa o período mais recente por tenant de `products`.
   - O que é incerto: quantos `product_code` distintos existem no período mais recente vs. no histórico completo — se o catálogo mais recente for parcial (upload incompleto), produtos vendidos historicamente mas ausentes do catálogo mais recente ficam sem custo no dia 1, mesmo existindo em `products` de períodos antigos.
   - Recomendação: no plano, rodar `SELECT count(DISTINCT product_code) FROM products WHERE tenant_id = X AND period_id = <mais recente>` vs. `SELECT count(DISTINCT product_code) FROM products WHERE tenant_id = X` para dimensionar o gap antes de aceitar o seed simples do período mais recente como suficiente.

## Environment Availability

| Dependência | Requerida por | Disponível | Versão | Fallback |
|---|---|---|---|---|
| Supabase CLI | Gestão local de migrations | ✓ [VERIFIED] | 2.109.1 | — |
| `supabase/config.toml` (stack local) | `supabase db push`/desenvolvimento local | ✗ [VERIFIED: ausente] | — | Projeto usa MCP `apply_migration` + `migration repair` direto no remoto (padrão já documentado em STATE.md: "drift legado ~45 versões... usar MCP apply_migration + repair pontual") |
| Extensão `pg_cron` | Só se R-02 exigir materialização com refresh agendado | ✗ [VERIFIED: nenhuma `CREATE EXTENSION pg_cron` encontrada nas migrations] | — | Fora do escopo desta fase (Deferred); se necessário no futuro, habilitar via `CREATE EXTENSION IF NOT EXISTS pg_cron` (disponível no Supabase managed) ou usar cron externo (Vercel Cron) chamando uma rota que roda `REFRESH MATERIALIZED VIEW` |
| Acesso a ferramenta de banco (execute_sql/MCP Supabase) nesta sessão de pesquisa | Medir R-01 (órfãos) e R-02 (EXPLAIN ANALYZE) | ✗ [não disponível para o agente de pesquisa neste ambiente] | — | Queries prontas na seção Code Examples; delegar execução para Wave 0 do plano (o agente executor de fase tipicamente tem acesso a MCP Supabase) |

**Dependências faltando com fallback:** `pg_cron` (fora de escopo, Deferred) e acesso a ferramenta de banco nesta pesquisa (delegado ao plano/execução).

**Dependências faltando sem fallback:** nenhuma — nenhuma dependência bloqueante para *escrever* as migrations desta fase; o bloqueio só existiria para *medir* R-01/R-02 antes de decidir sobre materialização, e mesmo isso tem caminho de resolução (Wave 0 do plano).

## Validation Architecture

> `nyquist_validation` ausente em `.planning/config.json` → tratado como habilitado.

### Test Framework

| Propriedade | Valor |
|---|---|
| Framework de testes do projeto | Vitest 4.1.9 [VERIFIED: package.json] — usado hoje só para lógica TypeScript (mocks de `createAdminClient()`), nenhum teste SQL/pgTAP existe no repositório |
| Config file | `vitest.config.ts` (raiz do projeto) |
| Comando rápido | `npm run test` (roda todos os testes Vitest) |
| Suíte SQL desta fase | **Não existe** — é o Wave 0 gap principal desta fase (ver abaixo) |

Esta fase **não produz código TypeScript** (D-20), então a suíte Vitest existente não pode validar as fórmulas matemáticas — as métricas vivem inteiramente em SQL. A estratégia de validação correta é **SQL com dados sintéticos**, não um teste Vitest mockado (que só validaria forma de chamada, não os números calculados pelo Postgres).

### Estratégia recomendada: script SQL de verificação com dados sintéticos

Como o projeto não tem pgTAP nem stack Supabase local configurada (`supabase/config.toml` ausente), a validação mais viável dentro das constraints do projeto ("não manipular o banco diretamente", migrations imutáveis) é:

1. Um arquivo **não-migration** (ex. `supabase/tests/08_inventory_metrics_verify.sql`, fora de `supabase/migrations/`) contendo:
   - `BEGIN;` no topo, `ROLLBACK;` no fim — nunca commitar dados sintéticos no banco real.
   - Insert de um tenant de teste, produtos, `product_costs`, `stock_snapshots` e `sale_items`/`sales_records` com valores desenhados para que DoS/WoS/giro/ABC/movement_class tenham resultado calculável à mão.
   - Blocos `DO $$ BEGIN ... IF <valor calculado> <> <valor esperado> THEN RAISE EXCEPTION '...'; END IF; END $$;` por métrica — um assert por fórmula (D-10 a D-18).
   - Executar via Supabase MCP `execute_sql` (a transação garante que nada persiste) ou via `psql` local apontando para o projeto de staging, se existir.
2. Isso cobre exatamente o que R-01/R-02/D-16 (aresta do lucro negativo) exigem sem precisar instalar pgTAP nem configurar Supabase local — usa só SQL padrão já disponível.

### Phase Requirements → Test Map

| Decisão | Comportamento | Tipo de teste | Comando/Execução | Existe hoje? |
|---|---|---|---|---|
| D-10/D-11 (ADS/DoS/WoS) | DoS = current_qty/ADS com NULL quando ADS=0 | SQL sintético | Bloco `DO $$` no script de verificação | ❌ Wave 0 |
| D-12 (Giro) | turnover NULL sem `unit_cost`; cálculo correto com custo | SQL sintético | idem | ❌ Wave 0 |
| D-13 (Cobertura) | `cobertura_pct` distinto de DoS; NULL sem snapshot na janela | SQL sintético | idem | ❌ Wave 0 |
| D-14 (Quebra) | dia sem snapshot não conta nem a favor nem contra | SQL sintético | idem | ❌ Wave 0 |
| D-15 (movement_class) | ordem de precedência `dead > slow > fast > normal` respeitada em caso de sobreposição | SQL sintético (produto desenhado para 2 categorias) | idem | ❌ Wave 0 |
| D-16 (ABC) | fallback para receita quando custo ausente; produto com lucro negativo cai em `C` sem quebrar `cum_pct` de outros | SQL sintético | idem | ❌ Wave 0 |
| D-17/D-18 (stock_status/has_cost) | NULL propaga corretamente, nunca vira 0 | SQL sintético | idem | ❌ Wave 0 |
| D-07/D-08 (órfãos) | taxa de órfãos medida contra produção | Diagnóstico read-only | query da seção Code Examples via MCP `execute_sql` | ❌ Wave 0 (é diagnóstico, não teste de regressão) |
| D-21 (segurança de view) | `anon`/`authenticated` sem SELECT; `service_role` com SELECT | SQL de verificação de grants | `SELECT has_table_privilege('anon', 'product_inventory_metrics', 'SELECT')` deve retornar `false` | ❌ Wave 0 |
| D-22 (índices) | índices criados e usados (sem sort extra no `DISTINCT ON`) | `EXPLAIN ANALYZE` manual | comando da seção Open Questions #2 | ❌ Wave 0 |

### Sampling Rate

- **Por task/migration:** rodar o script de verificação SQL completo (todas as fórmulas) após cada migration que altera uma view/RPC — é barato (transação com `ROLLBACK`, poucos segundos).
- **Por wave:** rodar `EXPLAIN ANALYZE` das 4 views contra o tenant de produção real (read-only) para confirmar que os índices resolvem R-02.
- **Gate de fase:** script de verificação SQL 100% verde + diagnóstico de órfãos (R-01) documentado com decisão explícita (aceitar taxa baixa OU implementar fallback) antes de `/gsd-verify-work`.

### Wave 0 Gaps

- [ ] `supabase/tests/08_inventory_metrics_verify.sql` — script de verificação com dados sintéticos, cobrindo D-10 a D-19 (não é migration, não entra em `supabase/migrations/`)
- [ ] Query de diagnóstico de órfãos `order_ref` executada contra produção via MCP (R-01) — resultado documentado no plano ou em um novo `08-VALIDATION.md`
- [ ] `EXPLAIN ANALYZE` das 4 views contra produção, depois de D-22 aplicado (R-02) — resultado documentado
- [ ] Nenhuma instalação de framework necessária — tudo é SQL puro executável via MCP `execute_sql` ou `psql`

## Sources

### Primary (HIGH confidence — leitura direta do código/schema deste repositório)
- `supabase/migrations/20260626171308_profit_commission.sql` — `products`, `sale_items`, view `vendor_summary` (padrão de agregação + grants)
- `supabase/migrations/20260714000001_api_keys_and_stock_snapshots.sql` — `stock_snapshots`, `ingest_sales_records`, padrão RLS `tenant_isolation`
- `supabase/migrations/20260601000019_p0_security_closeout.sql` — padrão `REVOKE/GRANT`, `SET search_path`, RPC `vendor_evolution`
- `supabase/migrations/20260528_multi_tenant_arch.sql` — `store_daily_evolution_multi` (modelo de assinatura RPC citado no `<contract>`), `client_portfolio`
- `supabase/migrations/20260603000022_perf_rls_initplan_wrap_auth_calls.sql` — padrão `(SELECT auth.uid())`
- `supabase/migrations/20260603000021_perf_add_covering_indexes_for_fks.sql`, `20260701234500_index_fk_products_sale_items_period_id.sql` — índices já existentes (evitar duplicata)
- `supabase/migrations/20260601000002_hardening_and_unification.sql`, `20260601000003_hardening_definitivo.sql` — `idx_sales_records_tenant_id`, `uq_sales_records_tenant_period_ref` (confirma `order_ref` como coluna e tipo)
- `supabase/migrations/20260627000000_carteira_category.sql` — junção `sale_items.order_id = sales_records.order_ref` já em produção (view `client_category_mix`)
- `src/app/api/v1/sales/route.ts`, `src/app/api/admin/parse-upload/route.ts` — confirma gravação de `order_ref`/`order_id` nos dois pontos de ingest (D-07)
- `src/lib/supabase/admin.ts` — `createAdminClient()`
- `package.json`, `vitest.config.ts` — stack de testes existente
- `.planning/config.json`, `.planning/PROJECT.md`, `.planning/STATE.md` — constraints do projeto, volume de dados em produção (63.906 registros)

### Secondary (MEDIUM confidence)
- Versão do Supabase CLI (2.109.1) verificada via `npx supabase --version` neste ambiente — não é a versão do Postgres do projeto remoto, apenas da ferramenta cliente.

### Tertiary (LOW confidence — sinalizado no Assumptions Log)
- Versão exata do Postgres do projeto `zsczxblhtdhpdqvkpuwz` (A1).
- Taxa de órfãos `order_ref` em produção (A3) — não medida.
- Custo real de execução das views (A4) — não medido.

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — nenhuma lib nova, tudo já confirmado no `package.json`/migrations existentes.
- Architecture Patterns: HIGH — todos os padrões (DISTINCT ON, window functions, NULLIF, grants, assinatura de RPC) são replicação direta de código já em produção neste mesmo repositório.
- Pitfalls: MEDIUM-HIGH — derivados de análise cuidadosa das fórmulas do CONTEXT contra idiomas conhecidos do Postgres; não testados em produção nesta sessão.
- Validation Architecture: MEDIUM — estratégia é sólida (SQL sintético em transação com rollback) mas é uma proposta nova para o projeto (não existe precedente de teste SQL no repositório hoje).

**Research date:** 2026-07-20
**Valid until:** ~30 dias (schema estável; risco de invalidação principal é mudança de volume de dados em produção, que pode alterar a resposta de R-02)
