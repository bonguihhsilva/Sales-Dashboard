'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { updateProductCost } from './actions'
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

      {tab === 'estoque' && <Estoque metrics={metrics} abcByCode={abcByCode} />}

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
        <Kpi label="Valor em estoque" value={money(summary?.total_stock_value)} hint="a custo vigente" />
        <Kpi label="SKUs" value={summary ? String(summary.total_skus) : '—'} hint={`${summary?.skus_sem_custo ?? 0} sem custo`} />
        <Kpi label="Em ruptura" value={summary ? String(summary.skus_em_quebra) : '—'} hint="estoque zerado hoje" tone={summary && summary.skus_em_quebra > 0 ? 'error' : undefined} />
        <Kpi label="Parados" value={summary ? String(summary.skus_parados) : '—'} hint="sem giro, capital preso" tone={summary && summary.skus_parados > 0 ? 'warn' : undefined} />
      </div>

      <Card title="Alertas de reposição" subtitle="Ruptura agora ou cobertura abaixo de 7 dias. Decisão: o que comprar esta semana.">
        {alertas.length === 0 ? (
          <Empty>Nenhum item em risco de ruptura.</Empty>
        ) : (
          <Table head={['Produto', 'Estoque', 'Venda/dia', 'Cobertura', 'Situação']}>
            {alertas.map(m => (
              <tr key={m.product_code} className="border-t border-white/5">
                <Td><strong>{m.product_name ?? m.product_code}</strong><div className="text-on-surface-variant text-label-sm">{m.product_code}</div></Td>
                <Td>{m.current_qty === null ? '—' : num(m.current_qty, 0)}</Td>
                <Td>{num(m.ads, 2)}</Td>
                <Td>{m.dos === null ? '—' : `${num(m.dos)} dias`}</Td>
                <Td>
                  {m.is_stockout_now ? (
                    <Badge className="bg-error/20 text-error">Sem estoque</Badge>
                  ) : (
                    <Badge className="bg-tertiary-container text-on-tertiary-container">Repor</Badge>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Alta rotatividade" subtitle="Giro rápido — são estes que não podem faltar.">
        {fastMovers.length === 0 ? (
          <Empty>Nenhum item classificado como alta rotatividade.</Empty>
        ) : (
          <Table head={['Produto', 'Estoque', 'Venda/dia', 'Cobertura', 'Giro anual']}>
            {fastMovers.slice(0, 10).map(m => (
              <tr key={m.product_code} className="border-t border-white/5">
                <Td><strong>{m.product_name ?? m.product_code}</strong></Td>
                <Td>{num(m.current_qty, 0)}</Td>
                <Td>{num(m.ads, 2)}</Td>
                <Td>{m.dos === null ? '—' : `${num(m.dos)} d`}</Td>
                <Td>{num(m.turnover_annualized, 1)}</Td>
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
        <Table head={['#', 'Produto', 'Qtd vendida', 'Receita', 'Lucro']}>
          {rows.map((r, i) => (
            <tr key={r.product_code} className="border-t border-white/5">
              <Td>{i + 1}</Td>
              <Td><strong>{r.product_name ?? r.product_code}</strong><div className="text-on-surface-variant text-label-sm">{r.product_code}</div></Td>
              <Td>{num(r.qty_sold, 0)}</Td>
              <Td>{money(r.revenue)}</Td>
              <Td>{money(r.profit)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  )
}

// ── Estoque ────────────────────────────────────────────────────────────────

function Estoque({
  metrics, abcByCode,
}: {
  metrics: InventoryMetric[]
  abcByCode: Map<string, AbcRow>
}) {
  const [q, setQ] = useState('')
  const filtered = metrics.filter(m => {
    const t = `${m.product_code} ${m.product_name ?? ''}`.toLowerCase()
    return t.includes(q.toLowerCase())
  })

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
      {filtered.length === 0 ? (
        <Empty>Nenhum produto encontrado.</Empty>
      ) : (
        <Table head={['Produto', 'Qtd', 'Custo', 'Valor', 'Giro', 'Cobertura', 'ABC', 'Classe', 'Snapshot']}>
          {filtered.map(m => {
            const a = abcByCode.get(m.product_code)
            return (
              <tr key={m.product_code} className="border-t border-white/5">
                <Td><strong>{m.product_name ?? m.product_code}</strong><div className="text-on-surface-variant text-label-sm">{m.product_code}</div></Td>
                <Td>{m.current_qty === null ? <Unknown /> : num(m.current_qty, 0)}</Td>
                <Td>{m.has_cost ? money(m.unit_cost) : <Unknown />}</Td>
                <Td>{money(m.stock_value)}</Td>
                <Td>{num(m.turnover_annualized, 1)}</Td>
                <Td>{m.dos === null ? '—' : `${num(m.dos)} d`}</Td>
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

function StockStatusCell({ m }: { m: InventoryMetric }) {
  if (m.stock_status === 'unknown')
    return <Badge className="bg-surface-variant text-on-surface-variant">Sem dado</Badge>
  if (m.stock_status === 'stale')
    return (
      <Badge className="bg-tertiary-container text-on-tertiary-container">
        {m.snapshot_staleness_days}d atrás
      </Badge>
    )
  return <span className="text-on-surface-variant text-label-sm">{m.last_snapshot_date}</span>
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
            <Kpi
              key={g}
              label={`Classe ${g}`}
              value={`${rows.length} SKUs`}
              hint={total > 0 ? `${((sum / total) * 100).toFixed(0)}% do lucro` : '—'}
            />
          )
        })}
      </div>

      <Card title="Curva ABC" subtitle="Classificada por lucro acumulado na janela. Decisão: onde concentrar capital de giro.">
        {abc.length === 0 ? (
          <Empty>Sem vendas na janela para classificar.</Empty>
        ) : (
          <Table head={['#', 'Produto', 'Classe', 'Métrica', 'Acumulado', 'Base']}>
            {abc.map(r => (
              <tr key={r.product_code} className="border-t border-white/5">
                <Td>{r.abc_rank}</Td>
                <Td><strong>{nameByCode.get(r.product_code) ?? r.product_code}</strong></Td>
                <Td><Badge className="bg-surface-variant text-on-surface-variant">{r.abc_class}</Badge></Td>
                <Td>{money(r.abc_metric)}</Td>
                <Td>{pct(r.cum_pct)}</Td>
                <Td>
                  {r.abc_basis === 'profit' ? (
                    <span className="text-on-surface-variant text-label-sm">lucro</span>
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
        <Table head={['Produto', 'Custo vigente', 'Valor em estoque', 'Giro', '']}>
          {filtered.map(m => (
            <CostRow key={m.product_code} m={m} canEdit={canEdit} />
          ))}
        </Table>
      </Card>

      <Card title="Capital parado" subtitle="Baixo giro ou sem giro, ordenado por dinheiro imobilizado. Decisão: o que liquidar ou parar de comprar.">
        {parados.length === 0 ? (
          <Empty>Nenhum item parado.</Empty>
        ) : (
          <Table head={['Produto', 'Qtd', 'Capital parado', 'Cobertura', 'Classe']}>
            {parados.map(m => (
              <tr key={m.product_code} className="border-t border-white/5">
                <Td><strong>{m.product_name ?? m.product_code}</strong></Td>
                <Td>{num(m.current_qty, 0)}</Td>
                <Td className="font-bold">{money(m.stock_value)}</Td>
                <Td>{m.dos === null ? 'sem giro' : `${num(m.dos)} d`}</Td>
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
    <tr className="border-t border-white/5">
      <Td><strong>{m.product_name ?? m.product_code}</strong><div className="text-on-surface-variant text-label-sm">{m.product_code}</div></Td>
      <Td>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={!canEdit || pending}
          placeholder="sem custo"
          className="bg-surface-variant text-on-surface rounded px-2 py-1 w-28 border border-white/10 disabled:opacity-50"
        />
      </Td>
      <Td>{money(m.stock_value)}</Td>
      <Td>{num(m.turnover_annualized, 1)}</Td>
      <Td>
        {canEdit && dirty && (
          <button
            onClick={save}
            disabled={pending}
            className="px-3 py-1 rounded bg-primary-container text-on-primary-container text-label-sm disabled:opacity-50"
          >
            {pending ? '...' : 'Salvar'}
          </button>
        )}
        {msg && <span className="ml-2 text-label-sm text-on-surface-variant">{msg}</span>}
      </Td>
    </tr>
  )
}

// ── Primitivos ─────────────────────────────────────────────────────────────

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'error' | 'warn' }) {
  const toneCls = tone === 'error' ? 'text-error' : tone === 'warn' ? 'text-on-tertiary-container' : 'text-on-surface'
  return (
    <div className="rounded-xl bg-surface-container p-4 border border-white/5">
      <div className="text-label-sm text-on-surface-variant">{label}</div>
      <div className={`text-title-lg font-bold mt-1 ${toneCls}`}>{value}</div>
      {hint && <div className="text-label-sm text-on-surface-variant mt-1">{hint}</div>}
    </div>
  )
}

function Card({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-surface-container border border-white/5 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-title-md font-bold text-on-surface">{title}</h3>
          {subtitle && <p className="text-label-sm text-on-surface-variant mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm text-on-surface">
        <thead>
          <tr className="text-left text-on-surface-variant text-label-sm">
            {head.map((h, i) => <th key={i} className="pb-2 pr-4 font-normal whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`py-3 pr-4 align-top whitespace-nowrap ${className}`}>{children}</td>
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-label-sm ${className}`}>{children}</span>
}

function Unknown() {
  return <span className="text-on-surface-variant" title="Desconhecido — não é zero">—</span>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-on-surface-variant text-body-sm">{children}</p>
}
