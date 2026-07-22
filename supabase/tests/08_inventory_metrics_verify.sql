BEGIN;
-- =============================================================================
-- Fase 08 — Suite de verificacao das metricas de inventario (D-08..D-19, D-21, D-23)
-- =============================================================================
--
-- NAO E MIGRATION. Nao colocar em supabase/migrations/.
--
-- Execucao:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/08_inventory_metrics_verify.sql
--
-- (ou colar o conteudo inteiro em execute_sql do MCP Supabase — o envelope
--  transacional garante que nada persiste)
--
-- Envelope: o script abre com BEGIN; e fecha com ROLLBACK;. Nenhum dado
-- sintetico e persistido. NAO ha instrucao de gravacao definitiva neste
-- arquivo — se alguem adicionar uma, o teste vira poluicao de producao (T-08-18).
--
-- Papel necessario: owner do schema / service_role (RLS e bypassada e as views
-- desta fase so tem SELECT concedido a service_role — D-21).
--
-- Tenant de teste: uuid literal reservado '00000000-0000-0000-0000-0000000008a8'.
-- Ancora temporal: CURRENT_DATE. Todas as datas sao relativas, entao o script
-- continua valido em qualquer dia em que for executado.
--
-- SEMANTICA CRITICA (D-18): NULL significa DESCONHECIDO, nunca zero.
--   turnover = 0    -> item parado COM custo conhecido (giro nulo, dado valido)
--   turnover = NULL -> item SEM custo (metrica indeterminada)
-- Os dois casos tem asserts SEPARADOS (P_DEAD_COSTED vs P_NOCOST). Nao colapsar.
--
-- Deliberadamente NAO existe linha em inventory_settings para o tenant de teste:
-- isso exercita os defaults do D-06 (W=30, L=90, fast=15, slow=120, dead=90, stale=7).
-- =============================================================================

-- ── 0. Limpeza defensiva do tenant de teste ─────────────────────────────────
-- Ordem manual (nao via CASCADE de tenants) porque o trigger de auditoria de
-- product_costs grava em audit_logs, que tem FK para tenants: o CASCADE
-- dispararia o trigger no meio da remocao do proprio tenant.
DELETE FROM sale_items         WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM sales_records      WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM stock_snapshots    WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM products           WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM product_costs      WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM inventory_settings WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM periods            WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM audit_logs         WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
DELETE FROM tenants            WHERE id        = '00000000-0000-0000-0000-0000000008a8';

-- ── 1. Tenant + periodo unico de teste ──────────────────────────────────────
-- Um unico periodo serve para todas as vendas: nenhuma view da fase deriva data
-- de period_id (D-09 — janelas sao em dias corridos a partir de CURRENT_DATE).
INSERT INTO tenants (id, nome, slug, ativo)
VALUES ('00000000-0000-0000-0000-0000000008a8', 'Tenant Verificacao Fase 08', 'tenant-verify-08', true);

INSERT INTO periods (tenant_id, year, month, label, start_date, end_date, closed)
VALUES ('00000000-0000-0000-0000-0000000008a8', 2099, 1, 'TEST-08',
        DATE '2099-01-01', DATE '2099-01-31', false);

CREATE TEMP TABLE _t08 AS
  SELECT id AS period_id
    FROM periods
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND label = 'TEST-08';

-- ── 2. Catalogo sintetico: custo vigente (product_costs) ────────────────────
-- P_NOCOST e P_ABC_REV NAO recebem linha aqui de proposito (has_cost = false).
CREATE TEMP TABLE _t08_cost (product_code text, unit_cost numeric, name text);
INSERT INTO _t08_cost VALUES
  ('P_FAST',        10, 'Fast Mover Teste'),
  ('P_SLOW',         5, 'Slow Mover Teste'),
  ('P_DEAD',         8, 'Dead Stock Teste'),
  ('P_DEAD_COSTED',  8, 'Dead Stock Com Custo Teste'),
  ('P_DOSNULL',     12, 'DoS Indeterminado Teste'),
  ('P_STOCKOUT',     4, 'Quebra de Estoque Teste'),
  ('P_UNKNOWN',      3, 'Estoque Desconhecido Teste'),
  ('P_STALE',        6, 'Snapshot Desatualizado Teste'),
  ('P_COSTONLY',     7, 'So Custo Teste'),
  ('P_ABC_A',       50, 'ABC Classe A Teste'),
  ('P_ABC_B',       50, 'ABC Classe B Teste'),
  ('P_ABC_C',       50, 'ABC Classe C Teste'),
  ('P_ABC_NEG',     50, 'ABC Lucro Negativo Teste');

INSERT INTO product_costs (tenant_id, product_code, unit_cost, name, source)
SELECT '00000000-0000-0000-0000-0000000008a8', product_code, unit_cost, name, 'manual'
  FROM _t08_cost;

-- products: so para exercitar a cadeia de COALESCE do nome (D-19).
-- P_NOCOST nao tem product_costs -> nome vem daqui.
-- P_ABC_REV nao tem nem product_costs nem products -> nome cai no product_code.
INSERT INTO products (tenant_id, period_id, product_code, name, cost_price, sale_price)
VALUES ('00000000-0000-0000-0000-0000000008a8', (SELECT period_id FROM _t08),
        'P_NOCOST', 'Sem Custo Teste', NULL, 5);

-- ── 3. stock_snapshots ──────────────────────────────────────────────────────
-- days_ago e a distancia em dias ate CURRENT_DATE (0 = hoje).
-- P_UNKNOWN, P_COSTONLY e os P_ABC_* nunca aparecem aqui (stock_status='unknown').
CREATE TEMP TABLE _t08_snap (product_code text, days_ago int, quantity numeric);

-- P_FAST: 30 dias consecutivos com quantidade constante 30
--   -> current_qty = 30; avg_inventory = 30 * custo 10 = 300 (usado no giro)
INSERT INTO _t08_snap
SELECT 'P_FAST', d, 30 FROM generate_series(0, 29) AS d;

