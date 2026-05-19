# Codebase Structure

**Analysis Date:** 2026-05-19

## Directory Layout

```
C:/Projetos/da-silva-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, metadata)
│   │   ├── page.tsx                      # Root redirect (/ → dashboard or meu-resultado)
│   │   ├── globals.css                   # CSS custom properties (theme tokens)
│   │   ├── login/
│   │   │   └── page.tsx                  # Login form (Client Component)
│   │   ├── dashboard/                    # ADM-only area
│   │   │   ├── page.tsx                  # Main dashboard: ranking, KPIs, store tabs
│   │   │   ├── ClientsTab.tsx            # Shared Server Component: client portfolio table
│   │   │   ├── PeriodSelector.tsx        # Client Component: period dropdown
│   │   │   ├── UploadModal.tsx           # Client Component: HTML import modal
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx              # User management (Server Component shell)
│   │   │   │   └── UsersClient.tsx       # Client Component: user table + create modal
│   │   │   └── vendedor/
│   │   │       └── [vendor_id]/
│   │   │           ├── page.tsx          # Vendor detail page (ADM view)
│   │   │           └── EvolutionChart.tsx # Client Component: Recharts bar chart
│   │   ├── meu-resultado/
│   │   │   └── page.tsx                  # Vendor self-view: performance, carteira, evolução
│   │   └── api/
│   │       └── admin/
│   │           └── create-user/
│   │               └── route.ts          # POST: create Supabase auth user (service role)
│   ├── components/
│   │   └── ui/
│   │       └── index.tsx                 # Shared UI: KpiCard, StorePill, ProgressBar, BonusBadge, SectionTitle, LogoutButton
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                 # createClient() — server-side with cookies()
│   │   │   └── client.ts                 # createClient() — browser-side
│   │   ├── utils.ts                      # fmtCurrency, fmtK, metaLevel, bonusAmount, recencyColor, STORE_COLORS
│   │   └── parser.ts                     # parseSalesHtml(), toIsoDate() — HTML report parser
│   ├── types/
│   │   └── index.ts                      # Profile, Period, Goal, VendorSummary, ClientPortfolio, VendorEvolution
│   └── middleware.ts                     # Auth + role routing guard
├── supabase/
│   └── migrations/                       # SQL migration files
├── scripts/                              # Utility scripts (not part of app)
├── docs/                                 # Planning docs
├── next.config.js
├── tailwind.config.js                    # Tailwind config (utility classes available but rarely used)
├── tsconfig.json                         # Path alias: @/ → src/
├── vercel.json                           # Vercel deployment config
└── package.json
```

## Directory Purposes

**`src/app/`:**
- Purpose: All Next.js App Router pages, layouts, and API routes
- Contains: Page files, co-located Client Components, API route handlers
- Key files: `layout.tsx` (global), `middleware.ts` (one level up at `src/`)

**`src/app/dashboard/`:**
- Purpose: ADM-only section — main sales dashboard and sub-pages
- Contains: Server Component pages, Client Components co-located next to the page that uses them
- Key files: `page.tsx`, `ClientsTab.tsx`, `UploadModal.tsx`, `PeriodSelector.tsx`

**`src/app/dashboard/vendedor/[vendor_id]/`:**
- Purpose: Dynamic route for per-vendor drill-down (ADM access only)
- Key files: `page.tsx` (data + layout), `EvolutionChart.tsx` (Recharts chart, Client Component)

**`src/app/meu-resultado/`:**
- Purpose: Vendor self-service view — each vendedor sees only their own data
- Key files: `page.tsx` (full page, Server Component)

**`src/app/api/admin/`:**
- Purpose: Protected API routes requiring `SUPABASE_SERVICE_ROLE_KEY`
- Contains: Route handlers that verify ADM role before using service-role client
- Key files: `create-user/route.ts`

**`src/components/ui/`:**
- Purpose: Shared presentational components used across multiple pages
- Contains: `index.tsx` barrel file with all shared components
- Note: All components in this file are Client Components (`'use client'`)

**`src/lib/`:**
- Purpose: Pure utility functions and Supabase client factories
- Key rule: `supabase/server.ts` → only in Server Components and API routes; `supabase/client.ts` → only in Client Components

**`src/types/`:**
- Purpose: Single source of truth for TypeScript types and shared constants
- Key file: `index.ts` — import types from `@/types` throughout the codebase

