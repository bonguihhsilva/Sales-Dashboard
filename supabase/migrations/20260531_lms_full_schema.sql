-- supabase/migrations/20260531_lms_full_schema.sql
-- Migration para o Módulo de Treinamentos (Trilhas) e Avaliações

-- 1. Criação das Tabelas Base

-- TRILHAS
CREATE TABLE IF NOT EXISTS public.trilhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MÓDULOS
CREATE TABLE IF NOT EXISTS public.modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    trilha_id UUID NOT NULL REFERENCES public.trilhas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENUM para Tipo de Conteúdo
DO $$ BEGIN
    CREATE TYPE content_type_enum AS ENUM ('video', 'pdf', 'slide', 'texto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AULAS
CREATE TABLE IF NOT EXISTS public.aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    tipo_conteudo content_type_enum NOT NULL DEFAULT 'video',
    url_midia TEXT, -- URL do storage, youtube, etc
    conteudo_texto TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Avaliações

-- QUIZZES (Perguntas soltas nas aulas)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    opcoes JSONB NOT NULL, -- Array: ["A", "B", "C"]
    indice_correta INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROVAS (Final do módulo)
CREATE TABLE IF NOT EXISTS public.provas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    nota_minima INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUESTÕES DA PROVA
CREATE TABLE IF NOT EXISTS public.questoes_prova (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    prova_id UUID NOT NULL REFERENCES public.provas(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    opcoes JSONB NOT NULL,
    indice_correta INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Progresso do Usuário

-- PROGRESSO AULAS
CREATE TABLE IF NOT EXISTS public.progresso_aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
    concluida_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, aula_id)
);

-- PROGRESSO MÓDULOS
CREATE TABLE IF NOT EXISTS public.progresso_modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
    nota_prova DECIMAL,
    aprovado BOOLEAN DEFAULT false,
    concluido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, modulo_id)
);

-- 4. Row Level Security (RLS)
ALTER TABLE public.trilhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes_prova ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_modulos ENABLE ROW LEVEL SECURITY;

-- Funcao auxiliar para RLS (caso precise otimizar depois, melhor usar auth.jwt())
-- Por enquanto usando join com profiles para garantir
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policies Trilhas
CREATE POLICY "tenant_isolation_trilhas" ON public.trilhas
    FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policies Modulos
CREATE POLICY "tenant_isolation_modulos" ON public.modulos
    FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policies Aulas
CREATE POLICY "tenant_isolation_aulas" ON public.aulas
    FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policies Quizzes
CREATE POLICY "tenant_isolation_quizzes" ON public.quizzes
    FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policies Provas
CREATE POLICY "tenant_isolation_provas" ON public.provas
    FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policies Questoes Prova
CREATE POLICY "tenant_isolation_questoes_prova" ON public.questoes_prova
    FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policies Progresso Aulas
CREATE POLICY "tenant_isolation_progresso_aulas" ON public.progresso_aulas
    FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policies Progresso Modulos
CREATE POLICY "tenant_isolation_progresso_modulos" ON public.progresso_modulos
    FOR ALL USING (tenant_id = get_user_tenant_id());
