---
phase: 06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend
reviewed: 2026-06-17T00:00:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - src/__tests__/connectors.test.ts
  - src/__tests__/export.test.ts
  - src/__tests__/fingerprint.test.ts
  - src/app/api/admin/parse-upload/route.ts
  - src/app/api/admin/relatorio-excel/route.ts
  - src/app/api/admin/sync-connector/route.ts
  - src/app/dashboard/ConnectorsCard.tsx
  - src/app/dashboard/ExportButton.tsx
  - src/app/dashboard/UploadModal.tsx
  - src/app/dashboard/relatorios/page.tsx
  - src/lib/connectors/base.ts
  - src/lib/connectors/isrp.ts
  - src/lib/connectors/pegasus.ts
  - src/lib/connectors/registry.ts
  - src/lib/export-pdf.ts
  - src/lib/export-xlsx.ts
  - src/lib/fingerprint.ts
  - supabase/migrations/20260617000001_connectors.sql
  - vitest.config.ts
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-06-17
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

A fase 06 introduz exportação XLSX/PDF, fingerprint de arquivo, conectores stub (Pegasus/ISRP) e a migration SQL para a tabela `connectors`. O código está bem estruturado e segue as convenções do projeto. Foram encontrados dois problemas críticos: um bypass de autorização na rota de relatório (o check de role não bloqueia quando o usuário não está autenticado) e um potencial crash por page overflow no PDF quando há muitos vendedores. Há também cinco warnings relacionados a validação de entrada, tratamento de erros silencioso e inconsistência de branch de autenticação.

## Critical Issues

### CR-01: Rota GET /relatorio-excel — acesso não-autenticado não é bloqueado

**File:** `src/app/api/admin/relatorio-excel/route.ts:11-15`

**Issue:** Quando `user` é `null` (usuário não autenticado), a rota retorna 401 corretamente. Porém, o `profile` vem de `getTenantContext()` e, quando `user` é null, `profile` pode ser `null` ou `undefined`. Na linha 30, `profile.tenant_id` é acessado sem guard — se `profile` for null nesse ponto, o processo crasha com `TypeError: Cannot read properties of null`. Isso depende de como `getTenantContext` lida internamente com usuários não-autenticados: se retornar `{ user: null, profile: null }`, o early return na linha 11-12 protege; mas se retornar um profile parcial, a linha 30 explode. Mais grave: o check de role na linha 13 usa `profile?.role || ''`, o que trata um profile null como role vazia — passando silenciosamente para a próxima verificação em vez de bloquear. Se `getTenantContext` retornar `{ user: someUser, profile: null }` em algum edge case, o código continua até a linha 30 e crasha.

**Fix:**
```typescript
const { user, profile } = await getTenantContext()
if (!user || !profile) {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}
if (!['adm', 'gerente', 'super_admin'].includes(profile.role)) {
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
}
```
O mesmo padrão já correto em `parse-upload/route.ts` (linha 16-19) deve ser replicado aqui.

---

### CR-02: export-pdf.ts — overflow silencioso para listas longas de vendedores

**File:** `src/lib/export-pdf.ts:83-98`

**Issue:** As linhas de dados são desenhadas com `rowY = tableTop + HEADER_HEIGHT + idx * ROW_HEIGHT`. Não há criação de nova página (`doc.addPage()`) quando `rowY` ultrapassa a área imprimível do A4 landscape (~545px de altura útil). Com mais de ~26 vendedores, as linhas saem do limite do PDF — o pdfkit simplesmente não as renderiza, produzindo um PDF truncado sem erro ou aviso. Em produção, com 30+ vendedores nas 3 lojas, isso é um bug garantido.

**Fix:**
```typescript
const PAGE_HEIGHT = doc.page.height - PAGE_MARGIN * 2
vendors.forEach((vendor, idx) => {
  const rowY = tableTop + HEADER_HEIGHT + idx * ROW_HEIGHT
  // Se ultrapassar a página, adicionar nova página e redesenhar cabeçalho
  if (rowY + ROW_HEIGHT > tableTop + PAGE_HEIGHT) {
    doc.addPage()
    // redesenhar cabeçalho da tabela na nova página
    // ... (extrair lógica do header em função auxiliar)
    return
  }
  // ... render row
})
```
Ou, mais simples a curto prazo, calcular o número máximo de linhas por página e dividir em chunks antes de iniciar o loop.

---

## Warnings

### WR-01: sync-connector — CRON_SECRET vazio aceito como autenticado

**File:** `src/app/api/admin/sync-connector/route.ts:16-17`

**Issue:** A lógica `const isCronCall = !!(cronSecret && authHeader === ...)` é correta para o caso onde `CRON_SECRET` está definido. Porém, se `CRON_SECRET` não estiver configurado no ambiente (`undefined`), a variável `cronSecret` será `undefined`, `isCronCall` será `false`, e o código cai no branch de autenticação normal — o que é o comportamento correto. Mas se `CRON_SECRET` estiver definido como string vazia `""`, `cronSecret` é falsy, `isCronCall` também fica `false`, e uma requisição sem `Authorization` header ignora silenciosamente a verificação de cron e passa para o branch de autenticação normal sem nenhum log de alerta. Não é crítico, mas pode mascarar configurações erradas de ambiente.

**Fix:**
```typescript
const cronSecret = process.env.CRON_SECRET
if (cronSecret && cronSecret.length < 16) {
  console.warn('CRON_SECRET muito curto — configure um segredo com pelo menos 16 chars')
}
```
E documentar que `CRON_SECRET=` (vazia) desabilita o endpoint de cron silenciosamente.

