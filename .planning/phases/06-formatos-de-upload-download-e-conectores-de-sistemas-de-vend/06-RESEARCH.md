# Phase 6: Formatos de Upload/Download e Conectores de Sistemas de Vendas — Research

**Researched:** 2026-06-17
**Domain:** Parsers de arquivo, geração de PDF/XLSX, conectores REST, agendamento, criptografia de credenciais
**Confidence:** HIGH (stack analisado in-situ; decisões de libs verificadas com npm e testes de runtime)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Pegasus e ISRP têm APIs REST que podem ser chamadas diretamente — o dashboard consome as APIs, não o contrário.
- **D-02:** Fluxo de sync é híbrido: agendado automático + botão manual "Forçar Sincronização" na UI para o gerente.
- **D-03:** Credenciais e documentação das APIs de Pegasus e ISRP ainda não disponíveis — implementar arquitetura do conector com stubs concretos (PegasusConnector, ISRPConnector) com TODO onde vai a lógica real. Não bloquear o merge esperando credenciais.
- **D-04:** Credenciais de API armazenadas na tabela `connectors` (por tenant, encrypted ou via Supabase Vault), nunca em env vars hardcoded.
- **D-05:** Detecção automática por fingerprint do arquivo (análise de estrutura: headers de coluna, extensão, padrões de dados) — não por nome de arquivo, não por seleção manual antecipada.
- **D-06:** Se o fingerprint falhar: exibir dropdown para o usuário escolher manualmente qual sistema (CEC / Pegasus / ISRP / Genérico) — fallback gracioso, sem rejeição.
- **D-07:** O parser CEC HTML existente (`src/lib/parser.ts`) é referência — novos parsers seguem a mesma interface `SaleTransaction[]`.
- **D-08:** vendor_id: prefixo de sistema como namespace (`CEC_123`, `PEG_456`, `ISRP_789`) + tabela `connector_id_mappings` para resolução de IDs canônicos.
- **D-09:** client_id: mesma abordagem de prefixo que D-08.
- **D-10:** Adicionar XLSX e PDF como opções na página `/dashboard/relatorios`, além do CSV existente.
- **D-11:** Conteúdo: comissões + vendas consolidadas por vendedor — mesmos dados do CSV atual, sem adicionar LMS.
- **D-12:** PDF: simples e legível — tabela limpa com header (logo GDS + título + período), funcional para email.
- **D-13:** XLSX: formatado com headers em negrito, colunas com largura adequada. Usar biblioteca `xlsx` já no projeto.

### Claude's Discretion

- Arquitetura interna dos conectores (interface base, retry logic, error handling)
- Decisão sobre client_id cross-system (prefixo recomendado conforme D-08/D-09)
- Biblioteca PDF (puppeteer/jsPDF/pdfkit — escolher com base em compatibilidade com Next.js serverless)
- Schema exato das tabelas `connectors` e `connector_id_mappings`
- Estratégia de fingerprinting (análise heurística de colunas/extensão)

### Deferred Ideas (OUT OF SCOPE)

- UI de mapeamento de IDs (tela para configurar manualmente CEC_123 → vendor interno) — Phase 7
- LMS no export (XP/badges por vendedor)
- Webhooks/push da Pegasus/ISRP para o dashboard (inverso do conector pull)
- Sync histórico (importar meses anteriores em batch via conector)
</user_constraints>

---

## Summary

Esta fase adiciona três capacidades ao sistema de importação/export existente: (1) conectores REST para Pegasus e ISRP com arquitetura genérica e stubs de implementação, (2) detecção automática de formato de arquivo por fingerprint antes do parse, e (3) geração de relatórios em XLSX formatado e PDF simples além do CSV atual.

O stack já tem 80% dos ingredientes: `xlsx` 0.18.5 já instalado para leitura de planilhas, `parseUploadBuffer` como ponto natural de extensão para fingerprinting, `getTenantContext` e `createAdminClient` como patterns estabelecidos para as rotas de sync, e Supabase Vault disponível para credenciais. O único gap real é geração de PDF — nenhuma lib está instalada — e XLSX formatado com negrito exige uma lib adicional pois o `xlsx` community edition não persiste cell styles no arquivo final (confirmado por roundtrip test).

**Recomendação primária:** PDFKit 0.19.1 para PDF (100% serverless, sem Chromium), `xlsx-js-style` 1.2.0 para XLSX formatado (fork da lib já instalada, interface idêntica), e Supabase Cron (pg_cron + pg_net) para agendamento (gratuito, evita limite diário do Vercel Hobby).

