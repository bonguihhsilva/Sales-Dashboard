---
name: GDS Frame Dashboard
description: Painel interno de gestão comercial e RH para as lojas Da Silva em Ciudad del Este
colors:
  primary: "#3b82f6"
  on-primary: "#ffffff"
  secondary-gold: "#e9c349"
  on-secondary-gold: "#3c2f00"
  background: "#0b1326"
  surface: "#171f33"
  surface-variant: "#2d3449"
  surface-container-high: "#222a3d"
  surface-container-highest: "#2d3449"
  on-surface: "#dae2fd"
  on-surface-variant: "#ccc3d8"
  muted-foreground: "#958da1"
  border: "#2d3449"
  destructive: "#e5484d"
  success: "#22c55e"
  warning: "#eab308"
  info: "#3b82f6"
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

**Creative North Star: "The Night-Shift Control Room"**

Ferramenta de trabalho, não vitrine de marca. Gerentes e vendedores das lojas Da Silva usam este painel em meio ao expediente de loja — precisa transmitir controle e seriedade num relance, sem fricção decorativa. A superfície é escura por padrão (fundo `#0b1326`, um azul-marinho quase preto), com um único acento de identidade — o Royal Blue (`#3b82f6`) — carregando ações primárias e destaques de dado, e o Gold (`#e9c349`) reservado estritamente para conquista/premiação (pódio de ranking, badges de mérito), nunca para ação genérica.

O sistema rejeita explicitamente a estética de SaaS genérico: grids de cards uniformes sem hierarquia, dashboard-by-numbers sem ponto de vista, hero-metric templates. Em vez disso, cada módulo (RH, Compras, Ranking) usa cartões-seção (`glass-card`) com cabeçalho de ação clara, tabelas densas com cabeçalho sombreado e badges semânticos — nunca cor decorativa.

**Key Characteristics:**
- Superfície escura única (`#0b1326`), sem tema claro — o contexto de uso (loja, turno, monitor compartilhado) não pede alternância.
- Um acento de ação (Royal Blue), um acento de conquista (Gold) — nunca os dois competindo pelo mesmo elemento.
- Densidade alta, mas organizada: tabelas carregam a maior parte da informação, não cards decorativos.
- Estados vazios são normais e devem soar neutros ("Nenhuma falta registrada"), nunca como erro.

## 2. Colors

Paleta restrita: neutros escuros dominam a superfície, um único acento de ação (Royal Blue) e cores de status semânticas emprestadas da escala Tailwind (verde/vermelho/âmbar/azul em opacidade 10-20%) para badges e tiles de resumo.

### Primary
- **Royal Blue** (`#3b82f6`): ação primária — botões de submissão, links ativos, foco de input, `--ring`. É a única cor "viva" fora do sistema de status; usada com moderação (botões, foco), nunca como preenchimento de superfície grande.

### Secondary
- **GDS Gold** (`#e9c349`): reservado para conquista e destaque de mérito (pódio, badges de melhor vendedor). Nunca usado em CTA genérico — se aparece num botão comum, é erro de aplicação.

### Neutral
- **Deep Navy** (`#0b1326`) — fundo (`background`), a base de tudo.
- **Raised Navy** (`#171f33`) — superfície de cartão (`surface`, `card`).
- **Elevated Slate** (`#2d3449`) — bordas, inputs, superfície container mais alta (`surface-variant`, `border`).
- **Soft Ice** (`#dae2fd`) — texto principal (`on-surface`, `foreground`).
- **Muted Lavender-Gray** (`#958da1`) — texto secundário, labels, placeholders (`muted-foreground`).

### Status roles (badges, tiles)
- **Success** (`green-500`, `#22c55e` a 10-20% de opacidade): disponível, aprovado, abonado.
- **Error** (`red-500`/`destructive` `#e5484d`/`#ef4444`): vencido, negado, falta sem saldo.
- **Warning** (`yellow-500`, `#eab308`): pendente, aguardando justificativa.
- **Info** (`blue-500`, coincide com o primary `#3b82f6`): descontou dia livre, aguardando aprovação.

### Named Rules
**The One Accent Rule.** Royal Blue é a única cor usada para ação (botões, foco, links). Gold nunca compete com ela num CTA — Gold é sempre conquista, nunca comando.
**The Status-Color Rule.** Cor em badge e tile de resumo sempre carrega significado semântico (disponível/vencido/pendente), nunca é decorativa. Se uma cor não mapeia a um estado real, não deveria estar lá.

## 3. Typography

**Display Font:** Hanken Grotesk (`var(--font-hanken)`), com fallback sans-serif
**Body Font:** Manrope (`var(--font-manrope)`), com fallback sans-serif
**Label/Mono Font:** JetBrains Mono (`var(--font-jetbrains)`), com fallback monospace

**Character:** Hanken Grotesk carrega peso e presença nos títulos de seção e CTAs (a voz "de comando" da ferramenta); Manrope é neutro e legível para corpo de texto; JetBrains Mono marca todo dado tabular, timestamp e label — o "código de barras" visual que sinaliza "isto é dado, não prosa".

