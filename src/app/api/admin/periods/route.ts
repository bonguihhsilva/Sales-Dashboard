import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: periods } = await admin
    .from('periods')
    .select('id, label, year, month')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  return NextResponse.json(periods ?? [])
}
