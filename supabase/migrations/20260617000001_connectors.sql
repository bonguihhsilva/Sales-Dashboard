-- Phase 06: Conectores de sistemas de vendas externos (Pegasus, ISRP)

-- Tabela de conectores por tenant (D-04: credenciais via Supabase Vault)
CREATE TABLE IF NOT EXISTS connectors (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  system                TEXT NOT NULL CHECK (system IN ('pegasus', 'isrp')),
  base_url              TEXT NOT NULL DEFAULT '',
  -- UUID retornado por vault.create_secret() -- nunca o valor bruto da credencial
  credential_secret_id  TEXT NOT NULL DEFAULT '',
  settings              JSONB DEFAULT '{}',
  enabled               BOOLEAN DEFAULT true,
  last_sync_at          TIMESTAMPTZ,
  last_sync_error       TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, system)
);

-- Mapeamento de IDs entre sistemas (D-08/D-09: prefixo de sistema como namespace)
CREATE TABLE IF NOT EXISTS connector_id_mappings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source_system   TEXT NOT NULL CHECK (source_system IN ('pegasus', 'isrp', 'cec')),
  source_id       TEXT NOT NULL,
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('vendor', 'client')),
  -- ID interno canonico resolvido. NULL = ainda nao mapeado manualmente (normal)
  canonical_id    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, source_system, entity_type, source_id)
);

-- RLS obrigatorio em todas as tabelas de dados (per CLAUDE.md)
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_id_mappings ENABLE ROW LEVEL SECURITY;

-- Politica: tenant ve apenas seus proprios conectores
CREATE POLICY connectors_tenant_isolation ON connectors
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY mappings_tenant_isolation ON connector_id_mappings
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_connectors_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER connectors_updated_at
  BEFORE UPDATE ON connectors
  FOR EACH ROW EXECUTE FUNCTION update_connectors_updated_at();