INSERT INTO _t08_snap VALUES
  -- P_SLOW: estoque alto e estavel
  ('P_SLOW', 0, 300), ('P_SLOW', 1, 300), ('P_SLOW', 2, 300),
  -- P_DEAD / P_DEAD_COSTED: estoque parado > 0
  ('P_DEAD', 0, 20), ('P_DEAD', 1, 20), ('P_DEAD', 2, 20),
  ('P_DEAD_COSTED', 0, 20), ('P_DEAD_COSTED', 1, 20), ('P_DEAD_COSTED', 2, 20),
  -- P_DOSNULL: estoque conhecido, mas sem venda na janela curta
  ('P_DOSNULL', 0, 5), ('P_DOSNULL', 1, 5), ('P_DOSNULL', 2, 5),
  -- P_NOCOST: estoque conhecido, custo desconhecido
  ('P_NOCOST', 0, 10), ('P_NOCOST', 1, 10), ('P_NOCOST', 2, 10),
  -- P_STALE: unico snapshot, 20 dias atras (> stale_snapshot_days = 7)
  ('P_STALE', 20, 12),
  -- P_STOCKOUT (D-13/D-14): 6 dias com estoque, 4 dias em quebra,
  --   e 3 dias SEM snapshot dentro da janela W (days_ago 6, 5 e 1).
  --   dias_com_snapshot = 10 (nao 13) -> cobertura = 6/10 = 0.6
  --                                   -> stockout_rate = 4/10 = 0.4
  ('P_STOCKOUT', 12, 10), ('P_STOCKOUT', 11, 10), ('P_STOCKOUT', 10, 10),
  ('P_STOCKOUT',  9, 10), ('P_STOCKOUT',  8, 10), ('P_STOCKOUT',  7, 10),
  ('P_STOCKOUT',  4,  0), ('P_STOCKOUT',  3,  0), ('P_STOCKOUT',  2,  0),
  ('P_STOCKOUT',  0,  0);

INSERT INTO stock_snapshots (tenant_id, product_code, snapshot_date, quantity, source)
SELECT '00000000-0000-0000-0000-0000000008a8', product_code,
       CURRENT_DATE - days_ago, quantity, 'test-08'
  FROM _t08_snap;

-- ── 4. Vendas (sales_records + sale_items) ──────────────────────────────────
-- total_price  = qty * unit_price
-- total_profit = qty * (unit_price - unit_cost)   [NULL quando unit_cost e NULL]
-- Nenhuma venda cai exatamente na borda das janelas (days_ago 30 / 90), para o
-- resultado nao depender de a implementacao usar [D0-W, D0) ou >= D0-W.
CREATE TEMP TABLE _t08_sales (
  product_code text, order_ref text, days_ago int, store text,
  qty numeric, unit_price numeric, unit_cost numeric
);
INSERT INTO _t08_sales VALUES
  -- P_FAST: 3 pedidos de 20 na janela W -> 60/30 dias = ADS 2
  --         2 pedidos em LOJA_A (40) + 1 em LOJA_B (20)  [D-23]
  ('P_FAST',     'T08-ORD-FAST-1',     25, 'LOJA_A',  20,  11,  10),
  ('P_FAST',     'T08-ORD-FAST-2',     15, 'LOJA_A',  20,  11,  10),
  ('P_FAST',     'T08-ORD-FAST-3',      5, 'LOJA_B',  20,  11,  10),
  -- P_SLOW: 30 un na janela W -> ADS 1 -> DoS 300/1 = 300
  ('P_SLOW',     'T08-ORD-SLOW-1',     10, 'LOJA_A',  30,   6,   5),
  -- P_DEAD / P_STALE: venda FORA da janela de 90 dias -> qty_sold_dead_window = 0
  ('P_DEAD',     'T08-ORD-DEAD-1',    100, 'LOJA_A',   5,  10,   8),
  ('P_STALE',    'T08-ORD-STALE-1',   100, 'LOJA_A',   3,  10,   6),
  -- P_DOSNULL: venda dentro de L (90) mas fora de W (30) -> ADS 0 -> DoS NULL,
  --            e qty_sold_dead_window > 0 -> nao e 'dead' -> 'normal'
  ('P_DOSNULL',  'T08-ORD-DOSNULL-1',  60, 'LOJA_A',   4,  22,  12),
  -- P_NOCOST: unit_cost NULL na venda e sem linha em product_costs
  ('P_NOCOST',   'T08-ORD-NOCOST-1',   10, 'LOJA_A',  30,   5, NULL),
  -- P_UNKNOWN: so venda, nunca teve snapshot
  ('P_UNKNOWN',  'T08-ORD-UNKNOWN-1',  10, 'LOJA_A',  10,   5,   3),
  -- P_STOCKOUT
  ('P_STOCKOUT', 'T08-ORD-STOCKOUT-1', 10, 'LOJA_A',  20,  14,   4),
  -- Curva ABC (D-16) — metricas escolhidas para somar exatamente 10000:
  --   P_ABC_A  lucro  8000 -> cum 0.80 -> 'A'
  --   P_ABC_B  lucro  1000 -> cum 0.90 -> 'B'
  --   P_ABC_NEG lucro -400 -> classe 'C', nao entra no acumulado (GREATEST(x,0))
  --   P_ABC_REV sem custo  -> entra por receita 400, abc_basis='revenue'
  ('P_ABC_A',    'T08-ORD-ABCA-1',     20, 'LOJA_A', 100, 130,  50),
  ('P_ABC_B',    'T08-ORD-ABCB-1',     20, 'LOJA_A', 100,  60,  50),
  ('P_ABC_C',    'T08-ORD-ABCC-1',     20, 'LOJA_A',  10,  60,  50),
  ('P_ABC_NEG',  'T08-ORD-ABCNEG-1',   20, 'LOJA_A',  10,  10,  50),
  ('P_ABC_REV',  'T08-ORD-ABCREV-1',   20, 'LOJA_A',  20,  20, NULL);

INSERT INTO sales_records (
  tenant_id, period_id, vendor_id, vendor_name, store,
  client_id, client_name, sale_date, order_ref, valor, quantity
)
SELECT '00000000-0000-0000-0000-0000000008a8', (SELECT period_id FROM _t08),
       'T08-V1', 'Vendedor Teste 08', s.store,
       'T08-C1', 'Cliente Teste 08',
       CURRENT_DATE - s.days_ago, s.order_ref, s.qty * s.unit_price, s.qty
  FROM _t08_sales s;

INSERT INTO sale_items (
  tenant_id, period_id, vendor_id, order_id, product_code,
  qty, unit_price, total_price, unit_cost, total_profit
)
SELECT '00000000-0000-0000-0000-0000000008a8', (SELECT period_id FROM _t08),
       'T08-V1', s.order_ref, s.product_code,
       s.qty, s.unit_price, s.qty * s.unit_price, s.unit_cost,
       CASE WHEN s.unit_cost IS NULL THEN NULL
            ELSE s.qty * (s.unit_price - s.unit_cost) END
  FROM _t08_sales s;

