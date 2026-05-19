# Coding Conventions

**Analysis Date:** 2026-05-19

## Naming Patterns

**Files:**
- Page components: `page.tsx` (Next.js App Router convention)
- Client components co-located with page: `PascalCase.tsx` (e.g., `ClientsTab.tsx`, `UploadModal.tsx`, `EvolutionChart.tsx`)
- Server-side page-adjacent components also PascalCase (e.g., `UsersClient.tsx`)
- Lib modules: `camelCase.ts` (e.g., `parser.ts`, `utils.ts`)
- Supabase clients: `client.ts` / `server.ts` inside `C:/Projetos/da-silva-dashboard/src/lib/supabase/`

**Functions:**
- camelCase for all functions: `fmtCurrency`, `parseSalesHtml`, `toIsoDate`, `metaLevel`, `bonusAmount`, `recencyColor`
- React components: PascalCase named exports (`export function KpiCard`, `export function StorePill`)
- Default exports for page-level components (`export default function DashboardPage`)
- Handler functions prefixed with `handle`: `handleLogin`, `handleUpload`
- Async action functions in Client Components use plain async function declarations inside the component body

**Variables:**
- camelCase throughout
- Short but meaningful aliases in data-heavy code: `lvl`, `m1`, `m2`, `m3`, `b`, `col`, `sv`, `st`
- Computed display values named with clear intent: `grandTotal`, `totalBonus`, `hitMeta`, `activePeriodLabel`

**Types and Interfaces:**
- PascalCase interfaces defined in `C:/Projetos/da-silva-dashboard/src/types/index.ts`
- Props interfaces defined inline above the component using the naming pattern `[Name]Props` (e.g., `KpiProps`, `ProgressBarProps`)
- Local-only interfaces defined at top of the file they're used in (e.g., `VendorOption` in `UsersClient.tsx`)
- Type aliases used for discriminated unions: `UserRole = 'adm' | 'vendedor'`, status state: `'idle' | 'parsing' | 'uploading' | 'done' | 'error'`
- `Record<string, string>` for lookup maps (e.g., `STORE_COLORS`, `STORE_LABELS`)

**Constants:**
- SCREAMING_SNAKE_CASE for module-level lookup maps: `STORE_COLORS`, `STORE_LABELS`, `META_COLORS`

## Code Style

**Formatting:**
- No Prettier config detected — code is manually formatted
- Tailwind CSS is installed but **not used for component styles**: all styling is done via inline `style={{}}` objects with CSS custom properties (`var(--bg)`, `var(--surface)`, etc.)
- `globals.css` defines the full design token system via CSS custom properties on `:root`
- Tailwind directives (`@tailwind base/components/utilities`) are present in `globals.css` as baseline reset only

**Linting:**
- ESLint via `eslint-config-next` (version 15.1.0) — no custom `.eslintrc` file detected
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- Non-null assertions (`!`) used on env vars: `process.env.NEXT_PUBLIC_SUPABASE_URL!`

**TypeScript:**
- `strict: true` — all types must be explicit
- Explicit type annotations on cookie handler params in `middleware.ts` and `server.ts`:
  ```typescript
  setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[])
  ```
- `type` keyword used for imports of interfaces: `import type { Period } from '@/types'`
- Non-null assertion with `!` preferred over optional chaining when value is guaranteed by context

## Import Organization

**Order (observed pattern):**
1. Next.js / React framework imports (`import { createClient } from '@/lib/supabase/server'`, `import { redirect } from 'next/navigation'`)
2. Internal lib utilities (`import { fmtCurrency, fmtK, ... } from '@/lib/utils'`)
3. Internal UI components (`import { KpiCard, StorePill, ... } from '@/components/ui'`)
4. Type imports (`import type { VendorSummary, Period } from '@/types'`)
5. Local component imports (relative, e.g., `import UploadModal from './UploadModal'`)

**Path Aliases:**
- `@/*` maps to `C:/Projetos/da-silva-dashboard/src/*` (configured in `tsconfig.json`)
- Used consistently for all cross-directory imports
- Relative paths only for same-directory or parent-directory imports (e.g., `'../../ClientsTab'`)

