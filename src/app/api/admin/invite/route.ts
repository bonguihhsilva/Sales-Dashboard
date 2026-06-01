import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { canInvite, isValidRole, ASSIGNABLE_ROLES } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types'
import { strictRateLimiter } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // Rate limiter
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  // 1. Verificar caller autenticado e contexto de tenant
  const { user, profile } = await getTenantContext()
  
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  // 2. Verificar caller pode criar convites (D-02) — via perfil
  const callerRole = profile.role
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
  // Apenas super_admin pode convidar outros super_admins
  if (role === 'super_admin' && profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Acesso negado: Apenas super administradores podem convidar usuários com esta role.' }, { status: 403 })
  }
  // Admins/gerentes comuns só podem convidar roles que estão em ASSIGNABLE_ROLES
  if (profile.role !== 'super_admin' && !ASSIGNABLE_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: 'Acesso negado: Esta role não é atribuível via convites.' }, { status: 403 })
  }
  if (!loja) {
    return NextResponse.json({ error: 'Loja e obrigatoria' }, { status: 400 })
  }

  // 4. Descobrir tenant_id. Se super_admin, ele pode passar o tenant_id destino explícito, senão usa o tenant do contexto (masquerade).
  const admin = createAdminClient()

  let targetTenantId = body.tenant_id?.trim() || null

  if (profile.role === 'super_admin' && targetTenantId) {
    // Ok, usar o targetTenantId explícito se enviado
  } else {
    // Restrito ao tenant_id ativo do contexto
    targetTenantId = profile.tenant_id
  }

  if (!targetTenantId) {
    return NextResponse.json({ error: 'Tenant de destino nao encontrado' }, { status: 400 })
  }

  // 5. Inserir convite — token e expira_em vem dos DEFAULTs do Postgres
  const { data: convite, error: insertErr } = await admin
    .from('convites')
    .insert({
      tenant_id: targetTenantId,
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