-- P_ORPHAN (D-08): item de venda cujo order_id NAO existe em sales_records.
-- Nao pode aparecer em product_daily_sales nem em product_inventory_metrics.
INSERT INTO sale_items (
  tenant_id, period_id, vendor_id, order_id, product_code,
  qty, unit_price, total_price, unit_cost, total_profit
) VALUES (
  '00000000-0000-0000-0000-0000000008a8', (SELECT period_id FROM _t08),
  'T08-V1', 'T08-ORD-ORFAO-SEM-CABECALHO', 'P_ORPHAN',
  7, 10, 70, 5, 35
);

-- =============================================================================
-- ASSERTS
-- =============================================================================

-- ── D-06: defaults sem linha em inventory_settings ──────────────────────────
DO $$
DECLARE v_w integer; v_l integer;
BEGIN
  SELECT window_days, long_window_days INTO v_w, v_l
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  IF v_w IS DISTINCT FROM 30 OR v_l IS DISTINCT FROM 90 THEN
    RAISE EXCEPTION 'D-06 FALHOU: tenant sem inventory_settings deveria receber W=30/L=90, veio W=% L=%', v_w, v_l;
  END IF;
END $$;

-- ── D-08: junção order_ref exclui órfão ─────────────────────────────────────
DO $$
DECLARE v_n integer;
BEGIN
  SELECT count(*) INTO v_n FROM product_daily_sales
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ORPHAN';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'D-08 FALHOU: sale_items com order_ref orfao apareceu em product_daily_sales (% linhas)', v_n;
  END IF;
END $$;

DO $$
DECLARE v_n integer;
BEGIN
  SELECT count(*) INTO v_n FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ORPHAN';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'D-08 FALHOU: P_ORPHAN entrou no universo de product_inventory_metrics (% linhas)', v_n;
  END IF;
END $$;

-- Contraprova: venda valida com cabecalho continua na view.
-- P_FAST tem 3 pedidos em 3 dias distintos -> 3 linhas, qty total 60.
DO $$
DECLARE v_dias integer; v_qty numeric;
BEGIN
  SELECT count(*), COALESCE(sum(qty_sold), 0) INTO v_dias, v_qty
    FROM product_daily_sales
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  IF v_dias <> 3 OR v_qty IS DISTINCT FROM 60 THEN
    RAISE EXCEPTION 'D-08 FALHOU: P_FAST esperado 3 dias / 60 un em product_daily_sales, veio % dias / % un', v_dias, v_qty;
  END IF;
END $$;

-- ── D-10: ADS = qty_sold_short / W (denominador W fixo) ─────────────────────
-- P_FAST: 20+20+20 = 60 un na janela de 30 dias  ->  60/30 = 2
DO $$
DECLARE v_ads numeric; v_qty numeric;
BEGIN
  SELECT ads, qty_sold_short INTO v_ads, v_qty
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  IF v_qty IS DISTINCT FROM 60 THEN
    RAISE EXCEPTION 'D-10 FALHOU: P_FAST qty_sold_short esperado 60, veio %', v_qty;
  END IF;
  IF v_ads IS DISTINCT FROM 2 THEN
    RAISE EXCEPTION 'D-10 FALHOU: P_FAST ads esperado 2 (60/30), veio %', v_ads;
  END IF;
END $$;

-- ── D-11: DoS = current_qty / ADS; WoS = DoS / 7 ────────────────────────────
-- P_FAST: current_qty 30 / ADS 2 = 15.0 ; WoS = 15/7 = 2.142857 -> 2.14
DO $$
DECLARE v_dos numeric; v_wos numeric;
BEGIN
  SELECT dos, wos INTO v_dos, v_wos
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  IF v_dos IS DISTINCT FROM 15.0 THEN
    RAISE EXCEPTION 'D-11 FALHOU: P_FAST dos esperado 15.0 (30/2), veio %', v_dos;
  END IF;
  IF round(v_wos, 2) IS DISTINCT FROM 2.14 THEN
    RAISE EXCEPTION 'D-11 FALHOU: P_FAST wos esperado 2.14 (15/7), veio %', v_wos;
  END IF;
END $$;

-- P_SLOW: current_qty 300 / ADS 1 (30 un / 30 dias) = 300.0
DO $$
DECLARE v_dos numeric;
BEGIN
  SELECT dos INTO v_dos FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_SLOW';
  IF v_dos IS DISTINCT FROM 300.0 THEN
    RAISE EXCEPTION 'D-11 FALHOU: P_SLOW dos esperado 300.0 (300/1), veio %', v_dos;
  END IF;
END $$;

-- ── D-10/D-11: ADS = 0 produz DoS NULL (nunca 0, nunca infinito) ────────────
-- P_DOSNULL: unica venda ha 60 dias -> fora da janela W(30) -> qty_sold_short = 0
-- ATENCAO (D-18): aqui ads = 0 (dado conhecido) e dos = NULL (indeterminado).
-- Os dois convivem na mesma linha — nao colapsar um no outro.
DO $$
DECLARE v_ads numeric; v_dos numeric; v_wos numeric;
BEGIN
  SELECT ads, dos, wos INTO v_ads, v_dos, v_wos
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_DOSNULL';
  IF v_ads IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'D-10 FALHOU: P_DOSNULL ads esperado 0 (zero venda na janela W), veio %', v_ads;
  END IF;
  IF v_dos IS NOT NULL THEN
    RAISE EXCEPTION 'D-11 FALHOU: P_DOSNULL dos deveria ser NULL quando ads=0, veio %', v_dos;
  END IF;
  IF v_wos IS NOT NULL THEN
    RAISE EXCEPTION 'D-11 FALHOU: P_DOSNULL wos deveria ser NULL quando dos e NULL, veio %', v_wos;
  END IF;
END $$;

