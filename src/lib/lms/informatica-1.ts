import type { LmsTrilha } from './types'

export const informaticaT1: LmsTrilha = {
  id: 'trilha-ti-1',
  slug: 'fundamentos-da-computacao',
  title: 'Fundamentos da Computação',
  description: 'Da história da computação ao ciclo fetch-decode-execute — CPU, RAM, armazenamento, barramentos e BIOS/UEFI explicados para atendimento consultivo em loja de eletrônicos.',
  icon: '💻',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-1-fundamentos-da-computacao',
      title: 'Fundamentos da Computação',
      description: 'Da história da computação ao ciclo fetch-decode-execute — CPU, RAM, armazenamento, barramentos e BIOS/UEFI explicados para atendimento consultivo em loja de eletrônicos.',
      duration: 45,
      content: `
<h2>1.1 — História da Computação (visão aplicada ao varejo de TI)</h2>
<p>Por que isso importa pra vender? Cliente pergunta "por que meu PC de 2015 não roda Windows 11" ou "por que esse processador é mais caro que aquele" — resposta vem de entender gerações.</p>
<table>
<tr><th>Era</th><th>Marco</th><th>Relevância comercial hoje</th></tr>
<tr><td>1940s</td><td>ENIAC, válvulas</td><td>Contexto histórico apenas</td></tr>
<tr><td>1970s</td><td>Microprocessador (Intel 4004, depois 8086)</td><td>Origem da arquitetura x86 que ainda vende hoje</td></tr>
<tr><td>1980s</td><td>IBM PC, padronização</td><td>Por que "PC compatível" virou padrão de mercado</td></tr>
<tr><td>1990s-2000s</td><td>Internet, corrida por GHz</td><td>Cliente ainda pensa "GHz = velocidade" — você corrige isso</td></tr>
<tr><td>2006+</td><td>Multi-core (Core 2 Duo)</td><td>Por que "quantos núcleos" virou pergunta de venda</td></tr>
<tr><td>2010s</td><td>Mobile/ARM ascende</td><td>Por que Apple Silicon e Snapdragon mudam o jogo</td></tr>
<tr><td>2020+</td><td>SSD NVMe, DDR5, IA embarcada, ARM em notebook (Copilot+ PC)</td><td>O que você vende hoje</td></tr>
</table>
<p><strong>Aplicação prática:</strong> cliente que diz "quero um PC rápido" geralmente pensa em GHz. Seu trabalho é reeducar: desempenho hoje = arquitetura + núcleos + cache + IPC + gargalo de sistema, não só clock.</p>

<h2>1.2 — Arquitetura de Computadores — Modelo von Neumann</h2>
<p>Todo computador moderno segue o modelo von Neumann: mesma memória guarda dados E instruções.</p>
<pre>[ENTRADA] -&gt; [CPU: Unidade de Controle + ULA] &lt;-&gt; [MEMORIA] -&gt; [SAIDA]
                                              &lt;-&gt;
                                        [ARMAZENAMENTO]</pre>
<p><strong>Componentes:</strong></p>
<ul>
<li><strong>CPU:</strong> executa instruções (Unidade de Controle decodifica/sequencia; ULA faz aritmética/lógica).</li>
<li><strong>Memória (RAM):</strong> guarda dados/instruções em execução — volátil.</li>
<li><strong>Armazenamento (SSD/HDD):</strong> guarda dados permanentemente — não volátil.</li>
<li><strong>Barramentos:</strong> conectam tudo (dados, endereço, controle).</li>
<li><strong>Periféricos de E/S:</strong> teclado, mouse, monitor, rede.</li>
</ul>
<p><strong>Ciclo de instrução (fetch-decode-execute):</strong></p>
<ol>
<li>Fetch — CPU busca instrução na memória.</li>
<li>Decode — Unidade de Controle interpreta a instrução.</li>
<li>Execute — ULA executa a operação.</li>
<li>Store — resultado grava em registrador ou memória.</li>
</ol>
<p>Um processador de 3.5 GHz faz ~3.5 bilhões de ciclos de clock por segundo.</p>
<p><strong>Explicação simplificada pro cliente:</strong></p>
<p>"O processador é o cérebro que faz as contas, a RAM é a mesa de trabalho onde ele coloca o que está usando agora, e o SSD é o armário onde tudo fica guardado quando o PC desliga."</p>

<h2>1.3 — Representação de Dados e Sistema Binário</h2>
<p>Computador só entende dois estados: ligado (1) e desligado (0). Tudo vira sequência de bits.</p>
<table>
<tr><th>Unidade</th><th>Tamanho</th><th>Exemplo</th></tr>
<tr><td>Bit</td><td>1 dígito binário</td><td>menor unidade</td></tr>
<tr><td>Byte</td><td>8 bits</td><td>1 caractere</td></tr>
<tr><td>Kilobyte (KB)</td><td>1024 bytes</td><td>um parágrafo</td></tr>
<tr><td>Megabyte (MB)</td><td>1024 KB</td><td>uma foto comprimida</td></tr>
<tr><td>Gigabyte (GB)</td><td>1024 MB</td><td>um filme HD</td></tr>
<tr><td>Terabyte (TB)</td><td>1024 GB</td><td>biblioteca de mídia</td></tr>
</table>
<p><strong>Conversão binário → decimal:</strong> <code>1011</code> = (1×2³)+(0×2²)+(1×2¹)+(1×2⁰) = 11 decimal.</p>
<p><strong>Aplicação na venda:</strong></p>
<ul>
<li>GB (fabricante, base 1000) vs GiB (Windows mostra, base 1024) — resolve "meu SSD de 512GB só mostra 476GB, fui enganado?"</li>
<li>Mb (internet, bits) vs MB (download, bytes): "300 Mega" = 300 megabits/s ≈ 37.5 MB/s real. Confusão comum de cliente.</li>
</ul>
<p><strong>Representação de outros dados:</strong></p>
<ul>
<li>Texto: tabela ASCII/Unicode.</li>
<li>Imagem: pixels com RGB, 8 bits por canal = 24 bits/pixel "true color".</li>
<li>Áudio: sample rate (ex 44.1kHz) + bit depth (ex 16-bit).</li>
<li>Vídeo: frames + codec de compressão.</li>
</ul>

<h2>1.4 — CPU — Unidade Central de Processamento</h2>
<p><strong>Componentes internos:</strong></p>
<ul>
<li>Núcleos (cores): unidades independentes, mais = mais tarefas simultâneas.</li>
<li>Threads: Hyper-Threading (Intel) / SMT (AMD) — 1 núcleo simula 2 threads lógicas.</li>
<li>Cache (L1/L2/L3): memória ultrarrápida, reduz viagens à RAM.</li>
<li>Clock (GHz): ciclos/segundo — não compare entre arquiteturas diferentes (IPC varia).</li>
<li>TDP: watts de calor esperado — indica necessidade de refrigeração.</li>
</ul>
<p><strong>Erro de venda comum:</strong> vender CPU de muitos núcleos pra quem só usa navegador/Office — precisa de bom single-core, não núcleos. Edição de vídeo/3D/streaming aí sim precisa de núcleos.</p>
<table>
<tr><th>Uso do cliente</th><th>Prioridade</th></tr>
<tr><td>Navegação, Office, streaming</td><td>Clock/IPC bom, 4-6 núcleos</td></tr>
<tr><td>Gamer</td><td>IPC + clock altos, GPU forte</td></tr>
<tr><td>Edição de vídeo/3D/live</td><td>Muitos núcleos + GPU forte</td></tr>
<tr><td>Servidor/virtualização</td><td>Núcleos + RAM (ECC se possível)</td></tr>
</table>

<h2>1.5 — Memória (RAM)</h2>
<p>Volátil — perde dados ao desligar. "Mesa de trabalho" do processador.</p>
<ul>
<li>Capacidade (GB): quanto mantém ativo simultaneamente.</li>
<li>Velocidade (MHz) e Latência (CL): trade-off, mas dentro do suportado pela placa já é suficiente pra maioria.</li>
<li>Dual-channel: 2+ módulos idênticos em slots corretos dobram banda — ganho real em gráficos integrados e jogos.</li>
<li>Gerações DDR3/DDR4/DDR5 não são intercompatíveis.</li>
</ul>
<p><strong>Sintoma clássico:</strong> "trava com muitas abas/programas" = RAM insuficiente, sistema usa swap em disco, muito mais lento.</p>

<h2>1.6 — Armazenamento (introdução)</h2>
<ul>
<li>Volátil (RAM) vs não volátil (armazenamento).</li>
<li>HDD: magnético, mecânico, mais lento, mais barato/GB.</li>
<li>SSD: flash, sem partes móveis, muito mais rápido.</li>
<li>Troca HDD→SSD é o upgrade custo-benefício mais perceptível que existe.</li>
</ul>

<h2>1.7 — Barramentos (Buses)</h2>
<ul>
<li>Barramento de dados: transporta dados.</li>
<li>Barramento de endereço: define onde na memória.</li>
<li>Barramento de controle: sinais de coordenação.</li>
</ul>
<p><strong>Exemplos físicos:</strong></p>
<ul>
<li>PCIe: conecta GPU, SSD NVMe, placas de rede. Gerações (3.0/4.0/5.0) dobram banda; lanes (x1/x4/x8/x16) definem largura.</li>
<li>SATA: mais antigo, bem mais lento que NVMe.</li>
<li>USB: evoluindo (2.0 → 3.2 → USB4/Thunderbolt).</li>
</ul>
<p><strong>Relevância comercial:</strong> SSD NVMe em slot PCIe 3.0 não atinge desempenho máximo anunciado — checar compatibilidade antes de vender.</p>

<h2>1.8 — BIOS, UEFI e Firmware</h2>
<ul>
<li>Firmware: software em chip, controla hardware antes do SO carregar.</li>
<li>BIOS: clássico, texto, boot legado (MBR), limite 2TB.</li>
<li>UEFI: moderno, gráfico, boot rápido, GPT (&gt;2TB), Secure Boot — exigido pelo Windows 11.</li>
</ul>
<p><strong>Atendimento prático:</strong></p>
<ul>
<li>Win11 exige UEFI + Secure Boot + TPM 2.0 — diagnostique antes de prometer upgrade.</li>
<li>Update de BIOS resolve incompatibilidades de CPU/RAM novas ou bugs — risco de "brickar" se cair energia; sempre com nobreak.</li>
</ul>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> notebook 2016, i5 6ª geração, 4GB RAM, HDD 500GB — "aguenta Windows 11 e fica mais rápido?"</p>
<p><strong>Diagnóstico:</strong></p>
<ol>
<li>Checar CPU na lista suportada Win11 (gerações antigas ficam de fora mesmo com TPM).</li>
<li>Checar BIOS/UEFI — modo legado precisa converter (nem sempre possível).</li>
<li>Checar TPM 2.0 disponível/habilitável.</li>
<li>Gargalo real: 4GB RAM é o problema principal, não a geração da CPU.</li>
<li>Proposta: upgrade RAM (8-16GB) + HDD→SSD SATA resolve 90% da lentidão percebida.</li>
</ol>
<p><strong>Argumento de venda:</strong> "sente lentidão por pouca RAM e HD mecânico — trocar isso custa muito menos que notebook novo e resolve o problema real."</p>
      `,
      quiz: [
        {
          question: 'Um cliente diz "preciso de um processador com mais GHz possível para o PC ser rápido". Qual a resposta tecnicamente correta?',
          options: [
            'GHz é o único fator que determina velocidade, então a busca está certa',
            'Desempenho depende de arquitetura, núcleos, cache e IPC — clock isolado não compara nem entre CPUs de marcas diferentes',
            'GHz só importa em notebooks, não em desktops',
            'Quanto menor o GHz, melhor, pois gera menos calor',
          ],
          correct: 1,
          explanation: 'Desde a era multi-core (2006+), comparar apenas GHz é enganoso — dois processadores com o mesmo clock podem ter desempenho bem diferente por causa de arquitetura, IPC e cache.',
        },
        {
          question: 'Qual é a sequência correta do ciclo de instrução executado pela CPU?',
          options: [
            'Store, Execute, Decode, Fetch',
            'Fetch, Decode, Execute, Store',
            'Decode, Fetch, Store, Execute',
            'Execute, Fetch, Store, Decode',
          ],
          correct: 1,
          explanation: 'O ciclo segue Fetch (busca a instrução) → Decode (interpreta) → Execute (executa na ULA) → Store (grava o resultado).',
        },
        {
          question: 'Por que um plano de internet de "300 Mega" não entrega 300 MB/s de download?',
          options: [
            'Porque o provedor sempre entrega menos do que o contratado',
            'Porque "Mega" nesse contexto é megabit, e download é medido em megabyte — 300 Mbps equivale a ~37.5 MB/s',
            'Porque o roteador do cliente limita a velocidade real pela metade',
            'Porque GB e GiB são a mesma coisa e isso já reduz a velocidade',
          ],
          correct: 1,
          explanation: 'Velocidade de internet é anunciada em megabits por segundo (Mb), enquanto downloads são medidos em megabytes por segundo (MB) — 1 byte = 8 bits, então 300 Mbps ≈ 37.5 MB/s.',
        },
        {
          question: 'Um notebook precisa instalar Windows 11, mas está configurado em modo BIOS legado. Qual é o principal ponto de atenção antes de prometer o upgrade ao cliente?',
          options: [
            'Nenhum — Windows 11 funciona em qualquer modo de boot',
            'Verificar se a placa suporta conversão para UEFI, Secure Boot e TPM 2.0, pois são exigências do Windows 11',
            'Apenas trocar o HD por SSD resolve o problema automaticamente',
            'Basta atualizar o Windows sem mexer na BIOS',
          ],
          correct: 1,
          explanation: 'Windows 11 exige UEFI, Secure Boot e TPM 2.0. Isso deve ser diagnosticado antes de qualquer promessa, pois nem todo hardware antigo permite essa conversão.',
        },
        {
          question: 'Um cliente reclama que o PC "trava com muitas abas abertas e vários programas rodando". Qual é a causa mais provável e por quê?',
          options: [
            'CPU fraca — o processador não consegue processar tantos programas',
            'RAM insuficiente — o sistema recorre ao swap em disco, que é muito mais lento que a memória RAM',
            'SSD com pouca capacidade de armazenamento',
            'Placa de vídeo integrada mal configurada',
          ],
          correct: 1,
          explanation: 'Quando a RAM se esgota, o sistema operacional usa o disco como memória virtual (swap), que é ordens de magnitude mais lento — sintoma clássico de RAM insuficiente, não de CPU fraca.',
        },
      ],
    },
  ],
}
