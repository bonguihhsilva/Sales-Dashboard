-- =============================================================
-- Migration 0009 — Gamificação (XP, nível, streak, badges)
-- Phase 2 — Schema v2
-- =============================================================

-- Uma linha por usuário — atualizada progressivamente
CREATE TABLE IF NOT EXISTS gamificacao (
  usuario_id  uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp_total    integer NOT NULL DEFAULT 0,
  nivel       integer NOT NULL DEFAULT 1,
  streak_dias integer NOT NULL DEFAULT 0,
  ultimo_acesso date,
  -- badges: [{ "id": "primeiro_passo", "conquistado_em": "2026-01-01T..." }]
  badges      jsonb NOT NULL DEFAULT '[]'
);

-- Regras de XP (documentadas para referência das fases seguintes):
-- Completar lição:           +10 XP
-- Quiz aprovado (70-89%):    +xp_reward do módulo
-- Quiz aprovado (90-100%):   +xp_reward * 1.5 (arredondado)
-- Streak 7 dias:             +50 XP bonus
-- Nível 1 (Iniciante):       0-199 XP
-- Nível 2 (Aprendiz):        200-499 XP
-- Nível 3 (Profissional):    500-999 XP
-- Nível 4 (Especialista):    1000-1999 XP
-- Nível 5 (Mestre CDE):      2000+ XP
