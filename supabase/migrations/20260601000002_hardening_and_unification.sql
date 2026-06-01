-- supabase/migrations/20260601_hardening_and_unification.sql
-- Migration para Hardening de RLS, Otimização de Multi-Tenancy e Unificação de Schema do LMS

-- 1. Sincronização de Profiles com raw_app_meta_data do auth.users (Custom JWT Claims)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_profile_to_auth_metadata_trg ON public.profiles;
CREATE TRIGGER sync_profile_to_auth_metadata_trg
AFTER INSERT OR UPDATE OF tenant_id, role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_to_auth_metadata();

-- Executar sincronização inicial para todos os perfis existentes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, tenant_id, role FROM public.profiles LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      coalesce(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('tenant_id', r.tenant_id, 'role', r.role)
    WHERE id = r.id;
  END LOOP;
END $$;

-- 2. Atualizar a função get_user_tenant_id() para ler do JWT Claim de forma instantânea
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id', '')::uuid;
$$ LANGUAGE sql STABLE;

-- 3. Hardening RLS para Periods e Goals
DROP POLICY IF EXISTS "periods_authenticated_read" ON public.periods;
CREATE POLICY "periods_authenticated_read" ON public.periods
  FOR SELECT TO authenticated USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "goals_authenticated_read" ON public.goals;
CREATE POLICY "goals_authenticated_read" ON public.goals
  FOR SELECT TO authenticated USING (tenant_id = get_user_tenant_id());

-- 4. Hardening RLS para hr_delays (Isolamento por Tenant para ADM/Gerente, e próprio ID para vendedor)
DROP POLICY IF EXISTS "Allow all actions for authenticated users based on role" ON public.hr_delays;
DROP POLICY IF EXISTS "hr_delays_tenant_isolation" ON public.hr_delays;

CREATE POLICY "hr_delays_tenant_isolation" ON public.hr_delays
  FOR ALL TO authenticated 
  USING (
    -- ADM/Gerente/Super Admin podem ver/modificar atrasos de funcionários do mesmo tenant
    (
      (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin') AND
      (SELECT tenant_id FROM public.profiles WHERE id = hr_delays.user_id) = get_user_tenant_id()
    ) OR
    -- Vendedor pode ver/modificar apenas seus próprios atrasos
    (
      user_id = auth.uid()
    )
  );

-- 5. Mecanismo de Fechamento de Período (Locking de Escrita em Períodos Fechados)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para comissoes_calculadas
DROP TRIGGER IF EXISTS check_period_closed_comissoes ON public.comissoes_calculadas;
CREATE TRIGGER check_period_closed_comissoes
BEFORE INSERT OR UPDATE OR DELETE ON public.comissoes_calculadas
FOR EACH ROW
EXECUTE FUNCTION public.check_period_not_closed();

-- Trigger para sales_records
DROP TRIGGER IF EXISTS check_period_closed_sales ON public.sales_records;
CREATE TRIGGER check_period_closed_sales
BEFORE INSERT OR UPDATE OR DELETE ON public.sales_records
FOR EACH ROW
EXECUTE FUNCTION public.check_period_not_closed();

-- 6. Adicionar índices cruciais para otimização multi-tenant
CREATE INDEX IF NOT EXISTS idx_sales_records_tenant_id ON public.sales_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON public.goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_calculadas_tenant_id ON public.comissoes_calculadas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_periods_tenant_id ON public.periods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
