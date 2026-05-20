---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - package-lock.json
  - components.json
  - tailwind.config.js
  - src/app/layout.tsx
  - src/app/globals.css
  - src/lib/utils.ts
  - src/components/ui/index.tsx
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
  - supabase/migrations/0001_schema_inicial.sql
autonomous: false
requirements:
  - FOUND-01
  - FOUND-02
  - FOUND-03
  - FOUND-04
  - FOUND-05
  - FOUND-06
  - FOUND-07
user_setup:
  - service: supabase
    why: "Schema extraction via supabase CLI (FOUND-01)"
    env_vars:
      - name: SUPABASE_ACCESS_TOKEN
        source: "https://supabase.com/dashboard/account/tokens"
    notes:
      - "If SUPABASE_ACCESS_TOKEN not set, executor must run `npx supabase login` (opens browser) OR fall back to manual schema export from Supabase Studio."

must_haves:
  truths:
    - "supabase/migrations/0001_schema_inicial.sql exists and contains the live public schema"
    - "shadcn/ui is initialized: components.json exists and 18 shadcn primitives are installed under src/components/ui"
    - "Dark theme is the visible default with #0e0f11 background and #c8f542 accent reachable via CSS vars"
    - "Syne and DM Mono are served by next/font (no CDN <link> in layout.tsx)"
    - "All 7 GDS base components exist and import successfully: stat-card, data-table, period-selector, loja-badge, progress-ring, empty-state, page-header"
    - "Sidebar renders at 240px expanded / 64px collapsed on desktop with state persisted to localStorage"
    - "Mobile (<768px) renders hamburger button that opens shadcn Sheet from the left at 280px width"
    - "Topbar (56px) renders period selector, store selector, avatar+dropdown, and dark/light toggle"
    - "Dead routes /mapeamento and /dashboard/metas do not exist on disk and no dangling imports reference them"
    - "npm run build completes with exit code 0"
    - "npm run lint completes with no critical errors"
  artifacts:
    - path: "supabase/migrations/0001_schema_inicial.sql"
      provides: "Versioned snapshot of current Supabase public schema"
      min_lines: 50
    - path: "components.json"
      provides: "shadcn/ui project config"
    - path: "src/components/ui/stat-card.tsx"
      provides: "StatCard component"
      exports: ["StatCard"]
    - path: "src/components/ui/data-table.tsx"
      provides: "DataTable component"
      exports: ["DataTable"]
    - path: "src/components/ui/period-selector.tsx"
      provides: "PeriodSelector v2 component (shadcn Select wrapper)"
      exports: ["PeriodSelector"]
    - path: "src/components/ui/loja-badge.tsx"
      provides: "LojaBadge component"
      exports: ["LojaBadge"]
    - path: "src/components/ui/progress-ring.tsx"
      provides: "ProgressRing SVG component"
      exports: ["ProgressRing"]
    - path: "src/components/ui/empty-state.tsx"
      provides: "EmptyState component"
      exports: ["EmptyState"]
    - path: "src/components/ui/page-header.tsx"
      provides: "PageHeader component"
      exports: ["PageHeader"]
    - path: "src/components/shared/sidebar.tsx"
      provides: "Collapsible desktop sidebar"
      exports: ["Sidebar"]
    - path: "src/components/shared/topbar.tsx"
      provides: "Fixed topbar with selectors + avatar + theme toggle"
      exports: ["Topbar"]
    - path: "src/hooks/use-sidebar.ts"
      provides: "localStorage-backed sidebar collapse state"
      exports: ["useSidebar"]
    - path: "src/app/dashboard/layout.tsx"
      provides: "Dashboard segment layout wiring sidebar + topbar + mobile sheet"
    - path: "src/app/layout.tsx"
      provides: "Root layout with next/font + ThemeProvider, no CDN <link>"
    - path: "tailwind.config.js"
      provides: "Tailwind config wired to shadcn CSS vars + Syne/DM Mono font vars"
  key_links:
    - from: "src/app/layout.tsx"
      to: "next/font/google"
      via: "Syne and DM_Mono imports with variable option"
      pattern: "from 'next/font/google'"
    - from: "src/app/layout.tsx"
      to: "next-themes ThemeProvider"
      via: "wraps body content"
      pattern: "ThemeProvider"
    - from: "src/app/dashboard/layout.tsx"
      to: "src/components/shared/sidebar.tsx + topbar.tsx"
      via: "imports and renders both"
      pattern: "Sidebar|Topbar"
    - from: "src/app/globals.css"
      to: "shadcn HSL vars + GDS aliases"
      via: "--background/--foreground/etc. + --bg/--text/--surface aliases for legacy inline styles"
      pattern: "--background|--bg:"
    - from: "src/lib/utils.ts"
      to: "cn() + existing utilities"
      via: "shadcn cn added alongside fmtCurrency/metaLevel/etc."
      pattern: "export function cn|export function fmtCurrency"
---

<objective>
Establish the Phase 1 Foundation for GDS Frame Dashboard v2:
1. Install dependencies (node_modules is absent — blocking step)
2. Extract and version the current Supabase public schema (FOUND-01)
3. Verify dead routes are gone and capture build baseline (FOUND-02)
4. Initialize shadcn/ui with GDS theme tokens and install all required primitives (FOUND-03)
5. Migrate Syne + DM Mono to next/font and add next-themes (FOUND-04)
6. Build the 7 GDS base components per UI-SPEC (FOUND-05)
7. Implement Layout v2 (collapsible sidebar + mobile Sheet + topbar) (FOUND-06)
8. Verify `npm run build` and `npm run lint` pass cleanly (FOUND-07)

Purpose: Provide a clean, type-safe, themed scaffold that all subsequent phases (data layer, commission engine, LMS) build on top of.
Output: 18 new/modified files (see frontmatter), one versioned migration, a verified passing build.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phase-01/RESEARCH.md
@.planning/phase-01/01-UI-SPEC.md
@CLAUDE.md
@src/app/layout.tsx
@src/app/globals.css
@src/components/ui/index.tsx
@src/lib/utils.ts
@tailwind.config.js
@package.json

<interfaces>
<!-- Existing exports the executor MUST preserve across this phase -->

From `src/lib/utils.ts` (must remain after shadcn init):
```typescript
export function fmtCurrency(n: number): string
export function fmtCurrencyFull(n: number): string
export function fmtK(n: number): string
export function metaLevel(sold: number, meta1: number, meta2: number, meta3: number): number
export function bonusAmount(level: number, bonus1: number, bonus2: number, bonus3: number): number
export function recencyColor(daysAgo: number): string
export function recencyLabel(daysAgo: number): string
export const STORE_COLORS: Record<string, string>
export const STORE_LABELS: Record<string, string>
// NEW (added by shadcn init):
export function cn(...inputs: ClassValue[]): string
```

From `src/components/ui/index.tsx` (barrel — keep existing exports working):
```typescript
export function KpiCard(props: { label; value; sub?; color? })
export function StorePill(props: { store: string })
export function ProgressBar(props: { sold; meta1; meta2; meta3; metaLevel })
export function BonusBadge(props: { level: number; amount: number })
export function SectionTitle(props: { children })
export function LogoutButton()
```
These continue using inline styles against legacy CSS vars (`--bg`, `--surface`, `--surface2`, `--border`, `--text`, `--muted`, `--accent`, `--meta1/2/3`). DO NOT refactor them in this phase — preserve them and add aliases in globals.css.

