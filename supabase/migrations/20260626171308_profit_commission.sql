-- Migration: profit-based commission support
-- Adds: products table, sale_items table, goals.commission_type column
-- Recreates: vendor_summary view with total_profit + commission_type

-- ── 1. products ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_id       integer NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  product_code    text NOT NULL,
  name            text,
  cost_price      numeric(12,2),
  sale_price      numeric(12,2),
  margin_pct      numeric(6,4),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, period_id, product_code)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON products
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
  ));

-- ── 2. sale_items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sale_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_id     integer NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  vendor_id     text NOT NULL,
  order_id      text NOT NULL,
  product_code  text NOT NULL,
  qty           numeric(10,2) NOT NULL DEFAULT 1,
  unit_price    numeric(12,2) NOT NULL,
  total_price   numeric(12,2) NOT NULL,
  unit_cost     numeric(12,2),
  total_profit  numeric(12,2),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, period_id, order_id, product_code)
);

CREATE INDEX IF NOT EXISTS sale_items_period_vendor
  ON sale_items (tenant_id, period_id, vendor_id);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON sale_items
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
  ));

-- ── 3. goals.commission_type ───────────────────────────────────────────────
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS commission_type text NOT NULL DEFAULT 'revenue'
  CHECK (commission_type IN ('revenue', 'profit'));

-- ── 4. Recreate vendor_summary view with total_profit + commission_type ────
DROP VIEW IF EXISTS vendor_summary CASCADE;

CREATE VIEW vendor_summary AS
SELECT
    sr.tenant_id,
    sr.period_id,
    p.label                                          AS period_label,
    p.year,
    p.month,
    sr.vendor_id,
    sr.vendor_name,
    sr.store,
    round(sum(sr.valor), 2)                          AS total_sold,
    count(DISTINCT sr.client_id)                     AS unique_clients,
    count(*)                                         AS total_orders,
    round(sum(sr.quantity))                          AS total_items,
    round((sum(sr.valor) / NULLIF(count(DISTINCT ((sr.sale_date)::text || sr.client_id)), 0)::numeric), 2) AS avg_ticket,
    max(sr.sale_date)                                AS last_sale_date,
    max(sr.sale_time)                                AS last_sale_time,
    g.meta1,
    g.meta2,
    g.meta3,
    g.bonus1,
    g.bonus2,
    g.bonus3,
    g.commission_pct,
    COALESCE(g.commission_type, 'revenue')           AS commission_type,
    CASE
        WHEN sum(sr.valor) >= g.meta3 THEN 3
        WHEN sum(sr.valor) >= g.meta2 THEN 2
        WHEN sum(sr.valor) >= g.meta1 THEN 1
        ELSE 0
    END                                              AS meta_level,
    CASE
        WHEN sum(sr.valor) >= g.meta3 THEN g.bonus3
        WHEN sum(sr.valor) >= g.meta2 THEN g.bonus2
        WHEN sum(sr.valor) >= g.meta1 THEN g.bonus1
        ELSE 0::numeric
    END                                              AS bonus_earned,
    round((
        (sum(sr.valor) * g.commission_pct) +
        CASE
            WHEN sum(sr.valor) >= g.meta3 THEN g.bonus3
            WHEN sum(sr.valor) >= g.meta2 THEN g.bonus2
            WHEN sum(sr.valor) >= g.meta1 THEN g.bonus1
            ELSE 0::numeric
        END
    ), 2)                                            AS total_commission,
    COALESCE((
        SELECT round(sum(si.total_profit), 2)
        FROM sale_items si
        WHERE si.tenant_id = sr.tenant_id
          AND si.period_id = sr.period_id
          AND si.vendor_id = sr.vendor_id
    ), 0)                                            AS total_profit
FROM sales_records sr
JOIN periods p ON p.id = sr.period_id
LEFT JOIN goals g
  ON  g.period_id  = sr.period_id
  AND g.vendor_id  = sr.vendor_id
  AND g.tenant_id  = sr.tenant_id
GROUP BY
    sr.tenant_id, sr.period_id, p.label, p.year, p.month,
    sr.vendor_id, sr.vendor_name, sr.store,
    g.meta1, g.meta2, g.meta3,
    g.bonus1, g.bonus2, g.bonus3,
    g.commission_pct, g.commission_type;

-- Restore grants (mirror 20260601000019_p0_security_closeout.sql)
GRANT SELECT ON public.vendor_summary TO service_role;
REVOKE ALL ON public.vendor_summary FROM anon, authenticated;
