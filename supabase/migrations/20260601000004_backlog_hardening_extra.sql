-- supabase/migrations/20260601_backlog_hardening_extra.sql
-- Migration para Hardening de RLS em Convites, Trava de vendor_id no profiles e RPC atômico de XP.

-- 1. Hardening do RLS em Convites (VULN-01)
-- Somente administradores, gerentes ou super_admins do tenant correspondente podem gerenciar ou ver convites.
DROP POLICY IF EXISTS "convites_tenant" ON public.convites;

CREATE POLICY "convites_insert_only_managers" ON public.convites
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
  );

CREATE POLICY "convites_select_managers" ON public.convites
  FOR SELECT TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
  );

CREATE POLICY "convites_update_delete_managers" ON public.convites
  FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
  );

-- 2. Prevenção de Alteração da Coluna vendor_id em Perfis pelo Próprio Usuário (RISCO-07)
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

    IF NEW.vendor_id IS DISTINCT FROM OLD.vendor_id THEN
      RAISE EXCEPTION 'Ação negada: Você não tem permissão para alterar o seu próprio código de vendedor (vendor_id).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Função RPC Atômica Segura para Incrementar XP (RISCO-05)
CREATE OR REPLACE FUNCTION public.increment_user_xp(p_user_id uuid, p_xp_to_add integer)
RETURNS void AS $$
BEGIN
  INSERT INTO public.gamificacao (usuario_id, xp_total, nivel, badges)
  VALUES (p_user_id, p_xp_to_add, 1, '[]'::jsonb)
  ON CONFLICT (usuario_id) DO UPDATE
  SET xp_total = public.gamificacao.xp_total + p_xp_to_add,
      nivel = floor((public.gamificacao.xp_total + p_xp_to_add) / 1000) + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revogar execução pública da RPC de XP
REVOKE EXECUTE ON FUNCTION public.increment_user_xp(uuid, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_xp(uuid, integer) TO service_role;

-- 4. Sincronização e Registro de Migrações Locais (VULN-03)
INSERT INTO supabase_migrations.schema_migrations (version) VALUES
  ('0014'),
  ('20260411000000'),
  ('20260505000001'),
  ('20260505000002'),
  ('20260507000000'),
  ('20260528000000'),
  ('20260528000001'),
  ('20260528000002'),
  ('20260529000000'),
  ('20260531000000'),
  ('20260601000001'),
  ('20260601000002'),
  ('20260601000003'),
  ('20260601000004')
ON CONFLICT (version) DO NOTHING;
