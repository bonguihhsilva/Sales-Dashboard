import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { data: profile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')

  let query = admin
    .from('hr_permissions')
    .select('*, profiles!user_id(name)')
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = (data ?? []).map((row: Record<string, unknown> & { profiles?: { name?: string } }) => ({
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
  const { data: profile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const body: {
    user_id: string
    type: 'medical_certificate' | 'appointment' | 'document'
    requested_date: string
    notes?: string
  } = await req.json()

  const { data: permission, error } = await admin
    .from('hr_permissions')
    .insert({
      user_id: body.user_id,
      type: body.type,
      requested_date: body.requested_date,
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
