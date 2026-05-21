-- =============================================================
-- Migration 0011 — Seed: 7 Widget Types
-- Phase 2 — Schema v2
-- =============================================================

INSERT INTO widget_types (id, nome, descricao, config_schema) VALUES
  ('ranking_vendedores',
   'Ranking de Vendedores',
   'Top vendedores do período por valor vendido',
   '{"periodo":"required","loja":"optional","limite":"number"}'),
  ('evolucao_vendas',
   'Evolução de Vendas',
   'Gráfico temporal de vendas no período selecionado',
   '{"periodo_inicio":"required","periodo_fim":"required","agrupar_por":"mes|semana"}'),
  ('vendas_por_categoria',
   'Vendas por Categoria',
   'Distribuição de vendas por categoria de produto',
   '{"periodo":"required","tipo_chart":"pizza|barras"}'),
  ('kpi_periodo',
   'KPI do Período',
   'Métricas principais do período ativo',
   '{"metrica":"total_vendas|ticket_medio|qtd_vendedores_meta"}'),
  ('top_produtos',
   'Top Produtos',
   'Produtos mais vendidos no período',
   '{"periodo":"required","categoria":"optional","limite":"number"}'),
  ('comissoes_periodo',
   'Resumo de Comissões',
   'Comissões calculadas e aprovadas do período',
   '{"periodo":"required","status":"calculado|aprovado"}'),
  ('progresso_treinamento',
   'Progresso do Treinamento',
   'Progresso da equipe nas trilhas de treinamento LMS',
   '{"trilha":"optional"}')
ON CONFLICT (id) DO NOTHING;
