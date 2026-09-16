-- =============================================================================
-- Comissão v0-2: metas por marca, manutenção de carteira e reativação
-- =============================================================================
-- Adiciona:
--   1. goals_brand        — meta manual de marca por (tenant, period, vendor, brand)
--   2. vendor_brand_metrics — soma vendida por (tenant, period, vendor, brand)
--   3. carteira_reativados — RPC: clientes que voltaram a comprar após 6 meses
--                           fechados sem compra (mês fechado — decisão R1)
--   4. índice de recência  — suporta o NOT EXISTS da reativação
--
-- RLS: goals_brand espelha goals (adm/gerente/super_admin dentro do tenant;
--      authenticated lê dentro do tenant). Views seguem o padrão das demais
--      (SELECT só p/ service_role; revogado de anon/authenticated).

-- ── 1. goals_brand (metas manuais por marca — decisão P2) ───────────────────
CREATE TABLE IF NOT EXISTS public.goals_brand (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_id  integer NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  vendor_id  text NOT NULL,
  brand      text NOT NULL,
  meta_valor numeric(12,2) NOT NULL DEFAULT 0,
  bonus      numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, period_id, vendor_id, brand)
);

ALTER TABLE public.goals_brand ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer autenticado do tenant (vendedor vê as metas da própria loja)
DROP POLICY IF EXISTS "goals_brand_tenant_select" ON public.goals_brand;
CREATE POLICY "goals_brand_tenant_select" ON public.goals_brand
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

-- Escrita: adm/gerente/super_admin do tenant (espelha goals_adm)
DROP POLICY IF EXISTS "goals_brand_tenant_admin_all" ON public.goals_brand;
CREATE POLICY "goals_brand_tenant_admin_all" ON public.goals_brand
  FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  )
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  );

-- ── 2. vendor_brand_metrics (métricas por marca) ─────────────────────────────
-- Marca vem de product_costs (overlay 1:1 por tenant+product_code → sem fan-out).
-- A linha '(sem marca)' nunca casa regra de marca (defensivo; regra de negócio:
-- todo SKU terá marca — validação na aplicação, Tarefa 6).
CREATE OR REPLACE VIEW public.vendor_brand_metrics AS
SELECT
  si.tenant_id,
  si.period_id,
  si.vendor_id,
  COALESCE(pc.brand, '(sem marca)') AS brand,
  round(sum(si.total_price), 2)     AS valor_vendido,
  sum(si.qty)                       AS qty,
  count(DISTINCT sr.client_id)      AS clientes_ativos
FROM public.sale_items si
JOIN public.sales_records sr
  ON sr.tenant_id = si.tenant_id
 AND sr.period_id = si.period_id
 AND sr.order_ref = si.order_id
LEFT JOIN public.product_costs pc
  ON pc.tenant_id = si.tenant_id
 AND pc.product_code = si.product_code
GROUP BY si.tenant_id, si.period_id, si.vendor_id, COALESCE(pc.brand, '(sem marca)');

REVOKE ALL ON public.vendor_brand_metrics FROM anon, authenticated, public;
GRANT SELECT ON public.vendor_brand_metrics TO service_role;

-- ── 3. carteira_reativados (mês fechado — decisão R1) ───────────────────────
-- Cliente do vendedor que comprou no período P e NÃO comprou em nenhum dos
-- 6 meses completos anteriores ao início de P ([início(P) − 6m, início(P))).
CREATE OR REPLACE FUNCTION public.carteira_reativados(p_period_id bigint, p_tenant_id uuid)
RETURNS TABLE (vendor_id text, client_id text, client_name text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start date;
BEGIN
  SELECT start_date INTO v_start
  FROM periods WHERE id = p_period_id AND tenant_id = p_tenant_id;

  IF v_start IS NULL THEN
    RETURN; -- período não pertence ao tenant → sem resultado
  END IF;

  RETURN QUERY
  SELECT DISTINCT sr.vendor_id, sr.client_id, max(sr.client_name)::text
  FROM public.sales_records sr
  WHERE sr.period_id = p_period_id
    AND sr.tenant_id = p_tenant_id
    AND NOT EXISTS (
      SELECT 1 FROM public.sales_records ant
      WHERE ant.tenant_id = sr.tenant_id
        AND ant.vendor_id = sr.vendor_id
        AND ant.client_id = sr.client_id
        AND ant.sale_date >= (v_start - INTERVAL '6 months')
        AND ant.sale_date <  v_start
        AND ant.period_id <> sr.period_id
    )
  GROUP BY sr.vendor_id, sr.client_id;
END;
$$;

REVOKE ALL ON FUNCTION public.carteira_reativados(bigint, uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.carteira_reativados(bigint, uuid) TO service_role;

-- ── 4. Índice de recência (perf do NOT EXISTS acima) ────────────────────────
CREATE INDEX IF NOT EXISTS idx_sales_records_vendor_client_date
  ON public.sales_records (tenant_id, vendor_id, client_id, sale_date);