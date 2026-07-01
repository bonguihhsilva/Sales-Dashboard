---
phase: 260701-s5o-separar-trilhas-do-centro-de-treinamento
plan: 01
subsystem: lms-frontend
tags: [lms, treinamentos, ui, categorizacao]
dependency-graph:
  requires: []
  provides: [categorizarTrilhas, CATEGORIA_ORDEM]
  affects: ["/vendedor/treinamentos"]
tech-stack:
  added: []
  patterns: ["mapeamento estático título→categoria no client, sem coluna nova no banco"]
key-files:
  created:
    - src/app/vendedor/treinamentos/categorias.ts
  modified:
    - src/app/vendedor/treinamentos/page.tsx
decisions:
  - "Categorização 100% front-end via Record<string,string> por título exato — coluna publico_alvo do banco descartada por ter valores inconsistentes"
  - "Fallback 'Outros' para trilhas com título não mapeado — evita quebra quando novas trilhas forem seedadas antes do mapa ser atualizado"
metrics:
  duration: "~15min"
  completed: 2026-07-01
---

# Phase 260701-s5o Plan 01: Separar Trilhas do Centro de Treinamento Summary

Agrupamento visual das 14 trilhas do Centro de Treinamentos em 3 seções (Vendas e Atendimento, Skin Care, Perfumes) via mapeamento estático título→categoria no front-end, sem alteração de schema.

## What Was Built

- `src/app/vendedor/treinamentos/categorias.ts`: exporta `CATEGORIA_ORDEM` (ordem de exibição das 3 categorias) e `categorizarTrilhas<T extends { titulo: string }>(trilhas: T[])`, que agrupa por um `Record` privado de título exato → categoria, com fallback `'Outros'` para trilhas não mapeadas. Preserva a ordem relativa recebida (já vem ordenada por `ordem` via `getCatalogo`). Grupos vazios não aparecem no resultado.
- `src/app/vendedor/treinamentos/page.tsx`: importa `categorizarTrilhas`, calcula `grupos` a partir de `trilhas`, e substitui o grid único por uma iteração sobre `grupos`, renderizando um header de seção (título da categoria + contagem de trilhas) acima de cada grid de `TrilhaCard`. Contadores do topo (trilhas, módulos, XP, concluídas) continuam somando sobre o array `trilhas` original, inalterados. `TrilhaCard.tsx` não foi tocado.

## Deviations from Plan

None - plan executado exatamente como escrito.

## Verification

- `npx tsc --noEmit -p tsconfig.json`: sem erros.
- `npm run build`: passou sem erros (rota `/vendedor/treinamentos` compilada normalmente, 1.52 kB).
- `git status --short supabase/migrations`: vazio — nenhuma migration criada ou modificada.

## Commits

- `4c114af`: feat(260701-s5o): adiciona mapa de categorias e helper de agrupamento
- `31e3e83`: feat(260701-s5o): agrupa grid de trilhas por categoria em page.tsx

## Self-Check: PASSED

- FOUND: src/app/vendedor/treinamentos/categorias.ts
- FOUND: src/app/vendedor/treinamentos/page.tsx (modified)
- FOUND commit 4c114af
- FOUND commit 31e3e83
