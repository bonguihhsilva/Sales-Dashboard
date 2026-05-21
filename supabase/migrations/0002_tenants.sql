-- =============================================================
-- Migration 0002 — Tenants e extensão de profiles
-- Phase 2 — Schema v2
-- =============================================================

-- Tabela de tenants: cada loja/cliente do sistema é um tenant
CREATE TABLE IF NOT EXISTS tenants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         text NOT NULL,
  slug         text UNIQUE NOT NULL,       -- ex: 'jebai', 'gds-interno'
  plano        text NOT NULL DEFAULT 'basico', -- basico | profissional | enterprise
  cor_primaria text NOT NULL DEFAULT '#c8f542',
  logo_url     text,
  moeda_padrao text NOT NULL DEFAULT 'USD',   -- USD | BRL | PYG
  locale       text NOT NULL DEFAULT 'es-PY', -- para Intl.NumberFormat
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

-- Vincular profiles ao tenant e adicionar campos v2
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tenant_id      uuid REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS numero_vendedor text,
  ADD COLUMN IF NOT EXISTS data_admissao  date;
