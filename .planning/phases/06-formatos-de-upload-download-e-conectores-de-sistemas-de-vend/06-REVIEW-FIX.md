---
phase: 06
fixed_at: 2026-06-18T00:00:00Z
review_path: .planning/phases/06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend/06-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-06-18
**Source review:** .planning/phases/06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (2 Critical, 5 Warning)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Rota GET /relatorio-excel — acesso não-autenticado não é bloqueado

**Files modified:** `src/app/api/admin/relatorio-excel/route.ts`
**Commit:** 9922709
**Applied fix:** Replaced the split `!user` / `profile?.role || ''` guards with a single `if (!user || !profile)` returning 401, then a strict `profile.role` check (no optional chaining). This eliminates the edge case where a non-null user with a null profile would crash at `profile.tenant_id`.

---

### CR-02: export-pdf.ts — overflow silencioso para listas longas de vendedores

**Files modified:** `src/lib/export-pdf.ts`
**Commit:** 3fc17c9
**Applied fix:** Extracted table header drawing into a `drawTableHeader(y)` helper. The vendor loop now tracks `rowsOnPage` and calls `doc.addPage()` + redraws the header whenever the page limit is reached. Footer Y updated to use `currentTableTop + rowsOnPage` instead of the removed `tableTop` variable. Also fixed a stale `tableTop` reference in the footer line.

---

### WR-01: sync-connector — CRON_SECRET vazio aceito como autenticado

**Files modified:** `src/app/api/admin/sync-connector/route.ts`
**Commit:** 0f11410
**Applied fix:** Added `if (cronSecret && cronSecret.length < 16) console.warn(...)` after reading `CRON_SECRET`, so misconfigured short secrets surface at runtime instead of silently disabling cron auth.

---

### WR-02: relatorio-excel — parseInt sem validação de NaN

**Files modified:** `src/app/api/admin/relatorio-excel/route.ts`
**Commit:** 9922709
**Applied fix:** Moved period parsing to a single `parseInt(rawPeriod)` with `isNaN || <= 0` guard returning 400. Replaced the four downstream `parseInt(periodId)` call sites with the already-parsed `periodId` number directly.

---

### WR-03: UploadModal — erro silencioso no insert de goals placeholder

**Files modified:** `src/app/dashboard/UploadModal.tsx`
**Commit:** 52c4e7e
**Applied fix:** Destructured `{ error: goalError }` from the `goals.insert()` call and added `console.warn` when `goalError` is truthy, making insert failures visible without blocking the upload flow.

---

### WR-04: relatorios/page.tsx — redirect sem verificação de autenticação

**Files modified:** `src/app/dashboard/relatorios/page.tsx`
**Commit:** 17348c9
**Applied fix:** Replaced the `if (user) { ... }` block with an upfront `if (!user || !profile) redirect('/login')` guard, followed by a direct `profile.role === 'vendedor'` check. This matches the belt-and-suspenders pattern used in all other admin pages.

---

### WR-05: export-pdf.ts — uso de `fs.existsSync` em ambiente serverless

**Files modified:** `src/lib/export-pdf.ts`
**Commit:** 3fc17c9
**Applied fix:** Added a module-level `_logoExists: boolean | null = null` cache and a `logoExists()` function that calls `fs.existsSync` only on the first invocation per cold start. Replaced the inline `const logoExists = fs.existsSync(LOGO_PATH)` call site with `logoExists()`.

---

_Fixed: 2026-06-18_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
