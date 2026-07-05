-- ============================================================
-- LMS: seed 13 trilhas globais de Informatica (Consultor Tecnico e Comercial de Tecnologia)
-- 13 trilhas, 13 modulos, 13 aulas, 13 provas, 65 questoes.
-- ============================================================

insert into public.trilhas
  (id, tenant_id, titulo, descricao, publico_alvo, ordem, ativa, icon, cor, is_global)
values
('71b72666-3381-452e-93d5-63331af9415d', NULL, 'Fundamentos da Computação', 'Da história da computação ao ciclo fetch-decode-execute — CPU, RAM, armazenamento, barramentos e BIOS/UEFI explicados para atendimento consultivo em loja de eletrônicos.', NULL, 17, true, '💻', '#2563EB', true),
('bb1517dd-bb23-4fdb-93b0-2d5dceb515d8', NULL, 'Hardware', 'Funcionamento, diferenças, compatibilidade e critérios de compra de CPU, placa-mãe, RAM, armazenamento, GPU, fonte, gabinete, refrigeração, monitores e periféricos.', NULL, 18, true, '🔧', '#2563EB', true),
('dd217d3e-1136-49f6-a3f1-fa5b2a67865c', NULL, 'Montagem e Upgrade', 'Ordem de montagem, checklist de compatibilidade, diagnóstico de gargalos, airflow, configuração de BIOS, atualização de firmware e testes de estabilidade pós-montagem.', NULL, 19, true, '🛠️', '#2563EB', true),
('ba0c9f24-92e8-497f-b63d-8c7fa69d22a8', NULL, 'Redes de Computadores', 'Modelo OSI, TCP/IP, IPv4/IPv6, DHCP, DNS, NAT, VLAN, VPN, roteamento, cabeamento, fibra óptica, Wi-Fi e PoE aplicados ao diagnóstico e venda consultiva de redes domésticas e empresariais.', NULL, 20, true, '🌐', '#2563EB', true),
('89a4d43b-568a-46fb-930d-8885b7060482', NULL, 'Equipamentos de Rede', 'Roteadores, switches, APs, controladoras, firewalls, racks e nobreaks — como escolher e vender o equipamento certo para cada perfil de cliente.', NULL, 21, true, '📡', '#2563EB', true),
('e43b9ab4-7a86-45cf-be23-09fe248e694b', NULL, 'Sistemas Operacionais', 'Windows, Linux, macOS, Android e iOS — instalação, configuração, manutenção e como orientar o cliente na escolha certa do sistema.', NULL, 22, true, '💿', '#2563EB', true),
('78ea82cb-501d-4de2-b985-b00dc564dba0', NULL, 'Segurança da Informação', 'Antivírus, ransomware, phishing, MFA, backups, criptografia e LGPD — como proteger o cliente e orientar boas práticas de segurança.', NULL, 23, true, '🔒', '#2563EB', true),
('a2087d0b-251f-429a-8011-44e6a05eab9d', NULL, 'Diagnóstico e Solução de Problemas', 'Metodologia de diagnóstico para PCs lentos, superaquecimento, falhas de memória, SSD, rede e hardware — do sintoma à causa raiz confirmada.', NULL, 24, true, '🩺', '#2563EB', true),
('e5daad7f-2c37-4c5d-acab-23aef1747ef0', NULL, 'Produtos Tecnológicos', 'Panorama comercial das principais categorias de produtos tecnológicos — fabricantes, segmentação, público-alvo e argumentos de venda.', NULL, 25, true, '🛒', '#2563EB', true),
('ba46aaaa-6736-4f49-9934-cca0e3628342', NULL, 'Inteligência Comercial', 'Framework prático de análise de catálogo, upsell, cross-sell e avaliação de concorrência para maximizar vendas com consultoria de verdade.', NULL, 26, true, '📊', '#2563EB', true),
('877efff5-9f4d-4697-a362-9246f88da55e', NULL, 'Mercado de Ciudad del Este', 'Perfil dos diferentes tipos de compradores de Ciudad del Este, comportamento de compra por nacionalidade, sazonalidade e diferenciais competitivos regionais.', NULL, 27, true, '🌎', '#2563EB', true),
('6b078714-d265-44c5-a753-a5dec2ac3433', NULL, 'Atendimento Técnico Consultivo', 'Metodologia de atendimento consultivo em informática — perguntar, diagnosticar a necessidade real, montar solução completa e justificar tecnicamente em 8 cenários reais de loja.', NULL, 28, true, '🎧', '#2563EB', true),
('7e727756-4ae9-4d5a-95b8-27495ea1fd34', NULL, 'Tendências Tecnológicas', 'Panorama das principais tendências de tecnologia (IA local, nuvem, edge computing, Wi-Fi 7, PCIe 5.0, DDR5, USB4, redes 10G, smart home, VR/AR e computação quântica) e seu impacto comercial no varejo de informática.', NULL, 29, true, '🚀', '#2563EB', true);

insert into public.modulos
  (id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima, tenant_id)
values
('7b618904-654b-4595-9a37-f77e369f12b5', '71b72666-3381-452e-93d5-63331af9415d', 'Fundamentos da Computação', 'Da história da computação ao ciclo fetch-decode-execute — CPU, RAM, armazenamento, barramentos e BIOS/UEFI explicados para atendimento consultivo em loja de eletrônicos.', 0, 100, 70, NULL),
('78577e38-5e13-4d1a-99a4-d070138a1143', 'bb1517dd-bb23-4fdb-93b0-2d5dceb515d8', 'Hardware', 'Funcionamento, diferenças, compatibilidade e critérios de compra de CPU, placa-mãe, RAM, armazenamento, GPU, fonte, gabinete, refrigeração, monitores e periféricos.', 0, 100, 70, NULL),
('1bc6252a-74cf-45cf-ba30-f1e804cdc898', 'dd217d3e-1136-49f6-a3f1-fa5b2a67865c', 'Montagem e Upgrade', 'Ordem de montagem, checklist de compatibilidade, diagnóstico de gargalos, airflow, configuração de BIOS, atualização de firmware e testes de estabilidade pós-montagem.', 0, 100, 70, NULL),
('e38e0290-d85f-4058-9387-9710c40b2da8', 'ba0c9f24-92e8-497f-b63d-8c7fa69d22a8', 'Redes de Computadores', 'Modelo OSI, TCP/IP, IPv4/IPv6, DHCP, DNS, NAT, VLAN, VPN, roteamento, cabeamento, fibra óptica, Wi-Fi e PoE aplicados ao diagnóstico e venda consultiva de redes domésticas e empresariais.', 0, 100, 70, NULL),
('5cb5ba63-cb00-46c6-8a1a-cf643d2aa6fe', '89a4d43b-568a-46fb-930d-8885b7060482', 'Equipamentos de Rede', 'Roteadores, switches, APs, controladoras, firewalls, racks e nobreaks — como escolher e vender o equipamento certo para cada perfil de cliente.', 0, 100, 70, NULL),
('152d42f9-6449-47ff-a2ac-b9c24b463d3d', 'e43b9ab4-7a86-45cf-be23-09fe248e694b', 'Sistemas Operacionais', 'Windows, Linux, macOS, Android e iOS — instalação, configuração, manutenção e como orientar o cliente na escolha certa do sistema.', 0, 100, 70, NULL),
('1f6ea72d-8f26-4a34-958f-56650f1285b9', '78ea82cb-501d-4de2-b985-b00dc564dba0', 'Segurança da Informação', 'Antivírus, ransomware, phishing, MFA, backups, criptografia e LGPD — como proteger o cliente e orientar boas práticas de segurança.', 0, 100, 70, NULL),
('17f48cb1-0418-4682-882e-b2a07445d356', 'a2087d0b-251f-429a-8011-44e6a05eab9d', 'Diagnóstico e Solução de Problemas', 'Metodologia de diagnóstico para PCs lentos, superaquecimento, falhas de memória, SSD, rede e hardware — do sintoma à causa raiz confirmada.', 0, 100, 70, NULL),
('eb65b34b-704a-4a1b-b132-62718d40ea85', 'e5daad7f-2c37-4c5d-acab-23aef1747ef0', 'Produtos Tecnológicos', 'Panorama comercial das principais categorias de produtos tecnológicos — fabricantes, segmentação, público-alvo e argumentos de venda.', 0, 100, 70, NULL),
('5f897c60-ddb1-4fdf-9b77-fd5fa2830401', 'ba46aaaa-6736-4f49-9934-cca0e3628342', 'Inteligência Comercial', 'Framework prático de análise de catálogo, upsell, cross-sell e avaliação de concorrência para maximizar vendas com consultoria de verdade.', 0, 100, 70, NULL),
('dafb340c-1dae-4378-b1c5-a0ead2716b88', '877efff5-9f4d-4697-a362-9246f88da55e', 'Mercado de Ciudad del Este', 'Perfil dos diferentes tipos de compradores de Ciudad del Este, comportamento de compra por nacionalidade, sazonalidade e diferenciais competitivos regionais.', 0, 100, 70, NULL),
('3942235f-260a-44f0-a88c-f4284c3c01cd', '6b078714-d265-44c5-a753-a5dec2ac3433', 'Atendimento Técnico Consultivo', 'Metodologia de atendimento consultivo em informática — perguntar, diagnosticar a necessidade real, montar solução completa e justificar tecnicamente em 8 cenários reais de loja.', 0, 100, 70, NULL),
('995dfa85-9502-4df7-982d-1ea919babe1f', '7e727756-4ae9-4d5a-95b8-27495ea1fd34', 'Tendências Tecnológicas', 'Panorama das principais tendências de tecnologia (IA local, nuvem, edge computing, Wi-Fi 7, PCIe 5.0, DDR5, USB4, redes 10G, smart home, VR/AR e computação quântica) e seu impacto comercial no varejo de informática.', 0, 100, 70, NULL);

insert into public.aulas
  (id, tenant_id, modulo_id, titulo, tipo_conteudo, url_midia, conteudo_texto, ordem, is_global, slides, xp_reward)