New components produced by this plan (props contracts per UI-SPEC §"Component Design Contracts"):
```typescript
// stat-card.tsx
interface StatCardProps { label: string; value: string | number; delta?: number; icon?: ReactNode }
export function StatCard(props: StatCardProps): JSX.Element

// data-table.tsx (generic)
interface Column<T> { key: keyof T | string; header: string; align?: 'left'|'right'|'center'; sortable?: boolean; render?: (row: T) => ReactNode }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; loading?: boolean; emptyTitle?: string; emptyDescription?: string }
export function DataTable<T>(props: DataTableProps<T>): JSX.Element

// period-selector.tsx
interface Period { id: string | number; label: string }
interface PeriodSelectorProps { periods: Period[]; value: string; onChange: (v: string) => void; className?: string }
export function PeriodSelector(props: PeriodSelectorProps): JSX.Element

// loja-badge.tsx
type LojaName = 'Jebai' | 'Pajé 1' | 'Pajé 2'
interface LojaBadgeProps { loja: LojaName }
export function LojaBadge(props: LojaBadgeProps): JSX.Element

// progress-ring.tsx
interface ProgressRingProps { value: number; size?: number; color?: string; label?: string }
export function ProgressRing(props: ProgressRingProps): JSX.Element

// empty-state.tsx
interface EmptyStateProps { title: string; description?: string; icon?: ReactNode; action?: ReactNode }
export function EmptyState(props: EmptyStateProps): JSX.Element

// page-header.tsx
interface PageHeaderProps { title: string; subtitle?: string; breadcrumbs?: Array<{ label: string; href?: string }>; actions?: ReactNode }
export function PageHeader(props: PageHeaderProps): JSX.Element
```
</interfaces>
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| shadcn CLI → repo files | Code generator writes into `src/lib/utils.ts`, `globals.css`, `tailwind.config.js`. Risk of overwriting business logic. |
| Supabase CLI → DB metadata | `supabase db dump` reads remote project metadata; requires auth token. No write back to DB in this phase. |
| Browser ↔ next-themes localStorage | Theme class injected on `<html>` before hydration — SSR/CSR mismatch risk if `suppressHydrationWarning` missing. |
| Existing inline-styled components → CSS vars | 100+ inline `var(--bg)`/`var(--text)` references will silently render black if aliases are dropped. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-01 | Tampering | `src/lib/utils.ts` | mitigate | Read file before shadcn init; after init verify `fmtCurrency`, `metaLevel`, `bonusAmount`, `recencyColor`, `recencyLabel`, `STORE_COLORS`, `STORE_LABELS` all still export. If missing, restore from git and append `cn()` manually. (T04 verification) |
| T-01-02 | Tampering | `src/app/globals.css` | mitigate | Add legacy CSS var aliases (`--bg: var(--background)`, `--text: var(--foreground)`, `--surface: var(--card)`, `--surface2: var(--muted)`, `--meta1/2/3` mapped to accent/paje1/paje2) so existing inline styles in `index.tsx`, `ClientsTab.tsx`, `UploadModal.tsx`, etc. don't break. (T05) |
| T-01-03 | Denial of Service | Next.js build | mitigate | After dead-route verification (T03), grep entire `src/` for `mapeamento` and `dashboard/metas` import literals; any hit blocks the phase until fixed. (T03) |
| T-01-04 | Information Disclosure | hydration mismatch | mitigate | Add `suppressHydrationWarning` to `<html>` in `src/app/layout.tsx` when next-themes ThemeProvider is added. (T06) |
| T-01-05 | Information Disclosure | Supabase schema dump | accept | Schema dump is metadata only (no row data, no PII). Stored in repo `supabase/migrations/`. Risk: low. (T02) |
| T-01-06 | Elevation of Privilege | shadcn registry | accept | Only the official shadcn registry (ui.shadcn.com) is used. No third-party blocks. Risk: low — official, audited components. |
</threat_model>

<rollback_notes>
Each task is independently rollback-able via `git checkout -- <files>`. Snapshot points:

- After T00 (npm install): `package-lock.json` regenerated — safe to discard if needed.
- After T02 (schema dump): single new file `supabase/migrations/0001_schema_inicial.sql` — `git rm` to undo.
- After T04 (shadcn init): heaviest change. `git checkout HEAD -- src/lib/utils.ts src/app/globals.css tailwind.config.js components.json src/components/ui/` reverts. `npm uninstall class-variance-authority tailwind-merge @radix-ui/react-slot` removes installed deps if needed.
- After T06 (font + theme migration): revert `src/app/layout.tsx` to restore CDN `<link>` font loading. `npm uninstall next-themes` if rolling back theming.
- After T07 (7 base components): delete `src/components/ui/{stat-card,data-table,period-selector,loja-badge,progress-ring,empty-state,page-header}.tsx` and remove their exports from `src/components/ui/index.tsx`.
- After T08 (layout v2): delete `src/app/dashboard/layout.tsx`, `src/components/shared/`, and `src/hooks/use-sidebar.ts`.

Full phase revert: `git restore .` from a known-clean commit prior to T00.
</rollback_notes>

<tasks>

<task type="checkpoint:human-action" id="T00">
  <name>T00: BLOCKING — Confirm SUPABASE_ACCESS_TOKEN availability (SCHEMA_PUSH_REQUIRED)</name>
  <gate>blocking</gate>
  <what-needed>
    Schema extraction in T02 requires Supabase CLI auth. The token is human-provisioned and cannot be created by Claude.
  </what-needed>
  <how-to-verify>
    Run this check in PowerShell:
    ```powershell
    if ($env:SUPABASE_ACCESS_TOKEN) { Write-Output "TOKEN_PRESENT" } else { Write-Output "TOKEN_MISSING" }
    ```
    - If `TOKEN_PRESENT` → reply "approved, proceed" and continue to T01.
    - If `TOKEN_MISSING` → choose one:
      A) Generate token at https://supabase.com/dashboard/account/tokens, set `$env:SUPABASE_ACCESS_TOKEN = "sbp_..."`, then reply "approved, proceed".
      B) Run `npx supabase login` in a separate terminal (opens browser OAuth), then reply "logged in, proceed".
      C) Reply "fallback to manual" — T02 will switch to Studio export instructions.
  </how-to-verify>
  <resume-signal>Reply: "approved, proceed" | "logged in, proceed" | "fallback to manual"</resume-signal>
  <done>Executor knows which T02 branch to take.</done>
</task>

