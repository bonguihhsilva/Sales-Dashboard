-- Phase 08: população de product_costs (D-03).

-- ── 1. upsert_product_costs: destino de escrita do upload-catalog ──────────
-- Precedência D-03: manual nunca é sobrescrito por catalog; catalog sobrescreve
-- catalog e api. SECURITY INVOKER (default): chamada só via service-role.
CREATE OR REPLACE FUNCTION upsert_product_costs(p_tenant_id uuid, p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO product_costs (tenant_id, product_code, unit_cost, name, source, updated_at)
  SELECT
    p_tenant_id,
    elem->>'product_code',
    NULLIF(elem->>'unit_cost', '')::numeric,
    elem->>'name',
    'catalog',
    now()
  FROM jsonb_array_elements(p_rows) AS elem
  WHERE elem->>'product_code' IS NOT NULL AND elem->>'product_code' <> ''
  ON CONFLICT (tenant_id, product_code) DO UPDATE
    SET unit_cost  = EXCLUDED.unit_cost,
        name       = EXCLUDED.name,
        source     = 'catalog',
        updated_at = now()
    WHERE product_costs.source <> 'manual';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_product_costs(uuid, jsonb) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.upsert_product_costs(uuid, jsonb) TO service_role;

-- ── 2. Seed de bootstrap a partir do products do período mais recente ──────
-- DO NOTHING: se um tenant já populou product_costs por upload real, o seed
-- não reverte nada. Não é backfill de períodos antigos (D-03).
WITH latest_period AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, id AS period_id
  FROM periods
  ORDER BY tenant_id, year DESC, month DESC
)
INSERT INTO product_costs (tenant_id, product_code, unit_cost, name, source, updated_at)
SELECT
  p.tenant_id,
  p.product_code,
  p.cost_price,
  p.name,
  'catalog',
  now()
FROM products p
JOIN latest_period lp
  ON lp.tenant_id = p.tenant_id AND lp.period_id = p.period_id
ON CONFLICT (tenant_id, product_code) DO NOTHING;
