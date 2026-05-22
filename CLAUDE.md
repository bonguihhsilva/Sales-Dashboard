# GDS Frame Dashboard (da-silva-dashboard)

Dashboard interno para gestão comercial: clientes, vendedores, períodos e uploads.

## Stack

- **Framework**: Next.js 15.2.4 (App Router), React 19, TypeScript
- **Auth/DB**: Supabase (`@supabase/ssr`)
- **Charts**: Recharts
- **UI**: Tailwind CSS + Lucide React + clsx
- **Deploy**: Vercel (vercel.json na raiz)

## Comandos

```bash
npm run dev      # localhost:3000
npm run build
npm run lint
```

## Estrutura

```
src/
  app/
    page.tsx              # root redirect
    login/                # autenticação Supabase
    dashboard/            # área protegida
      page.tsx            # dashboard principal (ClientsTab, PeriodSelector, UploadModal)
      usuarios/           # gestão de usuários
      vendedor/           # view por vendedor
      admin/              # painel admin
    api/
      admin/              # rotas protegidas (server-side)
      parser.ts           # parser de dados importados
  lib/
    supabase/
      client.ts           # createBrowserClient()
      server.ts           # createServerClient() com cookies
    utils.ts
  middleware.ts           # Supabase SSR — renova sessão em todas as rotas
  components/             # ClientsTab.tsx, PeriodSelector.tsx, UploadModal.tsx
```

