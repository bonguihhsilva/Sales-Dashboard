---
name: GDS Frame Dashboard
description: Painel interno de gestão comercial e RH para as lojas Da Silva em Ciudad del Este
colors:
  primary: "#c9a24b"
  on-primary: "#0a0a0b"
  secondary-blue: "#2e4fe3"
  on-secondary-blue: "#ffffff"
  background: "#0a0a0b"
  surface: "#141316"
  surface-variant: "#2b2a2e"
  surface-container-high: "#1c1b1f"
  surface-container-highest: "#2b2a2e"
  on-surface: "#ebe6da"
  on-surface-variant: "#ccc3d8"
  muted-foreground: "#958da1"
  border: "#2b2a2e"
  destructive: "#e5484d"
  success: "#22c55e"
  warning: "#eab308"
  info: "#2e4fe3"
typography:
  display:
    fontFamily: "var(--font-hanken), sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: "56px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-hanken), sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "40px"
  title:
    fontFamily: "var(--font-manrope), sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  body:
    fontFamily: "var(--font-manrope), sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "var(--font-jetbrains), monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  base: "4px"
  stack-sm: "8px"
  stack-md: "16px"
  stack-lg: "24px"
  gutter: "24px"
  card-padding: "20px"
  margin-page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  badge-status:
    rounded: "{rounded.full}"
    padding: "2px 10px"
    typography: "{typography.label}"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.card-padding}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
---

# Design System: GDS Frame Dashboard

## 1. Overview

**Creative North Star: "Black & Gold Control Room"**

Ferramenta de trabalho, não vitrine de marca — mas segue à risca a identidade GDS Frame
(Gold `#C9A24B` · Black `#0A0A0B` · Royal Blue `#2E4FE3`, ver `C:\Projetos\CLAUDE.md`).
Gerentes e vendedores das lojas Da Silva usam este painel em meio ao expediente de loja —
precisa transmitir controle, seriedade e a marca num relance. A superfície é preta por
padrão (fundo `#0a0a0b`, preto levemente tingido de frio, nunca `#000` puro), com o
**Gold** (`#c9a24b`) como accent dominante de ação e marca — botões primários, destaques
de dado, estados ativos — e o **Royal Blue** (`#2e4fe3`) reservado a foco de teclado, links
e estados interativos secundários (nunca a ação principal).

> Revisão 2026-08 — troca de direção deliberada: a versão anterior deste sistema usava Royal
> Blue como accent de ação e Gold só para conquista. O usuário pediu explicitamente o
> "template preto e dourado da GDS Frame"; esta revisão promove Gold a accent primário em
> toda a plataforma (Visão Geral → Compras) e reposiciona Blue como acento de interação.

O sistema rejeita explicitamente a estética de SaaS genérico: grids de cards uniformes sem
hierarquia, dashboard-by-numbers sem ponto de vista, hero-metric templates. Cada módulo
(RH, Compras, Ranking) usa cartões-seção (`glass-card`) com cabeçalho de ação clara,
tabelas densas com cabeçalho sombreado e badges semânticos — nunca cor decorativa.

**Key Characteristics:**
- Superfície preta única (`#0a0a0b`), sem tema claro — o contexto de uso (loja, turno,
  monitor compartilhado) não pede alternância.
- Gold é o accent dominante (ação, marca, destaque de dado); Blue é o acento de foco/link;
  os dois nunca competem pelo mesmo elemento.
- Densidade alta, mas organizada: tabelas carregam a maior parte da informação, não cards
  decorativos.
- Estados vazios são normais e devem soar neutros ("Nenhuma falta registrada"), nunca como
  erro.

## 2. Colors

Paleta restrita: preto quase puro domina a superfície, Gold é o accent de ação/marca, Blue
fica só para foco/link, e cores de status semânticas (escala Tailwind, opacidade 10-20%)
cobrem badges e tiles de resumo.

### Primary
- **GDS Gold** (`#c9a24b`): accent dominante — botões de submissão, estados ativos (pills,
  tabs, toggles), destaques de KPI, `podium-gold`. Texto sobre Gold é sempre preto
  (`on-primary #0a0a0b`), nunca branco.

