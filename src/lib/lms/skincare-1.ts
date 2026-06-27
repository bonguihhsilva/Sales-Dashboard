import type { LmsTrilha } from './types'

export const skincareT1: LmsTrilha = {
  id: 'trilha-sk-1',
  slug: 'fundamentos-kbeauty',
  title: 'Fundamentos do K-Beauty',
  description: 'História, filosofia e anatomia da pele — a base científica e cultural por trás do skincare coreano.',
  icon: '🌸',
  color: '#E91E8C',
  xpReward: 350,
  area: 'skincare',
  lessons: [
    {
      id: 'mod-sk-1-historia',
      title: 'História e Filosofia do K-Beauty',
      description: '5.000 anos de cultura de pele, o ideal de porcelana da era Joseon e por que a Coreia lidera o mercado global.',
      duration: 30,
      content: `
<h2>1.1 — Origens: Mais de 5.000 Anos de Cultura de Pele</h2>
<p>O skincare coreano não nasceu na prateleira de uma farmácia. Nasceu na filosofia, na medicina tradicional e na cultura de um povo que sempre tratou a pele como reflexo da saúde interna.</p>

<h3>Era Três Reinos (57 a.C. – 668 d.C.)</h3>
<p>Os três reinos — Goguryeo, Baekje e Silla — já documentavam uso de ingredientes naturais na pele. Mulheres aristocratas utilizavam:</p>
<ul>
  <li><strong>Camellia oil</strong> — hidratação e proteção</li>
  <li><strong>Arroz fermentado</strong> — tônico clareador (trabalhadoras de cervejarias de arroz tinham rostos notavelmente mais jovens que o restante do corpo)</li>
  <li><strong>Chá verde</strong> — antioxidante tópico</li>
  <li><strong>Ginseng</strong> — circulação e vitalidade</li>
</ul>

<h3>Era Joseon (1392–1897) — O Padrão Estético se Consolida</h3>
<p>A era Joseon estabeleceu o ideal estético que ainda ressoa no K-beauty contemporâneo: <strong>pele como porcelana</strong> (도자기 피부 / dojaagi pibu).</p>
<ul>
  <li>Pele uniforme, sem manchas</li>
  <li>Textura lisa e translúcida</li>
  <li>Hidratação visível</li>
  <li>Ausência de vermelhidão</li>
</ul>
<p>A medicina <strong>Hanbang (한방)</strong> — medicina herbal tradicional — classificava ingredientes por propriedades de "esfriamento" ou "aquecimento" da pele, criando o conceito de skincare como medicina preventiva, não corretiva.</p>

<h3>Modernização (1945–1990)</h3>
<ul>
  <li><strong>1945:</strong> Fundação da Pacific Corporation (hoje Amorepacific) — maior empresa de cosméticos da Ásia</li>
  <li><strong>1954:</strong> Primeiro creme de massa coreano — ABC Powder Cream</li>
  <li><strong>Anos 1990:</strong> Marcas como Innisfree, Etude House e Missha democratizam o skincare</li>
</ul>

<h2>1.2 — A Filosofia Central do K-Beauty</h2>
<h3>Ocidental vs. Coreano — A Grande Divergência</h3>
<table>
  <tr><th>Dimensão</th><th>Skincare Ocidental</th><th>Skincare Coreano</th></tr>
  <tr><td>Filosofia</td><td>Corretivo — trata quando aparece</td><td>Preventivo — mantém antes de aparecer</td></tr>
  <tr><td>Foco</td><td>Eficácia pontual, resultados rápidos</td><td>Saúde da barreira a longo prazo</td></tr>
  <tr><td>Passos</td><td>3–5</td><td>7–12</td></tr>
  <tr><td>Ativos</td><td>Alta concentração</td><td>Concentrações menores, acumulação gradual</td></tr>
  <tr><td>Tolerância à irritação</td><td>"Se ardeu, funcionou"</td><td>Irritação = alarme, não eficácia</td></tr>
  <tr><td>Pele ideal</td><td>Maquiável, coberta</td><td>Nua, saudável, luminosa por si só</td></tr>
  <tr><td>SPF</td><td>Recomendado</td><td>Mandatório</td></tr>
</table>

<h3>"Healthy Skin First"</h3>
<p><strong>Pele saudável não precisa de maquiagem. Pele saudável é o destino, não o ponto de partida.</strong></p>
<p>Implicação comercial direta: quando cliente chega pedindo produto pontual para mancha, o consultor treinado vende rotina completa — porque a mancha é sintoma de barreira comprometida, não problema isolado.</p>

<h3>Filosofia da Camada (레이어링 / Layering)</h3>
<p>O skincare coreano funciona como uma construção em camadas:</p>
<ul>
  <li>Limpeza (barreira limpa)</li>
  <li>Tônico (prepara e primeira hidratação)</li>
  <li>Essence (tratamento base)</li>
  <li>Ampoule/Sérum (ativo concentrado)</li>
  <li>Emulsão/Creme (selagem)</li>
  <li>SPF (proteção) ou Sleeping Mask (noturno)</li>
</ul>
<p>Cada camada é <strong>complementar, não redundante</strong>. Isso é o que separa vendedor de consultor.</p>

<h2>1.3 — Como a Coreia se Tornou Líder Mundial</h2>
<h3>O Papel do Governo: Hallyu (한류)</h3>
<p>Em 1999, o governo coreano lançou o <strong>Korean Wave (Hallyu)</strong> — estratégia nacional de exportação cultural após a crise financeira de 1997. Três pilares: dramas, K-pop e cosméticos.</p>
<p>Resultado: atriz coreana com pele perfeita em drama → mundo quer saber o que ela usa → indústria cosmética pronta para responder.</p>

<h3>Regulamentação Inteligente</h3>
<p>A Coreia tem categoria de "cosmecêuticos" — concentrações maiores que cosmético comum sem exigir registro farmacêutico. Inovação chega ao mercado 3–5x mais rápido que na Europa ou EUA.</p>

<h3>Consumidor Interno como Motor de Inovação</h3>
<ul>
  <li>Média de 7–8 produtos na rotina diária</li>
  <li>App <strong>Hwahae (화해)</strong> — 11+ milhões de usuários avaliando INCI lists de produtos</li>
  <li>Literacia alta em ingredientes: sabem o que é niacinamida, ceramida, peptídeo</li>
  <li>Feedback rápido força inovação em ciclos de 12–18 meses</li>
</ul>

<h3>Inovações Tecnológicas Coreanas</h3>
<table>
  <tr><th>Formato</th><th>Inovação</th><th>Impacto</th></tr>
  <tr><td>Cushion Compact</td><td>Amorepacific patenteou em 2008</td><td>Copiado por Lancôme, Dior, L'Oréal</td></tr>
  <tr><td>Sheet Mask</td><td>Inspirada em curativos clínicos pós-procedimento</td><td>Bilhões de unidades exportadas/ano</td></tr>
  <tr><td>Ampoule</td><td>Sérum hiper-concentrado em ciclos</td><td>Adaptação de tratamentos clínicos para uso doméstico</td></tr>
  <tr><td>Sleeping Mask</td><td>Máscara deixada durante o sono</td><td>Tratamento intensivo sem experiência de produto</td></tr>
  <tr><td>Essence</td><td>Camada líquida de tratamento base</td><td>Inexistente no skincare ocidental clássico</td></tr>
</table>

<h3>Fermentação — A Biotecnologia Tradicional Modernizada</h3>
<p>O processo de fermentação:</p>
<ul>
  <li>Reduz tamanho molecular → maior penetração cutânea</li>
  <li>Cria novos bioativos não presentes no ingrediente original</li>
  <li>Aumenta biodisponibilidade de vitaminas e aminoácidos</li>
  <li>Melhora tolerância cutânea</li>
</ul>

<h2>1.4 — O Consumidor da Pontocom: Perfis e Abordagens</h2>
<table>
  <tr><th>Perfil</th><th>Comportamento</th><th>Abordagem</th></tr>
  <tr><td>Iniciante curioso</td><td>Viu TikTok/Reels, não sabe por onde começar</td><td>Simplifique em 3 passos. Não sobrecarregue</td></tr>
  <tr><td>Entusiasta intermediário</td><td>Já tem rotina, quer otimizar</td><td>Vá fundo em ingredientes</td></tr>
  <tr><td>Compradora por preço</td><td>Quer resultado, olha o ticket</td><td>Âncora com produto caro, ofereça alternativa inteligente</td></tr>
  <tr><td>Turista/revendedora</td><td>Compra para revender no Brasil/Argentina</td><td>Volume, marcas conhecidas, trending</td></tr>
  <tr><td>Pele de cor média/escura</td><td>Preocupa com manchas, hiperpigmentação</td><td>Tranexâmico, niacinamida, arbutin</td></tr>
</table>

<h2>Estudo de Caso</h2>
<p><strong>Cenário:</strong> Cliente entra pedindo "um creme hidratante coreano que viu no TikTok".</p>
<p><strong>Abordagem correta:</strong> Valide a percepção → explique layering em 30 segundos → faça 2 perguntas de diagnóstico ("sua pele fica oleosa ou seca ao longo do dia? usa protetor solar?") → construa mini-rotina de 3 passos. O creme vira item 3 de 3. Ticket médio: 3–4x maior.</p>
      `.trim(),
      quiz: [
        {
          question: 'Qual era histórica consolidou o ideal de "pele como porcelana" (dojaagi pibu) na Coreia?',
          options: ['Era Três Reinos', 'Era Joseon', 'Era Colonial', 'Era Moderna (pós-1945)'],
          correct: 1,
          explanation: 'A era Joseon (1392–1897) estabeleceu o ideal estético de pele uniforme, translúcida e luminosa que ainda ressoa no K-beauty contemporâneo.'
        },
        {
          question: 'Qual é a principal diferença filosófica entre skincare ocidental e coreano?',
          options: [
            'O ocidental usa mais passos que o coreano',
            'O coreano é corretivo e o ocidental é preventivo',
            'O coreano é preventivo e o ocidental é corretivo',
            'Não há diferença filosófica, apenas de ingredientes'
          ],
          correct: 2,
          explanation: 'O skincare coreano é preventivo — mantém a saúde da barreira antes de problemas aparecerem. O ocidental é corretivo — trata o problema quando já está visível.'
        },
        {
          question: 'O que é Hallyu e qual seu impacto na indústria cosmética coreana?',
          options: [
            'É um ingrediente tradicional coreano que virou tendência global',
            'É a estratégia governamental de exportação cultural que incluiu cosméticos como um dos três pilares',
            'É o nome da empresa Amorepacific em coreano',
            'É o processo de fermentação usado em essences coreanas'
          ],
          correct: 1,
          explanation: 'Hallyu (한류 / Korean Wave) foi lançado em 1999 como estratégia nacional com três pilares: dramas, K-pop e cosméticos. Quando atrizes coreanas apareciam em dramas com pele perfeita, o mundo queria saber o que usavam — e a indústria estava pronta.'
        },
        {
          question: 'Por que o layering (aplicação em camadas) é mais eficiente que uma única camada espessa de produto?',
          options: [
            'Porque cada produto tem um pH diferente que neutraliza o anterior',
            'Porque camadas finas criam gradiente osmótico que retém água por mais tempo',
            'Porque produtos caros devem ser diluídos em outros produtos',
            'Não é mais eficiente — o layering é apenas uma estratégia de marketing coreano'
          ],
          correct: 1,
          explanation: 'Múltiplas camadas finas criam um gradiente osmótico que retém água na pele por mais tempo. É como molhar uma esponja aos poucos — ela absorve melhor do que com uma quantidade grande de uma vez.'
        }
      ]
    },
    {
      id: 'mod-sk-2-anatomia',
      title: 'Anatomia da Pele',
      description: 'Estrutura do stratum corneum, barreira cutânea, como manchas se formam, e por que o pH do cleanser importa.',
      duration: 35,
      content: `
<h2>2.1 — Estrutura: O Que é a Pele</h2>
<p>A pele é o maior órgão do corpo humano: ~1,5–2 m², 3,5–10 kg. Três funções primárias:</p>
<ul>
  <li><strong>Proteção</strong> — barreira física contra patógenos, UV, poluição, agentes químicos</li>
  <li><strong>Regulação</strong> — temperatura corporal, retenção hídrica, pH</li>
  <li><strong>Sensação</strong> — receptores de toque, pressão, temperatura, dor</li>
</ul>
<p>As três camadas: <strong>Epiderme</strong> (superfície, onde produtos atuam) → <strong>Derme</strong> (colágeno, elastina, ácido hialurônico) → <strong>Hipoderme</strong> (gordura, vasos profundos).</p>

<h2>2.2 — Epiderme e o Stratum Corneum</h2>
<p>A epiderme tem 5 sub-camadas. A mais importante para o skincare é o <strong>Stratum Corneum</strong> (camada mais superficial) — estrutura de "tijolos e argamassa":</p>
<ul>
  <li><strong>Tijolos</strong> = corneócitos (células mortas queratinizadas)</li>
  <li><strong>Argamassa</strong> = ceramidas (50%) + ácidos graxos (10–20%) + colesterol (25%)</li>
</ul>

<h3>Barreira Íntegra vs. Comprometida</h3>
<table>
  <tr><th>Barreira Saudável</th><th>Barreira Comprometida</th></tr>
  <tr><td>Hidratação retida</td><td>TEWL (perda de água) aumentado → pele seca</td></tr>
  <tr><td>Patógenos bloqueados</td><td>Sensibilidade e vermelhidão</td></tr>
  <tr><td>Irritantes impedidos</td><td>Acne piora</td></tr>
  <tr><td>Pele resistente</td><td>Manchas aparecem mais fácil</td></tr>
</table>
<p><strong>Regra de ouro:</strong> antes de recomendar qualquer ativo potente (vitamina C, retinol, ácidos), pergunte se a barreira está saudável. Barreira comprometida + ativo potente = irritação + cliente insatisfeito.</p>

<h3>NMF — Natural Moisturizing Factor</h3>
<p>Cocktail de substâncias hidrófilas dentro dos corneócitos que mantêm o stratum corneum hidratado:</p>
<ul>
  <li>Aminoácidos livres (40%)</li>
  <li>PCA (ácido pirrolidona carboxílico) (12%)</li>
  <li>Ácido láctico e sais (12%)</li>
  <li>Uréia (7%)</li>
</ul>
<p>Ingredientes como glicerina, ácido hialurônico, uréia e aminoácidos funcionam porque imitam ou reforçam o NMF — transforma um produto "simples" em solução científica.</p>

<h3>Como as Manchas se Formam — Melanócitos</h3>
<p>Na base da epiderme ficam os melanócitos — células que produzem melanina:</p>
<ul>
  <li>Gatilho (UV / inflamação / hormônio) ativa o melanócito</li>
  <li>Melanina produzida em excesso é transferida para queratinócitos vizinhos</li>
  <li>Queratinócitos "tingidos" sobem para a superfície</li>
  <li>Mancha visível</li>
</ul>
<p><strong>Por que leva 4–8 semanas para tratar manchas:</strong> esse ciclo de turnover celular dura exatamente esse tempo. Produtos que "clarareiam em 3 dias" não existem.</p>

<h2>2.3 — Derme: O Colchão Estrutural</h2>
<p>Abaixo da epiderme (1–4 mm). Contém as estruturas que determinam firmeza e elasticidade:</p>
<ul>
  <li><strong>Colágeno (70–80%):</strong> resistência e estrutura. Produzido por fibroblastos. Degradado por UV, poluição, inflamação.</li>
  <li><strong>Elastina (2–4%):</strong> permite que a pele volte à forma. Produção quase cessa após os 20 anos.</li>
  <li><strong>Ácido Hialurônico:</strong> retém até 1.000x seu peso em água. Reduz com a idade.</li>
  <li><strong>Fibroblastos:</strong> ativados por vitamina C, retinol, peptídeos — produzem colágeno, elastina e HA.</li>
</ul>

<h2>2.4 — Barreira Cutânea: O Conceito Central do K-Beauty</h2>
<h3>Manto Ácido</h3>
<p>Filme hidrolipídico na superfície da pele:</p>
<ul>
  <li><strong>pH entre 4,5–5,5</strong> (levemente ácido)</li>
  <li>Inibe bactérias patogênicas, mantém enzimas da barreira ativas</li>
</ul>
<p>O que compromete o pH:</p>
<ul>
  <li>Sabonetes alcalinos (pH 9–10) — destroem o manto ácido</li>
  <li>Álcool desnaturante em tônicos</li>
  <li>Esfoliação excessiva</li>
</ul>
<p><strong>Argumento de venda:</strong> sabonetes comuns de banheiro têm pH 9–10. Um bom cleanser coreano tem pH 5–6. Isso sozinho justifica a troca de produto.</p>

<h3>Microbioma Cutâneo</h3>
<p>A pele hospeda ~10¹² microrganismos em equilíbrio. O que desequilibra:</p>
<ul>
  <li>Uso excessivo de antibióticos tópicos</li>
  <li>Álcool em produtos</li>
  <li>Esfoliação agressiva</li>
  <li>Sabonetes antibacterianos diários</li>
</ul>
<p>Ingredientes que suportam: prebióticos (inulina), probióticos (lactobacillus ferment), postbióticos (filtrados de fermentação).</p>

<h2>2.5 — Como a Pele Envelhece</h2>
<table>
  <tr><th>Faixa etária</th><th>O que acontece</th></tr>
  <tr><td>20s</td><td>Turnover desacelera: 21 dias → 28 dias</td></tr>
  <tr><td>30s</td><td>Colágeno cai ~1%/ano. Primeiras linhas fixas</td></tr>
  <tr><td>40s</td><td>HA natural reduz 50%. Poros mais visíveis</td></tr>
  <tr><td>50s+</td><td>Menopausa → pele mais fina, mais seca, menos firme</td></tr>
</table>
<p><strong>80% dos sinais de envelhecimento visíveis são causados por UV.</strong> Esta é a estatística mais poderosa para vender protetor solar. Nenhum sérum de colágeno compensa a ausência de fotoproteção.</p>

<h2>2.6 — Hidratação vs. Oleosidade</h2>
<p><strong>Erro mais comum:</strong> confundir pele oleosa com pele hidratada.</p>
<table>
  <tr><th>Conceito</th><th>O que é</th><th>Ingredientes</th></tr>
  <tr><td>Hidratação</td><td>Conteúdo de água nas células</td><td>Ácido hialurônico, glicerina, uréia, pantenol</td></tr>
  <tr><td>Oleosidade</td><td>Quantidade de sebo produzido pelas glândulas sebáceas</td><td>Regulado por hormônios, pH, genética</td></tr>
  <tr><td>Emolientes</td><td>Preenchem lacunas entre corneócitos</td><td>Ceramidas, esqualano, óleos vegetais</td></tr>
  <tr><td>Oclusivos</td><td>Criam filme físico que reduz TEWL</td><td>Vaselina, manteiga de karité, dimeticone</td></tr>
</table>
<p><strong>Insight contraintuitivo:</strong> pele oleosa pode ser desidratada. Quando a pele está desidratada, produz mais sebo como mecanismo compensatório. Solução não é reduzir oleosidade — é hidratar.</p>

<h2>2.7 — Estimuladores de Colágeno</h2>
<p>Em ordem de eficácia comprovada:</p>
<ul>
  <li><strong>Retinol/Retinoides</strong> — estimulam fibroblastos diretamente, inibem MMPs</li>
  <li><strong>Vitamina C</strong> — cofator essencial na síntese de colágeno</li>
  <li><strong>Peptídeos de sinalização</strong> — "mensageiros" que instruem fibroblastos</li>
  <li><strong>EGF (Epidermal Growth Factor)</strong> — estimula renovação celular</li>
  <li><strong>PDRN (Polinucleotídeos)</strong> — fragmentos de DNA que ativam receptores de crescimento</li>
  <li><strong>Niacinamida</strong> — estimula produção indireta de ceramidas e melhora o microambiente</li>
</ul>
      `.trim(),
      quiz: [
        {
          question: 'Quais são os três componentes da "argamassa" do stratum corneum?',
          options: [
            'Colágeno, elastina e ácido hialurônico',
            'Ceramidas, ácidos graxos livres e colesterol',
            'NMF, uréia e aminoácidos',
            'Queratinócitos, melanócitos e fibroblastos'
          ],
          correct: 1,
          explanation: 'A argamassa do stratum corneum é composta por ceramidas (50%), ácidos graxos livres (10–20%) e colesterol (25%). Quando essa composição está completa, a barreira funciona como escudo eficiente.'
        },
        {
          question: 'Por que pele oleosa pode ser desidratada ao mesmo tempo?',
          options: [
            'Não pode — oleosidade e hidratação são a mesma coisa',
            'Porque oleosidade (sebo das glândulas) e hidratação (água nas células) são mecanismos independentes',
            'Porque o sol resseca a pele e estimula sebo ao mesmo tempo',
            'Porque ingredientes anti-oleosidade sempre ressecam a pele'
          ],
          correct: 1,
          explanation: 'Oleosidade e hidratação são completamente independentes. O sebo é produzido por glândulas sebáceas (influenciado por hormônios). A hidratação é o conteúdo de água nas células. Pele oleosa desidratada produz mais sebo como compensação — hidratar pode reduzir a oleosidade.'
        },
        {
          question: 'Qual percentual do envelhecimento visível é causado por UV?',
          options: ['40%', '60%', '80%', '95%'],
          correct: 2,
          explanation: '80% dos sinais de envelhecimento visíveis são causados por UV (fotoenvelhecimento). Este dado justifica que o SPF é o produto anti-aging mais eficaz existente — nenhum sérum de colágeno compensa a ausência de fotoproteção.'
        },
        {
          question: 'Por que leva 4–8 semanas para tratar manchas com produtos tópicos?',
          options: [
            'Os produtos tópicos são pouco eficazes e precisam de mais tempo para funcionar',
            'É o ciclo de turnover celular — os queratinócitos com melanina levam esse tempo para subir do stratum basale até a superfície',
            'As manchas precisam de múltiplas camadas de produto para clarear',
            'O pH dos produtos demora para se estabilizar na pele'
          ],
          correct: 1,
          explanation: 'O ciclo de turnover celular dura 4–8 semanas. A melanina é produzida no stratum basale (base da epiderme) e os queratinócitos tingidos levam esse tempo para migrar até a superfície. Produtos que prometem clarear em 3 dias são mitos.'
        }
      ]
    }
  ]
}
