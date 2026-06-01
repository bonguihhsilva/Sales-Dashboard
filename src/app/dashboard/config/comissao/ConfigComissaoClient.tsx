'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '@/components/ui'
import { fmtCurrency } from '@/lib/utils'

type Store = {
  id: string
  name: string
  color: string | null
}

type Regra = {
  id: string
  nome: string
  condicoes: { loja: string }
  acao: {
    commission_pct: number
    meta1: number
    bonus1: number
    meta2: number
    bonus2: number
    meta3: number
    bonus3: number
    tipo_calculo: 'auto' | 'manual'
  }
}

interface Props {
  stores: Store[]
  regras: any[]
  tenantId: string
}

export default function ConfigComissaoClient({ stores, regras, tenantId }: Props) {
  const router = useRouter()
  const [activeStoreId, setActiveStoreId] = useState<string>(stores[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const activeStore = stores.find(s => s.id === activeStoreId)

  // Mapeia regras existentes por nome de loja
  const regrasMap = new Map<string, Regra>(
    regras
      .filter(r => r.condicoes && r.condicoes.loja)
      .map(r => [r.condicoes.loja, r])
  )

  // Estados do formulário baseados na loja ativa
  const currentRegra = activeStore ? regrasMap.get(activeStore.name) : null

  const [tipoCalculo, setTipoCalculo] = useState<'auto' | 'manual'>(
    currentRegra?.acao?.tipo_calculo || 'auto'
  )
  const [commissionPct, setCommissionPct] = useState<string>(
    currentRegra?.acao ? String((currentRegra.acao.commission_pct * 100).toFixed(2)) : '0.30'
  )
  const [meta1, setMeta1] = useState<string>(currentRegra?.acao ? String(currentRegra.acao.meta1) : '5000')
  const [bonus1, setBonus1] = useState<string>(currentRegra?.acao ? String(currentRegra.acao.bonus1) : '100')
  const [meta2, setMeta2] = useState<string>(currentRegra?.acao ? String(currentRegra.acao.meta2) : '8000')
  const [bonus2, setBonus2] = useState<string>(currentRegra?.acao ? String(currentRegra.acao.bonus2) : '150')
  const [meta3, setMeta3] = useState<string>(currentRegra?.acao ? String(currentRegra.acao.meta3) : '12000')
  const [bonus3, setBonus3] = useState<string>(currentRegra?.acao ? String(currentRegra.acao.bonus3) : '200')

  // Ao mudar de loja, recarrega os estados do formulário
  function handleSelectStore(storeId: string) {
    const store = stores.find(s => s.id === storeId)
    if (!store) return
    setActiveStoreId(storeId)
    setSuccessMsg('')
    setErrorMsg('')

    const r = regrasMap.get(store.name)
    if (r?.acao) {
      setTipoCalculo(r.acao.tipo_calculo || 'auto')
      setCommissionPct(String((r.acao.commission_pct * 100).toFixed(2)))
      setMeta1(String(r.acao.meta1))
      setBonus1(String(r.acao.bonus1))
      setMeta2(String(r.acao.meta2))
      setBonus2(String(r.acao.bonus2))
      setMeta3(String(r.acao.meta3))
      setBonus3(String(r.acao.bonus3))
    } else {
      // Padrão default
      setTipoCalculo('auto')
      setCommissionPct('0.30')
      setMeta1('5000')
      setBonus1('100')
      setMeta2('8000')
      setBonus2('150')
      setMeta3('12000')
      setBonus3('200')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!activeStore) return

    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      // Converte commissionPct de porcentagem (ex: 0.30%) para fração decimal (0.003)
      const commissionFrac = Number(commissionPct) / 100

      const payload = {
        loja: activeStore.name,
        commission_pct: commissionFrac,
        meta1: tipoCalculo === 'manual' ? Number(meta1) : 0,
        bonus1: Number(bonus1),
        meta2: tipoCalculo === 'manual' ? Number(meta2) : 0,
        bonus2: Number(bonus2),
        meta3: tipoCalculo === 'manual' ? Number(meta3) : 0,
        bonus3: Number(bonus3),
        tipo_calculo: tipoCalculo
      }

      const res = await fetch('/api/admin/comissoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao salvar configuração')

      setSuccessMsg(`Configuração da loja "${activeStore.name}" salva com sucesso!`)
      
      // Atualiza o cache local de regras
      regrasMap.set(activeStore.name, {
        id: data.data.id,
        nome: data.data.nome,
        condicoes: data.data.condicoes,
        acao: data.data.acao
      })

      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Lojas Sidebar (Grid/Lista de abas) */}
      <div className="w-full md:w-1/3 flex flex-col gap-3">
        <SectionTitle>Lojas Cadastradas</SectionTitle>
        <div className="flex flex-col gap-2 mt-4">
          {stores.map(store => {
            const hasRegra = regrasMap.has(store.name)
            const r = regrasMap.get(store.name)
            const active = store.id === activeStoreId
            const color = store.color || '#3b82f6'

            return (
              <button
                key={store.id}
                onClick={() => handleSelectStore(store.id)}
                type="button"
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                  active
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-surface-container/20 border-white/5 hover:bg-surface-container/40 text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <h3 className="font-bold text-sm m-0 leading-tight">{store.name}</h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {hasRegra 
                        ? `${r?.acao?.tipo_calculo === 'manual' ? 'Metas Manuais' : 'Metas Automáticas'}`
                        : 'Comissão Padrão (Tenant)'}
                    </span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-sm transition-transform ${active ? 'text-primary' : 'text-muted-foreground group-hover:translate-x-1'}`}>
                  chevron_right
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Formulário de Configuração */}
      <div className="flex-1 glass-card rounded-2xl p-6 border border-white/5 bg-surface-container-high/10">
        {activeStore ? (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface mb-1">
                Configurando: {activeStore.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Ajuste os parâmetros de metas e remuneração de vendas para esta loja específica.
              </p>
            </div>

            {/* Tipo de Cálculo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="tipo-calculo" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Modo de Metas</Label>
                <select
                  id="tipo-calculo"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors text-sm mt-1.5"
                  value={tipoCalculo}
                  onChange={e => setTipoCalculo(e.target.value as any)}
                >
                  <option value="auto">Automático (Baseado em histórico)</option>
                  <option value="manual">Manual (Valores fixados abaixo)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="comm-pct" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Comissão Base (%)</Label>
                <Input
                  id="comm-pct"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={commissionPct}
                  onChange={e => setCommissionPct(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <hr className="border-white/5 my-2" />

            {/* Metas e Bônus */}
            <div>
              <SectionTitle>Metas & Bônus de Performance</SectionTitle>
              <p className="text-[11px] text-muted-foreground mt-1 mb-4 font-mono">
                {tipoCalculo === 'auto'
                  ? 'No modo Automático, os valores mínimos de metas são recalculados automaticamente de acordo com o histórico. Defina abaixo apenas os bônus correspondentes.'
                  : 'Defina os valores das metas e bônus aplicáveis para cada faixa.'}
              </p>

              <div className="flex flex-col gap-4">
                {/* Meta 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-surface-container-high/20 p-4 rounded-xl border border-white/5">
                  <div>
                    <Label htmlFor="m1" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Meta 1 (M1)</Label>
                    <Input
                      id="m1"
                      type="number"
                      disabled={tipoCalculo === 'auto'}
                      value={tipoCalculo === 'auto' ? 'Automática' : meta1}
                      onChange={e => setMeta1(e.target.value)}
                      className="mt-1.5 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="b1" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Bônus M1 ($)</Label>
                    <Input
                      id="b1"
                      type="number"
                      required
                      value={bonus1}
                      onChange={e => setBonus1(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Meta 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-surface-container-high/20 p-4 rounded-xl border border-white/5">
                  <div>
                    <Label htmlFor="m2" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Meta 2 (M2)</Label>
                    <Input
                      id="m2"
                      type="number"
                      disabled={tipoCalculo === 'auto'}
                      value={tipoCalculo === 'auto' ? 'Automática' : meta2}
                      onChange={e => setMeta2(e.target.value)}
                      className="mt-1.5 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="b2" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Bônus M2 ($)</Label>
                    <Input
                      id="b2"
                      type="number"
                      required
                      value={bonus2}
                      onChange={e => setBonus2(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Meta 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-surface-container-high/20 p-4 rounded-xl border border-white/5">
                  <div>
                    <Label htmlFor="m3" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Meta 3 (M3)</Label>
                    <Input
                      id="m3"
                      type="number"
                      disabled={tipoCalculo === 'auto'}
                      value={tipoCalculo === 'auto' ? 'Automática' : meta3}
                      onChange={e => setMeta3(e.target.value)}
                      className="mt-1.5 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="b3" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Bônus M3 ($)</Label>
                    <Input
                      id="b3"
                      type="number"
                      required
                      value={bonus3}
                      onChange={e => setBonus3(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens de Sucesso / Erro */}
            {successMsg && (
              <div className="bg-success/10 border border-success/30 text-success text-[12px] rounded-lg px-4 py-2.5 font-mono">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-[12px] rounded-lg px-4 py-2.5 font-mono">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-8 py-3 rounded-xl transition-all"
              >
                {loading ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-muted-foreground font-mono text-center py-12">
            Nenhuma loja cadastrada para este tenant.
          </p>
        )}
      </div>
    </div>
  )
}
