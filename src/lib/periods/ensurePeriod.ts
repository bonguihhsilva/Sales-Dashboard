import type { SupabaseClient } from '@supabase/supabase-js'

export async function ensurePeriodForDate(
  admin: SupabaseClient,
  tenantId: string,
  saleDate: Date
): Promise<number> {
  const year = saleDate.getUTCFullYear()
  const month = saleDate.getUTCMonth() + 1

  const { data: existing } = await admin
    .from('periods')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  if (existing) return existing.id as number

  const label = `${year}-${String(month).padStart(2, '0')}`
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10)

  const { data: created, error } = await admin
    .from('periods')
    .insert({ year, month, label, start_date: startDate, end_date: endDate, tenant_id: tenantId })
    .select('id')
    .single()

  if (error) throw error

  const periodId = created!.id as number

  const { error: rpcError } = await admin.rpc('calculate_vendor_goals', {
    p_period_id: periodId,
    p_tenant_id: tenantId,
  })
  if (rpcError) console.error('calculate_vendor_goals error:', rpcError)

  const { count: goalsCreated } = await admin
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('period_id', periodId)
    .eq('tenant_id', tenantId)

  // Fallback: copia metas do periodo anterior DO MESMO TENANT se o RPC nao criou nenhuma
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
          prevGoals.map(g => ({ ...g, period_id: periodId, tenant_id: tenantId }))
        )
      }
    }
  }

  return periodId
}