---

## Standard Stack

### Core (já instalado no projeto)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `xlsx` | 0.18.5 | Leitura de XLSX/CSV no `parseUploadBuffer` | Instalado — manter para leitura |
| `@supabase/ssr` | ^0.5.2 | Server client nas API routes de sync | Instalado |
| `@supabase/supabase-js` | ^2.47.0 | Admin client para operações backend | Instalado |

### A Adicionar

| Library | Version | Purpose | Por Que |
|---------|---------|---------|---------|
| `xlsx-js-style` | 1.2.0 | Geração de XLSX com bold headers e column widths | SheetJS community (xlsx 0.18.5) não persiste `.s` cell styles no arquivo final — confirmado por roundtrip test. xlsx-js-style é um fork drop-in que adiciona essa capacidade. [VERIFIED: npm + runtime test] |
| `pdfkit` | 0.19.1 | Geração de PDF serverless (tabela + header) | Node-native, sem Chromium, bundle < 5MB, compatível com qualquer rota de API Next.js. Puppeteer é inviável em Vercel Hobby (sem headless Chrome). @react-pdf/renderer tem incompatibilidade ativa com Next.js 15/React 19 (__SECRET_INTERNALS). [VERIFIED: npm view + WebSearch] |

**Alternativas descartadas:**

| Em vez de | Poderia usar | Por que não |
|-----------|-------------|-------------|
| `pdfkit` | `@react-pdf/renderer` | Incompatibilidade documentada com Next.js 15 + React 19 via `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`. Ativo em junho 2025. [CITED: github.com/vercel/next.js/discussions/68553] |
| `pdfkit` | `jsPDF` | Originalmente browser-first; server-side possível mas documentação inconsistente. PDFKit tem melhor histórico em Node.js serverless. [ASSUMED] |
| `pdfkit` | `puppeteer` | Requer Chromium — inviável em Vercel serverless (bundle + sem sandbox) [VERIFIED: WebSearch] |
| `xlsx-js-style` | `xlsx` nativo | Cell styles (bold) não sobrevivem ao write/read roundtrip no xlsx 0.18.5 community. Confirmado: `ws['A1'].s = {font:{bold:true}}` → após `xlsx.write` + `xlsx.read` com `cellStyles:true`, campo `.s` retorna apenas `{patternType:"none"}`. [VERIFIED: runtime test] |

**Instalação:**
```bash
npm install xlsx-js-style pdfkit
npm install --save-dev @types/pdfkit
```

**Verificação de versão atual:**
```bash
npm view xlsx-js-style version   # 1.2.0
npm view pdfkit version          # 0.19.1
```

---

## Architecture Patterns

### Estrutura de Arquivos Recomendada

```
src/
  lib/
    connectors/
      base.ts              # Interface BaseConnector + tipos ConnectorResult
      registry.ts          # Mapa de tipo → instância de conector
      pegasus.ts           # PegasusConnector (stub — TODO: implementar quando credenciais chegarem)
      isrp.ts              # ISRPConnector (stub — TODO: implementar quando credenciais chegarem)
    fingerprint.ts         # detectFileSystem(buffer, filename) → 'cec'|'pegasus'|'isrp'|'generic'|null
    export-xlsx.ts         # generateCommissionXlsx(data, period) → Buffer
    export-pdf.ts          # generateCommissionPdf(data, period) → Buffer
    server-parser.ts       # (existente) — estender para chamar fingerprint
  app/
    api/
      admin/
        sync-connector/
          route.ts         # POST — trigger manual de sync por tenant+sistema
        relatorio-excel/
          route.ts         # (existente) — estender com ?format=xlsx|pdf|csv
    dashboard/
      relatorios/
        ExportButton.tsx   # (existente) — adicionar seletor de formato
```

Migrações Supabase:
```
supabase/migrations/
  XXXXXXXXXXXXXX_connectors.sql        # tabelas connectors + connector_id_mappings
  XXXXXXXXXXXXXX_cron_sync.sql         # pg_cron job agendado via Supabase Cron
```

---

### Pattern 1: Interface Base de Conector

**O que:** Todos os conectores implementam a mesma interface — facilita adicionar novos sistemas sem mudar o fluxo de sync.

