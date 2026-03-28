export function fmtCurrency(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-PY')
}

export function fmtCurrencyFull(n: number): string {
  return '$' + n.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtK(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return '$' + (n / 1_000).toFixed(0) + 'k'
  return '$' + Math.round(n)
}

export function metaLevel(sold: number, meta1: number, meta2: number, meta3: number): number {
  if (sold >= meta3) return 3
  if (sold >= meta2) return 2
  if (sold >= meta1) return 1
  return 0
}

export function bonusAmount(level: number, bonus1: number, bonus2: number, bonus3: number): number {
  return [0, bonus1, bonus2, bonus3][level] ?? 0
}

export function recencyColor(daysAgo: number): string {
  if (daysAgo <= 1) return '#c8f542'
  if (daysAgo <= 3) return '#42d9f5'
  if (daysAgo <= 7) return '#f5a742'
  return '#6b6f7a'
}

export function recencyLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'hoje'
  if (daysAgo === 1) return 'ontem'
  return `${daysAgo}d atrás`
}

export const STORE_COLORS: Record<string, string> = {
  Jebai:      '#7b61ff',
  'Paje-MKT': '#42d9f5',
  'Paje-Caixa': '#f5a742',
}

export const STORE_LABELS: Record<string, string> = {
  Jebai:       'Jebai',
  'Paje-MKT':  'Pajé 1',
  'Paje-Caixa':'Pajé 2',
}
