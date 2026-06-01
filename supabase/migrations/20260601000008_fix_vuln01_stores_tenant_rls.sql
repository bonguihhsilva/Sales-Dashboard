-- VULN-01: stores policy "authenticated can read stores" usava USING(true)
-- Qualquer autenticado lia lojas de TODOS os tenants via REST Supabase.
-- Fix: trocar para tenant_id = get_user_tenant_id()

DROP POLICY IF EXISTS "authenticated can read stores" ON public.stores;

CREATE POLICY "stores_tenant_isolation"
  ON public.stores
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

-- Admins escrevem via service_role (bypass RLS) — sem necessidade de policy de escrita.
