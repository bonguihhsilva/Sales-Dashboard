import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockRpcResult: { data: unknown; error: { message: string } | null } = { data: true, error: null }
let mockRpcThrows = false

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: async () => {
      if (mockRpcThrows) throw new Error('connection reset')
      return mockRpcResult
    },
  }),
}))

const { getClientIp, strictRateLimiter, strictUserRateLimiter } = await import('@/lib/ratelimit')

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/admin/invite', { headers })
}

describe('getClientIp', () => {
  it('retorna o ultimo segmento de uma cadeia x-forwarded-for com multiplos IPs', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.1.1.1, 10.0.0.5, 203.0.113.7' })
    expect(getClientIp(req)).toBe('203.0.113.7')
  })

  it('faz trim de espacos ao redor de cada segmento', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.1.1.1 ,  203.0.113.7  ' })
    expect(getClientIp(req)).toBe('203.0.113.7')
  })

  it('retorna o proprio IP quando ha um unico segmento', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.7' })
    expect(getClientIp(req)).toBe('203.0.113.7')
  })

  it('ignora um prefixo forjado pelo cliente, mantendo o segmento real (ultimo) como chave', () => {
    const attackerReq1 = makeRequest({ 'x-forwarded-for': '1.1.1.1, 203.0.113.7' })
    const attackerReq2 = makeRequest({ 'x-forwarded-for': '9.9.9.9, 203.0.113.7' })
    // Variar o prefixo forjavel nao muda a chave extraida — o ultimo
    // segmento (adicionado pela borda, nao pelo cliente) e sempre o mesmo.
    expect(getClientIp(attackerReq1)).toBe(getClientIp(attackerReq2))
  })

  it('retorna anonymous quando o header esta ausente', () => {
    const req = makeRequest()
    expect(getClientIp(req)).toBe('anonymous')
  })
})

describe('strictUserRateLimiter (fail-closed)', () => {
  beforeEach(() => {
    mockRpcResult = { data: true, error: null }
    mockRpcThrows = false
  })

  it('permite a requisicao quando a RPC retorna true', async () => {
    mockRpcResult = { data: true, error: null }
    const { success } = await strictUserRateLimiter.limit('user-123')
    expect(success).toBe(true)
  })

  it('bloqueia a requisicao quando a RPC retorna false (limite atingido)', async () => {
    mockRpcResult = { data: false, error: null }
    const { success } = await strictUserRateLimiter.limit('user-123')
    expect(success).toBe(false)
  })

  it('bloqueia (fail-closed) quando a RPC retorna erro', async () => {
    mockRpcResult = { data: null, error: { message: 'db unavailable' } }
    const { success } = await strictUserRateLimiter.limit('user-123')
    expect(success).toBe(false)
  })

  it('bloqueia (fail-closed) quando a RPC lanca excecao', async () => {
    mockRpcThrows = true
    const { success } = await strictUserRateLimiter.limit('user-123')
    expect(success).toBe(false)
  })
})

describe('strictRateLimiter (fail-open, comportamento existente inalterado)', () => {
  beforeEach(() => {
    mockRpcResult = { data: true, error: null }
    mockRpcThrows = false
  })

  it('permite a requisicao (fail-open) quando a RPC retorna erro', async () => {
    mockRpcResult = { data: null, error: { message: 'db unavailable' } }
    const { success } = await strictRateLimiter.limit('1.2.3.4')
    expect(success).toBe(true)
  })

  it('permite a requisicao (fail-open) quando a RPC lanca excecao', async () => {
    mockRpcThrows = true
    const { success } = await strictRateLimiter.limit('1.2.3.4')
    expect(success).toBe(true)
  })
})
