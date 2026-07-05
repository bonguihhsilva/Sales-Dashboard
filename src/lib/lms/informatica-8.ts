import type { LmsTrilha } from './types'

export const informaticaT8: LmsTrilha = {
  id: 'trilha-ti-8',
  slug: 'diagnostico-e-solucao-de-problemas',
  title: 'Diagnóstico e Solução de Problemas',
  description: 'Metodologia de diagnóstico para PCs lentos, superaquecimento, falhas de memória, SSD, rede e hardware — do sintoma à causa raiz confirmada.',
  icon: '🩺',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-8-diagnostico-e-solucao-de-problemas',
      title: 'Diagnóstico e Solução de Problemas',
      description: 'Metodologia de diagnóstico para PCs lentos, superaquecimento, falhas de memória, SSD, rede e hardware — do sintoma à causa raiz confirmada.',
      duration: 45,
      content: `
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
      `,
      quiz: [
        {
          question: 'Por que verificar o "uso de disco em 100%" no Gerenciador de Tarefas é um dos primeiros passos ao diagnosticar um PC lento?',
          options: [
            'Porque indica automaticamente que a RAM precisa ser trocada',
            'Porque aponta para um HDD antigo/fragmentado ou SSD no fim da vida útil, causas muito comuns de lentidão',
            'Porque é sempre sinal de vírus',
            'Porque significa que a placa-mãe está com defeito',
          ],
          correct: 1,
          explanation: 'Uso de disco constantemente em 100% é um forte indicativo de HDD antigo/fragmentado ou SSD desgastado, sendo o primeiro ponto a investigar no fluxograma de diagnóstico de lentidão.',
        },
        {
          question: 'Qual é o teste crucial para diferenciar rapidamente se um problema é de hardware ou de software?',
          options: [
            'Verificar se o problema persiste ao dar boot em outro sistema operacional (ex: USB live Linux) ou em modo de segurança',
            'Reinstalar o Windows imediatamente sem testes adicionais',
            'Trocar a fonte de alimentação como primeiro passo',
            'Perguntar apenas a idade do computador',
          ],
          correct: 0,
          explanation: 'Se o problema persiste em outro sistema operacional ou modo de segurança, tende a ser hardware; se desaparece, é software, driver ou configuração — esse teste isola a causa raiz rapidamente.',
        },
        {
          question: 'Qual ferramenta é usada para diagnosticar problemas intermitentes de memória RAM, como telas azuis aleatórias?',
          options: [
            'CrystalDiskInfo',
            'MemTest86, rodado via boot USB fora do sistema operacional',
            'Disk Cleanup',
            'Windows Update',
          ],
          correct: 1,
          explanation: 'MemTest86 roda fora do sistema operacional via boot USB e realiza múltiplas passagens de teste; qualquer erro reportado indica módulo de memória defeituoso ou configuração instável.',
        },
        {
          question: 'No fluxograma de triagem para "sem internet", qual é o primeiro ponto de verificação?',
          options: [
            'Se o cabo de rede está com a cor correta',
            'Se outros dispositivos da casa também estão sem internet, para diferenciar problema no roteador/provedor de problema isolado no dispositivo',
            'Se o antivírus está atualizado',
            'Se o Windows está na versão mais recente',
          ],
          correct: 1,
          explanation: 'Verificar se outros dispositivos também estão afetados direciona o diagnóstico: se todos estão sem internet, o problema é no roteador/modem/provedor; se é isolado, o foco vai para driver de rede ou configuração do dispositivo específico.',
        },
        {
          question: 'Por que um PC pode desligar sozinho especificamente durante jogos, mas funcionar bem no uso leve?',
          options: [
            'Porque jogos sempre corrompem o sistema operacional',
            'Porque jogos pesados elevam a carga térmica e o consumo de energia (picos de GPU), expondo problemas de temperatura ou fonte subdimensionada que não aparecem em uso leve',
            'Porque o antivírus bloqueia jogos automaticamente',
            'Porque jogos exigem obrigatoriamente upgrade de memória RAM',
          ],
          correct: 1,
          explanation: 'Jogos pesados aumentam significativamente a carga sobre CPU/GPU, gerando mais calor e picos de consumo de energia — se há problema térmico ou a fonte é subdimensionada, isso só se manifesta sob essa carga alta.',
        },
      ],
    },
  ],
}
