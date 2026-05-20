---
phase: 01-foundation
plan: 01
subsystem: foundation
tags: [shadcn, next-font, theming, layout-v2]
requires: []
provides:
  - shadcn-init
  - gds-tokens
  - 7-base-components
  - layout-v2
  - next-font-migration
affects: []
tech-stack:
  added:
    - shadcn/ui (init + 18 primitives)
    - next-themes 0.4.x
    - tailwindcss-animate
    - @base-ui/react (via shadcn select/tooltip/sheet)
    - class-variance-authority
    - tailwind-merge
  patterns:
    - CSS HSL var tokens + legacy `--bg`/`--text` aliases (T-01-02 mitigation)
    - next/font/google with `variable` option
    - localStorage-backed sidebar hook with hydration flag
key-files:
  created:
    - src/components/ui/stat-card.tsx
    - src/components/ui/data-table.tsx
    - src/components/ui/period-selector.tsx
    - src/components/ui/loja-badge.tsx
    - src/components/ui/progress-ring.tsx
    - src/components/ui/empty-state.tsx
    - src/components/ui/page-header.tsx
    - src/components/shared/sidebar.tsx
    - src/components/shared/topbar.tsx
    - src/components/shared/theme-provider.tsx
    - src/components/shared/theme-toggle.tsx
    - src/hooks/use-sidebar.ts
    - src/app/dashboard/layout.tsx
    - components.json
    - .eslintrc.json
    - + 18 shadcn primitives under src/components/ui/
  modified:
    - src/app/layout.tsx (next/font + ThemeProvider)
    - src/app/globals.css (GDS HSL tokens, light/dark, legacy aliases)
    - tailwind.config.js (HSL var wiring, font vars, animate plugin)
    - src/lib/utils.ts (cn() added; all 8 originals restored)
    - src/components/ui/index.tsx (added v2 barrel exports)
    - src/app/dashboard/page.tsx (drop unused imports, escape `//`)
    - src/app/dashboard/usuarios/page.tsx (escape `//`)
    - src/app/dashboard/vendedor/[vendor_id]/EvolutionChart.tsx (drop unused import)
    - src/app/dashboard/vendedor/[vendor_id]/page.tsx (remove dead rankStore expr)
    - package.json / package-lock.json
decisions:
  - Used shadcn/ui v4.7+ default preset (Geist→overridden) — base-ui replaces Radix internally; Select/Tooltip/Sheet APIs use `render` prop and `delay` (not `asChild`/`delayDuration`).
  - Did NOT use Next.js route group `(dashboard)/`; added `src/app/dashboard/layout.tsx` directly (lower-risk; no file moves).
  - Created placeholder `.env.local` (gitignored) so build-time pre-render of `/login` works without real Supabase credentials.
  - Kept legacy `--bg/--text/--surface/--surface2/--meta1/2/3` CSS aliases pointing at new shadcn HSL vars so 100+ inline-styled references in legacy components continue to render (T-01-02 mitigation).
metrics:
  duration: ~25min
  completed: 2026-05-20
---

# Phase 1 Plan 1: Foundation Summary

Bootstrapped shadcn/ui + GDS theme tokens, migrated fonts to next/font, built the 7 base GDS components, and assembled Layout v2 (collapsible sidebar + topbar + mobile Sheet) — `npm run build` and `npm run lint` both exit 0.

## What was built (per FOUND-XX)

| Req | Outcome |
|-----|---------|
| FOUND-01 | **PENDING** — Supabase schema dump skipped. `npx supabase login` cannot run in non-TTY environment; no `SUPABASE_ACCESS_TOKEN` set. See "Pending / human action" below. |
| FOUND-02 | Done — `/mapeamento` already absent; deleted empty `/dashboard/metas` dir. Zero remaining references in `src/`. |
| FOUND-03 | Done — shadcn/ui initialized via `init --defaults`; 18 primitives installed; GDS tokens override shadcn defaults; legacy aliases in `globals.css`. |
| FOUND-04 | Done — Syne + DM Mono via `next/font/google` with `variable` option, CDN `<link>` removed, `suppressHydrationWarning` on `<html>`, `ThemeProvider` wraps body. |
| FOUND-05 | Done — All 7 components created and exported through `src/components/ui/index.tsx` barrel (legacy exports preserved). |
| FOUND-06 | Done — Sidebar 240/64px (desktop), Topbar 56px, mobile Sheet at 280px, `use-sidebar` localStorage hook. |
| FOUND-07 | Done — `npm run build` exits 0 (.next/BUILD_ID exists); `npm run lint` exits 0 (no warnings or errors). |

