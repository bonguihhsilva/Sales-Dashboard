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
revoke all on function public.is_lms_editor() from public, anon, authenticated;
revoke all on function public.is_super_admin() from public, anon, authenticated;
