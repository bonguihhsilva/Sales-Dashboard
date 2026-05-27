import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const role = user.app_metadata?.role as string | undefined
  if (role !== 'adm' && role !== 'gerente') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { titulo, descricao, xp_reward, trilha_id } = await req.json()

  // Buscar a maior ordem para adicionar no final
  const { data: maxOrdemData } = await supabase
    .from('modulos')
    .select('ordem')
    .eq('trilha_id', trilha_id)
    .order('ordem', { ascending: false })
    .limit(1)
    
  const ordem = maxOrdemData && maxOrdemData.length > 0 ? maxOrdemData[0].ordem + 1 : 1

  const { data, error } = await supabase
    .from('modulos')
    .insert({ titulo, descricao, xp_reward, trilha_id, ordem })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
