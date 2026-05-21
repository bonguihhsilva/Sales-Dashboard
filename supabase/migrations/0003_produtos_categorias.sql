-- =============================================================
-- Migration 0003 — Categorias e Produtos
-- Phase 2 — Schema v2
-- =============================================================

-- Categorias com hierarquia (pai_id = self-reference)
CREATE TABLE IF NOT EXISTS categorias (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  nome      text NOT NULL,
  pai_id    uuid REFERENCES categorias(id), -- null = categoria raiz
  cor       text -- hex para uso em charts
);

-- Catálogo de produtos do tenant
CREATE TABLE IF NOT EXISTS produtos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid REFERENCES tenants(id),
  nome         text NOT NULL,
  modelo       text,
  marca        text,
  sku          text,
  categoria_id uuid REFERENCES categorias(id),
  ativo        boolean NOT NULL DEFAULT true
);
