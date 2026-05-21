-- =============================================================
-- Migration 0005 — Motor de Comissão
-- Phase 2 — Schema v2
-- ATENÇÃO: comissoes_calculadas.periodo_id é integer
-- =============================================================

-- Regras configuráveis pelo gerente (condições + ação em jsonb)
CREATE TABLE IF NOT EXISTS regras_comissao (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  nome        text NOT NULL,
  descricao   text,
  ativo       boolean NOT NULL DEFAULT true,
  prioridade  integer NOT NULL DEFAULT 0, -- menor = avaliado primeiro
  -- condicoes: { "operador": "AND"|"OR", "regras": [{ "campo", "op", "valor" }] }
  condicoes   jsonb NOT NULL,
  -- acao: { "tipo": "percentual"|"fixo"|"multiplicador", "valor": 0.05, "base": "..." }
  acao        jsonb NOT NULL,
  criado_por  uuid REFERENCES profiles(id),
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Resultado do cálculo por vendedor por período
CREATE TABLE IF NOT EXISTS comissoes_calculadas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  vendedor_id    uuid NOT NULL REFERENCES profiles(id),
  periodo_id     integer NOT NULL REFERENCES periods(id), -- integer, não uuid
  comissao_base  numeric(12,2),
  bonus_total    numeric(12,2),
  total          numeric(12,2),
  detalhamento   jsonb, -- regras aplicadas + valores calculados
  calculado_em   timestamptz NOT NULL DEFAULT now(),
  aprovado       boolean NOT NULL DEFAULT false,
  aprovado_por   uuid REFERENCES profiles(id),
  UNIQUE(tenant_id, vendedor_id, periodo_id)
);
