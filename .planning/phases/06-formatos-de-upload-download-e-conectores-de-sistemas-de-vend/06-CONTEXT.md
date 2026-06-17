# Phase 6: Formatos de upload/download e conectores de sistemas de vendas (CEC, Pegasus, ISRP) - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Estender o sistema de importação de vendas para suportar:
1. **Conectores de API REST** com Pegasus e ISRP (integração direta, sem upload manual)
2. **Detecção automática de formato** por fingerprint para uploads manuais de arquivo
3. **Export XLSX e PDF** além do CSV existente

O upload HTML manual do CEC continua funcionando como está — esta fase adiciona novos canais de entrada e saída, não substitui o fluxo atual.

</domain>

<decisions>
## Implementation Decisions

### Conectores de Sistemas Externos (Pegasus / ISRP)

- **D-01:** Pegasus e ISRP têm APIs REST que podem ser chamadas diretamente — o dashboard consome as APIs, não o contrário.
- **D-02:** Fluxo de sync é **híbrido**: agendado automático (Supabase cron job ou Edge Function com schedule) + botão manual "Forçar Sincronização" na UI para o gerente.
- **D-03:** Credenciais e documentação das APIs de Pegasus e ISRP **ainda não disponíveis** — a fase deve:
  - Implementar a **arquitetura do conector** (interface genérica, tabela `connectors` com credenciais por tenant)
  - Deixar **stubs concretos** para cada sistema (PegasusConnector, ISRPConnector) com TODO onde vai a lógica real
  - Não bloquear o merge esperando credenciais
- **D-04:** Credenciais de API armazenadas na tabela `connectors` (por tenant, encrypted ou via Supabase Vault), nunca em env vars hardcoded.

### Upload Manual — Detecção de Formato

- **D-05:** Detecção automática por **fingerprint do arquivo** (análise de estrutura: headers de coluna, extensão, padrões de dados) — não por nome de arquivo, não por seleção manual antecipada.
- **D-06:** Se o fingerprint falhar (arquivo ambíguo, formato desconhecido): exibir **dropdown para o usuário escolher manualmente** qual sistema (CEC / Pegasus / ISRP / Genérico) — fallback gracioso, sem rejeição.
- **D-07:** O parser CEC HTML existente (`src/lib/parser.ts`) é referência — novos parsers seguem a mesma interface `SaleTransaction[]`.

### Mapeamento de IDs entre Sistemas

- **D-08:** vendor_id: depende do que as APIs retornam — arquitetura deve suportar mapeamento. Abordagem: **prefixo de sistema** como namespace temporário (`CEC_123`, `PEG_456`, `ISRP_789`) + tabela `connector_id_mappings` para resolução de IDs canônicos quando mapeamento manual for configurado.
- **D-09:** client_id: mesma abordagem — Claude's discretion para implementação. Prefixo de sistema garante unicidade imediata; mapeamento opcional adicionado depois.

### Export de Relatórios

- **D-10:** Adicionar **XLSX** e **PDF** como opções na página `/dashboard/relatorios`, além do CSV existente.
- **D-11:** Conteúdo: **comissões + vendas consolidadas por vendedor** — mesmos dados do CSV atual, sem adicionar LMS neste fase.
- **D-12:** PDF: simples e legível — tabela limpa com header (logo GDS + título + período), sem grande estilo. Funcional para envio por email.
- **D-13:** XLSX: formatado com headers em negrito, colunas com largura adequada. Pode usar biblioteca `xlsx` que já está no projeto (`src/lib/server-parser.ts` usa `XLSX`).

### Claude's Discretion

- Arquitetura interna dos conectores (interface base, retry logic, error handling)
- Decisão sobre client_id cross-system (prefixo recomendado conforme D-08/D-09)
- Biblioteca PDF (puppeteer/jsPDF/pdfkit — escolher com base em compatibilidade com Next.js serverless)
- Schema exato das tabelas `connectors` e `connector_id_mappings`
- Estratégia de fingerprinting (análise heurística de colunas/extensão)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Parsers e Upload Existentes
- `src/lib/parser.ts` — interface `SaleTransaction`, `parseSalesHtml`, `detectPeriodFromTransactions` — base para novos parsers
- `src/lib/server-parser.ts` — `parseUploadBuffer` multi-formato (HTML/XLSX/CSV/DOCX/PDF) — estender aqui para novos fingerprints
- `src/app/dashboard/UploadModal.tsx` — fluxo completo de upload com detecção de período e modos incremental/replace
- `src/app/api/admin/parse-upload/route.ts` — API de parse — estender para retornar `detected_system`

### Export Existente
- `src/app/api/admin/relatorio-excel/` — rota de export atual (CSV) — ampliar para XLSX/PDF
- `src/app/dashboard/relatorios/page.tsx` — página de relatórios com ExportButton e UploadModal

### Projeto e Roadmap
- `.planning/ROADMAP.md` — Phase 6 description e goal

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `XLSX` library (`xlsx` package): já instalada e usada em `server-parser.ts` — reutilizar para gerar XLSX no export
- `SaleTransaction` interface: padrão de dados de transação já definido — todos os parsers devem retornar esse formato
- `parseUploadBuffer(buffer, filename)`: ponto de extensão natural para adicionar fingerprinting e novos parsers
- `vendor_exclusions` table: padrão de exclusão por vendor já existe — conectores devem respeitá-lo
- `sales_records` table: destino final de todas as importações — conectores usam o mesmo destino
- `createAdminClient()`: client com service role para operações de cron/backend

### Established Patterns
- Autenticação: `getTenantContext()` para verificar role em API routes
- Multi-tenant: `tenant_id` obrigatório em todas as tabelas de dados
- Upload incremental vs replace: padrão já estabelecido no UploadModal — conectores devem suportar o mesmo
- Rate limiting: `strictRateLimiter` em rotas de upload — aplicar também nas rotas de sync
- Sanitização: `sanitizeString()` em dados de texto antes de inserir — manter nos novos parsers

### Integration Points
- Nova tabela `connectors` deve ter `tenant_id` e credenciais encriptadas
- Rota de sync manual: `/api/admin/sync-connector` (nova)
- Botão de sync na UI: adicionar em `/dashboard/relatorios` ou nova aba
- Cron job: Edge Function Supabase schedulada ou Vercel Cron para sync automático

</code_context>

<specifics>
## Specific Ideas

- Usuário quer que o dashboard seja a fonte de verdade para dados de vendas, com importação manual (CEC HTML) continuando como está, e conectividade direta com Pegasus/ISRP via API como novo canal
- PDF deve ser simples: tabela + header com logo GDS + período — não precisa ser um relatório elaborado
- XLSX deve reaprovitar o `xlsx` package já existente

</specifics>

<deferred>
## Deferred Ideas

- UI de mapeamento de IDs (tela para configurar manualmente CEC_123 → vendor interno) — pode ser Phase 7
- LMS no export (XP/badges por vendedor) — usuário considerou mas decidiu não incluir nesta fase
- Webhooks/push da Pegasus/ISRP para o dashboard (inverso do conector pull) — future phase
- Sync histórico (importar meses anteriores em batch via conector) — future phase

</deferred>

---

*Phase: 06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend*
*Context gathered: 2026-06-17*
