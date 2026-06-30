# LMS Fase 1 — Schema + RLS + Função XP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar o banco para o LMS multi-tenant: trilhas globais, colunas visuais/XP, RLS endurecido e função atômica de gamificação.

**Architecture:** Uma migração SQL idempotente em `supabase/migrations/`, aplicada via MCP `apply_migration`. Verificação por queries de asserção via `execute_sql` (não há harness de teste de DB; verificação = aplicar + consultar). Sem mudança de código app nesta fase.

**Tech Stack:** Postgres (Supabase), RLS policies, plpgsql, Supabase MCP.

**Spec:** `docs/superpowers/specs/2026-06-30-lms-db-migration-design.md` (seções 3 e 7 e 6.3).

**Pré-condições verificadas:** `get_user_tenant_id()` existe; `gamificacao` tem `streak_dias/ultimo_acesso/badges`; `gamificacao` NÃO tem `tenant_id`; `lms_grant_xp` ainda não existe; `trilhas.tenant_id` é NOT NULL sem `icon/cor`; coluna duplicada `trilhas.ativo` presente.

---

### Task 1: Migração de schema (colunas)

**Files:**
- Create: `supabase/migrations/20260630120000_lms_global_visuais_xp.sql`

- [ ] **Step 1: Criar o arquivo de migração com as alterações de coluna**

Conteúdo inicial do arquivo (parte 1 de 3 — schema):

```sql
-- ============================================================
-- LMS Fase 1: trilhas globais, visuais, XP de aula, explicação
-- Idempotente (if exists / if not exists). Sem perda de dados.
-- ============================================================

-- trilhas: tenant nullable (global), visuais, is_global
alter table public.trilhas alter column tenant_id drop not null;
alter table public.trilhas add column if not exists icon text;
alter table public.trilhas add column if not exists cor text;
alter table public.trilhas add column if not exists is_global boolean not null default false;

-- dedup ativo -> ativa
update public.trilhas set ativa = coalesce(ativa, ativo) where ativa is null;
alter table public.trilhas drop column if exists ativo;
alter table public.trilhas alter column ativa set default true;
update public.trilhas set ativa = true where ativa is null;
alter table public.trilhas alter column ativa set not null;

-- aulas: XP por aula
alter table public.aulas add column if not exists xp_reward integer not null default 10;

-- questoes_prova: explicação por questão
alter table public.questoes_prova add column if not exists explicacao text;
```

- [ ] **Step 2: Aplicar a migração via MCP**

Aplicar com `apply_migration` (name: `lms_global_visuais_xp`, query = conteúdo do arquivo até aqui).
Se `apply_migration` falhar (MCP instável), aplicar o mesmo SQL via `execute_sql` em blocos e registrar no arquivo de migração mesmo assim (fonte de verdade versionada).

- [ ] **Step 3: Verificar colunas e nullability**

Rodar via `execute_sql`:

```sql
select
  (select is_nullable from information_schema.columns where table_name='trilhas' and column_name='tenant_id') tenant_nullable,
  (select count(*) from information_schema.columns where table_name='trilhas' and column_name in ('icon','cor','is_global')) trilha_novas,
  (select count(*) from information_schema.columns where table_name='trilhas' and column_name='ativo') ativo_restante,
  (select count(*) from information_schema.columns where table_name='aulas' and column_name='xp_reward') aula_xp,
  (select count(*) from information_schema.columns where table_name='questoes_prova' and column_name='explicacao') q_explic;
```

Esperado: `tenant_nullable='YES'`, `trilha_novas=3`, `ativo_restante=0`, `aula_xp=1`, `q_explic=1`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260630120000_lms_global_visuais_xp.sql
git commit -m "feat(lms): migração schema — trilha global, visuais, xp aula, explicação"
```

---

### Task 2: Função helper `is_lms_editor()` e RLS de escrita endurecida

**Files:**
- Modify: `supabase/migrations/20260630120000_lms_global_visuais_xp.sql` (append parte 2)

- [ ] **Step 1: Adicionar helper de role + reescrita de RLS ao arquivo**

Append ao arquivo de migração:

```sql
-- ============================================================
-- RLS: editor helper + hardening de escrita + cascata global
-- ============================================================

-- quem pode AUTORAR conteúdo (defense-in-depth; app escreve via service-role)
create or replace function public.is_lms_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('adm','gerente','super_admin')
  );
