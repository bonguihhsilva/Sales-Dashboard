-- =============================================================
-- Migration 0004 — Vendas e Itens de Venda
-- Phase 2 — Schema v2
-- ATENÇÃO: periodo_id é integer (periods.id é serial), não uuid
-- =============================================================

-- Cabeçalho da venda (agrega itens)
CREATE TABLE IF NOT EXISTS vendas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  vendedor_id uuid REFERENCES profiles(id),
  periodo_id  integer REFERENCES periods(id), -- integer, não uuid
  loja_id     uuid REFERENCES tenants(id),    -- loja onde ocorreu a venda
  data_venda  date NOT NULL,
  total       numeric(12,2),
  fonte       text NOT NULL DEFAULT 'upload', -- upload | cec_sync | manual
  raw_ref     text,                           -- referência ao arquivo de origem
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Itens individuais da venda (produtos vendidos)
CREATE TABLE IF NOT EXISTS itens_venda (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id      uuid NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id    uuid REFERENCES produtos(id),
  produto_raw   text,      -- nome bruto se produto não estiver no catálogo
  categoria_raw text,      -- categoria bruta do arquivo importado
  quantidade    integer NOT NULL DEFAULT 1,
  valor_unit    numeric(12,2),
  valor_total   numeric(12,2)
);

CREATE INDEX IF NOT EXISTS vendas_tenant_idx   ON vendas(tenant_id);
CREATE INDEX IF NOT EXISTS vendas_periodo_idx  ON vendas(periodo_id);
CREATE INDEX IF NOT EXISTS vendas_vendedor_idx ON vendas(vendedor_id);
CREATE INDEX IF NOT EXISTS itens_venda_idx     ON itens_venda(venda_id);
