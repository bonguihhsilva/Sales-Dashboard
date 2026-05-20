# Phase 1: Foundation — Research

**Researched:** 2026-05-19
**Domain:** Next.js 15 / shadcn/ui / next/font / Supabase schema extraction / layout architecture
**Confidence:** HIGH

---

## Summary

Phase 1 establishes the codebase scaffold for GDS Frame Dashboard v2. The project already has a working Next.js 15.2.4 app with inline-styled components and a Google Fonts CDN `<link>` in the layout. No dead route directories were found on disk (FOUND-02 is simpler than expected). The node_modules directory is absent — `npm install` must be the first executor action.

shadcn/ui v4.7.0 (latest) supports React 19 natively via updated Radix UI packages (all current @radix-ui packages declare `react@^19.0` as a valid peer). The `--legacy-peer-deps` flag is still the safe default for npm to avoid any transitive packages that haven't updated their peer declarations, but it does not affect runtime behavior.

The font migration from CDN `<link>` to `next/font/google` is straightforward: use the `variable` option to expose CSS custom properties so both the Tailwind config and remaining inline styles can reference `var(--font-syne)` and `var(--font-dm-mono)`. This means zero changes to existing inline `style={{}}` calls that use `fontFamily: 'Syne, sans-serif'` — those will resolve correctly once the CSS var is declared on `<html>`.

**Primary recommendation:** Run `npm install` → extract Supabase schema → delete nothing (no dead directories exist) → init shadcn → migrate fonts → create 7 components → build layout → verify build passes.

---

## Project Constraints (from CLAUDE.md + CLAUDE_2.md)

These directives are locked and override any research recommendations:

- Stack is fixed: Next.js 15.2.4, React 19, TypeScript strict, shadcn/ui, Supabase, Recharts, Tailwind CSS 3.4.1
- Supabase project: `zsczxblhtdhpdqvkpuwz` — all schema changes via migration files only, never direct edits
- RLS must stay active on all tables
- Multi-tenant support (`tenant_id`) must be architecturally present from Sprint 1 — Phase 1 schema dump must reflect this
- No `any` implicit types; strict mode enforced
- Server Components by default; `'use client'` only for interactivity
- Inline styles in **existing** components: keep as-is. New components: Tailwind utility classes only
- `npm run build` must pass before any phase is declared complete
- Currency: USD default, Intl.NumberFormat — never hardcode symbol
- Deployment target: VPS (Docker + Traefik) not Vercel for production; Vercel currently handles CI-triggered deploys from GitHub

---

## Research Findings by Task

### Task 1: Dead Route Verification (FOUND-02)

**Finding:** Neither `/src/app/mapeamento/` nor `/src/app/dashboard/metas/` exist on disk.

Full file list under `src/app/`:
```
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx
src/app/login/page.tsx
src/app/dashboard/page.tsx
src/app/dashboard/PeriodSelector.tsx
src/app/dashboard/UploadModal.tsx
src/app/dashboard/ClientsTab.tsx
src/app/dashboard/usuarios/page.tsx
src/app/dashboard/usuarios/UsersClient.tsx
src/app/dashboard/vendedor/[vendor_id]/page.tsx
src/app/dashboard/vendedor/[vendor_id]/EvolutionChart.tsx
src/app/meu-resultado/page.tsx
src/app/api/admin/create-period/
src/app/api/admin/create-user/
src/app/api/admin/ensure-period/
src/app/api/admin/periods/
src/app/api/admin/relatorio-excel/
src/app/api/admin/setup-trigger/
src/app/api/admin/update-goals/
src/app/api/admin/update-user/
```

**Implication for FOUND-02:** No deletion is needed. The task changes to: verify `/dashboard/metas` is absent, confirm no dangling imports reference it, and ensure build passes. [VERIFIED: filesystem glob]

**Risk:** `CLAUDE_2.md §2` mentions `/dashboard/metas` as an existing route, but it is not present in the filesystem. Possible it was never created or was removed previously.

---

### Task 2: shadcn/ui Init for Next.js 15 + React 19 (FOUND-03)

**shadcn CLI version:** 4.7.0 [VERIFIED: npm registry]
**React version in use:** 19.0.0 [VERIFIED: package.json]
**Current Radix UI peer dep for react:** `^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc` [VERIFIED: npm view @radix-ui/react-dialog peerDependencies]