-- ── D-12: giro = COGS_L / avg(quantity * unit_cost) ─────────────────────────
-- P_FAST: COGS_L = 3 pedidos * 20 un * custo 10 = 600
--         avg_inventory = 30 un * custo 10 = 300 (30 snapshots constantes)
--         turnover = 600/300 = 2 ; anualizado = 2 * (365/90) = 8.111... -> 8.11
DO $$
DECLARE v_t numeric; v_ta numeric;
BEGIN
  SELECT turnover, turnover_annualized INTO v_t, v_ta
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  IF v_t IS DISTINCT FROM 2 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_FAST turnover esperado 2 (600/300), veio %', v_t;
  END IF;
  IF round(v_ta, 2) IS DISTINCT FROM 8.11 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_FAST turnover_annualized esperado 8.11 (2*365/90), veio %', v_ta;
  END IF;
END $$;

-- P_SLOW: COGS_L = 30 un * custo 5 = 150 ; avg_inventory = 300 * 5 = 1500
--         turnover = 150/1500 = 0.1
DO $$
DECLARE v_t numeric;
BEGIN
  SELECT turnover INTO v_t FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_SLOW';
  IF round(v_t, 4) IS DISTINCT FROM 0.1 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_SLOW turnover esperado 0.1 (150/1500), veio %', v_t;
  END IF;
END $$;

-- ── D-12/D-18: custo AUSENTE -> metricas monetarias NULL (desconhecido) ─────
-- P_NOCOST: sem linha em product_costs e sale_items.unit_cost NULL.
-- Metricas de QUANTIDADE continuam validas: current_qty 10 / ADS 1 = DoS 10.0
DO $$
DECLARE v_hascost boolean; v_uc numeric; v_sv numeric;
        v_t numeric; v_ta numeric; v_pl numeric; v_dos numeric;
BEGIN
  SELECT has_cost, unit_cost, stock_value, turnover, turnover_annualized, profit_long, dos
    INTO v_hascost, v_uc, v_sv, v_t, v_ta, v_pl, v_dos
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_NOCOST';
  IF v_hascost IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_NOCOST has_cost deveria ser false, veio %', v_hascost;
  END IF;
  IF v_uc IS NOT NULL THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_NOCOST unit_cost deveria ser NULL, veio %', v_uc;
  END IF;
  IF v_sv IS NOT NULL THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_NOCOST stock_value deveria ser NULL (nunca 0), veio %', v_sv;
  END IF;
  IF v_t IS NOT NULL THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_NOCOST turnover deveria ser NULL sem custo (nunca 0), veio %', v_t;
  END IF;
  IF v_ta IS NOT NULL THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_NOCOST turnover_annualized deveria ser NULL sem custo, veio %', v_ta;
  END IF;
  IF v_pl IS NOT NULL THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_NOCOST profit_long deveria ser NULL (custo da venda ausente), veio %', v_pl;
  END IF;
  -- quantidade nao depende de custo (D-18): 10 un / ADS 1 (30 un / 30 dias)
  IF v_dos IS DISTINCT FROM 10.0 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_NOCOST dos deveria continuar valido sem custo (10.0), veio %', v_dos;
  END IF;
END $$;

-- ── D-12/D-18: custo CONHECIDO + zero venda -> giro 0 (NAO NULL) ────────────
-- P_DEAD_COSTED: custo 8, estoque 20, ZERO venda na janela L.
-- Este e o caso que dispara o BLOCKER do D-18: um `sum(...) FILTER` ingenuo
-- devolveria NULL em cogs_long/profit_long e o giro apareceria como
-- "desconhecido" quando na verdade e um zero conhecido (capital parado).
-- avg_inventory = 20 un * custo 8 = 160 ; turnover = 0/160 = 0
DO $$
DECLARE v_hascost boolean; v_t numeric; v_ta numeric; v_pl numeric; v_sv numeric;
BEGIN
  SELECT has_cost, turnover, turnover_annualized, profit_long, stock_value
    INTO v_hascost, v_t, v_ta, v_pl, v_sv
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_DEAD_COSTED';
  IF v_hascost IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_DEAD_COSTED has_cost deveria ser true, veio %', v_hascost;
  END IF;
  IF v_t IS NULL THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_DEAD_COSTED turnover veio NULL — com custo conhecido e zero venda o giro e 0, nao desconhecido';
  END IF;
  IF v_t IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_DEAD_COSTED turnover esperado 0 (0/160), veio %', v_t;
  END IF;
  IF v_ta IS NULL OR v_ta IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_DEAD_COSTED turnover_annualized esperado 0 (nao NULL), veio %', v_ta;
  END IF;
  IF v_pl IS NULL OR v_pl IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_DEAD_COSTED profit_long esperado 0 (nao NULL), veio %', v_pl;
  END IF;
  IF v_sv IS DISTINCT FROM 160 THEN
    RAISE EXCEPTION 'D-12 FALHOU: P_DEAD_COSTED stock_value esperado 160 (20*8), veio %', v_sv;
  END IF;
END $$;

-- ── D-12/D-18: zero e desconhecido NUNCA colapsam ───────────────────────────
-- Assert conjunto e deliberado: os dois produtos abaixo so se distinguem pela
-- presenca do custo. Se alguem "simplificar" a view com COALESCE(turnover, 0)
-- ou com um sum() sem o CASE de zero-venda, este bloco quebra.
DO $$
DECLARE v_costed numeric; v_nocost numeric;
BEGIN
  SELECT turnover INTO v_costed FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_DEAD_COSTED';
  SELECT turnover INTO v_nocost FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_NOCOST';
  IF v_costed IS NOT DISTINCT FROM v_nocost THEN
    RAISE EXCEPTION 'D-12 FALHOU: item parado COM custo (turnover 0) e item SEM custo (turnover NULL) colapsaram no mesmo valor: % vs %', v_costed, v_nocost;
  END IF;
END $$;

-- ── D-13: cobertura = dias_com_estoque / dias_com_snapshot (nivel de servico) ──
-- P_STOCKOUT na janela W: 10 snapshots (6 com qty>0, 4 com qty<=0) e 3 dias
-- SEM snapshot. cobertura = 6/10 = 0.6 (NAO 6/13 = 0.4615).
-- Cobertura NAO e DoS: aqui dos = 0.0 (estoque atual 0) e cobertura = 0.6.
DO $$
DECLARE v_cob numeric; v_dos numeric;
BEGIN
  SELECT cobertura_pct, dos INTO v_cob, v_dos
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_STOCKOUT';
  IF round(v_cob, 4) IS DISTINCT FROM 0.6 THEN
    RAISE EXCEPTION 'D-13 FALHOU: P_STOCKOUT cobertura_pct esperado 0.6 (6 dias com estoque / 10 dias observados), veio %', v_cob;
  END IF;
  IF v_dos IS DISTINCT FROM 0.0 THEN
    RAISE EXCEPTION 'D-13 FALHOU: P_STOCKOUT dos esperado 0.0 (estoque atual 0 / ADS 0.6667), veio %', v_dos;
  END IF;
  IF v_cob IS NOT DISTINCT FROM v_dos THEN
    RAISE EXCEPTION 'D-13 FALHOU: cobertura_pct e dos sao metricas distintas e vieram iguais (%)', v_cob;
  END IF;
