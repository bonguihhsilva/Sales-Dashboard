---
status: partial
phase: 06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend
source: [06-VERIFICATION.md]
started: 2026-06-17T00:00:00Z
updated: 2026-06-17T00:00:00Z
---

## Current Test

number: 1
name: Badge de formato detectado após upload CEC
expected: |
  Após selecionar um arquivo HTML do sistema CEC, o UploadModal exibe badge "Formato detectado: CEC" (sem dropdown)
awaiting: user response

## Tests

### 1. Badge de formato detectado após upload CEC
expected: Após selecionar um arquivo HTML do sistema CEC, o UploadModal exibe badge "Formato detectado: CEC" (sem dropdown)
result: [pending]

### 2. Dropdown fallback após upload de CSV
expected: Após selecionar um arquivo CSV (formato desconhecido), o UploadModal exibe dropdown com opções CEC/Pegasus/ISRP/Genérico
result: [pending]

### 3. Download XLSX abre com headers em negrito no Excel
expected: Ao clicar em "XLSX" no ExportButton e baixar o arquivo, o Excel exibe a primeira linha com fonte bold nos cabeçalhos de coluna
result: [pending]

### 4. Download PDF abre com layout correto
expected: Ao clicar em "PDF" no ExportButton e baixar o arquivo, o PDF exibe header "GDS Frame", tabela com dados dos vendedores e rodapé
result: [pending]

### 5. Toast "aguarda credenciais" ao acionar sync de conector stub
expected: Ao clicar no botão de sync em ConnectorsCard para Pegasus ou ISRP, aparece toast.info indicando que o conector aguarda configuração (não toast.error)
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
