-- =============================================================
-- Migration 0012 — Seed: Trilha LMS "Vendas no Varejo CDE"
-- Phase 2 — Schema v2
-- UUIDs fixos para garantir referências consistentes entre re-execuções
-- =============================================================

-- Trilha principal (tenant_id null = conteúdo global)
INSERT INTO trilhas (id, titulo, descricao, publico_alvo, ordem, ativo) VALUES
  ('11111111-0000-0000-0000-000000000001',
   'Vendas no Varejo CDE',
   'Treinamento completo para vendedores nas lojas de Ciudad del Este',
   'vendedor_varejo', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 8 módulos da trilha
INSERT INTO modulos (id, trilha_id, titulo, ordem, xp_reward, aprovacao_minima) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Perfil do Cliente CDE',     1,  50, 70),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Abordagem e Rapport',       2,  60, 70),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Sondagem e Necessidades',   3,  70, 70),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Apresentação do Produto',   4,  80, 70),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Objeções e Reversões',      5,  90, 70),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'Gatilhos Mentais',          6,  80, 70),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'Fechamento e Upsell',       7, 100, 70),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000001', 'Atendimento Atacado Web',   8,  90, 70)
ON CONFLICT (id) DO NOTHING;

-- Lições do Módulo 1 — Perfil do Cliente CDE
INSERT INTO licoes (id, modulo_id, titulo, tipo, conteudo, ordem) VALUES
  ('33333333-0001-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
   'O Turista Brasileiro', 'texto',
   '{"paragrafos":["O turista brasileiro é o principal cliente das lojas de CDE.","Caracteriza-se por buscar eletrônicos, perfumes e roupas com preço inferior ao Brasil.","Estratégia: destacar a diferença de preço e facilitar a compra rápida."]}',
   1),
  ('33333333-0001-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001',
   'O Turista Paraguaio', 'texto',
   '{"paragrafos":["O turista paraguaio busca produtos importados de qualidade.","Valoriza marcas reconhecidas e atendimento em espanhol ou guarani.","Estratégia: destacar autenticidade e garantia do produto."]}',
   2),
  ('33333333-0001-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001',
   'O Atacadista Online', 'texto',
   '{"paragrafos":["O atacadista online compra em volume para revender no Brasil via redes sociais.","Busca o menor preço e está disposto a esperar por bons negócios.","Estratégia: oferecer desconto progressivo por quantidade e agilidade no atendimento."]}',
   3)
ON CONFLICT (id) DO NOTHING;