```typescript
// src/lib/connectors/base.ts
export interface ConnectorConfig {
  id: string
  tenant_id: string
  system: 'pegasus' | 'isrp'
  base_url: string
  credential_secret_id: string  // UUID da secret no Supabase Vault
  settings: Record<string, unknown>
}

export interface SyncResult {
  transactions: SaleTransaction[]
  source_system: string
  fetched_at: string
  raw_count: number
  error?: string
}

export interface BaseConnector {
  system: string
  fetchTransactions(config: ConnectorConfig, periodStart: Date, periodEnd: Date): Promise<SyncResult>
}
```

**Quando usar:** Toda vez que um novo sistema externo for integrado. O registry em `connectors/registry.ts` mapeia `system → BaseConnector` e é o único lugar que precisa mudar para adicionar Pegasus 2, ISRP 2, etc.

---

### Pattern 2: Fingerprinting por Estrutura

**O que:** `detectFileSystem()` analisa o buffer para determinar o sistema de origem antes de fazer parse.

**Estratégia em camadas:**

1. **Magic bytes / extensão binária** — XLSX é ZIP (bytes `PK\x03\x04`), HTML tem `<!DOCTYPE` ou `<html`. Detectar isso antes de qualquer análise textual. `file-type` npm pode ajudar mas não diferencia CSV de texto genérico — lógica custom é necessária para formatos de texto.

2. **Header de colunas** — Para CSV/XLSX, extrair a primeira linha e comparar contra assinaturas conhecidas:
   - CEC: colunas em posição fixa (col[0] = código numérico, col[18] = vendor_id, col[15] = valor) — sem header nomeado.
   - Pegasus: a definir quando doc chegar — implementar como stub que retorna `null`.
   - ISRP: idem.

3. **Padrões de dados** — Se headers não forem conclusivos: verificar se col[0] é número de 5-6 dígitos (CEC client code), se existe formato de data DD/MM/YY em col[2], etc.

```typescript
// src/lib/fingerprint.ts
export type DetectedSystem = 'cec' | 'pegasus' | 'isrp' | 'generic' | null

export function detectFileSystem(buffer: Buffer, filename: string): DetectedSystem {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  // Magic bytes: XLSX = PK zip header
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B
  // HTML check
  const head = buffer.slice(0, 512).toString('utf-8').trimStart().toLowerCase()
  const isHtml = head.startsWith('<!doctype') || head.startsWith('<html') || head.includes('<table')
  
  if (isHtml) {
    // CEC exports HTML tables — attempt column count heuristic
    // If it matches CEC 19-column pattern → 'cec'
    if (looksLikeCecHtml(buffer.toString('utf-8'))) return 'cec'
    return 'generic'
  }
  
  if (isZip || ext === 'xlsx') {
    // TODO: quando docs Pegasus chegarem, verificar headers XLSX
    return detectXlsxSystem(buffer)  // por ora retorna null → cai no fallback
  }
  
  if (ext === 'csv') {
    // TODO: quando docs Pegasus/ISRP chegarem, verificar headers CSV
    return null  // forçar fallback dropdown
  }
  
  return null
}
```

**Regra de fallback (D-06):** Se `detectFileSystem` retornar `null` → resposta da API inclui `detected_system: null` → UploadModal exibe dropdown de seleção manual.

---

### Pattern 3: Geração de XLSX Formatado

**O que:** Usar `xlsx-js-style` (drop-in do `xlsx`) para gerar arquivo com bold headers e larguras de coluna.

```typescript
// src/lib/export-xlsx.ts
// NOTA: import de 'xlsx-js-style', não de 'xlsx'
import XLSXStyle from 'xlsx-js-style'

export function generateCommissionXlsx(vendors: VendorReport[], periodLabel: string): Buffer {
  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'F5F5F5' } } }
  
  const headers = ['Vendedor', 'Loja', 'Total Vendido', 'Meta Atingida', 'Comissão %', 'Comissão Base', 'Bônus', 'Total Ganhos', 'Status']
  const ws = XLSXStyle.utils.aoa_to_sheet([headers, ...vendors.map(rowToArray)])
  
  // Bold headers
  headers.forEach((_, i) => {
    const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c: i })
    if (ws[cellRef]) ws[cellRef].s = headerStyle
  })
  
  // Column widths
  ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 }]
  
  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, periodLabel.slice(0, 31))
  
  return XLSXStyle.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
```

