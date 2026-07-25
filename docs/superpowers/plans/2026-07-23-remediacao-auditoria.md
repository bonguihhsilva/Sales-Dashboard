# Remediação da auditoria de due diligence (2026-07-23)

Origem: relatório de auditoria de aquisição do GDS Dashboard (mesma sessão).
Worktree: `security-remediation` / branch `worktree-security-remediation`.

## Escopo desta rodada

Onda 0 (parte segura, sem tocar credenciais/histórico) + Onda 1 completa do relatório.
Fora de escopo aqui (motivo em cada caso — ver seção "Fora de escopo" no final):
C-02 (refatoração RLS completa, ~15d), C-03 (drop de policy — requer confirmação de
produção antes), rotação de credenciais (fora do repo), reescrita de histórico git
(destrutivo, exige confirmação explícita a cada execução), itens jurídicos/comerciais
(J-01..J-05), i18n/a11y/design system (M-01..M-06), item A-04 (troca de dependência xlsx
— decisão de produto, não bug).

## Tarefas

### Task 1 — Remover arquivos de scratch/dev do repositório (M-05 + parte do C-01)

Remover do controle de versão: `update_pwd.ts`, `test-db.ts`, `script4.js`, e todo o
diretório `scratch/` (`fix_auth_bypass.js`, `fix_links.js`, `link_vendor.js`,
`reset_role.js`, `test_upload_parser.ts`, `cec_mock_sales.html`).

Critério de aceite:
- `git rm` desses arquivos (não apenas apagar do disco — precisa sair do histórico
  futuro; a limpeza do histórico passado é ação separada fora deste escopo)
- Adicionar `scratch/` ao `.gitignore` para prevenir recriação acidental
- `npm run build` e `npx vitest run` continuam passando (nenhum desses arquivos é
  importado por código de produção — verificar com grep antes de remover)
- Commit único, mensagem convencional (`chore: remove scratch/dev files with leaked credential`)

Não fazer: não tentar rotacionar a senha nem reescrever histórico git — fora de alcance
de um agente sem acesso ao painel Supabase.

### Task 2 — Bloquear auto-promoção de role e aplicar hierarquia de atribuição (C-05)

Arquivo: `src/app/api/admin/update-user/route.ts`.

Problema: a rota aceita `role` no body sem checar se `userId === caller.id`, e sem
impedir que um `gerente` atribua `adm` a si mesmo ou a outrem além do que a hierarquia
permite.

Critério de aceite:
- Se `userId === user.id` E o body contém `role`, rejeitar com 403
  (`{ error: 'Não é possível alterar a própria role' }`) — mensagem exata pode variar,
  mas o comportamento de bloqueio é obrigatório.
- Hierarquia de atribuição: `gerente` só pode atribuir `vendedor`; `adm` só pode
  atribuir `vendedor` ou `gerente`; `super_admin` pode atribuir `vendedor`, `gerente`,
  `adm` (já existe checagem separada para `super_admin` como role atribuída — manter).
  Implementar como função pura testável em `src/lib/auth/roles.ts`
  (ex: `canAssignRole(callerRole, targetRole): boolean`), não inline na rota.
- Testes unitários da função de hierarquia cobrindo: gerente tenta atribuir adm (nega),
  gerente atribui vendedor (permite), adm atribui gerente (permite), adm atribui
  super_admin (nega, já coberto por regra existente), auto-promoção bloqueada
  independente de role.
- `npx vitest run` verde.

Contexto: ler `src/lib/auth/roles.ts` inteiro antes de editar — já existe
`ASSIGNABLE_ROLES` e `canInvite`; a nova função deve conviver com esse padrão, não
duplicá-lo. `src/app/api/admin/invite/route.ts` tem lógica similar de restrição por
role — considerar se a mesma função de hierarquia deve ser reusada lá (não obrigatório
nesta task, mas comente se notar duplicação).

### Task 3 — Aplicar escopos de API key nas rotas v1 + expiração (C-07)

Arquivos: `src/lib/auth/apiKey.ts`, `src/app/api/v1/sales/route.ts`,
`src/app/api/v1/stock/route.ts`, migration nova em `supabase/migrations/`.