-- Quiz do Módulo 1 — 5 questões
INSERT INTO quiz_questoes (id, modulo_id, enunciado, alternativas, ordem) VALUES
  ('44444444-0001-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
   'Qual é a principal motivação do turista brasileiro ao comprar em CDE?',
   '[{"id":"a","texto":"Comprar produtos raros","correta":false,"feedback":"Raridade não é o fator principal."},{"id":"b","texto":"Pagar menos do que pagaria no Brasil","correta":true,"feedback":"Correto! A diferença de preço é o principal atrativo."},{"id":"c","texto":"Comprar marcas desconhecidas","correta":false,"feedback":"O turista prefere marcas conhecidas."},{"id":"d","texto":"Evitar impostos paraguaios","correta":false,"feedback":"Impostos paraguaios não são a motivação primária."}]',
   1),
  ('44444444-0001-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001',
   'O que um atacadista online prioriza na compra?',
   '[{"id":"a","texto":"Design do produto","correta":false,"feedback":"Design é secundário para atacadistas."},{"id":"b","texto":"Exclusividade do item","correta":false,"feedback":"Atacadistas buscam itens com demanda comprovada."},{"id":"c","texto":"Menor preço possível para revenda","correta":true,"feedback":"Correto! Margem de revenda é o que importa."},{"id":"d","texto":"Atendimento em português","correta":false,"feedback":"Idioma não é prioridade para atacadistas."}]',
   2),
  ('44444444-0001-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001',
   'Qual idioma o turista paraguaio valoriza no atendimento?',
   '[{"id":"a","texto":"Inglês","correta":false,"feedback":"Inglês não é comum entre turistas paraguaios locais."},{"id":"b","texto":"Espanhol ou guarani","correta":true,"feedback":"Correto! Atender em espanhol ou guarani cria conexão."},{"id":"c","texto":"Português","correta":false,"feedback":"Português é a escolha para turistas brasileiros."},{"id":"d","texto":"Mandarim","correta":false,"feedback":"Mandarim é irrelevante aqui."}]',
   3),
  ('44444444-0001-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001',
   'Qual estratégia aumenta conversão com turistas brasileiros?',
   '[{"id":"a","texto":"Mostrar apenas produtos sem etiqueta de preço","correta":false,"feedback":"Transparência no preço é essencial."},{"id":"b","texto":"Destacar a diferença de preço Brasil x CDE","correta":true,"feedback":"Correto! O gatilho de economia é o mais poderoso."},{"id":"c","texto":"Falar apenas em espanhol","correta":false,"feedback":"Atender em português melhora a experiência."},{"id":"d","texto":"Não abordar o cliente proativamente","correta":false,"feedback":"Abordagem proativa aumenta conversão."}]',
   4),
  ('44444444-0001-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001',
   'Qual é uma característica do atacadista online que afeta a estratégia de venda?',
   '[{"id":"a","texto":"Compra apenas à vista","correta":false,"feedback":"Forma de pagamento varia."},{"id":"b","texto":"Tem pressa e quer fechar rápido","correta":false,"feedback":"Atacadistas frequentemente negociam mais."},{"id":"c","texto":"Está disposto a esperar por bons negócios","correta":true,"feedback":"Correto! Paciência para fechar bom preço é característica do atacadista."},{"id":"d","texto":"Compra apenas marcas de luxo","correta":false,"feedback":"Atacadistas priorizam margem, não luxo."}]',
   5)
ON CONFLICT (id) DO NOTHING;