**Atenção:** `xlsx-js-style` e `xlsx` não devem ser importados no mesmo módulo — podem conflitar. Usar `xlsx-js-style` apenas em `export-xlsx.ts`. `server-parser.ts` continua usando `xlsx` para leitura.

---

### Pattern 4: Geração de PDF com PDFKit

**O que:** PDFKit cria PDF programaticamente — sem HTML intermediário, sem Chromium.

```typescript
// src/lib/export-pdf.ts
// Source: pdfkit docs (pdfkit.org)
import PDFDocument from 'pdfkit'

export async function generateCommissionPdf(vendors: VendorReport[], periodLabel: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('GDS Frame — Relatório de Comissões', { align: 'center' })
    doc.fontSize(11).font('Helvetica').text(periodLabel, { align: 'center' })
    doc.moveDown()

    // Tabela: posicionamento manual via doc.text com x fixo por coluna
    const cols = [40, 200, 300, 400, 500, 620]
    // ... linhas de dados

    doc.end()
  })
}
```

**Limitação:** PDFKit não tem componente de tabela nativo — posicionamento é manual via coordenadas `x/y`. Para esta fase o PDF é simples (sem células alternadas, sem zebra), então é aceitável. [ASSUMED: complexidade de layout será baixa dado D-12]

---

### Pattern 5: Supabase Vault para Credenciais

**O que:** Cada conector armazena apenas o UUID da secret no Vault — nunca o valor bruto na tabela.

```sql
-- Criar secret no Vault
SELECT vault.create_secret(
  'my-api-key-value',
  'pegasus_tenant_abc123',      -- nome único (tenant_id + sistema)
  'Chave API Pegasus para tenant abc123'
) AS secret_id;  -- retorna UUID

-- Ler na Edge Function / Route
SELECT decrypted_secret AS api_key
FROM vault.decrypted_secrets
WHERE name = 'pegasus_tenant_abc123';
```

**Schema da tabela `connectors`:**
```sql
CREATE TABLE connectors (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  system          TEXT NOT NULL CHECK (system IN ('pegasus', 'isrp')),
  base_url        TEXT NOT NULL,
  credential_secret_id TEXT NOT NULL,  -- UUID do vault.secrets, não o valor
  settings        JSONB DEFAULT '{}',
  enabled         BOOLEAN DEFAULT true,
  last_sync_at    TIMESTAMPTZ,
  last_sync_error TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, system)
);
```

[CITED: supabase.com/docs/guides/database/vault] — Vault disponível em todos os projetos Supabase cloud.

---

### Pattern 6: Agendamento via Supabase Cron

**Por que não Vercel Cron:** Vercel Hobby plan limita cron a 1x/dia. Sync de vendas precisa de pelo menos 1x/hora para ser útil. [VERIFIED: vercel.com/docs/cron-jobs + WebSearch]

**Solução: Supabase Cron (pg_cron + pg_net)**

```sql
-- Agendar sync horário via pg_net → chama a Edge Function ou API route
SELECT cron.schedule(
  'connector-sync-hourly',
  '0 * * * *',  -- todo início de hora
  $$
  SELECT net.http_post(
    url := 'https://dashboard.gds-frame.com/api/admin/sync-connector',
    headers := '{"Authorization": "Bearer <CRON_SECRET>", "Content-Type": "application/json"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  )
  $$
);
```

**Alternativa gratuita:** `cron-job.org` (free tier, até 1 job/minuto) apontado para `/api/admin/sync-connector` com header `Authorization: Bearer <CRON_SECRET>`. Mesma rota, sem lock-in em pg_cron. Recomendado como fallback se pg_cron não estiver disponível no plano Supabase atual. [VERIFIED: WebSearch — mencionado como workaround para Vercel Hobby]

**CRON_SECRET:** Variável de ambiente `CRON_SECRET` usada para autenticar chamadas do cron job à API route — previne acesso não autorizado ao endpoint de sync.

---

### Pattern 7: Stubs de Conector

```typescript
// src/lib/connectors/pegasus.ts
import type { BaseConnector, ConnectorConfig, SyncResult } from './base'

export class PegasusConnector implements BaseConnector {
  system = 'pegasus' as const
  
  async fetchTransactions(
    config: ConnectorConfig,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SyncResult> {
    // TODO: implementar quando credenciais e documentação da API Pegasus chegarem
    // Endpoint esperado: GET ${config.base_url}/vendas?de=YYYY-MM-DD&ate=YYYY-MM-DD
    // Auth esperado: Bearer token em Authorization header
    throw new Error('PegasusConnector: não implementado — aguardando documentação da API')
  }
}
```