<task type="auto" id="T01">
  <name>T01: Install project dependencies (node_modules is absent)</name>
  <files>package-lock.json (regenerated)</files>
  <depends_on>T00</depends_on>
  <action>
    From `C:\Projetos\da-silva-dashboard\`:
    ```powershell
    npm install
    ```
    If npm errors out with peer-dep conflicts (rare on this stack since Radix supports React 19):
    ```powershell
    npm install --legacy-peer-deps
    ```
    Do NOT delete `package-lock.json` preemptively. Only re-run with `--legacy-peer-deps` after a real failure.
  </action>
  <verify>
    <automated>
      ```powershell
      Test-Path node_modules\next\package.json
      Test-Path node_modules\react\package.json
      Test-Path node_modules\@supabase\ssr\package.json
      ```
      All three must return `True`.
    </automated>
  </verify>
  <done>`node_modules/` exists. `npx next --version` prints `15.2.4`. No install errors in terminal.</done>
</task>

<task type="auto" id="T02">
  <name>T02: Extract Supabase public schema to versioned migration (FOUND-01)</name>
  <files>supabase/migrations/0001_schema_inicial.sql</files>
  <depends_on>T00, T01</depends_on>
  <action>
    Ensure target directory exists:
    ```powershell
    New-Item -ItemType Directory -Force -Path supabase\migrations | Out-Null
    ```

    **Branch A — Token/login available (T00 = approved/logged in):**
    ```powershell
    npx supabase db dump --project-ref zsczxblhtdhpdqvkpuwz --schema public --file supabase\migrations\0001_schema_inicial.sql
    ```
    If `--file` flag fails on the installed CLI version, use redirection:
    ```powershell
    npx supabase db dump --project-ref zsczxblhtdhpdqvkpuwz --schema public | Out-File -Encoding utf8 supabase\migrations\0001_schema_inicial.sql
    ```

    **Branch B — Fallback to manual (T00 = fallback to manual):**
    1. Open Supabase Studio → project `zsczxblhtdhpdqvkpuwz` → Database → Schema Visualizer / SQL Editor.
    2. Run:
       ```sql
       SELECT pg_get_tabledef(c.oid)
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m');
       ```
       Or use Studio's "Export schema" button.
    3. Concatenate the output into `supabase\migrations\0001_schema_inicial.sql` ensuring it includes:
       - All tables: `profiles`, `periods`, `goals`, `sales_records`
       - All views: `vendor_summary`, `client_portfolio`
       - The RPC function: `vendor_evolution(p_vendor_id uuid)`
       - All RLS policies (DO NOT skip — phase scope demands snapshot of current state)

    After file is written (either branch), prepend this comment header:
    ```sql
    -- Phase 1 — FOUND-01
    -- Snapshot of Supabase project zsczxblhtdhpdqvkpuwz / schema public
    -- Generated: <YYYY-MM-DD>
    -- Tables: profiles, periods, goals, sales_records
    -- Views:  vendor_summary, client_portfolio
    -- RPC:    vendor_evolution(p_vendor_id uuid)
    -- Multi-tenant tenant_id columns are intentionally NOT in this snapshot — added in Phase 2.
    ```
  </action>
  <verify>
    <automated>
      ```powershell
      Test-Path supabase\migrations\0001_schema_inicial.sql
      (Get-Content supabase\migrations\0001_schema_inicial.sql).Count -ge 50
      Select-String -Path supabase\migrations\0001_schema_inicial.sql -Pattern "profiles","periods","goals","sales_records","vendor_summary","client_portfolio","vendor_evolution" | Measure-Object | Select-Object -ExpandProperty Count
      ```
      First check: True. Second: True (>=50 lines). Third: >= 7 matches.
    </automated>
  </verify>
  <done>Migration file exists, >=50 lines, contains all 4 tables + 2 views + 1 RPC by name. Header comment present.</done>
</task>

<task type="auto" id="T03">
  <name>T03: Verify dead routes are absent + capture build baseline (FOUND-02)</name>
  <files>(no writes — verification only; may write nothing or fix a stray import)</files>
  <depends_on>T01</depends_on>
  <action>
    1. Confirm dead route directories do NOT exist:
       ```powershell
       Test-Path src\app\mapeamento
       Test-Path src\app\dashboard\metas
       ```
       Both MUST print `False`. If either is `True`, delete it: `Remove-Item -Recurse -Force <path>`.

    2. Scan the codebase for any dangling imports/links to these routes:
       ```powershell
       Select-String -Path src\**\*.tsx,src\**\*.ts -Pattern "mapeamento","dashboard/metas","/metas" -SimpleMatch
       ```
       Any match must be removed/replaced. Acceptable resolutions:
       - Comment + delete dead `<Link href="/mapeamento">` JSX.
       - Remove unused imports of deleted modules.

    3. Capture baseline build state BEFORE shadcn changes (to isolate later failures):
       ```powershell
       npm run build 2>&1 | Tee-Object -FilePath .planning\phase-01\baseline-build.log
       ```
       This file is intentionally NOT committed; it's a debug artifact for the executor. Note any pre-existing errors — they must still be present (or fewer) at T09.
  </action>
  <verify>
    <automated>
      ```powershell
      (-not (Test-Path src\app\mapeamento)) -and (-not (Test-Path src\app\dashboard\metas))
      (Select-String -Path src\**\*.tsx,src\**\*.ts -Pattern "mapeamento","dashboard/metas" -SimpleMatch | Measure-Object).Count -eq 0
      ```
      Both must print `True`.
    </automated>
  </verify>
  <done>Dead route dirs absent. Zero stray references in `src/`. Baseline build log captured at `.planning/phase-01/baseline-build.log`.</done>
</task>

<task type="auto" id="T04">
  <name>T04: Initialize shadcn/ui + install all primitives + protect lib/utils.ts (FOUND-03)</name>
  <files>
    components.json,
    src/lib/utils.ts,
    src/components/ui/{button,card,badge,table,tabs,select,dialog,sheet,dropdown-menu,avatar,separator,skeleton,tooltip,switch,form,input,label,textarea}.tsx,
    tailwind.config.js (extended by init),
    package.json (new deps)
  </files>
  <depends_on>T01, T03</depends_on>
  <action>
    1. **PRE-INIT SNAPSHOT** — copy current utils.ts to a safe backup:
       ```powershell
       Copy-Item src\lib\utils.ts src\lib\utils.ts.preinit.bak
       ```

    2. Run shadcn init (interactive — answer EXACTLY as below):
       ```powershell
       npx shadcn@latest init
       ```
       Answers:
       - TypeScript: **yes**
       - Style: **Default**
       - Base color: **Slate**
       - Global CSS file: **src/app/globals.css**
       - CSS variables: **yes**
       - tailwind.config.js path: **tailwind.config.js**
       - Components alias: **@/components**
       - Utils alias: **@/lib/utils**
       - Use React Server Components: **yes**
       - Overwrite components.json (if asked): **yes**

       If init complains that `src/lib/utils.ts` exists, allow it to update — we restore in step 3.

    3. **POST-INIT VERIFICATION — MITIGATES T-01-01:**
       ```powershell
       Select-String -Path src\lib\utils.ts -Pattern "export function fmtCurrency","export function metaLevel","export function bonusAmount","export const STORE_COLORS","export const STORE_LABELS","export function recencyColor","export function recencyLabel","export function fmtK"
       ```
       Expected: 8 matches. If FEWER than 8, the file was overwritten. Recovery:
       ```powershell
       # Read the new cn() addition
       $cn = Select-String -Path src\lib\utils.ts -Pattern "export function cn" -Context 0,10 | Out-String
       # Restore originals
       Copy-Item src\lib\utils.ts.preinit.bak src\lib\utils.ts -Force
       # Append shadcn imports + cn() at top of file
       ```
       Then manually edit `src/lib/utils.ts` to ADD at the top:
       ```typescript
       import { type ClassValue, clsx } from 'clsx'
       import { twMerge } from 'tailwind-merge'

       export function cn(...inputs: ClassValue[]): string {
         return twMerge(clsx(inputs))
       }
       ```
       Keep all original exports below.

    4. **Delete the backup once verified:**
       ```powershell
       Remove-Item src\lib\utils.ts.preinit.bak
       ```

    5. Install primitives in three batches (use `--legacy-peer-deps` ONLY if a batch fails):
       ```powershell
       npx shadcn@latest add button card badge table tabs select dialog sheet
       npx shadcn@latest add dropdown-menu avatar separator skeleton tooltip switch
       npx shadcn@latest add form input label textarea
       ```
  </action>
  <verify>
    <automated>
      ```powershell
      Test-Path components.json
      (Get-ChildItem src\components\ui\*.tsx | Where-Object { $_.Name -in @('button.tsx','card.tsx','badge.tsx','table.tsx','tabs.tsx','select.tsx','dialog.tsx','sheet.tsx','dropdown-menu.tsx','avatar.tsx','separator.tsx','skeleton.tsx','tooltip.tsx','switch.tsx','form.tsx','input.tsx','label.tsx','textarea.tsx') }).Count -eq 18
      (Select-String -Path src\lib\utils.ts -Pattern "export function cn","export function fmtCurrency","export function metaLevel","export const STORE_COLORS" | Measure-Object).Count -eq 4
      ```
      All three: True / 18 / 4.
    </automated>
  </verify>
  <done>components.json present. 18 shadcn primitive files exist. `cn()` AND all 8 original utility exports remain in `src/lib/utils.ts`. No `*.preinit.bak` left in tree.</done>
</task>

<task type="auto" id="T05">
  <name>T05: Apply GDS theme tokens + legacy aliases in globals.css + tailwind.config.js (FOUND-03)</name>
  <files>src/app/globals.css, tailwind.config.js</files>
  <depends_on>T04</depends_on>
  <action>
    **MITIGATES T-01-02.** Overwrite `src/app/globals.css` with the following exact content (replacing whatever shadcn init wrote):

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer base {
      :root {
        /* shadcn-compatible tokens — HSL channels (space-separated, no hsl() wrapper) */
        --background:        220 8% 7%;     /* #0e0f11 */
        --foreground:        240 5% 96%;    /* #f4f4f5 */
        --card:              225 7% 9%;     /* #141517 */
        --card-foreground:   240 5% 96%;
        --popover:           225 7% 9%;
        --popover-foreground: 240 5% 96%;
        --primary:           74 89% 62%;    /* #c8f542 — accent doubles as primary */
        --primary-foreground: 220 8% 7%;
        --secondary:         225 6% 14%;    /* #1a1b1e */
        --secondary-foreground: 240 5% 96%;
        --muted:             225 6% 14%;    /* #1a1b1e */
        --muted-foreground:  240 5% 46%;    /* #71717a */
        --accent:            74 89% 62%;    /* #c8f542 */
        --accent-foreground: 220 8% 7%;
        --destructive:       0 84% 60%;     /* #ef4444 */
        --destructive-foreground: 240 5% 96%;
        --border:            240 4% 15%;    /* #27272a */
        --input:             240 4% 15%;
        --ring:              74 89% 62%;
        --radius: 0.5rem;

        /* GDS store colors — raw RGB triplets for rgb(var(--x) / opacity) usage */
        --jebai: 147 51 234;   /* #9333ea */
        --paje1: 6 182 212;    /* #06b6d4 */
        --paje2: 249 115 22;   /* #f97316 */

        /* === Legacy aliases for existing inline-styled components (MITIGATES T-01-02) === */
        /* Existing code in src/components/ui/index.tsx, dashboard/page.tsx, ClientsTab.tsx, */
        /* UploadModal.tsx, etc. references these names — KEEP them working in Phase 1. */
        --bg:       hsl(var(--background));
        --text:     hsl(var(--foreground));
        --surface:  hsl(var(--card));
        --surface2: hsl(var(--muted));
        --meta1:    hsl(var(--accent));
        --meta2:    rgb(var(--paje1));
        --meta3:    rgb(var(--paje2));
      }

      .light {
        --background:        210 17% 98%;   /* #f8f9fa */
        --foreground:        220 8% 7%;
        --card:              0 0% 100%;
        --card-foreground:   220 8% 7%;
        --popover:           0 0% 100%;
        --popover-foreground: 220 8% 7%;
        --primary:           142 76% 36%;   /* #16a34a */
        --primary-foreground: 0 0% 100%;
        --secondary:         210 40% 96%;
        --secondary-foreground: 220 8% 7%;
        --muted:             210 40% 96%;   /* #f1f5f9 */
        --muted-foreground:  215 16% 47%;   /* #64748b */
        --accent:            142 76% 36%;
        --accent-foreground: 0 0% 100%;
        --destructive:       0 72% 51%;     /* #dc2626 */
        --destructive-foreground: 0 0% 100%;
        --border:            214 32% 91%;   /* #e2e8f0 */
        --input:             214 32% 91%;
        --ring:              142 76% 36%;

        /* Store colors unchanged across themes per UI-SPEC */
      }
    }

    @layer base {
      * { @apply border-border; box-sizing: border-box; }
      body {
        @apply bg-background text-foreground;
        font-family: var(--font-syne), 'Syne', sans-serif;
        min-height: 100vh;
      }
    }

    /* Scrollbar — preserve aesthetic from previous globals.css */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: hsl(var(--card)); }
    ::-webkit-scrollbar-thumb { background: hsl(var(--muted)); border-radius: 3px; }
    ```

    Then overwrite `tailwind.config.js` with:

    ```js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      darkMode: ['class'],
      content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
      theme: {
        container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
        extend: {
          colors: {
            border:     'hsl(var(--border))',
            input:      'hsl(var(--input))',
            ring:       'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary:    { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
            secondary:  { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
            destructive:{ DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
            muted:      { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
            accent:     { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
            popover:    { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
            card:       { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
            jebai: 'rgb(var(--jebai) / <alpha-value>)',
            paje1: 'rgb(var(--paje1) / <alpha-value>)',
            paje2: 'rgb(var(--paje2) / <alpha-value>)',
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
          fontFamily: {
            sans: ['var(--font-syne)', 'Syne', 'sans-serif'],
            mono: ['var(--font-dm-mono)', 'DM Mono', 'monospace'],
          },
          keyframes: {
            'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
            'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
          },
          animation: {
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up':   'accordion-up 0.2s ease-out',
          },
        },
      },
      plugins: [require('tailwindcss-animate')],
    }
    ```

    Install the animate plugin if missing:
    ```powershell
    npm install tailwindcss-animate
    ```
  </action>
  <verify>
    <automated>
      ```powershell
      (Select-String -Path src\app\globals.css -Pattern "--background:","--bg:","--surface:","--meta1:","--jebai:" | Measure-Object).Count -ge 5
      (Select-String -Path tailwind.config.js -Pattern "var\(--font-syne\)","var\(--font-dm-mono\)","jebai","paje1","paje2","tailwindcss-animate" | Measure-Object).Count -ge 6
      Test-Path node_modules\tailwindcss-animate
      ```
      All three checks pass.
    </automated>
  </verify>
  <done>globals.css has shadcn HSL vars, dark+light themes, legacy aliases (`--bg`, `--text`, `--surface`, `--surface2`, `--meta1/2/3`), store colors. tailwind.config.js wires Syne/DM Mono font vars + custom colors. `tailwindcss-animate` installed.</done>
