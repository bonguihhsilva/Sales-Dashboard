// Paleta canônica do Centro de Treinamentos (LMS).
// Antes, cada tela redefinia um objeto `C` local com valores que divergiam
// sutilmente (fundo do hub em #141418 vs. #0C0C0E nas telas internas, e o
// player de lição usando os tokens globais azul/lima). Este módulo unifica
// tudo numa única ilha visual dourado-sobre-preto, coerente com a identidade
// GDS (Gold · Black · Royal Blue).
//
// As chaves são um superconjunto de todas as usadas pelas telas, então cada
// arquivo apenas troca o objeto local pelo import — sem renomear referências.
export const LMS = {
  // ── Fundos (unificados: página quase-preta, cards elevados) ──
  bg:           '#0C0C0E',
  abyss:        '#0C0C0E',
  deep:         '#0C0C0E', // antes #141418 no hub/gerencial — unificado p/ continuidade
  elevated:     '#1C1C22',
  surface:      '#1C1C22',
  surface2:     '#252530',

  // ── Linhas ──
  border:       'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',

  // ── Texto (neutros com leve tom quente, melhor legibilidade no miúdo) ──
  text:         '#F2F1F4',
  muted:        '#7A7682',

  // ── Acentos de marca ──
  gold:         '#C9933A',
  goldBg:       'rgba(201,147,58,0.10)',
  goldBorder:   'rgba(201,147,58,0.25)',
  amber:        '#F5A742',
  blue:         '#3B82F6',
  blueBg:       'rgba(59,130,246,0.10)',
  blueBorder:   'rgba(59,130,246,0.25)',
  green:        '#22C55E',
  red:          '#EF4444',
  pink:         '#E91E8C', // trilha de skincare
} as const

// Escala de raio única — antes misturava 0.3125 / 0.5 / 0.75 / 0.875rem ao acaso.
export const LMS_RADIUS = {
  chip: '0.375rem',
  sm:   '0.5rem',
  md:   '0.75rem',
  lg:   '0.875rem',
} as const
