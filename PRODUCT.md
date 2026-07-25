# Product

## Register

product

## Users

Duas personas internas, ambas funcionários das 3 lojas Da Silva em Ciudad del Este (Jebai, Pajé 1, Pajé 2):
- **adm** (gerente): acompanha ranking de vendedores, KPIs, importa dados CEC, calcula comissões. Contexto: escritório, sessão longa, decisões operacionais diárias.
- **vendedor**: consulta seu próprio resultado, treinamentos, regras de comissão e RH (dias livres, férias, faltas, permissões, atrasos). Contexto: consulta rápida entre atendimentos na loja, muitas vezes no celular ou num monitor compartilhado no balcão.

## Product Purpose

Sistema de gestão comercial e treinamento (GDS Dashboard v2 + LMS). Core value: gerentes enxergam performance real de cada vendedor e calculam comissões corretamente; vendedores sabem o que precisam fazer para vender mais e conseguem resolver RH (dia livre, férias, atestado) sem depender do gerente. Arquitetura multi-tenant para futura oferta SaaS a outras lojas de CDE.

## Brand Personality

Gold · Black · Royal Blue — Premium, Minimalista, Organizado. Ferramenta de trabalho séria, não app de consumo: precisa transmitir confiança e controle numa rotina de loja de varejo, sem parecer burocrática ou fria.

## Anti-references

Não parecer SaaS genérico: sem grid de cards uniformes sem hierarquia, sem "dashboard-by-numbers" (sidebar + cards + charts sem ponto de vista), sem hero-metric template. Evitar aparência de admin template não customizado.

## Design Principles

- Hierarquia clara entre o que precisa de ação agora (pendências, vencimentos) e o que é só histórico.
- Densidade de informação alta mas organizada — vendedor de loja não tem tempo para navegar fundo.
- Estados vazios e zerados (ex: "Nenhuma falta registrada") são normais e devem parecer positivos, não quebrados.
- Cores com significado semântico (disponível/vencido/utilizado), não decorativas.
- Consistência visual entre módulos (RH, Treinamentos, Regras de Comissão) reforça que é um único sistema, não telas soltas.

## Accessibility & Inclusion

WCAG AA como padrão. Sem requisito adicional confirmado no momento — revisar contraste de status badges (ex: "Disponível" em verde sobre fundo escuro) e garantir que tabelas sejam legíveis em telas menores de loja.
