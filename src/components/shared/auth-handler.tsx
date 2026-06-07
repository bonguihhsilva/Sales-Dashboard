'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Escuta eventos de sessão do browser client.
// SIGNED_OUT: token expirou ou foi revogado — redireciona para login.
// TOKEN_REFRESHED: browser client rotacionou o token com sucesso — força
// re-render dos server components para que peguem a nova sessão.
export function AuthStateHandler() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
      if (event === 'TOKEN_REFRESHED') {
        router.refresh()
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return null
}