### Secondary / Interactive
- **Royal Blue** (`#2e4fe3`): reservado a foco de input (`--ring`), links e estados
  interativos secundários que precisam se diferenciar de uma ação primária. Nunca usado
  como fundo de botão principal.

### Neutral
- **GDS Black** (`#0a0a0b`) — fundo (`background`), a base de tudo.
- **Raised Black** (`#141316`) — superfície de cartão (`surface`, `card`).
- **Elevated Charcoal** (`#2b2a2e`) — bordas, inputs, superfície container mais alta
  (`surface-variant`, `border`).
- **Warm White** (`#ebe6da`) — texto principal (`on-surface`, `foreground`), levemente
  quente para não ficar clínico sobre o preto.
- **Muted Lavender-Gray** (`#958da1`) — texto secundário, labels, placeholders
  (`muted-foreground`).

### Status roles (badges, tiles)
- **Success** (`green-500`, `#22c55e` a 10-20% de opacidade): disponível, aprovado, abonado.
- **Error** (`red-500`/`destructive` `#e5484d`/`#ef4444`): vencido, negado, falta sem saldo.
- **Warning** (`yellow-500`/`#f5a742`): pendente, aguardando justificativa.
- **Info** (`Royal Blue #2e4fe3`): descontou dia livre, aguardando aprovação, foco de input.

### Named Rules
**The Gold-Forward Rule.** Gold é o accent de ação em toda a plataforma — botões primários,
pills ativas, valores em destaque. Blue nunca compete com ele numa CTA — Blue é sempre
foco/link, nunca comando.
**The Status-Color Rule.** Cor em badge e tile de resumo sempre carrega significado
semântico (disponível/vencido/pendente), nunca é decorativa. Se uma cor não mapeia a um
estado real, não deveria estar lá.

## 3. Typography

**Display Font:** Hanken Grotesk (`var(--font-hanken)`), com fallback sans-serif
**Body Font:** Manrope (`var(--font-manrope)`), com fallback sans-serif
**Label/Mono Font:** JetBrains Mono (`var(--font-jetbrains)`), com fallback monospace

**Character:** Hanken Grotesk carrega peso e presença nos títulos de seção e CTAs (a voz
"de comando" da ferramenta); Manrope é neutro e legível para corpo de texto; JetBrains Mono
marca todo dado tabular, timestamp e label — o "código de barras" visual que sinaliza "isto
é dado, não prosa".

> Nota histórica: versões anteriores de várias telas (RH, Comissão, Treinamentos, Mural,
> Perfil, Config) referenciavam `Syne`/`DM Mono` via `style={{ fontFamily: ... }}` inline —
> fontes que não são mais carregadas em `layout.tsx`. Isso causava fallback silencioso para
> sans-serif genérico do sistema nessas telas. Corrigido em 2026-08 (233 ocorrências, ~30
> arquivos) para usar `var(--font-hanken)` / `var(--font-jetbrains)`.

### Hierarquia
- **Display** (700, 48px/56px, letter-spacing -0.02em): reservado para números-âncora de
  KPI (ex: valor total vendido).
- **Headline** (600, 32px/40px): títulos de página.
- **Title** (600, 20px/28px): títulos de seção/cartão.
- **Body** (400, 16px/24px): texto corrido, descrições, subtítulos.
- **Label** (500, 12px/16px, letter-spacing 0.05em, uppercase): cabeçalhos de tabela,
  labels de formulário, badges — sempre em JetBrains Mono.

### Named Rules
**The Mono-Data Rule.** Qualquer valor que seja dado (data, número, status, ID) usa
`font-mono`. Qualquer texto que seja prosa usa `font-sans` (Manrope). Nunca misturar as
duas funções na mesma família.

## 4. Elevation

Sistema majoritariamente flat com uma única camada de profundidade: o `glass-card` (fundo
`surface` + borda sutil dourada `rgba(201,162,75,0.12)` + sombra dupla suave sobre preto).
Não há elevação em múltiplos degraus — um cartão está "no plano" ou é o próprio
`glass-card` de seção. Tabelas usam sombreamento de fundo (`surface-container-high` em
opacidade) para diferenciar cabeçalho de corpo, não sombra.

### Shadow Vocabulary
- **glass-card** (`box-shadow: 0 1px 2px rgba(0,0,0,0.6), 0 12px 28px -12px rgba(0,0,0,0.8)`):
  toda seção de conteúdo (cartões de RH, Compras, Ranking).
