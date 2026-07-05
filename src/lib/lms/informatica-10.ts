import type { LmsTrilha } from './types'

export const informaticaT10: LmsTrilha = {
  id: 'trilha-ti-10',
  slug: 'inteligencia-comercial',
  title: 'Inteligência Comercial',
  description: 'Framework prático de análise de catálogo, upsell, cross-sell e avaliação de concorrência para maximizar vendas com consultoria de verdade.',
  icon: '📊',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-10-inteligencia-comercial',
      title: 'Inteligência Comercial',
      description: 'Framework prático de análise de catálogo, upsell, cross-sell e avaliação de concorrência para maximizar vendas com consultoria de verdade.',
      duration: 40,
      content: `
<p>Este módulo funciona como framework permanente: sempre que você (usuário deste curso) fornecer catálogo/lista de produtos disponíveis na loja, aplique a metodologia abaixo.</p>

<h2>10.1 — Framework de Análise de Catálogo</h2>
<p>Quando receber uma lista de produtos, seguir esta sequência analítica:</p>
<ol>
<li><strong>Mapear categorias presentes vs ausentes</strong> — identificar lacunas do catálogo frente à demanda típica de Ciudad del Este.</li>
<li><strong>Identificar produtos "âncora"</strong> — os que trazem tráfego/decisão de compra (ex: notebooks, celulares) vs produtos de "margem" (acessórios, cabos, periféricos) que sustentam a lucratividade real.</li>
<li><strong>Cruzar categorias para oportunidades de combo</strong> — todo produto âncora deve ter 2-3 sugestões de complementares mapeadas antecipadamente pela equipe de vendas.</li>
<li><strong>Avaliar giro (o que vende rápido) vs margem (o que dá mais lucro por unidade)</strong> — nem sempre são os mesmos produtos, e a estratégia comercial precisa equilibrar os dois.</li>
</ol>

<h2>10.2 — Upsell: Estratégias Práticas</h2>
<p>Upsell = convencer o cliente a levar uma versão superior do mesmo tipo de produto que já estava considerando.</p>
<p><strong>Técnicas:</strong></p>
<ul>
<li><strong>Comparação de diferença marginal:</strong> "por mais X reais/guaranis, o senhor leva o modelo com o dobro de armazenamento" — funciona melhor quando a diferença percentual de preço é pequena frente ao ganho percebido.</li>
<li><strong>Ancoragem por durabilidade:</strong> "esse modelo vai atender bem por 1-2 anos, esse outro por 4-5" — muda a percepção de custo-benefício de "preço da compra" para "custo por ano de uso".</li>
<li><strong>Demonstração ao vivo:</strong> deixar o cliente sentir a diferença (velocidade de boot com SSD, fluidez com mais RAM) sempre converte mais que só falar números.</li>
</ul>

<h2>10.3 — Cross-Sell: Estratégias Práticas</h2>
<p>Cross-sell = vender produto complementar ao item principal.</p>
<p><strong>Mapa de combos naturais por produto âncora:</strong></p>
<table>
<tr><th>Produto âncora</th><th>Cross-sell natural</th></tr>
<tr><td>Notebook</td><td>Mochila/case, mouse, SSD externo, licença de Office, hub USB</td></tr>
<tr><td>PC gamer montado</td><td>Monitor de alta taxa, headset, mousepad grande, nobreak</td></tr>
<tr><td>Roteador</td><td>Cabo de rede extra, switch adicional, repetidor/mesh se casa for grande</td></tr>
<tr><td>Câmera IP</td><td>Cartão SD de alta resistência, NVR, switch PoE</td></tr>
<tr><td>Impressora</td><td>Papel, tinta/toner extra, cabo USB se não incluso</td></tr>
<tr><td>Celular</td><td>Capa, película, carregador extra, fone</td></tr>
</table>

<h2>10.4 — Identificação de Tendências Tecnológicas (aplicação comercial)</h2>
<p>Sempre cruzar tendências de mercado com o catálogo: catálogo tem produtos com Wi-Fi 6/6E/7? Tem SSDs NVMe Gen4/Gen5? Tem opções DDR5? Ausência dessas categorias = oportunidade de expansão de catálogo antes da concorrência.</p>

<h2>10.5 — Análise de Concorrência</h2>
<p><strong>Perguntas-guia para analisar concorrentes em Ciudad del Este:</strong></p>
<ul>
<li>Eles têm preço menor, mas têm suporte técnico pós-venda? (diferencial competitivo real da sua loja pode ser o atendimento consultivo, não só preço).</li>
<li>Eles têm estoque de linha de entrada mas não têm linha intermediária/gamer? (nicho a explorar).</li>
<li>Eles vendem produto sem explicar compatibilidade (venda "seca")? (seu diferencial: venda consultiva evita devolução e aumenta confiança/recompra).</li>
</ul>

<h2>10.6 — Recomendação de Novos Produtos: Framework de Justificativa</h2>
<p>Toda sugestão de novo produto para a loja deve vir acompanhada de:</p>
<ol>
<li>Demanda observada (pergunta recorrente de cliente, tendência de mercado).</li>
<li>Margem estimada vs concorrência.</li>
<li>Complexidade de suporte pós-venda (produto muito técnico pode gerar mais chamado de suporte que lucro, se a equipe não estiver preparada).</li>
<li>Giro esperado (produto de nicho muito específico pode empatar capital parado).</li>
</ol>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> você recebe a seguinte lista simplificada de catálogo (exemplo para exercício): Notebooks entrada/intermediário, GPUs RTX série 40, SSDs NVMe Gen3/Gen4, roteadores Wi-Fi 5, sem produtos de smart home, sem monitores acima de 144Hz.</p>
<p><strong>Análise comercial esperada (exercício — pratique fazendo esta análise você mesmo com catálogo real da sua loja):</strong></p>
<ol>
<li>Lacuna: roteadores Wi-Fi 6/6E ausentes — mercado já demanda, oportunidade de expansão.</li>
<li>Lacuna: sem smart home — categoria em crescimento, ticket médio baixo mas alto volume potencial e ótimo cross-sell com roteadores/câmeras.</li>
<li>Cross-sell natural: quem compra RTX série 40 (GPU forte) provavelmente precisa de monitor com taxa de atualização mais alta — mas catálogo não tem acima de 144Hz, perdendo upsell relevante para esse público.</li>
<li>Sugestão de expansão priorizada: 1º Wi-Fi 6 (menor risco, alta demanda comprovada), 2º monitores 165Hz+, 3º linha básica de smart home como teste de mercado.</li>
</ol>

<h2>Simulação de Atendimento (aplicação comercial)</h2>
<p><strong>Cliente:</strong> "Vou levar só o computador, não preciso de mais nada."</p>
<p><strong>Resposta consultiva (cross-sell sem pressão):</strong> "Perfeito. Só uma observação rápida: esse modelo não vem com mouse/teclado — o senhor já tem em casa ou quer que eu inclua um kit básico? E se for usar bastante, um nobreak simples evita perda de trabalho em queda de energia, é um investimento pequeno perto do que protege." (Oferece, não insiste — decisão fica com o cliente, mas a oportunidade foi apresentada com justificativa real.)
      `,
      quiz: [
        {
          question: 'No framework de análise de catálogo, qual é a diferença central entre "produto âncora" e "produto de margem"?',
          options: [
            'Âncora é sempre mais caro que margem',
            'Âncora traz tráfego/decisão de compra; margem sustenta a lucratividade real, mesmo com ticket menor',
            'Não há diferença prática entre os dois conceitos',
            'Produto de margem só existe em lojas online'
          ],
          correct: 1,
          explanation: 'Produtos âncora (ex: notebooks, celulares) atraem o cliente e geram a decisão de compra; produtos de margem (acessórios, cabos) muitas vezes sustentam a lucratividade real da venda.'
        },
        {
          question: 'Por que a técnica de "ancoragem por durabilidade" costuma funcionar melhor que apenas comparar preço bruto no upsell?',
          options: [
            'Porque ela esconde o preço real do cliente',
            'Porque muda a percepção de "preço da compra" para "custo por ano de uso", tornando o upgrade mais racional',
            'Porque não depende da opinião do cliente',
            'Porque é a única técnica permitida em vendas consultivas'
          ],
          correct: 1,
          explanation: 'Ao comparar quanto tempo cada modelo vai durar, o cliente enxerga o investimento como custo por ano de uso, não apenas o valor total pago — isso costuma justificar melhor a diferença de preço.'
        },
        {
          question: 'Um cliente compra um roteador. Segundo o mapa de combos naturais, qual cross-sell é mais coerente oferecer?',
          options: [
            'Papel e toner extra',
            'Cabo de rede extra, switch adicional ou repetidor/mesh se a casa for grande',
            'Cartão SD de alta resistência',
            'Licença de Office'
          ],
          correct: 1,
          explanation: 'Para roteadores, os cross-sells naturais mapeados são cabo de rede extra, switch adicional e repetidor/mesh quando a residência é grande.'
        },
        {
          question: 'Ao avaliar um concorrente que pratica preços mais baixos, qual pergunta-guia ajuda a identificar o diferencial real da sua loja?',
          options: [
            'Perguntar apenas se o concorrente tem estacionamento',
            'Verificar se o concorrente oferece suporte técnico pós-venda e venda consultiva, ou apenas vende "seco"',
            'Comparar somente a cor da fachada da loja concorrente',
            'Ignorar a concorrência completamente'
          ],
          correct: 1,
          explanation: 'Preço menor sem suporte pós-venda e sem explicação de compatibilidade (venda "seca") abre espaço para a loja se diferenciar pelo atendimento consultivo, que aumenta confiança e recompra.'
        },
        {
          question: 'Quais são os 4 critérios do framework de justificativa para recomendar um novo produto ao catálogo?',
          options: [
            'Cor do produto, marca, país de origem e embalagem',
            'Demanda observada, margem estimada vs concorrência, complexidade de suporte pós-venda e giro esperado',
            'Apenas o preço de custo do fornecedor',
            'Popularidade em redes sociais, apenas'
          ],
          correct: 1,
          explanation: 'O framework exige justificar a inclusão de um novo produto por demanda observada, margem frente à concorrência, complexidade de suporte pós-venda e giro esperado — evitando capital parado em nicho.'
        }
      ],
    },
  ],
}
