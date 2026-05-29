export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Usa JWT app_metadata — mesma fonte que o middleware (D-04)
  const role = (user.app_metadata?.role as string | undefined) ?? 'vendedor'

  if (role === 'vendedor') redirect('/vendedor/meu-resultado')
  redirect('/dashboard')
}
