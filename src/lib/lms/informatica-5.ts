import type { LmsTrilha } from './types'

export const informaticaT5: LmsTrilha = {
  id: 'trilha-ti-5',
  slug: 'equipamentos-de-rede',
  title: 'Equipamentos de Rede',
  description: 'Roteadores, switches, APs, controladoras, firewalls, racks e nobreaks — como escolher e vender o equipamento certo para cada perfil de cliente.',
  icon: '📡',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-5-equipamentos-de-rede',
      title: 'Equipamentos de Rede',
      description: 'Roteadores, switches, APs, controladoras, firewalls, racks e nobreaks — como escolher e vender o equipamento certo para cada perfil de cliente.',
      duration: 45,
      content: `
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
      `,
      quiz: [
        {
          question: 'Uma empresa com 30+ dispositivos simultâneos apresenta travamentos de rede. Qual é o erro comum que provavelmente causou isso?',
          options: [
            'Usar um switch gerenciável em vez de não gerenciável',
            'Vender um roteador doméstico simples sem CPU/RAM adequados para a carga de conexões (NAT table)',
            'Instalar um sistema mesh em vez de repetidor',
            'Usar cabo de rede em vez de Wi-Fi',
          ],
          correct: 1,
          explanation: 'Roteadores domésticicos simples não têm CPU/RAM suficientes para gerenciar a tabela NAT de muitas conexões simultâneas, causando lentidão e travamentos.',
        },
        {
          question: 'Por que câmeras IP deveriam ficar em uma VLAN separada da rede administrativa de uma loja?',
          options: [
            'Porque câmeras IP não suportam VLAN',
            'Para reduzir o consumo de banda apenas',
            'Para isolar o tráfego e proteger a rede interna caso uma câmera vulnerável seja invadida',
            'Porque é obrigatório por lei em todos os países',
          ],
          correct: 2,
          explanation: 'Câmeras IP são um vetor comum de invasão; segmentar em VLAN separada impede que um dispositivo comprometido dê acesso ao restante da rede (financeiro, caixa etc).',
        },
        {
          question: 'Qual a diferença técnica principal entre um repetidor de Wi-Fi tradicional e um sistema mesh?',
          options: [
            'Repetidor é mais caro e tecnicamente superior ao mesh',
            'Mesh cria uma única rede contínua com roaming automático; repetidor cria rede separada com penalidade de banda a cada salto',
            'Não há diferença prática entre os dois',
            'Repetidor exige controladora dedicada e mesh não',
          ],
          correct: 1,
          explanation: 'O mesh oferece uma rede única com roaming transparente entre nós, enquanto o repetidor tradicional retransmite o sinal com perda de banda a cada salto e pode exigir troca manual de rede.',
        },
        {
          question: 'A partir de quantos Access Points a gestão via controladora de rede passa a se justificar economicamente?',
          options: [
            'A partir de 1 AP já é obrigatório',
            'Nunca compensa, sempre configurar cada AP individualmente',
            'A partir de aproximadamente 3-4 APs, quando a gestão individual se torna inviável',
            'Somente acima de 50 APs',
          ],
          correct: 2,
          explanation: 'Com cerca de 3-4 APs a gestão manual individual já consome tempo demais — a controladora centraliza configuração, segurança e atualização de firmware, economizando manutenção.',
        },
        {
          question: 'Qual tipo de nobreak é mais indicado para proteger um servidor crítico em uma empresa?',
          options: [
            'Off-line/Standby, pois é mais barato',
            'Online (dupla conversão), pois filtra continuamente sem qualquer interrupção na comutação',
            'Nenhum nobreak é necessário se o servidor tiver fonte redundante',
            'Line-interactive, pois é o mais rápido do mercado',
          ],
          correct: 1,
          explanation: 'O nobreak online (dupla conversão) fornece energia filtrada continuamente, sem o pequeno atraso de comutação dos modelos off-line/standby, essencial para equipamentos críticos como servidores.',
        },
      ],
    },
  ],
}
