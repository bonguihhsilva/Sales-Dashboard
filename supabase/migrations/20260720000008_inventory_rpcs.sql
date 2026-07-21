-- Phase 08: RPCs de inventário (D-20). SECURITY INVOKER (default), p_tenant_id explícito.

-- ── 1. product_stock_history: série temporal de um produto ─────────────────
-- Uma linha por dia do intervalo, incluindo dias sem snapshot (quantity NULL)
-- para o gráfico não mentir sobre continuidade (Pitfall 5).
CREATE OR REPLACE FUNCTION product_stock_history(
  p_tenant_id    uuid,
  p_product_code text,
  p_days         integer DEFAULT 90
)
RETURNS TABLE(day date, quantity numeric, qty_sold numeric)
LANGUAGE sql
SET search_path = public
AS $$
  -- generate_series é set-returning: não pode levar ::date direto no FROM
  -- (erro 42601). O cast vai no SELECT e nas condições de junção.
  SELECT
    g.day::date AS day,
    s.quantity,
    COALESCE(ds.qty_sold, 0) AS qty_sold
  FROM generate_series(CURRENT_DATE - p_days, CURRENT_DATE, interval '1 day') AS g(day)
  LEFT JOIN stock_snapshots s
    ON s.tenant_id = p_tenant_id
   AND s.product_code = p_product_code
   AND s.snapshot_date = g.day::date
  LEFT JOIN product_daily_sales ds
    ON ds.tenant_id = p_tenant_id
   AND ds.product_code = p_product_code
   AND ds.sale_date = g.day::date
  ORDER BY g.day;
$$;

REVOKE ALL ON FUNCTION public.product_stock_history(uuid, text, integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.product_stock_history(uuid, text, integer) TO service_role;

-- ── 2. inventory_summary: KPIs de topo da tela /dashboard/compras ──────────
CREATE OR REPLACE FUNCTION inventory_summary(p_tenant_id uuid)
RETURNS TABLE(
  total_skus         integer,
  total_stock_value  numeric,
  skus_sem_custo     integer,
  skus_em_quebra     integer,
  skus_parados       integer,
  skus_stale         integer,
  dos_medio          numeric,
  turnover_medio     numeric
)
LANGUAGE sql
SET search_path = public
AS $$
  SELECT
    count(*)::integer                                        AS total_skus,
    sum(stock_value)                                         AS total_stock_value,
    count(*) FILTER (WHERE NOT has_cost)::integer            AS skus_sem_custo,
    count(*) FILTER (WHERE is_stockout_now)::integer         AS skus_em_quebra,
    count(*) FILTER (WHERE movement_class = 'dead')::integer AS skus_parados,
    count(*) FILTER (WHERE stock_status = 'stale')::integer  AS skus_stale,
    round(avg(dos), 1)                                       AS dos_medio,
    round(avg(turnover), 2)                                  AS turnover_medio
  FROM product_inventory_metrics
  WHERE tenant_id = p_tenant_id;
$$;

REVOKE ALL ON FUNCTION public.inventory_summary(uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.inventory_summary(uuid) TO service_role;
