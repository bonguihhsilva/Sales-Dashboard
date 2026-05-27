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

  const { pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, explicacao, modulo_id } = await req.json()

  const { data, error } = await supabase
    .from('quiz_questoes')
    .insert({ pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, explicacao, modulo_id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