---

### WR-02: relatorio-excel — parseInt sem validação de NaN

**File:** `src/app/api/admin/relatorio-excel/route.ts:18, 27, 38, 49`

**Issue:** `parseInt(periodId)` é chamado quatro vezes com `periodId` vindo de `searchParams.get('period') ?? '1'`. Se o caller passar `?period=abc`, `parseInt('abc')` retorna `NaN`. Queries Supabase com `NaN` como valor de `.eq()` são imprevisíveis — podem retornar zero rows (benigno) ou comportamento undefined dependendo da versão do driver.

**Fix:**
```typescript
const rawPeriod = searchParams.get('period') ?? '1'
const periodId = parseInt(rawPeriod)
if (isNaN(periodId) || periodId <= 0) {
  return NextResponse.json({ error: 'Período inválido' }, { status: 400 })
}
// Usar periodId como number diretamente nas queries (sem parseInt repetido)
```

---

### WR-03: UploadModal — erro silencioso no insert de goals placeholder

**File:** `src/app/dashboard/UploadModal.tsx:194`

**Issue:** O auto-registro de novos vendedores via `supabase.from('goals').insert(placeholders)` na linha 194 não verifica o retorno de erro. Se o insert falhar (ex: constraint violation, RLS, rede), a importação continua silenciosamente com os vendedores sem goal — e as rows são inseridas em `sales_records` com `vendor_name: 'Vendedor ${id}'` e `store: 'Sem loja'`, dados incorretos que poluem o dashboard.

**Fix:**
```typescript
const { error: goalError } = await supabase.from('goals').insert(placeholders)
if (goalError) {
  console.warn('Auto-registro de vendedores falhou:', goalError.message)
  // opcional: throw goalError se preferir falha explícita
}
```

---

### WR-04: relatorios/page.tsx — redirect sem verificação de autenticação

**File:** `src/app/dashboard/relatorios/page.tsx:20-23`

**Issue:** O redirect para vendedores (`redirect('/vendedor/meu-resultado')`) só ocorre dentro do bloco `if (user)`. Se `user` for null (usuário não autenticado), o código continua para `createAdminClient()` e tenta acessar `profile.tenant_id` na linha 27, onde `profile` pode ser null — causando crash com `TypeError`. O middleware deveria capturar isso antes, mas a página não tem guard de autenticação explícito como belt-and-suspenders (padrão estabelecido nas demais páginas do projeto per CLAUDE.md).

**Fix:**
```typescript
const { user, profile } = await getTenantContext()
if (!user || !profile) redirect('/login')
if (profile.role === 'vendedor') redirect('/vendedor/meu-resultado')
```

---

### WR-05: export-pdf.ts — uso de `fs.existsSync` em ambiente serverless

**File:** `src/lib/export-pdf.ts:48`

**Issue:** `fs.existsSync(LOGO_PATH)` é chamado sincronamente a cada geração de PDF. Em Vercel (deploy atual), o filesystem é read-only e `process.cwd()` pode não coincidir com a raiz do projeto em todos os contextos de execução. Se `public/logo.png` não existir no bundle (ex: foi excluído do deploy), `logoExists` será `false` e o logo é ignorado silenciosamente — o que é o comportamento intencional de fallback. O problema real é que `fs.existsSync` bloqueia a event loop e pode ser lento em cold starts. Recomendação: usar uma verificação assíncrona ou cachear o resultado.

**Fix:**
```typescript
// Cache no módulo — verifica uma única vez por cold start
let _logoExists: boolean | null = null
function logoExists(): boolean {
  if (_logoExists === null) _logoExists = fs.existsSync(LOGO_PATH)
  return _logoExists
}
```

---

## Info

### IN-01: ConnectorsCard — estado inicial não reflete o servidor

**File:** `src/app/dashboard/ConnectorsCard.tsx:46-49`

**Issue:** O estado inicial de ambos os conectores é `not_configured` independente do que existe no banco. O usuário só vê o estado real após clicar "Forçar Sincronização". Para a UX, seria melhor fazer um fetch inicial ao montar o componente — ou transformar em Server Component que recebe o estado inicial como prop.

**Fix:** Adicionar `useEffect` de montagem para buscar `/api/admin/sync-connector` com um flag de `check_only`, ou passar o estado inicial como prop do Server Component pai.

---

### IN-02: fingerprint.ts — regex com backtracking potencial em HTMLs grandes

**File:** `src/lib/fingerprint.ts:38`

**Issue:** A regex `/<tr[^>]*>([\s\S]*?)<\/tr>/gi` com `[\s\S]*?` (non-greedy) em HTMLs grandes (relatórios CEC com centenas de linhas) pode ser lenta. Para o limite de 10MB já imposto em `parse-upload/route.ts`, isso raramente será um problema prático, mas é um padrão a monitorar se o limite de tamanho subir.

**Fix:** Considerar uma abordagem de string split simples por `</tr>` em vez de regex global sobre o buffer inteiro.

---

### IN-03: vitest.config.ts — `globals: false` requer import explícito nos testes

**File:** `vitest.config.ts:6`

**Issue:** `globals: false` é a configuração correta e os três arquivos de teste já importam `{ describe, it, expect }` explicitamente. Apenas documentar que qualquer teste futuro deve seguir o mesmo padrão de import explícito — não usar `describe`/`it`/`expect` como globais implícitas.

**Fix:** Sem ação necessária. Apenas manter o padrão de import explícito nos novos testes.

---

_Reviewed: 2026-06-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
