import type { LmsTrilha } from './types'

export const trilha6: LmsTrilha = {
  id: 'trilha-6',
  slug: 'vendas-online',
  title: 'Vendas Online e Atendimento Web',
  description: 'Mentalidade digital, funil de vendas online, copywriting, WhatsApp, objeções e pós-venda para vendas via web e redes sociais.',
  icon: '💻',
  color: '#7C3AED',
  xpReward: 500,
  area: 'vendas',
  lessons: [
    {
      id: 'mod-6-1-mentalidade-online',
      title: 'Mentalidade de Venda Online',
      description: 'Como o cliente online pensa diferente do presencial, os 5 bloqueios que sabotam vendas digitais e como construir confiança à distância.',
      duration: 25,
      content: `
<h2>Cliente online vs. cliente presencial</h2>
<table>
  <tr><th>Cliente presencial</th><th>Cliente online</th></tr>
  <tr><td>Entrou na loja — já tem intenção</td><td>Está navegando — pode não ter intenção clara</td></tr>
  <tr><td>Você controla o ambiente</td><td>Ele controla o ambiente — pode fechar aba a qualquer momento</td></tr>
  <tr><td>Comunicação não-verbal disponível</td><td>Só texto, foto e vídeo — tudo tem que ser explícito</td></tr>
  <tr><td>Objeção surgiu — você responde ao vivo</td><td>Objeção surgiu — ele vai embora sem falar</td></tr>
  <tr><td>Relacionamento é fácil — rosto a rosto</td><td>Confiança tem que ser construída com provas</td></tr>
  <tr><td>Urgência criada com presença</td><td>Urgência criada com palavras e gatilhos</td></tr>
</table>

<h2>Os 5 bloqueios que sabotam vendas online</h2>
<table>
  <tr><th>#</th><th>Bloqueio</th><th>Consequência</th><th>Antídoto</th></tr>
  <tr><td>1</td><td>Resposta lenta</td><td>Cliente esfria e compra do concorrente</td><td>Meta: responder em menos de 5 minutos em horário comercial</td></tr>
  <tr><td>2</td><td>Linguagem robótica/formal</td><td>Parece atendimento automático — desengaja</td><td>Escrever como fala, com nome do cliente</td></tr>
  <tr><td>3</td><td>Não mostrar o produto</td><td>Dúvida vira desistência</td><td>Vídeo, foto com contexto, review de cliente real</td></tr>
  <tr><td>4</td><td>Não pedir para comprar</td><td>Cliente fica esperando convite que não vem</td><td>Sempre terminar com chamada para ação clara</td></tr>
  <tr><td>5</td><td>Ignorar follow-up</td><td>60-70% dos interessados compram depois de 1-3 follow-ups</td><td>Sequência de acompanhamento estruturada</td></tr>
</table>

<h2>Confiança online — os 4 pilares</h2>
<ul>
  <li><strong>Prova social:</strong> fotos de clientes reais usando o produto, avaliações com nome, antes e depois</li>
  <li><strong>Transparência:</strong> prazo de entrega, política de troca, como funciona o pagamento — antecipe as dúvidas</li>
  <li><strong>Consistência:</strong> resposta rápida sempre, mesmo que seja "já te respondo em X minutos"</li>
  <li><strong>Especialidade:</strong> você entende do produto — orientação genuína cria mais confiança do que desconto</li>
</ul>

<h2>O vendedor online de alta performance</h2>
<p>Não espera cliente perguntar. Antecipa dúvidas, envia conteúdo útil sem pedir nada, acompanha após a compra. No online, quem cuida do relacionamento entre compras cria o cliente que compra de novo sem pesquisar concorrente.</p>
      `.trim(),
      quiz: [
        {
          question: 'Cliente online some depois de perguntar preço. O que provavelmente aconteceu?',
          options: [
            'O preço estava muito alto',
            'Ele foi pesquisar concorrentes e/ou surgiu uma objeção que ele não verbalizou — o atendimento precisa prever e tratar as objeções antes que ele vá',
            'Ele mudou de ideia sobre comprar',
            'A resposta demorou muito'
          ],
          correct: 1,
          explanation: 'No online, o cliente não diz a objeção — ele some. "Preço alto" pode ser real ou pode ser "não confiei o suficiente para pagar esse valor". O antídoto é antecipar as objeções mais comuns antes que ele as tenha: prova social, garantia, forma de pagamento, prazo — tudo isso antes de ele perguntar.'
        },
        {
          question: 'Qual a meta de tempo de resposta em horário comercial para maximizar conversão online?',
          options: [
            'Até 1 hora',
            'Até 30 minutos',
            'Menos de 5 minutos — após 5 min a taxa de conversão cai drasticamente',
            'Até o final do dia'
          ],
          correct: 2,
          explanation: 'Estudos de vendas digitais mostram que a taxa de conversão cai 80% após 5 minutos de espera. O cliente online tem atenção fragmentada — em 5 minutos ele pode ter feito outra pesquisa, aberto outra aba, ou simplesmente esquecido. Velocidade de resposta é o principal diferencial operacional no atendimento online.'
        },
        {
          question: 'Por que linguagem formal e robótica prejudica conversão em vendas online?',
          options: [
            'Porque os clientes preferem informalidade',
            'Porque parece atendimento automático — sem personalidade, sem nome, sem empatia — o cliente sente que está falando com um bot e desengaja',
            'Porque é difícil de entender',
            'Porque não funciona no WhatsApp'
          ],
          correct: 1,
          explanation: '"Prezado cliente, informamos que o produto está disponível" versus "Oi [nome]! Sim, esse produto tá disponível — quer que eu mande foto e vídeo mostrando ele funcionando?" — a segunda versão cria conexão humana imediata. No online, percepção de humanidade é fator de conversão.'
        },
        {
          question: 'Quais são os 4 pilares de confiança no ambiente online?',
          options: [
            'Preço, entrega, qualidade, garantia',
            'Prova social, transparência, consistência e especialidade',
            'Fotos, vídeos, avaliações, certificados',
            'Site profissional, redes sociais, anúncios, WhatsApp'
          ],
          correct: 1,
          explanation: 'Prova social (clientes reais), transparência (antecipa dúvidas sobre entrega e pagamento), consistência (resposta rápida sempre — mesmo que seja "já retorno") e especialidade (orientação genuína que demonstra conhecimento do produto). Desconto não está na lista — desconto sem confiança não fecha.'
        }
      ]
    },
    {
      id: 'mod-6-2-funil-digital',
      title: 'Funil de Vendas Digital',
      description: 'As 6 etapas do funil online, onde a maioria das vendas se perde e como identificar e corrigir os gargalos.',
      duration: 25,
      content: `
<h2>O funil de vendas digital — 6 etapas</h2>
<table>
  <tr><th>Etapa</th><th>O que acontece</th><th>Ação do vendedor</th></tr>
  <tr><td>1. Descoberta</td><td>Cliente vê seu produto/perfil pela primeira vez</td><td>Conteúdo atrativo, foto e vídeo de qualidade</td></tr>
  <tr><td>2. Interesse</td><td>Clica, salva, manda mensagem perguntando</td><td>Resposta rápida, informação clara, cria curiosidade</td></tr>
  <tr><td>3. Consideração</td><td>Pesquisa mais, compara com concorrente</td><td>Prova social, diferencial claro, tira dúvidas</td></tr>
  <tr><td>4. Intenção</td><td>Perguntou preço, pediu forma de pagamento</td><td>Proposta clara, urgência, CTA direto</td></tr>
  <tr><td>5. Decisão</td><td>Está prestes a comprar — pode travar aqui</td><td>Eliminar fricção no pagamento, confirmar prazo</td></tr>
  <tr><td>6. Pós-venda</td><td>Comprou — agora vira cliente fiel ou some</td><td>Confirmar recebimento, pedir avaliação, próxima compra</td></tr>
</table>

<h2>Onde a maioria das vendas se perde</h2>
<ul>
  <li><strong>Etapa 2 → 3:</strong> resposta demorou mais de 5 minutos — cliente esfriou</li>
  <li><strong>Etapa 3 → 4:</strong> faltou prova social para gerar confiança suficiente</li>
  <li><strong>Etapa 4 → 5:</strong> proposta confusa, preço sem contexto, sem chamada para ação clara</li>
  <li><strong>Etapa 5 → decisão:</strong> fricção no pagamento (link não funcionou, não tem o Pix, complicou)</li>
  <li><strong>Etapa 6 → novo ciclo:</strong> sem follow-up pós-venda = cliente não volta por si só</li>
</ul>

<h2>Como identificar o gargalo do seu funil</h2>
<p>Pergunte: <em>onde estou perdendo mais clientes?</em></p>
<table>
  <tr><th>Sintoma</th><th>Gargalo provável</th></tr>
  <tr><td>Muita visualização, pouca mensagem</td><td>Etapa 1-2: conteúdo não converte curiosidade em contato</td></tr>
  <tr><td>Muita mensagem, pouca proposta solicitada</td><td>Etapa 2-3: atendimento não gera confiança suficiente</td></tr>
  <tr><td>Muito interesse, pouco fechamento</td><td>Etapa 4-5: faltou CTA claro ou urgência</td></tr>
  <tr><td>Fechou mas não volta</td><td>Etapa 6: sem pós-venda estruturado</td></tr>
</table>

<h2>A regra do follow-up</h2>
<p><strong>60-70% das vendas online fecham depois do primeiro contato.</strong> Quem não faz follow-up abandona a maioria das vendas potenciais. Follow-up não é incomodo — é serviço.</p>
<p>Cadência simples:</p>
<ul>
  <li>Dia 1: resposta ao interesse</li>
  <li>Dia 2: follow-up com informação nova (vídeo, avaliação de cliente)</li>
  <li>Dia 4: urgência real ou diferencial</li>
  <li>Dia 7: última mensagem — "Ainda posso ajudar?"</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Cliente perguntou preço, você respondeu, ele sumiu. Em qual etapa do funil ele travou?',
          options: [
            'Etapa 2 — Interesse',
            'Etapa 3 — Consideração',
            'Entre etapa 4 (Intenção) e etapa 5 (Decisão) — tinha intenção mas algo travou na hora de decidir',
            'Etapa 1 — Descoberta'
          ],
          correct: 2,
          explanation: 'Perguntou preço = intenção declarada (etapa 4). Somiu após receber = travou entre 4 e 5. Causas mais comuns: proposta sem contexto de valor, sem prova social, sem urgência, sem CTA claro. "R$89" dito sozinho não fecha — "R$89, com entrega em 2 dias e troca garantida — quer que eu separe?" tem muito mais chance.'
        },
        {
          question: 'Você tem muita visualização no Instagram mas pouquíssimas mensagens. Qual o gargalo?',
          options: [
            'Preço alto demais',
            'Produto errado para o público',
            'Etapa 1-2: o conteúdo não converte curiosidade em contato — falta CTA claro ou a proposta de valor não está clara na bio/posts',
            'Falta de anúncios pagos'
          ],
          correct: 2,
          explanation: 'Visualização = atenção capturada (etapa 1 ok). Sem mensagem = etapa 2 com problema. O conteúdo não está gerando desejo de contato. Causas: bio sem link claro, posts sem CTA, fotos sem contexto de uso, sem prova de que o produto resolve algo. A correção começa no conteúdo, não no preço.'
        },
        {
          question: 'Por que 60-70% das vendas online fecham depois do primeiro contato?',
          options: [
            'Porque clientes online são indecisos por natureza',
            'Porque a maioria das pessoas precisa de múltiplos pontos de contato para ganhar confiança e urgência suficientes para decidir — follow-up é serviço, não pressão',
            'Porque o preço está sempre alto no primeiro contato',
            'Porque clientes precisam consultar outros antes de comprar'
          ],
          correct: 1,
          explanation: 'Decisão de compra online envolve confiança e momento certo. O primeiro contato raramente tem os dois simultaneamente. O follow-up correto adiciona informação (vídeo de uso, avaliação de cliente), cria urgência (estoque limitado, promoção por prazo) e mantém o produto na mente quando o momento certo aparecer.'
        },
        {
          question: 'Qual etapa do funil é mais ignorada e tem mais impacto em recompra?',
          options: [
            'Etapa 1 — Descoberta',
            'Etapa 3 — Consideração',
            'Etapa 4 — Intenção',
            'Etapa 6 — Pós-venda: sem acompanhamento, o cliente comprou uma vez e some para sempre'
          ],
          correct: 3,
          explanation: 'A maioria dos vendedores fecha a venda e desaparece. O cliente que comprou é 5x mais fácil de converter do que um novo prospecto — ele já confia, já conhece o produto, já sabe o processo. Sem pós-venda estruturado (confirmação de recebimento, avaliação, próxima sugestão), essa vantagem toda é desperdiçada.'
        }
      ]
    },
    {
      id: 'mod-6-3-copywriting-online',
      title: 'Copywriting para Venda Online',
      description: 'Fórmula de descrição de produto que vende, os 6 gatilhos mentais em texto e como escrever chamadas para ação que convertem.',
      duration: 30,
      content: `
<h2>Fórmula de descrição de produto</h2>
<p><strong>Fórmula PAS+CTA:</strong> Problema → Agitação → Solução → Chamada para Ação</p>

<h3>Exemplo — Serum facial</h3>
<ul>
  <li><strong>Problema:</strong> "Pele ressecada que descasca até com hidratante normal?"</li>
  <li><strong>Agitação:</strong> "Ressecamento causa envelhecimento precoce e manchas que difícil de tratar depois"</li>
  <li><strong>Solução:</strong> "Serum Hialurônico 2% — hidratação profunda em 7 dias, sem oleosidade, apto pele sensível"</li>
  <li><strong>CTA:</strong> "Manda mensagem e te explico o protocolo certo pro seu tipo de pele"</li>
</ul>

<h2>Os 6 gatilhos mentais em texto</h2>
<table>
  <tr><th>Gatilho</th><th>Como usar</th><th>Exemplo</th></tr>
  <tr><td>Escassez</td><td>Quantidade ou tempo limitado — real</td><td>"Últimas 8 unidades em estoque"</td></tr>
  <tr><td>Urgência</td><td>Prazo que muda algo</td><td>"Pedidos até sexta chegam antes do fim de semana"</td></tr>
  <tr><td>Prova social</td><td>Número ou nome real de quem já comprou</td><td>"47 clientes compraram esse mês"</td></tr>
  <tr><td>Autoridade</td><td>Conhecimento ou resultado que comprova</td><td>"Recomendado por dermatologistas"</td></tr>
  <tr><td>Reciprocidade</td><td>Dar antes de pedir</td><td>"Manda sua dúvida — te explico sem compromisso"</td></tr>
  <tr><td>Comprometimento</td><td>Pequeno sim leva ao grande sim</td><td>"Me conta qual seu maior problema de pele"</td></tr>
</table>

<h2>Chamadas para ação que convertem</h2>
<table>
  <tr><th>CTA fraca</th><th>CTA forte</th></tr>
  <tr><td>"Se interessar, entre em contato"</td><td>"Manda 'QUERO' aqui que já te separo uma unidade"</td></tr>
  <tr><td>"Estamos à disposição"</td><td>"Manda mensagem agora — respondo em minutos"</td></tr>
  <tr><td>"Saiba mais"</td><td>"Me conta sua rotina de pele e te indico o protocolo certo"</td></tr>
  <tr><td>"Compre agora"</td><td>"Paga via Pix e já saiu hoje — quer que eu mande o link?"</td></tr>
</table>

<h2>Copywriting para WhatsApp — regras específicas</h2>
<ul>
  <li>Mensagens curtas — máximo 3 linhas por bolha</li>
  <li>Quebrar texto em múltiplas mensagens em vez de um bloco</li>
  <li>Emoji com moderação — reforça tom, não substitui argumento</li>
  <li>Nome do cliente pelo menos 1x na mensagem</li>
  <li>Sempre terminar com pergunta ou CTA — nunca ponto final sem convite</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Qual a sequência correta da fórmula PAS+CTA?',
          options: [
            'Produto, Atributo, Solução, Chamada para Ação',
            'Problema, Agitação, Solução, Chamada para Ação',
            'Preço, Avaliação, Solução, Compra',
            'Pergunta, Afirmação, Solução, Conteúdo'
          ],
          correct: 1,
          explanation: 'PAS+CTA: começa pelo problema do cliente (não pelo produto), agita a consequência do problema (cria urgência emocional), apresenta a solução (produto como resposta), e termina com chamada para ação específica. Essa sequência imita a lógica natural de compra — o cliente se reconhece no problema, sente a dor da consequência, e quer a solução.'
        },
        {
          question: 'Qual a diferença entre urgência e escassez como gatilhos?',
          options: [
            'São a mesma coisa — ambos criam pressão para comprar',
            'Urgência é limitação de TEMPO ("só até sexta"), escassez é limitação de QUANTIDADE ("últimas 8 unidades") — ambos devem ser reais para não destruir confiança',
            'Escassez funciona para produtos físicos, urgência para serviços',
            'Urgência é mais eficaz que escassez em todos os contextos'
          ],
          correct: 1,
          explanation: 'Urgência = deadline temporal. Escassez = quantidade finita. Ambos criam o mesmo efeito psicológico (medo de perder), mas o mecanismo é diferente. A condição crítica: devem ser verdadeiros. Urgência falsa ("promoção" que nunca termina) e escassez falsa destroem credibilidade quando descobertos — e os clientes descobrem.'
        },
        {
          question: 'Por que mensagens longas e em bloco único prejudicam vendas no WhatsApp?',
          options: [
            'Porque o WhatsApp tem limite de caracteres',
            'Porque parece robótico e o cliente não lê — no WhatsApp o padrão de leitura é bolha curta, não email longo',
            'Porque o algoritmo do WhatsApp penaliza mensagens longas',
            'Porque é difícil de escrever'
          ],
          correct: 1,
          explanation: 'WhatsApp é ambiente de conversa, não de documento. Bloco de texto longo quebra o padrão de leitura do usuário e ativa a percepção de "mensagem de sistema" ou "spam". Máximo 3 linhas por bolha, quebrado em múltiplas mensagens, imita conversa humana natural — o cliente lê porque parece diálogo, não broadcast.'
        },
        {
          question: 'O gatilho de comprometimento pede uma ação pequena antes de pedir a compra. Por que isso funciona?',
          options: [
            'Porque o cliente esquece que disse sim antes',
            'Porque psicologicamente tendemos a agir de forma consistente com compromissos prévios — um pequeno sim cria predisposição para o sim maior',
            'Porque reduz o tempo da conversa',
            'Porque cria sensação de amizade'
          ],
          correct: 1,
          explanation: 'Princípio de consistência de Cialdini: uma vez que nos comprometemos com algo pequeno ("me conta seu tipo de pele"), tendemos a agir de forma consistente com esse compromisso. Quem respondeu sua pergunta de diagnóstico já investiu energia no processo — está mais próximo de comprar do que quem ainda não interagiu.'
        }
      ]
    },
    {
      id: 'mod-6-4-whatsapp-chat',
      title: 'Atendimento por WhatsApp e Chat',
      description: 'Roteiro de conversa que vende, mensagens de cada etapa do atendimento e cadência de follow-up que fecha sem incomodar.',
      duration: 30,
      content: `
<h2>O roteiro que vende — 5 etapas</h2>
<ol>
  <li><strong>Recepção calorosa:</strong> "Oi [nome]! Tudo bem? Em que posso ajudar hoje?" — nunca "olá, como posso ajudar"</li>
  <li><strong>Diagnóstico:</strong> uma pergunta que revela o que o cliente realmente precisa antes de apresentar produto</li>
  <li><strong>Apresentação personalizada:</strong> produto específico para a necessidade identificada — não catálogo</li>
  <li><strong>Prova:</strong> foto, vídeo ou avaliação de cliente real — não apenas descrição</li>
  <li><strong>CTA direto:</strong> "Quer que eu separe? Você paga via Pix ou cartão?"</li>
</ol>

<h2>Mensagens modelo por etapa</h2>
<p><strong>Recepção:</strong><br>
"Oi [nome]! 😊 Que bom que você entrou em contato. Me conta — você tá buscando pra sua pele ou pra presentear alguém?"</p>

<p><strong>Após diagnóstico (skincare):</strong><br>
"Perfeito. Pra pele oleosa com tendência a acne, o que funciona muito bem aqui é o tônico com ácido salicílico 2% da COSRX. Ele equilibra o sebo sem ressecar. Deixa eu te mandar um vídeo de como usar?"</p>

<p><strong>Após enviar informação:</strong><br>
"[Nome], o que você achou? Tem alguma dúvida sobre como usar ou sobre a entrega?"</p>

<p><strong>CTA de fechamento:</strong><br>
"Se quiser levar, é só confirmar aqui — pago via Pix agora já separo pra você. Entrega em [X] dias. 😊"</p>

<h2>Follow-up sem incomodar</h2>
<table>
  <tr><th>Timing</th><th>Mensagem</th></tr>
  <tr><td>1 dia após interesse sem compra</td><td>"[Nome], só passando pra saber se ficou alguma dúvida sobre o [produto]. Estou aqui pra ajudar 😊"</td></tr>
  <tr><td>3 dias — nova informação</td><td>"[Nome], separei esse review de uma cliente que tinha pele parecida com a que você me descreveu. Acho que pode te ajudar a decidir. [foto/vídeo]"</td></tr>
  <tr><td>7 dias — urgência real</td><td>"[Nome], só pra te avisar que esse produto tá quase esgotando — ficaram [X] unidades. Se ainda tiver pensando, posso separar pra você com segurança?"</td></tr>
  <tr><td>14 dias — último contato</td><td>"[Nome], não quero incomodar — se não for mais o momento, tudo bem! Mas se quiser, pode voltar quando precisar. Abraço!"</td></tr>
</table>

<h2>O que nunca fazer no WhatsApp de vendas</h2>
<ul>
  <li>Não enviar catálogo completo sem contexto — 300 produtos de uma vez mata conversão</li>
  <li>Não dizer "qualquer dúvida, estou à disposição" — fraca e passiva</li>
  <li>Não deixar a conversa morrer com "ok" ou "entendido" sem próxima ação</li>
  <li>Não fazer mais de 4 follow-ups — respeito ao espaço do cliente mantém a porta aberta</li>
  <li>Não prometer prazo de entrega sem conferir estoque real</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Por que fazer diagnóstico antes de apresentar o produto é crítico no WhatsApp?',
          options: [
            'Para ganhar tempo na conversa',
            'Para revelar a necessidade real e apresentar o produto certo — catálogo sem contexto confunde e afasta',
            'Para parecer mais profissional',
            'Para descobrir o orçamento antes de dar preço'
          ],
          correct: 1,
          explanation: 'Apresentar produto sem diagnóstico é como médico receitar remédio sem examinar. O cliente pode precisar de hidratante, mas se você apresentar 10 hidratantes ao mesmo tempo, ele vai ficar paralisado (paralysis by analysis) ou simplesmente ir embora. Uma boa pergunta de diagnóstico (tipo de pele, objetivo, queixas) te leva ao produto certo — e o cliente sente que você entendeu o problema dele.'
        },
        {
          question: 'Cliente não respondeu depois de 3 dias. Qual follow-up tem mais chance de reengajar?',
          options: [
            '"Oi [nome], você vai comprar ou não?"',
            '"Você recebeu minha última mensagem?"',
            '"[Nome], separei esse review de uma cliente com o mesmo perfil que você descreveu — pode te ajudar a decidir. [vídeo/foto]" — nova informação relevante, não cobrança',
            '"Última chance antes de encerrar sua reserva"'
          ],
          correct: 2,
          explanation: 'Follow-up com nova informação útil (review real, vídeo de uso, comparativo) não é cobrança — é serviço. O cliente que não comprou pode ter esquecido, ter ficado em dúvida ou estar esperando o momento certo. Um conteúdo novo que reativa a dúvida que bloqueou a compra tem muito mais chance do que uma mensagem de pressão.'
        },
        {
          question: 'Qual o número máximo de follow-ups recomendado antes de encerrar o contato?',
          options: [
            '10 — persistência vence',
            '1 — se não respondeu, não vai comprar',
            '4 follow-ups na cadência correta — depois disso, fechar com gentileza mantém a porta aberta sem incomodar',
            '7 — mercadinho de uma semana'
          ],
          correct: 2,
          explanation: '4 follow-ups bem espaçados cobrem as causas mais comuns de não-compra imediata: esqueceu, estava ocupado, tinha dúvida, estava esperando salário. Mais do que isso começa a incomodar — e o cliente bloqueia ou guarda rancor. O último follow-up gentil ("tudo bem se não for o momento — aqui se precisar") deixa porta aberta para futuras compras.'
        },
        {
          question: 'Por que enviar o catálogo completo de uma vez é um erro no atendimento por WhatsApp?',
          options: [
            'Porque o catálogo demora para carregar',
            'Porque cria paralysis by analysis — cliente com 300 opções não decide nada, ao contrário de 1-2 opções certas para o perfil dele',
            'Porque ocupa muito espaço na conversa',
            'Porque o cliente pode pesquisar os produtos em outro lugar'
          ],
          correct: 1,
          explanation: 'Paradoxo da escolha (Barry Schwartz): mais opções = mais dificuldade de decidir = mais chance de não decidir. Catálogo completo sem contexto é ruído, não ajuda. A abordagem certa: diagnóstico → 1-2 produtos específicos para esse perfil → apresentação com foto/vídeo → CTA. Menos é mais em vendas online.'
        }
      ]
    },
    {
      id: 'mod-6-5-objecoes-online',
      title: 'Objeções Online — As 6 Mais Comuns',
      description: 'As 6 objeções mais frequentes no digital, como responder a cada uma e a estratégia de anti-objeção preventiva.',
      duration: 25,
      content: `
<h2>As 6 objeções mais comuns no online</h2>
<table>
  <tr><th>Objeção</th><th>O que está por trás</th><th>Resposta</th></tr>
  <tr><td>"Tá caro"</td><td>Não entendeu o valor ou está comparando com produto diferente</td><td>"Me conta — caro em relação a quê? Me ajuda a entender pra ver o que posso fazer."</td></tr>
  <tr><td>"Vou pensar"</td><td>Tem dúvida que não verbalizou</td><td>"Claro! O que você ainda não tem certeza? Me conta que a gente resolve."</td></tr>
  <tr><td>"Não confio em compra online"</td><td>Medo de golpe ou produto diferente da foto</td><td>"Entendo! Você quer ver vídeo real do produto? E nossa política de troca é [X] — nada de risco pra você."</td></tr>
  <tr><td>"Vi mais barato em outro lugar"</td><td>Ancoragem por preço — pode não ser comparação justa</td><td>"Me conta qual produto e de onde — às vezes são produtos diferentes. Se for o mesmo, me explica e vejo o que posso fazer."</td></tr>
  <tr><td>"Não preciso agora"</td><td>Sem urgência percebida</td><td>"Faz sentido! Quer que eu te avise quando tiver promoção ou quando o estoque baixar?"</td></tr>
  <tr><td>"Deixa pra próxima semana"</td><td>Procrastinação — urgência não foi criada</td><td>"Claro! Só te aviso que esse produto costuma esgotar rápido. Quer que eu reserve até amanhã pra você?"</td></tr>
</table>

<h2>Anti-objeção preventiva — a estratégia mais eficiente</h2>
<p>Antecipar e responder objeções antes de serem levantadas elimina o bloqueio antes que ele forme.</p>

<h3>Na descrição do produto, inclua:</h3>
<ul>
  <li>Prazo de entrega exato (não "rápido")</li>
  <li>Política de troca clara</li>
  <li>Formas de pagamento disponíveis</li>
  <li>Avaliação de cliente real com a mesma dúvida resolvida</li>
</ul>

<h3>Exemplo de mensagem com anti-objeção embutida:</h3>
<p>"Esse serum custa R$89. Entrega em 2 dias úteis para CDE. Se não gostar, troca sem complicação em até 7 dias. Você paga via Pix ou cartão com ou sem parcelamento. [foto de cliente usando] — essa é a [nome], clienta nossa que tinha a mesma dúvida que você deve ter agora 😊 Quer que eu separe uma unidade pra você?"</p>
<p><em>Essa mensagem trata: preço, entrega, risco, pagamento, prova social — tudo antes da objeção aparecer.</em></p>

<h2>O que não fazer quando o cliente diz "tá caro"</h2>
<ul>
  <li>Não se justificar com "é qualidade" — isso não resolve a objeção</li>
  <li>Não dar desconto imediato — desvaloriza o produto e sua margem</li>
  <li>Não atacar o concorrente — parece inseguro</li>
  <li>Perguntar antes de agir — a resposta do cliente vai guiar a sua resposta ideal</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Cliente diz "tá caro". Qual a primeira resposta ideal?',
          options: [
            'Dar desconto imediatamente para não perder a venda',
            'Explicar que o produto é de alta qualidade',
            'Perguntar "caro em relação a quê?" para entender a base da comparação antes de reagir',
            'Mostrar outros produtos mais baratos'
          ],
          correct: 2,
          explanation: '"Tá caro" raramente é sobre o número absoluto — é sobre percepção de valor relativo. Antes de mover qualquer centavo, você precisa entender a referência: é caro em relação ao concorrente (mesma qualidade?), ao orçamento do cliente, à expectativa que ele tinha? A pergunta "caro em relação a quê?" revela isso e evita que você dê desconto quando não precisava.'
        },
        {
          question: 'Cliente diz "vou pensar". O que essa resposta geralmente esconde?',
          options: [
            'Ele realmente precisa de tempo para decidir',
            'Uma dúvida específica que ele não verbalizou — medo, incerteza ou comparação não resolvida',
            'Ele não vai comprar',
            'Precisa falar com o cônjuge'
          ],
          correct: 1,
          explanation: '"Vou pensar" é evasão educada — não é um não definitivo, mas também não é "quase sim". Por trás há quase sempre uma dúvida específica não resolvida: risco de arrependimento, não entendeu como funciona, está comparando com algo, ou simplesmente não sentiu urgência. A pergunta "o que você ainda não tem certeza?" transforma o "vou pensar" em conversa real.'
        },
        {
          question: 'O que é anti-objeção preventiva e por que é mais eficiente que responder após a objeção?',
          options: [
            'É dar desconto preventivo antes de o cliente pedir',
            'É antecipar e responder as objeções mais comuns na própria apresentação do produto — o cliente não chega a construir o bloqueio porque já foi respondido',
            'É evitar falar de preço até o final da conversa',
            'É usar garantia de satisfação para neutralizar objeções'
          ],
          correct: 1,
          explanation: 'Objeção respondida após surgir precisa superar resistência já formada. Objeção antecipada nunca vira bloqueio. Uma mensagem que inclui prazo, política de troca, formas de pagamento e prova social responde antes que o cliente pergunte — e o cliente que não teve dúvida não precisa de tempo para pensar.'
        },
        {
          question: 'Cliente diz "deixa pra próxima semana". Qual a resposta que cria urgência sem pressionar?',
          options: [
            '"Tudo bem, qualquer coisa me chama"',
            '"Última chance, amanhã o preço sobe"',
            '"Claro! Só te aviso que esse produto costuma esgotar. Quer que eu reserve uma unidade até amanhã pra você?" — urgência real + solução que facilita',
            '"Por que não agora? Posso fazer condição especial"'
          ],
          correct: 2,
          explanation: 'Urgência falsa ("o preço sobe amanhã" quando não sobe) destrói confiança. Urgência real ("costuma esgotar" se for verdade) é legítima. Combinada com uma facilidade (reservar por 24h), você remove o obstáculo da decisão imediata sem pressionar — o cliente pode dizer sim para a reserva, que é muito mais fácil do que dizer sim para a compra naquele momento.'
        }
      ]
    },
    {
      id: 'mod-6-6-pos-venda-digital',
      title: 'Pós-venda Digital e Fidelização',
      description: 'Cadência de pós-venda, como pedir avaliação de forma natural, gestão de reputação online e reativação de clientes inativos.',
      duration: 25,
      content: `
<h2>A cadência de pós-venda digital</h2>
<table>
  <tr><th>Timing</th><th>Ação</th><th>Objetivo</th></tr>
  <tr><td>Logo após compra</td><td>Confirmação + previsão de entrega</td><td>Reduzir ansiedade pós-compra</td></tr>
  <tr><td>No dia da entrega</td><td>"Chegou tudo bem? Qualquer dúvida, pode chamar"</td><td>Detectar problema antes de virar reclamação</td></tr>
  <tr><td>3-7 dias após entrega</td><td>Pergunta de satisfação + pedido de avaliação</td><td>Feedback + prova social</td></tr>
  <tr><td>30 dias</td><td>Conteúdo de valor ou sugestão complementar</td><td>Manter presença sem pressão de venda</td></tr>
  <tr><td>60-90 dias</td><td>Oferta de reposição ou produto complementar</td><td>Segunda compra — LTV</td></tr>
</table>

<h2>Como pedir avaliação de forma natural</h2>
<p><strong>Momento certo:</strong> 3-7 dias após o produto chegar, quando o cliente já usou e pode dar opinião real.</p>
<p><strong>Mensagem:</strong><br>
"[Nome], já faz uns dias desde que o [produto] chegou. Como você tá achando? 😊<br>
Me ajuda muito se você puder deixar uma avaliação aqui — só uma frase já basta. Ajuda outras pessoas a saberem o que esperar e me ajuda a melhorar. Pode mandar aqui mesmo se preferir!"</p>

<p><strong>Por que funciona:</strong> pedido em momento pós-experiência positiva, linguagem leve sem pressão, opção de mandar no privado (reduz barreira).</p>

<h2>Gestão de reputação online</h2>
<table>
  <tr><th>Situação</th><th>Resposta</th></tr>
  <tr><td>Avaliação positiva</td><td>Agradecer pelo nome, mencionar algo específico que eles disseram</td></tr>
  <tr><td>Avaliação negativa pública</td><td>Responder em público com empatia + resolução + contato privado: "Sentimos muito! Já entrei em contato para resolver"</td></tr>
  <tr><td>Avaliação negativa privada</td><td>Resolver primeiro, pedir avaliação atualizada depois de resolvido</td></tr>
  <tr><td>Sem resposta do cliente após entrega</td><td>Follow-up gentil: "Chegou tudo certinho?"</td></tr>
</table>

<h2>Reativação de clientes inativos</h2>
<p>Cliente que comprou há mais de 60 dias sem nova compra = candidato a reativação.</p>
<p><strong>Mensagem de reativação:</strong><br>
"Oi [nome]! Faz um tempo que não falamos. Você comprou [produto] conosco em [mês] — como está sendo a experiência? 😊<br>
Temos um produto novo que achei que você ia gostar — [produto relacionado]. Quer dar uma olhada?"</p>
<p><strong>Por que funciona:</strong> menciona a compra anterior (mostra que você lembra), pergunta pela experiência (interesse genuíno), sugere algo relacionado (relevante, não aleatório).</p>

<h2>O valor do cliente fidelizado</h2>
<ul>
  <li>Compra com mais frequência — custo de aquisição zero</li>
  <li>Gasta mais por compra — confia mais</li>
  <li>Indica amigos — aquisição de custo baixíssimo</li>
  <li>Menor sensibilidade a preço — 5-10% a mais sem objeção</li>
  <li>Mais tolerante a problemas — relacionamento cria goodwill</li>
</ul>
<p><strong>LTV (Lifetime Value):</strong> cliente fidelizado vale 3-7x o cliente de única compra. Cada real investido em pós-venda tem retorno muito maior do que o mesmo real em aquisição.</p>
      `.trim(),
      quiz: [
        {
          question: 'Por que confirmar a entrega logo que o produto chega é importante além de educação?',
          options: [
            'Para coletar avaliação rapidamente',
            'Para detectar problema (produto danificado, item errado, atraso) antes que vire reclamação pública ou disputa',
            'Para mostrar que você se importa',
            'Para iniciar o processo de segunda compra'
          ],
          correct: 1,
          explanation: 'Problema detectado logo após entrega pode ser resolvido em privado — troca rápida, reembolso, solução. Problema não detectado vira reclamação pública no Instagram, Google Review ou Reclame Aqui — muito mais custoso de gerenciar. A mensagem "chegou tudo bem?" é um detector precoce de problemas que protege sua reputação.'
        },
        {
          question: 'Qual o momento ideal para pedir avaliação ao cliente online?',
          options: [
            'Logo após o pagamento ser confirmado',
            'No momento da entrega',
            '3-7 dias após entrega — cliente já usou o produto e tem opinião real para compartilhar',
            '30 dias após a compra'
          ],
          correct: 2,
          explanation: 'Pedir avaliação antes do cliente usar é pedir opinião de algo que ele ainda não vivenciou — a avaliação vai ser superficial ou ele vai ignorar. 3-7 dias é o período em que a experiência ainda está fresca, o produto já foi usado, e o cliente tem algo concreto para falar. Esse é o timing de maior taxa de resposta e de avaliações mais detalhadas.'
        },
        {
          question: 'Como responder uma avaliação negativa pública da forma mais inteligente?',
          options: [
            'Ignorar — chamar atenção vai piorar',
            'Responder defendendo o produto e explicando que o problema foi do cliente',
            'Responder em público com empatia e resolução, depois continuar no privado: "Sentimos muito — já entrei em contato para resolver"',
            'Pedir para o cliente apagar a avaliação'
          ],
          correct: 2,
          explanation: 'Resposta pública serve para dois públicos: o cliente insatisfeito E todos os outros que vão ler. Empatia + resolução pública mostra que você age quando há problema — isso converte outros clientes que leram o review negativo. Defender o produto ou culpar o cliente em público é catástrofe de reputação. Continuar no privado preserva o processo de resolução.'
        },
        {
          question: 'Por que cliente fidelizado vale 3-7x mais do que cliente de única compra?',
          options: [
            'Porque compra produtos mais caros',
            'Porque custo de aquisição é zero, gasta mais, é menos sensível a preço, tolera problemas e ainda indica — o LTV acumulado supera muito o valor da primeira compra',
            'Porque sempre paga à vista',
            'Porque dá mais avaliações positivas'
          ],
          correct: 1,
          explanation: 'LTV (Lifetime Value) acumula todas as compras futuras sem custo de aquisição, mais o valor das indicações que esse cliente gera (referral value). Um cliente que compra 5x por ano, com ticket médio crescente, tolerância a preço e capacidade de indicação pode valer 5-10x o valor de um único cliente novo. Por isso investimento em pós-venda tem ROI muito superior ao mesmo valor gasto em anúncios de aquisição.'
        }
      ]
    }
  ]
}
