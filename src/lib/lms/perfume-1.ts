import type { LmsTrilha } from './types'

export const perfumeT1: LmsTrilha = {
  id: 'trilha-pf-1',
  slug: 'fundamentos-perfumaria',
  title: 'Fundamentos da Perfumaria',
  description: 'História da perfumaria e anatomia de um perfume — pirâmide olfativa, concentrações, fixação e drydown.',
  icon: '🌸',
  color: '#EC4899',
  xpReward: 200,
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
  ],
}