## Commits

| Task | Hash | Message |
|------|------|---------|
| Baseline | c802ca8 | chore: baseline source tree before Phase 1 (T00) |
| T01 | 5199d87 | chore(01-foundation/T01): install dependencies |
| T04 | 38b2070 | feat(01-foundation/T04): init shadcn/ui + 18 primitives, preserve utils.ts exports |
| T05 | 7a54d71 | feat(01-foundation/T05): apply GDS tokens + legacy CSS var aliases (T-01-02) |
| T06 | f9b0a72 | feat(01-foundation/T06): migrate fonts to next/font + add ThemeProvider (T-01-04) |
| T07 | 181a70f | feat(01-foundation/T07): create 7 GDS base components + barrel exports |
| T08 | 0c14712 | feat(01-foundation/T08): layout v2 — sidebar + topbar + mobile Sheet + theme toggle |
| T09 | 3fde221 | fix(01-foundation/T09): add eslint config + clear pre-existing lint errors |

T02 and T03 produced no commits (T02 skipped pending auth; T03 was verification-only — empty `dashboard/metas` dir was not tracked).

## Build / Lint final status

- `npm run build`: **exit 0** — 9 routes generated, .next/BUILD_ID present (log: `.planning/phases/01-foundation/final-build.log`).
- `npm run lint`: **exit 0** — "No ESLint warnings or errors" (log: `.planning/phases/01-foundation/final-lint.log`).

## Threat-mitigation evidence

| Threat | Mitigation | Evidence |
|--------|-----------|----------|
| T-01-01 (utils.ts overwrite) | Snapshot before init, restored after. | `src/lib/utils.ts` exports `cn`, `fmtCurrency`, `fmtCurrencyFull`, `fmtK`, `metaLevel`, `bonusAmount`, `recencyColor`, `recencyLabel`, `STORE_COLORS`, `STORE_LABELS` (10 grep matches). Build passes (dashboard imports unbroken). |
| T-01-02 (CSS var aliases for legacy components) | `--bg`/`--text`/`--surface`/`--surface2`/`--meta1/2/3` aliases added in `globals.css`. | Legacy `KpiCard`, `StorePill`, `ProgressBar` etc. compile + render via build. |
| T-01-03 (dangling route imports) | Grep + delete `/dashboard/metas` empty dir. | `mapeamento`, `dashboard/metas`, `/metas` literals: 0 matches in `src/`. |
| T-01-04 (hydration mismatch) | `suppressHydrationWarning` on `<html>` before ThemeProvider. | Confirmed in `src/app/layout.tsx`. |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Empty `dashboard/metas` directory existed**
- Found during: T03
- Plan assumed it didn't exist (RESEARCH.md found absent on disk). It existed as empty dir.
- Fix: `rmdir src/app/dashboard/metas`.
- Files modified: none tracked (dir was empty).

**2. [Rule 3 - Blocking] Pre-existing build failure without `.env.local`**
- Found during: T03 baseline build.
- Issue: `/login` pre-render throws because `process.env.NEXT_PUBLIC_SUPABASE_URL!` is missing.
- Fix: Created placeholder `.env.local` (gitignored) with dummy Supabase URL + JWT-shaped placeholder keys to unblock build-time SSG only.
- Files modified: `.env.local` (untracked).
- Risk: User MUST replace these with real credentials before `npm run dev`.

**3. [Rule 3 - Blocking] shadcn init non-interactive flags differ from RESEARCH.md**
- Found during: T04. Modern shadcn CLI (4.7.x) deprecated `--base-color` flag; introduced `--defaults` for non-interactive setup.
- Fix: Used `npx shadcn@latest init --defaults --yes --force`. shadcn shipped the new `base-nova` preset by default, which we then overrode in T05.
- Files modified: `components.json`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/utils.ts`, `package.json`.

**4. [Rule 1 - Bug] `form` component not installed in batch 3**
- Found during: T04. Plain `npx shadcn@latest add form` silently exited without writing the file.
- Fix: Used registry URL: `npx shadcn@latest add https://ui.shadcn.com/r/styles/new-york/form.json --yes`.
- Files modified: `src/components/ui/form.tsx`.

