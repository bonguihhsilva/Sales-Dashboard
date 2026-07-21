-- Phase 08: série de venda diária por produto (D-07/D-08/D-09).
-- Insumo de todas as métricas de velocidade. Sem loja (métricas são tenant-wide).
CREATE OR REPLACE VIEW product_daily_sales AS
WITH order_dates AS (
  -- Uma sale_date por order_ref (elimina fan-out de order_ref duplicado).
  SELECT DISTINCT ON (sr.tenant_id, sr.order_ref)
    sr.tenant_id, sr.order_ref, sr.sale_date
  FROM sales_records sr
  ORDER BY sr.tenant_id, sr.order_ref, sr.sale_date
)
SELECT
  si.tenant_id,
  si.product_code,
  od.sale_date,
  sum(si.qty)                 AS qty_sold,
  sum(si.total_price)         AS revenue,
  sum(si.qty * si.unit_cost)  AS cogs,     -- NULL nas linhas sem unit_cost
  sum(si.total_profit)        AS profit    -- NULL só se todas as linhas do grupo forem NULL
FROM sale_items si
JOIN order_dates od
  ON  od.tenant_id = si.tenant_id
  AND od.order_ref = si.order_id           -- órfãos (sem match) são EXCLUÍDOS (D-08)
GROUP BY si.tenant_id, si.product_code, od.sale_date;

REVOKE ALL ON public.product_daily_sales FROM anon, authenticated;
GRANT SELECT ON public.product_daily_sales TO service_role;
