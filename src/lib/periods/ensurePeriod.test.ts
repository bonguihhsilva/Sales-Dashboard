import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ensurePeriodForDate } from '@/lib/periods/ensurePeriod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeChain(resolve: () => Promise<{ data: unknown }>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {}
  chain.eq = () => chain
  chain.or = () => chain
  chain.order = () => chain
  chain.limit = () => chain
  chain.maybeSingle = () => resolve()
  return chain
}

interface FakeAdminOptions {
  existing?: { id: number } | null
  insertResult?: { id: number }
  rpcError?: { message: string } | null
  goalsCount?: number
  prevPeriod?: { id: number } | null
  prevGoals?: Array<Record<string, unknown>>
}

function makeFakeAdmin(opts: FakeAdminOptions = {}) {
  const {
    existing = null,
    insertResult = { id: 99 },
    rpcError = null,
    goalsCount = 1,
    prevPeriod = null,
    prevGoals = [],
  } = opts

  let periodsSelectCallCount = 0

  const insertMock = vi.fn(() => ({
    select: () => ({
      single: async () => ({ data: insertResult, error: null }),
    }),
  }))

  const rpcMock = vi.fn(async () => ({ data: null, error: rpcError }))
  const goalsInsertMock = vi.fn(async () => ({ data: null, error: null }))

  const periodsSelectMock = vi.fn(() => {
    periodsSelectCallCount += 1
    if (periodsSelectCallCount === 1) {
      return makeChain(async () => ({ data: existing }))
    }
    return makeChain(async () => ({ data: prevPeriod }))
  })

  const goalsSelectMock = vi.fn((_cols: string, options?: { count?: string; head?: boolean }) => {
    if (options?.count) {
      return { eq: () => ({ eq: async () => ({ count: goalsCount }) }) }
    }
    return { eq: () => ({ eq: async () => ({ data: prevGoals }) }) }
  })

  const from = vi.fn((table: string) => {
    if (table === 'periods') {
      return { select: periodsSelectMock, insert: insertMock }
    }
    if (table === 'goals') {
      return { select: goalsSelectMock, insert: goalsInsertMock }
    }
    throw new Error(`tabela inesperada no mock: ${table}`)
  })

  const admin = { from, rpc: rpcMock } as unknown as SupabaseClient

  return { admin, insertMock, rpcMock, goalsInsertMock, periodsSelectMock }
}

describe('ensurePeriodForDate', () => {
  it('retorna o id existente sem chamar insert quando o period ja existe', async () => {
    const { admin, insertMock } = makeFakeAdmin({ existing: { id: 5 } })

    const id = await ensurePeriodForDate(admin, 'tenant-1', new Date('2026-05-15T00:00:00Z'))

    expect(id).toBe(5)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('cria o period e roda calculate_vendor_goals quando ausente', async () => {
    const { admin, insertMock, rpcMock } = makeFakeAdmin({
      existing: null,
      insertResult: { id: 10 },
      goalsCount: 1,
    })

    const id = await ensurePeriodForDate(admin, 'tenant-1', new Date('2026-05-15T00:00:00Z'))

    expect(id).toBe(10)
    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        year: 2026,
        month: 5,
        label: '2026-05',
        start_date: '2026-05-01',
        end_date: '2026-05-31',
        tenant_id: 'tenant-1',
      })
    )
    expect(rpcMock).toHaveBeenCalledWith('calculate_vendor_goals', {
      p_period_id: 10,
      p_tenant_id: 'tenant-1',
    })
  })

  it('deriva year/month corretamente a partir da saleDate (UTC)', async () => {
    const { admin, insertMock } = makeFakeAdmin({
      existing: null,
      insertResult: { id: 20 },
      goalsCount: 1,
    })

    await ensurePeriodForDate(admin, 'tenant-1', new Date('2026-03-01T00:00:00Z'))

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        year: 2026,
        month: 3,
        label: '2026-03',
        start_date: '2026-03-01',
        end_date: '2026-03-31',
      })
    )
  })
})
