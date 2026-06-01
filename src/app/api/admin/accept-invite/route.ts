import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isValidRole } from '@/lib/auth/roles'
import { strictRateLimiter } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // Rate limiter
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })
  const body = await req.json()
  const token: string | undefined = body.token
  const password: string | undefined = body.password

  // 1. Validar input
  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 400 })
  }
  const pwdValid = password && password.length >= 8
    && /[A-Z]/.test(password)
    && /[0-9]/.test(password)
  if (!pwdValid) {
    return NextResponse.json(
      { error: 'Senha deve ter mínimo 8 caracteres, uma maiúscula e um número.' },
      { status: 400 }
    )
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 2. Buscar e validar o convite (apenas leitura para validação prévia na API)
  const { data: convite, error: convErr } = await admin
    .from('convites')
    .select('id, email, role, loja, tenant_id, expira_em, usado')
    .eq('token', token)
    .maybeSingle()

  if (convErr || !convite) {
    return NextResponse.json({ error: 'Convite inválido' }, { status: 404 })
  }
  if (convite.usado) {
    return NextResponse.json({ error: 'Este convite já foi utilizado.' }, { status: 409 })
  }
  if (new Date(convite.expira_em) < new Date()) {
    return NextResponse.json({ error: 'Convite expirado.' }, { status: 410 })
  }
  if (!isValidRole(convite.role)) {
    return NextResponse.json({ error: 'Convite com nível de acesso inválido.' }, { status: 400 })
  }

  const userEmail = convite.email ?? `convite-${convite.id}@dasilva.local`

  // 3. Criar o usuário passando o token do convite no metadata do usuário.
  // O trigger handle_new_user no PostgreSQL irá tratar de associar o perfil e marcar
  // o convite correspondente como usado na mesma transação atômica do banco de dados,
  // eliminando falhas parciais e rollbacks não-atômicos na camada da aplicação.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true,
    app_metadata: { role: convite.role },
    user_metadata: { invite_token: token, name: convite.email ? '' : 'Convidado' }
  })

  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: createErr?.message ?? 'Falha ao criar usuário' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, email: userEmail })
}
