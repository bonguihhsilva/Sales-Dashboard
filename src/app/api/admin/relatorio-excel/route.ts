import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  // Auth check
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { data: profile } = await caller.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const periodId = searchParams.get('period') ?? '1'

  const admin = createAdminClient()

  // Fetch vendor summary with goals — only registered vendors
  const { data: summary } = await admin
    .from('vendor_summary')
    .select('vendor_id, vendor_name, store, total_sold, meta1, meta2, meta3, bonus1, bonus2, bonus3, bonus_earned, commission_pct')
    .eq('period_id', parseInt(periodId))
    .order('total_sold', { ascending: false })

  const { data: period } = await admin
    .from('periods')
    .select('label')
    .eq('id', parseInt(periodId))
    .single()

  // Filter only registered vendors (have goals)
  const { data: goalVendors } = await admin
    .from('goals')
    .select('vendor_id')
    .eq('period_id', parseInt(periodId))
  const goalIds = new Set((goalVendors ?? []).map(g => g.vendor_id))
  const vendors = (summary ?? []).filter(v => goalIds.has(v.vendor_id))

  // Build CSV (we'll convert to Excel on client side)
  // Actually return JSON and let client generate Excel
  return NextResponse.json({
    period: period?.label ?? `Período ${periodId}`,
    vendors: vendors.map(v => {
      const sold         = Number(v.total_sold) || 0
      const commPct      = Number(v.commission_pct) || 0.003
      const commission   = sold * commPct
      const bonus        = Number(v.bonus_earned) || 0
      const totalEarning = commission + bonus
      const m1 = Number(v.meta1) || 0
      const m2 = Number(v.meta2) || 0
      const m3 = Number(v.meta3) || 0
      const level = sold >= m3 ? 3 : sold >= m2 ? 2 : sold >= m1 ? 1 : 0
      return {
        nome:         v.vendor_name,
        loja:         v.store,
        total_vendido: sold,
        comissao_pct: commPct,
        comissao:     commission,
        meta_atingida: level === 0 ? 'Abaixo da 1ª meta' : `${level}ª meta`,
        bonus:        bonus,
        total_ganhos: totalEarning,
      }
    }),
  })
}
