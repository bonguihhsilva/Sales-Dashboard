import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import type { WithProfileName } from '@/types'

export async function GET(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')

  const { data: employees } = await admin.from('profiles').select('id').eq('tenant_id', profile.tenant_id)
  const uids = (employees ?? []).map(e => e.id)

  let query = admin
    .from('hr_permissions')
    .select('*, profiles!user_id(name)')
    .in('user_id', uids)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = (data ?? []).map((row: WithProfileName<Record<string, unknown>>) => ({
    ...row,
    user_name: row.profiles?.name ?? '',
    profiles: undefined,
  }))

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()

  const body: {
    user_id: string
    type: 'medical_certificate' | 'appointment' | 'document' | 'day_off' | 'vacation'
    requested_date: string
    end_date?: string
    notes?: string
  } = await req.json()

  // Validar se o funcionário pertence ao mesmo tenant
  const { data: employeeProfile } = await admin.from('profiles').select('tenant_id').eq('id', body.user_id).single()
  if (!employeeProfile || employeeProfile.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Funcionário não pertence à sua organização' }, { status: 403 })
  }

  if (body.type === 'vacation' && (!body.end_date || body.end_date < body.requested_date)) {
    return NextResponse.json({ error: 'end_date inválido para férias' }, { status: 400 })
  }

  const { data: permission, error } = await admin
    .from('hr_permissions')
    .insert({
      user_id: body.user_id,
      type: body.type,
      requested_date: body.requested_date,
      end_date: body.type === 'vacation' ? body.end_date : null,
      notes: body.notes ?? null,
      status: 'approved',
      requested_by: user.id,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(permission)
}
