import type { LmsTrilha } from './types'

export const skincareT2: LmsTrilha = {
  id: 'trilha-sk-2',
  slug: 'conhecendo-a-pele',
  title: 'Conhecendo a Pele',
  description: 'Tipos de pele, protocolo de diagnóstico e 20 cenários de atendimento resolvidos passo a passo.',
  icon: '🔬',
  color: '#7C3AED',
  xpReward: 400,
  area: 'skincare',
  lessons: [
    {
      id: 'mod-sk-3-tipos',
      title: 'Tipos de Pele',
      description: 'Os 7 tipos de pele, protocolo dos 30 minutos e as 5 perguntas de diagnóstico no atendimento.',
      duration: 25,
      content: `
<h2>3.1 — Os Tipos de Pele</h2>
<p>O sistema de classificação mais utilizado clinicamente inclui 7 tipos. Conhecer cada um é essencial para nunca errar uma indicação.</p>

<h3>Pele Normal</h3>
<p>Equilíbrio entre oleosidade e hidratação. Poros pequenos, textura uniforme, raras imperfeições. <strong>Erro comum:</strong> cliente com pele normal acha que "não precisa de rotina" — pele normal sem cuidado vira mista ou sensível com o tempo.</p>
<p>Necessidades: manutenção do equilíbrio, hidratação leve, SPF, antioxidantes preventivos.</p>

<h3>Pele Seca</h3>
<p>Sensação de aperto após limpeza, textura áspera ou descamativa, poros pouco visíveis, TEWL elevado, produção de sebo baixa.</p>
<p><strong>Causas:</strong> genética, idade, clima seco/frio, banhos quentes, clensers agressivos, histórico de dermatite atópica.</p>
<p><strong>Ingredientes prioritários:</strong> ceramidas, esqualano, shea butter, ácido hialurônico, glicerina, pantenol, uréia.</p>
<p>Evitar: álcool, fragrance, mentol.</p>

<h3>Pele Oleosa</h3>
<p>Brilho ao longo do dia, poros dilatados na zona T, propensa a comedões e acne. <strong>Causa irônica:</strong> rotina muito agressiva que resseca → pele compensa com mais sebo.</p>
<p><strong>Ingredientes prioritários:</strong> niacinamida, ácido salicílico, ácido azelaico, zinco. SPF leve, não comedogênico.</p>
<p>Evitar: hidratantes pesados, óleos comedogênicos (coco, trigo).</p>

<h3>Pele Mista</h3>
<p>Zona T (testa, nariz, queixo) oleosa; bochechas normais ou secas. Causa: maior densidade de glândulas sebáceas na zona T.</p>
<p><strong>Abordagem:</strong> tratamento por zona (multimasking). Produtos balanceados que não super-hidratem a zona T nem resssequem as bochechas.</p>
<p><strong>Ingredientes:</strong> niacinamida (equilibra), ácido hialurônico de baixo peso molecular (hidrata sem engordar).</p>

<h3>Pele Sensível</h3>
<p><strong>IMPORTANTE:</strong> sensível não é tipo de pele — é uma <em>condição</em> que pode afetar qualquer tipo. Causas: genética, rosácea, dermatite atópica, rotina agressiva, overload de ativos.</p>
<p><strong>Ingredientes prioritários:</strong> ceramidas, centella asiatica, madecassoside, aloe vera, pantenol, heartleaf, beta-glucan. Zero fragrance, zero álcool desnaturante, zero mentol.</p>
<p>Introdução de qualquer novo produto: um por vez, intervalo de 2 semanas. Patch test obrigatório.</p>

<h3>Pele Acneica</h3>
<p><strong>IMPORTANTE:</strong> Acne é doença. Casos moderados a graves exigem dermatologista — skincare complementa, não substitui tratamento médico.</p>
<table>
  <tr><th>Tipo de lesão</th><th>Características</th><th>Abordagem</th></tr>
  <tr><td>Comedão aberto (cravo preto)</td><td>Poro dilatado, oxidado</td><td>BHA (salicílico), esfoliação</td></tr>
  <tr><td>Comedão fechado (cravo branco)</td><td>Poro fechado</td><td>BHA, retinol</td></tr>
  <tr><td>Pápula</td><td>Vermelho, inflamado, sem pus</td><td>Anti-inflamatórios, BHA</td></tr>
  <tr><td>Pústula</td><td>Com pus visível</td><td>BHA, tea tree, benzoil peróxida</td></tr>
  <tr><td>Nódulo/Cisto</td><td>Profundo, doloroso</td><td>Dermatologista obrigatório</td></tr>
</table>

<h3>Pele Madura</h3>
<p>Linhas e rugas, perda de firmeza, manchas solares, poros mais visíveis (elastina reduzida). Necessidades: estimuladores de colágeno (retinol, vitamina C, peptídeos), hidratação intensa, SPF rigoroso, antioxidantes.</p>

<h2>3.2 — Protocolo dos 30 Minutos</h2>
<p>Instrução para o cliente identificar o próprio tipo:</p>
<ul>
  <li>Lavar o rosto com cleanser suave</li>
  <li>Não aplicar nenhum produto</li>
  <li>Aguardar 30 minutos e observar</li>
</ul>
<table>
  <tr><th>Resultado após 30 min</th><th>Tipo provável</th></tr>
  <tr><td>Brilho por todo o rosto</td><td>Oleosa</td></tr>
  <tr><td>Aperto, descamação, opacidade</td><td>Seca</td></tr>
  <tr><td>Brilho só na zona T</td><td>Mista</td></tr>
  <tr><td>Confortável, sem brilho excessivo</td><td>Normal</td></tr>
  <tr><td>Vermelhidão, ardência, coceira</td><td>Sensível</td></tr>
</table>

<h2>3.3 — Diagnóstico no Atendimento: 5 Perguntas</h2>
<p><strong>Nunca pergunte diretamente "qual seu tipo de pele?" — a maioria não sabe ou está errada.</strong></p>
<ul>
  <li><strong>P1:</strong> "Ao longo do dia, sua pele fica com brilho? Em que região?" → localiza oleosidade</li>
  <li><strong>P2:</strong> "Após lavar o rosto, sente aperto ou desconforto?" → identifica ressecamento</li>
  <li><strong>P3:</strong> "Você tem espinhas ou cravos com frequência?" → grau de acne</li>
  <li><strong>P4:</strong> "Sua pele fica vermelha ou irritada com facilidade? Reage a produtos novos?" → sensibilidade</li>
  <li><strong>P5 (mais importante):</strong> "Qual sua principal preocupação com a pele agora?" → conecta necessidade real ao produto certo</li>
</ul>
<p>Respostas para P5:</p>
<ul>
  <li>Manchas → depigmentantes</li>
  <li>Brilho excessivo → reguladores de sebo</li>
  <li>Rugas → estimuladores de colágeno</li>
  <li>Acne → BHA + anti-inflamatório</li>
  <li>Ressecamento → barreira + humectantes</li>
</ul>

<h2>3.4 — Contexto Latino-Americano: Fototipos</h2>
<p>Fototipo predominante em Ciudad del Este: Fitzpatrick III, IV e V (pele morena a escura).</p>
<table>
  <tr><th>Característica</th><th>Relevância</th></tr>
  <tr><td>Maior resistência ao câncer de pele</td><td>Não significa que não precisa de SPF — manchas e fotoenvelhecimento ocorrem normalmente</td></tr>
  <tr><td>Maior tendência à hiperpigmentação pós-inflamatória</td><td>Qualquer inflamação (acne, corte) deixa mancha mais escura e por mais tempo</td></tr>
  <tr><td>Melasma mais prevalente</td><td>Hormônios + UV em fototipo alto = melasma recorrente</td></tr>
</table>
<p><strong>Ingredientes prioritários para fototipos III–V:</strong> niacinamida, ácido tranexâmico, arbutin, ácido azelaico, vitamina C, SPF de amplo espectro (UVA + UVB).</p>
      `.trim(),
      quiz: [
        {
          question: 'Por que "pele sensível" não é considerada um tipo de pele no mesmo sentido dos outros?',
          options: [
            'Porque pele sensível é muito rara e não precisa de classificação',
            'Porque é uma condição que pode afetar qualquer tipo de pele quando a barreira está comprometida',
            'Porque pele sensível é apenas pele seca com nome diferente',
            'Porque a sensibilidade depende exclusivamente de genética'
          ],
          correct: 1,
          explanation: 'Sensível é uma condição, não um tipo fixo de pele. Qualquer tipo de pele pode ficar sensível quando a barreira está comprometida — por rotina agressiva, overload de ativos, estresse, ou condições como rosácea e dermatite atópica.'
        },
        {
          question: 'Por que pele oleosa pode precisar de hidratante?',
          options: [
            'Não precisa — hidratante em pele oleosa piora a oleosidade',
            'Apenas como base para maquiagem',
            'Porque oleosidade (sebo) e hidratação (água nas células) são independentes; pele oleosa desidratada produz ainda mais sebo',
            'Apenas no inverno quando o clima resseca'
          ],
          correct: 2,
          explanation: 'Pele oleosa pode estar desidratada — e quando está, produz mais sebo como compensação. Um hidratante oil-free leve com ácido hialurônico e niacinamida pode inclusive reduzir o brilho ao normalizar a produção sebácea.'
        },
        {
          question: 'Qual a principal preocupação de peles com fototipo IV–V (morena a escura) em relação a skincare?',
          options: [
            'Risco maior de câncer de pele, exigindo SPF mais alto',
            'Tendência à hiperpigmentação pós-inflamatória — qualquer inflamação deixa manchas mais escuras e duradouras',
            'Pele mais oleosa que fototipos mais claros',
            'Menor tolerância a ingredientes ativos'
          ],
          correct: 1,
          explanation: 'Fototipos mais escuros têm maior tendência à hiperpigmentação pós-inflamatória (PIH). Qualquer processo inflamatório — acne, corte, irritação — pode deixar mancha escura persistente. Por isso ativos como niacinamida, tranexâmico e azelaico são prioritários, e SPF é essencial.'
        },
        {
          question: 'Qual é a pergunta mais importante do roteiro de diagnóstico no atendimento?',
          options: [
            '"Qual seu tipo de pele?"',
            '"Quanto quer gastar?"',
            '"Qual sua principal preocupação com a pele agora?"',
            '"Você já usou produtos coreanos antes?"'
          ],
          correct: 2,
          explanation: '"Qual sua principal preocupação com a pele agora?" é a pergunta mais poderosa porque conecta a necessidade real ao produto certo. Manchas → depigmentantes; brilho → reguladores de sebo; rugas → colágeno. Qualquer outra pergunta é diagnóstico de sintoma; esta é diagnóstico de objetivo.'
        }
      ]
    },
    {
      id: 'mod-sk-4-diagnostico',
      title: 'Diagnóstico de Clientes — 20 Cenários',
      description: 'Como diagnosticar e recomendar em situações reais: acne, manchas, ressecamento, anti-aging e perfis especiais.',
      duration: 30,
      content: `
<h2>Framework de Diagnóstico</h2>
<p>Memorize o fluxo e nunca pule etapas:</p>
<p><strong>OUVIR → PERGUNTAR → IDENTIFICAR → EDUCAR → RECOMENDAR → VENDER</strong></p>
<p>Clientes que se sentem ouvidos compram mais e reclamam menos.</p>

<h2>Cenários de Acne e Oleosidade</h2>

<h3>Cenário 1 — Adolescente com acne, nunca usou nada</h3>
<p><strong>Cliente:</strong> "Tenho 17 anos, pele muito oleosa, muita espinha, nunca usei nada."</p>
<p><strong>Análise:</strong> acne hormonal adolescente, barreira virgem. Prioridade: gentileza + eficácia.</p>
<p><strong>Rotina:</strong> cleanser suave pH-balanceado → tônico BHA 0,5–1% (3x/semana) → sérum niacinamida 10% → hidratante gel oil-free → SPF não comedogênico.</p>
<p><strong>Script:</strong> "A pele adolescente produz muito sebo por causa dos hormônios — é normal, não é falta de higiene. O que vamos fazer é equilibrar com produtos leves e um ácido que vai limpar dentro do poro devagar."</p>

<h3>Cenário 2 — Cravos no nariz, quer diminuir poros</h3>
<p><strong>Cliente:</strong> "Tenho 25 anos, pele oleosa, muitos cravos no nariz. Quero diminuir os poros."</p>
<p><strong>Dizer ao cliente:</strong> "Poro não encolhe — ele é genético. Mas com BHA dentro do poro + niacinamida regulando o sebo, eles ficam muito menos visíveis. Resultado real em 6–8 semanas."</p>
<p><strong>Rotina:</strong> double cleanse (oil + foam) → tônico BHA 2% → sérum niacinamida + zinco → gel hidratante.</p>

<h3>Cenário 3 — Manchas de acne (PIH)</h3>
<p><strong>Cliente:</strong> "Tenho 30 anos, pele oleosa, acne ocasional, mas principalmente manchas das espinhas que ficam."</p>
<p><strong>Análise:</strong> PIH (hiperpigmentação pós-inflamatória). Problema principal já não é a acne — é a mancha.</p>
<p><strong>Rotina:</strong> cleanser low pH → BHA (3x/semana, manutenção) → vitamina C (manhã) + niacinamida (noite) → SPF rigoroso.</p>
<p><strong>Script:</strong> "O protetor solar é obrigatório — sem ele, a mancha escurece novamente e qualquer produto fica sem efeito."</p>

<h3>Cenário 4 — Pele que descasca com maquiagem</h3>
<p><strong>Cliente:</strong> "Pele oleosa, uso bastante maquiagem, no final do dia descasca no T e brilha no resto."</p>
<p><strong>Análise:</strong> pele mista desidratada com barreira comprometida pelo cleanser errado ou remoção inadequada.</p>
<p><strong>Script:</strong> "Essa descamação embaixo da maquiagem é sinal de pele desidratada — a maquiagem está grudando nas células mortas. Vamos hidratar direito e sua maquiagem vai durar muito mais."</p>

<h2>Cenários de Manchas e Hiperpigmentação</h2>

<h3>Cenário 5 — Melasma (fototipo médio/alto)</h3>
<p><strong>Cliente:</strong> "Tenho 35 anos, pele morena, manchas escuras na testa e bochechas. Piora no verão."</p>
<p><strong>Análise:</strong> melasma (distribuição clássica, piora com sol). Condição crônica — controle, não cura.</p>
<p><strong>Rotina:</strong> cleanser suave → tônico com tranexâmico ou niacinamida → vitamina C (manhã) + ácido azelaico ou tranexâmico (noite) → SPF 50+ PA++++ obrigatório, reaplicar a cada 2h.</p>
<p><strong>Expectativa:</strong> "Melasma não tem cura — ele é controlado. Com essa rotina e protetor rigoroso, ele clareia e para de progredir. Mas se parar o protetor, volta. É compromisso de longo prazo."</p>
<p><strong>IMPORTANTE:</strong> melasma moderado a severo precisa de dermatologista. Encaminhe para avaliação médica.</p>

<h3>Cenário 6 — Pós-parto, manchas da gravidez</h3>
<p><strong>Cliente:</strong> "Tive bebê há 6 meses, manchas apareceram durante a gravidez."</p>
<p><strong>Ingredientes seguros para lactantes:</strong> niacinamida ✓, ácido azelaico ✓, vitamina C ✓, tranexâmico ✓ (tópico), bakuchiol ✓, SPF mineral ✓.</p>
<p><strong>Evitar:</strong> retinol ✗, hidroquinona ✗, AHA em alta concentração (cautela).</p>

<h3>Cenário 7 — Pele negra com PIH</h3>
<p><strong>Cliente:</strong> "Tenho 22 anos, pele negra, manchas escuras onde tive espinhas. As marcas ficam meses."</p>
<p><strong>Honestidade necessária:</strong> "Em pele mais escura, as manchas demoram mais para clarear — isso é fisiológico, não falha do produto. O resultado vem com consistência de 3–6 meses."</p>
<p><strong>Prioridade 1:</strong> acabar com a acne (sem inflamação, sem nova PIH). Stack: niacinamida 10% (noite) + vitamina C estável (manhã) + tranexâmico como spot treatment + SPF todos os dias.</p>

<h2>Cenários de Ressecamento e Sensibilidade</h2>

<h3>Cenário 8 — Barreira comprometida severa</h3>
<p><strong>Cliente:</strong> "Minha pele descasca o tempo todo, fica vermelha, qualquer produto irrita."</p>
<p><strong>Análise:</strong> barreira comprometida severa. Pode ser dermatite atópica. Abordagem: simplificar ao máximo.</p>
<p><strong>Protocolo de recovery:</strong> APENAS cleanser suavíssimo (leite ou balm) + hidratante com ceramidas (zero ativos) + SPF mineral. Eliminar TUDO por 4 semanas.</p>
<p><strong>Script:</strong> "Quando a pele está assim, ela precisa de descanso, não de mais produtos. Vamos simplificar, reconstruir a barreira, e só depois de 4 semanas introduzir qualquer ativo."</p>

<h3>Cenário 9 — Rosácea diagnosticada</h3>
<p><strong>Cliente:</strong> "Tenho rosácea diagnosticada pelo dermatologista."</p>
<p><strong>Ingredientes indicados:</strong> azelaico (único com evidência clínica para rosácea), centella asiatica, ceramidas, niacinamida (com cautela), aloe vera.</p>
<p><strong>Proibidos:</strong> álcool desnaturante, mentol, eucalipto, fragrance, AHA em alta concentração, calor.</p>

<h3>Cenário 10 — Irritação com retinol</h3>
<p><strong>Cliente:</strong> "Uso retinol há 2 semanas e minha pele descascou demais e ficou vermelha."</p>
<p><strong>Diagnóstico:</strong> irritação (não purging) — concentração muito alta ou frequência demais.</p>
<p><strong>Protocolo rescue:</strong> pause o retinol por 2 semanas → ceramidas + hidratante suave apenas → reintroduzir retinol 0,025% 1x/semana com buffer (hidratante antes = "sandwich method").</p>

<h2>Cenários Anti-Aging</h2>

<h3>Cenário 11 — Pele madura, foco preventivo</h3>
<p><strong>Cliente:</strong> "Tenho 40 anos, pele normal, quero prevenir o envelhecimento."</p>
<p><strong>Rotina ideal:</strong> essence fermentada → vitamina C 15–20% (manhã) → retinol 0,1% (noite, 3–4x/semana) → peptídeos → SPF 50+ PA++++ diário.</p>
<p><strong>Script:</strong> "Você está na fase ideal para começar — prevenir é sempre mais fácil que corrigir. A vitamina C de manhã + retinol de noite é a dupla mais estudada em anti-aging."</p>

<h3>Cenário 12 — Presente para a namorada</h3>
<p><strong>Cliente:</strong> "Quero presente para minha namorada que gosta de skincare. Budget de US$50."</p>
<p><strong>Abordagem:</strong> não tente descobrir tipo de pele da pessoa ausente. Venda segurança com ingredientes universais.</p>
<p><strong>Kit sugerido:</strong> sérum de snail mucin (universal, seguro) + sheet mask pack (experiência imediata) + sleeping mask + lip balm. Embrulhado = presente instagramável.</p>

<h2>Cenários Especiais</h2>

<h3>Cenário 13 — Homem nunca usou nada</h3>
<p><strong>Abordagem:</strong> sem jargão K-beauty. Foco em simplicidade e resultado.</p>
<p><strong>Rotina de 3 passos:</strong> facial wash (não sabonete de corpo) + hidratante com niacinamida + SPF gel leve.</p>
<p><strong>Script:</strong> "Três produtos, dois minutos por dia. Resultados em 3 semanas."</p>

<h3>Cenário 14 — Revendedora</h3>
<p><strong>Cliente:</strong> "Sou revendedora, quero produtos que vendam bem no Brasil."</p>
<p><strong>Top produtos para revenda:</strong> Cosrx Snail 96 Essence, Beauty of Joseon Relief Sun, Some By Mi AHA BHA PHA Toner, Laneige Lip Sleeping Mask.</p>
<p><strong>Script:</strong> "Esses são os produtos com maior reconhecimento nas redes — quem pesquisa skincare no TikTok já ouviu falar deles. Vendem fácil porque a demanda já existe."</p>

<h3>Cenário 15 — Maquiagem que piora a pele</h3>
<p><strong>Cliente:</strong> "Uso base todo dia, minha pele está piorando, cravos aumentaram."</p>
<p><strong>Problema central:</strong> remoção inadequada de maquiagem.</p>
<p><strong>Script:</strong> "O principal aqui é a remoção. Maquiagem que fica na pele entope o poro — água e sabonete não dissolvem pigmento e protetor. O óleo de limpeza vai mudar tudo."</p>

<h2>30 Perguntas Diagnósticas Prontas</h2>
<ul>
  <li>Qual seu maior incômodo com a pele agora?</li>
  <li>Sua pele fica oleosa ao longo do dia?</li>
  <li>Sente ressecamento ou aperto após lavar?</li>
  <li>Tem espinhas com frequência? Onde?</li>
  <li>Tem manchas? São antigas ou novas?</li>
  <li>Sua pele fica vermelha facilmente?</li>
  <li>Já usou algum produto que irritou?</li>
  <li>Usa protetor solar? Qual?</li>
  <li>Usa maquiagem? Com que frequência?</li>
  <li>Como você limpa o rosto atualmente?</li>
  <li>Sua pele muda com o ciclo menstrual?</li>
  <li>Está grávida ou amamentando?</li>
  <li>Usa algum medicamento contínuo (isotretinoína, hormônios)?</li>
  <li>Qual o clima onde você mora/trabalha?</li>
  <li>Tem orçamento em mente?</li>
  <li>Prefere rotina simples ou não se importa com mais passos?</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Cliente de 35 anos com melasma nas bochechas que piora no verão. Qual é o produto absolutamente inegociável na rotina dela?',
          options: [
            'Sérum de vitamina C em alta concentração',
            'Ácido azelaico como spot treatment',
            'SPF 50+ PA++++ com reaplicação a cada 2 horas',
            'Tônico com ácido tranexâmico'
          ],
          correct: 2,
          explanation: 'Para melasma, o SPF é absolutamente inegociável e mais importante que qualquer ativo clareador. Sem fotoproteção rigorosa, qualquer produto de tratamento perde eficácia — o sol reativa os melanócitos e escurece o que o produto estava clareando.'
        },
        {
          question: 'Qual a diferença entre purging e irritação ao usar retinol?',
          options: [
            'Purging ocorre apenas com vitamina C; irritação com retinol',
            'Purging = espinhas aparecem (aceleração do turnover); irritação = descamação/vermelhidão — exige pausa do produto',
            'São a mesma coisa — ambos indicam que o produto está funcionando',
            'Purging ocorre na primeira semana; irritação na segunda semana'
          ],
          correct: 1,
          explanation: 'Purging é quando espinhas surgem — sinal de que o retinol está acelerando o turnover e trazendo comedões à superfície (é esperado, dura 4–8 semanas). Irritação é descamação excessiva e vermelhidão — sinal de concentração alta demais ou frequência alta demais. Irritação exige pausa; purging não.'
        },
        {
          question: 'Quais ingredientes são seguros para usar durante a amamentação?',
          options: [
            'Retinol, niacinamida e vitamina C',
            'Niacinamida, ácido azelaico, vitamina C, bakuchiol e SPF mineral',
            'Hidroquinona, ácido glicólico e niacinamida',
            'Retinol e AHA em baixa concentração'
          ],
          correct: 1,
          explanation: 'Durante a amamentação, os seguros são: niacinamida, ácido azelaico (categoria B), vitamina C, tranexâmico tópico e bakuchiol. Retinol é categoria X (teratogênico) e deve ser evitado. Hidroquinona também é contraindicada.'
        },
        {
          question: 'Cliente diz que a pele dele descasca muito, fica vermelha e qualquer produto irrita. Qual é a primeira ação correta?',
          options: [
            'Vender um sérum calmante com centella asiatica',
            'Recomendar uma rotina de 5 passos com ingredientes suaves',
            'Simplificar ao mínimo: apenas cleanser suave + ceramidas + SPF mineral, eliminando todos os ativos por 4 semanas',
            'Indicar ácido azelaico que é o mais seguro para pele sensível'
          ],
          correct: 2,
          explanation: 'Barreira comprometida severa exige recovery, não mais produtos. O protocolo é simplificar ao máximo: cleanser suavíssimo + hidratante com ceramidas (zero ativos) + SPF mineral. Eliminar tudo por 4 semanas. Qualquer ativo adicional vai piorar a situação antes de melhorar.'
        }
      ]
    }
  ]
}
