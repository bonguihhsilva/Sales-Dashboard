import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  if (!profile?.tenant_id)
    return NextResponse.json({ error: 'Organização não associada ao usuário' }, { status: 400 })

  const tenantId = profile.tenant_id
  const { year, month, label, start_date, end_date } = await req.json()

  const admin = createAdminClient()

  // Period existente — escopo no tenant (periods é UNIQUE(tenant_id, year, month))
  const { data: existing } = await admin
    .from('periods')
    .select('id, label')
    .eq('tenant_id', tenantId)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ id: existing.id, label: existing.label, created: false })
  }

  // Cria novo período do tenant
  const { data: created, error } = await admin
    .from('periods')
    .insert({ year, month, label, start_date, end_date, tenant_id: tenantId })
    .select('id, label')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-cálculo de metas a partir da média histórica (escopo no tenant)
  const { error: rpcError } = await admin.rpc('calculate_vendor_goals', {
    p_period_id: created!.id,
    p_tenant_id: tenantId,
  })
  if (rpcError) console.error('calculate_vendor_goals error:', rpcError)

  // Conta metas criadas pelo RPC
  const { count: goalsCreated } = await admin
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('period_id', created!.id)
    .eq('tenant_id', tenantId)

  // Fallback: copia metas do período anterior DO MESMO TENANT se o RPC não criou nenhuma
  if (!goalsCreated || goalsCreated === 0) {
    const { data: prevPeriod } = await admin
      .from('periods')
      .select('id')
      .eq('tenant_id', tenantId)
      .or(`year.lt.${year},and(year.eq.${year},month.lt.${month})`)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (prevPeriod) {
      const { data: prevGoals } = await admin
        .from('goals')
        .select('vendor_id, vendor_name, store, meta1, meta2, meta3, bonus1, bonus2, bonus3, commission_pct')
        .eq('period_id', prevPeriod.id)
        .eq('tenant_id', tenantId)

      if (prevGoals && prevGoals.length > 0) {
        await admin.from('goals').insert(
          prevGoals.map(g => ({ ...g, period_id: created!.id, tenant_id: tenantId }))
        )
      }
    }
  }

  return NextResponse.json({ id: created!.id, label: created!.label, created: true })
}
