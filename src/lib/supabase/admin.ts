import { createClient } from '@supabase/supabase-js'

const FIX_HINT = 'Rode: node scripts/fix-service-role.mjs (entrada oculta, nao expoe a key).'

/**
 * Uma key invalida passa no non-null assertion e so falha na primeira query,
 * como "Invalid API key" generico espalhado por toda tela que le dados.
 * Validar aqui troca isso por um erro unico que diz o que fazer.
 *
 * Contar segmentos nao basta: uma key corrompida pode ter os 2 pontos e ainda
 * assim ter payload ilegivel. Decodificar o payload e exigir role=service_role
 * pega tanto corrupcao quanto o erro comum de colar a anon key no lugar.
 *
 * Nenhuma mensagem inclui o valor da key — apenas comprimento e o claim role.
 */
function assertServiceRoleKey(key: string | undefined): string {
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ausente. Supabase > Settings > API > service_role secret. ' +
        FIX_HINT
    )
  }

  const parts = key.split('.')
  if (parts.length !== 3) {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY malformada (${key.length} chars, ${parts.length} segmentos — JWT tem 3). ` +
        FIX_HINT
    )
  }

  let role: unknown
  try {
    role = (JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { role?: unknown }).role
  } catch {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY corrompida (${key.length} chars, payload ilegivel). ` +
        FIX_HINT
    )
  }

  if (role !== 'service_role') {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY tem role="${String(role)}", esperado "service_role". ` +
        'Copie a "service_role secret", nao a anon. ' +
        FIX_HINT
    )
  }

  return key
}

// Service role client — bypasses RLS, use only in server-side code
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    assertServiceRoleKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
