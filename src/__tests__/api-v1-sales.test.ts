import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/auth/apiKey', () => ({ getApiKeyContext: vi.fn() }))
vi.mock('@/lib/periods/ensurePeriod', () => ({ ensurePeriodForDate: vi.fn() }))
vi.mock('@/lib/ratelimit', () => ({ apiV1RateLimiter: { limit: vi.fn() } }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { getApiKeyContext } = await import('@/lib/auth/apiKey')
const { ensurePeriodForDate } = await import('@/lib/periods/ensurePeriod')
const { apiV1RateLimiter } = await import('@/lib/ratelimit')
const { createAdminClient } = await import('@/lib/supabase/admin')
const { POST } = await import('@/app/api/v1/sales/route')

const CTX = { tenantId: 'tenant-1', apiKeyId: 'key-1', scopes: ['*'] }

// ── Fake admin client — thenable select chain + spy upserts/rpc ────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSelectChain(data: unknown[]): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {}
  chain.select = () => chain
  chain.eq = () => chain
  chain.in = () => chain
  chain.order = () => chain
  chain.limit = () => chain
  chain.then = (resolve: (v: { data: unknown[]; error: null }) => void) =>
    resolve({ data, error: null })
  return chain
}

interface FakeAdminOptions {
  rpcError?: { message: string } | null
  productsData?: Array<Record<string, unknown>>
  goalsData?: Array<Record<string, unknown>>
}

function makeFakeAdmin(opts: FakeAdminOptions = {}) {
  const { rpcError = null, productsData = [], goalsData = [] } = opts

  const rpcMock = vi.fn(async () => ({ data: null, error: rpcError }))
  const saleItemsUpsertMock = vi.fn(async () => ({ data: null, error: null }))
  const mappingsUpsertMock = vi.fn(async () => ({ data: null, error: null }))

  const fromMock = vi.fn((table: string) => {
    if (table === 'products') return makeSelectChain(productsData)
    if (table === 'goals') return makeSelectChain(goalsData)
    if (table === 'sale_items') return { upsert: saleItemsUpsertMock }
    if (table === 'connector_id_mappings') return { upsert: mappingsUpsertMock }
    throw new Error(`tabela inesperada no mock: ${table}`)
  })

  const admin = { from: fromMock, rpc: rpcMock }

  return { admin, rpcMock, saleItemsUpsertMock, mappingsUpsertMock, fromMock }
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new Request('http://localhost/api/v1/sales', {
    method: 'POST',
    headers: {
      authorization: 'Bearer gds_live_testkey',
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

beforeEach(() => {
  vi.mocked(getApiKeyContext).mockReset().mockResolvedValue(CTX)
  vi.mocked(apiV1RateLimiter.limit).mockReset().mockResolvedValue({ success: true })
  vi.mocked(ensurePeriodForDate).mockReset().mockResolvedValue(42)
  vi.mocked(createAdminClient).mockReset()
})

describe('POST /api/v1/sales — auth', () => {
  it('sem header Authorization (getApiKeyContext -> null): responde 401 com envelope', async () => {
    vi.mocked(getApiKeyContext).mockResolvedValue(null)
    const { admin } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(makeRequest({ sales: [] }))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.success).toBe(false)
    expect(json.error).toBeTruthy()
  })
})

describe('POST /api/v1/sales — limite de batch (D-06)', () => {
  it('batch com 501 itens retorna 400 e nada e gravado', async () => {
    const { admin, rpcMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const sales = Array.from({ length: 501 }, (_, i) => ({
      order_id: `order-${i}`,
      vendor_id: 'vendor-1',
      sale_date: '2026-07-01',
      total: 10,
    }))

    const res = await POST(makeRequest({ sales }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.success).toBe(false)
    expect(rpcMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/sales — limite de tamanho de body (413)', () => {
  it('content-length acima de 4MB retorna 413 sem gravar nada', async () => {
    const { admin, rpcMock, saleItemsUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(
      makeRequest(
        { sales: [{ order_id: 'o1', vendor_id: 'v1', sale_date: '2026-07-01', total: 10 }] },
        { 'content-length': String(5 * 1024 * 1024) }
      )
    )
    const json = await res.json()

    expect(res.status).toBe(413)
    expect(json.success).toBe(false)
    expect(json.error).toMatch(/tamanho|413|grande|4MB/i)
    expect(rpcMock).not.toHaveBeenCalled()
    expect(saleItemsUpsertMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/sales — validacao parcial (D-13)', () => {
  it('1 venda invalida (sem order_id) + 1 valida -> accepted:1, rejected:1', async () => {
    const { admin, rpcMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(
      makeRequest({
        sales: [
          { vendor_id: 'v1', sale_date: '2026-07-01', total: 10 }, // sem order_id — invalida
          { order_id: 'o2', vendor_id: 'v1', sale_date: '2026-07-01', total: 20 },
        ],
      })
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.accepted).toBe(1)
    expect(json.rejected).toBe(1)
    expect(json.errors[0].index).toBe(0)
    expect(rpcMock).toHaveBeenCalledTimes(1)
    const [, rpcArgs] = rpcMock.mock.calls[0]
    expect(rpcArgs.p_rows).toHaveLength(1)
    expect(rpcArgs.p_rows[0].order_ref).toBe('o2')
  })
})

describe('POST /api/v1/sales — idempotencia transacional (D-07)', () => {
  it('chama ingest_sales_records com p_tenant_id do contexto e p_rows da venda', async () => {
    const { admin, rpcMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        sales: [{ order_id: 'o1', vendor_id: 'v1', sale_date: '2026-07-01', total: 10 }],
      })
    )

    expect(rpcMock).toHaveBeenCalledWith(
      'ingest_sales_records',
      expect.objectContaining({
        p_tenant_id: CTX.tenantId,
        p_rows: expect.arrayContaining([expect.objectContaining({ order_ref: 'o1' })]),
      })
    )
  })

  it('sale_items upsert usa onConflict com order_id (idempotencia nativa)', async () => {
    const { admin, saleItemsUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        sales: [
          {
            order_id: 'o1',
            vendor_id: 'v1',
            sale_date: '2026-07-01',
            total: 10,
            items: [{ product_code: 'p1', qty: 2, unit_price: 5 }],
          },
        ],
      })
    )

    expect(saleItemsUpsertMock).toHaveBeenCalledTimes(1)
    const [, upsertOpts] = saleItemsUpsertMock.mock.calls[0]
    expect(upsertOpts.onConflict).toContain('order_id')
  })
})

describe('POST /api/v1/sales — period por mes (D-08)', () => {
  it('3 vendas do mesmo mes -> ensurePeriodForDate chamado 1x', async () => {
    const { admin } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        sales: [
          { order_id: 'o1', vendor_id: 'v1', sale_date: '2026-07-01', total: 10 },
          { order_id: 'o2', vendor_id: 'v1', sale_date: '2026-07-15', total: 20 },
          { order_id: 'o3', vendor_id: 'v1', sale_date: '2026-07-30', total: 30 },
        ],
      })
    )

    expect(ensurePeriodForDate).toHaveBeenCalledTimes(1)
  })
})

describe('POST /api/v1/sales — namespacing de desconhecidos (D-15)', () => {
  it('vendor_id desconhecido -> upsert em connector_id_mappings com source_system api', async () => {
    const { admin, mappingsUpsertMock } = makeFakeAdmin({ goalsData: [] })
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        sales: [{ order_id: 'o1', vendor_id: 'vendor-desconhecido', sale_date: '2026-07-01', total: 10 }],
      })
    )

    expect(mappingsUpsertMock).toHaveBeenCalledTimes(1)
    const [rows] = mappingsUpsertMock.mock.calls[0]
    expect(rows[0]).toMatchObject({
      tenant_id: CTX.tenantId,
      source_system: 'api',
      entity_type: 'vendor',
      source_id: 'vendor-desconhecido',
    })
  })
})

describe('POST /api/v1/sales — seguranca de tenant (T-7-02)', () => {
  it('tenant_id no body e ignorado -- RPC recebe p_tenant_id do contexto da key', async () => {
    const { admin, rpcMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        sales: [
          {
            order_id: 'o1',
            vendor_id: 'v1',
            sale_date: '2026-07-01',
            total: 10,
            tenant_id: 'outro-tenant',
          },
        ],
      })
    )

    const [, rpcArgs] = rpcMock.mock.calls[0]
    expect(rpcArgs.p_tenant_id).toBe(CTX.tenantId)
    expect(rpcArgs.p_tenant_id).not.toBe('outro-tenant')
  })
})
