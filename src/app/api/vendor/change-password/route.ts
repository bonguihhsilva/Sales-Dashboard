import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { current_password, new_password } = await req.json()
  if (!new_password || new_password.length < 6) {
    return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
  }

  // Verify current password by trying to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  })
  if (signInError) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })

  // Update to new password
  const { error } = await supabase.auth.updateUser({ password: new_password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
