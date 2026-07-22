import { createClient } from '@supabase/supabase-js'

const FIX_HINT = 'Rode: node scripts/fix-service-role.mjs (entrada oculta, nao expoe a key).'

let warned = false

/**
 * Diagnostica a service-role key e loga o problema UMA vez no servidor.
 *
 * Deliberadamente NAO lanca. createAdminClient() e chamado no DashboardLayout,
 * entao lancar aqui derruba o layout inteiro e leva junto ate a tela de login —
 * o usuario fica sem conseguir nem entrar. Com a key ruim, o supabase-js
 * constroi o client normalmente e falha por query, o que as paginas ja tratam
 * exibindo faixa de erro. Degradacao graciosa vale mais que crash cedo aqui.
 *
 * O valor da key nunca aparece na mensagem — so comprimento e o claim role.
 */
function checkServiceRoleKey(key: string | undefined): void {
  if (warned) return

  const problem = (() => {
    if (!key) return 'ausente'
    const parts = key.split('.')
    if (parts.length !== 3) {
      return `malformada (${key.length} chars, ${parts.length} segmentos — JWT tem 3)`
    }
    let role: unknown
    try {
      role = (JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { role?: unknown })
        .role
    } catch {
      return `corrompida (${key.length} chars, payload ilegivel)`
    }
    if (role !== 'service_role') {
      return `tem role="${String(role)}", esperado "service_role" (copie a service_role secret, nao a anon)`
    }
    return null
  })()

  if (problem) {
    warned = true
    console.error(
      `[supabase/admin] SUPABASE_SERVICE_ROLE_KEY ${problem}. ` +
        `Toda leitura via service-role vai falhar como "Invalid API key". ${FIX_HINT}`
    )
  }
}

// Service role client — bypasses RLS, use only in server-side code
export function createAdminClient() {
  checkServiceRoleKey(process.env.SUPABASE_SERVICE_ROLE_KEY)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
