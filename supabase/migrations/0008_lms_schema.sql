-- =============================================================
-- Migration 0008 — LMS: Trilhas, Módulos, Lições, Quiz e Progresso
-- Phase 2 — Schema v2
-- =============================================================

-- Trilhas de aprendizado (tenant_id null = conteúdo global disponível para todos)
CREATE TABLE IF NOT EXISTS trilhas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid REFERENCES tenants(id), -- null = global
  titulo       text NOT NULL,
  descricao    text,
  publico_alvo text, -- 'vendedor_varejo' | 'vendedor_atacado' | 'gerente'
  ordem        integer NOT NULL DEFAULT 0,
  ativo        boolean NOT NULL DEFAULT true
);

-- Módulos dentro de uma trilha
CREATE TABLE IF NOT EXISTS modulos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trilha_id        uuid NOT NULL REFERENCES trilhas(id) ON DELETE CASCADE,
  titulo           text NOT NULL,
  descricao        text,
  ordem            integer NOT NULL DEFAULT 0,
  xp_reward        integer NOT NULL DEFAULT 50,
  aprovacao_minima integer NOT NULL DEFAULT 70 -- % mínimo para aprovação no quiz
);

-- Lições de cada módulo (conteúdo varia por tipo)
CREATE TABLE IF NOT EXISTS licoes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  titulo    text NOT NULL,
  tipo      text NOT NULL DEFAULT 'texto', -- texto | video | dialogo | checklist
  conteudo  jsonb NOT NULL,                -- estrutura depende do tipo
  ordem     integer NOT NULL DEFAULT 0
);

-- Questões do quiz por módulo
CREATE TABLE IF NOT EXISTS quiz_questoes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id    uuid NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  enunciado    text NOT NULL,
  -- alternativas: [{ "id": "a", "texto": "...", "correta": bool, "feedback": "..." }]
  alternativas jsonb NOT NULL,
  ordem        integer NOT NULL DEFAULT 0
);

-- Progresso individual por lição (uma linha por usuário por lição)
CREATE TABLE IF NOT EXISTS progresso_usuario (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   uuid NOT NULL REFERENCES profiles(id),
  licao_id     uuid NOT NULL REFERENCES licoes(id),
  concluida    boolean NOT NULL DEFAULT false,
  concluida_em timestamptz,
  UNIQUE(usuario_id, licao_id)
);

-- Resultados de quiz por tentativa
CREATE TABLE IF NOT EXISTS quiz_resultados (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES profiles(id),
  modulo_id  uuid NOT NULL REFERENCES modulos(id),
  pontuacao  integer NOT NULL, -- 0 a 100
  aprovado   boolean NOT NULL,
  tentativa  integer NOT NULL DEFAULT 1,
  respostas  jsonb, -- detalhamento por questão
  criado_em  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS progresso_usuario_idx       ON progresso_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS quiz_resultados_usuario_idx ON quiz_resultados(usuario_id, modulo_id);
