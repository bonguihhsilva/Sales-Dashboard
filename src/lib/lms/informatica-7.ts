import type { LmsTrilha } from './types'

export const informaticaT7: LmsTrilha = {
  id: 'trilha-ti-7',
  slug: 'seguranca-da-informacao',
  title: 'Segurança da Informação',
  description: 'Antivírus, ransomware, phishing, MFA, backups, criptografia e LGPD — como proteger o cliente e orientar boas práticas de segurança.',
  icon: '🔒',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-7-seguranca-da-informacao',
      title: 'Segurança da Informação',
      description: 'Antivírus, ransomware, phishing, MFA, backups, criptografia e LGPD — como proteger o cliente e orientar boas práticas de segurança.',
      duration: 45,
      content: `
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
      `,
      quiz: [
        {
          question: 'Como funciona corretamente a regra de backup 3-2-1?',
          options: [
            '3 backups por dia, 2 pessoas responsáveis, 1 servidor dedicado',
            '3 cópias dos dados, em 2 mídias diferentes, com 1 cópia fora do local físico',
            '3 tipos de antivírus, 2 firewalls, 1 VPN ativa',
            '3 dias de retenção, 2 versões salvas, 1 nuvem paga',
          ],
          correct: 1,
          explanation: 'A regra 3-2-1 estabelece 3 cópias dos dados, armazenadas em 2 tipos de mídia diferentes, com pelo menos 1 cópia fora do local físico original — é a única defesa confiável contra perda definitiva por ransomware ou desastre.',
        },
        {
          question: 'Por que a autenticação multifator (MFA/2FA) é considerada a medida de segurança com melhor custo-benefício?',
          options: [
            'Porque é a única medida que substitui completamente o uso de senha',
            'Porque tem baixo custo de implementação e alto impacto na redução de acessos indevidos, mesmo com senha vazada',
            'Porque impede qualquer tipo de ataque de phishing automaticamente',
            'Porque é obrigatória por lei em todos os serviços online',
          ],
          correct: 1,
          explanation: 'MFA adiciona uma segunda camada (algo que o usuário possui, como app autenticador) que, mesmo com a senha comprometida, impede o acesso indevido — com custo de implementação baixo e alto impacto.',
        },
        {
          question: 'Qual das opções abaixo é um sinal de alerta clássico de phishing que deve ser ensinado a um cliente leigo?',
          options: [
            'O e-mail vir de um domínio oficial conhecido e sem erros de escrita',
            'Mensagem criando urgência excessiva, como ameaça de bloqueio de conta em 24h',
            'O e-mail conter apenas texto, sem links ou anexos',
            'A mensagem ser enviada em horário comercial',
          ],
          correct: 1,
          explanation: 'Urgência excessiva é uma tática clássica de phishing para induzir a vítima a agir sem pensar; outros sinais incluem domínio levemente alterado e pedido de dados sensíveis por e-mail.',
        },
        {
          question: 'Por que não é recomendado pagar o resgate exigido em um ataque de ransomware?',
          options: [
            'Porque é ilegal em qualquer circunstância no Brasil',
            'Porque não há garantia de recuperação dos arquivos e o pagamento financia o crime organizado',
            'Porque o pagamento sempre é recusado pelos criminosos',
            'Porque seguros de TI cobrem automaticamente qualquer prejuízo',
          ],
          correct: 1,
          explanation: 'Órgãos de segurança recomendam não pagar porque não há garantia de que os dados serão liberados, além de o pagamento incentivar e financiar novos ataques — ainda assim, a decisão final cabe ao cliente.',
        },
        {
          question: 'Como a LGPD se conecta à venda de sistemas de câmeras com reconhecimento facial para um cliente empresarial?',
          options: [
            'Não há relação, LGPD trata apenas de dados financeiros',
            'O reconhecimento facial capta dados pessoais/biométricos, o que traz implicações legais de tratamento de dados que vale mencionar ao cliente',
            'A LGPD proíbe totalmente o uso de câmeras em estabelecimentos comerciais',
            'A LGPD se aplica somente a empresas com mais de 500 funcionários',
          ],
          correct: 1,
          explanation: 'Sistemas com reconhecimento facial coletam dados biométricos, que são dados pessoais sensíveis sob a LGPD — o vendedor deve alertar o cliente empresarial sobre essa implicação, mesmo sem atuar como advogado.',
        },
      ],
    },
  ],
}
