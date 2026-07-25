import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body: {
    type: 'medical_certificate' | 'appointment' | 'document' | 'day_off' | 'vacation'
    requested_date: string
    end_date?: string
    notes?: string
  } = await req.json()

  if (!body.type || !body.requested_date) {
    return NextResponse.json({ error: 'type e requested_date são obrigatórios' }, { status: 400 })
  }

  if (body.type === 'vacation') {
    if (!body.end_date) {
      return NextResponse.json({ error: 'end_date é obrigatório para férias' }, { status: 400 })
    }
    if (body.end_date < body.requested_date) {
      return NextResponse.json({ error: 'end_date não pode ser anterior a requested_date' }, { status: 400 })
    }
  }

  const { data: permission, error } = await supabase
    .from('hr_permissions')
    .insert({
      user_id: user.id,
      type: body.type,
      requested_date: body.requested_date,
      end_date: body.type === 'vacation' ? body.end_date : null,
      notes: body.notes ?? null,
      status: 'pending',
      requested_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(permission, { status: 201 })
}