END $$;

-- ── D-14: dia SEM snapshot nao entra no numerador nem no denominador ────────
-- P_STOCKOUT: stockout_days = 4 ; stockout_rate = 4/10 = 0.4
-- Se os 3 dias sem snapshot fossem presumidos como quebra, viria 7/13 = 0.5385.
-- cobertura + stockout_rate = 1.0 prova que o denominador e o mesmo conjunto
-- de dias OBSERVADOS.
DO $$
DECLARE v_days integer; v_rate numeric; v_cob numeric; v_now boolean;
BEGIN
  SELECT stockout_days, stockout_rate, cobertura_pct, is_stockout_now
    INTO v_days, v_rate, v_cob, v_now
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_STOCKOUT';
  IF v_days IS DISTINCT FROM 4 THEN
    RAISE EXCEPTION 'D-14 FALHOU: P_STOCKOUT stockout_days esperado 4, veio % (dias sem snapshot nao podem contar como quebra)', v_days;
  END IF;
  IF round(v_rate, 4) IS DISTINCT FROM 0.4 THEN
    RAISE EXCEPTION 'D-14 FALHOU: P_STOCKOUT stockout_rate esperado 0.4 (4/10), veio %', v_rate;
  END IF;
  IF round(v_rate + v_cob, 4) IS DISTINCT FROM 1.0 THEN
    RAISE EXCEPTION 'D-14 FALHOU: stockout_rate + cobertura_pct deveria fechar 1.0 sobre os dias observados, veio %', round(v_rate + v_cob, 4);
  END IF;
  -- snapshot mais recente (hoje) tem quantity 0
  IF v_now IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'D-14 FALHOU: P_STOCKOUT is_stockout_now esperado true (snapshot de hoje com qty 0), veio %', v_now;
  END IF;
END $$;

-- P_FAST: 30 dias observados, todos com estoque -> cobertura 1, quebra 0
DO $$
DECLARE v_cob numeric; v_days integer; v_now boolean;
BEGIN
  SELECT cobertura_pct, stockout_days, is_stockout_now INTO v_cob, v_days, v_now
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  IF v_cob IS DISTINCT FROM 1 OR v_days IS DISTINCT FROM 0 OR v_now IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'D-14 FALHOU: P_FAST esperado cobertura 1 / stockout_days 0 / is_stockout_now false, veio % / % / %', v_cob, v_days, v_now;
  END IF;
END $$;

-- ── D-15: precedencia dead > slow > fast > normal ───────────────────────────
-- P_DEAD tem venda ha 100 dias (fora da janela dead de 90) e estoque 20 > 0:
--   'dead' e determinado pela janela, nao por "nunca vendeu".
-- P_DOSNULL tem venda ha 60 dias (dentro da janela dead) -> NAO e dead, e como
--   dos e NULL nao pode ser slow nem fast -> 'normal'.
-- P_COSTONLY so existe em product_costs (sem snapshot, sem venda) -> NULL.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('P_FAST',        'fast'),    -- dos 15.0 <= fast_max 15
      ('P_SLOW',        'slow'),    -- dos 300  >= slow_min 120
      ('P_DEAD',        'dead'),    -- 0 venda em 90d + estoque 20
      ('P_DEAD_COSTED', 'dead'),    -- 0 venda em 90d + estoque 20
      ('P_STALE',       'dead'),    -- 0 venda em 90d + estoque 12 (snapshot velho nao muda a classe)
      ('P_DOSNULL',     'normal'),  -- venda em 60d, dos NULL
      ('P_STOCKOUT',    'fast')     -- dos 0.0 <= fast_max 15
    ) AS t(code, esperado)
  LOOP
    IF (SELECT movement_class FROM product_inventory_metrics
         WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8'
           AND product_code = r.code) IS DISTINCT FROM r.esperado THEN
      RAISE EXCEPTION 'D-15 FALHOU: % movement_class esperado %, veio %',
        r.code, r.esperado,
        (SELECT movement_class FROM product_inventory_metrics
          WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = r.code);
    END IF;
  END LOOP;
END $$;

-- Sem estoque conhecido E sem venda na janela longa -> NULL (indeterminado),
-- nunca 'dead'. NULL aqui e "nao da para classificar", nao "parado".
DO $$
DECLARE v_mc text;
BEGIN
  SELECT movement_class INTO v_mc FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_COSTONLY';
  IF v_mc IS NOT NULL THEN
    RAISE EXCEPTION 'D-15 FALHOU: P_COSTONLY (sem snapshot e sem venda) deveria ter movement_class NULL, veio %', v_mc;
  END IF;
END $$;

-- ── D-16: curva ABC por lucro acumulado ─────────────────────────────────────
-- Soma das metricas positivas do tenant = 10000:
--   8000 (A) + 1000 (B) + 400 (REV) + 200 (STOCKOUT) + 150 (NOCOST)
--   + 100 (C) + 60 (FAST) + 40 (DOSNULL) + 30 (SLOW) + 20 (UNKNOWN) = 10000
--   P_ABC_NEG (-400) nao soma (GREATEST(metrica, 0)).
-- cum: A 8000/10000 = 0.80 -> 'A' (corte 0.80)
--      B 9000/10000 = 0.90 -> 'B' (corte 0.95)
DO $$
DECLARE v_class text; v_cum numeric; v_rank integer; v_basis text; v_metric numeric;
BEGIN
  SELECT abc_class, cum_pct, abc_rank, abc_basis, abc_metric
    INTO v_class, v_cum, v_rank, v_basis, v_metric
    FROM product_abc_curve
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ABC_A';
  IF v_class IS DISTINCT FROM 'A' THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_A abc_class esperado A, veio %', v_class;
  END IF;
  IF v_rank IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_A abc_rank esperado 1, veio %', v_rank;
  END IF;
  IF round(v_cum, 4) IS DISTINCT FROM 0.8 THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_A cum_pct esperado 0.8000 (8000/10000), veio %', v_cum;
  END IF;
  IF v_basis IS DISTINCT FROM 'profit' THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_A abc_basis esperado profit, veio %', v_basis;
  END IF;
  IF v_metric IS DISTINCT FROM 8000 THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_A abc_metric esperado 8000 (100 un * margem 80), veio %', v_metric;
  END IF;
