import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await createClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await caller
    .from('profiles').select('role, tenant_id').eq('id', user.id).single()
  
  if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params
  const { aprovado } = await req.json()

  // Validar se a comissão pertence ao tenant do administrador logado
  const { data: comissao } = await caller
    .from('comissoes_calculadas')
    .select('tenant_id')
    .eq('id', id)
    .single()

  if (!comissao || comissao.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Comissão não pertence à sua organização' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('comissoes_calculadas')
    .update({
      aprovado: Boolean(aprovado),
      aprovado_por: aprovado ? user.id : null,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

