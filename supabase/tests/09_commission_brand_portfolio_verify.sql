-- =============================================================================
-- Verificação: comissão v0-2 (goals_brand, vendor_brand_metrics, carteira_reativados)
-- =============================================================================
-- NAO E MIGRATION. Nao colocar em supabase/migrations/.
--
-- Execucao (local com Supabase CLI):
--   supabase db reset && supabase test db -f supabase/tests/09_commission_brand_portfolio_verify.sql
-- Ou no console/MCP execute_sql: selecionar o conteudo e executar com
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/09_commission_brand_portfolio_verify.sql
--
-- Envelope: BEGIN; ... ROLLBACK; — nada persiste. Papel: service_role / owner.
-- Tenant de teste: '00000000-0000-0000-0000-0000000009a8'.
-- =============================================================================

BEGIN;

-- ── 0. Limpeza defensiva + tenant + período de teste ────────────────────────
DELETE FROM sale_items         WHERE tenant_id = '00000000-0000-0000-0000-0000000009a8';
DELETE FROM sales_records      WHERE tenant_id = '00000000-0000-0000-0000-0000000009a8';
DELETE FROM product_costs      WHERE tenant_id = '00000000-0000-0000-0000-0000000009a8';
DELETE FROM products           WHERE tenant_id = '00000000-0000-0000-0000-0000000009a8';
DELETE FROM goals_brand        WHERE tenant_id = '00000000-0000-0000-0000-0000000009a8';
DELETE FROM periods            WHERE tenant_id = '00000000-0000-0000-0000-0000000009a8';
DELETE FROM tenants            WHERE id        = '00000000-0000-0000-0000-0000000009a8';

INSERT INTO tenants (id, nome, slug, ativo)
VALUES ('00000000-0000-0000-0000-0000000009a8', 'Tenant Verificação Comissão v0-2', 'tenant-verify-09', true);

INSERT INTO periods (tenant_id, year, month, label, start_date, end_date, closed)
VALUES ('00000000-0000-0000-0000-0000000009a8', 2099, 9, 'TEST-09-REATIVACAO',
        DATE '2099-09-01', DATE '2099-09-30', false);

-- ── 1. protection: obriga marca em todo SKU já é enforcement na aplicação; ──
--    aqui usamos product_costs com brand preenchido para validar a view.
INSERT INTO product_costs (tenant_id, product_code, unit_cost, name, brand, source)
VALUES
  ('00000000-0000-0000-0000-0000000009a8', 'SKU-NIKE', 50,  'Tênis Nike',   'Nike',   'manual'),
  ('00000000-0000-0000-0000-0000000009a8', 'SKU-ADD',  80,  'Chinelo Adidas','Adidas', 'manual');

-- Vendas do período: vendor V1 vendeu Nike (3) + Adidas (1); V2 só Nike (2)
INSERT INTO sales_records (tenant_id, period_id, vendor_id, vendor_name, store, client_id, client_name, order_ref, sale_date, sale_time, valor, quantity)
VALUES
  ('00000000-0000-0000-0000-0000000009a8', (SELECT id FROM periods WHERE tenant_id='00000000-0000-0000-0000-0000000009a8'),
   'V1', 'Vendedor 1', 'Jebai', 'C1', 'Cliente 1', 'ORD-1', DATE '2099-09-05', '10:00', 1000, 1),
  ('00000000-0000-0000-0000-0000000009a8', (SELECT id FROM periods WHERE tenant_id='00000000-0000-0000-0000-0000000009a8'),
   'V1', 'Vendedor 1', 'Jebai', 'C2', 'Cliente 2', 'ORD-2', DATE '2099-09-06', '10:00', 500,  1),
  ('00000000-0000-0000-0000-0000000009a8', (SELECT id FROM periods WHERE tenant_id='00000000-0000-0000-0000-0000000009a8'),
   'V2', 'Vendedor 2', 'Paje-MKT', 'C3', 'Cliente 3', 'ORD-3', DATE '2099-09-07', '10:00', 400,  1);

