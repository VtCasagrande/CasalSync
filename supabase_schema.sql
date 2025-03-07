-- Habilitar a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CRIAÇÃO DE TABELAS
-- =============================================

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    birth_date DATE,
    user_type TEXT CHECK (user_type IN ('man', 'woman')),
    bio TEXT,
    hobbies TEXT[],
    notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de casais (relacionamento entre usuários)
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    anniversary DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    partner_code TEXT UNIQUE,
    relationship_start_date DATE
);

-- Tabela de eventos do calendário
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    type TEXT NOT NULL CHECK (type IN ('couple', 'work', 'social', 'health', 'cycle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de solicitações
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reject_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de compras
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    list_type TEXT NOT NULL CHECK (list_type IN ('daily', 'home', 'special')),
    priority TEXT DEFAULT 'média' CHECK (priority IN ('baixa', 'média', 'alta')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de hábitos
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
    days JSONB DEFAULT '{}'::JSONB,
    streak INTEGER DEFAULT 0,
    user1_progress JSONB DEFAULT '{}'::JSONB,
    user2_progress JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de dados do ciclo menstrual
CREATE TABLE IF NOT EXISTS public.cycle_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    last_period_start DATE,
    cycle_length INTEGER DEFAULT 28,
    period_length INTEGER DEFAULT 5,
    tracking_since DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    symptoms JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que cada usuário tenha apenas um registro de ciclo
    CONSTRAINT unique_user_cycle UNIQUE (user_id)
);

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para criar perfil automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        name, 
        email,
        phone,
        birth_date,
        user_type,
        bio,
        hobbies
    )
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'name', 
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        (NEW.raw_user_meta_data->>'birth_date')::DATE,
        NEW.raw_user_meta_data->>'user_type',
        NEW.raw_user_meta_data->>'bio',
        CASE 
            WHEN NEW.raw_user_meta_data->>'hobbies' IS NOT NULL 
            THEN string_to_array(NEW.raw_user_meta_data->>'hobbies', ',')
            ELSE NULL
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando um usuário é criado
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Triggers para atualizar 'updated_at' automaticamente
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couples_updated_at
BEFORE UPDATE ON public.couples
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at
BEFORE UPDATE ON public.shopping_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON public.habits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cycle_data_updated_at
BEFORE UPDATE ON public.cycle_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CRIAÇÃO DE ÍNDICES
-- =============================================

-- Criar índices para garantir unicidade quando o status é 'active'
-- Usando CREATE UNIQUE INDEX com a sintaxe correta para índices parciais
CREATE UNIQUE INDEX IF NOT EXISTS unique_user1_active ON public.couples (user1_id) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS unique_user2_active ON public.couples (user2_id) WHERE status = 'active';

-- =============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_data ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem ver perfis de seus parceiros" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE (couples.user1_id = auth.uid() AND couples.user2_id = profiles.id)
            OR (couples.user2_id = auth.uid() AND couples.user1_id = profiles.id)
        )
    );
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para casais
CREATE POLICY "Usuários podem ver seus próprios casais" ON public.couples
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Usuários podem criar seus próprios casais" ON public.couples
    FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Usuários podem atualizar seus próprios casais" ON public.couples
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Usuários podem excluir seus próprios casais" ON public.couples
    FOR DELETE USING (auth.uid() = user1_id);

-- Políticas para eventos
CREATE POLICY "Usuários podem ver eventos do seu casal" ON public.events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = events.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem criar eventos para seu casal" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = events.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem atualizar eventos do seu casal" ON public.events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = events.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem excluir eventos que criaram" ON public.events
    FOR DELETE USING (created_by = auth.uid());

-- Políticas para tarefas
CREATE POLICY "Usuários podem ver tarefas do seu casal" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = tasks.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem criar tarefas para seu casal" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = tasks.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem atualizar tarefas do seu casal" ON public.tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = tasks.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem excluir tarefas que criaram" ON public.tasks
    FOR DELETE USING (created_by = auth.uid());

-- Políticas para solicitações
CREATE POLICY "Usuários podem ver solicitações do seu casal" ON public.requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = requests.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem criar solicitações para seu casal" ON public.requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = requests.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem atualizar solicitações do seu casal" ON public.requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = requests.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem excluir solicitações que criaram" ON public.requests
    FOR DELETE USING (from_user_id = auth.uid());

-- Políticas para itens de compras
CREATE POLICY "Usuários podem ver itens de compras do seu casal" ON public.shopping_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = shopping_items.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem criar itens de compras para seu casal" ON public.shopping_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = shopping_items.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem atualizar itens de compras do seu casal" ON public.shopping_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = shopping_items.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem excluir itens de compras que criaram" ON public.shopping_items
    FOR DELETE USING (created_by = auth.uid());

-- Políticas para hábitos
CREATE POLICY "Usuários podem ver hábitos do seu casal" ON public.habits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = habits.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem criar hábitos para seu casal" ON public.habits
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = habits.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem atualizar hábitos do seu casal" ON public.habits
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = habits.couple_id
            AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
        )
    );
CREATE POLICY "Usuários podem excluir hábitos que criaram" ON public.habits
    FOR DELETE USING (created_by = auth.uid());

-- Políticas para dados do ciclo menstrual
CREATE POLICY "Usuários podem ver seus próprios dados de ciclo" ON public.cycle_data
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Parceiros podem ver dados de ciclo" ON public.cycle_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = cycle_data.couple_id
            AND ((couples.user1_id = auth.uid() AND couples.user2_id = cycle_data.user_id)
                OR (couples.user2_id = auth.uid() AND couples.user1_id = cycle_data.user_id))
        )
    );
CREATE POLICY "Usuários podem criar seus próprios dados de ciclo" ON public.cycle_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios dados de ciclo" ON public.cycle_data
    FOR UPDATE USING (auth.uid() = user_id); 