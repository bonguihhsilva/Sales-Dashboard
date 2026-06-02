-- P0 security closeout (advisor-driven, 2026-06-01).

-- P0-1: vendor_evolution IDOR cross-tenant.
-- Era SECURITY DEFINER sem filtro de caller → qualquer authenticated lia evolução
-- de qualquer vendor de qualquer tenant via /rest/v1/rpc/vendor_evolution.
-- Fix: filtra pelo tenant do caller (JWT) + vendedor restrito ao próprio vendor_id.
-- Mantém SECURITY DEFINER de propósito: é o gateway de leitura (SELECT na view
-- vendor_summary está revogado de authenticated). Autorização agora é interna.
-- Também resolve search_path mutável (P0-4) nesta função.
CREATE OR REPLACE FUNCTION public.vendor_evolution(p_vendor_id text)
RETURNS TABLE(
  year integer, month integer, period_label text,
  total_sold numeric, meta1 numeric, meta2 numeric, meta3 numeric,
  meta_level integer, bonus_earned numeric, unique_clients bigint, total_items numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    vs.year, vs.month, vs.period_label,
    vs.total_sold, vs.meta1, vs.meta2, vs.meta3,
    vs.meta_level, vs.bonus_earned,
    vs.unique_clients, vs.total_items
  FROM vendor_summary vs
  WHERE vs.vendor_id = p_vendor_id
    AND vs.tenant_id = get_user_tenant_id()
    AND (
      (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
        IN ('adm','gerente','super_admin')
      OR p_vendor_id = (SELECT vendor_id FROM public.profiles WHERE id = auth.uid())
    )
  ORDER BY vs.year, vs.month;
$$;

-- P0-2: trigger fn exposta via RPC. Triggers rodam como owner; grant a anon/auth desnecessário.
REVOKE EXECUTE ON FUNCTION public.process_financial_audit() FROM anon, authenticated, public;

-- P0-3: grants residuais de escrita nas views financeiras (SELECT já revogado antes).
REVOKE ALL ON public.vendor_summary   FROM anon, authenticated;
REVOKE ALL ON public.client_portfolio FROM anon, authenticated;
REVOKE ALL ON public.all_vendors      FROM anon, authenticated;

-- P0-4: search_path mutável nas demais funções flagadas pelo advisor.
ALTER FUNCTION public.get_user_tenant_id() SET search_path = public;
ALTER FUNCTION public.store_daily_evolution(integer) SET search_path = public;
ALTER FUNCTION public.store_daily_evolution_multi(bigint[], uuid) SET search_path = public;

-- Remove versão stale store_daily_evolution_multi(integer[]) (pré-tenant, sem callers).
DROP FUNCTION IF EXISTS public.store_daily_evolution_multi(integer[]);
