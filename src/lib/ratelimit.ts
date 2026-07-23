import { createAdminClient } from '@/lib/supabase/admin'

// Rate limiter Postgres-backed (Supabase). Funciona em serverless: estado vive no DB.
// check_rate_limit(p_key, p_max, p_window_seconds) retorna true=permitido / false=limitado.
//
// Fail-open: se a RPC falhar (DB indisponível), permite a requisição e loga.
// Disponibilidade > bloqueio total em caso de incidente de infra.

type Limiter = { limit: (key: string) => Promise<{ success: boolean }> }

// Shape minimo compativel com NextRequest/Request — evita importar next/server aqui.
type NextRequestLike = { headers: { get(name: string): string | null } }

// Extrai o IP real do cliente a partir de x-forwarded-for.
//
// x-forwarded-for e uma cadeia "cliente, proxy1, proxy2, ..." — o cliente
// controla o que ele proprio envia nesse header, mas NAO controla o que a
// borda da Vercel acrescenta ao final da cadeia (o IP da conexao TCP real).
// Por isso usamos o ULTIMO segmento, nunca a string inteira nem o primeiro
// segmento: usar a string crua como chave de rate limit e forjavel (o
// atacante varia o prefixo a cada request e nunca repete a mesma chave).
//
// Fallback 'anonymous' apenas quando o header esta totalmente ausente.
export function getClientIp(req: NextRequestLike): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (!forwardedFor) return 'anonymous'
  const parts = forwardedFor.split(',').map(p => p.trim())
  return parts[parts.length - 1] || 'anonymous'
}

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

// Fail-closed: se a RPC falhar (DB indisponível), BLOQUEIA a requisição e loga.
//
// Usado apenas para o segundo layer de rate limiting (chave = user.id) em
// rotas sensíveis, aplicado DEPOIS do check de autenticação. Ao contrário do
// makeLimiter acima, aqui erramos para o lado do bloqueio: essas rotas
// (invite, calcular-comissao, parse-upload) sao caras ou sensiveis o
// suficiente para que "negar sob incerteza" seja mais seguro que "permitir
// sob incerteza" — principalmente porque e exatamente sob estresse de DB que
// um abuso automatizado tem mais chance de causar dano.
function makeFailClosedLimiter(max: number, windowSeconds: number): Limiter {
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
          console.error('[Rate Limiting] RPC error, fail-closed:', error.message)
          return { success: false }
        }
        return { success: data === true }
      } catch (err) {
        console.error('[Rate Limiting] Exception, fail-closed:', err)
        return { success: false }
      }
    },
  }
}

// 20 req/min — rotas gerais autenticadas
export const rateLimiter: Limiter = makeLimiter(20, 60)

// 5 req/min — rotas sensíveis (invite, accept-invite, parse-upload)
export const strictRateLimiter: Limiter = makeLimiter(5, 60)

// 60 req/min por api_key_id — API pública de ingest /api/v1/* (Pitfall 5)
export const apiV1RateLimiter: Limiter = makeLimiter(60, 60)

// 5 req/min por user.id, fail-closed — segundo layer para invite,
// calcular-comissao e parse-upload, aplicado apos a autenticacao suceder.
// Nao substitui o strictRateLimiter pre-auth (que continua por IP e
// fail-open, protegendo contra flood nao autenticado) — e uma camada
// adicional, nao forjavel por header, que nao se desliga sozinha sob falha
// de infra.
export const strictUserRateLimiter: Limiter = makeFailClosedLimiter(5, 60)

// Exportado para permitir criar outros limiters fail-closed no futuro sem
// duplicar a logica acima.
export { makeFailClosedLimiter }
