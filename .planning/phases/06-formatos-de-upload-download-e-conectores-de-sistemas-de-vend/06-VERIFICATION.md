---
phase: 06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend
verified: 2026-06-17T17:26:00Z
status: human_needed
score: 19/19 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Upload de arquivo HTML CEC real e verificar badge 'Formato detectado: CEC' no UploadModal"
    expected: "Badge renderiza com texto 'Formato detectado: CEC (Relatório HTML)' após parse do arquivo"
    why_human: "Comportamento visual do estado React após fetch — não testável estaticamente"
  - test: "Upload de arquivo CSV qualquer e verificar dropdown de seleção manual"
    expected: "Dropdown aparece com opções CEC/Pegasus/ISRP/Genérico e seleção persiste ao clicar em Fazer Upload"
    why_human: "Interação sequencial de estado UI + validação de seleção não verificável sem browser"
  - test: "Download de relatório XLSX na página /dashboard/relatorios — verificar arquivo abre no Excel/LibreOffice com headers em negrito"
    expected: "Arquivo .xlsx abre, primeira linha tem texto em bold visível, colunas com largura adequada, sheet nomeada com o período"
    why_human: "Validação visual do resultado do XLSX em editor externo"
  - test: "Download de relatório PDF na página /dashboard/relatorios — verificar conteúdo do PDF"
    expected: "PDF abre com header 'GDS Frame — Relatório de Comissões', período visível, tabela legível com zebra, rodapé com data"
    why_human: "Validação visual do conteúdo do PDF gerado"
  - test: "Botão 'Forcar Sincronizacao' no ConnectorsCard — verificar toast diferenciado"
    expected: "Para conector não configurado: nenhum toast ou toast info. Para stub: toast.info com mensagem 'aguarda credenciais da API'"
    why_human: "Comportamento de toast depende de chamada de rede real e estado do banco"
---

# Phase 06: Formatos de Upload/Download e Conectores — Verification Report

**Phase Goal:** Adicionar detecção automática de formato por fingerprint no upload, exports em XLSX formatado e PDF, e arquitetura de conectores REST para Pegasus e ISRP com stubs prontos para implementação quando as credenciais chegarem.
**Verified:** 2026-06-17T17:26:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Arquivo HTML CEC com 19+ colunas é detectado automaticamente como sistema 'cec' | VERIFIED | `detectFileSystem` em `fingerprint.ts` — teste fingerprint-CEC passa; looksLikeCecHtml requer 3+ rows, 19+ cols, col[0] numérico 4-6 dígitos |
| 2 | Arquivo CSV genérico retorna null e UploadModal exibe dropdown de seleção manual | VERIFIED | `fingerprint.ts` retorna null para CSV; `UploadModal.tsx:298` renderiza dropdown quando `detectedSystem === null` |
| 3 | API parse-upload retorna campo detected_system na resposta | VERIFIED | `parse-upload/route.ts:48` — `detected_system: detectedSystem` no NextResponse.json |
| 4 | UploadModal exibe badge 'Formato detectado: CEC' quando sistema detectado | VERIFIED | `UploadModal.tsx:291-294` — badge com texto "Formato detectado: CEC (Relatório HTML)" |
| 5 | UploadModal exibe dropdown com CEC/Pegasus/ISRP/Genérico quando detected_system é null | VERIFIED | `UploadModal.tsx:297-311` — `<select>` com 4 opções |
| 6 | Suite vitest executa sem erros (24 testes passam) | VERIFIED | `npx vitest run` → 3 arquivos, 24/24 testes PASS, 0 falhas |
| 7 | Download de XLSX gera arquivo com headers em negrito e larguras de coluna | VERIFIED | `export-xlsx.ts` usa xlsx-js-style com HEADER_STYLE={font:{bold:true}}; teste roundtrip via Styles.Fonts passa |
| 8 | Download de PDF gera arquivo com header 'GDS Frame — Relatório de Comissões', período e tabela | VERIFIED | `export-pdf.ts:57-62` — título hardcoded; magic bytes %PDF confirmados por teste |
| 9 | PDF inclui logo GDS com fallback gracioso se public/logo.png ausente | VERIFIED | `export-pdf.ts:48` — `fs.existsSync(LOGO_PATH)` antes de `doc.image()` |
| 10 | Rota /api/admin/relatorio-excel aceita ?format=csv|xlsx|pdf e retorna arquivo binário correto | VERIFIED | Route importa e chama `generateCommissionXlsx` e `generateCommissionPdf`; Content-Type `application/vnd.openxmlformats...` e `application/pdf` definidos |
| 11 | ExportButton mostra seletor CSV/XLSX/PDF com tab ativo destacado | VERIFIED | `ExportButton.tsx:107-108` — `neon-border-active bg-surface-container text-primary` quando `selectedFormat === f` |
| 12 | Download CSV funciona sem regressão | VERIFIED | Lógica CSV original preservada no branch else do ExportButton; rota retorna NextResponse.json quando format=csv |
| 13 | Tabelas connectors e connector_id_mappings existem no banco com RLS habilitado | VERIFIED | Migration `20260617000001_connectors.sql` — CREATE TABLE + ALTER TABLE ENABLE ROW LEVEL SECURITY em ambas |
| 14 | PegasusConnector e ISRPConnector existem como stubs que lançam Error claro com TODO | VERIFIED | `pegasus.ts:11` e `isrp.ts:11` — TODO com 5 perguntas; throw new Error com mensagem 'nao implementado'; testes de stub passam |
| 15 | Rota POST /api/admin/sync-connector aceita trigger manual e retorna status do sync | VERIFIED | `sync-connector/route.ts` — POST handler completo com validação, query na tabela connectors, retorno de status |
| 16 | Rota aceita chamada autenticada via CRON_SECRET para agendamento futuro | VERIFIED | `sync-connector/route.ts:14-21` — `isCronCall` verifica `Authorization: Bearer ${cronSecret}` |
| 17 | ConnectorsCard aparece na página de relatórios com status de cada sistema | VERIFIED | `relatorios/page.tsx:8,86` — import e `<ConnectorsCard />` no grid lg:grid-cols-3 |
| 18 | Botão 'Forcar Sincronizacao' chama a rota e exibe toast diferenciado para stub | VERIFIED | `ConnectorsCard.tsx:80` — `toast.info` para status 'stub', `toast.error` para falha real |
| 19 | vendor_id importado via conector recebe prefixo de sistema (CEC_, PEG_, ISRP_) | VERIFIED | `base.ts:42` — `applySystemPrefix(id, system)` idempotente; testes de prefixo passam (CEC_123, PEG_456, ISRP_789) |