**Client boundary directive:**
- `'use client'` placed as first line of file for Client Components
- Server Components (async pages that call `createClient()` from `server.ts`) have no directive

## Error Handling

**API Routes:**
- Return `NextResponse.json({ error: string }, { status: N })` for all error cases
- Auth checks always first: verify user → verify role → proceed
- Pattern: early return on each guard condition
  ```typescript
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  ```

**Server Pages:**
- Auth failures use `redirect('/login')` or `redirect('/meu-resultado')` immediately
- No try/catch in server pages — errors surface to Next.js error boundary
- Missing data handled with early `return (JSX fallback)` pattern before main render

**Client Components:**
- `try/catch` wrapping all async operations
- Error messages stored in local state (e.g., `setError(...)`, `setMsg(...)`)
- Error typed as `unknown` with `instanceof Error` guard:
  ```typescript
  } catch (err: unknown) {
    setMessage(`Erro: ${err instanceof Error ? err.message : 'Falha na importação'}`)
  }
  ```
- `finally` used for resetting loading state:
  ```typescript
  } finally {
    setLoading(false)
  }
  ```

**Supabase queries:**
- Destructuring pattern: `const { data: alias } = await supabase.from(...)`
- Errors from write operations checked inline: `if (error) throw error`
- `null` coalescing for query results: `(summaries ?? []).filter(...)`, `clients?.length`

## Styling Patterns

**Design tokens** (defined in `C:/Projetos/da-silva-dashboard/src/app/globals.css`):
- `--bg`, `--surface`, `--surface2`, `--border`, `--text`, `--muted`, `--accent`
- `--meta1` (`#c8f542`), `--meta2` (`#42d9f5`), `--meta3` (`#f5a742`)
- Always reference tokens via `var()` in inline styles, never hardcode design colors except for Recharts (which requires hex literals)

**Typography:**
- `'Syne'` — headings, buttons, primary text (loaded via Google Fonts in `layout.tsx`)
- `'DM Mono'` — data labels, monospace values, table headers, metadata text
- Font family specified inline per element, not globally assigned via class

**Component structure in UI barrel (`C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx`):**
- Section separator comments: `// ── Component Name ────`
- Inline interface defined immediately above each component

## Comments

**When to Comment:**
- Inline comments explain non-obvious column mapping: `// Data rows: col[0] = numeric client code, col[18] = vendor id`
- Comments on intent for multi-step operations: `// Delete existing records for this period to avoid duplicates`
- Section markers in large files: `{/* Header */}`, `{/* Store tabs */}`, `{/* KPIs */}`
- No JSDoc — functions are typed via TypeScript signatures

## Function Design

**Size:** Functions are generally concise; page components are large (100–225 lines) due to inline JSX with full style objects

**Parameters:**
- Destructured props at component definition: `({ periodId, vendorId }: { periodId: number; vendorId: string | null })`
- Server page props always typed as `Promise<{...}>` for Next.js 15 async params/searchParams

**Return Values:**
- Utilities return primitive types (`string`, `number`)
- Components return JSX or `null` (via early return pattern)
- API routes always return `NextResponse.json(...)`

## Module Design

**Exports:**
- `C:/Projetos/da-silva-dashboard/src/components/ui/index.tsx` — named exports for all UI primitives (barrel file)
- `C:/Projetos/da-silva-dashboard/src/types/index.ts` — all shared interfaces and domain constants exported
- `C:/Projetos/da-silva-dashboard/src/lib/utils.ts` — all utility functions exported individually
- Page components: default export only

**Barrel Files:**
- `src/components/ui/index.tsx` is the sole barrel — import all UI components from `@/components/ui`
- `src/types/index.ts` acts as type barrel — import types from `@/types`
- No barrel for `src/lib/` — import directly from `@/lib/utils`, `@/lib/supabase/client`, `@/lib/supabase/server`

---

*Convention analysis: 2026-05-19*
