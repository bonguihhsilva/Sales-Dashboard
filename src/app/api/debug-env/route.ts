import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET() {
  // Auth check - only admins
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  return NextResponse.json({
    has_supabase_url:      !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_supabase_anon:     !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_service_role:      !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    service_key_preview:   process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 12) + '...' || 'MISSING',
    node_env:              process.env.NODE_ENV,
  })
}
