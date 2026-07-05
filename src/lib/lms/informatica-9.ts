import type { LmsTrilha } from './types'

export const informaticaT9: LmsTrilha = {
  id: 'trilha-ti-9',
  slug: 'produtos-tecnologicos',
  title: 'Produtos Tecnológicos',
  description: 'Panorama comercial das principais categorias de produtos tecnológicos — fabricantes, segmentação, público-alvo e argumentos de venda.',
  icon: '🛒',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-9-produtos-tecnologicos',
      title: 'Produtos Tecnológicos',
      description: 'Panorama comercial das principais categorias de produtos tecnológicos — fabricantes, segmentação, público-alvo e argumentos de venda.',
      duration: 45,
      content: `
<h2>9.1 — Notebooks</h2>
<p><strong>Fabricantes:</strong> Dell, Lenovo, HP, Asus, Acer, Apple.</p>
<table>
<tr><th>Linha</th><th>Público</th><th>Diferencial</th></tr>
<tr><td>Entrada (Celeron/Ryzen 3)</td><td>Uso básico, estudante</td><td>Preço baixo, autonomia razoável</td></tr>
<tr><td>Intermediário (i5/Ryzen 5)</td><td>Uso geral, trabalho, estudo pesado</td><td>Equilíbrio custo-benefício</td></tr>
<tr><td>Gamer (RTX/RX dedicada)</td><td>Jogos, criação de conteúdo leve</td><td>GPU dedicada, tela alta taxa de atualização</td></tr>
<tr><td>Ultrabook premium</td><td>Profissional, mobilidade</td><td>Leveza, bateria longa, construção premium</td></tr>
<tr><td>Workstation móvel</td><td>Engenharia, CAD, edição pesada</td><td>GPU profissional, certificações ISV</td></tr>
</table>
<p><strong>Argumento de venda:</strong> sempre perguntar uso real antes de empurrar "o mais caro" — estudante que só usa Office não precisa de notebook gamer, mas também não deve levar o mais barato se vai usar por 4+ anos (durabilidade e RAM upgradável importam).</p>

<h2>9.2 — Desktops</h2>
<p><strong>Categorias:</strong> pré-montado de marca (Dell, HP) vs montado sob medida (loja monta conforme necessidade) vs custom completo (entusiasta escolhe cada peça).</p>
<p><strong>Vantagem de venda de PC montado sob medida:</strong> upgrade futuro mais fácil, melhor relação custo-benefício por componente, possibilidade de ajustar exatamente ao uso do cliente — argumento forte contra pré-montados genéricos de grandes varejistas.</p>

<h2>9.3 — Mini PCs</h2>
<p><strong>Uso:</strong> espaço reduzido, escritórios, digital signage, HTPC (home theater PC), uso corporativo em massa.</p>
<p><strong>Fabricantes/formatos comuns:</strong> Intel NUC (linha descontinuada mas ainda no mercado secundário/similares), Mini PCs com Ryzen/Intel de fabricantes como Beelink, GMKtec, ou mini-ITX custom.</p>
<p><strong>Limitação a explicar:</strong> pouca ou nenhuma capacidade de upgrade de GPU (geralmente integrada), foco em eficiência energética, não em desempenho bruto.</p>

<h2>9.4 — Servidores</h2>
<p><strong>Diferenciais de hardware:</strong> suporte a RAM ECC (correção de erro), múltiplos processadores, redundância (fonte dupla, RAID de discos), gerenciamento remoto dedicado (iDRAC/iLO).</p>
<p><strong>Público-alvo:</strong> empresas com necessidade de armazenamento centralizado, backup, hospedagem de sistemas internos (ERP, banco de dados), virtualização.</p>
<p><strong>Argumento de venda para PME:</strong> servidor próprio (mesmo modesto, tipo NAS robusto) pode ser mais barato a longo prazo que assinaturas de nuvem para certos casos de uso, e dá controle total dos dados — mas depende do caso, seja honesto no comparativo.</p>

<h2>9.5 — Impressoras</h2>
<table>
<tr><th>Tipo</th><th>Uso</th><th>Custo por página</th></tr>
<tr><td>Jato de tinta</td><td>Doméstico, fotos ocasionais</td><td>Médio-alto (tinta cara em uso intenso)</td></tr>
<tr><td>Tanque de tinta (EcoTank/Tank)</td><td>Uso frequente doméstico/pequeno escritório</td><td>Baixo, mas investimento inicial maior</td></tr>
<tr><td>Laser monocromática</td><td>Escritório, alto volume de texto</td><td>Baixo por página, rápida</td></tr>
<tr><td>Laser colorida</td><td>Escritório com necessidade de cor</td><td>Médio</td></tr>
<tr><td>Multifuncional</td><td>Impressão+scanner+cópia</td><td>Varia conforme tecnologia base</td></tr>
</table>
<p><strong>Argumento de venda:</strong> sempre perguntar volume mensal estimado de impressão — determina se vale mais a pena tanque de tinta (alto volume) ou jato tradicional (uso esporádico).</p>

<h2>9.6 — Monitores (revisão comercial)</h2>
<p><strong>Segmentação de venda:</strong> escritório (IPS Full HD), gamer competitivo (144Hz+), gamer/criador (1440p/4K IPS), ultrawide (produtividade multitarefa, edição).</p>

<h2>9.7 — Webcams</h2>
<p><strong>Diferenciais:</strong> resolução, abertura de lente (baixa luz), autofoco, campo de visão, microfone integrado.</p>
<p><strong>Público:</strong> home office, streaming, criadores de conteúdo, videoconferência corporativa.</p>

<h2>9.8 — Teclados e Mouses</h2>
<p>Segmentação comercial: gamer (mecânico, RGB, alto polling rate), escritório (membrana silenciosa, ergonômico), profissional criativo (teclados sem numpad compactos, mouse de precisão).</p>

<h2>9.9 — Headsets</h2>
<p><strong>Segmentação:</strong> gamer (surround virtual, microfone destacável), home office/call center (foco em microfone com cancelamento de ruído, conforto para uso prolongado), audiófilo (qualidade de áudio, drivers maiores, sem foco em microfone).</p>

<h2>9.10 — SSDs e HDs (venda avulsa)</h2>
<p>Argumento de venda cruzada natural: cliente comprando notebook/PC usado ou antigo é candidato natural a upgrade de armazenamento — sempre oferecer.</p>

<h2>9.11 — Pendrives e Cartões de Memória</h2>
<p><strong>Critérios técnicos a explicar:</strong> classe de velocidade (Class 10, UHS-I/II/III para cartões SD — importante para câmeras/drones que gravam vídeo em alta resolução), USB 3.0+ para pendrives (muito mais rápido que USB 2.0 ainda vendido como "econômico").</p>
<p><strong>Cuidado comercial:</strong> alertar sobre pendrives/cartões de capacidade suspeita e preço baixo demais — mercado de produtos falsificados com capacidade fake é real e comum em polos de importação.</p>

<h2>9.12 — Roteadores e Switches (venda avulsa)</h2>
<p>Reforçar: venda cruzada natural quando cliente relata Wi-Fi ruim ou está montando escritório novo.</p>

<h2>9.13 — Câmeras IP</h2>
<p><strong>Diferenciais:</strong> resolução (2MP/4MP/8MP), visão noturna (infravermelho, alcance em metros), detecção de movimento/pessoas por IA, armazenamento (cartão SD local, NVR, nuvem), PoE vs Wi-Fi.</p>
<p><strong>Argumento de venda:</strong> para o cliente, sempre recomendar cabeamento PoE sobre Wi-Fi puro quando possível — mais estável, sem depender de força de sinal, e a câmera Wi-Fi é candidato a ataque se a rede não estiver segmentada.</p>

<h2>9.14 — Smart Home</h2>
<p><strong>Categorias:</strong> iluminação inteligente, tomadas/interruptores inteligentes, assistentes de voz (Alexa, Google Home), fechaduras inteligentes, sensores (presença, abertura de porta/janela).</p>
<p><strong>Protocolos a conhecer:</strong> Wi-Fi (simples, mas sobrecarrega rede com muitos dispositivos), Zigbee/Z-Wave (protocolo dedicado de baixa energia, precisa de hub central, mais robusto para muitos dispositivos), Matter (novo padrão unificado entre fabricantes, tendência forte).</p>
<p><strong>Argumento de venda:</strong> cliente com mais de 5-10 dispositivos smart home deve considerar hub dedicado (Zigbee/Matter) em vez de sobrecarregar o Wi-Fi doméstico.</p>

<h2>9.15 — Drones</h2>
<p><strong>Segmentação:</strong> recreativo/iniciante (câmera básica, fácil de pilotar), prosélito/semi-profissional (câmera 4K, maior alcance, estabilização avançada), profissional (fotogrametria, inspeção industrial, agricultura).</p>
<p><strong>Ponto de atenção comercial:</strong> regulamentação de uso (ANAC no Brasil) — para uso comercial/profissional pode exigir cadastro, informar o cliente evita problema futuro.</p>

<h2>9.16 — Acessórios em Geral</h2>
<p>Categoria de maior potencial de venda cruzada por menor ticket/decisão: cabos, hubs USB, suportes, organizadores de cabo, mousepads, capas, películas — sempre oferecer no fechamento da venda principal.</p>

<h2>Tabela-Resumo de Argumentos de Venda por Categoria</h2>
<table>
<tr><th>Categoria</th><th>Pergunta-chave para qualificar</th><th>Erro de venda a evitar</th></tr>
<tr><td>Notebook</td><td>"Pra que vai usar no dia a dia?"</td><td>Empurrar gamer para quem só usa Office</td></tr>
<tr><td>Desktop</td><td>"Vai querer fazer upgrade no futuro?"</td><td>Vender pré-montado fechado pra quem quer expandir</td></tr>
<tr><td>Impressora</td><td>"Quantas páginas por mês, aproximadamente?"</td><td>Vender jato de tinta comum pra alto volume</td></tr>
<tr><td>Câmera IP</td><td>"Onde vai instalar, tem cabo de rede perto?"</td><td>Empurrar Wi-Fi puro sem avisar da instabilidade</td></tr>
<tr><td>Smart Home</td><td>"Quantos dispositivos pretende ter?"</td><td>Não mencionar hub dedicado quando o projeto crescer</td></tr>
</table>

<h2>Laboratório Virtual</h2>
<p>Cenário prático: cliente entra na loja pedindo "uma impressora boa" sem mais detalhes. Antes de recomendar, aplique o framework de qualificação: pergunte volume mensal, se é doméstico ou escritório, se precisa de cor. Só então cruze a resposta com a tabela de tipos de impressora (9.5) para chegar à recomendação certa — jato, tanque ou laser.</p>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente:</strong> "Quero uma impressora, uso bastante em casa, tinta é muito cara."</p>
<p><strong>Resposta consultiva:</strong> "Pelo que o senhor descreve, tanque de tinta é a melhor opção — o investimento inicial é um pouco maior que uma jato de tinta comum, mas o custo por página é muito menor, então se compensa rápido no seu perfil de uso frequente. Se fosse uso ocasional eu recomendaria diferente, mas do jeito que descreveu, o tanque de tinta se paga em poucos meses."</p>
      `,
      quiz: [
        {
          question: 'Um cliente estudante diz que só usa o notebook para trabalhos de faculdade no Office. Qual a recomendação mais consultiva?',
          options: [
            'Notebook gamer, porque tem mais potência e "não erra nunca"',
            'Notebook de entrada ou intermediário, avaliando também durabilidade se o uso for por vários anos',
            'Sempre o modelo mais barato disponível, sem exceção',
            'Workstation móvel, pois tem certificações profissionais'
          ],
          correct: 1,
          explanation: 'O uso real deve guiar a recomendação: para Office, entrada ou intermediário atende bem, mas vale considerar durabilidade e RAM upgradável se o uso for de longo prazo.'
        },
        {
          question: 'Qual a principal vantagem comercial de um PC montado sob medida em comparação a um pré-montado de grande varejo?',
          options: [
            'É sempre mais barato em qualquer configuração',
            'Vem com garantia internacional automática',
            'Permite upgrade futuro mais fácil e ajuste exato ao uso do cliente',
            'Não precisa de manutenção nunca'
          ],
          correct: 2,
          explanation: 'O PC montado sob medida facilita upgrades futuros e permite adequar cada componente à necessidade real do cliente, diferente de pré-montados fechados de grandes varejistas.'
        },
        {
          question: 'Por que recomendar câmeras IP com PoE em vez de Wi-Fi puro sempre que possível?',
          options: [
            'PoE é sempre mais barato que Wi-Fi',
            'PoE é mais estável, não depende de sinal e reduz exposição a ataques em redes não segmentadas',
            'Câmeras Wi-Fi não gravam em alta resolução',
            'PoE dispensa qualquer tipo de cabeamento'
          ],
          correct: 1,
          explanation: 'PoE oferece maior estabilidade por não depender da força do sinal Wi-Fi, e reduz o risco de a câmera ser um ponto de ataque em redes domésticas sem segmentação adequada.'
        },
        {
          question: 'Quando faz sentido recomendar um hub dedicado (Zigbee/Matter) para um cliente de smart home?',
          options: [
            'Nunca — Wi-Fi doméstico sempre resolve',
            'Somente se o cliente já tiver mais de 5-10 dispositivos smart home',
            'Apenas para fechaduras inteligentes',
            'Somente em ambientes corporativos, nunca residenciais'
          ],
          correct: 1,
          explanation: 'A partir de 5-10 dispositivos smart home, um hub dedicado em Zigbee/Matter evita sobrecarregar o Wi-Fi doméstico e torna a rede mais robusta.'
        },
        {
          question: 'Qual risco de mercado deve ser observado especificamente na venda de pendrives e cartões de memória muito baratos?',
          options: [
            'Risco de incompatibilidade com Windows',
            'Produtos falsificados com capacidade de armazenamento fake, comuns em polos de importação',
            'Excesso de velocidade de gravação',
            'Incompatibilidade com câmeras profissionais apenas'
          ],
          correct: 1,
          explanation: 'É comum em polos de importação encontrar pendrives e cartões com capacidade "fake" (reportada maior do que a real) vendidos a preço suspeito — vale alertar e desconfiar de ofertas baixas demais.'
        }
      ],
    },
  ],
}
