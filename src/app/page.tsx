export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, vendor_id')
    .eq('id', user.id)
    .single()

  // ADM → dashboard
  if (profile?.role === 'adm') redirect('/dashboard')
  
  // Vendedor → meu-resultado
  redirect('/meu-resultado')
}
