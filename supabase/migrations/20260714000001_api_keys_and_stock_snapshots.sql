-- Phase 07: API pública de ingest — api_keys, stock_snapshots, extensão de id mappings, RPC de vendas

-- ── 1. api_keys (D-01/D-02/D-03/D-04) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT '',            -- rótulo livre p/ o super_admin (ex: "ERP Loja Jebai")
  key_prefix    text NOT NULL,                        -- primeiros chars da key crua, p/ lookup + exibição parcial
  key_hash      text NOT NULL,                        -- SHA-256 hex da key completa — NUNCA a key crua
  scopes        text[] NOT NULL DEFAULT ARRAY['*'],   -- D-02: full-access no MVP, extensível sem migration
  last_used_at  timestamptz,
  revoked_at    timestamptz,                          -- NULL = ativa
  created_by    uuid REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(key_prefix)
);

CREATE INDEX IF NOT EXISTS api_keys_tenant ON api_keys (tenant_id);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- D-03: self-service é fase futura. Nega acesso direto a anon/authenticated.
-- A gestão real acontece via createAdminClient() (service-role bypassa RLS) nas server actions do super_admin.
CREATE POLICY api_keys_no_direct_access ON api_keys
  FOR ALL
  USING (false);

-- ── 2. stock_snapshots (D-09/D-10/D-11/D-12) ───────────────────────────────
-- Snapshot diário agregado por tenant (sem granularidade de loja — D-10).
-- Sem coluna de custo (D-12: custo vem do catálogo products).
CREATE TABLE IF NOT EXISTS stock_snapshots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_code  text NOT NULL,
  snapshot_date date NOT NULL,                        -- dia do snapshot (D-11: 1/dia/produto)
  quantity      numeric(12,2) NOT NULL,
  source        text NOT NULL DEFAULT 'api',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, product_code, snapshot_date)      -- D-11: upsert diário (último POST do dia vence)
);

CREATE INDEX IF NOT EXISTS stock_snapshots_tenant_date
  ON stock_snapshots (tenant_id, snapshot_date);

ALTER TABLE stock_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON stock_snapshots
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
  ));

-- ── 3. connector_id_mappings: aceitar 'api' e entity 'product' (D-15) ───────
ALTER TABLE connector_id_mappings DROP CONSTRAINT IF EXISTS connector_id_mappings_source_system_check;
ALTER TABLE connector_id_mappings
  ADD CONSTRAINT connector_id_mappings_source_system_check
  CHECK (source_system IN ('pegasus', 'isrp', 'cec', 'api'));

ALTER TABLE connector_id_mappings DROP CONSTRAINT IF EXISTS connector_id_mappings_entity_type_check;
ALTER TABLE connector_id_mappings
  ADD CONSTRAINT connector_id_mappings_entity_type_check
  CHECK (entity_type IN ('vendor', 'client', 'product'));

-- ── 4. ingest_sales_records: delete+insert transacional por order_ref (D-07) ─
-- Corpo de função roda em transação implícita: se o INSERT falhar, o DELETE
-- sofre rollback automático — elimina o risco de perda parcial de dados do
-- delete-então-insert feito em duas queries separadas no route handler.
-- SECURITY INVOKER (default): chamada apenas via service-role no endpoint.
CREATE OR REPLACE FUNCTION ingest_sales_records(
  p_tenant_id uuid,
  p_rows      jsonb          -- array de objetos {period_id, vendor_id, vendor_name, store,
                             --   client_id, client_name, sale_date, valor, quantity, order_ref}
) RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_refs text[];
  v_inserted   integer;
BEGIN
  -- order_refs presentes no batch (para o delete idempotente)
  SELECT array_agg(elem->>'order_ref')
    INTO v_order_refs
    FROM jsonb_array_elements(p_rows) AS elem
   WHERE elem->>'order_ref' IS NOT NULL;

  -- delete das vendas anteriores desses order_refs (só do tenant da key)
  IF v_order_refs IS NOT NULL THEN
    DELETE FROM sales_records
     WHERE tenant_id = p_tenant_id
       AND order_ref = ANY(v_order_refs);
  END IF;

  -- insert do batch novo (mesma transação → atômico com o delete acima)
  INSERT INTO sales_records (
    tenant_id, period_id, vendor_id, vendor_name, store,
    client_id, client_name, sale_date, valor, quantity, order_ref
  )
  SELECT
    p_tenant_id,
    (elem->>'period_id')::int,
    elem->>'vendor_id',
    coalesce(elem->>'vendor_name', ''),
    coalesce(elem->>'store', ''),
    coalesce(elem->>'client_id', ''),
    coalesce(elem->>'client_name', ''),
    (elem->>'sale_date')::date,
    (elem->>'valor')::numeric,
    (elem->>'quantity')::numeric,
    elem->>'order_ref'
  FROM jsonb_array_elements(p_rows) AS elem;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
$$;
