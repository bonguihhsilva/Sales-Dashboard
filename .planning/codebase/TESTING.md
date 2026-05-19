# Testing Patterns

**Analysis Date:** 2026-05-19

## Test Framework

**Runner:**
- None — no test framework is installed or configured
- No `jest`, `vitest`, `mocha`, `@testing-library/*`, or any test runner found in `package.json`

**Assertion Library:**
- None

**Run Commands:**
```bash
# No test script defined in package.json
npm run lint    # Only automated code check available
```

## Test File Organization

**Location:**
- No test files exist in the project
- No `__tests__/` directories, no `*.test.ts`, no `*.spec.tsx` files found anywhere under `C:/Projetos/da-silva-dashboard/src/`

**Naming:**
- No convention established — no test files to observe

## Test Structure

**Suite Organization:**
- Not applicable — no tests

**Patterns:**
- None established

## Mocking

**Framework:**
- None

**What to Mock (guidance for future test setup):**
- Supabase clients: mock `@/lib/supabase/client` and `@/lib/supabase/server` entirely
- `next/navigation` (`redirect`, `useRouter`) — standard Next.js testing requirement
- `parseSalesHtml` in `C:/Projetos/da-silva-dashboard/src/lib/parser.ts` is pure and does not need mocking — it is the primary candidate for unit testing

## Fixtures and Factories

**Test Data:**
- None defined

**Location:**
- No `fixtures/`, `factories/`, or `__mocks__/` directories exist

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Not present
- High-value candidates for unit testing:
  - `C:/Projetos/da-silva-dashboard/src/lib/utils.ts` — all pure functions (`fmtCurrency`, `fmtK`, `metaLevel`, `bonusAmount`, `recencyColor`, `recencyLabel`) are side-effect-free and trivially testable
  - `C:/Projetos/da-silva-dashboard/src/lib/parser.ts` — `parseSalesHtml` and `toIsoDate` are pure functions; `parseSalesHtml` uses only regex on a string, no DOM or browser APIs required

**Integration Tests:**
- Not present
- High-value candidates:
  - `C:/Projetos/da-silva-dashboard/src/app/api/admin/create-user/route.ts` — role-gating logic (401/403 guards) and two-step user creation (auth + profile update)

**E2E Tests:**
- Not present, no Playwright or Cypress installed

## Common Patterns

**Async Testing:**
- Not established — no framework in place

**Error Testing:**
- Not established

## Recommended Setup (if tests are introduced)

Given the stack (Next.js 15, TypeScript strict), the standard setup would be:

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Vitest config would live at `C:/Projetos/da-silva-dashboard/vitest.config.ts`.

Test files should be co-located with source files following the pattern `*.test.ts` / `*.test.tsx`.

Starting point — pure utility tests require zero mocking:
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { metaLevel, bonusAmount, fmtK } from './utils'

describe('metaLevel', () => {
  it('returns 0 when below meta1', () => {
    expect(metaLevel(500, 1000, 2000, 3000)).toBe(0)
  })
  it('returns 3 when at or above meta3', () => {
    expect(metaLevel(3000, 1000, 2000, 3000)).toBe(3)
  })
})
```

---

*Testing analysis: 2026-05-19*
