import type { LmsTrilha } from './types'

export const trilha4: LmsTrilha = {
  id: 'trilha-estrategia',
  slug: 'estrategia-e-lideranca',
  title: 'Estratégia e Liderança',
  description: 'Fidelização de clientes, inteligência comercial, liderança de equipes de vendas e os 12 princípios do vendedor de elite.',
  icon: '👑',
  color: '#C9933A',
  xpReward: 500,
  lessons: [
    {
      id: 'mod-10-fidelizacao',
      title: 'Fidelização de clientes',
      description: 'LTV, Customer Experience, Customer Success e como construir um sistema de encantamento que transforma clientes em promotores.',
      duration: 22,
      content: `
<h2>Por que fidelização é o maior ROI do varejo</h2>
<p>Vender para cliente novo custa 5-7x mais que vender para cliente existente. Um cliente que compra 3x tem probabilidade 54% maior de comprar uma 4ª vez.</p>
<p><strong>LTV — Lifetime Value:</strong> o valor total que um cliente gera durante toda a relação com a loja. Um cliente que compra R$200/mês por 5 anos tem LTV de R$12.000 — não de R$200.</p>
<p><em>Quando você muda a unidade de análise de "essa venda" para "esse cliente ao longo dos anos", tudo muda.</em></p>

<h2>A pirâmide da fidelização</h2>
<ul>
<li><strong>Satisfação:</strong> o cliente não ficou insatisfeito. Mínimo para não perder. Não gera fidelidade.</li>
<li><strong>Lealdade:</strong> o cliente volta quando precisa. Bom. Mas ainda compra do concorrente.</li>
<li><strong>Encantamento:</strong> o cliente fala de você para os outros. Aqui começa o crescimento orgânico.</li>
<li><strong>Advocacy:</strong> o cliente defende a loja em conversas e indica ativamente. Esse é o objetivo.</li>
</ul>
<p><em>Satisfação não é suficiente. Encantar é o padrão mínimo para crescer.</em></p>

<h2>Customer Experience (CX)</h2>
<p>CX é a soma de todas as interações do cliente com a loja — antes, durante e depois da compra.</p>
<h3>Os momentos que mais importam</h3>
<ul>
<li><strong>Primeira impressão:</strong> os primeiros 30 segundos definem o tom. Ambiente, abordagem, sensação de acolhimento.</li>
<li><strong>O momento de dúvida:</strong> quando o cliente estava prestes a desistir e o vendedor salvou a venda com a informação certa.</li>
<li><strong>O pós-compra:</strong> o que acontece depois da venda. Embrulho, orientação de uso, follow-up.</li>
</ul>
<p><em>Efeito Pico-Final (Nobel Daniel Kahneman): a memória de uma experiência é definida pelo pico emocional e pelo momento final — não pela média. Garanta que o pico seja extraordinário e que o final seja excelente.</em></p>

<h2>Customer Success no varejo</h2>
<p>CS adaptado para lojas físicas significa garantir que o cliente tenha sucesso usando o que comprou.</p>
<h3>Práticas concretas</h3>
<ul>
<li><strong>Orientação de uso no momento da venda:</strong> "Esse produto funciona melhor se você..."</li>
<li><strong>Follow-up pós-compra:</strong> uma mensagem 3-7 dias depois: "Como está sendo a experiência com [produto]?"</li>
<li><strong>Antecipação de problemas:</strong> "Um detalhe importante que muita gente não sabe sobre esse produto é..."</li>
</ul>

<h2>Sistema de encantamento — os 5 pontos de contato</h2>
<table>
<tr><th>Ponto</th><th>Ação concreta</th></tr>
<tr><td>Recepção</td><td>Nome + sorriso + espaço (não pressionar)</td></tr>
<tr><td>Descoberta</td><td>Perguntas abertas para entender o contexto real</td></tr>
<tr><td>Apresentação</td><td>História do produto, não lista de atributos</td></tr>
<tr><td>Fechamento</td><td>Confirmação de que resolveu o problema certo</td></tr>
<tr><td>Pós-venda</td><td>Orientação + follow-up + abertura para retorno</td></tr>
</table>

<h2>Programas de fidelidade — o que funciona</h2>
<p>Programas de pontos funcionam menos do que relacionamento genuíno. O que fideliza de verdade:</p>
<ul>
<li><strong>Reconhecimento pessoal:</strong> lembrar o nome, o que comprou antes, o que falou na última visita.</li>
<li><strong>Acesso antecipado:</strong> avisar antes de promoções e novidades.</li>
<li><strong>Atenção especial:</strong> tratar como VIP sem exigir nada em troca.</li>
</ul>
<p><em>Um vendedor que lembra o nome do cliente e pergunta sobre um produto que ele comprou 3 meses atrás faz mais pela fidelização do que qualquer programa de pontos.</em></p>
      `,
      quiz: [
        {
          question: 'Por que LTV é mais importante que o valor de uma venda individual?',
          options: [
            'Porque é mais fácil de calcular no sistema',
            'Porque um cliente que volta tem probabilidade muito maior de comprar — e o custo de manter é 5-7x menor que adquirir um novo',
            'Porque o LTV aparece nos relatórios de comissão',
            'Porque clientes de longo prazo sempre compram mais em cada visita',
          ],
          correct: 1,
          explanation: 'Vender para cliente novo custa 5-7x mais. Um cliente com LTV de R$12.000 que compra R$200/mês por 5 anos — se você só pensa em R$200, vai tratá-lo como uma transação. Se você pensa em R$12.000, vai tratá-lo como um ativo de longo prazo.',
        },
        {
          question: 'O que é o Efeito Pico-Final e como ele se aplica ao atendimento?',
          options: [
            'O cliente avalia a loja pela média de todas as interações',
            'A memória da experiência é definida pelo pico emocional e pelo momento final — não pela média',
            'O primeiro e último produtos apresentados são os mais lembrados',
            'O cliente lembra melhor do preço no início e do produto no final',
          ],
          correct: 1,
          explanation: 'Daniel Kahneman (Nobel) descobriu que lembramos experiências pelo pico (momento de maior intensidade emocional) e pelo final — não pela duração ou média. Um atendimento longo mas mediano não fideliza. Um momento extraordinário + final excelente sim.',
        },
        {
          question: 'Qual prática de Customer Success é mais eficaz no varejo físico?',
          options: [
            'Enviar e-mail marketing semanal com promoções',
            'Oferecer programa de pontos com brindes',
            'Follow-up pós-compra perguntando como está sendo a experiência com o produto',
            'Oferecer desconto na próxima compra imediatamente após a venda',
          ],
          correct: 2,
          explanation: 'Follow-up genuíno (não venda) surpreende o cliente — porque quase ninguém faz. Uma mensagem "como está sendo a experiência?" transforma a percepção: o vendedor não estava só fechando uma venda, estava garantindo o sucesso do cliente.',
        },
        {
          question: 'O que fideliza mais do que um programa de pontos?',
          options: [
            'Descontos progressivos por volume de compras',
            'Reconhecimento pessoal: lembrar o nome, o histórico, tratar como VIP genuinamente',
            'Cartão fidelidade com acúmulo de cashback',
            'Brindes surpresa incluídos nas compras acima de determinado valor',
          ],
          correct: 1,
          explanation: 'Programas de pontos são commodities — qualquer concorrente pode oferecer um igual. O que diferencia é o relacionamento genuíno. Um vendedor que lembra que você comprou um produto em março e pergunta como foi faz algo que nenhum algoritmo de pontos faz.',
        },
      ],
    },
    {
      id: 'mod-11-inteligencia',
      title: 'Inteligência comercial',
      description: 'Métricas que importam, visual merchandising, análise de jornada do cliente e framework de melhoria contínua.',
      duration: 25,
      content: `
<h2>As métricas que todo vendedor deve conhecer</h2>
<p>Você não pode melhorar o que não mede. As métricas corretas revelam onde exatamente o processo de venda está falhando.</p>

<h3>Taxa de conversão</h3>
<p><strong>Definição:</strong> % de clientes que entram na loja e compram algo.<br>
<strong>Fórmula:</strong> (vendas / visitantes) × 100<br>
<strong>Benchmark varejo:</strong> 20-30% é saudável. Abaixo de 15% indica problema de atendimento ou produto.<br>
<strong>Como melhorar:</strong> abordagem mais rápida, qualificação melhor, oferta mais relevante.</p>

<h3>Ticket médio</h3>
<p><strong>Definição:</strong> valor médio de cada venda.<br>
<strong>Fórmula:</strong> faturamento total / número de vendas<br>
<strong>Como melhorar:</strong> upsell, cross-sell, apresentar versões premium antes das básicas.</p>

<h3>Itens por venda</h3>
<p>Quantos produtos por transação. Cada item adicional por venda tem custo marginal zero de captação — o cliente já está na loja.<br>
<strong>Como melhorar:</strong> sugestões complementares naturais, não forçadas.</p>

<h3>Taxa de retorno</h3>
<p>% de clientes que voltam em 90 dias. Indicador direto de fidelização.<br>
<strong>Como melhorar:</strong> pós-venda ativo, follow-up, experiência que supera expectativa.</p>

<h2>Visual Merchandising</h2>
<p>O arranjo físico da loja influencia diretamente as vendas. Não é estética — é psicologia aplicada.</p>

<h3>Princípios</h3>
<ul>
<li><strong>Zona de entrada:</strong> os primeiros metros são de descompressão. Não coloque produtos principais aqui — o cliente ainda está ajustando ao ambiente.</li>
<li><strong>Zona quente:</strong> o caminho natural do olhar ao entrar. Produtos de maior margem ou novidades devem estar aqui.</li>
<li><strong>Nível dos olhos = nível das vendas:</strong> produtos na altura dos olhos vendem mais. Use para produtos de alta margem.</li>
<li><strong>Cross-merchandising:</strong> colocar produtos complementares juntos (ex: celular + capinha + película no mesmo espaço).</li>
<li><strong>Escassez visual:</strong> 3-5 unidades de um produto visíveis vendem mais que prateleira cheia. Cheia parece "não vendeu".</li>
</ul>

<h2>Análise da jornada do cliente</h2>
<p>Mapeie o que acontece em cada etapa da visita — não para controlar, mas para identificar onde clientes saem sem comprar.</p>

<h3>Pontos de abandono comuns</h3>
<ul>
<li><strong>Não abordado nos primeiros 2 minutos:</strong> cliente se sente ignorado e sai.</li>
<li><strong>Abordado mas com script genérico:</strong> "posso ajudar?" → "estou só olhando" → fim.</li>
<li><strong>Apresentou produto, mas não identificou necessidade:</strong> produto certo, cliente errado.</li>
<li><strong>Chegou no preço cedo demais:</strong> antes de criar valor, preço parece sempre alto.</li>
<li><strong>Não fechou com pergunta de comprometimento:</strong> ficou esperando o cliente decidir sozinho.</li>
</ul>

<h2>Framework de melhoria contínua — PDCA para vendas</h2>
<table>
<tr><th>Fase</th><th>No varejo</th></tr>
<tr><td>Plan (Planejar)</td><td>Identificar métricas fracas e hipótese de causa</td></tr>
<tr><td>Do (Fazer)</td><td>Testar abordagem nova por 1-2 semanas</td></tr>
<tr><td>Check (Checar)</td><td>Comparar métricas antes e depois</td></tr>
<tr><td>Act (Agir)</td><td>Padronizar se funcionou, ou reformular hipótese</td></tr>
</table>

<h3>Exemplo prático</h3>
<p><strong>Problema identificado:</strong> taxa de conversão caiu de 25% para 18%.<br>
<strong>Hipótese:</strong> abordagem muito tarde (clientes esperando mais de 3 min).<br>
<strong>Teste:</strong> nova regra: abordar em menos de 60 segundos por 2 semanas.<br>
<strong>Resultado:</strong> conversão volta para 23%.<br>
<strong>Ação:</strong> padronizar abordagem rápida para toda equipe.</p>
      `,
      quiz: [
        {
          question: 'Uma taxa de conversão de 12% num varejo saudável indica o quê?',
          options: [
            'Excelente resultado — a maioria das lojas fica abaixo de 10%',
            'Resultado médio — dentro da faixa normal de 10-15%',
            'Problema: benchmark saudável é 20-30%. Abaixo de 15% indica falha de atendimento ou produto',
            'Irrelevante sem conhecer o ticket médio da loja',
          ],
          correct: 2,
          explanation: 'Conversão abaixo de 15% significa que mais de 85% dos clientes que entram na loja saem sem comprar. O problema pode estar na abordagem (muito tarde, muito genérica), no produto (errado para o público), ou no preço (comunicado cedo demais, antes de criar valor).',
        },
        {
          question: 'Por que produtos de alta margem devem ficar na altura dos olhos?',
          options: [
            'Para facilitar a reposição de estoque pelo vendedor',
            'Psicologia de percepção: o que está no nível dos olhos recebe mais atenção naturalmente e vende mais',
            'Por regulamentação de segurança e acessibilidade',
            'Para que clientes mais baixos e mais altos tenham acesso igual ao produto',
          ],
          correct: 1,
          explanation: '"Nível dos olhos = nível das vendas" é princípio estabelecido em estudos de comportamento do consumidor. O cérebro processa com mais facilidade o que está no campo visual direto — e o que é processado com mais facilidade gera mais intenção de compra.',
        },
        {
          question: 'Qual é o ponto de abandono mais comum na jornada do cliente em varejo?',
          options: [
            'O cliente acha o produto mas não gosta da embalagem',
            'O cliente não é abordado nos primeiros 2 minutos e se sente ignorado',
            'O cliente quer parcelamento e a loja não oferece',
            'O cliente compara com produtos online no celular',
          ],
          correct: 1,
          explanation: 'A janela de abordagem é crítica. Depois de 2-3 minutos sem contato, o cliente formou uma impressão negativa (sou invisível aqui) e mentalmente já saiu — mesmo que fisicamente ainda esteja andando pela loja. Abordagem rápida, leve e não invasiva é a intervenção de maior ROI.',
        },
      ],
    },
    {
      id: 'mod-12-lideranca',
      title: 'Liderança comercial',
      description: 'Os 4 papéis do líder de vendas, motivação intrínseca, feedback SBI, metas SMART e como construir uma cultura de alta performance.',
      duration: 28,
      content: `
<h2>Os 4 papéis do líder de vendas</h2>
<p>Líderes comerciais de elite não apenas gerenciam resultados — desenvolvem pessoas. Existem quatro papéis distintos, e o erro mais comum é ficar preso em apenas um.</p>

<h3>1. Estrategista</h3>
<p>Define onde a equipe vai, como vai chegar lá e como vai medir o progresso. Define metas, prioridades e alocação de esforço.</p>

<h3>2. Treinador (Coach)</h3>
<p>Desenvolve as habilidades individuais de cada membro. Observa atendimentos, dá feedback específico, cria planos de desenvolvimento personalizados.</p>

<h3>3. Motivador</h3>
<p>Mantém energia e comprometimento da equipe, especialmente em períodos difíceis. Reconhece publicamente, cria senso de propósito, remove obstáculos.</p>

<h3>4. Gestor operacional</h3>
<p>Garante que processos funcionem: escala, cobertura, reposição, relatórios. Necessário, mas insuficiente como único papel.</p>
<p><em>Líderes que ficam apenas no papel 4 gerenciam bem mas não desenvolvem time. O papel 2 (coach) é o mais subutilizado e o que tem maior impacto no longo prazo.</em></p>

<h2>Motivação — Daniel Pink: Drive</h2>
<p>Pink identificou 3 fatores de motivação intrínseca — que funcionam muito melhor que dinheiro e punição para tarefas que exigem criatividade e engajamento.</p>

<h3>Autonomia</h3>
<p>Pessoas se engajam mais quando têm controle sobre o próprio trabalho. Para vendedores: deixar cada um desenvolver seu estilo próprio dentro dos princípios da empresa. Não microgerenciar scripts.</p>

<h3>Maestria</h3>
<p>O desejo de ficar cada vez melhor em algo que importa. Para vendedores: criar trilhas claras de desenvolvimento, feedbacks que mostram evolução, desafios progressivos.</p>

<h3>Propósito</h3>
<p>Saber que o trabalho tem impacto além do próprio salário. Para vendedores: conectar a venda ao impacto real na vida do cliente. "Você não vende eletrônico. Você conecta pessoas a ferramentas que melhoram a vida delas."</p>
<p><em>Bônus e comissões são importantes — mas funcionam para tarefas mecânicas. Para o trabalho criativo e relacional de vender bem, autonomia + maestria + propósito são mais poderosos.</em></p>

<h2>Feedback SBI — Situação, Comportamento, Impacto</h2>
<p>O modelo mais eficaz de feedback para equipes de vendas.</p>
<table>
<tr><th>Elemento</th><th>Pergunta</th><th>Exemplo</th></tr>
<tr><td>Situação</td><td>Quando/onde aconteceu?</td><td>"Ontem, no atendimento com o cliente das 15h..."</td></tr>
<tr><td>Comportamento</td><td>O que você observou especificamente?</td><td>"...você apresentou o preço antes de terminar de mostrar os benefícios..."</td></tr>
<tr><td>Impacto</td><td>Qual foi o efeito concreto?</td><td>"...e o cliente focou só no preço, o que dificultou o fechamento."</td></tr>
</table>
<p><strong>Feedback de melhoria:</strong> "O que você acha que poderia ter feito diferente nesse momento?"</p>
<p><strong>Por que funciona:</strong> é específico (não "você precisa melhorar"), é descritivo (não julgamento), e conecta comportamento a resultado real.</p>

<h2>Metas SMART para equipes de vendas</h2>
<ul>
<li><strong>S — Específica:</strong> não "vender mais", mas "aumentar ticket médio de R$280 para R$340"</li>
<li><strong>M — Mensurável:</strong> com número e unidade claros</li>
<li><strong>A — Atingível:</strong> desafiadora mas dentro da realidade da equipe</li>
<li><strong>R — Relevante:</strong> conectada à meta maior da loja</li>
<li><strong>T — Temporal:</strong> com prazo definido (este mês, este trimestre)</li>
</ul>

<h2>Cultura de alta performance</h2>
<p>Cultura não é o que o líder fala — é o que o líder tolera.</p>
<h3>Comportamentos que definem a cultura</h3>
<ul>
<li>O que acontece quando alguém chega atrasado? (Tolerância ou consequência?)</li>
<li>O que acontece quando alguém atinge a meta? (Reconhecimento ou silêncio?)</li>
<li>O que acontece quando alguém comete um erro? (Punição ou aprendizado?)</li>
<li>O que acontece quando alguém age diferente dos valores? (Correção imediata ou nada?)</li>
</ul>
<p><em>As respostas a essas perguntas são a cultura real — não os valores no mural.</em></p>
      `,
      quiz: [
        {
          question: 'Qual dos 4 papéis do líder é mais subutilizado mas tem maior impacto no longo prazo?',
          options: [
            'Estrategista — porque define onde a equipe vai',
            'Gestor operacional — porque garante que tudo funcione',
            'Treinador (Coach) — desenvolve habilidades individuais que multiplicam resultados',
            'Motivador — porque mantém a energia da equipe',
          ],
          correct: 2,
          explanation: 'A maioria dos gerentes foca em operação (papel 4) e resultado (papel 1). O papel de coach é o que transforma vendedores medianos em vendedores de elite — mas exige tempo, observação de atendimentos e feedback específico. É o investimento de maior retorno composto.',
        },
        {
          question: 'Segundo Daniel Pink, o que motiva mais vendedores a longo prazo?',
          options: [
            'Comissões crescentes e bônus por meta batida',
            'Ranking público e competição entre vendedores',
            'Autonomia, Maestria e Propósito — motivação intrínseca',
            'Reconhecimento verbal e promoções frequentes',
          ],
          correct: 2,
          explanation: 'Pink mostrou que incentivos externos (comissão, bônus, punição) funcionam para tarefas mecânicas — mas diminuem a qualidade em tarefas criativas como vendas consultivas. Autonomia (controle sobre o próprio estilo), Maestria (crescimento visível) e Propósito (impacto real) criam engajamento sustentável.',
        },
        {
          question: 'No modelo de feedback SBI, qual é a ordem correta?',
          options: [
            'Impacto → Situação → Comportamento (do mais importante ao contexto)',
            'Situação → Comportamento → Impacto (contexto → fato → consequência)',
            'Comportamento → Impacto → Situação (o que fez → efeito → quando)',
            'Situação → Impacto → Comportamento (contexto → consequência → o que gerou)',
          ],
          correct: 1,
          explanation: 'Situação primeiro localiza o feedback no tempo e espaço — sem isso, o vendedor não sabe a que episódio você está se referindo. Comportamento é o fato observável, não interpretação. Impacto conecta o comportamento a um resultado real — que é o que muda o comportamento futuro.',
        },
        {
          question: 'O que define a cultura real de uma equipe de vendas?',
          options: [
            'Os valores escritos no manual do funcionário',
            'O que o líder fala nas reuniões de equipe',
            'O que o líder tolera — os comportamentos que ocorrem sem consequência',
            'As políticas de RH sobre performance e avaliação',
          ],
          correct: 2,
          explanation: 'Cultura é comportamento institucionalizado. O que o líder tolera é o que a equipe aprende que pode fazer. Se atraso não tem consequência, pontualidade não é valor real. Se errar é punido, ninguém vai tentar coisa nova. Cultura emerge do que o líder faz, não do que diz.',
        },
      ],
    },
    {
      id: 'mod-13-vendas-aplicadas',
      title: 'Vendas aplicadas',
      description: 'Roteiro base, estratégias de upsell por situação e os 12 princípios do vendedor de elite — o módulo final de integração.',
      duration: 30,
      content: `
<h2>O roteiro base — estrutura de um atendimento de elite</h2>
<p>Não é um script rígido. É uma sequência de intenções. O vendedor de elite sabe em que fase está e o que precisa acontecer antes de avançar.</p>

<h3>Fase 1 — Acolhimento (0-60 segundos)</h3>
<p><strong>Objetivo:</strong> criar segurança psicológica. O cliente precisa sentir que não vai ser pressionado.<br>
<strong>Como:</strong> sorriso genuíno, dar espaço, cumprimentar sem assédio.<br>
<strong>Erro:</strong> "posso ajudar?" — resposta automática é "não, obrigado".<br>
<strong>Melhor:</strong> abordagem pelo produto — "Esse aí chegou essa semana. Posso te contar algo interessante sobre ele?"</p>

<h3>Fase 2 — Descoberta (60s-3 min)</h3>
<p><strong>Objetivo:</strong> entender a necessidade real, não a declarada.<br>
<strong>Como:</strong> perguntas abertas, escuta ativa, silêncio produtivo.<br>
<strong>Chave:</strong> deixar o cliente falar mais do que você. Proporção 70-30 (cliente fala 70%).</p>

<h3>Fase 3 — Apresentação (3-8 min)</h3>
<p><strong>Objetivo:</strong> apresentar a solução certa, não todos os produtos.<br>
<strong>Como:</strong> máximo 2-3 opções, sempre conectando ao que o cliente disse na descoberta.<br>
<strong>Formato:</strong> benefício (não atributo) + prova + pergunta de validação.</p>

<h3>Fase 4 — Objeções</h3>
<p><strong>Objetivo:</strong> tratar, não contornar.<br>
<strong>Como:</strong> acolher → explorar → responder → confirmar resolução.</p>

<h3>Fase 5 — Fechamento</h3>
<p><strong>Objetivo:</strong> ajudar o cliente a tomar uma decisão que já é a certa para ele.<br>
<strong>Como:</strong> perguntas de comprometimento diretas, mas sem pressão.<br>
<strong>Sinal de compra:</strong> quando o cliente faz perguntas de detalhes (prazo, entrega, modos de pagamento) — está pronto.<br>
<strong>Fechamento direto:</strong> "Vou embalar esse para você."<br>
<strong>Fechamento alternativo:</strong> "Você prefere pagar no cartão ou à vista?"</p>

<h3>Fase 6 — Pós-venda</h3>
<p><strong>Objetivo:</strong> garantir que a experiência foi boa e abrir caminho para o retorno.<br>
<strong>Como:</strong> orientação de uso, agradecimento genuíno, convite para voltar.</p>

<h2>Estratégias de upsell por situação</h2>
<table>
<tr><th>Situação</th><th>Estratégia</th><th>Frase</th></tr>
<tr><td>Cliente escolheu versão básica</td><td>Âncora premium antes</td><td>"Tenho esse aqui [premium] que é o top da linha. Posso te mostrar a diferença?"</td></tr>
<tr><td>Cliente vai pagar e fechar</td><td>Cross-sell complementar</td><td>"Tem uma coisa que combina perfeitamente com esse..."</td></tr>
<tr><td>Cliente está animado com o produto</td><td>Garantia/proteção</td><td>"Como você vai usar muito, tem uma proteção que vale a pena..."</td></tr>
<tr><td>Cliente menciona outra pessoa</td><td>Venda adicional</td><td>"Já que você vai dar de presente, tem opções que ficam muito bem em par..."</td></tr>
<tr><td>Cliente voltou para trocar</td><td>Upgrade na troca</td><td>"Já que está trocando, esse aqui tem um diferencial que o anterior não tinha..."</td></tr>
</table>

<h2>Os 12 Princípios do Vendedor de Elite</h2>
<ol>
<li><strong>Você vende o que você é.</strong> Autenticidade gera confiança. Técnica sem caráter é manipulação.</li>
<li><strong>Pergunte mais, fale menos.</strong> Quem pergunta controla a conversa. Quem fala demais perde o fio do cliente.</li>
<li><strong>O cliente compra o resultado, não o produto.</strong> Venda o futuro que o produto possibilita, não os atributos.</li>
<li><strong>Toda objeção é uma pergunta disfarçada.</strong> Trate com curiosidade, não com medo.</li>
<li><strong>Preço nunca é o problema real.</strong> É valor percebido insuficiente. Invista em valor primeiro.</li>
<li><strong>Urgência criada, não fabricada.</strong> Urgência legítima (estoque real, promoção real) fecha. Urgência falsa destroça confiança.</li>
<li><strong>Silêncio é uma ferramenta.</strong> Depois de apresentar um produto, cale-se e deixe o cliente processar.</li>
<li><strong>Consistência bate talento no longo prazo.</strong> O vendedor que atende bem todos os dias bate o talentoso que é irregular.</li>
<li><strong>Relacionamento é ativo de longo prazo.</strong> Cada cliente que você encanta bem hoje é uma fonte de indicações futuras.</li>
<li><strong>Você é responsável pelos seus resultados.</strong> Nada de culpar a loja, o produto, o preço, o dia. O que está dentro do seu controle?</li>
<li><strong>A venda começa quando o cliente diz não.</strong> Até lá, você estava só apresentando. Resiliência é o que separa os melhores.</li>
<li><strong>Aprenda algo novo sobre vendas toda semana.</strong> O mercado muda. O cliente muda. O vendedor que para de aprender para de crescer.</li>
</ol>

<p><em>Esses 12 princípios são a síntese de tudo nessa formação. Voltará a eles sempre que precisar de norte.</em></p>
      `,
      quiz: [
        {
          question: 'Qual é a proporção ideal de fala cliente/vendedor na fase de descoberta?',
          options: [
            '50-50 — diálogo equilibrado entre as duas partes',
            'Vendedor fala 70%, cliente 30% — o vendedor guia com perguntas',
            'Cliente fala 70%, vendedor 30% — deixar o cliente revelar a necessidade real',
            'Vendedor fala 80% na descoberta para apresentar os produtos mais rápido',
          ],
          correct: 2,
          explanation: 'Na descoberta, informação é ouro. Quanto mais o cliente fala, mais você entende a necessidade real — que muitas vezes é diferente da declarada. Vendedor que fala 70% na descoberta está apresentando antes de entender, o que leva a apresentar o produto errado para a pessoa certa.',
        },
        {
          question: 'Quando o cliente faz perguntas sobre prazo de entrega e formas de pagamento, o que isso sinaliza?',
          options: [
            'Que ele ainda tem dúvidas e precisa de mais informação sobre o produto',
            'Que ele está pronto para comprar — são sinais de compra, hora de fechar',
            'Que ele está tentando negociar uma condição melhor de pagamento',
            'Que ele quer comparar com outro produto antes de decidir',
          ],
          correct: 1,
          explanation: 'Perguntas de detalhe logístico (como pago, quando chega, tem embrulho) são sinais de compra clássicos — o cliente já se imaginou com o produto e está resolvendo os detalhes práticos da compra. Esse é o momento do fechamento, não de mais apresentação.',
        },
        {
          question: 'Qual dos 12 princípios do vendedor de elite melhor resume por que preço raramente é o verdadeiro problema?',
          options: [
            '"Você vende o que você é" — autenticidade supera qualquer objeção de preço',
            '"Preço nunca é o problema real. É valor percebido insuficiente."',
            '"A venda começa quando o cliente diz não" — preço é só um tipo de objeção',
            '"Você é responsável pelos seus resultados" — se o cliente reclama de preço, é falha do vendedor',
          ],
          correct: 1,
          explanation: 'O princípio 5 sintetiza algo fundamental: se o valor percebido for maior que o preço, o preço é irrelevante. O problema não é o número — é que o cliente não consegue visualizar que o benefício vale aquele número. A solução é enriquecer o valor antes de mover no preço.',
        },
        {
          question: 'Por que urgência fabricada ("último em estoque" falso) é prejudicial mesmo quando fecha uma venda?',
          options: [
            'Porque é proibida pelo Código de Defesa do Consumidor',
            'Porque o cliente sempre descobre a mentira e pede reembolso',
            'Destrói confiança — o cliente que descobre a mentira nunca mais volta e fala mal da loja',
            'Porque gera ansiedade no cliente que pode resultar em arrependimento imediato',
          ],
          correct: 2,
          explanation: 'O princípio 6 distingue urgência legítima (real) de fabricada (manipulação). Quando o cliente descobre que "último em estoque" era falso, a percepção de toda a loja muda — foi enganado em algo pequeno, então pode ter sido enganado no resto também. Um cliente que não volta e indica outros a não voltarem custa muito mais que a venda que a mentira fechou.',
        },
      ],
    },
  ],
}
