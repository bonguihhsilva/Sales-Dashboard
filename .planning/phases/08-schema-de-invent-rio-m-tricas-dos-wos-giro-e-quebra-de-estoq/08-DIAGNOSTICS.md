# Fase 08 — Diagnósticos de produção (Plano 08-00)

**Status geral: EXECUTADO** em 2026-07-20 via Supabase MCP `execute_sql` (read-only) pelo orquestrador, contra o banco de produção `zsczxblhtdhpdqvkpuwz`. Nenhuma escrita ocorreu. Números reais abaixo.

## Achado dominante: dados de item/estoque ZERADOS em produção

Contagem das tabelas base no momento do diagnóstico:

| Tabela | Linhas |
|---|---|
| `sales_records` | 120 (vendas agregadas de upload CEC) |
| `sale_items` | **0** |
| `products` | **0** |
| `stock_snapshots` | **0** |
| `periods` | 2 |
| `tenants` | 2 |

Além disso: **todos os 120 `sales_records` têm `order_ref = NULL`** (`distinct_order_refs = 0`; `sales_records_sem_orderref = 120`). Os uploads CEC atuais não gravam `order_ref`.

**Consequência para a fase:** as views de velocidade (`product_daily_sales`, `product_inventory_metrics`, `product_abc_curve`) e de estoque nascerão CORRETAS porém VAZIAS em produção. A junção D-07/D-08 (`sale_items.order_id = sales_records.order_ref`) só produz linhas quando line items entrarem via `POST /api/v1/sales` da Fase 07 (que grava `order_ref` em `sales_records` E `order_id` em `sale_items`). O catálogo `products`/custo entra via `upload-catalog` (D-03) e edição manual (Fase 09). O estoque entra via `POST /api/v1/stock`. Nada disso tem dado real hoje.

Isto NÃO bloqueia a Fase 08 — o schema deve ser construído para receber o dado. Bloqueia sim a percepção de "pronto para uso com dados": o setor do comprador exibirá estados vazios até que sistemas externos empurrem line items + estoque pela API de ingest.

---

## R-01 — Taxa de órfãos `order_ref` (sale_items sem sales_records correspondente)

### Query 1 — taxa de órfãos por tenant

```sql
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

**Resultado (2026-07-20):** `[]` — zero linhas. `sale_items` está vazia (0 linhas), então não há órfão a medir. `orphan_pct` efetivo = **0%** (trivial, por ausência de dado de item).

### Query 2 — fan-out de `order_ref` (order_ref duplicado com datas de venda diferentes)

```sql
SELECT tenant_id, count(*) AS dup_order_refs
FROM (
  SELECT tenant_id, order_ref, count(DISTINCT sale_date) AS n
  FROM sales_records
  GROUP BY tenant_id, order_ref
  HAVING count(DISTINCT sale_date) > 1
) x
GROUP BY tenant_id;
```

**Resultado (2026-07-20):** `order_refs_fanout = 1` grupo, porém `distinct_order_refs = 0` e `sales_records_sem_orderref = 120` — todos os `order_ref` são NULL. O "1" do fan-out é o próprio grupo NULL agregando as 120 linhas; não é fan-out real de order_ref válido. Sem `order_ref` não-nulo, não há chave de junção populada hoje.

### DECISÃO (2026-07-20): SEGUIR D-08 COMO ESTÁ — não bloqueante

`orphan_pct = 0%` (bem abaixo do corte de 1%), por ausência de line items. Nenhuma escalação necessária. O Plano 08-02 implementa `product_daily_sales` com a junção D-08 e `DISTINCT ON` em `sales_records` conforme planejado — a view nasce vazia e passa a produzir linhas quando `POST /api/v1/sales` gravar `order_ref` + `order_id` casados. Caveat registrado no achado dominante acima: uploads CEC legados (order_ref NULL) nunca entram na view; só ingest via API. Isso é aceitável para o MVP (a fonte primária de line-item/estoque é a API da Fase 07, não o upload CEC agregado).

---

## R-04 — Cobertura do seed de `product_costs`

### Query 1 — SKUs no período mais recente vs. histórico total, e SKUs sem custo no período recente

```sql
WITH latest_period AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, id AS period_id
  FROM periods
  ORDER BY tenant_id, year DESC, month DESC
)
SELECT
  p.tenant_id,
  count(DISTINCT p.product_code) FILTER (WHERE p.period_id = lp.period_id) AS skus_periodo_recente,
  count(DISTINCT p.product_code)                                            AS skus_historico_total,
  count(DISTINCT p.product_code) FILTER (WHERE p.cost_price IS NULL AND p.period_id = lp.period_id) AS skus_recente_sem_custo
FROM products p
JOIN latest_period lp ON lp.tenant_id = p.tenant_id
GROUP BY p.tenant_id;
```

**Resultado (2026-07-20):** `products` está vazia (0 linhas). `skus_periodo_recente = 0`, `skus_historico_total = 0`, `skus_recente_sem_custo = 0`, `products_com_custo = 0`.

### Query 2 — produtos vendidos historicamente mas ausentes do catálogo mais recente (ficariam sem custo no dia 1)

```sql
WITH latest_period AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, id AS period_id
  FROM periods ORDER BY tenant_id, year DESC, month DESC
)
SELECT si.tenant_id, count(DISTINCT si.product_code) AS vendidos_sem_catalogo_recente
FROM sale_items si
LEFT JOIN products p
  ON p.tenant_id = si.tenant_id
 AND p.product_code = si.product_code
 AND p.period_id = (SELECT period_id FROM latest_period lp WHERE lp.tenant_id = si.tenant_id)
WHERE p.product_code IS NULL
GROUP BY si.tenant_id;
```

**Resultado (2026-07-20):** `sale_items` vazia → `vendidos_sem_catalogo_recente = 0`.

### Conclusão R-04 (2026-07-20): seed é NO-OP hoje — sem bloqueio

Com `products = 0`, o seed inicial de `product_costs` a partir do período mais recente (D-03) insere **zero linhas**. `product_costs` nasce vazia e será populada por (a) `upload-catalog` quando o dono subir um catálogo com custo, e (b) edição manual na Fase 09. Nenhum `stock_value`/`turnover` será confiável até haver catálogo com `cost_price` — mas isso é esperado e não bloqueia a construção do schema. Ação para o dono (fora da Fase 08): subir um catálogo atualizado com custos via `upload-catalog` para que as métricas monetárias saiam de NULL. Registrado como caveat de "dados", não de "schema".

---

## Resumo para o orquestrador / próximo executor

| Item | Status |
|---|---|
| R-01 — taxa de órfãos `order_ref` | RESOLVIDO — 0% (sale_items vazia) |
| R-01 — fan-out de `order_ref` | RESOLVIDO — inexistente (order_ref todo NULL) |
| R-01 — decisão D-08 (excluir órfãos vs. fallback) | RESOLVIDO — seguir D-08 como está; não bloqueante |
| R-04 — cobertura do seed | RESOLVIDO — seed é no-op (products vazia); popular via upload-catalog |
| Nenhuma escrita no banco | Confirmado — só SELECT/COUNT read-only |

**Conclusão:** desbloqueado para o Plano 08-02. As views nascem vazias e corretas; a percepção de "pronto com dados" depende de ingest real (line items via `POST /api/v1/sales`, estoque via `POST /api/v1/stock`, catálogo via `upload-catalog`) — caveat de dados registrado, não de schema.
