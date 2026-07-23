import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

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

// Resultado bruto da RPC, antes de decidir fail-open vs fail-closed — essa
// decisao e responsabilidade de cada factory (makeLimiter/makeFailClosedLimiter),
// nao da chamada compartilhada.
type RpcResult = { ok: true; allowed: boolean } | { ok: false }

// Namespace do p_key: separa buckets de limiters fail-open (chave = IP ou
// api_key_id) dos fail-closed (chave = user.id). Sem isso, dois limiters
// diferentes com o mesmo (max, windowSeconds) e um valor de chave coincidente
// (ex.: um user.id que por acaso seja identico a um IP) compartilhariam o
// mesmo contador no Postgres.
type KeyNamespace = 'ip' | 'user'

// Chamada real a RPC — compartilhada entre makeLimiter e makeFailClosedLimiter.
// Cada factory decide como interpretar erro/excecao (fail-open retorna
// success:true, fail-closed retorna success:false); esta funcao so reporta
// se a RPC respondeu com sucesso e, se sim, o resultado.
async function checkRateLimit(
  namespace: KeyNamespace,
  max: number,
  windowSeconds: number,
  key: string
): Promise<RpcResult> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_key: `${namespace}:${max}:${windowSeconds}:${key}`,
      p_max: max,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.error('[Rate Limiting] RPC error:', error.message)
      return { ok: false }
    }
    return { ok: true, allowed: data === true }
  } catch (err) {
    console.error('[Rate Limiting] Exception:', err)
    return { ok: false }
  }
}

function makeLimiter(max: number, windowSeconds: number): Limiter {
  return {
    async limit(key: string) {
      const result = await checkRateLimit('ip', max, windowSeconds, key)
      // Fail-open: RPC indisponivel nao deve derrubar a rota.
      if (!result.ok) return { success: true }
      return { success: result.allowed }
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
      const result = await checkRateLimit('user', max, windowSeconds, key)
      // Fail-closed: RPC indisponivel bloqueia a requisicao.
      if (!result.ok) return { success: false }
      return { success: result.allowed }
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
// calcular-comissao, parse-upload e upload-catalog, aplicado apos a
// autenticacao suceder.
// Nao substitui o strictRateLimiter pre-auth (que continua por IP e
// fail-open, protegendo contra flood nao autenticado) — e uma camada
// adicional, nao forjavel por header, que nao se desliga sozinha sob falha
// de infra.
export const strictUserRateLimiter: Limiter = makeFailClosedLimiter(5, 60)

// Exportado para permitir criar outros limiters fail-closed no futuro sem
// duplicar a logica acima.
export { makeFailClosedLimiter }

// Segundo layer de rate limit (por user.id, fail-closed), compartilhado por
// todas as rotas admin sensiveis que ja passaram no check de autenticacao.
// Retorna null quando a requisicao pode prosseguir, ou a NextResponse 429
// pronta para ser retornada diretamente pela rota quando o limite bate.
export async function enforceUserRateLimit(userId: string): Promise<NextResponse | null> {
  const { success } = await strictUserRateLimiter.limit(userId)
  if (success) return null
  return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })
}
