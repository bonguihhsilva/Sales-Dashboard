import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const adminDb = createAdminClient()

  const targetEmail = 'guisilvafoz@gmail.com'

  // Fetch the user by email
  const { data: { users }, error: listError } = await adminDb.auth.admin.listUsers()
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  const user = users.find(u => u.email === targetEmail)
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado: ' + targetEmail }, { status: 404 })
  }

  // Update JWT Role
  const { error: updateAuthError } = await adminDb.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'super_admin' }
  })

  if (updateAuthError) return NextResponse.json({ error: updateAuthError.message }, { status: 500 })

  // Update Profiles table
  const { error: updateProfileError } = await adminDb.from('profiles').update({ role: 'super_admin' }).eq('id', user.id)
  
  if (updateProfileError) return NextResponse.json({ error: updateProfileError.message }, { status: 500 })

  return NextResponse.json({ success: true, message: 'Usuário ' + targetEmail + ' promovido a super_admin com sucesso!' })
}
