import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { user_id, email, password, name, vendor_id, role, active, store } = await req.json()
  if (!user_id) return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Update auth (email/password)
  const authUpdate: Record<string, string> = {}
  if (email)    authUpdate.email    = email
  if (password) authUpdate.password = password
  if (Object.keys(authUpdate).length > 0) {
    const { error } = await admin.auth.admin.updateUserById(user_id, authUpdate)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 2. Update profile
  const profileUpdate: Record<string, unknown> = {}
  if (name !== undefined)      profileUpdate.name      = name
  if (vendor_id !== undefined) profileUpdate.vendor_id = vendor_id || null
  if (role !== undefined)      profileUpdate.role      = role
  if (active !== undefined)    profileUpdate.active    = active
  if (store !== undefined)     profileUpdate.store     = store || null

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await admin.from('profiles').update(profileUpdate).eq('id', user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 3. If vendor_id or store or name changed — propagate to sales_records and goals
  // Get the final vendor_id to update (either the new one or fetch current)
  const finalVendorId = vendor_id !== undefined
    ? (vendor_id || null)
    : (await admin.from('profiles').select('vendor_id').eq('id', user_id).single()).data?.vendor_id

  if (finalVendorId) {
    // Build what needs to be updated in sales_records
    const salesUpdate: Record<string, string> = {}
    if (store && store !== 'Sem loja') salesUpdate.store = store
    if (name)                          salesUpdate.vendor_name = name

    if (Object.keys(salesUpdate).length > 0) {
      await admin
        .from('sales_records')
        .update(salesUpdate)
        .eq('vendor_id', finalVendorId)
    }

    // Build what needs to be updated in goals
    const goalsUpdate: Record<string, string> = {}
    if (store && store !== 'Sem loja') goalsUpdate.store = store
    if (name)                          goalsUpdate.vendor_name = name

    if (Object.keys(goalsUpdate).length > 0) {
      await admin
        .from('goals')
        .update(goalsUpdate)
        .eq('vendor_id', finalVendorId)
    }
  }

  return NextResponse.json({ success: true })
}