$$;

-- helper: super_admin (autoria global)
create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'super_admin'
  );
$$;

-- Remover policies ALL permissivas (deixavam vendedor escrever)
drop policy if exists tenant_isolation_trilhas        on public.trilhas;
drop policy if exists tenant_isolation_modulos        on public.modulos;
drop policy if exists tenant_isolation_aulas          on public.aulas;
drop policy if exists tenant_isolation_provas         on public.provas;
drop policy if exists tenant_isolation_questoes_prova on public.questoes_prova;
drop policy if exists tenant_isolation_quizzes        on public.quizzes;
drop policy if exists trilhas_tenant_insert           on public.trilhas;
```

- [ ] **Step 2: Adicionar policies de ESCRITA (só editores) ao arquivo**

Append:

```sql
-- TRILHAS write (editor; tenant próprio, ou global só super_admin)
create policy trilhas_editor_write on public.trilhas for all
  using (public.is_lms_editor() and (tenant_id = public.get_user_tenant_id() or (tenant_id is null and public.is_super_admin())))
  with check (public.is_lms_editor() and (tenant_id = public.get_user_tenant_id() or (tenant_id is null and public.is_super_admin())));

-- MODULOS / AULAS / PROVAS / QUESTOES: editor cujo conteúdo é do seu tenant OU global (super_admin)
create policy modulos_editor_write on public.modulos for all
  using (public.is_lms_editor() and exists (
    select 1 from public.trilhas t where t.id = modulos.trilha_id
      and (t.tenant_id = public.get_user_tenant_id() or (t.tenant_id is null and public.is_super_admin()))))
  with check (public.is_lms_editor());

create policy aulas_editor_write on public.aulas for all
  using (public.is_lms_editor() and exists (
    select 1 from public.modulos m join public.trilhas t on t.id = m.trilha_id
    where m.id = aulas.modulo_id
      and (t.tenant_id = public.get_user_tenant_id() or (t.tenant_id is null and public.is_super_admin()))))
  with check (public.is_lms_editor());

create policy provas_editor_write on public.provas for all
  using (public.is_lms_editor() and exists (
    select 1 from public.modulos m join public.trilhas t on t.id = m.trilha_id
    where m.id = provas.modulo_id
      and (t.tenant_id = public.get_user_tenant_id() or (t.tenant_id is null and public.is_super_admin()))))
  with check (public.is_lms_editor());

create policy questoes_editor_write on public.questoes_prova for all
  using (public.is_lms_editor() and exists (
    select 1 from public.provas p join public.modulos m on m.id = p.modulo_id join public.trilhas t on t.id = m.trilha_id
    where p.id = questoes_prova.prova_id
      and (t.tenant_id = public.get_user_tenant_id() or (t.tenant_id is null and public.is_super_admin()))))
  with check (public.is_lms_editor());
```

- [ ] **Step 3: Aplicar (apply_migration ou execute_sql) e verificar ausência das policies ALL antigas**

```sql
select count(*) policies_all_antigas
from pg_policies
where schemaname='public' and policyname like 'tenant_isolation_%'
  and tablename in ('trilhas','modulos','aulas','provas','questoes_prova','quizzes');
```

Esperado: `policies_all_antigas = 0`.

- [ ] **Step 4: Verificar que vendedor não escreve (simulação por role check)**

```sql
select count(*) editor_write_policies
from pg_policies
where schemaname='public' and policyname like '%_editor_write';
```

Esperado: `editor_write_policies = 5`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260630120000_lms_global_visuais_xp.sql
git commit -m "feat(lms): RLS — escrita só para editores (adm/gerente/super_admin)"
```

---

### Task 3: RLS de leitura — cascata global em aulas/provas/questoes

**Files:**
- Modify: `supabase/migrations/20260630120000_lms_global_visuais_xp.sql` (append parte 3)

- [ ] **Step 1: Adicionar policies SELECT com cascata global**

`trilhas` (já tem `trilhas_tenant_or_global`) e `modulos` (já tem `modulos_via_trilha`) cobrem global. Faltam aulas/provas/questoes. Append:

