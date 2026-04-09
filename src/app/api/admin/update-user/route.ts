import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { data: callerProfile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (callerProfile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

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

  // 2. Get current profile to know the vendor_id we're working with
  const { data: currentProfile } = await admin
    .from('profiles').select('vendor_id, name, store').eq('id', user_id).single()

  // 3. Update profile
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

  // 4. Propagate name + store to sales_records and goals
  // Use the new vendor_id if changing, otherwise use the existing one
  const finalVendorId = (vendor_id !== undefined ? vendor_id : currentProfile?.vendor_id) || null
  const finalName     = name  !== undefined ? name  : currentProfile?.name
  const finalStore    = store !== undefined ? store : currentProfile?.store

  if (finalVendorId && (name !== undefined || store !== undefined || vendor_id !== undefined)) {
    const propagate: Record<string, string> = {}
    if (finalName)                                             propagate.vendor_name = finalName
    if (finalStore && finalStore !== '' && finalStore !== 'Sem loja') propagate.store = finalStore

    if (Object.keys(propagate).length > 0) {
      // Update sales_records
      const { error: srError } = await admin
        .from('sales_records')
        .update(propagate)
        .eq('vendor_id', finalVendorId)
      if (srError) console.error('sales_records propagation error:', srError)

      // Update goals
      const { error: gError } = await admin
        .from('goals')
        .update(propagate)
        .eq('vendor_id', finalVendorId)
      if (gError) console.error('goals propagation error:', gError)
    }

    // If vendor_id changed, also propagate to OLD vendor's sales (remove the old link)
    if (vendor_id !== undefined && currentProfile?.vendor_id && currentProfile.vendor_id !== vendor_id) {
      // Old vendor_id sales should keep their original name — nothing to do
      // But make sure new vendor's sales are properly named
    }
  }

  return NextResponse.json({ success: true })
}
