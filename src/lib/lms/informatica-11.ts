import type { LmsTrilha } from './types'

export const informaticaT11: LmsTrilha = {
  id: 'trilha-ti-11',
  slug: 'mercado-de-ciudad-del-este',
  title: 'Mercado de Ciudad del Este',
  description: 'Perfil dos diferentes tipos de compradores de Ciudad del Este, comportamento de compra por nacionalidade, sazonalidade e diferenciais competitivos regionais.',
  icon: '🌎',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-11-mercado-de-ciudad-del-este',
      title: 'Mercado de Ciudad del Este',
      description: 'Perfil dos diferentes tipos de compradores de Ciudad del Este, comportamento de compra por nacionalidade, sazonalidade e diferenciais competitivos regionais.',
      duration: 40,
      content: `
<h2>11.1 — Perfil dos Consumidores Locais</h2>
<p>Ciudad del Este é um dos maiores polos de importação/comércio de eletrônicos da América do Sul, com fluxo intenso de compradores transfronteiriços (Brasil, Argentina) além do público paraguaio local.</p>

<h2>11.2 — Compradores Brasileiros</h2>
<p><strong>Perfil:</strong> atravessam a fronteira (Foz do Iguaçu/Ponte da Amizade) buscando preço mais competitivo que o Brasil, frequentemente por causa da carga tributária brasileira sobre eletrônicos.</p>
<p><strong>Comportamento de compra:</strong></p>
<ul>
<li>Forte sensibilidade a "vale a pena trazer x não vale" — comparam mentalmente com preço de loja/e-commerce brasileiro.</li>
<li>Preocupação recorrente com <strong>cota de importação e nota fiscal/declaração na alfândega</strong> — cliente frequentemente pergunta sobre limites de valor para não ter problema na volta.</li>
<li>Produtos mais procurados: celulares, notebooks, câmeras, drones, componentes de PC (por diferença de preço proporcionalmente maior), perfumaria/eletrônicos de consumo em geral.</li>
<li>Sazonalidade forte: fim de ano (compras de Natal/Ano Novo), férias escolares, Black Friday (comparação de preço cross-border).</li>
</ul>
<p><strong>Diferencial competitivo pra esse público:</strong> garantia clara e em português, orientação sobre nota fiscal para travessia, produto com voltagem/plug compatível com o Brasil (110V/220V bivolt já resolve a maior parte).</p>

<h2>11.3 — Compradores Paraguaios</h2>
<p><strong>Perfil:</strong> cliente local recorrente, relação de longo prazo possível (diferente do turista de passagem), maior sensibilidade a parcelamento e crédito local.</p>
<p><strong>Comportamento:</strong> valoriza relacionamento e confiança construída ao longo do tempo, mais aberto a orientação técnica consultiva contínua (retorna para upgrades, manutenção).</p>

<h2>11.4 — Compradores Argentinos</h2>
<p><strong>Perfil:</strong> similar ao brasileiro em termos de arbitragem cambial, mas com sensibilidade cambial ainda mais acentuada historicamente (variação forte do câmbio local incentiva compra em dólar/guarani na fronteira).</p>
<p><strong>Comportamento:</strong> forte foco em produtos com boa reserva de valor (eletrônicos de marca reconhecida), compra em maior volume quando o câmbio favorece.</p>

<h2>11.5 — Empresas</h2>
<p><strong>Perfil:</strong> demanda por equipamento de rede, servidores, pontos de venda (PDV), câmeras de segurança, em volume — decisão de compra mais racional/orçamentária, menos emocional.</p>
<p><strong>Diferencial de venda:</strong> nota fiscal adequada para contabilidade da empresa, suporte pós-venda ágil (empresa não pode ficar parada), possibilidade de contrato de manutenção recorrente.</p>

<h2>11.6 — Técnicos</h2>
<p><strong>Perfil:</strong> compram componentes avulsos para revenda de serviço (montagem, manutenção) ou para clientes próprios — conhecem preço de mercado, menos sensível a discurso de venda, mais a preço e disponibilidade.</p>
<p><strong>Diferencial de venda:</strong> preço diferenciado por volume/recorrência, disponibilidade de estoque confiável (técnico não pode prometer prazo ao cliente dele e a peça não chegar).</p>

<h2>11.7 — Gamers</h2>
<p><strong>Perfil:</strong> pesquisa técnica extensa antes de comprar, compara benchmarks e preços entre lojas/países, decisão emocional (desejo por peça específica) combinada com racional (relação custo-benefício estudada).</p>
<p><strong>Diferencial de venda:</strong> conhecimento técnico profundo do vendedor gera confiança imediata — esse público percebe rapidamente se o vendedor "decora specs" ou entende de verdade.</p>

<h2>11.8 — Revendedores</h2>
<p><strong>Perfil:</strong> compra em volume para revender em outra praça (interior do Brasil, Argentina, Paraguai), forte foco em margem e preço por atacado.</p>
<p><strong>Diferencial de venda:</strong> condição comercial diferenciada por volume, agilidade logística, confiabilidade de estoque e prazo.</p>

<h2>11.9 — Comportamento de Compra: Padrões Regionais</h2>
<p>Turistas de curto prazo decidem rápido, mas pesquisam preço no celular durante o atendimento (comparação em tempo real) — vendedor precisa justificar valor além do preço puro (garantia, suporte, autenticidade do produto).</p>
<p>Clientes recorrentes (paraguaios locais e revendedores) valorizam relação de confiança de longo prazo mais que desconto pontual.</p>

<h2>11.10 — Sazonalidade</h2>
<table>
<tr><th>Período</th><th>Padrão de demanda</th></tr>
<tr><td>Novembro-Dezembro</td><td>Pico de vendas (Natal, fim de ano, férias)</td></tr>
<tr><td>Janeiro-Fevereiro</td><td>Volta às aulas — notebooks, acessórios de estudo</td></tr>
<tr><td>Junho-Julho</td><td>Férias de meio de ano, viagens turísticas</td></tr>
<tr><td>Datas de câmbio favorável</td><td>Picos não sazonais de compradores argentinos/brasileiros aproveitando cotação</td></tr>
</table>

<h2>11.11 — Principais Dúvidas dos Compradores</h2>
<ul>
<li>"Isso é original?" (preocupação com falsificação, recorrente na região).</li>
<li>"Tem garantia e funciona no meu país?" (voltagem, plugue, assistência técnica).</li>
<li>"Qual o limite de valor pra não ter problema na alfândega?" (você pode orientar de forma geral, mas sempre recomendar checagem da regra vigente, que muda com frequência).</li>
<li>"Por que aqui é mais barato que no meu país?" — explicação honesta: carga tributária de importação diferente, câmbio, volume de compra da região como polo comercial.</li>
</ul>

<h2>11.12 — Tendências Regionais</h2>
<ul>
<li>Crescimento de pagamento digital/cartão internacional além de dinheiro físico.</li>
<li>Aumento de pesquisa prévia via redes sociais/marketplace antes de ir à loja física — cliente chega já sabendo o que quer, papel do vendedor migra de "informar" para "validar e refinar a escolha".</li>
<li>Concorrência forte em preço entre lojas da região — diferenciação real vem de garantia, suporte e autenticidade comprovada.</li>
</ul>

<h2>11.13 — Diferenciais Competitivos das Lojas da Região</h2>
<ul>
<li>Garantia documentada e de fácil acionamento.</li>
<li>Nota fiscal/comprovante adequado para travessia de fronteira.</li>
<li>Produto testado na frente do cliente antes da saída da loja.</li>
<li>Atendimento consultivo (o diferencial que este treinamento constrói em você) frente a vendedores que só "empurram o que tem em estoque".</li>
</ul>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> turista brasileiro quer comprar notebook, pergunta se "vale a pena" trazer pro Brasil e se vai ter problema na alfândega.</p>
<p><strong>Abordagem consultiva:</strong></p>
<ol>
<li>Explicar de forma clara e honesta a diferença de preço esperada (sem prometer economia exagerada).</li>
<li>Orientar sobre a necessidade de nota fiscal/documento de compra para eventual declaração — recomendar que confirme a regra atualizada de cota, já que ela muda.</li>
<li>Confirmar bivolt/voltagem compatível com uso no Brasil.</li>
<li>Reforçar garantia e como acioná-la mesmo estando em outro país (contato, prazo, condição).</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente (argentino):</strong> "Esse preço em dólar hoje compensa ou espero o câmbio melhorar?"</p>
<p><strong>Resposta consultiva:</strong> "Isso depende da previsão de câmbio, que eu não posso garantir — mas posso te dizer que esse modelo específico está com bom preço frente ao que costuma praticar aqui, e o estoque desse produto não é garantido pra próxima semana. Se o câmbio for decisivo pra sua decisão, recomendo considerar o custo de oportunidade de esperar versus o risco de o produto não estar mais disponível nesse preço."</p>
      `,
      quiz: [
        {
          question: 'Por que o comprador brasileiro em Ciudad del Este costuma se preocupar tanto com nota fiscal e cota de importação?',
          options: [
            'Porque é obrigatório por lei paraguaia ter nota fiscal para qualquer compra',
            'Porque precisa declarar a compra na volta ao Brasil e evitar problemas na alfândega, dado o limite de cota',
            'Porque a nota fiscal define o preço final do produto',
            'Porque sem nota fiscal o produto não tem garantia em nenhum lugar'
          ],
          correct: 1,
          explanation: 'O comprador brasileiro atravessa a fronteira e precisa de documentação para declarar a compra na volta, respeitando o limite de cota vigente — daí a preocupação recorrente com nota fiscal e alfândega.'
        },
        {
          question: 'Qual a principal diferença de abordagem de venda entre um turista de passagem e um cliente paraguaio recorrente?',
          options: [
            'Não há diferença, a abordagem deve ser idêntica sempre',
            'Com o turista o foco é justificar valor além do preço (garantia, suporte, autenticidade); com o recorrente, construir relação de confiança de longo prazo',
            'O turista sempre paga mais caro por norma da loja',
            'O cliente recorrente nunca precisa de orientação técnica'
          ],
          correct: 1,
          explanation: 'Turistas comparam preço em tempo real e decidem rápido — o vendedor precisa justificar valor além do preço. Já o cliente paraguaio recorrente valoriza relacionamento e confiança construída ao longo do tempo.'
        },
        {
          question: 'Por que gamers percebem rapidamente se um vendedor tem conhecimento técnico real ou só "decora specs"?',
          options: [
            'Porque gamers nunca fazem pesquisa prévia',
            'Porque esse público pesquisa benchmarks e preços extensivamente antes de comprar, tornando respostas superficiais fáceis de identificar',
            'Porque gamers só compram por impulso, sem análise',
            'Porque loja nenhuma vende para gamers nessa região'
          ],
          correct: 1,
          explanation: 'Gamers costumam pesquisar benchmarks e comparar preços entre lojas e países antes de decidir — por isso identificam rápido quando o vendedor não tem domínio técnico real.'
        },
        {
          question: 'Segundo os diferenciais competitivos das lojas da região, o que pode diferenciar uma loja além do preço?',
          options: [
            'Apenas ter o menor preço do mercado',
            'Garantia documentada, nota fiscal adequada, produto testado na frente do cliente e atendimento consultivo',
            'Ter a maior quantidade de produtos em estoque, sem critério',
            'Vender exclusivamente para revendedores'
          ],
          correct: 1,
          explanation: 'Com concorrência forte em preço na região, os diferenciais reais vêm de garantia documentada, nota fiscal adequada, produto testado antes da saída e atendimento consultivo genuíno.'
        },
        {
          question: 'Como a sazonalidade de novembro-dezembro deve influenciar o planejamento de estoque da loja?',
          options: [
            'Não deve influenciar, a demanda é estável o ano todo',
            'A loja deve reduzir estoque nesse período por ser baixa temporada',
            'A loja deve se preparar para pico de vendas (Natal, fim de ano, férias), garantindo estoque e equipe reforçados',
            'Apenas produtos de smart home vendem mais nesse período'
          ],
          correct: 2,
          explanation: 'Novembro-dezembro é identificado como pico de vendas na região (Natal, fim de ano, férias), exigindo planejamento antecipado de estoque e equipe para atender a demanda.'
        }
      ],
    },
  ],
}
