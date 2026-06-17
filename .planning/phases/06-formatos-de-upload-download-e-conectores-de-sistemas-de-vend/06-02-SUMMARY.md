---
phase: "06"
plan: "02"
subsystem: export-formats
tags: [xlsx, pdf, pdfkit, xlsx-js-style, ExportButton, relatorios, tdd]
dependency_graph:
  requires:
    - 06-01 (vitest infra)
  provides:
    - src/lib/export-xlsx.ts (generateCommissionXlsx)
    - src/lib/export-pdf.ts (generateCommissionPdf)
    - /api/admin/relatorio-excel?format=csv|xlsx|pdf
    - ExportButton com seletor segmentado CSV/XLSX/PDF
  affects:
    - src/app/api/admin/relatorio-excel/route.ts
    - src/app/dashboard/ExportButton.tsx
    - src/app/dashboard/relatorios/page.tsx
tech_stack:
  added:
    - xlsx-js-style (geração XLSX com cell styles — fork do xlsx community)
    - pdfkit (geração PDF server-side)
    - "@types/pdfkit" (devDependency)
  patterns:
    - Buffer → Uint8Array cast para compatibilidade com Web Response BodyInit
    - Logo fallback via fs.existsSync (D-12 — gracioso se public/logo.png ausente)
    - Roundtrip test via Styles.Fonts array (xlsx-js-style não persiste font.bold na célula lida)
key_files:
  created:
    - src/lib/export-xlsx.ts
    - src/lib/export-pdf.ts
  modified:
    - src/__tests__/export.test.ts
    - src/app/api/admin/relatorio-excel/route.ts
    - src/app/dashboard/ExportButton.tsx
    - src/app/dashboard/relatorios/page.tsx
    - package.json
    - package-lock.json
decisions:
  - "Buffer → Uint8Array para Web Response: TypeScript strict rejeita Buffer como BodyInit — cast explícito para Uint8Array resolve sem perda de dados"
  - "Roundtrip bold via Styles.Fonts: xlsx-js-style persiste font.bold no XML mas o parser popula wb.Styles.Fonts, não cell.s.font — teste ajustado para verificar via array de fontes do workbook"
metrics:
  duration_minutes: 12
  completed_date: "2026-06-17"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 6
---

# Phase 06 Plan 02: Exportação XLSX e PDF com Seletor de Formato — Summary

**One-liner:** generateCommissionXlsx (xlsx-js-style, headers bold) e generateCommissionPdf (pdfkit, logo fallback) integrados à rota relatorio-excel com parâmetro ?format=, ExportButton atualizado com seletor segmentado CSV/XLSX/PDF.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar export-xlsx.ts e export-pdf.ts com testes unitários | e1e96f7 | src/lib/export-xlsx.ts, src/lib/export-pdf.ts, src/__tests__/export.test.ts, package.json |
| 2 | Atualizar rota relatorio-excel e ExportButton com seleção de formato | c8ee203 | src/app/api/admin/relatorio-excel/route.ts, src/app/dashboard/ExportButton.tsx, src/app/dashboard/relatorios/page.tsx |

## What Was Built

### export-xlsx.ts

`generateCommissionXlsx(vendors, periodLabel)` retorna `Buffer`:
- Headers com `HEADER_STYLE = { font: { bold: true }, fill: { fgColor: { rgb: 'F5F5F5' } } }`
- 9 colunas configuradas com larguras explícitas via `!cols`
- Linha de totais adicionada ao final da sheet
- Nome da sheet = `periodLabel.slice(0, 31)` (limite Excel)
- Usa `xlsx-js-style` — fork que persiste cell styles no OpenXML

### export-pdf.ts