INSERT INTO sale_items (tenant_id, period_id, vendor_id, order_id, product_code, qty, unit_price, total_price, unit_cost, total_profit, category)
SELECT '00000000-0000-0000-0000-0000000009a8',
       p.id,
       CASE WHEN sr.order_ref='ORD-1' THEN 'V1'
            WHEN sr.order_ref='ORD-2' THEN 'V1'
            ELSE 'V2' END,
       sr.order_ref,
       CASE WHEN sr.order_ref='ORD-1' THEN 'SKU-NIKE'
            WHEN sr.order_ref='ORD-2' THEN 'SKU-ADD'
            ELSE 'SKU-NIKE' END,
       sr.quantity,
       sr.valor / NULLIF(sr.quantity,0),
       sr.valor,
       50,
       sr.valor - 50 * sr.quantity,
       'Calçados'
FROM sales_records sr
JOIN periods p ON p.tenant_id = sr.tenant_id AND p.label = 'TEST-09-REATIVACAO'
WHERE sr.tenant_id = '00000000-0000-0000-0000-0000000009a8';

-- Recência: C3 comprou há 7 meses (antes do período) → reativado; C1 há 1 mês → não.
INSERT INTO sales_records (tenant_id, period_id, vendor_id, vendor_name, store, client_id, client_name, order_ref, sale_date, sale_time, valor, quantity)
VALUES
  ('00000000-0000-0000-0000-0000000009a8', (SELECT id FROM periods WHERE tenant_id='00000000-0000-0000-0000-0000000009a8'),
   'V2', 'Vendedor 2', 'Paje-MKT', 'C3', 'Cliente 3', 'ORD-C3-ANTIGO', DATE '2099-02-01', '10:00', 300, 1),
  ('00000000-0000-0000-0000-0000000009a8', (SELECT id FROM periods WHERE tenant_id='00000000-0000-0000-0000-0000000009a8'),
   'V1', 'Vendedor 1', 'Jebai', 'C1', 'Cliente 1', 'ORD-C1-ANTIGO', DATE '2099-08-01', '10:00', 200, 1);

-- ── 2. vendor_brand_metrics ────────────────────────────────────────────────
-- V1: Nike 1000, Adidas 500. V2: Nike 400.
SELECT 'FAIL: vendor_brand_metrics V1-Nike esperado 1000' FROM vendor_brand_metrics
WHERE brand='Nike' AND vendor_id='V1' AND valor_vendido <> 1000;
SELECT 'FAIL: vendor_brand_metrics V1-Adidas esperado 500' FROM vendor_brand_metrics
WHERE brand='Adidas' AND vendor_id='V1' AND valor_vendido <> 500;
SELECT 'FAIL: vendor_brand_metrics V2-Nike esperado 400' FROM vendor_brand_metrics
WHERE brand='Nike' AND vendor_id='V2' AND valor_vendido <> 400;

-- ── 3. carteira_reativados (mês fechado) ────────────────────────────────────
-- Esperado: apenas V2/C3 (não comprou nos 6 meses antes de 2099-09-01).
SELECT 'FAIL: carteira_reativados deveria ter V2/C3' FROM carteira_reativados(
  (SELECT id FROM periods WHERE tenant_id='00000000-0000-0000-0000-0000000009a8'),
  '00000000-0000-0000-0000-0000000009a8')
WHERE NOT (vendor_id='V2' AND client_id='C3');

SELECT 'FAIL: carteira_reativados NÃO deveria ter V1/C1 (comprou há 1 mês)' FROM carteira_reativados(
  (SELECT id FROM periods WHERE tenant_id='00000000-0000-0000-0000-0000000009a8'),
  '00000000-0000-0000-0000-0000000009a8')
WHERE vendor_id='V1' AND client_id='C1';

-- ── 4. goals_brand: RLS/upsert basta para smoke; aqui só confirma a tabela ─
SELECT 'FAIL: goals_brand não criada' FROM information_schema.tables
WHERE table_schema='public' AND table_name='goals_brand' LIMIT 1;

-- ── 5. Envelope: nada persiste ─────────────────────────────────────────────
ROLLBACK;