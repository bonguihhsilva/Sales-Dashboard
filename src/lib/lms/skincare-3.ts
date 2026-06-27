import type { LmsTrilha } from './types'

export const skincareT3: LmsTrilha = {
  id: 'trilha-sk-3',
  slug: 'ingredientes-ativos',
  title: 'Ingredientes Ativos',
  description: '30 ingredientes essenciais do K-beauty: mecanismo de ação, para quem serve, combinações e o que evitar.',
  icon: '⚗️',
  color: '#059669',
  xpReward: 500,
  area: 'skincare',
  lessons: [
    {
      id: 'mod-sk-5-hidratacao',
      title: 'Ingredientes de Hidratação e Barreira',
      description: 'Niacinamida, ácido hialurônico, ceramidas, pantenol, esqualano, snail mucin, centella asiatica e colágeno.',
      duration: 40,
      content: `
<h2>Como Ler uma Lista INCI</h2>
<p>INCI = International Nomenclature of Cosmetic Ingredients — a lista de ingredientes no rótulo.</p>
<ul>
  <li>Listados em <strong>ordem decrescente de concentração</strong></li>
  <li>Ingredientes acima de 1%: na ordem de quantidade</li>
  <li>Abaixo de 1%: fabricante pode listar em qualquer ordem</li>
  <li>Se ingrediente ativo aparece no final → concentração provavelmente baixa demais para efeito real</li>
</ul>

<h2>NIACINAMIDA — O Ingrediente Universal</h2>
<p><strong>O que é:</strong> Forma de vitamina B3 (ácido nicotínico amida). Hidrossolúvel.</p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Inibe transferência de melanina → clareia manchas</li>
  <li>Regula produção sebácea → reduz brilho em pele oleosa</li>
  <li>Fortalece barreira cutânea → estimula ceramidas e ácidos graxos</li>
  <li>Anti-inflamatório → reduz vermelhidão, melhora acne</li>
  <li>Antioxidante → protege contra dano oxidativo</li>
  <li>Minimiza poros (melhora elasticidade ao redor)</li>
</ul>
<p><strong>Para quem serve:</strong> praticamente <em>todos</em> os tipos de pele. O ingrediente mais versátil do K-beauty.</p>
<p><strong>Combinações que potencializam:</strong> com zinco (controle de sebo), com HA (hidratação + uniformização), com ceramidas (barreira), com azelaico (manchas).</p>
<p><strong>Concentração eficaz:</strong> 2–10%. Abaixo de 2% = pouco efeito. Acima de 10% = possível irritação em pele sensível.</p>
<p><strong>Horário:</strong> manhã e/ou noite. <strong>Tempo para resultados:</strong> 4–8 semanas para manchas; 2–4 semanas para controle de sebo.</p>

<h2>ÁCIDO HIALURÔNICO (AH) — Hidratação Multidepth</h2>
<p><strong>O que é:</strong> Glicosaminoglicano produzido naturalmente no corpo. Retém até 1.000x seu peso em água.</p>
<p><strong>Pesos moleculares — isso é crucial:</strong></p>
<table>
  <tr><th>Peso Molecular</th><th>Penetração</th><th>Efeito</th></tr>
  <tr><td>Alto (&gt;1000 kDa)</td><td>Superfície</td><td>Filme hidratante, efeito imediato de maciez</td></tr>
  <tr><td>Médio (500 kDa)</td><td>Epiderme superior</td><td>Hidratação mais profunda</td></tr>
  <tr><td>Baixo (&lt;50 kDa)</td><td>Epiderme profunda</td><td>Hidratação de longa duração, suporta barreira</td></tr>
  <tr><td>Micro/Nano (&lt;5 kDa)</td><td>Possível acesso à derme</td><td>Efeito mais profundo e duradouro</td></tr>
</table>
<p><strong>Produtos com múltiplos pesos moleculares são superiores</strong> — hidratam em múltiplas profundidades.</p>
<p><strong>CUIDADO IMPORTANTE:</strong> AH é humectante — puxa água do ambiente para a pele. Em ambientes secos (ar condicionado), sem oclusivo por cima, pode desidratar a pele puxando água de dentro para fora. <strong>Sempre aplicar seguido de emoliente ou creme.</strong></p>

<h2>CERAMIDAS — Reconstrutoras de Barreira</h2>
<p><strong>O que são:</strong> Lipídios que compõem ~50% da "argamassa" do stratum corneum.</p>
<p><strong>O que fazem:</strong> reconstroem e mantêm a barreira, reduzem TEWL, protegem contra irritantes externos, suportam o microbioma.</p>
<p><strong>Para quem serve:</strong> pele seca, sensível, dermatite atópica, pele pós-retinol ou pós-ácidos. <strong>Sem contraindicação.</strong></p>
<p><strong>Quando usar:</strong> DEPOIS dos ativos — como "rescue" da barreira. Fórmula ideal: ceramidas + colesterol + ácidos graxos na proporção 1:1:1.</p>
<p><strong>Tempo para resultados:</strong> melhora da barreira visível em 2–4 semanas.</p>

<h2>CENTELLA ASIATICA — Anti-inflamatório Potente</h2>
<p><strong>O que é:</strong> Planta medicinal asiática (Gotu Kola). Compostos ativos: madecassoside, asiaticoside, asiatic acid, madecassic acid.</p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Anti-inflamatório potente — reduz vermelhidão, calmante</li>
  <li>Estimula produção de colágeno (ativa fibroblastos)</li>
  <li>Cicatrizante (aceleração de wound healing)</li>
  <li>Fortalece barreira cutânea</li>
  <li>Antioxidante e antimicrobiano leve</li>
</ul>
<p><strong>Para quem serve:</strong> pele sensível ou irritada, acneica, madura, pós-procedimento, rosácea. Universalmente compatível.</p>
<p><strong>Marcas coreanas famosas com centella:</strong> Purito, Some By Mi (CICA), Dr. Jart+ (Cicapair), Benton, Beauty of Joseon.</p>

<h2>PANTENOL (Pró-Vitamina B5) — Calmante Universal</h2>
<p><strong>O que faz:</strong> humectante, cicatrizante (regenera epitélio), anti-inflamatório, melhora elasticidade, soothing.</p>
<p><strong>Para quem serve:</strong> todos. Um dos ingredientes mais seguros e eficazes. Excelente em produtos pós-sol, pós-procedimento, peles sensíveis.</p>

<h2>ESQUALANO — Óleo para Todos os Tipos</h2>
<p><strong>O que é:</strong> Forma saturada e estabilizada do esqualeno (lipídio natural da pele). Hoje extraído de oliva ou cana-de-açúcar.</p>
<p><strong>Diferencial único:</strong> óleo com textura seca, não comedogênico — adequado até para peles oleosas. Fortalece barreira, antioxidante, estabiliza formulações.</p>
<p><strong>Um dos raros óleos indicados para pele oleosa acneica.</strong></p>

<h2>SNAIL MUCIN — Cicatrizante Multifuncional</h2>
<p><strong>O que é:</strong> Secreção filtrada de Helix aspersa. Composição: glicoproteínas + proteoglicanos + ácido hialurônico + alantoína + colágeno + elastina + antimicrobianos naturais.</p>
<p><strong>O que faz:</strong> hidratação intensa, cicatrização acelerada (acne, cicatrizes), estímulo de colágeno, suavização de textura, redução de manchas PIH, anti-inflamatório.</p>
<p><strong>Produto ícone:</strong> Cosrx Advanced Snail 96 Mucin Power Essence — mais de 20 milhões de unidades vendidas globalmente.</p>
<p><strong>Quem não deve usar:</strong> possível alergia a moluscos (verificar com cliente que tem alergia a frutos do mar).</p>

<h2>COLÁGENO TÓPICO — O Maior Mito do Skincare</h2>
<p><strong>IMPORTANTE:</strong> Colágeno tópico <strong>NÃO reposiciona colágeno na derme</strong>. A molécula é grande demais para penetrar além da superfície.</p>
<p><strong>O que realmente faz:</strong> atua como humectante (retém água na superfície), forma filme protetor, efeito temporário de plumping.</p>
<p><strong>Para estimular colágeno de verdade:</strong> retinol, vitamina C, peptídeos, PDRN.</p>
<p><strong>Como vender sem enganar:</strong> "Esse produto com colágeno hidrolisado vai deixar a pele mais macia e hidratada imediatamente. Para estimular colágeno de dentro para fora, o que funciona mesmo são os peptídeos e o retinol — temos esse sérum aqui que faz exatamente isso."</p>

<h2>GINSENG — Antioxidante Premium</h2>
<p><strong>O que é:</strong> Raiz de Panax ginseng com compostos ginsenosídeos. Usado há milênios na medicina oriental.</p>
<p><strong>O que faz:</strong> antioxidante potente, estimula circulação, anti-inflamatório, estimula colágeno, iluminador, adaptogênico.</p>
<p><strong>Marcas famosas:</strong> Sulwhasoo, Innisfree, Beauty of Joseon (Dynasty Cream).</p>

<h2>ARROZ — O Segredo Histórico</h2>
<p><strong>Formas:</strong> água de arroz (rica em inositol/B8, aminoácidos), óleo de farelo de arroz (gama-oryzanol antioxidante), extrato (uniformizador).</p>
<p><strong>Base histórica:</strong> observação de que trabalhadoras com arroz tinham pele notavelmente luminosa levou a pesquisas formais.</p>
<p><strong>Marcas coreanas:</strong> Beauty of Joseon (Rice + Probiotics), I'm From Rice.</p>

<h2>Guia de Compatibilidade — Pode Combinar</h2>
<table>
  <tr><th>Ingrediente A</th><th>Ingrediente B</th><th>Observação</th></tr>
  <tr><td>Niacinamida</td><td>HA</td><td>Sinergia perfeita</td></tr>
  <tr><td>Niacinamida</td><td>Ceramidas</td><td>Potencializa barreira</td></tr>
  <tr><td>Centella</td><td>Qualquer coisa</td><td>Universalmente compatível</td></tr>
  <tr><td>Snail Mucin</td><td>Qualquer coisa</td><td>Excelente base antes de ativos</td></tr>
  <tr><td>Esqualano</td><td>Qualquer coisa</td><td>Pode ser adicionado em qualquer etapa</td></tr>
</table>
      `.trim(),
      quiz: [
        {
          question: 'Por que ácido hialurônico em ambiente seco, sem oclusivo por cima, pode piorar a hidratação?',
          options: [
            'Porque o AH reage com o ar e perde sua capacidade de reter água',
            'Porque o AH é humectante — puxa água do ambiente, mas em ambientes secos puxa água de dentro da pele para fora',
            'Porque o AH só funciona quando combinado com ceramidas',
            'Porque sem oclusivo, o AH evapora rapidamente'
          ],
          correct: 1,
          explanation: 'O AH é humectante — ele puxa água de onde encontrar. Em ambientes muito secos (ar condicionado, clima árido), na ausência de oclusivo por cima, ele começa a puxar água das camadas mais profundas da pele para a superfície, onde evapora. Sempre usar emoliente ou creme depois do AH.'
        },
        {
          question: 'Qual é a afirmação CORRETA sobre colágeno tópico?',
          options: [
            'Colágeno tópico penetra na derme e repõe o colágeno degradado pela idade',
            'Colágeno tópico não penetra na derme — age como humectante superficial; para estimular colágeno use retinol, vitamina C ou peptídeos',
            'Colágeno tópico só funciona em pele madura acima de 45 anos',
            'Colágeno tópico e peptídeos fazem a mesma coisa'
          ],
          correct: 1,
          explanation: 'A molécula de colágeno é grande demais para penetrar além da superfície da pele. Tópico, age como humectante superficial com efeito temporário de plumping. Para estimular produção de colágeno na derme, os ingredientes comprovados são: retinol, vitamina C (cofator da síntese), peptídeos de sinalização e PDRN.'
        },
        {
          question: 'Qual é o diferencial único do esqualano em relação a outros óleos?',
          options: [
            'É o óleo mais hidratante do mercado',
            'É extraído de tubarão, tornando-o mais eficaz',
            'Tem textura seca e não é comedogênico — sendo um dos únicos óleos indicados também para pele oleosa acneica',
            'É o único óleo que estimula colágeno'
          ],
          correct: 2,
          explanation: 'O esqualano tem textura seca e não é comedogênico (não obstrui poros) porque mimetiza o sebo natural da pele. Isso o torna único entre os óleos — pode ser usado por todos os tipos, incluindo pele oleosa e acneica, que normalmente devem evitar óleos.'
        },
        {
          question: 'Por que a niacinamida é considerada o ingrediente mais universal do K-beauty?',
          options: [
            'Porque é o mais barato e fácil de formular',
            'Porque atua em múltiplas vias simultaneamente: manchas, sebo, barreira, inflamação, antioxidante e poros — adequado para todos os tipos de pele',
            'Porque é o único ingrediente sem efeitos colaterais',
            'Porque potencializa todos os outros ingredientes quando combinada'
          ],
          correct: 1,
          explanation: 'A niacinamida é universal porque resolve múltiplos problemas ao mesmo tempo: inibe transferência de melanina (manchas), regula sebo (oleosidade), estimula ceramidas (barreira), é anti-inflamatória (acne/vermelhidão) e antioxidante. Funciona para qualquer tipo de pele, em qualquer horário, combinando com praticamente tudo.'
        }
      ]
    },
    {
      id: 'mod-sk-6-tratamento',
      title: 'Ingredientes de Tratamento — Manchas e Anti-Aging',
      description: 'Vitamina C, retinol, bakuchiol, peptídeos, PDRN, ácido tranexâmico, arbutin e coenzima Q10.',
      duration: 45,
      content: `
<h2>VITAMINA C — Antioxidante e Clareador</h2>
<p><strong>O que é:</strong> Ácido ascórbico e derivados. O antioxidante mais estudado em skincare.</p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Antioxidante — neutraliza radicais livres gerados por UV e poluição</li>
  <li>Inibe tirosinase → reduz produção de melanina → clareia manchas</li>
  <li>Cofator essencial na síntese de colágeno (sem vitamina C, fibroblastos não produzem colágeno estável)</li>
  <li>Fotoproteção indireta (antioxidante potencializa SPF)</li>
  <li>Melhora luminosidade e uniformidade do tom</li>
</ul>

<h3>Derivados e suas características</h3>
<table>
  <tr><th>Forma</th><th>Estabilidade</th><th>Eficácia</th><th>Irritação</th></tr>
  <tr><td>Ácido Ascórbico (L-AA)</td><td>Baixa (oxida fácil)</td><td>Máxima</td><td>Média-Alta</td></tr>
  <tr><td>Ascorbyl Glucoside</td><td>Alta</td><td>Boa</td><td>Baixa</td></tr>
  <tr><td>Ethyl Ascorbic Acid</td><td>Alta</td><td>Alta</td><td>Baixa</td></tr>
  <tr><td>3-O-Ethyl Ascorbic Acid</td><td>Alta</td><td>Alta</td><td>Baixa</td></tr>
  <tr><td>Ascorbyl Tetraisopalmitate</td><td>Muito Alta</td><td>Lipossolúvel, boa</td><td>Mínima</td></tr>
</table>
<p><strong>Estabilidade — o maior desafio:</strong> ácido ascórbico puro oxida em contato com luz e ar (produto fica amarelo-laranja → marrom = oxidado = inativo). Armazenar em frasco escuro, fechar bem.</p>
<p><strong>Horário:</strong> manhã (antioxidante máximo). <strong>Concentração eficaz:</strong> 10–20% de L-AA; 5–15% para derivados estáveis.</p>
<p><strong>Combinações:</strong> com vitamina E + ferúlico (sinergia antioxidante clássica). Com niacinamida (manhã). Com SPF.</p>
<p><strong>Não combinar na mesma aplicação:</strong> com retinol (pH incompatível), com benzoil peróxida (oxida).</p>

<h2>RETINOL — Anti-Aging Rei</h2>
<p><strong>Hierarquia dos retinoides (mais suave ao mais potente):</strong></p>
<p>Retinyl Palmitate → Retinol → Retinaldehyde (Retinal) → Tretinoin (prescrição)</p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Acelera turnover celular (células mortas esfoliam mais rápido)</li>
  <li>Estimula fibroblastos a produzir mais colágeno</li>
  <li>Inibe enzimas MMP que degradam colágeno</li>
  <li>Normaliza queratinização (antiacne)</li>
  <li>Reduz hiperpigmentação e linhas finas</li>
</ul>
<p><strong>Quem não deve usar:</strong> grávidas e lactantes (categoria X), pele com barreira comprometida, rosácea severa ativa.</p>
<p><strong>Efeitos colaterais esperados (purging — 4–8 semanas):</strong> descamação, vermelhidão, ressecamento, eventual piora temporária da acne.</p>
<p><strong>Como minimizar:</strong> começar com concentração baixa (0,025–0,1%), usar 1–2x/semana, buffer ("sandwich method" = hidratante antes do retinol), usar à noite.</p>
<p><strong>Horário:</strong> exclusivamente noturno. <strong>Concentração eficaz sem prescrição:</strong> 0,025–1%.</p>

<h2>BAKUCHIOL — Retinol Sem Irritação</h2>
<p><strong>O que é:</strong> Extrato natural da planta Psoralea corylifolia (babchi). Agonista dos mesmos receptores do retinol.</p>
<p><strong>Por que é diferente do retinol:</strong></p>
<ul>
  <li>Não causa purging</li>
  <li>Não fotossensibiliza (pode usar manhã e noite)</li>
  <li>Seguro na gravidez</li>
  <li>Tolerado por peles sensíveis</li>
</ul>
<p><strong>Eficácia vs. retinol:</strong> estudo de 2018 no <em>British Journal of Dermatology</em> mostrou eficácia comparável para linhas e hiperpigmentação após 12 semanas, com significativamente menos irritação.</p>
<p><strong>Concentração eficaz:</strong> 0,5–2%. <strong>Tempo para resultados:</strong> 8–12 semanas.</p>

<h2>PEPTÍDEOS — Firmeza Sem Irritação</h2>
<p><strong>O que são:</strong> Cadeias curtas de aminoácidos que atuam como "mensageiros" na pele.</p>
<table>
  <tr><th>Tipo</th><th>Mecanismo</th><th>Exemplo</th></tr>
  <tr><td>Sinalização</td><td>Instrui fibroblastos a produzir colágeno</td><td>Palmitoyl Pentapeptide-4 (Matrixyl)</td></tr>
  <tr><td>Neurotransmissor-like</td><td>Relaxa tensão muscular (alternativa botox)</td><td>Argireline (Acetyl Hexapeptide-3)</td></tr>
  <tr><td>Carreadores</td><td>Transportam minerais para a pele</td><td>GHK-Cu (cobre)</td></tr>
</table>
<p><strong>Diferencial:</strong> não irritam. Podem ser usados com qualquer ativo. Perfeitos para peles que não toleram retinol.</p>
<p><strong>Peptídeo de cobre (GHK-Cu):</strong> especialmente eficaz para cicatrização e remodelamento de colágeno. Cor azul-verde característica (normal).</p>
<p><strong>Argireline:</strong> peptídeo neuromimético — relax muscular localizado. Alternativa suave ao botox tópico. Mais eficaz em linhas de expressão (testa, ao redor dos olhos).</p>
<p><strong>Horário:</strong> manhã e/ou noite. <strong>Tempo para resultados:</strong> 8–16 semanas.</p>

<h2>PDRN — Polinucleotídeos</h2>
<p><strong>O que é:</strong> Fragmentos de DNA extraídos de esperma de salmão. Sigla: PolyDeoxyRiboNucleotide.</p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Ativa receptor A2A de adenosina → estimula cicatrização e renovação celular</li>
  <li>Aumenta proliferação de fibroblastos → mais colágeno e elastina</li>
  <li>Estimula angiogênese → melhor nutrição da pele</li>
  <li>Anti-inflamatório potente e cicatrizante</li>
</ul>
<p><strong>Contexto:</strong> famoso nas clínicas estéticas como injeção (skinbooster). Agora disponível em tópicos.</p>
<p><strong>Argumento de venda:</strong> "Esse ingrediente era só injetável — era o que chamavam de biorevitalização nas clínicas. Agora vem em sérum para uso em casa."</p>
<p><strong>Tendência:</strong> um dos ingredientes mais em alta em K-beauty 2024–2025. Marcas: Torriden, Cosrx, Anua.</p>
<p><strong>Quem não deve usar:</strong> possível alergia a proteínas de peixe.</p>

<h2>ÁCIDO TRANEXÂMICO — Especialista em Melasma</h2>
<p><strong>O que é:</strong> Originalmente medicamento hemostático. Inibe produção de melanina via mecanismo diferente da tirosinase.</p>
<p><strong>O que faz:</strong> Inibe ativação de plasminogênio → reduz estimulação de melanócitos. Especialmente eficaz para melasma. Anti-inflamatório e reduz vermelhidão.</p>
<p><strong>Diferencial:</strong> mecanismo diferente da vitamina C e niacinamida. Combinados, efeito depigmentante sinérgico.</p>
<p><strong>Stack completo para manchas:</strong> tranexâmico + niacinamida + vitamina C + SPF rigoroso.</p>
<p><strong>Seguro na gravidez</strong> (oral é usado para hemorragia pós-parto). <strong>Concentração eficaz tópica:</strong> 2–5%.</p>

<h2>ARBUTIN — Clareador Seguro</h2>
<p><strong>O que é:</strong> Glicosídeo da hidroquinona. Existe em forma alpha (mais potente) e beta.</p>
<table>
  <tr><th></th><th>Alpha-Arbutin</th><th>Beta-Arbutin</th></tr>
  <tr><td>Eficácia</td><td>10x mais eficaz</td><td>Moderada</td></tr>
  <tr><td>Estabilidade</td><td>Mais estável</td><td>Menos estável</td></tr>
  <tr><td>Preço</td><td>Mais caro</td><td>Mais barato</td></tr>
</table>
<p><strong>Diferencial:</strong> clareador potente com perfil de segurança excelente — mais seguro que hidroquinona para fototipos médios a escuros.</p>
<p><strong>Concentração eficaz:</strong> alpha-arbutin 0,5–2%, beta-arbutin 1–3%.</p>

<h2>COENZIMA Q10 (Ubiquinona) — Anti-Oxidante Energizante</h2>
<p><strong>O que faz:</strong> antioxidante poderoso, energiza células, reduz linhas finas, melhora firmeza, fotoproteção indireta. Declina com a idade — mais relevante em peles maduras.</p>

<h2>EGF — Fator de Crescimento Epidérmico</h2>
<p><strong>O que faz:</strong> acelera renovação celular, cicatrização, estímulo de colágeno e elastina, rejuvenescimento celular profundo.</p>
<p><strong>Em K-beauty:</strong> muito usado em séruns premium e ampoules anti-aging.</p>
<p><strong>Debate científico:</strong> penetração tópica questionada — mas estudos mostram efeito. Não usar em peles com histórico de câncer (por precaução).</p>

<h2>CAFEÍNA — Para Olheiras e Inchaço</h2>
<p><strong>O que faz:</strong> vasoconstritora (reduz edema, olheiras vasculares), antioxidante, anti-inflamatória, decompõe triglicerídeos (olheiras gordurosas, celulite).</p>
<p><strong>Produto ícone:</strong> The Ordinary Caffeine Solution 5% + EGCG — bestseller para olheiras.</p>

<h2>Guia de Compatibilidade — Anti-Aging</h2>
<table>
  <tr><th>Pode combinar</th><th>Observação</th></tr>
  <tr><td>Bakuchiol + Vitamina C</td><td>Sem problema — bakuchiol não é fotossensibilizante</td></tr>
  <tr><td>Retinol + Niacinamida</td><td>Niacinamida mitiga irritação do retinol</td></tr>
  <tr><td>Retinol + Peptídeos</td><td>Anti-aging reforçado</td></tr>
  <tr><td>Vitamina C (manhã) + Retinol (noite)</td><td>A dupla anti-aging mais estudada</td></tr>
  <tr><td>Tranexâmico + Niacinamida + Vitamina C</td><td>Stack sinérgico para manchas</td></tr>
</table>
<table>
  <tr><th>Evitar na mesma aplicação</th><th>Por quê</th></tr>
  <tr><td>Vitamina C + Retinol</td><td>pH incompatível; usar manhã e noite respectivamente</td></tr>
  <tr><td>Retinol + Benzoil Peróxida</td><td>Oxida e inativa o retinol</td></tr>
  <tr><td>Vitamina C + Benzoil Peróxida</td><td>Oxida a vitamina C</td></tr>
  <tr><td>Múltiplos ativos novos ao mesmo tempo</td><td>Impossível isolar reação adversa</td></tr>
</table>
      `.trim(),
      quiz: [
        {
          question: 'Um cliente quer usar retinol. Quais perguntas você faz ANTES de recomendar?',
          options: [
            'Apenas qual concentração ele prefere',
            'Se está grávida/amamentando, se tem barreira comprometida ou rosácea severa, e se tem experiência prévia com retinol',
            'Apenas se tem pele sensível',
            'Se prefere retinol de manhã ou à noite'
          ],
          correct: 1,
          explanation: 'Antes de recomendar retinol: (1) está grávida ou amamentando? → categoria X, contraindicado; (2) tem barreira comprometida, rosácea severa? → aguardar recovery; (3) tem experiência prévia? → determina a concentração de início; (4) usa SPF? → retinol fotossensibiliza, SPF é obrigatório.'
        },
        {
          question: 'Por que vitamina C e retinol devem ser usados em horários diferentes?',
          options: [
            'Porque a vitamina C é cara e deve ser usada com cuidado',
            'Porque a vitamina C funciona melhor de noite',
            'Porque os dois têm pH incompatíveis — vitamina C precisa pH baixo e retinol funciona melhor em pH mais neutro; além disso o retinol é fotossensibilizante',
            'Porque os dois ingredientes se cancelam mutuamente'
          ],
          correct: 2,
          explanation: 'Vitamina C (ácido ascórbico puro) precisa de pH <3,5 para ser eficaz. Retinol funciona melhor em pH mais próximo do neutro. Além disso, retinol é fotossensibilizante — deve ser usado à noite. Solução clássica: vitamina C de manhã + retinol à noite.'
        },
        {
          question: 'Qual é o mecanismo único do ácido tranexâmico para manchas, que o diferencia da vitamina C e da niacinamida?',
          options: [
            'Ele inibe a tirosinase, a mesma enzima que a vitamina C',
            'Ele inibe a ativação do plasminogênio, reduzindo a estimulação dos melanócitos por um mecanismo independente das outras vias',
            'Ele esfoliana as células pigmentadas mais rapidamente',
            'Ele bloqueia a transferência de melanina como a niacinamida'
          ],
          correct: 1,
          explanation: 'O tranexâmico age inibindo a ativação do plasminogênio, o que reduz a estimulação dos melanócitos. É um mecanismo completamente diferente da vitamina C (que inibe a tirosinase) e da niacinamida (que bloqueia a transferência de melanina). Por isso a combinação dos três é sinérgica — cada um age por uma via diferente.'
        },
        {
          question: 'Uma cliente grávida quer tratar manchas de melasma. Quais ingredientes você recomenda?',
          options: [
            'Retinol + vitamina C + niacinamida',
            'Hidroquinona + ácido glicólico + SPF',
            'Niacinamida + ácido azelaico + vitamina C + bakuchiol + SPF mineral',
            'Retinaldehyde + tranexâmico + peptídeos'
          ],
          correct: 2,
          explanation: 'Para grávidas: niacinamida ✓ (segura), ácido azelaico ✓ (categoria B), vitamina C ✓ (antioxidante, segura), bakuchiol ✓ (alternativa ao retinol, segura), SPF mineral ✓. Proibidos: retinol/retinóides (categoria X), hidroquinona, AHA em alta concentração.'
        }
      ]
    },
    {
      id: 'mod-sk-7-acidos',
      title: 'Ácidos e Botânicos Coreanos',
      description: 'AHA, BHA, PHA, ácido azelaico, heartleaf, mugwort, própolis, tea tree e licorice — quando usar e para quem.',
      duration: 35,
      content: `
<h2>AHA (Alpha Hydroxy Acids) — Esfoliação Química</h2>
<p><strong>O que são:</strong> Ácidos de origem natural. Esfoliantes químicos que atuam na superfície. <strong>Hidrossolúveis.</strong></p>
<table>
  <tr><th>Ácido</th><th>Fonte</th><th>Molécula</th><th>Benefício principal</th></tr>
  <tr><td>Glicólico</td><td>Cana-de-açúcar</td><td>Menor (mais penetração)</td><td>Anti-aging, manchas, textura</td></tr>
  <tr><td>Láctico</td><td>Leite fermentado</td><td>Médio</td><td>Hidratante + esfoliante, gentil</td></tr>
  <tr><td>Mandélico</td><td>Amêndoas</td><td>Maior (mais gentil)</td><td>Acne, pele sensível, tons escuros</td></tr>
  <tr><td>Cítrico</td><td>Frutas cítricas</td><td>Grande</td><td>pH adjuster, antioxidante leve</td></tr>
</table>
<p><strong>O que fazem:</strong> dissolvem ligações entre corneócitos mortos (esfoliação), aceleram turnover, melhoram textura, uniformidade, luminosidade, estimulam colágeno (glicólico), reduzem hiperpigmentação.</p>
<p><strong>Fotossensibilização:</strong> AHAs aumentam sensibilidade ao sol. <strong>SPF obrigatório quando usar AHA na rotina.</strong></p>
<p><strong>Concentração eficaz:</strong> 5–15% (acima de 20% é peel profissional).</p>
<p><strong>Horário:</strong> noite. <strong>Quem não deve usar:</strong> barreira comprometida, rosácea severa, pele muito sensível sem adaptação gradual.</p>

<h2>BHA (Beta Hydroxy Acid) — Especialista em Poros</h2>
<p><strong>O que é:</strong> Ácido salicílico (praticamente o único BHA usado em cosméticos). <strong>Lipossolúvel.</strong></p>
<p><strong>Diferença crucial do AHA:</strong> BHA é lipossolúvel → penetra no folículo sebáceo (gorduroso como o sebo). AHA é hidrossolúvel → atua apenas na superfície.</p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Dissolve cravos de dentro para fora</li>
  <li>Exfolia dentro do poro</li>
  <li>Antibacteriano contra C. acnes</li>
  <li>Anti-inflamatório</li>
  <li>Reduz oleosidade</li>
</ul>
<p><strong>Para quem serve:</strong> pele oleosa, acneica, poros dilatados, cravos.</p>
<p><strong>Quem não deve usar:</strong> grávidas (por convenção), alergia à aspirina (mesmo composto), barreira muito comprometida.</p>
<p><strong>Combinações:</strong> com niacinamida (sinergia para acne oleosa), com centella asiatica (BHA ataca a acne, centella calma a inflamação).</p>
<p><strong>Concentração eficaz:</strong> 0,5–2%. <strong>Horário:</strong> preferencialmente noite.</p>

<h2>PHA (Poly Hydroxy Acid) — Esfoliação Ultra-Suave</h2>
<p><strong>O que é:</strong> Evolução dos AHAs. Moléculas maiores = penetração mais superficial = menos irritação.</p>
<p><strong>Principais:</strong> Gluconolactona, Lactobionic acid, Galactose.</p>
<p><strong>Diferencial:</strong></p>
<ul>
  <li>Esfoliação suavíssima da superfície</li>
  <li>Hidratação (moléculas grandes retêm água)</li>
  <li>Antioxidante e prebiótico (suporta microbioma)</li>
</ul>
<p><strong>Para quem serve:</strong> pele muito sensível que não tolera AHA, rosácea, fototipos médios a escuros (menor risco de PIH induzida pela esfoliação).</p>

<h2>ÁCIDO AZELAICO — Multifuncional e Único para Rosácea</h2>
<p><strong>O que é:</strong> Ácido dicarboxílico produzido por levedura Malassezia furfur.</p>
<p><strong>Único ingrediente com evidência clínica aprovada para rosácea.</strong></p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Antiacne (antimicrobiano, anti-inflamatório, regula queratinização)</li>
  <li>Clareia manchas (inibe tirosinase)</li>
  <li>Trata rosácea</li>
  <li>Reduz vermelhidão</li>
</ul>
<p><strong>Vantagem única:</strong> funciona para inflamação E manchas simultaneamente. <strong>Seguro na gravidez (categoria B).</strong></p>
<p><strong>Concentração eficaz:</strong> 10% (cosmético) a 20% (prescrito para rosácea).</p>

<h2>HEARTLEAF (Houttuynia cordata) — A Nova Centella</h2>
<p><strong>O que é:</strong> Planta herbácea com longa história na medicina asiática. Em coreano: 어성초 (eoseongcho).</p>
<p><strong>O que faz:</strong></p>
<ul>
  <li>Anti-inflamatório extremamente potente</li>
  <li>Antibacteriano (C. acnes)</li>
  <li>Antioxidante e purificante de poros</li>
  <li>Calmante e soothing</li>
</ul>
<p><strong>Tendência:</strong> explosão de popularidade em 2023–2024 como alternativa mais potente à centella. Produto viral: <strong>Anua Heartleaf 77% Soothing Toner</strong> — 77% de extrato de heartleaf.</p>
<p><strong>Para quem serve:</strong> pele acneica com inflamação, sensível com vermelhidão.</p>

<h2>MUGWORT (Artemisia / Ssuk 쑥) — Anti-Inflamatório Botânico</h2>
<p><strong>O que faz:</strong> calmante e anti-inflamatório, antioxidante (rico em flavonoides), antibacteriano, regula sebo, suporta barreira cutânea.</p>
<p><strong>Tendência:</strong> um dos ingredientes em maior crescimento em K-beauty 2023–2025. Marcas: isntree, Cosrx, Ma:nyo, Benton.</p>

<h2>PRÓPOLIS — Antimicrobiano Natural</h2>
<p><strong>O que é:</strong> Resina produzida por abelhas para vedar a colmeia. Rica em flavonoides e ácidos fenólicos.</p>
<p><strong>O que faz:</strong> antimicrobiano, anti-inflamatório, antioxidante, cicatrizante, umectante leve.</p>
<p><strong>Produto ícone:</strong> Cosrx Propolis Light Ampule — bestseller global.</p>
<p><strong>Quem não deve usar:</strong> possível alergia a produtos de colmeia/mel.</p>

<h2>TEA TREE (Melaleuca alternifolia) — Antimicrobiano Clássico</h2>
<p><strong>O que faz:</strong> antimicrobiano de amplo espectro, anti-inflamatório, antifúngico.</p>
<p><strong>CUIDADO:</strong> óleo puro (100%) é irritante — nunca aplicar puro na pele. Usar em formulações diluídas a 5% ou menos.</p>
<p>Para clientes que querem "algo natural" para acne: tea tree em formulação adequada. Mas niacinamida + BHA têm melhor evidência clínica.</p>

<h2>LICORICE (Alcaçuz / Glycyrrhiza) — Clareador Seguro</h2>
<p><strong>O que é:</strong> Extrato de raiz de alcaçuz. Principal composto: glabridina.</p>
<p><strong>O que faz:</strong> inibe tirosinase (clareador), anti-inflamatório, antioxidante, soothing.</p>
<p><strong>Diferencial:</strong> clareador potente com excelente perfil de segurança — incluindo para fototipos médios a escuros.</p>

<h2>MADECASSOSIDE — Composto Isolado de Centella</h2>
<p><strong>O que é:</strong> Composto isolado da centella asiatica — mais concentrado e previsível que o extrato completo.</p>
<p><strong>O que faz:</strong> anti-inflamatório potente, cicatrizante, estimula colágeno tipo I, reforça barreira, calmante imediato.</p>
<p><strong>Para quem serve:</strong> pele pós-procedimento, acne inflamada, queimaduras solares, sensível.</p>

<h2>Guia Rápido — Ácidos: Qual Usar para Qual Problema</h2>
<table>
  <tr><th>Problema</th><th>Ácido Indicado</th><th>Por quê</th></tr>
  <tr><td>Cravos e poros</td><td>BHA (salicílico)</td><td>Lipossolúvel, penetra no poro</td></tr>
  <tr><td>Textura e luminosidade</td><td>AHA (glicólico ou láctico)</td><td>Esfoliação superficial eficaz</td></tr>
  <tr><td>Pele sensível que quer esfoliação</td><td>PHA ou mandélico</td><td>Moléculas maiores, menos irritação</td></tr>
  <tr><td>Rosácea</td><td>Azelaico</td><td>Único com evidência clínica aprovada</td></tr>
  <tr><td>Acne + manchas simultâneos</td><td>Azelaico</td><td>Trata os dois ao mesmo tempo</td></tr>
  <tr><td>Pele negra/morena com acne</td><td>Mandélico ou PHA</td><td>Menor risco de PIH</td></tr>
</table>
      `.trim(),
      quiz: [
        {
          question: 'Qual é a diferença fundamental entre AHA e BHA em termos de mecanismo e penetração?',
          options: [
            'AHA penetra mais fundo; BHA fica na superfície',
            'AHA é hidrossolúvel e age na superfície; BHA é lipossolúvel e penetra dentro do poro (folículo sebáceo)',
            'AHA é para pele oleosa; BHA é para pele seca',
            'Não há diferença de penetração — ambos atuam no stratum corneum'
          ],
          correct: 1,
          explanation: 'AHA é hidrossolúvel — age apenas na superfície da pele, exfoliando células mortas. BHA é lipossolúvel — consegue penetrar dentro do folículo sebáceo (que tem ambiente gorduroso), dissolvendo cravos de dentro para fora. Por isso o BHA é o esfoliante certo para cravos e poros.'
        },
        {
          question: 'Por que o ácido mandélico é preferível ao ácido glicólico para fototipos IV–V (pele morena/negra)?',
          options: [
            'Porque o mandélico clareia mais rápido que o glicólico',
            'Porque o mandélico tem molécula maior, penetra menos e tem menor risco de causar hiperpigmentação pós-inflamatória (PIH)',
            'Porque o glicólico é muito caro para esse público',
            'Porque o mandélico não exige uso de SPF após aplicação'
          ],
          correct: 1,
          explanation: 'O ácido mandélico tem molécula maior que o glicólico, portanto penetra menos na pele. Em fototipos mais escuros (IV–V), esfoliação mais profunda aumenta o risco de hiperpigmentação pós-inflamatória — a pele pode escurecer onde foi irritada. O mandélico oferece exfoliação eficaz com menor risco de PIH.'
        },
        {
          question: 'Qual ingrediente é o único com evidência clínica aprovada especificamente para rosácea, e por qual motivo é especial?',
          options: [
            'Centella asiatica — porque é o mais anti-inflamatório',
            'Niacinamida — porque reduz vermelhidão',
            'Ácido azelaico — único com evidência clínica para rosácea; também trata acne e manchas simultaneamente; seguro na gravidez',
            'Aloe vera — porque é o mais suave'
          ],
          correct: 2,
          explanation: 'O ácido azelaico é o único ingrediente com evidência clínica aprovada especificamente para rosácea. Além disso, é antimicrobiano (antiacne), inibe tirosinase (clareia manchas), é anti-inflamatório E seguro na gravidez (categoria B). Essa combinação de benefícios com excelente tolerabilidade o torna único.'
        },
        {
          question: 'O Anua Heartleaf 77% Soothing Toner viralizou. Para qual perfil de cliente você indicaria prioritariamente?',
          options: [
            'Pele madura com linhas finas — o heartleaf estimula colágeno',
            'Pele muito seca — o heartleaf é o melhor humectante do K-beauty',
            'Pele acneica com muita inflamação, vermelhidão e pus — heartleaf tem ação antibacteriana e anti-inflamatória potente',
            'Qualquer tipo de pele — é o produto mais universal do K-beauty atual'
          ],
          correct: 2,
          explanation: 'O heartleaf é anti-inflamatório extremamente potente e antibacteriano (C. acnes). O tônico com 77% de extrato é ideal para pele acneica inflamada — reduz a vermelhidão rapidamente enquanto combate a bactéria da acne. Para pele seca ou madura sem inflamação, há escolhas mais adequadas.'
        }
      ]
    }
  ]
}