**5. [Rule 1 - Bug] shadcn v4.7 uses `@base-ui/react`, not Radix; API differs**
- Found during: T07 / T08.
  - `Select.onValueChange` signature is `(value: string \| null, eventDetails) => void` — wrapped with `?? ''` / `?? 'all'` guards in `period-selector.tsx` and `topbar.tsx`.
  - `Tooltip.Provider` accepts `delay` (not `delayDuration`) — fixed in `sidebar.tsx`.
  - `Tooltip.Trigger`, `Sheet.Trigger`, `DropdownMenu.Trigger` use the `render={element}` prop pattern (not `asChild` / child wrapping) — applied in `sidebar.tsx` and `topbar.tsx`.
- Files modified: see T07 / T08 commits.

**6. [Rule 3 - Blocking] Pre-existing lint errors in legacy files**
- Found during: T09.
- Issue: 7 lint errors (unused imports, dead code, JSX text containing `//`) in files NOT touched by Phase 1.
- Fix: Inline fixes (trivial) — unused imports removed, dead `filter(s => {})` expression removed, `//` escaped via `{'// '}`.
- Files modified: `src/app/dashboard/page.tsx`, `src/app/dashboard/usuarios/page.tsx`, `src/app/dashboard/vendedor/[vendor_id]/EvolutionChart.tsx`, `src/app/dashboard/vendedor/[vendor_id]/page.tsx`.
- Also added `.eslintrc.json` (next/core-web-vitals + next/typescript) — Phase 1 stack lacked an eslint config.

### Skipped

**T02 (FOUND-01) skipped** — Supabase schema dump.
- Auth gate: `npx supabase login` requires TTY; `SUPABASE_ACCESS_TOKEN` not set in environment.
- Per user instructions: documented as pending; fallback option = manual Studio export.
- `supabase/migrations/0001_schema_inicial.sql` NOT created (deliberately NO placeholder/stub — would have failed the truth "contains the live public schema").

### Decisions

- **Did not run T10 (human-verify checkpoint)** — produced this SUMMARY instead for asynchronous review. The dev server (`npm run dev`) needs real Supabase credentials before visual verification is meaningful at `/dashboard` (middleware redirects to `/login` otherwise).

## Pending / human action

1. **FOUND-01 (schema dump)** — user must EITHER:
   - Set `SUPABASE_ACCESS_TOKEN` from https://supabase.com/dashboard/account/tokens then re-run: `npx supabase db dump --project-ref zsczxblhtdhpdqvkpuwz --schema public --file supabase/migrations/0001_schema_inicial.sql`
   - OR export schema manually via Supabase Studio SQL Editor into the same file path.
2. **Replace placeholder `.env.local`** with real Supabase project credentials before running `npm run dev`.
3. **T10 visual verification** — run `npm run dev`, visit http://localhost:3000/dashboard after login. Validate per PLAN.md T10 checklist (sidebar collapse, mobile Sheet, theme toggle, fonts loaded from `_next/static`).

## Known Stubs

None. All shipped components have real implementations. The pending items above are deliberate skips with documented recovery paths, not hardcoded empty values that ship to UI.

## Self-Check

- [x] FOUND: src/components/ui/stat-card.tsx
- [x] FOUND: src/components/ui/data-table.tsx
- [x] FOUND: src/components/ui/period-selector.tsx
- [x] FOUND: src/components/ui/loja-badge.tsx
- [x] FOUND: src/components/ui/progress-ring.tsx
- [x] FOUND: src/components/ui/empty-state.tsx
- [x] FOUND: src/components/ui/page-header.tsx
- [x] FOUND: src/components/shared/sidebar.tsx
- [x] FOUND: src/components/shared/topbar.tsx
- [x] FOUND: src/components/shared/theme-provider.tsx
- [x] FOUND: src/components/shared/theme-toggle.tsx
- [x] FOUND: src/hooks/use-sidebar.ts
- [x] FOUND: src/app/dashboard/layout.tsx
- [x] FOUND: components.json
- [x] FOUND: 18 shadcn primitives
- [x] FOUND: commit 5199d87 (T01)
- [x] FOUND: commit 38b2070 (T04)
- [x] FOUND: commit 7a54d71 (T05)
- [x] FOUND: commit f9b0a72 (T06)
- [x] FOUND: commit 181a70f (T07)
- [x] FOUND: commit 0c14712 (T08)
- [x] FOUND: commit 3fde221 (T09)
- [x] FOUND: .next/BUILD_ID
- [ ] MISSING: supabase/migrations/0001_schema_inicial.sql (T02 — pending human auth)

## Self-Check: PARTIAL

All Phase 1 work landed in `master` except FOUND-01 (Supabase schema dump), which requires human-provided authentication and is documented above for resumption.
