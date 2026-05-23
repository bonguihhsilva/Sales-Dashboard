import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Ordem importa: prefixos mais especificos primeiro.
// /dashboard/config deve ser avaliado antes de /dashboard.
const ROLE_RULES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: '/admin', allowed: ['super_admin'] },
  { prefix: '/dashboard/config', allowed: ['adm', 'super_admin'] },
  { prefix: '/dashboard', allowed: ['adm', 'gerente', 'super_admin'] },
  { prefix: '/meu-resultado', allowed: ['vendedor'] },
  { prefix: '/treinamento', allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
]

// Rotas publicas - sem auth check. /convite permite acesso sem sessao.
const PUBLIC_PREFIXES = ['/login', '/convite', '/api']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Rotas publicas: deixa passar (apos refresh de cookie acima)
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // Valida o token no servidor Supabase a cada request
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role vem do JWT app_metadata - sem query ao banco (D-04)
  const role = (user.app_metadata?.role as string | undefined) ?? 'vendedor'

  const rule = ROLE_RULES.find(r => pathname.startsWith(r.prefix))
  if (rule && !rule.allowed.includes(role)) {
    const url = request.nextUrl.clone()
    url.pathname = role === 'vendedor' ? '/meu-resultado' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
