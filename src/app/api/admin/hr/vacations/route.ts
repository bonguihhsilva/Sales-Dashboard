import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { data: profile } = await caller.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: employees } = await caller.from('profiles').select('id').eq('tenant_id', profile.tenant_id)
  const uids = (employees ?? []).map(e => e.id)

  const { data, error } = await admin
    .from('hr_vacations')
    .select('*, profiles!user_id(name)')
    .in('user_id', uids)
    .order('start_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = (data ?? []).map((row: any) => ({
    ...row,
    user_name: row.profiles?.name ?? '',
    profiles: undefined,
  }))

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { data: profile } = await caller.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const body: {
    user_id: string
    start_date: string
    end_date: string
    notes?: string
  } = await req.json()

  // Validar se o funcionário pertence ao mesmo tenant
  const { data: employeeProfile } = await caller.from('profiles').select('tenant_id').eq('id', body.user_id).single()
  if (!employeeProfile || employeeProfile.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Funcionário não pertence à sua organização' }, { status: 403 })
  }

  const { data: vacation, error } = await admin
    .from('hr_vacations')
    .insert({
      user_id: body.user_id,
      start_date: body.start_date,
      end_date: body.end_date,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(vacation)
}

