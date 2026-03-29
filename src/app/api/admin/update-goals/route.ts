import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

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

  const body = await req.json()

  if (body.create) {
    const { error } = await admin.from('goals').insert({
      period_id: body.period_id, vendor_id: body.vendor_id,
      vendor_name: body.vendor_name, store: body.store,
      meta1: body.meta1, meta2: body.meta2, meta3: body.meta3,
      bonus1: body.bonus1 ?? 100, bonus2: body.bonus2 ?? 150, bonus3: body.bonus3 ?? 200,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  const { error } = await admin.from('goals').update({
    meta1: body.meta1, meta2: body.meta2, meta3: body.meta3,
    bonus1: body.bonus1, bonus2: body.bonus2, bonus3: body.bonus3,
  }).eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
