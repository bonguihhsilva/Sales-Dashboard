import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { strictRateLimiter, enforceUserRateLimit, getClientIp } from '@/lib/ratelimit'
import { evaluateRules, type RegraComissao } from '@/lib/commission-rules'
import { filterUnapproved } from '@/lib/commission-approval'
import {
  montarVendorMetrics,
  agruparMarcasPorVendedor,
  agruparMetasPorVendedor,
  agruparReativadosPorVendedor,
  type BrandRow,
} from '@/lib/commission-metrics'

export async function POST(req: NextRequest) {
  // Rate limiter — layer 1: por IP (real, extraido de x-forwarded-for), pre-auth,
  // fail-open. Unica barreira contra flood nao autenticado.
  const ip = getClientIp(req)
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  const caller = await createClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Rate limiter — layer 2: por user.id, pos-auth, fail-closed. Nao forjavel
  // por header e nao se desliga sozinho sob falha de DB.
  const rateLimited = await enforceUserRateLimit(user.id)
  if (rateLimited) return rateLimited

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
  const tenantId = profile.tenant_id

  const { data: summaries } = await admin
    .from('vendor_summary')
    .select('*')
    .eq('period_id', period_id)
    .eq('tenant_id', tenantId)

  if (!summaries?.length) {
    return NextResponse.json({ error: 'Sem dados para o período' }, { status: 404 })
  }

  // vendor_summary.vendor_id is text; comissoes_calculadas.vendedor_id is uuid → profiles.id
  const vendorIds = summaries.map(s => s.vendor_id as string)
  const { data: vendorProfiles } = await admin
    .from('profiles')
    .select('id, vendor_id')
    .eq('tenant_id', tenantId)
    .in('vendor_id', vendorIds)

  const vendorToProfileId = new Map(
    (vendorProfiles ?? []).map(p => [p.vendor_id as string, p.id as string])
  )

  // Buscar comissões já calculadas aprovadas neste período e tenant para preservar seu status de aprovação
  const { data: existingCommissions } = await admin
    .from('comissoes_calculadas')
    .select('vendedor_id, aprovado, aprovado_por')
    .eq('periodo_id', period_id)
    .eq('tenant_id', tenantId)
    .eq('aprovado', true)

  const approvedMap = new Map<string, { aprovado: boolean; aprovado_por: string | null }>(
    (existingCommissions ?? []).map(c => [c.vendedor_id, { aprovado: c.aprovado, aprovado_por: c.aprovado_por }])
  )

  // Regras de comissão definidas pelos gerentes do tenant (fonte de verdade).
  // Sem regras ativas → fallback para goals.commission_pct (comportamento legado).
  const { data: regrasAtivas } = await admin
    .from('regras_comissao')
    .select('id, nome, prioridade, escopo, vendor_id, condicoes, acao')
    .eq('tenant_id', tenantId)
    .eq('ativo', true)
  const regras = (regrasAtivas ?? []) as RegraComissao[]

  // ── v0-2: métricas por marca + metas + reativação ──────────────────────────
  // vendor_brand_metrics: vendas por (vendor, marca)
  const { data: brandRows } = await admin
      .from('vendor_brand_metrics')
      .select('vendor_id, brand, valor_vendido')
      .eq('period_id', period_id)
      .eq('tenant_id', tenantId)
    const vendasPorMarcaPorVendedor = agruparMarcasPorVendedor((brandRows ?? []) as BrandRow[])

  // goals_brand: metas manuais por (vendor, marca)
  const { data: goalBrandRows } = await admin
    .from('goals_brand')
    .select('vendor_id, brand, meta_valor')
    .eq('period_id', period_id)
    .eq('tenant_id', tenantId)
  const metasPorMarcaPorVendedor = agruparMetasPorVendedor(goalBrandRows ?? [])

  // carteira_reativados: clientes que voltaram após 6 meses fechados
  const { data: reativados } = await admin.rpc('carteira_reativados', {
    p_period_id: period_id,
    p_tenant_id: tenantId,
  })
  const reativadosPorVendedor = agruparReativadosPorVendedor(reativados ?? [])

  const rows = summaries
    .filter(s => vendorToProfileId.has(s.vendor_id as string))
    .map(s => {
      const vendedor_id = vendorToProfileId.get(s.vendor_id as string)!
      const vendorId = s.vendor_id as string

      // Regras do gerente têm precedência sobre goals.commission_pct
      const metrics = montarVendorMetrics(
        {
          vendor_id: vendorId,
          total_sold: Number(s.total_sold),
          total_profit: Number(s.total_profit ?? 0),
          unique_clients: Number(s.unique_clients ?? 0),
        },
        vendasPorMarcaPorVendedor[vendorId] ?? {},
        metasPorMarcaPorVendedor[vendorId] ?? {},
        reativadosPorVendedor.get(vendorId) ?? new Set<string>(),
      )
      const ruleEval = evaluateRules(regras, metrics)

      // Aritmética precisa baseada em centavos (arredondamento matemático exato)
      const commissionType = (s.commission_type as string | undefined) ?? 'revenue'
      const isProfit = commissionType === 'profit'
      const baseValue = isProfit ? Number(s.total_profit ?? 0) : Number(s.total_sold)
      const baseCents = Math.round(baseValue * 100)

      // ── v0-2: comissão por marca (anti-duplicação) ──────────────────────────
      // Percentual geral incide sobre a base total MENOS as bases de marcas que
      // tiveram percentual próprio; percentuais próprios incidem sobre cada base
      // de marca. Em comissão profit, a base por marca é proporcional à receita
      // (total_profit × vendas_marca / total_sold) — simplificação documentada.
      const perMarcas = ruleEval.perMarcas ?? {}
      const marcasComPct = Object.keys(perMarcas).filter(m => metrics.vendas_por_marca?.[m] != null)
      let baseMarcasCents = 0
      let comissaoMarcasCents = 0
      for (const marca of marcasComPct) {
        let baseMarca = Number(metrics.vendas_por_marca?.[marca] ?? 0)
        if (isProfit && baseValue > 0) {
          baseMarca = baseMarca * (baseValue / Number(s.total_sold || baseValue))
        }
        const baseMarcaCents = Math.round(baseMarca * 100)
        baseMarcasCents += baseMarcaCents
        comissaoMarcasCents += Math.round(baseMarcaCents * (perMarcas[marca] ?? 0))
      }

      // Percentual geral sobre o restante
      const commissionPct = ruleEval.commissionPct ?? Number(s.commission_pct)
      const baseGeralCents = Math.max(0, baseCents - baseMarcasCents)
      const comissaoGeralCents = Math.round(baseGeralCents * commissionPct)
      const comissaoBaseCents = comissaoGeralCents + comissaoMarcasCents

      const bonusCents = Math.round(Number(s.bonus_earned) * 100)
        + Math.round(ruleEval.extraBonus * 100)
      const totalCents = comissaoBaseCents + bonusCents

      const comissao_base = comissaoBaseCents / 100
      const bonus_total = bonusCents / 100
      const total = totalCents / 100

      return {
        tenant_id: tenantId,
        vendedor_id,
        periodo_id: period_id,
        comissao_base,
        bonus_total,
        total,
        detalhamento: {
          total_sold: Math.round(Number(s.total_sold) * 100) / 100,
          total_profit: Math.round(Number(s.total_profit ?? 0) * 100) / 100,
          commission_type: commissionType,
          base_value: Math.round(baseValue * 100) / 100,
          commission_pct: commissionPct,
          commission_pct_source: ruleEval.commissionPct !== null ? 'regras_comissao' : 'goals',
          regras_aplicadas: ruleEval.appliedRules,
          bonus_regras: Math.round(ruleEval.extraBonus * 100) / 100,
          meta_level: s.meta_level,
          meta1: Math.round(Number(s.meta1) * 100) / 100,
          meta2: Math.round(Number(s.meta2) * 100) / 100,
          meta3: Math.round(Number(s.meta3) * 100) / 100,
          bonus1: Math.round(Number(s.bonus1) * 100) / 100,
          bonus2: Math.round(Number(s.bonus2) * 100) / 100,
          bonus3: Math.round(Number(s.bonus3) * 100) / 100,
          // v0-2: métricas de marca / carteira para auditoria
          vendas_por_marca: metrics.vendas_por_marca,
          metas_por_marca: metrics.metas_por_marca,
          clientes_ativos: metrics.clientes_ativos,
          clientes_reativados: metrics.clientes_reativados,
          perMarcas: Object.fromEntries(
            Object.entries(perMarcas).map(([m, pct]) => [m, Math.round(pct * 10000) / 100])
          ),
          comissao_por_marca: Object.fromEntries(
            marcasComPct.map(m => [m, comissaoMarcasCents / 100])
          ),
          base_por_marca: Object.fromEntries(
            marcasComPct.map(m => [m, Math.round((Number(metrics.vendas_por_marca?.[m] ?? 0)) * 100) / 100])
          ),
        },
        calculado_em: new Date().toISOString(),
        // Linhas cujo vendedor já está em approvedMap são removidas por
        // filterUnapproved antes do upsert (C-04) — toda linha que chega
        // até aqui é necessariamente não aprovada. Sempre false/null: se
        // uma comissão precisar ser reaprovada, isso deve ser um ato
        // deliberado de admin via /aprovar, nunca um carry-over do cálculo.
        aprovado: false,
        aprovado_por: null,
      }
    })

  if (!rows.length) {
    return NextResponse.json({ error: 'Nenhum vendedor com conta cadastrada' }, { status: 400 })
  }

  // Comissões já aprovadas são imutáveis (C-04) — nunca reenviadas ao upsert.
  // O trigger protect_approved_commission no banco é a garantia de último
  // recurso; este filtro é o caminho normal, silencioso, da rota.
  const rowsToUpsert = filterUnapproved(rows, approvedMap)
  const skipped_approved = rows.length - rowsToUpsert.length

  if (!rowsToUpsert.length) {
    return NextResponse.json({ success: true, count: 0, skipped_approved })
  }

  const { error } = await admin
    .from('comissoes_calculadas')
    .upsert(rowsToUpsert, { onConflict: 'tenant_id,vendedor_id,periodo_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, count: rowsToUpsert.length, skipped_approved })
}