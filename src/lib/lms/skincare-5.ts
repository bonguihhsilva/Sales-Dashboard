import type { LmsTrilha } from './types'

export const skincareT5: LmsTrilha = {
  id: 'trilha-sk-5',
  slug: 'estrategia-profissional',
  title: 'Estratégia Profissional',
  description: 'Técnicas de venda consultiva para skincare, gestão de objeções, fidelização de clientes e inteligência comercial com as tendências K-beauty 2024–2026.',
  icon: '💼',
  color: '#1D4ED8',
  xpReward: 400,
  area: 'skincare',
  lessons: [
    {
      id: 'mod-sk-10-vendas',
      title: 'Técnicas de Venda em Skincare',
      description: 'SPIN selling aplicado à cosmética, cross-sell, upsell, gestão de objeções e estratégias de fidelização.',
      duration: 40,
      content: `
<h2>O Consultor vs. O Vendedor</h2>
<p><strong>Vendedor de produto:</strong> "Temos esse hidratante. É ótimo. Quer levar?"<br>
<strong>Consultor especialista:</strong> "Você usa protetor solar diariamente? Qual a maior preocupação da sua pele agora? Me conta mais sobre sua rotina."</p>
<p>A diferença: o consultor vende soluções. O cliente sente que está sendo ajudado, não sendo vendido. Resultado: ticket médio maior, retorno, indicações.</p>

<h2>SPIN Selling Adaptado para Skincare</h2>
<p>SPIN = Situação, Problema, Implicação, Necessidade de solução. Framework de Neil Rackham para vendas consultivas.</p>

<h3>S — Situação</h3>
<p>Entender o contexto atual do cliente sem julgamento.</p>
<ul>
  <li>"Você já tem alguma rotina de skincare?"</li>
  <li>"Usa protetor solar todo dia?"</li>
  <li>"Tem algum produto que usa com frequência?"</li>
  <li>"Sua pele ficou diferente depois de [evento: gravidez / mudança de cidade / mudar de anticoncepcional]?"</li>
</ul>

<h3>P — Problema</h3>
<p>Identificar a dor real — o que incomoda, frustra, preocupa.</p>
<ul>
  <li>"O que mais te incomoda na sua pele hoje?"</li>
  <li>"Tem alguma área que você não gosta?"</li>
  <li>"Já tentou algum produto pra isso? Funcionou?"</li>
  <li>"O que você mais gostaria de mudar?"</li>
</ul>

<h3>I — Implicação</h3>
<p>Mostrar as consequências de não resolver o problema. Cria urgência.</p>
<ul>
  <li>"Sem protetor, a mancha tende a escurecer com o tempo — especialmente no verão."</li>
  <li>"Pele desidratada piora linhas finas e deixa a maquiagem menos uniforme."</li>
  <li>"Acne com inflamação constante pode deixar marcas mais difíceis de tratar depois."</li>
  <li>"Barreira comprometida deixa a pele mais reativa a qualquer produto."</li>
</ul>

<h3>N — Necessidade de solução</h3>
<p>Cliente articula o que precisa — você apresenta a solução como resposta direta.</p>
<ul>
  <li>"Então você quer algo que clareia as manchas mas não irrite?"</li>
  <li>"Você quer uma rotina que caiba no seu tempo de manhã — menos de 5 minutos?"</li>
  <li>"Você quer algo que funcione mesmo sem experiência com skincare?"</li>
</ul>
<p>Depois do N: "Tenho exatamente o que você precisa." — e a recomendação parece feita sob medida.</p>

<h2>Diagnóstico de 5 Perguntas — A Abertura Padrão</h2>
<p>Independente do cliente, começar sempre com estas 5 perguntas antes de qualquer recomendação:</p>
<ol>
  <li><strong>Qual sua maior preocupação com a pele agora?</strong> (Problema principal)</li>
  <li><strong>Sua pele tende a ficar mais oleosa ou mais seca?</strong> (Tipo básico)</li>
  <li><strong>Você usa protetor solar todo dia?</strong> (Hábito base + abertura para venda)</li>
  <li><strong>Tem algum ingrediente que você sabe que não tolera?</strong> (Restrições)</li>
  <li><strong>Você prefere uma rotina simples ou não tem problema com mais passos?</strong> (Complexidade)</li>
</ol>
<p>Com 5 respostas: diagnóstico suficiente para recomendar rotina personalizada.</p>

<h2>Cross-sell — Venda Complementar Inteligente</h2>
<p><strong>Regra de ouro:</strong> cross-sell serve o cliente, não o caixa. Só adicionar produto que genuinamente melhora o resultado.</p>
<table>
  <tr><th>Produto principal</th><th>Cross-sell natural</th><th>Por quê faz sentido</th></tr>
  <tr><td>Protetor solar</td><td>Vitamina C matinal</td><td>C + SPF = proteção fotoativa máxima</td></tr>
  <tr><td>Retinol noturno</td><td>Ceramidas / barreira</td><td>Retinol seca — ceramidas compensam</td></tr>
  <tr><td>Ácido (AHA/BHA)</td><td>Hidratante calmante</td><td>Esfoliação + calming evita irritação</td></tr>
  <tr><td>Sérum anti-manchas</td><td>SPF (se não tiver)</td><td>Sem SPF, manchas voltam</td></tr>
  <tr><td>Cleanser</td><td>Tônico</td><td>Completa a limpeza e equilibra pH</td></tr>
  <tr><td>Sheet mask</td><td>Sleeping mask</td><td>Hidratação diária vs. intensiva</td></tr>
</table>

<h2>Upsell — Para o Próximo Nível</h2>
<p><strong>Quando fazer upsell:</strong> quando o produto de entrada funciona bem e o cliente tem uma preocupação adicional.</p>
<p><strong>Exemplos práticos:</strong></p>
<ul>
  <li>Cliente comprou hidratante comum → upsell para hidratante com ceramidas + niacinamida (problema de poros visíveis)</li>
  <li>Cliente usa Cosrx Snail → upsell para Missha Time Revolution FTE (melhor resultado em 4 semanas)</li>
  <li>Cliente com SPF básico → upsell para Beauty of Joseon Relief Sun (textura superior, pa++++)</li>
</ul>
<p><strong>Como apresentar upsell sem parecer ganancioso:</strong><br>
"Esse que você tem funciona. Mas já que você mencionou [preocupação], esse aqui vai te dar resultado mais rápido porque [benefício específico]. A diferença de preço é X — vale pela [razão concreta]."</p>

<h2>Gestão de Objeções — As 6 Mais Comuns</h2>

<h3>1. "É muito caro"</h3>
<p><strong>Nunca:</strong> "Mas é muito barato para o que oferece."<br>
<strong>Sim:</strong> "Você falou em [problema]. Quanto você já gastou em coisas que não funcionaram? Esse produto foi formulado especificamente pra [benefício]. O custo por uso é de R$ X — menos que um café por dia."</p>

<h3>2. "Sou alérgica / tenho pele sensível"</h3>
<p><strong>Sim:</strong> "Ótimo que me falou. Então vou te mostrar só produtos sem fragância, com ingredientes comprovadamente gentis — Centella Asiatica, pantenol, ceramidas. Existem opções feitas exatamente pra pele reativa."</p>

<h3>3. "Não tenho tempo para rotina"</h3>
<p><strong>Sim:</strong> "Entendo. A rotina mínima que funciona são 3 produtos: limpeza + hidratante + protetor. 2 minutos de manhã. Começa pequeno, adiciona mais tarde se quiser."</p>

<h3>4. "Skincare coreano é diferente para a pele brasileira"</h3>
<p><strong>Sim:</strong> "Pele brasileira tem características parecidas com a coreana — melanina, umidade, sol intenso. Os K-beauty são formulados para esses desafios. Na verdade, o mercado global comprou mais SPF coreano justamente porque funciona melhor em climas quentes."</p>

<h3>5. "Vou pesquisar antes"</h3>
<p><strong>Sim:</strong> "Boa ideia pesquisar. Se quiser, te mando o nome do ingrediente principal — assim você vai diretamente ao que importa, não perde tempo em comparações genéricas. O [ingrediente X] vai aparecer nos melhores reviews."</p>

<h3>6. "Já tenho produto similar em casa"</h3>
<p><strong>Sim:</strong> "Que ótimo — significa que você já tem o hábito. Esse aqui tem [diferencial específico] que o que você usa provavelmente não tem. Quer ver o rótulo e comparar os ingredientes?"</p>

<h2>Fidelização — O Cliente que Volta</h2>
<p><strong>Regra dos 3 meses:</strong> a maioria dos produtos de skincare mostra resultado real em 4–12 semanas. Cliente que comprou e não foi orientado sobre prazo vai abandonar antes de ver resultado.</p>
<p><strong>Protocolo de fidelização:</strong></p>
<ol>
  <li><strong>Na venda:</strong> "Você vai começar a ver diferença em [X semanas]. Se depois de [Y dias] não mudou nada, me fala — ajustamos."</li>
  <li><strong>Semana 2:</strong> "Como está o produto? Pele adaptando bem?"</li>
  <li><strong>Mês 1:</strong> "Como está o resultado? Alguma dúvida da rotina?"</li>
  <li><strong>Mês 3:</strong> "Hora de reabastecer. Quer adicionar algum passo novo à rotina?"</li>
</ol>

<h2>O Argumento dos Ingredientes</h2>
<p>Cliente informado compra mais e volta. Ensinar 1 ingrediente por venda cria especialista progressivo que depende de você para aprender mais.</p>
<p><strong>Script para ensinar enquanto vende:</strong><br>
"Deixa eu te explicar por que funciona — sem complicar. [Ingrediente] faz exatamente [ação simples] na pele. Por isso vai ajudar com [seu problema específico]. Simples assim."</p>
      `.trim(),
      quiz: [
        {
          question: 'Uma cliente diz "é muito caro" para um sérum de vitamina C. Qual resposta usa corretamente a lógica de vendas consultiva?',
          options: [
            'Oferecer desconto imediatamente para não perder a venda',
            'Dizer que é barato comparado ao que oferece',
            'Conectar o custo ao problema real: perguntar quanto ela já gastou em coisas que não funcionaram, calcular custo por uso, e ligar ao benefício específico do produto',
            'Ignorar a objeção e mudar de assunto'
          ],
          correct: 2,
          explanation: 'Objeção de preço raramente é sobre preço — é sobre percepção de valor. A resposta certa conecta o custo ao problema real do cliente, contextualiza o investimento (custo por uso), e referencia o que ela já gastou sem resultado. Desconto imediato comunica que o preço original era inflado e desqualifica o produto.'
        },
        {
          question: 'No SPIN Selling, qual é a função específica da pergunta de Implicação?',
          options: [
            'Identificar o tipo de pele do cliente',
            'Mostrar as consequências de não resolver o problema, criando urgência sem pressão',
            'Apresentar o produto como solução',
            'Verificar se o cliente pode pagar'
          ],
          correct: 1,
          explanation: 'A pergunta de Implicação (I do SPIN) mostra o que acontece se o problema não for resolvido — "sem protetor, a mancha escurece"; "barreira comprometida deixa a pele mais reativa". Isso cria urgência genuína porque o cliente entende as consequências. Não é manipulação — é educação sobre o que está em jogo.'
        },
        {
          question: 'Por que cross-sell entre retinol noturno e ceramidas faz sentido de produto?',
          options: [
            'Porque são ingredientes da mesma marca',
            'Porque retinol resseca e pode comprometer a barreira — ceramidas compensam esse efeito e garantem resultado sem irritação',
            'Porque ceramidas potencializam o retinol',
            'Porque a margem de lucro é maior quando vendidos juntos'
          ],
          correct: 1,
          explanation: 'Retinol é um dos ativos mais eficazes mas também mais irritantes — acelera o turnover celular e pode comprometer a barreira cutânea, causando ressecamento e sensibilidade. Ceramidas repõem o que a barreira perdeu. A combinação é sinérgica: retinol entrega o resultado, ceramidas garantem que a pele aguente o processo sem abandono.'
        },
        {
          question: 'Cliente comprou um produto há 3 semanas e diz que "não viu resultado nenhum". Qual a resposta correta?',
          options: [
            'Dizer que o produto não serve para ela e recomendar troca',
            'Ignorar — resultado em skincare leva tempo',
            'Explicar que a maioria dos produtos de skincare mostra resultado real entre 4-12 semanas, e que 3 semanas ainda é período de adaptação — perguntar se a rotina está sendo seguida corretamente',
            'Oferecer reembolso imediatamente'
          ],
          correct: 2,
          explanation: 'Expectativas erradas são a principal causa de abandono de produto. Cliente que não foi orientada sobre prazo vai desistir antes de ver resultado. A resposta correta educa sobre o tempo real de skincare (4–12 semanas para maioria), confirma a aplicação correta, e reafirma o compromisso de acompanhar. Isso fideliza em vez de perder o cliente.'
        }
      ]
    },
    {
      id: 'mod-sk-11-tendencias',
      title: 'Tendências e Inteligência Comercial',
      description: 'Tendências K-beauty 2024–2026, kits estratégicos, métricas de performance e como manter-se atualizado.',
      duration: 30,
      content: `
<h2>O Mercado Global de K-Beauty em Números</h2>
<ul>
  <li>Mercado global K-beauty: US$ 13,4 bilhões (2023)</li>
  <li>CAGR projetado até 2030: 9,8%</li>
  <li>Brasil: mercado de cosméticos Top 3 mundial por consumo</li>
  <li>Ciudad del Este: hub de importação — acesso a marcas coreanas antes de chegarem ao varejo brasileiro convencional</li>
</ul>

<h2>Tendências K-Beauty 2024–2026</h2>

<h3>1. Skinimalism — Menos Produtos, Mais Ingredientes</h3>
<p><strong>O que é:</strong> movimento oposto ao 10-step. Rotinas com 3–5 produtos altamente eficazes.</p>
<p><strong>Produtos vencedores:</strong> multifuncionais — hidratante com SPF, tônico com ingredientes de sérum, cremes "all-in-one".</p>
<p><strong>Como vender:</strong> "Você quer resultado sem complicação? Rotina de 3 produtos que substitui 8."</p>

<h3>2. Skin Barrier Repair — A Grande Onda</h3>
<p><strong>O que é:</strong> foco em restaurar a barreira cutânea danificada (overexfoliação, estresse, produtos agressivos).</p>
<p><strong>Ingredientes em alta:</strong> ceramidas, ácido hialurônico, pantenol, centella, fermentos (bifidus).</p>
<p><strong>Por que virou tendência:</strong> pandemia de overexfoliação — muita gente exagerou em ácidos e retinol, agora recuperando a barreira.</p>

<h3>3. Glass Skin — A Pele Espelhada Coreana</h3>
<p><strong>O que é:</strong> pele visivelmente hidratada, translúcida, sem poros visíveis, sem manchas. Efeito vidro.</p>
<p><strong>Ingredientes:</strong> HA multi-molecular, niacinamida, esqualano, essences fermentadas.</p>
<p><strong>Argumento de venda:</strong> "É a estética de pele mais buscada no mundo agora — e é sobre hidratação profunda, não maquiagem."</p>

<h3>4. Micro-Biome Beauty</h3>
<p><strong>O que é:</strong> skincare que protege e nutre o microbioma da pele em vez de esterilizá-la.</p>
<p><strong>Ingredientes:</strong> bifidus, lactobacillus, postbiotics (fragmentos de bactérias benéficas).</p>
<p><strong>Produtos em destaque:</strong> Ma:nyo Bifida Ampoule, Laneige Cica Sleeping Mask.</p>

<h3>5. PDRN e Bio-Fermentation</h3>
<p><strong>PDRN:</strong> DNA de salmão — migrou de procedimentos clínicos para séruns de marca. Regeneração e anti-aging intenso.</p>
<p><strong>Fermentação avançada:</strong> galactomyces, saccharomyces (Missha, SK-II), bifidus (Ma:nyo). Alta concentração de ativos bioativos via fermentação.</p>

<h3>6. Clean + Eco K-Beauty</h3>
<p>Consumidor jovem exige: sem parabenos, sem fragância artificial, cruelty-free, embalagem sustentável.</p>
<p><strong>Marcas bem posicionadas:</strong> Purito, Torriden, Isntree.</p>

<h3>7. Sunscreen Culture</h3>
<p>SPF deixou de ser produto funcional e virou objeto de desejo. TikTok popularizou SPF coreano globalmente. Pessoas comparam texturas como colecionam séruns.</p>
<p><strong>Top performers:</strong> Beauty of Joseon Relief Sun, Purito Centella Green Level.</p>

<h2>Kits Estratégicos — Venda de Conjuntos</h2>
<p>Kits aumentam ticket médio, facilitam a decisão, e ensinam o cliente a usar produtos em conjunto corretamente.</p>

<table>
  <tr><th>Kit</th><th>Produtos</th><th>Para quem</th><th>Argumento</th></tr>
  <tr><td>Kit Iniciante</td><td>Low pH cleanser + HA tônico + creme + SPF</td><td>Quem nunca teve rotina</td><td>"Rotina completa para começar do zero"</td></tr>
  <tr><td>Kit Anti-Acne</td><td>BHA tônico + niacinamida sérum + calming cream</td><td>Pele acneica/oleosa</td><td>"3 produtos que atacam acne por ângulos diferentes"</td></tr>
  <tr><td>Kit Glass Skin</td><td>FTE + HA sérum + moisturizer gel + SPF</td><td>Quem quer pele hydrated</td><td>"O ritual de glass skin em 4 passos"</td></tr>
  <tr><td>Kit Anti-Manchas</td><td>Vitamina C + tranexâmico + SPF</td><td>Melasma, manchas solares</td><td>"Tríade de clarificação + proteção"</td></tr>
  <tr><td>Kit Anti-Aging</td><td>Retinol + peptídeos + ceramidas + SPF</td><td>Pele madura</td><td>"Repair noturno + proteção diurna"</td></tr>
  <tr><td>Kit Presente</td><td>Sheet masks variadas + sleeping mask + lip mask</td><td>Presentes</td><td>"Experiência de spa em casa"</td></tr>
</table>

<h2>Métricas de Performance — O Que Medir</h2>
<p><strong>Ticket médio por atendimento:</strong> meta de pelo menos 2–3 produtos por cliente. Rotina mínima = 3 produtos.</p>
<p><strong>Taxa de retorno:</strong> cliente de skincare bem orientada volta em 2–3 meses para reabastecer. Se não volta, investigar por quê.</p>
<p><strong>Conversão por diagnóstico:</strong> quantos diagnósticos resultam em venda? Abaixo de 60% — revisar a abordagem.</p>
<p><strong>NPS informal:</strong> "Você indicaria para alguém?" — cliente que indica é promotora da marca.</p>

<h2>Como Manter-se Atualizado</h2>
<p><strong>Plataformas de referência:</strong></p>
<ul>
  <li><strong>TikTok:</strong> @skincarebyhyram, @doctorly, trendwatching de ingredientes virais</li>
  <li><strong>Reddit:</strong> r/SkincareAddiction, r/AsianBeauty — comunidades sérias, reviews reais</li>
  <li><strong>YouTube:</strong> Beauty Within (Felicia + Rowena) — educação séria sobre K-beauty</li>
  <li><strong>Instagram:</strong> @incidecoder — análise de ingredientes por produto</li>
  <li><strong>INCIDecoder.com:</strong> verificar qualquer produto pelo INCI completo</li>
</ul>

<h2>O Perfil do Consultor de K-Beauty de Alto Nível</h2>
<p><strong>Conhecimento:</strong> sabe os ingredientes dos 30 produtos mais vendidos da loja de cor.</p>
<p><strong>Diagnóstico:</strong> consegue identificar tipo de pele e 3 principais preocupações em menos de 5 minutos de conversa.</p>
<p><strong>Consultivo:</strong> nunca começa pela recomendação — sempre pela pergunta.</p>
<p><strong>Atualizado:</strong> acompanha pelo menos 1 fonte de tendências por semana.</p>
<p><strong>Fidelizador:</strong> mantém acompanhamento pós-venda. Seus clientes voltam e trazem amigas.</p>

<h2>Pontocom — Vantagem Competitiva</h2>
<p>Estar em Ciudad del Este com acesso a produtos de importação é uma vantagem real:</p>
<ul>
  <li>Acesso a marcas antes de chegarem ao varejo brasileiro</li>
  <li>Preços mais competitivos que importação individual</li>
  <li>Variedade de marcas que não existem em farmácias e lojas convencionais do Brasil</li>
  <li>Consultor treinado = diferencial vs. compra online sem orientação</li>
</ul>
<p><strong>Argumento final:</strong> "A cliente pode comprar pelo site coreano e esperar 30 dias sem entender o que comprou. Ou pode comprar aqui, com alguém que entende os ingredientes, sabe o que funciona para o tipo de pele dela, e está disponível se precisar ajustar."</p>
      `.trim(),
      quiz: [
        {
          question: 'O que é o movimento "Skinimalism" e como ele muda a estratégia de venda?',
          options: [
            'Vender apenas produtos de uma marca; foco em exclusividade',
            'Rotinas mínimas com 3-5 produtos multifuncionais de alta eficácia; argumento de venda: resultado sem complexidade, menos produtos mas melhores',
            'Skincare apenas com ingredientes orgânicos certificados',
            'Eliminar completamente o protetor solar da rotina'
          ],
          correct: 1,
          explanation: 'Skinimalism é a resposta ao excesso da rotina de 10 passos — consumidor quer simplificar. Isso não é ameaça às vendas, é oportunidade: vender menos produtos mas com maior valor unitário e maior confiança. O argumento "3 produtos que substituem 8" é mais convincente para o cliente moderno do que uma rotina complexa.'
        },
        {
          question: 'Por que "Skin Barrier Repair" virou uma das maiores tendências K-beauty pós-pandemia?',
          options: [
            'Porque barreiras cutâneas são mais fáceis de vender',
            'Porque muitos consumidores exageraram em ácidos e retinol durante a pandemia e precisam recuperar a barreira danificada',
            'Porque as marcas coreanas lançaram campanhas globais sobre barreira',
            'Porque é uma tendência do mercado japonês que migrou para o coreano'
          ],
          correct: 1,
          explanation: 'O boom de skincare durante a pandemia levou muitas pessoas a overexfoliação e uso excessivo de retinol sem orientação. Resultado: barreira comprometida, pele reativa, vermelhidão crônica. O mercado respondeu com foco em repair — ceramidas, centella, bifidus, pantenol. É uma tendência gerada por um problema real em escala global.'
        },
        {
          question: 'Qual o argumento de vantagem competitiva real de um consultor treinado em Ciudad del Este vs. compra online?',
          options: [
            'Preço sempre menor',
            'Entrega mais rápida',
            'Diagnóstico personalizado, orientação de uso correta, acompanhamento pós-venda, acesso a marcas antes do varejo brasileiro, e suporte humano quando precisar ajustar a rotina',
            'Acesso a marcas exclusivas que não existem online'
          ],
          correct: 2,
          explanation: 'Preço e entrega são terrenos onde o online sempre ganha. O consultor treinado vence no que o algoritmo não faz: diagnóstico real de pele, recomendação contextualizada para aquela pessoa específica, garantia de uso correto (que maximiza resultado), acompanhamento quando algo não funciona, e orientação em tempo real. Mais o acesso geográfico privilegiado de CDE.'
        },
        {
          question: 'Por que o kit de presente ("Kit Presente" com sheet masks + sleeping mask + lip mask) faz sentido como estratégia comercial?',
          options: [
            'Porque são os produtos mais baratos para montar em kit',
            'Porque o cliente pode usar todos sem precisar de orientação de uso',
            'Porque transforma skincare em experiência sensorial presenteável — baixa barreira de entrada, alta satisfação, e introduz o receptor aos produtos K-beauty sem exigir conhecimento prévio',
            'Porque são os produtos com maior margem de lucro'
          ],
          correct: 2,
          explanation: 'Sheet masks e sleeping masks são os produtos K-beauty mais auto-explicativos e com resultado percebido rápido (uma sessão de sheet mask já hidrata visivelmente). Para presentes, isso é crucial — o receptor experimenta sem comprometer uma rotina. E quando gosta, volta para comprar mais. É a porta de entrada mais eficaz para novos clientes via indicação.'
        }
      ]
    }
  ]
}