**Score:** 19/19 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `vitest.config.ts` | Configuração do framework de testes | VERIFIED | Existe na raiz com alias @/* |
| `src/__tests__/fingerprint.test.ts` | Testes D-05 e D-06 (fingerprint CEC e fallback null) | VERIFIED | 7 testes, todos PASS |
| `src/__tests__/export.test.ts` | Testes XLSX e PDF | VERIFIED | 6 testes (4 XLSX + 2 PDF), todos PASS |
| `src/__tests__/connectors.test.ts` | Testes de prefixo e registry | VERIFIED | 11 testes, todos PASS |
| `src/lib/fingerprint.ts` | detectFileSystem(buffer, filename) → DetectedSystem | VERIFIED | Exporta tipo e função; looksLikeCecHtml implementado |
| `src/app/api/admin/parse-upload/route.ts` | Campo detected_system na resposta | VERIFIED | Importa detectFileSystem, inclui detected_system no response |
| `src/app/dashboard/UploadModal.tsx` | Badge + dropdown fallback | VERIFIED | Estados detectedSystem/selectedSystem, badge e select no JSX |
| `src/lib/export-xlsx.ts` | generateCommissionXlsx(vendors, periodLabel) → Buffer | VERIFIED | Exporta função, usa xlsx-js-style, headers bold, 9 colunas |
| `src/lib/export-pdf.ts` | generateCommissionPdf(vendors, periodLabel) → Promise<Buffer> | VERIFIED | Exporta função async, pdfkit, fs.existsSync para logo |
| `src/app/api/admin/relatorio-excel/route.ts` | GET com ?format=csv|xlsx|pdf | VERIFIED | Importa e chama as duas libs; Content-Type correto por formato |
| `src/app/dashboard/ExportButton.tsx` | Seletor de formato segmentado + download | VERIFIED | selectedFormat state, 3 tabs, lógica de download diferenciada |
| `supabase/migrations/20260617000001_connectors.sql` | DDL com RLS | VERIFIED | CREATE TABLE + ENABLE ROW LEVEL SECURITY + policies de tenant |
| `src/lib/connectors/base.ts` | Interfaces + applySystemPrefix + SYSTEM_PREFIXES | VERIFIED | Exporta BaseConnector, ConnectorConfig, SyncResult, SYSTEM_PREFIXES, applySystemPrefix |
| `src/lib/connectors/registry.ts` | getConnector(system) | VERIFIED | Exporta getConnector, REGISTRY estático com Pegasus e ISRP |
| `src/lib/connectors/pegasus.ts` | PegasusConnector stub | VERIFIED | implements BaseConnector, throw com TODO detalhado |
| `src/lib/connectors/isrp.ts` | ISRPConnector stub | VERIFIED | implements BaseConnector, throw com TODO detalhado |
| `src/app/api/admin/sync-connector/route.ts` | POST com auth dupla e lógica de sync | VERIFIED | CRON_SECRET + getTenantContext + getConnector + error handling |
| `src/app/dashboard/ConnectorsCard.tsx` | Status por sistema + botão sync | VERIFIED | ConnectorStatus states, SYSTEMS map, handleSync com Promise.allSettled |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `parse-upload/route.ts` | `src/lib/fingerprint.ts` | import detectFileSystem | WIRED | `import { detectFileSystem } from '@/lib/fingerprint'`; chamada em linha 43 |
| `UploadModal.tsx` | detected_system campo da resposta | data.detected_system | WIRED | `setDetectedSystem(data.detected_system ?? null)` |
| `ExportButton.tsx` | `/api/admin/relatorio-excel?format=xlsx|pdf` | fetch com ?format= dinâmico | WIRED | `fetch(`/api/admin/relatorio-excel?period=${activePeriod}&format=${selectedFormat}`)` |
| `relatorio-excel/route.ts` | `src/lib/export-xlsx.ts` | import generateCommissionXlsx | WIRED | Import + chamada em branch format==='xlsx' |
| `relatorio-excel/route.ts` | `src/lib/export-pdf.ts` | import generateCommissionPdf | WIRED | Import + chamada em branch format==='pdf' |
| `sync-connector/route.ts` | `src/lib/connectors/registry.ts` | import getConnector | WIRED | `import { getConnector }` + `getConnector(system as 'pegasus' | 'isrp')` |
| `pegasus.ts` | `src/lib/connectors/base.ts` | implements BaseConnector | WIRED | `export class PegasusConnector implements BaseConnector` |
| `isrp.ts` | `src/lib/connectors/base.ts` | implements BaseConnector | WIRED | `export class ISRPConnector implements BaseConnector` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ExportButton.tsx` | activePeriod (prop) | URL searchParams via parent page | Sim — passed from server component | FLOWING |
| `ConnectorsCard.tsx` | states (ConnectorState) | fetch POST /api/admin/sync-connector | Sim — resposta da rota com query na tabela connectors | FLOWING |
| `export-xlsx.ts` | vendors (VendorReport[]) | Parâmetro da função — dados vêm da rota | Sim — rota busca do banco via Supabase | FLOWING |
| `export-pdf.ts` | vendors (VendorReport[]) | Parâmetro da função — dados vêm da rota | Sim — mesma fonte que XLSX | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| vitest suite completa passa | `npx vitest run` | 3 files, 24/24 passed | PASS |
| npm run build sem erros TypeScript | `npm run build` | Build completo, todas as páginas compiladas | PASS |
| fingerprint.ts exporta DetectedSystem e detectFileSystem | grep nos exports | Linha 1 e 3 confirmadas | PASS |
| parse-upload retorna detected_system | grep no route | Linha 48 confirmada | PASS |
| relatorio-excel aceita format=xlsx | grep generateCommissionXlsx | Import + chamada confirmados | PASS |
| relatorio-excel aceita format=pdf | grep Content-Type pdf | `application/pdf` em linha 143 | PASS |
| connectors com RLS | grep migration SQL | ENABLE ROW LEVEL SECURITY em ambas as tabelas | PASS |

### Requirements Coverage

| Requirement | Source Plan | Descrição | Status | Evidence |
|-------------|------------|-----------|--------|----------|
| D-01 | 06-03 | Pegasus e ISRP têm APIs REST | SATISFIED | PegasusConnector e ISRPConnector implementados como stubs prontos para integração |
| D-02 | 06-03 | Sync híbrido: agendado + manual | SATISFIED | sync-connector POST com CRON_SECRET (agendado) e getTenantContext (manual); ConnectorsCard com botão |
| D-03 | 06-03 | Stubs concretos sem bloquear merge | SATISFIED | fetchTransactions lança Error com TODO — não bloqueia; credenciais não necessárias |
| D-04 | 06-03 | Credenciais via Vault, nunca env hardcoded | SATISFIED | Campo credential_secret_id armazena UUID do Vault; comentário no stub explica acesso |
| D-05 | 06-01 | Detecção automática por fingerprint | SATISFIED | detectFileSystem analisa magic bytes + HTML heuristic; retorna 'cec' ou null |
| D-06 | 06-01 | Fallback gracioso com dropdown | SATISFIED | UploadModal exibe select com 4 opções quando detectedSystem === null |
| D-07 | 06-01 | Novos parsers seguem interface SaleTransaction | SATISFIED | Arquitetura de conectores usa SaleTransaction como tipo de retorno |
| D-08 | 06-03 | Prefixo de sistema como namespace para vendor_id | SATISFIED | applySystemPrefix('id', 'pegasus') → 'PEG_id'; tabela connector_id_mappings criada |
| D-09 | 06-03 | Mesma abordagem para client_id | SATISFIED | SYSTEM_PREFIXES cobre CEC_/PEG_/ISRP_; applySystemPrefix aplicável a client_id também |
| D-10 | 06-02 | XLSX e PDF como opções de export | SATISFIED | ExportButton com 3 tabs; rota aceita ?format=xlsx e ?format=pdf |
| D-11 | 06-02 | Comissões + vendas consolidadas por vendedor | SATISFIED | VendorReport com 9 campos: nome, loja, total_vendido, comissao, meta, bonus, total_ganhos, status |
| D-12 | 06-02 | PDF com header (logo GDS + título + período) | SATISFIED | export-pdf.ts — título "GDS Frame — Relatório de Comissões", fs.existsSync para logo |
| D-13 | 06-02 | XLSX formatado com headers em negrito | SATISFIED | export-xlsx.ts usa xlsx-js-style com HEADER_STYLE={font:{bold:true}} |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/connectors/pegasus.ts` | 11 | `TODO: implementar quando credenciais chegarem` | Info | Intencional — D-03 documenta que credenciais não disponíveis; stub é o comportamento esperado |
| `src/lib/connectors/isrp.ts` | 11 | `TODO: implementar quando credenciais chegarem` | Info | Intencional — mesmo motivo |
| `src/lib/fingerprint.ts` | 21-31 | `return null` para XLSX/ZIP e CSV | Info | Intencional — D-03; assinatura Pegasus/ISRP não disponível |

Nenhum anti-padrão bloqueante encontrado. Os TODOs são intencionais e documentados como stubs por D-03.

### Human Verification Required

#### 1. Badge de detecção no UploadModal

**Test:** Fazer upload de um arquivo HTML do sistema CEC (com 19+ colunas e col[0] numérica)
**Expected:** Badge com texto "Formato detectado: CEC (Relatório HTML)" aparece antes de confirmar o upload
**Why human:** Estado React renderizado após fetch assíncrono — não verificável estaticamente

#### 2. Dropdown fallback no UploadModal

**Test:** Fazer upload de um arquivo CSV genérico; verificar que dropdown aparece e seleção persiste
**Expected:** Select com opções CEC/Pegasus/ISRP/Genérico; upload prossegue normalmente com sistema selecionado
**Why human:** Interação sequencial de UI — file change + state update + seleção + submit

#### 3. Arquivo XLSX gerado é utilizável

**Test:** Na página /dashboard/relatorios, selecionar tab XLSX e clicar em download
**Expected:** Arquivo .xlsx abre no Excel/LibreOffice com headers em negrito na linha 1, colunas com largura adequada, sheet nomeada com o período
**Why human:** Validação do resultado binary em software externo

#### 4. Arquivo PDF gerado é legível

**Test:** Na página /dashboard/relatorios, selecionar tab PDF e clicar em download
**Expected:** PDF abre com título "GDS Frame — Relatório de Comissões", período na segunda linha, tabela com linhas zebrada, rodapé com data
**Why human:** Conteúdo visual do PDF requer inspeção em leitor de PDF

#### 5. ConnectorsCard — toast diferenciado para stub

**Test:** Clicar em "Forcar Sincronizacao" no card de Conectores na página de relatórios
**Expected:** Se conectores não estiverem configurados no banco: status muda para 'not_configured' (sem toast). Se configurados mas stubs: toast.info "aguarda credenciais da API"
**Why human:** Comportamento depende do estado do banco para o tenant ativo; toast é visual

### Gaps Summary

Nenhum gap bloqueante encontrado. Todos os 19 must-haves verificados com código real. Os 5 itens de verificação humana são comportamentos visuais e de UX que requerem inspeção em browser — não são falhas de implementação.

---

_Verified: 2026-06-17T17:26:00Z_
_Verifier: Claude (gsd-verifier)_
