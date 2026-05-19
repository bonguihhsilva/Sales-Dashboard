# Codebase Concerns

**Analysis Date:** 2026-05-19

---

## Known Bugs

**Broken store-level ranking calculation:**
- Symptoms: `rankStore` variable in vendor detail page is always computed incorrectly — it shows the same index as `rankAll` because the `.filter()` callback is an empty function body that returns `undefined` (falsy), filtering out all items.
- Files: `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx` line 52
- Trigger: View any vendor's `/dashboard/vendedor/[id]` page — the "Ranking" card displays `#rankAll geral` but `rankStore` is never rendered (the bug is latent but wrong data is computed)
- Code: `(allSummaries ?? []).filter(s => {}).findIndex(...)` — the arrow body `{}` returns `undefined`, not a boolean
- Fix: `filter(s => s.store === summary.store).findIndex(...)`

**Hardcoded commission label "0,3%":**
- Symptoms: The commission percentage label is hardcoded as a string `"0,3% × vendas + bônus $${b}"` in two places, independent of the actual `commission_pct` value stored in `vendor_summary`.
- Files:
  - `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx` line 112
  - `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx` line 140
- Impact: If `commission_pct` changes per vendor, the displayed label will be wrong.
- Fix: Replace literal string with `${(Number(summary.commission_pct) * 100).toFixed(1)}%`

**`window.location.reload()` used for state refresh:**
- Symptoms: After a successful upload or user creation, the app calls `window.location.reload()` instead of using Next.js router invalidation or server action revalidation.
- Files:
  - `C:/Projetos/da-silva-dashboard/src/app/dashboard/UploadModal.tsx` line 63
  - `C:/Projetos/da-silva-dashboard/src/app/dashboard/usuarios/UsersClient.tsx` line 41
- Impact: Loses scroll position, flashes full page, breaks browser history. Especially bad on mobile.
- Fix: Use `router.refresh()` (Next.js App Router) or `revalidatePath` in a server action.

**Hardcoded `period_id = 1` in vendor options query:**
- Symptoms: The users page fetches `goals` with `.eq('period_id', 1)` to populate vendor options for user creation. Period `1` may not be the current or latest period.
- Files: `C:/Projetos/da-silva-dashboard/src/app/dashboard/usuarios/page.tsx` line 22
- Impact: If period 1 has no data or vendors have changed, the vendor dropdown will be empty or stale.
- Fix: Query the latest period dynamically (same pattern used in dashboard/page.tsx).

---

## Tech Debt

**Schema not versioned — `supabase/migrations/` is empty:**
- Issue: The entire database schema exists only in Supabase cloud. The `C:/Projetos/da-silva-dashboard/supabase/migrations/` directory is present but contains no migration files.
- Impact: Cannot reproduce the database locally, cannot track schema changes in git, cannot do incremental deploys safely. Any schema drift is invisible.
- Fix approach: Run `supabase db dump --project-ref zsczxblhtdhpdqvkpuwz` and write `0001_schema_inicial.sql`. Sprint 0 task S0.6 in CLAUDE_2.md.

**Dead route `/mapeamento` — empty directory with no `page.tsx`:**
- Files: `C:/Projetos/da-silva-dashboard/src/app/mapeamento/` (directory exists, no files)
- Impact: Next.js App Router may attempt to resolve this as a route; directory is dead weight and a confusing artifact.
- Fix: Delete the directory. Sprint 0 task S0.2.

**Dead route `/dashboard/metas` — empty directory with no `page.tsx`:**
- Files: `C:/Projetos/da-silva-dashboard/src/app/dashboard/metas/` (directory exists, no files)
- Impact: Same as above — route exists in the architecture plan but has no implementation, misleading when navigating the codebase.
- Fix: Either implement the page or delete the directory until Sprint planning reaches it.

**`STORE_COLORS` and `STORE_LABELS` duplicated across two files:**
- Issue: Both `C:/Projetos/da-silva-dashboard/src/lib/utils.ts` and `C:/Projetos/da-silva-dashboard/src/types/index.ts` export `STORE_COLORS` and `STORE_LABELS` with identical content.
- Impact: Any color update requires editing two files. Silent divergence risk.
- Fix: Remove the exports from `src/types/index.ts`; import from `src/lib/utils.ts` wherever needed.

