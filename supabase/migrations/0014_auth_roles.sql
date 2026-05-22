-- =============================================================
-- Migration 0014 — Auth: 4 roles, rename active->ativo, convites.loja
-- Phase 3 — Auth & Users
-- =============================================================

-- 1. Expandir CHECK constraint de role para 4 roles
-- O CHECK da 0001 so aceita 'adm'|'vendedor' — bloqueia gerente/super_admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('vendedor', 'adm', 'gerente', 'super_admin'));

-- 2. Renomear coluna active -> ativo (alinha com CONTEXT D-09 e UI-SPEC)
ALTER TABLE profiles RENAME COLUMN active TO ativo;

-- 3. Adicionar coluna loja (text) em convites
-- convites.loja_id referencia tenants(id), mas as 3 lojas vivem em
-- profiles.store (text). Usar campo text mantem compatibilidade.
ALTER TABLE convites ADD COLUMN IF NOT EXISTS loja text;

-- 4. Atualizar trigger handle_new_user para registrar o ban como nao-ativo
-- (mantem logica existente; apenas garante coluna correta)
-- Nenhuma mudanca necessaria no corpo do trigger — ele insere apenas
-- id/name/role; ativo usa o DEFAULT true da coluna.