```sql
-- LEITURA: visível se a trilha-pai é global (tenant null) OU do tenant do user
create policy aulas_select_global on public.aulas for select
  using (exists (
    select 1 from public.modulos m join public.trilhas t on t.id = m.trilha_id
    where m.id = aulas.modulo_id
      and (t.tenant_id is null or t.tenant_id = public.get_user_tenant_id())));

create policy provas_select_global on public.provas for select
  using (exists (
    select 1 from public.modulos m join public.trilhas t on t.id = m.trilha_id
    where m.id = provas.modulo_id
      and (t.tenant_id is null or t.tenant_id = public.get_user_tenant_id())));

create policy questoes_select_global on public.questoes_prova for select
  using (exists (
    select 1 from public.provas p join public.modulos m on m.id = p.modulo_id join public.trilhas t on t.id = m.trilha_id
    where p.id = questoes_prova.prova_id
      and (t.tenant_id is null or t.tenant_id = public.get_user_tenant_id())));
```

- [ ] **Step 2: Aplicar e verificar**

```sql
select count(*) select_global_policies
from pg_policies
where schemaname='public' and policyname in ('aulas_select_global','provas_select_global','questoes_select_global');
```

Esperado: `select_global_policies = 3`.

- [ ] **Step 3: Verificar leitura do conteúdo existente do tenant Demo continua funcionando**

```sql
select count(*) aulas_visiveis from aulas a
join modulos m on m.id=a.modulo_id
join trilhas t on t.id=m.trilha_id
where t.tenant_id = '2ba19095-85b7-477f-9bd6-640464c3b493';
```

Esperado: `aulas_visiveis = 44` (sanity da estrutura; consulta roda como service-role no MCP).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260630120000_lms_global_visuais_xp.sql
git commit -m "feat(lms): RLS — leitura cascata global em aulas/provas/questoes"
```

---

### Task 4: Função atômica `lms_grant_xp`

**Files:**
- Modify: `supabase/migrations/20260630120000_lms_global_visuais_xp.sql` (append parte 4)

- [ ] **Step 1: Adicionar a função ao arquivo**

Append:

```sql
-- ============================================================
-- Gamificação: credita XP + recalcula nível/badges/streak (atômico)
-- gamificacao NÃO tem tenant_id; chave = usuario_id.
-- ============================================================
create or replace function public.lms_grant_xp(p_user uuid, p_amount int)
returns public.gamificacao
language plpgsql security definer set search_path = public as $$
declare
  g public.gamificacao;
  v_levels int[] := array[0,200,500,1000,1800,3000,5000];
  v_nivel int := 1; i int;
  v_today date := current_date;
  v_streak int;
  v_aulas int; v_modulos int; v_trilhas_done int; v_perfect int;
  v_badges jsonb := '[]'::jsonb;
begin
  insert into public.gamificacao (usuario_id, xp_total, nivel, streak_dias, ultimo_acesso, badges)
  values (p_user, greatest(p_amount,0), 1, 1, v_today, '[]'::jsonb)
  on conflict (usuario_id) do update set xp_total = public.gamificacao.xp_total + greatest(p_amount,0)
  returning * into g;

  -- streak (baseado no ultimo_acesso ANTES deste grant)
  if g.ultimo_acesso = v_today then v_streak := coalesce(g.streak_dias,1);
  elsif g.ultimo_acesso = v_today - 1 then v_streak := coalesce(g.streak_dias,0) + 1;
  else v_streak := 1;
  end if;

  -- nível por faixa
  for i in 1..array_length(v_levels,1) loop
    if g.xp_total >= v_levels[i] then v_nivel := i; end if;
  end loop;

  -- contagens p/ badges
  select count(*) into v_aulas   from public.progresso_aulas   where usuario_id = p_user;
  select count(*) into v_modulos from public.progresso_modulos where usuario_id = p_user and aprovado;
  select count(*) into v_perfect from public.quiz_resultados   where usuario_id = p_user and pontuacao = 100;
  select count(*) into v_trilhas_done from public.trilhas t
   where exists (select 1 from public.modulos m where m.trilha_id = t.id)
     and not exists (
       select 1 from public.modulos m where m.trilha_id = t.id
       and not exists (
         select 1 from public.progresso_modulos pm
         where pm.modulo_id = m.id and pm.usuario_id = p_user and pm.aprovado));

  if v_aulas       >= 1 then v_badges := v_badges || '"primeira_aula"'::jsonb;   end if;
  if v_modulos     >= 1 then v_badges := v_badges || '"primeiro_modulo"'::jsonb; end if;
  if v_trilhas_done>= 1 then v_badges := v_badges || '"trilha_completa"'::jsonb; end if;
  if v_perfect     >= 1 then v_badges := v_badges || '"nota_maxima"'::jsonb;     end if;
  if v_nivel       >= 5 then v_badges := v_badges || '"nivel_5"'::jsonb;         end if;

  update public.gamificacao
     set nivel = v_nivel, streak_dias = v_streak, ultimo_acesso = v_today, badges = v_badges
   where usuario_id = p_user
   returning * into g;
  return g;