**CSS custom property naming mismatch with planned shadcn integration:**
- Issue: `globals.css` uses non-standard names (`--bg`, `--text`, `--surface`, `--surface2`) while CLAUDE_2.md (section 1) defines the target theme using shadcn-compatible names (`--background`, `--foreground`, `--card`, `--muted-foreground`). All components reference the old names inline via `style={}`.
- Files: `C:/Projetos/da-silva-dashboard/src/app/globals.css`, every component in `src/app/dashboard/`, `src/app/meu-resultado/`, `src/components/ui/index.tsx`
- Impact: Sprint 0 shadcn setup (S0.3) will require a full find-replace of CSS variable names across all components.
- Fix: Rename vars in `globals.css` and do a codebase-wide replace as part of Sprint 0.

**100% inline styles — no Tailwind utility classes used despite being installed:**
- Issue: Every component uses `style={{}}` objects. Tailwind is declared in `globals.css` (`@tailwind base/components/utilities`) and listed as a dependency, but zero Tailwind utility classes appear in any component.
- Files: All `.tsx` files in `C:/Projetos/da-silva-dashboard/src/`
- Impact: Verbose, not type-safe, no responsive breakpoints possible, no dark mode toggle via class strategy, no design system enforcement.
- Fix: Migrate to Tailwind + shadcn as part of Sprint 0 (S0.3–S0.5). New components must use Tailwind only.

**No shadcn/ui components installed despite being the planned UI system:**
- Issue: `C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx` contains only custom hand-rolled components (KpiCard, StorePill, ProgressBar, BonusBadge, SectionTitle, LogoutButton). No shadcn components (`button.tsx`, `card.tsx`, `dialog.tsx`, etc.) are present.
- Impact: Every Sprint 0–7 feature that uses shadcn components will fail until `npx shadcn@latest init` and component installations are run.
- Fix: Execute Sprint 0 S0.3 before any other UI work.

**Fonts loaded via Google Fonts CDN link tag instead of `next/font`:**
- Issue: `layout.tsx` loads Syne and DM Mono via a `<link>` tag pointing to `fonts.googleapis.com`. This causes a render-blocking external request and bypasses Next.js font optimization (subsetting, self-hosting, `font-display: swap`).
- Files: `C:/Projetos/da-silva-dashboard/src/app/layout.tsx` lines 13–18
- Fix: Replace with `import { Syne, DM_Mono } from 'next/font/google'` as specified in Sprint 0 S0.4.

**Upload deletes all records for a period before re-inserting — no rollback:**
- Issue: `UploadModal.tsx` calls `supabase.from('sales_records').delete().eq('period_id', ...)` unconditionally before inserting. If the insert fails halfway through, the deleted records are gone with no recovery path.
- Files: `C:/Projetos/da-silva-dashboard/src/app/dashboard/UploadModal.tsx` lines 28–59
- Impact: Data loss on partial import failure. No confirmation step before destructive delete.
- Fix: Use a transaction-like pattern — stage data in a temp table or validate fully before delete, or use Supabase RPC with a transaction.

**Parser uses regex on HTML instead of a DOM parser:**
- Issue: `src/lib/parser.ts` extracts table cells using `/<tr[^>]*>` and `/<td[^>]*>` regex. Nested HTML, malformed tags, or HTML entities not covered by the limited `replace()` calls will silently produce wrong data.
- Files: `C:/Projetos/da-silva-dashboard/src/lib/parser.ts`
- Impact: Silent data corruption if CEC export format changes or has unexpected structure.
- Fix: Use `cheerio` (server-side) or `DOMParser` (client-side) as specified in CLAUDE_2.md section 6.

**No middleware role protection beyond `adm`/`vendedor`:**
- Issue: `middleware.ts` only handles two roles (`adm` redirects from `/meu-resultado`, `vendedor` redirects from `/dashboard`). The planned roles `gerente` and `super_admin` have no protection rules yet.
- Files: `C:/Projetos/da-silva-dashboard/src/middleware.ts`
- Impact: When `gerente` and `super_admin` roles are added (Sprint 2), they will have no route guards unless middleware is updated in tandem.
- Fix: Extend middleware to handle all four roles as specified in CLAUDE_2.md section 11 before adding those roles.

**`/api` routes are fully bypassed by middleware:**
- Issue: `middleware.ts` line 28: `if (pathname.startsWith('/api')) return supabaseResponse` — all API routes skip authentication checks in middleware entirely. Each route must self-authenticate.
- Files: `C:/Projetos/da-silva-dashboard/src/middleware.ts` line 28
- Impact: If any future API route omits its own auth check, it will be publicly accessible. The existing `/api/admin/create-user/route.ts` handles this correctly, but it's a systemic risk as the API surface grows.
- Fix: Either enforce auth in middleware for `/api/admin/*` paths, or document the pattern explicitly so all future route handlers include auth.

