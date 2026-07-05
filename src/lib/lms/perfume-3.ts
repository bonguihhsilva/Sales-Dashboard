import type { LmsTrilha } from './types'

export const perfumeT3: LmsTrilha = {
  id: 'trilha-pf-3',
  slug: 'casas-perfumaria-arabe',
  title: 'Grandes Casas e Perfumaria Árabe',
  description: 'Dior, Chanel, Creed, MFK, Xerjoff e as principais marcas árabes — identidade, público e posicionamento.',
  icon: '🌸',
  color: '#EC4899',
  xpReward: 200,
  area: 'vendas',
  lessons: [
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
  ],
}
