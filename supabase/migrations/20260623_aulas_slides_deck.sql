-- Slide-deck nas lições: array de slides estruturados por aula.
-- NULL = viewer divide conteudo_texto automaticamente (fallback p/ aulas legadas).
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS slides JSONB;

COMMENT ON COLUMN public.aulas.slides IS 'Array de slides [{titulo, corpo, tipo}]. corpo aceita markdown-lite (**bold**, linhas "- " viram bullets). NULL = viewer divide conteudo_texto automaticamente.';

-- Aula de validação: framework SPIN (4 slides)
INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, ordem, slides)
SELECT
  '2ba19095-85b7-477f-9bd6-640464c3b493'::uuid,
  '29c6a11f-3d6f-45f6-92de-46fbcc2f1d00'::uuid,
  'O framework SPIN: Situação, Problema, Implicação, Necessidade de solução',
  'slide',
  COALESCE((SELECT MAX(ordem) FROM public.aulas WHERE modulo_id = '29c6a11f-3d6f-45f6-92de-46fbcc2f1d00'::uuid), 0) + 1,
  '[
    {
      "titulo": "O Framework SPIN",
      "tipo": "texto",
      "corpo": "As quatro categorias de perguntas que guiam uma venda consultiva, em ordem. Usadas para diagnosticar a necessidade do cliente antes de apresentar qualquer solução."
    },
    {
      "titulo": "Situação → Problema",
      "tipo": "bullets",
      "corpo": "- **Situação** — fatos sobre o contexto atual do cliente. Use com moderação: cliente cansa de responder perguntas óbvias.\n- **Problema** — dificuldades e insatisfações com o estado atual."
    },
    {
      "titulo": "Implicação → Necessidade de solução",
      "tipo": "bullets",
      "corpo": "- **Implicação** — consequências e efeitos colaterais do problema não resolvido. A pergunta mais subestimada e mais poderosa do framework.\n- **Necessidade de solução** — o cliente verbaliza o valor da solução antes de você apresentá-la."
    },
    {
      "titulo": "Exemplo em um SaaS B2B",
      "tipo": "bullets",
      "corpo": "- **Situação** → \"Como vocês acompanham hoje o funil de vendas?\"\n- **Problema** → \"Isso gera algum atraso na resposta a leads?\"\n- **Implicação** → \"Esse atraso já fez vocês perderem negócio pra concorrência?\"\n- **Necessidade** → \"Se isso fosse automático, o que mudaria pro time?\""
    }
  ]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.aulas
  WHERE modulo_id = '29c6a11f-3d6f-45f6-92de-46fbcc2f1d00'::uuid
    AND titulo = 'O framework SPIN: Situação, Problema, Implicação, Necessidade de solução'
);
