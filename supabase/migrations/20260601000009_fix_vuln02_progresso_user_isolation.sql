-- VULN-02: progresso_aulas INSERT policy tinha WITH CHECK true (qualquer autenticado inseria qualquer usuario_id).
-- progresso_modulos não tinha usuario_id = auth.uid() — vendor podia fraudar progresso de colegas.
-- Fix: isolamento por usuario_id em todas as writes; admins ganham SELECT adicional.

-- progresso_aulas
DROP POLICY IF EXISTS "progresso_aulas_insert_service_only" ON public.progresso_aulas;
DROP POLICY IF EXISTS "progresso_aulas_delete_own"          ON public.progresso_aulas;
DROP POLICY IF EXISTS "progresso_aulas_select_own"          ON public.progresso_aulas;
DROP POLICY IF EXISTS "tenant_isolation_progresso_aulas"    ON public.progresso_aulas;

CREATE POLICY "progresso_aulas_own"
  ON public.progresso_aulas
  FOR ALL TO authenticated
  USING    (usuario_id = auth.uid() AND tenant_id = get_user_tenant_id())
  WITH CHECK (usuario_id = auth.uid() AND tenant_id = get_user_tenant_id());

CREATE POLICY "progresso_aulas_admin_read"
  ON public.progresso_aulas
  FOR SELECT TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
  );

-- progresso_modulos
DROP POLICY IF EXISTS "tenant_isolation_progresso_modulos" ON public.progresso_modulos;

CREATE POLICY "progresso_modulos_own"
  ON public.progresso_modulos
  FOR ALL TO authenticated
  USING    (usuario_id = auth.uid() AND tenant_id = get_user_tenant_id())
  WITH CHECK (usuario_id = auth.uid() AND tenant_id = get_user_tenant_id());

CREATE POLICY "progresso_modulos_admin_read"
  ON public.progresso_modulos
  FOR SELECT TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
  );
