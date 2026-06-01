import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { strictRateLimiter } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // Rate limiter
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  const caller = await createClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  const { data: profile } = await caller
    .from('profiles').select('role, tenant_id').eq('id', user.id).single()
  
  const effectiveRole = profile?.role || jwtRole
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Perfil sem tenant' }, { status: 400 })
  }

  const { period_id } = await req.json()
  if (!period_id) return NextResponse.json({ error: 'period_id obrigatório' }, { status: 400 })

  // Validar se o período pertence ao tenant do administrador logado
  const { data: period } = await caller
    .from('periods')
    .select('tenant_id')
    .eq('id', period_id)
    .single()

  if (!period || period.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Período não pertence à sua organização' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: summaries } = await admin
    .from('vendor_summary')
    .select('*')
    .eq('period_id', period_id)
    .eq('tenant_id', profile.tenant_id)

  if (!summaries?.length) {
    return NextResponse.json({ error: 'Sem dados para o período' }, { status: 404 })
  }

  // vendor_summary.vendor_id is text; comissoes_calculadas.vendedor_id is uuid → profiles.id
  const vendorIds = summaries.map(s => s.vendor_id as string)
  const { data: vendorProfiles } = await admin
    .from('profiles')
    .select('id, vendor_id')
    .eq('tenant_id', profile.tenant_id)
    .in('vendor_id', vendorIds)

  const vendorToProfileId = new Map(
    (vendorProfiles ?? []).map(p => [p.vendor_id as string, p.id as string])
  )

  // Buscar comissões já calculadas aprovadas neste período e tenant para preservar seu status de aprovação
  const { data: existingCommissions } = await admin
    .from('comissoes_calculadas')
    .select('vendedor_id, aprovado, aprovado_por')
    .eq('periodo_id', period_id)
    .eq('tenant_id', profile.tenant_id)
    .eq('aprovado', true)

  const approvedMap = new Map<string, { aprovado: boolean; aprovado_por: string | null }>(
    (existingCommissions ?? []).map(c => [c.vendedor_id, { aprovado: c.aprovado, aprovado_por: c.aprovado_por }])
  )

  const rows = summaries
    .filter(s => vendorToProfileId.has(s.vendor_id as string))
    .map(s => {
      const vendedor_id = vendorToProfileId.get(s.vendor_id as string)!
      const prevApproval = approvedMap.get(vendedor_id)

      // Aritmética precisa baseada em centavos (arredondamento matemático exato)
      const totalSoldCents = Math.round(Number(s.total_sold) * 100)
      const commissionPct = Number(s.commission_pct)
      const comissaoBaseCents = Math.round(totalSoldCents * commissionPct)
      const bonusCents = Math.round(Number(s.bonus_earned) * 100)
      const totalCents = comissaoBaseCents + bonusCents

      const comissao_base = comissaoBaseCents / 100
      const bonus_total = bonusCents / 100
      const total = totalCents / 100

      return {
        tenant_id: profile.tenant_id,
        vendedor_id,
        periodo_id: period_id,
        comissao_base,
        bonus_total,
        total,
        detalhamento: {
          total_sold: Math.round(Number(s.total_sold) * 100) / 100,
          commission_pct: Number(s.commission_pct),
          meta_level: s.meta_level,
          meta1: Math.round(Number(s.meta1) * 100) / 100,
          meta2: Math.round(Number(s.meta2) * 100) / 100,
          meta3: Math.round(Number(s.meta3) * 100) / 100,
          bonus1: Math.round(Number(s.bonus1) * 100) / 100,
          bonus2: Math.round(Number(s.bonus2) * 100) / 100,
          bonus3: Math.round(Number(s.bonus3) * 100) / 100,
        },
        calculado_em: new Date().toISOString(),
        aprovado: prevApproval ? prevApproval.aprovado : false,
        aprovado_por: prevApproval ? prevApproval.aprovado_por : null,
      }
    })

  if (!rows.length) {
    return NextResponse.json({ error: 'Nenhum vendedor com conta cadastrada' }, { status: 400 })
  }

  const { error } = await admin
    .from('comissoes_calculadas')
    .upsert(rows, { onConflict: 'tenant_id,vendedor_id,periodo_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, count: rows.length })
}
