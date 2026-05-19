# External Integrations

**Analysis Date:** 2026-05-19

## APIs & External Services

**None beyond Supabase.** No third-party REST APIs, payment processors, email services, or webhook providers detected.

## Data Storage

**Database:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (env var)
  - Tables identified: `profiles`, `vendors` (inferred from middleware and API routes)
  - ORM/Client: `@supabase/ssr` + `@supabase/supabase-js` — no additional ORM layer
  - Migrations directory: `C:/Projetos/da-silva-dashboard/supabase/migrations/` (empty — schema managed via Supabase dashboard or manually)

**File Storage:**
- Not detected — uploaded HTML files are parsed client-side in memory via `C:/Projetos/da-silva-dashboard/src/lib/parser.ts` and inserted as rows into Supabase. No blob/file storage used.

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (email + password)
  - Browser client: `C:/Projetos/da-silva-dashboard/src/lib/supabase/client.ts` — `createBrowserClient()` with anon key
  - Server client: `C:/Projetos/da-silva-dashboard/src/lib/supabase/server.ts` — `createServerClient()` with cookie store
  - Admin client: instantiated inline in API routes using `createClient()` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` (never exposed to browser)
  - Session renewal: handled in `C:/Projetos/da-silva-dashboard/src/middleware.ts` on every non-static request

**Role-Based Access Control:**
- Roles stored in `profiles.role` column in Supabase (`adm`, `vendedor`)
- Enforcement split between:
  - Middleware route guards: `C:/Projetos/da-silva-dashboard/src/middleware.ts` — redirects based on role
  - API route guards: each admin route re-verifies caller role server-side (e.g., `C:/Projetos/da-silva-dashboard/src/app/api/admin/create-user/route.ts`)
- RLS (Row Level Security) assumed active on Supabase side — not visible in this codebase

**Admin Operations (service role key required):**
- Create user: `POST /api/admin/create-user` — uses `admin.auth.admin.createUser()`
- Update goals: `POST /api/admin/update-goals`
- Create period: `POST /api/admin/create-period`
- Ensure period: `POST /api/admin/ensure-period`
- Setup trigger: `POST /api/admin/setup-trigger`
- Update user: `POST /api/admin/update-user`

**Vendor Operations:**
- Change password: `POST /api/vendor/change-password`

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- No structured logging — errors surfaced via `NextResponse.json({ error: ... })` responses only

## CI/CD & Deployment

**Hosting:**
- Vercel — config at `C:/Projetos/da-silva-dashboard/vercel.json`
- Framework: `nextjs`, build: `npm run build`, output: `.next`

**CI Pipeline:**
- None detected (no GitHub Actions, no `.github/` directory)

## Environment Configuration

**Required environment variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL, exposed to browser
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public JWT, exposed to browser
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role JWT, server-only (used only in `/api/admin/*` routes)

**Secrets location:**
- `.env.local` (local development, not committed)
- Vercel environment variables (production)
- Template reference: `C:/Projetos/da-silva-dashboard/.env.example`

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Data Import

**HTML Sales Parser:**
- File: `C:/Projetos/da-silva-dashboard/src/lib/parser.ts`
- Mechanism: User uploads an HTML report file; it is parsed client-side via regex into `SaleTransaction[]` structs, then rows are inserted into Supabase
- No external parsing service — runs entirely in-browser and in Node (dual-environment compatible)
- Entry point in UI: `UploadModal` component

---

*Integration audit: 2026-05-19*
