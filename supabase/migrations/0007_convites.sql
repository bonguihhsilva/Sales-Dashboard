-- =============================================================
-- Migration 0007 — Convites de Usuário
-- Phase 2 — Schema v2
-- =============================================================

-- Convites gerados pelo gerente para novos usuários
CREATE TABLE IF NOT EXISTS convites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  email       text,                                 -- opcional: sem email = link manual
  role        text NOT NULL,                        -- adm | vendedor | gerente
  loja_id     uuid REFERENCES tenants(id),          -- loja pré-atribuída
  token       text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  usado       boolean NOT NULL DEFAULT false,
  expira_em   timestamptz NOT NULL DEFAULT now() + interval '7 days',
  criado_por  uuid NOT NULL REFERENCES profiles(id),
  criado_em   timestamptz NOT NULL DEFAULT now()
);
