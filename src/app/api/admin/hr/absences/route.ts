import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET() {
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

  const { data, error } = await admin
    .from('hr_absences')
    .select('*, profiles!user_id(full_name)')
    .order('absence_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = (data ?? []).map((row: Record<string, unknown> & { profiles?: { full_name?: string } }) => ({
    ...row,
    user_name: row.profiles?.full_name ?? '',
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
    absence_date: string
    type: 'deduct_free_day' | 'justified' | 'no_balance'
    free_day_id?: string
    notes?: string
  } = await req.json()

  if (body.type === 'deduct_free_day' && body.free_day_id) {
    const { error: updateError } = await admin
      .from('hr_free_days')
      .update({ status: 'deducted', used_at: body.absence_date })
      .eq('id', body.free_day_id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  const { data: absence, error } = await admin
    .from('hr_absences')
    .insert({
      user_id: body.user_id,
      absence_date: body.absence_date,
      type: body.type,
      free_day_id: body.free_day_id ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(absence)
}
