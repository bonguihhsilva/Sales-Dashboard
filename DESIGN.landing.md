# Design System: GDS Frame Dashboard — Landing Page

## 1. Visual Theme & Atmosphere

Dark-first cockpit aesthetic. A command center for serious sales managers — not a startup flyer.
The atmosphere is dense but legible: like looking at a Bloomberg terminal that's been designed
by someone who cares about craft. Deep near-black backgrounds, gold precision accents,
and Royal Blue as a semantic data color embedded in product previews.

- **Density:** 7/10 — product-preview heavy, data on display
- **Variance:** 7/10 — asymmetric hero, zig-zag features, offset grids
- **Motion:** 7/10 — spring-physics entry, animated counters, perpetual dashboard float

The design communicates: "this is a real system built for real numbers."
No startup softness. No friendly rounded-everything. Sharp but not harsh.
GDS Gold is the single accent — warm, confident, Latin American premium.

---

## 2. Color Palette & Roles

- **Abyss Canvas** (#0C0C0E) — Root background, page base
- **Deep Surface** (#141418) — Panel and section backgrounds
- **Elevated Surface** (#1C1C22) — Cards, modals, raised containers
- **Ghost Border** (rgba(255,255,255,0.06)) — 1px structural dividers, card edges
- **Luminous Text** (#F0F0F3) — Primary headlines and body text
- **Steel Muted** (#6B6B78) — Descriptions, metadata, helper text
- **GDS Gold** (#C9933A) — Single accent: CTAs, active states, focus rings, price highlights. Max 1 use per visual cluster.
- **Data Blue** (#3B82F6) — Semantic only: charts, progress bars, data indicators inside product preview mockups. Never for UI chrome.
- **Growth Green** (#16A34A) — Semantic only: positive delta indicators (+X%) inside product preview. Never for UI chrome.
- **Alert Amber** (#D97706) — Semantic only: warning states inside product preview.

**Banned:** pure black (#000000), pure white (#FFFFFF), purple gradients, neon cyan, oversaturated blues.

---

## 3. Typography Rules

- **Display / Hero Headlines:** `Syne` — weight 700–800. Track tight (-0.03em). Scale driven by weight contrast, not excessive size. Max hero headline: clamp(2.5rem, 5vw, 4.5rem).
- **Section Headlines:** `Syne` — weight 600. clamp(1.5rem, 3vw, 2.5rem).
- **Body / Descriptions:** `Outfit` — weight 400. Leading 1.7. Max 65ch per line. Color: Steel Muted (#6B6B78).
- **Data / Metrics / Numbers:** `DM Mono` — weight 500. Tabular numbers. Used for all KPI values in the page (stat counters, pricing numbers, performance metrics).
- **Labels / Badges / Tags:** `DM Mono` weight 400, uppercase, letter-spacing 0.08em, size 0.75rem.
- **Banned:** Inter, system-ui fallbacks for display copy, generic web-safe fonts. Serif fonts entirely banned.

**Loading strategy:** Preconnect to Google Fonts. Load Syne and Outfit together. DM Mono subset to numerals + Latin.

---

## 4. Hero Section

**Structure:** Left-aligned asymmetric split. NOT centered. NOT full-width text.

**Left column (55% viewport):**
- Eyebrow label: `DM Mono` uppercase tag — "Gestão Comercial · Multi-loja · SaaS"
- Main headline: Two lines max. Example pattern: "Seus vendedores, [inline visual] seus números, sua regra." — where [inline visual] is a small product screenshot thumbnail sitting inline at type-height, rounded (0.5rem radius).
- Subheadline: One sentence, `Outfit` weight 400. Focus on the core value: ranking + comissões + importação.
- Single primary CTA: Gold filled button — "Ver demonstração ao vivo" → links to demo account. No secondary CTA. No "Learn more" link.
- Social proof strip below CTA: 3 real-ish metrics in DM Mono — "3 lojas · 120+ vendas analisadas · Comissão automática"

**Right column (45% viewport):**
- Dashboard screenshot/mockup — the actual product UI with data visible.
- Slight perpetual float animation (translateY 0px ↔ -8px, 4s ease-in-out infinite).
- Subtle gold glow behind the image: radial gradient rgba(201,147,58,0.12), 400px centered.
- No caption. No label. The product speaks for itself.

**Banned in Hero:**
- Centered text layout
- "Scroll to explore" or any scroll indicator
- Secondary "saiba mais" / "ver planos" CTA below primary
- Stock photography
- Generic "team smiling" imagery

---

## 5. Component Stylings

**Primary Button (CTA):**
- Fill: GDS Gold (#C9933A)
- Text: #0C0C0E (dark on gold), Syne weight 600, 1rem
- Padding: 0.875rem 2rem
- Border-radius: 0.5rem
- Active state: translateY(1px) + brightness(0.92) — tactile push
- Hover: brightness(1.08) + box-shadow: 0 0 20px rgba(201,147,58,0.25)
- No outer neon glow. No gradient fill.

**Ghost Button (secondary actions):**
- Background: transparent
- Border: 1px solid rgba(201,147,58,0.4)
- Text: GDS Gold (#C9933A)
- Hover: Background rgba(201,147,58,0.08)

**Feature Cards:**
- Background: Elevated Surface (#1C1C22)
- Border: 1px solid Ghost Border (rgba(255,255,255,0.06))
- Border-radius: 1.5rem
- Padding: 2rem
- Shadow: 0 4px 24px rgba(0,0,0,0.4) — deep, not warm
- Icon area: 2.5rem × 2.5rem, rounded 0.75rem, Gold tinted background rgba(201,147,58,0.12)
- Layout: 2-column zig-zag on desktop (alternating image left / text right). NEVER 3 equal columns.

**Pricing Cards:**
- Base card: Elevated Surface, Ghost Border
- Highlighted card (recommended): Border upgraded to 1px solid rgba(201,147,58,0.4) + subtle gold shadow rgba(201,147,58,0.1)
- Price: DM Mono weight 600, Luminous Text, size 2.5rem. Currency symbol smaller (1.25rem).
- Feature list: checkmarks in Gold, text in Steel Muted
- CTA: Primary Gold button for recommended, Ghost button for others

**Stat Counter Chips (social proof metrics):**
- Background: Deep Surface (#141418)
- Border: 1px solid Ghost Border
- Border-radius: 0.75rem
- Number: DM Mono weight 700, GDS Gold
- Label: Outfit weight 400, Steel Muted, 0.875rem
- Number animates from 0 → final value when section enters viewport (IntersectionObserver + spring easing, ~1.2s)

**Navigation Bar:**
- Background: rgba(12,12,14,0.85) + backdrop-blur(16px)
- Border-bottom: 1px solid Ghost Border
- Logo: Syne weight 700, Luminous Text. "GDS" in Gold, "Frame" in Luminous.
- Links: Outfit, Steel Muted → Luminous Text on hover
- CTA in nav: Small ghost button — "Entrar" + primary CTA "Começar agora"

**Testimonial / Social Proof:**
- NOT photo + name cards. Use metric-forward format:
  - Large DM Mono number (e.g., "+38%") in Gold
  - Short context below in Outfit: "de aumento no registro de vendas no primeiro mês"
  - Loja name as ghost tag: "Loja 1 · Jebai"

---

## 6. Layout Principles

**Grid system:** CSS Grid exclusively. No flexbox percentage math. No `calc()` hacks.
```
.container { max-width: 1400px; margin: 0 auto; padding: 0 clamp(1.5rem, 4vw, 4rem); }
```

**Section spacing:** `padding: clamp(5rem, 10vw, 9rem) 0` — generous breathing room between sections.

**Hero split:** `grid-template-columns: 55fr 45fr; gap: 4rem; align-items: center;`

**Feature zig-zag:** `grid-template-columns: 1fr 1fr; gap: 4rem` — alternates which side has the image/text via CSS order or nth-child.

**Stats band:** Single horizontal row with 3 metric chips. Use `grid-template-columns: repeat(3, 1fr)` — NOT cards, just a borderless strip with internal separators.

**Pricing section:** `grid-template-columns: repeat(3, 1fr); gap: 1.5rem` — the recommended plan card is slightly taller (scale: 1.02) with shadow distinction.

**No element overlap.** Absolute positioning only for decorative background elements (grain, radial glows). Never for content.

**Full-height sections:** `min-h-[100dvh]` — never `height: 100vh`.

---

## 7. Responsive Rules

**< 768px (Mobile):**
- Hero: Single column. Product screenshot below headline. Image fills full width, capped at 90vw.
- Feature cards: Single column. Zig-zag becomes linear (text → image alternation removed).
- Pricing: Single column scroll. Recommended card maintains gold border highlight.
- Navigation: Logo left + hamburger right. Menu slides down from top (not side drawer).
- Stats band: 1 + 2 grid (first stat full width, two below in 2-col).
- CTA button: Full width on mobile.
- Inline headline images: stack below headline text on mobile.

**Typography clamps:**
- Hero headline: `clamp(2rem, 6vw, 4.5rem)`
- Section headline: `clamp(1.5rem, 3.5vw, 2.5rem)`
- Body: minimum 1rem / 16px always
- All interactive elements: minimum 44px tap target

**No horizontal scroll permitted.** `overflow-x: hidden` on body as failsafe, but no element should cause overflow.

---

## 8. Motion & Interaction

**Spring physics baseline:** `stiffness: 120, damping: 18` — premium, weighted feel. Zero linear easing.

**Page load sequence (staggered):**
1. Nav fades in (0ms, opacity 0→1, 300ms)
2. Hero eyebrow tag slides up (100ms delay)
3. Hero headline slides up (200ms delay)
4. Hero subtext slides up (350ms delay)
5. Hero CTA slides up + gold button pulse starts (500ms delay)
6. Dashboard preview floats in from right (400ms delay, spring translateX)

**Perpetual micro-interactions:**
- Dashboard preview: infinite float (translateY ±8px, 4s ease-in-out)
- Primary CTA button: subtle shimmer sweep across gold background (CSS animation, 3s interval)
- Active nav link: gold underline expands from center on hover

**Scroll-triggered:**
- Stat counter chips: numbers count up from 0 when entering viewport (IntersectionObserver)
- Feature cards: slide up + fade in with 120ms stagger between cards
- Section headlines: slide up 20px + opacity 0→1

**Performance rules:**
- Animate ONLY `transform` and `opacity`. Never `width`, `height`, `top`, `left`, `margin`.
- Heavy grain/noise texture: CSS `filter: url(#noise)` on a fixed `::before` pseudo-element.
- Spring animation components: isolated as Client Components in Next.js — never SSR.
- Respect `prefers-reduced-motion: reduce` — all animations disabled, no fallback jitter.

---

## 9. Anti-Patterns (Strictly Banned)

**Typography:**
- No `Inter` or `system-ui` as display fonts
- No serif fonts of any kind
- No gradient text on large headings (gold gradient on a single keyword is the maximum exception)
- No `UPPERCASE` body copy

**Color & Visual:**
- No pure black (#000000) or pure white (#FFFFFF)
- No purple, cyan, or neon glow aesthetic
- No outer neon glow on buttons or cards
- No oversaturated accents (saturation > 80%)
- No warm/cool gray mixing — strict Zinc-family neutrals throughout

**Layout:**
- No centered hero layout
- No 3-column equal-card feature grid
- No overlapping content (text over image, image over image)
- No absolute-positioned content stacking over other content
- No horizontal scrolling regions on mobile

**Copy & Content:**
- No AI clichés: "Seamless", "Unleash", "Next-Gen", "Elevate", "Empower", "Transformative", "Streamline"
- No generic English placeholder names ("John Doe", "Acme Corp", "Company Name")
- No fake round-number metrics ("99.99% uptime", "50% faster", "10,000+ users")
- No broken image links — use only verified URLs or inline SVG
- No stock photography of smiling teams
- No emojis anywhere on the page

**UX:**
- No custom mouse cursors
- No "Scroll to explore" text or bouncing scroll arrows
- No sticky floating CTA islands that cover content
- No auto-playing video with sound
- No cookie consent wall as first interaction
- No modal pop-up on page load

---

## 10. Section Architecture (Page Outline)

```
1. NAV BAR (sticky, frosted glass)
   Logo · Links (Funcionalidades, Preços, Demo) · [Entrar] [Começar agora]

2. HERO (min-h: 100dvh, asymmetric split)
   Eyebrow tag · Headline (2 lines, Syne 800) · Subtext · Gold CTA · Social proof strip
   [RIGHT: Dashboard mockup, floating perpetual]

3. STATS BAND (3 metrics)
   KPI chip: "+38% registro" · KPI chip: "3 lojas ativas" · KPI chip: "Comissão automática"

4. FEATURES (zig-zag, 3 blocks)
   Block 1: Ranking de vendedores [text left / screenshot right]
   Block 2: Motor de comissão [screenshot left / text right]
   Block 3: Importação CEC [text left / screenshot right]

5. PRODUCT PREVIEW (full-width dark section)
   Large dashboard screenshot with annotations pointing to key features

6. PRICING (3 tiers, recommended highlighted)
   Starter · Profissional [highlighted] · Enterprise

7. SOCIAL PROOF (metric-forward, no photo cards)
   3 metric testimonials from anonymized store data

8. FAQ (accordion, 5-6 questions)

9. FINAL CTA SECTION
   Headline + Gold button + "Ver demo grátis" ghost link

10. FOOTER
    Logo · Links · "Desenvolvido com GDS Frame" · Copyright
```

---

## 11. Copy Direction (Anti-Clichê)

**Hero headline formula:** Specific + Direct + Portuguese regional

Good:
- "Seus vendedores têm número. Agora você também tem."
- "Ranking, comissão e metas — tudo em um lugar, para qualquer loja."
- "Da importação do CEC ao pagamento do bônus: automatizado."

Bad (banned):
- "Eleve sua performance comercial" (clichê)
- "Gestão seamless para o seu time" (anglicismo + clichê)
- "Transforme seus dados em resultados" (vazio)

**CTA copy:** Action + Specificity
- "Ver o dashboard ao vivo" (not "Get started")
- "Começar minha loja grátis" (not "Try for free")
- "Agendar apresentação" (not "Book a demo")
```
