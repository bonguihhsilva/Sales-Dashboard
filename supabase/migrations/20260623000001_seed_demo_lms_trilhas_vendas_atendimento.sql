-- Seed LMS: 2 trilhas (Vendas Consultivas + Atendimento) p/ tenant "Loja Demo (GDS)".
-- Fonte: material trilhas-vendas-atendimento.md (Rackham/Dixon&Adamson/Cialdini/Voss; SERVQUAL).
-- Estrutura: trilha -> modulos (conteudo + modulo extra "Prova Final") -> aulas (texto) -> prova(por modulo) -> questoes_prova.
-- Quiz do Modulo no front = provas + questoes_prova (tabela quizzes por-aula nao e usada -> ignorada).
-- indice_correta: 0-based. Idempotente: se a Trilha 1 ja existir p/ o tenant, nao faz nada.

DO $$
DECLARE
  v_tenant uuid := '2ba19095-85b7-477f-9bd6-640464c3b493'; -- Loja Demo (GDS)
  v_t uuid;
  v_m uuid;
  v_p uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.trilhas WHERE tenant_id = v_tenant AND titulo = 'Fundamentos de Vendas Consultivas') THEN
    RAISE NOTICE 'Seed ja aplicado para o tenant Loja Demo. Nada a fazer.';
    RETURN;
  END IF;

  -- ============================================================
  -- TRILHA 1 — FUNDAMENTOS DE VENDAS CONSULTIVAS
  -- ============================================================
  INSERT INTO public.trilhas (tenant_id, titulo, descricao, publico_alvo, ordem, ativo, ativa)
  VALUES (v_tenant, 'Fundamentos de Vendas Consultivas',
    'Do diagnóstico de necessidades ao fechamento, baseado nos frameworks mais validados de vendas complexas (SPIN, Challenger Sale) e nos princípios de influência de Cialdini.',
    'Vendedores', 1, true, true)
  RETURNING id INTO v_t;

  -- ---------- Módulo 1.1 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'A Venda como Diagnóstico, não Discurso',
    'Base teórica: Neil Rackham, SPIN Selling (pesquisa sobre 35.000 ligações de vendas).', 1, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Por que "vender características" não funciona em vendas complexas', 'texto',
    'Rackham mostrou que em vendas de alto valor, técnicas de fechamento agressivo (a la "venda pequena") têm correlação negativa com sucesso. Quanto maior o ticket e mais longo o ciclo, mais a venda depende de descoberta de necessidade implícita, não de persuasão de superfície. Aplicação prática: troque "apresentar o produto" por "investigar o problema" nos primeiros contatos.', 1, false),
  (v_tenant, v_m, 'O framework SPIN: Situação, Problema, Implicação, Necessidade de solução', 'texto',
    'As quatro categorias de perguntas, em ordem: Situação — fatos sobre o contexto atual do cliente (use com moderação; cliente cansa de responder perguntas óbvias). Problema — dificuldades, insatisfações com o estado atual. Implicação — consequências e efeitos colaterais do problema não resolvido (a pergunta mais subestimada e mais poderosa). Necessidade de solução — o cliente verbaliza o valor da solução antes de você apresentá-la. Exemplo aplicado a um SaaS B2B: Situação → "Como vocês acompanham hoje o funil de vendas?" Problema → "Isso gera algum atraso na resposta a leads?" Implicação → "Esse atraso já fez vocês perderem negócio pra concorrência?" Necessidade → "Se isso fosse automático, o que mudaria pro time?"', 2, false),
  (v_tenant, v_m, 'Erros comuns na aplicação do SPIN', 'texto',
    'Pular direto para Implicação sem estabelecer Problema primeiro; fazer perguntas de Situação em excesso (sinal de despreparo); tratar Necessidade de solução como pergunta retórica em vez de ouvir genuinamente a resposta.', 3, false),
  (v_tenant, v_m, 'Exercício prático: mapeando perguntas SPIN para seu produto', 'texto',
    'Aula prática — o aluno recebe um produto fictício (ou usa o próprio) e escreve 2 perguntas para cada categoria SPIN.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'Qual a ordem correta do framework SPIN?', jsonb_build_array('Problema, Situação, Necessidade, Implicação','Situação, Problema, Implicação, Necessidade de solução','Necessidade, Situação, Problema, Implicação','Situação, Implicação, Problema, Necessidade'), 1),
  (v_tenant, v_p, 'Segundo a pesquisa de Rackham, técnicas de fechamento agressivo funcionam melhor em:', jsonb_build_array('Vendas complexas e de alto valor','Vendas pequenas e simples','Vendas B2B de qualquer porte','Nenhum dos casos'), 1),
  (v_tenant, v_p, 'Qual o objetivo da pergunta de Implicação?', jsonb_build_array('Coletar dados cadastrais do cliente','Fazer o cliente perceber as consequências do problema não resolvido','Apresentar o preço','Encerrar a ligação'), 1),
  (v_tenant, v_p, 'Por que perguntas de Situação em excesso são um problema?', jsonb_build_array('Tomam tempo demais e sinalizam despreparo do vendedor','São ilegais em vendas B2B','O cliente nunca sabe responder','Não existe esse problema'), 0),
  (v_tenant, v_p, 'Na pergunta de Necessidade de solução, o ideal é que:', jsonb_build_array('O vendedor descreva o produto em detalhes','O próprio cliente verbalize o valor da solução','Se feche a venda imediatamente','Se ofereça desconto'), 1);

  -- ---------- Módulo 1.2 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Vendendo Insight: a Abordagem Challenger',
    'Base teórica: Matthew Dixon & Brent Adamson, The Challenger Sale (pesquisa com +6.000 vendedores).', 2, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Os 5 perfis de vendedor e por que "Challenger" vence', 'texto',
    'A pesquisa de Dixon e Adamson identificou cinco perfis — Hard Worker, Lone Wolf, Relationship Builder, Reactive Problem Solver e Challenger. Os autores demonstram, com exemplos, por que se deve desafiar prospects e clientes em vez de despejar todo esforço em construir simpatia. O perfil Challenger é consistentemente o que mais performa em vendas complexas porque ensina, personaliza e assume controle da conversa.', 1, false),
  (v_tenant, v_m, 'Ensinar (Teach): trazendo uma perspectiva que o cliente não tinha', 'texto',
    'O "ensinar" não é dar aula sobre seu produto — é trazer um insight de mercado/operação que reformula como o cliente vê o próprio problema, antes de ele saber que precisa de você. Estrutura sugerida: dado comparativo de mercado → consequência não percebida → ponte natural pra sua solução.', 2, false),
  (v_tenant, v_m, 'Personalizar (Tailor) e Assumir Controle (Take Control)', 'texto',
    'Personalizar significa adaptar a mensagem ao stakeholder específico (CFO ouve sobre risco/custo, Head de Operação ouve sobre eficiência). Assumir controle significa conduzir a conversa sobre preço, prazo e processo com segurança, sem se desculpar pela proposta.', 3, false),
  (v_tenant, v_m, 'Quando Challenger não é a abordagem certa', 'texto',
    'Perspectiva equilibrada — Challenger Sale é mais eficaz em vendas B2B complexas, multi-stakeholder, ciclo longo. Para vendas transacionais simples ou clientes já fiéis/recorrentes, abordagem consultiva mais leve costuma performar melhor sem o desgaste de "desafiar" sempre.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'Quantos perfis de vendedor a pesquisa de Dixon e Adamson identificou?', jsonb_build_array('3','4','5','7'), 2),
  (v_tenant, v_p, '"Ensinar" na metodologia Challenger significa:', jsonb_build_array('Explicar manual de uso do produto','Trazer um insight que reformula a percepção do cliente sobre o próprio problema','Dar treinamento técnico gratuito','Repetir o discurso institucional da empresa'), 1),
  (v_tenant, v_p, '"Personalizar" (Tailor) significa:', jsonb_build_array('Usar o nome do cliente no e-mail','Adaptar a mensagem ao papel e prioridades do stakeholder específico','Customizar a cor da proposta','Mudar o preço por cliente'), 1),
  (v_tenant, v_p, 'Em qual cenário o Challenger Sale tende a ser MENOS necessário?', jsonb_build_array('Venda B2B complexa multi-stakeholder','Venda transacional simples e recorrente','Ciclo de vendas longo','Negociação com comitê de compras'), 1),
  (v_tenant, v_p, 'Qual o principal contraponto à crença de que "relacionamento é tudo" em vendas?', jsonb_build_array('Preço sempre decide','Os melhores vendedores desafiam o pensamento do cliente, não apenas constroem rapport','Relacionamento não importa nunca','Challenger nunca constrói relação'), 1);

  -- ---------- Módulo 1.3 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Psicologia da Decisão: os Princípios de Cialdini',
    'Base teórica: Robert Cialdini, Influence: The Psychology of Persuasion.', 3, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Reciprocidade e Compromisso/Consistência', 'texto',
    'A reciprocidade mostra que dar algo de valor antes de pedir algo aumenta a chance de retorno positivo. Aplicação em vendas: oferecer um diagnóstico gratuito, um conteúdo relevante ou uma demonstração customizada antes de pedir o compromisso de compra. Compromisso e consistência: uma vez que o cliente assume uma posição pequena (ex: confirma que o problema existe), ele tende a manter consistência com decisões maiores alinhadas a essa posição.', 1, false),
  (v_tenant, v_m, 'Prova social e Autoridade', 'texto',
    'Prova social — pessoas seguem o comportamento de outros similares em contexto de incerteza (cases, depoimentos, número de clientes ativos). Autoridade — conhecimento técnico genuíno e credenciais aumentam confiança; isso reforça por que vendedores devem ter domínio real do produto e do setor do cliente, não apenas script.', 2, false),
  (v_tenant, v_m, 'Afeição, Escassez e Unidade', 'texto',
    'Afeição — similaridade genuína (não bajulação) cria conexão; pesquisa em negociação mostra que trocar informação pessoal antes de negociar aumenta taxa de acordo. Escassez — limitação real (vagas, prazo, estoque) aumenta percepção de valor, mas escassez falsa destrói credibilidade a médio prazo. Unidade — senso de identidade compartilhada ("nós, que trabalhamos com X") é o princípio mais recente adicionado por Cialdini.', 3, false),
  (v_tenant, v_m, 'Uso ético: a linha entre persuasão e manipulação', 'texto',
    'Discussão sobre o limite ético — os princípios descrevem mecanismos psicológicos reais; usá-los para criar urgência falsa ou prova social fabricada é manipulação e tem custo reputacional alto, especialmente em SaaS B2B com ciclo de relacionamento longo.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'Quantos princípios de persuasão Cialdini identifica na versão mais recente?', jsonb_build_array('5','6','7','9'), 2),
  (v_tenant, v_p, 'O princípio de Reciprocidade sugere que o vendedor deve:', jsonb_build_array('Pedir desconto ao cliente','Oferecer algo de valor genuíno antes de pedir o compromisso','Ignorar o cliente até ele decidir','Cobrar antecipado sempre'), 1),
  (v_tenant, v_p, '"Prova social" funciona principalmente em situações de:', jsonb_build_array('Certeza total do comprador','Incerteza, quando o comprador busca validação no comportamento de outros similares','Compra impulsiva apenas','Vendas internas apenas'), 1),
  (v_tenant, v_p, 'Por que estudos de negociação mostram maior taxa de acordo quando se troca informação pessoal antes de negociar?', jsonb_build_array('Por causa do princípio de Afeição/similaridade','Por causa de escassez','Não há relação','Por causa de autoridade'), 0),
  (v_tenant, v_p, 'Escassez falsa (fabricada) tende a:', jsonb_build_array('Aumentar a confiança a longo prazo','Destruir credibilidade quando descoberta','Não ter efeito nenhum','Ser sempre recomendada'), 1),
  (v_tenant, v_p, 'O princípio de "Unidade" se refere a:', jsonb_build_array('Preço único para todos','Senso de identidade compartilhada entre vendedor e cliente','Catálogo unificado de produtos','Compromisso contratual'), 1);

  -- ---------- Módulo 1.4 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Negociação e Tratamento de Objeções',
    'Base teórica: Chris Voss, Never Split the Difference; complementado por The JOLT Effect.', 4, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Empatia tática: ouvir para negociar', 'texto',
    'Empatia tática não é concordar — é demonstrar compreensão genuína da perspectiva do outro lado para reduzir defensividade e abrir espaço para acordo. Técnica de rotulagem ("parece que isso é uma preocupação grande pra você") e escuta espelhada (repetir as últimas palavras do cliente como pergunta) para extrair mais informação sem confronto.', 1, false),
  (v_tenant, v_m, 'Perguntas calibradas em vez de perguntas de sim/não', 'texto',
    'Perguntas que começam com "como" e "o que" (em vez de "por que", que sugere acusação) fazem o cliente resolver o próprio impasse em voz alta, mantendo a sensação de controle dele sobre a decisão — fator chave em negociação B2B.', 2, false),
  (v_tenant, v_m, 'Por que "pensar e decidir depois" é o maior inimigo do fechamento', 'texto',
    'Pesquisa recente (The JOLT Effect) mostra que a maioria dos negócios não é perdida para concorrência — é perdida para indecisão do próprio comprador. Estratégias para reduzir indecisão: simplificar a decisão em etapas pequenas, nomear o medo específico do cliente, e oferecer um teste de baixo risco em vez de pedir compromisso total de uma vez.', 3, false),
  (v_tenant, v_m, 'Tratando objeções de preço sem entrar em guerra de desconto', 'texto',
    'Separar objeção real (orçamento genuinamente indisponível) de objeção de adiamento (desculpa para não decidir agora). Técnica: reformular preço em termos do custo do problema não resolvido (ligando de volta à Implicação do SPIN).', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, '"Empatia tática" em negociação significa:', jsonb_build_array('Concordar com tudo que o cliente diz','Demonstrar compreensão genuína da perspectiva do outro lado, sem necessariamente concordar','Ser simpático superficialmente','Evitar conflito a qualquer custo'), 1),
  (v_tenant, v_p, 'Por que perguntas com "como" e "o que" são preferíveis a perguntas com "por que" em negociação?', jsonb_build_array('"Por que" é gramaticalmente incorreto','"Por que" tende a soar acusatório e gerar defensividade','Não há diferença','"Como" é mais formal'), 1),
  (v_tenant, v_p, 'Segundo a pesquisa do JOLT Effect, a maior causa de perda de negócio é:', jsonb_build_array('Concorrência mais barata','Indecisão do próprio comprador','Produto de má qualidade','Falta de marketing'), 1),
  (v_tenant, v_p, 'A técnica de "rotulagem" em negociação consiste em:', jsonb_build_array('Categorizar clientes por valor de compra','Nomear em voz alta a emoção ou preocupação percebida no outro lado','Etiquetar produtos com preço','Classificar objeções em planilha'), 1),
  (v_tenant, v_p, 'Para diferenciar objeção real de objeção de adiamento, o vendedor deve:', jsonb_build_array('Sempre oferecer desconto','Investigar a causa específica por trás da objeção antes de reagir','Ignorar a objeção','Encerrar a venda imediatamente'), 1);

  -- ---------- Módulo 1.5 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Storytelling e Comunicação de Valor',
    'Base teórica: Paul Smith, Sell with a Story; complementado por Daniel Pink, To Sell Is Human.', 5, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Por que histórias vendem mais que listas de features', 'texto',
    'Histórias vendem porque ficam — bem contadas, conectam emocionalmente e impulsionam ação, fazendo a mensagem ser lembrada muito depois do encontro terminar. Para produtos técnicos/complexos (como SaaS B2B), uma história de cliente real que resolveu um problema específico comunica valor melhor que uma lista de funcionalidades.', 1, false),
  (v_tenant, v_m, 'Estrutura de uma história de vendas eficaz', 'texto',
    'Estrutura prática — Situação inicial do cliente (relatable) → Obstáculo/momento de virada → Ação tomada com a solução → Resultado mensurável. Evitar: histórias genéricas demais ("um cliente nosso..."), sem nome de segmento, número ou contexto específico.', 2, false),
  (v_tenant, v_m, 'As 3 qualidades de Daniel Pink: Attunement, Buoyancy, Clarity', 'texto',
    'Attunement (sintonia) — adaptar-se à perspectiva do outro; Buoyancy (flutuabilidade) — manter-se resiliente e positivo apesar de rejeições constantes, sem cair em otimismo ingênuo nem pessimismo paralisante; Clarity (clareza) — ajudar o cliente a enxergar com nitidez o próprio problema antes de oferecer a solução.', 3, false),
  (v_tenant, v_m, 'Construindo seu banco pessoal de histórias de venda', 'texto',
    'Exercício prático — listar 3 cases reais (ou hipotéticos, se ainda não há clientes) e estruturá-los no formato Situação → Obstáculo → Ação → Resultado.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'Por que histórias são mais memoráveis que listas de características?', jsonb_build_array('São mais longas','Criam conexão emocional que persiste além do encontro de vendas','Sempre incluem desconto','São mais baratas de produzir'), 1),
  (v_tenant, v_p, 'Na estrutura de história de vendas, a ordem correta é:', jsonb_build_array('Resultado, Ação, Obstáculo, Situação','Situação, Obstáculo, Ação, Resultado','Obstáculo, Resultado, Situação, Ação','Ação, Situação, Resultado, Obstáculo'), 1),
  (v_tenant, v_p, '"Buoyancy" no modelo de Daniel Pink se refere a:', jsonb_build_array('Otimismo ingênuo sempre','Resiliência emocional frente à rejeição, sem negar a realidade','Flutuação de preços','Variação de comissão'), 1),
  (v_tenant, v_p, 'Um erro comum ao contar histórias de vendas é:', jsonb_build_array('Usar números específicos','Ser vago demais, sem contexto ou dado concreto','Mencionar o nome do segmento do cliente','Descrever o obstáculo enfrentado'), 1);

  -- ---------- Módulo 1.6 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Prospecção e Construção de Pipeline',
    'Base teórica: Aaron Ross & Marylou Tyler, Predictable Revenue; Trish Bertuzzi, The Sales Development Playbook.', 6, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Por que "receita previsível" depende de processo, não de heroísmo individual', 'texto',
    'O livro foca em construir processos de vendas repetíveis e escaláveis em vez de depender de heroísmo individual — separação de funções entre quem gera lead (prospecção), quem qualifica e quem fecha, permitindo previsibilidade de receita.', 1, false),
  (v_tenant, v_m, 'Cadência multicanal: telefone, e-mail, social e dados de intenção', 'texto',
    'Combinar storytelling com prospecção multicanal e dados de intenção aumenta taxa de resposta. Nenhum canal isolado sustenta pipeline saudável — a cadência (sequência programada de toques) é mais eficaz que esforço esporádico.', 2, false),
  (v_tenant, v_m, 'Qualificação: nem todo lead merece o mesmo esforço', 'texto',
    'Critérios básicos de qualificação (dor real, orçamento, autoridade de decisão, momento) aplicados antes de investir tempo de vendedor sênior em uma oportunidade.', 3, false),
  (v_tenant, v_m, 'Métricas de pipeline que realmente importam', 'texto',
    'Taxa de conversão por etapa do funil, tempo médio de ciclo, valor médio de contrato — e por que "número de leads" isolado é a métrica mais enganosa de se otimizar.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'O conceito central de Predictable Revenue é:', jsonb_build_array('Depender de vendedores estrela individuais','Construir processos repetíveis e escaláveis de geração de receita','Reduzir o time de vendas ao mínimo','Focar só em e-mail frio'), 1),
  (v_tenant, v_p, 'Por que cadência multicanal supera esforço em canal único?', jsonb_build_array('É mais barato sempre','Aumenta a taxa de resposta ao diversificar pontos de contato','Elimina necessidade de qualificação','Não há evidência disso'), 1),
  (v_tenant, v_p, 'Qualificação de lead serve para:', jsonb_build_array('Filtrar oportunidades antes de investir tempo de vendas','Aumentar artificialmente o número de leads','Substituir a necessidade de prospecção','Negociar preço'), 0),
  (v_tenant, v_p, 'Qual métrica isolada é considerada mais enganosa para otimizar?', jsonb_build_array('Taxa de conversão por etapa','Número total de leads, sem considerar qualidade','Tempo médio de ciclo','Valor médio de contrato'), 1);

  -- ---------- Módulo: Prova Final — Trilha 1 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Prova Final — Fundamentos de Vendas Consultivas',
    'Avaliação final da trilha (15 questões, nota mínima 70%).', 7, 100, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Prova Final', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'No framework SPIN, qual a função da pergunta de Implicação?', jsonb_build_array('Coletar dados básicos','Ampliar a percepção do cliente sobre as consequências do problema','Fechar a venda','Apresentar o preço'), 1),
  (v_tenant, v_p, 'Qual perfil de vendedor a pesquisa de Dixon e Adamson aponta como mais eficaz em vendas complexas?', jsonb_build_array('Relationship Builder','Lone Wolf','Challenger','Hard Worker'), 2),
  (v_tenant, v_p, '"Ensinar, Personalizar, Assumir Controle" são os três pilares de:', jsonb_build_array('SPIN Selling','Challenger Sale','Predictable Revenue','Never Split the Difference'), 1),
  (v_tenant, v_p, 'O princípio de persuasão que explica por que demonstrações gratuitas geram retorno é:', jsonb_build_array('Escassez','Reciprocidade','Autoridade','Unidade'), 1),
  (v_tenant, v_p, 'Por que escassez fabricada é arriscada como tática de vendas?', jsonb_build_array('É ilegal em todos os países','Destrói credibilidade quando o cliente percebe que era falsa','Aumenta vendas sem nenhum risco','Não tem nenhum efeito'), 1),
  (v_tenant, v_p, 'Empatia tática, segundo Chris Voss, significa:', jsonb_build_array('Concordar com o cliente sempre','Demonstrar compreensão genuína da perspectiva do outro lado','Evitar qualquer negociação','Pressionar emocionalmente o cliente'), 1),
  (v_tenant, v_p, 'Por que perguntas com "como" são preferíveis a perguntas com "por que" em negociação?', jsonb_build_array('"Por que" tende a soar acusatório','São sinônimos, não há diferença','"Como" é mais curto','"Por que" é proibido em vendas'), 0),
  (v_tenant, v_p, 'Segundo o JOLT Effect, a principal razão de perda de negócios é:', jsonb_build_array('Concorrência','Indecisão do comprador','Preço alto','Falta de marketing'), 1),
  (v_tenant, v_p, 'A estrutura recomendada para contar uma história de vendas é:', jsonb_build_array('Situação → Obstáculo → Ação → Resultado','Resultado → Situação → Ação → Obstáculo','Ação → Resultado → Obstáculo → Situação','Obstáculo → Ação → Situação → Resultado'), 0),
  (v_tenant, v_p, '"Clarity" no modelo de Daniel Pink se refere a:', jsonb_build_array('Transparência de preço','Ajudar o cliente a ver com nitidez o próprio problema','Clareza visual da proposta','Honestidade contratual'), 1),
  (v_tenant, v_p, 'O conceito central de Predictable Revenue é:', jsonb_build_array('Heroísmo individual de vendedores','Processos de vendas repetíveis e escaláveis','Foco exclusivo em e-mail frio','Eliminação da qualificação de leads'), 1),
  (v_tenant, v_p, 'Qual a diferença entre objeção real e objeção de adiamento?', jsonb_build_array('Não existe diferença prática','Objeção real é limitação genuína; objeção de adiamento é desculpa para não decidir agora','Ambas exigem desconto imediato','Apenas o preço determina a diferença'), 1),
  (v_tenant, v_p, 'Em qual cenário a abordagem Challenger é menos indicada?', jsonb_build_array('Venda B2B complexa multi-stakeholder','Venda transacional simples e recorrente','Negociação com comitê','Ciclo de vendas longo'), 1),
  (v_tenant, v_p, 'Qual o risco de usar perguntas de Situação (SPIN) em excesso?', jsonb_build_array('Nenhum risco','Sinaliza despreparo e cansa o cliente','Aumenta a confiança do cliente','Acelera o fechamento'), 1),
  (v_tenant, v_p, 'O princípio de "Unidade" de Cialdini se refere a:', jsonb_build_array('Preço fixo único','Senso de identidade compartilhada entre as partes','Contrato vitalício','Catálogo único de produto'), 1);

  -- ============================================================
  -- TRILHA 2 — EXCELÊNCIA EM ATENDIMENTO AO CLIENTE
  -- ============================================================
  INSERT INTO public.trilhas (tenant_id, titulo, descricao, publico_alvo, ordem, ativo, ativa)
  VALUES (v_tenant, 'Excelência em Atendimento ao Cliente',
    'Fundamentos de qualidade de serviço com base em pesquisa acadêmica validada (SERVQUAL) e nos mecanismos de recuperação de serviço e fidelização documentados na literatura de customer experience.',
    'Vendedores', 2, true, true)
  RETURNING id INTO v_t;

  -- ---------- Módulo 2.1 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'O que é Qualidade de Serviço, de Verdade',
    'Base teórica: Parasuraman, Zeithaml & Berry (1988), modelo SERVQUAL.', 1, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'As 5 dimensões da qualidade de serviço', 'texto',
    'Tangíveis (aparência física de instalações, materiais e funcionários), confiabilidade (capacidade de cumprir o que foi prometido de forma precisa), responsividade (disposição em atender e prestar o serviço prometido), segurança/assurance (conhecimento e cortesia dos funcionários e sua capacidade de transmitir confiança) e empatia (atenção individual e cuidado oferecido aos clientes). Cada dimensão é avaliada pela diferença entre expectativa do cliente e percepção da entrega real.', 1, false),
  (v_tenant, v_m, 'Por que satisfação não é a mesma coisa que qualidade percebida', 'texto',
    'Qualidade de serviço é avaliada por componente (essa ligação foi resolvida bem?); experiência do cliente é cumulativa e atravessa múltiplos pontos de contato ao longo do tempo — um componente individual pode ser avaliado como "boa qualidade", mas a experiência geral pode não ser. Implicação: um atendimento tecnicamente correto ainda pode deixar o cliente insatisfeito se a jornada completa foi ruim.', 2, false),
  (v_tenant, v_m, 'Expectativa vs. percepção: o gap que decide a satisfação', 'texto',
    'O modelo SERVQUAL mede a diferença entre o que o cliente esperava e o que percebeu ter recebido — não o nível absoluto de serviço. Por isso, comunicar expectativas realistas (prazo, escopo, limite do plano) é tão importante quanto a qualidade da entrega em si.', 3, false),
  (v_tenant, v_m, 'Aplicando as 5 dimensões no atendimento de um SaaS', 'texto',
    'Tradução prática de cada dimensão para suporte digital — tangíveis = interface e clareza visual do ticket/chat; confiabilidade = cumprir SLA prometido; responsividade = tempo de primeira resposta; segurança = conhecimento técnico real do agente; empatia = atenção ao contexto específico do cliente, não resposta genérica de macro.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'Quantas dimensões o modelo SERVQUAL identifica?', jsonb_build_array('3','4','5','10'), 2),
  (v_tenant, v_p, 'A dimensão "Responsividade" no SERVQUAL se refere a:', jsonb_build_array('Aparência física das instalações','Disposição da organização em atender e prestar o serviço prometido','Conhecimento técnico do funcionário','Atenção individual ao cliente'), 1),
  (v_tenant, v_p, 'SERVQUAL mede satisfação através de:', jsonb_build_array('Nível absoluto de qualidade entregue','A diferença entre expectativa e percepção do cliente','Apenas o preço pago','Número de reclamações'), 1),
  (v_tenant, v_p, 'Por que um atendimento "tecnicamente correto" pode ainda deixar o cliente insatisfeito?', jsonb_build_array('Isso nunca acontece','Porque a experiência é cumulativa, e um componente bom não garante jornada boa','Porque o SERVQUAL é falho','Porque o cliente está sempre errado'), 1),
  (v_tenant, v_p, 'Qual dimensão do SERVQUAL corresponde a "atenção individual e cuidado"?', jsonb_build_array('Tangíveis','Confiabilidade','Empatia','Segurança'), 2);

  -- ---------- Módulo 2.2 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'A Jornada do Cliente e os Pontos de Contato',
    'Base teórica: pesquisa em Customer Experience (CX) — journey mapping e métricas (NPS, CSAT, CES).', 2, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Por que mapear a jornada importa mais que otimizar um único atendimento', 'texto',
    'Pesquisa recente enfatiza a importância de entender toda a jornada do cliente, do primeiro contato até as interações pós-compra, e empresas que focam na jornada completa apresentam ganhos relevantes de satisfação. Para um SaaS, a jornada inclui onboarding, uso recorrente, suporte, renovação — e cada etapa tem expectativas diferentes.', 1, false),
  (v_tenant, v_m, 'As três métricas que todo time de atendimento deveria acompanhar', 'texto',
    'NPS mede lealdade e probabilidade de recomendação; CSAT mede satisfação geral com a marca ou com uma interação específica; CES mede o quão fácil foi para o cliente resolver uma tarefa. CES é especialmente relevante em suporte técnico — esforço alto para resolver um problema simples é um dos maiores preditores de churn.', 2, false),
  (v_tenant, v_m, 'O papel da emoção na experiência do cliente', 'texto',
    'Emoções influenciam como o cliente percebe cada interação com a marca, e têm papel significativo em direcionar lealdade e satisfação; emoções positivas como alegria e confiança são fatores-chave de fidelização. Implicação para scripts de atendimento: tom de voz e validação emocional importam tanto quanto a solução técnica entregue.', 3, false),
  (v_tenant, v_m, 'Mapeando a jornada do seu próprio produto', 'texto',
    'Exercício prático — listar os pontos de contato do cliente com o produto (cadastro, primeiro uso, suporte, cobrança, renovação) e identificar onde o atrito é maior hoje.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'NPS mede principalmente:', jsonb_build_array('Facilidade de uso','Lealdade e probabilidade de recomendação','Tempo de resposta','Receita gerada'), 1),
  (v_tenant, v_p, 'CES (Customer Effort Score) mede:', jsonb_build_array('O esforço de marketing da empresa','O quanto de esforço o cliente teve para resolver uma tarefa','O número de funcionários','O custo de aquisição de cliente'), 1),
  (v_tenant, v_p, 'Por que mapear a jornada completa é mais eficaz que otimizar um atendimento isolado?', jsonb_build_array('Não é mais eficaz','Porque a satisfação é construída cumulativamente ao longo de múltiplos pontos de contato','Porque elimina a necessidade de suporte','Porque reduz custos automaticamente'), 1),
  (v_tenant, v_p, 'Qual o papel da emoção na experiência do cliente, segundo a pesquisa?', jsonb_build_array('Irrelevante, só dados objetivos importam','Emoções positivas como confiança e alegria são fatores-chave de fidelização','Emoção só importa em vendas, não em suporte','Não há relação entre emoção e lealdade'), 1);

  -- ---------- Módulo 2.3 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Quando Algo Dá Errado: Recuperação de Serviço',
    'Base teórica: o paradoxo da recuperação de serviço (service recovery paradox).', 3, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'O paradoxo da recuperação de serviço', 'texto',
    'O paradoxo da recuperação de serviço é o fenômeno em que o cliente tem uma visão mais positiva da empresa depois de uma reclamação resolvida do que tinha antes do problema acontecer. Quando o cliente reclama diretamente ao prestador de serviço, existe a oportunidade de reverter a situação, aumentar a satisfação e conquistar clientes fiéis — por isso, reclamação não é incômodo, é oportunidade.', 1, false),
  (v_tenant, v_m, 'Os elementos de uma recuperação de serviço eficaz', 'texto',
    'Os elementos de uma recuperação bem-sucedida incluem agilidade — agir rapidamente, reconhecendo o problema de forma imediata seja por e-mail, telefone ou interação presencial — e empatia genuína, entendendo as emoções do cliente. Falha em qualquer um dos dois elementos reduz drasticamente a chance de reverter a insatisfação.', 2, false),
  (v_tenant, v_m, 'Por que clientes que culpam "fatores externos" perdoam mais fácil', 'texto',
    'Pesquisas mostram consistentemente que clientes que atribuem a falha a fatores externos são mais tolerantes, enquanto clientes que atribuem a falha ao próprio sistema da empresa tendem mais a reclamar formalmente. Implicação prática: a forma como o atendente explica a causa do problema (sem mentir, mas com contexto honesto) afeta diretamente o nível de tolerância do cliente.', 3, false),
  (v_tenant, v_m, 'O risco da supercompensação', 'texto',
    'Pesquisa acadêmica recente mostra que existe um valor-limite de compensação a partir do qual a satisfação do cliente supera até a satisfação de quem nunca teve problema — mas compensar demais além desse ponto desperdiça recurso sem ganho adicional de satisfação, e pode até gerar desconfiança ("por que estão dando tanto assim?").', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'O paradoxo da recuperação de serviço descreve uma situação em que:', jsonb_build_array('O cliente fica sempre insatisfeito após reclamar','O cliente pode ficar mais satisfeito após uma reclamação bem resolvida do que se nunca tivesse tido o problema','Reclamações são sempre evitáveis','O paradoxo nunca foi comprovado'), 1),
  (v_tenant, v_p, 'Quais são os dois elementos centrais de uma recuperação de serviço eficaz?', jsonb_build_array('Desconto e brinde','Agilidade e empatia genuína','Silêncio e espera','Burocracia e formulário'), 1),
  (v_tenant, v_p, 'Clientes que atribuem a falha a fatores externos tendem a ser:', jsonb_build_array('Mais exigentes em compensação','Mais tolerantes e propensos a perdoar','Sempre mais raivosos','Indiferentes ao resultado'), 1),
  (v_tenant, v_p, 'O que é "supercompensação" no contexto de recuperação de serviço?', jsonb_build_array('Compensar exatamente o valor do prejuízo','Compensar além do necessário, sem ganho adicional de satisfação e com risco de gerar desconfiança','Nunca compensar o cliente','Compensar apenas com desconto futuro'), 1),
  (v_tenant, v_p, 'Por que reclamação direta ao prestador de serviço é uma oportunidade, e não um problema?', jsonb_build_array('Porque permite à empresa reverter a insatisfação antes que o cliente migre para a concorrência','Porque reduz a carga de trabalho do suporte','Porque elimina a necessidade de melhorar o produto','Não é uma oportunidade real'), 0);

  -- ---------- Módulo 2.4 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Comunicação no Atendimento: Empatia e Linguagem',
    'Base teórica: Cialdini (afeição, reciprocidade) e Voss (empatia tática) aplicados a suporte.', 4, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Escuta ativa e rotulagem emocional no suporte', 'texto',
    'Aplicar a técnica de rotulagem ("percebo que isso está causando bastante frustração") antes de oferecer solução técnica. Validar a emoção primeiro reduz a resistência do cliente a aceitar a próxima etapa do atendimento.', 1, false),
  (v_tenant, v_m, 'A fórmula "Sinto / Senti / Descobri" para lidar com objeções e frustração', 'texto',
    'A fórmula combina sentir (expressa empatia) mais senti (no passado, implicando ainda maior grau de similaridade) mais descobri (aponta um objetivo em comum) — estrutura útil para responder reclamações sem soar defensivo nem condescendente.', 2, false),
  (v_tenant, v_m, 'Comunicação proativa: avisar antes que o cliente pergunte', 'texto',
    'A dimensão de Confiabilidade do SERVQUAL é fortalecida quando a empresa comunica proativamente atrasos, manutenções ou mudanças, em vez de esperar o cliente reclamar. Isso reduz o "gap" entre expectativa e percepção mesmo antes do problema acontecer.', 3, false),
  (v_tenant, v_m, 'O que NUNCA dizer em um atendimento (mesmo sob pressão)', 'texto',
    'Frases que violam a percepção de Segurança/Assurance do cliente — minimizar o problema ("é só isso?"), transferir culpa ao cliente sem necessidade, prometer prazo que não pode ser cumprido para encerrar a conversa rápido.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'A técnica de "rotulagem emocional" no atendimento serve para:', jsonb_build_array('Classificar clientes por valor de contrato','Validar a emoção do cliente antes de oferecer a solução técnica','Etiquetar tickets por urgência','Definir o preço do suporte'), 1),
  (v_tenant, v_p, 'Na fórmula "Sinto / Senti / Descobri", a etapa "Senti" serve para:', jsonb_build_array('Negar a experiência do cliente','Expressar similaridade, reforçando empatia genuína','Encerrar a conversa','Cobrar uma taxa adicional'), 1),
  (v_tenant, v_p, 'Comunicação proativa de problemas fortalece principalmente qual dimensão do SERVQUAL?', jsonb_build_array('Tangíveis','Confiabilidade','Empatia','Segurança'), 1),
  (v_tenant, v_p, 'Prometer um prazo que não pode ser cumprido só para encerrar a conversa rápido é um erro porque:', jsonb_build_array('Aumenta a confiança do cliente','Cria expectativa que será quebrada, ampliando o gap de insatisfação depois','É sempre ilegal','Não tem nenhum efeito real'), 1);

  -- ---------- Módulo 2.5 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Atendimento como Motor de Retenção',
    'Base teórica: conexão entre qualidade de serviço, lealdade e métricas de negócio (Reichheld — NPS; Qualtrics XM Institute).', 5, 50, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.aulas (tenant_id, modulo_id, titulo, tipo_conteudo, conteudo_texto, ordem, is_global) VALUES
  (v_tenant, v_m, 'Atendimento bom não é custo, é retenção', 'texto',
    'Consumidores que avaliam o atendimento de uma empresa como "bom" têm 38% mais chance de recomendá-la, e 94% dos clientes americanos recomendam empresas cujo atendimento avaliam como "muito bom". Para um SaaS com cobrança recorrente, isso se traduz diretamente em redução de churn.', 1, false),
  (v_tenant, v_m, 'Por que reter custa menos que adquirir', 'texto',
    'É regra geral, especialmente em setores de serviço, que custa muitas vezes mais caro adquirir um novo cliente do que reter um cliente existente — atendimento eficaz de recuperação ajuda diretamente a prevenir esse churn evitável.', 2, false),
  (v_tenant, v_m, 'Agentes empoderados resolvem mais rápido e ficam mais engajados', 'texto',
    'Empoderar funcionários para resolver reclamações com empatia e autoridade é essencial; funcionários bem treinados podem transformar falhas de serviço em oportunidades de interações positivas, e funcionários com autonomia para resolver problemas tendem a ter moral mais alto. Implicação organizacional: dar autonomia real ao time de suporte (poder de crédito, reembolso, extensão de prazo dentro de limites claros) acelera resolução e reduz desgaste do time.', 3, false),
  (v_tenant, v_m, 'Construindo um checklist de atendimento para seu próprio produto', 'texto',
    'Aula prática de síntese — o aluno monta um checklist de atendimento aplicando as 5 dimensões do SERVQUAL + protocolo de recuperação de serviço (agilidade + empatia) ao contexto do próprio produto/suporte.', 4, false);

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Quiz do Módulo', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'Segundo pesquisa da Qualtrics XM Institute, clientes que avaliam o atendimento como "bom" têm quanto mais chance de recomendar a empresa?', jsonb_build_array('10%','38%','94%','100%'), 1),
  (v_tenant, v_p, 'Por que reter clientes existentes costuma ser mais barato que adquirir novos?', jsonb_build_array('Não é mais barato, é só um mito','Porque o custo de aquisição de novo cliente é tipicamente muito maior que o custo de retenção','Porque clientes antigos nunca usam suporte','Porque clientes antigos pagam mais'), 1),
  (v_tenant, v_p, 'Empoderar agentes de suporte com autonomia para resolver problemas tende a:', jsonb_build_array('Aumentar custo sem benefício','Acelerar resolução e melhorar o moral da equipe','Gerar mais reclamações','Não ter efeito mensurável'), 1),
  (v_tenant, v_p, 'Qual a relação entre atendimento de qualidade e churn em modelo de assinatura recorrente?', jsonb_build_array('Não há relação','Atendimento de qualidade reduz churn ao aumentar satisfação e lealdade','Atendimento só afeta vendas, não retenção','Churn depende só de preço'), 1);

  -- ---------- Módulo: Prova Final — Trilha 2 ----------
  INSERT INTO public.modulos (tenant_id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
  VALUES (v_tenant, v_t, 'Prova Final — Excelência em Atendimento ao Cliente',
    'Avaliação final da trilha (15 questões, nota mínima 70%).', 6, 100, 70)
  RETURNING id INTO v_m;

  INSERT INTO public.provas (tenant_id, modulo_id, titulo, nota_minima) VALUES (v_tenant, v_m, 'Prova Final', 70) RETURNING id INTO v_p;
  INSERT INTO public.questoes_prova (tenant_id, prova_id, pergunta, opcoes, indice_correta) VALUES
  (v_tenant, v_p, 'Quantas dimensões o modelo SERVQUAL identifica para qualidade de serviço?', jsonb_build_array('3','5','7','10'), 1),
  (v_tenant, v_p, 'SERVQUAL mede satisfação através de:', jsonb_build_array('Nível absoluto de serviço entregue','Diferença entre expectativa e percepção do cliente','Apenas o preço cobrado','Velocidade de resposta isolada'), 1),
  (v_tenant, v_p, 'A dimensão "Empatia" no SERVQUAL corresponde a:', jsonb_build_array('Aparência das instalações','Atenção individual e cuidado com o cliente','Cumprimento de prazos','Conhecimento técnico'), 1),
  (v_tenant, v_p, 'NPS mede principalmente:', jsonb_build_array('Esforço do cliente','Lealdade e probabilidade de recomendação','Tempo de resposta','Satisfação com uma interação isolada'), 1),
  (v_tenant, v_p, 'CES (Customer Effort Score) avalia:', jsonb_build_array('Receita gerada pelo cliente','O esforço necessário para o cliente resolver uma tarefa','O número de tickets abertos','A frequência de uso do produto'), 1),
  (v_tenant, v_p, 'O paradoxo da recuperação de serviço afirma que:', jsonb_build_array('Clientes nunca perdoam falhas','Uma recuperação bem feita pode gerar satisfação maior que se o problema nunca tivesse ocorrido','Reclamações sempre prejudicam a marca','Compensação financeira é sempre necessária'), 1),
  (v_tenant, v_p, 'Os dois elementos centrais de uma recuperação de serviço eficaz são:', jsonb_build_array('Desconto e silêncio','Agilidade e empatia genuína','Burocracia e formalidade','Espera e neutralidade'), 1),
  (v_tenant, v_p, 'Clientes que atribuem a falha a causas externas tendem a:', jsonb_build_array('Reclamar mais formalmente','Ser mais tolerantes','Nunca usar o produto novamente','Exigir reembolso total sempre'), 1),
  (v_tenant, v_p, '"Supercompensação" em recuperação de serviço é um risco porque:', jsonb_build_array('Sempre aumenta a satisfação proporcionalmente','Pode gerar desconfiança e desperdiçar recurso sem ganho adicional de satisfação','É ilegal em todos os contextos','Não existe esse conceito na literatura'), 1),
  (v_tenant, v_p, 'A fórmula "Sinto / Senti / Descobri" tem como função:', jsonb_build_array('Cobrar uma taxa adicional do cliente','Expressar empatia genuína e apontar um objetivo em comum, sem soar defensivo','Encerrar o atendimento rapidamente','Classificar o ticket por prioridade'), 1),
  (v_tenant, v_p, 'Comunicação proativa sobre atrasos ou mudanças fortalece principalmente:', jsonb_build_array('Tangíveis','Confiabilidade','Autoridade','Escassez'), 1),
  (v_tenant, v_p, 'Segundo a pesquisa da Qualtrics, qual % de clientes recomenda empresas com atendimento avaliado como "muito bom"?', jsonb_build_array('38%','60%','94%','100%'), 2),
  (v_tenant, v_p, 'Por que reter clientes existentes costuma custar menos que adquirir novos?', jsonb_build_array('Não custa menos, é um mito','O custo de aquisição de novo cliente tende a ser muito maior que o de retenção','Clientes antigos não usam suporte','Apenas o preço determina o custo'), 1),
  (v_tenant, v_p, 'Empoderar agentes de suporte com autonomia de decisão tende a:', jsonb_build_array('Aumentar custo sem retorno','Acelerar resolução de problemas e melhorar o moral da equipe','Reduzir a qualidade do atendimento','Não ter relação com satisfação do cliente'), 1),
  (v_tenant, v_p, 'Qual a principal diferença entre "qualidade de serviço" e "experiência do cliente"?', jsonb_build_array('São sinônimos exatos','Qualidade é avaliada por componente da interação; experiência é cumulativa ao longo da jornada','Experiência só existe em produtos físicos','Qualidade de serviço não pode ser medida'), 1);

  RAISE NOTICE 'Seed LMS aplicado: 2 trilhas, 13 modulos, provas e questoes para Loja Demo.';
END $$;
