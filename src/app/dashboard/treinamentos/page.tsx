import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SectionTitle } from '@/components/ui'
import TrilhasClient from './TrilhasClient'

export const dynamic = 'force-dynamic'

export default async function TreinamentosAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
    if (jwtRole === 'vendedor') redirect('/treinamentos')
  }

  // Buscar trilhas
  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('*')
    .order('ordem', { ascending: true })

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
            Gestão de Treinamentos (LMS)
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Gerencie as trilhas, módulos e aulas do Sales Learning Center.
          </p>
        </div>
      </div>

      <div className="flex-1">
        <TrilhasClient initialTrilhas={trilhas || []} />
      </div>
    </div>
  )
}
