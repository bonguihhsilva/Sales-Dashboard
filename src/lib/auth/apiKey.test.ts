import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockRow: Record<string, unknown> | null = null

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: mockRow }),
        }),
      }),
      update: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
    }),
  }),
}))

const { generateApiKey, getApiKeyContext, hasScope, KEY_PREFIX } = await import('@/lib/auth/apiKey')

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/v1/sales', { headers })
}

describe('generateApiKey', () => {
  it('produz rawKey iniciando com KEY_PREFIX', () => {
    const { rawKey } = generateApiKey()
    expect(rawKey.startsWith(KEY_PREFIX)).toBe(true)
  })

  it('produz keyHash SHA-256 hex de 64 caracteres consistente com o rawKey', async () => {
    const { createHash } = await import('crypto')
    const { rawKey, keyHash } = generateApiKey()
    expect(keyHash).toMatch(/^[0-9a-f]{64}$/)
    expect(keyHash).toBe(createHash('sha256').update(rawKey).digest('hex'))
  })

  it('produz keyPrefix como os primeiros KEY_PREFIX.length + 8 caracteres do rawKey', () => {
    const { rawKey, keyPrefix } = generateApiKey()
    expect(keyPrefix).toBe(rawKey.slice(0, KEY_PREFIX.length + 8))
  })

  it('duas chamadas produzem rawKeys diferentes', () => {
    const a = generateApiKey()
    const b = generateApiKey()
    expect(a.rawKey).not.toBe(b.rawKey)
  })
})

describe('getApiKeyContext', () => {
  beforeEach(() => {
    mockRow = null
  })

  it('retorna null quando header Authorization esta ausente', async () => {
    const ctx = await getApiKeyContext(makeRequest())
    expect(ctx).toBeNull()
  })

  it('retorna null quando header nao comeca com "Bearer "', async () => {
    const ctx = await getApiKeyContext(makeRequest({ authorization: 'Token abc123' }))
    expect(ctx).toBeNull()
  })

  it('retorna null quando a key nao comeca com KEY_PREFIX', async () => {
    const ctx = await getApiKeyContext(makeRequest({ authorization: 'Bearer wrong_prefix_key' }))
    expect(ctx).toBeNull()
  })

  it('retorna null quando a key esta revogada (revoked_at preenchido)', async () => {
    const { rawKey, keyHash } = generateApiKey()
    mockRow = {
      id: 'key-1',
      tenant_id: 'tenant-1',
      key_hash: keyHash,
      scopes: ['*'],
      revoked_at: '2026-01-01T00:00:00Z',
    }
    const ctx = await getApiKeyContext(makeRequest({ authorization: `Bearer ${rawKey}` }))
    expect(ctx).toBeNull()
  })

  it('retorna null quando o hash divergir (comparacao timing-safe)', async () => {
    const { rawKey } = generateApiKey()
    const { keyHash: otherHash } = generateApiKey()
    mockRow = {
      id: 'key-1',
      tenant_id: 'tenant-1',
      key_hash: otherHash,
      scopes: ['*'],
      revoked_at: null,
    }
    const ctx = await getApiKeyContext(makeRequest({ authorization: `Bearer ${rawKey}` }))
    expect(ctx).toBeNull()
  })

  it('retorna { tenantId, apiKeyId, scopes } para key valida e ativa', async () => {
    const { rawKey, keyHash } = generateApiKey()
    mockRow = {
      id: 'key-1',
      tenant_id: 'tenant-1',
      key_hash: keyHash,
      scopes: ['*'],
      revoked_at: null,
    }
    const ctx = await getApiKeyContext(makeRequest({ authorization: `Bearer ${rawKey}` }))
    expect(ctx).toEqual({ tenantId: 'tenant-1', apiKeyId: 'key-1', scopes: ['*'] })
  })

  it('retorna null quando expires_at esta no passado (mesmo tratamento de key revogada)', async () => {
    const { rawKey, keyHash } = generateApiKey()
    mockRow = {
      id: 'key-1',
      tenant_id: 'tenant-1',
      key_hash: keyHash,
      scopes: ['*'],
      revoked_at: null,
      expires_at: '2020-01-01T00:00:00Z',
    }
    const ctx = await getApiKeyContext(makeRequest({ authorization: `Bearer ${rawKey}` }))
    expect(ctx).toBeNull()
  })

  it('retorna contexto valido quando expires_at esta no futuro', async () => {
    const { rawKey, keyHash } = generateApiKey()
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    mockRow = {
      id: 'key-1',
      tenant_id: 'tenant-1',
      key_hash: keyHash,
      scopes: ['*'],
      revoked_at: null,
      expires_at: future,
    }
    const ctx = await getApiKeyContext(makeRequest({ authorization: `Bearer ${rawKey}` }))
    expect(ctx).toEqual({ tenantId: 'tenant-1', apiKeyId: 'key-1', scopes: ['*'] })
  })

  it('retorna contexto valido quando expires_at e null', async () => {
    const { rawKey, keyHash } = generateApiKey()
    mockRow = {
      id: 'key-1',
      tenant_id: 'tenant-1',
      key_hash: keyHash,
      scopes: ['*'],
      revoked_at: null,
      expires_at: null,
    }
    const ctx = await getApiKeyContext(makeRequest({ authorization: `Bearer ${rawKey}` }))
    expect(ctx).toEqual({ tenantId: 'tenant-1', apiKeyId: 'key-1', scopes: ['*'] })
  })
})

describe('hasScope', () => {
  it('retorna true quando scopes contem "*" (wildcard)', () => {
    const ctx = { tenantId: 't1', apiKeyId: 'k1', scopes: ['*'] }
    expect(hasScope(ctx, 'sales:write')).toBe(true)
    expect(hasScope(ctx, 'stock:write')).toBe(true)
  })

  it('retorna true quando scopes contem o escopo exato', () => {
    const ctx = { tenantId: 't1', apiKeyId: 'k1', scopes: ['sales:write'] }
    expect(hasScope(ctx, 'sales:write')).toBe(true)
  })

  it('retorna false quando scopes nao contem o escopo nem wildcard', () => {
    const ctx = { tenantId: 't1', apiKeyId: 'k1', scopes: ['stock:write'] }
    expect(hasScope(ctx, 'sales:write')).toBe(false)
  })

  it('retorna false quando scopes esta vazio', () => {
    const ctx = { tenantId: 't1', apiKeyId: 'k1', scopes: [] }
    expect(hasScope(ctx, 'sales:write')).toBe(false)
  })
})
