-- Phase 08: índices de suporte às métricas de inventário (D-22).
-- Ordem: esta migration roda ANTES das views (Pitfall 6) para evitar full scan
-- na primeira execução das views em produção.

-- 1. Resolve "snapshot mais recente por produto" (DISTINCT ON) e janelas por produto.
--    O existente stock_snapshots_tenant_date (tenant_id, snapshot_date) NÃO cobre
--    o agrupamento por product_code.
CREATE INDEX IF NOT EXISTS idx_stock_snapshots_tenant_product_date
  ON stock_snapshots (tenant_id, product_code, snapshot_date DESC);

-- 2. Chave da junção D-07 (sale_items.order_id = sales_records.order_ref).
--    Inexistente hoje: o UNIQUE (tenant_id, period_id, order_ref) não cobre
--    filtro por (tenant_id, order_ref) sem period_id.
CREATE INDEX IF NOT EXISTS idx_sales_records_tenant_order_ref
  ON sales_records (tenant_id, order_ref);

-- 3. Filtro de janela de data. idx_sales_records_tenant_id existe mas só cobre
--    tenant_id; (tenant_id, sale_date) é mais específico e não duplica.
CREATE INDEX IF NOT EXISTS idx_sales_records_tenant_sale_date
  ON sales_records (tenant_id, sale_date);

-- 4. Agregação por produto. Existentes cobrem (tenant_id, period_id, vendor_id)
--    e (period_id) — nenhum cobre (tenant_id, product_code).
CREATE INDEX IF NOT EXISTS idx_sale_items_tenant_product
  ON sale_items (tenant_id, product_code);
