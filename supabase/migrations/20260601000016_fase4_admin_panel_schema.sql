-- Fase 4: Painel do Adm — stores soft-delete + gerente_permissions

-- 1. Soft-delete em stores
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

-- 2. Permissões granulares de gerente
CREATE TABLE IF NOT EXISTS public.gerente_permissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

ALTER TABLE public.gerente_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gerente_permissions_managers" ON public.gerente_permissions
  FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims',true)::jsonb->'app_metadata'->>'role',''))
      IN ('adm','super_admin')
  )
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims',true)::jsonb->'app_metadata'->>'role',''))
      IN ('adm','super_admin')
  );

CREATE POLICY "gerente_permissions_self_read" ON public.gerente_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_gerente_permissions_user_id ON public.gerente_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_gerente_permissions_tenant_id ON public.gerente_permissions(tenant_id);

-- 3. RLS para stores: split read/write
DROP POLICY IF EXISTS "stores_tenant_isolation" ON public.stores;

CREATE POLICY "stores_tenant_read" ON public.stores
  FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "stores_tenant_write" ON public.stores
  FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims',true)::jsonb->'app_metadata'->>'role',''))
      IN ('adm','super_admin')
  )
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims',true)::jsonb->'app_metadata'->>'role',''))
      IN ('adm','super_admin')
  );