END $$;

-- O acumulado de P_ABC_B NAO pode ser distorcido pelo produto de lucro negativo.
DO $$
DECLARE v_class text; v_cum numeric;
BEGIN
  SELECT abc_class, cum_pct INTO v_class, v_cum
    FROM product_abc_curve
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ABC_B';
  IF round(v_cum, 4) IS DISTINCT FROM 0.9 THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_B cum_pct esperado 0.9000 (9000/10000) — lucro negativo de P_ABC_NEG distorceu o acumulado, veio %', v_cum;
  END IF;
  IF v_class IS DISTINCT FROM 'B' THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_B abc_class esperado B (cum 0.90 entre 0.80 e 0.95), veio %', v_class;
  END IF;
END $$;

-- Lucro negativo -> classe C e ultimo do ranking, sem cum_pct > 1.
DO $$
DECLARE v_class text; v_metric numeric; v_rank integer; v_cum numeric; v_total integer;
BEGIN
  SELECT abc_class, abc_metric, abc_rank, cum_pct
    INTO v_class, v_metric, v_rank, v_cum
    FROM product_abc_curve
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ABC_NEG';
  SELECT count(*) INTO v_total FROM product_abc_curve
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
  -- 10 un vendidas a 10 com custo 50 -> 10 * (10 - 50) = -400
  IF v_metric IS DISTINCT FROM -400 THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_NEG abc_metric esperado -400, veio %', v_metric;
  END IF;
  IF v_metric IS NULL OR v_metric > 0 THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_NEG abc_metric deveria ser <= 0, veio %', v_metric;
  END IF;
  IF v_class IS DISTINCT FROM 'C' THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_NEG abc_class esperado C (metrica <= 0), veio %', v_class;
  END IF;
  IF v_rank IS DISTINCT FROM v_total THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_NEG deveria ser o ultimo do rank (% de %), veio %', v_total, v_total, v_rank;
  END IF;
  IF v_cum > 1 THEN
    RAISE EXCEPTION 'D-16 FALHOU: cum_pct passou de 1 por causa da metrica negativa, veio %', v_cum;
  END IF;
END $$;

-- Fallback de receita marcado explicitamente (auditavel, nunca silencioso).
DO $$
DECLARE v_basis text; v_metric numeric;
BEGIN
  SELECT abc_basis, abc_metric INTO v_basis, v_metric
    FROM product_abc_curve
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ABC_REV';
  IF v_basis IS DISTINCT FROM 'revenue' THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_REV (sem custo na venda) abc_basis esperado revenue, veio %', v_basis;
  END IF;
  -- 20 un * preco 20 = 400 de receita
  IF v_metric IS DISTINCT FROM 400 THEN
    RAISE EXCEPTION 'D-16 FALHOU: P_ABC_REV abc_metric esperado 400 (receita), veio %', v_metric;
  END IF;
END $$;

-- Produto sem venda na janela L nao entra na curva.
DO $$
DECLARE v_n integer;
BEGIN
  SELECT count(*) INTO v_n FROM product_abc_curve
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8'
     AND product_code IN ('P_DEAD', 'P_DEAD_COSTED', 'P_COSTONLY', 'P_ORPHAN');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'D-16 FALHOU: produtos sem venda na janela L apareceram na curva ABC (% linhas)', v_n;
  END IF;
END $$;

-- ── D-17: stock_status unknown / stale ──────────────────────────────────────
DO $$
DECLARE v_status text; v_qty numeric; v_dos numeric; v_sv numeric;
        v_last date; v_stale integer; v_now boolean;
BEGIN
  SELECT stock_status, current_qty, dos, stock_value, last_snapshot_date,
         snapshot_staleness_days, is_stockout_now
    INTO v_status, v_qty, v_dos, v_sv, v_last, v_stale, v_now
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_UNKNOWN';
  IF v_status IS DISTINCT FROM 'unknown' THEN
    RAISE EXCEPTION 'D-17 FALHOU: P_UNKNOWN stock_status esperado unknown, veio %', v_status;
  END IF;
  IF v_qty IS NOT NULL OR v_dos IS NOT NULL OR v_sv IS NOT NULL
     OR v_last IS NOT NULL OR v_stale IS NOT NULL OR v_now IS NOT NULL THEN
    RAISE EXCEPTION 'D-17 FALHOU: P_UNKNOWN deveria ter qty/dos/stock_value/last_snapshot/staleness/is_stockout_now NULL, veio % / % / % / % / % / %',
      v_qty, v_dos, v_sv, v_last, v_stale, v_now;
  END IF;
END $$;

-- Snapshot velho continua sendo usado (nunca zerar silenciosamente).
DO $$
DECLARE v_status text; v_qty numeric; v_stale integer;
BEGIN
  SELECT stock_status, current_qty, snapshot_staleness_days
    INTO v_status, v_qty, v_stale
    FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_STALE';
  IF v_status IS DISTINCT FROM 'stale' THEN
    RAISE EXCEPTION 'D-17 FALHOU: P_STALE stock_status esperado stale (snapshot de 20 dias > limite 7), veio %', v_status;
  END IF;
  IF v_stale IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'D-17 FALHOU: P_STALE snapshot_staleness_days esperado 20, veio %', v_stale;
  END IF;
  IF v_qty IS DISTINCT FROM 12 THEN
    RAISE EXCEPTION 'D-17 FALHOU: P_STALE current_qty esperado 12 (ultimo valor conhecido, nunca zerado), veio %', v_qty;
  END IF;
END $$;

