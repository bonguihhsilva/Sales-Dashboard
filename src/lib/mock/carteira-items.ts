export interface MockProduct { sku: string; name: string; category: string; price: number }
export interface MockNota { order_ref: string; client_id: string; valor: number; quantity: number; sale_date: string }
export interface MockItem {
  order_ref: string; client_id: string; sale_date: string
  product_code: string; product_name: string; category: string
  qty: number; unit_price: number; total_price: number
}

// Catálogo derivado dos seeds reais (eletrônicos/perfumaria de CDE).
export const MOCK_CATALOG: MockProduct[] = [
  { sku: 'APL-IP15P-256', name: 'iPhone 15 Pro 256GB',     category: 'Celulares',     price: 1070 },
  { sku: 'SAM-S24U-512',  name: 'Galaxy S24 Ultra 512GB',  category: 'Celulares',     price: 1150 },
  { sku: 'XIA-RN13P-256', name: 'Redmi Note 13 Pro 256GB', category: 'Celulares',     price: 320 },
  { sku: 'APL-MBA-M3-256',name: 'MacBook Air M3 13"',      category: 'Notebooks',     price: 1200 },
  { sku: 'ASU-ROG-G16',   name: 'ROG Strix G16 RTX4060',   category: 'Notebooks',     price: 1500 },
  { sku: 'LG-OLED55C4',   name: 'Smart TV OLED 55" C4',    category: 'TVs',           price: 1400 },
  { sku: 'SAM-QN90-65',   name: 'Smart TV Neo QLED 65"',   category: 'TVs',           price: 1900 },
  { sku: 'SON-PS5-SLIM',  name: 'PlayStation 5 Slim',      category: 'Games',         price: 550 },
  { sku: 'DIO-SAUV-100',  name: 'Sauvage EDP 100ml',       category: 'Perfumaria',    price: 130 },
  { sku: 'CHA-BLEU-100',  name: 'Bleu de Chanel 100ml',    category: 'Perfumaria',    price: 120 },
  { sku: 'APL-APP2-USBC', name: 'AirPods Pro 2 USB-C',     category: 'Áudio/Acess.',  price: 166 },
  { sku: 'SON-XM5',       name: 'WH-1000XM5',              category: 'Áudio/Acess.',  price: 300 },
  { sku: 'CAS-GA2100',    name: 'G-Shock GA-2100',         category: 'Relógios',      price: 110 },
  { sku: 'APL-AWS9-45',   name: 'Apple Watch Series 9',    category: 'Relógios',      price: 430 },
]

// Hash determinístico simples (FNV-1a) — sem Math.random.
function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0)
}

export function generateMockItems(notas: MockNota[]): MockItem[] {
  const out: MockItem[] = []
  for (const nota of notas) {
    const h = hash(nota.order_ref)
    const nLines = (h % 3) + 1 // 1..3
    const chosen: MockProduct[] = []
    for (let i = 0; i < nLines; i++) chosen.push(MOCK_CATALOG[(h + i * 7) % MOCK_CATALOG.length])
    const baseSum = chosen.reduce((s, p) => s + p.price, 0)
    let allocated = 0
    chosen.forEach((p, i) => {
      const isLast = i === chosen.length - 1
      const share = isLast ? (nota.valor - allocated) : Math.round((p.price / baseSum) * nota.valor)
      allocated += share
      const qty = Math.max(1, Math.round(share / p.price))
      out.push({
        order_ref: nota.order_ref, client_id: nota.client_id, sale_date: nota.sale_date,
        product_code: p.sku, product_name: p.name, category: p.category,
        qty, unit_price: Math.round(share / qty), total_price: share,
      })
    })
  }
  return out
}
