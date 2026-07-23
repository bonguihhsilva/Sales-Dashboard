import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { canInvite, isValidRole, assertRoleAssignable } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types'
import { strictRateLimiter, enforceUserRateLimit, getClientIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // Rate limiter — layer 1: por IP (real, extraido de x-forwarded-for), pre-auth,
  // fail-open. Unica barreira contra flood nao autenticado.
  const ip = getClientIp(req)
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  // 1. Verificar caller autenticado e contexto de tenant
  const { user, profile } = await getTenantContext()

  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  // Rate limiter — layer 2: por user.id, pos-auth, fail-closed. Nao forjavel
  // por header e nao se desliga sozinho sob falha de DB.
  const rateLimited = await enforceUserRateLimit(user.id)
  if (rateLimited) return rateLimited

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
  // Hierarquia de atribuicao (C-05): mesma regra de update-user/route.ts —
  // gerente so convida vendedor, adm convida vendedor/gerente, super_admin
  // convida qualquer role.
  const denialMessage = assertRoleAssignable(profile.role, role as UserRole, {
    superAdminOnly: 'Acesso negado: Apenas super administradores podem convidar usuários com esta role.',
    notAssignable: 'Acesso negado: Esta role não é atribuível via convites.',
  })
  if (denialMessage) {
    return NextResponse.json({ error: denialMessage }, { status: 403 })
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
