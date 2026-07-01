import type { LmsTrilha } from './types'

export const trilha7: LmsTrilha = {
  id: 'trilha-7',
  slug: 'perfumaria',
  title: 'Perfumaria de Alto Nível',
  description: 'História, anatomia, famílias olfativas, ingredientes, grandes casas, perfumaria árabe e de nicho, técnicas de venda e inteligência de mercado para Ciudad del Este.',
  icon: '🌸',
  color: '#EC4899',
  xpReward: 1300,
  area: 'vendas',
  lessons: [
    {
      id: 'mod-7-1-historia',
      title: 'História da Perfumaria',
      description: 'Da Mesopotâmia ao boom árabe moderno: origem, evolução, as quatro grandes escolas e a indústria por trás das marcas.',
      duration: 30,
      content: `
<h2>Origem — o começo de tudo</h2>
<p><strong>Per fumum</strong> = "através da fumaça" (latim). O primeiro uso registrado de fragrâncias foi queimar madeiras, resinas e ervas em rituais religiosos.</p>
<p><strong>Egito (4000 a.C.):</strong> perfume era tecnologia espiritual. Sacerdotes queimavam <em>kyphi</em> (resinas + mirra + vinho + mel) nos templos.</p>
<p><strong>Grécia e Roma:</strong> gregos criaram os primeiros perfumes líquidos (infusões em azeite). Roma popularizou o consumo em massa.</p>
<p><strong>Pérsia/Mundo Árabe (800-1400 d.C.):</strong> Ibn Sina (Avicena) inventou a <strong>destilação a vapor</strong> — técnica que até hoje extrai óleos essenciais. Os árabes dominaram o comércio de oud, rosa de Damasco e âmbar cinza.</p>

<h2>Evolução — do Oriente à Europa</h2>
<p><strong>1370:</strong> Água da Rainha da Hungria — primeiro perfume alcoólico (alecrim em álcool). Antes disso, tudo era óleo ou resina.</p>
<p><strong>1533:</strong> Catarina de Médici leva seu perfumista para Paris — início da supremacia francesa.</p>
<p><strong>Grasse (séc. XVII):</strong> capital mundial dos ingredientes. Jasmim de Grasse: € 40.000-80.000/kg de absoluto.</p>
<p><strong>1868:</strong> William Perkin sintetiza a cumarina — primeira molécula sintética. <strong>1882:</strong> Fougère Royale, primeiro perfume com sintéticos intencionais. <strong>1921:</strong> Chanel N°5 — aldeídos sintéticos + naturais, assinatura impossível na natureza.</p>

<h2>As quatro grandes escolas</h2>
<table>
<tr><th>Escola</th><th>Filosofia</th><th>Características</th><th>Casas</th></tr>
<tr><td>🇫🇷 Francesa</td><td>Arte, equilíbrio, sofisticação</td><td>Pirâmide clássica, florais refinados, aldeídos</td><td>Chanel, Dior, Guerlain, Hermès</td></tr>
<tr><td>🇮🇹 Italiana</td><td>Frescor mediterrâneo</td><td>Cítricos, aquático-verde, elegância discreta</td><td>Acqua di Parma, Armani, Bvlgari</td></tr>
<tr><td>🇸🇦 Árabe</td><td>Identidade, status, espiritualidade</td><td>Concentração altíssima, oud, fixação 12-24h+</td><td>Amouage, Al Haramain, Rasasi</td></tr>
<tr><td>🌏 Oriental/Asiática</td><td>Misticismo, minimalismo</td><td>Oud cambojano suave, incenso, wabi-sabi</td><td>Comme des Garçons, Caron</td></tr>
</table>
<p><strong>Diferença cultural fundamental:</strong> no Ocidente o perfume é discrição; no mundo árabe, perfume forte é respeito — cheiro notável marca presença.</p>

<h2>Perfumaria comercial vs. artística</h2>
<table>
<tr><th>Critério</th><th>Comercial</th><th>Artística/Nicho</th></tr>
<tr><td>Objetivo</td><td>Vender muito</td><td>Expressar ideia olfativa</td></tr>
<tr><td>Orçamento</td><td>Controlado por flacon</td><td>Ilimitado — ingrediente manda</td></tr>
<tr><td>Processo</td><td>Marketing → fórmula</td><td>Fórmula → marketing</td></tr>
<tr><td>Preço/ml</td><td>R$ 3-15</td><td>R$ 20-100+</td></tr>
</table>
<p><strong>Ponto prático:</strong> quando o cliente diz "quero algo que ninguém tenha", ele está pedindo para sair do comercial e entrar no artístico — novo ticket.</p>

<h2>A indústria por trás das marcas</h2>
<p>A maioria das marcas não fabrica seus próprios perfumes — contrata casas de fragrância: <strong>IFF</strong> (EUA), <strong>Givaudan</strong> (Suíça — Chanel, Dior, Hermès), <strong>Firmenich/dsm-firmenich</strong>, <strong>Symrise</strong> (Armani, Hugo Boss), <strong>Mane</strong>, <strong>Robertet</strong>.</p>
<p>Processo: Brief → Perfumista (Nose) → Desenvolvimento (anos) → Aprovação interna → Aprovação <strong>IFRA</strong> (regula ingredientes por segurança/alergia) → Produção → Lançamento. Um perfume pode levar 3-7 anos.</p>
<p><strong>IFRA</strong> explica por que clássicos antigos (ex.: Fahrenheit) cheiram diferente hoje — restrição de ingredientes como oakmoss.</p>

<h2>Linha do tempo</h2>
<p>4000 a.C. Egito → 800 d.C. Avicena/destilação → 1370 primeiro alcoólico → 1533 Catarina de Médici → 1700s Grasse → 1868 cumarina sintética → 1882 Fougère Royale → 1921 Chanel N°5 → 1966 Eau Sauvage → 1992 Acqua di Gio → 2010 Aventus → 2015 Baccarat Rouge 540 → 2021+ boom árabe no Ocidente.</p>
      `,
      quiz: [
        {
          question: 'O que significa a palavra "perfume" (per fumum)?',
          options: ['Através do óleo', 'Através da fumaça', 'Cheiro da flor', 'Essência pura'],
          correct: 1,
          explanation: '"Per fumum" vem do latim e significa "através da fumaça" — os primeiros perfumes eram resinas e madeiras queimadas em rituais.',
        },
        {
          question: 'Quem inventou a destilação a vapor e o que isso mudou?',
          options: [
            'Ernest Beaux — permitiu criar aldeídos sintéticos',
            'Ibn Sina (Avicena) — permitiu extrair óleos essenciais de flores e plantas',
            'William Perkin — permitiu sintetizar a cumarina',
            'Coco Chanel — permitiu engarrafar perfumes em massa',
          ],
          correct: 1,
          explanation: 'Avicena, médico persa do século X, inventou a destilação a vapor — técnica usada até hoje para extrair óleos essenciais. Mudou a perfumaria para sempre.',
        },
        {
          question: 'Qual a diferença cultural fundamental entre perfumaria ocidental e árabe?',
          options: [
            'Ocidental busca discrição; árabe busca presença forte como sinal de respeito',
            'Ocidental usa mais oud; árabe usa mais cítricos',
            'Árabe é sempre mais barata que a ocidental',
            'Não há diferença relevante',
          ],
          correct: 0,
          explanation: 'No Ocidente, discrição é sofisticação. No mundo árabe, perfume forte é generosidade e respeito ao próximo — por isso concentrações e fixação são muito mais altas.',
        },
        {
          question: 'O que a Givaudan representa na indústria de perfumaria?',
          options: [
            'Uma marca de nicho árabe',
            'Um órgão regulador de ingredientes',
            'Uma das grandes casas de fragrância que cria perfumes para Chanel, Dior e Hermès',
            'A cidade francesa onde nasceu a perfumaria',
          ],
          correct: 2,
          explanation: 'Givaudan (Suíça) é uma das maiores casas de fragrância do mundo — cria perfumes para múltiplas marcas de luxo, o que explica por que um nicho pode superar um designer em qualidade.',
        },
        {
          question: 'Por que perfumes clássicos como o Fahrenheit original cheiravam diferente das versões atuais?',
          options: [
            'Mudança de fábrica',
            'A IFRA restringiu alguns ingredientes naturais por segurança/alergia, forçando reformulações',
            'O perfumista original se aposentou',
            'Aumento do preço dos frascos',
          ],
          correct: 1,
          explanation: 'A IFRA regula o uso de ingredientes por questões de segurança e alergia. Moléculas como o oakmoss foram restringidas, o que reformulou muitos clássicos.',
        },
      ],
    },
    {
      id: 'mod-7-2-anatomia',
      title: 'Anatomia de um Perfume',
      description: 'Pirâmide olfativa, concentrações (EDC/EDT/EDP/Extrait), fixação, projeção e drydown.',
      duration: 22,
      content: `
<h2>Pirâmide olfativa</h2>
<ul>
<li><strong>Notas de saída (0-15 min):</strong> cítricos e frescos — primeira impressão, evaporam rápido.</li>
<li><strong>Notas de coração (15 min-2h):</strong> florais e especiarias — a "alma" do perfume, o que os outros sentem ao longo do dia.</li>
<li><strong>Notas de fundo (2h-12h+):</strong> madeiras, almíscar, âmbar — o que fica na pele/roupa no fim do dia.</li>
</ul>
<p><strong>Argumento de venda:</strong> "Se você só sentiu o cítrico, sentiu só a saída. Deixa 20 minutos na pele e eu te mostro o coração e o fundo."</p>

<h2>Concentração — EDC, EDT, EDP, Parfum/Extrait</h2>
<table>
<tr><th>Sigla</th><th>Nome</th><th>% óleo</th><th>Duração</th></tr>
<tr><td>EDC</td><td>Eau de Cologne</td><td>2-5%</td><td>2-3h</td></tr>
<tr><td>EDT</td><td>Eau de Toilette</td><td>5-15%</td><td>3-5h</td></tr>
<tr><td>EDP</td><td>Eau de Parfum</td><td>15-20%</td><td>6-8h</td></tr>
<tr><td>Parfum/Extrait</td><td>Extrato puro</td><td>20-40%</td><td>10h+</td></tr>
</table>
<p><strong>Erro comum:</strong> achar que EDP é "sempre melhor". Cítricos frescos costumam funcionar melhor em EDT. Árabes fogem da tabela: "EDP" rotulado muitas vezes tem 25-30% real, equivalente a Extrait ocidental.</p>

<h2>Fixação, projeção e performance</h2>
<p><strong>Fixação</strong> = quanto tempo dura na pele. <strong>Projeção (sillage)</strong> = raio de alcance do cheiro. <strong>Performance</strong> = soma das duas.</p>
<p>Fatores que influenciam: tipo de pele (oleosa retém mais), hidratação prévia, temperatura corporal, clima (calor/umidade de CDE acelera projeção e evaporação), concentração de ingredientes pesados, local de aplicação (pulso/pescoço fixam mais).</p>

<h2>Drydown — evolução na pele</h2>
<p>Perfume nunca cheira igual do início ao fim. <strong>Drydown</strong> é o estágio final, só notas de fundo. Técnica de venda: aplique no blotter, deixe o cliente circular pela loja, volte em 5-10 min para sentir de novo — evita compra por impulso que vira arrependimento.</p>
      `,
      quiz: [
        {
          question: 'Quais as três camadas da pirâmide olfativa, em ordem?',
          options: [
            'Fundo → Coração → Saída',
            'Saída → Coração → Fundo',
            'Coração → Saída → Fundo',
            'Saída → Fundo → Coração',
          ],
          correct: 1,
          explanation: 'Saída (0-15 min, cítricos/frescos) → Coração (15min-2h, florais/especiarias) → Fundo (2h-12h+, madeiras/âmbar/almíscar).',
        },
        {
          question: 'Ordenando por concentração crescente de óleo essencial, qual sequência está correta?',
          options: ['EDP, EDC, EDT, Extrait', 'EDC, EDT, EDP, Extrait', 'Extrait, EDP, EDT, EDC', 'EDT, EDC, Extrait, EDP'],
          correct: 1,
          explanation: 'EDC (2-5%) < EDT (5-15%) < EDP (15-20%) < Extrait/Parfum (20-40%).',
        },
        {
          question: 'Por que um árabe rotulado "EDP" pode fixar mais que um EDP francês?',
          options: [
            'Porque usa mais álcool',
            'Porque a concentração real costuma ser de 25-30%, equivalente a um Extrait ocidental',
            'Porque é sempre mais barato',
            'Não há diferença real',
          ],
          correct: 1,
          explanation: 'Rótulos árabes fogem da tabela ocidental — "EDP" muitas vezes tem concentração real de Extrait, daí a fixação muito maior com preço menor.',
        },
        {
          question: 'O que é "skin scent"?',
          options: [
            'Um perfume com fixação alta mas projeção baixa — fica colado na pele',
            'Um perfume que muda de cor na pele',
            'Sinônimo de Extrait',
            'Um defeito de fabricação',
          ],
          correct: 0,
          explanation: 'Skin scent é quando o perfume tem boa fixação mas projeção baixa — só quem chega perto sente. O oposto de um perfume com sillage monstruosa.',
        },
        {
          question: 'Por que não se deve deixar o cliente decidir em 10 segundos de teste?',
          options: [
            'Porque ele está sentindo só a nota de saída, não o coração e o fundo do perfume',
            'Porque o blotter precisa secar',
            'Porque a loja perde tempo',
            'Não há problema em decidir rápido',
          ],
          correct: 0,
          explanation: 'Decisão rápida = decisão baseada só na saída. O drydown (fundo) é o que o cliente vai sentir o dia todo — por isso vale esperar 5-10 minutos antes de fechar.',
        },
      ],
    },
    {
      id: 'mod-7-3-familias-olfativas',
      title: 'Famílias Olfativas',
      description: 'As 16 famílias — cítricos, amadeirados, orientais, gourmand, oud e mais — com ocasião, público e exemplos.',
      duration: 25,
      content: `
<h2>As 16 famílias olfativas</h2>
<table>
<tr><th>Família</th><th>Sensação</th><th>Ocasião</th><th>Exemplos</th></tr>
<tr><td>Cítricos</td><td>Frescor instantâneo, energia</td><td>Dia, clima quente</td><td>Acqua di Gio, Light Blue</td></tr>
<tr><td>Aromáticos</td><td>Fresco-herbáceo, clássico masculino</td><td>Dia a dia, trabalho</td><td>Drakkar Noir, Azzaro pour Homme</td></tr>
<tr><td>Amadeirados</td><td>Quente, sofisticado, terroso</td><td>Tarde/noite, ano todo</td><td>Terre d'Hermès, Santal 33</td></tr>
<tr><td>Orientais</td><td>Envolvente, sensual, quente</td><td>Noite</td><td>Opium, Black Orchid, Spicebomb</td></tr>
<tr><td>Âmbar</td><td>Dourada, quente, doce-resinosa</td><td>Muito usado em árabes</td><td>Ambre Sultan, Al Haramain Amber Oud</td></tr>
<tr><td>Gourmand</td><td>Doce, comestível, jovem</td><td>Casual, encontros</td><td>La Vie est Belle, Lost Cherry</td></tr>
<tr><td>Florais</td><td>Romântica, feminina clássica</td><td>Dia/noite</td><td>Chanel N°5, J'adore</td></tr>
<tr><td>Aquáticos</td><td>Limpa, jovem, esportiva</td><td>Verão, dia</td><td>Cool Water, Acqua di Gio</td></tr>
<tr><td>Verdes</td><td>Natural, crisp, discreta</td><td>Dia, clima ameno</td><td>Chanel N°19</td></tr>
<tr><td>Frutados</td><td>Doce-frutada, sem ser gourmand</td><td>Casual, dia</td><td>DKNY Be Delicious, Flowerbomb</td></tr>
<tr><td>Especiados</td><td>Quente, picante, marcante</td><td>Noite</td><td>Spicebomb, YSL Opium</td></tr>
<tr><td>Couro</td><td>Intensa, "old money"</td><td>Noite, outono</td><td>Tuscan Leather, Knize Ten</td></tr>
<tr><td>Tabaco</td><td>Envolvente, aconchegante</td><td>Noite, frio</td><td>Tobacco Vanille, Tabac Blond</td></tr>
<tr><td>Incenso</td><td>Espiritual, mística</td><td>Noite, formal</td><td>Amouage Interlude</td></tr>
<tr><td>Oud</td><td>Intensa, luxuosa, polarizadora</td><td>Noite, eventos, inverno</td><td>Oud Wood, Rasasi Hawas</td></tr>
<tr><td>Almiscarados</td><td>"Pele limpa", suave, universal</td><td>Dia a dia, base de outras famílias</td><td>Musc Ravageur, The One</td></tr>
</table>

<h2>Tabela-resumo para o balcão</h2>
<table>
<tr><th>Energia</th><th>Melhor horário</th><th>Cliente típico</th></tr>
<tr><td>Cítricos/Aquáticos — alta, leve</td><td>Manhã/dia</td><td>Jovem, casual</td></tr>
<tr><td>Florais/Frutados — média, romântica</td><td>Dia</td><td>Feminino amplo</td></tr>
<tr><td>Amadeirados/Verdes — média, sofisticada</td><td>Tarde</td><td>Profissional</td></tr>
<tr><td>Orientais/Âmbar/Especiados — alta, densa</td><td>Noite</td><td>Quer presença</td></tr>
<tr><td>Gourmand — doce, jovem</td><td>Casual/noite</td><td>Jovem descontraído</td></tr>
<tr><td>Couro/Tabaco/Incenso/Oud — muito alta</td><td>Noite/inverno</td><td>Maduro/nicho/árabe</td></tr>
</table>
<p><strong>Exercício de olfato:</strong> classifique perfumes do estoque em família principal + secundária — treina o julgamento rápido no balcão.</p>
      `,
      quiz: [
        {
          question: 'Qual família olfativa é mais associada a "pele limpa" e serve de base para quase todo perfume moderno?',
          options: ['Gourmand', 'Almiscarados', 'Verdes', 'Especiados'],
          correct: 1,
          explanation: 'Almíscar (branco/sintético) dá sensação de "pele limpa" e é fixador universal — está presente em praticamente todo perfume moderno.',
        },
        {
          question: 'Para um cliente que quer algo fresco para usar de dia no calor de CDE, qual família recomendar primeiro?',
          options: ['Couro/Tabaco', 'Cítricos/Aquáticos', 'Oud', 'Orientais densos'],
          correct: 1,
          explanation: 'Cítricos e aquáticos têm energia alta e leve — ideais para dia e clima quente.',
        },
        {
          question: 'Qual família é mais "old money" e associada a perfumes noturnos sofisticados de outono?',
          options: ['Couro', 'Frutados', 'Aquáticos', 'Verdes'],
          correct: 0,
          explanation: 'Couro tem sensação intensa e sofisticada — clássico de perfumes noturnos maduros, ex. Tuscan Leather.',
        },
        {
          question: 'Um cliente jovem pede algo "doce, tipo sobremesa". Qual família?',
          options: ['Gourmand', 'Incenso', 'Verdes', 'Aromáticos'],
          correct: 0,
          explanation: 'Gourmand traz baunilha, caramelo, chocolate — sensação doce e comestível, forte apelo jovem.',
        },
        {
          question: 'Qual família é mais polarizadora e associada à tradição árabe de luxo noturno?',
          options: ['Cítricos', 'Oud', 'Frutados', 'Aquáticos'],
          correct: 1,
          explanation: 'Oud é intenso, fumado e profundo — símbolo máximo do luxo árabe, mas polariza pelo caráter forte.',
        },
      ],
    },
    {
      id: 'mod-7-4-ingredientes',
      title: 'Ingredientes da Perfumaria',
      description: 'Oud, âmbar, almíscar, rosa, jasmim, açafrão, íris e mais — origem, custo e por que justificam o preço.',
      duration: 28,
      content: `
<h2>Ingredientes-chave</h2>
<ul>
<li><strong>Oud</strong> — madeira de Aquilaria infectada por fungo (Sudeste Asiático). Fumado, animal, terroso. Pode passar US$ 30.000/kg. Símbolo máximo de luxo árabe.</li>
<li><strong>Âmbar</strong> — ambergris natural (raríssimo) ou labdano+baunilha sintético. Doce, salgado, quente. Base de quase todo oriental.</li>
<li><strong>Almíscar</strong> — hoje 100% sintético. "Pele limpa", sensual. Está em praticamente todo perfume moderno.</li>
<li><strong>Baunilha</strong> — vagem de orquídea (Madagascar). Doce, cremosa. Ingrediente mais "comercialmente seguro" do mundo.</li>
<li><strong>Vetiver</strong> — raiz (Haiti/Indonésia). Terroso, verde. Pilar da perfumaria masculina francesa.</li>
<li><strong>Sândalo</strong> — madeira (Índia/Austrália, Mysore protegido). Cremoso, amanteigado. Ingrediente "abraço".</li>
<li><strong>Patchouli</strong> — folha (Indonésia). Terroso-doce. Virou luxo moderno (Coco Mademoiselle).</li>
<li><strong>Bergamota</strong> — cítrico de Calábria. Está em ~50% dos perfumes do mundo.</li>
<li><strong>Rosa</strong> — Bulgária/Damasco. 4 toneladas de pétalas = 1kg de óleo. Rainha do coração floral.</li>
<li><strong>Jasmim</strong> — Grasse/Egito/Índia. Floral indólico sensual, colheita manual noturna.</li>
<li><strong>Açafrão (saffron)</strong> — Irã. Especiaria mais cara do mundo. Assinatura de Dior Homme Intense, Baccarat Rouge.</li>
<li><strong>Íris (Orris)</strong> — Itália/Marrocos, processo de 3 anos. Um dos ingredientes mais caros do mundo — sinônimo de luxo silencioso.</li>
<li><strong>Fava Tonka</strong> — América do Sul. Amêndoa/baunilha/feno — fixador de Tobacco Vanille, La Nuit de l'Homme.</li>
<li><strong>Cedro</strong> — Virgínia/Atlas. Barato e versátil — workhorse da indústria.</li>
<li><strong>Couro</strong> — reconstrução sintética (não é destilável). Old-money.</li>
<li><strong>Resinas</strong> (mirra, olíbano/incenso, benjoim, labdano) — Omã/Somália/Etiópia. Ponte entre perfumaria árabe e nicho ocidental.</li>
</ul>

<h2>Custo — o argumento irrefutável de preço</h2>
<table>
<tr><th>Ingrediente</th><th>Custo/kg (natural)</th><th>Por que vale o preço</th></tr>
<tr><td>Oud natural</td><td>US$ 10.000-30.000+</td><td>Raridade extrema, infecção natural</td></tr>
<tr><td>Rosa de Damasco</td><td>US$ 5.000-10.000</td><td>4 toneladas de pétalas = 1kg de óleo</td></tr>
<tr><td>Jasmim Grasse</td><td>US$ 4.000-8.000</td><td>Colheita manual noturna</td></tr>
<tr><td>Íris (Orris)</td><td>US$ 50.000+</td><td>3 anos de processo, rendimento baixíssimo</td></tr>
<tr><td>Sândalo Mysore</td><td>US$ 2.000-3.000</td><td>Proteção ambiental, escassez</td></tr>
<tr><td>Açafrão</td><td>US$ 5.000-10.000</td><td>Especiaria mais cara do mundo</td></tr>
<tr><td>Almíscar sintético</td><td>US$ 50-200</td><td>Produção em massa</td></tr>
<tr><td>Cedro</td><td>US$ 20-50</td><td>Abundante</td></tr>
</table>
<p><strong>Uso na venda:</strong> cliente questiona preço de nicho com oud/açafrão/íris → explique o custo real da matéria-prima. Vira argumento irrefutável.</p>
      `,
      quiz: [
        {
          question: 'Por que o oud natural pode custar mais que US$ 10.000/kg?',
          options: [
            'Porque é sintetizado em laboratório caro',
            'Porque vem de madeira de Aquilaria infectada por fungo, um processo raro e não industrializável',
            'Porque só existe em um país',
            'Porque é usado apenas em perfumes femininos',
          ],
          correct: 1,
          explanation: 'O oud vem da infecção natural (fungo) da árvore Aquilaria — processo raro e imprevisível, o que torna o oud um dos ingredientes mais caros do mundo.',
        },
        {
          question: 'Por que a íris (orris) é um dos ingredientes mais caros da perfumaria?',
          options: [
            'Processo de extração leva cerca de 3 anos com rendimento baixíssimo',
            'É importada apenas da China',
            'É usada em pequenas quantidades por lei',
            'Não tem substituto sintético',
          ],
          correct: 0,
          explanation: 'A raiz de Orris precisa de ~3 anos de processamento e tem rendimento muito baixo — por isso pode custar mais de US$ 50.000/kg.',
        },
        {
          question: 'Qual ingrediente está presente em praticamente todo perfume moderno como fixador de "pele limpa"?',
          options: ['Almíscar sintético', 'Oud', 'Açafrão', 'Íris'],
          correct: 0,
          explanation: 'O almíscar sintético é barato, versátil e dá a sensação de "pele limpa" — está em quase toda fórmula moderna.',
        },
        {
          question: 'Quantas toneladas de pétalas de rosa de Damasco são necessárias para produzir 1kg de óleo?',
          options: ['1 tonelada', '4 toneladas', '10 toneladas', 'Meia tonelada'],
          correct: 1,
          explanation: 'São necessárias cerca de 4 toneladas de pétalas para extrair 1kg de óleo de rosa de Damasco — daí o custo alto.',
        },
        {
          question: 'Como usar o custo dos ingredientes como argumento de venda?',
          options: [
            'Nunca falar de custo, só de marca',
            'Explicar ao cliente o custo real da matéria-prima (oud, açafrão, íris) quando ele questiona o preço de um nicho',
            'Dizer que todo perfume caro é só marketing',
            'Comparar apenas o tamanho do frasco',
          ],
          correct: 1,
          explanation: 'Quando o cliente questiona o preço de um nicho, explicar o custo real da matéria-prima (ex. oud, açafrão, íris) constrói um argumento técnico e irrefutável.',
        },
      ],
    },
    {
      id: 'mod-7-5-grandes-casas',
      title: 'Grandes Casas de Perfumaria',
      description: 'Dior, Chanel, YSL, Creed, MFK, Xerjoff, Amouage e mais — identidade, público e posicionamento competitivo.',
      duration: 26,
      content: `
<h2>Designers clássicos</h2>
<ul>
<li><strong>Dior</strong> — luxo francês clássico e moderno. Mais vendidos: Sauvage, J'adore, Miss Dior.</li>
<li><strong>Chanel</strong> — elegância atemporal. N°5, Bleu de Chanel, Coco Mademoiselle. Dona dos próprios campos de flores em Grasse.</li>
<li><strong>YSL</strong> — ousadia e sensualidade. Black Opium, Libre, Y. Forte apelo jovem/TikTok.</li>
<li><strong>Armani</strong> — minimalismo italiano. Acqua di Gio, Si, Code.</li>
<li><strong>Versace</strong> — máxima italiana vibrante. Eros, Dylan Blue.</li>
<li><strong>Prada</strong> — intelectual, notas incomuns (chá, íris). Luna Rossa, Paradoxe.</li>
<li><strong>Jean Paul Gaultier</strong> — lavanda+baunilha, frasco corpo humano. Le Male, Scandal.</li>
<li><strong>Paco Rabanne</strong> — futurista, jovem/balada. 1 Million, Invictus, Phantom.</li>
<li><strong>Carolina Herrera</strong> — forte conexão latina. Good Girl, 212, Bad Boy.</li>
<li><strong>Givenchy / Hermès</strong> — heritage parisiense; Hermès é o "perfume que não cheira a perfume" (Terre d'Hermès).</li>
</ul>

<h2>Nicho premium e artístico</h2>
<ul>
<li><strong>Tom Ford</strong> — luxo ousado. Tobacco Vanille, Oud Wood, Black Orchid.</li>
<li><strong>Creed</strong> — heritage aristocrático desde 1760. <strong>Aventus</strong> é o perfume mais hypado da década.</li>
<li><strong>Maison Francis Kurkdjian (MFK)</strong> — precisão técnica. <strong>Baccarat Rouge 540</strong> é referência de comparação viral.</li>
<li><strong>Parfums de Marly</strong> — alternativa acessível a Creed/MFK. Layton, Herod, Delina.</li>
<li><strong>Xerjoff</strong> — maximalismo italiano, projeção e fixação extremas. Naxos, Erba Pura.</li>
<li><strong>Amouage</strong> — realeza de Omã, oud/incenso com técnica francesa. Interlude Man.</li>
<li><strong>Byredo / Diptyque</strong> — minimalismo escandinavo/parisiense boêmio.</li>
<li><strong>Initio</strong> — "perfumaria psicotrópica", marketing de perfume viciante.</li>
<li><strong>Mancera / Montale</strong> — francesa com forte influência árabe, ótimo custo-benefício em oud/rosa.</li>
</ul>

<h2>Posicionamento competitivo</h2>
<table>
<tr><th>Faixa</th><th>Marcas</th><th>Perfil de cliente</th></tr>
<tr><td>Entrada/jovem</td><td>Paco Rabanne, Versace, JPG</td><td>Balada, 18-28 anos</td></tr>
<tr><td>Profissional clássico</td><td>Dior, Armani, Hermès</td><td>25-45, trabalho/dia a dia</td></tr>
<tr><td>Luxo aspiracional</td><td>Carolina Herrera, Givenchy, YSL</td><td>Quer status visível</td></tr>
<tr><td>Nicho acessível</td><td>Mancera, Montale, Nishane</td><td>Quer diferenciação</td></tr>
<tr><td>Nicho premium</td><td>Creed, MFK, Xerjoff, Tom Ford</td><td>Alto poder aquisitivo</td></tr>
<tr><td>Nicho artístico extremo</td><td>Amouage, Byredo, Diptyque, Initio</td><td>Colecionador avançado</td></tr>
</table>
      `,
      quiz: [
        {
          question: 'Qual perfume é considerado "o mais hypado da década" e ícone de status masculino?',
          options: ['Sauvage (Dior)', 'Aventus (Creed)', 'Le Male (JPG)', 'Terre d\'Hermès'],
          correct: 1,
          explanation: 'Aventus da Creed é considerado o perfume masculino mais hypado da última década, símbolo de sucesso.',
        },
        {
          question: 'Qual perfume virou referência de comparação viral no TikTok ("cheira a...?")',
          options: ['Baccarat Rouge 540 (MFK)', 'Acqua di Gio (Armani)', '1 Million (Paco Rabanne)', 'N°5 (Chanel)'],
          correct: 0,
          explanation: 'O Baccarat Rouge 540 da Maison Francis Kurkdjian virou fenômeno viral e referência de comparação para nichos e dupes.',
        },
        {
          question: 'Qual casa é conhecida por ser dona dos próprios campos de flores em Grasse?',
          options: ['Chanel', 'Versace', 'Paco Rabanne', 'Prada'],
          correct: 0,
          explanation: 'A Chanel controla parte da própria produção de flores em Grasse, garantindo qualidade e exclusividade de matéria-prima.',
        },
        {
          question: 'Para um cliente jovem que quer algo para balada com ticket de entrada, qual faixa de marcas oferecer primeiro?',
          options: ['Amouage, Byredo, Diptyque', 'Paco Rabanne, Versace, JPG', 'Creed, MFK, Xerjoff', 'Mancera, Montale'],
          correct: 1,
          explanation: 'Paco Rabanne, Versace e JPG são o posicionamento de entrada/jovem — ideal para balada e público 18-28 anos.',
        },
        {
          question: 'O que caracteriza a filosofia da Hermès em perfumaria?',
          options: [
            'Maximalismo e ingredientes raros',
            '"Perfume que não cheira a perfume" — minimalismo e transparência (escola de Jean-Claude Ellena)',
            'Foco exclusivo em oud',
            'Marketing agressivo de celebridades',
          ],
          correct: 1,
          explanation: 'A Hermès é reconhecida pela escola "transparente" de Jean-Claude Ellena — artesanal, minimalista, "menos é mais".',
        },
      ],
    },
    {
      id: 'mod-7-6-perfumaria-arabe',
      title: 'Perfumaria Árabe',
      description: 'Tradição, diferenças vs. ocidental, matérias-primas e as principais marcas (Lattafa, Armaf, Rasasi e mais).',
      duration: 24,
      content: `
<h2>História e cultura</h2>
<p>Perfume no mundo árabe é tradição religiosa e social — perfumar-se antes da oração é prática recomendada. Perfume não é vaidade, é respeito ao próximo e a Deus.</p>

<h2>Diferenças vs. ocidental</h2>
<table>
<tr><th>Aspecto</th><th>Ocidental</th><th>Árabe</th></tr>
<tr><td>Objetivo</td><td>Discrição sutil</td><td>Presença forte, generosidade olfativa</td></tr>
<tr><td>Concentração</td><td>EDT/EDP padronizado</td><td>"EDP" muitas vezes = extrait real</td></tr>
<tr><td>Ingrediente-chave</td><td>Varia por família</td><td>Oud, âmbar, almíscar, açafrão quase sempre</td></tr>
<tr><td>Fixação</td><td>Moderada</td><td>Extrema (12-24h+)</td></tr>
<tr><td>Aplicação</td><td>Pulsos discretos</td><td>Roupa, cabelo, múltiplos pontos</td></tr>
</table>
<p>Matérias-primas típicas: oud, rosa de Taif, âmbar, almíscar, açafrão, sândalo, incenso/bakhoor.</p>

<h2>Marcas árabes principais</h2>
<ul>
<li><strong>Lattafa</strong> — maior fenômeno viral. Khamrah (≈ Tobacco Vanille), Yara (≈ La Vie est Belle), Asad (≈ Le Male Elixir). Excelente custo-benefício.</li>
<li><strong>Afnan</strong> — linha "9 PM" (≈ Sauvage/Bleu de Chanel doce), Supremacy (≈ 1 Million/Aventus).</li>
<li><strong>Armaf</strong> — Club de Nuit Intense Man, o "dupe" mais famoso de Aventus.</li>
<li><strong>Maison Alhambra</strong> — ampla linha de inspirados, preço médio.</li>
<li><strong>Rasasi</strong> — mais premium. Hawas (amadeirado-aquático), La Yuqawam (oriental-especiado). Porta de entrada para o luxo árabe genuíno.</li>
<li><strong>Al Haramain</strong> — tradição mais antiga, foco em oud/âmbar puros. Amber Oud.</li>
<li><strong>Swiss Arabian</strong> — tradição árabe + técnica suíça.</li>
<li><strong>Fragrance World</strong> — dupes fiéis a nichos caros (Xerjoff, Initio) por fração do preço.</li>
<li><strong>Khadlaj, Ajmal</strong> — foco em oud tradicional e attars (óleos sem álcool).</li>
</ul>

<h2>Como vender árabe para quem só conhece designer</h2>
<ol>
<li>Identifique o designer de referência do cliente</li>
<li>Apresente o árabe equivalente como "mesma família olfativa, fixação muito maior, preço melhor"</li>
<li>Nunca diga "cópia" — diga "inspirado" ou "mesma linha olfativa"</li>
<li>Deixe testar e esperar — a fixação árabe é o argumento mais forte, vendido pelo tempo, não pela primeira impressão</li>
</ol>
      `,
      quiz: [
        {
          question: 'Qual marca árabe é conhecida como o "dupe" mais respeitado de Creed Aventus?',
          options: ['Lattafa Khamrah', 'Armaf Club de Nuit Intense Man', 'Al Haramain Amber Oud', 'Rasasi Hawas'],
          correct: 1,
          explanation: 'O Armaf Club de Nuit Intense Man é amplamente reconhecido como o melhor "dupe" de Aventus no mercado.',
        },
        {
          question: 'Ao vender um árabe equivalente para um cliente que só conhece designer, o que NUNCA se deve dizer?',
          options: ['"É da mesma família olfativa"', '"É uma cópia"', '"Tem fixação muito maior"', '"É inspirado nessa linha"'],
          correct: 1,
          explanation: 'Nunca use a palavra "cópia" — isso desvaloriza o produto. Use "inspirado" ou "mesma linha olfativa", que soa como diferenciação, não pirataria.',
        },
        {
          question: 'Por que a fixação é o argumento mais forte ao vender perfume árabe?',
          options: [
            'Porque é vendida pelo tempo — o cliente sente a diferença ao longo do dia, não na primeira impressão',
            'Porque o cliente não percebe diferença nenhuma',
            'Porque árabes não têm nota de saída',
            'Porque fixação não importa para o cliente',
          ],
          correct: 0,
          explanation: 'A fixação é um argumento que se prova com o tempo — por isso vale deixar o cliente esperar e sentir ao longo do atendimento, não fechar na primeira cheirada.',
        },
        {
          question: 'Qual marca é considerada porta de entrada para o "luxo árabe genuíno"?',
          options: ['Emir', 'Paris Corner', 'Rasasi', 'Fragrance World'],
          correct: 2,
          explanation: 'Rasasi é considerada a marca mais premium entre as árabes tradicionais — ótima porta de entrada para o luxo árabe genuíno.',
        },
        {
          question: 'Por que perfumar-se é tradição religiosa no mundo árabe?',
          options: [
            'Porque é recomendado perfumar-se antes da oração — sinal de respeito ao próximo e a Deus',
            'Porque é uma exigência legal',
            'Porque é um costume recente, dos anos 2000',
            'Porque só é usado em casamentos',
          ],
          correct: 0,
          explanation: 'No mundo árabe, perfumar-se antes da oração é prática recomendada — perfume é respeito, não vaidade.',
        },
      ],
    },
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
    {
      id: 'mod-7-9-comparacoes',
      title: 'Comparações Inteligentes',
      description: 'Como responder "quero algo parecido com..." sem nunca dizer "é igual" — a regra de ouro do cross-sell.',
      duration: 18,
      content: `
<h2>A regra de ouro</h2>
<p>Nunca diga "é igual". Diga <strong>"é da mesma família, com essa diferença específica..."</strong> — isso constrói confiança e evita decepção pós-compra.</p>

<h2>Casos práticos</h2>
<p><strong>"Quero algo parecido com Bleu de Chanel."</strong><br>Vantagem do original: heritage Chanel, refinamento incomparável. Alternativas: Afnan 9 PM (mais doce, mais barato), Armaf Club de Nuit Blue. Explique: "é da mesma família amadeirada-aquática, mas o Chanel tem uma suavidade que só a casa consegue — esses são ótimos para o dia a dia sem gastar tanto."</p>
<p><strong>"Tem algo semelhante ao Baccarat Rouge?"</strong><br>Original: açafrão + âmbar + madeira, assinatura MFK, viral. Alternativas: Lattafa Ameer Al Oudh, Fragrance World Privé Rouge. Explique: "o BR540 tem uma pureza de ingrediente insubstituível 100%, mas pega 80% da experiência por 10% do preço."</p>
<p><strong>"Algo igual ao Aventus."</strong><br>Original: abacaxi defumado + bétula + almíscar, ícone de status. Alternativa: Armaf Club de Nuit Intense Man — o dupe mais respeitado do mercado.</p>
<p><strong>"Quero um perfume que fixe muito."</strong><br>Direcione para árabe oud/âmbar ou nicho denso (Xerjoff, Tom Ford). Evite cítricos puros — eduque sobre por que (moléculas leves evaporam rápido).</p>
<p><strong>"Quero algo que ninguém tenha."</strong><br>Direcione para nicho menos popular (não MFK/BR540, que já virou mainstream) — Nishane, Initio, linhas mais autorais. Venda sobre exclusividade genuína, ticket mais alto.</p>
      `,
      quiz: [
        {
          question: 'Qual frase NUNCA deve ser usada ao oferecer uma alternativa a um perfume famoso?',
          options: ['"É da mesma família"', '"É igual"', '"Tem uma diferença específica"', '"É inspirado nessa linha"'],
          correct: 1,
          explanation: 'Nunca diga "é igual" — isso cria expectativa que gera decepção. Use "é da mesma família, com essa diferença específica..."',
        },
        {
          question: 'Se o cliente pede algo parecido com Baccarat Rouge 540, qual o argumento correto?',
          options: [
            'Dizer que é exatamente igual e mais barato',
            'Explicar que a alternativa pega boa parte da experiência por uma fração do preço, mas o original tem pureza insubstituível',
            'Recusar vender qualquer alternativa',
            'Dizer que o BR540 é ruim',
          ],
          correct: 1,
          explanation: 'O argumento correto reconhece o valor do original (pureza do ingrediente) e posiciona a alternativa pelo custo-benefício, sem prometer identidade total.',
        },
        {
          question: 'Qual é o "dupe" mais respeitado do mercado para o Aventus da Creed?',
          options: ['Afnan 9 PM', 'Armaf Club de Nuit Intense Man', 'Lattafa Yara', 'Al Haramain Amber Oud'],
          correct: 1,
          explanation: 'O Armaf Club de Nuit Intense Man é amplamente reconhecido como o dupe mais respeitado de Aventus.',
        },
        {
          question: 'Para um cliente que quer "algo que ninguém tenha", qual estratégia é a mais correta?',
          options: [
            'Oferecer o Baccarat Rouge 540, já que é muito bom',
            'Direcionar para nichos menos populares e mainstream, como Nishane ou Initio, vendendo exclusividade genuína',
            'Oferecer o Sauvage da Dior',
            'Dizer que não existe isso',
          ],
          correct: 1,
          explanation: 'Perfumes já virais como BR540 não servem para esse pedido — a resposta certa é oferecer nichos menos populares, com ticket mais alto justificado pela exclusividade real.',
        },
        {
          question: 'Por que evitar cítricos puros para um cliente que pede "fixação máxima"?',
          options: [
            'Porque cítricos são sempre mais caros',
            'Porque moléculas cítricas são leves e evaporam rápido, o oposto de alta fixação',
            'Porque cítricos não existem em versão árabe',
            'Não há motivo — cítricos fixam igual a qualquer outro',
          ],
          correct: 1,
          explanation: 'Notas cítricas são moléculas leves de saída — evaporam rápido. Para fixação máxima, o caminho correto é oud/âmbar árabe ou nicho denso.',
        },
      ],
    },
    {
      id: 'mod-7-10-tecnicas-venda',
      title: 'Técnicas de Venda para Perfumaria',
      description: 'Abordagem, demonstração com blotters, storytelling, construção de desejo e fechamento assumido.',
      duration: 22,
      content: `
<h2>Abordagem e entrevista consultiva</h2>
<p>Nunca "posso ajudar?" (gera "não, só olhando"). Use abertura observacional: <em>"Vi que você parou nessa linha árabe — já usou oud antes?"</em> Faça 3-4 perguntas abertas antes de mostrar produto.</p>

<h2>Demonstração correta</h2>
<p>Blotter primeiro (nunca aplique direto na pele do cliente sem perguntar). Máximo 3 perfumes por vez — o nariz satura depois disso. Identifique cada blotter (caneta), espace o teste em 5 min entre cada. Reserve a pele para o favorito final — pulso, sem esfregar (esfregar quebra moléculas e altera o cheiro).</p>

<h2>Storytelling e venda por emoção</h2>
<p>Sempre conecte com história/ingrediente — história vende mais que especificação técnica fria. Pergunte <em>"como você quer se sentir usando isso?"</em> — não "qual perfume você quer". Pessoas compram identidade, não líquido.</p>

<h2>Construção de desejo</h2>
<p>Crie escassez genuína ("essa linha de oud é edição limitada da importadora"). Mostre o produto com cuidado — ritual de abrir a caixa, apresentar o frasco.</p>

<h2>Fechamento e pós-venda</h2>
<p>Nunca pergunte "vai levar?". Pergunte <strong>"prefere o de 50ml ou já leva o de 100ml que sai melhor o custo por ml?"</strong> — fechamento assumido + upsell embutido. No pós-venda, ensine a aplicação correta (pulsos, sem esfregar) e ofereça voltar para indicar combinações futuras — constrói recompra.</p>
      `,
      quiz: [
        {
          question: 'Qual abertura de atendimento deve ser evitada?',
          options: ['"Vi que você parou nessa linha árabe"', '"Posso ajudar?"', '"Já usou oud antes?"', 'Uma pergunta observacional sobre o que o cliente está olhando'],
          correct: 1,
          explanation: '"Posso ajudar?" costuma gerar "não, só olhando" — a abordagem observacional funciona muito melhor para abrir conversa.',
        },
        {
          question: 'Quantos perfumes no máximo devem ser testados por vez no blotter?',
          options: ['1', '3', '6', '10'],
          correct: 1,
          explanation: 'No máximo 3 perfumes por vez — depois disso o nariz satura e o cliente perde a capacidade de diferenciar.',
        },
        {
          question: 'Por que não se deve esfregar o perfume no pulso depois de aplicar?',
          options: [
            'Porque mancha a pele',
            'Porque esfregar quebra as moléculas e altera o cheiro',
            'Porque é falta de educação',
            'Não há problema em esfregar',
          ],
          correct: 1,
          explanation: 'Esfregar gera calor e fricção que quebram a estrutura molecular do perfume, alterando a forma como ele evolui na pele.',
        },
        {
          question: 'Qual é o fechamento assumido correto?',
          options: [
            '"Vai levar?"',
            '"Prefere o de 50ml ou já leva o de 100ml que sai melhor o custo por ml?"',
            '"Pensa e volta outro dia"',
            '"Não tenho mais nada pra mostrar"',
          ],
          correct: 1,
          explanation: 'O fechamento assumido pressupõe que o cliente vai comprar e já embute um upsell de tamanho — muito mais eficaz que perguntar "vai levar?".',
        },
        {
          question: 'Por que perguntar "como você quer se sentir usando isso?" é mais eficaz que "qual perfume você quer?"',
          options: [
            'Porque é mais rápido de responder',
            'Porque pessoas compram identidade e emoção, não apenas o líquido',
            'Porque elimina a necessidade de testar o perfume',
            'Não faz diferença nenhuma',
          ],
          correct: 1,
          explanation: 'A venda por emoção reconhece que o cliente compra uma identidade/sentimento — a pergunta certa direciona a conversa para isso, não para especificação técnica.',
        },
      ],
    },
    {
      id: 'mod-7-11-mercado-cde',
      title: 'Mercado de Ciudad del Este',
      description: 'Perfis de clientes (brasileiro, paraguaio, argentino, turista, revendedor), sazonalidade e diferencial competitivo local.',
      duration: 18,
      content: `
<h2>Perfis de cliente e como adaptar</h2>
<table>
<tr><th>Perfil</th><th>Comportamento</th><th>Como adaptar</th></tr>
<tr><td>Brasileiro</td><td>Pesquisa preço antes, compara com Brasil/online, busca "achado". Vem com lista mental de marcas famosas (Sauvage, BR540).</td><td>Mostre vantagem de preço CDE vs Brasil, valide a escolha e ofereça upgrade/alternativa de maior margem</td></tr>
<tr><td>Paraguaio</td><td>Cliente recorrente/local, conhece a loja, valoriza relacionamento e fidelidade.</td><td>Invista em atendimento de longo prazo, lembre preferências, ofereça lançamentos primeiro a ele</td></tr>
<tr><td>Argentino</td><td>Busca dólar/preço bom por câmbio, costuma comprar em quantidade/revenda informal.</td><td>Trabalhe preço por volume, combos</td></tr>
<tr><td>Turista geral</td><td>Pouco tempo, decisão rápida, quer "o melhor para levar".</td><td>Seja direto, 2-3 opções no máximo, destaque o que é "exclusivo de loja de fronteira"</td></tr>
<tr><td>Revendedor</td><td>Foco em margem e giro, não em história do perfume.</td><td>Fale números: preço de tabela, performance/preço, o que vende mais rápido</td></tr>
</table>

<h2>Sazonalidade</h2>
<p>Dezembro (Natal/Ano Novo) e datas de presente (Dia das Mães, Namorados) — pico de fluxo, prepare kits prontos. Verão (calor extremo) — cítricos/aquáticos vendem mais de dia, oud/âmbar ainda vendem para presença noturna.</p>

<h2>Diferencial competitivo local</h2>
<p>O mercado local é saturado de lojas vendendo os mesmos dupes árabes. <strong>O diferencial real está no atendimento consultivo</strong> — a maioria das lojas só empurra preço, você vende conhecimento. Tendência regional forte: TikTok/Instagram — clientes já chegam pedindo "aquele que viralizou" (geralmente BR540, Lattafa Khamrah, Armaf Club de Nuit). Fique atualizado nessas redes constantemente.</p>
      `,
      quiz: [
        {
          question: 'Qual é o comportamento típico do cliente brasileiro em CDE?',
          options: [
            'Nunca pesquisa preço antes',
            'Pesquisa preço, compara com o Brasil/online e busca um "achado", geralmente já com marcas famosas em mente',
            'Só compra por indicação de amigos',
            'Prefere sempre nicho artístico caro',
          ],
          correct: 1,
          explanation: 'O cliente brasileiro costuma pesquisar e comparar preços antes, chegando com uma lista mental de marcas famosas (ex. Sauvage, BR540) e buscando um bom negócio.',
        },
        {
          question: 'Como abordar melhor o cliente paraguaio recorrente/local?',
          options: [
            'Tratá-lo igual a um turista de passagem',
            'Investir em atendimento de longo prazo, lembrar preferências e oferecer lançamentos primeiro a ele',
            'Focar só em desconto de volume',
            'Ignorar, já que ele sempre volta de qualquer jeito',
          ],
          correct: 1,
          explanation: 'O cliente paraguaio valoriza relacionamento e fidelidade — vale investir em atendimento de longo prazo e tratamento diferenciado.',
        },
        {
          question: 'Qual é o real diferencial competitivo de uma loja de perfumes em CDE, dado que o mercado é saturado de dupes árabes?',
          options: [
            'Ter o menor preço possível sempre',
            'O atendimento consultivo — vender conhecimento, não só preço',
            'Vender apenas marcas de nicho caras',
            'Copiar a estratégia dos concorrentes',
          ],
          correct: 1,
          explanation: 'Como o mercado é saturado de lojas empurrando preço, o atendimento consultivo (conhecimento real de perfumaria) é o que diferencia de verdade.',
        },
        {
          question: 'Qual estratégia melhor se aplica ao cliente argentino, dado o perfil de câmbio e revenda informal?',
          options: [
            'Ignorar volume e vender só unidade',
            'Trabalhar preço por volume e combos',
            'Oferecer apenas nicho artístico caro',
            'Recusar vender mais de uma unidade',
          ],
          correct: 1,
          explanation: 'O cliente argentino busca preço bom por câmbio e costuma comprar em quantidade — combos e preço por volume atendem melhor esse perfil.',
        },
        {
          question: 'Por que é importante acompanhar TikTok/Instagram para vender perfume em CDE?',
          options: [
            'Porque não tem nenhuma relevância comercial',
            'Porque clientes já chegam pedindo "o que viralizou" (ex. BR540, Lattafa Khamrah) — estar atualizado permite atender essa demanda',
            'Porque a loja precisa postar todos os dias',
            'Porque só turistas usam essas redes',
          ],
          correct: 1,
          explanation: 'A tendência regional forte de redes sociais faz clientes chegarem já pedindo o produto viral do momento — o vendedor precisa estar atualizado para atender e also para direcionar para alternativas.',
        },
      ],
    },
    {
      id: 'mod-7-12-inteligencia-comercial',
      title: 'Inteligência Comercial',
      description: 'Como usar o catálogo da loja para mapear lacunas, sugerir aquisições, kits e cross-sell com base em margem e tendência.',
      duration: 15,
      content: `
<h2>Do vendedor ao estrategista</h2>
<p>Depois de dominar produto, história e técnica de venda, o próximo passo é pensar como gestor de portfólio — não só vender o que já está na prateleira, mas identificar o que falta.</p>

<h2>O que analisar a partir do catálogo da loja</h2>
<ul>
<li><strong>Lacunas de portfólio:</strong> quais famílias olfativas, faixas de preço ou marcas populares (ex. o que viralizou) a loja ainda não tem?</li>
<li><strong>Aquisições por tendência e demanda:</strong> cruzar o que os clientes pedem (redes sociais, atendimento) com o que está disponível hoje.</li>
<li><strong>Produtos de maior potencial de margem:</strong> nem sempre o mais vendido é o mais lucrativo — dupes árabes de alta fixação costumam ter ótima margem relativa ao preço de custo.</li>
<li><strong>Kits e cross-sell:</strong> combinar perfume + fixador/hidratante, ou "leve o par" (dia + noite), aumenta ticket médio sem parecer forçado.</li>
<li><strong>Exposição de vitrine:</strong> os itens de maior margem e maior potencial de venda por impulso devem ficar na linha de visão imediata.</li>
</ul>

<h2>Como aplicar na prática</h2>
<p>Toda recomendação de portfólio deve ser justificada com comportamento de consumidor real e tendência de mercado — nunca "achismo". Antes de sugerir uma nova aquisição, pergunte: "isso resolve uma lacuna real ou só duplica o que já vendemos bem?"</p>
      `,
      quiz: [
        {
          question: 'O que significa "mapear lacunas de portfólio" numa loja de perfumes?',
          options: [
            'Contar quantos frascos existem no estoque',
            'Identificar famílias olfativas, faixas de preço ou marcas populares que a loja ainda não oferece',
            'Trocar a decoração da vitrine',
            'Reduzir o número de marcas disponíveis',
          ],
          correct: 1,
          explanation: 'Mapear lacunas é comparar o que a loja tem com o que o mercado/cliente demanda, identificando o que falta oferecer.',
        },
        {
          question: 'Por que o produto mais vendido nem sempre é o de maior potencial de margem?',
          options: [
            'Porque venda e margem são sempre a mesma coisa',
            'Porque dupes de alta fixação, por exemplo, podem ter ótima margem relativa mesmo vendendo menos que um best-seller de baixo custo',
            'Porque margem não importa para uma loja de varejo',
            'Porque só produtos caros dão margem',
          ],
          correct: 1,
          explanation: 'Volume de venda e margem são métricas diferentes — um produto de menor giro pode ser mais lucrativo proporcionalmente, e vale identificar isso.',
        },
        {
          question: 'Qual é um exemplo correto de estratégia de cross-sell em perfumaria?',
          options: [
            'Vender só um item por cliente',
            'Combinar perfume + hidratante/fixador, ou sugerir "o par" (dia + noite)',
            'Nunca sugerir produto adicional',
            'Empurrar qualquer produto aleatório no caixa',
          ],
          correct: 1,
          explanation: 'Cross-sell eficaz combina produtos que fazem sentido juntos (perfume + fixador, ou dia + noite), aumentando o ticket sem parecer forçado.',
        },
        {
          question: 'Antes de sugerir uma nova aquisição de catálogo, qual pergunta deve ser feita?',
          options: [
            '"Isso resolve uma lacuna real ou só duplica o que já vendemos bem?"',
            '"Isso é o mais caro do mercado?"',
            '"O fornecedor é conhecido?"',
            'Nenhuma pergunta é necessária',
          ],
          correct: 0,
          explanation: 'Toda decisão de portfólio deve ser justificada — a pergunta central é se o novo item preenche uma lacuna real, evitando duplicar o que já existe.',
        },
        {
          question: 'Qual critério deve guiar a exposição de vitrine segundo a inteligência comercial?',
          options: [
            'Ordem alfabética apenas',
            'Itens de maior margem e potencial de compra por impulso na linha de visão imediata',
            'Sempre os produtos mais baratos na frente',
            'Não importa a posição dos produtos',
          ],
          correct: 1,
          explanation: 'A vitrine deve priorizar produtos de maior margem e maior potencial de impulso, maximizando o retorno do espaço físico.',
        },
      ],
    },
    {
      id: 'mod-7-13-simulacoes',
      title: 'Simulações Reais de Atendimento',
      description: 'Cenários práticos de atendimento — do indiciso ao revendedor — para aplicar tudo o que foi aprendido.',
      duration: 20,
      content: `
<h2>Por que simular</h2>
<p>Conhecimento técnico só vira resultado quando testado em situação real. Os cenários abaixo cobrem os tipos de atendimento mais comuns e mais difíceis de uma loja de perfumes em Ciudad del Este.</p>

<h2>Banco de cenários</h2>
<ol>
<li><strong>Cliente indeciso</strong> entre 4 perfumes, sem orçamento definido — use perguntas de perfil (Módulo 8) para reduzir as opções antes de testar no blotter.</li>
<li><strong>Conhecedor que já testou tudo</strong>, quer algo "underground" — direcione para nicho menos popular (Módulo 7/9), fale do perfumista e do conceito, não do preço.</li>
<li><strong>Comprando presente para esposa</strong>, não sabe nada de perfume — pergunte sobre a personalidade dela, não sobre notas técnicas; sugira floral ou gourmand clássico com boa aceitação.</li>
<li><strong>Quer economizar</strong>, pede "o mais barato que dure bem" — direcione para árabe custo-benefício (Lattafa, Armaf, Afnan — Módulo 6), explicando a lógica de concentração real.</li>
<li><strong>Pede alta fixação</strong> para trabalho que exige estar perto de pessoas o dia todo — oud/âmbar árabe ou nicho denso, evite cítricos puros (Módulo 9).</li>
<li><strong>Quer exclusividade total</strong>, rejeita tudo que reconhece — nicho autoral pouco popular, nunca ofereça o que já virou mainstream (BR540, Aventus).</li>
<li><strong>Só conhece Sauvage e Aventus</strong>, resistente a sugestão nova — comece pela mesma família (amadeirado-fresco), amplie aos poucos com "é da mesma linha, mas com esse diferencial...".</li>
<li><strong>Quer migrar de designer para árabe</strong>, com receio do "cheiro forte demais" — comece por um árabe mais equilibrado (Rasasi Hawas), não pelo oud mais intenso da loja.</li>
<li><strong>Revendedor pedindo margem e giro</strong>, não personalidade — fale números: preço de tabela, performance/preço, o que vende mais rápido (Módulo 12).</li>
</ol>
<p><strong>Como praticar:</strong> escolha um cenário, responda como se estivesse atendendo de verdade, depois compare sua resposta com as técnicas dos módulos anteriores — abordagem, perguntas de perfil, storytelling e fechamento assumido.</p>
      `,
      quiz: [
        {
          question: 'Um cliente diz "já testei tudo, quero algo underground". Qual a melhor abordagem?',
          options: [
            'Oferecer o Baccarat Rouge 540, que é muito bom',
            'Direcionar para nicho menos popular, falando do perfumista e do conceito, não do preço',
            'Insistir em um designer clássico',
            'Dizer que não existe nada assim na loja',
          ],
          correct: 1,
          explanation: 'Para um conhecedor que já testou tudo, o caminho é nicho autoral pouco popular — o argumento é conceito e exclusividade, não preço.',
        },
        {
          question: 'Um cliente pede presente para a esposa e não entende nada de perfume. Qual a pergunta certa?',
          options: [
            'Perguntar sobre notas técnicas específicas que ele não vai saber responder',
            'Perguntar sobre a personalidade dela e sugerir floral ou gourmand clássico',
            'Pedir para ele escolher sozinho sem ajuda',
            'Oferecer o perfume mais caro da loja direto',
          ],
          correct: 1,
          explanation: 'Quando o comprador não entende de perfume, a pergunta certa foca na personalidade da pessoa presenteada, não em jargão técnico.',
        },
        {
          question: 'Um cliente quer migrar de designer para árabe mas teme "cheiro forte demais". Por onde começar?',
          options: [
            'Pelo oud mais intenso da loja, para impressionar',
            'Por um árabe mais equilibrado, como Rasasi Hawas, antes de propor algo mais denso',
            'Recusar vender árabe para esse cliente',
            'Insistir que ele vai se acostumar com qualquer intensidade',
          ],
          correct: 1,
          explanation: 'Para quem teme intensidade, o caminho certo é começar por um árabe mais equilibrado, ganhando confiança antes de propor fragrâncias mais densas.',
        },
        {
          question: 'Um revendedor pede recomendação focado só em margem e giro. Qual o erro mais comum a evitar?',
          options: [
            'Falar de preço de tabela e performance/preço',
            'Insistir em storytelling de história e ingrediente, ignorando os números que ele pediu',
            'Indicar o que vende mais rápido',
            'Ser direto e objetivo',
          ],
          correct: 1,
          explanation: 'Com um revendedor, o storytelling emocional não é o que importa — o erro é insistir nisso ao invés de fornecer números concretos de margem e giro.',
        },
        {
          question: 'Cliente só conhece Sauvage e Aventus e resiste a qualquer sugestão nova. Qual estratégia funciona melhor?',
          options: [
            'Insistir em um perfume de família completamente diferente',
            'Começar pela mesma família olfativa (amadeirado-fresco) e ampliar aos poucos com "é da mesma linha, mas com esse diferencial..."',
            'Dizer que o gosto dele é limitado',
            'Desistir de oferecer qualquer alternativa',
          ],
          correct: 1,
          explanation: 'Clientes resistentes respondem melhor a uma ponte gradual — começar na mesma família olfativa e expandir aos poucos gera confiança, sem confronto.',
        },
      ],
    },
  ],
}
