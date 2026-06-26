import type { LmsTrilha } from './types'

export const trilha1: LmsTrilha = {
  id: 'trilha-fundamentos',
  slug: 'fundamentos-de-vendas',
  title: 'Fundamentos de Vendas',
  description: 'Mentalidade, psicologia do consumidor e comunicação de alto nível — a base que diferencia vendedores comuns de elite.',
  icon: '🧠',
  color: '#7C3AED',
  xpReward: 300,
  lessons: [
    {
      id: 'mod-1-fundamentos',
      title: 'O que realmente é vender',
      description: 'A definição que a maioria nunca ouviu, como as pessoas tomam decisões e os 8 gatilhos mentais fundamentais.',
      duration: 25,
      content: `
<h2>O que realmente é vender</h2>

<p>Vender não é convencer alguém a comprar algo. <strong>Vender é ajudar uma pessoa a tomar a melhor decisão para ela</strong> — e quando essa decisão envolve seu produto, a venda acontece naturalmente.</p>

<p><em>Zig Ziglar:</em> "Você pode ter tudo na vida que quiser, se ajudar outras pessoas suficientes a conseguir o que elas querem."</p>

<h3>O vendedor como médico</h3>
<p>Pense num médico de confiança. Ele não entra no consultório dizendo: "Tenho um remédio ótimo aqui, você precisa comprar." Ele escuta, faz perguntas, diagnostica e só então prescreve. O vendedor de elite faz exatamente isso. A venda é a prescrição. O produto é o remédio.</p>

<h3>O que separa vendedores comuns de vendedores de elite</h3>
<table>
<tr><th>Vendedor Comum</th><th>Vendedor de Elite</th></tr>
<tr><td>Fala 80% do tempo</td><td>Escuta 70% do tempo</td></tr>
<tr><td>Vende produtos</td><td>Vende resultados</td></tr>
<tr><td>Reage ao cliente</td><td>Conduz o cliente</td></tr>
<tr><td>Teme objeções</td><td>Usa objeções a favor</td></tr>
<tr><td>Foca no preço</td><td>Foca no valor</td></tr>
<tr><td>Fecha uma venda</td><td>Abre um relacionamento</td></tr>
</table>

<h2>Como as pessoas tomam decisões</h2>
<p>Em 1994, o neurocientista António Damásio estudou pacientes com danos na área emocional do cérebro. Resultado: essas pessoas eram incapazes de tomar decisões simples. <strong>Conclusão: sem emoção, não há decisão.</strong></p>

<h3>O modelo dos três cérebros</h3>
<ul>
<li><strong>Cérebro Reptiliano (instintivo):</strong> controla sobrevivência e medo. Pergunta: "Isso é seguro? Posso confiar?"</li>
<li><strong>Cérebro Límbico (emocional):</strong> controla sentimentos e memórias. Pergunta: "Como isso me faz sentir?" — <em>É aqui que as decisões de compra são tomadas.</em></li>
<li><strong>Neocórtex (racional):</strong> controla lógica e análise. Pergunta: "Isso faz sentido?" — <em>Justifica a decisão, não a toma.</em></li>
</ul>

<p><strong>Implicação prática:</strong> Se você atacar só o racional (preço, especificações técnicas), está falando com o departamento errado.</p>

<h2>Por que as pessoas compram de verdade</h2>
<p>Pessoas não compram produtos. Compram:</p>
<ul>
<li>Versões melhores de si mesmas</li>
<li>Solução para uma dor</li>
<li>Satisfação de um desejo</li>
<li>Status social</li>
<li>Segurança e pertencimento</li>
<li>Experiências e memórias</li>
</ul>

<p><strong>Exemplo:</strong> Um homem não compra uma camisa social. Compra confiança para uma entrevista de emprego. Quando você entende o que o cliente está realmente comprando, sua linguagem muda completamente.</p>

<h3>A equação real da compra</h3>
<p><em>Emoção desperta o desejo → Lógica justifica a decisão → Ação (compra)</em></p>

<p>O erro mais comum: atacar a lógica antes de despertar a emoção.</p>

<p><strong>Estudo de caso — Apple vs. Mercado (2001):</strong> Todos vendiam "1GB de armazenamento". A Apple lançou o iPod com: "1.000 músicas no seu bolso." Mesma informação. A Apple ativou a emoção.</p>

<h2>Os 8 gatilhos mentais fundamentais</h2>

<h3>1. Reciprocidade</h3>
<p>Quando alguém nos dá algo, sentimos obrigação de retribuir. <em>No varejo: ofereça informação útil antes de pedir a compra.</em></p>

<h3>2. Autoridade</h3>
<p>Seguimos pessoas que percebemos como especialistas. <em>No varejo: demonstre conhecimento profundo dos produtos.</em></p>

<h3>3. Prova Social</h3>
<p>Quando não sabemos o que fazer, olhamos o que outros fazem. <em>Exemplo: "Esse modelo é disparado o mais vendido — saímos com mais de 30 por semana."</em></p>

<h3>4. Escassez</h3>
<p>Valorizamos mais o que é raro ou pode acabar. <strong>Regra de ouro: só use escassez real.</strong> Escassez falsa é manipulação — e você perde a confiança para sempre.</p>

<h3>5. Afinidade</h3>
<p>Compramos de pessoas que gostamos. <em>Encontre pontos em comum. Elogie escolhas, não a pessoa.</em></p>

<h3>6. Consistência</h3>
<p>Queremos ser coerentes com o que dissemos antes. <em>Pequenos "sins" ao longo do atendimento constroem momentum para o grande "sim".</em></p>

<h3>7. Ancoragem</h3>
<p>O primeiro número que ouvimos serve de referência para tudo que vem depois. <em>Mostre sempre o produto mais caro primeiro.</em></p>

<h3>8. Percepção de Valor</h3>
<p><strong>Preço é o que o cliente paga. Valor é o que ele percebe que está recebendo.</strong> A venda trava quando o preço supera o valor percebido. Sua função é aumentar o valor percebido até superar o preço.</p>

<h2>Confiança: o ativo mais importante</h2>
<p>Antes de comprar qualquer produto, o cliente compra você. Os quatro pilares:</p>
<ol>
<li>Competência — você sabe do que está falando</li>
<li>Honestidade — você fala a verdade mesmo quando prejudica a venda</li>
<li>Intenção — o cliente percebe que você está a favor dele</li>
<li>Consistência — você age da mesma forma sempre</li>
</ol>

<h2>Persuasão ética vs. manipulação</h2>
<p><strong>Persuasão:</strong> apresenta informações verdadeiras, ativa emoções legítimas e conduz o cliente a uma decisão boa para ele.</p>
<p><strong>Manipulação:</strong> distorce, omite, pressiona ou cria urgência falsa para que o cliente tome uma decisão que serve a você, não a ele.</p>
<p><em>Regra de ouro: após a compra, o cliente deve se sentir ainda melhor do que antes.</em></p>
      `,
      quiz: [
        {
          question: 'Qual definição melhor descreve o que é vender?',
          options: [
            'Convencer alguém a comprar um produto',
            'Ajudar uma pessoa a tomar a melhor decisão para ela',
            'Apresentar todas as características do produto',
            'Fechar o maior número de transações possível',
          ],
          correct: 1,
          explanation: 'Vender é ajudar — quando você internaliza isso, para de empurrar produto e começa a resolver problemas. Essa mudança de mentalidade é responsável por 80% do salto de performance dos melhores vendedores.',
        },
        {
          question: 'Onde acontece a decisão de compra, segundo o modelo dos três cérebros?',
          options: [
            'No neocórtex — que analisa o custo-benefício',
            'No cérebro reptiliano — que garante a segurança',
            'No cérebro límbico — que controla sentimentos e emoções',
            'Nos três cérebros ao mesmo tempo',
          ],
          correct: 2,
          explanation: 'O cérebro límbico toma a decisão. O neocórtex apenas justifica depois. Por isso atacar só o racional (preço, especificações) é falar com o departamento errado.',
        },
        {
          question: 'Qual a equação correta da compra?',
          options: [
            'Lógica → Emoção → Ação',
            'Ação → Emoção → Lógica',
            'Emoção → Lógica → Ação',
            'Lógica → Ação → Emoção',
          ],
          correct: 2,
          explanation: 'A emoção desperta o desejo, a lógica justifica a decisão, e então o cliente age. Apresentar especificações técnicas antes de despertar a emoção faz o cliente usar a lógica para resistir, não para comprar.',
        },
        {
          question: 'O que é percepção de valor no contexto de vendas?',
          options: [
            'O preço justo que o cliente está disposto a pagar',
            'O que o cliente percebe que está recebendo em relação ao preço',
            'A qualidade objetiva do produto comparada à concorrência',
            'O desconto máximo que pode ser oferecido',
          ],
          correct: 1,
          explanation: 'Preço é o que o cliente paga. Valor é o que ele percebe que está recebendo. A venda trava quando o preço supera o valor percebido — sua função é aumentar esse valor percebido.',
        },
        {
          question: 'Qual a diferença entre persuasão ética e manipulação?',
          options: [
            'Persuasão usa emoção; manipulação usa lógica',
            'Persuasão conduz a uma decisão boa para o cliente; manipulação serve ao vendedor',
            'Persuasão é mais rápida; manipulação é mais eficaz',
            'Não há diferença — ambas buscam fechar a venda',
          ],
          correct: 1,
          explanation: 'Persuasão ética conduz o cliente a uma decisão genuinamente boa para ele. Manipulação distorce, omite ou pressiona para servir ao vendedor. Vendedores manipuladores fecham vendas no curto prazo mas acumulam estornos, reclamações e zero fidelização.',
        },
      ],
    },
    {
      id: 'mod-2-psicologia',
      title: 'Psicologia do consumidor',
      description: 'Perfis de clientes, linguagem corporal, vieses cognitivos e como identificar o que cada pessoa realmente precisa.',
      duration: 22,
      content: `
<h2>Comportamento humano nas compras</h2>
<p>Todo comportamento humano tem uma causa. O vendedor de elite é, antes de tudo, um estudante do comportamento humano — não por frieza, mas porque entender pessoas é o único caminho para genuinamente ajudá-las.</p>

<h3>A Hierarquia de Maslow aplicada ao varejo</h3>
<ul>
<li><strong>Necessidades Fisiológicas:</strong> produtos essenciais. Argumento: funcionalidade, durabilidade, custo-benefício.</li>
<li><strong>Necessidades de Segurança:</strong> garantias, proteção. Argumento: garantia estendida, reputação da marca.</li>
<li><strong>Necessidades Sociais:</strong> moda, presentes. Argumento: o que outras pessoas usam, tendências.</li>
<li><strong>Necessidades de Estima:</strong> marcas premium, exclusividade. Argumento: diferenciação, qualidade superior.</li>
<li><strong>Autorrealização:</strong> produtos de alto desempenho. Argumento: potencial desbloqueado, evolução pessoal.</li>
</ul>

<h2>Os quatro perfis de clientes</h2>

<h3>Perfil 1 — O Dominante</h3>
<p>Fala rápido, quer eficiência, toma decisões rapidamente, foca em resultados, pode parecer impaciente.</p>
<p><strong>Como atender:</strong> seja direto e objetivo. Apresente fatos e resultados. Não seja servil — ele respeita quem tem postura.</p>
<p><em>Exemplo: "Vou direto ao ponto: esse modelo tem o melhor custo-benefício da categoria por esses três motivos..."</em></p>
<p><strong>Erros a evitar:</strong> enrolar, ser excessivamente informal, não ter respostas na ponta da língua.</p>

<h3>Perfil 2 — O Influenciador</h3>
<p>Extrovertido, comunicativo, decide pela emoção e intuição, influenciado por tendências e popularidade.</p>
<p><strong>Como atender:</strong> seja caloroso e energético. Use histórias de outros clientes. Fale sobre tendências.</p>
<p><em>Exemplo: "Que ótima escolha — todo mundo que vê fica apaixonado. Você tem muito bom gosto..."</em></p>
<p><strong>Erros a evitar:</strong> ser frio ou excessivamente técnico, não mostrar entusiasmo.</p>

<h3>Perfil 3 — O Estável</h3>
<p>Calmo, gentil, prefere relacionamentos de longo prazo, decide devagar, precisa de segurança e validação.</p>
<p><strong>Como atender:</strong> seja paciente. Mostre garantias e suporte pós-venda. Nunca apresse a decisão.</p>
<p><em>Exemplo: "Pode ficar à vontade, sem pressa. Vou te mostrar as opções e a gente vai encontrar o que faz mais sentido pra você."</em></p>
<p><strong>Erros a evitar:</strong> pressionar para fechar rápido, dar muitas opções de uma vez.</p>

<h3>Perfil 4 — O Analítico</h3>
<p>Pesquisa antes de comprar, quer dados e comparações, decide devagar com muita análise, desconfia de argumentos emocionais.</p>
<p><strong>Como atender:</strong> tenha informações técnicas precisas. Mostre comparativos e certificações. Nunca apresse.</p>
<p><em>Exemplo: "Posso te mostrar uma comparação técnica entre esses dois modelos? Vou explicar o que cada especificação significa na prática..."</em></p>
<p><strong>Erros a evitar:</strong> exagerar ou generalizar, responder com imprecisão.</p>

<h2>Como identificar o perfil em 30-60 segundos</h2>
<ul>
<li><strong>Velocidade de movimento:</strong> rápido (Dominante/Influenciador) ou lento (Estável/Analítico)</li>
<li><strong>O que toca primeiro:</strong> lê etiqueta técnica (Analítico), olha o visual (Influenciador), verifica preço (Analítico/Estável)</li>
<li><strong>Como responde à abordagem:</strong> direto = Dominante; animado = Influenciador; sorridente mas tímido = Estável; pergunta técnica imediata = Analítico</li>
</ul>

<h2>Linguagem corporal</h2>
<p>Albert Mehrabian (UCLA): 55% do impacto vem da linguagem corporal, 38% do tom de voz, 7% das palavras.</p>

<h3>Sinais de interesse positivo</h3>
<ul>
<li>Inclina o corpo em direção ao produto</li>
<li>Pega o produto nas mãos e examina</li>
<li>Faz perguntas (qualquer pergunta é sinal de interesse)</li>
<li>Toca o produto com carinho</li>
</ul>

<h3>Sinais de decisão iminente</h3>
<ul>
<li>Para de comparar e foca em um produto</li>
<li>Pergunta sobre logística ("tem entrega?", "posso parcelar?")</li>
<li>Visualiza o uso ("eu podia usar aqui...")</li>
<li>Segura o produto sem querer largar</li>
</ul>

<h2>Vieses cognitivos aplicados ao varejo</h2>

<h3>Efeito de Dotação</h3>
<p>Valorizamos mais o que sentimos que já é nosso. <em>Deixe o cliente pegar o produto nas mãos — quanto mais ele "possuir" mentalmente, mais vai valorizar.</em></p>

<h3>Paradoxo da Escolha</h3>
<p>Mais opções = mais dificuldade de decidir = menos vendas. <em>Não mostre 12 opções. Mostre 2 ou 3 e guie a escolha.</em></p>

<h3>Efeito Halo</h3>
<p>Uma característica positiva faz a pessoa assumir que outras também são positivas. <em>Destaque o principal diferencial primeiro.</em></p>

<h3>Aversão à Perda</h3>
<p>Perder algo dói mais do que ganhar algo equivalente agrada. <em>Em vez de "você vai ganhar X", use "você vai evitar perder X".</em></p>

<h3>Enquadramento</h3>
<p>"5% de chance de dar errado" vs. "95% de chance de dar certo" — mesma estatística, percepções opostas. <em>Sempre enquadre positivamente.</em></p>
      `,
      quiz: [
        {
          question: 'Qual perfil de cliente fala rápido, decide rapidamente e quer eficiência acima de tudo?',
          options: ['O Influenciador', 'O Estável', 'O Dominante', 'O Analítico'],
          correct: 2,
          explanation: 'O Dominante foca em resultados, não em relacionamento. Quer que você vá direto ao ponto. Errar com esse perfil sendo informal ou enrolando faz você perder autoridade imediatamente.',
        },
        {
          question: 'Como atender corretamente um cliente Analítico?',
          options: [
            'Ser caloroso e usar muitas histórias de outros clientes',
            'Ir direto ao ponto e apresentar só o produto mais caro',
            'Apresentar dados, especificações técnicas precisas e não pressionar a decisão',
            'Criar urgência com estoque limitado para forçar a decisão',
          ],
          correct: 2,
          explanation: 'O Analítico pesquisa antes de comprar e desconfia de argumentos emocionais. Ele quer fatos, comparativos e tempo para processar. Admita quando não souber algo — e busque a resposta. Nunca generalize.',
        },
        {
          question: 'O que é o Efeito de Dotação e como usá-lo no varejo?',
          options: [
            'O efeito de mostrar muitos produtos para o cliente escolher o melhor',
            'A tendência de valorizar mais o que sentimos que já é nosso — deixe o cliente pegar o produto nas mãos',
            'O efeito de descontos progressivos que aumentam o desejo de compra',
            'A influência das avaliações online na decisão de compra',
          ],
          correct: 1,
          explanation: 'Quanto mais o cliente "possuir" mentalmente o produto, mais vai valorizá-lo. Deixar o produto na mão do cliente durante a demonstração ativa esse efeito e aumenta significativamente as chances de conversão.',
        },
        {
          question: 'Segundo Mehrabian (UCLA), qual é o maior componente do impacto na comunicação presencial?',
          options: [
            'As palavras utilizadas (55%)',
            'O tom de voz (55%)',
            'A linguagem corporal (55%)',
            'O conteúdo do argumento (55%)',
          ],
          correct: 2,
          explanation: '55% do impacto vem da linguagem corporal, 38% do tom de voz e apenas 7% das palavras. Isso não significa que as palavras não importam — significa que como você diz importa mais do que o que você diz.',
        },
        {
          question: 'Um cliente está comparando dois produtos e não consegue decidir. Qual é a abordagem correta?',
          options: [
            'Mostrar mais opções para ele ter mais referências',
            'Pressionar com urgência de estoque limitado',
            'Reduzir para no máximo duas opções e recomendar claramente baseado no que ele descreveu',
            'Deixá-lo decidir sozinho para não pressionar',
          ],
          correct: 2,
          explanation: 'O Paradoxo da Escolha mostra que mais opções geram mais dificuldade de decidir. Edite as opções para o cliente e faça uma recomendação clara — isso é mais valioso do que apresentar tudo que você tem.',
        },
      ],
    },
    {
      id: 'mod-3-comunicacao',
      title: 'Comunicação de alto nível',
      description: 'Rapport, escuta ativa, storytelling, perguntas poderosas e a linguagem que move pessoas a agir.',
      duration: 20,
      content: `
<h2>Rapport: a fundação de toda venda</h2>
<p>Rapport é o estado de confiança e sintonia entre duas pessoas. <strong>Sem rapport, não há venda — há, no máximo, transação.</strong> E transações não constroem clientes fiéis.</p>

<h3>Como construir rapport em 90 segundos</h3>
<ul>
<li><strong>Espelhamento:</strong> copie sutilmente a postura, o ritmo de fala e o vocabulário do cliente.</li>
<li><strong>Calibragem:</strong> ajuste sua energia ao nível do cliente. Cliente agitado? Combine a energia e vá suavizando.</li>
<li><strong>Sincronização vocal:</strong> velocidade, volume e tom similares criam sintonia inconsciente.</li>
<li><strong>Interesse genuíno:</strong> faça perguntas sobre o que o cliente diz, não sobre o que você quer vender.</li>
<li><strong>Pacing and leading:</strong> primeiro acompanhe (pacing) o cliente onde ele está — depois conduza (leading) para onde você quer que ele vá. Tentar liderar sem acompanhar primeiro é o erro mais comum.</li>
</ul>

<h2>Escuta ativa</h2>
<p>A maioria das pessoas ouve para responder. O vendedor de elite ouve para entender.</p>

<h3>Os cinco níveis de escuta</h3>
<ol>
<li><strong>Nível 1 — Ignorar:</strong> fisicamente presente, mentalmente ausente.</li>
<li><strong>Nível 2 — Fingir que ouve:</strong> diz "uhum" sem processar.</li>
<li><strong>Nível 3 — Escuta seletiva:</strong> ouve só o que interessa.</li>
<li><strong>Nível 4 — Escuta atenta:</strong> processa o que está sendo dito.</li>
<li><strong>Nível 5 — Escuta empática:</strong> entende não só o que está sendo dito, mas como a pessoa está se sentindo ao dizer. <em>O varejo opera no nível 5.</em></li>
</ol>

<h3>Técnicas de escuta ativa</h3>
<ul>
<li><strong>Parafraseamento:</strong> "Então se eu entendi bem, você está buscando algo durável que não exija muito cuidado especial, certo?"</li>
<li><strong>Perguntas de aprofundamento:</strong> "Você mencionou que o último não aguentou muito. O que especificamente aconteceu?"</li>
<li><strong>Validação emocional:</strong> "Faz todo sentido querer ter certeza antes de investir nisso."</li>
<li><strong>Silêncio estratégico:</strong> depois de uma pergunta importante, fique em silêncio. O cliente preencherá o espaço com informação valiosa.</li>
</ul>

<h2>Perguntas: a ferramenta mais poderosa do vendedor</h2>
<p>Neil Rackham, em estudo com 35.000 transações em 27 países, descobriu que os melhores vendedores fazem mais perguntas — e perguntas melhores.</p>

<h3>Tipos de perguntas</h3>
<ul>
<li><strong>Abertas:</strong> "O que você está buscando pra essa ocasião?"</li>
<li><strong>Fechadas:</strong> "Você precisa para essa semana, certo?"</li>
<li><strong>De investigação:</strong> "Você mencionou durabilidade — por quê isso é tão importante pra você?"</li>
<li><strong>Hipotéticas:</strong> "Imagina você usando isso na viagem que você mencionou — como seria?"</li>
<li><strong>De implicação:</strong> "Se você não resolver isso agora, o que acontece?"</li>
</ul>

<h3>Sequência de perguntas para o varejo</h3>
<ol>
<li>"Você já conhece nossa linha ou está vendo pela primeira vez?"</li>
<li>"O que você está buscando especificamente?"</li>
<li>"Pra que ocasião/situação seria?"</li>
<li>"O que é mais importante pra você: preço, durabilidade, design?"</li>
<li>"Baseado no que você me disse, o modelo X parece ideal. Faz sentido pra você?"</li>
</ol>

<h2>Storytelling: vender com histórias</h2>
<p>O cérebro humano é programado para histórias. Quando ouvimos uma narrativa, nosso cérebro libera oxitocina — o hormônio da confiança. <strong>Dados informam. Histórias vendem.</strong></p>

<h3>A estrutura da história de venda</h3>
<ol>
<li><strong>Personagem</strong> — com quem o cliente se identifica</li>
<li><strong>Problema</strong> — a situação antes do produto</li>
<li><strong>Solução</strong> — o produto como virada</li>
<li><strong>Resultado</strong> — a transformação</li>
</ol>

<p><em>Exemplo: "Semana passada atendi uma cliente que estava exatamente na sua situação... Ela levou esse aqui. Dois dias depois voltou pra me contar que recebeu um elogio da chefe — perguntou onde tinha comprado. Ela voltou hoje pra comprar o mesmo pra presentear a irmã."</em></p>
<p>Essa história ativa: prova social, afinidade, emoção, autoridade — tudo de uma vez.</p>

<h2>Linguagem de benefício vs. característica</h2>
<p>Nunca apresente características sem transformá-las em benefícios:</p>
<table>
<tr><th>Característica</th><th>Benefício</th></tr>
<tr><td>Bateria de 48h</td><td>Você não precisa ficar preocupado com carregador durante a viagem</td></tr>
<tr><td>Tecido impermeável</td><td>Se pegar chuva, não vai estragar</td></tr>
<tr><td>Garantia de 2 anos</td><td>Qualquer problema nos próximos 2 anos, a gente resolve sem custo</td></tr>
</table>

<h2>Perguntas calibradas (Chris Voss)</h2>
<p>As melhores frases em negociação e atendimento são perguntas abertas que começam com "como" ou "o que". Mantêm o diálogo aberto e colocam o ônus de criar a solução no outro lado.</p>
<ul>
<li>"Como posso fazer isso funcionar para você?"</li>
<li>"O que tornaria esse valor mais confortável para você?"</li>
<li>"Como poderíamos chegar num acordo que funcionasse pros dois lados?"</li>
</ul>
      `,
      quiz: [
        {
          question: 'O que é rapport e por que é a fundação de toda venda?',
          options: [
            'É o script de vendas que o vendedor usa — sem ele não há direcionamento',
            'É o estado de confiança e sintonia entre duas pessoas — sem ele só há transações, não relacionamentos',
            'É o conjunto de argumentos técnicos que convencem o cliente',
            'É a técnica de apresentar o produto de forma atrativa',
          ],
          correct: 1,
          explanation: 'Rapport é sintonia e confiança. Sem rapport pode até acontecer uma venda pontual, mas não há fidelização. Clientes compram de pessoas em quem confiam e com quem se identificam.',
        },
        {
          question: 'Qual é o nível mais alto de escuta que o vendedor de elite deve praticar?',
          options: [
            'Escuta seletiva — focar no que é relevante para a venda',
            'Escuta atenta — processar tudo que está sendo dito',
            'Escuta empática — entender o que é dito E como a pessoa se sente ao dizer',
            'Escuta ativa — fazer perguntas enquanto o cliente fala',
          ],
          correct: 2,
          explanation: 'A escuta empática vai além de processar palavras — você entende o estado emocional do cliente. Isso permite responder ao que ele realmente precisa, não apenas ao que ele verbalizou.',
        },
        {
          question: 'Qual é a estrutura correta da história de venda (storytelling)?',
          options: [
            'Problema → Produto → Preço → Fechamento',
            'Personagem → Problema → Solução → Resultado',
            'Contexto → Argumento → Gatilho → Ação',
            'Necessidade → Produto → Benefício → Decisão',
          ],
          correct: 1,
          explanation: 'A estrutura narrativa (Personagem-Problema-Solução-Resultado) ativa múltiplos gatilhos ao mesmo tempo: prova social, afinidade, emoção e autoridade. Dados informam — histórias vendem.',
        },
        {
          question: 'O que é "pacing and leading" na construção de rapport?',
          options: [
            'Ancorar o preço alto primeiro e depois mostrar o produto mais barato',
            'Primeiro acompanhar o cliente onde ele está, depois conduzir para onde você quer ir',
            'Fazer o cliente falar bastante antes de apresentar qualquer produto',
            'Adaptar o script de vendas ao perfil do cliente',
          ],
          correct: 1,
          explanation: 'Tentar liderar (leading) sem primeiro acompanhar (pacing) é o erro mais comum. O cliente precisa sentir que você está com ele antes de seguir sua condução.',
        },
        {
          question: 'Por que o silêncio estratégico é uma ferramenta poderosa após uma pergunta?',
          options: [
            'Demonstra confiança e não deixa o cliente perceber insegurança',
            'Faz o cliente se sentir confortável para pensar no preço',
            'O cliente preenche o silêncio com informação valiosa que o vendedor ansioso perderia',
            'Cria tensão positiva que acelera a decisão de compra',
          ],
          correct: 2,
          explanation: 'Vendedores ansiosos preenchem o silêncio eles mesmos — e perdem a informação. Quando você faz uma pergunta importante e aguarda, o cliente naturalmente completa com o que realmente pensa e sente.',
        },
      ],
    },
  ],
}