- **podium-gold** (`box-shadow: 0 0 15px rgba(201,162,75,0.25)`): glow reservado
  exclusivamente ao 1º lugar de ranking — não reutilizar fora desse contexto.

### Named Rules
**The Flat-By-Default Rule.** Superfícies são planas em repouso. Sombra aparece só no
`glass-card` (contêiner de seção) e no glow de conquista — nunca em botões ou badges comuns.

## 5. Components

### Buttons
- **Shape:** cantos levemente arredondados (`rounded-lg`, 8px) — nunca totalmente quadrado
  nem pill, exceto badges.
- **Primary:** fundo `{colors.primary}` (Gold), texto preto (`on-primary`),
  `font-display-lg` (Hanken) em peso bold, padding `10px 16px`. Hover: `bg-primary/90`.
- **Ghost:** fundo transparente, texto `muted-foreground`, borda `1px solid` branco a 10%,
  mesmo padding. Usado para "Cancelar" e ações secundárias.

### Badges (status chips)
- **Style:** `rounded-full`, padding `2px 10px`, `font-mono text-[11px]`, cor de fundo em
  opacidade 15-20% da cor de status + texto sólido na mesma cor (ex:
  `bg-green-500/20 text-green-500`).
- **State:** cor determinada pelo status semântico (ver seção Colors), nunca por
  preferência visual pontual.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px) para cartões de seção; `rounded-xl` (12px) para
  sub-containers como wrapper de tabela.
- **Background:** `surface` (`#141316`) sobre `background` (`#0a0a0b`).
- **Shadow Strategy:** `glass-card` (ver Elevation).
- **Border:** `1px solid` branco a ~5-10% de opacidade (ou dourado a 12% no `glass-card`) —
  nunca borda sólida colorida.
- **Internal Padding:** `card-padding` (20px) ou `p-6` em seções maiores.

### Inputs / Fields
- **Style:** fundo `surface`, borda `1px solid` branco a 10%, `rounded-lg`, texto em
  `font-mono`.
- **Focus:** borda muda para Royal Blue (`--ring`) — sem glow adicional. Foco é o único
  lugar onde Blue aparece como cor "de ação".

### Tables
- **Header:** fundo `surface-container-high` a 50% de opacidade, labels em
  `font-mono uppercase text-[0.65rem] tracking-wider text-muted-foreground`, borda inferior
  branca a 5%.
- **Rows:** divididas por `divide-y divide-border`; hover em `bg-secondary/20` (leve
  realce azul — usado só no hover de linha, nunca em botão).
- **Numeric columns:** alinhadas à direita, `font-mono`, valores de destaque em `font-bold`.

## 6. Do's and Don'ts

### Do:
- **Do** usar Gold (`#c9a24b`) como accent dominante de ação em toda a plataforma — botões
  primários, pills ativas, valores em destaque.
- **Do** usar Royal Blue (`#2e4fe3`) só para foco de input, links e realces de hover
  secundários — nunca como fundo de botão de ação principal.
- **Do** expressar status (disponível/vencido/pendente/aprovado) sempre com o mesmo par
  cor-de-fundo-translúcida + texto-sólido (`bg-{cor}-500/20 text-{cor}-500`).
- **Do** usar `font-mono` (JetBrains) para todo dado tabular, data e label uppercase.
- **Do** manter cabeçalho de tabela sombreado (`bg-surface-container-high/50`) e linhas com
  hover sutil — é o padrão já estabelecido entre módulos (Compras, RH admin).

### Don't:
- **Don't** usar grid de cards uniformes sem hierarquia nem dashboard-by-numbers sem ponto
  de vista — é o anti-padrão explícito deste produto.
- **Don't** hardcodar cores hex de badge/status fora da escala semântica (ex: verde/vermelho
  pastel de tema claro) — quebra o sistema escuro e destoa do resto da plataforma.
- **Don't** usar Royal Blue como cor de botão de ação principal — Blue é exclusivo de
  foco/link.
- **Don't** misturar família de fonte "de dado" (mono) com família "de prosa" (sans) no
  mesmo elemento.
- **Don't** introduzir nova sombra ou elevação fora do `glass-card` — o sistema é
  flat-by-default.
