-- Migration: Unificação do Schema LMS e Migração de Dados Históricos
-- Criação: 2026-06-01
-- Descrição: Migra os dados antigos de licoes e quiz_questoes para aulas e questoes_prova com seus respectivos mapeamentos e limpa o banco.

-- 1. Migração das lições (licoes) para aulas
INSERT INTO public.aulas (id, tenant_id, modulo_id, titulo, tipo_conteudo, url_midia, conteudo_texto, ordem, is_global, created_at)
SELECT 
  l.id,
  t.tenant_id,
  l.modulo_id,
  l.titulo,
  'texto'::content_type_enum as tipo_conteudo,
  NULL as url_midia,
  (SELECT string_agg(val::text, chr(10)) FROM jsonb_array_elements_text(l.conteudo->'paragrafos') as val) as conteudo_texto,
  l.ordem,
  false as is_global,
  now() as created_at
FROM public.licoes l
JOIN public.modulos m ON l.modulo_id = m.id
JOIN public.trilhas t ON m.trilha_id = t.id
ON CONFLICT (id) DO NOTHING;

-- 2. Criação de provas para módulos que possuem quiz_questoes mas não possuem provas cadastradas
INSERT INTO public.provas (id, tenant_id, modulo_id, titulo, nota_minima, created_at)
SELECT 
  gen_random_uuid() as id,
  t.tenant_id,
  qq.modulo_id,
  'Prova Final'::text as titulo,
  70 as nota_minima,
  now() as created_at
FROM (SELECT DISTINCT modulo_id FROM public.quiz_questoes) qq
JOIN public.modulos m ON qq.modulo_id = m.id
JOIN public.trilhas t ON m.trilha_id = t.id
LEFT JOIN public.provas p ON qq.modulo_id = p.modulo_id
WHERE p.id IS NULL;

-- 3. Migração das questões (quiz_questoes) para questoes_prova ligadas às respectivas provas do módulo
INSERT INTO public.questoes_prova (id, tenant_id, prova_id, pergunta, opcoes, indice_correta, created_at)
SELECT 
  qq.id,
  p.tenant_id,
  p.id as prova_id,
  qq.enunciado as pergunta,
  (
    SELECT jsonb_agg(elem->>'texto')
    FROM jsonb_array_elements(qq.alternativas) elem
  ) as opcoes,
  (
    SELECT (idx - 1)::integer
    FROM jsonb_array_elements(qq.alternativas) WITH ORDINALITY as elem(val, idx)
    WHERE (val->>'correta')::boolean = true
    LIMIT 1
  ) as indice_correta,
  now() as created_at
FROM public.quiz_questoes qq
JOIN public.provas p ON qq.modulo_id = p.modulo_id
ON CONFLICT (id) DO NOTHING;

-- 4. Remoção das tabelas antigas obsoletas
DROP TABLE IF EXISTS public.progresso_usuario CASCADE;
DROP TABLE IF EXISTS public.quiz_questoes CASCADE;
DROP TABLE IF EXISTS public.licoes CASCADE;
