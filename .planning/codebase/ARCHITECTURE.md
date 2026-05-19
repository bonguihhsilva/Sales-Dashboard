# Architecture

**Analysis Date:** 2026-05-19

## Pattern Overview

**Overall:** Next.js 15 App Router with role-based routing and server-first data fetching

**Key Characteristics:**
- Server Components fetch data directly from Supabase (no API layer for reads)
- Two separate Supabase clients: browser (`createBrowserClient`) and server (`createServerClient`) — never mix
- Role-based access enforced in three places: middleware, page-level redirects, and API route guards
- Client Components (`'use client'`) used only for interactivity (forms, modals, charts, dropdowns)
- No global state manager — state is URL-driven (searchParams) for filters and tabs

## Layers

**Middleware (Edge):**
- Purpose: Session refresh, authentication check, role-based route redirect
- Location: `C:/Projetos/da-silva-dashboard/src/middleware.ts`
- Contains: Auth guard, role guard (`adm` vs `vendedor`), cookie handling
- Depends on: `@supabase/ssr` createServerClient, Next.js cookies API
- Used by: All non-static requests matching the middleware matcher

**Page Layer (Server Components):**
- Purpose: Fetch data from Supabase, verify auth/role, render UI
- Location: `C:/Projetos/da-silva-dashboard/src/app/**/page.tsx`
- Contains: Data queries, business logic computations, layout markup
- Depends on: `C:/Projetos/da-silva-dashboard/src/lib/supabase/server.ts`, `C:/Projetos/da-silva-dashboard/src/lib/utils.ts`, `C:/Projetos/da-silva-dashboard/src/types/index.ts`
- Used by: Next.js router

**Client Component Layer:**
- Purpose: Interactive UI elements requiring browser state or user events
- Location: `C:/Projetos/da-silva-dashboard/src/app/dashboard/*.tsx` (UploadModal, PeriodSelector), `C:/Projetos/da-silva-dashboard/src/app/dashboard/usuarios/UsersClient.tsx`, `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/EvolutionChart.tsx`, `C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx` (LogoutButton)
- Contains: React state, event handlers, browser-side Supabase client calls
- Depends on: `C:/Projetos/da-silva-dashboard/src/lib/supabase/client.ts`
- Used by: Server Components that embed them

**API Routes:**
- Purpose: Admin operations requiring `SUPABASE_SERVICE_ROLE_KEY` (user creation, etc.)
- Location: `C:/Projetos/da-silva-dashboard/src/app/api/admin/`
- Contains: Auth verification, service-role Supabase client, mutations
- Depends on: `@supabase/supabase-js` (direct), `C:/Projetos/da-silva-dashboard/src/lib/supabase/server.ts` for caller auth check
- Used by: Client Components (via `fetch`)

**Shared Library:**
- Purpose: Supabase client factories, formatting utilities, data parser
- Location: `C:/Projetos/da-silva-dashboard/src/lib/`
- Contains: `supabase/server.ts`, `supabase/client.ts`, `utils.ts`, `parser.ts`
- Depends on: Nothing internal
- Used by: All layers above

**Types:**
- Purpose: Shared TypeScript interfaces and constants
- Location: `C:/Projetos/da-silva-dashboard/src/types/index.ts`
- Contains: `Profile`, `Period`, `Goal`, `VendorSummary`, `ClientPortfolio`, `VendorEvolution`, `STORE_COLORS`, `STORE_LABELS`
- Used by: All layers

## Data Flow

**Admin Dashboard View:**

1. Request hits middleware at `C:/Projetos/da-silva-dashboard/src/middleware.ts` — session refreshed, role checked
2. `C:/Projetos/da-silva-dashboard/src/app/dashboard/page.tsx` (Server Component) creates server Supabase client
3. Queries `periods`, `vendor_summary` views filtered by `period_id` searchParam
4. Passes data as props to Client Components (`PeriodSelector`, `UploadModal`) and Server Components (`ClientsTab`)
5. Response rendered server-side; interactive components hydrate client-side

**Vendor Self-View:**

1. Middleware redirects `adm` away from `/meu-resultado`, `vendedor` away from `/dashboard`
2. `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx` fetches `vendor_summary` filtered to `profile.vendor_id`
3. Calls Supabase RPC `vendor_evolution` for historical chart data
4. Renders performance tab, delegates client portfolio to shared `ClientsTab` Server Component

**Sales Data Import:**

