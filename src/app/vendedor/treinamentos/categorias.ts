export const CATEGORIA_ORDEM = ['Vendas e Atendimento', 'Skin Care', 'Perfumes'] as const

const TRILHA_CATEGORIA: Record<string, string> = {
  'Fundamentos de Vendas': 'Vendas e Atendimento',
  'Processo de Venda': 'Vendas e Atendimento',
  'Fundamentos de Vendas Consultivas': 'Vendas e Atendimento',
  'Negociação e Objeções': 'Vendas e Atendimento',
  'Excelência em Atendimento ao Cliente': 'Vendas e Atendimento',
  'Estratégia e Liderança': 'Vendas e Atendimento',
  'Atacado B2B': 'Vendas e Atendimento',
  'Vendas Online e Atendimento Web': 'Vendas e Atendimento',
  'Estratégia Profissional': 'Vendas e Atendimento',

  'Fundamentos do K-Beauty': 'Skin Care',
  'Conhecendo a Pele': 'Skin Care',
  'Ingredientes Ativos': 'Skin Care',
  'Rotina e Marcas': 'Skin Care',

  'Perfumaria de Alto Nível': 'Perfumes',
}

const CATEGORIA_FALLBACK = 'Outros'

export function categorizarTrilhas<T extends { titulo: string }>(
  trilhas: T[]
): { categoria: string; trilhas: T[] }[] {
  const porCategoria = new Map<string, T[]>()

  for (const trilha of trilhas) {
    const categoria = TRILHA_CATEGORIA[trilha.titulo] ?? CATEGORIA_FALLBACK
    const grupo = porCategoria.get(categoria)
    if (grupo) {
      grupo.push(trilha)
    } else {
      porCategoria.set(categoria, [trilha])
    }
  }

  const ordemFinal = [...CATEGORIA_ORDEM, CATEGORIA_FALLBACK]

  return ordemFinal
    .filter(categoria => porCategoria.has(categoria))
    .map(categoria => ({ categoria, trilhas: porCategoria.get(categoria)! }))
}
