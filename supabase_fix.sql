-- Script para corrigir as tabelas no Supabase
-- Este script deve ser executado no SQL Editor do Supabase

-- Habilitar a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Corrigir a tabela de tarefas
DROP TABLE IF EXISTS public.tasks;
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL,
    created_by UUID NOT NULL,
    assigned_to UUID,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corrigir a tabela de eventos
DROP TABLE IF EXISTS public.events;
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL,
    created_by UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    type TEXT NOT NULL CHECK (type IN ('couple', 'work', 'social', 'health', 'cycle')),
    color TEXT DEFAULT '#6366F1',
    is_multi_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corrigir a tabela de hábitos
DROP TABLE IF EXISTS public.habits;
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL,
    created_by UUID NOT NULL,
    assigned_to UUID,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
    target_days TEXT[] DEFAULT '{}',
    streak INTEGER DEFAULT 0,
    user1_progress JSONB DEFAULT '{}'::JSONB,
    user2_progress JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corrigir a tabela de itens de compras
DROP TABLE IF EXISTS public.shopping_items;
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL,
    created_by UUID NOT NULL,
    item TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    list_type TEXT NOT NULL CHECK (list_type IN ('daily', 'home', 'special')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corrigir a tabela de solicitações
DROP TABLE IF EXISTS public.requests;
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reject_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de segurança para as tabelas
-- Política para tarefas
CREATE POLICY "Usuários podem ver suas próprias tarefas ou do casal" ON public.tasks
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar tarefas" ON public.tasks
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar suas próprias tarefas ou do casal" ON public.tasks
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem excluir suas próprias tarefas" ON public.tasks
    FOR DELETE USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Política para eventos
CREATE POLICY "Usuários podem ver seus próprios eventos ou do casal" ON public.events
    FOR SELECT USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar eventos" ON public.events
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar seus próprios eventos ou do casal" ON public.events
    FOR UPDATE USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem excluir seus próprios eventos" ON public.events
    FOR DELETE USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Política para hábitos
CREATE POLICY "Usuários podem ver seus próprios hábitos ou do casal" ON public.habits
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar hábitos" ON public.habits
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar seus próprios hábitos ou do casal" ON public.habits
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem excluir seus próprios hábitos" ON public.habits
    FOR DELETE USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Política para itens de compras
CREATE POLICY "Usuários podem ver seus próprios itens de compras ou do casal" ON public.shopping_items
    FOR SELECT USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar itens de compras" ON public.shopping_items
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar seus próprios itens de compras ou do casal" ON public.shopping_items
    FOR UPDATE USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem excluir seus próprios itens de compras" ON public.shopping_items
    FOR DELETE USING (
        auth.uid() = created_by OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Política para solicitações
CREATE POLICY "Usuários podem ver suas próprias solicitações ou do casal" ON public.requests
    FOR SELECT USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar solicitações" ON public.requests
    FOR INSERT WITH CHECK (
        auth.uid() = from_user_id AND
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar suas próprias solicitações ou recebidas" ON public.requests
    FOR UPDATE USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem excluir suas próprias solicitações" ON public.requests
    FOR DELETE USING (
        auth.uid() = from_user_id OR
        couple_id IN (
            SELECT id FROM public.couples 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Habilitar RLS (Row Level Security) para todas as tabelas
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Criar triggers para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON public.habits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at
BEFORE UPDATE ON public.shopping_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 