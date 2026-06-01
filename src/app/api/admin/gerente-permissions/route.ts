import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { PERMISSION_KEYS } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  const admin = createAdminClient()

  if (userId) {
    // Permissions for a specific gerente
    const { data, error } = await admin
      .from('gerente_permissions')
      .select('permissions')
      .eq('tenant_id', profile.tenant_id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ permissions: data?.permissions ?? {} })
  }

  // All gerentes in the tenant with their permissions
  const { data: gerentes } = await admin
    .from('profiles')
    .select('id, name')
    .eq('tenant_id', profile.tenant_id)
    .eq('role', 'gerente')

  const { data: perms } = await admin
    .from('gerente_permissions')
    .select('user_id, permissions')
    .eq('tenant_id', profile.tenant_id)

  const permsMap = new Map((perms ?? []).map(p => [p.user_id, p.permissions]))

  const result = (gerentes ?? []).map(g => ({
    ...g,
    permissions: permsMap.get(g.id) ?? {},
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { user_id, permissions } = await req.json()
  if (!user_id) return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })

  // Confirm target is a gerente in same tenant
  const admin = createAdminClient()
  const { data: target } = await admin
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user_id)
    .single()

  if (!target || target.tenant_id !== profile.tenant_id)
    return NextResponse.json({ error: 'Usuário não pertence à sua organização' }, { status: 403 })
  if (target.role !== 'gerente')
    return NextResponse.json({ error: 'Usuário não é gerente' }, { status: 400 })

  // Sanitize: only allow known keys
  const sanitized: Record<string, boolean> = {}
  for (const key of PERMISSION_KEYS) {
    if (typeof permissions?.[key] === 'boolean') sanitized[key] = permissions[key]
  }

  const { error } = await admin
    .from('gerente_permissions')
    .upsert(
      { tenant_id: profile.tenant_id, user_id, permissions: sanitized, updated_at: new Date().toISOString() },
      { onConflict: 'tenant_id,user_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
