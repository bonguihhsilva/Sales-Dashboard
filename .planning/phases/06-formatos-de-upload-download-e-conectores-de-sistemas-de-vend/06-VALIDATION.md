---
phase: 6
slug: formatos-de-upload-download-e-conectores-de-sistemas-de-vend
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-17
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existente via Next.js) |
| **Config file** | vitest.config.ts ou jest.config.ts (Wave 0 instala se ausente) |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 1 | REQ-upload-xlsx | — | Arquivo malicioso rejeitado | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 1 | REQ-parse-cec | — | Parser CEC retorna dados corretos | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |
| 6-02-01 | 02 | 2 | REQ-export-pdf | — | PDF gerado com dados corretos | manual | — | — | ⬜ pending |
| 6-02-02 | 02 | 2 | REQ-export-xlsx | — | XLSX gerado com dados corretos | unit | `npm run test -- --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/parser.test.ts` — stubs para parser CEC/Pegasus/ISRP
- [ ] `src/__tests__/export.test.ts` — stubs para export XLSX/PDF
- [ ] vitest instalado se não detectado

*Se já existir infraestrutura: atualizar com novos stubs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF renderiza corretamente | REQ-export-pdf | Requer inspeção visual do arquivo | Gerar PDF, abrir e verificar layout/dados |
| Upload CSV/XLSX real (CEC, Pegasus) | REQ-upload-connectors | Arquivo real necessário | Usar arquivo de amostra dos sistemas de vendas |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
