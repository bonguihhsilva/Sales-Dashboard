---
phase: "06"
plan: "01"
subsystem: upload-fingerprint
tags: [vitest, fingerprint, upload, UploadModal, tdd]
dependency_graph:
  requires: []
  provides:
    - src/lib/fingerprint.ts (detectFileSystem, DetectedSystem)
    - vitest infra (vitest.config.ts, scripts.test)
    - parse-upload detected_system field
    - UploadModal badge + dropdown fallback
  affects:
    - src/app/api/admin/parse-upload/route.ts
    - src/app/dashboard/UploadModal.tsx
tech_stack:
  added:
    - vitest 4.1.9 (devDependency — framework de testes unitários)
  patterns:
    - TDD RED/GREEN para fingerprint.ts
    - Buffer analysis (magic bytes + HTML heuristic) para detecção de sistema
key_files:
  created:
    - vitest.config.ts
    - src/lib/fingerprint.ts
    - src/__tests__/fingerprint.test.ts
    - src/__tests__/export.test.ts
    - src/__tests__/connectors.test.ts
  modified:
    - src/app/api/admin/parse-upload/route.ts
    - src/app/dashboard/UploadModal.tsx
    - package.json
decisions:
  - "detectFileSystem retorna null (não 'generic') para CSV/XLSX sem assinatura conhecida — força dropdown D-06"
  - "looksLikeCecHtml requer 3+ linhas de dado para evitar falsos positivos em HTMLs com pouca data"
  - "UploadModal reseta detectedSystem + selectedSystem em handleFileChange E handleClose"
metrics:
  duration_minutes: 8
  completed_date: "2026-06-17"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 3
---

# Phase 06 Plan 01: Fingerprint de Upload e Infraestrutura de Testes — Summary

**One-liner:** Vitest configurado com 7 testes unitários passando para `detectFileSystem()` — detecção CEC por análise de buffer HTML (19 colunas, col[0] numérico) com fallback dropdown para formatos desconhecidos.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wave 0 — Infraestrutura de testes e fingerprint.ts | b738b58 | vitest.config.ts, src/lib/fingerprint.ts, src/__tests__/*.test.ts, package.json |
| 2 | Estender parse-upload e UploadModal com detecção de sistema | 68c49a7 | src/app/api/admin/parse-upload/route.ts, src/app/dashboard/UploadModal.tsx |

## What Was Built

### fingerprint.ts

`detectFileSystem(buffer, filename)` analisa o buffer em camadas:

1. **Magic bytes**: detecta ZIP/XLSX pelos bytes `0x50 0x4B` — retorna `null` (stubs Pegasus/ISRP pendentes)
2. **HTML heuristic**: detecta `<!doctype`, `<html` ou `<table` nos primeiros 512 bytes
3. **looksLikeCecHtml**: varrida por regex de `<tr>/<td>` — requer 3+ linhas com 19+ colunas onde col[0] é numérico de 4-6 dígitos → retorna `'cec'`
4. **CSV/extensão desconhecida**: retorna `null` → força dropdown (D-06)

### parse-upload/route.ts

Adicionado import de `detectFileSystem` e campo `detected_system` na resposta JSON após parse e detecção de período. O campo é `DetectedSystem | null` — quando `null`, o UploadModal exibe o dropdown de seleção manual.

### UploadModal.tsx

- Dois novos estados: `detectedSystem: string | null` e `selectedSystem: string`
- Após parse bem-sucedido: `setDetectedSystem(data.detected_system ?? null)` e `setSelectedSystem(data.detected_system ?? 'generic')`
- Badge "Formato detectado: CEC (Relatório HTML)" quando `detectedSystem !== null`
- Dropdown CEC/Pegasus/ISRP/Genérico quando `detectedSystem === null`
- Reset em `handleFileChange` e `handleClose`
- Validação em `handleUpload`: bloqueia se `detectedSystem === null && !selectedSystem`

## Testes

```
Test Files  1 passed | 2 skipped (3)
Tests       7 passed | 4 todo (11)
```

- 7 testes fingerprint: PASS
- 4 stubs (export.test.ts × 2, connectors.test.ts × 2): TODO — cobertos nos planos 06-02 e 06-03

## Deviations from Plan

None — plano executado exatamente como escrito.

## Known Stubs

| Stub | Arquivo | Linha | Razão |
|------|---------|-------|-------|
| `return null` para XLSX/ZIP | src/lib/fingerprint.ts | 21-24 | Assinatura Pegasus/ISRP ainda não disponível (D-03) |
| `return null` para CSV | src/lib/fingerprint.ts | 27-31 | Idem — plano 06-03 implementará quando credenciais chegarem |
| `it.todo` XLSX bold headers | src/__tests__/export.test.ts | 4 | Implementado no plano 06-02 |
| `it.todo` PDF Buffer | src/__tests__/export.test.ts | 8 | Implementado no plano 06-02 |
| `it.todo` PEG_ prefix | src/__tests__/connectors.test.ts | 4 | Implementado no plano 06-03 |
| `it.todo` ISRP_ prefix | src/__tests__/connectors.test.ts | 5 | Implementado no plano 06-03 |

Stubs são intencionais — D-03 documenta que credenciais Pegasus/ISRP não estão disponíveis. O plano 06-01 entrega apenas detecção CEC + infraestrutura de testes, conforme escopo definido.

## Threat Surface

Sem nova superfície de ameaça além do mapeado no `<threat_model>` do plano:

- T-06-01-01: `looksLikeCecHtml` analisa apenas via regex de texto, não descompacta XLSX durante fingerprint — previne ZIP bomb.
- T-06-01-02: Limite 10MB e `strictRateLimiter` já presentes na rota — mantidos.
- T-06-01-03: `selectedSystem` é metadado de UI apenas — não altera lógica de parse no servidor.
- T-06-01-04: `detected_system` expõe apenas `'cec'` ou `null` — sem dados sensíveis.

## Self-Check: PASSED

```
FOUND: vitest.config.ts
FOUND: src/lib/fingerprint.ts
FOUND: src/__tests__/fingerprint.test.ts
FOUND: src/__tests__/export.test.ts
FOUND: src/__tests__/connectors.test.ts
FOUND: commit b738b58
FOUND: commit 68c49a7
```
