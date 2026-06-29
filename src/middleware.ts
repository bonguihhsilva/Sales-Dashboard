import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import type { PermissionKey } from '@/lib/permissions'

// Ordem importa: prefixos mais especificos primeiro.
// /dashboard/config deve ser avaliado antes de /dashboard.
const ROLE_RULES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: '/admin', allowed: ['super_admin'] },
  { prefix: '/dashboard/config', allowed: ['adm', 'super_admin'] },
  { prefix: '/dashboard', allowed: ['adm', 'gerente', 'super_admin'] },
  { prefix: '/vendedor', allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
  { prefix: '/mural', allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
  { prefix: '/perfil', allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
  { prefix: '/configuracoes', allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
  { prefix: '/api/admin', allowed: ['adm', 'gerente', 'super_admin'] },
  { prefix: '/api/vendor', allowed: ['vendedor', 'adm', 'gerente', 'super_admin'] },
]

// Permissoes finas do gerente: cada flag de gerente_permissions gateia rotas especificas.
// adm/super_admin ignoram estas regras (acesso total). Avaliado so quando role === 'gerente'.
// Ordem importa: regra mais especifica (aprovar) antes da geral (ver_comissoes).
const GERENTE_PERM_RULES: Array<{ test: (p: string) => boolean; perm: PermissionKey }> = [
  {
    test: p =>
      p.startsWith('/dashboard/usuarios') ||
      p.startsWith('/api/admin/create-user') ||
      p.startsWith('/api/admin/update-user') ||
      p.startsWith('/api/admin/disable-user') ||
      p.startsWith('/api/admin/invite') ||
      p.startsWith('/api/admin/gerente-permissions'),
    perm: 'gerenciar_usuarios',
  },
  {
    test: p =>
      (p.includes('/comissoes') && p.includes('/aprovar')) ||
      p.startsWith('/api/admin/calcular-comissao'),
    perm: 'aprovar_comissoes',
  },
  {
    test: p =>
      p.startsWith('/dashboard/comissao') ||
      p.startsWith('/dashboard/regras-comissao') ||
      p.startsWith('/api/admin/comissoes'),
    perm: 'ver_comissoes',
  },
  {
    test: p => p.startsWith('/dashboard/rh') || p.startsWith('/api/admin/hr'),
    perm: 'ver_rh',
  },
  {
    test: p =>
      p.startsWith('/dashboard/relatorios') || p.startsWith('/api/admin/relatorio-excel'),
    perm: 'ver_relatorios',
  },
  {
    test: p =>
      p.startsWith('/api/admin/parse-upload') ||
      p.startsWith('/api/admin/create-period') ||
      p.startsWith('/api/admin/ensure-period'),
    perm: 'importar_dados',
  },
]

// Rotas publicas - sem auth check. /convite permite acesso sem sessao.
const PUBLIC_PREFIXES = ['/login', '/convite', '/api/admin/accept-invite', '/landing']

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

  // Propaga cookies de auth (incl. token rotacionado pelo getUser) em qualquer resposta
  // que nao seja supabaseResponse. Sem isso, o refresh token rotacionado se perde no
  // redirect/json e o proximo request falha com "Invalid Refresh Token" (logout aleatorio).
  const withAuthCookies = (res: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c))
    return res
  }

  const { pathname } = request.nextUrl

  // Rotas publicas: deixa passar (apos refresh de cookie acima)
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // Valida o token no servidor Supabase a cada request
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    // Raiz sem sessao -> landing publica. Demais rotas protegidas -> login.
    url.pathname = pathname === '/' ? '/landing' : '/login'
    return withAuthCookies(NextResponse.redirect(url))
  }

  // Role vem do JWT app_metadata - sem query ao banco (D-04)
  const role = (user?.app_metadata?.role as string | undefined) ?? 'vendedor'

  const rule = ROLE_RULES.find(r => pathname.startsWith(r.prefix))
  if (rule && !rule.allowed.includes(role)) {
    const url = request.nextUrl.clone()
    url.pathname = role === 'vendedor' ? '/vendedor/meu-resultado' : '/dashboard'
    return withAuthCookies(NextResponse.redirect(url))
  }

  // Enforcement fino do gerente: gateia rotas pelos flags de gerente_permissions.
  // Leitura via service-role apenas quando gerente acessa uma rota gateada (sempre fresco,
  // sem depender de sincronizar permissoes no JWT).
  if (role === 'gerente') {
    const permRule = GERENTE_PERM_RULES.find(r => r.test(pathname))
    if (permRule) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      )
      const { data: gp } = await admin
        .from('gerente_permissions')
        .select('permissions')
        .eq('user_id', user.id)
        .maybeSingle()
      const perms = (gp?.permissions ?? {}) as Record<string, boolean>
      if (!perms[permRule.perm]) {
        if (pathname.startsWith('/api/')) {
          return withAuthCookies(NextResponse.json({ error: 'Permissão negada' }, { status: 403 }))
        }
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return withAuthCookies(NextResponse.redirect(url))
      }
    }
  }

  // Se o vendedor tentar ir para a raiz ou acessar caminhos genéricos
  if (pathname === '/' || pathname === '/dashboard') {
    if (role === 'vendedor') {
      const url = request.nextUrl.clone()
      url.pathname = '/vendedor/meu-resultado'
      return withAuthCookies(NextResponse.redirect(url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
