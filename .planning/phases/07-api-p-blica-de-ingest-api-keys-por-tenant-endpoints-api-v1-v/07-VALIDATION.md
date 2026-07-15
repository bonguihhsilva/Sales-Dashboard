---
phase: 7
slug: api-p-blica-de-ingest-api-keys-por-tenant-endpoints-api-v1-v
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-14
updated: 2026-07-14
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.9 (environment: node, alias `@` → src) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run <arquivo específico>` |
| **Full suite command** | `npm run test` (= `vitest run`) |
| **Estimated runtime** | ~10-20 segundos (unit + route tests com mocks) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run <arquivo da task>`
- **After every plan wave:** Run `npm run test` completo
- **Before `/gsd-verify-work`:** Full suite verde + `npm run build` (exigido por CLAUDE.md)
- **Max feedback latency:** ~20 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | D-02,09,10,11,12,15 | T-7-07/09 | RLS deny-all em api_keys; tenant_isolation em stock_snapshots; sem custo/loja | structure | `grep` de estrutura da migration | ❌ W0 | ⬜ pending |
| 7-01-02 | 01 | 1 | — | — | Schema aplicado ao banco (blocking push) | manual | painel Supabase + `grep api_keys src/types/supabase.ts` | ❌ W0 | ⬜ pending |
| 7-02-01 | 02 | 1 | D-01,04 | T-7-01/03/05 | SHA-256 + timingSafeEqual; revoked_at checado; sem log da key | unit | `npx vitest run src/lib/auth/apiKey.test.ts` | ❌ W0 | ⬜ pending |
| 7-02-02 | 02 | 1 | D-08 | — | Period resolvido 1x por mês | unit | `npx vitest run src/lib/periods/ensurePeriod.test.ts` | ❌ W0 | ⬜ pending |
| 7-02-03 | 02 | 1 | D-05,06,13 | T-7-08/11 | /api/v1 liberado no middleware; sem sanitizeString em dados | unit+build | `npx vitest run && grep '/api/v1' src/middleware.ts` | ❌ W0 | ⬜ pending |
| 7-03-01 | 03 | 2 | D-05,06,07,13,15 | T-7-02/04 | 401 sem key; limite 500; tenant do contexto | unit | `npx vitest run src/__tests__/api-v1-sales.test.ts` | ❌ W0 | ⬜ pending |
| 7-03-02 | 03 | 2 | D-05,06,07,08,13,14,15 | T-7-02/04/06/12 | tenant sempre de ctx; upsert idempotente; query parametrizada | unit+build | `npx vitest run src/__tests__/api-v1-sales.test.ts && npm run build` | ❌ W0 | ⬜ pending |
| 7-04-01 | 04 | 2 | D-09,11,12,13,15 | T-7-02/13 | 401 sem key; custo ignorado; tenant do contexto | unit | `npx vitest run src/__tests__/api-v1-stock.test.ts` | ❌ W0 | ⬜ pending |
| 7-04-02 | 04 | 2 | D-09,10,11,12,13,14,15 | T-7-02/04/06/13 | upsert por tenant+produto+dia; sem custo/loja no write | unit+build | `npx vitest run src/__tests__/api-v1-stock.test.ts && npm run build` | ❌ W0 | ⬜ pending |
| 7-05-01 | 05 | 2 | D-01,03,04 | T-7-07/03 | guard super_admin em toda action; key_hash nunca ao client | build+grep | `grep super_admin ... && npm run build` | N/A | ⬜ pending |
| 7-05-02 | 05 | 2 | D-16 | T-7-03 | exibição única da rawKey; lista sem key crua | build+grep | `grep ApiKeysManager src/.../page.tsx && npm run build` | N/A | ⬜ pending |
| 7-05-03 | 05 | 2 | D-01,03,04,16 | T-7-05 | curl e2e: 200 com key, 401 sem key (não 307), 401 após revogar | manual | checkpoint humano (curl) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/auth/apiKey.test.ts` — geração e verificação de key (D-01), timingSafeEqual, revogada (Plan 02 T1)
- [ ] `src/lib/periods/ensurePeriod.test.ts` — resolução/criação automática de period (D-08), após extrair de ensure-period/route.ts (Plan 02 T2)
- [ ] `src/__tests__/api-v1-sales.test.ts` — batch, idempotência, validação parcial, tenant do contexto (D-05/06/07/13/15) (Plan 03 T1)
- [ ] `src/__tests__/api-v1-stock.test.ts` — upsert diário, validação parcial, custo ignorado (D-11/12/13) (Plan 04 T1)
- [ ] Padrão de mock de rota HTTP (`vi.mock('@/lib/supabase/admin')` com fake client em memória) — estabelecido pela primeira vez no projeto nesta fase (Plan 03 T1)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Schema aplicado ao banco remoto | — | `supabase db push` pode exigir prompt interativo; MCP apply_migration falha neste projeto | Plan 01 Task 2: rodar push, confirmar tabelas no painel + tipos regenerados |
| Fluxo e2e de key (emitir/usar/revogar) | D-01,03,16 | Exibição única da key crua e autenticação HTTP real via curl não são cobríveis por unit test com mocks | Plan 05 Task 3: seguir how-to-verify (UI + curl contra /api/v1/*) |
| Middleware não redireciona /api/v1 sem sessão | Pitfall 1 | Comportamento de middleware é difícil de exercitar em Vitest puro | curl `-i` a /api/v1/sales sem auth → 401 JSON, não 307 (Plan 05 Task 3 passo 5) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies / manual justificado
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