-- Lições dos módulos 2-8 (conteúdo base — expansão na Phase 7/LMS)
INSERT INTO licoes (id, modulo_id, titulo, tipo, conteudo, ordem) VALUES
  ('33333333-0002-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'Os Primeiros 10 Segundos', 'texto', '{"paragrafos":["Os primeiros 10 segundos determinam a impressão do cliente.","Sorria, faça contato visual e cumprimente com energia."]}', 1),
  ('33333333-0002-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'O Protocolo de Abordagem CDE', 'texto', '{"paragrafos":["Protocolo padrão: aproximar-se pelo lado direito, iniciar com pergunta aberta."]}', 2),
  ('33333333-0002-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'A Técnica do Espelho', 'texto', '{"paragrafos":["Espelhar o comportamento e ritmo do cliente cria rapport natural."]}', 3),
  ('33333333-0003-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003', 'Por Que Perguntar é Vender', 'texto', '{"paragrafos":["Vendedor que pergunta controla a conversa e identifica a necessidade real."]}', 1),
  ('33333333-0003-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', 'O Funil de Sondagem em 5 Passos', 'texto', '{"paragrafos":["1. Para quem é? 2. Qual o uso principal? 3. Tem preferência de marca? 4. Qual a verba? 5. Quando precisa?"]}', 2),
  ('33333333-0003-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Vocabulário que Vende', 'texto', '{"paragrafos":["Trocar palavras negativas por positivas: não diga que não tem, diga que tem algo melhor."]}', 3),
  ('33333333-0004-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', 'Técnica FAB', 'texto', '{"paragrafos":["FAB: Feature (Característica) → Advantage (Vantagem) → Benefit (Benefício para o cliente)."]}', 1),
  ('33333333-0004-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004', 'Como Apresentar o Preço', 'texto', '{"paragrafos":["Nunca fale o preço antes de apresentar o valor. Preço deve ser a conclusão, não a abertura."]}', 2),
  ('33333333-0004-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004', 'A Importância do Deixa Eu Mostrar', 'texto', '{"paragrafos":["Colocar o produto nas mãos do cliente aumenta a taxa de fechamento."]}', 3),
  ('33333333-0005-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', 'Por Que o Cliente Objeta', 'texto', '{"paragrafos":["Objeção = interesse disfarçado. Cliente sem interesse não objeta, simplesmente vai embora."]}', 1),
  ('33333333-0005-0000-0000-000000000002', '22222222-0000-0000-0000-000000000005', 'As 4 Objeções Mais Comuns em CDE', 'texto', '{"paragrafos":["1. Está caro. 2. Vou pensar. 3. Preciso ver com meu marido/esposa. 4. Encontrei mais barato."]}', 2),
  ('33333333-0005-0000-0000-000000000003', '22222222-0000-0000-0000-000000000005', 'Scripts de Reversão Prontos', 'texto', '{"paragrafos":["Para Está caro: Caro comparado com o quê? Posso mostrar o que está incluído?"]}', 3),
  ('33333333-0006-0000-0000-000000000001', '22222222-0000-0000-0000-000000000006', 'Como Funcionam os Gatilhos', 'texto', '{"paragrafos":["Gatilhos mentais são atalhos cognitivos que facilitam a decisão de compra."]}', 1),
  ('33333333-0006-0000-0000-000000000002', '22222222-0000-0000-0000-000000000006', 'Os 8 Gatilhos do Varejo CDE', 'texto', '{"paragrafos":["Escassez, urgência, prova social, autoridade, reciprocidade, compromisso, afinidade, novidade."]}', 2),
  ('33333333-0006-0000-0000-000000000003', '22222222-0000-0000-0000-000000000006', 'Quando Usar Cada Gatilho', 'texto', '{"paragrafos":["Escassez: Só temos 2 unidades. Urgência: Promoção até hoje. Prova social: Muito vendido para brasileiros."]}', 3),
  ('33333333-0007-0000-0000-000000000001', '22222222-0000-0000-0000-000000000007', 'Sinais de Compra', 'texto', '{"paragrafos":["Cliente olha o produto várias vezes, pergunta sobre garantia ou toca com frequência = pronto para fechar."]}', 1),
  ('33333333-0007-0000-0000-000000000002', '22222222-0000-0000-0000-000000000007', 'Técnicas de Fechamento', 'texto', '{"paragrafos":["Fechamento presumido: Vai querer na caixa ou vou embalar para presente?"]}', 2),
  ('33333333-0007-0000-0000-000000000003', '22222222-0000-0000-0000-000000000007', 'Upsell e Cross-sell Naturais', 'texto', '{"paragrafos":["Após fechar a venda principal, ofereça complemento: Tenho o carregador portátil perfeito para esse celular."]}', 3),
  ('33333333-0008-0000-0000-000000000001', '22222222-0000-0000-0000-000000000008', 'O Perfil do Atacadista Online', 'texto', '{"paragrafos":["Compra para revender via Shopee, Instagram ou WhatsApp. Decisão baseada em margem."]}', 1),
  ('33333333-0008-0000-0000-000000000002', '22222222-0000-0000-0000-000000000008', 'Atendimento por WhatsApp', 'texto', '{"paragrafos":["Responder em até 5 minutos. Mandar foto real, não foto do site. Incluir preço e disponibilidade no primeiro retorno."]}', 2),
  ('33333333-0008-0000-0000-000000000003', '22222222-0000-0000-0000-000000000008', 'Proposta e Follow-up', 'texto', '{"paragrafos":["Enviar proposta formal com quantidade, preço e prazo. Follow-up em 24h se não houver resposta."]}', 3)
ON CONFLICT (id) DO NOTHING;

-- Quiz mínimo para módulos 2-8 (1 questão cada)
INSERT INTO quiz_questoes (id, modulo_id, enunciado, alternativas, ordem) VALUES
  ('44444444-0002-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002',
   'Qual é a melhor forma de iniciar o rapport com um cliente novo?',
   '[{"id":"a","texto":"Perguntar imediatamente o que quer comprar","correta":false,"feedback":"Abordagem direta pode parecer agressiva."},{"id":"b","texto":"Sorrir, fazer contato visual e cumprimentar com energia","correta":true,"feedback":"Correto! A primeira impressão define o tom."},{"id":"c","texto":"Esperar o cliente falar primeiro","correta":false,"feedback":"Abordagem proativa é mais eficaz."},{"id":"d","texto":"Mostrar o produto mais caro","correta":false,"feedback":"Iniciar com preço alto afasta clientes."}]',
   1),
  ('44444444-0003-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003',
   'No funil de sondagem, qual pergunta ajuda a entender o orçamento do cliente?',
   '[{"id":"a","texto":"Para quem é o produto?","correta":false,"feedback":"Essa identifica o usuário, não o orçamento."},{"id":"b","texto":"Qual a verba disponível?","correta":true,"feedback":"Correto! Entender o orçamento evita sugerir produtos fora do alcance."},{"id":"c","texto":"Quando precisa?","correta":false,"feedback":"Essa identifica urgência, não orçamento."},{"id":"d","texto":"Tem preferência de marca?","correta":false,"feedback":"Essa identifica preferência, não orçamento."}]',
   1),
  ('44444444-0004-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004',
   'Na técnica FAB, o que representa o B?',
   '[{"id":"a","texto":"Brand (marca)","correta":false,"feedback":"Brand não faz parte do FAB."},{"id":"b","texto":"Budget (orçamento)","correta":false,"feedback":"Budget não faz parte do FAB."},{"id":"c","texto":"Benefit (benefício para o cliente)","correta":true,"feedback":"Correto! Benefit é o impacto real na vida do cliente."},{"id":"d","texto":"Buy (comprar)","correta":false,"feedback":"Buy não faz parte do FAB."}]',
   1),
  ('44444444-0005-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005',
   'O que uma objeção do cliente geralmente indica?',
   '[{"id":"a","texto":"Que o cliente não tem interesse","correta":false,"feedback":"Sem interesse, o cliente simplesmente vai embora."},{"id":"b","texto":"Que o produto é caro","correta":false,"feedback":"Nem sempre — pode ser insegurança."},{"id":"c","texto":"Interesse disfarçado que precisa de mais informação","correta":true,"feedback":"Correto! Objeção é sinal de engajamento."},{"id":"d","texto":"Que você deve desistir da venda","correta":false,"feedback":"Desistir na objeção é perder a venda."}]',
   1),
  ('44444444-0006-0000-0000-000000000001', '22222222-0000-0000-0000-000000000006',
   'Qual gatilho mental usar quando restam poucas unidades em estoque?',
   '[{"id":"a","texto":"Reciprocidade","correta":false,"feedback":"Reciprocidade é sobre dar algo antes de pedir."},{"id":"b","texto":"Autoridade","correta":false,"feedback":"Autoridade é sobre credibilidade e expertise."},{"id":"c","texto":"Escassez","correta":true,"feedback":"Correto! Só temos 2 ativa o medo de perder a oportunidade."},{"id":"d","texto":"Novidade","correta":false,"feedback":"Novidade é sobre ser o primeiro a ter algo novo."}]',
   1),
  ('44444444-0007-0000-0000-000000000001', '22222222-0000-0000-0000-000000000007',
   'Qual é um exemplo de técnica de fechamento presumido?',
   '[{"id":"a","texto":"Você quer comprar esse produto?","correta":false,"feedback":"Pergunta aberta dá opção de dizer não."},{"id":"b","texto":"Vai querer na caixa ou embalo para presente?","correta":true,"feedback":"Correto! Fecha presumindo a compra, só deixando escolha de detalhe."},{"id":"c","texto":"Posso te mostrar algo mais barato?","correta":false,"feedback":"Isso desce no preço sem fechar."},{"id":"d","texto":"Você tem certeza que quer isso?","correta":false,"feedback":"Gera dúvida no cliente."}]',
   1),
  ('44444444-0008-0000-0000-000000000001', '22222222-0000-0000-0000-000000000008',
   'Qual é o tempo ideal de resposta para um atacadista online no WhatsApp?',
   '[{"id":"a","texto":"Até 24 horas","correta":false,"feedback":"24h é lento demais — o atacadista já comprou de outro."},{"id":"b","texto":"Até 1 hora","correta":false,"feedback":"1h ainda é muito para o ritmo do atacado online."},{"id":"c","texto":"Até 5 minutos","correta":true,"feedback":"Correto! Velocidade de resposta é diferencial competitivo no atacado online."},{"id":"d","texto":"Quando tiver disponível","correta":false,"feedback":"Sem prazo definido = perda de venda garantida."}]',
   1)
ON CONFLICT (id) DO NOTHING;
