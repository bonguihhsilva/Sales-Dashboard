import type { LmsTrilha } from './types'

export const informaticaT2: LmsTrilha = {
  id: 'trilha-ti-2',
  slug: 'hardware',
  title: 'Hardware',
  description: 'Funcionamento, diferenças, compatibilidade e critérios de compra de CPU, placa-mãe, RAM, armazenamento, GPU, fonte, gabinete, refrigeração, monitores e periféricos.',
  icon: '🔧',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-2-hardware',
      title: 'Hardware',
      description: 'Funcionamento, diferenças, compatibilidade e critérios de compra de CPU, placa-mãe, RAM, armazenamento, GPU, fonte, gabinete, refrigeração, monitores e periféricos.',
      duration: 50,
      content: `
<p>Para cada componente: funcionamento, diferenças, vantagens, limitações, compatibilidade, erros comuns, critérios de compra.</p>

<h2>2.1 — Processadores (CPU)</h2>
<p><strong>Fabricantes:</strong> Intel (Core i3/i5/i7/i9, séries Ultra), AMD (Ryzen 3/5/7/9, série Threadripper para workstation).</p>
<p><strong>Como funciona:</strong> decodifica e executa instruções via núcleos, cache e ULA (ver Módulo 1). Diferença entre marcas está na microarquitetura (quantas instruções por ciclo, eficiência energética, cache).</p>
<p><strong>Sockets (compatibilidade física com placa-mãe):</strong></p>
<table>
<tr><th>Fabricante</th><th>Socket atual</th><th>Observação</th></tr>
<tr><td>Intel</td><td>LGA1700 (12ª-14ª geração)</td><td>mudará com novas gerações — checar sempre</td></tr>
<tr><td>AMD</td><td>AM5 (Ryzen 7000+)</td><td>DDR5 obrigatório</td></tr>
<tr><td>AMD</td><td>AM4 (Ryzen 1000-5000)</td><td>ainda vendido, DDR4, ótimo custo-benefício</td></tr>
</table>
<p><strong>Erro comum:</strong> vender CPU sem checar socket da placa-mãe do cliente — incompatibilidade física, não liga.</p>
<p><strong>Critério de compra:</strong></p>
<ul>
<li>Uso leve/escritório: Core i3/i5 ou Ryzen 3/5, gerações recentes por eficiência energética.</li>
<li>Gamer: Core i5/i7 ou Ryzen 5/7 + GPU dedicada forte (CPU raramente é o gargalo em jogos com boa GPU).</li>
<li>Criador de conteúdo: Core i7/i9 ou Ryzen 7/9 — mais núcleos/threads.</li>
<li>Servidor/workstation: Xeon, Threadripper, Ryzen Pro — ECC, mais lanes PCIe.</li>
</ul>

<h2>2.2 — Placas-mãe</h2>
<p><strong>Função:</strong> conecta todos os componentes — CPU, RAM, armazenamento, GPU, periféricos.</p>
<p><strong>Fatores de forma (tamanho):</strong></p>
<table>
<tr><th>Formato</th><th>Tamanho</th><th>Uso</th></tr>
<tr><td>ATX</td><td>Padrão, mais slots</td><td>Desktop completo, expansível</td></tr>
<tr><td>Micro-ATX</td><td>Menor, menos slots PCIe</td><td>Custo-benefício, gabinetes menores</td></tr>
<tr><td>Mini-ITX</td><td>Compacto, 1 slot PCIe</td><td>Mini PC, HTPC, builds compactas</td></tr>
</table>
<p><strong>Chipset:</strong> define recursos disponíveis (quantidade de portas USB, PCIe, overclock permitido, RAID). Ex: Intel Z790 (overclock, topo) vs B760 (mainstream, sem overclock); AMD X670 (topo) vs B650 (mainstream).</p>
<p><strong>Erros comuns:</strong></p>
<ul>
<li>Vender placa-mãe DDR4 com pretensão de usar RAM DDR5 (ou vice-versa) — fisicamente incompatível.</li>
<li>Não checar se o BIOS da placa suporta a CPU nova sem atualização prévia (comum em lançamentos recentes de CPU em placas mais antigas).</li>
</ul>

<h2>2.3 — Chipsets</h2>
<p>Já cobertos junto com placa-mãe — mas vale reforçar: chipset determina teto de recursos, não desempenho bruto da CPU. Cliente que quer overclock precisa de chipset compatível (Z-series Intel, X/B650E+ AMD) + CPU "K" (Intel) ou desbloqueada (AMD, quase todos os Ryzen são).</p>

<h2>2.4 — Memória RAM</h2>
<p><strong>Tipos:</strong> DDR4, DDR5 (não intercompatíveis com placas de geração diferente).</p>
<p><strong>Critérios de compra:</strong></p>
<ul>
<li>8GB: mínimo aceitável hoje, só para uso muito básico.</li>
<li>16GB: padrão recomendado para maioria dos usuários e gamers.</li>
<li>32GB+: criadores de conteúdo, multitarefa pesada, virtualização.</li>
</ul>
<p><strong>Dual-channel:</strong> sempre vender em pares (2x8GB em vez de 1x16GB) quando possível — ganho de desempenho real, especialmente com gráficos integrados (APUs AMD) e notebooks.</p>
<p><strong>Erro comum:</strong> vender 1 módulo único quando cliente podia ter 2 em dual-channel pelo mesmo preço/capacidade.</p>

<h2>2.5 — SSD SATA</h2>
<p><strong>Funcionamento:</strong> memória flash NAND, interface SATA III (limite ~550MB/s teórico, ~500MB/s real).</p>
<p><strong>Vantagem:</strong> muito mais rápido que HDD, ainda compatível com PCs/notebooks antigos (só tem SATA).</p>
<p><strong>Limitação:</strong> teto de velocidade bem abaixo do NVMe.</p>
<p><strong>Quando vender:</strong> upgrade de PC/notebook antigo sem slot M.2 NVMe, ou como HD secundário de armazenamento em massa mais rápido que HDD.</p>

<h2>2.6 — SSD NVMe</h2>
<p><strong>Funcionamento:</strong> conecta via slot M.2, usa lanes PCIe diretamente — muito mais rápido que SATA (gigabytes/s em vez de megabytes/s).</p>
<table>
<tr><th>Interface</th><th>Velocidade teórica (aprox.)</th></tr>
<tr><td>PCIe 3.0 x4</td><td>~3.500 MB/s</td></tr>
<tr><td>PCIe 4.0 x4</td><td>~7.000 MB/s</td></tr>
<tr><td>PCIe 5.0 x4</td><td>~14.000 MB/s</td></tr>
</table>
<p><strong>Erro comum:</strong> vender NVMe PCIe 4.0/5.0 caro para placa que só tem slot PCIe 3.0 — cliente paga por velocidade que nunca vai usar. Sempre checar slot M.2 disponível e geração suportada na placa-mãe/notebook.</p>
<p><strong>Critério de compra:</strong> para SO e programas — sempre priorizar NVMe sobre SATA quando o orçamento permitir e a placa suportar.</p>

<h2>2.7 — HDD</h2>
<p><strong>Funcionamento:</strong> pratos magnéticos girando (5400/7200 RPM) + cabeça de leitura mecânica.</p>
<p><strong>Vantagem:</strong> custo por GB muito mais baixo, ideal para armazenamento em massa (backup, arquivos, mídia).</p>
<p><strong>Limitação:</strong> lento, suscetível a choque físico e desgaste mecânico, mais barulhento e quente.</p>
<p><strong>Quando vender:</strong> storage secundário barato, NAS, backup — nunca como disco de sistema hoje em dia.</p>

<h2>2.8 — Placas de Vídeo (GPU)</h2>
<p><strong>Fabricantes:</strong> NVIDIA (GeForce RTX/GTX), AMD (Radeon RX), Intel (Arc).</p>
<p><strong>Componentes:</strong> núcleos gráficos (CUDA cores NVIDIA / Stream Processors AMD), VRAM (memória dedicada), clock.</p>
<p><strong>VRAM — critério importante:</strong></p>
<table>
<tr><th>VRAM</th><th>Uso recomendado</th></tr>
<tr><td>6-8GB</td><td>Full HD, jogos atuais em configurações médias/altas</td></tr>
<tr><td>12GB+</td><td>1440p/4K, ray tracing, criação de conteúdo pesada</td></tr>
<tr><td>16GB+</td><td>4K máximo, IA local, workstation</td></tr>
</table>
<p><strong>Recursos modernos:</strong> ray tracing (iluminação realista), DLSS/FSR (upscaling por IA, ganho de FPS mantendo qualidade visual).</p>
<p><strong>Erro comum:</strong> vender GPU forte com fonte fraca (não aguenta o consumo) ou processador fraco demais (gargalo/bottleneck — GPU espera CPU).</p>
<p><strong>Critério de compra por perfil:</strong></p>
<ul>
<li>Casual/Office: GPU integrada já resolve (Intel Iris Xe, AMD Radeon integrada).</li>
<li>Gamer entrada: RTX 4060 / RX 7600 classe.</li>
<li>Gamer entusiasta: RTX 4070/4080 / RX 7800XT+ classe.</li>
<li>Criador de conteúdo/IA: GPU com mais VRAM, considerar séries profissionais (Quadro/RTX Ada) em casos extremos.</li>
</ul>

<h2>2.9 — Fontes de Alimentação (PSU)</h2>
<p><strong>Certificação 80 Plus:</strong> mede eficiência energética.</p>
<table>
<tr><th>Selo</th><th>Eficiência aprox.</th></tr>
<tr><td>Bronze</td><td>~82-85%</td></tr>
<tr><td>Gold</td><td>~87-90%</td></tr>
<tr><td>Platinum/Titanium</td><td>~90-94%</td></tr>
</table>
<p><strong>Cálculo de potência:</strong> somar consumo estimado de CPU+GPU+demais componentes, adicionar margem de segurança (~20-30%). Existem calculadoras online de fabricantes (Seasonic, Corsair) — use-as com o cliente durante o atendimento, é ótimo argumento de confiança técnica.</p>
<p><strong>Erro grave e comum:</strong> vender fonte genérica sem certificação para GPU de alto consumo — risco real de queima de componentes. Nunca economizar na fonte.</p>
<p><strong>Modular vs não-modular:</strong> modular permite remover cabos não usados — melhor organização e airflow, mais caro.</p>

<h2>2.10 — Gabinetes</h2>
<p><strong>Critérios:</strong> compatibilidade com fator de forma da placa-mãe, espaço para GPU (comprimento), suporte a water cooler (tamanho de radiador), pontos de fixação de fans, filtros de poeira, airflow (entrada frontal, saída traseira/superior).</p>
<p><strong>Erro comum:</strong> vender gabinete bonito mas com péssimo airflow (todo fechado, sem malha) — componentes esquentam, throttling de desempenho.</p>

<h2>2.11 — Refrigeração</h2>
<p><strong>Tipos:</strong></p>
<ul>
<li>Cooler boxed (que acompanha CPU): suficiente para uso básico/médio.</li>
<li>Air cooler (torre com heatpipes): melhor custo-benefício para desempenho médio/alto.</li>
<li>Water cooler (AIO — All In One): melhor para CPUs de alto TDP, visual, mas custo maior e ponto de falha adicional (bomba).</li>
</ul>
<p><strong>Pasta térmica:</strong> interface entre CPU e cooler — reaplicar a cada 2-3 anos ou em trocas de cooler.</p>
<p><strong>Critério prático:</strong> CPU de alto consumo (i7/i9, Ryzen 7/9) sem cooler adequado = throttling térmico (CPU reduz clock sozinha pra não queimar) — cliente sente "computador trava/reduz desempenho sob carga".</p>

<h2>2.12 — Water Cooler (detalhe)</h2>
<p>AIO (All-In-One) — sistema fechado e pré-cheio de líquido, sem manutenção do usuário. Tamanhos de radiador (120mm, 240mm, 360mm) definem capacidade de dissipação — quanto maior o radiador, mais TDP suporta com folga e silêncio.</p>
<p><strong>Erro comum:</strong> montar water cooler sem checar clearance no gabinete (o radiador não cabe).</p>

<h2>2.13 — Monitores</h2>
<p><strong>Critérios técnicos:</strong></p>
<ul>
<li>Resolução: Full HD (1920x1080), 1440p (2K), 4K (3840x2160).</li>
<li>Taxa de atualização (Hz): 60Hz padrão, 144Hz+/240Hz+ para jogos competitivos.</li>
<li>Tempo de resposta (ms): quanto menor, menos "ghosting"/borrão em movimento.</li>
<li>Tipo de painel: TN (mais barato, resposta rápida, pior cor/ângulo), IPS (melhor cor/ângulo, mais caro), VA (contraste alto, meio-termo).</li>
<li>Sincronização: G-Sync (NVIDIA) / FreeSync (AMD) — evita tearing, precisa combinar com a GPU do cliente.</li>
</ul>
<p><strong>Critério de venda por perfil:</strong></p>
<ul>
<li>Trabalho/Office: IPS Full HD, 60-75Hz, foco em conforto visual.</li>
<li>Gamer competitivo: 144Hz+, TN ou IPS rápido, resolução Full HD para mais FPS.</li>
<li>Gamer/criador visual: IPS 1440p/4K, boa cobertura de cor (sRGB/Adobe RGB).</li>
</ul>

<h2>2.14 — Periféricos</h2>
<p><strong>Teclado:</strong> membrana (barato, silencioso) vs mecânico (switches individuais, mais durável, melhor feedback tátil, mais caro). Switches mecânicos variam: lineares (silenciosos, gaming), táteis, clicky (som alto, digitação).</p>
<p><strong>Mouse:</strong> DPI (sensibilidade), polling rate (taxa de resposta), sensor óptico vs laser, ergonomia. Gamer valoriza polling rate alto e peso ajustável; uso geral prioriza ergonomia.</p>
<p><strong>Headset:</strong> drivers (tamanho/qualidade do alto-falante), microfone com cancelamento de ruído, conexão (P2, USB, wireless).</p>
<p><strong>Webcam:</strong> resolução (720p básico, 1080p+ recomendado), abertura de lente, correção de luz baixa — alta demanda pós-home office/streaming.</p>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> cliente quer montar PC para "trabalhar e jogar um pouco", orçamento limitado.</p>
<p><strong>Abordagem:</strong></p>
<ol>
<li>Perguntar jogos específicos (define GPU necessária — CS/Valorant precisa de FPS alto, não GPU cara; jogos AAA precisam de GPU mais forte).</li>
<li>Priorizar SSD NVMe (mesmo pequeno, 500GB) sobre HDD grande — sensação de velocidade importa mais que espaço no dia a dia.</li>
<li>16GB RAM em dual-channel como padrão, não 8GB.</li>
<li>GPU de entrada/meio-termo com boa relação preço/desempenho, evitar gargalo com CPU muito fraca.</li>
<li>Fonte com certificação 80 Plus Bronze no mínimo, com margem sobre o consumo calculado.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente:</strong> "Quero uma placa de vídeo boa, a mais forte que vocês tiverem."</p>
<p><strong>Resposta consultiva:</strong> "Antes de indicar, preciso saber: qual processador e fonte o senhor já tem ou vai comprar junto? Porque uma placa muito forte com processador fraco não rende o esperado — é dinheiro jogado fora. E a fonte precisa aguentar o consumo dela com folga, senão corre risco de queimar componente. Me conta que jogos ou programas o senhor usa que eu monto a configuração ideal, sem superdimensionar nem faltar."</p>
      `,
      quiz: [
        {
          question: 'Por que vender um SSD NVMe PCIe 5.0 para uma placa-mãe que só possui slot PCIe 3.0 é um erro de venda?',
          options: [
            'Porque SSD NVMe não funciona fisicamente em slots PCIe 3.0',
            'Porque o cliente pagaria por uma velocidade que a placa não é capaz de entregar — o SSD roda limitado à geração do slot',
            'Porque PCIe 5.0 exige processador AMD obrigatoriamente',
            'Porque SSDs NVMe mais rápidos sempre têm menor durabilidade',
          ],
          correct: 1,
          explanation: 'O SSD NVMe é compatível fisicamente com slots de gerações anteriores, mas roda limitado à velocidade da geração PCIe suportada pela placa — pagar por PCIe 5.0 numa placa 3.0 é desperdício de dinheiro.',
        },
        {
          question: 'Qual o motivo principal para nunca vender uma fonte de alimentação genérica e sem certificação para acompanhar uma GPU de alto consumo?',
          options: [
            'Fontes sem certificação são sempre mais baratas e isso é vantagem para o cliente',
            'Existe risco real de queima de componentes por fornecimento de energia inadequado ou instável',
            'Fontes sem certificação não têm conector PCIe para a GPU',
            'O certificado 80 Plus é apenas uma etiqueta de marketing, sem efeito real',
          ],
          correct: 1,
          explanation: 'Fontes genéricas sem certificação podem fornecer energia instável ou insuficiente, colocando em risco real a integridade da GPU e de outros componentes do sistema.',
        },
        {
          question: 'Um cliente quer overclock na CPU. O que é necessário além de uma CPU desbloqueada (ou "K" no caso Intel)?',
          options: [
            'Qualquer placa-mãe serve, overclock é feito apenas por software',
            'Um chipset compatível com overclock, como Z-series (Intel) ou X/B650E+ (AMD)',
            'Apenas uma fonte de alta potência, o chipset não importa',
            'Um gabinete com iluminação RGB para melhor dissipação',
          ],
          correct: 1,
          explanation: 'Overclock exige tanto uma CPU desbloqueada quanto um chipset que suporte esse recurso — chipsets mainstream (B760 Intel, B650 AMD não-E) geralmente não liberam esse controle.',
        },
        {
          question: 'Por que a compra de RAM em dual-channel (2x8GB) costuma ser preferível a um único módulo (1x16GB) de mesma capacidade total?',
          options: [
            'Dual-channel é sempre mais barato que módulo único',
            'Dois módulos em dual-channel dobram a banda de acesso à memória, com ganho real especialmente em gráficos integrados e notebooks',
            'Um único módulo de 16GB é fisicamente incompatível com a maioria das placas',
            'Dual-channel elimina completamente a necessidade de SSD',
          ],
          correct: 1,
          explanation: 'Dual-channel usa dois canais de memória simultaneamente, dobrando a banda disponível — ganho perceptível especialmente em sistemas com GPU integrada, onde a RAM também serve de memória de vídeo.',
        },
        {
          question: 'Qual tipo de painel de monitor é geralmente mais indicado para um gamer competitivo que prioriza taxa de atualização alta e resposta rápida acima da qualidade de cor?',
          options: [
            'VA, pelo alto contraste',
            'IPS de 4K, pela fidelidade de cor',
            'TN ou IPS rápido, com foco em 144Hz+ e baixo tempo de resposta',
            'Qualquer painel, desde que tenha G-Sync',
          ],
          correct: 2,
          explanation: 'Para jogos competitivos, o critério prioritário é taxa de atualização alta e baixo tempo de resposta — painéis TN ou IPS rápidos em Full HD entregam mais FPS estável do que priorizar resolução ou cor.',
        },
      ],
    },
  ],
}
