-- supabase/migrations/20260505_calculate_vendor_goals.sql

-- Add history_months to goals table so MetasClient can show "X/3 meses" badge
ALTER TABLE goals ADD COLUMN IF NOT EXISTS history_months smallint;

CREATE OR REPLACE FUNCTION calculate_vendor_goals(p_period_id bigint)
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
  FROM periods WHERE id = p_period_id;

  -- Iterate over every distinct vendor that appeared in any prior period
  FOR v_vendor IN (
    SELECT DISTINCT vs.vendor_id, vs.vendor_name, vs.store
    FROM vendor_summary vs
    JOIN periods p ON p.id = vs.period_id
    WHERE (p.year * 12 + p.month) < (v_year * 12 + v_month)
  ) LOOP

    -- Count how many of the 3 most recent prior periods this vendor has data in
    SELECT COUNT(*) INTO v_count
    FROM vendor_summary vs
    WHERE vs.vendor_id = v_vendor.vendor_id
      AND vs.period_id IN (
        SELECT id FROM periods
        WHERE (year * 12 + month) < (v_year * 12 + v_month)
        ORDER BY (year * 12 + month) DESC
        LIMIT 3
      );

    IF v_count >= 3 THEN
      SELECT ROUND(AVG(vs.total_sold)) INTO v_avg
      FROM vendor_summary vs
      WHERE vs.vendor_id = v_vendor.vendor_id
        AND vs.period_id IN (
          SELECT id FROM periods
          WHERE (year * 12 + month) < (v_year * 12 + v_month)
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

    -- Insert only if no goal yet for this vendor+period
    INSERT INTO goals (
      period_id, vendor_id, vendor_name, store,
      meta1, meta2, meta3, bonus1, bonus2, bonus3,
      commission_pct, history_months
    )
    SELECT
      p_period_id, v_vendor.vendor_id, v_vendor.vendor_name, v_vendor.store,
      v_meta1, v_meta2, v_meta3, 100, 150, 200, 0.003, v_count
    WHERE NOT EXISTS (
      SELECT 1 FROM goals
      WHERE period_id = p_period_id AND vendor_id = v_vendor.vendor_id
    );

  END LOOP;
END;
$$;
