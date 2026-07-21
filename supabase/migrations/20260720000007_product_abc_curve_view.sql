-- Phase 08: curva ABC por lucro bruto acumulado na janela L (D-16).
CREATE OR REPLACE VIEW product_abc_curve AS
WITH settings AS (
  SELECT t.id AS tenant_id,
    COALESCE(s.long_window_days, 90) AS l,
    COALESCE(s.abc_cut_a, 0.80)      AS cut_a,
    COALESCE(s.abc_cut_b, 0.95)      AS cut_b
  FROM tenants t
  LEFT JOIN inventory_settings s ON s.tenant_id = t.id
),
agg AS (
  SELECT ds.tenant_id, ds.product_code, st.cut_a, st.cut_b,
    sum(ds.profit)  AS profit_l,
    sum(ds.revenue) AS revenue_l
  FROM product_daily_sales ds
  JOIN settings st ON st.tenant_id = ds.tenant_id
  WHERE ds.sale_date >= CURRENT_DATE - st.l   -- só produtos com venda na janela L
  GROUP BY ds.tenant_id, ds.product_code, st.cut_a, st.cut_b
),
based AS (
  SELECT tenant_id, product_code, cut_a, cut_b,
    CASE WHEN profit_l IS NOT NULL THEN 'profit' ELSE 'revenue' END AS abc_basis,
    CASE WHEN profit_l IS NOT NULL THEN profit_l ELSE revenue_l END AS abc_metric
  FROM agg
),
ranked AS (
  SELECT tenant_id, product_code, abc_basis, abc_metric, cut_a, cut_b,
    row_number() OVER (PARTITION BY tenant_id ORDER BY abc_metric DESC) AS abc_rank,
    sum(GREATEST(abc_metric, 0)) OVER (
      PARTITION BY tenant_id ORDER BY abc_metric DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) / NULLIF(sum(GREATEST(abc_metric, 0)) OVER (PARTITION BY tenant_id), 0) AS cum_pct
  FROM based
)
SELECT tenant_id, product_code, abc_basis, abc_metric, abc_rank, cum_pct,
  CASE
    WHEN abc_metric <= 0 THEN 'C'
    WHEN cum_pct <= cut_a THEN 'A'
    WHEN cum_pct <= cut_b THEN 'B'
    ELSE 'C'
  END AS abc_class
FROM ranked;

REVOKE ALL ON public.product_abc_curve FROM anon, authenticated;
GRANT SELECT ON public.product_abc_curve TO service_role;
