import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCatalogo } from '@/lib/lms/queries'
import { LMS as C } from '@/lib/lms/theme'
import { PageHeader } from '@/components/ui'
import { TrilhaCard } from './TrilhaCard'
import { CategoriaCard } from './CategoriaCard'
import { CATEGORIAS, resumoCategorias, trilhasDaCategoria } from './categorias'

export const dynamic = 'force-dynamic'

export default async function TreinamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const trilhas = await getCatalogo(user.id)

  const totalXP    = trilhas.reduce((acc, t) => acc + t.totalXp, 0)
  const concluidas = trilhas.filter(t => t.progressoPct === 100).length

  // Categoria selecionada e válida?
  const categoriaAtiva = cat && CATEGORIAS.some(c => c.nome === cat) ? cat : null

  const statActions = (
    <div style={{
      display: 'flex', gap: 20, alignItems: 'stretch',
      background: C.elevated, border: `1px solid ${C.borderStrong}`,
      borderRadius: '0.75rem', padding: '0.75rem 1.25rem',
    }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>XP disponível</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.amber, marginTop: 2 }}>{totalXP}</div>
      </div>
      <div style={{ width: '1px', background: C.border }} />
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concluídas</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: C.green, marginTop: 2 }}>{concluidas}/{trilhas.length}</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text, padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>

        {categoriaAtiva ? (
          <CategoriaView
            categoria={categoriaAtiva}
            trilhas={trilhasDaCategoria(trilhas, categoriaAtiva)}
            actions={statActions}
          />
        ) : (
          <CategoriasView
            resumos={resumoCategorias(trilhas)}
            totalTrilhas={trilhas.length}
            totalModulos={trilhas.reduce((acc, t) => acc + t.moduloCount, 0)}
            actions={statActions}
          />
        )}

      </div>
    </div>
  )
}

// ── Tela inicial: grade de categorias ─────────────────────────────
function CategoriasView({
  resumos,
  totalTrilhas,
  totalModulos,
  actions,
}: {
  resumos: ReturnType<typeof resumoCategorias>
  totalTrilhas: number
  totalModulos: number
  actions: React.ReactNode
}) {
  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <PageHeader
          title="Centro de Treinamentos"
          subtitle={`${totalTrilhas} trilhas · ${totalModulos} módulos`}
          actions={actions}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem',
      }}>
        {resumos.map(r => (
          <CategoriaCard key={r.nome} resumo={r} />
        ))}
      </div>
    </>
  )
}

// ── Tela de categoria: trilhas dela ───────────────────────────────
function CategoriaView({
  categoria,
  trilhas,
  actions,
}: {
  categoria: string
  trilhas: Awaited<ReturnType<typeof getCatalogo>>
  actions: React.ReactNode
}) {
  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          href="/vendedor/treinamentos"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
            color: C.muted, textDecoration: 'none',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}
        >
          ← Categorias
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <PageHeader
          title={categoria}
          subtitle={`${trilhas.length} trilha${trilhas.length === 1 ? '' : 's'}`}
          actions={actions}
        />
      </div>

      {trilhas.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          color: C.muted, fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
        }}>
          Nenhuma trilha nesta categoria ainda.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {trilhas.map(trilha => (
            <TrilhaCard key={trilha.id} trilha={trilha} />
          ))}
        </div>
      )}
    </>
  )
}
