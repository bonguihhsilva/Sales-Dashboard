-- Remove hardcode do fator de crescimento (média 3 meses * 1.20) e dos bônus
-- padrão de calculate_vendor_goals. Gerente configura em /dashboard/config.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS meta_growth_pct_default numeric(5,4) NOT NULL DEFAULT 0.20,
  ADD COLUMN IF NOT EXISTS bonus1_default numeric NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS bonus2_default numeric NOT NULL DEFAULT 150,
  ADD COLUMN IF NOT EXISTS bonus3_default numeric NOT NULL DEFAULT 200;

CREATE OR REPLACE FUNCTION public.calculate_vendor_goals(p_period_id bigint, p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  v_growth numeric;
  v_bonus1 numeric;
  v_bonus2 numeric;
  v_bonus3 numeric;
BEGIN
  SELECT year, month INTO v_year, v_month
  FROM periods WHERE id = p_period_id AND tenant_id = p_tenant_id;

  SELECT 1 + meta_growth_pct_default, bonus1_default, bonus2_default, bonus3_default
    INTO v_growth, v_bonus1, v_bonus2, v_bonus3
  FROM tenants WHERE id = p_tenant_id;

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
      v_meta1 := ROUND(v_avg * v_growth);
      v_meta2 := ROUND(v_meta1 * v_growth);
      v_meta3 := ROUND(v_meta2 * v_growth);
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
      v_meta1, v_meta2, v_meta3, v_bonus1, v_bonus2, v_bonus3,
      (SELECT commission_pct_default FROM tenants WHERE id = p_tenant_id),
      v_count
    WHERE NOT EXISTS (
      SELECT 1 FROM goals
      WHERE period_id = p_period_id AND vendor_id = v_vendor.vendor_id AND tenant_id = p_tenant_id
    );

  END LOOP;
END;
$$;
