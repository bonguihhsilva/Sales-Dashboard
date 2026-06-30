# LMS DB Migration & Gamification — Design Spec

**Data:** 2026-06-30
**Autor:** Guilherme Da Silva (via Claude)
**Status:** Aprovado (design), pendente plano de implementação
**Projeto:** GDS Dashboard v2 — Centro de Treinamentos (LMS)

---

## 1. Contexto e problema

O LMS existe em dois mundos paralelos e desconectados:

- **Estático** (`src/lib/lms/*.ts`): 6 trilhas de Vendas + 5 de Skincare, hardcoded, globais, IDs fake (`t1`...). Alimenta hoje: hub, página de trilha, página de módulo, quiz.
- **DB-backed** (tabelas `trilhas/modulos/aulas/provas/questoes_prova/...`): conteúdo real semeado no tenant "Loja Demo (GDS)" — 2 trilhas, 13 módulos, 44 aulas, 13 provas, 81 questões. Alimenta hoje só o `LicaoClient` (player de slides da aula).

Consequências do estado atual:
- Fluxo vendor quebrado: IDs estáticos (`t1`) não batem com UUIDs do DB; clicar numa lição da trilha estática leva a uma rota de aula que consulta o DB por um ID que não existe.
- Editor CRUD (`AdminLmsClient` + `actions.ts`) construído e funcional no backend, mas **não montado em rota nenhuma**.
- Gamificação (XP/nível/badges) tem schema pronto mas zero escrita → tudo zerado.
- `AdminLmsClient` usa tokens Material-3 fora do padrão visual do LMS.

### Objetivo de negócio

Permitir que **cada cliente (tenant) escolha e crie seu próprio conteúdo de treinamento**, com biblioteca global opcional mantida pelo super_admin, vendedores consumindo e ganhando XP/nível/badges.

---

## 2. Decisões (confirmadas com o usuário)

| Decisão | Escolha |
|---|---|
| Escopo v1 | **Completo com gamificação** (autoria + consumo + progresso + quiz + XP/nível/badges) |
| Conteúdo entre tenants | **Templates globais (super_admin) + por tenant**; estático vira seed global opcional |
| Regras de XP | **XP por aula concluída + XP por módulo aprovado**; nível por faixa; badges por marco |
| Arquitetura | **A** — server components leem DB direto (padrão do codebase) + 1 função Postgres atômica pra XP; escrita via `actions.ts` (service-role) |
| Tabela `quizzes` (por-aula) | **Aposentada** (0 linhas). Quiz = prova do módulo |
| Editor de slides (jsonb) | **Deferido** pra fase 2; v1 edita `conteudo_texto` (LicaoClient auto-fatia) |

---

## 3. Modelo de dados

### 3.1 Hierarquia final

```
trilhas    (id, tenant_id?, is_global, titulo, descricao, icon, cor, publico_alvo, ordem, ativa)
  modulos  (id, trilha_id, titulo, descricao, ordem, xp_reward, aprovacao_minima)
    aulas  (id, modulo_id, titulo, tipo_conteudo, url_midia, conteudo_texto, slides jsonb, ordem, xp_reward)
    provas (id, modulo_id, titulo, nota_minima)            ← "quiz do módulo"
      questoes_prova (id, prova_id, pergunta, opcoes jsonb, indice_correta, explicacao)
progresso_aulas   (usuario_id, aula_id, concluida_em)
progresso_modulos (usuario_id, modulo_id, nota_prova, aprovado)
quiz_resultados   (usuario_id, modulo_id, pontuacao, aprovado, tentativa, respostas)
gamificacao       (usuario_id, xp_total, nivel, streak_dias, ultimo_acesso, badges jsonb)
```

### 3.2 Migração `lms_global_e_visuais`

- `trilhas.tenant_id` → **nullable** (trilha global = `tenant_id NULL`)
- `trilhas` add `icon text`, `cor text`, `is_global bool default false`
- `trilhas`: migrar `ativo`→`ativa` e **dropar `ativo`** (coluna duplicada)
- `aulas` add `xp_reward int default 10`
- `questoes_prova` add `explicacao text` (o estático tinha explicação por questão; DB não)

> "Global" mora na trilha; filhos herdam (`tenant_id NULL`). Visual da trilha (icon/cor) volta a ser dado editável, não hardcoded.

---

## 4. Camada de leitura (vendor)

Novo módulo `src/lib/lms/queries.ts` — funções de leitura com o client RLS-bound (filtro global∪tenant vem da policy). Páginas vendor deixam de importar `@/lib/lms` estático.

| Rota | Função | Render |
|---|---|---|
| `vendedor/treinamentos` (hub) | `getCatalogo()` | Trilhas `ativa` visíveis, grid único por `ordem`, tag "Global" nas globais, contadores reais (módulos/aulas/XP), % progresso do user. Empty state se vazio |
| `[trilhaId]` | `getTrilha(uuid)` | Trilha + módulos ordenados; por módulo: nº aulas, nº questões, estado aprovado |
| `[trilhaId]/[moduloId]` | `getModulo(uuid)` | **Lista de aulas** do módulo + CTA "Prova do Módulo". (Deixa de renderizar HTML; conteúdo agora mora nas aulas) |
| `[moduloId]/[licaoId]` | (já lê DB) | LicaoClient slides — sem mudança funcional |
| `[moduloId]/quiz` | `getProva(moduloId)` | Prova + questões do DB |

**Mudança de semântica:** no estático "módulo" era a lição (tinha conteúdo). No DB módulo é container de aulas. A página de módulo passa a listar aulas. `dangerouslySetInnerHTML` sai.

