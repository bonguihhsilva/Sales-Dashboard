-- =============================================================
-- Migration 0006 — Dashboard Widgets
-- Phase 2 — Schema v2
-- =============================================================

-- Catálogo global de tipos de widget (sem tenant_id — é global por design)
CREATE TABLE IF NOT EXISTS widget_types (
  id            text PRIMARY KEY, -- ex: 'ranking_vendedores'
  nome          text NOT NULL,
  descricao     text,
  config_schema jsonb -- JSON Schema dos parâmetros configuráveis do widget
);

-- Layout personalizado por usuário (widgets: [{ id, type_id, x, y, w, h, config }])
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid NOT NULL REFERENCES profiles(id),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  nome        text NOT NULL DEFAULT 'Meu Dashboard',
  widgets     jsonb NOT NULL DEFAULT '[]',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, tenant_id)
);