---

### Anti-Patterns a Evitar

- **Importar xlsx e xlsx-js-style no mesmo arquivo:** Conflito de types e runtime. Usar `xlsx` apenas em `server-parser.ts` (leitura), `xlsx-js-style` apenas em `export-xlsx.ts` (geração).
- **Armazenar credencial API em env var por tenant:** Não escala multi-tenant. Vault com secret por tenant é o padrão correto.
- **Usar Puppeteer/Chromium para PDF:** Incompatível com Vercel serverless sem configuração especial. PDFKit resolve o caso de uso D-12 sem essa complexidade.
- **Fingerprint baseado apenas em extensão de arquivo:** Extensão pode ser errada ou ausente. Analisar bytes mágicos + estrutura de colunas.
- **Bloquear sync automático por credenciais ainda ausentes:** Os stubs devem lançar erro claro mas não impedir deploy da fase.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar Em Vez | Por Que |
|----------|---------------|-------------|---------|
| Detecção de tipo binário (ZIP/XLSX) | Lógica custom de bytes | Verificação dos primeiros 4 bytes do Buffer + `xlsx.read` para validar se é workbook válido | XLSX = ZIP header `PK\x03\x04` — confiável e simples |
| Cell styling em XLSX | Manipulação manual do XML do OOXML | `xlsx-js-style` | OOXML styling é complexo; a lib encapsula corretamente |
| Criptografia de credenciais | pgcrypto manual | Supabase Vault (`vault.create_secret`) | Vault gerencia key rotation, masterkey fora do DB, e tem UI no dashboard Supabase |
| Retry com backoff exponencial | Loop manual | Lógica inline com `await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)))` | Para fase de stubs, retry simples (3 tentativas, 1/2/4s) é suficiente sem lib adicional |
| Tabela PDF complexa | Render de HTML → PDF | PDFKit com posicionamento manual de colunas | D-12 define PDF simples — sem zebra, sem merge cells — posicionamento manual cobre |

---

## Pitfalls Comuns

### Pitfall 1: xlsx 0.18.5 Cell Styles Ignorados

**O que dá errado:** Código atribui `ws['A1'].s = {font:{bold:true}}` e chama `xlsx.write()` esperando negrito no arquivo. O Excel/LibreOffice abre o arquivo sem formatação.

**Por que acontece:** SheetJS community edition 0.18.5 aceita a propriedade `.s` em memória mas não a serializa no OOXML durante `write()`. Roundtrip test confirmado: `xlsx.write` + `xlsx.read` com `cellStyles:true` retorna `{patternType:"none"}` no lugar de `{font:{bold:true}}`. [VERIFIED: runtime test]

**Como evitar:** Usar `xlsx-js-style` para geração de relatórios. Manter `xlsx` apenas para leitura (`parseUploadBuffer`).

**Warning sign:** Arquivo gerado tem < 20KB para 50 linhas — sem styles, o arquivo é menor que o esperado.

---

### Pitfall 2: @react-pdf/renderer Quebra Next.js 15

**O que dá errado:** Importar `@react-pdf/renderer` em qualquer módulo do projeto causa erro em build ou runtime relacionado a `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`.

**Por que acontece:** A lib acessa internos do React que foram removidos/renomeados no React 19 (Next.js 15). Incompatibilidade ativa conforme issue #68553 do next.js no GitHub. [CITED: github.com/vercel/next.js/discussions/68553]

**Como evitar:** Não instalar. Usar PDFKit.

---

### Pitfall 3: Vercel Hobby Cron Só Roda 1x/Dia

**O que dá errado:** Configurar `vercel.json` com `"crons": [{"path": "/api/admin/sync-connector", "schedule": "0 * * * *"}]` — no Hobby plan, Vercel silenciosamente converte para execução diária ou rejeita no deploy.

**Por que acontece:** Vercel Hobby limita cron a frequência máxima de 1 execução/dia. [VERIFIED: vercel.com/docs/plans/hobby + vercel.com/blog/cron-jobs]

**Como evitar:** Usar Supabase Cron (pg_cron) ou cron-job.org. Não depender de Vercel Cron para sync frequente neste plano.

---

### Pitfall 4: Fingerprint Retorna Falso Positivo em CSV Genérico

**O que dá errado:** Arquivo CSV de qualquer sistema (não Pegasus/ISRP) é detectado incorretamente como um sistema conhecido. Dados são inseridos com vendor_ids errados.

