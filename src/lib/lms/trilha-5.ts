import type { LmsTrilha } from './types'

export const trilha5: LmsTrilha = {
  id: 'trilha-5',
  slug: 'atacado-b2b',
  title: 'Atacado B2B',
  description: 'Mentalidade, perfil do comprador, proposta de valor, negociação e gestão de carteira para vendas no modelo atacado.',
  icon: '🏭',
  color: '#1D4ED8',
  xpReward: 550,
  area: 'vendas',
  lessons: [
    {
      id: 'mod-5-1-mentalidade-b2b',
      title: 'Mentalidade B2B — O que muda no atacado',
      description: 'Diferenças estruturais entre varejo e atacado, os 3 papéis no processo de compra e o que o comprador realmente quer.',
      duration: 30,
      content: `
<h2>O que muda no atacado</h2>
<table>
  <tr><th>Varejo (B2C)</th><th>Atacado (B2B)</th></tr>
  <tr><td>1 decisão = 1 pessoa</td><td>1 decisão = múltiplos aprovadores</td></tr>
  <tr><td>Emoção domina</td><td>Lógica + ROI + risco</td></tr>
  <tr><td>Ticket: R$50–R$500</td><td>Ticket: R$2k–R$500k</td></tr>
  <tr><td>Ciclo: minutos a horas</td><td>Ciclo: dias a semanas</td></tr>
  <tr><td>Relacionamento é diferencial</td><td>Relacionamento é barreira de saída</td></tr>
  <tr><td>1 contato fecha</td><td>Múltiplos contatos para fechar</td></tr>
</table>

<h2>Os 3 papéis no processo de compra B2B</h2>
<table>
  <tr><th>Papel</th><th>Quem é</th><th>O que importa</th><th>Como abordar</th></tr>
  <tr><td>Usuário</td><td>Quem vai usar no dia a dia</td><td>Praticidade, qualidade, suporte</td><td>Mostre como facilita o trabalho dele</td></tr>
  <tr><td>Influenciador</td><td>Gerente, comprador técnico</td><td>Especificações, comparativos, risco</td><td>Dados, ficha técnica, cases</td></tr>
  <tr><td>Decisor</td><td>Dono, diretor, financeiro</td><td>ROI, prazo de retorno, risco financeiro</td><td>Foco total em número e resultado</td></tr>
</table>
<p><strong>Regra:</strong> identifique quem é o decisor final e adapte a linguagem para o papel de quem está na frente.</p>

<h2>O que o comprador de atacado realmente quer</h2>
<ul>
  <li><strong>Certeza de entrega:</strong> prazo cumprido é mais importante que preço</li>
  <li><strong>Consistência de qualidade:</strong> lote 1 = lote 50</li>
  <li><strong>Parceiro, não fornecedor:</strong> quem resolve problema é quem fica</li>
  <li><strong>Facilidade operacional:</strong> pedido fácil, nota certa, suporte ágil</li>
  <li><strong>Crédito e condição:</strong> prazo de pagamento é parte do produto</li>
</ul>

<h2>Por que compradores trocam de fornecedor</h2>
<table>
  <tr><th>Motivo</th><th>% dos casos</th></tr>
  <tr><td>Problema de atendimento / suporte</td><td>68%</td></tr>
  <tr><td>Sensação de não ser valorizado</td><td>14%</td></tr>
  <tr><td>Produto concorrente melhor</td><td>9%</td></tr>
  <tr><td>Preço</td><td>9%</td></tr>
</table>
<p><strong>68% das perdas são por atendimento, não por produto ou preço.</strong></p>
      `.trim(),
      quiz: [
        {
          question: 'Comprador pede desconto antes de ver qualquer produto. O que isso sinaliza?',
          options: [
            'Ele não tem budget suficiente',
            'Ele está testando seu limite e/ou já teve experiência ruim de valor vs. preço',
            'O produto está caro em relação ao mercado',
            'Você deve oferecer desconto imediatamente para avançar'
          ],
          correct: 1,
          explanation: 'Pedido de desconto no início é uma tática de negociação, não necessariamente sinal de restrição de orçamento. O comprador está calibrando seu espaço de negociação e/ou testando se você cede facilmente. A resposta correta é explorar o que está por trás antes de mover no preço.'
        },
        {
          question: 'Você está negociando com o gerente, mas o dono precisa aprovar. O que é urgente?',
          options: [
            'Esperar o gerente levar a proposta internamente',
            'Criar material específico para o dono — ROI, risco e prazo de retorno',
            'Dar desconto adicional para facilitar a aprovação',
            'Pedir reunião direta com o dono antes de prosseguir'
          ],
          correct: 1,
          explanation: 'O gerente vai apresentar para o dono, mas sem o material certo a apresentação vai ser genérica. Criar material focado no que o dono se importa (ROI, risco, payback) aumenta drasticamente a chance de aprovação — você está armando o gerente para vencer internamente.'
        },
        {
          question: 'Qual a principal diferença entre ter um fornecedor e ter um parceiro comercial no B2B?',
          options: [
            'O parceiro tem preço melhor',
            'O parceiro entrega mais rápido',
            'O parceiro antecipa problemas, sugere mix, avisa sobre mudanças — o cliente para de comparar preço quando você vira parte da operação dele',
            'O parceiro tem mais produtos em catálogo'
          ],
          correct: 2,
          explanation: 'Fornecedor entrega o que foi pedido. Parceiro age proativamente: avisa sobre ruptura antes que aconteça, sugere ajuste de mix baseado em dados, comemora os resultados do cliente junto. Essa diferença cria barreira de saída emocional que supera diferenças de preço de 5-10%.'
        },
        {
          question: 'Segundo os dados de retenção, qual motivo representa 68% das trocas de fornecedor?',
          options: [
            'Preço mais competitivo do concorrente',
            'Produto de qualidade superior',
            'Problema de atendimento e suporte',
            'Mudança de estratégia do cliente'
          ],
          correct: 2,
          explanation: '68% das perdas de clientes B2B são por problema de atendimento ou sensação de não ser valorizado. Apenas 9% são por preço. Isso inverte a lógica de muitos vendedores que focam em preço quando deveriam focar em qualidade de relacionamento.'
        }
      ]
    },
    {
      id: 'mod-5-2-perfil-comprador',
      title: 'Perfil do Comprador B2B e Qualificação',
      description: 'Os 5 tipos de comprador no atacado, perguntas de qualificação que economizam semanas e o BANT adaptado ao B2B.',
      duration: 30,
      content: `
<h2>Os 5 tipos de comprador no atacado</h2>
<table>
  <tr><th>Tipo</th><th>Comportamento</th><th>O que quer</th><th>Estratégia</th></tr>
  <tr><td>Caçador de preço</td><td>Pesquisa tudo, decide por centavos</td><td>Menor custo total</td><td>Mostre custo total de posse — frete, ruptura, retrabalho</td></tr>
  <tr><td>Fiel por comodidade</td><td>Compra do mesmo há anos</td><td>Zero fricção</td><td>Torne mudar ainda mais fácil do que ficar</td></tr>
  <tr><td>Analítico</td><td>Planilha tudo, pede dados, demora</td><td>Segurança e comparativo</td><td>Dê dados, cases, certificações, projeto piloto</td></tr>
  <tr><td>Construtor de relacionamento</td><td>Compra de quem conhece e confia</td><td>Parceria e confiança</td><td>Presença constante, atendimento personalizado</td></tr>
  <tr><td>Estratégico</td><td>Compra alinhado com estratégia do negócio</td><td>Resultado de negócio</td><td>Linguagem de resultado: giro, margem, posicionamento</td></tr>
</table>

<h2>Qualificação — as perguntas que importam</h2>
<p>No atacado, <strong>qualificar antes de propor</strong> economiza semanas.</p>
<table>
  <tr><th>Dimensão</th><th>Pergunta</th></tr>
  <tr><td>Volume</td><td>"Qual o volume médio mensal que vocês trabalham nessa categoria?"</td></tr>
  <tr><td>Ciclo</td><td>"Como é o processo de aprovação de novos fornecedores aqui?"</td></tr>
  <tr><td>Dor atual</td><td>"O que você mudaria no fornecedor atual se pudesse?"</td></tr>
  <tr><td>Critério</td><td>"Na hora de avaliar um novo fornecedor, o que é inegociável pra vocês?"</td></tr>
  <tr><td>Timing</td><td>"Existe uma data ou evento que torna isso urgente?"</td></tr>
  <tr><td>Orçamento</td><td>"Existe uma faixa de investimento definida ou isso está em aberto?"</td></tr>
</table>

<h2>BANT adaptado ao atacado</h2>
<table>
  <tr><th>Letra</th><th>Original</th><th>No atacado</th></tr>
  <tr><td>B</td><td>Budget</td><td>Volume potencial + prazo de pagamento viável</td></tr>
  <tr><td>A</td><td>Authority</td><td>Quem assina o pedido final</td></tr>
  <tr><td>N</td><td>Need</td><td>Dor real com fornecedor atual + urgência</td></tr>
  <tr><td>T</td><td>Timeline</td><td>Quando precisa receber + frequência de pedidos</td></tr>
</table>

<h2>Por que qualificar antes de propor</h2>
<p>Proposta sem qualificação = trabalho para o lixo. Você pode passar 3 dias montando uma proposta sofisticada para um cliente que não tem autonomia para aprovar, não tem o volume mínimo viável, ou já está comprometido com concorrente por contrato. 30 minutos de qualificação protege semanas de trabalho.</p>
      `.trim(),
      quiz: [
        {
          question: 'Comprador analítico pede planilha comparativa de 3 fornecedores. Qual sua ação?',
          options: [
            'Recusar — você não deve ajudar a comparar concorrentes',
            'Enviar apenas sua tabela de preços',
            'Criar comparativo completo incluindo custo total, prazo, qualidade — e definir os critérios de comparação',
            'Pedir para o cliente criar a planilha e você preenche sua coluna'
          ],
          correct: 2,
          explanation: 'Com o comprador analítico, você tem uma oportunidade de ouro: ao criar o comparativo, você define os critérios que importam — e naturalmente escolherá critérios nos quais você vence. Custo total (não só unitário), tempo de entrega, política de troca, suporte — esses são critérios que diferenciam.'
        },
        {
          question: 'Por que qualificar um lead B2B antes de montar a proposta é crítico?',
          options: [
            'Para parecer mais profissional',
            'Porque a qualificação revela se o prospect tem volume, autonomia de decisão e urgência reais — sem isso você pode trabalhar semanas numa proposta que vai para o lixo',
            'Para ter mais informações para negociar o preço',
            'Para descobrir o orçamento e ajustar o preço'
          ],
          correct: 1,
          explanation: '30 minutos de qualificação protege semanas de trabalho. Sem qualificar: você propõe para alguém sem autoridade de aprovação, sem volume mínimo viável, ou comprometido com concorrente por contrato. A qualificação é o filtro que separa os leads que valem seu tempo.'
        },
        {
          question: 'Cliente que "compra do mesmo fornecedor há 5 anos" pertence a qual perfil, e qual a estratégia?',
          options: [
            'Perfil analítico — enviar dados comparativos',
            'Perfil fiel por comodidade — tornar a transição tão fácil que o esforço de mudar se torna menor que o de ficar',
            'Perfil caçador de preço — oferecer o melhor preço do mercado',
            'Perfil estratégico — mostrar ROI do switch'
          ],
          correct: 1,
          explanation: 'O fiel por comodidade não troca pelo preço — ele troca quando mudar se torna mais fácil que ficar. Estratégia: reduza ao máximo o atrito da transição. Primeiro pedido sem burocracia, suporte na integração, garantia de reversão se não funcionar. Você não está pedindo para ele abandonar o atual — está pedindo para testar você.'
        },
        {
          question: 'No BANT adaptado ao B2B, o que "N" (Need) representa especificamente?',
          options: [
            'Número de unidades necessárias',
            'Necessidade de desconto',
            'Dor real com o fornecedor atual mais urgência para resolver',
            'Nome do decisor final'
          ],
          correct: 2,
          explanation: 'No B2B, Need não é só "precisar do produto" — é a dor específica com o fornecedor atual combinada com urgência real. Sem dor clara (lote com defeito, atraso crônico, suporte ruim), não há motivação para mudar. Sem urgência, o prospect fica em "vou avaliar" para sempre.'
        }
      ]
    },
    {
      id: 'mod-5-3-proposta-valor',
      title: 'Proposta de Valor e ROI no Atacado',
      description: 'Estrutura da proposta vencedora, linguagem de ROI, cálculo de margem e como apresentar ao vivo vs. por e-mail.',
      duration: 30,
      content: `
<h2>A proposta que fecha vs. a que não fecha</h2>
<table>
  <tr><th>Proposta que não fecha</th><th>Proposta que fecha</th></tr>
  <tr><td>Tabela de preços genérica</td><td>Começa com a dor do cliente</td></tr>
  <tr><td>Sem contextualização</td><td>Mostra entendimento do negócio dele</td></tr>
  <tr><td>Igual à da concorrência</td><td>Propõe mix específico, não catálogo</td></tr>
  <tr><td>Não mostra o ROI</td><td>Calcula retorno financeiro</td></tr>
  <tr><td>Envia por e-mail e espera</td><td>Apresenta ao vivo e conduz próximo passo</td></tr>
</table>

<h2>Estrutura da proposta vencedora</h2>
<ol>
  <li><strong>Contexto:</strong> "Com base na nossa conversa, entendemos que vocês buscam X e o problema atual é Y."</li>
  <li><strong>Nossa solução:</strong> mix recomendado especificamente para o negócio — não catálogo completo</li>
  <li><strong>Diferencial:</strong> o que nos separa dos outros fornecedores no que importa para este cliente</li>
  <li><strong>Números:</strong> custo por unidade, margem estimada do cliente, prazo de retorno do pedido mínimo</li>
  <li><strong>Condições:</strong> prazo de pagamento, entrega, pedido mínimo, política de troca</li>
  <li><strong>Próximo passo:</strong> data específica para retorno — nunca "fica à vontade pra dar uma olhada"</li>
</ol>

<h2>Linguagem de ROI — como falar com o decisor</h2>
<p><strong>Fórmula de margem bruta:</strong></p>
<p><strong>Margem bruta = (Preço de venda − Custo) ÷ Preço de venda × 100</strong></p>

<p><strong>Exemplo de apresentação com ROI:</strong><br>
"Fiz o cálculo baseado no giro que você me informou. Se você comprar 200 unidades a R$18 e vender a R$35, você gera R$3.400 de margem bruta nesse lote. Com nosso prazo de 30 dias, você provavelmente já vendeu 60-70% antes de pagar."</p>

<h2>Por que apresentar ao vivo supera envio por e-mail</h2>
<ul>
  <li>Você controla o ritmo da apresentação</li>
  <li>Trata objeções em tempo real — antes que o cliente decida sozinho</li>
  <li>Define o próximo passo imediatamente — sem ficar aguardando retorno</li>
  <li>Percebe o que gerou interesse (linguagem corporal, perguntas, silêncio)</li>
  <li>Proposta por e-mail compete com 50 outros e-mails — apresentação ao vivo tem atenção total</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Por que apresentar a proposta ao vivo é superior a enviar por e-mail?',
          options: [
            'Porque o e-mail pode cair no spam',
            'Porque você controla o ritmo, trata objeções em tempo real e define o próximo passo imediatamente',
            'Porque o cliente presta mais atenção em reunião',
            'Porque fica mais fácil dar desconto quando necessário'
          ],
          correct: 1,
          explanation: 'Proposta por e-mail compete com dezenas de outros e-mails e o cliente decide sozinho, muitas vezes sem entender os diferenciais. Ao vivo, você controla o ritmo, percebe onde há dúvida, trata a objeção antes que ela seja conclusão, e sai da reunião com próximo passo definido — não "vou pensar e retorno".'
        },
        {
          question: 'Monte o argumento de ROI: produto custa R$22, vende a R$45, 150 unidades, 28 dias de prazo.',
          options: [
            'Margem de 51% — R$3.450 de margem bruta no lote',
            'Margem de 22% — R$3.300 de custo total',
            'ROI de 100% em 28 dias',
            'Lucro líquido de R$3.300'
          ],
          correct: 0,
          explanation: 'Custo total: 150 × R$22 = R$3.300. Receita total: 150 × R$45 = R$6.750. Margem bruta: R$3.450 (51,1%). Com 28 dias de prazo, se o giro for 15-20 dias, o cliente provavelmente já recebeu parte das vendas antes de pagar — o lote se financia com o próprio giro. Este é o argumento que fecha.'
        },
        {
          question: 'O que distingue uma proposta específica de uma proposta genérica no B2B?',
          options: [
            'O preço mais baixo',
            'O número de produtos oferecidos',
            'A proposta específica começa pela dor do cliente, propõe mix personalizado e calcula o ROI para aquele negócio — não um catálogo enviado a todos',
            'O design visual da proposta'
          ],
          correct: 2,
          explanation: 'Proposta genérica: tabela de preços, catálogo completo, sem contexto. Proposta específica: "Com base na nossa conversa, entendemos que X é o problema e Y é o que vocês precisam." Isso demonstra que você ouviu e pensou no negócio do cliente — não apenas copiou e colou sua tabela padrão.'
        },
        {
          question: 'Ao finalizar uma proposta, qual deve ser o próximo passo definido?',
          options: [
            '"Fica à vontade pra ver e quando quiser a gente conversa"',
            '"Pode me ligar se tiver dúvidas"',
            'Data e formato específicos: "Posso falar com você quinta às 14h para ver sua avaliação?"',
            'Enviar e-mail de follow-up em 1 semana'
          ],
          correct: 2,
          explanation: 'Sem próximo passo específico, a proposta fica "em avaliação" indefinidamente. A última coisa que você deve dizer ao apresentar é a data e formato do próximo contato. Isso mantém o momentum e evita o cemitério das propostas "em análise".'
        }
      ]
    },
    {
      id: 'mod-5-4-negociacao-atacado',
      title: 'Negociação no Atacado',
      description: 'O impacto real do desconto na margem, táticas comuns de compradores B2B e como definir próximos passos concretos.',
      duration: 30,
      content: `
<h2>O desconto que mata sua margem</h2>
<p><strong>Desconto de 5% num produto com margem de 25% elimina 20% do seu lucro.</strong></p>
<p>Nunca dê desconto sem contrapartida.</p>
<table>
  <tr><th>Em vez de desconto puro</th><th>Ofereça em troca de algo</th></tr>
  <tr><td>"X% se fechar hoje"</td><td>Volume mínimo maior, pedido imediato, prazo menor</td></tr>
  <tr><td>"Posso ver isso aqui"</td><td>"Se você dobrar o volume, consigo trabalhar melhor o preço"</td></tr>
  <tr><td>Condição especial</td><td>Exclusividade por região ou categoria</td></tr>
</table>

<h2>Táticas comuns de compradores B2B — e como responder</h2>
<table>
  <tr><th>Tática do comprador</th><th>O que está fazendo</th><th>Sua resposta</th></tr>
  <tr><td>"O concorrente ofereceu X% menos"</td><td>Ancoragem por preço externo</td><td>"Entendo. Me conta — o produto é idêntico? Entrega, qualidade de lote e suporte entram no custo total."</td></tr>
  <tr><td>"Vai ter que melhorar bastante"</td><td>Pressão sem âncora específica</td><td>"Me diz onde precisa chegar — aí eu sei se consigo ou não, e o que precisaria em troca."</td></tr>
  <tr><td>"Preciso levar pra diretoria"</td><td>Evasão ou processo real</td><td>"Claro. O que a diretoria vai perguntar que posso te ajudar a responder agora?"</td></tr>
  <tr><td>[Silêncio após proposta]</td><td>Pressão psicológica</td><td>Fique em silêncio também. Quem fala primeiro cede primeiro.</td></tr>
</table>

<h2>Fechamento B2B — próximos passos concretos</h2>
<p>No B2B nunca "feche" — defina o próximo passo. Mesmo "próxima reunião com o diretor" é progresso mensurável.</p>
<table>
  <tr><th>Momento</th><th>Frase de próximo passo</th></tr>
  <tr><td>Após apresentação</td><td>"Quais são as próximas etapas do processo aí?"</td></tr>
  <tr><td>Aguardando aprovação</td><td>"Posso ligar quarta pra saber como andou?"</td></tr>
  <tr><td>Pedido teste</td><td>"Que tal começarmos com um pedido piloto de [X unidades]?"</td></tr>
  <tr><td>Objeção de timing</td><td>"Para quando faz mais sentido revisitar isso?"</td></tr>
</table>

<h2>Regras das concessões</h2>
<ul>
  <li>Faça concessões decrescentes — a primeira é maior, as seguintes menores</li>
  <li>Nunca conceda na mesma velocidade do cliente — demore antes de cada concessão</li>
  <li>Valorize cada concessão: "consegui R$280, mas é o máximo que consigo"</li>
  <li>Sempre peça algo em troca: "se você fechar agora / levar os dois / pagar à vista"</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Comprador quer 12% de desconto, você tem no máximo 6%. O que fazer?',
          options: [
            'Oferecer os 6% imediatamente para não perder o negócio',
            'Recusar e não negociar',
            'Perguntar de onde veio o número e o que ele daria em contrapartida para você conseguir chegar lá',
            'Dar os 12% e compensar em outra venda'
          ],
          correct: 2,
          explanation: 'Nunca movimente no preço sem entender a origem do número e sem pedir contrapartida. "De onde veio esse 12%?" pode revelar um número aleatório que ele jogou para testar. E se você puder chegar mais perto, precisa de algo em troca: volume maior, prazo menor, exclusividade. Desconto sem contrapartida é presente sem razão.'
        },
        {
          question: 'Você apresentou a proposta e o comprador ficou em silêncio por 10 segundos. O que você faz?',
          options: [
            'Preencher o silêncio com mais informações sobre o produto',
            'Oferecer um desconto preventivo',
            'Ficar em silêncio também — quem fala primeiro, cede primeiro',
            'Perguntar "O que você achou?" imediatamente'
          ],
          correct: 2,
          explanation: 'O silêncio é uma tática de negociação clássica — desconfortável para quem não conhece. O comprador espera que você preencha o vácuo com concessões. Fique em silêncio. Se passar de 20-30 segundos sem movimento, diga com calma: "O que você está pensando?" — não "tem problema?"'
        },
        {
          question: 'Desconto de 5% em produto com margem de 25% representa qual impacto no lucro?',
          options: [
            '5% de redução no lucro',
            '10% de redução no lucro',
            '20% de redução no lucro',
            'Impacto mínimo, menos de 2%'
          ],
          correct: 2,
          explanation: 'A conta: margem de 25% significa R$25 de lucro em cada R$100 vendido. Desconto de 5% = R$5 a menos. R$5 ÷ R$25 = 20% do lucro eliminado. Um desconto que parece pequeno percentualmente sobre o preço pode destruir uma fatia enorme da margem. Por isso cada concessão de preço exige contrapartida em volume, prazo ou condição.'
        },
        {
          question: 'Comprador diz "precisarei levar pra diretoria". Qual a resposta mais estratégica?',
          options: [
            'Perguntar quando a diretoria se reúne e aguardar',
            'Pedir para apresentar pessoalmente para a diretoria',
            '"Claro. O que a diretoria vai perguntar que posso te ajudar a responder agora?"',
            'Dar um desconto adicional para facilitar a aprovação interna'
          ],
          correct: 2,
          explanation: 'Essa resposta faz duas coisas: descobre se é processo real ou evasão, e arma o gerente para vencer internamente. Se a diretoria vai perguntar sobre ROI, prazo de retorno e risco — você pode preparar respostas prontas agora. Se o gerente não sabe o que a diretoria vai perguntar, provavelmente não tem acesso à decisão.'
        }
      ]
    },
    {
      id: 'mod-5-5-relacionamento-carteira',
      title: 'Relacionamento e Gestão de Carteira B2B',
      description: 'Cadência de relacionamento, estratégias de expansão de conta e como pedir indicação no B2B.',
      duration: 25,
      content: `
<h2>A cadência de relacionamento</h2>
<table>
  <tr><th>Frequência</th><th>Tipo de contato</th><th>Objetivo</th></tr>
  <tr><td>Toda entrega</td><td>Confirmação de recebimento + qualidade</td><td>Detectar problema antes de virar reclamação</td></tr>
  <tr><td>Quinzenal/mensal</td><td>Check-in de giro e estoque</td><td>Identificar oportunidade de reposição</td></tr>
  <tr><td>Trimestral</td><td>Revisão de mix e resultados</td><td>Expandir categorias, propor novo produto</td></tr>
  <tr><td>Esporádico / sem motivo</td><td>Informação útil sem vender</td><td>Construir confiança de longo prazo</td></tr>
</table>

<h2>Expansão de conta — as perguntas certas</h2>
<p>Vender mais para quem já compra custa 5× menos e fecha 3× mais rápido do que abrir cliente novo.</p>
<ul>
  <li>Quais categorias o cliente ainda compra com o concorrente?</li>
  <li>Qual produto você tem que ele não testou ainda?</li>
  <li>Qual volume ele poderia aumentar se tivesse condição melhor?</li>
  <li>Ele tem filial, loja 2, sócio que poderia indicar?</li>
</ul>

<h2>Plano de expansão — exemplo prático</h2>
<ol>
  <li><strong>Descoberta:</strong> perguntar onde compra as outras categorias e como está o fornecedor atual</li>
  <li><strong>Piloto:</strong> propor mix pequeno (5-10 produtos) para teste de 30 dias</li>
  <li><strong>Argumento:</strong> "Você já conhece nossa entrega em higiene. Cosméticos seguem o mesmo padrão."</li>
  <li><strong>Revisão:</strong> 30 dias depois apresentar resultado e propor expansão</li>
</ol>

<h2>Como pedir indicação no B2B</h2>
<p>"Fico muito feliz que o resultado foi esse. Me ajuda com uma coisa — você conhece algum outro lojista ou distribuidor que poderia se beneficiar do mesmo resultado? Não precisa ser apresentação formal, só um nome e contato já me ajuda muito."</p>

<h2>O risco de contato só quando há problema</h2>
<p>Cliente B2B que você só liga quando há problema percebe que você existe apenas quando algo vai mal — você virou custo, não parceiro. Quando o concorrente aparecer com preço 5% menor e abordagem consultiva, o cliente vai comparar. Presença proativa cria lealdade que preço não cria.</p>
      `.trim(),
      quiz: [
        {
          question: 'Cliente B2B compra toda semana, mas você só liga quando há problema. Qual o risco real?',
          options: [
            'Nenhum — o cliente está satisfeito se não reclamou',
            'O cliente percebe que você é custo, não parceiro — quando o concorrente aparecer com preço similar e presença consultiva, vai comparar',
            'O risco é de excesso de contato desnecessário',
            'O cliente pode pedir desconto se você ligar com muita frequência'
          ],
          correct: 1,
          explanation: 'Presença só em problema cria uma associação negativa: você = problema. O concorrente que liga para compartilhar uma tendência, informar um novo produto ou perguntar como está o giro está construindo o relacionamento que você deveria ter. Quando der a oportunidade de comparar, o cliente vai escolher quem está presente.'
        },
        {
          question: 'Por que expandir uma conta existente é mais eficiente que abrir um cliente novo?',
          options: [
            'Porque o cliente existente sempre paga melhor',
            'Porque custa 5× menos e fecha 3× mais rápido — você já tem confiança estabelecida, histórico e acesso ao decisor',
            'Porque é mais fácil dar desconto para clientes existentes',
            'Porque você não precisa fazer proposta formal'
          ],
          correct: 1,
          explanation: 'Abrir cliente novo exige criar confiança do zero, passar por todo o processo de qualificação e aprovação, e competir com fornecedor atual que já tem vantagem de inércia. No cliente existente, você tem histórico positivo, acesso direto ao decisor e conhece a operação. Expandir para nova categoria é conversa, não venda do zero.'
        },
        {
          question: 'Qual a frequência de contato recomendada para acompanhar giro e estoque de clientes ativos?',
          options: [
            'Apenas quando o cliente ligar',
            'Uma vez por ano na revisão de contrato',
            'Quinzenal ou mensal — check-in proativo de giro e estoque para identificar reposição',
            'Apenas quando houver novo produto para oferecer'
          ],
          correct: 2,
          explanation: 'O check-in quinzenal ou mensal de giro tem dois objetivos: detectar oportunidade de reposição antes que o cliente procure concorrente, e manter presença de parceiro ativo. Clientes que têm ruptura de estoque muitas vezes não te avisam — eles simplesmente compram do próximo que está disponível.'
        },
        {
          question: 'Qual a melhor forma de pedir indicação para um cliente B2B satisfeito?',
          options: [
            'Enviar e-mail formal pedindo indicação',
            'Oferecer comissão por indicação',
            'Em conversa natural: "Você conhece algum outro lojista que poderia se beneficiar do mesmo resultado? Só um nome já me ajuda muito"',
            'Esperar que o cliente indique espontaneamente'
          ],
          correct: 2,
          explanation: 'Indicação pedida em contexto de resultado positivo tem altíssima taxa de conversão. O timing é crucial: logo após o cliente expressar satisfação. A linguagem deve ser leve ("só um nome") — não um formulário de indicação ou programa de pontos. No B2B, a indicação de quem você conhece vale mais do que qualquer prospecção fria.'
        }
      ]
    },
    {
      id: 'mod-5-6-simulacoes-atacado',
      title: 'Simulações Completas — Atacado B2B',
      description: 'Cenários reais de primeiro contato, objeção de preço, retenção, follow-up e cliente que só compra por menor preço.',
      duration: 25,
      content: `
<h2>Cenário 1 — Primeiro contato por telefone</h2>
<p><strong>Cliente:</strong> "Olá, vi vocês num grupo e quero saber preços."</p>
<p><strong>Você:</strong> "Olá! Claro. Pra montar a proposta certa, me conta rapidinho — qual linha você está buscando e qual o volume médio mensal que você costuma trabalhar?"</p>
<p><strong>Cliente:</strong> "Higiene pessoal, uns 200 peças por mês."</p>
<p><strong>Você:</strong> "Ótimo. Você compra de fornecedor único ou divide com outros? E tem algum produto específico que costuma ter problema de ruptura aí?"</p>
<p><em>Por que funciona:</em> antes de qualquer preço, você qualificou volume, comportamento de compra e dor atual. Agora a proposta vai ser específica, não uma tabela genérica.</p>

<h2>Cenário 2 — Objeção de preço no B2B</h2>
<p><strong>Cliente:</strong> "Tá bem acima do que pago hoje."</p>
<p><strong>Você:</strong> "Entendo. Pode me contar mais — tá acima em valor unitário ou em custo total incluindo frete?"</p>
<p><strong>Cliente:</strong> "Unitário mesmo."</p>
<p><strong>Você:</strong> "Me conta, o frete do fornecedor atual é cobrado à parte? Porque a gente já inclui no valor. Dependendo da sua localização, o custo total pode ficar igual ou abaixo. Posso te mostrar o comparativo?"</p>
<p><em>Por que funciona:</em> antes de negociar preço, você explorou se a comparação é justa. Muitas vezes o "mais caro" some quando o frete é embutido.</p>

<h2>Cenário 3 — Retenção de cliente que quer sair</h2>
<p><strong>Cliente:</strong> "Vou pausar os pedidos. Achei outro fornecedor mais em conta."</p>
<p><strong>Você:</strong> "Entendo. Antes de você ir, me conta — foi só o preço ou teve alguma outra coisa que deixou a desejar no nosso serviço?"</p>
<p><strong>Cliente:</strong> "Não, o serviço foi sempre bom. É o custo mesmo."</p>
<p><strong>Você:</strong> "Aprecio você ser honesto. Posso te fazer uma proposta de lealdade? Se você mantiver o volume médio dos últimos 3 meses, consigo rever a condição. Você me dá 15 minutos pra montar os números?"</p>

<h2>Cenário 4 — Follow-up após proposta sem retorno</h2>
<p><strong>Você:</strong> "Boa tarde, [nome]. Mandei a proposta há 5 dias e queria saber se teve chance de ver. Não quero atrapalhar — só garantir que não ficou nenhuma dúvida."</p>
<p><strong>Cliente:</strong> "Ah sim, vi sim. Ainda estou avaliando."</p>
<p><strong>Você:</strong> "Faz sentido. O que está pesando mais na avaliação? Posso ajudar a resolver alguma questão específica."</p>

<h2>Cenário 5 — Cliente que só compra pelo menor preço</h2>
<p><strong>Cliente:</strong> "Mandei e-mail pra 3 fornecedores e vou fechar com quem der o menor preço."</p>
<p><strong>Você:</strong> "Entendo! Antes de tomar essa decisão só por preço, posso te fazer uma pergunta? Se os três tiverem o mesmo produto, o que vai diferenciar quando tiver um problema de entrega ou um lote com defeito? O preço você compara em 5 minutos — mas o suporte você só descobre depois que já fechou. Me dá 10 minutos pra te mostrar como a gente funciona?"</p>
<p><em>Por que funciona:</em> você não competiu no preço — você mudou o critério de decisão antes de qualquer número.</p>

<h2>Autoavaliação — Atacado B2B</h2>
<ul>
  <li>Quais clientes você visita/liga apenas quando há problema?</li>
  <li>Quais clientes compram só 1 categoria e poderiam comprar mais?</li>
  <li>Qual cliente tem perfil de indicador e você nunca pediu indicação?</li>
  <li>Qual o seu BATNA na próxima negociação de desconto?</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'No Cenário 2, por que perguntar se o frete é cobrado à parte antes de negociar preço?',
          options: [
            'Para ganhar tempo na negociação',
            'Para revelar que o custo total pode ser igual ou menor quando o frete está embutido — a comparação pode ser injusta',
            'Para parecer mais profissional',
            'Para descobrir o fornecedor atual e pesquisar o preço dele'
          ],
          correct: 1,
          explanation: 'Comparação justa é custo total, não preço unitário. Muitos compradores comparam unitário sem incluir frete, embalagem, prazo de entrega e suporte. Ao revelar isso antes de mover no preço, você pode eliminar a objeção sem dar desconto — o "mais caro" desaparece quando todos os custos são incluídos.'
        },
        {
          question: 'No Cenário 5, qual foi a estratégia usada contra o comprador que quer apenas o menor preço?',
          options: [
            'Oferecer o menor preço possível',
            'Pedir para ser incluído na cotação',
            'Mudar o critério de decisão antes de qualquer número — de preço para qualidade de suporte e processo',
            'Dar desconto condicionado ao fechamento imediato'
          ],
          correct: 2,
          explanation: 'Competir só por preço numa licitação informal você vai perder — sempre haverá alguém disposto a margens menores. A estratégia inteligente é mudar a pergunta que o comprador está fazendo. Em vez de "quem é mais barato?" você o leva para "quem me dá menos risco?" — e aí você compete no terreno certo.'
        },
        {
          question: 'No follow-up de proposta sem retorno, qual é o objetivo da pergunta "O que está pesando mais na avaliação?"',
          options: [
            'Forçar uma decisão imediata',
            'Identificar a objeção real que está bloqueando o avanço para tratar especificamente',
            'Criar pressão para fechar',
            'Descobrir o preço do concorrente'
          ],
          correct: 1,
          explanation: '"Ainda estou avaliando" é vago — pode ser objeção de preço, falta de aprovação interna, dúvida técnica ou apenas procrastinação. A pergunta "o que está pesando mais" torna a objeção concreta e tratável. Uma objeção específica tem resposta específica; "estou avaliando" não tem.'
        },
        {
          question: 'Na tentativa de retenção do cliente que quer sair por preço, qual foi o primeiro passo crítico?',
          options: [
            'Oferecer desconto imediatamente',
            'Confirmar que a saída era definitiva',
            'Perguntar se havia algum outro problema além do preço antes de negociar',
            'Apresentar os benefícios do serviço'
          ],
          correct: 2,
          explanation: 'Antes de negociar preço para reter, descubra se há outros problemas. Um cliente insatisfeito com o serviço que diz "é o preço" pode estar usando o preço como desculpa. Se você der desconto sem resolver o problema real, ele vai embora de qualquer forma depois. A pergunta honesta primeiro protege você de investir desconto numa causa perdida.'
        }
      ]
    }
  ]
}
