import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_MOEDAS = ['USD', 'BRL', 'PYG'] as const
const ALLOWED_LOCALES = ['es-PY', 'pt-BR', 'en-US'] as const

export async function GET() {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('tenants')
    .select('id, nome, slug, plano, cor_primaria, moeda_padrao, locale, commission_pct_default, criado_em')
    .eq('id', profile.tenant_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'super_admin'].includes(profile?.role || ''))
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const body = await req.json()
  const patch: Record<string, unknown> = {}

  if (body.cor_primaria) patch.cor_primaria = String(body.cor_primaria)
  if (body.moeda_padrao && ALLOWED_MOEDAS.includes(body.moeda_padrao))
    patch.moeda_padrao = body.moeda_padrao
  if (body.locale && ALLOWED_LOCALES.includes(body.locale))
    patch.locale = body.locale
  if (body.commission_pct_default !== undefined) {
    const pct = parseFloat(body.commission_pct_default)
    if (!isNaN(pct) && pct >= 0 && pct <= 1) patch.commission_pct_default = pct
  }

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('tenants').update(patch).eq('id', profile.tenant_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