Problema: `getApiKeyContext` retorna `scopes` e nenhuma rota verifica. `api_keys` não
tem expiração.

Critério de aceite:
- Nova função em `src/lib/auth/apiKey.ts`: `requireScope(ctx: ApiKeyContext, scope: string): boolean`.
- `POST /api/v1/sales` exige escopo `sales:write` — 403 com corpo JSON claro se ausente.
- `POST /api/v1/stock` (ler o arquivo primeiro para saber o verbo/nome do escopo
  esperado — inferir de `scopes` já gravados, se houver convenção) exige escopo
  equivalente de estoque.
- Migration nova adicionando coluna `expires_at timestamptz` em `api_keys` (nullable,
  sem default — chaves existentes continuam válidas; validação de expiração é
  aplicada apenas quando a coluna está preenchida). `getApiKeyContext` deve tratar
  `expires_at` no passado como chave inválida (mesmo caminho de `revoked_at`).
- Não adicionar UI de gestão de escopo nem geração de chave com expiração obrigatória
  nesta task — é mudança de schema + enforcement no backend, não de produto.
- Testes: estender `src/lib/auth/apiKey.test.ts` e/ou `src/__tests__/api-v1-sales.test.ts`,
  `src/__tests__/api-v1-stock.test.ts` cobrindo: chave sem escopo correto → 403; chave
  expirada → 401 (mesmo comportamento de chave revogada); chave válida com escopo →
  passa.
- `npx vitest run` verde.

### Task 4 — Rate limit com chave confiável + fail-closed em rotas sensíveis (C-06)

Arquivos: `src/lib/ratelimit.ts`, `src/app/api/admin/invite/route.ts`,
`src/app/api/admin/calcular-comissao/route.ts`, `src/app/api/admin/parse-upload/route.ts`.

Problema: chave de rate limit usa `x-forwarded-for` cru (forjável pelo cliente), e o
limitador falha aberto (`return { success: true }`) quando a RPC do Postgres erra —
inclusive nas rotas sensíveis.

Critério de aceite:
- Para as três rotas listadas (todas autenticadas antes do rate-limit check — confirmar
  lendo cada arquivo), trocar a chave de `x-forwarded-for` para `user.id` do contexto
  já obtido via `getTenantContext()`/`createClient()`. Isso exige mover a chamada de
  `strictRateLimiter.limit()` para **depois** da resolução do usuário nessas rotas —
  hoje ela roda antes. Preservar toda a lógica de auth que já existe depois.
- `x-forwarded-for` continua aceitável como fallback só se realmente não houver usuário
  autenticado no momento do check (ex: se alguma rota sensível for pré-auth — verificar
  se é o caso antes de assumir).
- Em `src/lib/ratelimit.ts`, adicionar um parâmetro/variante que falha fechado
  (retorna `{ success: false }`) quando a RPC falha, e usar essa variante nas três
  rotas sensíveis acima. Manter fail-open como default para as demais (ex: `rateLimiter`
  genérico) — não mudar comportamento de rotas não listadas aqui.
- Ao falhar fechado por erro de RPC, logar com `console.error` incluindo contexto
  suficiente para diagnóstico (já existe padrão similar no arquivo — seguir).
- Não implementar troca de infraestrutura de rate-limit (Upstash já está como
  dependência mas não em uso — não trocar a implementação Postgres-backed nesta task).
- Testes: se `ratelimit.ts` não tem teste hoje, criar um cobrindo o fail-closed sob
  erro de RPC mockado. `npx vitest run` verde.

### Task 5 — Imutabilidade de comissão aprovada (C-04)

Arquivos: migration nova em `supabase/migrations/`,
`src/app/api/admin/calcular-comissao/route.ts`.

Problema: o trigger `protect_approved_commission` (ver
`supabase/migrations/20260601000011_fix_vuln04_protect_approved_commission.sql`)
preserva apenas a flag `aprovado`, não os valores monetários. Recalcular sobrescreve
`comissao_base`, `bonus_total`, `total`, `detalhamento` de uma comissão já aprovada,
mantendo o carimbo de aprovação.