## Variáveis de Ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # server-only (admin routes)
```

## Gotchas

- **TypeScript strict**: middleware.ts usa type annotations explícitas nos cookies — manter ao editar
- **Roles**: distinção entre `usuarios/`, `vendedor/` e `admin/` — cada um tem acesso via RLS
- **UploadModal**: faz parse client-side via `src/app/api/parser.ts` antes de inserir no Supabase

## Segurança — Regras Obrigatórias

- **NUNCA commitar credenciais reais** — nenhum valor real de API key, token, senha ou URL de projeto deve aparecer em qualquer arquivo commitado (README, .env.example, código, comentários, docs). Usar sempre placeholders do tipo `<descrição>`.
- **README.md**: seção de variáveis de ambiente usa SOMENTE placeholders — ex: `<anon key — Supabase → Settings → API>`. Nunca valores reais.
- **Arquivos de ambiente**: `.env.local`, `.env.production`, `.env*.local` estão no `.gitignore` — NUNCA remover essas entradas.
- **Antes de qualquer commit**: verificar se o diff contém padrões como `eyJ`, `sb_publishable_`, `service_role`, `ghp_`, `sk_`, `re_` — se sim, PARAR e revisar.
- **Histórico git**: se credencial vazar em commit, usar `git filter-repo --replace-text` ANTES de configurar remote ou fazer push.
- **Rotação obrigatória**: qualquer chave exposta publicamente (mesmo que anon) deve ser rotacionada no painel da plataforma imediatamente.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**GDS Frame Dashboard v2 + LMS**

Sistema integrado de gestão comercial e treinamento para as 3 lojas da família Da Silva em Ciudad del Este (Jebai, Pajé 1, Pajé 2). Inclui dois produtos: **GDS Dashboard v2** (ranking de vendedores, importação CEC, motor de comissão configurável, widgets) e **LMS** (trilhas de treinamento, quiz, gamificação XP/badges). Arquitetura multi-tenant desde o início para futura oferta como SaaS para outras lojas de CDE.

**Core Value:** Gerentes enxergam performance real de cada vendedor e calculam comissões corretamente — e vendedores sabem exatamente o que precisam aprender para vender mais.

### Constraints

- **Stack:** Next.js 15.2.4, React 19, TypeScript strict, shadcn/ui, Supabase — não alterar sem aprovação explícita
- **Banco:** Supabase projeto `zsczxblhtdhpdqvkpuwz` — toda mudança via migration
- **Moeda:** USD por padrão, configurável por tenant (USD | BRL | PYG) — nunca hardcodar
- **RLS:** Ativo em todas as tabelas — nunca desabilitar
- **Multi-tenant:** Obrigatório desde Sprint 1 — arquitetura deve suportar SaaS futuro
- **Commits:** npm run build deve passar antes de qualquer commit de fase
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - All application code under `C:/Projetos/da-silva-dashboard/src/`
- TSConfig strict mode enabled (`strict: true` in `C:/Projetos/da-silva-dashboard/tsconfig.json`)
- JavaScript - Config files only (`next.config.js`, `tailwind.config.js`, `postcss.config.js`)
## Runtime
- Node.js (version not pinned — no `.nvmrc` or `.node-version` found)
- npm
- Lockfile: `C:/Projetos/da-silva-dashboard/package-lock.json` present
## Frameworks
- Next.js 15.2.4 - App Router, SSR, API Routes
- React 19.0.0 - UI rendering
- TypeScript 5.x - Type checking, path aliases (`@/*` → `./src/*`)
- Tailwind CSS 3.4.1 - Utility-first styling, config at `C:/Projetos/da-silva-dashboard/tailwind.config.js`
- PostCSS 8 with autoprefixer - CSS processing, config at `C:/Projetos/da-silva-dashboard/postcss.config.js`
- ESLint 9 + eslint-config-next 15.1.0 - Linting
- Not detected
## Key Dependencies
- `@supabase/ssr` ^0.5.2 - SSR-safe Supabase client (server/browser distinction mandatory)
- `@supabase/supabase-js` ^2.47.0 - Base Supabase SDK (used directly for admin client with service role key)
- `recharts` ^2.13.3 - Chart rendering for dashboard data visualization
- `lucide-react` ^0.468.0 - Icon library
- `clsx` ^2.1.1 - Conditional className utility
- `react-dom` ^19.0.0 - React DOM rendering
## Configuration
- Config: `C:/Projetos/da-silva-dashboard/tsconfig.json`
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017, module resolution: bundler
- Strict mode: enabled — maintain explicit type annotations, especially in `C:/Projetos/da-silva-dashboard/src/middleware.ts`
- Config: `C:/Projetos/da-silva-dashboard/next.config.js`
- `reactStrictMode: true`
- No custom headers, redirects, or image domains configured
- Config: `C:/Projetos/da-silva-dashboard/tailwind.config.js`
- Content glob: `./src/**/*.{js,ts,jsx,tsx,mdx}`
- Custom color palette: `bg`, `surface`, `surface2`, `accent`, `jebai`, `mkt`, `caixa`, `meta1`–`meta3`
- Custom fonts: `Syne` (sans), `DM Mono` (mono) — loaded externally (not via next/font package)
- Template: `C:/Projetos/da-silva-dashboard/.env.example`
- Local file: `.env.local` (not committed)
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Deploy config: `C:/Projetos/da-silva-dashboard/vercel.json`
- Build command: `npm run build`
- Output directory: `.next`
## Platform Requirements
- `npm run dev` → localhost:3000
- Requires `.env.local` with Supabase credentials
- Deployed to Vercel (configured via `C:/Projetos/da-silva-dashboard/vercel.json`)
- Framework preset: `nextjs`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Page components: `page.tsx` (Next.js App Router convention)
- Client components co-located with page: `PascalCase.tsx` (e.g., `ClientsTab.tsx`, `UploadModal.tsx`, `EvolutionChart.tsx`)
- Server-side page-adjacent components also PascalCase (e.g., `UsersClient.tsx`)
- Lib modules: `camelCase.ts` (e.g., `parser.ts`, `utils.ts`)
- Supabase clients: `client.ts` / `server.ts` inside `C:/Projetos/da-silva-dashboard/src/lib/supabase/`
- camelCase for all functions: `fmtCurrency`, `parseSalesHtml`, `toIsoDate`, `metaLevel`, `bonusAmount`, `recencyColor`
- React components: PascalCase named exports (`export function KpiCard`, `export function StorePill`)
- Default exports for page-level components (`export default function DashboardPage`)
- Handler functions prefixed with `handle`: `handleLogin`, `handleUpload`
- Async action functions in Client Components use plain async function declarations inside the component body
- camelCase throughout
- Short but meaningful aliases in data-heavy code: `lvl`, `m1`, `m2`, `m3`, `b`, `col`, `sv`, `st`
- Computed display values named with clear intent: `grandTotal`, `totalBonus`, `hitMeta`, `activePeriodLabel`
- PascalCase interfaces defined in `C:/Projetos/da-silva-dashboard/src/types/index.ts`
- Props interfaces defined inline above the component using the naming pattern `[Name]Props` (e.g., `KpiProps`, `ProgressBarProps`)
- Local-only interfaces defined at top of the file they're used in (e.g., `VendorOption` in `UsersClient.tsx`)
- Type aliases used for discriminated unions: `UserRole = 'adm' | 'vendedor'`, status state: `'idle' | 'parsing' | 'uploading' | 'done' | 'error'`
- `Record<string, string>` for lookup maps (e.g., `STORE_COLORS`, `STORE_LABELS`)
- SCREAMING_SNAKE_CASE for module-level lookup maps: `STORE_COLORS`, `STORE_LABELS`, `META_COLORS`
## Code Style
- No Prettier config detected — code is manually formatted
- Tailwind CSS is installed but **not used for component styles**: all styling is done via inline `style={{}}` objects with CSS custom properties (`var(--bg)`, `var(--surface)`, etc.)
- `globals.css` defines the full design token system via CSS custom properties on `:root`
- Tailwind directives (`@tailwind base/components/utilities`) are present in `globals.css` as baseline reset only
- ESLint via `eslint-config-next` (version 15.1.0) — no custom `.eslintrc` file detected
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- Non-null assertions (`!`) used on env vars: `process.env.NEXT_PUBLIC_SUPABASE_URL!`
- `strict: true` — all types must be explicit
- Explicit type annotations on cookie handler params in `middleware.ts` and `server.ts`:
- `type` keyword used for imports of interfaces: `import type { Period } from '@/types'`
- Non-null assertion with `!` preferred over optional chaining when value is guaranteed by context
## Import Organization
- `@/*` maps to `C:/Projetos/da-silva-dashboard/src/*` (configured in `tsconfig.json`)
- Used consistently for all cross-directory imports
- Relative paths only for same-directory or parent-directory imports (e.g., `'../../ClientsTab'`)
- `'use client'` placed as first line of file for Client Components
- Server Components (async pages that call `createClient()` from `server.ts`) have no directive
## Error Handling
- Return `NextResponse.json({ error: string }, { status: N })` for all error cases
- Auth checks always first: verify user → verify role → proceed
- Pattern: early return on each guard condition
- Auth failures use `redirect('/login')` or `redirect('/meu-resultado')` immediately
- No try/catch in server pages — errors surface to Next.js error boundary
- Missing data handled with early `return (JSX fallback)` pattern before main render
- `try/catch` wrapping all async operations
- Error messages stored in local state (e.g., `setError(...)`, `setMsg(...)`)
- Error typed as `unknown` with `instanceof Error` guard:
- `finally` used for resetting loading state:
- Destructuring pattern: `const { data: alias } = await supabase.from(...)`
- Errors from write operations checked inline: `if (error) throw error`
- `null` coalescing for query results: `(summaries ?? []).filter(...)`, `clients?.length`
## Styling Patterns
- `--bg`, `--surface`, `--surface2`, `--border`, `--text`, `--muted`, `--accent`
- `--meta1` (`#c8f542`), `--meta2` (`#42d9f5`), `--meta3` (`#f5a742`)
- Always reference tokens via `var()` in inline styles, never hardcode design colors except for Recharts (which requires hex literals)
- `'Syne'` — headings, buttons, primary text (loaded via Google Fonts in `layout.tsx`)
- `'DM Mono'` — data labels, monospace values, table headers, metadata text
- Font family specified inline per element, not globally assigned via class
- Section separator comments: `// ── Component Name ────`
- Inline interface defined immediately above each component
## Comments
- Inline comments explain non-obvious column mapping: `// Data rows: col[0] = numeric client code, col[18] = vendor id`
- Comments on intent for multi-step operations: `// Delete existing records for this period to avoid duplicates`
- Section markers in large files: `{/* Header */}`, `{/* Store tabs */}`, `{/* KPIs */}`
- No JSDoc — functions are typed via TypeScript signatures
## Function Design
- Destructured props at component definition: `({ periodId, vendorId }: { periodId: number; vendorId: string | null })`
- Server page props always typed as `Promise<{...}>` for Next.js 15 async params/searchParams
- Utilities return primitive types (`string`, `number`)
- Components return JSX or `null` (via early return pattern)
- API routes always return `NextResponse.json(...)`
## Module Design
- `C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx` — named exports for all UI primitives (barrel file)
- `C:/Projetos/da-silva-dashboard/src/types/index.ts` — all shared interfaces and domain constants exported
- `C:/Projetos/da-silva-dashboard/src/lib/utils.ts` — all utility functions exported individually
- Page components: default export only
- `src/components/ui/index.tsx` is the sole barrel — import all UI components from `@/components/ui`
- `src/types/index.ts` acts as type barrel — import types from `@/types`
- No barrel for `src/lib/` — import directly from `@/lib/utils`, `@/lib/supabase/client`, `@/lib/supabase/server`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server Components fetch data directly from Supabase (no API layer for reads)
- Two separate Supabase clients: browser (`createBrowserClient`) and server (`createServerClient`) — never mix
- Role-based access enforced in three places: middleware, page-level redirects, and API route guards
- Client Components (`'use client'`) used only for interactivity (forms, modals, charts, dropdowns)
- No global state manager — state is URL-driven (searchParams) for filters and tabs
## Layers
- Purpose: Session refresh, authentication check, role-based route redirect
- Location: `C:/Projetos/da-silva-dashboard/src/middleware.ts`
- Contains: Auth guard, role guard (`adm` vs `vendedor`), cookie handling
- Depends on: `@supabase/ssr` createServerClient, Next.js cookies API
- Used by: All non-static requests matching the middleware matcher
- Purpose: Fetch data from Supabase, verify auth/role, render UI
- Location: `C:/Projetos/da-silva-dashboard/src/app/**/page.tsx`
- Contains: Data queries, business logic computations, layout markup
- Depends on: `C:/Projetos/da-silva-dashboard/src/lib/supabase/server.ts`, `C:/Projetos/da-silva-dashboard/src/lib/utils.ts`, `C:/Projetos/da-silva-dashboard/src/types/index.ts`
- Used by: Next.js router
- Purpose: Interactive UI elements requiring browser state or user events
- Location: `C:/Projetos/da-silva-dashboard/src/app/dashboard/*.tsx` (UploadModal, PeriodSelector), `C:/Projetos/da-silva-dashboard/src/app/dashboard/usuarios/UsersClient.tsx`, `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/EvolutionChart.tsx`, `C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx` (LogoutButton)
- Contains: React state, event handlers, browser-side Supabase client calls
- Depends on: `C:/Projetos/da-silva-dashboard/src/lib/supabase/client.ts`
- Used by: Server Components that embed them
- Purpose: Admin operations requiring `SUPABASE_SERVICE_ROLE_KEY` (user creation, etc.)
- Location: `C:/Projetos/da-silva-dashboard/src/app/api/admin/`
- Contains: Auth verification, service-role Supabase client, mutations
- Depends on: `@supabase/supabase-js` (direct), `C:/Projetos/da-silva-dashboard/src/lib/supabase/server.ts` for caller auth check
- Used by: Client Components (via `fetch`)
- Purpose: Supabase client factories, formatting utilities, data parser
- Location: `C:/Projetos/da-silva-dashboard/src/lib/`
- Contains: `supabase/server.ts`, `supabase/client.ts`, `utils.ts`, `parser.ts`
- Depends on: Nothing internal
- Used by: All layers above
- Purpose: Shared TypeScript interfaces and constants
- Location: `C:/Projetos/da-silva-dashboard/src/types/index.ts`
- Contains: `Profile`, `Period`, `Goal`, `VendorSummary`, `ClientPortfolio`, `VendorEvolution`, `STORE_COLORS`, `STORE_LABELS`
- Used by: All layers
## Data Flow
- URL searchParams drive active period, store filter, and tab selection (no React state for these)
- Component-local `useState` used only for modal open/close, form fields, loading states
## Key Abstractions
- Purpose: Pre-aggregated per-vendor per-period metrics (total_sold, meta levels, bonuses, commission)
- Queried by: `C:/Projetos/da-silva-dashboard/src/app/dashboard/page.tsx`, `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx`, `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx`
- Purpose: Per-client per-vendor per-period aggregates (spend, recency, frequency)
- Queried by: `C:/Projetos/da-silva-dashboard/src/app/dashboard/ClientsTab.tsx`
- Purpose: Historical cross-period data for a single vendor
- Called with: `supabase.rpc('vendor_evolution', { p_vendor_id })`
- Used by: `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx`, `C:/Projetos/da-silva-dashboard/src/app/dashboard/vendedor/[vendor_id]/page.tsx`
- Purpose: Renders client portfolio table — used in admin dashboard, vendor detail page, and vendor self-view
- Location: `C:/Projetos/da-silva-dashboard/src/app/dashboard/ClientsTab.tsx`
- Props: `periodId: number`, `vendorId: string | null` (null = all vendors)
- Two roles: `adm` and `vendedor` (stored in `profiles.role`)
- `adm` → `/dashboard`, `/dashboard/usuarios`, `/dashboard/vendedor/[id]`
- `vendedor` → `/meu-resultado` (sees only their own data, scoped by `profiles.vendor_id`)
## Entry Points
- Location: `C:/Projetos/da-silva-dashboard/src/app/page.tsx`
- Triggers: Any visit to `/`
- Responsibilities: Checks auth and role, redirects to `/dashboard` (adm) or `/meu-resultado` (vendedor)
- Location: `C:/Projetos/da-silva-dashboard/src/app/login/page.tsx`
- Triggers: Unauthenticated access (middleware redirect)
- Responsibilities: `signInWithPassword` via browser client, redirects to `/` on success
- Location: `C:/Projetos/da-silva-dashboard/src/app/dashboard/page.tsx`
- Triggers: Authenticated `adm` visiting `/dashboard`
- Responsibilities: Period/store filtering, vendor ranking table, KPI cards, upload trigger
- Location: `C:/Projetos/da-silva-dashboard/src/app/meu-resultado/page.tsx`
- Triggers: Authenticated `vendedor` visiting `/meu-resultado`
- Responsibilities: Individual performance, client portfolio, historical evolution
## Error Handling
- Auth failure → `redirect('/login')` at page level (belt-and-suspenders after middleware)
- Role mismatch → `redirect()` to the correct route for that role
- Missing vendor profile → inline empty state render (no redirect)
- Missing summary data → inline empty state render or `redirect('/dashboard')`
- API routes → `NextResponse.json({ error: ... }, { status: 4xx })`
- UploadModal → caught errors displayed inline in modal status area
- No global error boundary
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
