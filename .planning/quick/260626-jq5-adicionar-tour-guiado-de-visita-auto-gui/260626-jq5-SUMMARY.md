# Quick Task 260626-jq5: Tour Guiado na Landing Page

**Date:** 2026-06-26
**Commit:** f3f3656

## O que foi feito

Adicionado `TourModal` ao `LandingClient.tsx` com fluxo completo de visita auto-guiada.

### Componentes novos

- `TourModal` — overlay com backdrop blur, 2 etapas (seleção de papel → demo)
- `TourDemoMockup` — mockup do dashboard adaptado por papel (Admin/Gerente/Vendedor)
- `TOUR_ROLES` — dados dos 3 papéis com ícone, cor, features
- `TOUR_CALLOUTS` — 3 callouts explicativos por papel

### Fluxo

1. Usuário clica "Começar agora" (NavBar) ou "Fazer tour guiado" (Hero) ou "Começar agora" (FinalCTA)
2. Modal abre com 3 cards de papel para seleção
3. Ao selecionar: mockup do dashboard na perspectiva correta + callouts numerados
4. Botões: "Entrar no sistema" → `/login` | "Ver outro perfil" → volta ao passo 1

### Perspectivas por papel

- **Admin**: KPIs consolidados 3 lojas, ranking global, sidebar completa
- **Gerente**: KPIs da Jebai, ranking da equipe, sidebar operacional
- **Vendedor**: apenas seus próprios dados, posição #2, comissão calculada, cor roxa para destacar

### Arquivos alterados

- `src/app/landing/LandingClient.tsx` — +~300 linhas (TourModal + adaptações)

## Build

`npm run build` → ✓ Compiled successfully
