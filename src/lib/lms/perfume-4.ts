import type { LmsTrilha } from './types'

export const perfumeT4: LmsTrilha = {
  id: 'trilha-pf-4',
  slug: 'nicho-diagnostico-cliente',
  title: 'Nicho e Diagnóstico do Cliente',
  description: 'Perfumaria de nicho e o fluxograma de descoberta do perfume ideal para cada perfil de cliente.',
  icon: '🌸',
  color: '#EC4899',
  xpReward: 200,
  area: 'vendas',
  lessons: [
    {
      id: 'mod-7-7-nicho',
      title: 'Perfumaria de Nicho',
      description: 'Exclusividade, criação artística, público-alvo e como vender nicho sem competir em preço.',
      duration: 18,
      content: `
<h2>Conceito</h2>
<p>Perfumaria de nicho = produção limitada, conceito artístico não comercial, ingredientes sem limite orçamentário, distribuição seletiva.</p>

<h2>Exclusividade e criação artística</h2>
<p>Vendida não em todo shopping — reforça status. O cliente de nicho busca não cheirar a todo mundo. O perfumista assina a obra como um artista plástico assina um quadro — Francis Kurkdjian, Christopher Sheldrake, Dominique Ropion são nomes reconhecidos por entusiastas.</p>

<h2>Público</h2>
<p>Conhecedor, colecionador, ou aspiracional que busca diferenciação. Geralmente 28+, alto poder aquisitivo ou disposto a investir em poucas peças de qualidade.</p>

<h2>Designer vs. Nicho</h2>
<table>
<tr><th></th><th>Designer</th><th>Nicho</th></tr>
<tr><td>Distribuição</td><td>Massiva</td><td>Seletiva</td></tr>
<tr><td>Orçamento ingrediente</td><td>Limitado</td><td>Livre</td></tr>
<tr><td>Marketing</td><td>Celebridades, campanhas</td><td>Boca a boca, comunidade</td></tr>
<tr><td>Risco de "cheirar igual outro"</td><td>Alto</td><td>Baixo</td></tr>
<tr><td>Argumento de venda</td><td>Reconhecimento de marca</td><td>Exclusividade + qualidade</td></tr>
</table>
<p><strong>Venda de nicho:</strong> não compete em preço. Compete em história, raridade e identidade pessoal. Cliente de nicho quer ouvir sobre o perfumista, o conceito, os ingredientes raros — não sobre desconto.</p>
      `,
      quiz: [
        {
          question: 'O que define perfumaria de nicho?',
          options: [
            'Preço sempre mais baixo que designer',
            'Produção limitada, conceito artístico, ingredientes sem limite de orçamento e distribuição seletiva',
            'Venda exclusiva em farmácias',
            'Uso obrigatório de oud',
          ],
          correct: 1,
          explanation: 'Nicho se define pela produção limitada, liberdade criativa/orçamentária e distribuição seletiva — não por categoria de ingrediente específico.',
        },
        {
          question: 'Como se deve argumentar o preço de um perfume de nicho?',
          options: [
            'Focando em desconto e promoção',
            'Comparando o tamanho do frasco com o de um designer',
            'Falando de história, raridade dos ingredientes e identidade pessoal',
            'Dizendo que é mais barato que a concorrência',
          ],
          correct: 2,
          explanation: 'Nicho não compete em preço — compete em história, exclusividade e identidade. O foco da venda é qualitativo, não promocional.',
        },
        {
          question: 'Por que o risco de "cheirar igual outra pessoa" é baixo em perfumes de nicho?',
          options: [
            'Porque nicho é vendido em todo shopping',
            'Porque a distribuição é seletiva e a produção é limitada',
            'Porque nicho não tem notas de saída',
            'Porque nicho é sempre mais barato',
          ],
          correct: 1,
          explanation: 'A distribuição seletiva e produção limitada do nicho reduzem drasticamente a chance de encontrar outra pessoa usando o mesmo perfume.',
        },
        {
          question: 'Qual é o perfil típico do cliente de perfumaria de nicho?',
          options: [
            'Jovem de 16-18 anos sem orçamento definido',
            'Conhecedor ou aspiracional, geralmente 28+, com alto poder aquisitivo ou disposto a investir em poucas peças',
            'Apenas revendedores em busca de giro',
            'Apenas turistas de passagem rápida',
          ],
          correct: 1,
          explanation: 'O público de nicho costuma ser mais maduro, conhecedor ou aspiracional, disposto a pagar mais por exclusividade e qualidade.',
        },
        {
          question: 'O que o perfumista representa numa fragrância de nicho?',
          options: [
            'Um funcionário anônimo da fábrica',
            'O "artista" que assina a obra, como referência de qualidade e conceito',
            'Um cargo puramente administrativo',
            'Não tem relevância nenhuma para a venda',
          ],
          correct: 1,
          explanation: 'Perfumistas como Francis Kurkdjian ou Dominique Ropion assinam suas criações como artistas — isso é parte do valor percebido pelo cliente conhecedor.',
        },
      ],
    },
    {
      id: 'mod-7-8-perfume-ideal',
      title: 'Como Descobrir o Perfume Ideal',
      description: 'Fluxograma de decisão, perguntas-chave e mapa rápido perfil → família olfativa.',
      duration: 20,
      content: `
<h2>Fluxograma de decisão</h2>
<p>Cliente entra → "Já tem um perfume que gosta hoje?"</p>
<ul>
<li><strong>Sim:</strong> identificar família do perfume atual → oferecer mesma família + upgrade ou variação.</li>
<li><strong>Não:</strong> perguntas de perfil (idade/profissão, ocasião, estilo pessoal, orçamento, clima preferido) → sugerir família baseada no perfil.</li>
</ul>
<p>Depois: testar 2-3 opções (blotter) → esperar 5-10 min (drydown) → fechar com argumento técnico + oferecer upsell (kit/tamanho maior).</p>

<h2>Perguntas-chave por dimensão</h2>
<ul>
<li><strong>Personalidade:</strong> "Você prefere passar despercebido ou que notem quando você chega?"</li>
<li><strong>Idade/profissão:</strong> indica formalidade (executivo → mais clássico; jovem/criativo → mais ousado)</li>
<li><strong>Estilo:</strong> observe roupa e acessórios — combine estética com olfato</li>
<li><strong>Clima:</strong> CDE é quente/úmido — cítricos/aquáticos performam melhor de dia; orientais/oud funcionam à noite mesmo no calor</li>
<li><strong>Ocasião:</strong> dia a dia, trabalho, balada, presente, casamento</li>
<li><strong>Orçamento:</strong> perguntar com tato — "qual faixa você tinha em mente?" abre espaço para upsell consultivo</li>
</ul>

<h2>Mapa rápido perfil → família</h2>
<table>
<tr><th>Perfil</th><th>Família sugerida</th></tr>
<tr><td>Jovem, balada, chamar atenção</td><td>Doce-amadeirado, especiado (1 Million, Supremacy)</td></tr>
<tr><td>Executivo, discreto</td><td>Amadeirado/cítrico clean (Terre d'Hermès, Bleu de Chanel)</td></tr>
<tr><td>Mulher romântica/clássica</td><td>Floral (J'adore, Good Girl)</td></tr>
<tr><td>Mulher moderna/doce</td><td>Gourmand (La Vie est Belle, Lattafa Yara)</td></tr>
<tr><td>Busca exclusividade</td><td>Nicho (MFK, Xerjoff, Amouage)</td></tr>
<tr><td>Quer fixação máxima</td><td>Árabe oud/âmbar (Rasasi, Al Haramain)</td></tr>
<tr><td>Custo-benefício</td><td>Lattafa, Armaf, Afnan</td></tr>
</table>
      `,
      quiz: [
        {
          question: 'Qual é a primeira pergunta recomendada ao atender um cliente indeciso?',
          options: [
            '"Qual seu orçamento?"',
            '"Já tem um perfume que gosta hoje?"',
            '"Quer o mais caro da loja?"',
            '"Prefere masculino ou feminino?"',
          ],
          correct: 1,
          explanation: 'Perguntar se o cliente já tem um perfume de referência permite identificar a família olfativa dele e direcionar a conversa com precisão.',
        },
        {
          question: 'Qual família recomendar para um executivo discreto?',
          options: ['Gourmand doce', 'Amadeirado/cítrico clean', 'Oud intenso', 'Frutado jovem'],
          correct: 1,
          explanation: 'Perfil executivo/discreto combina com amadeirados e cítricos limpos, como Terre d\'Hermès ou Bleu de Chanel.',
        },
        {
          question: 'Por que perguntar o orçamento "com tato" em vez de direto?',
          options: [
            'Porque não é importante saber o orçamento',
            'Porque abre espaço para upsell consultivo sem constranger o cliente',
            'Porque a loja não vende por faixa de preço',
            'Porque só clientes ricos merecem atenção',
          ],
          correct: 1,
          explanation: 'Perguntar com tato ("qual faixa você tinha em mente?") mantém a conversa consultiva e abre espaço para sugerir upgrades sem pressão.',
        },
        {
          question: 'Qual a ordem correta do processo de venda depois de identificar o perfil do cliente?',
          options: [
            'Fechar a venda → testar → esperar drydown',
            'Testar 2-3 opções → esperar 5-10 min (drydown) → fechar com argumento técnico + upsell',
            'Mostrar todo o estoque → decidir sozinho pelo cliente',
            'Aplicar direto na pele sem blotter',
          ],
          correct: 1,
          explanation: 'O processo correto é testar poucas opções no blotter, esperar o drydown, e só então fechar com argumento técnico e oferta de upsell.',
        },
        {
          question: 'Por que o clima de Ciudad del Este influencia a recomendação de família olfativa?',
          options: [
            'Porque não influencia em nada',
            'Porque calor/umidade aceleram evaporação e projeção — cítricos/aquáticos rendem melhor de dia, orientais/oud à noite',
            'Porque só existe uma estação na cidade',
            'Porque árabes não funcionam em clima quente',
          ],
          correct: 1,
          explanation: 'O clima quente e úmido de CDE acelera a evaporação e projeção — por isso cítricos/aquáticos são melhores de dia, e orientais/oud continuam funcionando à noite mesmo no calor.',
        },
      ],
    },
  ],
}