**`toggleActive` in UsersClient bypasses server-side auth:**
- Issue: `UsersClient.tsx` calls `supabase.from('profiles').update({ active: !profile.active })` directly from the browser client using the anon key. This relies entirely on RLS policy to enforce that only `adm` users can update profiles. If RLS is misconfigured, any authenticated user can deactivate any profile.
- Files: `C:/Projetos/da-silva-dashboard/src/app/dashboard/usuarios/UsersClient.tsx` lines 48–50
- Impact: Privilege escalation risk if RLS policy on `profiles` is not tight.
- Fix: Move this action to a server action with explicit role verification, or add a dedicated API route following the same pattern as `/api/admin/create-user`.

---

## Security Considerations

**Password passed as plaintext in JSON body to create-user endpoint:**
- Risk: `UsersClient.tsx` sends the new user's password in `body: JSON.stringify({ ..., password: newPwd })` to `/api/admin/create-user`. While TLS encrypts the transport, passwords should never be handled by the application layer if avoidable.
- Files:
  - `C:/Projetos/da-silva-dashboard/src/app/dashboard/usuarios/UsersClient.tsx` line 33
  - `C:/Projetos/da-silva-dashboard/src/app/api/admin/create-user/route.ts` line 14
- Current mitigation: Supabase admin SDK handles the actual auth.admin.createUser call server-side.
- Recommendation: Migrate to invite-based flow (CLAUDE_2.md section 3.6 / Sprint 2 S2.3) where users set their own password, eliminating admin password handling entirely.

**`SUPABASE_SERVICE_ROLE_KEY` used inside a Next.js API route:**
- Risk: The service role key bypasses all RLS. If Next.js bundles this into client-accessible code (unlikely with `process.env` server-only access but possible with misconfiguration), it would give full database access.
- Files: `C:/Projetos/da-silva-dashboard/src/app/api/admin/create-user/route.ts` line 22
- Current mitigation: Route is server-only (`route.ts`), env var has no `NEXT_PUBLIC_` prefix.
- Recommendation: Ensure this key is never referenced in any `'use client'` component. Add a lint rule or note in CLAUDE.md.

**No CSRF protection on API routes:**
- Risk: `POST /api/admin/create-user` uses cookie-based session auth but has no CSRF token. A malicious site could trigger user creation via a cross-origin form POST if SameSite cookie policy is not set.
- Files: `C:/Projetos/da-silva-dashboard/src/app/api/admin/create-user/route.ts`
- Current mitigation: Supabase SSR cookies are typically set with `SameSite=Lax`, which mitigates most CSRF vectors.
- Recommendation: Verify Supabase cookie SameSite settings in the deployed environment.

---

## Performance Bottlenecks

**`ClientsTab` fetches up to 500 client rows with no pagination:**
- Problem: `C:/Projetos/da-silva-dashboard/src/app/dashboard/ClientsTab.tsx` line 17: `.limit(500)`. All 500 rows are loaded into the RSC render tree and serialized to the client.
- Files: `C:/Projetos/da-silva-dashboard/src/app/dashboard/ClientsTab.tsx`
- Cause: No server-side pagination; entire result set rendered as a static table.
- Impact: Large periods with many clients will produce slow TTFB and large HTML payloads.
- Improvement: Add cursor-based pagination or virtualization (e.g., TanStack Table with server-side pagination).

**Multiple sequential Supabase queries in RSC without parallelization:**
- Problem: `dashboard/page.tsx` runs `periods` query, then `vendor_summary` query sequentially. Similarly, `vendedor/[vendor_id]/page.tsx` runs 4 separate queries sequentially (`periods`, `vendor_summary`, `vendor_evolution`, `allSummaries`).
- Files:
  - `C:/Projetos/da-silva-dashboard/src/app/dashboard/page.tsx`
  - `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx`
- Cause: Sequential `await` calls; no `Promise.all`.
- Improvement: Parallelize independent queries with `Promise.all([...])`.

**Google Fonts CDN blocking render:**
- Problem: `<link>` to `fonts.googleapis.com` in `layout.tsx` is render-blocking on first load.
- Files: `C:/Projetos/da-silva-dashboard/src/app/layout.tsx`
- Improvement: Replace with `next/font` (see Tech Debt above).

---

## Fragile Areas

**HTML parser is column-index dependent:**
- Files: `C:/Projetos/da-silva-dashboard/src/lib/parser.ts`
- Why fragile: `cells[18]` = vendor_id, `cells[15]` = valor, `cells[0]` = client code — these magic indices will break silently if CEC exports a report with different column order, extra columns, or a new table section header.
- Safe modification: Any change to the parser must be tested against a real CEC HTML export. Add at least a header-row detection check before relying on column indices.
- Test coverage: Zero — no test files exist anywhere in the project.

