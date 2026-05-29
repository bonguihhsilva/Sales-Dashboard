import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { justification, status } = await request.json()
    const supabase = await createClient()

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
  if (!userId) redirect('/login')
    
    // Vendor can only update their own delays, and only to 'justified' status
    if (status !== 'justified') {
      return NextResponse.json({ error: 'Operação não permitida' }, { status: 403 })
    }

    const { error } = await supabase
      .from('hr_delays')
      .update({ justification, status })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
