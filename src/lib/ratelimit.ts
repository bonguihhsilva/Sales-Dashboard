import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasRedisConfig = !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('placeholder')
)

let rateLimiter: { limit: (key: string) => Promise<{ success: boolean }> }
let strictRateLimiter: { limit: (key: string) => Promise<{ success: boolean }> }

if (hasRedisConfig) {
  try {
    const redis = Redis.fromEnv()
    
    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 req/min por IP
    })

    strictRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),  // 5 req/min
    })
  } catch (err) {
    console.error('[Rate Limiting] Falha ao inicializar Upstash Redis client. Aplicando bypass.', err)
    const bypass = async () => ({ success: true })
    rateLimiter = { limit: bypass }
    strictRateLimiter = { limit: bypass }
  }
} else {
  // Fallback silencioso para desenvolvimento local sem redis configurado
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Rate Limiting] Upstash Redis ausente ou com placeholders. Ignorando limitação de requisições localmente.')
  }
  const bypass = async () => ({ success: true })
  rateLimiter = { limit: bypass }
  strictRateLimiter = { limit: bypass }
}

export { rateLimiter, strictRateLimiter }
