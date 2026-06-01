import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const role = user.app_metadata?.role as string | undefined
  if (!['adm', 'gerente', 'super_admin'].includes(role || '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { titulo, conteudo, video_url, modulo_id } = await req.json()

  const adminDb = createAdminClient()

  // Buscar a maior ordem
  const { data: maxOrdemData } = await adminDb
    .from('licoes')
    .select('ordem')
    .eq('modulo_id', modulo_id)
    .order('ordem', { ascending: false })
    .limit(1)
    
  const ordem = maxOrdemData && maxOrdemData.length > 0 ? maxOrdemData[0].ordem + 1 : 1

  const { data, error } = await adminDb
    .from('licoes')
    .insert({ titulo, conteudo, video_url, modulo_id, ordem })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
