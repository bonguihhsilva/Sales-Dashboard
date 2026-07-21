-- Phase 08: ranking de VENDAS por produto e loja (D-23).
-- ÚNICA view da fase com store. Sem vendor_id. Puramente venda — nenhuma
-- métrica de estoque cruza aqui.
CREATE OR REPLACE VIEW product_sales_ranking AS
WITH settings AS (
  SELECT t.id AS tenant_id, COALESCE(s.long_window_days, 90) AS l
  FROM tenants t
  LEFT JOIN inventory_settings s ON s.tenant_id = t.id
),
order_meta AS (
  SELECT DISTINCT ON (sr.tenant_id, sr.order_ref)
    sr.tenant_id, sr.order_ref, sr.sale_date, sr.store
  FROM sales_records sr
  ORDER BY sr.tenant_id, sr.order_ref, sr.sale_date
),
prod_name AS (
  SELECT DISTINCT ON (p.tenant_id, p.product_code)
    p.tenant_id, p.product_code, p.name
  FROM products p
  ORDER BY p.tenant_id, p.product_code, p.period_id DESC
)
SELECT
  si.tenant_id,
  si.product_code,
  COALESCE(pc.name, pn.name, si.product_code) AS product_name,
  om.store,
  sum(si.qty)          AS qty_sold,
  sum(si.total_price)  AS revenue,
  sum(si.total_profit) AS profit,
  st.l                 AS window_days
FROM sale_items si
JOIN order_meta om ON om.tenant_id = si.tenant_id AND om.order_ref = si.order_id
JOIN settings st   ON st.tenant_id = si.tenant_id
LEFT JOIN product_costs pc ON pc.tenant_id = si.tenant_id AND pc.product_code = si.product_code
LEFT JOIN prod_name pn     ON pn.tenant_id = si.tenant_id AND pn.product_code = si.product_code
WHERE om.sale_date >= CURRENT_DATE - st.l
GROUP BY si.tenant_id, si.product_code,
         COALESCE(pc.name, pn.name, si.product_code), om.store, st.l;

REVOKE ALL ON public.product_sales_ranking FROM anon, authenticated;
GRANT SELECT ON public.product_sales_ranking TO service_role;
