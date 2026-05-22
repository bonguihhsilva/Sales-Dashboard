import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { setUserRole } from '@/lib/auth/roles'
import { isValidRole } from '@/lib/auth/roles'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const token: string | undefined = body.token
  const password: string | undefined = body.password

  // 1. Validar input
  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 400 })
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'A senha deve ter pelo menos 8 caracteres.' },
      { status: 400 }
    )
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 2. Buscar e validar o convite
  const { data: convite, error: convErr } = await admin
    .from('convites')
    .select('id, email, role, loja, tenant_id, usado, expira_em')
    .eq('token', token)
    .single()

  if (convErr || !convite) {
    return NextResponse.json({ error: 'Convite invalido' }, { status: 404 })
  }
  if (convite.usado) {
    return NextResponse.json({ error: 'Este convite ja foi utilizado.' }, { status: 409 })
  }
  if (new Date(convite.expira_em) < new Date()) {
    return NextResponse.json({ error: 'Convite expirado.' }, { status: 410 })
  }
  if (!isValidRole(convite.role)) {
    return NextResponse.json({ error: 'Convite com role invalido' }, { status: 400 })
  }

  // 3. Criar o usuario. Se o convite nao tinha email, gerar um placeholder
  // unico (o usuario foi convidado por link — o gerente passa as credenciais).
  const userEmail = convite.email
    ?? `convite-${convite.id}@dasilva.local`

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true,
    app_metadata: { role: convite.role },
  })
  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: createErr?.message ?? 'Falha ao criar usuario' },
      { status: 400 }
    )
  }
  const newUserId = created.user.id

  // 4. Corrigir o profile criado pelo trigger handle_new_user.
  // O trigger insere o profile com role default 'vendedor' (Pitfall 3).
  // setUserRole reafirma app_metadata.role + profiles.role com o role do convite.
  const roleResult = await setUserRole(admin, newUserId, convite.role)
  if (roleResult.error) {
    return NextResponse.json({ error: roleResult.error }, { status: 400 })
  }

  // Aplicar loja e tenant_id do convite no profile
  const { error: profUpdateErr } = await admin
    .from('profiles')
    .update({ store: convite.loja, tenant_id: convite.tenant_id })
    .eq('id', newUserId)
  if (profUpdateErr) {
    return NextResponse.json({ error: profUpdateErr.message }, { status: 400 })
  }

  // 5. Marcar convite como usado (Pitfall 5: previne reuso do token)
  const { error: usedErr } = await admin
    .from('convites')
    .update({ usado: true })
    .eq('id', convite.id)
  if (usedErr) {
    return NextResponse.json({ error: usedErr.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, email: userEmail })
}
