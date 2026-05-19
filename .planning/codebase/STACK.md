# Technology Stack

**Analysis Date:** 2026-05-19

## Languages

**Primary:**
- TypeScript 5.x - All application code under `C:/Projetos/da-silva-dashboard/src/`
- TSConfig strict mode enabled (`strict: true` in `C:/Projetos/da-silva-dashboard/tsconfig.json`)

**Secondary:**
- JavaScript - Config files only (`next.config.js`, `tailwind.config.js`, `postcss.config.js`)

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` found)

**Package Manager:**
- npm
- Lockfile: `C:/Projetos/da-silva-dashboard/package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.2.4 - App Router, SSR, API Routes
- React 19.0.0 - UI rendering

**Build/Dev:**
- TypeScript 5.x - Type checking, path aliases (`@/*` → `./src/*`)
- Tailwind CSS 3.4.1 - Utility-first styling, config at `C:/Projetos/da-silva-dashboard/tailwind.config.js`
- PostCSS 8 with autoprefixer - CSS processing, config at `C:/Projetos/da-silva-dashboard/postcss.config.js`
- ESLint 9 + eslint-config-next 15.1.0 - Linting

**Testing:**
- Not detected

## Key Dependencies

**Critical:**
- `@supabase/ssr` ^0.5.2 - SSR-safe Supabase client (server/browser distinction mandatory)
- `@supabase/supabase-js` ^2.47.0 - Base Supabase SDK (used directly for admin client with service role key)
- `recharts` ^2.13.3 - Chart rendering for dashboard data visualization
- `lucide-react` ^0.468.0 - Icon library
- `clsx` ^2.1.1 - Conditional className utility

**Infrastructure:**
- `react-dom` ^19.0.0 - React DOM rendering

## Configuration

**TypeScript:**
- Config: `C:/Projetos/da-silva-dashboard/tsconfig.json`
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017, module resolution: bundler
- Strict mode: enabled — maintain explicit type annotations, especially in `C:/Projetos/da-silva-dashboard/src/middleware.ts`

**Next.js:**
- Config: `C:/Projetos/da-silva-dashboard/next.config.js`
- `reactStrictMode: true`
- No custom headers, redirects, or image domains configured

**Tailwind:**
- Config: `C:/Projetos/da-silva-dashboard/tailwind.config.js`
- Content glob: `./src/**/*.{js,ts,jsx,tsx,mdx}`
- Custom color palette: `bg`, `surface`, `surface2`, `accent`, `jebai`, `mkt`, `caixa`, `meta1`–`meta3`
- Custom fonts: `Syne` (sans), `DM Mono` (mono) — loaded externally (not via next/font package)

**Environment:**
- Template: `C:/Projetos/da-silva-dashboard/.env.example`
- Local file: `.env.local` (not committed)
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Build:**
- Deploy config: `C:/Projetos/da-silva-dashboard/vercel.json`
- Build command: `npm run build`
- Output directory: `.next`

## Platform Requirements

**Development:**
- `npm run dev` → localhost:3000
- Requires `.env.local` with Supabase credentials

**Production:**
- Deployed to Vercel (configured via `C:/Projetos/da-silva-dashboard/vercel.json`)
- Framework preset: `nextjs`

---

*Stack analysis: 2026-05-19*
