import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  const role = profile?.role
  if (!['adm', 'gerente', 'super_admin'].includes(role || '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 400 })
  }

  const { titulo, descricao, ativo } = await req.json()

  const adminDb = createAdminClient()

  // Buscar a maior ordem para adicionar no final
  const { data: maxOrdemData } = await adminDb
    .from('trilhas')
    .select('ordem')
    .eq('tenant_id', profile.tenant_id)
    .order('ordem', { ascending: false })
    .limit(1)
    
  const ordem = maxOrdemData && maxOrdemData.length > 0 ? maxOrdemData[0].ordem + 1 : 1

  const { data, error } = await adminDb
    .from('trilhas')
    .insert({ titulo, descricao, ativo, ordem, tenant_id: profile.tenant_id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
