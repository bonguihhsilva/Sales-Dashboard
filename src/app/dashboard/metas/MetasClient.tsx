'use client'

import { useState } from 'react'

interface Period {
  id: number
  label: string
  year: number
  month: number
  start_date: string
  end_date: string
  closed: boolean
}

interface Goal {
  id: number
  period_id: number
  vendor_id: string
  vendor_name: string
  store: string
  meta1: number
  meta2: number
  meta3: number
  bonus1: number
  bonus2: number
  bonus3: number
  history_months: number | null
}

interface Store {
  name: string
  color: string
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const inputCls =
  'w-full bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm text-foreground px-3 py-2 outline-none font-mono transition-all'

export default function MetasClient({ periods, goals, stores }: { periods: Period[]; goals: Goal[]; stores: Store[] }) {
  const [activePeriod, setActivePeriod] = useState<number>(periods[0]?.id ?? 0)
  const [showNewPeriod, setShowNewPeriod] = useState(false)
  const [showNewVendor, setShowNewVendor] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [msg, setMsg] = useState('')

  const storeColors = Object.fromEntries(stores.map(s => [s.name, s.color]))

  // Form: novo período
  const [npYear, setNpYear] = useState(new Date().getFullYear())
  const [npMonth, setNpMonth] = useState(new Date().getMonth() + 1)

  // Form: novo vendedor (inclui metas e bônus — obrigatórios pela API)
  const [nvId, setNvId] = useState('')
  const [nvName, setNvName] = useState('')
  const [nvStore, setNvStore] = useState(stores[0]?.name ?? '')
  const [nvMeta1, setNvMeta1] = useState('')
  const [nvMeta2, setNvMeta2] = useState('')
  const [nvMeta3, setNvMeta3] = useState('')
  const [nvBonus1, setNvBonus1] = useState('100')
  const [nvBonus2, setNvBonus2] = useState('150')
  const [nvBonus3, setNvBonus3] = useState('200')

  // Form: editar meta existente
  const [editMeta1, setEditMeta1] = useState('')
  const [editMeta2, setEditMeta2] = useState('')
  const [editMeta3, setEditMeta3] = useState('')
  const [editBonus1, setEditBonus1] = useState('')
  const [editBonus2, setEditBonus2] = useState('')
  const [editBonus3, setEditBonus3] = useState('')

  const periodGoals = goals.filter(g => g.period_id === activePeriod)

  function fmt(n: number) {
    return n.toLocaleString('pt-BR')
  }

  function openEdit(g: Goal) {
    setEditingGoal(g)
    setEditMeta1(g.meta1 > 0 ? String(g.meta1) : '')
    setEditMeta2(g.meta2 > 0 ? String(g.meta2) : '')
    setEditMeta3(g.meta3 > 0 ? String(g.meta3) : '')
    setEditBonus1(String(g.bonus1 || '100'))
    setEditBonus2(String(g.bonus2 || '150'))
    setEditBonus3(String(g.bonus3 || '200'))
  }

  async function createPeriod() {
    const label = `${MONTHS[npMonth - 1]} ${npYear}`
    const start = `${npYear}-${String(npMonth).padStart(2, '0')}-01`
    const lastDay = new Date(npYear, npMonth, 0).getDate()
    const end = `${npYear}-${String(npMonth).padStart(2, '0')}-${lastDay}`
    const res = await fetch('/api/admin/create-period', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: npYear, month: npMonth, label, start_date: start, end_date: end }),
    })
    const data = await res.json()
    if (data.error) { setMsg(`Erro: ${data.error}`); return }
    setMsg(`✓ Período ${label} criado!`)
    setTimeout(() => window.location.reload(), 1500)
  }

  async function addVendorGoal() {
    const res = await fetch('/api/admin/update-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        create: true,
        period_id: activePeriod,
        vendor_id: nvId,
        vendor_name: nvName,
        store: nvStore,
        meta1: parseFloat(nvMeta1),
        meta2: parseFloat(nvMeta2),
        meta3: parseFloat(nvMeta3),
        bonus1: parseFloat(nvBonus1),
        bonus2: parseFloat(nvBonus2),
        bonus3: parseFloat(nvBonus3),
      }),
    })
    const data = await res.json()
    if (data.error) { setMsg(`Erro: ${data.error}`); return }
    setMsg(`✓ ${nvName} adicionado!`)
    setShowNewVendor(false)
    setNvId(''); setNvName(''); setNvMeta1(''); setNvMeta2(''); setNvMeta3('')
    setNvBonus1('100'); setNvBonus2('150'); setNvBonus3('200')
    setTimeout(() => window.location.reload(), 1000)
  }

  async function saveGoal() {
    if (!editingGoal) return
    const res = await fetch('/api/admin/update-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingGoal.id,
        meta1: parseFloat(editMeta1),
        meta2: parseFloat(editMeta2),
        meta3: parseFloat(editMeta3),
        bonus1: parseFloat(editBonus1),
        bonus2: parseFloat(editBonus2),
        bonus3: parseFloat(editBonus3),
      }),
    })
    const data = await res.json()
    if (data.error) { setMsg(`Erro: ${data.error}`); return }
    setMsg(`✓ Metas de ${editingGoal.vendor_name} salvas!`)
    setEditingGoal(null)
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Barra de Controles ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-container-high border border-border rounded-xl px-3 py-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold whitespace-nowrap">
              Período
            </span>
            {periods.length > 0 ? (
              <select
                value={activePeriod}
                onChange={e => setActivePeriod(Number(e.target.value))}
                className="bg-transparent text-foreground font-mono font-bold text-sm outline-none cursor-pointer"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id} className="bg-surface-container">
                    {p.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-muted-foreground text-sm font-mono italic">Nenhum período</span>
            )}
          </div>

          <button
            onClick={() => setShowNewPeriod(true)}
            className="flex items-center gap-1.5 bg-surface-container border border-border text-on-surface-variant hover:text-foreground hover:bg-surface-container-high px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 whitespace-nowrap"
          >
            + Novo Período
          </button>
        </div>

        <button
          onClick={() => setShowNewVendor(true)}
          disabled={periods.length === 0}
          className="flex items-center gap-2 bg-[#c8f542] hover:bg-[#c8f542]/90 text-[#0b1326] font-bold px-4 py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95 shadow-lg shadow-[#c8f542]/10 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          + Adicionar Vendedor
        </button>
      </div>

      {/* ── Mensagem de Status ─────────────────────────────────────────── */}
      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-mono border flex items-center gap-3 ${
            msg.startsWith('✓')
              ? 'bg-meta1/10 border-meta1/20 text-meta1'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {msg}
        </div>
      )}

      {/* ── Banner Informativo ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-xl text-xs font-mono bg-surface-container/50 border border-border/50 text-muted-foreground">
        <span className="text-[#c8f542] font-bold shrink-0">ℹ</span>
        <span>
          Metas calculadas automaticamente: média dos 3 meses anteriores ×{' '}
          <strong className="text-foreground">1,20</strong> (1ª Meta),{' '}
          <strong className="text-foreground">1,44</strong> (2ª Meta),{' '}
          <strong className="text-foreground">1,73</strong> (3ª Meta).
        </span>
      </div>

      {/* ── Tabela de Metas ───────────────────────────────────────────── */}
      {periods.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-border">
          <p className="text-4xl mb-3 opacity-30">📅</p>
          <p className="font-mono text-muted-foreground text-sm">Nenhum período criado.</p>
          <p className="font-mono text-muted-foreground text-xs mt-1 opacity-60">
            Clique em &ldquo;+ Novo Período&rdquo; para começar.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface-container-high/50 border-b border-border">
                <tr>
                  {[
                    { h: 'Vendedor', a: 'left' },
                    { h: 'Loja', a: 'left' },
                    { h: 'ID', a: 'left' },
                    { h: '1ª Meta', a: 'right' },
                    { h: '2ª Meta', a: 'right' },
                    { h: '3ª Meta', a: 'right' },
                    { h: 'Bônus 1', a: 'right' },
                    { h: 'Bônus 2', a: 'right' },
                    { h: 'Bônus 3', a: 'right' },
                    { h: '', a: 'right' },
                  ].map((col, i) => (
                    <th
                      key={i}
                      className="font-mono text-[10px] uppercase tracking-wider py-4 px-4 text-muted-foreground font-bold whitespace-nowrap"
                      style={{ textAlign: col.a as 'left' | 'right' }}
                    >
                      {col.h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {periodGoals.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-muted-foreground font-mono text-sm">
                      Nenhuma meta cadastrada para este período. Clique em &ldquo;+ Adicionar Vendedor&rdquo;.
                    </td>
                  </tr>
                ) : (
                  periodGoals.map(g => {
                    const awaitingHistory = g.history_months !== null && g.history_months < 3
                    const hasZeroGoals = !awaitingHistory && (g.meta1 === 0 || g.meta2 === 0 || g.meta3 === 0)
                    return (
                      <tr key={g.id} className="hover:bg-surface-container/30 transition-colors group">
                        <td className="py-4 px-4 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-foreground">{g.vendor_name}</span>
                            {awaitingHistory && (
                              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-full px-2.5 py-0.5 text-[9px] font-mono tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                {g.history_months ?? 0}/3 meses
                              </span>
                            )}
                            {hasZeroGoals && (
                              <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/25 rounded-full px-2.5 py-0.5 text-[9px] font-mono tracking-wider">
                                Definir metas
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground font-medium text-xs whitespace-nowrap">
                          {(() => {
                            const color = storeColors[g.store]
                            return color ? (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border"
                                style={{ color, borderColor: `${color}33`, backgroundColor: `${color}1a` }}
                              >
                                {g.store}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border border-border bg-surface-container text-muted-foreground">
                                {g.store}
                              </span>
                            )
                          })()}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-muted-foreground">{g.vendor_id}</td>
                        {(['meta1', 'meta2', 'meta3', 'bonus1', 'bonus2', 'bonus3'] as const).map(field => {
                          const isBonus = field.startsWith('bonus')
                          const isZero = g[field] === 0
                          return (
                            <td
                              key={field}
                              className={`py-4 px-4 text-right font-mono text-xs ${
                                awaitingHistory
                                  ? 'text-muted-foreground/45'
                                  : isZero
                                  ? 'text-red-400/70 font-medium'
                                  : isBonus
                                  ? 'text-[#c8f542] font-semibold'
                                  : 'text-foreground font-medium'
                              }`}
                            >
                              {awaitingHistory ? '—' : isBonus ? `$${fmt(g[field])}` : fmt(g[field])}
                            </td>
                          )
                        })}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => openEdit(g)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-mono bg-surface-container-high border border-border hover:border-primary/40 hover:text-primary text-muted-foreground px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal: Novo Período ────────────────────────────────────────── */}
      {showNewPeriod && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-foreground mb-4">Criar Novo Período</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 font-bold">
                  Ano
                </label>
                <input
                  type="number"
                  value={npYear}
                  onChange={e => setNpYear(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 font-bold">
                  Mês
                </label>
                <select
                  value={npMonth}
                  onChange={e => setNpMonth(Number(e.target.value))}
                  className={inputCls + ' cursor-pointer font-semibold'}
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1} className="bg-surface-container">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewPeriod(false)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-border text-muted-foreground hover:text-foreground font-bold py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={createPeriod}
                className="flex-[2] bg-[#c8f542] hover:bg-[#c8f542]/90 text-[#0b1326] font-bold py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95"
              >
                Criar Período
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Adicionar Vendedor ──────────────────────────────────── */}
      {showNewVendor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-1">Adicionar Vendedor ao Período</h2>
            <p className="text-[11px] font-mono text-muted-foreground mb-5">
              Preencha as metas iniciais. As metas devem seguir: Meta 1 &lt; Meta 2 &lt; Meta 3.
            </p>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 font-bold">
                    ID do Vendedor
                  </label>
                  <input
                    value={nvId}
                    onChange={e => setNvId(e.target.value)}
                    placeholder="UUID do perfil"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 font-bold">
                    Loja
                  </label>
                  <select
                    value={nvStore}
                    onChange={e => setNvStore(e.target.value)}
                    className={inputCls + ' cursor-pointer font-semibold'}
                  >
                    {stores.length === 0 ? (
                      <option value="" className="bg-surface-container">Nenhuma loja cadastrada</option>
                    ) : (
                      stores.map(s => (
                        <option key={s.name} value={s.name} className="bg-surface-container">
                          {s.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 font-bold">
                  Nome Completo
                </label>
                <input
                  value={nvName}
                  onChange={e => setNvName(e.target.value)}
                  placeholder="Ex: Tania Velazquez"
                  className={inputCls + ' font-semibold'}
                />
              </div>

              <div className="border-t border-border/50 pt-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold mb-3">
                  Metas de Vendas
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '1ª Meta', val: nvMeta1, set: setNvMeta1, ph: 'Ex: 50000' },
                    { label: '2ª Meta', val: nvMeta2, set: setNvMeta2, ph: 'Ex: 60000' },
                    { label: '3ª Meta', val: nvMeta3, set: setNvMeta3, ph: 'Ex: 72000' },
                  ].map(({ label, val, set, ph }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-mono text-muted-foreground mb-1.5">{label}</label>
                      <input
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder={ph}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold mb-3">
                  Bônus ($)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Bônus 1', val: nvBonus1, set: setNvBonus1 },
                    { label: 'Bônus 2', val: nvBonus2, set: setNvBonus2 },
                    { label: 'Bônus 3', val: nvBonus3, set: setNvBonus3 },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-mono text-muted-foreground mb-1.5">{label}</label>
                      <input
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewVendor(false)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-border text-muted-foreground hover:text-foreground font-bold py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={addVendorGoal}
                disabled={!nvId || !nvName || !nvMeta1 || !nvMeta2 || !nvMeta3}
                className="flex-[2] bg-[#c8f542] hover:bg-[#c8f542]/90 text-[#0b1326] font-bold py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Metas ────────────────────────────────────────── */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-foreground mb-1">Editar Metas</h2>
            <p className="text-[11px] font-mono text-muted-foreground mb-5">
              {editingGoal.vendor_name} · {editingGoal.store}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold mb-3">
                  Metas de Vendas
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '1ª Meta', val: editMeta1, set: setEditMeta1 },
                    { label: '2ª Meta', val: editMeta2, set: setEditMeta2 },
                    { label: '3ª Meta', val: editMeta3, set: setEditMeta3 },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-mono text-muted-foreground mb-1.5">{label}</label>
                      <input
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold mb-3">
                  Bônus ($)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Bônus 1', val: editBonus1, set: setEditBonus1 },
                    { label: 'Bônus 2', val: editBonus2, set: setEditBonus2 },
                    { label: 'Bônus 3', val: editBonus3, set: setEditBonus3 },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-mono text-muted-foreground mb-1.5">{label}</label>
                      <input
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingGoal(null)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-border text-muted-foreground hover:text-foreground font-bold py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={saveGoal}
                className="flex-[2] bg-[#c8f542] hover:bg-[#c8f542]/90 text-[#0b1326] font-bold py-2.5 rounded-xl text-xs font-sans transition-all active:scale-95"
              >
                Salvar Metas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
