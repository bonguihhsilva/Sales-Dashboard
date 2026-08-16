'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { fmtCurrency } from '@/lib/utils'
import type { VendorSummary } from '@/types'

interface Aviso {
  id: string
  titulo: string
  mensagem: string
  createdAt: string
  autorNome: string
}

function fmtAvisoDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ', ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function MuralClient({
  summaries,
  stores,
  showValues,
  topStudents = [],
  avisos = [],
  canPost = false,
  tenantId = '',
}: {
  summaries: VendorSummary[],
  stores: { key: string, label: string }[],
  showValues: boolean,
  topStudents?: { nome: string; xp: number; nivel: number }[],
  avisos?: Aviso[],
  canPost?: boolean,
  tenantId?: string,
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [saving, setSaving] = useState(false)

  async function handlePublicar() {
    if (!titulo.trim() || !mensagem.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('avisos').insert({
        tenant_id: tenantId,
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
        autor_id: user?.id ?? null,
      })
      if (error) throw error
      toast.success('Aviso publicado')
      setTitulo(''); setMensagem(''); setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error('Erro ao publicar aviso', { description: err instanceof Error ? err.message : undefined })
    }
    setSaving(false)
  }

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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2" style={{ fontFamily: 'var(--font-hanken), sans-serif' }}>
              <span style={{ fontSize: '1.2rem' }}>📣</span>
              Mural de Recados
            </h2>
            {canPost && (
              <button
                onClick={() => setOpen(true)}
                className="bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Novo Aviso
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {avisos.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '8px 0' }}>
                Nenhum aviso publicado ainda.
              </div>
            ) : (
              avisos.map(aviso => (
                <div key={aviso.id} className="bg-surface-container-high/50 p-4 rounded-xl border border-white/5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-jetbrains), monospace', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{aviso.autorNome}</span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-jetbrains), monospace', color: 'var(--muted)' }}>{fmtAvisoDate(aviso.createdAt)}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '4px' }}>{aviso.titulo}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {aviso.mensagem}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 text-on-surface">Novo Aviso</h2>

              <label className="block text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wider mb-2">Título</label>
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                maxLength={60}
                placeholder="Ex: Nova política de comissão"
                className="bg-surface-container border border-white/5 rounded-xl text-sm text-on-surface px-3 py-2 w-full mb-4"
              />

              <label className="block text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wider mb-2">Mensagem</label>
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Escreva o recado..."
                className="bg-surface-container border border-white/5 rounded-xl text-sm text-on-surface px-3 py-2 w-full mb-6 resize-none"
              />

              <div className="flex gap-3">
                <button onClick={() => setOpen(false)} className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 rounded-xl text-muted-foreground font-bold text-sm py-2.5 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handlePublicar}
                  disabled={!titulo.trim() || !mensagem.trim() || saving}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm rounded-xl py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ranking de Canais */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-hanken), sans-serif' }}>
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
                  <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 800, color: '#2563eb' }}>{fmtCurrency(store.total)}</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-jetbrains), monospace' }}>Confidencial</span>
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
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-hanken), sans-serif' }}>
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
                  <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-jetbrains), monospace', color: 'var(--muted)', marginTop: '2px' }}>
                    {showValues ? fmtCurrency(Number(seller.total_sold)) : 'Posição de Destaque'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aniversariantes */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-hanken), sans-serif' }}>
            <span style={{ fontSize: '1.2rem' }}>🎂</span>
            Aniversariantes
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '8px 0' }}>
            Em breve — cadastro de datas de aniversário ainda não disponível.
          </div>
        </div>

        {/* Top 3 Alunos (Treinamentos) */}
        <div className="glass-card rounded-2xl p-card-padding border border-white/5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-hanken), sans-serif' }}>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            Top 3 Alunos (LMS)
          </h2>
          <div className="flex flex-col gap-4">
            {topStudents.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '8px 0' }}>
                Sem progresso de treinamento registrado ainda.
              </div>
            ) : (
              topStudents.map((aluno, i) => (
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
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-jetbrains), monospace', color: 'var(--muted)', marginTop: '2px' }}>
                      Nível <span style={{ color: '#2563eb', fontWeight: 700 }}>{aluno.nivel}</span> · {aluno.xp} XP
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