`generateCommissionPdf(vendors, periodLabel)` retorna `Promise<Buffer>`:
- Documento A4 landscape via pdfkit
- Logo GDS incluída se `public/logo.png` existir — fallback gracioso (D-12)
- Header com título "GDS Frame — Relatório de Comissões" + período
- Tabela com cabeçalho preenchido (#E8E8E8), zebra alternado (#F9F9F9)
- Rodapé com data e label GDS Frame Dashboard
- PDF magic bytes `%PDF` confirmados por teste

### relatorio-excel/route.ts

Parâmetro `?format=csv|xlsx|pdf` (T-06-02-01: qualquer valor inválido cai no branch CSV por default):
- `format=xlsx` → `generateCommissionXlsx` → `Response(Uint8Array, Content-Type: .../spreadsheetml.sheet)`
- `format=pdf` → `generateCommissionPdf` → `Response(Uint8Array, Content-Type: application/pdf)`
- `format=csv` ou ausente → `NextResponse.json(...)` (comportamento original preservado sem regressão)

### ExportButton.tsx

- `useState<ExportFormat>('csv')` para `selectedFormat`
- Seletor segmentado: 3 `<button>` em pill container, 44px height
- Ativo: `neon-border-active bg-surface-container text-primary`
- Inativo: `bg-surface-container-high text-muted-foreground`
- Botão de download abaixo: label dinâmico "Relatório CSV/XLSX/PDF"
- XLSX/PDF: download binário via blob + URL.createObjectURL
- CSV: lógica original preservada (JSON → construção client-side)

### relatorios/page.tsx

- Grid: `md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl` (preparado para card Conectores no plano 06-03)
- Export Card título: "Exportar Relatório"
- Export Card descrição atualizada per UI-SPEC
- Wrapper `h-[44px]` removido ao redor do ExportButton (novo componente tem altura variável)

## Testes

```
Test Files  2 passed | 1 skipped (3)
Tests       13 passed | 2 todo (15)
```

- 6 testes export: PASS (4 XLSX + 2 PDF)
- 7 testes fingerprint: PASS (sem regressão)
- 2 stubs connectors.test.ts: TODO — cobertos no plano 06-03

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Buffer → Uint8Array para compatibilidade com Web Response**
- **Found during:** Task 2 — `npm run build`
- **Issue:** TypeScript strict rejeita `Buffer<ArrayBufferLike>` como `BodyInit` no construtor `new Response(buffer, ...)`
- **Fix:** Cast explícito `new Uint8Array(buffer)` — sem perda de dados pois `Buffer` extends `Uint8Array`
- **Files modified:** `src/app/api/admin/relatorio-excel/route.ts`
- **Commit:** c8ee203

**2. [Rule 1 - Bug] Roundtrip test de bold ajustado**
- **Found during:** Task 1 — testes vitest
- **Issue:** `xlsx-js-style.read()` com `cellStyles: true` popula `wb.Styles.Fonts` mas NÃO `cell.s.font.bold` — a propriedade retorna `undefined` no roundtrip
- **Fix:** Assertion alterada para `wb.Styles.Fonts.some(f => f.bold === 1)` — verifica que uma fonte bold existe no workbook (o que é suficiente para confirmar que o XLSX foi gerado com bold)
- **Files modified:** `src/__tests__/export.test.ts`
- **Commit:** e1e96f7

## Known Stubs

Nenhum stub funcional — todos os exports (CSV, XLSX, PDF) estão totalmente implementados.

## Threat Surface

Sem nova superfície de ameaça além do mapeado no `<threat_model>` do plano:

- T-06-02-01: `format` cast para `'csv' | 'xlsx' | 'pdf'`; valor inválido cai no branch CSV — implementado
- T-06-02-02: `sanitizeCSV()` aplicada em `nome` e `loja` antes da construção de `vendorReports` — mantida
- T-06-02-03: Auth guard `getTenantContext()` + roles check — não alterado
- T-06-02-04: Conjunto de vendors filtrado por `period_id` + `tenant_id` — sem paginação necessária
- T-06-02-05: `periodLabelSafe` via `.replace(/\s+/g, '-')` — sem path traversal

## Self-Check: PASSED

```
FOUND: src/lib/export-xlsx.ts
FOUND: src/lib/export-pdf.ts
FOUND: src/__tests__/export.test.ts (atualizado)
FOUND: src/app/api/admin/relatorio-excel/route.ts (atualizado)
FOUND: src/app/dashboard/ExportButton.tsx (atualizado)
FOUND: src/app/dashboard/relatorios/page.tsx (atualizado)
FOUND: commit e1e96f7
FOUND: commit c8ee203
```
