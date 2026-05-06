import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body: {
    type: 'medical_certificate' | 'appointment' | 'document'
    requested_date: string
    notes?: string
  } = await req.json()

  if (!body.type || !body.requested_date) {
    return NextResponse.json({ error: 'type e requested_date são obrigatórios' }, { status: 400 })
  }

  const { data: permission, error } = await supabase
    .from('hr_permissions')
    .insert({
      user_id: user.id,
      type: body.type,
      requested_date: body.requested_date,
      notes: body.notes ?? null,
      status: 'pending',
      requested_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(permission, { status: 201 })
}
