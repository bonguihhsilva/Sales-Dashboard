-- VULN-03: policy hr_delays_tenant_isolation usava FOR ALL para o vendedor.
-- Vendedor podia UPDATE/DELETE os próprios registros de atraso via REST Supabase.
-- Fix: separar em managers (ALL) e vendedor (SELECT-only).

DROP POLICY IF EXISTS "hr_delays_tenant_isolation"             ON public.hr_delays;
DROP POLICY IF EXISTS "Allow all actions for authenticated users based on role" ON public.hr_delays;

CREATE POLICY "hr_delays_managers"
  ON public.hr_delays
  FOR ALL TO authenticated
  USING (
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
    AND
    (SELECT tenant_id FROM public.profiles WHERE id = hr_delays.user_id)
      = get_user_tenant_id()
  )
  WITH CHECK (
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
    AND
    (SELECT tenant_id FROM public.profiles WHERE id = hr_delays.user_id)
      = get_user_tenant_id()
  );

CREATE POLICY "hr_delays_vendor_read"
  ON public.hr_delays
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
