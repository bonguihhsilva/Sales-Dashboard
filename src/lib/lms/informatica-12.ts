import type { LmsTrilha } from './types'

export const informaticaT12: LmsTrilha = {
  id: 'trilha-ti-12',
  slug: 'atendimento-tecnico-consultivo',
  title: 'Atendimento Técnico Consultivo',
  description: 'Metodologia de atendimento consultivo em informática — perguntar, diagnosticar a necessidade real, montar solução completa e justificar tecnicamente em 8 cenários reais de loja.',
  icon: '🎧',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-12-atendimento-tecnico-consultivo',
      title: 'Atendimento Técnico Consultivo',
      description: 'Metodologia de atendimento consultivo em informática — perguntar, diagnosticar a necessidade real, montar solução completa e justificar tecnicamente em 8 cenários reais de loja.',
      duration: 45,
      content: `
<h2>Metodologia Geral</h2>
<p>Todo atendimento técnico consultivo segue a mesma lógica, independente do produto: <strong>Perguntar → Diagnosticar necessidade real → Montar solução completa → Justificar tecnicamente.</strong></p>
<p>O erro mais comum é pular direto para a recomendação sem entender o uso real do cliente. As perguntas certas evitam venda errada, troca posterior e cliente insatisfeito.</p>

<h2>12.1 — "Meu computador está lento."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Há quanto tempo está assim? Piorou de repente ou é gradual?</li>
<li>Que tipo de uso faz (navegação, jogos, trabalho pesado)?</li>
<li>É HDD ou já tem SSD?</li>
<li>Quanto de RAM tem hoje?</li>
</ul>
<p><strong>Necessidade real:</strong> normalmente HDD antigo e/ou RAM insuficiente — raramente é "precisa de PC novo".</p>
<p><strong>Solução completa:</strong> SSD (troca ou adição) + upgrade de RAM se aplicável + limpeza de itens de inicialização.</p>
<p><strong>Justificativa técnica:</strong> "SSD reduz tempo de resposta de forma brutal comparado a HDD porque não depende de partes mecânicas girando — é a única troca que o senhor vai sentir imediatamente ao ligar o PC."</p>

<h2>12.2 — "Quero montar um PC gamer."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Quais jogos específicos pretende jogar? (define exigência real de GPU/CPU)</li>
<li>Já tem monitor? Qual resolução/taxa de atualização?</li>
<li>Orçamento total disponível?</li>
<li>Vai fazer mais alguma coisa além de jogar (streaming, edição)?</li>
</ul>
<p><strong>Necessidade real:</strong> equilíbrio entre CPU/GPU sem gargalo, evitar superdimensionar componente que o jogo escolhido não aproveita.</p>
<p><strong>Solução completa:</strong> CPU+GPU equilibrados pro jogo/resolução informados, 16GB RAM dual-channel mínimo, SSD NVMe, fonte com margem de segurança, considerar upgrade futuro (placa-mãe com slots livres).</p>
<p><strong>Justificativa técnica:</strong> "Não adianta GPU de ponta se o processador não acompanha — o jogo fica limitado pela CPU e você paga caro por um desempenho que não vai aparecer."</p>

<h2>12.3 — "Preciso de Wi-Fi para uma empresa."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Quantos funcionários/dispositivos simultâneos?</li>
<li>Tamanho e layout do espaço (paredes, andares)?</li>
<li>Precisa separar rede de convidados da rede interna?</li>
<li>Já existe cabeamento de rede no local?</li>
</ul>
<p><strong>Necessidade real:</strong> cobertura + capacidade de lidar com muitos dispositivos + segurança (segmentação).</p>
<p><strong>Solução completa:</strong> 1+ Access Points Wi-Fi 6 (não só "roteador mais forte"), switch com suporte a VLAN, roteador/firewall adequado ao porte.</p>
<p><strong>Justificativa técnica:</strong> "Um roteador único não resolve área grande com paredes — o problema não é 'potência', é a física do sinal. Múltiplos pontos bem posicionados resolvem melhor que um equipamento único mais caro."</p>

<h2>12.4 — "Qual notebook devo comprar?"</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Uso principal (estudo, trabalho, jogos, edição)?</li>
<li>Precisa de mobilidade constante ou fica quase sempre no mesmo lugar?</li>
<li>Orçamento?</li>
<li>Prazo de uso esperado (2 anos? 5 anos?)</li>
</ul>
<p><strong>Necessidade real:</strong> casar processador/RAM/armazenamento com o uso real, não com "o que está na promoção".</p>
<p><strong>Solução completa:</strong> recomendação específica com justificativa componente por componente.</p>
<p><strong>Justificativa técnica:</strong> "Pro seu uso de [X], o gargalo real seria [componente] se eu recomendasse o modelo mais barato — por isso sugiro esse aqui, que resolve sem pagar por recurso que não vai usar."</p>

<h2>12.5 — "Qual SSD é melhor?"</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>É pra sistema (SO) ou armazenamento secundário?</li>
<li>O PC/notebook tem slot M.2 NVMe ou só SATA?</li>
<li>Qual geração de PCIe a placa-mãe suporta?</li>
</ul>
<p><strong>Necessidade real:</strong> compatibilidade física antes de "melhor" em abstrato — SSD mais rápido do mundo não serve se o slot não suporta.</p>
<p><strong>Solução completa:</strong> NVMe compatível com o slot disponível para SO, SATA/HDD para armazenamento em massa se o orçamento for prioridade.</p>
<p><strong>Justificativa técnica:</strong> "O 'melhor' depende do que sua placa aceita — de nada adianta pagar por PCIe 5.0 numa placa que só tem PCIe 3.0, o desempenho vai ficar limitado ao que o slot permite."</p>

<h2>12.6 — "Esse roteador serve para minha casa?"</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Tamanho da casa, quantos andares/paredes de concreto?</li>
<li>Quantos dispositivos conectados (celulares, TVs, smart home)?</li>
<li>Onde fica a internet que entra (modem) em relação ao resto da casa?</li>
</ul>
<p><strong>Necessidade real:</strong> cobertura real vs specs de caixa — roteador "forte" não resolve física de propagação de sinal em casas grandes.</p>
<p><strong>Solução completa:</strong> roteador único para apartamentos/casas pequenas, sistema mesh para casas grandes/múltiplos andares.</p>
<p><strong>Justificativa técnica:</strong> "Potência de sinal não atravessa parede de concreto por mágica — em casa grande, 2-3 pontos de Wi-Fi distribuídos cobrem melhor que 1 roteador único, por mais caro que seja."</p>

<h2>12.7 — "Quero um computador para edição de vídeo."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Qual software usa (Premiere, DaVinci, CapCut)? Resoluções e formatos trabalhados (4K, RAW)?</li>
<li>Volume de projetos simultâneos?</li>
<li>Orçamento e se já tem algum componente reaproveitável?</li>
</ul>
<p><strong>Necessidade real:</strong> CPU com bons núcleos, GPU com boa VRAM (aceleração de renderização), muita RAM (32GB+ para 4K), armazenamento NVMe rápido (arquivos de vídeo são grandes e a velocidade de leitura/escrita importa).</p>
<p><strong>Solução completa:</strong> CPU 8+ núcleos, GPU com 12GB+ VRAM se envolver renderização por GPU, 32GB RAM, NVMe Gen4 para cache/projeto ativo + HDD grande para arquivo morto.</p>
<p><strong>Justificativa técnica:</strong> "Edição de vídeo é diferente de jogo — aqui múltiplos núcleos e RAM importam muito mais, porque o software processa vários frames/efeitos em paralelo."</p>

<h2>12.8 — "Preciso de um sistema de câmeras."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Quantas câmeras, área interna/externa?</li>
<li>Precisa de visão noturna, detecção de movimento por IA?</li>
<li>Tem cabeamento de rede ou vai ser tudo Wi-Fi?</li>
<li>Quer gravação local (NVR/cartão) ou nuvem?</li>
</ul>
<p><strong>Necessidade real:</strong> cobertura de área + confiabilidade de gravação + segurança de rede (evitar exposição das câmeras à internet sem proteção).</p>
<p><strong>Solução completa:</strong> câmeras PoE (preferencial a Wi-Fi) + switch PoE + NVR dimensionado para quantidade de câmeras e dias de retenção desejados + VLAN separada.</p>
<p><strong>Justificativa técnica:</strong> "Câmera por Wi-Fi puro depende de sinal estável e é mais vulnerável — PoE garante energia e dados por um único cabo, com muito mais estabilidade e segurança."</p>

<h2>Checklist Geral de Atendimento Consultivo</h2>
<ul>
<li>Fiz perguntas antes de recomendar (nunca recomendar sem entender uso real)?</li>
<li>Identifiquei o gargalo/necessidade real, não só o pedido literal do cliente?</li>
<li>Montei solução completa (todos os componentes compatíveis entre si)?</li>
<li>Expliquei o "porquê" técnico de forma simples e verificável?</li>
<li>Ofereci cross-sell relevante sem pressão excessiva?</li>
<li>Fui honesto sobre limitações (não prometi o que o produto não entrega)?</li>
</ul>

<h2>Síntese por Cenário</h2>
<table>
<tr><th>Pedido do cliente</th><th>Necessidade real</th><th>Pergunta-chave</th></tr>
<tr><td>"Computador lento"</td><td>HDD antigo / RAM insuficiente</td><td>Já tem SSD? Quanto de RAM?</td></tr>
<tr><td>"PC gamer"</td><td>Equilíbrio CPU/GPU sem gargalo</td><td>Quais jogos e monitor?</td></tr>
<tr><td>"Wi-Fi empresa"</td><td>Cobertura + segmentação</td><td>Quantos dispositivos e paredes?</td></tr>
<tr><td>"Qual notebook"</td><td>Casar specs com uso real</td><td>Uso principal e prazo de uso?</td></tr>
<tr><td>"Qual SSD"</td><td>Compatibilidade de slot</td><td>M.2 NVMe ou SATA?</td></tr>
<tr><td>"Roteador para casa"</td><td>Física de propagação de sinal</td><td>Tamanho e andares da casa?</td></tr>
<tr><td>"PC para edição"</td><td>Núcleos + RAM + VRAM</td><td>Qual software e resolução?</td></tr>
<tr><td>"Sistema de câmeras"</td><td>Estabilidade + segurança de rede</td><td>Cabeamento disponível?</td></tr>
</table>

<h2>Simulação de Atendimento (síntese do módulo)</h2>
<p><strong>Cliente:</strong> "Quero um PC bom, pode ser o que vocês tiverem de melhor custo-benefício."</p>
<p><strong>Resposta consultiva:</strong> "Custo-benefício depende do que o senhor vai fazer com ele — o melhor custo-benefício pra jogos é diferente do melhor custo-benefício pra edição de vídeo ou uso de escritório. Me conta o uso principal que eu monto exatamente o que entrega o melhor resultado pro seu caso, sem pagar por recurso que não vai usar nem faltar no que realmente importa."</p>
      `,
      quiz: [
        {
          question: 'Um cliente diz que o computador está lento. Qual é a abordagem correta antes de recomendar qualquer produto?',
          options: [
            'Recomendar imediatamente um PC novo, já que é a solução mais segura',
            'Perguntar há quanto tempo está lento, tipo de uso, se já tem SSD e quanta RAM possui',
            'Oferecer apenas um upgrade de RAM, que resolve a maioria dos casos',
            'Sugerir formatação do sistema como primeira alternativa'
          ],
          correct: 1,
          explanation: 'Diagnosticar a necessidade real exige perguntas específicas — normalmente o problema é HDD antigo e/ou RAM insuficiente, raramente é "precisa de PC novo".'
        },
        {
          question: 'Ao montar um PC gamer, por que perguntar quais jogos específicos o cliente pretende jogar é mais importante do que perguntar só o orçamento?',
          options: [
            'Porque define a exigência real de CPU/GPU, evitando superdimensionar componente que o jogo não aproveita',
            'Porque o orçamento nunca influencia a escolha dos componentes',
            'Porque todos os jogos atuais exigem exatamente a mesma configuração',
            'Porque isso permite vender sempre a GPU mais cara disponível'
          ],
          correct: 0,
          explanation: 'Sem saber os jogos, corre-se o risco de desequilibrar CPU e GPU — uma GPU de ponta não entrega desempenho se a CPU for o gargalo.'
        },
        {
          question: 'Por que um roteador único costuma ser insuficiente para Wi-Fi de uma empresa com múltiplas salas e paredes?',
          options: [
            'Porque roteadores empresariais são sempre defeituosos',
            'Porque a cobertura depende da física de propagação do sinal, não apenas da potência do equipamento',
            'Porque roteadores únicos não suportam mais de 5 dispositivos',
            'Porque é obrigatório por lei usar múltiplos access points em empresas'
          ],
          correct: 1,
          explanation: 'Paredes e distância atenuam o sinal independente da potência anunciada — múltiplos Access Points bem posicionados resolvem melhor que um equipamento único mais caro.'
        },
        {
          question: 'Por que a pergunta "é pra sistema (SO) ou armazenamento secundário, e a placa tem slot M.2 NVMe?" é essencial antes de recomendar um SSD?',
          options: [
            'Porque todo SSD funciona em qualquer slot sem restrição',
            'Porque a compatibilidade física com o slot disponível determina se aquele SSD pode ser usado e qual desempenho será realmente entregue',
            'Porque SSDs SATA são sempre superiores aos NVMe',
            'Porque essa pergunta serve apenas para calcular o preço final'
          ],
          correct: 1,
          explanation: 'De nada adianta um SSD PCIe 5.0 numa placa que só suporta PCIe 3.0 — o desempenho fica limitado ao que o slot permite.'
        },
        {
          question: 'Em um atendimento para sistema de câmeras de segurança, por que recomendar câmeras PoE em vez de câmeras 100% Wi-Fi?',
          options: [
            'Porque câmeras PoE são sempre mais baratas',
            'Porque PoE garante energia e dados por um único cabo, com mais estabilidade e segurança do que depender só de sinal Wi-Fi',
            'Porque câmeras Wi-Fi não gravam vídeo em alta resolução',
            'Porque a legislação proíbe câmeras de segurança via Wi-Fi'
          ],
          correct: 1,
          explanation: 'Câmeras via Wi-Fi puro dependem de sinal estável e são mais vulneráveis — PoE oferece maior confiabilidade de energia, dados e segurança de rede.'
        }
      ]
    }
  ]
}
