-- Script para adicionar colunas de progresso à tabela de hábitos
DO $$
BEGIN
    -- Adicionar coluna progress (JSONB) para armazenar o progresso diário
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'progress') THEN
        ALTER TABLE public.habits ADD COLUMN progress JSONB DEFAULT '{}'::JSONB;
    END IF;
    
    -- Adicionar coluna streak para armazenar a sequência atual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'streak') THEN
        ALTER TABLE public.habits ADD COLUMN streak INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna last_completed para armazenar a data da última conclusão
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'last_completed') THEN
        ALTER TABLE public.habits ADD COLUMN last_completed DATE;
    END IF;
    
    -- Adicionar coluna time para armazenar o horário do hábito
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'time') THEN
        ALTER TABLE public.habits ADD COLUMN time TIME;
    END IF;
    
    -- Adicionar coluna target_count para armazenar a meta diária
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'target_count') THEN
        ALTER TABLE public.habits ADD COLUMN target_count INTEGER DEFAULT 1;
    END IF;
    
    -- Adicionar coluna current_count para armazenar o progresso atual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'current_count') THEN
        ALTER TABLE public.habits ADD COLUMN current_count INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna assigned_to para indicar a quem o hábito é atribuído
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'assigned_to') THEN
        ALTER TABLE public.habits ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
    END IF;
END
$$; 