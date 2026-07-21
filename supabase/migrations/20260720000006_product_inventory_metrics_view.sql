-- Phase 08: view principal de métricas de inventário (D-10 a D-19).
-- Uma linha por (tenant_id, product_code). NULL = desconhecido, NUNCA zero.
-- R-06: quantidade negativa do snapshot NÃO é saneada (sem GREATEST(quantity,0));
--       stock_value negativo é exposto de propósito como sinal de erro de integração do ERP.
CREATE OR REPLACE VIEW product_inventory_metrics AS
WITH settings AS (
  SELECT t.id AS tenant_id,
    COALESCE(s.sales_window_days, 30)   AS w,
    COALESCE(s.long_window_days, 90)    AS l,
    COALESCE(s.fast_mover_dos_max, 15)  AS fast_max,
    COALESCE(s.slow_mover_dos_min, 120) AS slow_min,
    COALESCE(s.dead_stock_days, 90)     AS dead_days,
    COALESCE(s.stale_snapshot_days, 7)  AS stale_days
  FROM tenants t
  LEFT JOIN inventory_settings s ON s.tenant_id = t.id
),
latest_snapshot AS (   -- D-17: snapshot mais recente por produto (Pattern 1)
  SELECT DISTINCT ON (ss.tenant_id, ss.product_code)
    ss.tenant_id, ss.product_code,
    ss.quantity      AS current_qty,
    ss.snapshot_date AS last_snapshot_date
  FROM stock_snapshots ss
  ORDER BY ss.tenant_id, ss.product_code, ss.snapshot_date DESC
),
window_snapshots AS (  -- D-13/D-14: contagem de dias — CTE isolada (Pitfall 2)
  SELECT ss.tenant_id, ss.product_code,
    count(*) FILTER (WHERE ss.snapshot_date >= CURRENT_DATE - st.w) AS dias_com_snapshot,
    count(*) FILTER (WHERE ss.snapshot_date >= CURRENT_DATE - st.w AND ss.quantity > 0)  AS dias_com_estoque,
    count(*) FILTER (WHERE ss.snapshot_date >= CURRENT_DATE - st.w AND ss.quantity <= 0) AS stockout_days
  FROM stock_snapshots ss
  JOIN settings st ON st.tenant_id = ss.tenant_id
  WHERE ss.snapshot_date >= CURRENT_DATE - GREATEST(st.w, 365)
  GROUP BY ss.tenant_id, ss.product_code
),
avg_inv AS (           -- D-12: média de estoque valorizado (snapshots existentes)
  SELECT ss.tenant_id, ss.product_code,
    avg(ss.quantity * pc.unit_cost) AS avg_inventory
  FROM stock_snapshots ss
  JOIN settings st ON st.tenant_id = ss.tenant_id
  LEFT JOIN product_costs pc ON pc.tenant_id = ss.tenant_id AND pc.product_code = ss.product_code
  WHERE ss.snapshot_date >= CURRENT_DATE - st.l
  GROUP BY ss.tenant_id, ss.product_code
),
window_sales AS (      -- D-10/D-12/D-15: janelas W, L e dead_days (Pattern 3)
  SELECT ds.tenant_id, ds.product_code,
    sum(ds.qty_sold) FILTER (WHERE ds.sale_date >= CURRENT_DATE - st.w) AS qty_sold_short,
    sum(ds.qty_sold) FILTER (WHERE ds.sale_date >= CURRENT_DATE - st.l) AS qty_sold_long,
    sum(ds.revenue)  FILTER (WHERE ds.sale_date >= CURRENT_DATE - st.w) AS revenue_short,
    sum(ds.revenue)  FILTER (WHERE ds.sale_date >= CURRENT_DATE - st.l) AS revenue_long,
    sum(ds.profit)   FILTER (WHERE ds.sale_date >= CURRENT_DATE - st.l) AS profit_long,
    sum(ds.cogs)     FILTER (WHERE ds.sale_date >= CURRENT_DATE - st.l) AS cogs_long,
    sum(ds.qty_sold) FILTER (WHERE ds.sale_date >= CURRENT_DATE - st.dead_days) AS qty_sold_dead_window
  FROM product_daily_sales ds
  JOIN settings st ON st.tenant_id = ds.tenant_id
  WHERE ds.sale_date >= CURRENT_DATE - GREATEST(st.l, st.dead_days, 365)
  GROUP BY ds.tenant_id, ds.product_code
),
universe AS (          -- D-19: união das três fontes
  SELECT tenant_id, product_code FROM latest_snapshot
  UNION
  SELECT tenant_id, product_code FROM window_sales
  UNION
  SELECT tenant_id, product_code FROM product_costs
),
prod_name AS (         -- D-19: nome mais recente de products
  SELECT DISTINCT ON (p.tenant_id, p.product_code) p.tenant_id, p.product_code, p.name
  FROM products p
  ORDER BY p.tenant_id, p.product_code, p.period_id DESC
),
computed AS (
  SELECT
    u.tenant_id,
    u.product_code,
    COALESCE(pc.name, pn.name, u.product_code) AS product_name,
    CASE WHEN ls.product_code IS NULL THEN NULL ELSE ls.current_qty END AS current_qty,
    ls.last_snapshot_date,
    CASE WHEN ls.last_snapshot_date IS NULL THEN NULL
         ELSE (CURRENT_DATE - ls.last_snapshot_date) END::integer AS snapshot_staleness_days,
    CASE
      WHEN ls.product_code IS NULL THEN 'unknown'
      WHEN (CURRENT_DATE - ls.last_snapshot_date) <= st.stale_days THEN 'ok'
      ELSE 'stale'
    END AS stock_status,
    pc.unit_cost,
    (pc.unit_cost IS NOT NULL) AS has_cost,
    CASE WHEN ls.product_code IS NULL OR pc.unit_cost IS NULL THEN NULL
         ELSE ls.current_qty * pc.unit_cost END AS stock_value,
    COALESCE(ws.qty_sold_short, 0) AS qty_sold_short,
    COALESCE(ws.qty_sold_long, 0)  AS qty_sold_long,
    COALESCE(ws.revenue_short, 0)  AS revenue_short,
    COALESCE(ws.revenue_long, 0)   AS revenue_long,
    CASE WHEN COALESCE(ws.qty_sold_long, 0) = 0 THEN 0 ELSE ws.profit_long END AS profit_long,  -- D-18: 0 (não NULL) quando zero vendas com custo conhecido
    (COALESCE(ws.qty_sold_short, 0)::numeric / st.w) AS ads,   -- D-10: denominador W fixo
    round(
      (CASE WHEN ls.product_code IS NULL THEN NULL
            ELSE ls.current_qty / NULLIF(COALESCE(ws.qty_sold_short, 0)::numeric / st.w, 0)
       END)::numeric, 1
    ) AS dos,                                                  -- D-11: NULL quando ADS=0
    ((CASE WHEN COALESCE(ws.qty_sold_long, 0) = 0 THEN 0 ELSE ws.cogs_long END) / NULLIF(ai.avg_inventory, 0)) AS turnover,  -- D-12: NULL quando avg_inventory NULL (custo ausente); 0 quando zero vendas com custo conhecido (D-18)
    ((CASE WHEN COALESCE(ws.qty_sold_long, 0) = 0 THEN 0 ELSE ws.cogs_long END) / NULLIF(ai.avg_inventory, 0)) * (365.0 / st.l) AS turnover_annualized,
    (wsn.dias_com_estoque::numeric / NULLIF(wsn.dias_com_snapshot, 0)) AS cobertura_pct,  -- D-13
    wsn.stockout_days,
    (wsn.stockout_days::numeric / NULLIF(wsn.dias_com_snapshot, 0)) AS stockout_rate,     -- D-14
    CASE WHEN ls.product_code IS NULL THEN NULL ELSE (ls.current_qty <= 0) END AS is_stockout_now,
    COALESCE(ws.qty_sold_dead_window, 0) AS qty_sold_dead_window,
    st.w  AS window_days,
    st.l  AS long_window_days,
    st.fast_max, st.slow_min, ls.product_code AS has_snapshot
  FROM universe u
  JOIN settings st ON st.tenant_id = u.tenant_id
  LEFT JOIN latest_snapshot ls ON ls.tenant_id = u.tenant_id AND ls.product_code = u.product_code
  LEFT JOIN window_snapshots wsn ON wsn.tenant_id = u.tenant_id AND wsn.product_code = u.product_code
  LEFT JOIN avg_inv ai ON ai.tenant_id = u.tenant_id AND ai.product_code = u.product_code
  LEFT JOIN window_sales ws ON ws.tenant_id = u.tenant_id AND ws.product_code = u.product_code
  LEFT JOIN product_costs pc ON pc.tenant_id = u.tenant_id AND pc.product_code = u.product_code
  LEFT JOIN prod_name pn ON pn.tenant_id = u.tenant_id AND pn.product_code = u.product_code
)
SELECT
  tenant_id, product_code, product_name, current_qty, last_snapshot_date,
  snapshot_staleness_days, stock_status, unit_cost, has_cost, stock_value,
  qty_sold_short, qty_sold_long, revenue_short, revenue_long, profit_long,
  ads, dos, (dos / 7) AS wos, turnover, turnover_annualized,
  cobertura_pct, stockout_days, stockout_rate, is_stockout_now,
  CASE                                                   -- D-15: ordem dead>slow>fast>normal
    WHEN qty_sold_dead_window = 0 AND COALESCE(current_qty, 0) > 0 THEN 'dead'
    WHEN dos >= slow_min THEN 'slow'
    WHEN dos <= fast_max THEN 'fast'
    WHEN has_snapshot IS NULL AND qty_sold_long = 0 THEN NULL
    ELSE 'normal'
  END AS movement_class,
  window_days, long_window_days
FROM computed;

REVOKE ALL ON public.product_inventory_metrics FROM anon, authenticated;
GRANT SELECT ON public.product_inventory_metrics TO service_role;
