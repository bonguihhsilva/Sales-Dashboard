-- Fase 09: auditoria de custo + policy de escrita em product_costs.
--
-- Nota: NAO ha CHECK constraint em profiles.role neste banco (verificado em
-- pg_constraint: so PK + FKs). Adicionar a role 'compras' portanto nao exige
-- alterar constraint. A ausencia de validacao de role no banco e uma lacuna
-- pre-existente do schema, fora do escopo desta fase.

-- process_financial_audit() usa NEW.id::text — product_costs tem PK composta
-- (tenant_id, product_code) e NAO tem coluna id, entao o trigger generico
-- quebraria. Funcao dedicada usando product_code como registro_id.
CREATE OR REPLACE FUNCTION audit_product_costs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid;
  v_record_id text;
  v_old jsonb := null;
  v_new jsonb := null;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_tenant_id := OLD.tenant_id;
    v_record_id := OLD.product_code;
    v_old := to_jsonb(OLD);
  ELSE
    v_tenant_id := NEW.tenant_id;
    v_record_id := NEW.product_code;
    v_new := to_jsonb(NEW);
    IF TG_OP = 'UPDATE' THEN
      v_old := to_jsonb(OLD);
    END IF;
  END IF;

  -- So audita mudanca real de custo: upsert de catalogo que nao altera
  -- unit_cost nao polui o log.
  IF TG_OP = 'UPDATE'
     AND OLD.unit_cost IS NOT DISTINCT FROM NEW.unit_cost THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.audit_logs (
    tenant_id, tabela, operacao, registro_id,
    valores_antigos, valores_novos, usuario_id
  ) VALUES (
    v_tenant_id, TG_TABLE_NAME, TG_OP, v_record_id,
    v_old, v_new, auth.uid()
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_product_costs ON product_costs;
CREATE TRIGGER trg_audit_product_costs
  AFTER INSERT OR UPDATE OR DELETE ON product_costs
  FOR EACH ROW EXECUTE FUNCTION audit_product_costs();

-- Policy de escrita: alem do tenant, exige role com direito de editar custo.
-- Escrita real acontece via service-role (bypassa RLS); isto e defesa em
-- profundidade contra acesso direto de sessao authenticated.
DROP POLICY IF EXISTS "compras_write" ON product_costs;
CREATE POLICY "compras_write" ON product_costs
  FOR UPDATE
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid()))
    AND (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
        IN ('compras', 'adm', 'gerente', 'super_admin')
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid()))
    AND (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''))
        IN ('compras', 'adm', 'gerente', 'super_admin')
  );
