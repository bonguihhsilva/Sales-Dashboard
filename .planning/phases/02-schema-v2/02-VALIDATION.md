---
phase: 2
slug: schema-v2
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | npm run build (TypeScript compiler) + supabase gen types |
| **Config file** | tsconfig.json |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | SCHEMA-01 | — | Migration history repaired before push | manual | `npx supabase migration list --linked` | ✅ | ⬜ pending |
| 2-01-02 | 01 | 1 | SCHEMA-02 | — | tenants table with RLS | manual | SQL Studio verify | ✅ | ⬜ pending |
| 2-01-03 | 01 | 1 | SCHEMA-03 | — | vendas/itens_venda tables | manual | SQL Studio verify | ✅ | ⬜ pending |
| 2-01-04 | 01 | 1 | SCHEMA-04 | — | regras_comissao + comissoes_calculadas | manual | SQL Studio verify | ✅ | ⬜ pending |
| 2-01-05 | 01 | 1 | SCHEMA-05 | — | dashboard_layouts + widget_types | manual | SQL Studio verify | ✅ | ⬜ pending |
| 2-01-06 | 01 | 1 | SCHEMA-06 | — | convites table | manual | SQL Studio verify | ✅ | ⬜ pending |
| 2-01-07 | 01 | 1 | SCHEMA-07 | — | LMS tables (trilhas → gamificacao) | manual | SQL Studio verify | ✅ | ⬜ pending |
| 2-01-08 | 01 | 1 | SCHEMA-08 | — | RLS active, tenant isolation | manual | SQL Studio verify | ✅ | ⬜ pending |
| 2-01-09 | 01 | 1 | SCHEMA-09 | — | Seeds applied (widget_types, LMS, tenant) | manual | SQL Studio SELECT verify | ✅ | ⬜ pending |
| 2-01-10 | 01 | 1 | SCHEMA-10 | — | supabase.ts generated, build passes | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing TypeScript build infrastructure covers all phase requirements.

*Schema validation is manual via Supabase Studio — no automated test framework needed for DDL migrations.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Migrations applied to remote Supabase | SCHEMA-01 | Requires Supabase CLI + network access | Run `npx supabase migration list --linked` and verify all 13 migrations show "Applied" |
| RLS tenant isolation | SCHEMA-08 | Requires two different auth sessions | Create two tenants, insert data as tenant_a, verify tenant_b query returns 0 rows |
| Seeds: 7 widget_types exist | SCHEMA-09 | Requires live DB query | Run `SELECT count(*) FROM widget_types` → expect 7 |
| Seeds: LMS trilha com 8 módulos | SCHEMA-09 | Requires live DB query | Run `SELECT count(*) FROM modulos` → expect 8 |
| Seeds: tenant GDS Interno | SCHEMA-09 | Requires live DB query | Run `SELECT * FROM tenants WHERE slug = 'gds-interno'` → expect 1 row |
| supabase.ts reflects live schema | SCHEMA-10 | Requires CLI + network | Run `supabase gen types typescript --project-id zsczxblhtdhpdqvkpuwz` and verify no drift |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