-- ── D-19: universo = snapshots UNIAO vendas UNIAO product_costs ─────────────
-- 15 SKUs: FAST, SLOW, DEAD, DEAD_COSTED, DOSNULL, NOCOST, STOCKOUT, UNKNOWN,
--          STALE, COSTONLY, ABC_A, ABC_B, ABC_C, ABC_NEG, ABC_REV.
-- P_ORPHAN nao entra (unica fonte era um sale_items sem cabecalho — D-08).
-- Nome: product_costs.name > products.name > product_code.
DO $$
DECLARE v_n integer; v_fast text; v_nocost text; v_rev text;
BEGIN
  SELECT count(*) INTO v_n FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
  IF v_n <> 15 THEN
    RAISE EXCEPTION 'D-19 FALHOU: universo esperado 15 SKUs, veio %', v_n;
  END IF;
  SELECT product_name INTO v_fast FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  SELECT product_name INTO v_nocost FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_NOCOST';
  SELECT product_name INTO v_rev FROM product_inventory_metrics
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ABC_REV';
  IF v_fast IS DISTINCT FROM 'Fast Mover Teste'
     OR v_nocost IS DISTINCT FROM 'Sem Custo Teste'
     OR v_rev IS DISTINCT FROM 'P_ABC_REV' THEN
    RAISE EXCEPTION 'D-19 FALHOU: cadeia de nome (product_costs > products > product_code) veio % / % / %', v_fast, v_nocost, v_rev;
  END IF;
END $$;

-- ── D-23: ranking de vendas tem store e NAO tem vendor_id ───────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'product_sales_ranking'
                AND column_name = 'vendor_id') THEN
    RAISE EXCEPTION 'D-23 FALHOU: product_sales_ranking expoe vendor_id — a fronteira "comprador nao ve performance individual" e estrutural, a coluna nao pode existir';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_schema = 'public' AND table_name = 'product_sales_ranking'
                    AND column_name = 'store') THEN
    RAISE EXCEPTION 'D-23 FALHOU: product_sales_ranking deveria ter a coluna store';
  END IF;
END $$;

-- Nenhuma view de INVENTARIO carrega store nem vendor_id (contrato, garantia 4).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name
      FROM information_schema.columns c
     WHERE c.table_schema = 'public'
       AND c.table_name IN ('product_daily_sales', 'product_inventory_metrics', 'product_abc_curve')
       AND c.column_name IN ('store', 'vendor_id')
  LOOP
    RAISE EXCEPTION 'D-23 FALHOU: view de inventario %.% nao pode existir (estoque e agregado por tenant)', r.table_name, r.column_name;
  END LOOP;
END $$;

-- Agregacao por loja e total do tenant.
-- P_FAST: 2 pedidos de 20 em LOJA_A (40) + 1 pedido de 20 em LOJA_B (20) = 60.
-- Total do tenant na janela L (exclui P_DEAD/P_STALE em D-100 e P_ORPHAN):
--   60+30+4+30+10+20+100+100+10+10+20 = 394
DO $$
DECLARE v_a numeric; v_b numeric; v_fast numeric; v_total numeric;
BEGIN
  SELECT qty_sold INTO v_a FROM product_sales_ranking
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST' AND store = 'LOJA_A';
  SELECT qty_sold INTO v_b FROM product_sales_ranking
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST' AND store = 'LOJA_B';
  SELECT sum(qty_sold) INTO v_fast FROM product_sales_ranking
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_FAST';
  SELECT sum(qty_sold) INTO v_total FROM product_sales_ranking
   WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8';
  IF v_a IS DISTINCT FROM 40 OR v_b IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'D-23 FALHOU: P_FAST por loja esperado LOJA_A=40 / LOJA_B=20, veio % / %', v_a, v_b;
  END IF;
  IF v_fast IS DISTINCT FROM 60 THEN
    RAISE EXCEPTION 'D-23 FALHOU: agregar P_FAST sem store deveria dar 60, veio %', v_fast;
  END IF;
  IF v_total IS DISTINCT FROM 394 THEN
    RAISE EXCEPTION 'D-23 FALHOU: total do tenant na janela L esperado 394 un, veio %', v_total;
  END IF;
  -- ranking tambem respeita D-08: orfao fora
  IF EXISTS (SELECT 1 FROM product_sales_ranking
              WHERE tenant_id = '00000000-0000-0000-0000-0000000008a8' AND product_code = 'P_ORPHAN') THEN
    RAISE EXCEPTION 'D-08 FALHOU: P_ORPHAN apareceu em product_sales_ranking';
  END IF;
END $$;

-- ── RPC product_stock_history: dias sem snapshot vem com quantity NULL ──────
-- 91 dias (D0-90 ate D0). P_STOCKOUT tem 10 snapshots; os demais dias sao
-- buracos reais e precisam sair como NULL — nunca como 0.
DO $$
DECLARE v_linhas integer; v_com_snap integer; v_hoje numeric;
        v_ontem_null boolean; v_venda numeric;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE h.quantity IS NOT NULL)
    INTO v_linhas, v_com_snap
    FROM product_stock_history('00000000-0000-0000-0000-0000000008a8', 'P_STOCKOUT', 90) h;
  IF v_linhas <> 91 THEN
    RAISE EXCEPTION 'RPC FALHOU: product_stock_history esperado 91 linhas (D0-90..D0), veio %', v_linhas;
  END IF;
  IF v_com_snap <> 10 THEN
    RAISE EXCEPTION 'D-14 FALHOU: product_stock_history esperado 10 dias com snapshot, veio %', v_com_snap;
  END IF;
  SELECT (h.quantity IS NULL) INTO v_ontem_null
    FROM product_stock_history('00000000-0000-0000-0000-0000000008a8', 'P_STOCKOUT', 90) h
   WHERE h.day = CURRENT_DATE - 1;
  IF v_ontem_null IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'D-14 FALHOU: dia sem snapshot (ontem) deveria vir com quantity NULL na RPC, nao 0';
  END IF;
  SELECT h.quantity INTO v_hoje
    FROM product_stock_history('00000000-0000-0000-0000-0000000008a8', 'P_STOCKOUT', 90) h
   WHERE h.day = CURRENT_DATE;
  IF v_hoje IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'D-14 FALHOU: dia COM snapshot zerado deveria vir quantity 0 na RPC, veio %', v_hoje;
  END IF;
  SELECT h.qty_sold INTO v_venda
    FROM product_stock_history('00000000-0000-0000-0000-0000000008a8', 'P_STOCKOUT', 90) h
   WHERE h.day = CURRENT_DATE - 10;
  IF v_venda IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'RPC FALHOU: product_stock_history qty_sold em D0-10 esperado 20, veio %', v_venda;
  END IF;
END $$;

