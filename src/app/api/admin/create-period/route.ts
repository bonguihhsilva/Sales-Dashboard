import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  if (!profile?.tenant_id)
    return NextResponse.json({ error: 'Organização não associada ao usuário' }, { status: 400 })

  const admin = createAdminClient()

  const { year, month, label, start_date, end_date } = await req.json()
  const { data: period, error } = await admin
    .from('periods')
    .insert({ year, month, label, start_date, end_date, tenant_id: profile.tenant_id })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { error: rpcError } = await admin.rpc('calculate_vendor_goals', {
    p_period_id: period.id,
    p_tenant_id: profile.tenant_id,
  })
  if (rpcError) console.error('calculate_vendor_goals error:', rpcError)

  return NextResponse.json({ success: true, id: period.id })
}