**Por que acontece:** Se a heurística de colunas for muito permissiva, arquivos com estrutura similar passam no filtro.

**Como evitar:** Para os stubs de Pegasus e ISRP, `detectFileSystem` deve retornar `null` para CSV/XLSX enquanto as assinaturas reais não forem definidas. Só o CEC (HTML 19 colunas) deve ter fingerprint implementado. Dropdown manual é o fallback correto para qualquer ambiguidade.

---

### Pitfall 5: Vault Secret Não Acessível por RLS

**O que dá errado:** `SELECT * FROM vault.decrypted_secrets` falha com permission denied em rotas autenticadas.

**Por que acontece:** `vault.decrypted_secrets` é acessível apenas com `service_role` ou grants explícitos. RLS do usuário normal não tem acesso.

**Como evitar:** Acessar Vault apenas via `createAdminClient()` (service_role). Nunca expor `vault.decrypted_secrets` via RLS pública ou via `createClient()` do browser.

---

## Code Examples

### Fingerprint — Detecção de HTML CEC

```typescript
// src/lib/fingerprint.ts
function looksLikeCecHtml(html: string): boolean {
  // CEC: tabela HTML onde primeira coluna de dados é código numérico de 4-6 dígitos
  // e existem pelo menos 19 colunas por linha de dado
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let dataRowsFound = 0
  let match
  while ((match = rowRegex.exec(html)) !== null) {
    const cells = match[1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
    if (cells && cells.length >= 19) {
      const firstCell = cells[0].replace(/<[^>]+>/g, '').trim()
      if (/^\d{4,6}$/.test(firstCell)) {
        dataRowsFound++
        if (dataRowsFound >= 3) return true  // 3 linhas de dado é conclusivo
      }
    }
  }
  return false
}
```

### Route: Parse com detected_system

```typescript
// Extensão de /api/admin/parse-upload/route.ts
const transactions = await parseUploadBuffer(buffer, file.name)
const detected = detectPeriodFromTransactions(transactions)
const detectedSystem = detectFileSystem(buffer, file.name)  // novo

return NextResponse.json({
  transactions,
  detected,
  detected_system: detectedSystem,  // null → UploadModal mostra dropdown
})
```

### Route: Sync Manual com auth

```typescript
// /api/admin/sync-connector/route.ts
export async function POST(req: NextRequest) {
  // Verificar CRON_SECRET para chamadas agendadas
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isCronCall = cronSecret && authHeader === `Bearer ${cronSecret}`
  
  if (!isCronCall) {
    // Verificar autenticação de usuário para triggers manuais
    const { user, profile } = await getTenantContext()
    if (!user || !['adm', 'gerente', 'super_admin'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
  }
  // ... lógica de sync
}
```

---

## Schema de Banco de Dados

```sql
-- tabela de conectores por tenant
CREATE TABLE connectors (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  system                TEXT NOT NULL CHECK (system IN ('pegasus', 'isrp')),
  base_url              TEXT NOT NULL,
  credential_secret_id  TEXT NOT NULL,  -- UUID retornado por vault.create_secret()
  settings              JSONB DEFAULT '{}',
  enabled               BOOLEAN DEFAULT true,
  last_sync_at          TIMESTAMPTZ,
  last_sync_error       TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, system)
);

-- tabela de mapeamento de IDs entre sistemas
CREATE TABLE connector_id_mappings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source_system   TEXT NOT NULL,   -- 'pegasus', 'isrp', 'cec'
  source_id       TEXT NOT NULL,   -- ID no sistema externo (ex: '456')
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('vendor', 'client')),
  canonical_id    TEXT,            -- ID interno resolvido (NULL = não mapeado ainda)
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, source_system, entity_type, source_id)
);

-- RLS
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_id_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY connectors_tenant ON connectors
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY mappings_tenant ON connector_id_mappings
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
```

---

## Prefixo de Sistema (D-08/D-09)

| Sistema | Prefixo vendor_id | Prefixo client_id | Exemplo |
|---------|------------------|------------------|---------|
| CEC | `CEC_` | `CEC_` | `CEC_123`, `CEC_ABC001` |
| Pegasus | `PEG_` | `PEG_` | `PEG_456` |
| ISRP | `ISRP_` | `ISRP_` | `ISRP_789` |

