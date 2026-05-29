'use client'

import { fmtCurrency } from '@/lib/utils'
import type { VendorSummary } from '@/types'

export default function MuralClient({ 
  summaries, 
  stores,
  showValues,
}: { 
  summaries: VendorSummary[], 
  stores: { key: string, label: string }[],
  showValues: boolean,
}) {
  const topSellers = [...summaries].sort((a, b) => Number(b.total_sold) - Number(a.total_sold)).slice(0, 3)

  const storeRanking = stores.map(store => {
    const total = summaries.filter(s => s.store === store.key).reduce((sum, s) => sum + Number(s.total_sold), 0)
    return { ...store, total }
  }).sort((a, b) => b.total - a.total)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Coluna Principal - Avisos */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-card-padding border border-white/5 relative overflow-hidden" style={{ minHeight: '320px' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563eb]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span style={{ fontSize: '1.2rem' }}>📣</span>
            Mural de Recados
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-high/50 p-4 rounded-xl border border-white/5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Importante</span>
                <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>Hoje, 09:00</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5 }}>
                A nova política de bônus por canal já está em vigor. Verifiquem a aba de Regras de Comissão para entender os novos tetos.
              </p>
            </div>
            
            <div className="bg-surface-container-high/50 p-4 rounded-xl border border-white/5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: '#f5a742', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>RH</span>
                <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>Ontem, 14:30</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5 }}>
                Lembramos que o prazo para solicitar férias para o próximo trimestre encerra nesta sexta-feira.
              </p>
            </div>
          </div>
        </div>

        {/* Ranking de Canais */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span style={{ fontSize: '1.2rem' }}>🏪</span>
            Ranking de Canais (Mês Atual)
          </h2>
          <div className="flex flex-col gap-3">
            {storeRanking.map((store, i) => (
              <div key={store.key} className="flex items-center justify-between p-3 rounded-xl border border-white/5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800,
                    background: i === 0 ? '#eab30822' : 'var(--border)',
                    color: i === 0 ? '#eab308' : 'var(--muted)'
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{store.label}</span>
                </div>
                {showValues ? (
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 800, color: '#2563eb' }}>{fmtCurrency(store.total)}</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>Confidencial</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna Lateral */}
      <div className="flex flex-col gap-6">
        
        {/* Top 3 Vendas */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            Top 3 Vendas
          </h2>
          <div className="flex flex-col gap-4">
            {topSellers.map((seller, i) => (
              <div key={seller.vendor_id} className="flex items-center gap-4">
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800,
                  border: '1px solid',
                  background: i === 0 ? '#eab30811' : i === 1 ? '#94a3b811' : '#d9770611',
                  borderColor: i === 0 ? '#eab30844' : i === 1 ? '#94a3b844' : '#d9770644',
                  color: i === 0 ? '#eab308' : i === 1 ? '#94a3b8' : '#d97706'
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{seller.vendor_name}</div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '2px' }}>
                    {showValues ? fmtCurrency(Number(seller.total_sold)) : 'Posição de Destaque'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aniversariantes */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span style={{ fontSize: '1.2rem' }}>🎂</span>
            Aniversariantes
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ec489922', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>12</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Maria Oliveira</div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paje 1</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ec489922', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>28</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>João Silva</div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jebai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Alunos (Treinamentos) */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            Top 3 Alunos (LMS)
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { nome: 'Carlos Mendes', media: '9.8', aulas: 42 },
              { nome: 'Ana Beatriz', media: '9.5', aulas: 38 },
              { nome: 'Roberto Alves', media: '9.2', aulas: 31 }
            ].map((aluno, i) => (
              <div key={i} className="flex items-center gap-3">
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800,
                  border: '1px solid',
                  background: i === 0 ? '#2563eb11' : i === 1 ? '#94a3b811' : '#d9770611',
                  borderColor: i === 0 ? '#2563eb44' : i === 1 ? '#94a3b844' : '#d9770644',
                  color: i === 0 ? '#2563eb' : i === 1 ? '#94a3b8' : '#d97706'
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{aluno.nome}</div>
                  <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '2px' }}>
                    Média <span style={{ color: '#2563eb', fontWeight: 700 }}>{aluno.media}</span> · {aluno.aulas} aulas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
