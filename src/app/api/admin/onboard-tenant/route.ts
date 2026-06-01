import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/admin/onboard-tenant
 * Super-admin only. Provisions a new tenant with default stores and an adm invite.
 *
 * Body: { nome, slug, moeda_padrao?, locale?, lojas?: string[], adm_email }
 * Returns: { tenant_id, invite_link, invite_token }
 */
export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (profile?.role !== 'super_admin')
    return NextResponse.json({ error: 'Acesso restrito a super_admin' }, { status: 403 })

  const body = await req.json()
  const { nome, slug, moeda_padrao = 'USD', locale = 'es-PY', lojas, adm_email } = body

  if (!nome?.trim())      return NextResponse.json({ error: 'nome obrigatório' },      { status: 400 })
  if (!slug?.trim())      return NextResponse.json({ error: 'slug obrigatório' },      { status: 400 })
  if (!adm_email?.trim()) return NextResponse.json({ error: 'adm_email obrigatório' }, { status: 400 })

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug))
    return NextResponse.json({ error: 'slug: apenas letras minúsculas, números e hífens' }, { status: 400 })

  const admin = createAdminClient()

  // 1. Check slug uniqueness
  const { data: existing } = await admin.from('tenants').select('id').eq('slug', slug).maybeSingle()
  if (existing) return NextResponse.json({ error: `Slug '${slug}' já em uso` }, { status: 409 })

  // 2. Create tenant
  const { data: tenant, error: tenantErr } = await admin
    .from('tenants')
    .insert({ nome: nome.trim(), slug: slug.trim(), ativo: true, moeda_padrao, locale })
    .select('id')
    .single()

  if (tenantErr || !tenant)
    return NextResponse.json({ error: tenantErr?.message ?? 'Erro ao criar tenant' }, { status: 500 })

  const tenantId = tenant.id as string

  // 3. Create default stores
  const defaultLojas: { name: string; color: string }[] = (lojas?.length)
    ? (lojas as string[]).map((name: string, i: number) => ({
        name: name.trim(),
        color: ['#c8f542', '#42d9f5', '#f5a742', '#7b61ff'][i % 4],
      }))
    : [
        { name: 'Loja Principal', color: '#c8f542' },
      ]

  await admin.from('stores').insert(defaultLojas.map(l => ({ ...l, tenant_id: tenantId })))

  // 4. Create adm invite
  const { data: convite, error: convErr } = await admin
    .from('convites')
    .insert({
      tenant_id: tenantId,
      email: adm_email.trim().toLowerCase(),
      role: 'adm',
      loja: defaultLojas[0].name,
      criado_por: user.id,
    })
    .select('token, expira_em')
    .single()

  if (convErr || !convite)
    return NextResponse.json({ error: convErr?.message ?? 'Erro ao criar convite' }, { status: 500 })

  // 5. Send invite email (best-effort)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const inviteLink = `${appUrl}/convite/${convite.token}`

  try {
    await admin.functions.invoke('send-invite-email', {
      body: { to: adm_email.trim(), inviteLink, senderName: 'GDS Frame' },
    })
  } catch {
    // Edge Function failure never blocks onboarding
  }

  return NextResponse.json({
    tenant_id:    tenantId,
    invite_link:  inviteLink,
    invite_token: convite.token,
    expira_em:    convite.expira_em,
    lojas_criadas: defaultLojas.map(l => l.name),
  })
}