Prefixos garantem unicidade imediata sem aguardar mapeamento manual. Vendors já cadastrados no CEC (vendor_id sem prefixo) mantêm seus IDs — apenas transações importadas via conector recebem prefixo.

---

## Environment Availability

| Dependência | Requerida Por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| Node.js | Toda a aplicação | Sim | Runtime Next.js | — |
| Supabase Vault (pg_cron, pg_net) | Agendamento + credenciais | Sim [CITED: supabase.com/docs/guides/database/vault] | Cloud projeto `zsczxblhtdhpdqvkpuwz` | cron-job.org (free) para agendamento |
| `xlsx-js-style` | Export XLSX formatado | Não instalado | 1.2.0 | — |
| `pdfkit` | Export PDF | Não instalado | 0.19.1 | — |
| API Pegasus | PegasusConnector | Indisponível [conforme D-03] | Desconhecida | Stub com TODO |
| API ISRP | ISRPConnector | Indisponível [conforme D-03] | Desconhecida | Stub com TODO |

**Dependências faltando sem fallback:** Nenhuma que bloqueie o merge — stubs são o deliverable para Pegasus/ISRP.

**Dependências faltando com fallback:**
- `xlsx-js-style` e `pdfkit`: instalar via npm antes da implementação.
- APIs Pegasus/ISRP: implementação de stubs é o deliverable desta fase.

---

## Validation Architecture

Nenhum framework de teste configurado no projeto (`jest.config.*`, `vitest.config.*`, `tests/`, `__tests__/` — todos ausentes).

### Framework Recomendado para Esta Fase

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 2.x (mais leve que Jest, compatível com ESM e TypeScript nativo) |
| Config file | `vitest.config.ts` — criar em Wave 0 |
| Quick run | `npx vitest run --reporter=verbose` |
| Full suite | `npx vitest run` |

### Mapa Requisito → Teste

| Req | Comportamento | Tipo | Comando | Arquivo |
|-----|--------------|------|---------|---------|
| D-05 | fingerprint CEC detecta HTML com 19 cols | unit | `npx vitest run tests/fingerprint.test.ts` | Wave 0 |
| D-06 | fingerprint retorna null para CSV genérico | unit | `npx vitest run tests/fingerprint.test.ts` | Wave 0 |
| D-13 | XLSX gerado tem bold nos headers (roundtrip) | unit | `npx vitest run tests/export-xlsx.test.ts` | Wave 0 |
| D-12 | PDF gerado é Buffer não-vazio com header de período | unit | `npx vitest run tests/export-pdf.test.ts` | Wave 0 |
| D-08 | vendor_id recebe prefixo correto por sistema | unit | `npx vitest run tests/connectors.test.ts` | Wave 0 |

### Wave 0 Gaps

- [ ] `vitest.config.ts` — nenhum framework configurado
- [ ] `tests/fingerprint.test.ts` — cobre D-05, D-06
- [ ] `tests/export-xlsx.test.ts` — cobre D-13
- [ ] `tests/export-pdf.test.ts` — cobre D-12
- [ ] `tests/connectors.test.ts` — cobre D-08

**Instalação:**
```bash
npm install --save-dev vitest
```

---

## Security Domain

### ASVS Aplicável

| Categoria ASVS | Aplica | Controle |
|----------------|--------|---------|
| V2 Autenticação | sim | Rotas de sync: `getTenantContext()` para triggers manuais; `CRON_SECRET` para triggers agendados |
| V3 Sessão | não | Sem novos fluxos de sessão |
| V4 Controle de Acesso | sim | `connectors` tabela com RLS por tenant_id; sync manual só para `adm/gerente/super_admin` |
| V5 Validação de Entrada | sim | `sanitizeString()` nos campos de texto das transações importadas pelos conectores |
| V6 Criptografia | sim | Supabase Vault para credenciais — nunca hand-roll de criptografia |

### Ameaças Conhecidas

| Padrão | STRIDE | Mitigação |
|--------|--------|-----------|
| CRON endpoint sem auth | Spoofing | `CRON_SECRET` como Bearer token obrigatório |
| Credencial API em env var | Information Disclosure | Vault — credential_secret_id na tabela, valor nunca em env |
| CSV injection no export | Tampering | `sanitizeCSV()` já existente em `relatorio-excel/route.ts` — aplicar no XLSX também |
| Upload de arquivo malicioso via fingerprint | Tampering | Limite de 10MB já em `parse-upload/route.ts`; `strictRateLimiter` aplicar em `/api/admin/sync-connector` |
| Acesso cross-tenant a connectores | Elevation of Privilege | RLS por tenant_id na tabela `connectors` |