</task>

<task type="auto" id="T06">
  <name>T06: Migrate fonts to next/font + add next-themes ThemeProvider (FOUND-04)</name>
  <files>
    src/app/layout.tsx,
    src/components/shared/theme-provider.tsx,
    package.json
  </files>
  <depends_on>T05</depends_on>
  <action>
    1. Install next-themes:
       ```powershell
       npm install next-themes
       ```

    2. Create `src/components/shared/theme-provider.tsx`:
       ```tsx
       'use client'

       import * as React from 'react'
       import { ThemeProvider as NextThemesProvider } from 'next-themes'
       import type { ThemeProviderProps } from 'next-themes'

       export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
         return <NextThemesProvider {...props}>{children}</NextThemesProvider>
       }
       ```

    3. Overwrite `src/app/layout.tsx` with:
       ```tsx
       import type { Metadata } from 'next'
       import { Syne, DM_Mono } from 'next/font/google'
       import { ThemeProvider } from '@/components/shared/theme-provider'
       import './globals.css'

       const syne = Syne({
         subsets: ['latin'],
         weight: ['400', '600', '700', '800'],
         variable: '--font-syne',
         display: 'swap',
       })

       const dmMono = DM_Mono({
         subsets: ['latin'],
         weight: ['400', '500'],
         variable: '--font-dm-mono',
         display: 'swap',
       })

       export const metadata: Metadata = {
         title: 'GDS Frame · Dashboard',
         description: 'Painel de vendas, comissões e treinamento',
       }

       export default function RootLayout({ children }: { children: React.ReactNode }) {
         return (
           <html
             lang="pt"
             className={`${syne.variable} ${dmMono.variable}`}
             suppressHydrationWarning
           >
             <body>
               <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                 {children}
               </ThemeProvider>
             </body>
           </html>
         )
       }
       ```

    **MITIGATES T-01-04** — `suppressHydrationWarning` is on `<html>`. The CDN `<link>` tag is removed.
  </action>
  <verify>
    <automated>
      ```powershell
      (Select-String -Path src\app\layout.tsx -Pattern "from 'next/font/google'","Syne","DM_Mono","--font-syne","--font-dm-mono","ThemeProvider","suppressHydrationWarning" | Measure-Object).Count -ge 7
      (Select-String -Path src\app\layout.tsx -Pattern "fonts.googleapis.com" | Measure-Object).Count -eq 0
      Test-Path src\components\shared\theme-provider.tsx
      Test-Path node_modules\next-themes
      ```
      All four checks pass.
    </automated>
  </verify>
  <done>layout.tsx uses `next/font/google` for both Syne (400/600/700/800) and DM Mono (400/500), with `variable` option. CDN `<link>` gone. ThemeProvider wraps body. `suppressHydrationWarning` on `<html>`. next-themes installed.</done>
