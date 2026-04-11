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

  // 1. Get current profile before updating
  const { data: current } = await admin
    .from('profiles').select('vendor_id, name, store').eq('id', user_id).single()

  // 2. Update auth (email/password)
  const authUpdate: Record<string, string> = {}
  if (email)    authUpdate.email    = email
  if (password) authUpdate.password = password
  if (Object.keys(authUpdate).length > 0) {
    const { error } = await admin.auth.admin.updateUserById(user_id, authUpdate)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

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

  // 4. Determine final values
  const finalVendorId = vendor_id !== undefined ? (vendor_id || null) : current?.vendor_id
  const finalName     = name  !== undefined ? name  : current?.name
  const finalStore    = store !== undefined ? store : current?.store

  if (finalVendorId) {
    // 5. Propagate name + store to sales_records and goals
    const propagate: Record<string, string> = {}
    if (finalName)                                                         propagate.vendor_name = finalName
    if (finalStore && finalStore !== '' && finalStore !== 'Sem loja')     propagate.store       = finalStore

    if (Object.keys(propagate).length > 0) {
      await admin.from('sales_records').update(propagate).eq('vendor_id', finalVendorId)
      await admin.from('goals').update(propagate).eq('vendor_id', finalVendorId)
    }

    // 6. Auto-create missing goals for ALL periods (permanent fix)
    const { data: periods } = await admin.from('periods').select('id, label')
    const { data: existingGoals } = await admin
      .from('goals').select('period_id').eq('vendor_id', finalVendorId)
    const existingPids = new Set((existingGoals ?? []).map(g => g.period_id))

    // Get reference goal from same store for default meta values
    const { data: refs } = await admin
      .from('goals')
      .select('meta1, meta2, meta3, bonus1, bonus2, bonus3, commission_pct')
      .eq('store', finalStore ?? '')
      .neq('vendor_id', finalVendorId)
      .limit(1)
    const ref = refs?.[0] ?? { meta1: 0, meta2: 0, meta3: 0, bonus1: 100, bonus2: 150, bonus3: 200, commission_pct: 0.003 }

    for (const period of periods ?? []) {
      if (!existingPids.has(period.id)) {
        await admin.from('goals').insert({
          period_id:      period.id,
          vendor_id:      finalVendorId,
          vendor_name:    finalName ?? finalVendorId,
          store:          finalStore && finalStore !== 'Sem loja' ? finalStore : 'Sem loja',
          meta1:          ref.meta1,
          meta2:          ref.meta2,
          meta3:          ref.meta3,
          bonus1:         ref.bonus1,
          bonus2:         ref.bonus2,
          bonus3:         ref.bonus3,
          commission_pct: ref.commission_pct,
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}
