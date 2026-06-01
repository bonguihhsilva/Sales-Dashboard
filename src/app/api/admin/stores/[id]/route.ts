import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const admin = createAdminClient()

  // Confirm store belongs to caller's tenant
  const { data: existing } = await admin
    .from('stores').select('tenant_id').eq('id', id).single()
  if (!existing || existing.tenant_id !== profile.tenant_id)
    return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })

  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = String(body.name).trim()
  if (body.color !== undefined) patch.color = String(body.color)
  if (body.ativo !== undefined) patch.ativo = Boolean(body.ativo)

  const { data, error } = await admin
    .from('stores').update(patch).eq('id', id).select('id, name, color, ativo').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
