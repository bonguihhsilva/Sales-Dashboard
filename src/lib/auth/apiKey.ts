import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export const KEY_PREFIX = 'gds_live_'

export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = KEY_PREFIX + randomBytes(24).toString('base64url')
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, KEY_PREFIX.length + 8)
  return { rawKey, keyHash, keyPrefix }
}

export type ApiKeyContext = { tenantId: string; apiKeyId: string; scopes: string[] }

export async function getApiKeyContext(req: Request): Promise<ApiKeyContext | null> {
  const authHeader = req.headers.get('authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return null

  const rawKey = authHeader.slice(7)
  if (!rawKey.startsWith(KEY_PREFIX)) return null

  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, KEY_PREFIX.length + 8)

  const admin = createAdminClient()
  const { data: row } = await admin
    .from('api_keys')
    .select('id, tenant_id, key_hash, scopes, revoked_at')
    .eq('key_prefix', keyPrefix)
    .maybeSingle()

  if (!row || row.revoked_at) return null

  const stored = Buffer.from(row.key_hash, 'hex')
  const provided = Buffer.from(keyHash, 'hex')
  if (stored.length !== provided.length || !timingSafeEqual(stored, provided)) return null

  // Best-effort — nao bloquear a resposta por causa da atualizacao de last_used_at
  admin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', row.id).then(() => {})

  return { tenantId: row.tenant_id as string, apiKeyId: row.id as string, scopes: row.scopes as string[] }
}
