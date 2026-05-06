import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const [
      { data: freeDays, error: freeDaysError },
      { data: absences, error: absencesError },
      { data: vacations, error: vacationsError },
      { data: permissions, error: permissionsError },
    ] = await Promise.all([
      supabase
        .from('hr_free_days')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('hr_absences')
        .select('*')
        .eq('user_id', user.id)
        .order('absence_date', { ascending: false }),
      supabase
        .from('hr_vacations')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false }),
      supabase
        .from('hr_permissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    if (freeDaysError) throw freeDaysError
    if (absencesError) throw absencesError
    if (vacationsError) throw vacationsError
    if (permissionsError) throw permissionsError

    return NextResponse.json({
      freeDays: freeDays ?? [],
      absences: absences ?? [],
      vacations: vacations ?? [],
      permissions: permissions ?? [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar dados de RH'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
