import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  
  const { data: profile } = await caller.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const body = await req.json()

  // Validar e arredondar numericamente as metas e os bônus para centavos (RISCO-08)
  const meta1 = Math.round(parseFloat(body.meta1) * 100) / 100
  const meta2 = Math.round(parseFloat(body.meta2) * 100) / 100
  const meta3 = Math.round(parseFloat(body.meta3) * 100) / 100
  
  if (isNaN(meta1) || isNaN(meta2) || isNaN(meta3)) {
    return NextResponse.json({ error: 'Os valores de metas devem ser números válidos.' }, { status: 400 })
  }
  if (meta1 <= 0) {
    return NextResponse.json({ error: 'A Meta 1 deve ser um valor maior que zero.' }, { status: 400 })
  }
  if (meta2 <= meta1) {
    return NextResponse.json({ error: 'A Meta 2 deve ser maior que a Meta 1.' }, { status: 400 })
  }
  if (meta3 <= meta2) {
    return NextResponse.json({ error: 'A Meta 3 deve ser maior que a Meta 2.' }, { status: 400 })
  }

  // Validar bônus se fornecidos
  const bonus1 = body.bonus1 !== undefined ? Math.round(parseFloat(body.bonus1) * 100) / 100 : 100
  const bonus2 = body.bonus2 !== undefined ? Math.round(parseFloat(body.bonus2) * 100) / 100 : 150
  const bonus3 = body.bonus3 !== undefined ? Math.round(parseFloat(body.bonus3) * 100) / 100 : 200

  if (isNaN(bonus1) || isNaN(bonus2) || isNaN(bonus3) || bonus1 < 0 || bonus2 < 0 || bonus3 < 0) {
    return NextResponse.json({ error: 'Os bônus devem ser números válidos maiores ou iguais a zero.' }, { status: 400 })
  }

  if (body.create) {
    // 1. Validar posse do vendedor por tenant_id
    const { data: vendorProfile } = await caller.from('profiles').select('tenant_id').eq('id', body.vendor_id).single()
    if (!vendorProfile || vendorProfile.tenant_id !== profile.tenant_id) {
      return NextResponse.json({ error: 'Vendedor não pertence à sua organização' }, { status: 403 })
    }

    // 2. Validar posse do período por tenant_id
    const { data: period } = await caller.from('periods').select('tenant_id').eq('id', body.period_id).single()
    if (!period || period.tenant_id !== profile.tenant_id) {
      return NextResponse.json({ error: 'Período inválido ou não pertencente à sua organização' }, { status: 403 })
    }

    const { error } = await admin.from('goals').insert({
      period_id: body.period_id, 
      tenant_id: profile.tenant_id,
      vendor_id: body.vendor_id,
      vendor_name: body.vendor_name, 
      store: body.store,
      meta1, 
      meta2, 
      meta3,
      bonus1, 
      bonus2, 
      bonus3,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  // 3. Validar posse da meta por tenant_id
  const { data: goal } = await caller.from('goals').select('tenant_id').eq('id', body.id).single()
  if (!goal || goal.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Meta não pertence à sua organização' }, { status: 403 })
  }

  const { error } = await admin.from('goals').update({
    meta1, 
    meta2, 
    meta3,
    bonus1, 
    bonus2, 
    bonus3,
  }).eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

