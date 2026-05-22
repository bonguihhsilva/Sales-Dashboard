import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { canInvite, isValidRole } from '@/lib/auth/roles'

export async function POST(req: NextRequest) {
  // 1. Verificar caller autenticado
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  // 2. Verificar caller pode criar convites (D-02) — via app_metadata
  const callerRole = user.app_metadata?.role as string | undefined
  if (!canInvite(callerRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  // 3. Validar payload
  const body = await req.json()
  const email: string | null = body.email?.trim() || null
  const role: unknown = body.role
  const loja: string | null = body.loja?.trim() || null

  if (!isValidRole(role)) {
    return NextResponse.json({ error: 'Role invalido' }, { status: 400 })
  }
  if (!loja) {
    return NextResponse.json({ error: 'Loja e obrigatoria' }, { status: 400 })
  }

  // 4. Descobrir tenant_id do caller (convite herda o tenant de quem cria)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: callerProfile, error: profErr } = await admin
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  if (profErr || !callerProfile?.tenant_id) {
    return NextResponse.json({ error: 'Tenant do criador nao encontrado' }, { status: 400 })
  }

  // 5. Inserir convite — token e expira_em vem dos DEFAULTs do Postgres
  const { data: convite, error: insertErr } = await admin
    .from('convites')
    .insert({
      tenant_id: callerProfile.tenant_id,
      email,
      role,
      loja,
      criado_por: user.id,
    })
    .select('token, expira_em')
    .single()
  if (insertErr || !convite) {
    return NextResponse.json(
      { error: insertErr?.message ?? 'Falha ao criar convite' },
      { status: 400 }
    )
  }

  // 6. Construir link e retornar (D-05: link sempre retornado)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? req.nextUrl.origin
  const link = `${appUrl}/convite/${convite.token}`

  // Envio de email — opcional (D-05). Disparado so se o convite tem email.
  // Falha de email NUNCA quebra a criacao do convite.
  let emailSent = false
  if (email) {
    // Nome de quem convidou, para o corpo do email
    const { data: senderProfile } = await admin
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    try {
      const { data: fnData, error: fnError } = await admin.functions.invoke(
        'send-invite-email',
        { body: { to: email, inviteLink: link, senderName: senderProfile?.name ?? 'Sua equipe' } },
      )
      // A Edge Function retorna { sent: boolean }; sem RESEND_API_KEY vem sent:false
      emailSent = !fnError && fnData?.sent === true
    } catch {
      // Edge Function indisponivel/nao deployada — convite segue valido pelo link
      emailSent = false
    }
  }

  return NextResponse.json({
    link,
    token: convite.token,
    expira_em: convite.expira_em,
    email_requested: !!email,
    email_sent: emailSent,
  })
}
