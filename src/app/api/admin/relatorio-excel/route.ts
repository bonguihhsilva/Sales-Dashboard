import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCommissionXlsx } from '@/lib/export-xlsx'
import { generateCommissionPdf } from '@/lib/export-pdf'
import type { VendorReport } from '@/lib/export-xlsx'

export async function GET(req: NextRequest) {
  // Auth check
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const periodId = searchParams.get('period') ?? '1'
  const format = (searchParams.get('format') ?? 'csv') as 'csv' | 'xlsx' | 'pdf'

  const admin = createAdminClient()

  // Fetch vendor summary with goals — only registered vendors
  let summaryQuery = admin
    .from('vendor_summary')
    .select('vendor_id, vendor_name, store, total_sold, meta1, meta2, meta3, bonus1, bonus2, bonus3, bonus_earned, commission_pct')
    .eq('period_id', parseInt(periodId))
    .order('total_sold', { ascending: false })

  if (profile.tenant_id) {
    summaryQuery = summaryQuery.eq('tenant_id', profile.tenant_id)
  }
  const { data: summary } = await summaryQuery

  const { data: period } = await admin
    .from('periods')
    .select('label, tenant_id')
    .eq('id', parseInt(periodId))
    .single()

  if (!period || (profile.tenant_id && period.tenant_id !== profile.tenant_id)) {
    return NextResponse.json({ error: 'Período inválido ou não pertencente à sua organização' }, { status: 403 })
  }

  // Filter only registered vendors (have goals)
  let goalQuery = admin
    .from('goals')
    .select('vendor_id')
    .eq('period_id', parseInt(periodId))

  if (profile.tenant_id) {
    goalQuery = goalQuery.eq('tenant_id', profile.tenant_id)
  }
  const { data: goalVendors } = await goalQuery
  const goalIds = new Set((goalVendors ?? []).map(g => g.vendor_id))
  const vendors = (summary ?? []).filter(v => goalIds.has(v.vendor_id))

  // Build CSV (we'll convert to Excel on client side)
  // Get comissoes_calculadas to use the source of truth if available
  let comissoesQuery = admin
    .from('comissoes_calculadas')
    .select('vendedor_id, comissao_base, bonus_total, total, aprovado')
    .eq('periodo_id', parseInt(periodId))

  if (profile.tenant_id) {
    comissoesQuery = comissoesQuery.eq('tenant_id', profile.tenant_id)
  }
  const { data: comissoesCalc } = await comissoesQuery

  const calcMap = new Map(comissoesCalc?.map(c => [c.vendedor_id, c]) || [])

  // Fetch profiles to map vendor_id (string) to id (uuid)
  let profilesQuery = admin
    .from('profiles')
    .select('id, vendor_id')

  if (profile.tenant_id) {
    profilesQuery = profilesQuery.eq('tenant_id', profile.tenant_id)
  }
  const { data: profiles } = await profilesQuery

  const profileMap = new Map(profiles?.map(p => [p.vendor_id, p.id]) || [])

  // Função para evitar CSV/Formula Injection
  const sanitizeCSV = (val: string | null | undefined): string => {
    if (!val) return ''
    const cleanVal = val.trim()
    const specialChars = ['=', '+', '-', '@', '\t', '\r', '\n']
    if (specialChars.some(char => cleanVal.startsWith(char))) {
      return `'${cleanVal}`
    }
    return cleanVal
  }

  const vendorRows = vendors.map(v => {
    const profileId = profileMap.get(v.vendor_id)
    const calc = profileId ? calcMap.get(profileId) : null

    const sold    = Number(v.total_sold) || 0
    const commPct = Number(v.commission_pct) || 0.003

    const m1 = Number(v.meta1) || 0
    const m2 = Number(v.meta2) || 0
    const m3 = Number(v.meta3) || 0
    const level = sold >= m3 ? 3 : sold >= m2 ? 2 : sold >= m1 ? 1 : 0

    const commission   = calc ? Number(calc.comissao_base) : Math.round(sold * commPct * 100) / 100
    const bonus        = calc ? Number(calc.bonus_total) : (Number(v.bonus_earned) || 0)
    const totalEarning = calc ? Number(calc.total) : Math.round((commission + bonus) * 100) / 100

    return {
      nome:             sanitizeCSV(v.vendor_name),
      loja:             sanitizeCSV(v.store),
      total_vendido:    sold,
      comissao_pct:     commPct,
      comissao:         commission,
      meta_atingida:    level === 0 ? 'Abaixo da 1ª meta' : `${level}ª meta`,
      bonus:            bonus,
      total_ganhos:     totalEarning,
      status_aprovacao: calc?.aprovado ? 'Aprovada' : (calc ? 'Pendente' : 'Prévia'),
    }
  })

  const periodLabel    = period?.label ?? `Período ${periodId}`
  const periodLabelSafe = periodLabel.toLowerCase().replace(/\s+/g, '-')

  const vendorReports: VendorReport[] = vendorRows

  if (format === 'xlsx') {
    const buffer = generateCommissionXlsx(vendorReports, periodLabel)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="comissoes-${periodLabelSafe}.xlsx"`,
      },
    })
  }

  if (format === 'pdf') {
    const buffer = await generateCommissionPdf(vendorReports, periodLabel)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="comissoes-${periodLabelSafe}.pdf"`,
      },
    })
  }

  // format === 'csv' — comportamento original (JSON para o ExportButton montar o CSV client-side)
  return NextResponse.json({
    period: periodLabel,
    vendors: vendorRows,
  })
}
