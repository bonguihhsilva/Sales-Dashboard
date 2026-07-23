import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/auth/apiKey', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/auth/apiKey')>()),
  getApiKeyContext: vi.fn(),
}))
vi.mock('@/lib/ratelimit', () => ({ apiV1RateLimiter: { limit: vi.fn() } }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { getApiKeyContext } = await import('@/lib/auth/apiKey')
const { apiV1RateLimiter } = await import('@/lib/ratelimit')
const { createAdminClient } = await import('@/lib/supabase/admin')
const { POST } = await import('@/app/api/v1/stock/route')

const CTX = { tenantId: 'tenant-1', apiKeyId: 'key-1', scopes: ['*'] }

function makeFakeAdmin() {
  const stockUpsertMock = vi.fn(async () => ({ data: null, error: null }))
  const mappingsUpsertMock = vi.fn(async () => ({ data: null, error: null }))

  const fromMock = vi.fn((table: string) => {
    if (table === 'stock_snapshots') return { upsert: stockUpsertMock }
    if (table === 'connector_id_mappings') return { upsert: mappingsUpsertMock }
    throw new Error(`tabela inesperada no mock: ${table}`)
  })

  const admin = { from: fromMock }

  return { admin, stockUpsertMock, mappingsUpsertMock, fromMock }
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new Request('http://localhost/api/v1/stock', {
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
  vi.mocked(createAdminClient).mockReset()
})

describe('POST /api/v1/stock — auth', () => {
  it('sem header Authorization (getApiKeyContext -> null): responde 401 com envelope', async () => {
    vi.mocked(getApiKeyContext).mockResolvedValue(null)
    const { admin } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(makeRequest({ items: [] }))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.success).toBe(false)
    expect(json.error).toBeTruthy()
  })
})

describe('POST /api/v1/stock — escopos (Task 3 / C-07)', () => {
  it('key com scopes ["*"] passa pela checagem de escopo (comportamento default preservado)', async () => {
    vi.mocked(getApiKeyContext).mockResolvedValue({ tenantId: 'tenant-1', apiKeyId: 'key-1', scopes: ['*'] })
    const { admin, stockUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(makeRequest({ items: [{ product_code: 'p1', quantity: 10 }] }))

    expect(res.status).toBe(200)
    expect(stockUpsertMock).toHaveBeenCalledTimes(1)
  })

  it('key sem escopo stock:write (scopes ["sales:write"]) e rejeitada com 403', async () => {
    vi.mocked(getApiKeyContext).mockResolvedValue({
      tenantId: 'tenant-1',
      apiKeyId: 'key-1',
      scopes: ['sales:write'],
    })
    const { admin, stockUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(makeRequest({ items: [{ product_code: 'p1', quantity: 10 }] }))
    const json = await res.json()

    expect(res.status).toBe(403)
    expect(json.success).toBe(false)
    expect(json.error).toBeTruthy()
    expect(stockUpsertMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/stock — upsert diario (D-11)', () => {
  it('2 produtos -> upsert em stock_snapshots com onConflict contendo snapshot_date', async () => {
    const { admin, stockUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(
      makeRequest({
        items: [
          { product_code: 'p1', quantity: 10, snapshot_date: '2026-07-15' },
          { product_code: 'p2', quantity: 20 },
        ],
      })
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(stockUpsertMock).toHaveBeenCalledTimes(1)
    const [rows, opts] = stockUpsertMock.mock.calls[0]
    expect(opts.onConflict).toContain('snapshot_date')
    expect(rows).toHaveLength(2)

    const row1 = rows.find((r: Record<string, unknown>) => r.product_code === 'p1')
    expect(row1.snapshot_date).toBe('2026-07-15')

    const row2 = rows.find((r: Record<string, unknown>) => r.product_code === 'p2')
    const todayISO = new Date().toISOString().slice(0, 10)
    expect(row2.snapshot_date).toBe(todayISO)

    expect(json.accepted).toBe(2)
  })
})

describe('POST /api/v1/stock — limite de tamanho de body (413)', () => {
  it('content-length acima de 4MB retorna 413 sem gravar nada', async () => {
    const { admin, stockUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(
      makeRequest(
        { items: [{ product_code: 'p1', quantity: 10 }] },
        { 'content-length': String(5 * 1024 * 1024) }
      )
    )
    const json = await res.json()

    expect(res.status).toBe(413)
    expect(json.success).toBe(false)
    expect(json.error).toMatch(/tamanho|413|grande|4MB/i)
    expect(stockUpsertMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/stock — validacao parcial (D-13)', () => {
  it('1 item invalido (sem product_code) + 1 valido -> accepted:1, rejected:1', async () => {
    const { admin, stockUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    const res = await POST(
      makeRequest({
        items: [
          { quantity: 10 }, // sem product_code — invalido
          { product_code: 'p2', quantity: 20 },
        ],
      })
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.accepted).toBe(1)
    expect(json.rejected).toBe(1)
    expect(json.errors[0].index).toBe(0)
    expect(stockUpsertMock).toHaveBeenCalledTimes(1)
    const [rows] = stockUpsertMock.mock.calls[0]
    expect(rows).toHaveLength(1)
    expect(rows[0].product_code).toBe('p2')
  })
})

describe('POST /api/v1/stock — namespacing de desconhecidos (D-15)', () => {
  it('product_code -> upsert em connector_id_mappings com source_system api, entity_type product', async () => {
    const { admin, mappingsUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        items: [{ product_code: 'produto-desconhecido', quantity: 5 }],
      })
    )

    expect(mappingsUpsertMock).toHaveBeenCalledTimes(1)
    const [rows, opts] = mappingsUpsertMock.mock.calls[0]
    expect(rows[0]).toMatchObject({
      tenant_id: CTX.tenantId,
      source_system: 'api',
      entity_type: 'product',
      source_id: 'produto-desconhecido',
    })
    expect(opts.onConflict).toContain('source_system')
    expect(opts.ignoreDuplicates).toBe(true)
  })
})

describe('POST /api/v1/stock — seguranca de tenant (T-7-02)', () => {
  it('tenant_id no body e ignorado -- row gravado usa ctx.tenantId', async () => {
    const { admin, stockUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        items: [{ product_code: 'p1', quantity: 10, tenant_id: 'outro-tenant' }],
      })
    )

    const [rows] = stockUpsertMock.mock.calls[0]
    expect(rows[0].tenant_id).toBe(CTX.tenantId)
    expect(rows[0].tenant_id).not.toBe('outro-tenant')
  })
})

describe('POST /api/v1/stock — custo ignorado (D-12)', () => {
  it('item com cost/unit_cost no payload -> row gravado nao contem custo', async () => {
    const { admin, stockUpsertMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin)

    await POST(
      makeRequest({
        items: [{ product_code: 'p1', quantity: 10, cost: 99, unit_cost: 50 }],
      })
    )

    const [rows] = stockUpsertMock.mock.calls[0]
    expect(rows[0]).not.toHaveProperty('cost')
    expect(rows[0]).not.toHaveProperty('unit_cost')
    expect(rows[0]).not.toHaveProperty('store')
  })
})
