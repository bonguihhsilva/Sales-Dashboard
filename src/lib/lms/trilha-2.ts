import type { LmsTrilha } from './types'

export const trilha2: LmsTrilha = {
  id: 'trilha-processo',
  slug: 'processo-de-venda',
  title: 'Processo de Venda',
  description: 'Atendimento premium, o processo completo de venda e as técnicas avançadas que multiplicam resultados.',
  icon: '⚡',
  color: '#C9933A',
  xpReward: 350,
  lessons: [
    {
      id: 'mod-4-atendimento',
      title: 'Atendimento premium',
      description: 'A diferença entre satisfazer e encantar, o Efeito Pico-Final, atendimento consultivo e como construir fidelização desde o primeiro contato.',
      duration: 18,
      content: `
<h2>A diferença entre atendimento comum e excepcional</h2>
<p><strong>Atendimento comum:</strong> o cliente sai com o produto.</p>
<p><strong>Atendimento excepcional:</strong> o cliente sai com o produto E conta para alguém sobre a experiência.</p>
<p><em>Shep Hyken:</em> "O objetivo não é satisfazer o cliente. É surpreendê-lo."</p>

<h3>O modelo de experiência em três níveis</h3>
<ul>
<li><strong>Nível 1 — Mínimo esperado:</strong> produto disponível, preço correto, atendimento cordial. Se falhar aqui, o cliente reclama. Se acertar, não elogia — é o esperado.</li>
<li><strong>Nível 2 — Satisfação:</strong> você entregou bem o esperado. Cliente sai satisfeito mas não necessariamente volta.</li>
<li><strong>Nível 3 — Encantamento:</strong> você entregou algo que o cliente não esperava. <em>É aqui que se constroem clientes fiéis e indicações espontâneas.</em></li>
</ul>

<h2>O Efeito Pico-Final (Daniel Kahneman)</h2>
<p>As pessoas não se lembram de toda uma experiência — elas se lembram do <strong>pico emocional</strong> e do <strong>final</strong>.</p>

<h3>Como criar momentos de pico</h3>
<ul>
<li>Dar uma informação que o cliente não esperava e que é genuinamente útil</li>
<li>Resolver um problema que ele não pediu para você resolver</li>
<li>Fazer uma recomendação honesta que claramente não te favorece financeiramente</li>
<li>Lembrar de algo que ele mencionou em visita anterior</li>
</ul>

<h3>Como garantir um final forte</h3>
<p>O cliente vai lembrar do último momento do atendimento com a mesma intensidade dos melhores momentos. Garanta que a despedida seja:</p>
<ul>
<li><strong>Personalizada</strong> — use o nome do cliente</li>
<li><strong>Orientada para o futuro</strong> — "Qualquer dúvida, pode vir aqui ou me ligar"</li>
<li><strong>Memorável</strong> — algo que diferencia você de qualquer outro vendedor</li>
</ul>

<h2>Atendimento consultivo</h2>
<p>O atendimento consultivo é o oposto do atendimento transacional.</p>
<p><strong>Transacional:</strong> cliente chega, pergunta, você responde, ele compra ou não. Fim.</p>
<p><strong>Consultivo:</strong> você entende a situação completa, diagnostica a real necessidade, apresenta a solução ideal (que pode ser diferente do que ele pediu) e orienta sobre o uso.</p>

<h3>Passos do atendimento consultivo</h3>
<ol>
<li><strong>Diagnóstico:</strong> perguntas que revelam o contexto completo</li>
<li><strong>Escuta ativa:</strong> captura de necessidades explícitas e ocultas</li>
<li><strong>Educação:</strong> você compartilha conhecimento que o cliente não tem</li>
<li><strong>Recomendação personalizada:</strong> não "o melhor produto", mas "o melhor produto para você"</li>
<li><strong>Orientação de uso:</strong> você garante que o cliente vai usar bem o que comprou</li>
<li><strong>Follow-up:</strong> verificação de satisfação após a compra</li>
</ol>

<h2>Gestão de expectativas</h2>
<p><strong>Regra: underpromise and overdeliver.</strong> Prometer demais e entregar o esperado é pior do que prometer menos e surpreender.</p>

<p>Um cliente que descobre algo que você "esqueceu de mencionar" após a compra vai transformar a satisfação em frustração — mesmo que o produto seja bom.</p>

<h2>Hospitalidade no varejo</h2>
<p>Danny Meyer (Union Square Hospitality Group): <em>"O serviço é o que você faz tecnicamente. A hospitalidade é como a pessoa se sentiu sendo atendida por você."</em></p>

<h3>Como humanizar o atendimento</h3>
<ul>
<li>Use o nome do cliente (aprenda no início da conversa)</li>
<li>Faça perguntas genuínas sobre a vida dele</li>
<li>Compartilhe sua opinião honesta como pessoa, não como vendedor</li>
<li>Admita quando não souber algo — e busque a resposta</li>
</ul>

<h2>O momento mais crítico para a fidelização</h2>
<p>É quando algo dá errado. Como você resolve um problema determina mais a fidelidade do cliente do que uma experiência perfeita.</p>
<p><em>Um cliente que teve um problema resolvido de forma excepcional é mais fiel do que um cliente que nunca teve problemas.</em></p>
      `,
      quiz: [
        {
          question: 'O que é o Efeito Pico-Final de Daniel Kahneman aplicado ao varejo?',
          options: [
            'O efeito de mostrar o produto mais caro primeiro para ancorar o preço',
            'As pessoas se lembram do pico emocional e do final da experiência — não de toda ela',
            'O efeito de criar urgência no pico do atendimento para forçar o fechamento',
            'A técnica de encerrar a venda com um desconto surpresa',
          ],
          correct: 1,
          explanation: 'Kahneman descobriu que não lembramos de uma experiência por inteiro — lembramos do momento mais intenso e do final. Isso significa que você precisa criar pelo menos um momento de pico e garantir que a despedida seja excepcional.',
        },
        {
          question: 'Qual a diferença entre serviço e hospitalidade segundo Danny Meyer?',
          options: [
            'Serviço é para lojas físicas; hospitalidade é para e-commerce',
            'Serviço é a execução técnica perfeita; hospitalidade é como a pessoa se sentiu sendo atendida',
            'Hospitalidade é mais caro de implementar que serviço',
            'Serviço e hospitalidade são sinônimos na prática',
          ],
          correct: 1,
          explanation: 'Serviço é o que você faz — entregou o produto certo, no preço correto. Hospitalidade é como a pessoa se sentiu durante e após o atendimento. Um vendedor pode ter serviço impecável e hospitalidade zero.',
        },
        {
          question: 'Quando é o momento mais crítico para construir fidelização?',
          options: [
            'Durante a abordagem inicial — a primeira impressão é tudo',
            'No fechamento — quando o cliente decide comprar',
            'Quando algo dá errado — como você resolve problemas define a fidelidade',
            'No pós-venda imediato — o elogio da despedida',
          ],
          correct: 2,
          explanation: 'Um cliente que teve um problema resolvido de forma excepcional é mais fiel do que um cliente que nunca teve problemas. A gestão de crises é o maior diferencial de fidelização no varejo.',
        },
      ],
    },
    {
      id: 'mod-5-processo-completo',
      title: 'Processo completo de venda',
      description: 'Da preparação ao pós-venda: todas as etapas, sinais de compra, técnicas de fechamento e como transformar clientes em indicadores.',
      duration: 30,
      content: `
<h2>A estrutura do processo</h2>
<p>A venda tem etapas. Pular etapas é o erro mais comum que leva ao travamento da venda ou à perda do cliente.</p>
<p><strong>Preparação → Abordagem → Quebra de Gelo → Investigação → Apresentação → Demonstração → Negociação → Fechamento → Pós-venda → Indicação</strong></p>

<h2>Preparação</h2>
<p>A maioria dos vendedores ignora essa etapa. Os melhores não.</p>
<ul>
<li><strong>Conhecimento dos produtos:</strong> saiba de cor as especificações, diferenciais e limitações de tudo que você vende.</li>
<li><strong>Conhecimento dos concorrentes:</strong> o cliente provavelmente pesquisou na internet. Você também precisa saber — para comparar com honestidade.</li>
<li><strong>Estado mental:</strong> vendedor desmotivado transmite energia negativa. O cliente sente.</li>
</ul>

<h2>Abordagem</h2>
<p>A abordagem define o tom de todo o atendimento. Uma abordagem errada coloca o cliente na defensiva.</p>

<h3>Erros fatais de abordagem</h3>
<ul>
<li>"Posso te ajudar?" — resposta automática: "não, obrigado."</li>
<li>Abordagem imediata demais — o cliente entrou há 10 segundos. O cérebro reptiliano ativa: perigo, pressão.</li>
<li>Ausência total — o cliente está esperando por atenção e ninguém aparece.</li>
</ul>

<h3>A abordagem de elite</h3>
<ul>
<li><strong>Cliente com objetivo definido:</strong> "Boa tarde! Pode me dizer o que está buscando que vou te levar direto."</li>
<li><strong>Cliente explorando:</strong> "Boa tarde, seja bem-vindo! Pode olhar à vontade. Qualquer dúvida, estou aqui." (aguarde o momento certo)</li>
<li><strong>Cliente que já conhece a loja:</strong> "Oi, voltou! Tem alguma coisa específica hoje ou está dando uma olhada?"</li>
</ul>

<h2>Investigação (diagnóstico)</h2>
<p><strong>Esta é a etapa mais importante do processo.</strong> O vendedor que mais vende não é o que mais fala — é o que mais pergunta e melhor escuta.</p>

<h3>O que você precisa descobrir</h3>
<ul>
<li>Contexto: qual é a situação atual do cliente?</li>
<li>Necessidade real: o que ele precisa (pode ser diferente do que pediu)?</li>
<li>Critérios de decisão: o que é mais importante para ele?</li>
<li>Experiências anteriores: o que já usou? O que não funcionou?</li>
<li>Urgência: para quando precisa?</li>
<li>Quem decide: ele decide sozinho ou precisa consultar alguém?</li>
</ul>

<h3>Perguntas poderosas de investigação</h3>
<ul>
<li>"Você já usou algo similar antes? Como foi a experiência?"</li>
<li>"O que é mais importante pra você nessa compra — preço, qualidade, durabilidade?"</li>
<li>"Seria pra você ou pra presentear?"</li>
<li>"Tem alguma coisa que você definitivamente quer evitar?"</li>
</ul>

<h2>Apresentação da solução</h2>
<p>Após a investigação, você tem o mapa do cliente. Apresente a solução — não o produto.</p>

<h3>Estrutura da apresentação perfeita</h3>
<ol>
<li><strong>Conexão com o diagnóstico:</strong> "Baseado no que você me contou..."</li>
<li><strong>Apresentação do produto</strong></li>
<li><strong>Características → Benefícios:</strong> para cada característica relevante, o benefício para aquele cliente específico</li>
<li><strong>Provas:</strong> depoimentos, dados, certificações</li>
<li><strong>Validação:</strong> "Faz sentido com o que você está buscando?"</li>
</ol>

<h2>Demonstração do produto</h2>
<p>Se existe a possibilidade de o cliente experimentar o produto, use isso. A demonstração ativa o Efeito de Dotação.</p>
<ul>
<li>Entregue o produto na mão do cliente</li>
<li>Oriente o uso durante a demonstração</li>
<li>Aponte o que o cliente deve observar</li>
<li>Use perguntas durante: "Sentiu a diferença no peso?"</li>
</ul>

<h2>Sinais de compra (quando fechar)</h2>
<ul>
<li>Perguntas sobre logística: "Tem entrega?", "Posso parcelar?"</li>
<li>Visualização do uso: "Daria pra usar com aquela outra peça minha..."</li>
<li>Segura o produto sem largar</li>
<li>Pergunta sobre garantia</li>
<li>Concorda com tudo que você apresenta</li>
</ul>

<h2>Técnicas de fechamento</h2>
<ul>
<li><strong>Fechamento direto:</strong> "Posso separar esse pra você?"</li>
<li><strong>Fechamento alternativo:</strong> "Você prefere levar em 3x ou pagar à vista?" (pressupõe que vai levar)</li>
<li><strong>Fechamento por urgência real:</strong> "Esse modelo tem só dois em estoque. Se quiser garantir, é melhor decidir agora."</li>
<li><strong>Fechamento resumo:</strong> resume os benefícios e pergunta: "Está de acordo com o que você estava buscando?"</li>
<li><strong>Fechamento condicional:</strong> "Se eu conseguir essa condição de parcelamento, a gente fecha?"</li>
</ul>

<h2>Pós-venda</h2>
<p>A maioria dos vendedores encerra o atendimento quando o cliente paga. O vendedor de elite começa o relacionamento.</p>
<ul>
<li>Confirme a decisão: "Você vai adorar — escolheu muito bem."</li>
<li>Oriente o uso: "Uma coisa importante: na primeira lavagem, coloque em água fria..."</li>
<li>Informe sobre garantia e suporte</li>
<li>Plante o retorno: "Quando você vir o resultado, me conta!"</li>
<li>Abra a indicação: "Se você gostar e tiver amigos que precisam de algo similar, pode mandar aqui."</li>
</ul>

<h2>Indicação: o mais valioso canal de venda</h2>
<p>Clientes indicados convertem 30% mais que clientes frios e têm Lifetime Value 16% maior.</p>
<p><em>Como solicitar naturalmente (após o pós-venda, quando o cliente está em alto nível de satisfação):</em></p>
<p>"Fico feliz que tenha gostado! Você conhece alguém que também poderia se beneficiar de algo assim? Seria um prazer atendê-lo."</p>
      `,
      quiz: [
        {
          question: 'Por que "Posso te ajudar?" é considerado um erro fatal de abordagem?',
          options: [
            'É muito informal para o ambiente de varejo',
            'A resposta automática do cérebro do cliente é "não, obrigado" — a frase condicionou uma recusa',
            'Demonstra insegurança por parte do vendedor',
            'É muito genérica e não inicia uma conversa de venda',
          ],
          correct: 1,
          explanation: 'Os clientes são condicionados a responder "não, obrigado" automaticamente. Essa frase fecha a conversa antes de começar. A abordagem de elite abre um espaço diferente e mais natural para o diálogo.',
        },
        {
          question: 'Qual é a etapa mais importante do processo completo de venda?',
          options: [
            'A abordagem — a primeira impressão define tudo',
            'O fechamento — é onde a venda acontece de fato',
            'A investigação (diagnóstico) — quanto mais você sabe do cliente, mais certeira é a recomendação',
            'A apresentação do produto — é onde você demonstra seu conhecimento',
          ],
          correct: 2,
          explanation: 'O vendedor que mais vende não é o que mais fala — é o que mais pergunta e melhor escuta. Uma apresentação personalizada só é possível depois de uma investigação completa. Pular o diagnóstico é apresentar o produto errado para o cliente certo.',
        },
        {
          question: 'O que é o fechamento alternativo e por que é eficaz?',
          options: [
            'Oferecer dois descontos diferentes para o cliente escolher',
            'Perguntar se o cliente prefere uma forma de pagamento ou outra — pressupondo que já vai levar',
            'Apresentar dois produtos diferentes e deixar o cliente decidir qual é melhor',
            'Alternar entre argumentos emocionais e racionais no fechamento',
          ],
          correct: 1,
          explanation: 'O fechamento alternativo ("você prefere em 3x ou à vista?") pressupõe a compra — a decisão que o cliente precisa tomar é só sobre a forma, não sobre se vai comprar. Isso reduz a resistência psicológica da decisão.',
        },
        {
          question: 'Qual é o sinal mais claro de que o cliente está prestes a comprar?',
          options: [
            'Ele para de fazer objeções',
            'Ele começa a fazer perguntas sobre logística como entrega e parcelamento',
            'Ele fica em silêncio depois da apresentação',
            'Ele pede um desconto',
          ],
          correct: 1,
          explanation: 'Quando o cliente pergunta sobre logística (entrega, prazo, parcelamento), ele já decidiu na cabeça que quer o produto. Está apenas verificando os detalhes práticos. Esse é o momento de facilitar — não de continuar argumentando.',
        },
      ],
    },
    {
      id: 'mod-6-tecnicas-avancadas',
      title: 'Técnicas avançadas de venda',
      description: 'SPIN Selling, Challenger Sale, Solution Selling, AIDA, venda por valor e estratégias de upsell e cross-sell.',
      duration: 28,
      content: `
<h2>SPIN Selling (Neil Rackham)</h2>
<p>A metodologia mais testada do mundo — 35.000 transações em 27 países. Os melhores vendedores fazem perguntas em uma sequência específica:</p>

<ul>
<li><strong>S — Situação:</strong> levanta informações sobre o contexto.<br><em>"Você já usa algum produto similar? Com que frequência vai usar?"</em></li>
<li><strong>P — Problema:</strong> revela dificuldades e insatisfações.<br><em>"O que você acha que poderia ser melhor no que usa hoje? Alguma vez já teve problema com [categoria]?"</em></li>
<li><strong>I — Implicação:</strong> expande o problema, mostra suas consequências.<br><em>"E quando esse problema acontece, qual é o impacto no seu dia a dia? Você calcula quanto isso te custa?"</em></li>
<li><strong>N — Necessidade de Solução:</strong> faz o cliente verbalizar os benefícios que quer.<br><em>"O que seria ideal pra você? Se você pudesse resolver isso de uma vez, como seria?"</em></li>
</ul>

<p><em>Quando usar:</em> em vendas de maior valor onde o cliente ainda não reconhece a extensão do problema.</p>

<h2>Challenger Sale (Matthew Dixon e Brent Adamson)</h2>
<p>Pesquisa da CEB com 6.000 vendedores identificou que os melhores não são os mais relacionais — são os <strong>Challengers: vendem ensinando algo que o cliente não sabe.</strong></p>

<h3>Os três pilares</h3>
<ol>
<li><strong>Ensinar:</strong> compartilhe um insight que o cliente não tem e que muda como ele vê o problema.</li>
<li><strong>Adaptar:</strong> personalize a mensagem para o contexto específico do cliente.</li>
<li><strong>Assumir o controle:</strong> não tenha medo de direcionar a conversa.</li>
</ol>

<p><em>No varejo:</em> "Posso te contar algo que a maioria das pessoas não sabe sobre esse tipo de produto? A maioria compra focando no preço e depois gasta o dobro em manutenção. O que eu recomendo é avaliar assim..."</p>
<p>Você educou, se diferenciou e assumiu o papel de autoridade — tudo em uma frase.</p>

<h2>AIDA — a jornada de compra</h2>
<p>Modelo clássico que mapeia o caminho do cliente:</p>
<ul>
<li><strong>A — Atenção:</strong> o cliente nota você e o produto</li>
<li><strong>I — Interesse:</strong> o cliente quer saber mais</li>
<li><strong>D — Desejo:</strong> o cliente quer ter o produto</li>
<li><strong>A — Ação:</strong> o cliente compra</li>
</ul>
<p>Se travar em alguma fase, identifique onde e aplique a técnica correta.</p>

<h2>Venda por Valor (Value Selling)</h2>
<p>Toda negociação de preço é uma negociação de valor percebido.</p>

<h3>Fórmula</h3>
<ul>
<li>Valor percebido > Preço = venda fácil</li>
<li>Valor percebido = Preço = venda possível</li>
<li>Valor percebido &lt; Preço = sem desconto não fecha</li>
</ul>

<p><strong>Aumentar o valor percebido é infinitamente mais eficaz do que baixar o preço.</strong></p>

<h3>Como calcular e apresentar valor</h3>
<ul>
<li><strong>Custo por dia:</strong> R$300 ÷ 3 anos ÷ 365 dias = R$0,27/dia</li>
<li><strong>Custo comparativo:</strong> R$300 de uma vez vs. R$150 de um inferior que dura 1 ano = mais barato pagar o dobro uma vez</li>
<li><strong>Custo de não comprar:</strong> quanto vai custar o problema não resolvido?</li>
</ul>

<h2>Upsell e Cross-sell</h2>

<h3>Upsell — versão superior</h3>
<p><strong>Regra de ouro:</strong> só faça sentido se o produto superior genuinamente atende melhor às necessidades declaradas do cliente.</p>
<p><em>"Você mencionou que vai usar com frequência. Nesse caso, o modelo superior tem a sola reforçada que vai durar o dobro do tempo — por apenas R$80 a mais. Para o uso que você descreveu, vale muito a pena."</em></p>

<h3>Cross-sell — produto complementar</h3>
<p><strong>Regra de ouro:</strong> apresente quando o produto complementar agrega valor real, não para bater meta.</p>
<p><em>"Já que você vai levar esse, um item que faz toda diferença junto é [produto X] — porque [benefício concreto]. Tem clientes que compram os dois sempre juntos por isso."</em></p>

<h3>Estratégias de upsell por situação</h3>
<ul>
<li><strong>Cliente escolheu o produto mais barato:</strong> "Esse aqui funciona muito bem. Mas por R$[X] a mais, o modelo acima tem [diferencial relevante]. Para o uso que você mencionou, pode valer muito a pena."</li>
<li><strong>Cliente já decidiu e está satisfeito:</strong> "Perfeito! Antes de ir, posso te mostrar uma coisa que complementa muito bem esse?"</li>
<li><strong>Cliente em dúvida entre dois:</strong> "Os dois são ótimos. A diferença principal é [diferencial real]. Se for usar [situação A], o superior vale. Se for [situação B], o básico resolve."</li>
</ul>

<h2>Geração de desejo antes do fechamento</h2>
<p>Entre a demonstração e o fechamento existe um momento crítico onde você precisa amplificar o desejo.</p>

<h3>Técnicas</h3>
<ul>
<li><strong>Visualização futura:</strong> "Imagina você chegando na reunião com essa pasta — transmite exatamente o profissionalismo que você descreveu querer."</li>
<li><strong>Contraste:</strong> "O que você está usando hoje tem [problema X]. Com esse, você vai ter [benefício Y] todo dia."</li>
<li><strong>Custo da inação:</strong> "Você vai continuar com esse problema por mais tempo. Esse produto resolve isso de uma vez."</li>
</ul>
      `,
      quiz: [
        {
          question: 'O que significa a sigla SPIN em SPIN Selling?',
          options: [
            'Serviço, Produto, Interesse, Negociação',
            'Situação, Problema, Implicação, Necessidade de Solução',
            'Sintonia, Pergunta, Investigação, Negociação',
            'Sondagem, Produto, Informação, Nota',
          ],
          correct: 1,
          explanation: 'SPIN é uma metodologia baseada em 35.000 transações. As perguntas de Situação e Problema revelam o contexto; as de Implicação expandem o problema; as de Necessidade de Solução fazem o cliente verbalizar os benefícios que quer — preparando o terreno para a apresentação.',
        },
        {
          question: 'O que diferencia o Challenger Sale de uma abordagem relacional tradicional?',
          options: [
            'O Challenger foca em construir amizade com o cliente antes de vender',
            'O Challenger vende ensinando algo que o cliente não sabe, assumindo o controle da conversa',
            'O Challenger usa mais desconto para compensar a falta de relacionamento',
            'O Challenger evita objeções sendo sempre concordante',
          ],
          correct: 1,
          explanation: 'Pesquisa com 6.000 vendedores mostrou que os de maior performance não são os mais relacionais — são os que ensinam algo novo ao cliente, adaptam a mensagem ao contexto e assumem o controle da conversa. Isso cria autoridade e diferencia do concorrente.',
        },
        {
          question: 'Como calcular o custo por dia de um produto de R$300 que dura 3 anos?',
          options: [
            'R$300 ÷ 36 meses = R$8,33/mês',
            'R$300 ÷ 3 anos = R$100/ano',
            'R$300 ÷ 3 ÷ 365 = R$0,27/dia',
            'R$300 ÷ 12 meses = R$25/mês',
          ],
          correct: 2,
          explanation: 'R$0,27 por dia é um argumento de valor muito mais poderoso do que R$300 de uma vez. Menos que um café. Essa técnica transforma um preço que parece alto em algo que parece acessível — aumentando o valor percebido sem mover no preço.',
        },
        {
          question: 'Qual a regra de ouro para fazer upsell corretamente?',
          options: [
            'Sempre oferecer o produto mais caro, independentemente da situação',
            'Só fazer upsell no final do atendimento, depois do fechamento',
            'Só fazer upsell se o produto superior genuinamente atende melhor às necessidades declaradas do cliente',
            'Oferecer upsell com desconto para parecer mais atrativo',
          ],
          correct: 2,
          explanation: 'Upsell sem relação com o que o cliente declarou como necessidade é empurrar produto. O upsell legítimo parte das necessidades que o cliente verbalizou e mostra como a versão superior atende melhor a essas necessidades específicas.',
        },
      ],
    },
  ],
}
