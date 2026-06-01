import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await caller.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Organização não associada ao usuário' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: periods } = await admin
    .from('periods')
    .select('id, label, year, month')
    .eq('tenant_id', profile.tenant_id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  return NextResponse.json(periods ?? [])
}

