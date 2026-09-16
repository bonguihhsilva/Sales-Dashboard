'use client'

import { useState, useTransition } from 'react'
import type { GoalBrand } from '@/types'
import { toast } from 'sonner'

interface VendorOption {
  id: string
  name: string | null
  vendor_id: string
  store?: string | null
}

interface Props {
  periodId: number
  vendors: VendorOption[]
  brands: string[]
  initialGoals: GoalBrand[]
  storeColors: Record<string, string>
}

const inputCls =
  'w-full bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm text-foreground px-3 py-2 outline-none font-mono transition-all'

export default function MetasMarcaTab({
  periodId,
  vendors,
  brands,
  initialGoals,
  storeColors,
}: Props) {
  const [goals, setGoals] = useState<GoalBrand[]>(initialGoals)
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Form modal: adicionar meta de marca
  const [showAddModal, setShowAddModal] = useState(false)
  const [selVendorId, setSelVendorId] = useState(vendors[0]?.vendor_id ?? '')
  const [selBrand, setSelBrand] = useState(brands[0] ?? '')
  const [customBrand, setCustomBrand] = useState('')
  const [inputMeta, setInputMeta] = useState('')
  const [inputBonus, setInputBonus] = useState('')

  // Edição
  const [editingGoal, setEditingGoal] = useState<GoalBrand | null>(null)
  const [editMeta, setEditMeta] = useState('')
  const [editBonus, setEditBonus] = useState('')

  const [isPending, startTransition] = useTransition()

  const periodGoals = goals.filter(g => g.period_id === periodId)

  // Filtros combinados
  const filteredGoals = periodGoals.filter(g => {
    if (vendorFilter !== 'all' && g.vendor_id !== vendorFilter) return false
    if (brandFilter !== 'all' && g.brand.toLowerCase() !== brandFilter.toLowerCase()) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const v = vendors.find(x => x.vendor_id === g.vendor_id)
      const vName = (v?.name || g.vendor_id).toLowerCase()
      const bName = g.brand.toLowerCase()
      if (!vName.includes(q) && !bName.includes(q)) return false
    }
    return true
  })

  const vendorMap = new Map(vendors.map(v => [v.vendor_id, v]))

  const distinctBrandsInGoals = Array.from(new Set(periodGoals.map(g => g.brand)))
  const totalMetaVolume = periodGoals.reduce((s, g) => s + Number(g.meta_valor || 0), 0)
  const uniqueVendorsCount = new Set(periodGoals.map(g => g.vendor_id)).size

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault()
    const targetBrand = (selBrand === '__custom__' ? customBrand : selBrand).trim()
    if (!targetBrand) {
      toast.error('Informe o nome da marca')
      return
    }
    const metaVal = parseFloat(inputMeta)
    if (isNaN(metaVal) || metaVal < 0) {
      toast.error('Meta de venda deve ser um número maior ou igual a zero')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/goals-brand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period_id: periodId,
            vendor_id: selVendorId,
            brand: targetBrand,
            meta_valor: metaVal,
            bonus: parseFloat(inputBonus || '0') || 0,
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Falha ao salvar meta de marca')

        // Atualiza estado local
        const saved = json.data as GoalBrand
        setGoals(prev => {
          const idx = prev.findIndex(
            g => g.period_id === saved.period_id && g.vendor_id === saved.vendor_id && g.brand.toLowerCase() === saved.brand.toLowerCase()
          )
          if (idx >= 0) {
            const copy = [...prev]
            copy[idx] = saved
            return copy
          }
          return [...prev, saved]
        })

        toast.success(`Meta de ${targetBrand} salva com sucesso!`)
        setShowAddModal(false)
        setInputMeta('')
        setInputBonus('')
        setCustomBrand('')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGoal) return
    const metaVal = parseFloat(editMeta)
    if (isNaN(metaVal) || metaVal < 0) {
      toast.error('Meta de venda inválida')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/goals-brand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period_id: editingGoal.period_id,
            vendor_id: editingGoal.vendor_id,
            brand: editingGoal.brand,
            meta_valor: metaVal,
            bonus: parseFloat(editBonus || '0') || 0,
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Falha ao atualizar')

        const saved = json.data as GoalBrand
        setGoals(prev => prev.map(g => (g.id === saved.id ? saved : g)))
        toast.success('Meta atualizada!')
        setEditingGoal(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar')
      }
    })
  }

  const handleDelete = (goal: GoalBrand) => {
    if (!confirm(`Excluir a meta da marca ${goal.brand} para este vendedor?`)) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/goals-brand?id=${goal.id}`, { method: 'DELETE' })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Falha ao excluir')

        setGoals(prev => prev.filter(g => g.id !== goal.id))
        toast.success('Meta de marca excluída.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Métricas Resumo ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col">
          <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">Metas Configuradas</span>
          <span className="text-2xl font-bold font-sans text-on-surface mt-1">{periodGoals.length}</span>
          <span className="text-xs text-muted-foreground mt-0.5">{distinctBrandsInGoals.length} marcas distintas</span>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col">
          <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">Volume Total de Metas</span>
          <span className="text-2xl font-bold font-mono text-primary mt-1">${totalMetaVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span className="text-xs text-muted-foreground mt-0.5">Soma dos alvos de marca</span>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col">
          <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">Vendedores com Meta</span>
          <span className="text-2xl font-bold font-sans text-on-surface mt-1">{uniqueVendorsCount} <span className="text-sm font-normal text-muted-foreground">/ {vendors.length}</span></span>
          <span className="text-xs text-muted-foreground mt-0.5">cobertura da equipe</span>
        </div>
      </div>

      {/* ── Filtros e Ação ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-4 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Busca */}
          <input
            type="text"
            placeholder="Buscar vendedor ou marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-background border border-border text-xs text-foreground px-3 py-2 rounded-xl outline-none font-sans min-w-[200px]"
          />

          {/* Filtro Vendedor */}
          <select
            value={vendorFilter}
            onChange={e => setVendorFilter(e.target.value)}
            className="bg-background border border-border text-xs text-foreground px-3 py-2 rounded-xl outline-none font-sans"
          >
            <option value="all">Todos os Vendedores</option>
            {vendors.map(v => (
              <option key={v.id} value={v.vendor_id}>
                {v.name || v.vendor_id}
              </option>
            ))}
          </select>

          {/* Filtro Marca */}
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="bg-background border border-border text-xs text-foreground px-3 py-2 rounded-xl outline-none font-sans"
          >
            <option value="all">Todas as Marcas</option>
            {brands.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true)
            if (vendors.length > 0 && !selVendorId) setSelVendorId(vendors[0].vendor_id)
            if (brands.length > 0 && !selBrand) setSelBrand(brands[0])
          }}
          disabled={vendors.length === 0}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-4 py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nova Meta de Marca
        </button>
      </div>

      {/* ── Tabela de Metas de Marca ───────────────────────────────────── */}
      {filteredGoals.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5 border-dashed">
          <p className="text-3xl mb-2 opacity-30">🏷️</p>
          <p className="font-mono text-muted-foreground text-sm">Nenhuma meta de marca configurada para este filtro.</p>
          <p className="font-mono text-muted-foreground text-xs mt-1 opacity-60">
            Clique em &quot;Nova Meta de Marca&quot; para definir alvos individuais por marca e vendedor.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-mono text-muted-foreground uppercase tracking-widest bg-surface-container/50">
                <th className="py-3.5 px-4 font-semibold">Vendedor</th>
                <th className="py-3.5 px-4 font-semibold">Loja</th>
                <th className="py-3.5 px-4 font-semibold">Marca</th>
                <th className="py-3.5 px-4 font-semibold text-right">Meta de Venda ($)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Bônus Adicional ($)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredGoals.map(g => {
                const vendor = vendorMap.get(g.vendor_id)
                const storeColor = vendor?.store ? storeColors[vendor.store] || 'var(--primary)' : 'var(--muted)'
                return (
                  <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-on-surface">{vendor?.name || g.vendor_id}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">ID: {g.vendor_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {vendor?.store ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-mono font-bold"
                          style={{
                            backgroundColor: `${storeColor}18`,
                            color: storeColor,
                            border: `1px solid ${storeColor}33`,
                          }}
                        >
                          {vendor.store}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                        🏷️ {g.brand}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-on-surface">
                      ${Number(g.meta_valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">
                      {g.bonus > 0 ? (
                        <span className="text-emerald-400 font-bold">+${Number(g.bonus).toLocaleString('pt-BR')}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={isPending}
                          onClick={() => {
                            setEditingGoal(g)
                            setEditMeta(String(g.meta_valor))
                            setEditBonus(String(g.bonus || ''))
                          }}
                          className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-on-surface font-sans transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleDelete(g)}
                          className="px-2 py-1 rounded-lg border border-error/20 hover:bg-error/10 text-xs text-error font-sans transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Nova Meta de Marca ───────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-on-surface">Nova Meta por Marca</h3>
            <p className="text-xs text-muted-foreground">
              Configure o valor alvo de vendas de uma marca específica para o vendedor no período selecionado.
            </p>

            <form onSubmit={handleSaveNew} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">Vendedor</label>
                <select
                  required
                  value={selVendorId}
                  onChange={e => setSelVendorId(e.target.value)}
                  className={inputCls}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.vendor_id}>
                      {v.name || v.vendor_id} {v.store ? `(${v.store})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">Marca</label>
                <select
                  value={selBrand}
                  onChange={e => setSelBrand(e.target.value)}
                  className={inputCls}
                >
                  {brands.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="__custom__">+ Outra marca (digitar)...</option>
                </select>
                {selBrand === '__custom__' && (
                  <input
                    type="text"
                    required
                    placeholder="Nome da nova marca"
                    value={customBrand}
                    onChange={e => setCustomBrand(e.target.value)}
                    className={`${inputCls} mt-2`}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">Meta de Venda ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 5000.00"
                  value={inputMeta}
                  onChange={e => setInputMeta(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">Bônus Adicional ($) (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 100.00"
                  value={inputBonus}
                  onChange={e => setInputBonus(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 justify-end mt-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-on-surface font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs font-sans hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Salvar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Editar Meta ─────────────────────────────────────────── */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-on-surface">Editar Meta — {editingGoal.brand}</h3>
            <p className="text-xs text-muted-foreground">
              Vendedor: <strong>{vendorMap.get(editingGoal.vendor_id)?.name || editingGoal.vendor_id}</strong>
            </p>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">Meta de Venda ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editMeta}
                  onChange={e => setEditMeta(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">Bônus Adicional ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editBonus}
                  onChange={e => setEditBonus(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 justify-end mt-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-on-surface font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs font-sans hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
