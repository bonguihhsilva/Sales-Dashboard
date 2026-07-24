import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

// A-05: cobre a validacao (zod) que substituiu o sanitizeString destrutivo
// em /api/admin/update-user — garante que nomes/lojas com apostrofo,
// ampersand etc. sao persistidos sem transformacao, e que entradas fora do
// tamanho razoavel sao rejeitadas com 400 em vez de silenciosamente
// corrompidas.

vi.mock('@/lib/auth/tenant', () => ({ getTenantContext: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { getTenantContext } = await import('@/lib/auth/tenant')
const { createAdminClient } = await import('@/lib/supabase/admin')
const { POST } = await import('@/app/api/admin/update-user/route')

const CALLER = {
  user: { id: 'caller-1', app_metadata: {} },
  profile: { role: 'super_admin', tenant_id: 'tenant-1' },
}

function makeRequest(body: unknown): NextRequest {
  return new Request('http://localhost/api/admin/update-user', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

function makeFakeAdmin(opts: { updateError?: { message: string } | null } = {}) {
  const { updateError = null } = opts
  const eqMock = vi.fn(async () => ({ error: updateError }))
  const updateMock = vi.fn(() => ({ eq: eqMock }))
  const fromMock = vi.fn((table: string) => {
    if (table === 'profiles') return { update: updateMock }
    throw new Error(`tabela inesperada no mock: ${table}`)
  })
  return { admin: { from: fromMock }, fromMock, updateMock, eqMock }
}

beforeEach(() => {
  vi.mocked(getTenantContext).mockReset().mockResolvedValue(CALLER as never)
  vi.mocked(createAdminClient).mockReset()
})

describe('POST /api/admin/update-user — validacao de name/store (A-05)', () => {
  it('nome com apostrofo e persistido sem escapar entidades HTML (regressao do bug de corrupcao)', async () => {
    const { admin, updateMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin as never)

    const res = await POST(makeRequest({ userId: 'user-1', name: "O'Brien" }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ name: "O'Brien" }))
  })

  it('loja com "&" e persistida sem escapar entidades HTML', async () => {
    const { admin, updateMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin as never)

    const res = await POST(makeRequest({ userId: 'user-1', store: 'Jebai & Cia' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ store: 'Jebai & Cia' }))
  })

  it('nome vazio e tratado como campo nao fornecido (nao dispara erro nem update)', async () => {
    const { admin, updateMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin as never)

    const res = await POST(makeRequest({ userId: 'user-1', name: '' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('nome com mais de 200 caracteres retorna 400 e nao persiste', async () => {
    const { admin, updateMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin as never)

    const res = await POST(makeRequest({ userId: 'user-1', name: 'a'.repeat(201) }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/nome/i)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('loja com mais de 120 caracteres retorna 400 e nao persiste', async () => {
    const { admin, updateMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin as never)

    const res = await POST(makeRequest({ userId: 'user-1', store: 'a'.repeat(121) }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/loja/i)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('nome nao-string (numero) retorna 400 em vez de ser passado adiante silenciosamente', async () => {
    const { admin, updateMock } = makeFakeAdmin()
    vi.mocked(createAdminClient).mockReturnValue(admin as never)

    const res = await POST(makeRequest({ userId: 'user-1', name: 12345 }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/nome/i)
    expect(updateMock).not.toHaveBeenCalled()
  })
})
