-- =============================================================
-- Migration 0001 — Schema inicial inferido do codebase
-- Gerado em: 2026-05-20
-- Fonte: tipos TypeScript, queries Supabase e parser existentes
-- =============================================================

-- ------------------------------------------------------------
-- profiles
-- Criada automaticamente pelo trigger Supabase Auth on_auth_user_created
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  role       text NOT NULL DEFAULT 'vendedor' CHECK (role IN ('adm', 'vendedor')),
  vendor_id  text,           -- código do vendedor no sistema CEC (ex: "V001")
  store      text,           -- 'Jebai' | 'Paje-MKT' | 'Paje-Caixa'
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- periods
-- Períodos de análise mensais
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS periods (
  id         serial PRIMARY KEY,
  year       integer NOT NULL,
  month      integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  label      text NOT NULL,       -- ex: "Jan 2025"
  start_date date NOT NULL,
  end_date   date NOT NULL,
  closed     boolean NOT NULL DEFAULT false,
  UNIQUE (year, month)
);

-- ------------------------------------------------------------
-- goals
-- Metas e comissões por vendedor por período
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals (
  id             serial PRIMARY KEY,
  period_id      integer NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  vendor_id      text NOT NULL,   -- código CEC do vendedor
  vendor_name    text NOT NULL,
  store          text NOT NULL,
  meta1          numeric(12,2) NOT NULL DEFAULT 0,
  meta2          numeric(12,2) NOT NULL DEFAULT 0,
  meta3          numeric(12,2) NOT NULL DEFAULT 0,
  bonus1         numeric(12,2) NOT NULL DEFAULT 0,
  bonus2         numeric(12,2) NOT NULL DEFAULT 0,
  bonus3         numeric(12,2) NOT NULL DEFAULT 0,
  commission_pct numeric(5,4) NOT NULL DEFAULT 0,  -- ex: 0.03 = 3%
  UNIQUE (period_id, vendor_id)
);

