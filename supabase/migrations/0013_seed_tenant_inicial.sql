-- =============================================================
-- Migration 0013 — Seed: Tenant GDS Interno
-- Phase 2 — Schema v2
-- Cria o tenant padrão e faz backfill dos profiles existentes
-- =============================================================

-- Tenant GDS Interno (uso das 3 lojas da família Da Silva)
INSERT INTO tenants (id, nome, slug, plano, cor_primaria, moeda_padrao, locale, ativo) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001',
   'GDS Interno',
   'gds-interno',
   'enterprise',
   '#c8f542',
   'USD',
   'es-PY',
   true)
ON CONFLICT (slug) DO NOTHING;

-- Backfill: profiles sem tenant_id recebem o tenant gds-interno
UPDATE profiles
SET tenant_id = 'aaaaaaaa-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Inicializar gamificacao para profiles existentes sem entrada
INSERT INTO gamificacao (usuario_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT usuario_id FROM gamificacao)
ON CONFLICT (usuario_id) DO NOTHING;