### Hierarquia
- **Display** (700, 48px/56px, letter-spacing -0.02em): reservado para números-âncora de KPI (ex: valor total vendido).
- **Headline** (600, 32px/40px): títulos de página.
- **Title** (600, 20px/28px): títulos de seção/cartão.
- **Body** (400, 16px/24px): texto corrido, descrições, subtítulos.
- **Label** (500, 12px/16px, letter-spacing 0.05em, uppercase): cabeçalhos de tabela, labels de formulário, badges — sempre em JetBrains Mono.

### Named Rules
**The Mono-Data Rule.** Qualquer valor que seja dado (data, número, status, ID) usa `font-mono`. Qualquer texto que seja prosa usa `font-sans` (Manrope). Nunca misturar as duas funções na mesma família.

## 4. Elevation

Sistema majoritariamente flat com uma única camada de profundidade: o `glass-card` (fundo `surface` + borda sutil `rgba(96,165,250,0.10)` + sombra dupla suave). Não há elevação em múltiplos degraus — um cartão está "no plano" ou é o próprio `glass-card` de seção. Tabelas usam sombreamento de fundo (`surface-container-high` em opacidade) para diferenciar cabeçalho de corpo, não sombra.

### Shadow Vocabulary
- **glass-card** (`box-shadow: 0 1px 2px rgba(3,7,18,0.5), 0 12px 28px -12px rgba(11,19,38,0.7)`): toda seção de conteúdo (cartões de RH, Compras, Ranking).
- **podium-gold** (`box-shadow: 0 0 15px rgba(233,195,73,0.2)`): glow reservado exclusivamente ao 1º lugar de ranking — não reutilizar fora desse contexto.

### Named Rules
**The Flat-By-Default Rule.** Superfícies são planas em repouso. Sombra aparece só no `glass-card` (contêiner de seção) e no glow de conquista — nunca em botões ou badges comuns.

## 5. Components

### Buttons
- **Shape:** cantos levemente arredondados (`rounded-lg`, 8px) — nunca totalmente quadrado nem pill, exceto badges.
- **Primary:** fundo `{colors.primary}`, texto branco, `font-display-lg` (Hanken) em peso bold, padding `10px 16px`. Hover: `bg-primary/90`.
- **Ghost:** fundo transparente, texto `muted-foreground`, borda `1px solid` branco a 10%, mesmo padding. Usado para "Cancelar" e ações secundárias.

### Badges (status chips)
- **Style:** `rounded-full`, padding `2px 10px`, `font-mono text-[11px]`, cor de fundo em opacidade 15-20% da cor de status + texto sólido na mesma cor (ex: `bg-green-500/20 text-green-500`).
- **State:** cor determinada pelo status semântico (ver seção Colors), nunca por preferência visual pontual.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px) para cartões de seção; `rounded-xl` (12px) para sub-containers como wrapper de tabela.
- **Background:** `surface` (`#171f33`) sobre `background` (`#0b1326`).
- **Shadow Strategy:** `glass-card` (ver Elevation).
- **Border:** `1px solid` branco a ~5-10% de opacidade — nunca borda sólida colorida.
- **Internal Padding:** `card-padding` (20px) ou `p-6` em seções maiores.

### Inputs / Fields
- **Style:** fundo `surface`, borda `1px solid` branco a 10%, `rounded-lg`, texto em `font-mono`.
- **Focus:** borda muda para `{colors.primary}` — sem glow adicional.

### Tables
- **Header:** fundo `surface-container-high` a 50% de opacidade, labels em `font-mono uppercase text-[0.65rem] tracking-wider text-muted-foreground`, borda inferior branca a 5%.
- **Rows:** divididas por `divide-y divide-border`; hover em `bg-secondary/10` (leve realce dourado, não azul — diferencia hover de foco/seleção que usa o primary).
- **Numeric columns:** alinhadas à direita, `font-mono`, valores de destaque em `font-bold`.

## 6. Do's and Don'ts

### Do:
- **Do** usar Royal Blue (`#3b82f6`) como único acento de ação em toda a plataforma.
- **Do** expressar status (disponível/vencido/pendente/aprovado) sempre com o mesmo par cor-de-fundo-translúcida + texto-sólido (`bg-{cor}-500/20 text-{cor}-500`).
- **Do** usar `font-mono` (JetBrains) para todo dado tabular, data e label uppercase.
- **Do** manter cabeçalho de tabela sombreado (`bg-surface-container-high/50`) e linhas com hover sutil — é o padrão já estabelecido entre módulos (Compras, RH admin).

### Don't:
- **Don't** usar grid de cards uniformes sem hierarquia nem dashboard-by-numbers sem ponto de vista — é o anti-padrão explícito deste produto.
- **Don't** hardcodar cores hex de badge/status fora da escala semântica (ex: verde/vermelho pastel de tema claro) — quebra o sistema escuro e destoa do resto da plataforma.
- **Don't** usar Gold como cor de botão ou ação comum — Gold é exclusivo de conquista/ranking.
- **Don't** misturar família de fonte "de dado" (mono) com família "de prosa" (sans) no mesmo elemento.
- **Don't** introduzir nova sombra ou elevação fora do `glass-card` — o sistema é flat-by-default.