end;
$$;

revoke all on function public.lms_grant_xp(uuid, int) from public, anon, authenticated;
```

- [ ] **Step 2: Aplicar e testar a função com um usuário real (sem efeito colateral permanente indesejado)**

Pegar um usuário de teste e checar incremento. Rodar via `execute_sql`:

```sql
-- usa o vendedor que já tem 1 progresso_aula
with u as (select usuario_id from progresso_aulas limit 1)
select (lms_grant_xp((select usuario_id from u), 0)).*;
```

Esperado: retorna linha de `gamificacao` com `xp_total >= 0`, `nivel >= 1`, `badges` contendo `"primeira_aula"` (pois há 1 progresso_aula). Amount 0 = não infla XP, só recalcula.

- [ ] **Step 3: Verificar idempotência de badges (rodar de novo, badges não duplicam)**

```sql
with u as (select usuario_id from progresso_aulas limit 1)
select jsonb_array_length((lms_grant_xp((select usuario_id from u), 0)).badges) n_badges;
```

Esperado: `n_badges` estável (não cresce a cada chamada; recálculo do zero a cada vez).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260630120000_lms_global_visuais_xp.sql
git commit -m "feat(lms): função atômica lms_grant_xp (xp + nível + badges + streak)"
```

---

### Task 5: Advisors de segurança + fechamento da fase

**Files:** nenhum (verificação)

- [ ] **Step 1: Rodar advisors de segurança**

Chamar `get_advisors(type='security')`. Revisar achados sobre as tabelas LMS e a nova função.
Aceitável: avisos pré-existentes não relacionados. **Bloqueante:** qualquer tabela LMS sem RLS, ou função `lms_grant_xp`/`is_lms_editor` sinalizada por `search_path` mutável (já travado — não deve aparecer).

- [ ] **Step 2: Verificar build do app não quebrou (nenhuma mudança de código, sanity)**

Run: `npm run build`
Expected: build conclui sem erro.

- [ ] **Step 3: Verificação final consolidada**

```sql
select
  (select is_nullable from information_schema.columns where table_name='trilhas' and column_name='tenant_id') tenant_nullable,
  (select count(*) from pg_policies where schemaname='public' and policyname like '%_editor_write') editor_writes,
  (select count(*) from pg_policies where schemaname='public' and policyname in ('aulas_select_global','provas_select_global','questoes_select_global')) global_reads,
  (select count(*) from pg_proc where proname='lms_grant_xp') grant_fn,
  (select count(*) from pg_policies where schemaname='public' and policyname like 'tenant_isolation_%' and tablename in ('trilhas','modulos','aulas','provas','questoes_prova','quizzes')) leftover_all;
```

Esperado: `tenant_nullable=YES`, `editor_writes=5`, `global_reads=3`, `grant_fn=1`, `leftover_all=0`.

- [ ] **Step 4: Commit de fechamento (se houver ajustes)**

```bash
git add -A
git commit -m "chore(lms): fase 1 — verificação schema/RLS/xp concluída"
```

---

## Próximas fases (planos próprios após Fase 1 aplicada e verificada)

- **Fase 2 — Leitura vendor:** `src/lib/lms/queries.ts` + hub/trilha/módulo(→lista aulas)/quiz lendo DB; empty states; aposentar uso do estático no vendor.
- **Fase 3 — Gamificação app:** server action `submitProva` (grading no servidor) + `markLicaoComplete` creditando XP via `lms_grant_xp`; QuizClient sem `correctAnswers` no client.
- **Fase 4 — Editor:** montar `AdminLmsClient` no DB (2 abas), repaginar ouro/preto, remover form morto, campos+edição+toggle global.
- **Fase 5 — Seed global:** converter `@/lib/lms` estático em trilhas globais; verificação + advisors + build.

Cada fase ganha seu plano em `docs/superpowers/plans/` ao ser iniciada.
