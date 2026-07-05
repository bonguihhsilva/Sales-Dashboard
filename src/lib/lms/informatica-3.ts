import type { LmsTrilha } from './types'

export const informaticaT3: LmsTrilha = {
  id: 'trilha-ti-3',
  slug: 'montagem-e-upgrade',
  title: 'Montagem e Upgrade',
  description: 'Ordem de montagem, checklist de compatibilidade, diagnóstico de gargalos, airflow, configuração de BIOS, atualização de firmware e testes de estabilidade pós-montagem.',
  icon: '🛠️',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-3-montagem-e-upgrade',
      title: 'Montagem e Upgrade',
      description: 'Ordem de montagem, checklist de compatibilidade, diagnóstico de gargalos, airflow, configuração de BIOS, atualização de firmware e testes de estabilidade pós-montagem.',
      duration: 45,
      content: `
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
      `,
      quiz: [
        {
          question: 'Por que esquecer de ativar o perfil XMP/EXPO na BIOS é um erro caro em termos de desempenho entregue ao cliente?',
          options: [
            'Sem XMP/EXPO a RAM não funciona de jeito nenhum',
            'Sem o perfil ativado, a RAM roda numa velocidade conservadora de fábrica, bem abaixo da velocidade anunciada e vendida ao cliente',
            'XMP/EXPO só afeta a temperatura da memória, não a velocidade',
            'É um recurso exclusivo de notebooks, não afeta desktops',
          ],
          correct: 1,
          explanation: 'Sem ativar XMP (Intel) ou EXPO (AMD), a memória roda numa frequência padrão conservadora — por exemplo, DDR5-6000 rodando a 4800MT/s — entregando bem menos do que o cliente pagou.',
        },
        {
          question: 'Durante um jogo, o uso de GPU fica em 60% enquanto a CPU está constantemente em 100%. O que isso indica?',
          options: [
            'A GPU está com defeito e precisa ser trocada',
            'Gargalo de CPU — o processador não consegue alimentar a GPU com dados rápido o suficiente, deixando-a ociosa',
            'A fonte de alimentação está subdimensionada',
            'É o comportamento normal e esperado de qualquer sistema',
          ],
          correct: 1,
          explanation: 'Quando a CPU está saturada (100%) e a GPU fica abaixo de 90-95% de uso, é sinal de gargalo de CPU — ela não consegue processar rápido o suficiente para manter a GPU ocupada.',
        },
        {
          question: 'Por que atualizar a BIOS de uma placa-mãe sem um nobreak é considerado perigoso?',
          options: [
            'Porque consome muita energia da rede elétrica',
            'Porque uma queda de energia durante a gravação do firmware pode corromper a BIOS e inutilizar a placa-mãe ("brickar")',
            'Porque isso invalida a garantia automaticamente, independente do resultado',
            'Porque a atualização de BIOS sempre reduz o desempenho do sistema',
          ],
          correct: 1,
          explanation: 'A atualização de firmware regrava a memória da BIOS; uma interrupção de energia nesse processo pode corromper o firmware e deixar a placa-mãe inutilizável, por isso o uso de nobreak é obrigatório.',
        },
        {
          question: 'Quais dos itens abaixo são sinais claros de airflow mal planejado num gabinete?',
          options: [
            'Ventoinhas RGB sincronizadas e cabos modulares usados corretamente',
            'Fans todos soprando na mesma direção sem plano de entrada/saída, painel frontal fechado sem malha, e cabos bagunçados bloqueando a passagem de ar',
            'Uso de pressão positiva (mais entrada de ar que saída)',
            'Radiador de water cooler instalado na posição de exaustão traseira',
          ],
          correct: 1,
          explanation: 'Airflow mal planejado se manifesta em fans sem direção coordenada de entrada/saída, painéis frontais fechados restringindo entrada de ar, e cabeamento desorganizado bloqueando a passagem do ar — todos aumentam temperatura interna.',
        },
        {
          question: 'Por que o MemTest86 é a ferramenta indicada para validar a RAM após um upgrade de memória, e por que ele roda fora do sistema operacional?',
          options: [
            'Porque testa apenas a velocidade de leitura do SSD, não a RAM',
            'Porque valida a integridade da memória através de padrões de teste exaustivos, e rodar fora do SO evita que o próprio sistema operacional interfira ou mascare erros de memória',
            'Porque precisa de conexão com a internet para funcionar',
            'Porque substitui a necessidade de ativar XMP/EXPO',
          ],
          correct: 1,
          explanation: 'MemTest86 roda via boot USB, fora do sistema operacional, para testar a memória de forma isolada e exaustiva — rodando dentro do SO, o próprio sistema ocupa parte da RAM e pode mascarar erros de instabilidade.',
        },
      ],
    },
  ],
}
