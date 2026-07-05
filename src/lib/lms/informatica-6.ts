import type { LmsTrilha } from './types'

export const informaticaT6: LmsTrilha = {
  id: 'trilha-ti-6',
  slug: 'sistemas-operacionais',
  title: 'Sistemas Operacionais',
  description: 'Windows, Linux, macOS, Android e iOS — instalação, configuração, manutenção e como orientar o cliente na escolha certa do sistema.',
  icon: '💿',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-6-sistemas-operacionais',
      title: 'Sistemas Operacionais',
      description: 'Windows, Linux, macOS, Android e iOS — instalação, configuração, manutenção e como orientar o cliente na escolha certa do sistema.',
      duration: 40,
      content: `
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
      `,
      quiz: [
        {
          question: 'Por que desfragmentar um SSD é desnecessário e potencialmente prejudicial?',
          options: [
            'Porque SSDs não armazenam arquivos de forma fragmentada e a operação apenas gasta ciclos de escrita desnecessários',
            'Porque SSDs são incompatíveis com o sistema de arquivos NTFS',
            'Porque desfragmentar sempre corrompe os dados em qualquer tipo de disco',
            'Porque só é possível desfragmentar HDDs formatados em FAT32',
          ],
          correct: 0,
          explanation: 'SSDs não sofrem com fragmentação da mesma forma que HDDs; desfragmentar gera escrita/leitura desnecessária, consumindo ciclos de vida útil da memória flash. O comando correto para SSD é o TRIM.',
        },
        {
          question: 'Em qual cenário faz mais sentido comercial recomendar Linux para um cliente leigo?',
          options: [
            'Sempre, independente do hardware ou uso',
            'Nunca, Linux não deve ser recomendado a clientes leigos',
            'Quando o hardware é antigo, não roda Windows 11, e o uso é básico (navegador, vídeo, mensagens)',
            'Somente quando o cliente pede especificamente por causa de jogos AAA',
          ],
          correct: 2,
          explanation: 'Hardware antigo com uso básico é o cenário ideal: Linux leve dá sobrevida real ao equipamento sem custo de licença, desde que o cliente não dependa de softwares exclusivos do Windows.',
        },
        {
          question: 'Qual ferramenta do Windows é essencial para diagnosticar a causa raiz de travamentos e crashes recorrentes?',
          options: [
            'Painel de Controle',
            'Visualizador de Eventos (Event Viewer)',
            'Bloco de Notas',
            'Windows Media Player',
          ],
          correct: 1,
          explanation: 'O Visualizador de Eventos registra erros de drivers, serviços e aplicativos, permitindo identificar a causa raiz de crashes e lentidão no boot.',
        },
        {
          question: 'Por que é fundamental confirmar um backup antes de resetar um Android ou iPhone?',
          options: [
            'Porque o reset de fábrica apaga permanentemente todos os dados do aparelho',
            'Porque o backup acelera o processo de reset',
            'Não é necessário, o reset de fábrica preserva os dados automaticamente',
            'Porque apenas aparelhos Android perdem dados no reset, iPhones não',
          ],
          correct: 0,
          explanation: 'O reset de fábrica apaga todos os dados do dispositivo permanentemente; sem backup confirmado (iCloud, Google, computador), fotos, contatos e arquivos são perdidos definitivamente.',
        },
        {
          question: 'Que limitação honesta deve ser informada ao recomendar Linux para alguém que usa software fiscal brasileiro específico?',
          options: [
            'Que o Linux é mais lento que o Windows em qualquer situação',
            'Que muitos ERPs e softwares fiscais brasileiros só rodam nativamente em Windows, podendo exigir emulação ou não funcionar',
            'Que o Linux não suporta impressoras fiscais em nenhuma hipótese',
            'Que o Linux é pago no Brasil por questões fiscais',
          ],
          correct: 1,
          explanation: 'Diversos softwares fiscais e ERPs brasileiros são desenvolvidos exclusivamente para Windows, exigindo o cliente estar ciente dessa limitação antes de migrar para Linux.',
        },
      ],
    },
  ],
}
