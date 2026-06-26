import type { LmsTrilha } from './types'

export const trilha3: LmsTrilha = {
  id: 'trilha-negociacao',
  slug: 'negociacao-e-objecoes',
  title: 'Negociação e Objeções',
  description: 'Técnicas de negociação do FBI, tratamento de todas as objeções comuns e como transformar clientes difíceis em fãs.',
  icon: '🎯',
  color: '#3B82F6',
  xpReward: 400,
  lessons: [
    {
      id: 'mod-7-negociacao',
      title: 'Negociação',
      description: 'Preparação, ancoragem, concessões inteligentes, negociação ganha-ganha e as técnicas do ex-negociador do FBI Chris Voss.',
      duration: 26,
      content: `
<h2>Preparação: a batalha é ganha antes de começar</h2>
<p><em>Sun Tzu: "A batalha é ganha antes de ser travada."</em></p>

<p>Antes de qualquer negociação, defina:</p>
<ul>
<li><strong>Seu ponto ideal:</strong> o que você quer obter idealmente</li>
<li><strong>Seu BATNA:</strong> qual é o mínimo aceitável para você?</li>
<li><strong>Sua ZOPA:</strong> a zona onde o acordo é possível para ambos</li>
<li><strong>O que você está disposto a ceder</strong> e o que não está</li>
</ul>

<h3>BATNA — Best Alternative to a Negotiated Agreement</h3>
<p>É o que você vai fazer SE a negociação não fechar. Quanto melhor seu BATNA, mais poder você tem.</p>
<p>Para um vendedor de varejo, um BATNA forte significa:</p>
<ul>
<li>Outro cliente interessado no mesmo produto</li>
<li>A certeza de que o produto tem grande demanda</li>
<li>A confiança de que seu preço é justo e você não precisa descontar</li>
</ul>
<p><em>Quando você tem BATNA forte, negociação fica mais fácil porque você não "precisa" de cada venda individualmente.</em></p>

<h3>ZOPA — Zone of Possible Agreement</h3>
<p>A faixa onde vendedor e comprador conseguem fechar um acordo. Se as expectativas de ambos não se sobrepõem, não existe zona de acordo e a negociação não vai fechar.</p>

<h2>Ancoragem</h2>
<p>O primeiro número numa negociação serve de âncora para todos os números seguintes.</p>
<p><strong>Regra: sempre que possível, ancore primeiro.</strong></p>
<p>"Esse produto está R$350." → Você ancorou em 350. Agora, qualquer proposta do cliente parte de 350. Um desconto para R$320 vai parecer uma concessão generosa.</p>
<p>Se o cliente ancorar primeiro: "Quanto você me dá por R$250?" — agora a âncora é 250, e qualquer valor acima parece caro para ele.</p>

<h2>Concessões: como dar sem perder</h2>
<p><strong>Nunca conceda sem receber algo em troca.</strong> Uma concessão unilateral não tem valor percebido — o cliente acha que o preço original era mentira.</p>

<h3>Técnica da concessão condicional</h3>
<ul>
<li>"Se você fechar agora, consigo fazer R$290."</li>
<li>"Se você levar os dois, consigo melhorar o valor."</li>
<li>"Se pagar à vista, consigo ver uma condição especial."</li>
</ul>

<h3>Regras das concessões</h3>
<ul>
<li><strong>Faça concessões decrescentes:</strong> a primeira é maior, as seguintes menores. Isso sinaliza que você está chegando no limite.</li>
<li><strong>Nunca conceda na mesma velocidade do cliente:</strong> demore um pouco antes de cada concessão.</li>
<li><strong>Valorize cada concessão:</strong> "Vou ver o que posso fazer... [pausa] ...consegui R$280, mas é o máximo que consigo."</li>
</ul>

<h2>Negociação ganha-ganha (Chris Voss)</h2>
<p>Ex-negociador do FBI: <em>"A melhor negociação é aquela onde os dois lados saem sentindo que ganharam."</em></p>

<h3>Como criar valor em vez de dividir</h3>
<p>Em vez de discutir somente preço, expanda o que está em discussão:</p>
<ul>
<li>Condições de parcelamento</li>
<li>Produtos adicionais incluídos</li>
<li>Benefícios extras (embrulho, entrega, orientação de uso)</li>
<li>Prazo de pagamento</li>
</ul>
<p><em>Quando você expande as variáveis, existe mais espaço para criar valor sem sacrificar preço.</em></p>

<h2>Linguagem em negociações</h2>

<h3>Perguntas calibradas</h3>
<p>As melhores frases em negociação são perguntas abertas que começam com "como" ou "o que". Por quê são poderosas: mantêm o diálogo aberto, colocam o ônus de criar a solução no outro lado e não revelam sua posição.</p>
<ul>
<li>"Como posso fazer isso funcionar para você?"</li>
<li>"O que tornaria esse valor mais confortável para você?"</li>
<li>"Como poderíamos chegar num acordo que funcionasse pros dois lados?"</li>
</ul>

<h3>A técnica do espelho (Mirroring)</h3>
<p>Repita as últimas 2-3 palavras do que o cliente disse, com entonação curiosa. Isso faz o cliente continuar falando e revelar mais informação.</p>
<p><em>Cliente: "Achei o preço um pouco salgado..."<br>
Você: "...um pouco salgado?"<br>
Cliente: "É, porque eu vi em outro lugar por menos..."</em></p>
<p>Agora você tem a informação real: o cliente pesquisou o concorrente. Pode trabalhar com isso.</p>

<h3>Simulações</h3>
<p><strong>Situação 1 — Cliente pede preço muito abaixo:</strong></p>
<p><em>Cliente: "Você não faz por R$200?"</em></p>
<p>❌ Vendedor mediano: "Esse é o preço mesmo, não tem desconto." (fecha a porta)</p>
<p>✓ Vendedor de elite: "Posso ver o que consigo fazer. Mas antes de falar de valor, me conta — o que especificamente te fez pensar em R$200? Você viu esse produto por esse preço em outro lugar?" (descobre a âncora do cliente antes de qualquer movimento)</p>

<p><strong>Situação 2 — "Está caro":</strong></p>
<p>✓ Vendedor de elite: "Entendo. Me ajuda a entender — está caro em relação a quê? Em relação ao orçamento que você tinha em mente, ou em relação a produtos similares que você viu?" (a resposta revela se é problema de valor percebido ou de orçamento real)</p>
      `,
      quiz: [
        {
          question: 'O que é BATNA em uma negociação?',
          options: [
            'O desconto máximo que o vendedor pode oferecer',
            'A melhor alternativa disponível se a negociação não fechar',
            'A técnica de barganhar pelo melhor preço possível',
            'O preço âncora que você estabelece no início',
          ],
          correct: 1,
          explanation: 'BATNA é a Melhor Alternativa a um Acordo Negociado. Quanto melhor seu BATNA, mais poder você tem — porque você não precisa desesperadamente de cada venda. Um vendedor com BATNA forte negocia com confiança.',
        },
        {
          question: 'Por que quem ancora o preço primeiro tem vantagem na negociação?',
          options: [
            'Porque demonstra confiança e autoridade no produto',
            'O primeiro número serve de referência para tudo que vem depois — toda proposta subsequente parte daí',
            'Porque o cliente fica impressionado com a transparência',
            'Porque evita que o cliente faça uma proposta muito baixa',
          ],
          correct: 1,
          explanation: 'A âncora é psicológica — o cérebro processa o primeiro número como referência antes de qualquer análise racional. Se você ancora em R$350 e depois vai para R$320, a concessão parece generosa. Se o cliente ancora em R$250, qualquer valor acima parece caro.',
        },
        {
          question: 'Qual a regra das concessões decrescentes?',
          options: [
            'Cada desconto deve ser exatamente a metade do anterior',
            'Concessões progressivamente menores sinalizam que você está chegando no limite real',
            'A primeira concessão deve ser a mais pequena para guardar espaço para negociar',
            'Nunca fazer mais de duas concessões em uma negociação',
          ],
          correct: 1,
          explanation: 'Concessões decrescentes (ex: R$30, depois R$15, depois R$5) comunicam ao cliente que você está chegando no seu limite. Se você der concessões iguais ou crescentes, o cliente vai continuar pedindo — porque parece que você tem muito mais espaço.',
        },
        {
          question: 'O que é a técnica do espelho (mirroring) de Chris Voss?',
          options: [
            'Copiar a postura corporal do cliente para criar rapport',
            'Repetir as últimas 2-3 palavras do cliente com entonação curiosa para fazê-lo revelar mais',
            'Mostrar ao cliente o mesmo produto em versões diferentes',
            'Usar a mesma linguagem técnica do cliente para demonstrar expertise',
          ],
          correct: 1,
          explanation: 'O espelho é uma técnica de escuta ativa que faz o cliente continuar falando. Quando você repete as últimas palavras com tom de curiosidade, o cliente naturalmente expande o que disse — revelando a informação real por trás da objeção.',
        },
      ],
    },
    {
      id: 'mod-8-objecoes',
      title: 'Tratamento de objeções',
      description: 'A verdade sobre objeções, estrutura universal de resposta e respostas prontas para as 10 objeções mais comuns do varejo.',
      duration: 24,
      content: `
<h2>A verdade sobre objeções</h2>
<p><strong>Objeção não é rejeição. É pedido de mais informação.</strong></p>
<p>Quando um cliente levanta uma objeção, ele está dizendo: "Ainda não me convenceu completamente. Me dê mais."</p>
<p>O vendedor que tem medo de objeções encolhe. O vendedor de elite fica animado — porque sabe que objeção é sinal de interesse.</p>

<h2>Estrutura universal para tratamento de objeções</h2>
<p><strong>Acolha → Explore → Responda → Confirme</strong></p>
<ul>
<li><strong>Acolha:</strong> valide a objeção sem concordar com ela</li>
<li><strong>Explore:</strong> entenda a objeção real (muitas vezes não é o que parece)</li>
<li><strong>Responda:</strong> com argumento de valor, não de preço</li>
<li><strong>Confirme:</strong> verifique se a objeção foi resolvida</li>
</ul>

<h2>Objeção de preço: "Está caro"</h2>
<p>Antes de responder, entenda: é objeção de <strong>preço</strong> (o cliente não tem o dinheiro) ou de <strong>valor percebido</strong> (o cliente tem o dinheiro mas acha que não vale)?</p>

<p><strong>Se for valor percebido (mais comum):</strong><br>
"Entendo que o valor pode parecer alto. Me deixa mostrar o que está incluído nesse preço que a maioria das pessoas não sabe... Quando você olha assim, o custo por dia fica em R$0,50. Menos que um café. E você vai usar isso todos os dias por anos."</p>

<p><strong>Se for orçamento real:</strong><br>
"Entendo. Me conta — quanto você tinha em mente? [...] Dentro desse valor, tenho [opção X] que vai atender bem [necessidade principal declarada]."</p>

<p><em>Não ofereça desconto como primeira resposta. Reforce o valor primeiro.</em></p>

<h2>"Vou pensar"</h2>
<p>Esta é a objeção mais comum e a mais mal tratada. "Vou pensar" raramente significa "vou pensar". Significa:</p>
<ul>
<li>Não vi valor suficiente para decidir agora</li>
<li>Tenho medo de tomar a decisão errada</li>
<li>Quero pesquisar a concorrência</li>
<li>Me sinto pressionado e preciso de espaço</li>
</ul>

<p>❌ Resposta errada: "Claro, fique à vontade" (e o cliente some para sempre).</p>
<p>✓ Resposta de elite: "Claro, faz todo sentido querer pensar. Me conta — tem alguma coisa específica que você quer avaliar melhor? Porque se tiver alguma dúvida que eu não esclareci bem, prefiro resolver agora do que deixar você com dúvida."</p>

<p><strong>Se o cliente disser que quer pesquisar:</strong><br>
"Perfeito. Posso te contar em que você deve prestar atenção ao comparar — algumas coisas que parecem iguais têm diferenças importantes..."</p>

<h2>"Preciso falar com meu marido/minha esposa"</h2>
<p>Esta objeção tem camadas — pode ser real ou uma desculpa para não decidir.</p>
<p>✓ "Claro, imagino que vocês decidem juntos. Me conta — você já está convencida de que esse é o produto certo, e o que falta é alinhar com ele? Ou ainda tem dúvidas que eu poderia esclarecer antes?"</p>
<p>✓ Se ela está convencida: "O que ele vai querer saber? Me conta que aí você já vai chegar com os argumentos todos."</p>

<h2>"Não conheço essa marca"</h2>
<p>✓ "Entendo. É natural ter mais confiança em marcas que você já conhece. Posso te contar o que essa marca tem de diferente? [Fatos sobre a marca.] E posso te dizer que trabalho aqui há [tempo] e tenho um histórico muito positivo com essa linha — nunca tive problema de devolução por qualidade."</p>

<h2>"Não preciso disso agora"</h2>
<p>✓ "Entendo. Me conta — o que está te fazendo pensar que não precisa agora? Porque às vezes a gente posterga coisas que depois lamenta."</p>

<h2>Banco de respostas rápidas</h2>
<table>
<tr><th>Objeção</th><th>Abertura de resposta</th></tr>
<tr><td>"Está caro"</td><td>"Entendo. Me conta — caro em relação a quê?"</td></tr>
<tr><td>"Vou pensar"</td><td>"Claro. Tem alguma dúvida específica que ficou?"</td></tr>
<tr><td>"Não tenho dinheiro"</td><td>"Entendo. Quanto você tinha em mente?"</td></tr>
<tr><td>"Vi mais barato"</td><td>"Onde você viu? Me conta que posso te ajudar a comparar."</td></tr>
<tr><td>"Não gostei do modelo"</td><td>"O que especificamente não te agradou? Tenho outras opções."</td></tr>
<tr><td>"Minha esposa não vai gostar"</td><td>"O que ela costuma valorizar mais nesse tipo de produto?"</td></tr>
<tr><td>"Qualidade não presta"</td><td>"Você já usou essa marca antes ou é uma percepção geral?"</td></tr>
<tr><td>"Compro depois"</td><td>"Tem alguma razão específica pra deixar pra depois?"</td></tr>
</table>
      `,
      quiz: [
        {
          question: 'O que uma objeção realmente significa no processo de venda?',
          options: [
            'O cliente não quer comprar e você deve encerrar o atendimento',
            'O cliente está pedindo mais informação — é um sinal de interesse',
            'Você falhou na apresentação e precisa recomeçar',
            'O cliente quer desconto e está preparando a negociação',
          ],
          correct: 1,
          explanation: 'Objeção é pedido de mais informação. Um cliente que não tem interesse vai embora — não levanta objeções. O vendedor de elite fica animado com objeções porque sabe que o cliente ainda está engajado e pode ser conduzido.',
        },
        {
          question: 'Qual é a estrutura universal correta para tratar uma objeção?',
          options: [
            'Discordar → Argumentar → Fechar → Confirmar',
            'Ignorar → Redirecionar → Apresentar → Fechar',
            'Acolher → Explorar → Responder → Confirmar',
            'Validar → Descontar → Demonstrar → Fechar',
          ],
          correct: 2,
          explanation: 'Acolher valida o sentimento sem concordar. Explorar descobre a objeção real. Responder com argumento de valor ataca a causa. Confirmar fecha o loop. Pular qualquer etapa deixa a objeção não resolvida.',
        },
        {
          question: 'Quando o cliente diz "vou pensar", qual é a resposta incorreta?',
          options: [
            '"Claro, faz todo sentido querer pensar. Tem alguma dúvida específica?"',
            '"Claro, fique à vontade" — e deixar o cliente ir',
            '"Posso te contar em que pontos prestar atenção ao comparar?"',
            '"O que especificamente você quer avaliar melhor?"',
          ],
          correct: 1,
          explanation: '"Claro, fique à vontade" encerra o contato — e o cliente raramente volta. "Vou pensar" é uma objeção disfarçada. A resposta correta abre o espaço para a objeção real emergir, sem pressionar.',
        },
        {
          question: 'Qual deve ser a primeira resposta quando o cliente diz "está caro"?',
          options: [
            'Oferecer um desconto imediato para não perder a venda',
            'Mostrar um produto mais barato que o cliente possa pagar',
            'Entender se é objeção de preço (falta de dinheiro) ou de valor percebido — e reforçar o valor primeiro',
            'Explicar que o preço é justo e não tem desconto disponível',
          ],
          correct: 2,
          explanation: 'Oferecer desconto como primeira resposta é o erro mais caro que um vendedor pode cometer. Na maioria das vezes "está caro" é valor percebido insuficiente — não falta de dinheiro. Reforce o valor antes de mover no preço.',
        },
      ],
    },
    {
      id: 'mod-9-clientes-dificeis',
      title: 'Atendimento a clientes difíceis',
      description: 'A mentalidade correta, como lidar com clientes nervosos, indecisos, desconfiados, apressados e cada tipo de situação desafiadora.',
      duration: 20,
      content: `
<h2>A mentalidade correta</h2>
<p><strong>Não existe cliente difícil.</strong> Existe cliente com necessidade não atendida, expectativa frustrada, medo não reconhecido ou situação pessoal que está impactando o comportamento.</p>
<p>Quando você muda de "esse cliente é difícil" para "esse cliente está passando por algo e precisa de uma abordagem diferente", você tira o julgamento e coloca o problema — que você pode resolver.</p>

<h2>Cliente nervoso / agressivo</h2>
<p>Ele foi prejudicado (ou sente que foi). A raiva é uma resposta a uma ameaça percebida — real ou imaginada.</p>

<h3>O que NÃO fazer</h3>
<ul>
<li>Confrontar ou argumentar enquanto ele está emocional</li>
<li>Ser frio ou burocrático</li>
<li>Ficar na defensiva</li>
<li>Dizer "calma" — isso piora a situação</li>
</ul>

<h3>O que fazer</h3>
<ol>
<li><strong>Contenção emocional:</strong> deixe-o falar. Não interrompa. Não argumente. Só escute.</li>
<li><strong>Validação:</strong> reconheça o sentimento, não necessariamente o conteúdo.<br><em>"Entendo que você está muito frustrado com isso. Se eu estivesse na sua situação, também estaria."</em></li>
<li><strong>Mudança de estado:</strong> quando a emoção baixar, redirecione para a solução.<br><em>"Agora me conta exatamente o que aconteceu. Quero entender tudo para resolver da melhor forma possível."</em></li>
<li><strong>Ação:</strong> apresente uma solução concreta e rápida.</li>
</ol>

<p><em>Princípio Chris Voss: "A emoção precisa ser nomeada antes de poder ser resolvida." Nomeie o sentimento do cliente — isso ativa a parte racional do cérebro e reduz a intensidade emocional.</em></p>

<h2>Cliente indeciso</h2>
<p>Medo de tomar a decisão errada. Pode ser perfil Estável ou Analítico.</p>

<h3>O que fazer</h3>
<ul>
<li><strong>Reduza as opções:</strong> apresente no máximo duas — e recomende claramente.<br><em>"Baseado no que você me descreveu, esses dois atendem bem. Mas se eu fosse você, levaria o segundo — por [razão específica]."</em></li>
<li><strong>Reduza o risco percebido:</strong> "Qualquer problema, você pode trazer de volta — temos política de troca sem burocracia."</li>
<li><strong>Use prova social:</strong> "A maioria das pessoas que está na sua situação escolhe esse."</li>
</ul>

<h2>Cliente desconfiado</h2>
<p>Ele já foi enganado antes. A desconfiança é proteção.</p>

<h3>O que fazer</h3>
<ul>
<li><strong>Valide a desconfiança:</strong> "Faz todo sentido ser cuidadoso. Existem muitas opções no mercado e nem todas são o que prometem."</li>
<li><strong>Seja transparente:</strong> mostre limitações do produto antes que ele pergunte. Quando o vendedor aponta os pontos negativos, o cliente conclui que você é honesto.</li>
<li><strong>Use evidências:</strong> certificações, depoimentos reais, dados verificáveis.</li>
</ul>

<h2>Cliente apressado</h2>
<p>Ele tem pouco tempo. Não é hostilidade — é necessidade.</p>

<h3>O que fazer</h3>
<ul>
<li><strong>Corresponda à velocidade:</strong> "Vou direto ao ponto então: você está buscando [X], o melhor custo-benefício aqui é esse, por [razão]. Posso te mostrar em 2 minutos?"</li>
<li><strong>Facilite a decisão:</strong> "Posso embrulhar enquanto você finaliza? Assim agiliza."</li>
</ul>

<h2>Cliente que "só está dando uma olhada"</h2>
<p>Ele não quer ser pressionado. Provavelmente foi abordado de forma invasiva antes.</p>

<h3>O que fazer</h3>
<ul>
<li>Não pressione: "Claro, pode ficar à vontade."</li>
<li>Aguarde o sinal de interesse natural.</li>
<li>Engaje pelo produto: "Esse produto chegou essa semana — posso te contar uma coisa interessante sobre ele?"</li>
<li>Quando ele parar em algo: "Você parou nesse aqui por um motivo — tem alguma coisa que te chamou atenção?"</li>
</ul>

<h2>Cliente que reclama de tudo</h2>
<p>Pode ser perfil naturalmente crítico (Analítico) ou alguém que teve experiências ruins e construiu uma postura defensiva.</p>

<h3>O que fazer</h3>
<ul>
<li><strong>Escute sem defender:</strong> cada reclamação é uma percepção. Não argumente — valide.</li>
<li><strong>Use a reclamação como diferencial:</strong> "Justamente por isso esse produto funciona diferente. O que você está descrevendo é exatamente o problema que esse aqui resolve."</li>
<li><strong>Mostre que você está do lado dele:</strong> "Você está certo em ser criterioso. Deixa eu te mostrar por que esse aqui vai superar essa expectativa."</li>
</ul>

<h2>Reframe mental para cada tipo</h2>
<ul>
<li>Cliente nervoso = "Esse cliente foi prejudicado e precisa ser ouvido."</li>
<li>Cliente indeciso = "Esse cliente tem medo de errar e precisa de segurança."</li>
<li>Cliente desconfiado = "Esse cliente foi enganado antes e precisa de transparência."</li>
<li>Cliente apressado = "Esse cliente tem pouco tempo e precisa de objetividade."</li>
</ul>
      `,
      quiz: [
        {
          question: 'Qual o primeiro passo correto ao atender um cliente nervoso e agressivo?',
          options: [
            'Confrontar os argumentos incorretos com fatos e dados',
            'Chamar o gerente imediatamente para lidar com a situação',
            'Deixá-lo falar sem interromper, argumentar ou ficar na defensiva',
            'Oferecer um desconto para resolver o problema rapidamente',
          ],
          correct: 2,
          explanation: 'A emoção precisa ser escoada antes de qualquer solução. Confrontar ou argumentar com alguém em estado emocional só escala o conflito. Deixe-o falar, escute tudo, e só então valide o sentimento e redirecione para a solução.',
        },
        {
          question: 'Por que você NÃO deve dizer "calma" para um cliente nervoso?',
          options: [
            'É uma expressão muito informal para o ambiente de varejo',
            'Demonstra que você não está levando o problema a sério e piora a situação',
            'Pode ser interpretado como ameaça pelo cliente',
            'É uma técnica eficaz apenas para conflitos fora do varejo',
          ],
          correct: 1,
          explanation: '"Calma" invalida o sentimento do cliente — ele percebe que você não está levando o problema a sério, o que intensifica a frustração. A resposta correta é validar: "Entendo que você está muito frustrado. Se eu estivesse na sua situação, também estaria."',
        },
        {
          question: 'Como lidar corretamente com um cliente desconfiado?',
          options: [
            'Mostrar muitos depoimentos para provar que outros compraram sem problemas',
            'Ser excessivamente entusiasta para compensar a desconfiança',
            'Mostrar proativamente as limitações do produto — isso demonstra honestidade',
            'Pressionar sutilmente para que ele decida antes de "pesquisar muito"',
          ],
          correct: 2,
          explanation: 'Quando o vendedor aponta os pontos negativos antes que o cliente pergunte, o cliente conclui que você é honesto — desativando o "gatilho de desconfiança". A transparência é o único caminho para conquistar quem já foi enganado antes.',
        },
        {
          question: 'Qual a abordagem correta para um cliente que "só está dando uma olhada"?',
          options: [
            'Acompanhá-lo de perto para estar disponível quando ele precisar',
            'Dar espaço, aguardar o sinal de interesse natural e abordar com leveza quando ele se fixar em algo',
            'Apresentar os produtos em promoção imediatamente para despertar interesse',
            'Perguntar diretamente o que ele está procurando para ser eficiente',
          ],
          correct: 1,
          explanation: '"Só estou olhando" é um escudo contra pressão. Respeite o espaço — recue fisicamente, mantenha presença discreta. Quando ele tocar um produto ou demorar olhando, aproxime com: "Você parou nesse por um motivo — o que te chamou atenção?"',
        },
      ],
    },
  ],
}
