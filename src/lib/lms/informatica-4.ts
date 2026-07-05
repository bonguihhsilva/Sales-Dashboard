import type { LmsTrilha } from './types'

export const informaticaT4: LmsTrilha = {
  id: 'trilha-ti-4',
  slug: 'redes-de-computadores',
  title: 'Redes de Computadores',
  description: 'Modelo OSI, TCP/IP, IPv4/IPv6, DHCP, DNS, NAT, VLAN, VPN, roteamento, cabeamento, fibra óptica, Wi-Fi e PoE aplicados ao diagnóstico e venda consultiva de redes domésticas e empresariais.',
  icon: '🌐',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-4-redes-de-computadores',
      title: 'Redes de Computadores',
      description: 'Modelo OSI, TCP/IP, IPv4/IPv6, DHCP, DNS, NAT, VLAN, VPN, roteamento, cabeamento, fibra óptica, Wi-Fi e PoE aplicados ao diagnóstico e venda consultiva de redes domésticas e empresariais.',
      duration: 45,
      content: `
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
    |     \\
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
<p><strong>Resposta consultiva:</strong> "Antes de eu indicar um roteador mais caro, me conta o tamanho da casa e quantos cômodos/andares? Às vezes o problema não é 'roteador fraco' e sim que uma casa grande precisa de mais de um ponto de Wi-Fi (sistema mesh) em vez de um roteador único mais potente — que não resolve paredes e distância do mesmo jeito. Vou te mostrar as duas opções com preço e explicar qual resolve melhor o seu caso."</p>
      `,
      quiz: [
        {
          question: 'Um cliente diz que "a internet caiu" porque nenhum site abre pelo nome, mas ao testar um IP direto a conexão funciona normalmente. Qual é o diagnóstico mais provável?',
          options: [
            'Problema físico no cabo de rede (camada 1)',
            'Falha no DNS — a tradução de nomes para IP não está funcionando, mesmo com a conexão ativa',
            'O roteador está sem energia',
            'A fonte de alimentação do modem queimou',
          ],
          correct: 1,
          explanation: 'Se sites não abrem pelo nome mas funcionam pelo IP direto, o problema está na resolução DNS, não na conectividade em si — trocar o servidor DNS (ex: 8.8.8.8 ou 1.1.1.1) costuma resolver.',
        },
        {
          question: 'Qual a diferença prática fundamental entre TCP e UDP, e por que jogos online e chamadas de voz (VoIP) preferem UDP?',
          options: [
            'TCP é mais rápido e por isso é usado em jogos; UDP é mais lento e usado só em e-mail',
            'TCP confirma entrega e reenvia pacotes perdidos (mais confiável, porém mais lento); UDP não confirma entrega, priorizando velocidade — ideal quando um pacote perdido importa menos que a latência',
            'TCP e UDP são idênticos, a escolha é apenas histórica',
            'UDP só funciona em redes locais, nunca pela internet',
          ],
          correct: 1,
          explanation: 'TCP prioriza confiabilidade com confirmação e retransmissão, adicionando overhead; UDP prioriza velocidade sem confirmação — por isso jogos e VoIP preferem UDP, onde perder um pacote ocasional é menos prejudicial que atraso.',
        },
        {
          question: 'Por que uma empresa segmentaria sua rede usando VLANs para separar convidados do setor financeiro?',
          options: [
            'VLAN é obrigatória por lei em qualquer rede empresarial',
            'Para que o tráfego de uma VLAN fique isolado logicamente do tráfego de outra, mesmo compartilhando o mesmo switch físico, aumentando segurança e organização',
            'Porque VLAN aumenta a velocidade da internet contratada automaticamente',
            'Porque sem VLAN é impossível ter mais de um dispositivo conectado ao mesmo switch',
          ],
          correct: 1,
          explanation: 'VLANs permitem segmentar logicamente uma rede física em redes separadas — isolando, por exemplo, o tráfego de convidados do tráfego sensível do setor financeiro, mesmo usando os mesmos switches físicos.',
        },
        {
          question: 'Além de "mais velocidade", qual é o ganho real que o Wi-Fi 6 oferece em uma casa ou escritório com muitos dispositivos conectados?',
          options: [
            'Reduz o consumo de energia dos dispositivos para zero',
            'Usa OFDMA para lidar de forma mais eficiente com múltiplos dispositivos simultâneos, evitando degradação da rede quando muitos aparelhos estão conectados ao mesmo tempo',
            'Elimina completamente a necessidade de senha na rede',
            'Substitui a necessidade de cabo de rede em qualquer situação',
            ],
          correct: 1,
          explanation: 'O recurso OFDMA do Wi-Fi 6 permite atender múltiplos dispositivos de forma mais eficiente simultaneamente, evitando que a rede degrade quando há muitos aparelhos conectados — esse é o ganho real além da velocidade bruta.',
        },
        {
          question: 'Por que um cabeamento Cat5e antigo pode ser o gargalo real de uma rede mesmo depois de instalar um switch gigabit novo?',
          options: [
            'Cat5e não consegue fisicamente transportar sinal de rede',
            'Cat5e tem limite de até 1 Gbps — se a rede foi projetada para velocidades maiores (2.5G/10G), o cabo antigo limita a velocidade real independente do switch',
            'Cat5e só funciona com fibra óptica, não com switches',
            'O problema nunca é o cabo, sempre é o roteador',
          ],
          correct: 1,
          explanation: 'Cat5e suporta até 1 Gbps — instalar um switch ou placa de rede 2.5G/10G sem atualizar o cabeamento significa que a velocidade real fica limitada pelo cabo antigo, não pelo equipamento novo.',
        },
      ],
    },
  ],
}
