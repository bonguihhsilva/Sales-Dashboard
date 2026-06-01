-- supabase/migrations/20260601_backlog_hardening.sql
-- Migration para Hardening de Backlog (Resolução de Triggers expostos, search_path e políticas service)

-- 1. Hardening do service_insert_profiles (Limitar inserção em profiles apenas para a service_role)
DROP POLICY IF EXISTS "service_insert_profiles" ON public.profiles;
CREATE POLICY "service_insert_profiles" ON public.profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 2. Travamento de search_path e RPC Exposure em funções SECURITY DEFINER

-- public.sync_profile_to_auth_metadata
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('tenant_id', NEW.tenant_id, 'role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.sync_profile_to_auth_metadata() FROM public, anon, authenticated;

-- public.check_profile_update_restrictions
CREATE OR REPLACE FUNCTION public.check_profile_update_restrictions()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.check_profile_update_restrictions() FROM public, anon, authenticated;

-- public.handle_new_user
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- public.check_period_not_closed
CREATE OR REPLACE FUNCTION public.check_period_not_closed()
RETURNS TRIGGER AS $$
DECLARE
  v_period_id integer;
  v_closed boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'sales_records' THEN
      v_period_id := OLD.period_id;
    ELSE
      v_period_id := OLD.periodo_id;
    END IF;
  ELSE
    IF TG_TABLE_NAME = 'sales_records' THEN
      v_period_id := NEW.period_id;
    ELSE
      v_period_id := NEW.periodo_id;
    END IF;
  END IF;

  SELECT closed INTO v_closed FROM public.periods WHERE id = v_period_id;

  IF v_closed = true THEN
    RAISE EXCEPTION 'Operação rejeitada: O período contábil associado está fechado/bloqueado.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.check_period_not_closed() FROM public, anon, authenticated;

-- public.calculate_vendor_goals (versão com 2 parâmetros)
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

-- e a versão de calculate_vendor_goals com 1 parâmetro (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_vendor_goals' AND pronargs = 1) THEN
    ALTER FUNCTION public.calculate_vendor_goals(bigint) SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.calculate_vendor_goals(bigint) FROM public, anon, authenticated;
  END IF;
END $$;
