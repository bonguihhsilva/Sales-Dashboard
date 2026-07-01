-- ============================================================
-- LMS hotfix: restaura EXECUTE em is_lms_editor()/is_super_admin()
-- para o role authenticated.
--
-- Bug: a Fase 1 revogou EXECUTE de anon/authenticated tratando essas
-- funcoes como RPC publico indevido (achado do advisor de seguranca).
-- Mas ambas sao usadas dentro do USING clause das policies ALL
-- (trilhas_editor_write, modulos_editor_write, etc). Uma policy ALL
-- e avaliada para QUALQUER comando na tabela, inclusive SELECT — entao
-- sem EXECUTE, todo SELECT de um usuario autenticado comum passou a
-- falhar com "permission denied for function is_lms_editor", e o app
-- tratava esse erro como lista vazia (nenhuma trilha visivel para
-- vendedor nem super_admin).
--
-- Fix: devolve EXECUTE para authenticated (necessario pra RLS
-- funcionar). Mantem revogado de anon — a app nunca le LMS sem sessao,
-- e a funcao so retorna um boolean sobre o proprio usuario (sem
-- vazamento real de dado mesmo se chamada via RPC direto).
-- ============================================================

grant execute on function public.is_lms_editor() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