Critério de aceite:
- Migration nova estendendo o trigger `protect_approved_commission`: se
  `OLD.aprovado = true`, qualquer tentativa de UPDATE que altere `comissao_base`,
  `bonus_total`, `total` ou `detalhamento` deve ser **rejeitada** com
  `RAISE EXCEPTION` (mensagem clara, ex: `'Comissão aprovada é imutável — crie um
  ajuste em vez de recalcular'`), não silenciosamente revertida. Ler a migration
  original inteira antes de editar — a nova migration deve fazer `CREATE OR REPLACE
  FUNCTION` da mesma função, mantendo o comportamento existente de preservar
  `aprovado`/`aprovado_por` e adicionando a nova checagem antes.
- Em `calcular-comissao/route.ts`: antes do `upsert`, filtrar do array `rows` qualquer
  linha cujo `vendedor_id` esteja em `approvedMap` (já existe essa lógica de leitura,
  só falta o filtro). Comissões aprovadas são puladas no upsert, não enviadas.
- A resposta da rota deve reportar quantas foram puladas por já estarem aprovadas
  (estender o JSON de retorno, ex: `{ success, count, skipped_approved }`), para que a
  UI (fora de escopo mudar aqui) possa eventualmente exibir isso.
- Testes: não há teste de integração de banco no projeto hoje para triggers — não
  criar um novo framework de teste de SQL nesta task. Cobrir a lógica de filtro de
  `rows` antes do upsert com um teste unitário se a lógica puder ser extraída em
  função pura testável (preferível); senão, documentar no relatório da task que a
  cobertura do trigger em si depende de teste manual/SQL contra o banco (mesmo padrão
  de `supabase/tests/08_inventory_metrics_verify.sql`).
- `npx vitest run` verde.

### Task 6 — Configurar ESLint estrito e zerar violações (A-01)

Problema: `npm run lint` abre prompt interativo — não existe `.eslintrc`/`eslint.config.js`
no projeto. Zero verificação estática além do compilador TS.

Critério de aceite:
- Criar `eslint.config.js` (formato flat config, compatível com ESLint 9 + Next 15,
  já são as versões instaladas) estendendo `next/core-web-vitals` e
  `next/typescript` via `eslint-config-next` (já é devDependency).
- `npm run lint` deve rodar sem prompt interativo e retornar exit code determinístico.
- Rodar `npm run lint` e corrigir os erros reportados (não apenas warnings — erros).
  Se o volume de correção for muito grande para uma task, é aceitável usar
  `// eslint-disable-next-line <regra> -- TODO: ver task N` pontualmente em casos que
  exigiriam refatoração maior, mas isso deve ser exceção rara e documentada no
  relatório final, não o caminho padrão.
- Não instalar `eslint-plugin-jsx-a11y` nem regras de acessibilidade nesta task — isso
  é M-02, fora de escopo aqui. Foco é correção/segurança/qualidade, não a11y.
- `npm run build` e `npx vitest run` continuam passando após as correções.

### Task 7 — CI no GitHub Actions (A-02)

Critério de aceite:
- Criar `.github/workflows/ci.yml` rodando em push e pull_request para `main`:
  `npm ci`, `npm run build`, `npx vitest run`, `npm run lint`, `npm audit --omit=dev
  --audit-level=high` (não falhar o job em low/moderate — só high/critical, para não
  travar CI por ruído; documentar essa escolha em comentário no workflow).
- Node version fixada (usar a mesma major do `netlify.toml`/ambiente local — checar
  `.nvmrc` se existir; se não existir, usar Node 20 LTS, consistente com
  `netlify.toml`).
- Não configurar deploy nem secrets de produção no workflow — só verificação.
- Não é possível testar a execução real do workflow sem push para o GitHub (fora do
  alcance local) — validar a sintaxe do YAML localmente (`yamllint` se disponível, ou
  ao menos parse manual) e reportar isso claramente no relatório da task.

### Task 8 — Atualizar Next.js e resolver vulnerabilidades do audit (A-03)

Critério de aceite:
- Atualizar `next` para `15.5.21` (ou versão mais recente na mesma major que resolva
  as vulnerabilidades reportadas por `npm audit`) em `package.json` e `package-lock.json`.