---

## 5. Editor (`dashboard/treinamentos`)

Página vira **2 abas**:
- **Conteúdo** (padrão) → `AdminLmsClient` alimentado por DB
- **Progresso** → view gerencial atual, lendo progresso/XP real

Trabalho:
- Montar: page fetcha DB e passa props que o client já espera. Escopo: adm/gerente → seu tenant; super_admin → tenant ativo + globais
- Restyle Material-3 → tema ouro/preto (`@/lib/lms/theme`)
- Remover form morto "+ Quiz" por-aula
- Adicionar campos faltantes: trilha (`icon`, `cor`, `ordem`, `publico_alvo`), módulo (`ordem`, `xp_reward`, `aprovacao_minima`), aula (`ordem`), questão (`explicacao`)
- Plugar **edição** (update actions já existem, faltou UI)
- **Toggle "Global"** no criar-trilha (só super_admin) → grava `tenant_id NULL, is_global true`; `actions.ts` ganha param `is_global` validado por role

**Deferido (fase 2):** editor visual do array `slides`.

---

## 6. Gamificação

### 6.1 Fontes de XP
- Aula concluída → `+aulas.xp_reward` (10), só na 1ª vez (idempotente via `progresso_aulas`)
- Módulo aprovado (prova ≥ `nota_minima`) → `+modulos.xp_reward` (50), só na 1ª aprovação

### 6.2 Quiz server-side — `submitProva(moduloId, respostas)`
Corrige a brecha do grading no client (hoje `correctAnswers` vai pro browser).
1. `checkAuth` (usuário corrente é o avaliado)
2. Carrega prova + questões do módulo
3. Corrige no servidor: `pontuacao = round(acertos/total*100)`, `aprovado = pontuacao ≥ nota_minima`
4. Grava `quiz_resultados` (tentativa incremental, respostas jsonb)
5. Se aprovado e ainda não aprovado → upsert `progresso_modulos` + credita XP do módulo
6. Retorna gabarito (respostas certas + explicações) **só na resposta** (não antes)

`markLicaoComplete(aulaId, moduloId)` (já existe) → credita XP da aula na 1ª conclusão.

### 6.3 Função `lms_grant_xp(p_user, p_tenant, p_amount)` — `SECURITY DEFINER`
Atômica, num statement:
- Upsert `gamificacao`: soma XP
- `nivel` por faixas: `[0, 200, 500, 1000, 1800, 3000, 5000]`
- `badges` recalculados de contagens do user
- `streak_dias`/`ultimo_acesso`: ontem→+1, hoje→igual, senão→reset 1
- `search_path` travado; chamada só via service-role (actions)

### 6.4 Badges v1
| id | regra |
|---|---|
| `primeira_aula` | 1ª aula concluída |
| `primeiro_modulo` | 1º módulo aprovado |
| `trilha_completa` | 1ª trilha 100% (todos módulos aprovados) |
| `nota_maxima` | 100% numa prova |
| `nivel_5` | atingiu nível 5 |

### 6.5 Aba Progresso
Lê real: `gamificacao` (XP/nível/badges por vendedor) + `progresso_modulos` (% conclusão).

---

## 7. RLS / segurança

1. **Hardening de escrita** — policies `tenant_isolation_*` (ALL, role `public`) deixam qualquer membro do tenant (incl. vendedor) escrever conteúdo via client direto. Trocar por: SELECT (tenant ∪ global) pra todos + INSERT/UPDATE/DELETE só `adm/gerente/super_admin` (check `app_metadata.role`)
2. **Cascata global faltante** — add SELECT global em `aulas`/`provas`/`questoes_prova` (visível se trilha-pai é global). `modulos` já tem (`modulos_via_trilha`)
3. **Autoria global** — só super_admin grava `tenant_id NULL` (action + RLS)
4. `lms_grant_xp` `SECURITY DEFINER` + `search_path` travado
5. Rodar `get_advisors(security)` pós-migração

---

## 8. Sequência de fases

Cada fase fecha com `npm run build` verde. Migrações como arquivos em `supabase/migrations/` aplicadas via `apply_migration` (MCP às vezes falha → fallback: SQL via Edge Function / painel).

1. **Schema + RLS + função** — migração de colunas; RLS hardening + cascata global; `lms_grant_xp`
2. **Leitura vendor** — `queries.ts` + hub/trilha/módulo(→lista aulas)/quiz no DB + empty states
3. **Gamificação** — `submitProva` server-grading + XP de aula + chamadas da função; QuizClient sem grading no client
4. **Editor** — montar AdminLmsClient no DB, repaginar, tirar form morto, campos+edição+toggle global, 2 abas
5. **Seed global** — converter `@/lib/lms` estático → trilhas globais; verificação + advisors + build

---

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `apply_migration` MCP falhar | Fallback documentado (Edge Function/painel); migração idempotente |
| Tenants existentes ficam sem conteúdo ao trocar leitura pro DB | Seed global (fase 5) garante catálogo base; empty state cobre o intervalo |
| Dupla contagem de XP | Idempotência ancorada em `progresso_aulas`/`progresso_modulos` (1ª vez só) |
| `slides` jsonb sem editor | LicaoClient auto-fatia `conteudo_texto`; editor de slides é fase 2 |
| Quebrar rotas em uso | Mudança de semântica da página de módulo é a única; coberta por verificação manual |

---

## 10. Fora de escopo (v1)

- Editor visual do array `slides`
- Vídeo player real (hoje placeholder)
- Filtro por `publico_alvo`
- Streak/badges baseados em tempo
- Tabela `quizzes` por-aula (aposentada)
