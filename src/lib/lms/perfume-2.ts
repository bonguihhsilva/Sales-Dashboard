import type { LmsTrilha } from './types'

export const perfumeT2: LmsTrilha = {
  id: 'trilha-pf-2',
  slug: 'familias-ingredientes',
  title: 'Famílias e Ingredientes',
  description: 'As 16 famílias olfativas e os ingredientes-chave da perfumaria — origem, custo e argumento de venda.',
  icon: '🌸',
  color: '#EC4899',
  xpReward: 200,
  area: 'vendas',
  lessons: [
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
  ],
}
