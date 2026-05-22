# Da Silva Dashboard.

Painel de vendas e metas — Next.js + Supabase + Vercel

## Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas chaves

# 3. Rodar em desenvolvimento
npm run dev
```

```

### Vercel (produção)
Adicionar as mesmas 3 variáveis no painel da Vercel:
Settings → Environment Variables

## Deploy na Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

Ou conectar o repositório GitHub diretamente no painel da Vercel.

## Estrutura de roles

| Role     | Acesso                                      |
|----------|---------------------------------------------|
| `adm`    | Dashboard completo, todos os vendedores, upload de dados, gestão de usuários |
| `vendedor` | Apenas seus próprios dados (`/meu-resultado`) |

## Fluxo de uso mensal

1. Exportar o "Listado de Ventas" do sistema como HTML
2. Entrar no dashboard como ADM
3. Clicar em **+ Upload HTML**
4. Selecionar o período e o arquivo
5. Aguardar importação — dados ficam disponíveis imediatamente

## Criar novo período (mês)

No Supabase Studio → SQL Editor:
```sql
INSERT INTO periods (year, month, label, start_date, end_date)
VALUES (2026, 4, 'Abril 2026', '2026-04-01', '2026-04-30');

-- Depois inserir as metas do novo mês em goals
```

## Gestão de usuários

Acessar `/dashboard/usuarios` como ADM para:
- Criar novos usuários
- Vincular usuário ao vendedor correspondente
- Ativar/desativar acesso
# Sat Mar 28 01:41:33 UTC 2026
