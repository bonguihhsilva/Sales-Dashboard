import { createClient } from '@/lib/supabase/server'
import { SectionTitle } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function VendedorRegrasPage() {
  const supabase = await createClient()

  const { data: dbRegras } = await supabase
    .from('regras_comissao')
    .select('*')
    .eq('ativo', true)
    .order('prioridade', { ascending: true })

  const regras = dbRegras?.length ? dbRegras : [
    {
      id: '1',
      nome: 'Comissão Base sobre Vendas',
      descricao: 'Percentual aplicado sobre o total bruto vendido no período, calculado ao final do mês.',
      acao: { tipo: 'comissao_percentual', valor: 3.5 },
      prioridade: 1,
    },
    {
      id: '2',
      nome: 'Bônus 1ª Meta',
      descricao: 'Bônus fixo concedido ao atingir a primeira meta do mês. Acumulável com a comissão base.',
      acao: { tipo: 'bonus_fixo', valor: 300 },
      prioridade: 2,
    },
    {
      id: '3',
      nome: 'Bônus 2ª Meta',
      descricao: 'Bônus adicional ao superar a segunda meta. Substitui o bônus da 1ª meta.',
      acao: { tipo: 'bonus_fixo', valor: 600 },
      prioridade: 3,
    },
    {
      id: '4',
      nome: 'Bônus 3ª Meta (Super Meta)',
      descricao: 'Bônus máximo ao atingir a terceira meta do período. Exige consistência de alto desempenho.',
      acao: { tipo: 'bonus_fixo', valor: 1000 },
      prioridade: 4,
    },
  ]

  const ICONS: Record<string, string> = {
    comissao_percentual: '📈',
    bonus_fixo: '🏆',
  }

  const COLORS: Record<string, { bg: string; text: string; border: string }> = {
    comissao_percentual: { bg: '#2563eb22', text: '#2563eb', border: 'rgba(37,99,235,0.3)' },
    bonus_fixo: { bg: '#f5a74222', text: '#f5a742', border: 'rgba(245,167,66,0.3)' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 2.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', background: '#2563eb', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>GDS - REGRAS</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Regras de Comissão</h1>
          <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '6px' }}>
            Entenda como suas comissões e bônus são calculados neste mês.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(regras as any[]).map((regra, i) => {
            const tipo = regra.acao?.tipo || 'bonus_fixo'
            const col = COLORS[tipo] || COLORS['bonus_fixo']
            const icon = ICONS[tipo] || '⭐'
            const valorFormatado = tipo === 'comissao_percentual'
              ? `${regra.acao.valor}% sobre vendas`
              : `R$ ${Number(regra.acao?.valor || 0).toLocaleString('pt-BR')} de bônus`

            return (
              <div key={regra.id} style={{
                background: 'var(--surface)',
                border: `1px solid ${col.border}`,
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
              }}>
                {/* Ícone + número */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '44px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: col.bg, border: `1px solid ${col.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    #{i + 1}
                  </span>
                </div>

                {/* Conteúdo */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{regra.nome}</h3>
                    <span style={{
                      background: col.bg, color: col.text, border: `1px solid ${col.border}`,
                      padding: '4px 12px', borderRadius: '20px',
                      fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', fontWeight: 700,
                    }}>
                      {valorFormatado}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                    {regra.descricao || 'Sem descrição'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nota de rodapé */}
        <div style={{
          marginTop: '2rem', padding: '1rem 1.5rem', borderRadius: '10px',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', lineHeight: 1.6,
        }}>
          ℹ️ As regras acima são definidas pela gestão e podem variar conforme o período. Em caso de dúvidas, consulte seu gerente.
        </div>

      </div>
    </div>
  )
}
