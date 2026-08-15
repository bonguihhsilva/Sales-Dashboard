'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { updateProductCost, updateProductAttributes } from './actions'
import { KpiCard } from '@/components/ui'
import type { InventoryMetric, AbcRow, RankingRow, InventorySummary, MovementClass } from './types'

const TABS = [
  { key: 'visao', label: 'Visão Geral' },
  { key: 'ranking', label: 'Ranking' },
  { key: 'estoque', label: 'Estoque' },
  { key: 'abc', label: 'Curva ABC' },
  { key: 'precos', label: 'Preços' },
] as const

const STORE_LABELS: Record<string, string> = {
  jebai: 'Jebai',
  paje1: 'Pajé 1',
  paje2: 'Pajé 2',
}

const MOVE_LABEL: Record<MovementClass, string> = {
  fast: 'Alta rotatividade',
  normal: 'Normal',
  slow: 'Baixo giro',
  dead: 'Parado',
}

const MOVE_STYLE: Record<MovementClass, string> = {
  fast: 'bg-primary-container text-on-primary-container',
  normal: 'bg-surface-variant text-on-surface-variant',
  slow: 'bg-tertiary-container text-on-tertiary-container',
  dead: 'bg-error/20 text-error',
}

// "—" marca desconhecido. Zero e desconhecido nunca sao exibidos igual (D-18).
const money = (v: number | null | undefined) =>
  v === null || v === undefined ? '—' : `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
const num = (v: number | null | undefined, d = 1) =>
  v === null || v === undefined ? '—' : Number(v).toFixed(d)
const pct = (v: number | null | undefined) =>
  v === null || v === undefined ? '—' : `${(Number(v) * 100).toFixed(0)}%`

// Sugestão de compra = repor até dar N dias de cobertura, usando o próprio
// `ads` (venda média/dia) como previsão de demanda — já é o dado mais
// confiável que temos, sem prazo de entrega por fornecedor no schema ainda.
// ponytail: cobertura-alvo fixa em 14d; virar constante editável por loja/SKU
// quando compras pedir lead time real por fornecedor.
const TARGET_COVER_DAYS = 14
const suggestedQty = (m: InventoryMetric): number | null => {
  if (m.current_qty === null || m.ads <= 0) return null
  return Math.max(0, Math.ceil(m.ads * TARGET_COVER_DAYS - m.current_qty))
}

export default function ComprasClient({
  tab, store, stores, metrics, abc, ranking, summary, canEditCost,
}: {
  tab: string
  store: string
  stores: string[]
  metrics: InventoryMetric[]
  abc: AbcRow[]
  ranking: RankingRow[]
  summary: InventorySummary | null
  canEditCost: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`${pathname}?${next.toString()}`)
  }

  const abcByCode = useMemo(
    () => new Map(abc.map(a => [a.product_code, a])),
    [abc]
  )

  // Alerta de reposicao: em ruptura agora, ou cobertura menor que uma semana.
  // Ordenado pelo mais urgente (menor DoS primeiro; ruptura no topo).
  const alertas = useMemo(
    () =>
      metrics
        .filter(m => m.is_stockout_now === true || (m.dos !== null && m.dos <= 7))
        .sort((a, b) => {
          if (a.is_stockout_now !== b.is_stockout_now) return a.is_stockout_now ? -1 : 1
          return (a.dos ?? 999) - (b.dos ?? 999)
        }),
    [metrics]
  )

  // Parados ordenados por CAPITAL IMOBILIZADO, nao por quantidade — o que
  // dói é dinheiro parado, não peça parada.
  const parados = useMemo(
    () =>
      metrics
        .filter(m => m.movement_class === 'dead' || m.movement_class === 'slow')
        .sort((a, b) => (b.stock_value ?? -1) - (a.stock_value ?? -1)),
    [metrics]
  )

  const fastMovers = useMemo(
    () => metrics.filter(m => m.movement_class === 'fast')
      .sort((a, b) => (a.dos ?? 999) - (b.dos ?? 999)),
    [metrics]
  )

  const rankingFiltrado = useMemo(() => {
    const rows = store ? ranking.filter(r => r.store === store) : ranking
    // Sem filtro de loja, soma as lojas do mesmo produto.
    const agg = new Map<string, RankingRow & { profit: number | null }>()
    for (const r of rows) {
      const cur = agg.get(r.product_code)
      if (!cur) {
        agg.set(r.product_code, { ...r })
      } else {
        cur.qty_sold += r.qty_sold
        cur.revenue += r.revenue
        cur.profit = cur.profit === null || r.profit === null ? null : cur.profit + r.profit
      }
    }
    return Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue)
  }, [ranking, store])

  return (
    <div className="flex flex-col gap-6">
      {/* Abas — estado na URL, compartilhavel */}
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setParam('tab', t.key)}
            className={`px-4 py-3 font-label-sm text-label-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary text-on-surface font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'visao' && (
        <VisaoGeral summary={summary} alertas={alertas} fastMovers={fastMovers} />
      )}

      {tab === 'ranking' && (
        <Ranking
          rows={rankingFiltrado}
          stores={stores}
          store={store}
          onStore={v => setParam('store', v)}
        />
      )}

      {tab === 'estoque' && <Estoque metrics={metrics} abcByCode={abcByCode} canEdit={canEditCost} />}

      {tab === 'abc' && <CurvaAbc abc={abc} metrics={metrics} />}

      {tab === 'precos' && (
        <Precos metrics={metrics} canEdit={canEditCost} parados={parados} />
      )}
    </div>
  )
}

