-- Phase 08: custo vigente por produto (product_costs) + thresholds de inventário (inventory_settings)

-- ── 1. product_costs (D-01/D-02) ───────────────────────────────────────────
-- Custo VIGENTE por produto, sem period_id (não é histórico — products cobre isso).
-- unit_cost nullable de propósito (D-16/D-18: custo desconhecido ≠ zero).
CREATE TABLE IF NOT EXISTS product_costs (
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_code  text NOT NULL,
  unit_cost     numeric(12,2),
  name          text,
  source        text NOT NULL DEFAULT 'catalog',   -- 'catalog' | 'manual' | 'api'
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, product_code)
);

ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON product_costs
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
  ));

-- ── 2. inventory_settings (D-05/D-06) ──────────────────────────────────────
-- Uma linha por tenant. Ausência de linha NÃO quebra nada: as views usam
-- LEFT JOIN + COALESCE(coluna, <default literal>) — um tenant sem linha
-- recebe exatamente estes defaults.
CREATE TABLE IF NOT EXISTS inventory_settings (
  tenant_id            uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  sales_window_days    integer NOT NULL DEFAULT 30,
  long_window_days     integer NOT NULL DEFAULT 90,
  fast_mover_dos_max   numeric NOT NULL DEFAULT 15,
  slow_mover_dos_min   numeric NOT NULL DEFAULT 120,
  dead_stock_days      integer NOT NULL DEFAULT 90,
  stale_snapshot_days  integer NOT NULL DEFAULT 7,
  abc_cut_a            numeric NOT NULL DEFAULT 0.80,
  abc_cut_b            numeric NOT NULL DEFAULT 0.95,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON inventory_settings
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
  ));
