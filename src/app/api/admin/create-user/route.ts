import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

import { sanitizeString } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const body = await req.json()
  const email = body.email
  const password = body.password
  const name = sanitizeString(body.name || '')
  const role = body.role ? sanitizeString(body.role) : undefined
  const vendor_id = body.vendor_id ? sanitizeString(body.vendor_id) : undefined
  const store = body.store ? sanitizeString(body.store) : undefined

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Campos obrigatórios: email, password, name' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Create auth user
  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const uid = newUser.user!.id

  // 2. Update profile with role, vendor_id, store, name
  const { error: profileError } = await admin
    .from('profiles')
    .update({
      name,
      role:      role ?? 'vendedor',
      vendor_id: vendor_id || null,
      store:     store || null,
    })
    .eq('id', uid)
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

  // 3. Propagate name and store to sales_records and goals if vendor_id is set
  if (vendor_id) {
    const salesUpdate: Record<string, string> = {}
    if (name)                          salesUpdate.vendor_name = name
    if (store && store !== 'Sem loja') salesUpdate.store       = store

    if (Object.keys(salesUpdate).length > 0) {
      await admin.from('sales_records').update(salesUpdate).eq('vendor_id', vendor_id)
      await admin.from('goals').update(salesUpdate).eq('vendor_id', vendor_id)
    }
  }

  return NextResponse.json({ success: true, user_id: uid })
}