-- ------------------------------------------------------------
-- sales_records
-- Registros brutos importados via UploadModal (HTML do CEC)
-- Um registro por linha do relatório (vendedor + cliente + ordem + item)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_records (
  id           bigserial PRIMARY KEY,
  period_id    integer NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  vendor_id    text NOT NULL,
  vendor_name  text NOT NULL,
  store        text NOT NULL,
  client_id    text NOT NULL,
  client_name  text NOT NULL,
  sale_date    date NOT NULL,
  sale_time    time,
  order_ref    text,
  valor        numeric(12,2) NOT NULL DEFAULT 0,
  quantity     integer NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sales_records_period_idx ON sales_records(period_id);
CREATE INDEX IF NOT EXISTS sales_records_vendor_idx ON sales_records(vendor_id);
CREATE INDEX IF NOT EXISTS sales_records_client_idx ON sales_records(client_id);

-- ------------------------------------------------------------
-- vendor_summary (VIEW)
-- Agrega sales_records + goals por vendedor por período
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vendor_summary AS
SELECT
  p.id                                            AS period_id,
  p.label                                         AS period_label,
  p.year,
  p.month,
  sr.vendor_id,
  sr.vendor_name,
  sr.store,
  SUM(sr.valor)                                   AS total_sold,
  COUNT(DISTINCT sr.client_id)                    AS unique_clients,
  COUNT(DISTINCT sr.order_ref)                    AS total_orders,
  SUM(sr.quantity)                                AS total_items,
  CASE WHEN COUNT(DISTINCT sr.order_ref) > 0
    THEN SUM(sr.valor) / COUNT(DISTINCT sr.order_ref)
    ELSE 0
  END                                             AS avg_ticket,
  MAX(sr.sale_date)::text                         AS last_sale_date,
  MAX(sr.sale_time)::text                         AS last_sale_time,
  COALESCE(g.meta1, 0)                            AS meta1,
  COALESCE(g.meta2, 0)                            AS meta2,
  COALESCE(g.meta3, 0)                            AS meta3,
  COALESCE(g.bonus1, 0)                           AS bonus1,
  COALESCE(g.bonus2, 0)                           AS bonus2,
  COALESCE(g.bonus3, 0)                           AS bonus3,
  COALESCE(g.commission_pct, 0)                   AS commission_pct,
  CASE
    WHEN SUM(sr.valor) >= COALESCE(g.meta3, 0) AND g.meta3 > 0 THEN 3
    WHEN SUM(sr.valor) >= COALESCE(g.meta2, 0) AND g.meta2 > 0 THEN 2
    WHEN SUM(sr.valor) >= COALESCE(g.meta1, 0) AND g.meta1 > 0 THEN 1
    ELSE 0
  END                                             AS meta_level,
  CASE
    WHEN SUM(sr.valor) >= COALESCE(g.meta3, 0) AND g.meta3 > 0 THEN COALESCE(g.bonus3, 0)
    WHEN SUM(sr.valor) >= COALESCE(g.meta2, 0) AND g.meta2 > 0 THEN COALESCE(g.bonus2, 0)
    WHEN SUM(sr.valor) >= COALESCE(g.meta1, 0) AND g.meta1 > 0 THEN COALESCE(g.bonus1, 0)
    ELSE 0
  END                                             AS bonus_earned,
  SUM(sr.valor) * COALESCE(g.commission_pct, 0)  AS total_commission
FROM sales_records sr
JOIN periods p ON p.id = sr.period_id
LEFT JOIN goals g ON g.period_id = sr.period_id AND g.vendor_id = sr.vendor_id
GROUP BY
  p.id, p.label, p.year, p.month,
  sr.vendor_id, sr.vendor_name, sr.store,
  g.meta1, g.meta2, g.meta3,
  g.bonus1, g.bonus2, g.bonus3,
  g.commission_pct;

-- ------------------------------------------------------------
-- client_portfolio (VIEW)
-- Agrega sales_records por cliente por vendedor por período
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW client_portfolio AS
SELECT
  sr.period_id,
  sr.vendor_id,
  sr.client_id,
  MAX(sr.client_name)                             AS client_name,
  SUM(sr.valor)                                   AS total_spent,
  COUNT(DISTINCT sr.sale_date)                    AS visit_days,
  COUNT(DISTINCT sr.order_ref)                    AS total_orders,
  SUM(sr.quantity)                                AS total_items,
  CASE WHEN COUNT(DISTINCT sr.order_ref) > 0
    THEN SUM(sr.quantity)::numeric / COUNT(DISTINCT sr.order_ref)
    ELSE 0
  END                                             AS avg_items_per_order,
  CASE WHEN COUNT(DISTINCT sr.order_ref) > 0
    THEN SUM(sr.valor) / COUNT(DISTINCT sr.order_ref)
    ELSE 0
  END                                             AS avg_ticket,
  MIN(sr.sale_date)::text                         AS first_purchase,
  MAX(sr.sale_date)::text                         AS last_purchase,
  MAX(sr.sale_time)::text                         AS last_purchase_time,
  (CURRENT_DATE - MAX(sr.sale_date))              AS days_since_last
FROM sales_records sr
GROUP BY sr.period_id, sr.vendor_id, sr.client_id;

-- ------------------------------------------------------------
-- vendor_evolution (RPC)
-- Histórico cross-período de um vendedor
-- Chamada: supabase.rpc('vendor_evolution', { p_vendor_id })
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION vendor_evolution(p_vendor_id text)
RETURNS TABLE (
  year           integer,
  month          integer,
  period_label   text,
  total_sold     numeric,
  meta1          numeric,
  meta2          numeric,
  meta3          numeric,
  meta_level     integer,
  bonus_earned   numeric,
  unique_clients bigint,
  total_items    bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    vs.year,
    vs.month,
    vs.period_label,
    vs.total_sold,
    vs.meta1,
    vs.meta2,
    vs.meta3,
    vs.meta_level,
    vs.bonus_earned,
    vs.unique_clients,
    vs.total_items
  FROM vendor_summary vs
  WHERE vs.vendor_id = p_vendor_id
  ORDER BY vs.year ASC, vs.month ASC;
$$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;

-- profiles: usuário lê/atualiza próprio; adm lê todos
CREATE POLICY "profiles_own_select"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_adm_select"  ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'adm')
);

-- periods: autenticado lê; adm escreve
CREATE POLICY "periods_auth_select"  ON periods FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "periods_adm_all"      ON periods FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'adm')
);

-- goals: autenticado lê; adm escreve
CREATE POLICY "goals_auth_select"    ON goals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "goals_adm_all"        ON goals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'adm')
);

-- sales_records: autenticado lê; adm escreve
CREATE POLICY "sales_auth_select"    ON sales_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "sales_adm_all"        ON sales_records FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'adm')
);

-- ------------------------------------------------------------
-- Trigger: criar profile ao registrar novo usuário
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, ''),
    'vendedor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
