-- Avisos do Mural: gerentes/admin publicam recados, todos do tenant leem.

CREATE TABLE public.avisos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  titulo     text NOT NULL CHECK (char_length(titulo) BETWEEN 1 AND 60),
  mensagem   text NOT NULL CHECK (char_length(mensagem) BETWEEN 1 AND 1000),
  autor_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_avisos_tenant_created ON public.avisos (tenant_id, created_at DESC);

ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado do tenant
CREATE POLICY "avisos_read_tenant" ON public.avisos
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

-- Escrita (insert/update/delete): apenas adm/gerente/super_admin do tenant
CREATE POLICY "avisos_write_adm_gerente" ON public.avisos
  FOR ALL TO authenticated
  USING (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  )
  WITH CHECK (
    (tenant_id = get_user_tenant_id()) AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '')) IN ('adm', 'gerente', 'super_admin')
  );

COMMENT ON TABLE public.avisos IS 'Avisos publicados no Mural por adm/gerente, visíveis a todo o tenant.';
