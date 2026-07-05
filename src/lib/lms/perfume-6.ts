import type { LmsTrilha } from './types'

export const perfumeT6: LmsTrilha = {
  id: 'trilha-pf-6',
  slug: 'mercado-inteligencia-comercial',
  title: 'Mercado e Inteligência Comercial',
  description: 'Perfis de cliente de Ciudad del Este, sazonalidade, gestão de portfólio e simulações reais de atendimento.',
  icon: '🌸',
  color: '#EC4899',
  xpReward: 300,
  area: 'vendas',
  lessons: [
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
