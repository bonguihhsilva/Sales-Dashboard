import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, tenant_id').eq('id', user.id).single()

  if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const periodId = searchParams.get('period_id') || searchParams.get('periodo_id')

  const admin = createAdminClient()

  if (periodId) {
    // Listar comissões calculadas por período (2-B)
    const { data, error } = await admin
      .from('comissoes_calculadas')
      .select('*, profiles!vendedor_id(name)')
      .eq('periodo_id', parseInt(periodId))
      .eq('tenant_id', profile.tenant_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } else {
    // Listar regras de comissão (2-A)
    const { data, error } = await admin
      .from('regras_comissao')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('prioridade', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, tenant_id').eq('id', user.id).single()

  if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const {
    loja,
    commission_pct,
    meta1, bonus1,
    meta2, bonus2,
    meta3, bonus3,
    tipo_calculo
  } = await req.json()

  if (!loja) {
    return NextResponse.json({ error: 'Loja é obrigatória' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Procura se já existe uma regra para esta loja
  const { data: existingRegra } = await admin
    .from('regras_comissao')
    .select('id')
    .eq('tenant_id', profile.tenant_id)
    .eq('condicoes->>loja', loja)
    .maybeSingle()

  const payload = {
    tenant_id: profile.tenant_id,
    nome: `Regra de Comissão - ${loja}`,
    descricao: `Regra automática para a loja ${loja}`,
    ativo: true,
    prioridade: 1,
    condicoes: { loja },
    acao: {
      commission_pct: Number(commission_pct),
      meta1: Number(meta1),
      bonus1: Number(bonus1),
      meta2: Number(meta2),
      bonus2: Number(bonus2),
      meta3: Number(meta3),
      bonus3: Number(bonus3),
      tipo_calculo: tipo_calculo || 'auto'
    },
    criado_por: user.id
  }

  let error
  let result

  if (existingRegra) {
    const { data, error: updateError } = await admin
      .from('regras_comissao')
      .update(payload)
      .eq('id', existingRegra.id)
      .select()
      .single()
    error = updateError
    result = data
  } else {
    const { data, error: insertError } = await admin
      .from('regras_comissao')
      .insert(payload)
      .select()
      .single()
    error = insertError
    result = data
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data: result })
}