</task>

<task type="auto" id="T07">
  <name>T07: Build the 7 GDS base components per UI-SPEC (FOUND-05)</name>
  <files>
    src/components/ui/stat-card.tsx,
    src/components/ui/data-table.tsx,
    src/components/ui/period-selector.tsx,
    src/components/ui/loja-badge.tsx,
    src/components/ui/progress-ring.tsx,
    src/components/ui/empty-state.tsx,
    src/components/ui/page-header.tsx,
    src/components/ui/index.tsx
  </files>
  <depends_on>T04, T05</depends_on>
  <action>
    Create each component per UI-SPEC §"Component Design Contracts". All components MUST:
    - Use Tailwind utility classes only (no inline `style={{}}` — that's the legacy pattern, banned in new code)
    - Use `cn()` from `@/lib/utils` for conditional classes
    - Use Lucide icons via `lucide-react`
    - Use shadcn primitives where called for (Select for period-selector, Skeleton for loading states)

    ### `src/components/ui/stat-card.tsx`
    ```tsx
    import type { ReactNode } from 'react'
    import { cn } from '@/lib/utils'

    interface StatCardProps {
      label: string
      value: string | number
      delta?: number
      icon?: ReactNode
      className?: string
    }

    export function StatCard({ label, value, delta, icon, className }: StatCardProps) {
      const deltaSign = delta === undefined ? null : delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'zero'
      return (
        <div className={cn('min-h-[88px] rounded-xl border border-border bg-card p-4 flex flex-col gap-2', className)}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </span>
            {icon ? <span className="text-muted-foreground">{icon}</span> : null}
          </div>
          <div className="font-sans text-[28px] font-bold leading-[1.2] text-foreground">
            {value}
          </div>
          {deltaSign && (
            <div className={cn(
              'font-mono text-[12px]',
              deltaSign === 'pos' && 'text-accent',
              deltaSign === 'neg' && 'text-destructive',
              deltaSign === 'zero' && 'text-muted-foreground',
            )}>
              {deltaSign === 'pos' && '▲ '}
              {deltaSign === 'neg' && '▼ '}
              {deltaSign === 'zero' && '— '}
              {delta !== undefined && `${Math.abs(delta).toFixed(1)}%`}
            </div>
          )}
        </div>
      )
    }
    ```

    ### `src/components/ui/data-table.tsx`
    ```tsx
    'use client'

    import { useState } from 'react'
    import { ChevronUp, ChevronDown } from 'lucide-react'
    import { Skeleton } from '@/components/ui/skeleton'
    import { EmptyState } from '@/components/ui/empty-state'
    import { cn } from '@/lib/utils'

    export interface Column<T> {
      key: keyof T | string
      header: string
      align?: 'left' | 'right' | 'center'
      sortable?: boolean
      render?: (row: T) => React.ReactNode
    }

    interface DataTableProps<T> {
      columns: Column<T>[]
      data: T[]
      loading?: boolean
      emptyTitle?: string
      emptyDescription?: string
    }

    export function DataTable<T extends Record<string, unknown>>({
      columns,
      data,
      loading,
      emptyTitle = 'Nenhum dado encontrado',
      emptyDescription = 'Ajuste os filtros ou importe dados para este período.',
    }: DataTableProps<T>) {
      const [sortKey, setSortKey] = useState<string | null>(null)
      const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

      const sorted = sortKey
        ? [...data].sort((a, b) => {
            const av = a[sortKey as keyof T]
            const bv = b[sortKey as keyof T]
            if (av === bv) return 0
            const cmp = (av as never) > (bv as never) ? 1 : -1
            return sortDir === 'asc' ? cmp : -cmp
          })
        : data

      if (loading) {
        return (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        )
      }

      if (data.length === 0) {
        return (
          <div className="rounded-lg border border-border bg-card">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        )
      }

      return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="sticky top-0 bg-card border-b border-border">
              <tr>
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.align === 'left' && 'text-left',
                      !col.align && 'text-left',
                      col.sortable && 'cursor-pointer select-none',
                    )}
                    onClick={() => {
                      if (!col.sortable) return
                      const k = String(col.key)
                      if (sortKey === k) {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortKey(k); setSortDir('asc')
                      }
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortKey === String(col.key) && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        'px-4 py-3 font-mono text-[12px] text-foreground h-12',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    ```

    ### `src/components/ui/period-selector.tsx`
    ```tsx
    'use client'

    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
    import { cn } from '@/lib/utils'

    export interface Period { id: string | number; label: string }

    interface PeriodSelectorProps {
      periods: Period[]
      value: string
      onChange: (v: string) => void
      className?: string
      placeholder?: string
    }

    export function PeriodSelector({ periods, value, onChange, className, placeholder = 'Selecione' }: PeriodSelectorProps) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={cn('w-[160px] font-mono text-[12px]', className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {periods.map(p => (
              <SelectItem key={String(p.id)} value={String(p.id)} className="font-mono text-[12px]">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    ```

    ### `src/components/ui/loja-badge.tsx`
    ```tsx
    import { cn } from '@/lib/utils'

    export type LojaName = 'Jebai' | 'Pajé 1' | 'Pajé 2'

    interface LojaBadgeProps { loja: LojaName; className?: string }

    const STYLES: Record<LojaName, { bg: string; dot: string; text: string }> = {
      'Jebai':  { bg: 'bg-jebai/15', dot: 'bg-jebai', text: 'text-jebai' },
      'Pajé 1': { bg: 'bg-paje1/15', dot: 'bg-paje1', text: 'text-paje1' },
      'Pajé 2': { bg: 'bg-paje2/15', dot: 'bg-paje2', text: 'text-paje2' },
    }

    export function LojaBadge({ loja, className }: LojaBadgeProps) {
      const s = STYLES[loja]
      return (
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[12px] uppercase',
          s.bg, s.text, className,
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
          {loja}
        </span>
      )
    }
    ```

    ### `src/components/ui/progress-ring.tsx`
    ```tsx
    interface ProgressRingProps {
      value: number       // 0..100+
      size?: number       // px
      color?: string      // CSS color override
      label?: string
    }

    export function ProgressRing({ value, size = 64, color, label }: ProgressRingProps) {
      const stroke = 5
      const radius = (size - stroke) / 2
      const circumference = 2 * Math.PI * radius
      const clamped = Math.max(0, Math.min(100, value))
      const offset = circumference - (clamped / 100) * circumference

      const resolvedColor = color
        ?? (value >= 100 ? 'hsl(var(--accent))' : value >= 70 ? 'rgb(var(--paje1))' : 'hsl(var(--muted-foreground))')

      return (
        <div
          className="relative inline-flex items-center justify-center motion-reduce:[&_circle]:transition-none"
          style={{ width: size, height: size }}
          role="progressbar"
          aria-valuenow={Math.round(clamped)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? 'Progresso'}
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none"
            />
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              stroke={resolvedColor} strokeWidth={stroke} fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
            />
          </svg>
          <span className="absolute font-mono text-[12px] text-foreground">
            {Math.round(clamped)}%
          </span>
        </div>
      )
    }
    ```

    ### `src/components/ui/empty-state.tsx`
    ```tsx
    import type { ReactNode } from 'react'
    import { Inbox } from 'lucide-react'

    interface EmptyStateProps {
      title: string
      description?: string
      icon?: ReactNode
      action?: ReactNode
    }

    export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-3">
          <div className="text-muted-foreground">
            {icon ?? <Inbox className="h-10 w-10" />}
          </div>
          <h3 className="font-sans text-base text-foreground">{title}</h3>
          {description && (
            <p className="font-sans text-base text-muted-foreground max-w-[320px]">
              {description}
            </p>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
      )
    }
    ```

    ### `src/components/ui/page-header.tsx`
    ```tsx
    import type { ReactNode } from 'react'
    import Link from 'next/link'

    interface Crumb { label: string; href?: string }

    interface PageHeaderProps {
      title: string
      subtitle?: string
      breadcrumbs?: Crumb[]
      actions?: ReactNode
    }

    export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
      return (
        <div className="flex flex-col gap-2 pb-4 border-b border-border md:flex-row md:items-baseline md:justify-between">
          <div className="flex flex-col gap-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="hidden md:flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
                {breadcrumbs.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    {c.href ? <Link href={c.href} className="hover:text-foreground">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
                    {i < breadcrumbs.length - 1 && <span>/</span>}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="font-sans text-xl font-bold text-foreground md:text-[28px] md:leading-[1.2]">
              {title}
            </h1>
            {subtitle && <p className="font-sans text-base text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )
    }
    ```

    ### Update `src/components/ui/index.tsx`
    **PRESERVE** all existing exports (KpiCard, StorePill, ProgressBar, BonusBadge, SectionTitle, LogoutButton). At the BOTTOM of the file, append:

    ```tsx
    // ── GDS v2 base components ────────────────────────────────────────────────
    export { StatCard } from './stat-card'
    export { DataTable, type Column } from './data-table'
    export { PeriodSelector, type Period as PeriodOption } from './period-selector'
    export { LojaBadge, type LojaName } from './loja-badge'
    export { ProgressRing } from './progress-ring'
    export { EmptyState } from './empty-state'
    export { PageHeader } from './page-header'
    ```
  </action>
  <verify>
    <automated>
      ```powershell
      $files = @('stat-card','data-table','period-selector','loja-badge','progress-ring','empty-state','page-header')
      ($files | ForEach-Object { Test-Path "src\components\ui\$_.tsx" }) -notcontains $false
      (Select-String -Path src\components\ui\index.tsx -Pattern "StatCard","DataTable","PeriodSelector","LojaBadge","ProgressRing","EmptyState","PageHeader","KpiCard","StorePill" | Measure-Object).Count -ge 9
      npx tsc --noEmit 2>&1 | Select-String "error TS" | Measure-Object | Select-Object -ExpandProperty Count
      ```
      First: True. Second: >=9 (7 new + 2 legacy spot-checks). Third: 0 errors.
    </automated>
  </verify>
  <done>All 7 component files exist, barrel exports them, legacy exports preserved, `npx tsc --noEmit` reports 0 errors related to these components.</done>
</task>

<task type="auto" id="T08">
  <name>T08: Implement Layout v2 — sidebar + topbar + mobile Sheet + dashboard layout (FOUND-06)</name>
  <files>
    src/hooks/use-sidebar.ts,
    src/components/shared/sidebar.tsx,
    src/components/shared/topbar.tsx,
    src/components/shared/theme-toggle.tsx,
    src/app/dashboard/layout.tsx
  </files>
  <depends_on>T04, T06, T07</depends_on>
  <action>
    1. **Hook** — `src/hooks/use-sidebar.ts`:
       ```tsx
       'use client'

       import { useEffect, useState, useCallback } from 'react'

       const KEY = 'gds:sidebar-collapsed'

       export function useSidebar() {
         const [collapsed, setCollapsed] = useState<boolean>(false)
         const [hydrated, setHydrated] = useState(false)

         useEffect(() => {
           try {
             const stored = window.localStorage.getItem(KEY)
             if (stored !== null) setCollapsed(JSON.parse(stored) === true)
           } catch { /* localStorage unavailable */ }
           setHydrated(true)
         }, [])

         const toggle = useCallback(() => {
           setCollapsed(prev => {
             const next = !prev
             try { window.localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* */ }
             return next
           })
         }, [])

         return { collapsed, toggle, hydrated }
       }
       ```

    2. **Theme toggle** — `src/components/shared/theme-toggle.tsx`:
       ```tsx
       'use client'

       import { useTheme } from 'next-themes'
       import { useEffect, useState } from 'react'
       import { Moon, Sun } from 'lucide-react'
       import { Button } from '@/components/ui/button'

       export function ThemeToggle() {
         const { theme, setTheme } = useTheme()
         const [mounted, setMounted] = useState(false)
         useEffect(() => setMounted(true), [])
         if (!mounted) return <Button variant="ghost" size="icon" aria-label="Tema" disabled />

         const isDark = theme === 'dark'
         return (
           <Button
             variant="ghost"
             size="icon"
             aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
             onClick={() => setTheme(isDark ? 'light' : 'dark')}
           >
             {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
           </Button>
         )
       }
       ```

    3. **Sidebar** — `src/components/shared/sidebar.tsx`:
       ```tsx
       'use client'

       import Link from 'next/link'
       import { usePathname } from 'next/navigation'
       import { LayoutDashboard, TrendingUp, DollarSign, Users, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
       import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
       import { Button } from '@/components/ui/button'
       import { useSidebar } from '@/hooks/use-sidebar'
       import { cn } from '@/lib/utils'

       const NAV = [
         { href: '/dashboard',           label: 'Dashboard',   icon: LayoutDashboard },
         { href: '/dashboard/vendas',    label: 'Vendas',      icon: TrendingUp },
         { href: '/dashboard/comissoes', label: 'Comissões',   icon: DollarSign },
         { href: '/dashboard/usuarios',  label: 'Usuários',    icon: Users },
         { href: '/dashboard/treinamento', label: 'Treinamento', icon: GraduationCap },
       ]

       export function Sidebar() {
         const pathname = usePathname()
         const { collapsed, toggle, hydrated } = useSidebar()
         const width = collapsed ? 64 : 240

         return (
           <aside
             className="hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-border bg-background"
             style={{ width, transition: hydrated ? 'width 200ms ease' : 'none' }}
             aria-label="Navegação principal"
           >
             <div className={cn('flex items-center px-4 h-14 border-b border-border', collapsed ? 'justify-center' : 'justify-start')}>
               <span className="font-sans font-bold text-base text-foreground">
                 {collapsed ? 'G' : 'GDS Frame'}
               </span>
             </div>
             <nav className="flex-1 px-2 py-4 space-y-1">
               <TooltipProvider delayDuration={0}>
                 {NAV.map(item => {
                   const active = pathname === item.href || pathname.startsWith(item.href + '/')
                   const Icon = item.icon
                   const link = (
                     <Link
                       href={item.href}
                       className={cn(
                         'flex items-center gap-3 rounded-md px-3 py-2 font-sans text-base transition-colors',
                         collapsed && 'justify-center px-0',
                         active
                           ? 'bg-accent/10 text-accent border-l-[3px] border-accent rounded-l-none pl-[9px]'
                           : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                       )}
                     >
                       <Icon className={cn('h-[18px] w-[18px]', active && 'text-accent')} />
                       {!collapsed && <span>{item.label}</span>}
                     </Link>
                   )
                   return collapsed ? (
                     <Tooltip key={item.href}>
                       <TooltipTrigger asChild>{link}</TooltipTrigger>
                       <TooltipContent side="right">{item.label}</TooltipContent>
                     </Tooltip>
                   ) : (
                     <div key={item.href}>{link}</div>
                   )
                 })}
               </TooltipProvider>
             </nav>
             <div className="p-2 border-t border-border">
               <Button
                 variant="ghost"
                 size="icon"
                 className="w-full"
                 onClick={toggle}
                 aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
               >
                 {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
               </Button>
             </div>
           </aside>
         )
       }
       ```

    4. **Topbar** — `src/components/shared/topbar.tsx`:
       ```tsx
       'use client'

       import { useState } from 'react'
       import { Menu, LogOut, User } from 'lucide-react'
       import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
       import { Button } from '@/components/ui/button'
       import { Avatar, AvatarFallback } from '@/components/ui/avatar'
       import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
       import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
       import { ThemeToggle } from './theme-toggle'

       interface TopbarProps {
         userInitials?: string
         onLogout?: () => void
       }

       export function Topbar({ userInitials = 'GD', onLogout }: TopbarProps) {
         const [period, setPeriod] = useState<string>('')
         const [loja, setLoja] = useState<string>('all')
         const [mobileOpen, setMobileOpen] = useState(false)

         return (
           <header className="fixed top-0 inset-x-0 z-30 h-14 border-b border-border bg-card flex items-center gap-2 px-4 md:left-[64px] md:[&[data-expanded=true]]:left-[240px]">
             <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" className="md:hidden h-11 w-11" aria-label="Abrir menu">
                   <Menu className="h-5 w-5" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="w-[280px] p-0">
                 <SheetTitle className="sr-only">Menu</SheetTitle>
                 <div className="px-4 h-14 flex items-center border-b border-border">
                   <span className="font-sans font-bold text-base">GDS Frame</span>
                 </div>
                 <nav className="px-2 py-4 space-y-1 font-sans text-base">
                   {/* Same NAV array as sidebar — keep in sync */}
                   <a href="/dashboard"           className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Dashboard</a>
                   <a href="/dashboard/vendas"    className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Vendas</a>
                   <a href="/dashboard/comissoes" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Comissões</a>
                   <a href="/dashboard/usuarios"  className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Usuários</a>
                   <a href="/dashboard/treinamento" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">Treinamento</a>
                 </nav>
               </SheetContent>
             </Sheet>

             <div className="flex-1 flex items-center gap-2 justify-end md:justify-start md:pl-4">
               <Select value={period} onValueChange={setPeriod}>
                 <SelectTrigger className="w-[140px] font-mono text-[12px]" aria-label="Período">
                   <SelectValue placeholder="Período" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="current" className="font-mono text-[12px]">Período atual</SelectItem>
                 </SelectContent>
               </Select>
               <Select value={loja} onValueChange={setLoja}>
                 <SelectTrigger className="w-[120px] font-mono text-[12px]" aria-label="Loja">
                   <SelectValue placeholder="Loja" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all"    className="font-mono text-[12px]">Todas</SelectItem>
                   <SelectItem value="Jebai"  className="font-mono text-[12px]">Jebai</SelectItem>
                   <SelectItem value="Paje-MKT"   className="font-mono text-[12px]">Pajé 1</SelectItem>
                   <SelectItem value="Paje-Caixa" className="font-mono text-[12px]">Pajé 2</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="flex items-center gap-1 ml-auto">
               <ThemeToggle />
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Menu do usuário">
                     <Avatar className="h-8 w-8"><AvatarFallback className="font-mono text-[12px]">{userInitials}</AvatarFallback></Avatar>
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuItem className="font-sans"><User className="h-4 w-4 mr-2" />Perfil</DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem className="font-sans" onClick={onLogout}><LogOut className="h-4 w-4 mr-2" />Sair</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           </header>
         )
       }
       ```

    5. **Dashboard layout** — `src/app/dashboard/layout.tsx`:
       ```tsx
       'use client'

       import { Sidebar } from '@/components/shared/sidebar'
       import { Topbar } from '@/components/shared/topbar'
       import { useSidebar } from '@/hooks/use-sidebar'

       export default function DashboardLayout({ children }: { children: React.ReactNode }) {
         const { collapsed } = useSidebar()
         const sidebarWidth = collapsed ? 64 : 240

         async function handleLogout() {
           const { createClient } = await import('@/lib/supabase/client')
           await createClient().auth.signOut()
           window.location.href = '/login'
         }

         return (
           <div className="min-h-screen bg-background text-foreground">
             <Sidebar />
             <Topbar onLogout={handleLogout} />
             <main
               className="pt-14 px-4 md:px-6"
               style={{ marginLeft: 0, paddingLeft: undefined }}
             >
               <div className="md:ml-[var(--sidebar-w)]" style={{ ['--sidebar-w' as never]: `${sidebarWidth}px`, transition: 'margin-left 200ms ease' }}>
                 {children}
               </div>
             </main>
           </div>
         )
       }
       ```

       Note: An auth guard at the dashboard layout would require server-side data fetching — out of scope for Phase 1 layout-only scaffold. Middleware already enforces auth (`src/middleware.ts`). Adding a server-side guard here is deferred to Phase 2.
  </action>
  <verify>
    <automated>
      ```powershell
      $files = @('src\hooks\use-sidebar.ts','src\components\shared\sidebar.tsx','src\components\shared\topbar.tsx','src\components\shared\theme-toggle.tsx','src\app\dashboard\layout.tsx')
      ($files | ForEach-Object { Test-Path $_ }) -notcontains $false
      (Select-String -Path src\components\shared\sidebar.tsx -Pattern "fixed","width: 200ms","240","64","hidden md:flex" | Measure-Object).Count -ge 4
      (Select-String -Path src\components\shared\topbar.tsx -Pattern "h-14","Sheet","DropdownMenu","Avatar","ThemeToggle" | Measure-Object).Count -ge 5
      npx tsc --noEmit 2>&1 | Select-String "error TS" | Measure-Object | Select-Object -ExpandProperty Count
      ```
      First: True. Second: >=4. Third: >=5. Fourth: 0 errors.
    </automated>
  </verify>
  <done>5 new files exist. Sidebar 240/64px desktop-only. Topbar 56px with period+loja Select, Avatar+DropdownMenu, ThemeToggle. Mobile Sheet side="left" 280px. Dashboard layout wires both + handles logout. 0 TS errors.</done>
</task>

<task type="auto" id="T09">
  <name>T09: Final build + lint verification (FOUND-07)</name>
  <files>(no writes — verification only)</files>
  <depends_on>T02, T03, T07, T08</depends_on>
  <action>
    Run the full build pipeline:
    ```powershell
    npm run build 2>&1 | Tee-Object -FilePath .planning\phase-01\final-build.log
    ```

    Then lint:
    ```powershell
    npm run lint 2>&1 | Tee-Object -FilePath .planning\phase-01\final-lint.log
    ```

    Fix-loop: if `npm run build` exits non-zero, read the error, fix the offending file, and re-run. Only proceed when both commands exit 0 (or lint shows warnings only, no errors).

    Common predicted failures and their fixes:
    - **"Module not found: Can't resolve '@/components/ui/sheet'"** → shadcn `add sheet` was skipped; run `npx shadcn@latest add sheet`.
    - **"export 'cn' (imported as 'cn') was not found in '@/lib/utils'"** → utils.ts overwrite leaked through; restore from backup (see T04 step 3).
    - **"Hydration mismatch on <html>"** → `suppressHydrationWarning` missing in `src/app/layout.tsx`; add it.
    - **"Cannot find module 'tailwindcss-animate'"** → `npm install tailwindcss-animate` (should be done in T05; re-run if missing).
    - **Type error in existing inline-styled component referencing `var(--bg)`** → confirm legacy aliases in `globals.css` are present (T05 mitigates T-01-02).
  </action>
  <verify>
    <automated>
      ```powershell
      npm run build; if ($LASTEXITCODE -ne 0) { exit 1 }
      npm run lint;  if ($LASTEXITCODE -ne 0) { exit 1 }
      Test-Path .next\BUILD_ID
      ```
      All three: exit 0 / exit 0 / True.
    </automated>
  </verify>
  <done>`npm run build` exits 0. `npm run lint` exits 0 (or only warnings). `.next/BUILD_ID` exists. Build log captured at `.planning/phase-01/final-build.log` for the SUMMARY.</done>
</task>

<task type="checkpoint:human-verify" id="T10">
  <name>T10: Visual verification of Layout v2 (FOUND-06)</name>
  <gate>blocking</gate>
  <what-built>
    - Dark theme by default with #0e0f11 background and #c8f542 accent
    - Sidebar 240px expanded / 64px collapsed on desktop, persists across reload
    - Hamburger + Sheet drawer on mobile (<768px)
    - Topbar with period selector, loja selector, theme toggle, avatar + dropdown (with "Sair")
    - Syne for headings/body, DM Mono for labels/numeric — both via next/font (no CDN call in Network tab)
    - Dark/light toggle works
  </what-built>
  <how-to-verify>
    1. Start dev server: `npm run dev`
    2. Open http://localhost:3000/dashboard (log in if redirected to /login)
    3. **Desktop checks** (window >= 1024px):
       - Sidebar visible at left, 240px wide, with nav items (Dashboard, Vendas, Comissões, Usuários, Treinamento)
       - Click collapse button at bottom of sidebar → it shrinks to 64px, labels disappear, icons remain
       - Hover collapsed nav items → tooltip with label appears
       - Reload page → sidebar stays collapsed (localStorage persisted)
       - Topbar at 56px, contains period selector + loja selector + sun/moon toggle + avatar
       - Click avatar → dropdown opens with "Perfil" and "Sair"
       - Active route has #c8f542 left border + accent text
    4. **Mobile checks** (DevTools responsive mode, width < 768px):
       - Sidebar hidden
       - Hamburger icon visible at top-left of topbar
       - Click hamburger → Sheet slides in from left at 280px wide, contains same nav items
       - Click outside or swipe → Sheet closes
    5. **Theme toggle**:
       - Click sun/moon → theme switches, background changes (dark `#0e0f11` ↔ light `#f8f9fa`)
       - No flash of unstyled content on reload
       - No console warning about hydration mismatch
    6. **Fonts** (DevTools → Network → filter "font"):
       - You see `.woff2` requests served from `/_next/static/...` for both Syne and DM Mono
       - You do NOT see any request to `fonts.googleapis.com`
    7. **Legacy components still render** (visit /dashboard if admin or /meu-resultado if vendor):
       - KpiCard, StorePill, ProgressBar from inline-style era still display correctly (mitigates T-01-02)
  </how-to-verify>
  <resume-signal>Reply "approved" if all checks pass, or describe what failed.</resume-signal>
  <done>User confirms visual+behavioral correctness of Layout v2 in both viewports and both themes. Legacy components unaffected.</done>
</task>

</tasks>

<verification>
**Phase-level checks** (all must pass):

1. **FOUND-01:** `Test-Path supabase\migrations\0001_schema_inicial.sql` is True; file >=50 lines; mentions all 4 tables + 2 views + 1 RPC.
2. **FOUND-02:** `Test-Path src\app\mapeamento` and `Test-Path src\app\dashboard\metas` both False; zero matches for those literals in `src/`.
3. **FOUND-03:** `components.json` exists; 18 shadcn primitives in `src/components/ui/`; `globals.css` has `--background` (HSL), `--accent: 74 89% 62%`, `.light` variant, legacy aliases (`--bg`, `--text`, `--surface`, `--surface2`).
4. **FOUND-04:** `src/app/layout.tsx` imports from `next/font/google`; no `fonts.googleapis.com` substring anywhere in `src/`; `ThemeProvider` wraps body; `suppressHydrationWarning` present.
5. **FOUND-05:** All 7 component files exist; barrel `src/components/ui/index.tsx` exports them; `npx tsc --noEmit` returns 0 errors.
6. **FOUND-06:** Sidebar + Topbar + dashboard layout + `use-sidebar` hook present; T10 visual checks pass.
7. **FOUND-07:** `npm run build` exits 0; `npm run lint` exits 0 (or warnings only).
8. **Goal-backward truths** (all 11 truths in `must_haves.truths`) confirmed.
</verification>

<success_criteria>
Phase 1 is complete when:

1. ✅ `supabase/migrations/0001_schema_inicial.sql` exists, versioned, with public schema snapshot
2. ✅ `npm run build` exits 0
3. ✅ `npm run lint` exits 0 (no critical errors)
4. ✅ Dark theme (#0e0f11 bg + #c8f542 accent) is visible default at `/dashboard`
5. ✅ Light theme accessible via topbar toggle, uses #f8f9fa bg + #16a34a accent
6. ✅ Syne + DM Mono served by next/font (no CDN font requests in browser Network tab)
7. ✅ All 7 GDS base components render and are exported from `@/components/ui`
8. ✅ Sidebar: 240/64 px desktop, persists via localStorage; mobile Sheet works at 280px
9. ✅ Topbar: 56px with period/loja selectors, avatar+dropdown, theme toggle
10. ✅ No dangling references to deleted routes (`/mapeamento`, `/dashboard/metas`)
11. ✅ All original `src/lib/utils.ts` exports (fmtCurrency, metaLevel, STORE_COLORS, etc.) still present alongside new `cn()`
12. ✅ All existing inline-styled components (KpiCard, StorePill, ProgressBar, etc.) still render correctly thanks to CSS var aliases
13. ✅ T10 human-verify checkpoint signed off

If ANY of 1-12 fails: do NOT mark phase complete; fix in-place and re-run T09.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-01-SUMMARY.md` with:
- What was built (each FOUND-XX requirement → outcome)
- Files created/modified (final list)
- Decisions made during execution (e.g., chose `dashboard/layout.tsx` over route group `(dashboard)/`)
- Outstanding follow-ups (e.g., refactor legacy inline-styled components to Tailwind — deferred to a later phase)
- Build/lint final status
- Test artifacts: `.planning/phase-01/final-build.log`, `.planning/phase-01/final-lint.log`
</output>
