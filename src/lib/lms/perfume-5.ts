import type { LmsTrilha } from './types'

export const perfumeT5: LmsTrilha = {
  id: 'trilha-pf-5',
  slug: 'venda-consultiva-perfumaria',
  title: 'Venda Consultiva em Perfumaria',
  description: 'Comparações inteligentes entre perfumes e técnicas de abordagem, demonstração e fechamento no balcão.',
  icon: '🌸',
  color: '#EC4899',
  xpReward: 200,
  area: 'vendas',
  lessons: [
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
  ],
}
