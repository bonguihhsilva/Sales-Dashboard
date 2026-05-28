-- Migration: Arquitetura Multi-Tenant Real (Empresas -> Lojas)

-- 1. A tabela tenants já existe:
-- id, nome, slug, plano, cor_primaria, logo_url, moeda_padrao, locale, ativo, criado_em

-- 2. Tabela de Lojas (Stores)
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Inserir Tenant "Star Company" para os dados existentes
DO $$
DECLARE
    v_star_company_id UUID;
BEGIN
    INSERT INTO tenants (nome, slug, ativo) VALUES ('Star Company', 'star-company', true) RETURNING id INTO v_star_company_id;

    -- Inserir as lojas padrão que já existiam no frontend
    INSERT INTO stores (tenant_id, name, color) VALUES 
        (v_star_company_id, 'Paje-MKT', '#42d9f5'),
        (v_star_company_id, 'Paje-Caixa', '#f5a742'),
        (v_star_company_id, 'Jebai', '#7b61ff');

    -- 4. Adicionar tenant_id em tabelas chave com valor default do tenant criado
    
    -- sales_records
    ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE sales_records SET tenant_id = v_star_company_id WHERE tenant_id IS NULL;
    ALTER TABLE sales_records ALTER COLUMN tenant_id SET NOT NULL;

    -- periods
    ALTER TABLE periods ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE periods SET tenant_id = v_star_company_id WHERE tenant_id IS NULL;
    ALTER TABLE periods ALTER COLUMN tenant_id SET NOT NULL;

    -- goals
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE goals SET tenant_id = v_star_company_id WHERE tenant_id IS NULL;
    ALTER TABLE goals ALTER COLUMN tenant_id SET NOT NULL;

    -- vendor_exclusions
    ALTER TABLE vendor_exclusions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE vendor_exclusions SET tenant_id = v_star_company_id WHERE tenant_id IS NULL;
    ALTER TABLE vendor_exclusions ALTER COLUMN tenant_id SET NOT NULL;

    -- Atualizar profiles existentes 
    -- IMPORTANTE: como fiz um auto-fix de tenant_id com user.id antes, precisamos sobreescrever para a Star Company.
    UPDATE profiles SET tenant_id = v_star_company_id;

    -- Atualizar regras e comissoes (se existirem, setar pra star company)
    UPDATE regras_comissao SET tenant_id = v_star_company_id;
    UPDATE comissoes_calculadas SET tenant_id = v_star_company_id;

    -- convites
    ALTER TABLE convites ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE convites SET tenant_id = v_star_company_id WHERE tenant_id IS NULL;
    ALTER TABLE convites ALTER COLUMN tenant_id SET NOT NULL;

END $$;

-- 5. Atualizar Views

-- Recriar vendor_summary com tenant_id
DROP VIEW IF EXISTS vendor_summary;
CREATE VIEW vendor_summary AS
SELECT 
    sr.tenant_id,
    sr.period_id,
    p.label AS period_label,
    p.year,
    p.month,
    sr.vendor_id,
    sr.vendor_name,
    sr.store,
    round(sum(sr.valor), 2) AS total_sold,
    count(DISTINCT sr.client_id) AS unique_clients,
    count(*) AS total_orders,
    round(sum(sr.quantity)) AS total_items,
    round((sum(sr.valor) / (NULLIF(count(DISTINCT ((sr.sale_date)::text || sr.client_id)), 0))::numeric), 2) AS avg_ticket,
    max(sr.sale_date) AS last_sale_date,
    max(sr.sale_time) AS last_sale_time,
    g.meta1,
    g.meta2,
    g.meta3,
    g.bonus1,
    g.bonus2,
    g.bonus3,
    g.commission_pct,
    CASE
        WHEN (sum(sr.valor) >= g.meta3) THEN 3
        WHEN (sum(sr.valor) >= g.meta2) THEN 2
        WHEN (sum(sr.valor) >= g.meta1) THEN 1
        ELSE 0
    END AS meta_level,
    CASE
        WHEN (sum(sr.valor) >= g.meta3) THEN g.bonus3
        WHEN (sum(sr.valor) >= g.meta2) THEN g.bonus2
        WHEN (sum(sr.valor) >= g.meta1) THEN g.bonus1
        ELSE (0)::numeric
    END AS bonus_earned,
    round(((sum(sr.valor) * g.commission_pct) +
    CASE
        WHEN (sum(sr.valor) >= g.meta3) THEN g.bonus3
        WHEN (sum(sr.valor) >= g.meta2) THEN g.bonus2
        WHEN (sum(sr.valor) >= g.meta1) THEN g.bonus1
        ELSE (0)::numeric
    END), 2) AS total_commission
