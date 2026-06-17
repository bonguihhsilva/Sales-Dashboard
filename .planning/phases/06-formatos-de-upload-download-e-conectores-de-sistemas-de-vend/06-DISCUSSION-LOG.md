# Phase 6: Formatos de upload/download e conectores — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend
**Areas discussed:** Formatos reais de cada sistema, Detecção automática de sistema, Mapeamento de IDs, Download PDF/XLSX

---

## Formatos reais de cada sistema

| Option | Description | Selected |
|--------|-------------|----------|
| CEC: HTML (já funciona) | Parser atual cobre CEC | |
| CEC precisa revisão | Formato mudou ou há problemas | |
| API direta com outros sistemas | Dashboard consome REST APIs de Pegasus/ISRP | ✓ |

**User's choice:** "quero colocar uma api em meu dashboard q permita conectar com outros sistemas alem de importacao manual"
**Notes:** O CEC é exportação manual feita pelo usuário. A fase foca em conectores de API REST para Pegasus e ISRP que têm APIs disponíveis.

---

## Tipo de Conector

| Option | Description | Selected |
|--------|-------------|----------|
| API REST (call de saída) | Dashboard chama APIs dos sistemas | ✓ |
| Arquivo exportado | Ler arquivo no formato de cada sistema | |
| Webhook/push | Sistemas enviam dados para o dashboard | |

**User's choice:** Pegasus e ISRP têm APIs REST chamáveis.

---

## Fluxo de Sync

| Option | Description | Selected |
|--------|-------------|----------|
| Botão manual | Gerente clica para puxar dados | |
| Agendado automático | Cron sem intervenção | |
| Híbrido | Agendado + botão forçar sync manual | ✓ |

**User's choice:** Híbrido — agendado por padrão + botão forçar sync manual.

---

## Credenciais / Documentação das APIs

| Option | Description | Selected |
|--------|-------------|----------|
| Tenho para ambos | Implementação completa agora | |
| Tenho para um | Conector completo + scaffolding para o outro | |
| Não tenho ainda | Arquitetura + stubs, preencher quando credenciais chegarem | ✓ |
| Só um tem API | Focar no disponível | |

**User's choice:** Não tem credenciais ainda — fase prepara arquitetura e stubs.

---

## Detecção Automática de Sistema (para uploads manuais)

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown antes do upload | Usuário seleciona sistema | |
| Fingerprint automático | Sistema detecta por estrutura/colunas | ✓ |
| Por nome do arquivo | Convenção de nome | |

**User's choice:** Detecção automática por fingerprint do arquivo.

---

## Fallback de Detecção

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown para o usuário escolher | Graceful fallback | ✓ |
| Rejeitar o arquivo | Estrito | |
| Tentar parser padrão CEC | Comportamento atual | |

**User's choice:** Mostrar dropdown para o usuário escolher manualmente quando fingerprint falha.

---

## Mapeamento de Vendor IDs

| Option | Description | Selected |
|--------|-------------|----------|
| Mesmo código em todos | Sem mapeamento | |
| Códigos diferentes | Tabela de mapeamento | |
| Não sei ainda | Arquitetura genérica que suporta mapeamento | ✓ |

**User's choice:** Depende do que as APIs retornam — arquitetura genérica.

---

## Mapeamento de Client IDs

| Option | Description | Selected |
|--------|-------------|----------|
| Tabela de mapeamento por sistema | Estrutura limpa | |
| Prefixo (CEC_123, PEG_456) | Simples, sem mapeamento | |
| Delegar ao Claude | Implementar abordagem mais sensível | ✓ |

**User's choice:** Delegado ao Claude.

---

## Formatos de Export

| Option | Description | Selected |
|--------|-------------|----------|
| XLSX | Excel formatado | |
| PDF | Relatório para impressão/envio | |
| Ambos (XLSX e PDF) | Gerente escolhe | ✓ |

**User's choice:** Ambos — XLSX e PDF como opções separadas.

---

## Conteúdo do Export

| Option | Description | Selected |
|--------|-------------|----------|
| Comissões + vendas por vendedor | Mesmos dados do CSV atual | ✓ |
| Incluir LMS (XP, badges) | Relatório 360° | |
| Separado por tipo | Planilha de vendas + planilha de comissões | |

**User's choice:** Comissões + vendas consolidadas — mesmos dados do CSV existente.

---

## Nível de Formatação do PDF

| Option | Description | Selected |
|--------|-------------|----------|
| Simples e legível | Tabela limpa com header/logo | ✓ |
| Identidade visual GDS (gold, black) | Relatório formal | |
| Delegar ao Claude | Claude decide | |

**User's choice:** Simples mas legível — tabela limpa com header/logo, funcional para envio por email.

---

## Claude's Discretion

- Arquitetura interna dos conectores
- Estratégia de fingerprinting de arquivos
- Mapeamento de client_id cross-system (prefixo recomendado)
- Biblioteca PDF para Next.js serverless
- Schema de tabelas `connectors` e `connector_id_mappings`

## Deferred Ideas

- UI de mapeamento de IDs (Phase 7)
- LMS no export
- Webhooks/push para o dashboard
- Sync histórico em batch
