-- supabase/migrations/20260601_hardening_definitivo.sql
-- Migration para Hardening Definitivo de Segurança, RLS e Prevenção de Fuga de Tenant (Operação Black Diamond)

-- 1. Revogar Acesso Direto às Views Financeiras/PII via API REST do Supabase
REVOKE SELECT ON public.vendor_summary FROM anon, authenticated, public;
REVOKE SELECT ON public.client_portfolio FROM anon, authenticated, public;
REVOKE SELECT ON public.all_vendors FROM anon, authenticated, public;

-- Garantir que o service_role e o postgres mantenham privilégios totais sobre as views
GRANT SELECT ON public.vendor_summary TO service_role;
GRANT SELECT ON public.client_portfolio TO service_role;
GRANT SELECT ON public.all_vendors TO service_role;

-- 2. Remover Políticas Permissivas Globais (Bypasses)
DROP POLICY IF EXISTS "authenticated_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "convites_token_select" ON public.convites;

-- 3. Hardening da Política de Update de Perfis (Evitar escalada de privilégios e alteração de Tenant)
CREATE OR REPLACE FUNCTION public.check_profile_update_restrictions()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a operação vier do PostgREST sob a role 'authenticated' (usuário logado via REST API)
  IF (auth.role() = 'authenticated') THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Ação negada: Você não tem permissão para alterar o seu próprio nível de acesso (role).';
    END IF;
    
    IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
      RAISE EXCEPTION 'Ação negada: Você não tem permissão para alterar a sua organização (tenant_id).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_update_restrictions_trg ON public.profiles;
CREATE TRIGGER profiles_update_restrictions_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_update_restrictions();

-- 4. Hardening da Trigger de Criação de Usuário (Evitar passagem de roles maliciosas via metadata no signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, ''),
    'vendedor'::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Hardening de Escritas em Sales Records (Apenas admin/gerente/super_admin podem gerenciar vendas)
DROP POLICY IF EXISTS "sales_adm" ON public.sales_records;
CREATE POLICY "sales_adm" ON public.sales_records
  FOR ALL TO authenticated
  USING (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  )
  WITH CHECK (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  );

-- 6. Hardening de Metas (Goals - Apenas admin/gerente/super_admin podem alterar/criar metas)
DROP POLICY IF EXISTS "goals_adm" ON public.goals;
CREATE POLICY "goals_adm" ON public.goals
  FOR ALL TO authenticated
  USING (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  )
  WITH CHECK (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  );

-- 7. Hardening de Exclusões de Vendedor (Apenas admin/gerente/super_admin)
DROP POLICY IF EXISTS "vendor_exclusions_tenant" ON public.vendor_exclusions;
CREATE POLICY "vendor_exclusions_tenant" ON public.vendor_exclusions
  FOR ALL TO authenticated
  USING (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  )
  WITH CHECK (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  );

-- 8. Limpeza de Duplicatas e Garantia de Idempotência em Vendas
DELETE FROM public.sales_records a USING (
  SELECT MIN(id) as keep_id, tenant_id, period_id, order_ref
  FROM public.sales_records
  GROUP BY tenant_id, period_id, order_ref
  HAVING count(*) > 1
) b
WHERE a.tenant_id = b.tenant_id
  AND a.period_id = b.period_id
  AND a.order_ref = b.order_ref
  AND a.id <> b.keep_id;

ALTER TABLE public.sales_records DROP CONSTRAINT IF EXISTS uq_sales_records_tenant_period_ref;
ALTER TABLE public.sales_records
  ADD CONSTRAINT uq_sales_records_tenant_period_ref UNIQUE (tenant_id, period_id, order_ref);