- Rodar `npm audit --omit=dev` após a atualização e confirmar que as 9 vulnerabilidades
  reportadas (incluindo as 5 high) não aparecem mais, ou documentar quais restam e por
  quê (ex: transitive dependency sem fix disponível ainda).
- `npm run build` e `npx vitest run` continuam passando — Next 15.5.21 pode ter
  mudanças de comportamento; se o build quebrar, investigar antes de reportar DONE.
- Não fazer upgrade de major version (ex: para Next 16) — fora de escopo, risco maior
  que o benefício desta task.

### Task 9 — Corrigir dado corrompido do sanitizeString e remover a função (A-05)

Arquivos: `src/lib/sanitize.ts`, `src/app/api/admin/update-user/route.ts`, e qualquer
outro caller de `sanitizeString` (grep antes de começar).

Problema: `sanitizeString` escreve entidades HTML no banco (proteção redundante — React
já escapa na renderização) e corrompe nomes com apóstrofo/aspas/barra de forma
permanente e visível na UI.

Critério de aceite:
- Localizar todos os call sites de `sanitizeString` (grep `sanitizeString` em `src/`).
- Remover as chamadas de sanitização na escrita. Substituir por validação de forma
  (não transformação): usar `zod` (já é dependência do projeto) para validar
  comprimento e tipo dos campos afetados (`name`, `store`, etc.) na própria rota,
  rejeitando entrada inválida com 400 em vez de transformá-la.
- Remover a função `sanitizeString` de `src/lib/sanitize.ts` se não sobrar nenhum
  caller; se `src/lib/sanitize.ts` ficar vazio, remover o arquivo.
- **Não** escrever migration de limpeza de dados já corrompidos no banco de produção
  nesta task — isso mexe em dados reais de produção e precisa de aprovação explícita
  fora deste fluxo de agentes. Documentar no relatório da task que dados existentes
  podem estar afetados e a limpeza é ação manual separada.
- Testes: se havia teste cobrindo `sanitizeString`, adaptar para cobrir a validação
  zod nova. `npx vitest run` verde.

## Ordem de execução

Sequencial, uma implementação por vez (sem paralelismo entre tasks — risco de conflito
de merge em arquivos compartilhados como `ratelimit.ts` e rotas admin). Ordem sugerida:
1 (limpeza, baixo risco) → 2 → 3 → 4 → 5 → 9 → 6 (lint por último entre os de código,
porque pode tocar todos os arquivos anteriores) → 7 → 8.

## Fora de escopo desta rodada (não ignorado — adiado com motivo)

- **C-02** (arquitetura RLS): ~15 dias, requer decisão de design multi-arquivo. Fica
  para uma rodada própria com plano dedicado.
- **C-03** (drop de policy órfã em `vendor_exclusions`): antes de gerar a migration,
  preciso confirmar contra o banco de produção real (`pg_policies`) se a policy órfã
  ainda existe — não vou gerar um DROP às cegas sem essa confirmação, e não tenho
  acesso ao MCP do Supabase autorizado nesta sessão.
- **Rotação de credenciais** (senha `suporte@gds-frame.com`, chaves Supabase): ação no
  painel Supabase, fora do repositório, exige acesso que um agente de código não tem.
- **Reescrita de histórico git**: destrutivo e afeta clones existentes — precisa de
  confirmação explícita do usuário no momento da execução, não de autorização geral.
- **J-01 a J-05** (jurídico/comercial): exigem advogado e execução comercial real, não
  código.
- **M-01 a M-06** (design system, a11y, i18n, moeda, conteúdo LMS no banco): mudanças
  de produto/design de escopo grande, cada uma merece plano próprio.
- **A-04** (trocar `xlsx` de CDN por dependência de registry): decisão de produto com
  risco de regressão em parser central — não é fix mecânico, precisa validação manual
  extensa dos formatos suportados.
- **A-06 a A-11** (truncamento silencioso, revogação de acesso, redirect em rota de
  API, configs de deploy conflitantes, cobertura de teste, bundle size): não estavam
  no pedido de "achados críticos" priorizado nesta rodada; ficam para Onda 2.
