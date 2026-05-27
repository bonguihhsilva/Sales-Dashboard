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

  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  const { data: profile } = await caller
    .from('profiles').select('role').eq('id', user.id).single()
  
  const effectiveRole = profile?.role || jwtRole
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params
  const { aprovado } = await req.json()

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