---

## Assumptions Log

| # | Claim | Seção | Risco se Errado |
|---|-------|-------|-----------------|
| A1 | PDFKit cobre o caso de uso D-12 (tabela simples, posicionamento manual) sem exceder complexidade de implementação | Architecture Patterns | Se o PDF precisar de mais styling do que esperado, pode exigir lib de tabelas como pdfmake |
| A2 | Supabase pg_cron e pg_net estão habilitados no projeto `zsczxblhtdhpdqvkpuwz` sem ação adicional | Environment Availability | Se não estiverem, usar cron-job.org como fallback — não bloqueia |
| A3 | APIs Pegasus e ISRP aceitam autenticação Bearer e retornam JSON com estrutura mapeável para `SaleTransaction` | Connectors base | Se usarem protocolos diferentes (SOAP, OAuth2 complexo), o `BaseConnector` pode precisar de mais campos em `ConnectorConfig` |
| A4 | Vitest é aceitável como framework de teste (não havia preferência expressa pelo usuário) | Validation Architecture | Se Jest for preferido, vitest.config.ts → jest.config.ts + ajustes de imports |

---

## Open Questions

1. **pg_cron disponível no plano Supabase atual?**
   - O que sabemos: Supabase Cron está disponível em todos os projetos cloud. [CITED: supabase.com/docs/guides/cron]
   - Incerto: Se `pg_cron` e `pg_net` já estão habilitados no projeto `zsczxblhtdhpdqvkpuwz` ou precisam ser ativados.
   - Recomendação: Planner deve incluir tarefa de verificação: "Confirmar extensões pg_cron + pg_net ativas via Supabase Dashboard → Extensions". Fallback: cron-job.org não requer nenhuma extensão.

2. **Logo GDS para o PDF**
   - O que sabemos: D-12 menciona "logo GDS + título + período" no header do PDF.
   - Incerto: Se existe um arquivo de logo (PNG/SVG) no projeto para embutir no PDF.
   - Recomendação: Verificar se `public/logo.png` ou similar existe. PDFKit suporta `doc.image(buffer, x, y)`. Se não existir, header fica só com texto — não bloqueia a fase.

3. **Formato exato de resposta das APIs Pegasus/ISRP**
   - O que sabemos: D-03 confirma que credenciais e docs não estão disponíveis.
   - Incerto: Estrutura de dados retornada, método de autenticação, paginação.
   - Recomendação: Stubs devem ter comentários detalhados de TODO com as perguntas que precisam ser respondidas quando a documentação chegar.

---

## Sources

### Primary (HIGH confidence)
- Runtime test local — xlsx 0.18.5 cell style roundtrip confirmado como não funcional
- `src/lib/server-parser.ts` — lido diretamente (ponto de extensão para fingerprint)
- `src/app/api/admin/relatorio-excel/route.ts` — lido diretamente (rota a estender para XLSX/PDF)
- `src/lib/ratelimit.ts` — lido diretamente (padrão de rate limiting a aplicar em /sync-connector)
- [supabase.com/docs/guides/database/vault](https://supabase.com/docs/guides/database/vault) — Vault disponível em todos os projetos

### Secondary (MEDIUM confidence)
- [supabase.com/docs/guides/cron](https://supabase.com/docs/guides/cron) — Supabase Cron via pg_cron + pg_net
- [vercel.com docs via WebSearch](https://vercel.com/docs/plans/hobby) — Vercel Hobby = 1x/dia para cron
- [github.com/gitbrent/xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) — fork com cell styles

### Tertiary (LOW confidence)
- WebSearch sobre compatibilidade @react-pdf/renderer + Next.js 15 — múltiplas fontes convergindo mas não verificado na codebase
- WebSearch sobre pdfkit serverless compatibility — fontes credíveis mas não testado no projeto

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — libs verificadas via npm view + runtime test no projeto
- Architecture: HIGH — baseada em patterns existentes do codebase lido diretamente
- Pitfalls: HIGH para xlsx styles (verificado), MEDIUM para @react-pdf (múltiplas fontes), MEDIUM para Vercel Cron (docs oficiais)

**Research date:** 2026-06-17
**Valid until:** 2026-09-17 (90 dias — stack estável, mas verificar @react-pdf/renderer se substituído)
