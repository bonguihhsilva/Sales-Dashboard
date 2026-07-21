-- Phase 08: MOCKUP de inventário para a CONTA DEMO apenas (tenant slug 'loja-demo').
--
-- Escopo: 20 SKUs com prefixo 'DEMO-', desenhados para exercitar TODAS as métricas
-- do contrato da fase (fast/normal/slow/dead mover, ruptura, custo ausente,
-- estoque desconhecido, snapshot desatualizado, curva ABC A/B/C).
--
-- Segurança de escopo: TUDO é filtrado por (SELECT id FROM tenants WHERE slug='loja-demo').
-- Se esse tenant não existir, a migration é no-op silenciosa. Nenhum outro tenant
-- é tocado. Todos os códigos usam prefixo 'DEMO-' — não colidem com catálogo real.
--
-- Idempotente: ON CONFLICT DO NOTHING em tudo; re-rodar não duplica.
--
-- Datas são relativas a CURRENT_DATE, então o demo permanece "fresco" na janela
-- de 30/90 dias independentemente de quando a migration for aplicada.

DO $$
DECLARE
  v_tenant uuid;
  v_today  date := CURRENT_DATE;
BEGIN
  SELECT id INTO v_tenant FROM tenants WHERE slug = 'loja-demo';

  IF v_tenant IS NULL THEN
    RAISE NOTICE 'Tenant demo (loja-demo) não encontrado — seed de mockup ignorado.';
    RETURN;
  END IF;

  -- ── Catálogo sintético: 20 SKUs com arquétipo de comportamento ─────────────
  -- sell_every: 0 = nunca vende (dead). Senão, vende a cada N dias.
  -- snap_mode:  'full' = snapshot diário; 'none' = nunca (estoque desconhecido);
  --             'stale' = para 25 dias atrás; 'stockout' = zera nos últimos dias.
  CREATE TEMP TABLE _demo_catalog (
    product_code text, name text, unit_cost numeric, sale_price numeric,
    base_stock numeric, sell_every int, sell_qty numeric, snap_mode text, store text
  ) ON COMMIT DROP;

  INSERT INTO _demo_catalog VALUES
    -- Fast movers (DoS baixo) — puxam a curva A
    ('DEMO-P01','iPhone 15 Pro 256GB',        780, 1150,  25, 1, 2,  'full','jebai'),
    ('DEMO-P02','Samsung Galaxy S24 Ultra',   700, 1040,  30, 1, 2,  'full','paje1'),
    ('DEMO-P03','AirPods Pro 2',              160,  245,  60, 1, 5,  'full','jebai'),
    ('DEMO-P04','Xiaomi Redmi Note 13',       130,  199,  45, 1, 3,  'full','paje2'),
    -- Normais
    ('DEMO-P05','Notebook Lenovo IdeaPad 3',  420,  629,  18, 3, 3,  'full','jebai'),
    ('DEMO-P06','Smart TV TCL 55" 4K',        300,  459,  12, 3, 2,  'full','paje1'),
    ('DEMO-P07','Caixa JBL Flip 6',            75,  119,  40, 3, 4,  'full','paje2'),
    ('DEMO-P08','Apple Watch SE 44mm',        210,  319,  15, 3, 2,  'full','jebai'),
    ('DEMO-P09','Perfume Dior Sauvage 100ml',  85,  145,  35, 3, 3,  'full','paje1'),
    -- Slow movers (DoS alto) — curva C
    ('DEMO-P10','Câmera GoPro Hero 12',       300,  449,  40,14, 2,  'full','paje2'),
    ('DEMO-P11','Tablet Galaxy Tab A9',       140,  215,  55,14, 2,  'full','jebai'),
    ('DEMO-P12','Teclado Mecânico RGB',        45,   79,  80,14, 3,  'full','paje1'),
    ('DEMO-P13','Caixa de Som Sony XB43',     180,  269,  30,14, 1,  'full','paje2'),
    -- Dead stock (zero venda em 90d, estoque parado = capital imobilizado)
    ('DEMO-P14','Relógio Casio Vintage',       28,   55,  50, 0, 0,  'full','jebai'),
    ('DEMO-P15','Drone DJI Mini 2 (descont.)',350,  520,   8, 0, 0,  'full','paje1'),
    ('DEMO-P16','Fone JBL T110',                8,   19, 120, 0, 0,  'full','paje2'),
    -- Casos de borda do contrato
    ('DEMO-P17','Carregador Turbo 65W',        15,   35,   0, 2, 4,'stockout','jebai'),
    ('DEMO-P18','Cabo USB-C Premium 2m',     NULL,   25,  90, 3, 5,  'full','paje1'),
    ('DEMO-P19','Mouse Logitech MX Master 3S', 65,   99,   0, 3, 2,  'none','paje2'),
    ('DEMO-P20','Console PS5 Slim',           420,  629,   6, 3, 1, 'stale','jebai');

  -- ── 1. Períodos que cobrem a janela de 90 dias (idempotente) ──────────────
  INSERT INTO periods (tenant_id, year, month, label, start_date, end_date, closed)
  SELECT
    v_tenant,
    EXTRACT(YEAR  FROM m)::int,
    EXTRACT(MONTH FROM m)::int,
    to_char(m, 'MM/YYYY'),
    date_trunc('month', m)::date,
    (date_trunc('month', m) + interval '1 month - 1 day')::date,
    false
  FROM generate_series(
    date_trunc('month', v_today - 90),
    date_trunc('month', v_today),
    interval '1 month'
  ) AS m
  WHERE NOT EXISTS (
    SELECT 1 FROM periods p
    WHERE p.tenant_id = v_tenant
      AND p.year  = EXTRACT(YEAR  FROM m)::int
      AND p.month = EXTRACT(MONTH FROM m)::int
  );

  -- ── 2. product_costs: custo vigente (D-01). P18 fica NULL de propósito ────
  INSERT INTO product_costs (tenant_id, product_code, unit_cost, name, source, updated_at)
  SELECT v_tenant, c.product_code, c.unit_cost, c.name, 'catalog', now()
  FROM _demo_catalog c
  ON CONFLICT (tenant_id, product_code) DO NOTHING;

  -- ── 3. products: paridade de catálogo no período mais recente ─────────────
  INSERT INTO products (tenant_id, period_id, product_code, name, cost_price, sale_price, margin_pct)
  SELECT
    v_tenant,
    (SELECT id FROM periods WHERE tenant_id = v_tenant ORDER BY year DESC, month DESC LIMIT 1),
    c.product_code, c.name, c.unit_cost, c.sale_price,
    CASE WHEN c.unit_cost IS NULL OR c.sale_price = 0 THEN NULL
         ELSE round((c.sale_price - c.unit_cost) / c.sale_price, 4) END
  FROM _demo_catalog c
  ON CONFLICT (tenant_id, period_id, product_code) DO NOTHING;

  -- ── 4. stock_snapshots: série diária de 90 dias ───────────────────────────
  -- 'none'     → nenhuma linha (stock_status = 'unknown')
  -- 'stale'    → para 25 dias atrás (stock_status = 'stale', staleness > 7)
  -- 'stockout' → zera nos últimos 6 dias e em ~1 dia a cada 10 (quebra)
  -- 'full'     → diário até hoje
  INSERT INTO stock_snapshots (tenant_id, product_code, snapshot_date, quantity, source)
  SELECT
    v_tenant,
    c.product_code,
    d::date,
    CASE
      WHEN c.snap_mode = 'stockout' THEN
        CASE WHEN (v_today - d::date) <= 6 THEN 0
             WHEN ((v_today - d::date) % 10) = 0 THEN 0
             ELSE 12 END
      -- Estoque decai levemente conforme se aproxima de hoje (consumo).
      ELSE GREATEST(c.base_stock + ((v_today - d::date) / 12), 0)
    END,
    'seed-demo'
  FROM _demo_catalog c
  CROSS JOIN generate_series(v_today - 89, v_today, interval '1 day') AS d
  WHERE c.snap_mode <> 'none'
    AND (c.snap_mode <> 'stale' OR d::date <= v_today - 25)
  ON CONFLICT (tenant_id, product_code, snapshot_date) DO NOTHING;

  -- ── 5. sales_records: cabeçalho da venda (order_ref é a chave da junção) ──
  -- Um pedido por (produto, dia de venda). order_ref casa com sale_items.order_id.
  INSERT INTO sales_records (
    tenant_id, period_id, vendor_id, vendor_name, store,
    client_id, client_name, sale_date, order_ref, valor, quantity
  )
  SELECT
    v_tenant,
    p.id,
    'DEMO-V' || (1 + (extract(day from d)::int % 3)),
    CASE (1 + (extract(day from d)::int % 3))
      WHEN 1 THEN 'Ana Demo' WHEN 2 THEN 'Bruno Demo' ELSE 'Carla Demo' END,
    c.store,
    'DEMO-C' || (1 + (extract(day from d)::int % 5)),
    'Cliente Demo ' || (1 + (extract(day from d)::int % 5)),
    d::date,
    'DEMO-' || c.product_code || '-' || to_char(d::date, 'YYYYMMDD'),
    c.sell_qty * c.sale_price,
    c.sell_qty
  FROM _demo_catalog c
  CROSS JOIN generate_series(v_today - 89, v_today, interval '1 day') AS d
  JOIN periods p
    ON p.tenant_id = v_tenant
   AND p.year  = EXTRACT(YEAR  FROM d)::int
   AND p.month = EXTRACT(MONTH FROM d)::int
  WHERE c.sell_every > 0
    AND ((v_today - d::date) % c.sell_every) = 0
  ON CONFLICT (tenant_id, period_id, order_ref) DO NOTHING;

  -- ── 6. sale_items: linha do pedido (unit_cost congelado no momento da venda) ──
  INSERT INTO sale_items (
    tenant_id, period_id, vendor_id, order_id, product_code,
    qty, unit_price, total_price, unit_cost, total_profit
  )
  SELECT
    v_tenant,
    p.id,
    'DEMO-V' || (1 + (extract(day from d)::int % 3)),
    'DEMO-' || c.product_code || '-' || to_char(d::date, 'YYYYMMDD'),
    c.product_code,
    c.sell_qty,
    c.sale_price,
    c.sell_qty * c.sale_price,
    c.unit_cost,                                        -- NULL em P18 (custo ausente)
    CASE WHEN c.unit_cost IS NULL THEN NULL
         ELSE c.sell_qty * (c.sale_price - c.unit_cost) END
  FROM _demo_catalog c
  CROSS JOIN generate_series(v_today - 89, v_today, interval '1 day') AS d
  JOIN periods p
    ON p.tenant_id = v_tenant
   AND p.year  = EXTRACT(YEAR  FROM d)::int
   AND p.month = EXTRACT(MONTH FROM d)::int
  WHERE c.sell_every > 0
    AND ((v_today - d::date) % c.sell_every) = 0
  ON CONFLICT (tenant_id, period_id, order_id, product_code) DO NOTHING;

  RAISE NOTICE 'Seed de mockup de inventário aplicado ao tenant demo %', v_tenant;
END $$;