**`supabase/migrations/`:**
- Purpose: Database schema migrations
- Generated: No (hand-written or Supabase CLI generated)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `C:/Projetos/da-silva-dashboard/src/app/page.tsx`: Root route — redirects based on role
- `C:/Projetos/da-silva-dashboard/src/app/login/page.tsx`: Authentication
- `C:/Projetos/da-silva-dashboard/src/middleware.ts`: Runs before every page request

**Configuration:**
- `C:/Projetos/da-silva-dashboard/next.config.js`: Next.js config
- `C:/Projetos/da-silva-dashboard/tsconfig.json`: TypeScript, path alias `@/` → `./src/`
- `C:/Projetos/da-silva-dashboard/vercel.json`: Vercel deployment
- `C:/Projetos/da-silva-dashboard/tailwind.config.js`: Tailwind (available but minimal use)

**Core Logic:**
- `C:/Projetos/da-silva-dashboard/src/lib/utils.ts`: All formatting functions and store constants
- `C:/Projetos/da-silva-dashboard/src/lib/parser.ts`: Sales HTML parser
- `C:/Projetos/da-silva-dashboard/src/types/index.ts`: All types and constants

**Shared UI Components:**
- `C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx`: KpiCard, StorePill, ProgressBar, BonusBadge, SectionTitle, LogoutButton

**Supabase Clients:**
- `C:/Projetos/da-silva-dashboard/src/lib/supabase/server.ts`: Server-side (pages, API routes)
- `C:/Projetos/da-silva-dashboard/src/lib/supabase/client.ts`: Browser-side (Client Components)

## Naming Conventions

**Files:**
- Page files: always `page.tsx` (Next.js convention)
- API routes: always `route.ts` (Next.js convention)
- Client Components co-located with their page: `PascalCase.tsx` (e.g., `UploadModal.tsx`, `ClientsTab.tsx`)
- Client Components in `components/ui/`: single barrel `index.tsx`
- Utility files: `camelCase.ts` (e.g., `utils.ts`, `parser.ts`)

**Directories:**
- Route segments: `kebab-case` (e.g., `meu-resultado`, `create-user`)
- Dynamic segments: `[param_name]` with `snake_case` inside brackets (e.g., `[vendor_id]`)

**Exports:**
- Pages: default export only
- Shared components: named exports from barrel (`export function KpiCard`, etc.)
- Utilities: named exports (`export function fmtCurrency`)
- Types: named `export interface` / `export type`

**Variables and Functions:**
- Functions: `camelCase` (e.g., `parseSalesHtml`, `fmtCurrency`, `metaLevel`)
- Constants: `SCREAMING_SNAKE_CASE` for maps (e.g., `STORE_COLORS`, `STORE_LABELS`)
- React components: `PascalCase`

## Where to Add New Code

**New admin page:**
- Create `C:/Projetos/da-silva-dashboard/src/app/dashboard/<name>/page.tsx`
- Add auth check at top: `if (!user) redirect('/login')` then role check
- Add link in `C:/Projetos/da-silva-dashboard/src/app/dashboard/page.tsx` header

**New vendor page:**
- Create `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/<name>/page.tsx`
- Scope all queries with `profile.vendor_id`

**New API route (admin-only):**
- Create `C:/Projetos/da-silva-dashboard/src/app/api/admin/<action>/route.ts`
- Pattern: verify caller is `adm` with server client first, then use service-role client for mutations

**New shared UI component:**
- Add to `C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx` as a named export
- Mark file stays as `'use client'` (all components there are client-side)

**New page-specific Client Component:**
- Co-locate it next to its `page.tsx`: `C:/Projetos/da-silva-dashboard/src/app/dashboard/<MyWidget>.tsx`
- Add `'use client'` directive at top

**New type:**
- Add to `C:/Projetos/da-silva-dashboard/src/types/index.ts`

**New utility function:**
- Add to `C:/Projetos/da-silva-dashboard/src/lib/utils.ts`
- If it's data parsing logic: add to `C:/Projetos/da-silva-dashboard/src/lib/parser.ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD planning documents, phase plans
- Generated: No
- Committed: Yes

**`supabase/migrations/`:**
- Purpose: SQL schema migrations applied via Supabase CLI
- Generated: Partially (CLI scaffolds, hand-edited)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build cache and output
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-05-19*