values
('b514020d-1acc-442d-9430-e8e5770f8deb', NULL, '7b618904-654b-4595-9a37-f77e369f12b5', 'Fundamentos da Computação', 'texto', NULL, '
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
      ', 0, true, NULL, 45),
('02f3a6e6-a631-40c7-865c-d2b1af7e5252', NULL, '78577e38-5e13-4d1a-99a4-d070138a1143', 'Hardware', 'texto', NULL, '
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
      ', 0, true, NULL, 50),
('9ce9b9f4-07f1-47ba-a0b0-84ed1b105273', NULL, '1bc6252a-74cf-45cf-ba30-f1e804cdc898', 'Montagem e Upgrade', 'texto', NULL, '
<h2>3.1 — Montagem Completa — Ordem Recomendada</h2>
<ol>
<li>Instalar CPU no socket da placa-mãe (alinhar marcação, sem forçar).</li>
<li>Instalar cooler (aplicar pasta térmica em quantidade correta — grão de arroz/ervilha no centro).</li>
<li>Instalar RAM nos slots corretos (checar manual para dual-channel — geralmente slots A2/B2 primeiro).</li>
<li>Instalar placa-mãe no gabinete (standoffs corretos, evitar curto-circuito por parafuso mal posicionado).</li>
<li>Instalar fonte de alimentação.</li>
<li>Instalar armazenamento (M.2 direto na placa, SATA com cabos de dados+energia).</li>
<li>Instalar GPU no slot PCIe x16 principal.</li>
<li>Conectar cabos de energia (24-pin, CPU 4+4/8-pin, PCIe da GPU).</li>
<li>Conectar cabos do painel frontal (power switch, reset, USB, áudio) — passo mais propenso a erro por conectores pequenos e mal identificados.</li>
<li>Organizar cabeamento antes de fechar.</li>
<li>Primeiro boot fora do gabinete ou com lateral aberta para testar antes de fechar tudo.</li>
</ol>

<h2>3.2 — Compatibilidade — Checklist Antes de Comprar</h2>
<ul>
<li>CPU ↔ Socket da placa-mãe.</li>
<li>RAM ↔ Tipo suportado pela placa (DDR4/DDR5) e versão de BIOS (CPUs novas às vezes exigem update de BIOS antes de reconhecer).</li>
<li>GPU ↔ Tamanho físico (comprimento) cabe no gabinete.</li>
<li>Cooler ↔ Clearance com RAM (coolers de torre grandes podem esbarrar em pentes de RAM altos) e com o gabinete (altura do cooler).</li>
<li>Fonte ↔ Potência total do sistema + conectores necessários (PCIe de 8-pin para GPU, EPS de CPU).</li>
<li>Armazenamento ↔ Slots M.2 disponíveis e geração PCIe suportada.</li>
</ul>

<h2>3.3 — Gargalos (Bottlenecks)</h2>
<p>Gargalo = componente que limita o desempenho dos demais.</p>
<p><strong>Exemplos comuns:</strong></p>
<ul>
<li>CPU fraca + GPU forte: GPU fica ociosa esperando CPU processar (comum em jogos que dependem de single-thread).</li>
<li>RAM insuficiente: sistema usa swap em disco, todo o sistema trava.</li>
<li>SSD lento (SATA) com CPU/GPU topo de linha: carregamento de jogos/programas mais lento que o resto do sistema permitiria.</li>
<li>Fonte subdimensionada: sistema desliga sob carga alta (proteção contra sobrecarga).</li>
</ul>
<p><strong>Como diagnosticar:</strong> monitorar uso de CPU/GPU durante a tarefa-alvo (Task Manager, MSI Afterburner, HWiNFO). Se GPU fica abaixo de 90-95% de uso com CPU em 100%, é gargalo de CPU. Se GPU fica em 99-100% constante, ela é o fator limitante (esperado e ok).</p>

<h2>3.4 — Airflow (Fluxo de Ar)</h2>
<p><strong>Princípio:</strong> ar frio entra pela frente/baixo, ar quente sai por trás/cima — pressão positiva (mais entrada que saída) reduz acúmulo de poeira.</p>
<p><strong>Erros comuns:</strong></p>
<ul>
<li>Fans todos soprando na mesma direção sem plano de entrada/saída.</li>
<li>Gabinete com painel frontal fechado (vidro/acrílico sem malha) restringindo entrada de ar — visual bonito, térmica ruim.</li>
<li>Cabos mal organizados bloqueando fluxo de ar interno.</li>
</ul>

<h2>3.5 — Organização de Cabos</h2>
<ul>
<li>Usar espaço atrás da bandeja da placa-mãe para rotear cabos.</li>
<li>Prender com abraçadeiras/velcro.</li>
<li>Cabos modulares da fonte: usar só o necessário.</li>
<li>Benefícios: melhor airflow, manutenção futura mais fácil, visual (importante em gabinetes com vidro lateral, cada vez mais comuns em venda).</li>
</ul>

<h2>3.6 — BIOS — Configuração Pós-Montagem</h2>
<p><strong>Itens a checar/configurar no primeiro boot:</strong></p>
<ul>
<li>Reconhecimento de toda RAM instalada e ativação de XMP/EXPO (perfil de overclock de fábrica da memória — sem isso, RAM roda abaixo da velocidade anunciada).</li>
<li>Ordem de boot (prioridade do SSD/NVMe do sistema).</li>
<li>Modo UEFI habilitado (não legado) se for instalar Windows 11.</li>
<li>Secure Boot habilitado se necessário.</li>
<li>Fan curves (curvas de ventoinha) ajustadas para equilíbrio ruído/temperatura.</li>
</ul>
<p><strong>Erro muito comum:</strong> esquecer de ativar XMP/EXPO — RAM DDR5-6000 rodando a 4800MT/s "de fábrica" sem o perfil ativado. Sempre checar e ativar.</p>

<h2>3.7 — Atualização de Firmware (BIOS Update)</h2>
<p><strong>Quando é necessário:</strong> CPU nova lançada depois da placa-mãe (compatibilidade), correção de bugs de estabilidade/memória, novos recursos.</p>
<p><strong>Cuidados obrigatórios:</strong></p>
<ul>
<li>Nunca atualizar sem nobreak/energia estável.</li>
<li>Seguir exatamente o modelo e revisão da placa-mãe (BIOS errada pode inutilizar a placa).</li>
<li>Preferir métodos "flashback" (atualização sem CPU/RAM instalada) quando disponível — mais seguro.</li>
</ul>

<h2>3.8 — Instalação do Sistema Operacional</h2>
<ul>
<li>Criar mídia de boot USB (Rufus, Media Creation Tool para Windows).</li>
<li>Configurar boot em modo UEFI no BIOS antes de instalar (evita instalação em modo legado por engano).</li>
<li>Particionamento correto (GPT para UEFI).</li>
<li>Instalar drivers de chipset, GPU, rede logo após — usar utilitário do fabricante da placa-mãe/notebook.</li>
</ul>

<h2>3.9 — Testes de Estabilidade</h2>
<p><strong>Ferramentas e o que testam:</strong></p>
<ul>
<li><strong>Prime95 / Cinebench:</strong> estresse de CPU — checa temperatura e estabilidade sob carga total.</li>
<li><strong>MemTest86:</strong> testa integridade da RAM — essencial após qualquer upgrade de memória, roda fora do SO (boot USB).</li>
<li><strong>FurMark / 3DMark:</strong> estresse de GPU.</li>
<li><strong>CrystalDiskMark:</strong> benchmark de velocidade de armazenamento — confirma se SSD está entregando a velocidade anunciada.</li>
<li><strong>HWiNFO / HWMonitor:</strong> monitoramento de temperaturas em tempo real durante os testes.</li>
</ul>
<p><strong>Critério de aprovação:</strong> sistema estável por 30min-1h de estresse sem crash, sem temperaturas acima do limite seguro (CPU geralmente &lt;90°C sob carga sustentada, GPU &lt;83-85°C dependendo do modelo).</p>

<h2>Cenários Reais de Montagem</h2>
<p><strong>Cenário A — Sistema não liga após montagem:</strong> Checklist de diagnóstico em ordem: cabo de energia 24-pin e CPU conectados? Botão de energia do painel frontal conectado corretamente (polaridade não importa nesse conector, mas posição sim)? RAM bem encaixada (clique dos dois lados)? Fonte com switch traseiro ligado? Teste "pão-duro": remover tudo exceto CPU+cooler+1 RAM+GPU (se necessária para vídeo) fora do gabinete, testar em superfície não condutiva.</p>
<p><strong>Cenário B — Sistema liga mas não dá vídeo:</strong> GPU bem encaixada e com conector de energia PCIe conectado? Monitor no cabo/porta certa (GPU dedicada, não a da placa-mãe, quando há GPU dedicada instalada)? RAM em slot correto? Beep codes da placa-mãe (se houver alto-falante de diagnóstico) ou LEDs de debug indicam onde está o problema (CPU, RAM, GPU, boot).</p>
<p><strong>Cenário C — Sistema trava sob carga (jogos/renderização):</strong> Testar temperaturas primeiro (throttling térmico). Testar estabilidade de RAM com MemTest86 (instabilidade de memória é causa comum e pouco lembrada). Checar se fonte tem potência suficiente. Checar se XMP/EXPO está causando instabilidade (às vezes precisa de perfil manual com timings levemente relaxados).</p>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> cliente retorna à loja porque um PC recém-montado trava durante jogos pesados.</p>
<p><strong>Diagnóstico consultivo:</strong></p>
<ol>
<li>Monitorar temperaturas com HWiNFO durante o jogo — descartar throttling térmico primeiro.</li>
<li>Rodar MemTest86 durante a noite para validar estabilidade da RAM, especialmente se XMP/EXPO foi ativado.</li>
<li>Confirmar se a fonte tem potência e conectores suficientes para a GPU sob carga máxima.</li>
<li>Se XMP causar instabilidade, testar com timings manuais levemente relaxados antes de descartar o kit de memória.</li>
<li>Só depois de eliminar essas causas, investigar drivers de GPU ou possível defeito de hardware.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente (retorno):</strong> "Comprei a RAM nova que vocês indicaram mas o Task Manager mostra uma velocidade menor do que estava anunciado."</p>
<p><strong>Resposta consultiva:</strong> "Isso é bem comum — por padrão a placa-mãe roda a RAM numa velocidade mais conservadora até você ativar o perfil XMP (ou EXPO, se for AMD) na BIOS. Vou te mostrar o passo a passo pra ativar, é rapidinho e sem risco, e sua RAM vai rodar na velocidade certa que foi vendida."</p>
      ', 0, true, NULL, 45),
('bb596c7e-a048-449b-b964-afae65910580', NULL, 'e38e0290-d85f-4058-9387-9710c40b2da8', 'Redes de Computadores', 'texto', NULL, '
<h2>4.1 — Modelo OSI (7 camadas)</h2>
<table>
<tr><th>Camada</th><th>Nome</th><th>Função</th><th>Exemplo</th></tr>
<tr><td>7</td><td>Aplicação</td><td>Interface com o usuário/app</td><td>HTTP, DNS, e-mail</td></tr>
<tr><td>6</td><td>Apresentação</td><td>Formatação/criptografia</td><td>SSL/TLS, compressão</td></tr>
<tr><td>5</td><td>Sessão</td><td>Gerencia sessões de comunicação</td><td>Login de sessão</td></tr>
<tr><td>4</td><td>Transporte</td><td>Entrega confiável/não confiável</td><td>TCP, UDP</td></tr>
<tr><td>3</td><td>Rede</td><td>Roteamento entre redes</td><td>IP, roteadores</td></tr>
<tr><td>2</td><td>Enlace</td><td>Comunicação na mesma rede local</td><td>MAC address, switches</td></tr>
<tr><td>1</td><td>Física</td><td>Sinal elétrico/óptico/rádio</td><td>Cabos, Wi-Fi, fibra</td></tr>
</table>
<p><strong>Uso prático:</strong> diagnosticar problema de rede "de baixo para cima" — checar cabo/sinal físico (camada 1) antes de suspeitar de DNS (camada 7).</p>

<h2>4.2 — TCP/IP (modelo prático usado na internet real)</h2>
<p>Simplificação em 4 camadas: Aplicação, Transporte (TCP/UDP), Internet (IP), Acesso à Rede (física/enlace).</p>
<p><strong>TCP vs UDP:</strong></p>
<table>
<tr><th></th><th>TCP</th><th>UDP</th></tr>
<tr><td>Confiabilidade</td><td>Confirma entrega, reenvia perdidos</td><td>Sem confirmação</td></tr>
<tr><td>Velocidade</td><td>Mais lento (overhead)</td><td>Mais rápido</td></tr>
<tr><td>Uso</td><td>Navegação web, e-mail, transferência de arquivos</td><td>Streaming, jogos online, VoIP</td></tr>
</table>

<h2>4.3 — IPv4</h2>
<p>Endereço de 32 bits, formato decimal pontuado (ex: 192.168.1.1). Dividido em faixas públicas e privadas.</p>
<p><strong>Faixas privadas (RFC 1918) — as que você vê em toda rede doméstica/empresarial:</strong></p>
<ul>
<li>10.0.0.0 – 10.255.255.255</li>
<li>172.16.0.0 – 172.31.255.255</li>
<li>192.168.0.0 – 192.168.255.255</li>
</ul>
<p><strong>Máscara de sub-rede:</strong> define o que é "rede" e o que é "host" dentro do endereço (ex: /24 = 255.255.255.0 = 254 hosts utilizáveis).</p>
<p><strong>Esgotamento de IPv4:</strong> motivo principal da existência do IPv6 — não há mais endereços públicos IPv4 suficientes para todos os dispositivos do mundo.</p>

<h2>4.4 — IPv6</h2>
<p>Endereço de 128 bits, formato hexadecimal (ex: 2001:0db8::1). Resolve esgotamento de endereços, tem configuração automática (SLAAC), sem necessidade de NAT para ter IP público end-to-end.</p>
<p><strong>Realidade de mercado:</strong> adoção ainda parcial — a maioria das redes domésticas/PMEs roda IPv4 + NAT até hoje. Bom saber explicar, raramente crítico no atendimento de balcão.</p>

<h2>4.5 — DHCP (Dynamic Host Configuration Protocol)</h2>
<p>Atribui automaticamente IP, máscara, gateway e DNS aos dispositivos da rede — sem ele, cada aparelho precisaria de configuração manual de IP.</p>
<p><strong>Sintoma de problema:</strong> dispositivo com "IP 169.254.x.x" (APIPA) = não conseguiu contato com servidor DHCP = problema de cabo, Wi-Fi, ou roteador/switch.</p>

<h2>4.6 — DNS (Domain Name System)</h2>
<p>Traduz nomes (google.com) em endereços IP. Sem DNS funcionando, sites não carregam mesmo com internet "funcionando" (fenômeno comum: "internet caiu" quando na verdade só o DNS falhou).</p>
<p><strong>Diagnóstico rápido:</strong> se o site não abre pelo nome mas abre pelo IP direto, ou trocar DNS (ex: para 8.8.8.8 do Google ou 1.1.1.1 da Cloudflare) resolve — o problema era DNS, não a conexão em si.</p>

<h2>4.7 — NAT (Network Address Translation)</h2>
<p>Traduz múltiplos IPs privados internos em 1 IP público externo — é por isso que uma casa/empresa inteira compartilha 1 único IP público visto pela internet.</p>
<p><strong>Relevância comercial:</strong> hospedar servidor/câmera acessível de fora exige configurar "port forwarding" no roteador (regra de NAT) — pergunta comum de cliente que quer acessar DVR/NVR remotamente.</p>

<h2>4.8 — VLAN (Virtual LAN)</h2>
<p>Segmenta uma rede física em redes lógicas separadas — tráfego de uma VLAN não se mistura com outra mesmo usando o mesmo switch físico.</p>
<p><strong>Uso comercial típico:</strong> separar rede de convidados/Wi-Fi público da rede administrativa/financeira de uma empresa, ou separar câmeras IP do restante do tráfego para não sobrecarregar a rede principal. Requer switch gerenciável.</p>

<h2>4.9 — VPN (Virtual Private Network)</h2>
<p>Cria túnel criptografado entre dois pontos pela internet pública, como se estivessem na mesma rede local.</p>
<p><strong>Casos de uso comercial:</strong> acesso remoto seguro a servidor da empresa, conexão entre filiais, privacidade de navegação para usuário final.</p>
<p><strong>Protocolos comuns:</strong> WireGuard (moderno, rápido, simples), OpenVPN (tradicional, muito suportado), IPSec (comum em equipamentos corporativos/roteadores).</p>

<h2>4.10 — Roteamento</h2>
<p>Processo de encaminhar pacotes entre redes diferentes com base no IP de destino, usando tabelas de rota. Roteador = dispositivo que faz essa função entre a rede local e a internet (ou entre sub-redes).</p>

<h2>4.11 — Switches</h2>
<p>Conectam múltiplos dispositivos na mesma rede local, encaminhando tráfego com base no endereço MAC — mais eficiente que um hub (que replica tráfego para todas as portas).</p>

<h2>4.12 — Access Points (APs)</h2>
<p>Fornecem conectividade Wi-Fi a uma rede cabeada existente. Diferente de roteador Wi-Fi doméstico (que combina roteador+AP+switch em um único aparelho), AP puro só faz a parte de rádio — comum em redes empresariais com múltiplos APs gerenciados por controladora.</p>

<h2>4.13 — Cabeamento</h2>
<p><strong>Categorias de cabo par trançado:</strong></p>
<table>
<tr><th>Categoria</th><th>Velocidade máx.</th><th>Uso</th></tr>
<tr><td>Cat5e</td><td>1 Gbps</td><td>Padrão residencial/comercial básico, ainda muito usado</td></tr>
<tr><td>Cat6</td><td>1-10 Gbps (10Gbps até 55m)</td><td>Recomendado para instalações novas</td></tr>
<tr><td>Cat6a</td><td>10 Gbps (100m completos)</td><td>Empresarial, redes de alta demanda</td></tr>
<tr><td>Cat7/8</td><td>10-40 Gbps</td><td>Data center, uso especializado</td></tr>
</table>
<p><strong>Erro comum:</strong> vender switch/placa de rede 2.5G/10G mas manter cabeamento Cat5e antigo — não vai atingir a velocidade nova.</p>

<h2>4.14 — Fibra Óptica</h2>
<p>Transmite dados via luz — imune a interferência eletromagnética, longas distâncias sem perda significativa.</p>
<p><strong>Tipos:</strong></p>
<ul>
<li>Monomodo (single-mode): longas distâncias (km), usado por operadoras/backbone.</li>
<li>Multimodo: distâncias curtas (dentro de prédio/campus), mais barato.</li>
</ul>
<p><strong>Uso comercial crescente:</strong> provedores de internet residencial (FTTH — Fiber to the Home) já entregam fibra até a casa do cliente; ONU/ONT converte sinal óptico em Ethernet para o roteador.</p>

<h2>4.15 — Wi-Fi — Gerações</h2>
<table>
<tr><th>Padrão</th><th>Nome comercial</th><th>Banda</th><th>Diferencial</th></tr>
<tr><td>802.11ac</td><td>Wi-Fi 5</td><td>5GHz</td><td>Ainda muito comum, bom custo-benefício</td></tr>
<tr><td>802.11ax</td><td>Wi-Fi 6</td><td>2.4/5GHz</td><td>OFDMA (melhor com muitos dispositivos), mais eficiente</td></tr>
<tr><td>802.11ax (6E)</td><td>Wi-Fi 6E</td><td>+6GHz</td><td>Nova faixa livre de interferência legado, menos alcance</td></tr>
<tr><td>802.11be</td><td>Wi-Fi 7</td><td>2.4/5/6GHz</td><td>Maior velocidade, menor latência, MLO (múltiplos links simultâneos)</td></tr>
</table>
<p><strong>Argumento de venda Wi-Fi 6/6E/7:</strong> não é só "mais rápido" — o ganho real em casas/escritórios modernos é lidar melhor com MUITOS dispositivos conectados ao mesmo tempo (celular, TV, smart home, notebook) sem degradar a rede toda.</p>

<h2>4.16 — PoE (Power over Ethernet)</h2>
<p>Transmite energia elétrica junto com dados pelo mesmo cabo de rede — elimina necessidade de tomada elétrica perto do dispositivo.</p>
<p><strong>Uso comercial típico:</strong> câmeras IP, access points, telefones IP instalados em locais sem tomada próxima (teto, área externa).</p>
<p><strong>Padrões:</strong> PoE (802.3af, até ~15W), PoE+ (802.3at, até ~30W), PoE++ (802.3bt, até ~60-100W) — importante checar se o switch/injetor entrega a potência que o dispositivo exige.</p>

<h2>Diagrama Conceitual — Rede Doméstica/PME Típica</h2>
<pre>Internet (Provedor)
    |
[Modem/ONT] -- fibra ou cabo do provedor
    |
[Roteador] -- faz NAT, DHCP, DNS, Wi-Fi
    |
[Switch] -- expande portas cabeadas
    |     \
[PCs/Impressoras]  [Access Points adicionais -- Wi-Fi maior alcance]</pre>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> empresa reclama que "a internet está lenta" só em determinados horários.</p>
<p><strong>Diagnóstico consultivo:</strong></p>
<ol>
<li>Testar velocidade direto no modem via cabo (isola se é o provedor ou a rede interna).</li>
<li>Checar quantidade de dispositivos conectados e uso de banda (Wi-Fi 5 sobrecarregado com muitos dispositivos = candidato a upgrade Wi-Fi 6).</li>
<li>Checar se há VLAN separando tráfego crítico de tráfego não essencial (streaming, convidados).</li>
<li>Checar cabeamento (Cat5e antigo limitando switch/rede gigabit nova).</li>
<li>Propor solução: upgrade de AP para Wi-Fi 6, segmentação por VLAN, ou upgrade de link com o provedor — sempre com diagnóstico primeiro, nunca "vender solução" sem confirmar causa.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente:</strong> "Meu Wi-Fi não pega em casa toda, preciso de um roteador mais forte."</p>
<p><strong>Resposta consultiva:</strong> "Antes de eu indicar um roteador mais caro, me conta o tamanho da casa e quantos cômodos/andares? Às vezes o problema não é ''roteador fraco'' e sim que uma casa grande precisa de mais de um ponto de Wi-Fi (sistema mesh) em vez de um roteador único mais potente — que não resolve paredes e distância do mesmo jeito. Vou te mostrar as duas opções com preço e explicar qual resolve melhor o seu caso."</p>
      ', 0, true, NULL, 45),
('ba925e4d-8f72-4380-8532-64e702bae8e4', NULL, '5cb5ba63-cb00-46c6-8a1a-cf643d2aa6fe', 'Equipamentos de Rede', 'texto', NULL, '
<h2>5.1 — Roteadores</h2>
<p><strong>Função:</strong> interliga redes diferentes (rede local ↔ internet), faz NAT, DHCP, DNS, firewall básico, Wi-Fi (em modelos domésticos combinados).</p>
<table>
<tr><th>Perfil</th><th>Recomendação</th></tr>
<tr><td>Residencial básico</td><td>Roteador Wi-Fi 5/6 dual-band simples</td></tr>
<tr><td>Residencial casa grande</td><td>Sistema mesh (2-3 unidades) Wi-Fi 6</td></tr>
<tr><td>Pequena empresa</td><td>Roteador com firewall mais robusto + AP dedicado separado</td></tr>
<tr><td>Empresa média/grande</td><td>Roteador/firewall dedicado (ex: MikroTik, Ubiquiti, pfSense) + APs gerenciados por controladora</td></tr>
</table>
<p><strong>Erro comum:</strong> vender roteador doméstico simples para ambiente com 30+ dispositivos simultâneos — trava, precisa de equipamento com CPU/RAM adequados a carga de conexões (NAT table).</p>

<h2>5.2 — Switches Gerenciáveis</h2>
<p>Permitem configurar VLAN, QoS (priorização de tráfego), monitoramento via SNMP, port mirroring (para diagnóstico/segurança), link aggregation (agregar portas para mais banda).</p>
<p><strong>Quando vender:</strong> ambiente empresarial com necessidade de segmentação (VLANs), monitoramento, ou crescimento planejado da rede.</p>

<h2>5.3 — Switches Não Gerenciáveis</h2>
<p>Plug-and-play, sem configuração, apenas encaminha tráfego. Mais barato.</p>
<p><strong>Quando vender:</strong> expansão simples de portas em rede doméstica/pequeno escritório sem necessidade de segmentação ou controle avançado.</p>

<h2>5.4 — Access Points</h2>
<p>Diferença de AP standalone vs AP gerenciado por controladora (cloud ou local) — em ambientes com múltiplos APs, controladora permite roaming transparente (celular troca de AP sem cair a conexão) e configuração centralizada.</p>
<p><strong>Marcas comuns no mercado:</strong> Ubiquiti (UniFi), TP-Link (Omada), Aruba/HPE (corporativo grande porte).</p>

<h2>5.5 — Repetidores / Extensores de Wi-Fi</h2>
<p>Reforçam sinal de uma rede existente retransmitindo-o — solução mais barata mas com penalidade de banda (repetidor tradicional pode reduzir a velocidade pela metade a cada "salto").</p>
<p><strong>Diferença crítica pra explicar ao cliente:</strong> repetidor cria rede "separada" que às vezes exige troca manual de rede Wi-Fi ao andar pela casa; sistema mesh cria uma única rede contínua com roaming automático — mesh é tecnicamente superior para casas grandes, repetidor é solução mais barata para reforço pontual.</p>

<h2>5.6 — Controladoras</h2>
<p>Software (ou aparelho dedicado) que gerencia múltiplos APs/switches de forma centralizada — perfil de rede, segurança, atualização de firmware em massa, monitoramento.</p>
<p><strong>Quando recomendar:</strong> a partir de ~3-4 APs, a gestão individual vira inviável — controladora se paga em tempo economizado de manutenção.</p>

<h2>5.7 — Firewalls</h2>
<p>Filtra tráfego de rede com base em regras de segurança — pode ser dedicado (appliance) ou parte do roteador.</p>
<p><strong>Recursos avançados em firewalls empresariais:</strong> IDS/IPS (detecção/prevenção de intrusão), VPN site-to-site, filtragem de conteúdo, inspeção profunda de pacotes (DPI).</p>
<p><strong>Venda consultiva:</strong> empresa que lida com dados sensíveis (financeiro, saúde, dados de clientes) deve considerar firewall dedicado, não só o NAT básico do roteador.</p>

<h2>5.8 — Racks</h2>
<p>Estrutura padronizada (19 polegadas de largura) para organizar equipamentos de rede/servidores — medido em "U" (unidades de altura, 1U ≈ 4.45cm).</p>
<p><strong>Critérios de venda:</strong> tamanho conforme quantidade de equipamentos + espaço para crescimento, ventilação adequada (racks fechados precisam de exaustão ativa), organizador de cabos.</p>

<h2>5.9 — Nobreaks (UPS — Uninterruptible Power Supply)</h2>
<table>
<tr><th>Tipo</th><th>Proteção</th><th>Uso</th></tr>
<tr><td>Off-line/Standby</td><td>Comuta para bateria só na falta de energia (pequeno atraso)</td><td>Uso doméstico básico</td></tr>
<tr><td>Line-interactive</td><td>Regula tensão + bateria, resposta mais rápida</td><td>PMEs, equipamentos de rede</td></tr>
<tr><td>Online (dupla conversão)</td><td>Sem interrupção alguma, sempre filtrando</td><td>Servidores, equipamentos críticos</td></tr>
</table>
<p><strong>Cálculo de autonomia:</strong> somar consumo em VA/W dos equipamentos conectados, escolher nobreak com capacidade e autonomia (minutos de bateria) adequada à criticidade — servidor precisa de tempo suficiente para desligamento seguro ou até geração alternativa entrar.</p>
<p><strong>Erro comum:</strong> subdimensionar nobreak (só a carga "cabe" nominalmente mas sem margem) — autonomia real cai muito abaixo do esperado.</p>

<h2>Como Escolher a Melhor Solução por Perfil de Cliente</h2>
<table>
<tr><th>Cliente</th><th>Solução recomendada</th></tr>
<tr><td>Casa pequena/apartamento</td><td>Roteador Wi-Fi 6 simples</td></tr>
<tr><td>Casa grande/2+ andares</td><td>Mesh Wi-Fi 6 (2-3 nós)</td></tr>
<tr><td>Pequeno escritório (até 10 pessoas)</td><td>Roteador/firewall + switch gerenciável básico + 1-2 APs</td></tr>
<tr><td>Empresa média (10-50 pessoas)</td><td>Firewall dedicado + switches gerenciáveis com VLAN + APs com controladora</td></tr>
<tr><td>Loja/varejo com câmeras</td><td>Switch com portas PoE + NVR + rede segmentada (câmeras isoladas do financeiro)</td></tr>
</table>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> pequena empresa (15 funcionários) quer câmeras de segurança + Wi-Fi confiável para funcionários e Wi-Fi separado para visitantes.</p>
<p><strong>Proposta consultiva:</strong></p>
<ol>
<li>Switch gerenciável com portas PoE suficientes para as câmeras.</li>
<li>VLAN separada para câmeras (isola tráfego, protege contra invasão via câmera vulnerável — problema real de segurança).</li>
<li>VLAN separada para "convidados" no Wi-Fi, sem acesso à rede interna.</li>
<li>2 APs posicionados estrategicamente (não é só "1 roteador mais forte") para cobertura completa.</li>
<li>Nobreak line-interactive para roteador+switch+NVR — se cair energia, câmeras e rede continuam ativas por um tempo.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente:</strong> "Preciso de um roteador para minha loja, tenho câmeras, computador do caixa e Wi-Fi para clientes."</p>
<p><strong>Resposta consultiva:</strong> "Pra sua situação eu não recomendaria só um roteador doméstico — o ideal é separar as redes: uma para o caixa e sistema interno, outra isolada para as câmeras, e uma terceira só pro Wi-Fi dos clientes, sem que nenhuma converse com a outra. Isso evita que um problema no Wi-Fi público comprometa seu caixa ou suas câmeras. Precisa de um switch com suporte a VLAN e, se possível, roteador com firewall um pouco mais robusto. Vou montar duas opções de orçamento pra você comparar."</p>
      ', 0, true, NULL, 45),
('25e199cc-b44a-4070-b08f-6703fa248de8', NULL, '152d42f9-6449-47ff-a2ac-b9c24b463d3d', 'Sistemas Operacionais', 'texto', NULL, '
<h2>6.1 — Windows</h2>
<p><strong>Versões relevantes hoje:</strong> Windows 10 (suporte estendido terminando, migração para 11 é tendência forte de venda), Windows 11 (padrão atual, exige TPM 2.0 + UEFI + Secure Boot).</p>
<p><strong>Instalação:</strong> via USB bootável (Media Creation Tool/Rufus), particionamento GPT, ativação via licença digital (OEM vinculada à placa-mãe) ou chave de produto.</p>
<p><strong>Configuração pós-instalação essencial:</strong></p>
<ul>
<li>Drivers de chipset, GPU, rede, áudio (via site do fabricante, não confiar 100% no Windows Update para tudo).</li>
<li>Windows Update completo.</li>
<li>Desativar bloatware desnecessário (em notebooks de marca, muito software pré-instalado consome recursos).</li>
<li>Configurar plano de energia (notebooks: equilíbrio autonomia/desempenho).</li>
</ul>
<p><strong>Manutenção:</strong></p>
<ul>
<li>Verificação de disco (chkdsk), desfragmentação (só relevante em HDD, nunca em SSD — TRIM é o correspondente para SSD).</li>
<li>Limpeza de arquivos temporários (Disk Cleanup / Storage Sense).</li>
<li>Gerenciamento de itens de inicialização (Task Manager > Inicializar) — causa comum de "PC demora pra ligar".</li>
</ul>
<p><strong>Ferramentas administrativas importantes:</strong> Gerenciador de Dispositivos, Gerenciador de Tarefas, Editor de Diretiva de Grupo (gpedit — Pro/Enterprise), PowerShell, Visualizador de Eventos (Event Viewer — essencial para diagnóstico de causa raiz de crashes).</p>

<h2>6.2 — Linux</h2>
<p><strong>Distribuições relevantes para o contexto de loja/suporte:</strong></p>
<table>
<tr><th>Distro</th><th>Perfil</th></tr>
<tr><td>Ubuntu</td><td>Mais popular, boa para iniciantes, grande suporte de comunidade</td></tr>
<tr><td>Debian</td><td>Base estável, usado em servidores</td></tr>
<tr><td>Linux Mint</td><td>Interface amigável para quem vem do Windows</td></tr>
<tr><td>Fedora</td><td>Mais atualizado, usado por desenvolvedores</td></tr>
</table>
<p><strong>Quando recomendar Linux ao cliente:</strong></p>
<ul>
<li>Hardware antigo que não roda Windows 11 e o cliente só precisa de navegador/uso básico — Linux leve dá sobrevida real ao equipamento.</li>
<li>Servidores (custo de licença zero, estabilidade, controle total).</li>
<li>Cliente técnico/desenvolvedor que já pede especificamente.</li>
</ul>
<p><strong>Cuidado comercial:</strong> não empurrar Linux para usuário leigo dependente de softwares específicos do Windows (alguns ERPs, softwares fiscais brasileiros só rodam nativamente em Windows) sem avisar da limitação.</p>

<h2>6.3 — macOS</h2>
<p><strong>Características:</strong> integrado ao hardware Apple (Apple Silicon M-series), ecossistema fechado, forte em edição de mídia (Final Cut, Logic Pro nativos).</p>
<p><strong>Suporte em loja:</strong> geralmente limitado a orientação básica e venda de acessórios/periféricos compatíveis — reparo de hardware Apple frequentemente exige certificação própria (mencionar limite honesto ao cliente).</p>

<h2>6.4 — Android</h2>
<p><strong>Manutenção comum solicitada em loja:</strong></p>
<ul>
<li>Liberação de espaço de armazenamento (cache de apps, mídia).</li>
<li>Atualização de sistema.</li>
<li>Reset de fábrica para revenda/troca de dono (sempre com backup prévio confirmado).</li>
<li>Troca de bateria/tela como serviço técnico associado.</li>
</ul>

<h2>6.5 — iOS</h2>
<p><strong>Pontos de atendimento comuns:</strong></p>
<ul>
<li>Backup via iCloud ou computador antes de qualquer reparo/reset.</li>
<li>Explicar diferença entre "restaurar como novo" vs "restaurar de backup".</li>
<li>Orientação sobre armazenamento (iCloud pago vs armazenamento local do aparelho).</li>
</ul>

<h2>Comparativo para Orientar o Cliente</h2>
<table>
<tr><th>Necessidade do cliente</th><th>SO recomendado</th></tr>
<tr><td>Uso doméstico geral, jogos, compatibilidade ampla</td><td>Windows 11</td></tr>
<tr><td>PC antigo, uso básico (navegação, documentos)</td><td>Linux leve (Mint/Ubuntu)</td></tr>
<tr><td>Edição profissional de vídeo/áudio, ecossistema Apple</td><td>macOS</td></tr>
<tr><td>Servidor de baixo custo, alta estabilidade</td><td>Linux (Debian/Ubuntu Server)</td></tr>
</table>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> cliente reclama que "o notebook demora muito pra ligar".</p>
<p><strong>Diagnóstico:</strong></p>
<ol>
<li>Checar se é HDD (upgrade para SSD resolve a maioria dos casos) ou já é SSD com muitos itens de inicialização.</li>
<li>Abrir Gerenciador de Tarefas > aba Inicializar, identificar programas com impacto "Alto".</li>
<li>Checar quantidade de bloatware de fabricante rodando em segundo plano.</li>
<li>Verificar Visualizador de Eventos para erros recorrentes que atrasam o boot (drivers com timeout, serviços travando).</li>
<li>Propor: SSD (se ainda não tem), limpeza de itens de inicialização, reinstalação limpa se o sistema estiver muito "sujo" de anos de uso.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente:</strong> "Meu notebook é de 2014, só uso pra WhatsApp Web e Netflix, dá pra deixar ele rápido de novo?"</p>
<p><strong>Resposta consultiva:</strong> "Dá sim. Pra esse uso, nem precisa de Windows mais recente — se o hardware for muito limitado, uma alternativa é instalar um Linux leve, que é rápido, gratuito e faz exatamente o que o senhor precisa (navegador, vídeo, WhatsApp Web). Combinado com uma troca de SSD, se ainda não tiver, o notebook fica com uma sensação de muito mais rápido, por uma fração do preço de um aparelho novo."</p>
      ', 0, true, NULL, 40),
('5f9a68f1-97c5-4ea7-8202-13f668dad679', NULL, '1f6ea72d-8f26-4a34-958f-56650f1285b9', 'Segurança da Informação', 'texto', NULL, '
<h2>7.1 — Antivírus</h2>
<p><strong>Funcionamento:</strong> detecção por assinatura (banco de ameaças conhecidas) + heurística/comportamental (identifica padrões suspeitos mesmo sem assinatura exata) + proteção em tempo real.</p>
<p><strong>Orientação de venda honesta:</strong> Windows Defender (nativo, gratuito) já oferece proteção sólida para uso doméstico atualizado. Antivírus pago se justifica por: recursos extras (VPN incluída, gerenciador de senha, proteção multiplataforma), suporte técnico dedicado, ou necessidade corporativa de gestão centralizada (EDR — Endpoint Detection and Response).</p>

<h2>7.2 — Ransomware</h2>
<p>Malware que criptografa arquivos do usuário e exige pagamento (resgate) para liberar. Uma das ameaças mais destrutivas para empresas — pode parar operação inteira.</p>
<p><strong>Prevenção real (o que efetivamente protege):</strong></p>
<ul>
<li>Backup 3-2-1 (3 cópias, 2 mídias diferentes, 1 fora do local) — única defesa 100% confiável contra perda definitiva.</li>
<li>Atualização de sistema e aplicativos (falhas exploradas costumam já ter correção disponível).</li>
<li>Segmentação de rede (limita alastramento caso um dispositivo seja infectado).</li>
<li>Treinamento contra phishing (vetor de entrada mais comum).</li>
</ul>

<h2>7.3 — Phishing</h2>
<p>Tentativa de enganar a vítima para obter credenciais/dados via e-mail, SMS ou site falso que imita serviço legítimo.</p>
<p><strong>Sinais de alerta a ensinar ao cliente leigo:</strong> urgência excessiva ("sua conta será bloqueada em 24h"), remetente com domínio levemente diferente do oficial, links que não batem com o texto exibido, pedido de dados sensíveis por e-mail (bancos legítimos não pedem senha completa por e-mail).</p>

<h2>7.4 — Engenharia Social</h2>
<p>Manipulação psicológica para obter acesso/informação, sem depender de falha técnica — a "porta" mais fácil de qualquer sistema de segurança é o ser humano.</p>
<p><strong>Exemplos práticos para orientar clientes empresariais:</strong> ligação se passando por "suporte técnico" pedindo acesso remoto, pessoa se passando por entregador/técnico para entrar fisicamente no local, pretexting (criar cenário falso e convincente para obter confiança).</p>

<h2>7.5 — Autenticação Multifator (MFA/2FA)</h2>
<p>Combina algo que o usuário sabe (senha) + algo que possui (celular/app autenticador/token) + eventualmente algo que é (biometria).</p>
<p><strong>Orientação prática de venda/atendimento:</strong> sempre recomendar ativação de 2FA em e-mail, banco, redes sociais — é a medida de segurança de maior impacto/menor custo que existe. Preferir apps autenticadores (Google/Microsoft Authenticator) a SMS quando possível (SMS é vulnerável a SIM swap).</p>

<h2>7.6 — Backups</h2>
<p><strong>Regra 3-2-1:</strong> 3 cópias dos dados, em 2 tipos de mídia diferentes, 1 cópia fora do local físico (nuvem ou outro endereço).</p>
<p><strong>Tipos:</strong></p>
<ul>
<li>Completo: copia tudo, mais lento, recuperação simples.</li>
<li>Incremental: só o que mudou desde o último backup (qualquer tipo) — rápido, mas restauração exige a cadeia completa.</li>
<li>Diferencial: só o que mudou desde o último completo — meio-termo.</li>
</ul>
<p><strong>Venda consultiva:</strong> cliente empresarial sem rotina de backup automatizado é um cliente com risco real de perda total de dados — argumento forte e verdadeiro para vender solução de backup (NAS, serviço em nuvem, ou ambos).</p>

<h2>7.7 — Criptografia</h2>
<p>Transforma dados em formato ilegível sem a chave correta.</p>
<p><strong>Aplicações práticas que o cliente encontra:</strong></p>
<ul>
<li>HTTPS (cadeado no navegador) — tráfego entre navegador e site criptografado.</li>
<li>BitLocker (Windows)/FileVault (Mac) — criptografia de disco inteiro, protege dados se o notebook for roubado.</li>
<li>Criptografia de backup em nuvem.</li>
</ul>

<h2>7.8 — Firewalls</h2>
<p>Já detalhado tecnicamente no Módulo 5 — aqui o foco é a camada de conceito de segurança: primeira barreira de filtragem entre rede confiável e não confiável, bloqueando tráfego não autorizado por padrão.</p>

<h2>7.9 — VPN (contexto de segurança)</h2>
<p>Além do uso corporativo (Módulo 4), para o usuário final: protege dados em redes Wi-Fi públicas não confiáveis (aeroportos, cafés), mas não é solução mágica de "anonimato total" — orientar o cliente com expectativa realista.</p>

<h2>7.10 — LGPD (Lei Geral de Proteção de Dados)</h2>
<p>Lei brasileira que regula tratamento de dados pessoais. Relevante comercialmente porque:</p>
<ul>
<li>Empresas clientes (pequenas/médias) frequentemente não sabem que precisam de política de dados mínima.</li>
<li>Venda de sistemas com armazenamento de dados de clientes (câmeras com reconhecimento facial, sistemas de CRM/ponto de venda) tem implicação legal — vale mencionar ao cliente empresarial, mesmo sem ser advogado, como ponto de atenção.</li>
<li>Backup e controle de acesso adequados ajudam a demonstrar conformidade em caso de auditoria/incidente.</li>
</ul>

<h2>7.11 — Boas Práticas — Checklist para Orientar Clientes</h2>
<ul>
<li>Senhas únicas e fortes por serviço (gerenciador de senhas > memorização/reuso).</li>
<li>2FA ativado sempre que disponível.</li>
<li>Atualizações de sistema e aplicativos em dia.</li>
<li>Backup automatizado e testado (backup que nunca foi restaurado/testado não é backup confiável).</li>
<li>Antivírus ativo e atualizado.</li>
<li>Cuidado com redes Wi-Fi públicas (usar VPN ou evitar transações sensíveis).</li>
<li>Desconfiar de urgência/pressão emocional em mensagens (marca registrada de phishing/engenharia social).</li>
</ul>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> pequena empresa foi vítima de ransomware, perdeu acesso aos arquivos do financeiro, não tinha backup.</p>
<p><strong>Análise pós-incidente (o que ensinar, sem prometer recuperação garantida):</strong></p>
<ol>
<li>Não pagar resgate é a recomendação padrão de órgãos de segurança (não há garantia de recuperação e financia crime organizado) — mas é decisão do cliente, você orienta, não decide por ele.</li>
<li>Isolar a máquina infectada da rede imediatamente para impedir alastramento.</li>
<li>Verificar se há alguma cópia de backup esquecida (nuvem pessoal, e-mail com anexos, versão em outro computador).</li>
<li>A partir daí: reconstruir política de backup 3-2-1 como prioridade absoluta antes de qualquer outra venda.</li>
<li>Proposta comercial: solução de backup automatizado (NAS + nuvem) + antivírus corporativo + treinamento básico anti-phishing para a equipe.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente:</strong> "Recebi um e-mail do banco dizendo que minha conta vai ser bloqueada, preciso clicar no link agora?"</p>
<p><strong>Resposta consultiva:</strong> "Não clica nesse link. Bancos sérios não mandam esse tipo de ameaça por e-mail pedindo ação urgente — isso é o padrão clássico de phishing, tentando te apressar pra você não pensar direito. Melhor: abre o app oficial do banco ou liga direto pra central, nunca pelo número ou link que veio no e-mail suspeito. Posso te mostrar como identificar esses golpes daqui pra frente, é rápido."</p>
      ', 0, true, NULL, 45),
('c560e789-1cbc-4e03-9a72-f0b4d89f9eef', NULL, '17f48cb1-0418-4682-882e-b2a07445d356', 'Diagnóstico e Solução de Problemas', 'texto', NULL, '
<h2>8.1 — Metodologia Geral de Diagnóstico</h2>
<p><strong>Passos universais (aplicáveis a qualquer sintoma):</strong></p>
<ol>
<li>Coletar sintoma exato do cliente (quando começou, o que mudou antes de começar, é constante ou intermitente).</li>
<li>Reproduzir o problema, se possível, na sua frente ou com o cliente descrevendo passo a passo.</li>
<li>Isolar variável por variável (hardware vs software, rede vs local, específico de 1 app vs sistema todo).</li>
<li>Testar hipótese mais provável e barata primeiro (nunca trocar peça cara por chute sem diagnóstico).</li>
<li>Confirmar resolução com teste real, não só "parece que sumiu".</li>
</ol>

<h2>8.2 — Computadores Lentos</h2>
<p><strong>Fluxograma de diagnóstico:</strong></p>
<pre><code>PC lento
 -> Uso de disco no Gerenciador de Tarefas está em 100%?
     SIM -> provavelmente HDD antigo/fragmentado ou SSD no fim da vida útil -> checar CrystalDiskInfo (saúde do disco)
     NAO -> Uso de RAM está no limite?
         SIM -> RAM insuficiente para o uso -> upgrade de RAM
         NAO -> Uso de CPU está no limite constante?
             SIM -> processo específico consumindo (malware? processo travado?) -> checar Gerenciador de Tarefas por processo
             NAO -> muitos itens de inicialização / sistema "sujo" -> limpeza e otimização de boot</code></pre>
<p><strong>Causas mais comuns na prática de loja:</strong> HDD antigo (maioria dos casos "resolve com SSD"), RAM insuficiente para o uso atual do cliente (navegadores modernos consomem muita RAM), excesso de programas na inicialização, malware/adware.</p>

<h2>8.3 — Superaquecimento</h2>
<p><strong>Sintomas:</strong> desligamento repentino, redução de desempenho sob carga (throttling), ruído de ventoinha em rotação máxima constante.</p>
<p><strong>Diagnóstico:</strong></p>
<ol>
<li>Monitorar temperatura com HWiNFO/HWMonitor em repouso e sob carga.</li>
<li>Verificar acúmulo de poeira em coolers/dissipadores (causa mais comum e mais barata de resolver).</li>
<li>Verificar idade da pasta térmica (ressecada após 2-3+ anos perde eficiência).</li>
<li>Verificar airflow do gabinete (fans de entrada/saída funcionando e posicionados corretamente).</li>
</ol>

<h2>8.4 — Falhas de Memória</h2>
<p><strong>Sintomas:</strong> tela azul (BSOD) aleatória, travamentos sem padrão aparente, corrupção de arquivos sem explicação.</p>
<p><strong>Diagnóstico:</strong> rodar MemTest86 (boot USB, fora do sistema operacional) por múltiplas passagens — qualquer erro reportado indica módulo defeituoso ou configuração instável (XMP/EXPO agressivo demais).</p>

<h2>8.5 — Problemas de SSD</h2>
<p><strong>Sintomas:</strong> lentidão progressiva, erros de leitura/escrita, sistema não reconhece o disco.</p>
<p><strong>Diagnóstico:</strong> CrystalDiskInfo para checar S.M.A.R.T. (indicadores de saúde do disco), verificar se firmware do SSD está atualizado, checar se está no slot/interface correta (M.2 pode ter modos SATA ou NVMe dependendo do slot da placa-mãe — confusão comum).</p>

<h2>8.6 — Falhas de Rede</h2>
<p><strong>Fluxograma:</strong></p>
<pre><code>Sem internet
 -> Outros dispositivos também sem internet?
     SIM -> problema no roteador/modem ou no provedor -> reiniciar modem/roteador, checar luzes de status, contatar provedor se persistir
     NAO -> problema isolado no dispositivo -> checar driver de rede, checar se está no Wi-Fi certo, testar cabo direto se possível</code></pre>

<h2>8.7 — Internet Instável (intermitente, não totalmente fora)</h2>
<p><strong>Causas comuns:</strong> interferência de Wi-Fi (muitos vizinhos na mesma faixa 2.4GHz), cabo de rede danificado/mal crimpado, superaquecimento do roteador (equipamento antigo rodando 24/7 sem descanso), sobrecarga de dispositivos conectados.</p>
<p><strong>Diagnóstico:</strong> teste de ping contínuo (<code>ping -t</code> no Windows) para ver se há perda de pacotes intermitente, testar canal de Wi-Fi menos congestionado (apps de análise de espectro Wi-Fi), testar performance via cabo para isolar se o problema é Wi-Fi ou geral.</p>

<h2>8.8 — Incompatibilidades</h2>
<p><strong>Cenários comuns:</strong> RAM não reconhecida (checar QVL — Qualified Vendor List — da placa-mãe), driver desatualizado causando tela azul, periférico não reconhecido por falta de driver específico, jogo/programa não abre por falta de requisito (DirectX, Visual C++ Redistributable, .NET Framework).</p>

<h2>8.9 — Defeitos de Hardware</h2>
<p><strong>Diferenciação hardware vs software (teste crucial):</strong> problema persiste em outro sistema operacional (boot via USB live Linux) ou em modo de segurança? Se sim, tende a ser hardware. Se some, é software/driver/configuração.</p>

<h2>8.10 — Problemas de Software</h2>
<p><strong>Abordagem:</strong> verificar Visualizador de Eventos para erro específico, testar em conta de usuário nova (isola perfil corrompido de sistema), testar após desabilitar inicialização em segundo plano de terceiros (clean boot).</p>

<h2>Fluxograma Geral de Triagem (primeiro contato com o cliente)</h2>
<pre><code>Cliente relata problema
 -> É hardware que não liga/não é reconhecido? -> Diagnóstico de hardware (fonte, conexões, POST)
 -> É lentidão geral? -> Fluxograma 8.2
 -> É travamento/tela azul? -> Verificar memória (8.4) e temperatura (8.3)
 -> É rede/internet? -> Fluxograma 8.6/8.7
 -> É programa específico? -> Diagnóstico de software (8.10)</code></pre>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> cliente relata que o PC "desliga sozinho" quando joga.</p>
<p><strong>Diagnóstico guiado:</strong></p>
<ol>
<li>Perguntar: desliga totalmente ou reinicia? (desligamento total sugere proteção de fonte/temperatura; reinício sugere driver de GPU ou instabilidade de sistema).</li>
<li>Monitorar temperatura de CPU/GPU durante o jogo com HWiNFO — se ultrapassa limite seguro, é térmico.</li>
<li>Checar se fonte tem capacidade suficiente para a GPU (picos de consumo em jogos pesados podem ultrapassar fontes subdimensionadas).</li>
<li>Testar com outro jogo/benchmark para confirmar se é específico de 1 jogo (então é software/driver) ou de qualquer carga pesada (então é hardware/energia/térmica).</li>
<li>Proposta conforme causa raiz confirmada — nunca vender fonte nova sem confirmar que é o problema real.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente:</strong> "Meu computador tá dando tela azul do nada, várias vezes por dia."</p>
<p><strong>Resposta consultiva:</strong> "Tela azul aleatória geralmente aponta pra memória RAM ou driver desatualizado. Vou rodar um teste de memória que leva algumas horas rodando sozinho — se aparecer erro ali, achamos a causa. Enquanto isso, vou também checar se os drivers de vídeo e chipset estão atualizados, porque é a segunda causa mais comum desse sintoma. Prefiro confirmar a causa exata antes de trocar qualquer peça, pra não gastar seu dinheiro à toa."</p>
      ', 0, true, NULL, 45),
('d835c538-5ba4-4310-980b-0b97489d3cc4', NULL, 'eb65b34b-704a-4a1b-b132-62718d40ea85', 'Produtos Tecnológicos', 'texto', NULL, '
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
      ', 0, true, NULL, 45),
('5bcae613-2979-4765-85ea-eb2d94fe90f7', NULL, '5f897c60-ddb1-4fdf-9b77-fd5fa2830401', 'Inteligência Comercial', 'texto', NULL, '
<p>Este módulo funciona como framework permanente: sempre que você (usuário deste curso) fornecer catálogo/lista de produtos disponíveis na loja, aplique a metodologia abaixo.</p>

<h2>10.1 — Framework de Análise de Catálogo</h2>
<p>Quando receber uma lista de produtos, seguir esta sequência analítica:</p>
<ol>
<li><strong>Mapear categorias presentes vs ausentes</strong> — identificar lacunas do catálogo frente à demanda típica de Ciudad del Este.</li>
<li><strong>Identificar produtos "âncora"</strong> — os que trazem tráfego/decisão de compra (ex: notebooks, celulares) vs produtos de "margem" (acessórios, cabos, periféricos) que sustentam a lucratividade real.</li>
<li><strong>Cruzar categorias para oportunidades de combo</strong> — todo produto âncora deve ter 2-3 sugestões de complementares mapeadas antecipadamente pela equipe de vendas.</li>
<li><strong>Avaliar giro (o que vende rápido) vs margem (o que dá mais lucro por unidade)</strong> — nem sempre são os mesmos produtos, e a estratégia comercial precisa equilibrar os dois.</li>
</ol>

<h2>10.2 — Upsell: Estratégias Práticas</h2>
<p>Upsell = convencer o cliente a levar uma versão superior do mesmo tipo de produto que já estava considerando.</p>
<p><strong>Técnicas:</strong></p>
<ul>
<li><strong>Comparação de diferença marginal:</strong> "por mais X reais/guaranis, o senhor leva o modelo com o dobro de armazenamento" — funciona melhor quando a diferença percentual de preço é pequena frente ao ganho percebido.</li>
<li><strong>Ancoragem por durabilidade:</strong> "esse modelo vai atender bem por 1-2 anos, esse outro por 4-5" — muda a percepção de custo-benefício de "preço da compra" para "custo por ano de uso".</li>
<li><strong>Demonstração ao vivo:</strong> deixar o cliente sentir a diferença (velocidade de boot com SSD, fluidez com mais RAM) sempre converte mais que só falar números.</li>
</ul>

<h2>10.3 — Cross-Sell: Estratégias Práticas</h2>
<p>Cross-sell = vender produto complementar ao item principal.</p>
<p><strong>Mapa de combos naturais por produto âncora:</strong></p>
<table>
<tr><th>Produto âncora</th><th>Cross-sell natural</th></tr>
<tr><td>Notebook</td><td>Mochila/case, mouse, SSD externo, licença de Office, hub USB</td></tr>
<tr><td>PC gamer montado</td><td>Monitor de alta taxa, headset, mousepad grande, nobreak</td></tr>
<tr><td>Roteador</td><td>Cabo de rede extra, switch adicional, repetidor/mesh se casa for grande</td></tr>
<tr><td>Câmera IP</td><td>Cartão SD de alta resistência, NVR, switch PoE</td></tr>
<tr><td>Impressora</td><td>Papel, tinta/toner extra, cabo USB se não incluso</td></tr>
<tr><td>Celular</td><td>Capa, película, carregador extra, fone</td></tr>
</table>

<h2>10.4 — Identificação de Tendências Tecnológicas (aplicação comercial)</h2>
<p>Sempre cruzar tendências de mercado com o catálogo: catálogo tem produtos com Wi-Fi 6/6E/7? Tem SSDs NVMe Gen4/Gen5? Tem opções DDR5? Ausência dessas categorias = oportunidade de expansão de catálogo antes da concorrência.</p>

<h2>10.5 — Análise de Concorrência</h2>
<p><strong>Perguntas-guia para analisar concorrentes em Ciudad del Este:</strong></p>
<ul>
<li>Eles têm preço menor, mas têm suporte técnico pós-venda? (diferencial competitivo real da sua loja pode ser o atendimento consultivo, não só preço).</li>
<li>Eles têm estoque de linha de entrada mas não têm linha intermediária/gamer? (nicho a explorar).</li>
<li>Eles vendem produto sem explicar compatibilidade (venda "seca")? (seu diferencial: venda consultiva evita devolução e aumenta confiança/recompra).</li>
</ul>

<h2>10.6 — Recomendação de Novos Produtos: Framework de Justificativa</h2>
<p>Toda sugestão de novo produto para a loja deve vir acompanhada de:</p>
<ol>
<li>Demanda observada (pergunta recorrente de cliente, tendência de mercado).</li>
<li>Margem estimada vs concorrência.</li>
<li>Complexidade de suporte pós-venda (produto muito técnico pode gerar mais chamado de suporte que lucro, se a equipe não estiver preparada).</li>
<li>Giro esperado (produto de nicho muito específico pode empatar capital parado).</li>
</ol>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> você recebe a seguinte lista simplificada de catálogo (exemplo para exercício): Notebooks entrada/intermediário, GPUs RTX série 40, SSDs NVMe Gen3/Gen4, roteadores Wi-Fi 5, sem produtos de smart home, sem monitores acima de 144Hz.</p>
<p><strong>Análise comercial esperada (exercício — pratique fazendo esta análise você mesmo com catálogo real da sua loja):</strong></p>
<ol>
<li>Lacuna: roteadores Wi-Fi 6/6E ausentes — mercado já demanda, oportunidade de expansão.</li>
<li>Lacuna: sem smart home — categoria em crescimento, ticket médio baixo mas alto volume potencial e ótimo cross-sell com roteadores/câmeras.</li>
<li>Cross-sell natural: quem compra RTX série 40 (GPU forte) provavelmente precisa de monitor com taxa de atualização mais alta — mas catálogo não tem acima de 144Hz, perdendo upsell relevante para esse público.</li>
<li>Sugestão de expansão priorizada: 1º Wi-Fi 6 (menor risco, alta demanda comprovada), 2º monitores 165Hz+, 3º linha básica de smart home como teste de mercado.</li>
</ol>

<h2>Simulação de Atendimento (aplicação comercial)</h2>
<p><strong>Cliente:</strong> "Vou levar só o computador, não preciso de mais nada."</p>
<p><strong>Resposta consultiva (cross-sell sem pressão):</strong> "Perfeito. Só uma observação rápida: esse modelo não vem com mouse/teclado — o senhor já tem em casa ou quer que eu inclua um kit básico? E se for usar bastante, um nobreak simples evita perda de trabalho em queda de energia, é um investimento pequeno perto do que protege." (Oferece, não insiste — decisão fica com o cliente, mas a oportunidade foi apresentada com justificativa real.)
      ', 0, true, NULL, 40),
('312a1b78-16de-459b-995d-8a519b162158', NULL, 'dafb340c-1dae-4378-b1c5-a0ead2716b88', 'Mercado de Ciudad del Este', 'texto', NULL, '
<h2>11.1 — Perfil dos Consumidores Locais</h2>
<p>Ciudad del Este é um dos maiores polos de importação/comércio de eletrônicos da América do Sul, com fluxo intenso de compradores transfronteiriços (Brasil, Argentina) além do público paraguaio local.</p>

<h2>11.2 — Compradores Brasileiros</h2>
<p><strong>Perfil:</strong> atravessam a fronteira (Foz do Iguaçu/Ponte da Amizade) buscando preço mais competitivo que o Brasil, frequentemente por causa da carga tributária brasileira sobre eletrônicos.</p>
<p><strong>Comportamento de compra:</strong></p>
<ul>
<li>Forte sensibilidade a "vale a pena trazer x não vale" — comparam mentalmente com preço de loja/e-commerce brasileiro.</li>
<li>Preocupação recorrente com <strong>cota de importação e nota fiscal/declaração na alfândega</strong> — cliente frequentemente pergunta sobre limites de valor para não ter problema na volta.</li>
<li>Produtos mais procurados: celulares, notebooks, câmeras, drones, componentes de PC (por diferença de preço proporcionalmente maior), perfumaria/eletrônicos de consumo em geral.</li>
<li>Sazonalidade forte: fim de ano (compras de Natal/Ano Novo), férias escolares, Black Friday (comparação de preço cross-border).</li>
</ul>
<p><strong>Diferencial competitivo pra esse público:</strong> garantia clara e em português, orientação sobre nota fiscal para travessia, produto com voltagem/plug compatível com o Brasil (110V/220V bivolt já resolve a maior parte).</p>

<h2>11.3 — Compradores Paraguaios</h2>
<p><strong>Perfil:</strong> cliente local recorrente, relação de longo prazo possível (diferente do turista de passagem), maior sensibilidade a parcelamento e crédito local.</p>
<p><strong>Comportamento:</strong> valoriza relacionamento e confiança construída ao longo do tempo, mais aberto a orientação técnica consultiva contínua (retorna para upgrades, manutenção).</p>

<h2>11.4 — Compradores Argentinos</h2>
<p><strong>Perfil:</strong> similar ao brasileiro em termos de arbitragem cambial, mas com sensibilidade cambial ainda mais acentuada historicamente (variação forte do câmbio local incentiva compra em dólar/guarani na fronteira).</p>
<p><strong>Comportamento:</strong> forte foco em produtos com boa reserva de valor (eletrônicos de marca reconhecida), compra em maior volume quando o câmbio favorece.</p>

<h2>11.5 — Empresas</h2>
<p><strong>Perfil:</strong> demanda por equipamento de rede, servidores, pontos de venda (PDV), câmeras de segurança, em volume — decisão de compra mais racional/orçamentária, menos emocional.</p>
<p><strong>Diferencial de venda:</strong> nota fiscal adequada para contabilidade da empresa, suporte pós-venda ágil (empresa não pode ficar parada), possibilidade de contrato de manutenção recorrente.</p>

<h2>11.6 — Técnicos</h2>
<p><strong>Perfil:</strong> compram componentes avulsos para revenda de serviço (montagem, manutenção) ou para clientes próprios — conhecem preço de mercado, menos sensível a discurso de venda, mais a preço e disponibilidade.</p>
<p><strong>Diferencial de venda:</strong> preço diferenciado por volume/recorrência, disponibilidade de estoque confiável (técnico não pode prometer prazo ao cliente dele e a peça não chegar).</p>

<h2>11.7 — Gamers</h2>
<p><strong>Perfil:</strong> pesquisa técnica extensa antes de comprar, compara benchmarks e preços entre lojas/países, decisão emocional (desejo por peça específica) combinada com racional (relação custo-benefício estudada).</p>
<p><strong>Diferencial de venda:</strong> conhecimento técnico profundo do vendedor gera confiança imediata — esse público percebe rapidamente se o vendedor "decora specs" ou entende de verdade.</p>

<h2>11.8 — Revendedores</h2>
<p><strong>Perfil:</strong> compra em volume para revender em outra praça (interior do Brasil, Argentina, Paraguai), forte foco em margem e preço por atacado.</p>
<p><strong>Diferencial de venda:</strong> condição comercial diferenciada por volume, agilidade logística, confiabilidade de estoque e prazo.</p>

<h2>11.9 — Comportamento de Compra: Padrões Regionais</h2>
<p>Turistas de curto prazo decidem rápido, mas pesquisam preço no celular durante o atendimento (comparação em tempo real) — vendedor precisa justificar valor além do preço puro (garantia, suporte, autenticidade do produto).</p>
<p>Clientes recorrentes (paraguaios locais e revendedores) valorizam relação de confiança de longo prazo mais que desconto pontual.</p>

<h2>11.10 — Sazonalidade</h2>
<table>
<tr><th>Período</th><th>Padrão de demanda</th></tr>
<tr><td>Novembro-Dezembro</td><td>Pico de vendas (Natal, fim de ano, férias)</td></tr>
<tr><td>Janeiro-Fevereiro</td><td>Volta às aulas — notebooks, acessórios de estudo</td></tr>
<tr><td>Junho-Julho</td><td>Férias de meio de ano, viagens turísticas</td></tr>
<tr><td>Datas de câmbio favorável</td><td>Picos não sazonais de compradores argentinos/brasileiros aproveitando cotação</td></tr>
</table>

<h2>11.11 — Principais Dúvidas dos Compradores</h2>
<ul>
<li>"Isso é original?" (preocupação com falsificação, recorrente na região).</li>
<li>"Tem garantia e funciona no meu país?" (voltagem, plugue, assistência técnica).</li>
<li>"Qual o limite de valor pra não ter problema na alfândega?" (você pode orientar de forma geral, mas sempre recomendar checagem da regra vigente, que muda com frequência).</li>
<li>"Por que aqui é mais barato que no meu país?" — explicação honesta: carga tributária de importação diferente, câmbio, volume de compra da região como polo comercial.</li>
</ul>

<h2>11.12 — Tendências Regionais</h2>
<ul>
<li>Crescimento de pagamento digital/cartão internacional além de dinheiro físico.</li>
<li>Aumento de pesquisa prévia via redes sociais/marketplace antes de ir à loja física — cliente chega já sabendo o que quer, papel do vendedor migra de "informar" para "validar e refinar a escolha".</li>
<li>Concorrência forte em preço entre lojas da região — diferenciação real vem de garantia, suporte e autenticidade comprovada.</li>
</ul>

<h2>11.13 — Diferenciais Competitivos das Lojas da Região</h2>
<ul>
<li>Garantia documentada e de fácil acionamento.</li>
<li>Nota fiscal/comprovante adequado para travessia de fronteira.</li>
<li>Produto testado na frente do cliente antes da saída da loja.</li>
<li>Atendimento consultivo (o diferencial que este treinamento constrói em você) frente a vendedores que só "empurram o que tem em estoque".</li>
</ul>

<h2>Laboratório Virtual</h2>
<p><strong>Cenário:</strong> turista brasileiro quer comprar notebook, pergunta se "vale a pena" trazer pro Brasil e se vai ter problema na alfândega.</p>
<p><strong>Abordagem consultiva:</strong></p>
<ol>
<li>Explicar de forma clara e honesta a diferença de preço esperada (sem prometer economia exagerada).</li>
<li>Orientar sobre a necessidade de nota fiscal/documento de compra para eventual declaração — recomendar que confirme a regra atualizada de cota, já que ela muda.</li>
<li>Confirmar bivolt/voltagem compatível com uso no Brasil.</li>
<li>Reforçar garantia e como acioná-la mesmo estando em outro país (contato, prazo, condição).</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente (argentino):</strong> "Esse preço em dólar hoje compensa ou espero o câmbio melhorar?"</p>
<p><strong>Resposta consultiva:</strong> "Isso depende da previsão de câmbio, que eu não posso garantir — mas posso te dizer que esse modelo específico está com bom preço frente ao que costuma praticar aqui, e o estoque desse produto não é garantido pra próxima semana. Se o câmbio for decisivo pra sua decisão, recomendo considerar o custo de oportunidade de esperar versus o risco de o produto não estar mais disponível nesse preço."</p>
      ', 0, true, NULL, 40),
('82e857c8-b113-4ca8-be42-6c8410b2bb1a', NULL, '3942235f-260a-44f0-a88c-f4284c3c01cd', 'Atendimento Técnico Consultivo', 'texto', NULL, '
<h2>Metodologia Geral</h2>
<p>Todo atendimento técnico consultivo segue a mesma lógica, independente do produto: <strong>Perguntar → Diagnosticar necessidade real → Montar solução completa → Justificar tecnicamente.</strong></p>
<p>O erro mais comum é pular direto para a recomendação sem entender o uso real do cliente. As perguntas certas evitam venda errada, troca posterior e cliente insatisfeito.</p>

<h2>12.1 — "Meu computador está lento."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Há quanto tempo está assim? Piorou de repente ou é gradual?</li>
<li>Que tipo de uso faz (navegação, jogos, trabalho pesado)?</li>
<li>É HDD ou já tem SSD?</li>
<li>Quanto de RAM tem hoje?</li>
</ul>
<p><strong>Necessidade real:</strong> normalmente HDD antigo e/ou RAM insuficiente — raramente é "precisa de PC novo".</p>
<p><strong>Solução completa:</strong> SSD (troca ou adição) + upgrade de RAM se aplicável + limpeza de itens de inicialização.</p>
<p><strong>Justificativa técnica:</strong> "SSD reduz tempo de resposta de forma brutal comparado a HDD porque não depende de partes mecânicas girando — é a única troca que o senhor vai sentir imediatamente ao ligar o PC."</p>

<h2>12.2 — "Quero montar um PC gamer."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Quais jogos específicos pretende jogar? (define exigência real de GPU/CPU)</li>
<li>Já tem monitor? Qual resolução/taxa de atualização?</li>
<li>Orçamento total disponível?</li>
<li>Vai fazer mais alguma coisa além de jogar (streaming, edição)?</li>
</ul>
<p><strong>Necessidade real:</strong> equilíbrio entre CPU/GPU sem gargalo, evitar superdimensionar componente que o jogo escolhido não aproveita.</p>
<p><strong>Solução completa:</strong> CPU+GPU equilibrados pro jogo/resolução informados, 16GB RAM dual-channel mínimo, SSD NVMe, fonte com margem de segurança, considerar upgrade futuro (placa-mãe com slots livres).</p>
<p><strong>Justificativa técnica:</strong> "Não adianta GPU de ponta se o processador não acompanha — o jogo fica limitado pela CPU e você paga caro por um desempenho que não vai aparecer."</p>

<h2>12.3 — "Preciso de Wi-Fi para uma empresa."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Quantos funcionários/dispositivos simultâneos?</li>
<li>Tamanho e layout do espaço (paredes, andares)?</li>
<li>Precisa separar rede de convidados da rede interna?</li>
<li>Já existe cabeamento de rede no local?</li>
</ul>
<p><strong>Necessidade real:</strong> cobertura + capacidade de lidar com muitos dispositivos + segurança (segmentação).</p>
<p><strong>Solução completa:</strong> 1+ Access Points Wi-Fi 6 (não só "roteador mais forte"), switch com suporte a VLAN, roteador/firewall adequado ao porte.</p>
<p><strong>Justificativa técnica:</strong> "Um roteador único não resolve área grande com paredes — o problema não é ''potência'', é a física do sinal. Múltiplos pontos bem posicionados resolvem melhor que um equipamento único mais caro."</p>

<h2>12.4 — "Qual notebook devo comprar?"</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Uso principal (estudo, trabalho, jogos, edição)?</li>
<li>Precisa de mobilidade constante ou fica quase sempre no mesmo lugar?</li>
<li>Orçamento?</li>
<li>Prazo de uso esperado (2 anos? 5 anos?)</li>
</ul>
<p><strong>Necessidade real:</strong> casar processador/RAM/armazenamento com o uso real, não com "o que está na promoção".</p>
<p><strong>Solução completa:</strong> recomendação específica com justificativa componente por componente.</p>
<p><strong>Justificativa técnica:</strong> "Pro seu uso de [X], o gargalo real seria [componente] se eu recomendasse o modelo mais barato — por isso sugiro esse aqui, que resolve sem pagar por recurso que não vai usar."</p>

<h2>12.5 — "Qual SSD é melhor?"</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>É pra sistema (SO) ou armazenamento secundário?</li>
<li>O PC/notebook tem slot M.2 NVMe ou só SATA?</li>
<li>Qual geração de PCIe a placa-mãe suporta?</li>
</ul>
<p><strong>Necessidade real:</strong> compatibilidade física antes de "melhor" em abstrato — SSD mais rápido do mundo não serve se o slot não suporta.</p>
<p><strong>Solução completa:</strong> NVMe compatível com o slot disponível para SO, SATA/HDD para armazenamento em massa se o orçamento for prioridade.</p>
<p><strong>Justificativa técnica:</strong> "O ''melhor'' depende do que sua placa aceita — de nada adianta pagar por PCIe 5.0 numa placa que só tem PCIe 3.0, o desempenho vai ficar limitado ao que o slot permite."</p>

<h2>12.6 — "Esse roteador serve para minha casa?"</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Tamanho da casa, quantos andares/paredes de concreto?</li>
<li>Quantos dispositivos conectados (celulares, TVs, smart home)?</li>
<li>Onde fica a internet que entra (modem) em relação ao resto da casa?</li>
</ul>
<p><strong>Necessidade real:</strong> cobertura real vs specs de caixa — roteador "forte" não resolve física de propagação de sinal em casas grandes.</p>
<p><strong>Solução completa:</strong> roteador único para apartamentos/casas pequenas, sistema mesh para casas grandes/múltiplos andares.</p>
<p><strong>Justificativa técnica:</strong> "Potência de sinal não atravessa parede de concreto por mágica — em casa grande, 2-3 pontos de Wi-Fi distribuídos cobrem melhor que 1 roteador único, por mais caro que seja."</p>

<h2>12.7 — "Quero um computador para edição de vídeo."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Qual software usa (Premiere, DaVinci, CapCut)? Resoluções e formatos trabalhados (4K, RAW)?</li>
<li>Volume de projetos simultâneos?</li>
<li>Orçamento e se já tem algum componente reaproveitável?</li>
</ul>
<p><strong>Necessidade real:</strong> CPU com bons núcleos, GPU com boa VRAM (aceleração de renderização), muita RAM (32GB+ para 4K), armazenamento NVMe rápido (arquivos de vídeo são grandes e a velocidade de leitura/escrita importa).</p>
<p><strong>Solução completa:</strong> CPU 8+ núcleos, GPU com 12GB+ VRAM se envolver renderização por GPU, 32GB RAM, NVMe Gen4 para cache/projeto ativo + HDD grande para arquivo morto.</p>
<p><strong>Justificativa técnica:</strong> "Edição de vídeo é diferente de jogo — aqui múltiplos núcleos e RAM importam muito mais, porque o software processa vários frames/efeitos em paralelo."</p>

<h2>12.8 — "Preciso de um sistema de câmeras."</h2>
<p><strong>Perguntas certas:</strong></p>
<ul>
<li>Quantas câmeras, área interna/externa?</li>
<li>Precisa de visão noturna, detecção de movimento por IA?</li>
<li>Tem cabeamento de rede ou vai ser tudo Wi-Fi?</li>
<li>Quer gravação local (NVR/cartão) ou nuvem?</li>
</ul>
<p><strong>Necessidade real:</strong> cobertura de área + confiabilidade de gravação + segurança de rede (evitar exposição das câmeras à internet sem proteção).</p>
<p><strong>Solução completa:</strong> câmeras PoE (preferencial a Wi-Fi) + switch PoE + NVR dimensionado para quantidade de câmeras e dias de retenção desejados + VLAN separada.</p>
<p><strong>Justificativa técnica:</strong> "Câmera por Wi-Fi puro depende de sinal estável e é mais vulnerável — PoE garante energia e dados por um único cabo, com muito mais estabilidade e segurança."</p>

<h2>Checklist Geral de Atendimento Consultivo</h2>
<ul>
<li>Fiz perguntas antes de recomendar (nunca recomendar sem entender uso real)?</li>
<li>Identifiquei o gargalo/necessidade real, não só o pedido literal do cliente?</li>
<li>Montei solução completa (todos os componentes compatíveis entre si)?</li>
<li>Expliquei o "porquê" técnico de forma simples e verificável?</li>
<li>Ofereci cross-sell relevante sem pressão excessiva?</li>
<li>Fui honesto sobre limitações (não prometi o que o produto não entrega)?</li>
</ul>

<h2>Síntese por Cenário</h2>
<table>
<tr><th>Pedido do cliente</th><th>Necessidade real</th><th>Pergunta-chave</th></tr>
<tr><td>"Computador lento"</td><td>HDD antigo / RAM insuficiente</td><td>Já tem SSD? Quanto de RAM?</td></tr>
<tr><td>"PC gamer"</td><td>Equilíbrio CPU/GPU sem gargalo</td><td>Quais jogos e monitor?</td></tr>
<tr><td>"Wi-Fi empresa"</td><td>Cobertura + segmentação</td><td>Quantos dispositivos e paredes?</td></tr>
<tr><td>"Qual notebook"</td><td>Casar specs com uso real</td><td>Uso principal e prazo de uso?</td></tr>
<tr><td>"Qual SSD"</td><td>Compatibilidade de slot</td><td>M.2 NVMe ou SATA?</td></tr>
<tr><td>"Roteador para casa"</td><td>Física de propagação de sinal</td><td>Tamanho e andares da casa?</td></tr>
<tr><td>"PC para edição"</td><td>Núcleos + RAM + VRAM</td><td>Qual software e resolução?</td></tr>
<tr><td>"Sistema de câmeras"</td><td>Estabilidade + segurança de rede</td><td>Cabeamento disponível?</td></tr>
</table>

<h2>Simulação de Atendimento (síntese do módulo)</h2>
<p><strong>Cliente:</strong> "Quero um PC bom, pode ser o que vocês tiverem de melhor custo-benefício."</p>
<p><strong>Resposta consultiva:</strong> "Custo-benefício depende do que o senhor vai fazer com ele — o melhor custo-benefício pra jogos é diferente do melhor custo-benefício pra edição de vídeo ou uso de escritório. Me conta o uso principal que eu monto exatamente o que entrega o melhor resultado pro seu caso, sem pagar por recurso que não vai usar nem faltar no que realmente importa."</p>
      ', 0, true, NULL, 45),
('3886b94c-0076-4173-bafd-82fc17e3e259', NULL, '995dfa85-9502-4df7-982d-1ea919babe1f', 'Tendências Tecnológicas', 'texto', NULL, '
<h2>13.1 — Inteligência Artificial</h2>
<p><strong>Impacto no mercado de TI de varejo:</strong> NPUs (Neural Processing Units) embarcadas em CPUs modernas (Intel Core Ultra, AMD Ryzen AI, Snapdragon X) rodam IA localmente (Copilot+ PC) — novo argumento de venda: "processamento de IA sem depender da nuvem", relevante para privacidade e velocidade.</p>
<p><strong>Produtos que ganham relevância:</strong> notebooks com NPU dedicada, GPUs com mais VRAM (rodar modelos de IA localmente), armazenamento rápido (datasets/modelos grandes).</p>

<h2>13.2 — Computação em Nuvem</h2>
<p><strong>Relevância comercial:</strong> reduz necessidade de hardware local potente para certas tarefas (processamento pesado na nuvem), mas aumenta dependência de internet estável e rápida — reforça venda de upgrade de rede (Módulos 4 e 5) como pré-requisito.</p>

<h2>13.3 — Edge Computing</h2>
<p>Processamento de dados próximo à origem (câmeras com IA embarcada analisando vídeo localmente, sensores IoT processando antes de enviar à nuvem) — reduz latência e tráfego de rede.</p>
<p><strong>Produto que se beneficia:</strong> câmeras IP com IA embarcada (detecção de pessoa/veículo sem depender de servidor externo), mini PCs como gateway de edge em ambientes industriais/comerciais.</p>

<h2>13.4 — Wi-Fi 7</h2>
<p>Já detalhado tecnicamente no Módulo 4 — maior velocidade, menor latência, MLO (Multi-Link Operation, usa múltiplas bandas simultaneamente). Tendência: adoção começa por gamers/entusiastas e cresce para uso geral em 2-3 anos, como toda geração Wi-Fi anterior.</p>

<h2>13.5 — PCIe 5.0 e Futuras Gerações</h2>
<p>Dobra de banda a cada geração — hoje relevante principalmente para SSDs NVMe topo de linha e GPUs de próxima geração. Antecipar demanda: placas-mãe novas já vêm com PCIe 5.0, mas o "gargalo" de aproveitamento pleno ainda está mais no software/uso do que na maioria dos usuários domésticos.</p>

<h2>13.6 — DDR5 e Evolução das Memórias</h2>
<p>DDR5 já é padrão em plataformas novas (Intel LGA1700 em diante, AMD AM5) — maior banda, mas também maior latência bruta compensada por clocks mais altos. Tendência: DDR4 continuará em oferta para upgrades de plataformas existentes (AM4) por ainda alguns anos, boa opção de custo-benefício.</p>

<h2>13.7 — USB4 e Thunderbolt</h2>
<p>Unificação de padrões — USB4 baseado em especificação Thunderbolt 3, oferecendo até 40Gbps, suporte a múltiplos monitores e carregamento de alta potência por uma única porta. Tendência: notebooks premium migrando para "1 porta faz tudo" (dados, vídeo, energia).</p>
<p><strong>Argumento de venda:</strong> hub USB4/Thunderbolt de qualidade vira acessório essencial para notebooks modernos com poucas portas físicas.</p>

<h2>13.8 — Armazenamento de Alta Velocidade</h2>
<p>SSDs NVMe Gen5 já ultrapassam 10GB/s — relevante para workstations, criadores de conteúdo com arquivos 8K, IA local. Tendência de queda de preço por GB torna SSD grande e rápido cada vez mais acessível ao público geral, reduzindo espaço de mercado do HDD (que resta para armazenamento em massa/backup barato).</p>

<h2>13.9 — Redes 10G e Superiores</h2>
<p>Switches e placas de rede 2.5G/5G/10G caindo de preço, deixando de ser exclusividade de data center. Tendência: SSDs NVMe rápidos e internet de fibra de alta velocidade tornam a rede interna de 1Gbps o novo gargalo em ambientes avançados — oportunidade de upsell para entusiastas/pequenas empresas com fibra de alta velocidade contratada.</p>

<h2>13.10 — Casas Inteligentes e IoT</h2>
<p>Crescimento sustentado de adoção — padrão Matter unificando fabricantes (Google, Amazon, Apple, Samsung compatíveis entre si), reduzindo fricção de compra que existia antes (medo de "comprar produto que só funciona com 1 marca").</p>
<p><strong>Oportunidade comercial:</strong> catálogo de entrada em smart home (tomadas, lâmpadas, sensores) tem baixo ticket mas alta recorrência e ótimo cross-sell com redes/roteadores.</p>

<h2>13.11 — Automação Residencial</h2>
<p>Evolução natural do IoT — hubs centralizados, automações (rotinas) que combinam múltiplos dispositivos. Tendência: interesse crescente por privacidade/processamento local (hub que funciona sem depender 100% da nuvem do fabricante).</p>

<h2>13.12 — Realidade Virtual e Aumentada</h2>
<p>Mercado de headsets VR/AR (Meta Quest, Apple Vision Pro, PICO) ainda de nicho no varejo geral, mas em crescimento — relevante para gaming avançado, treinamento corporativo, simulação. Ainda exige PC/hardware forte para VR PC-based (não standalone).</p>

<h2>13.13 — Computação Quântica (visão geral)</h2>
<p>Ainda não é produto de varejo — relevante apenas como conhecimento de contexto para conversas com clientes técnicos/curiosos. Aplicações reais hoje restritas a pesquisa, criptografia avançada, otimização complexa em grandes empresas/institutos — não gera oportunidade comercial direta na loja, mas demonstra atualização do vendedor perante cliente técnico que perguntar.</p>

<h2>Como Essas Tendências Impactam o Mercado — Síntese</h2>
<table>
<tr><th>Tendência</th><th>Produto que ganha relevância</th><th>Horizonte de adoção no varejo</th></tr>
<tr><td>IA local (NPU)</td><td>Notebooks Copilot+ PC, GPUs com mais VRAM</td><td>Já em curso</td></tr>
<tr><td>Wi-Fi 7</td><td>Roteadores/APs topo de linha</td><td>2-4 anos para virar padrão geral</td></tr>
<tr><td>DDR5</td><td>Plataformas novas Intel/AMD</td><td>Já é padrão em lançamentos</td></tr>
<tr><td>USB4/Thunderbolt</td><td>Hubs, docks, notebooks premium</td><td>Já em curso, crescendo</td></tr>
<tr><td>Redes 10G</td><td>Switches/placas de rede acessíveis</td><td>Início de popularização</td></tr>
<tr><td>Matter/Smart Home</td><td>Dispositivos multimarca</td><td>Já em curso, crescimento acelerado</td></tr>
<tr><td>VR/AR</td><td>Headsets, PCs de alto desempenho</td><td>Nicho, crescimento gradual</td></tr>
</table>

<h2>Laboratório Virtual 13</h2>
<p><strong>Cenário:</strong> você precisa sugerir à gerência da loja 3 categorias de produto para reforçar estoque nos próximos 6 meses, baseado em tendência real, não achismo.</p>
<p><strong>Análise esperada (exercício prático — pratique com dados reais da sua loja):</strong></p>
<ol>
<li>Roteadores/APs Wi-Fi 6E ou 7 de entrada — demanda crescente, ainda pouco explorada por concorrência local.</li>
<li>SSDs NVMe Gen4 em capacidades maiores (1TB+) — queda de preço torna viável para público geral, substituindo SATA como padrão.</li>
<li>Linha de entrada smart home compatível com Matter — baixo risco de capital parado (ticket baixo), alta recorrência, ótimo cross-sell com redes.</li>
</ol>

<h2>Simulação de Atendimento</h2>
<p><strong>Cliente técnico:</strong> "Vale a pena esperar o Wi-Fi 7 ou já levo um roteador Wi-Fi 6 agora?"</p>
<p><strong>Resposta consultiva:</strong> "Depende dos seus dispositivos — hoje a maioria dos celulares e notebooks no mercado ainda nem suporta Wi-Fi 7, então o ganho real seria zero até você trocar todos os aparelhos também. Wi-Fi 6 já resolve muito bem a demanda atual e tem ótimo custo-benefício agora. Se seu plano é usar por mais 4-5 anos e já pretende renovar os aparelhos também nesse período, aí sim Wi-Fi 7 pode valer o investimento antecipado."</p>
      ', 0, true, NULL, 40);

insert into public.provas
  (id, tenant_id, modulo_id, titulo, nota_minima)
values
('85a93aea-aa1f-451e-8f06-a6b4ca172e4f', NULL, '7b618904-654b-4595-9a37-f77e369f12b5', 'Prova: Fundamentos da Computação', 70),
('241717da-9693-4319-af6d-39a71138ace4', NULL, '78577e38-5e13-4d1a-99a4-d070138a1143', 'Prova: Hardware', 70),
('72ee70c4-cf63-4d84-b643-eefb153c4f7d', NULL, '1bc6252a-74cf-45cf-ba30-f1e804cdc898', 'Prova: Montagem e Upgrade', 70),
('a4a5e731-ae20-4a68-9b46-6c959ab9e4fe', NULL, 'e38e0290-d85f-4058-9387-9710c40b2da8', 'Prova: Redes de Computadores', 70),
('47819546-b916-4ac1-adc4-e17ad0431e4c', NULL, '5cb5ba63-cb00-46c6-8a1a-cf643d2aa6fe', 'Prova: Equipamentos de Rede', 70),
('0614a583-f1d5-4ea7-8b76-7d590ccb2247', NULL, '152d42f9-6449-47ff-a2ac-b9c24b463d3d', 'Prova: Sistemas Operacionais', 70),
('80553150-7586-4af6-9923-8f5606a342da', NULL, '1f6ea72d-8f26-4a34-958f-56650f1285b9', 'Prova: Segurança da Informação', 70),
('71526b6d-922e-4ea5-b9c4-e17bf02091c2', NULL, '17f48cb1-0418-4682-882e-b2a07445d356', 'Prova: Diagnóstico e Solução de Problemas', 70),
('b8408218-9f94-4add-a79e-c074a6cebbe5', NULL, 'eb65b34b-704a-4a1b-b132-62718d40ea85', 'Prova: Produtos Tecnológicos', 70),
('f12d8e5b-3ac9-45a9-8824-a0427d4393ad', NULL, '5f897c60-ddb1-4fdf-9b77-fd5fa2830401', 'Prova: Inteligência Comercial', 70),
('c2d379d0-d63d-461b-a00c-28b6a564a6a6', NULL, 'dafb340c-1dae-4378-b1c5-a0ead2716b88', 'Prova: Mercado de Ciudad del Este', 70),
('8cb51908-6acb-4f5d-a728-858e31c580fa', NULL, '3942235f-260a-44f0-a88c-f4284c3c01cd', 'Prova: Atendimento Técnico Consultivo', 70),
('d3d629d9-69ca-4914-8227-6bfde21f6493', NULL, '995dfa85-9502-4df7-982d-1ea919babe1f', 'Prova: Tendências Tecnológicas', 70);

insert into public.questoes_prova
  (id, tenant_id, prova_id, pergunta, opcoes, indice_correta, explicacao)
values
('d6fa6564-1d86-4892-ab5d-23a5c4d76106', NULL, '85a93aea-aa1f-451e-8f06-a6b4ca172e4f', 'Um cliente diz "preciso de um processador com mais GHz possível para o PC ser rápido". Qual a resposta tecnicamente correta?', '["GHz é o único fator que determina velocidade, então a busca está certa","Desempenho depende de arquitetura, núcleos, cache e IPC — clock isolado não compara nem entre CPUs de marcas diferentes","GHz só importa em notebooks, não em desktops","Quanto menor o GHz, melhor, pois gera menos calor"]'::jsonb, 1, 'Desde a era multi-core (2006+), comparar apenas GHz é enganoso — dois processadores com o mesmo clock podem ter desempenho bem diferente por causa de arquitetura, IPC e cache.'),
('55d08160-d12f-429f-b169-6ac853a73725', NULL, '85a93aea-aa1f-451e-8f06-a6b4ca172e4f', 'Qual é a sequência correta do ciclo de instrução executado pela CPU?', '["Store, Execute, Decode, Fetch","Fetch, Decode, Execute, Store","Decode, Fetch, Store, Execute","Execute, Fetch, Store, Decode"]'::jsonb, 1, 'O ciclo segue Fetch (busca a instrução) → Decode (interpreta) → Execute (executa na ULA) → Store (grava o resultado).'),
('fc844853-18a9-4e16-95a9-4c9ceed226ec', NULL, '85a93aea-aa1f-451e-8f06-a6b4ca172e4f', 'Por que um plano de internet de "300 Mega" não entrega 300 MB/s de download?', '["Porque o provedor sempre entrega menos do que o contratado","Porque \"Mega\" nesse contexto é megabit, e download é medido em megabyte — 300 Mbps equivale a ~37.5 MB/s","Porque o roteador do cliente limita a velocidade real pela metade","Porque GB e GiB são a mesma coisa e isso já reduz a velocidade"]'::jsonb, 1, 'Velocidade de internet é anunciada em megabits por segundo (Mb), enquanto downloads são medidos em megabytes por segundo (MB) — 1 byte = 8 bits, então 300 Mbps ≈ 37.5 MB/s.'),
('dc41c6b0-ade0-4147-b8e5-d8f5136c9683', NULL, '85a93aea-aa1f-451e-8f06-a6b4ca172e4f', 'Um notebook precisa instalar Windows 11, mas está configurado em modo BIOS legado. Qual é o principal ponto de atenção antes de prometer o upgrade ao cliente?', '["Nenhum — Windows 11 funciona em qualquer modo de boot","Verificar se a placa suporta conversão para UEFI, Secure Boot e TPM 2.0, pois são exigências do Windows 11","Apenas trocar o HD por SSD resolve o problema automaticamente","Basta atualizar o Windows sem mexer na BIOS"]'::jsonb, 1, 'Windows 11 exige UEFI, Secure Boot e TPM 2.0. Isso deve ser diagnosticado antes de qualquer promessa, pois nem todo hardware antigo permite essa conversão.'),
('512482d4-7f5b-46ea-b64c-043a40af6837', NULL, '85a93aea-aa1f-451e-8f06-a6b4ca172e4f', 'Um cliente reclama que o PC "trava com muitas abas abertas e vários programas rodando". Qual é a causa mais provável e por quê?', '["CPU fraca — o processador não consegue processar tantos programas","RAM insuficiente — o sistema recorre ao swap em disco, que é muito mais lento que a memória RAM","SSD com pouca capacidade de armazenamento","Placa de vídeo integrada mal configurada"]'::jsonb, 1, 'Quando a RAM se esgota, o sistema operacional usa o disco como memória virtual (swap), que é ordens de magnitude mais lento — sintoma clássico de RAM insuficiente, não de CPU fraca.'),
('01c778dc-1d77-4bc3-bd22-7e9e4f4db97a', NULL, '241717da-9693-4319-af6d-39a71138ace4', 'Por que vender um SSD NVMe PCIe 5.0 para uma placa-mãe que só possui slot PCIe 3.0 é um erro de venda?', '["Porque SSD NVMe não funciona fisicamente em slots PCIe 3.0","Porque o cliente pagaria por uma velocidade que a placa não é capaz de entregar — o SSD roda limitado à geração do slot","Porque PCIe 5.0 exige processador AMD obrigatoriamente","Porque SSDs NVMe mais rápidos sempre têm menor durabilidade"]'::jsonb, 1, 'O SSD NVMe é compatível fisicamente com slots de gerações anteriores, mas roda limitado à velocidade da geração PCIe suportada pela placa — pagar por PCIe 5.0 numa placa 3.0 é desperdício de dinheiro.'),
('2f9e1ab9-9a06-46d5-bdd0-470f4f0560f8', NULL, '241717da-9693-4319-af6d-39a71138ace4', 'Qual o motivo principal para nunca vender uma fonte de alimentação genérica e sem certificação para acompanhar uma GPU de alto consumo?', '["Fontes sem certificação são sempre mais baratas e isso é vantagem para o cliente","Existe risco real de queima de componentes por fornecimento de energia inadequado ou instável","Fontes sem certificação não têm conector PCIe para a GPU","O certificado 80 Plus é apenas uma etiqueta de marketing, sem efeito real"]'::jsonb, 1, 'Fontes genéricas sem certificação podem fornecer energia instável ou insuficiente, colocando em risco real a integridade da GPU e de outros componentes do sistema.'),
('fa38b28c-8b71-41bb-a1e1-9cf5e00da30c', NULL, '241717da-9693-4319-af6d-39a71138ace4', 'Um cliente quer overclock na CPU. O que é necessário além de uma CPU desbloqueada (ou "K" no caso Intel)?', '["Qualquer placa-mãe serve, overclock é feito apenas por software","Um chipset compatível com overclock, como Z-series (Intel) ou X/B650E+ (AMD)","Apenas uma fonte de alta potência, o chipset não importa","Um gabinete com iluminação RGB para melhor dissipação"]'::jsonb, 1, 'Overclock exige tanto uma CPU desbloqueada quanto um chipset que suporte esse recurso — chipsets mainstream (B760 Intel, B650 AMD não-E) geralmente não liberam esse controle.'),
('0f8c037c-7780-46b5-8453-685a25eae422', NULL, '241717da-9693-4319-af6d-39a71138ace4', 'Por que a compra de RAM em dual-channel (2x8GB) costuma ser preferível a um único módulo (1x16GB) de mesma capacidade total?', '["Dual-channel é sempre mais barato que módulo único","Dois módulos em dual-channel dobram a banda de acesso à memória, com ganho real especialmente em gráficos integrados e notebooks","Um único módulo de 16GB é fisicamente incompatível com a maioria das placas","Dual-channel elimina completamente a necessidade de SSD"]'::jsonb, 1, 'Dual-channel usa dois canais de memória simultaneamente, dobrando a banda disponível — ganho perceptível especialmente em sistemas com GPU integrada, onde a RAM também serve de memória de vídeo.'),
('ef061cc5-96dc-4250-9395-c0c3dd5bdd4c', NULL, '241717da-9693-4319-af6d-39a71138ace4', 'Qual tipo de painel de monitor é geralmente mais indicado para um gamer competitivo que prioriza taxa de atualização alta e resposta rápida acima da qualidade de cor?', '["VA, pelo alto contraste","IPS de 4K, pela fidelidade de cor","TN ou IPS rápido, com foco em 144Hz+ e baixo tempo de resposta","Qualquer painel, desde que tenha G-Sync"]'::jsonb, 2, 'Para jogos competitivos, o critério prioritário é taxa de atualização alta e baixo tempo de resposta — painéis TN ou IPS rápidos em Full HD entregam mais FPS estável do que priorizar resolução ou cor.'),
('01f6a036-0d0d-4e8e-a470-7b5fe03ea3c7', NULL, '72ee70c4-cf63-4d84-b643-eefb153c4f7d', 'Por que esquecer de ativar o perfil XMP/EXPO na BIOS é um erro caro em termos de desempenho entregue ao cliente?', '["Sem XMP/EXPO a RAM não funciona de jeito nenhum","Sem o perfil ativado, a RAM roda numa velocidade conservadora de fábrica, bem abaixo da velocidade anunciada e vendida ao cliente","XMP/EXPO só afeta a temperatura da memória, não a velocidade","É um recurso exclusivo de notebooks, não afeta desktops"]'::jsonb, 1, 'Sem ativar XMP (Intel) ou EXPO (AMD), a memória roda numa frequência padrão conservadora — por exemplo, DDR5-6000 rodando a 4800MT/s — entregando bem menos do que o cliente pagou.'),
('9733e760-f361-45cd-a505-2365e9fea6ff', NULL, '72ee70c4-cf63-4d84-b643-eefb153c4f7d', 'Durante um jogo, o uso de GPU fica em 60% enquanto a CPU está constantemente em 100%. O que isso indica?', '["A GPU está com defeito e precisa ser trocada","Gargalo de CPU — o processador não consegue alimentar a GPU com dados rápido o suficiente, deixando-a ociosa","A fonte de alimentação está subdimensionada","É o comportamento normal e esperado de qualquer sistema"]'::jsonb, 1, 'Quando a CPU está saturada (100%) e a GPU fica abaixo de 90-95% de uso, é sinal de gargalo de CPU — ela não consegue processar rápido o suficiente para manter a GPU ocupada.'),
('39e5a45e-02d5-4377-aaf4-833c3763e46d', NULL, '72ee70c4-cf63-4d84-b643-eefb153c4f7d', 'Por que atualizar a BIOS de uma placa-mãe sem um nobreak é considerado perigoso?', '["Porque consome muita energia da rede elétrica","Porque uma queda de energia durante a gravação do firmware pode corromper a BIOS e inutilizar a placa-mãe (\"brickar\")","Porque isso invalida a garantia automaticamente, independente do resultado","Porque a atualização de BIOS sempre reduz o desempenho do sistema"]'::jsonb, 1, 'A atualização de firmware regrava a memória da BIOS; uma interrupção de energia nesse processo pode corromper o firmware e deixar a placa-mãe inutilizável, por isso o uso de nobreak é obrigatório.'),
('32fb3467-4258-4013-8156-7b10d40c4e60', NULL, '72ee70c4-cf63-4d84-b643-eefb153c4f7d', 'Quais dos itens abaixo são sinais claros de airflow mal planejado num gabinete?', '["Ventoinhas RGB sincronizadas e cabos modulares usados corretamente","Fans todos soprando na mesma direção sem plano de entrada/saída, painel frontal fechado sem malha, e cabos bagunçados bloqueando a passagem de ar","Uso de pressão positiva (mais entrada de ar que saída)","Radiador de water cooler instalado na posição de exaustão traseira"]'::jsonb, 1, 'Airflow mal planejado se manifesta em fans sem direção coordenada de entrada/saída, painéis frontais fechados restringindo entrada de ar, e cabeamento desorganizado bloqueando a passagem do ar — todos aumentam temperatura interna.'),
('c465accb-feb0-4e32-ba95-e7ba15a7cf57', NULL, '72ee70c4-cf63-4d84-b643-eefb153c4f7d', 'Por que o MemTest86 é a ferramenta indicada para validar a RAM após um upgrade de memória, e por que ele roda fora do sistema operacional?', '["Porque testa apenas a velocidade de leitura do SSD, não a RAM","Porque valida a integridade da memória através de padrões de teste exaustivos, e rodar fora do SO evita que o próprio sistema operacional interfira ou mascare erros de memória","Porque precisa de conexão com a internet para funcionar","Porque substitui a necessidade de ativar XMP/EXPO"]'::jsonb, 1, 'MemTest86 roda via boot USB, fora do sistema operacional, para testar a memória de forma isolada e exaustiva — rodando dentro do SO, o próprio sistema ocupa parte da RAM e pode mascarar erros de instabilidade.'),
('3162cfc3-fbb3-48f2-a6dc-b569a9bf1bc7', NULL, 'a4a5e731-ae20-4a68-9b46-6c959ab9e4fe', 'Um cliente diz que "a internet caiu" porque nenhum site abre pelo nome, mas ao testar um IP direto a conexão funciona normalmente. Qual é o diagnóstico mais provável?', '["Problema físico no cabo de rede (camada 1)","Falha no DNS — a tradução de nomes para IP não está funcionando, mesmo com a conexão ativa","O roteador está sem energia","A fonte de alimentação do modem queimou"]'::jsonb, 1, 'Se sites não abrem pelo nome mas funcionam pelo IP direto, o problema está na resolução DNS, não na conectividade em si — trocar o servidor DNS (ex: 8.8.8.8 ou 1.1.1.1) costuma resolver.'),
('86b5c165-4810-481e-8300-8993b8d5629c', NULL, 'a4a5e731-ae20-4a68-9b46-6c959ab9e4fe', 'Qual a diferença prática fundamental entre TCP e UDP, e por que jogos online e chamadas de voz (VoIP) preferem UDP?', '["TCP é mais rápido e por isso é usado em jogos; UDP é mais lento e usado só em e-mail","TCP confirma entrega e reenvia pacotes perdidos (mais confiável, porém mais lento); UDP não confirma entrega, priorizando velocidade — ideal quando um pacote perdido importa menos que a latência","TCP e UDP são idênticos, a escolha é apenas histórica","UDP só funciona em redes locais, nunca pela internet"]'::jsonb, 1, 'TCP prioriza confiabilidade com confirmação e retransmissão, adicionando overhead; UDP prioriza velocidade sem confirmação — por isso jogos e VoIP preferem UDP, onde perder um pacote ocasional é menos prejudicial que atraso.'),
('3b766acc-486d-4e48-8410-4ebe52948cd6', NULL, 'a4a5e731-ae20-4a68-9b46-6c959ab9e4fe', 'Por que uma empresa segmentaria sua rede usando VLANs para separar convidados do setor financeiro?', '["VLAN é obrigatória por lei em qualquer rede empresarial","Para que o tráfego de uma VLAN fique isolado logicamente do tráfego de outra, mesmo compartilhando o mesmo switch físico, aumentando segurança e organização","Porque VLAN aumenta a velocidade da internet contratada automaticamente","Porque sem VLAN é impossível ter mais de um dispositivo conectado ao mesmo switch"]'::jsonb, 1, 'VLANs permitem segmentar logicamente uma rede física em redes separadas — isolando, por exemplo, o tráfego de convidados do tráfego sensível do setor financeiro, mesmo usando os mesmos switches físicos.'),
('827be051-4f47-43b4-904b-7e25687a2d5d', NULL, 'a4a5e731-ae20-4a68-9b46-6c959ab9e4fe', 'Além de "mais velocidade", qual é o ganho real que o Wi-Fi 6 oferece em uma casa ou escritório com muitos dispositivos conectados?', '["Reduz o consumo de energia dos dispositivos para zero","Usa OFDMA para lidar de forma mais eficiente com múltiplos dispositivos simultâneos, evitando degradação da rede quando muitos aparelhos estão conectados ao mesmo tempo","Elimina completamente a necessidade de senha na rede","Substitui a necessidade de cabo de rede em qualquer situação"]'::jsonb, 1, 'O recurso OFDMA do Wi-Fi 6 permite atender múltiplos dispositivos de forma mais eficiente simultaneamente, evitando que a rede degrade quando há muitos aparelhos conectados — esse é o ganho real além da velocidade bruta.'),
('c6ca064e-6381-4b47-bd87-4a6bde48a4ff', NULL, 'a4a5e731-ae20-4a68-9b46-6c959ab9e4fe', 'Por que um cabeamento Cat5e antigo pode ser o gargalo real de uma rede mesmo depois de instalar um switch gigabit novo?', '["Cat5e não consegue fisicamente transportar sinal de rede","Cat5e tem limite de até 1 Gbps — se a rede foi projetada para velocidades maiores (2.5G/10G), o cabo antigo limita a velocidade real independente do switch","Cat5e só funciona com fibra óptica, não com switches","O problema nunca é o cabo, sempre é o roteador"]'::jsonb, 1, 'Cat5e suporta até 1 Gbps — instalar um switch ou placa de rede 2.5G/10G sem atualizar o cabeamento significa que a velocidade real fica limitada pelo cabo antigo, não pelo equipamento novo.'),
('d580cfa2-713e-4898-bd1d-461aa5a2409f', NULL, '47819546-b916-4ac1-adc4-e17ad0431e4c', 'Uma empresa com 30+ dispositivos simultâneos apresenta travamentos de rede. Qual é o erro comum que provavelmente causou isso?', '["Usar um switch gerenciável em vez de não gerenciável","Vender um roteador doméstico simples sem CPU/RAM adequados para a carga de conexões (NAT table)","Instalar um sistema mesh em vez de repetidor","Usar cabo de rede em vez de Wi-Fi"]'::jsonb, 1, 'Roteadores domésticicos simples não têm CPU/RAM suficientes para gerenciar a tabela NAT de muitas conexões simultâneas, causando lentidão e travamentos.'),
('1b314efb-f48e-4b6e-868e-a96c435779c6', NULL, '47819546-b916-4ac1-adc4-e17ad0431e4c', 'Por que câmeras IP deveriam ficar em uma VLAN separada da rede administrativa de uma loja?', '["Porque câmeras IP não suportam VLAN","Para reduzir o consumo de banda apenas","Para isolar o tráfego e proteger a rede interna caso uma câmera vulnerável seja invadida","Porque é obrigatório por lei em todos os países"]'::jsonb, 2, 'Câmeras IP são um vetor comum de invasão; segmentar em VLAN separada impede que um dispositivo comprometido dê acesso ao restante da rede (financeiro, caixa etc).'),
('7b69a491-3031-4c96-81a0-da0c14fee0c2', NULL, '47819546-b916-4ac1-adc4-e17ad0431e4c', 'Qual a diferença técnica principal entre um repetidor de Wi-Fi tradicional e um sistema mesh?', '["Repetidor é mais caro e tecnicamente superior ao mesh","Mesh cria uma única rede contínua com roaming automático; repetidor cria rede separada com penalidade de banda a cada salto","Não há diferença prática entre os dois","Repetidor exige controladora dedicada e mesh não"]'::jsonb, 1, 'O mesh oferece uma rede única com roaming transparente entre nós, enquanto o repetidor tradicional retransmite o sinal com perda de banda a cada salto e pode exigir troca manual de rede.'),
('80760c6d-043c-479d-a7d9-6b24d7c3ca29', NULL, '47819546-b916-4ac1-adc4-e17ad0431e4c', 'A partir de quantos Access Points a gestão via controladora de rede passa a se justificar economicamente?', '["A partir de 1 AP já é obrigatório","Nunca compensa, sempre configurar cada AP individualmente","A partir de aproximadamente 3-4 APs, quando a gestão individual se torna inviável","Somente acima de 50 APs"]'::jsonb, 2, 'Com cerca de 3-4 APs a gestão manual individual já consome tempo demais — a controladora centraliza configuração, segurança e atualização de firmware, economizando manutenção.'),
('b1d53383-5dad-422a-83dd-3423a9a798c1', NULL, '47819546-b916-4ac1-adc4-e17ad0431e4c', 'Qual tipo de nobreak é mais indicado para proteger um servidor crítico em uma empresa?', '["Off-line/Standby, pois é mais barato","Online (dupla conversão), pois filtra continuamente sem qualquer interrupção na comutação","Nenhum nobreak é necessário se o servidor tiver fonte redundante","Line-interactive, pois é o mais rápido do mercado"]'::jsonb, 1, 'O nobreak online (dupla conversão) fornece energia filtrada continuamente, sem o pequeno atraso de comutação dos modelos off-line/standby, essencial para equipamentos críticos como servidores.'),
('c55ec2ff-e7a1-4118-ba86-605afd30de60', NULL, '0614a583-f1d5-4ea7-8b76-7d590ccb2247', 'Por que desfragmentar um SSD é desnecessário e potencialmente prejudicial?', '["Porque SSDs não armazenam arquivos de forma fragmentada e a operação apenas gasta ciclos de escrita desnecessários","Porque SSDs são incompatíveis com o sistema de arquivos NTFS","Porque desfragmentar sempre corrompe os dados em qualquer tipo de disco","Porque só é possível desfragmentar HDDs formatados em FAT32"]'::jsonb, 0, 'SSDs não sofrem com fragmentação da mesma forma que HDDs; desfragmentar gera escrita/leitura desnecessária, consumindo ciclos de vida útil da memória flash. O comando correto para SSD é o TRIM.'),
('0b917059-7e88-4d79-a72e-c571ff05d0be', NULL, '0614a583-f1d5-4ea7-8b76-7d590ccb2247', 'Em qual cenário faz mais sentido comercial recomendar Linux para um cliente leigo?', '["Sempre, independente do hardware ou uso","Nunca, Linux não deve ser recomendado a clientes leigos","Quando o hardware é antigo, não roda Windows 11, e o uso é básico (navegador, vídeo, mensagens)","Somente quando o cliente pede especificamente por causa de jogos AAA"]'::jsonb, 2, 'Hardware antigo com uso básico é o cenário ideal: Linux leve dá sobrevida real ao equipamento sem custo de licença, desde que o cliente não dependa de softwares exclusivos do Windows.'),
('c1ee51e8-90ec-4666-a5d6-b026a7bc0631', NULL, '0614a583-f1d5-4ea7-8b76-7d590ccb2247', 'Qual ferramenta do Windows é essencial para diagnosticar a causa raiz de travamentos e crashes recorrentes?', '["Painel de Controle","Visualizador de Eventos (Event Viewer)","Bloco de Notas","Windows Media Player"]'::jsonb, 1, 'O Visualizador de Eventos registra erros de drivers, serviços e aplicativos, permitindo identificar a causa raiz de crashes e lentidão no boot.'),
('48b7f2d5-e7aa-49ae-b70a-b26762fc19f8', NULL, '0614a583-f1d5-4ea7-8b76-7d590ccb2247', 'Por que é fundamental confirmar um backup antes de resetar um Android ou iPhone?', '["Porque o reset de fábrica apaga permanentemente todos os dados do aparelho","Porque o backup acelera o processo de reset","Não é necessário, o reset de fábrica preserva os dados automaticamente","Porque apenas aparelhos Android perdem dados no reset, iPhones não"]'::jsonb, 0, 'O reset de fábrica apaga todos os dados do dispositivo permanentemente; sem backup confirmado (iCloud, Google, computador), fotos, contatos e arquivos são perdidos definitivamente.'),
('5761a619-dcb1-46db-b3c0-6b28282c7ba7', NULL, '0614a583-f1d5-4ea7-8b76-7d590ccb2247', 'Que limitação honesta deve ser informada ao recomendar Linux para alguém que usa software fiscal brasileiro específico?', '["Que o Linux é mais lento que o Windows em qualquer situação","Que muitos ERPs e softwares fiscais brasileiros só rodam nativamente em Windows, podendo exigir emulação ou não funcionar","Que o Linux não suporta impressoras fiscais em nenhuma hipótese","Que o Linux é pago no Brasil por questões fiscais"]'::jsonb, 1, 'Diversos softwares fiscais e ERPs brasileiros são desenvolvidos exclusivamente para Windows, exigindo o cliente estar ciente dessa limitação antes de migrar para Linux.'),
('670f033c-5f90-434e-bacd-d52bd7f53a10', NULL, '80553150-7586-4af6-9923-8f5606a342da', 'Como funciona corretamente a regra de backup 3-2-1?', '["3 backups por dia, 2 pessoas responsáveis, 1 servidor dedicado","3 cópias dos dados, em 2 mídias diferentes, com 1 cópia fora do local físico","3 tipos de antivírus, 2 firewalls, 1 VPN ativa","3 dias de retenção, 2 versões salvas, 1 nuvem paga"]'::jsonb, 1, 'A regra 3-2-1 estabelece 3 cópias dos dados, armazenadas em 2 tipos de mídia diferentes, com pelo menos 1 cópia fora do local físico original — é a única defesa confiável contra perda definitiva por ransomware ou desastre.'),
('046331d5-56c1-481c-88c7-0676d893216b', NULL, '80553150-7586-4af6-9923-8f5606a342da', 'Por que a autenticação multifator (MFA/2FA) é considerada a medida de segurança com melhor custo-benefício?', '["Porque é a única medida que substitui completamente o uso de senha","Porque tem baixo custo de implementação e alto impacto na redução de acessos indevidos, mesmo com senha vazada","Porque impede qualquer tipo de ataque de phishing automaticamente","Porque é obrigatória por lei em todos os serviços online"]'::jsonb, 1, 'MFA adiciona uma segunda camada (algo que o usuário possui, como app autenticador) que, mesmo com a senha comprometida, impede o acesso indevido — com custo de implementação baixo e alto impacto.'),
('8cd0bcc0-0bbc-40b5-8aa0-b68c30f5e5e6', NULL, '80553150-7586-4af6-9923-8f5606a342da', 'Qual das opções abaixo é um sinal de alerta clássico de phishing que deve ser ensinado a um cliente leigo?', '["O e-mail vir de um domínio oficial conhecido e sem erros de escrita","Mensagem criando urgência excessiva, como ameaça de bloqueio de conta em 24h","O e-mail conter apenas texto, sem links ou anexos","A mensagem ser enviada em horário comercial"]'::jsonb, 1, 'Urgência excessiva é uma tática clássica de phishing para induzir a vítima a agir sem pensar; outros sinais incluem domínio levemente alterado e pedido de dados sensíveis por e-mail.'),
('b3622467-bccc-471a-9f2a-dd2fe0f28c33', NULL, '80553150-7586-4af6-9923-8f5606a342da', 'Por que não é recomendado pagar o resgate exigido em um ataque de ransomware?', '["Porque é ilegal em qualquer circunstância no Brasil","Porque não há garantia de recuperação dos arquivos e o pagamento financia o crime organizado","Porque o pagamento sempre é recusado pelos criminosos","Porque seguros de TI cobrem automaticamente qualquer prejuízo"]'::jsonb, 1, 'Órgãos de segurança recomendam não pagar porque não há garantia de que os dados serão liberados, além de o pagamento incentivar e financiar novos ataques — ainda assim, a decisão final cabe ao cliente.'),
('a4678fe6-d823-4416-8cfb-7dd0fbb50fa3', NULL, '80553150-7586-4af6-9923-8f5606a342da', 'Como a LGPD se conecta à venda de sistemas de câmeras com reconhecimento facial para um cliente empresarial?', '["Não há relação, LGPD trata apenas de dados financeiros","O reconhecimento facial capta dados pessoais/biométricos, o que traz implicações legais de tratamento de dados que vale mencionar ao cliente","A LGPD proíbe totalmente o uso de câmeras em estabelecimentos comerciais","A LGPD se aplica somente a empresas com mais de 500 funcionários"]'::jsonb, 1, 'Sistemas com reconhecimento facial coletam dados biométricos, que são dados pessoais sensíveis sob a LGPD — o vendedor deve alertar o cliente empresarial sobre essa implicação, mesmo sem atuar como advogado.'),
('5b9efe6a-daca-444d-b68c-78b8c1a9174b', NULL, '71526b6d-922e-4ea5-b9c4-e17bf02091c2', 'Por que verificar o "uso de disco em 100%" no Gerenciador de Tarefas é um dos primeiros passos ao diagnosticar um PC lento?', '["Porque indica automaticamente que a RAM precisa ser trocada","Porque aponta para um HDD antigo/fragmentado ou SSD no fim da vida útil, causas muito comuns de lentidão","Porque é sempre sinal de vírus","Porque significa que a placa-mãe está com defeito"]'::jsonb, 1, 'Uso de disco constantemente em 100% é um forte indicativo de HDD antigo/fragmentado ou SSD desgastado, sendo o primeiro ponto a investigar no fluxograma de diagnóstico de lentidão.'),
('c46616e2-7b86-45cc-a638-db91c4cd83d6', NULL, '71526b6d-922e-4ea5-b9c4-e17bf02091c2', 'Qual é o teste crucial para diferenciar rapidamente se um problema é de hardware ou de software?', '["Verificar se o problema persiste ao dar boot em outro sistema operacional (ex: USB live Linux) ou em modo de segurança","Reinstalar o Windows imediatamente sem testes adicionais","Trocar a fonte de alimentação como primeiro passo","Perguntar apenas a idade do computador"]'::jsonb, 0, 'Se o problema persiste em outro sistema operacional ou modo de segurança, tende a ser hardware; se desaparece, é software, driver ou configuração — esse teste isola a causa raiz rapidamente.'),
('06ae92f4-a0c9-40ec-b0ee-e185b7e6ca37', NULL, '71526b6d-922e-4ea5-b9c4-e17bf02091c2', 'Qual ferramenta é usada para diagnosticar problemas intermitentes de memória RAM, como telas azuis aleatórias?', '["CrystalDiskInfo","MemTest86, rodado via boot USB fora do sistema operacional","Disk Cleanup","Windows Update"]'::jsonb, 1, 'MemTest86 roda fora do sistema operacional via boot USB e realiza múltiplas passagens de teste; qualquer erro reportado indica módulo de memória defeituoso ou configuração instável.'),
('318088b6-1ff6-4e86-88a3-64f64e1a145a', NULL, '71526b6d-922e-4ea5-b9c4-e17bf02091c2', 'No fluxograma de triagem para "sem internet", qual é o primeiro ponto de verificação?', '["Se o cabo de rede está com a cor correta","Se outros dispositivos da casa também estão sem internet, para diferenciar problema no roteador/provedor de problema isolado no dispositivo","Se o antivírus está atualizado","Se o Windows está na versão mais recente"]'::jsonb, 1, 'Verificar se outros dispositivos também estão afetados direciona o diagnóstico: se todos estão sem internet, o problema é no roteador/modem/provedor; se é isolado, o foco vai para driver de rede ou configuração do dispositivo específico.'),
('54f050a8-d032-47c3-896e-a02e157c30af', NULL, '71526b6d-922e-4ea5-b9c4-e17bf02091c2', 'Por que um PC pode desligar sozinho especificamente durante jogos, mas funcionar bem no uso leve?', '["Porque jogos sempre corrompem o sistema operacional","Porque jogos pesados elevam a carga térmica e o consumo de energia (picos de GPU), expondo problemas de temperatura ou fonte subdimensionada que não aparecem em uso leve","Porque o antivírus bloqueia jogos automaticamente","Porque jogos exigem obrigatoriamente upgrade de memória RAM"]'::jsonb, 1, 'Jogos pesados aumentam significativamente a carga sobre CPU/GPU, gerando mais calor e picos de consumo de energia — se há problema térmico ou a fonte é subdimensionada, isso só se manifesta sob essa carga alta.'),
('61cb6f53-cb97-4288-b91b-680917e2f307', NULL, 'b8408218-9f94-4add-a79e-c074a6cebbe5', 'Um cliente estudante diz que só usa o notebook para trabalhos de faculdade no Office. Qual a recomendação mais consultiva?', '["Notebook gamer, porque tem mais potência e \"não erra nunca\"","Notebook de entrada ou intermediário, avaliando também durabilidade se o uso for por vários anos","Sempre o modelo mais barato disponível, sem exceção","Workstation móvel, pois tem certificações profissionais"]'::jsonb, 1, 'O uso real deve guiar a recomendação: para Office, entrada ou intermediário atende bem, mas vale considerar durabilidade e RAM upgradável se o uso for de longo prazo.'),
('b895e8d3-cdb2-47d5-94ba-ecc11fdbc5e7', NULL, 'b8408218-9f94-4add-a79e-c074a6cebbe5', 'Qual a principal vantagem comercial de um PC montado sob medida em comparação a um pré-montado de grande varejo?', '["É sempre mais barato em qualquer configuração","Vem com garantia internacional automática","Permite upgrade futuro mais fácil e ajuste exato ao uso do cliente","Não precisa de manutenção nunca"]'::jsonb, 2, 'O PC montado sob medida facilita upgrades futuros e permite adequar cada componente à necessidade real do cliente, diferente de pré-montados fechados de grandes varejistas.'),
('6b6e2a0e-5e52-4492-9d89-b9e7db907cd5', NULL, 'b8408218-9f94-4add-a79e-c074a6cebbe5', 'Por que recomendar câmeras IP com PoE em vez de Wi-Fi puro sempre que possível?', '["PoE é sempre mais barato que Wi-Fi","PoE é mais estável, não depende de sinal e reduz exposição a ataques em redes não segmentadas","Câmeras Wi-Fi não gravam em alta resolução","PoE dispensa qualquer tipo de cabeamento"]'::jsonb, 1, 'PoE oferece maior estabilidade por não depender da força do sinal Wi-Fi, e reduz o risco de a câmera ser um ponto de ataque em redes domésticas sem segmentação adequada.'),
('a3b432d8-18a2-4a3f-8a64-e7e4a99dd745', NULL, 'b8408218-9f94-4add-a79e-c074a6cebbe5', 'Quando faz sentido recomendar um hub dedicado (Zigbee/Matter) para um cliente de smart home?', '["Nunca — Wi-Fi doméstico sempre resolve","Somente se o cliente já tiver mais de 5-10 dispositivos smart home","Apenas para fechaduras inteligentes","Somente em ambientes corporativos, nunca residenciais"]'::jsonb, 1, 'A partir de 5-10 dispositivos smart home, um hub dedicado em Zigbee/Matter evita sobrecarregar o Wi-Fi doméstico e torna a rede mais robusta.'),
('008fefa2-8e9f-45a4-85a8-0625ea7f632a', NULL, 'b8408218-9f94-4add-a79e-c074a6cebbe5', 'Qual risco de mercado deve ser observado especificamente na venda de pendrives e cartões de memória muito baratos?', '["Risco de incompatibilidade com Windows","Produtos falsificados com capacidade de armazenamento fake, comuns em polos de importação","Excesso de velocidade de gravação","Incompatibilidade com câmeras profissionais apenas"]'::jsonb, 1, 'É comum em polos de importação encontrar pendrives e cartões com capacidade "fake" (reportada maior do que a real) vendidos a preço suspeito — vale alertar e desconfiar de ofertas baixas demais.'),
('db788d35-2469-46a8-ab77-4a8fb192c87d', NULL, 'f12d8e5b-3ac9-45a9-8824-a0427d4393ad', 'No framework de análise de catálogo, qual é a diferença central entre "produto âncora" e "produto de margem"?', '["Âncora é sempre mais caro que margem","Âncora traz tráfego/decisão de compra; margem sustenta a lucratividade real, mesmo com ticket menor","Não há diferença prática entre os dois conceitos","Produto de margem só existe em lojas online"]'::jsonb, 1, 'Produtos âncora (ex: notebooks, celulares) atraem o cliente e geram a decisão de compra; produtos de margem (acessórios, cabos) muitas vezes sustentam a lucratividade real da venda.'),
('b89b7902-f6af-4d09-953e-0944ca5e1f96', NULL, 'f12d8e5b-3ac9-45a9-8824-a0427d4393ad', 'Por que a técnica de "ancoragem por durabilidade" costuma funcionar melhor que apenas comparar preço bruto no upsell?', '["Porque ela esconde o preço real do cliente","Porque muda a percepção de \"preço da compra\" para \"custo por ano de uso\", tornando o upgrade mais racional","Porque não depende da opinião do cliente","Porque é a única técnica permitida em vendas consultivas"]'::jsonb, 1, 'Ao comparar quanto tempo cada modelo vai durar, o cliente enxerga o investimento como custo por ano de uso, não apenas o valor total pago — isso costuma justificar melhor a diferença de preço.'),
('e7434283-6bcf-4098-906c-cc6fa70b84ab', NULL, 'f12d8e5b-3ac9-45a9-8824-a0427d4393ad', 'Um cliente compra um roteador. Segundo o mapa de combos naturais, qual cross-sell é mais coerente oferecer?', '["Papel e toner extra","Cabo de rede extra, switch adicional ou repetidor/mesh se a casa for grande","Cartão SD de alta resistência","Licença de Office"]'::jsonb, 1, 'Para roteadores, os cross-sells naturais mapeados são cabo de rede extra, switch adicional e repetidor/mesh quando a residência é grande.'),
('8622472e-bb63-4f6b-8d48-e9410b4be559', NULL, 'f12d8e5b-3ac9-45a9-8824-a0427d4393ad', 'Ao avaliar um concorrente que pratica preços mais baixos, qual pergunta-guia ajuda a identificar o diferencial real da sua loja?', '["Perguntar apenas se o concorrente tem estacionamento","Verificar se o concorrente oferece suporte técnico pós-venda e venda consultiva, ou apenas vende \"seco\"","Comparar somente a cor da fachada da loja concorrente","Ignorar a concorrência completamente"]'::jsonb, 1, 'Preço menor sem suporte pós-venda e sem explicação de compatibilidade (venda "seca") abre espaço para a loja se diferenciar pelo atendimento consultivo, que aumenta confiança e recompra.'),
('b5d6d4ce-f9d6-4c9e-8886-e425bb906d16', NULL, 'f12d8e5b-3ac9-45a9-8824-a0427d4393ad', 'Quais são os 4 critérios do framework de justificativa para recomendar um novo produto ao catálogo?', '["Cor do produto, marca, país de origem e embalagem","Demanda observada, margem estimada vs concorrência, complexidade de suporte pós-venda e giro esperado","Apenas o preço de custo do fornecedor","Popularidade em redes sociais, apenas"]'::jsonb, 1, 'O framework exige justificar a inclusão de um novo produto por demanda observada, margem frente à concorrência, complexidade de suporte pós-venda e giro esperado — evitando capital parado em nicho.'),
('419f7731-9c20-43aa-b098-4ff23038d6b4', NULL, 'c2d379d0-d63d-461b-a00c-28b6a564a6a6', 'Por que o comprador brasileiro em Ciudad del Este costuma se preocupar tanto com nota fiscal e cota de importação?', '["Porque é obrigatório por lei paraguaia ter nota fiscal para qualquer compra","Porque precisa declarar a compra na volta ao Brasil e evitar problemas na alfândega, dado o limite de cota","Porque a nota fiscal define o preço final do produto","Porque sem nota fiscal o produto não tem garantia em nenhum lugar"]'::jsonb, 1, 'O comprador brasileiro atravessa a fronteira e precisa de documentação para declarar a compra na volta, respeitando o limite de cota vigente — daí a preocupação recorrente com nota fiscal e alfândega.'),
('23bde973-b069-4298-8a23-b2b6c6f1435f', NULL, 'c2d379d0-d63d-461b-a00c-28b6a564a6a6', 'Qual a principal diferença de abordagem de venda entre um turista de passagem e um cliente paraguaio recorrente?', '["Não há diferença, a abordagem deve ser idêntica sempre","Com o turista o foco é justificar valor além do preço (garantia, suporte, autenticidade); com o recorrente, construir relação de confiança de longo prazo","O turista sempre paga mais caro por norma da loja","O cliente recorrente nunca precisa de orientação técnica"]'::jsonb, 1, 'Turistas comparam preço em tempo real e decidem rápido — o vendedor precisa justificar valor além do preço. Já o cliente paraguaio recorrente valoriza relacionamento e confiança construída ao longo do tempo.'),
('5213d52c-d3d6-4f5f-acda-39cbae1785fe', NULL, 'c2d379d0-d63d-461b-a00c-28b6a564a6a6', 'Por que gamers percebem rapidamente se um vendedor tem conhecimento técnico real ou só "decora specs"?', '["Porque gamers nunca fazem pesquisa prévia","Porque esse público pesquisa benchmarks e preços extensivamente antes de comprar, tornando respostas superficiais fáceis de identificar","Porque gamers só compram por impulso, sem análise","Porque loja nenhuma vende para gamers nessa região"]'::jsonb, 1, 'Gamers costumam pesquisar benchmarks e comparar preços entre lojas e países antes de decidir — por isso identificam rápido quando o vendedor não tem domínio técnico real.'),
('462a86fc-3390-49ce-94e5-0db040f53e38', NULL, 'c2d379d0-d63d-461b-a00c-28b6a564a6a6', 'Segundo os diferenciais competitivos das lojas da região, o que pode diferenciar uma loja além do preço?', '["Apenas ter o menor preço do mercado","Garantia documentada, nota fiscal adequada, produto testado na frente do cliente e atendimento consultivo","Ter a maior quantidade de produtos em estoque, sem critério","Vender exclusivamente para revendedores"]'::jsonb, 1, 'Com concorrência forte em preço na região, os diferenciais reais vêm de garantia documentada, nota fiscal adequada, produto testado antes da saída e atendimento consultivo genuíno.'),
('2467c813-0520-471d-8118-0114dd4cc41f', NULL, 'c2d379d0-d63d-461b-a00c-28b6a564a6a6', 'Como a sazonalidade de novembro-dezembro deve influenciar o planejamento de estoque da loja?', '["Não deve influenciar, a demanda é estável o ano todo","A loja deve reduzir estoque nesse período por ser baixa temporada","A loja deve se preparar para pico de vendas (Natal, fim de ano, férias), garantindo estoque e equipe reforçados","Apenas produtos de smart home vendem mais nesse período"]'::jsonb, 2, 'Novembro-dezembro é identificado como pico de vendas na região (Natal, fim de ano, férias), exigindo planejamento antecipado de estoque e equipe para atender a demanda.'),
('935519b1-c446-49be-b5bb-b9fa702cb1c4', NULL, '8cb51908-6acb-4f5d-a728-858e31c580fa', 'Um cliente diz que o computador está lento. Qual é a abordagem correta antes de recomendar qualquer produto?', '["Recomendar imediatamente um PC novo, já que é a solução mais segura","Perguntar há quanto tempo está lento, tipo de uso, se já tem SSD e quanta RAM possui","Oferecer apenas um upgrade de RAM, que resolve a maioria dos casos","Sugerir formatação do sistema como primeira alternativa"]'::jsonb, 1, 'Diagnosticar a necessidade real exige perguntas específicas — normalmente o problema é HDD antigo e/ou RAM insuficiente, raramente é "precisa de PC novo".'),
('6d5a082d-ba82-40e5-bd78-3522f4844a6c', NULL, '8cb51908-6acb-4f5d-a728-858e31c580fa', 'Ao montar um PC gamer, por que perguntar quais jogos específicos o cliente pretende jogar é mais importante do que perguntar só o orçamento?', '["Porque define a exigência real de CPU/GPU, evitando superdimensionar componente que o jogo não aproveita","Porque o orçamento nunca influencia a escolha dos componentes","Porque todos os jogos atuais exigem exatamente a mesma configuração","Porque isso permite vender sempre a GPU mais cara disponível"]'::jsonb, 0, 'Sem saber os jogos, corre-se o risco de desequilibrar CPU e GPU — uma GPU de ponta não entrega desempenho se a CPU for o gargalo.'),
('bf8b218d-d242-4f4d-a336-bbf88c734667', NULL, '8cb51908-6acb-4f5d-a728-858e31c580fa', 'Por que um roteador único costuma ser insuficiente para Wi-Fi de uma empresa com múltiplas salas e paredes?', '["Porque roteadores empresariais são sempre defeituosos","Porque a cobertura depende da física de propagação do sinal, não apenas da potência do equipamento","Porque roteadores únicos não suportam mais de 5 dispositivos","Porque é obrigatório por lei usar múltiplos access points em empresas"]'::jsonb, 1, 'Paredes e distância atenuam o sinal independente da potência anunciada — múltiplos Access Points bem posicionados resolvem melhor que um equipamento único mais caro.'),
('5fe74e6b-0faa-43fc-94e6-b01cc0291851', NULL, '8cb51908-6acb-4f5d-a728-858e31c580fa', 'Por que a pergunta "é pra sistema (SO) ou armazenamento secundário, e a placa tem slot M.2 NVMe?" é essencial antes de recomendar um SSD?', '["Porque todo SSD funciona em qualquer slot sem restrição","Porque a compatibilidade física com o slot disponível determina se aquele SSD pode ser usado e qual desempenho será realmente entregue","Porque SSDs SATA são sempre superiores aos NVMe","Porque essa pergunta serve apenas para calcular o preço final"]'::jsonb, 1, 'De nada adianta um SSD PCIe 5.0 numa placa que só suporta PCIe 3.0 — o desempenho fica limitado ao que o slot permite.'),
('1a77bd4c-498a-479f-8b4a-b8a49ed93e86', NULL, '8cb51908-6acb-4f5d-a728-858e31c580fa', 'Em um atendimento para sistema de câmeras de segurança, por que recomendar câmeras PoE em vez de câmeras 100% Wi-Fi?', '["Porque câmeras PoE são sempre mais baratas","Porque PoE garante energia e dados por um único cabo, com mais estabilidade e segurança do que depender só de sinal Wi-Fi","Porque câmeras Wi-Fi não gravam vídeo em alta resolução","Porque a legislação proíbe câmeras de segurança via Wi-Fi"]'::jsonb, 1, 'Câmeras via Wi-Fi puro dependem de sinal estável e são mais vulneráveis — PoE oferece maior confiabilidade de energia, dados e segurança de rede.'),
('ca2b9b78-f524-4fe7-9114-b56589504298', NULL, 'd3d629d9-69ca-4914-8227-6bfde21f6493', 'Por que a NPU (Neural Processing Unit) embarcada em notebooks modernos virou um argumento de venda relevante?', '["Porque substitui completamente a necessidade de placa de vídeo em qualquer uso","Porque permite rodar processamento de IA localmente, sem depender da nuvem, com ganhos de privacidade e velocidade","Porque é exigida por lei em todos os notebooks vendidos a partir de 2026","Porque reduz o preço final do notebook"]'::jsonb, 1, 'NPUs em CPUs como Intel Core Ultra, AMD Ryzen AI e Snapdragon X permitem rodar IA localmente (Copilot+ PC), argumento ligado a privacidade e velocidade sem depender de conexão.'),
('ab549c49-039d-4378-a2aa-524161a79268', NULL, 'd3d629d9-69ca-4914-8227-6bfde21f6493', 'Por que switches e placas de rede 2.5G/5G/10G estão deixando de ser exclusividade de data center?', '["Porque pararam de ser fabricados para uso corporativo","Porque caíram de preço, e SSDs NVMe rápidos + fibra de alta velocidade tornaram a rede interna de 1Gbps o novo gargalo","Porque o Wi-Fi 7 tornou toda rede cabeada obsoleta","Porque governos passaram a exigir redes 10G em residências"]'::jsonb, 1, 'Com armazenamento e internet cada vez mais rápidos, a rede interna de 1Gbps virou o gargalo em ambientes avançados, abrindo oportunidade de upsell para entusiastas e pequenas empresas.'),
('261799a1-3336-4741-bbfe-8429ac602682', NULL, 'd3d629d9-69ca-4914-8227-6bfde21f6493', 'Qual o principal impacto do padrão Matter na decisão de compra de dispositivos smart home pelo cliente final?', '["Torna os dispositivos smart home mais baratos automaticamente","Elimina a necessidade de Wi-Fi para dispositivos smart home","Reduz a fricção de compra ao unificar compatibilidade entre fabricantes (Google, Amazon, Apple, Samsung), tirando o medo de comprar produto preso a uma marca só","Obriga o cliente a comprar todos os dispositivos da mesma marca"]'::jsonb, 2, 'Matter unifica fabricantes, reduzindo a fricção de compra que existia pelo medo de "comprar produto que só funciona com 1 marca", abrindo espaço para cross-sell com redes/roteadores.'),
('2e2d8f3b-a371-4f3e-9cdb-66e6669df7a3', NULL, 'd3d629d9-69ca-4914-8227-6bfde21f6493', 'Por que o Wi-Fi 7 ainda não é um argumento de venda forte para o público geral, mas já é relevante para entusiastas/gamers?', '["Porque o Wi-Fi 7 é mais lento que o Wi-Fi 6 para a maioria dos usos","Porque a maioria dos dispositivos do público geral ainda não suporta Wi-Fi 7, então o ganho seria zero sem trocar todos os aparelhos, enquanto entusiastas já têm hardware compatível","Porque o Wi-Fi 7 só funciona com roteadores de uma única marca","Porque o Wi-Fi 7 exige assinatura de internet fibra obrigatoriamente"]'::jsonb, 1, 'Adoção de nova geração de Wi-Fi começa por gamers/entusiastas com hardware compatível e cresce para uso geral em 2-3 anos, conforme os próprios dispositivos dos usuários acompanham o padrão.'),
('95bc93ab-78b2-4956-89ce-e0568e8bfa1b', NULL, 'd3d629d9-69ca-4914-8227-6bfde21f6493', 'Qual das alternativas descreve corretamente o papel da computação quântica no varejo de informática hoje?', '["Já é vendida em lojas de varejo como acessório para PCs domésticos","Substitui os processadores tradicionais em notebooks de entrada","Não gera oportunidade comercial direta na loja, mas é conhecimento de contexto útil para conversas com clientes técnicos, já que aplicações reais estão restritas a pesquisa, criptografia avançada e otimização complexa em grandes empresas","É a tecnologia por trás dos SSDs NVMe Gen5"]'::jsonb, 2, 'Computação quântica ainda não é produto de varejo — suas aplicações reais estão em pesquisa e grandes institutos, mas conhecer o tema demonstra atualização do vendedor perante um cliente técnico.');