// ── Visão Geral ────────────────────────────────────────────────────────────

function VisaoGeral({
  summary, alertas, fastMovers,
}: {
  summary: InventorySummary | null
  alertas: InventoryMetric[]
  fastMovers: InventoryMetric[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Valor em estoque" value={money(summary?.total_stock_value)} sub="a custo vigente" />
        <KpiCard label="SKUs" value={summary ? String(summary.total_skus) : '—'} sub={`${summary?.skus_sem_custo ?? 0} sem custo`} />
        <KpiCard label="Em ruptura" value={summary ? String(summary.skus_em_quebra) : '—'} sub="estoque zerado hoje" valueClassName={summary && summary.skus_em_quebra > 0 ? 'text-error' : ''} />
        <KpiCard label="Parados" value={summary ? String(summary.skus_parados) : '—'} sub="sem giro, capital preso" valueClassName={summary && summary.skus_parados > 0 ? 'text-meta2' : ''} />
      </div>

      <Card title="Alertas de reposição" subtitle="Ruptura agora ou cobertura abaixo de 7 dias. Decisão: o que comprar esta semana.">
        {alertas.length === 0 ? (
          <Empty>Nenhum item em risco de ruptura.</Empty>
        ) : (
          <>
            <Table head={['Produto', { label: 'Estoque', align: 'right' }, { label: 'Venda/dia', align: 'right' }, { label: 'Cobertura', align: 'right' }, { label: 'Comprar', align: 'right' }, 'Situação']}>
              {alertas.map(m => {
                const sugestao = suggestedQty(m)
                return (
                  <tr key={m.product_code} className="hover:bg-white/[0.03] transition-colors">
                    <Td><strong>{m.product_name ?? m.product_code}</strong><div className="text-on-surface-variant font-mono text-[0.6875rem]">{m.product_code}</div></Td>
                    <Td className="text-right font-mono">{m.current_qty === null ? '—' : num(m.current_qty, 0)}</Td>
                    <Td className="text-right font-mono">{num(m.ads, 2)}</Td>
                    <Td className="text-right font-mono">{m.dos === null ? '—' : `${num(m.dos)} dias`}</Td>
                    <Td className="text-right font-mono font-bold">{sugestao === null ? '—' : sugestao}</Td>
                    <Td>
                      {m.is_stockout_now ? (
                        <Badge className="bg-error/20 text-error">Sem estoque</Badge>
                      ) : (
                        <Badge className="bg-tertiary-container text-on-tertiary-container">Repor</Badge>
                      )}
                    </Td>
                  </tr>
                )
              })}
            </Table>
            <p className="mt-3 text-label-sm text-on-surface-variant">
              Sugestão de compra: repõe até {TARGET_COVER_DAYS} dias de cobertura, projetando pela venda média diária atual.
            </p>
          </>
        )}
      </Card>

      <Card title="Alta rotatividade" subtitle="Giro rápido — são estes que não podem faltar.">
        {fastMovers.length === 0 ? (
          <Empty>Nenhum item classificado como alta rotatividade.</Empty>
        ) : (
          <Table head={['Produto', { label: 'Estoque', align: 'right' }, { label: 'Venda/dia', align: 'right' }, { label: 'Cobertura', align: 'right' }, { label: 'Giro anual', align: 'right' }]}>
            {fastMovers.slice(0, 10).map(m => (
              <tr key={m.product_code} className="hover:bg-white/[0.03] transition-colors">
                <Td><strong>{m.product_name ?? m.product_code}</strong></Td>
                <Td className="text-right font-mono">{num(m.current_qty, 0)}</Td>
                <Td className="text-right font-mono">{num(m.ads, 2)}</Td>
                <Td className="text-right font-mono">{m.dos === null ? '—' : `${num(m.dos)} d`}</Td>
                <Td className="text-right font-mono">{num(m.turnover_annualized, 1)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

// ── Ranking ────────────────────────────────────────────────────────────────

function Ranking({
  rows, stores, store, onStore,
}: {
  rows: RankingRow[]
  stores: string[]
  store: string
  onStore: (v: string) => void
}) {
  return (
    <Card
      title="Mais vendidos"
      subtitle="Venda agregada por produto na janela. Decisão: onde investir verba e negociar volume."
      action={
        <select
          value={store}
          onChange={e => onStore(e.target.value)}
          className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10"
        >
          <option value="">Todas as lojas</option>
          {stores.map(s => (
            <option key={s} value={s}>{STORE_LABELS[s] ?? s}</option>
          ))}
        </select>
      }
    >
      {rows.length === 0 ? (
        <Empty>Sem vendas na janela para os filtros atuais.</Empty>
      ) : (
        <Table head={['#', 'Produto', { label: 'Qtd vendida', align: 'right' }, { label: 'Receita', align: 'right' }, { label: 'Lucro', align: 'right' }]}>
          {rows.map((r, i) => (
            <tr key={r.product_code} className="hover:bg-white/[0.03] transition-colors">
              <Td className="font-mono text-on-surface-variant">{i + 1}</Td>
              <Td><strong>{r.product_name ?? r.product_code}</strong><div className="text-on-surface-variant font-mono text-[0.6875rem]">{r.product_code}</div></Td>
              <Td className="text-right font-mono">{num(r.qty_sold, 0)}</Td>
              <Td className="text-right font-mono font-bold">{money(r.revenue)}</Td>
              <Td className="text-right font-mono font-bold">{money(r.profit)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  )
}

// ── Estoque ────────────────────────────────────────────────────────────────

function Estoque({
  metrics, abcByCode, canEdit,
}: {
  metrics: InventoryMetric[]
  abcByCode: Map<string, AbcRow>
  canEdit: boolean
}) {
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [costMin, setCostMin] = useState('')
  const [costMax, setCostMax] = useState('')
  const [saleMin, setSaleMin] = useState('')
  const [saleMax, setSaleMax] = useState('')

  // Listas de opções derivadas dos dados reais — nada de valores hardcoded,
  // o comprador só vê o que já foi cadastrado em algum SKU.
  const distinct = (key: 'brand' | 'category' | 'model' | 'color') =>
    Array.from(new Set(metrics.map(m => m[key]).filter((v): v is string => Boolean(v)))).sort()
  const brands = useMemo(() => distinct('brand'), [metrics])
  const categories = useMemo(() => distinct('category'), [metrics])
  const models = useMemo(() => distinct('model'), [metrics])
  const colors = useMemo(() => distinct('color'), [metrics])

  const toNum = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')))
  const cMin = toNum(costMin), cMax = toNum(costMax)
  const sMin = toNum(saleMin), sMax = toNum(saleMax)

  const filtered = metrics.filter(m => {
    const t = `${m.product_code} ${m.product_name ?? ''}`.toLowerCase()
    if (!t.includes(q.toLowerCase())) return false
    if (brand && m.brand !== brand) return false
    if (category && m.category !== category) return false
    if (model && m.model !== model) return false
    if (color && m.color !== color) return false
    if (cMin !== null && (m.unit_cost === null || m.unit_cost < cMin)) return false
    if (cMax !== null && (m.unit_cost === null || m.unit_cost > cMax)) return false
    if (sMin !== null && (m.sale_price === null || m.sale_price < sMin)) return false
    if (sMax !== null && (m.sale_price === null || m.sale_price > sMax)) return false
    return true
  })

  const hasFilters = brand || category || model || color || costMin || costMax || saleMin || saleMax

  return (
    <Card
      title="Estoque"
      subtitle="Tabela mestra de SKUs. As demais abas são recortes desta."
      action={
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar produto..."
          className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10 w-56"
        />
      }
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterSelect label="Marca" value={brand} options={brands} onChange={setBrand} />
        <FilterSelect label="Categoria" value={category} options={categories} onChange={setCategory} />
        <FilterSelect label="Modelo" value={model} options={models} onChange={setModel} />
        <FilterSelect label="Cor" value={color} options={colors} onChange={setColor} />
        <input
          value={costMin}
          onChange={e => setCostMin(e.target.value)}
          placeholder="Custo mín."
          inputMode="decimal"
          className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10 w-28"
        />
        <input
          value={costMax}
          onChange={e => setCostMax(e.target.value)}
          placeholder="Custo máx."
          inputMode="decimal"
          className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10 w-28"
        />
        <input
          value={saleMin}
          onChange={e => setSaleMin(e.target.value)}
          placeholder="Venda mín."
          inputMode="decimal"
          className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10 w-28"
        />
        <input
          value={saleMax}
          onChange={e => setSaleMax(e.target.value)}
          placeholder="Venda máx."
          inputMode="decimal"
          className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10 w-28"
        />
        {hasFilters && (
          <button
            onClick={() => { setBrand(''); setCategory(''); setModel(''); setColor(''); setCostMin(''); setCostMax(''); setSaleMin(''); setSaleMax('') }}
            className="px-3 py-2 text-label-sm text-on-surface-variant hover:text-on-surface"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Empty>Nenhum produto encontrado.</Empty>
      ) : (
        <Table head={['Produto', 'Atributos', { label: 'Qtd', align: 'right' }, { label: 'Custo', align: 'right' }, { label: 'Venda', align: 'right' }, { label: 'Valor', align: 'right' }, { label: 'Giro', align: 'right' }, { label: 'Cobertura', align: 'right' }, 'ABC', 'Classe', 'Snapshot']}>
          {filtered.map(m => {
            const a = abcByCode.get(m.product_code)
            return (
              <tr key={m.product_code} className="hover:bg-white/[0.03] transition-colors">
                <Td><strong>{m.product_name ?? m.product_code}</strong><div className="text-on-surface-variant font-mono text-[0.6875rem]">{m.product_code}</div></Td>
                <Td><AttrsCell m={m} canEdit={canEdit} /></Td>
                <Td className="text-right font-mono">{m.current_qty === null ? <Unknown /> : num(m.current_qty, 0)}</Td>
                <Td className="text-right font-mono">{m.has_cost ? money(m.unit_cost) : <Unknown />}</Td>
                <Td className="text-right font-mono">{money(m.sale_price)}</Td>
                <Td className="text-right font-mono font-bold">{money(m.stock_value)}</Td>
                <Td className="text-right font-mono">{num(m.turnover_annualized, 1)}</Td>
                <Td className="text-right font-mono">{m.dos === null ? '—' : `${num(m.dos)} d`}</Td>
                <Td>{a ? <Badge className="bg-surface-variant text-on-surface-variant">{a.abc_class}</Badge> : '—'}</Td>
                <Td>{m.movement_class ? <Badge className={MOVE_STYLE[m.movement_class]}>{MOVE_LABEL[m.movement_class]}</Badge> : '—'}</Td>
                <Td><StockStatusCell m={m} /></Td>
              </tr>
            )
          })}
        </Table>
      )}
    </Card>
  )
}

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10"
    >
      <option value="">{label}</option>
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

// Edição inline de marca/categoria/modelo/cor — mesmo padrão de custo:
// dirty-tracking local, salva só quando o comprador confirma.
function AttrsCell({ m, canEdit }: { m: InventoryMetric; canEdit: boolean }) {
  const [open, setOpen] = useState(false)
  const [brand, setBrand] = useState(m.brand ?? '')
  const [category, setCategory] = useState(m.category ?? '')
  const [model, setModel] = useState(m.model ?? '')
  const [color, setColor] = useState(m.color ?? '')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const tags = [m.brand, m.category, m.model, m.color].filter(Boolean)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-left text-label-sm text-on-surface-variant hover:text-on-surface"
      >
        {tags.length > 0 ? tags.join(' · ') : (canEdit ? 'Adicionar' : '—')}
      </button>
    )
  }

  const save = () => {
    setMsg(null)
    startTransition(async () => {
      const res = await updateProductAttributes(m.product_code, {
        brand: brand || null,
        category: category || null,
        model: model || null,
        color: color || null,
      })
      setMsg(res.ok ? 'Salvo' : res.error)
      if (res.ok) setOpen(false)
    })
  }

  return (
    <div className="flex flex-col gap-1 w-44">
      <input value={brand} onChange={e => setBrand(e.target.value)} disabled={!canEdit || pending} placeholder="Marca"
        className="bg-surface-variant text-on-surface font-mono text-[0.6875rem] rounded px-2 py-1 border border-white/10 disabled:opacity-50" />
      <input value={category} onChange={e => setCategory(e.target.value)} disabled={!canEdit || pending} placeholder="Categoria"
        className="bg-surface-variant text-on-surface font-mono text-[0.6875rem] rounded px-2 py-1 border border-white/10 disabled:opacity-50" />
      <input value={model} onChange={e => setModel(e.target.value)} disabled={!canEdit || pending} placeholder="Modelo"
        className="bg-surface-variant text-on-surface font-mono text-[0.6875rem] rounded px-2 py-1 border border-white/10 disabled:opacity-50" />
      <input value={color} onChange={e => setColor(e.target.value)} disabled={!canEdit || pending} placeholder="Cor"
        className="bg-surface-variant text-on-surface font-mono text-[0.6875rem] rounded px-2 py-1 border border-white/10 disabled:opacity-50" />
      <div className="flex gap-2 items-center">
        {canEdit && (
          <button onClick={save} disabled={pending} className="px-2 py-1 rounded bg-primary-container text-on-primary-container font-mono text-[0.6875rem] disabled:opacity-50">
            {pending ? '...' : 'Salvar'}
          </button>
        )}
        <button onClick={() => setOpen(false)} className="text-[0.6875rem] text-on-surface-variant">fechar</button>
      </div>
      {msg && <span className="font-mono text-[0.6875rem] text-on-surface-variant">{msg}</span>}
    </div>
  )
}

function StockStatusCell({ m }: { m: InventoryMetric }) {
  if (m.stock_status === 'unknown')
    return <Badge className="bg-surface-variant text-on-surface-variant">Sem dado</Badge>
  if (m.stock_status === 'stale')
    return (
      <Badge className="bg-tertiary-container text-on-tertiary-container">
        {m.snapshot_staleness_days}d atrás
      </Badge>
    )
  return <span className="text-on-surface-variant font-mono text-[0.6875rem]">{m.last_snapshot_date}</span>
}

// ── Curva ABC ──────────────────────────────────────────────────────────────

function CurvaAbc({ abc, metrics }: { abc: AbcRow[]; metrics: InventoryMetric[] }) {
  const nameByCode = useMemo(
    () => new Map(metrics.map(m => [m.product_code, m.product_name ?? m.product_code])),
    [metrics]
  )
  const groups: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C']
  const total = abc.reduce((s, r) => s + Math.max(r.abc_metric, 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        {groups.map(g => {
          const rows = abc.filter(r => r.abc_class === g)
          const sum = rows.reduce((s, r) => s + Math.max(r.abc_metric, 0), 0)
          return (
            <KpiCard
              key={g}
              label={`Classe ${g}`}
              value={`${rows.length} SKUs`}
              sub={total > 0 ? `${((sum / total) * 100).toFixed(0)}% do lucro` : '—'}
            />
          )
        })}
      </div>

      <Card title="Curva ABC" subtitle="Classificada por lucro acumulado na janela. Decisão: onde concentrar capital de giro.">
        {abc.length === 0 ? (
          <Empty>Sem vendas na janela para classificar.</Empty>
        ) : (
          <Table head={['#', 'Produto', 'Classe', { label: 'Métrica', align: 'right' }, { label: 'Acumulado', align: 'right' }, 'Base']}>
            {abc.map(r => (
              <tr key={r.product_code} className="hover:bg-white/[0.03] transition-colors">
                <Td className="font-mono text-on-surface-variant">{r.abc_rank}</Td>
                <Td><strong>{nameByCode.get(r.product_code) ?? r.product_code}</strong></Td>
                <Td><Badge className="bg-surface-variant text-on-surface-variant">{r.abc_class}</Badge></Td>
                <Td className="text-right font-mono font-bold">{money(r.abc_metric)}</Td>
                <Td className="text-right font-mono">{pct(r.cum_pct)}</Td>
                <Td>
                  {r.abc_basis === 'profit' ? (
                    <span className="text-on-surface-variant font-mono text-[0.6875rem]">lucro</span>
                  ) : (
                    <Badge className="bg-tertiary-container text-on-tertiary-container">receita*</Badge>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        )}
        <p className="mt-3 text-label-sm text-on-surface-variant">
          * Itens sem custo na venda caem para receita como base — a classificação deles não considera margem.
        </p>
      </Card>
    </div>
  )
}

// ── Preços ─────────────────────────────────────────────────────────────────

function Precos({
  metrics, canEdit, parados,
}: {
  metrics: InventoryMetric[]
  canEdit: boolean
  parados: InventoryMetric[]
}) {
  const [q, setQ] = useState('')
  const filtered = metrics.filter(m =>
    `${m.product_code} ${m.product_name ?? ''}`.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Custo vigente"
        subtitle="Editar o custo altera a margem — e a margem alimenta a comissão por lucro. Toda mudança é auditada."
        action={
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar produto..."
            className="bg-surface-variant text-on-surface rounded-lg px-3 py-2 text-label-sm border border-white/10 w-56"
          />
        }
      >
        {!canEdit && (
          <p className="mb-3 text-label-sm text-on-surface-variant">
            Somente leitura — seu perfil não pode editar custo.
          </p>
        )}
        <Table head={['Produto', { label: 'Custo vigente', align: 'right' }, { label: 'Valor em estoque', align: 'right' }, { label: 'Giro', align: 'right' }, '']}>
          {filtered.map(m => (
            <CostRow key={m.product_code} m={m} canEdit={canEdit} />
          ))}
        </Table>
      </Card>

      <Card title="Capital parado" subtitle="Baixo giro ou sem giro, ordenado por dinheiro imobilizado. Decisão: o que liquidar ou parar de comprar.">
        {parados.length === 0 ? (
          <Empty>Nenhum item parado.</Empty>
        ) : (
          <Table head={['Produto', { label: 'Qtd', align: 'right' }, { label: 'Capital parado', align: 'right' }, { label: 'Cobertura', align: 'right' }, 'Classe']}>
            {parados.map(m => (
              <tr key={m.product_code} className="hover:bg-white/[0.03] transition-colors">
                <Td><strong>{m.product_name ?? m.product_code}</strong></Td>
                <Td className="text-right font-mono">{num(m.current_qty, 0)}</Td>
                <Td className="text-right font-mono font-bold">{money(m.stock_value)}</Td>
                <Td className="text-right font-mono">{m.dos === null ? 'sem giro' : `${num(m.dos)} d`}</Td>
                <Td>{m.movement_class && <Badge className={MOVE_STYLE[m.movement_class]}>{MOVE_LABEL[m.movement_class]}</Badge>}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

function CostRow({ m, canEdit }: { m: InventoryMetric; canEdit: boolean }) {
  const [value, setValue] = useState(m.unit_cost === null ? '' : String(m.unit_cost))
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const dirty = value !== (m.unit_cost === null ? '' : String(m.unit_cost))

  const save = () => {
    setMsg(null)
    startTransition(async () => {
      const res = await updateProductCost(m.product_code, value)
      setMsg(res.ok ? 'Salvo' : res.error)
    })
  }

  return (
    <tr className="hover:bg-white/[0.03] transition-colors">
      <Td><strong>{m.product_name ?? m.product_code}</strong><div className="text-on-surface-variant font-mono text-[0.6875rem]">{m.product_code}</div></Td>
      <Td className="text-right">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={!canEdit || pending}
          placeholder="sem custo"
          className="bg-surface-variant text-on-surface font-mono text-right rounded-lg px-2 py-1 w-28 border border-white/10 disabled:opacity-50"
        />
      </Td>
      <Td className="text-right font-mono font-bold">{money(m.stock_value)}</Td>
      <Td className="text-right font-mono">{num(m.turnover_annualized, 1)}</Td>
      <Td>
        {canEdit && dirty && (
          <button
            onClick={save}
            disabled={pending}
            className="px-3 py-1 rounded-lg bg-primary-container text-on-primary-container font-mono text-[0.6875rem] font-medium disabled:opacity-50"
          >
            {pending ? '...' : 'Salvar'}
          </button>
        )}
        {msg && <span className="ml-2 font-mono text-[0.6875rem] text-on-surface-variant">{msg}</span>}
      </Td>
    </tr>
  )
}

// ── Primitivos ─────────────────────────────────────────────────────────────

function Card({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-xl p-card-padding">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-title-md font-bold text-on-surface">{title}</h3>
          {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

type HeadCol = string | { label: string; align?: 'left' | 'right' }

function Table({ head, children }: { head: HeadCol[]; children: React.ReactNode }) {
  return (
    <div className="-mx-5 -mb-5 mt-1 overflow-x-auto rounded-b-xl">
      <table className="w-full text-sm text-on-surface border-collapse">
        <thead className="bg-surface-container-high/50 border-y border-white/5">
          <tr>
            {head.map((col, i) => {
              const label = typeof col === 'string' ? col : col.label
              const align = typeof col === 'string' ? 'left' : (col.align ?? 'left')
              return (
                <th
                  key={i}
                  scope="col"
                  className={`font-mono text-[0.6875rem] uppercase tracking-wider py-3 px-4 text-on-surface-variant font-semibold whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`py-3 px-4 align-top whitespace-nowrap ${className}`}>{children}</td>
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded font-mono text-[0.6875rem] font-medium whitespace-nowrap ${className}`}>{children}</span>
}

function Unknown() {
  return <span className="text-on-surface-variant" title="Desconhecido — não é zero">—</span>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-on-surface-variant text-body-sm">{children}</p>
}
