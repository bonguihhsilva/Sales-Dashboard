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
    .from('hr_free_days')
    .select('*, profiles!user_id(name)')
    .in('user_id', uids)
    .order('created_at', { ascending: false })

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

  const { user_ids, notes }: { user_ids: string[]; notes: string } = await req.json()

  if (!user_ids || user_ids.length === 0) {
    return NextResponse.json({ error: 'Nenhum funcionário informado' }, { status: 400 })
  }

  // Validar se todos os user_ids pertencem ao mesmo tenant do administrador logado
  const { data: countData, error: countErr } = await caller
    .from('profiles')
    .select('id')
    .in('id', user_ids)
    .eq('tenant_id', profile.tenant_id)

  if (countErr || !countData || countData.length !== user_ids.length) {
    return NextResponse.json({ error: 'Um ou mais funcionários não pertencem à sua organização' }, { status: 403 })
  }

  const today = new Date()
  const issued = today.toISOString().split('T')[0]
  const expiry = new Date(today.getTime() + 60 * 86400000).toISOString().split('T')[0]

  const rows = user_ids.map((uid) => ({
    user_id: uid,
    issued_at: issued,
    expires_at: expiry,
    status: 'available',
    notes,
  }))

  const { error } = await admin.from('hr_free_days').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ inserted: rows.length })
}

