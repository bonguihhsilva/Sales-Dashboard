import { createAdminClient } from '@/lib/supabase/admin'

// Rate limiter Postgres-backed (Supabase). Funciona em serverless: estado vive no DB.
// check_rate_limit(p_key, p_max, p_window_seconds) retorna true=permitido / false=limitado.
//
// Fail-open: se a RPC falhar (DB indisponível), permite a requisição e loga.
// Disponibilidade > bloqueio total em caso de incidente de infra.

type Limiter = { limit: (key: string) => Promise<{ success: boolean }> }

function makeLimiter(max: number, windowSeconds: number): Limiter {
  return {
    async limit(key: string) {
      try {
        const admin = createAdminClient()
        const { data, error } = await admin.rpc('check_rate_limit', {
          p_key: `${max}:${windowSeconds}:${key}`,
          p_max: max,
          p_window_seconds: windowSeconds,
        })
        if (error) {
          console.error('[Rate Limiting] RPC error, fail-open:', error.message)
          return { success: true }
        }
        return { success: data === true }
      } catch (err) {
        console.error('[Rate Limiting] Exception, fail-open:', err)
        return { success: true }
      }
    },
  }
}

// 20 req/min — rotas gerais autenticadas
export const rateLimiter: Limiter = makeLimiter(20, 60)

// 5 req/min — rotas sensíveis (invite, accept-invite, parse-upload)
export const strictRateLimiter: Limiter = makeLimiter(5, 60)
