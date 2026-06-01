-- supabase/migrations/20260601000005_audit_logs.sql
-- Criação da tabela de auditoria imutável (Audit Trail) para operações financeiras (metas e comissões) em conformidade com SOC2 Type II.

-- 1. Criação da tabela public.audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tabela text NOT NULL,
  operacao text NOT NULL,
  registro_id text NOT NULL,
  valores_antigos jsonb,
  valores_novos jsonb,
  usuario_id uuid,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Políticas RLS de Audit Logs (Append-Only)
-- Apenas administradores, gerentes ou super_admins do tenant correspondente podem ler logs.
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
      IN ('adm', 'gerente', 'super_admin')
  );

-- Nenhuma política para UPDATE ou DELETE (tabela imutável)

-- 3. Função Trigger de Auditoria Financeira
CREATE OR REPLACE FUNCTION public.process_financial_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id uuid;
  v_record_id text;
  v_old jsonb := null;
  v_new jsonb := null;
  v_user_id uuid;
BEGIN
  -- Identificar tenant_id e ID do registro
  IF TG_OP = 'DELETE' THEN
    v_tenant_id := OLD.tenant_id;
    v_record_id := OLD.id::text;
    v_old := to_jsonb(OLD);
  ELSE
    v_tenant_id := NEW.tenant_id;
    v_record_id := NEW.id::text;
    v_new := to_jsonb(NEW);
    IF TG_OP = 'UPDATE' THEN
      v_old := to_jsonb(OLD);
    END IF;
  END IF;

  -- Obter usuário atual da claims JWT (caso disponível)
  v_user_id := auth.uid();

  INSERT INTO public.audit_logs (
    tenant_id,
    tabela,
    operacao,
    registro_id,
    valores_antigos,
    valores_novos,
    usuario_id
  ) VALUES (
    v_tenant_id,
    TG_TABLE_NAME,
    TG_OP,
    v_record_id,
    v_old,
    v_new,
    v_user_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Triggers Associados
DROP TRIGGER IF EXISTS audit_goals_trg ON public.goals;
CREATE TRIGGER audit_goals_trg
AFTER INSERT OR UPDATE OR DELETE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.process_financial_audit();

DROP TRIGGER IF EXISTS audit_comissoes_trg ON public.comissoes_calculadas;
CREATE TRIGGER audit_comissoes_trg
AFTER INSERT OR UPDATE OR DELETE ON public.comissoes_calculadas
FOR EACH ROW EXECUTE FUNCTION public.process_financial_audit();

-- 5. Sincronização do Histórico de Migrações (SOC2 Compliance)
INSERT INTO supabase_migrations.schema_migrations (version) VALUES
  ('20260601000005')
ON CONFLICT (version) DO NOTHING;