-- ── RPC inventory_summary: KPIs de topo ─────────────────────────────────────
-- total_skus       = 15 (universo D-19)
-- skus_sem_custo   = 2  (P_NOCOST, P_ABC_REV)
-- skus_em_quebra   = 1  (P_STOCKOUT)
-- skus_parados     = 3  (P_DEAD, P_DEAD_COSTED, P_STALE)
-- skus_stale       = 1  (P_STALE)
-- total_stock_value= 300 + 1500 + 160 + 160 + 60 + 0 + 72 = 2252
--                    (P_NOCOST e os 'unknown' entram como NULL, nao como 0)
DO $$
DECLARE r record;
BEGIN
  SELECT * INTO r FROM inventory_summary('00000000-0000-0000-0000-0000000008a8');
  IF r.total_skus IS DISTINCT FROM 15 THEN
    RAISE EXCEPTION 'RPC FALHOU: inventory_summary total_skus esperado 15, veio %', r.total_skus;
  END IF;
  IF r.skus_sem_custo IS DISTINCT FROM 2 THEN
    RAISE EXCEPTION 'D-12 FALHOU: inventory_summary skus_sem_custo esperado 2 (P_NOCOST, P_ABC_REV), veio %', r.skus_sem_custo;
  END IF;
  IF r.skus_em_quebra IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'D-14 FALHOU: inventory_summary skus_em_quebra esperado 1 (P_STOCKOUT), veio %', r.skus_em_quebra;
  END IF;
  IF r.skus_parados IS DISTINCT FROM 3 THEN
    RAISE EXCEPTION 'D-15 FALHOU: inventory_summary skus_parados esperado 3 (P_DEAD, P_DEAD_COSTED, P_STALE), veio %', r.skus_parados;
  END IF;
  IF r.skus_stale IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'D-17 FALHOU: inventory_summary skus_stale esperado 1 (P_STALE), veio %', r.skus_stale;
  END IF;
  IF r.total_stock_value IS DISTINCT FROM 2252 THEN
    RAISE EXCEPTION 'D-12 FALHOU: inventory_summary total_stock_value esperado 2252, veio % (valores sem custo entram como NULL, nunca 0)', r.total_stock_value;
  END IF;
END $$;

-- ── D-21: grants das views (anon/authenticated sem SELECT) ──────────────────
-- Verificacao explicita e literal: se as roles nao existirem, o script FALHA em
-- vez de pular silenciosamente (a verificacao de grants e parte do gate da fase).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RAISE EXCEPTION 'D-21 FALHOU: role anon nao existe neste banco — a verificacao de grants nao pode ser pulada';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    RAISE EXCEPTION 'D-21 FALHOU: role authenticated nao existe neste banco — a verificacao de grants nao pode ser pulada';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    RAISE EXCEPTION 'D-21 FALHOU: role service_role nao existe neste banco';
  END IF;

  IF has_table_privilege('anon', 'public.product_inventory_metrics', 'SELECT') THEN
    RAISE EXCEPTION 'D-21 FALHOU: anon tem SELECT em product_inventory_metrics (esperado false)';
  END IF;
  IF has_table_privilege('authenticated', 'public.product_inventory_metrics', 'SELECT') THEN
    RAISE EXCEPTION 'D-21 FALHOU: authenticated tem SELECT em product_inventory_metrics (esperado false)';
  END IF;
END $$;

DO $$
DECLARE v_role text; v_view text;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    FOREACH v_view IN ARRAY ARRAY['product_daily_sales', 'product_inventory_metrics',
                                  'product_abc_curve', 'product_sales_ranking'] LOOP
      IF has_table_privilege(v_role, 'public.' || v_view, 'SELECT') THEN
        RAISE EXCEPTION 'D-21 FALHOU: % tem SELECT em % (esperado false)', v_role, v_view;
      END IF;
    END LOOP;
  END LOOP;

  FOREACH v_view IN ARRAY ARRAY['product_daily_sales', 'product_inventory_metrics',
                                'product_abc_curve', 'product_sales_ranking'] LOOP
    IF NOT has_table_privilege('service_role', 'public.' || v_view, 'SELECT') THEN
      RAISE EXCEPTION 'D-21 FALHOU: service_role NAO tem SELECT em % (a Fase 09 le via createAdminClient)', v_view;
    END IF;
  END LOOP;
END $$;

-- ── D-21: grants das RPCs ───────────────────────────────────────────────────
DO $$
DECLARE v_role text; v_fn text;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    FOREACH v_fn IN ARRAY ARRAY['public.inventory_summary(uuid)',
                                'public.product_stock_history(uuid, text, integer)'] LOOP
      IF has_function_privilege(v_role, v_fn, 'EXECUTE') THEN
        RAISE EXCEPTION 'D-21 FALHOU: % tem EXECUTE em % (esperado false)', v_role, v_fn;
      END IF;
    END LOOP;
  END LOOP;

  IF NOT has_function_privilege('service_role', 'public.inventory_summary(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'D-21 FALHOU: service_role NAO tem EXECUTE em inventory_summary(uuid)';
  END IF;
  IF NOT has_function_privilege('service_role', 'public.product_stock_history(uuid, text, integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'D-21 FALHOU: service_role NAO tem EXECUTE em product_stock_history(uuid, text, integer)';
  END IF;
END $$;

-- ── D-02: RLS ativa nas tabelas novas da fase ───────────────────────────────
DO $$
DECLARE v_tab text; v_rls boolean;
BEGIN
  FOREACH v_tab IN ARRAY ARRAY['product_costs', 'inventory_settings'] LOOP
    SELECT relrowsecurity INTO v_rls
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = v_tab;
    IF v_rls IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'D-02 FALHOU: RLS nao esta habilitada em % (veio %)', v_tab, v_rls;
    END IF;
  END LOOP;
END $$;

-- ── D-22: indices obrigatorios ──────────────────────────────────────────────
DO $$
DECLARE v_idx text;
BEGIN
  FOREACH v_idx IN ARRAY ARRAY['idx_stock_snapshots_tenant_product_date',
                               'idx_sales_records_tenant_order_ref',
                               'idx_sales_records_tenant_sale_date',
                               'idx_sale_items_tenant_product'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = v_idx) THEN
      RAISE EXCEPTION 'D-22 FALHOU: indice % nao existe', v_idx;
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  RAISE NOTICE 'Fase 08: todos os asserts passaram (D-02, D-06, D-08, D-10..D-19, D-21, D-22, D-23). Desfazendo dados sinteticos.';
END $$;

-- Nada do que este script criou sobrevive a esta linha.
ROLLBACK;
