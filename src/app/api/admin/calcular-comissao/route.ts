import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
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

  const admin = createAdminClient()

  const { data: summaries } = await admin
    .from('vendor_summary').select('*').eq('period_id', period_id)
  if (!summaries?.length) {
    return NextResponse.json({ error: 'Sem dados para o período' }, { status: 404 })
  }

  // vendor_summary.vendor_id is text; comissoes_calculadas.vendedor_id is uuid → profiles.id
  const vendorIds = summaries.map(s => s.vendor_id as string)
  const { data: vendorProfiles } = await admin
    .from('profiles').select('id, vendor_id').in('vendor_id', vendorIds)

  const vendorToProfileId = new Map(
    (vendorProfiles ?? []).map(p => [p.vendor_id as string, p.id as string])
  )

  const rows = summaries
    .filter(s => vendorToProfileId.has(s.vendor_id as string))
    .map(s => ({
      tenant_id: profile.tenant_id,
      vendedor_id: vendorToProfileId.get(s.vendor_id as string)!,
      periodo_id: period_id,
      comissao_base: Number(s.total_sold) * Number(s.commission_pct),
      bonus_total: Number(s.bonus_earned),
      total: Number(s.total_commission),
      detalhamento: {
        total_sold: Number(s.total_sold),
        commission_pct: Number(s.commission_pct),
        meta_level: s.meta_level,
        meta1: Number(s.meta1), meta2: Number(s.meta2), meta3: Number(s.meta3),
        bonus1: Number(s.bonus1), bonus2: Number(s.bonus2), bonus3: Number(s.bonus3),
      },
      calculado_em: new Date().toISOString(),
      aprovado: false,
      aprovado_por: null,
    }))

  if (!rows.length) {
    return NextResponse.json({ error: 'Nenhum vendedor com conta cadastrada' }, { status: 400 })
  }

  const { error } = await admin
    .from('comissoes_calculadas')
    .upsert(rows, { onConflict: 'tenant_id,vendedor_id,periodo_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, count: rows.length })
}
