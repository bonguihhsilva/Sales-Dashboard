import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { data: profile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { year, month, label, start_date, end_date } = await req.json()

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Check if period already exists
  const { data: existing } = await admin
    .from('periods')
    .select('id, label')
    .eq('year', year)
    .eq('month', month)
    .single()

  if (existing) {
    return NextResponse.json({ id: existing.id, label: existing.label, created: false })
  }

  // Create new period
  const { data: created, error } = await admin
    .from('periods')
    .insert({ year, month, label, start_date, end_date })
    .select('id, label')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { error: rpcError } = await admin.rpc('calculate_vendor_goals', { p_period_id: created!.id })
  if (rpcError) console.error('calculate_vendor_goals error:', rpcError)

  return NextResponse.json({ id: created!.id, label: created!.label, created: true })
}
