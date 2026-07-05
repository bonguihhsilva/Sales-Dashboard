// Taxonomia do Centro de Treinamentos.
// A tela inicial agora é um seletor de categorias (grid de tiles clicáveis);
// ao entrar numa categoria (`?cat=<nome>`) o usuário vê só as trilhas dela.
// Este módulo é a fonte única da verdade sobre: quais categorias existem, em
// que ordem, com que ícone/cor, e a qual categoria cada trilha pertence.

// ── Meta das categorias (ordem = ordem de exibição na grade) ──────
export interface CategoriaMeta {
  nome: string
  icon: string
  cor: string // acento decorativo por categoria (fora do sistema de tokens)
}

export const CATEGORIAS: CategoriaMeta[] = [
  { nome: 'Vendas e Atendimento', icon: '💼', cor: '#C9933A' },
  { nome: 'Skin Care',            icon: '🧴', cor: '#E91E8C' },
  { nome: 'Perfumes',             icon: '🌸', cor: '#A855F7' },
  { nome: 'Informática',          icon: '💻', cor: '#3B82F6' },
  { nome: 'Celulares',            icon: '📱', cor: '#22C55E' },
  { nome: 'Áudio',                icon: '🎧', cor: '#F5A742' },
  { nome: 'Fotografia',           icon: '📷', cor: '#14B8A6' },
  { nome: 'Wearables',            icon: '⌚', cor: '#8B5CF6' },
  { nome: 'Outros',               icon: '📦', cor: '#7A7682' },
]

const CATEGORIA_FALLBACK = 'Outros'

// ── Mapa trilha → categoria (título exato) ────────────────────────
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

  'Fundamentos da Perfumaria': 'Perfumes',
  'Famílias e Ingredientes': 'Perfumes',
  'Grandes Casas e Perfumaria Árabe': 'Perfumes',
  'Nicho e Diagnóstico do Cliente': 'Perfumes',
  'Venda Consultiva em Perfumaria': 'Perfumes',
  'Mercado e Inteligência Comercial': 'Perfumes',

  'Fundamentos da Computação': 'Informática',
  'Hardware': 'Informática',
  'Montagem e Upgrade': 'Informática',
  'Redes de Computadores': 'Informática',
  'Equipamentos de Rede': 'Informática',
  'Sistemas Operacionais': 'Informática',
  'Segurança da Informação': 'Informática',
  'Diagnóstico e Solução de Problemas': 'Informática',
  'Produtos Tecnológicos': 'Informática',
  'Inteligência Comercial': 'Informática',
  'Mercado de Ciudad del Este': 'Informática',
  'Atendimento Técnico Consultivo': 'Informática',
  'Tendências Tecnológicas': 'Informática',
}

export function categoriaDe(titulo: string): string {
  return TRILHA_CATEGORIA[titulo] ?? CATEGORIA_FALLBACK
}

// ── Resumo agregado por categoria (para os tiles da tela inicial) ──
export interface CategoriaResumo extends CategoriaMeta {
  trilhaCount: number
  moduloCount: number
  totalXp: number
  concluidas: number
  progressoPct: number // média das trilhas da categoria
}

interface TrilhaAgregavel {
  titulo: string
  moduloCount: number
  totalXp: number
  progressoPct: number
}

export function resumoCategorias<T extends TrilhaAgregavel>(
  trilhas: T[]
): CategoriaResumo[] {
  const porCategoria = new Map<string, T[]>()
  for (const trilha of trilhas) {
    const cat = categoriaDe(trilha.titulo)
    const grupo = porCategoria.get(cat)
    if (grupo) grupo.push(trilha)
    else porCategoria.set(cat, [trilha])
  }

  return CATEGORIAS.map(meta => {
    const grupo = porCategoria.get(meta.nome) ?? []
    const trilhaCount = grupo.length
    const moduloCount = grupo.reduce((acc, t) => acc + t.moduloCount, 0)
    const totalXp = grupo.reduce((acc, t) => acc + t.totalXp, 0)
    const concluidas = grupo.filter(t => t.progressoPct === 100).length
    const progressoPct =
      trilhaCount > 0
        ? Math.round(grupo.reduce((acc, t) => acc + t.progressoPct, 0) / trilhaCount)
        : 0

    return { ...meta, trilhaCount, moduloCount, totalXp, concluidas, progressoPct }
  })
}

// ── Trilhas de uma categoria específica (para a tela de drill-down) ─
export function trilhasDaCategoria<T extends { titulo: string }>(
  trilhas: T[],
  categoria: string
): T[] {
  return trilhas.filter(t => categoriaDe(t.titulo) === categoria)
}