**`vendor_summary` view is unversioned and schema-inferred:**
- Files: Referenced in `C:/Projetos/da-silva-dashboard/src/types/index.ts` (VendorSummary interface), all dashboard pages
- Why fragile: CLAUDE_2.md section 2 notes the schema is "inferred — VERIFY with dump". The TypeScript type `VendorSummary` has 20+ fields that may not match the actual view definition. A view column rename or removal will cause silent `undefined` values — not a TypeScript error.
- Safe modification: Do not add new fields to dashboard queries until the schema is dumped and the migration is written.

**`UploadModal` runs client-side — no file size or content validation:**
- Files: `C:/Projetos/da-silva-dashboard/src/app/dashboard/UploadModal.tsx`
- Why fragile: Accepts any `.html`/`.htm` file, calls `.text()` on it, and feeds the entire string to the regex parser. A large file or non-CEC HTML will produce no useful error — the parser will return 0 transactions silently.
- Safe modification: Add `file.size` check (e.g., reject > 10 MB) and validate at least one expected column header before proceeding.

**`supabase.rpc('vendor_evolution', { p_vendor_id: vendor_id })` has no error handling:**
- Files:
  - `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx` line 41
  - `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx` line 35
- Why fragile: If the RPC is renamed, removed, or fails, `evolution` will be `null` with no error surface. The UI handles `null` gracefully (shows empty state) but the failure is invisible to the operator.

---

## Missing Critical Features

**No invite system — passwords set by admin:**
- Problem: User creation currently requires an admin to set a plaintext password on behalf of the user. There is no self-service onboarding.
- Blocks: Scalable team onboarding; vendor self-setup; secure password ownership.
- Planned: Sprint 2 S2.3 — `convites` table + `/convite/[token]` route.

**No multi-tenancy — single store hardcoded:**
- Problem: The `profiles`, `vendor_summary`, and all queries have no `tenant_id` column. Store names are hardcoded as strings (`'Jebai'`, `'Paje-MKT'`, `'Paje-Caixa'`) in `utils.ts` and `types/index.ts`.
- Blocks: SaaS offering; adding a 4th store; isolating data between tenants.
- Planned: Sprint 1 S1.1 — `tenants` table + `tenant_id` FK on all tables.

**No commission rule engine — flat percentage only:**
- Problem: Commission is calculated as `sold * commission_pct + bonus`. The `commission_pct` is stored in `vendor_summary` but there is no configurable rule system.
- Files: `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx` line 57, `src/app/dashboard/vendedor/[vendor_id]/page.tsx` line 43
- Blocks: Manager-configured bonuses; category-based rules; time-at-company multipliers.
- Planned: Sprint 4 — `regras_comissao` table + `src/lib/comissao/engine.ts`.

**No test coverage:**
- Problem: Zero test files exist in the project. No `jest.config.*`, `vitest.config.*`, or `*.test.*` / `*.spec.*` files were found.
- Impact: All bugs discovered above (broken filter, hardcoded labels, regex parser) could have been caught by unit tests. Regressions during Sprint 0 refactor are likely.
- Priority: High — at minimum, `src/lib/parser.ts` and future `src/lib/comissao/engine.ts` need unit tests before production use.

**No error boundaries or global error handling:**
- Problem: No `error.tsx` files exist in any route segment. RSC errors will bubble to Next.js default error page with no user-friendly recovery.
- Impact: A Supabase query failure on `/dashboard` crashes the entire page with no retry or fallback.
- Planned: Sprint 0 S0.7 — "Error Boundary global".

**No responsive/mobile layout:**
- Problem: All layouts use hardcoded pixel values in inline styles (`padding: '1.5rem 2.5rem'`, `gridTemplateColumns: 'repeat(3,1fr)'`). No media queries, no Tailwind responsive prefixes, no mobile sidebar.
- Impact: The app is unusable on phones. CLAUDE_2.md notes ~50 vendors access via mobile.
- Planned: Sprint 0 S0.7 — mobile topbar with hamburger + Sheet drawer.

---

## Scaling Limits

**`client_portfolio` view queried with `.limit(500)` per render:**
- Current capacity: Works for up to 500 clients per period per vendor.
- Limit: Beyond 500, clients are silently truncated with no indication to the user.
- Scaling path: Implement server-side pagination with `range()` + page controls.

**Upload via client-side file read — entire HTML in browser memory:**
- Current capacity: Fine for typical CEC exports (< 1 MB).
- Limit: Files > ~50 MB will cause browser memory pressure and timeout.
- Scaling path: Stream file to a server-side API route for processing.

---

*Concerns audit: 2026-05-19*
