import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const effectiveRole = profile?.role || 'vendedor'
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Perfil sem tenant' }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const periodIdStr = searchParams.get('period_id')
  if (!periodIdStr) {
    return NextResponse.json({ error: 'period_id obrigatório' }, { status: 400 })
  }

  const periodId = parseInt(periodIdStr, 10)
  const vendorId = searchParams.get('vendor_id')

  const admin = createAdminClient()
  let query = admin
    .from('goals_brand')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .eq('period_id', periodId)

  if (vendorId) {
    query = query.eq('vendor_id', vendorId)
  }

  const { data, error } = await query.order('brand', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const effectiveRole = profile?.role || 'vendedor'
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Perfil sem tenant' }, { status: 400 })
  }

  const body = await req.json()
  const { period_id, vendor_id, brand, meta_valor, bonus } = body

  if (!period_id || !vendor_id || !brand) {
    return NextResponse.json({ error: 'period_id, vendor_id e brand são obrigatórios' }, { status: 400 })
  }

  const cleanBrand = String(brand).trim()
  if (!cleanBrand) {
    return NextResponse.json({ error: 'Marca não pode ser vazia' }, { status: 400 })
  }

  const metaVal = Math.max(0, Math.round(Number(meta_valor ?? 0) * 100) / 100)
  const bonusVal = Math.max(0, Math.round(Number(bonus ?? 0) * 100) / 100)

  const caller = await createServerClient()
  // Validar período pertencente ao tenant
  const { data: period } = await caller
    .from('periods')
    .select('tenant_id')
    .eq('id', period_id)
    .single()

  if (!period || period.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Período inválido ou não pertencente à sua organização' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('goals_brand')
    .upsert(
      {
        tenant_id: profile.tenant_id,
        period_id,
        vendor_id,
        brand: cleanBrand,
        meta_valor: metaVal,
        bonus: bonusVal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,period_id,vendor_id,brand' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, data })
}

export async function DELETE(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const effectiveRole = profile?.role || 'vendedor'
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Perfil sem tenant' }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('goals_brand')
    .delete()
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
