import type { LmsTrilha } from './types'

export const informaticaT13: LmsTrilha = {
  id: 'trilha-ti-13',
  slug: 'tendencias-tecnologicas',
  title: 'Tendências Tecnológicas',
  description: 'Panorama das principais tendências de tecnologia (IA local, nuvem, edge computing, Wi-Fi 7, PCIe 5.0, DDR5, USB4, redes 10G, smart home, VR/AR e computação quântica) e seu impacto comercial no varejo de informática.',
  icon: '🚀',
  color: '#2563EB',
  xpReward: 250,
  area: 'informatica',
  lessons: [
    {
      id: 'mod-ti-13-tendencias-tecnologicas',
      title: 'Tendências Tecnológicas',
      description: 'Panorama das principais tendências de tecnologia (IA local, nuvem, edge computing, Wi-Fi 7, PCIe 5.0, DDR5, USB4, redes 10G, smart home, VR/AR e computação quântica) e seu impacto comercial no varejo de informática.',
      duration: 40,
      content: `
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
      `,
      quiz: [
        {
          question: 'Por que a NPU (Neural Processing Unit) embarcada em notebooks modernos virou um argumento de venda relevante?',
          options: [
            'Porque substitui completamente a necessidade de placa de vídeo em qualquer uso',
            'Porque permite rodar processamento de IA localmente, sem depender da nuvem, com ganhos de privacidade e velocidade',
            'Porque é exigida por lei em todos os notebooks vendidos a partir de 2026',
            'Porque reduz o preço final do notebook'
          ],
          correct: 1,
          explanation: 'NPUs em CPUs como Intel Core Ultra, AMD Ryzen AI e Snapdragon X permitem rodar IA localmente (Copilot+ PC), argumento ligado a privacidade e velocidade sem depender de conexão.'
        },
        {
          question: 'Por que switches e placas de rede 2.5G/5G/10G estão deixando de ser exclusividade de data center?',
          options: [
            'Porque pararam de ser fabricados para uso corporativo',
            'Porque caíram de preço, e SSDs NVMe rápidos + fibra de alta velocidade tornaram a rede interna de 1Gbps o novo gargalo',
            'Porque o Wi-Fi 7 tornou toda rede cabeada obsoleta',
            'Porque governos passaram a exigir redes 10G em residências'
          ],
          correct: 1,
          explanation: 'Com armazenamento e internet cada vez mais rápidos, a rede interna de 1Gbps virou o gargalo em ambientes avançados, abrindo oportunidade de upsell para entusiastas e pequenas empresas.'
        },
        {
          question: 'Qual o principal impacto do padrão Matter na decisão de compra de dispositivos smart home pelo cliente final?',
          options: [
            'Torna os dispositivos smart home mais baratos automaticamente',
            'Elimina a necessidade de Wi-Fi para dispositivos smart home',
            'Reduz a fricção de compra ao unificar compatibilidade entre fabricantes (Google, Amazon, Apple, Samsung), tirando o medo de comprar produto preso a uma marca só',
            'Obriga o cliente a comprar todos os dispositivos da mesma marca'
          ],
          correct: 2,
          explanation: 'Matter unifica fabricantes, reduzindo a fricção de compra que existia pelo medo de "comprar produto que só funciona com 1 marca", abrindo espaço para cross-sell com redes/roteadores.'
        },
        {
          question: 'Por que o Wi-Fi 7 ainda não é um argumento de venda forte para o público geral, mas já é relevante para entusiastas/gamers?',
          options: [
            'Porque o Wi-Fi 7 é mais lento que o Wi-Fi 6 para a maioria dos usos',
            'Porque a maioria dos dispositivos do público geral ainda não suporta Wi-Fi 7, então o ganho seria zero sem trocar todos os aparelhos, enquanto entusiastas já têm hardware compatível',
            'Porque o Wi-Fi 7 só funciona com roteadores de uma única marca',
            'Porque o Wi-Fi 7 exige assinatura de internet fibra obrigatoriamente'
          ],
          correct: 1,
          explanation: 'Adoção de nova geração de Wi-Fi começa por gamers/entusiastas com hardware compatível e cresce para uso geral em 2-3 anos, conforme os próprios dispositivos dos usuários acompanham o padrão.'
        },
        {
          question: 'Qual das alternativas descreve corretamente o papel da computação quântica no varejo de informática hoje?',
          options: [
            'Já é vendida em lojas de varejo como acessório para PCs domésticos',
            'Substitui os processadores tradicionais em notebooks de entrada',
            'Não gera oportunidade comercial direta na loja, mas é conhecimento de contexto útil para conversas com clientes técnicos, já que aplicações reais estão restritas a pesquisa, criptografia avançada e otimização complexa em grandes empresas',
            'É a tecnologia por trás dos SSDs NVMe Gen5'
          ],
          correct: 2,
          explanation: 'Computação quântica ainda não é produto de varejo — suas aplicações reais estão em pesquisa e grandes institutos, mas conhecer o tema demonstra atualização do vendedor perante um cliente técnico.'
        }
      ]
    }
  ]
}
