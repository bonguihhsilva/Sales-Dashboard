import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify caller is ADM
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { email, password, name, role, vendor_id, store } = await req.json()
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Campos obrigatórios: email, password, name' }, { status: 400 })
  }

  // Use service role key for admin operations
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create auth user
  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Update profile with role and vendor_id
  const { error: profileError } = await admin
    .from('profiles')
    .update({ name, role: role ?? 'vendedor', vendor_id: vendor_id || null, store: store || null })
    .eq('id', newUser.user!.id)

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

  return NextResponse.json({ success: true, user_id: newUser.user!.id })
}
