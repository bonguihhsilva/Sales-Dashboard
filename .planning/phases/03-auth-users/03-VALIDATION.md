---
phase: 3
slug: auth-users
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Nenhum (sem jest/vitest detectado) — validação via build + lint + testes manuais |
| **Config file** | `tsconfig.json` (TypeScript strict) |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 segundos |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd-verify-work`:** Full suite must be green + testes manuais AUTH-01 completos
- **Max feedback latency:** ~30 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | AUTH-01 | T-3-01 | Middleware rejeita role inválido → redirect | build | `npm run build` | ❌ W0 rewrite | ⬜ pending |
| 3-01-02 | 01 | 1 | AUTH-01 | T-3-02 | /convite/* não protegida — rota pública | manual | Curl sem auth → 200 (não 302) | ❌ W0 new | ⬜ pending |
| 3-02-01 | 02 | 2 | AUTH-02 | — | /login sem link de auto-cadastro | build | `npm run build` | ❌ W0 rewrite | ⬜ pending |
| 3-03-01 | 03 | 2 | AUTH-03 | T-3-03 | POST /api/admin/invite com caller vendedor → 403 | manual | curl -H "role: vendedor" → 403 | ❌ W0 new | ⬜ pending |
| 3-03-02 | 03 | 2 | AUTH-03 | T-3-04 | Token UUID gerado e marcado em convites | manual | SELECT FROM convites WHERE token IS NOT NULL | ❌ W0 new | ⬜ pending |
| 3-04-01 | 04 | 3 | AUTH-04 | T-3-05 | Accept invite com token expirado → erro | manual | POST /api/admin/accept-invite com token exp | ❌ W0 new | ⬜ pending |
| 3-04-02 | 04 | 3 | AUTH-04 | T-3-06 | Profile criado com role correto após accept | manual | SELECT role FROM profiles WHERE id = newUser | ❌ W0 new | ⬜ pending |
| 3-05-01 | 05 | 3 | AUTH-05 | — | Edge Function não falha com RESEND_API_KEY ausente | manual | supabase functions invoke send-invite-email | ❌ W0 new | ⬜ pending |
| 3-06-01 | 06 | 4 | AUTH-06 | T-3-07 | listUsers não retorna usuários de outros tenants | manual | Verificar emails exibidos na tabela | ❌ W0 rewrite | ⬜ pending |
| 3-06-02 | 06 | 4 | AUTH-06 | — | disable-user invalida sessão (ban_duration) | manual | Login com usuário banido → erro | ❌ W0 new | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Verificar nome real do campo em `profiles` — `active` ou `ativo` — via query ao banco antes de implementar
- [ ] Verificar se lojas (Jebai, Pajé 1, Pajé 2) são tenants separados ou field text em profiles
- [ ] Criar diretório `supabase/functions/send-invite-email/` (não existe)
- [ ] Confirmar se `RESEND_API_KEY` está configurado em `.env.local` (email é opcional — skip silencioso se ausente)

*Framework de testes não instalado — validação via `npm run build` + lint + manual.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Middleware bloqueia /dashboard/* para vendedor | AUTH-01 | Sem framework de teste automatizado | Login como vendedor → tentar acessar /dashboard → esperar redirect para /meu-resultado |
| Middleware permite /dashboard/* para gerente | AUTH-01 | Sem framework de teste | Login como gerente → acessar /dashboard → deve carregar normalmente |
| /admin/* acessível apenas para super_admin | AUTH-01 | Sem framework de teste | Login como adm → tentar /admin → esperar redirect para /dashboard |
| /convite/[token] acessível sem sessão | AUTH-01 | Rota pública (sem auth) | Abrir link de convite em aba anônima → deve mostrar formulário, não /login |
| Token expirado rejeitado em /convite/[token] | AUTH-04 | Requer expiração manual | Inserir convite com expiry no passado → tentar aceitar → ver mensagem de erro |
| Email de convite enviado (quando RESEND configurado) | AUTH-05 | Integração externa | Verificar inbox do email-teste após criar convite com email preenchido |
| Usuário banido perde acesso em ~1h | AUTH-06 | Janela de tempo JWT | Desativar usuário → aguardar próximo refresh → verificar redirect para /login |
| Tabela não exibe usuários PetHub | AUTH-06 | Require dados reais multi-tenant | Verificar que emails na tabela são apenas do tenant gds-interno |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