FROM sales_records sr
JOIN periods p ON p.id = sr.period_id
LEFT JOIN goals g ON g.period_id = sr.period_id AND g.vendor_id = sr.vendor_id AND g.tenant_id = sr.tenant_id
GROUP BY sr.tenant_id, sr.period_id, p.label, p.year, p.month, sr.vendor_id, sr.vendor_name, sr.store, g.meta1, g.meta2, g.meta3, g.bonus1, g.bonus2, g.bonus3, g.commission_pct;

-- Recriar client_portfolio com tenant_id
DROP VIEW IF EXISTS client_portfolio;
CREATE VIEW client_portfolio AS
SELECT 
    sr.tenant_id,
    sr.period_id,
    sr.vendor_id,
    sr.client_id,
    sr.client_name,
    round(sum(sr.valor), 2) AS total_spent,
    count(DISTINCT sr.sale_date) AS visit_days,
    count(*) AS total_orders,
    sum(sr.quantity) AS total_items,
    round((sum(sr.quantity) / (count(DISTINCT ((sr.sale_date)::text || sr.client_id)))::numeric), 2) AS avg_items_per_order,
    round((sum(sr.valor) / (count(DISTINCT ((sr.sale_date)::text || sr.client_id)))::numeric), 2) AS avg_ticket,
    min(sr.sale_date) AS first_purchase,
    max(sr.sale_date) AS last_purchase,
    max(sr.sale_time) AS last_purchase_time,
    (CURRENT_DATE - max(sr.sale_date)) AS days_since_last
FROM sales_records sr
GROUP BY sr.tenant_id, sr.period_id, sr.vendor_id, sr.client_id, sr.client_name;

-- 6. Atualizar funções RPC
CREATE OR REPLACE FUNCTION store_daily_evolution_multi(p_period_ids bigint[], p_tenant_id uuid)
RETURNS TABLE(period_id integer, sale_date date, day_total numeric)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.period_id,
        sr.sale_date,
        SUM(sr.valor) AS day_total
    FROM sales_records sr
    WHERE sr.period_id = ANY(p_period_ids) AND sr.tenant_id = p_tenant_id
    GROUP BY sr.period_id, sr.sale_date
    ORDER BY sr.period_id, sr.sale_date;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_vendor_goals(p_period_id bigint, p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_year  int;
  v_month int;
  v_vendor RECORD;
  v_count  int;
  v_avg    numeric;
  v_meta1  numeric;
  v_meta2  numeric;
  v_meta3  numeric;
BEGIN
  SELECT year, month INTO v_year, v_month
  FROM periods WHERE id = p_period_id AND tenant_id = p_tenant_id;

  FOR v_vendor IN (
    SELECT DISTINCT vs.vendor_id, vs.vendor_name, vs.store
    FROM vendor_summary vs
    JOIN periods p ON p.id = vs.period_id
    WHERE (p.year * 12 + p.month) < (v_year * 12 + v_month)
      AND vs.tenant_id = p_tenant_id
  ) LOOP

    SELECT COUNT(*) INTO v_count
    FROM vendor_summary vs
    WHERE vs.vendor_id = v_vendor.vendor_id
      AND vs.tenant_id = p_tenant_id
      AND vs.period_id IN (
        SELECT id FROM periods
        WHERE (year * 12 + month) < (v_year * 12 + v_month) AND tenant_id = p_tenant_id
        ORDER BY (year * 12 + month) DESC
        LIMIT 3
      );

    IF v_count >= 3 THEN
      SELECT ROUND(AVG(vs.total_sold)) INTO v_avg
      FROM vendor_summary vs
      WHERE vs.vendor_id = v_vendor.vendor_id
        AND vs.tenant_id = p_tenant_id
        AND vs.period_id IN (
          SELECT id FROM periods
          WHERE (year * 12 + month) < (v_year * 12 + v_month) AND tenant_id = p_tenant_id
          ORDER BY (year * 12 + month) DESC
          LIMIT 3
        );
      v_meta1 := ROUND(v_avg * 1.20);
      v_meta2 := ROUND(v_meta1 * 1.20);
      v_meta3 := ROUND(v_meta2 * 1.20);
    ELSE
      v_meta1 := 0;
      v_meta2 := 0;
      v_meta3 := 0;
    END IF;

    INSERT INTO goals (
      period_id, tenant_id, vendor_id, vendor_name, store,
      meta1, meta2, meta3, bonus1, bonus2, bonus3,
      commission_pct, history_months
    )
    SELECT
      p_period_id, p_tenant_id, v_vendor.vendor_id, v_vendor.vendor_name, v_vendor.store,
      v_meta1, v_meta2, v_meta3, 100, 150, 200, 0.003, v_count
    WHERE NOT EXISTS (
      SELECT 1 FROM goals
      WHERE period_id = p_period_id AND vendor_id = v_vendor.vendor_id AND tenant_id = p_tenant_id
    );

  END LOOP;
END;
$$;
