import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensurePeriodForDate } from '@/lib/periods/ensurePeriod'

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  if (!profile?.tenant_id)
    return NextResponse.json({ error: 'Organização não associada ao usuário' }, { status: 400 })

  const tenantId = profile.tenant_id
  const { year, month } = await req.json()

  const admin = createAdminClient()

  // Period existente — escopo no tenant (periods é UNIQUE(tenant_id, year, month))
  const { data: existing } = await admin
    .from('periods')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  let periodId: number
  try {
    periodId = await ensurePeriodForDate(admin, tenantId, new Date(Date.UTC(year, month - 1, 1)))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao resolver período'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { data: period } = await admin
    .from('periods')
    .select('label')
    .eq('id', periodId)
    .single()

  return NextResponse.json({ id: periodId, label: period?.label, created: !existing })
}