**Status:** React 19 is fully supported by current Radix UI packages. No peer conflict exists for the core @radix-ui/* packages.

**Risk area:** Transitive dependencies of `react-hook-form` and `@hookform/resolvers` (pulled in by shadcn's `form` component) may still declare older peer ranges. Use `--legacy-peer-deps` on all npm installs to be safe — this is a flag issue only, not a runtime issue.

**Exact init command:**
```bash
npm install   # must run first — node_modules is absent
npx shadcn@latest init
```

When prompted, answer:
- TypeScript: yes
- Style: Default
- Base color: Slate
- CSS variables: yes
- Path for components: `src/components/ui` (default matches existing barrel)
- Path for utils: `src/lib/utils` (must change from shadcn default `src/lib/utils.ts` — already exists)

**After init, install components in two batches:**
```bash
npx shadcn@latest add button card badge table tabs select dialog sheet
npx shadcn@latest add dropdown-menu avatar separator skeleton tooltip
npx shadcn@latest add form input label textarea switch
```

If any npm install fails with peer dependency error, append `-- --legacy-peer-deps`:
```bash
npx shadcn@latest add sheet -- --legacy-peer-deps
```

**What init creates:**
- `components.json` — shadcn config
- `src/lib/utils.ts` will be updated with `cn()` helper (merges tailwind-merge + clsx)
- Overwrites or extends `tailwind.config.js` with shadcn color variable references
- Adds CSS variable declarations to `globals.css`

**Collision risk with existing `src/lib/utils.ts`:** The existing file exports `fmtCurrency`, `fmtK`, `metaLevel`, `bonusAmount`, `recencyColor`, `recencyLabel`, `STORE_COLORS`, `STORE_LABELS`. shadcn init will add `cn()` to this file. The executor must verify the file is not overwritten — if it is, restore existing exports and add `cn()` alongside them. [ASSUMED: shadcn init appends rather than overwrites; verify after running]

**New packages installed by shadcn init:**
- `class-variance-authority` 0.7.1
- `tailwind-merge` 3.6.0
- `@radix-ui/react-slot` 1.2.4
- `lucide-react` — already present at ^0.468.0 (shadcn will use existing)

[VERIFIED: npm registry for versions]

---

### Task 3: next/font/google Migration (FOUND-04)

**Current state:** `layout.tsx` loads fonts via `<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap" />` in `<head>`.

**Migration strategy:** Use the `variable` option to expose fonts as CSS custom properties. This allows both Tailwind utility classes and existing inline `style={{ fontFamily: 'var(--font-syne)' }}` patterns to work without changing every call site.

**Important naming:** Google Fonts with spaces use underscores in the Next.js import: `DM_Mono`, not `DM Mono`. [CITED: nextjs.org/docs/app/api-reference/components/font]

**Pattern for `src/app/layout.tsx`:**
```typescript
import { Syne, DM_Mono } from 'next/font/google'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${syne.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**CSS variable resolution:** When `className={syne.variable}` is applied to `<html>`, Next.js injects `--font-syne: 'Syne'` as a CSS custom property on that element. Any descendent can then reference `var(--font-syne)`.

**Tailwind config update required:**
```js
fontFamily: {
  sans: ['var(--font-syne)', 'sans-serif'],
  mono: ['var(--font-dm-mono)', 'monospace'],
},
```

**globals.css body rule update:**
```css
body {
  font-family: var(--font-syne), sans-serif;
}
```

**Existing inline styles:** References to `fontFamily: 'Syne, sans-serif'` and `fontFamily: 'DM Mono, monospace'` in existing components will continue to resolve because those font names are now self-hosted by Next.js. However, best practice is to migrate them to `fontFamily: 'var(--font-syne)'` when touching those components. The UI-SPEC says existing components are being refactored to Tailwind as part of this phase.

**Remove:** The `<link>` tag and the `<head>` block in `layout.tsx`. Next.js manages font preloading automatically. [CITED: nextjs.org/docs/app/api-reference/components/font]

---

### Task 4: Supabase CLI and Schema Extraction (FOUND-01)

**CLI availability:** `npx supabase` resolves to version 2.100.1 (auto-downloaded via npx). Not installed globally. [VERIFIED: bash npx supabase --version]

**node_modules is absent:** The supabase CLI via npx will work without npm install, but the project won't build until `npm install` is run first.

**Extraction command:**
```bash
npx supabase db dump --project-ref zsczxblhtdhpdqvkpuwz --schema public > supabase/migrations/0001_schema_inicial.sql
```

**Flag notes:**
- `--schema public` limits to the public schema (avoids auth/storage internals)
- Output goes directly to the migration file
- Requires SUPABASE_ACCESS_TOKEN environment variable or interactive login via `npx supabase login`

**Login flow (if token not set):**
```bash
npx supabase login   # opens browser for OAuth
# then run the dump command
```

**Alternative if CLI auth fails:** Use the Supabase Studio SQL Editor to run `pg_dump` equivalents or use the "Table Editor → Export" flow. This would produce manual SQL that must be assembled into the migration file.

**Known schema from code inspection** (tables confirmed via query patterns in existing code):
- `profiles` — id, name, role (adm|vendedor), vendor_id, store, active
- `periods` — id, year, month, label, start_date, end_date, closed
- `vendor_summary` — view or materialized view: period_id, vendor_id, vendor_name, store, total_sold, unique_clients, total_orders, total_items, avg_ticket, last_sale_date, meta1-3, bonus1-3, commission_pct, meta_level, bonus_earned, total_commission
- `goals` — period_id, vendor_id, vendor_name, store, meta1-3, bonus1-3, commission_pct
- `sales_records` — period_id, vendor_id, vendor_name, store, client_id, client_name, sale_date, sale_time, order_ref, valor, quantity
- `client_portfolio` — view: period_id, vendor_id, client_id, client_name, total_spent, visit_days, total_orders, total_items, avg_items_per_order, avg_ticket, first_purchase, last_purchase, days_since_last

**RPC confirmed:** `vendor_evolution(p_vendor_id)` — returns VendorEvolution[] records

[VERIFIED: inferred from TypeScript types in src/types/index.ts and query patterns in page files]

**Phase 1 scope for FOUND-01:** The migration file must capture the current schema as-is. The multi-tenant `tenant_id` columns come in Sprint 1 (Phase 2), not Phase 1. Phase 1 migration = snapshot only.

---

### Task 5: Components to Preserve vs Replace

**Preserve (keep working, will be refactored to Tailwind in FOUND-05 or later):**

| Component | File | Keep? | Notes |
|-----------|------|-------|-------|
| `KpiCard` | `src/components/ui/index.tsx` | Replace with `stat-card` | Predecessor — stat-card supersedes it |
| `StorePill` | `src/components/ui/index.tsx` | Replace with `loja-badge` | loja-badge is the v2 equivalent |
| `ProgressBar` | `src/components/ui/index.tsx` | Replace with `progress-ring` | Different shape (ring vs bar) — ProgressBar may coexist |
| `BonusBadge` | `src/components/ui/index.tsx` | Keep temporarily | No direct v2 equivalent in FOUND-05 scope |
| `SectionTitle` | `src/components/ui/index.tsx` | Keep temporarily | Simple wrapper — no shadcn equivalent needed |
| `LogoutButton` | `src/components/ui/index.tsx` | Replace with Avatar+DropdownMenu in topbar | Topbar will include logout in dropdown |
| `PeriodSelector` | `src/app/dashboard/PeriodSelector.tsx` | Replace with `period-selector` | v2 period-selector uses shadcn Select |
| `UploadModal` | `src/app/dashboard/UploadModal.tsx` | Keep (preserve functionality) | Uses `lib/parser.ts`; will be wrapped in shadcn Dialog in a later phase |
| `UsersClient` | `src/app/dashboard/usuarios/UsersClient.tsx` | Keep (preserve functionality) | Functional; visual update deferred to Sprint 2 |
| `ClientsTab` | `src/app/dashboard/ClientsTab.tsx` | Keep | Data logic preserved; may use data-table later |
| `EvolutionChart` | `src/app/dashboard/vendedor/[vendor_id]/EvolutionChart.tsx` | Keep | Recharts chart; no change in Phase 1 |

**Risk:** `dashboard/page.tsx` imports both `PeriodSelector` (from `./PeriodSelector`) and `UploadModal` (from `./UploadModal`). When layout v2 moves `PeriodSelector` into the topbar, the page-level import must be removed. This is a Phase 1 refactor scope decision.

**FOUND-05 creates new files:** `stat-card.tsx`, `data-table.tsx`, `period-selector.tsx`, `loja-badge.tsx`, `progress-ring.tsx`, `empty-state.tsx`, `page-header.tsx` — all in `src/components/ui/`. These co-exist with the existing barrel (`index.tsx`). The barrel must export the new components after creation.

---

### Task 6: TypeScript Errors in Current Build

**node_modules is absent** — a full `tsc` check cannot run in this session. [VERIFIED: filesystem check]

**Known import that may cause build error:** `UploadModal.tsx` line 3 imports:
```typescript
import { parseSalesHtml, toIsoDate } from '@/lib/parser'
```
The file `src/lib/parser.ts` exists (confirmed). If it exports `parseSalesHtml` and `toIsoDate`, this import is valid.

**Potential TS issues identified by code inspection:**

1. `STORE_COLORS` and `STORE_LABELS` are exported from **both** `src/types/index.ts` and `src/lib/utils.ts`. This is a duplicate export, not a compile error, but importing from the wrong location is possible. Dashboard page imports from `@/lib/utils` — consistent with the barrel. [ASSUMED: no compile error; just code smell]

2. `dashboard/page.tsx` references `profile?.role !== 'adm'` which relies on the `adm` literal — consistent with `UserRole = 'adm' | 'vendedor'` in types. Valid.

3. The middleware uses `Record<string, unknown>` for cookie options — TypeScript strict will accept this.

4. No missing shadcn imports will exist until shadcn is initialized — the new layout components will create new import dependencies.

**Executor action:** Run `npm install && npm run build` after `npm install` to capture any pre-existing errors before making changes.

---

### Task 7: shadcn/ui Components for Layout (FOUND-06)

**Required shadcn components for the v2 layout:**

| Component | Use | Install batch |
|-----------|-----|---------------|
| `Sheet` | Mobile navigation drawer (hamburger → side panel) | Batch 1 |
| `Button` | Collapse toggle, hamburger button, CTA actions | Batch 1 |
| `Avatar` | User avatar in topbar | Batch 2 |
| `DropdownMenu` | Avatar click → user menu with logout | Batch 2 |
| `Select` | Period selector, loja selector in topbar | Batch 1 |
| `Separator` | Visual dividers in sidebar | Batch 2 |
| `Tooltip` | Nav item labels in collapsed sidebar state | Batch 2 |
| `Switch` or icon button | Dark/light theme toggle | Batch 2 (switch) |
| `Skeleton` | Loading states in content area | Batch 2 |

**Sheet component note:** shadcn's Sheet is built on `@radix-ui/react-dialog` with `side` prop variants. The `side="left"` variant produces the slide-from-left behavior required by the spec. Width is controlled via `className` on `SheetContent`. [CITED: ui.shadcn.com component docs]

**next-themes:** Required for dark/light toggle. Must be installed separately:
```bash
npm install next-themes
```
Version 0.4.6 [VERIFIED: npm registry]. Wrap layout in `ThemeProvider` with `attribute="class"` and `defaultTheme="dark"`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui CLI | 4.7.0 | Component scaffolding | Official shadcn tooling |
| @radix-ui/react-dialog | 1.1.15 | Headless dialog/Sheet | Ships with shadcn Sheet |
| tailwind-merge | 3.6.0 | Merge Tailwind classes safely | Required by shadcn cn() |
| class-variance-authority | 0.7.1 | Component variant API | Required by shadcn components |
| next-themes | 0.4.6 | Dark/light mode toggle | Standard Next.js theming |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.468.0 (already installed) | Icons | All icon needs — already in project |
| clsx | ^2.1.1 (already installed) | Conditional classes | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Radix UI directly | More setup; shadcn provides styled starting point aligned with design spec |
| next-themes | Manual class toggle | next-themes handles SSR hydration, localStorage, system preference automatically |

**Installation (full sequence for executor):**
```bash
# Step 0: restore dependencies
npm install

# Step 1: shadcn init
npx shadcn@latest init
# answer: TypeScript=yes, Default style, Slate base, CSS variables=yes
# component path: src/components/ui
# utils path: src/lib/utils.ts

# Step 2: shadcn components batch 1
npx shadcn@latest add button card badge table tabs select dialog sheet

# Step 3: shadcn components batch 2
npx shadcn@latest add dropdown-menu avatar separator skeleton tooltip switch

# Step 4: shadcn components batch 3 (form components)
npx shadcn@latest add form input label textarea

# Step 5: next-themes
npm install next-themes
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope)
```
src/
├── app/
│   ├── layout.tsx           # Root: ThemeProvider + font vars + globals.css
│   ├── globals.css          # GDS token vars + shadcn var overrides + scrollbar
│   ├── (auth)/
│   │   └── login/
│   └── (dashboard)/
│       ├── layout.tsx       # Sidebar + topbar + auth guard (NEW in Phase 1)
│       └── dashboard/       # existing routes move under (dashboard) group
├── components/
│   ├── ui/                  # shadcn components + 7 custom GDS components
│   │   ├── index.tsx        # barrel — keep existing + add new exports
│   │   ├── stat-card.tsx
│   │   ├── data-table.tsx
│   │   ├── period-selector.tsx
│   │   ├── loja-badge.tsx
│   │   ├── progress-ring.tsx
│   │   ├── empty-state.tsx
│   │   └── page-header.tsx
│   └── shared/
│       ├── sidebar.tsx      # Collapsible sidebar (desktop)
│       └── topbar.tsx       # Fixed topbar with selectors + avatar
└── hooks/
    └── use-sidebar.ts       # localStorage-backed collapsed state
```

**Route group consideration:** Moving existing routes under a `(dashboard)` route group to share the layout (sidebar + topbar) is the correct App Router pattern. However, this involves moving files and updating imports. An alternative with lower risk: add a `layout.tsx` directly at `src/app/dashboard/layout.tsx` for the dashboard segment only. Mobile hamburger behavior and topbar are added there without restructuring the file tree. Phase 1 can start with the simpler approach.

### Pattern 1: Sidebar Collapse via CSS Transition
```typescript
// src/hooks/use-sidebar.ts
'use client'
import { useState, useEffect } from 'react'

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored) setCollapsed(JSON.parse(stored))
  }, [])

  const toggle = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(!prev))
      return !prev
    })
  }

  return { collapsed, toggle }
}
```

Sidebar width CSS transition:
```css
/* applied via inline style or Tailwind arbitrary values */
transition: width 200ms ease;
width: collapsed ? 64px : 240px;
```

### Pattern 2: ThemeProvider Wrapper (layout.tsx)
```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${syne.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` is required on `<html>` when `next-themes` sets the class attribute — without it, React will warn about server/client mismatch. [CITED: next-themes docs]

### Pattern 3: globals.css Token Override After shadcn Init
shadcn init will add its own CSS variable declarations to `globals.css`. The executor must override them with GDS values:

```css
/* globals.css — GDS token overrides (placed AFTER shadcn's @layer base block) */
:root {
  /* Tailwind uses hsl() format — provide the hsl values without the hsl() wrapper */
  --background:       14 15 17;        /* #0e0f11 */
  --foreground:       244 244 245;     /* #f4f4f5 */
  --card:             20 21 23;        /* #141517 */
  --card-foreground:  244 244 245;
  --muted:            26 27 30;        /* #1a1b1e */
  --muted-foreground: 113 113 122;     /* #71717a */
  --border:           39 39 42;        /* #27272a */
  --accent:           200 245 66;      /* #c8f542 */
  --accent-foreground: 14 15 17;
  --destructive:      239 68 68;       /* #ef4444 */
  
  /* Store colors (not shadcn vars — custom GDS vars) */
  --jebai:  147 51 234;   /* #9333ea */
  --paje1:  6 182 212;    /* #06b6d4 */
  --paje2:  249 115 22;   /* #f97316 */
}

.dark {
  /* same values as :root — dark is default */
}

.light {
  --background:       248 249 250;    /* #f8f9fa */
  --foreground:       14 15 17;
  --card:             255 255 255;
  --muted:            241 245 249;    /* #f1f5f9 */
  --muted-foreground: 100 116 139;    /* #64748b */
  --border:           226 232 240;    /* #e2e8f0 */
  --accent:           22 163 74;      /* #16a34a */
  --accent-foreground: 255 255 255;
}
```

**HSL vs raw values:** shadcn's default CSS vars use raw space-separated channel values (not the `hsl()` wrapper) because Tailwind uses them as `hsl(var(--background))`. The GDS hex values must be converted to HSL channels for Tailwind utility classes to work. However, the GDS custom vars (`--jebai`, `--paje1`, `--paje2`) are used directly with `background: rgb(var(--jebai) / 0.15)` syntax, not via Tailwind, so they can remain as raw RGB triplets. [CITED: ui.shadcn.com/docs/theming]

### Anti-Patterns to Avoid
- **Importing shadcn component before init:** Components don't exist until `npx shadcn@latest add` is run. Imports will cause build failure.
- **Applying `next-themes` ThemeProvider after font classNames:** The font variable classNames must be on `<html>`, and ThemeProvider must wrap `<body>` content, not `<html>`.
- **Replacing existing lib/utils.ts entirely:** shadcn init updates this file — verify the merge doesn't remove `fmtCurrency`, `metaLevel`, etc.
- **Using `background: hsl(var(--accent))` for store colors:** Store colors (`--jebai`, `--paje1`, `--paje2`) are not shadcn vars — don't use the `hsl()` wrapper with them.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile navigation drawer | Custom fixed-position overlay | shadcn `Sheet` side="left" | Handles focus trap, keyboard nav, scroll lock, backdrop |
| Dark/light toggle | `localStorage` + manual class toggling | `next-themes` ThemeProvider | Handles SSR hydration, system preference, flash-of-unstyled-content |
| Accessible dropdown menu | Custom positioned menu | shadcn `DropdownMenu` | Radix handles ARIA, keyboard navigation, focus management |
| Tooltip on collapsed nav items | CSS `title` attribute | shadcn `Tooltip` | Accessible, styled, controllable delay |
| Font loading | `<link>` CDN | `next/font/google` with `variable` | Self-hosted, no layout shift, no Google requests at runtime |
| Component class merging | String concatenation | `cn()` from shadcn utils (tailwind-merge + clsx) | Handles conflicting Tailwind class deduplication |

---

## Common Pitfalls

### Pitfall 1: shadcn Init Overwrites globals.css Tokens
**What goes wrong:** `npx shadcn@latest init` inserts its own `:root { --background: ... }` block. If GDS token values are written before init, they get overwritten. If written after but inside the same `:root` block, shadcn's values win due to cascade order.
**Why it happens:** shadcn init is not idempotent — it modifies `globals.css` to add its variable block.
**How to avoid:** Run shadcn init first, then override the variables by adding a second `:root` block (or editing the existing one) with GDS values.
**Warning signs:** Background color shows as slate-950 (#020617) instead of #0e0f11 after init.

### Pitfall 2: lib/utils.ts Collision
**What goes wrong:** shadcn init expects to write the `cn()` helper to `src/lib/utils.ts`. The file already exists with project utility functions. If shadcn replaces the file, `fmtCurrency`, `metaLevel`, and other exports are lost, breaking dashboard imports.
**Why it happens:** shadcn's init writes a minimal utils.ts if it detects the path doesn't contain `cn`.
**How to avoid:** After running init, immediately check `src/lib/utils.ts` — if `cn` was added and existing functions remain, all good. If the file was replaced, restore the original exports from git or add them back manually.
**Warning signs:** `npm run build` shows "Module '"@/lib/utils"' has no exported member 'fmtCurrency'".

### Pitfall 3: Sidebar Layout with Fixed Positioning and Content Margin
**What goes wrong:** Fixed sidebar (position: fixed) doesn't push content — content renders behind the sidebar.
**Why it happens:** Fixed elements are removed from document flow. Content area needs explicit `margin-left` matching sidebar width.
**How to avoid:** The content wrapper must have dynamic `margin-left` that responds to collapsed/expanded state. This must be passed from the same hook that controls sidebar state.
**Warning signs:** Page content is hidden under the sidebar on desktop.

### Pitfall 4: next-themes Hydration Mismatch Without suppressHydrationWarning
**What goes wrong:** React warns about attribute mismatch between server render (no class) and client render (class="dark") on `<html>`.
**Why it happens:** The server doesn't know the theme preference stored in localStorage/cookies.
**How to avoid:** Add `suppressHydrationWarning` to the `<html>` element.
**Warning signs:** Console warning: "Warning: Prop `className` did not match. Server: '' Client: 'dark'".

### Pitfall 5: HSL Value Format for Tailwind + shadcn CSS Vars
**What goes wrong:** Tailwind utility classes like `bg-background` render as white or black instead of the GDS dark color.
**Why it happens:** shadcn uses CSS vars as raw HSL channels (e.g., `0 0 0`) which Tailwind wraps in `hsl()`. If GDS tokens are written as hex (`#0e0f11`) or as `hsl(...)`, Tailwind's `hsl(var(--background))` produces invalid CSS.
**How to avoid:** Convert all hex GDS colors to space-separated HSL channel values for the CSS vars used by Tailwind. Keep `--jebai`, `--paje1`, `--paje2` as RGB triplets for use with `rgb(var(--jebai) / opacity)`.
**Warning signs:** Colored elements appear wrong or white. Checking DevTools shows `background: hsl(#0e0f11)` (invalid).

### Pitfall 6: npm install Missing Before Any CLI Commands
**What goes wrong:** `npx shadcn@latest init` runs but fails because Next.js binary isn't found, or `npm run build` fails with module not found.
**Why it happens:** `node_modules/` does not exist in the repository currently.
**How to avoid:** `npm install` must be the absolute first step before any other command.
**Warning signs:** `npx shadcn@latest init` errors with "Cannot find module 'next'".

---

## Recommended Order of Operations (FOUND-01 through FOUND-07)

```
Step 0: npm install
         → Restores all project dependencies

Step 1: FOUND-01 — Schema extraction
         → npx supabase login (if needed)
         → npx supabase db dump --project-ref zsczxblhtdhpdqvkpuwz --schema public \
              > supabase/migrations/0001_schema_inicial.sql
         → Review output, confirm tables match known schema

Step 2: FOUND-02 — Verify dead routes (no deletion needed)
         → Confirm /mapeamento and /dashboard/metas directories do not exist
         → Check for any import references to non-existent routes in existing files
         → Run npm run build (baseline — capture any pre-existing TS errors)

Step 3: FOUND-03 — shadcn/ui init + components
         → npx shadcn@latest init (answer prompts per Task 2 findings)
         → Verify src/lib/utils.ts — restore original exports if overwritten
         → Override globals.css CSS vars with GDS theme tokens (see Pattern 3)
         → Update tailwind.config.js color tokens (remove bg/surface/surface2/jebai:#7b61ff/mkt/caixa)
         → npx shadcn@latest add [batch 1]
         → npx shadcn@latest add [batch 2]
         → npx shadcn@latest add [batch 3]

Step 4: FOUND-04 — Font migration
         → Update src/app/layout.tsx (import Syne, DM_Mono; add variable option; apply classNames)
         → Remove <link> CDN tag and <head> block
         → Update globals.css body rule to use var(--font-syne)
         → Update tailwind.config.js fontFamily to use var(--font-syne) / var(--font-dm-mono)
         → npm install next-themes
         → Add ThemeProvider to layout.tsx

Step 5: FOUND-05 — Create 7 base components
         → src/components/ui/stat-card.tsx
         → src/components/ui/data-table.tsx
         → src/components/ui/period-selector.tsx
         → src/components/ui/loja-badge.tsx
         → src/components/ui/progress-ring.tsx
         → src/components/ui/empty-state.tsx
         → src/components/ui/page-header.tsx
         → Update src/components/ui/index.tsx barrel to export new components

Step 6: FOUND-06 — v2 layout
         → Create src/hooks/use-sidebar.ts
         → Create src/components/shared/sidebar.tsx
         → Create src/components/shared/topbar.tsx
         → Add src/app/dashboard/layout.tsx (or restructure to route group)
         → Wire sidebar + topbar into dashboard layout with auth guard

Step 7: FOUND-07 — Build + lint verification
         → npm run build
         → npm run lint
         → Fix any errors before declaring phase complete
```

---

## Existing Component Preservation Strategy

The following components have **live business logic** and must not be broken during Phase 1:

| Component | Business Logic | Phase 1 treatment |
|-----------|---------------|-------------------|
| `UploadModal` | CEC HTML parsing + Supabase batch insert | Keep as-is; wrap in shadcn Dialog in Phase 3 |
| `ClientsTab` | Client portfolio data display | Keep as-is; may adopt data-table in Phase 1 if scope allows |
| `UsersClient` | User CRUD via admin API routes | Keep as-is; visual update in Phase 2 |
| `lib/parser.ts` | `parseSalesHtml`, `toIsoDate` | Keep unchanged |
| `middleware.ts` | Auth + role guard | Keep unchanged |
| All API routes | Admin operations | Keep unchanged |

**CSS variable rename risk:** The UI-SPEC mandates renaming `--bg` → `--background`, `--text` → `--foreground`, etc. The existing components reference the OLD variable names (`var(--bg)`, `var(--text)`, `var(--surface)`, `var(--muted)`). The safest Phase 1 approach: keep the old variable names as aliases in `globals.css` pointing to the new shadcn-compatible values. This avoids touching every existing component.

```css
/* globals.css — backward compatibility aliases */
:root {
  /* New shadcn-compatible names (primary) */
  --background: ...;
  --foreground: ...;
  /* Aliases for existing inline-style components */
  --bg:       var(--background);
  --text:     var(--foreground);
  --surface:  var(--card);
  --surface2: var(--muted);
}
```

This is safer than a mass find-and-replace. Old components continue working; new components use the new token names.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All npm/npx commands | Yes | v24.11.0 | — |
| npm | Package installation | Yes | 11.6.1 | — |
| node_modules | Build + run | No | — | Run `npm install` |
| supabase CLI (npx) | FOUND-01 schema dump | Yes (via npx) | 2.100.1 | Manual SQL via Studio |
| Supabase auth token | supabase db dump | Unknown | — | `npx supabase login` |

**Missing dependencies with no fallback:**
- `node_modules` — executor must run `npm install` as step zero.

**Missing dependencies with fallback:**
- Supabase auth token — if `SUPABASE_ACCESS_TOKEN` is not set, run `npx supabase login` first, or use Supabase Studio SQL Editor to manually export schema.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | shadcn init appends `cn()` to existing `src/lib/utils.ts` rather than replacing it | Task 2, Pitfall 2 | Existing utility functions lost; build breaks with missing exports |
| A2 | `STORE_COLORS` duplicate export between `types/index.ts` and `lib/utils.ts` causes no compile error | Task 6 | Possible "duplicate identifier" TS error if both are re-exported via a barrel |
| A3 | All existing API routes under `src/app/api/admin/` compile without errors | Task 6 | Pre-existing build failures that executor must fix before Phase 1 can be declared done |
| A4 | Syne and DM Mono are available in Google Fonts with the weight combinations needed | Task 3 | next/font will error at build time if a weight is not available (e.g., `weight: '600'` if Google only has 400/700/800 for Syne) |

**Note on A4:** Syne is a variable font available on Google Fonts with weights 400–800. DM Mono is not a variable font; weights 400 and 500 are confirmed available. The `weight` array in the import must match exactly what Google provides.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] — shadcn 4.7.0, next-themes 0.4.6, @radix-ui/react-dialog 1.1.15, class-variance-authority 0.7.1, tailwind-merge 3.6.0
- [VERIFIED: npm view @radix-ui/react-dialog peerDependencies] — React 19 supported
- [CITED: nextjs.org/docs/app/api-reference/components/font] — next/font `variable` option pattern
- [VERIFIED: filesystem glob] — exact file list under src/app/

### Secondary (MEDIUM confidence)
- [CITED: ui.shadcn.com/docs/react-19] — React 19 peer dep handling, `--legacy-peer-deps` flag
- [CITED: ui.shadcn.com/docs/theming] — CSS variable format for Tailwind compatibility

### Tertiary (LOW confidence)
- [ASSUMED] — shadcn init behavior regarding existing lib/utils.ts (not verified by running init)

---

## Metadata

**Confidence breakdown:**
- Dead routes (FOUND-02): HIGH — filesystem verified, no directories exist
- shadcn init command: HIGH — CLI version verified, React 19 peer support verified
- Font migration pattern: HIGH — official Next.js docs cited
- Supabase schema extraction: MEDIUM — CLI available via npx, but auth token not verified
- Existing component assessment: HIGH — source code read directly
- TypeScript error baseline: LOW — node_modules absent, cannot run tsc

**Research date:** 2026-05-19
**Valid until:** 2026-06-18 (30 days — stable libraries)
