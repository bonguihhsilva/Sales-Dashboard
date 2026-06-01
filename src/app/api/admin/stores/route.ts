import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('stores')
    .select('id, name, color, ativo, created_at')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { name, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('stores')
    .insert({ tenant_id: profile.tenant_id, name: name.trim(), color: color || '#6366f1' })
    .select('id, name, color, ativo')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