1. Admin clicks Upload in `C:/Projetos/da-silva-dashboard/src/app/dashboard/UploadModal.tsx` (Client Component)
2. HTML file parsed client-side by `C:/Projetos/da-silva-dashboard/src/lib/parser.ts` — `parseSalesHtml()` returns `SaleTransaction[]`
3. Existing `sales_records` deleted for the period
4. Rows enriched with vendor name/store from `goals` table
5. Batch-inserted into `sales_records` in chunks of 500 via browser Supabase client

**User Creation:**

1. `C:/Projetos/da-silva-dashboard/src/app/dashboard/usuarios/UsersClient.tsx` calls `POST /api/admin/create-user`
2. `C:/Projetos/da-silva-dashboard/src/app/api/admin/create-user/route.ts` verifies caller is `adm`
3. Uses `SUPABASE_SERVICE_ROLE_KEY` to create auth user and update profile

**State Management:**
- URL searchParams drive active period, store filter, and tab selection (no React state for these)
- Component-local `useState` used only for modal open/close, form fields, loading states

## Key Abstractions

**`vendor_summary` (Supabase view/materialized view):**
- Purpose: Pre-aggregated per-vendor per-period metrics (total_sold, meta levels, bonuses, commission)
- Queried by: `C:/Projetos/da-silva-dashboard/src/app/dashboard/page.tsx`, `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx`, `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx`

**`client_portfolio` (Supabase view):**
- Purpose: Per-client per-vendor per-period aggregates (spend, recency, frequency)
- Queried by: `C:/Projetos/da-silva-dashboard/src/app/dashboard/ClientsTab.tsx`

**`vendor_evolution` (Supabase RPC):**
- Purpose: Historical cross-period data for a single vendor
- Called with: `supabase.rpc('vendor_evolution', { p_vendor_id })`
- Used by: `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx`, `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx`

**`ClientsTab` (shared Server Component):**
- Purpose: Renders client portfolio table — used in admin dashboard, vendor detail page, and vendor self-view
- Location: `C:/Projetos/da-silva-dashboard/src/app/dashboard/ClientsTab.tsx`
- Props: `periodId: number`, `vendorId: string | null` (null = all vendors)

**Role System:**
- Two roles: `adm` and `vendedor` (stored in `profiles.role`)
- `adm` → `/dashboard`, `/dashboard/usuarios`, `/dashboard/vendedor/[id]`
- `vendedor` → `/meu-resultado` (sees only their own data, scoped by `profiles.vendor_id`)

## Entry Points

**Root Redirect:**
- Location: `C:/Projetos/da-silva-dashboard/src/app/page.tsx`
- Triggers: Any visit to `/`
- Responsibilities: Checks auth and role, redirects to `/dashboard` (adm) or `/meu-resultado` (vendedor)

**Login Page:**
- Location: `C:/Projetos/da-silva-dashboard/src/app/login/page.tsx`
- Triggers: Unauthenticated access (middleware redirect)
- Responsibilities: `signInWithPassword` via browser client, redirects to `/` on success

**Admin Dashboard:**
- Location: `C:/Projetos/da-silva-dashboard/src/app/dashboard/page.tsx`
- Triggers: Authenticated `adm` visiting `/dashboard`
- Responsibilities: Period/store filtering, vendor ranking table, KPI cards, upload trigger

**Vendor Self-View:**
- Location: `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx`
- Triggers: Authenticated `vendedor` visiting `/meu-resultado`
- Responsibilities: Individual performance, client portfolio, historical evolution

## Error Handling

**Strategy:** Inline checks with early returns and Next.js `redirect()`

**Patterns:**
- Auth failure → `redirect('/login')` at page level (belt-and-suspenders after middleware)
- Role mismatch → `redirect()` to the correct route for that role
- Missing vendor profile → inline empty state render (no redirect)
- Missing summary data → inline empty state render or `redirect('/dashboard')`
- API routes → `NextResponse.json({ error: ... }, { status: 4xx })`
- UploadModal → caught errors displayed inline in modal status area
- No global error boundary

## Cross-Cutting Concerns

**Logging:** `console` only — no structured logging framework
**Validation:** Minimal — API routes check required fields; no schema validation library (no Zod)
**Authentication:** Supabase Auth with cookie-based sessions; middleware handles session refresh on every request
**Styling:** Inline `style={{}}` throughout — no Tailwind classes in page/component logic, CSS custom properties (`var(--bg)`, `var(--accent)`, etc.) defined in `globals.css`

---

*Architecture analysis: 2026-05-19*
