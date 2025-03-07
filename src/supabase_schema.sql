  -- Adicionar a extensão uuid-ossp se ainda não existir
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Criar tabela de perfis de usuários com campos adicionais
  CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    birth_date DATE,
    user_type TEXT NOT NULL CHECK (user_type IN ('man', 'woman')),
    hobbies TEXT[],
    avatar_url TEXT,
    bio TEXT,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de perfis
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de casais com campos adicionais
  CREATE TABLE public.couples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive')),
    partner_code TEXT UNIQUE,
    relationship_start_date DATE,
    anniversary_reminder BOOLEAN DEFAULT TRUE,
    shared_calendar_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de casais
  ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de eventos
  CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    reminder BOOLEAN DEFAULT TRUE,
    reminder_time INTEGER DEFAULT 60, -- minutos antes do evento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de eventos
  ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de tarefas
  CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de tarefas
  ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de solicitações
  CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de solicitações
  ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de itens de compras
  CREATE TABLE public.shopping_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    category TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'purchased')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de itens de compras
  ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de hábitos
  CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de hábitos
  ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de dados do ciclo menstrual
  CREATE TABLE public.cycle_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_period_date DATE NOT NULL,
    cycle_duration INTEGER DEFAULT 28,
    period_duration INTEGER DEFAULT 5,
    symptoms TEXT[],
    notes TEXT,
    fertility_tracking BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de dados do ciclo
  ALTER TABLE public.cycle_data ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de notificações
  CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('update', 'reminder', 'achievement', 'request', 'system')),
    related_entity_type TEXT,
    related_entity_id UUID,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de notificações
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de pontos de gamificação
  CREATE TABLE public.user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de pontos
  ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de conquistas
  CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    icon TEXT,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de conquistas
  ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

  -- Criar tabela de conquistas do usuário
  CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Habilitar RLS na tabela de conquistas do usuário
  ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

  -- Criar função para atualizar o timestamp de atualização
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Criar triggers para atualizar o timestamp de atualização
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

  CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Criar função para criar perfil automaticamente quando um usuário é criado
  CREATE OR REPLACE FUNCTION public.create_profile_for_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, name, email, user_type)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'man')
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Criar trigger para criar perfil automaticamente
  DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
  CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

  -- Políticas de segurança para perfis
  CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

  CREATE POLICY "Usuários podem ver perfis de seus parceiros"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        (user1_id = auth.uid() AND user2_id = id) OR
        (user2_id = auth.uid() AND user1_id = id)
    )
  );

  CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

  -- Políticas de segurança para casais
  CREATE POLICY "Usuários podem ver seus próprios casais"
  ON public.couples
  FOR SELECT
  USING (
    user1_id = auth.uid() OR
    user2_id = auth.uid()
  );

  CREATE POLICY "Usuários podem atualizar seus próprios casais"
  ON public.couples
  FOR UPDATE
  USING (
    user1_id = auth.uid() OR
    user2_id = auth.uid()
  );

  -- Adicionar política para permitir a inserção de casais
  CREATE POLICY "Usuários podem criar seus próprios casais"
  ON public.couples
  FOR INSERT
  WITH CHECK (
    user1_id = auth.uid()
  );

  -- Políticas de segurança para eventos
  CREATE POLICY "Usuários podem ver eventos de seus casais"
  ON public.events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = events.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem criar eventos para seus casais"
  ON public.events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = events.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem atualizar eventos de seus casais"
  ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = events.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem excluir eventos que criaram"
  ON public.events
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = events.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  -- Políticas de segurança para tarefas
  CREATE POLICY "Usuários podem ver tarefas de seus casais"
  ON public.tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = tasks.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem criar tarefas para seus casais"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = tasks.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem atualizar tarefas de seus casais"
  ON public.tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = tasks.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem excluir tarefas que criaram"
  ON public.tasks
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = tasks.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  -- Políticas de segurança para solicitações
  CREATE POLICY "Usuários podem ver solicitações de seus casais"
  ON public.requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = requests.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem criar solicitações para seus casais"
  ON public.requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = requests.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem atualizar solicitações de seus casais"
  ON public.requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = requests.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem excluir solicitações que criaram"
  ON public.requests
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = requests.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  -- Políticas de segurança para itens de compras
  CREATE POLICY "Usuários podem ver itens de compras de seus casais"
  ON public.shopping_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = shopping_items.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem criar itens de compras para seus casais"
  ON public.shopping_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = shopping_items.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem atualizar itens de compras de seus casais"
  ON public.shopping_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = shopping_items.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem excluir itens de compras que criaram"
  ON public.shopping_items
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = shopping_items.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  -- Políticas de segurança para hábitos
  CREATE POLICY "Usuários podem ver hábitos de seus casais"
  ON public.habits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = habits.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem criar hábitos para seus casais"
  ON public.habits
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = habits.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem atualizar hábitos de seus casais"
  ON public.habits
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = habits.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  CREATE POLICY "Usuários podem excluir hábitos que criaram"
  ON public.habits
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        id = habits.couple_id AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

  -- Políticas de segurança para dados do ciclo
  CREATE POLICY "Usuários podem ver seus próprios dados de ciclo"
  ON public.cycle_data
  FOR SELECT
  USING (user_id = auth.uid());

  CREATE POLICY "Usuários podem ver dados de ciclo de seus parceiros"
  ON public.cycle_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        (user1_id = auth.uid() AND user2_id = cycle_data.user_id) OR
        (user2_id = auth.uid() AND user1_id = cycle_data.user_id)
    )
  );

  CREATE POLICY "Usuários podem atualizar seus próprios dados de ciclo"
  ON public.cycle_data
  FOR UPDATE
  USING (user_id = auth.uid());

  CREATE POLICY "Usuários podem criar seus próprios dados de ciclo"
  ON public.cycle_data
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

  -- Script de atualização para adicionar novos campos e funcionalidades

  -- Verificar se os campos já existem antes de adicioná-los
  DO $$
  BEGIN
      -- Adicionar campos à tabela profiles se não existirem
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
          ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio') THEN
          ALTER TABLE public.profiles ADD COLUMN bio TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notification_preferences') THEN
          ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true}';
      END IF;
      
      -- Adicionar campos à tabela couples se não existirem
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'couples' AND column_name = 'anniversary_reminder') THEN
          ALTER TABLE public.couples ADD COLUMN anniversary_reminder BOOLEAN DEFAULT TRUE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'couples' AND column_name = 'shared_calendar_enabled') THEN
          ALTER TABLE public.couples ADD COLUMN shared_calendar_enabled BOOLEAN DEFAULT TRUE;
      END IF;
      
      -- Adicionar campos à tabela events se não existirem
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'location') THEN
          ALTER TABLE public.events ADD COLUMN location TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'reminder') THEN
          ALTER TABLE public.events ADD COLUMN reminder BOOLEAN DEFAULT TRUE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'reminder_time') THEN
          ALTER TABLE public.events ADD COLUMN reminder_time INTEGER DEFAULT 60; -- minutos antes do evento
      END IF;
  END
  $$;

  -- Adicionar políticas de RLS que podem estar faltando

  -- Verificar se a coluna couple_id existe na tabela tasks
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'couple_id') THEN
          ALTER TABLE public.tasks ADD COLUMN couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE;
      END IF;
  END
  $$;

  -- Verificar se a coluna couple_id existe na tabela requests
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'requests' AND column_name = 'couple_id') THEN
          ALTER TABLE public.requests ADD COLUMN couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE;
      END IF;
  END
  $$;

  -- Verificar se a coluna couple_id existe na tabela shopping_items
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'shopping_items' AND column_name = 'couple_id') THEN
          ALTER TABLE public.shopping_items ADD COLUMN couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE;
      END IF;
  END
  $$;

  -- Verificar se a coluna couple_id existe na tabela habits
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'couple_id') THEN
          ALTER TABLE public.habits ADD COLUMN couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE;
      END IF;
  END
  $$;

  -- Políticas para a tabela tasks
  DROP POLICY IF EXISTS "Usuários podem ver tarefas de seus casais" ON public.tasks;
  CREATE POLICY "Usuários podem ver tarefas de seus casais"
  ON public.tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = tasks.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem criar tarefas para seus casais" ON public.tasks;
  CREATE POLICY "Usuários podem criar tarefas para seus casais"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = tasks.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem atualizar tarefas de seus casais" ON public.tasks;
  CREATE POLICY "Usuários podem atualizar tarefas de seus casais"
  ON public.tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = tasks.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem excluir tarefas de seus casais" ON public.tasks;
  CREATE POLICY "Usuários podem excluir tarefas de seus casais"
  ON public.tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = tasks.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  -- Políticas para a tabela requests
  DROP POLICY IF EXISTS "Usuários podem ver solicitações de seus casais" ON public.requests;
  CREATE POLICY "Usuários podem ver solicitações de seus casais"
  ON public.requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = requests.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem criar solicitações para seus casais" ON public.requests;
  CREATE POLICY "Usuários podem criar solicitações para seus casais"
  ON public.requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = requests.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem atualizar solicitações de seus casais" ON public.requests;
  CREATE POLICY "Usuários podem atualizar solicitações de seus casais"
  ON public.requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = requests.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem excluir solicitações de seus casais" ON public.requests;
  CREATE POLICY "Usuários podem excluir solicitações de seus casais"
  ON public.requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = requests.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  -- Políticas para a tabela shopping_items
  DROP POLICY IF EXISTS "Usuários podem ver itens de compra de seus casais" ON public.shopping_items;
  CREATE POLICY "Usuários podem ver itens de compra de seus casais"
  ON public.shopping_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = shopping_items.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem criar itens de compra para seus casais" ON public.shopping_items;
  CREATE POLICY "Usuários podem criar itens de compra para seus casais"
  ON public.shopping_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = shopping_items.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem atualizar itens de compra de seus casais" ON public.shopping_items;
  CREATE POLICY "Usuários podem atualizar itens de compra de seus casais"
  ON public.shopping_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = shopping_items.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem excluir itens de compra de seus casais" ON public.shopping_items;
  CREATE POLICY "Usuários podem excluir itens de compra de seus casais"
  ON public.shopping_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = shopping_items.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  -- Políticas para a tabela habits
  DROP POLICY IF EXISTS "Usuários podem ver hábitos de seus casais" ON public.habits;
  CREATE POLICY "Usuários podem ver hábitos de seus casais"
  ON public.habits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = habits.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem criar hábitos para seus casais" ON public.habits;
  CREATE POLICY "Usuários podem criar hábitos para seus casais"
  ON public.habits
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = habits.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem atualizar hábitos de seus casais" ON public.habits;
  CREATE POLICY "Usuários podem atualizar hábitos de seus casais"
  ON public.habits
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = habits.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  DROP POLICY IF EXISTS "Usuários podem excluir hábitos de seus casais" ON public.habits;
  CREATE POLICY "Usuários podem excluir hábitos de seus casais"
  ON public.habits
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        couples.id = habits.couple_id AND
        (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

  -- Políticas para a tabela cycle_data
  DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados de ciclo" ON public.cycle_data;
  CREATE POLICY "Usuários podem ver seus próprios dados de ciclo"
  ON public.cycle_data
  FOR SELECT
  USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Usuários podem ver dados de ciclo de seus parceiros" ON public.cycle_data;
  CREATE POLICY "Usuários podem ver dados de ciclo de seus parceiros"
  ON public.cycle_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE 
        (couples.user1_id = auth.uid() AND couples.user2_id = cycle_data.user_id) OR
        (couples.user2_id = auth.uid() AND couples.user1_id = cycle_data.user_id)
    )
  );

  DROP POLICY IF EXISTS "Usuários podem criar seus próprios dados de ciclo" ON public.cycle_data;
  CREATE POLICY "Usuários podem criar seus próprios dados de ciclo"
  ON public.cycle_data
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados de ciclo" ON public.cycle_data;
  CREATE POLICY "Usuários podem atualizar seus próprios dados de ciclo"
  ON public.cycle_data
  FOR UPDATE
  USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Usuários podem excluir seus próprios dados de ciclo" ON public.cycle_data;
  CREATE POLICY "Usuários podem excluir seus próprios dados de ciclo"
  ON public.cycle_data
  FOR DELETE
  USING (user_id = auth.uid());

  -- Políticas para a tabela notifications
  DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias notificações" ON public.notifications;
  CREATE POLICY "Usuários podem ver apenas suas próprias notificações"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = recipient_id);

  DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias notificações" ON public.notifications;
  CREATE POLICY "Usuários podem atualizar apenas suas próprias notificações"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = recipient_id);

  DROP POLICY IF EXISTS "Usuários autenticados podem criar notificações" ON public.notifications;
  CREATE POLICY "Usuários autenticados podem criar notificações"
    ON public.notifications
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  -- Política para permitir que usuários vejam apenas seus próprios pontos
  CREATE POLICY "Usuários podem ver apenas seus próprios pontos"
    ON public.user_points
    FOR SELECT
    USING (auth.uid() = user_id);

  -- Política para permitir que usuários vejam todas as conquistas
  CREATE POLICY "Usuários podem ver todas as conquistas"
    ON public.achievements
    FOR SELECT
    USING (auth.role() = 'authenticated');

  -- Política para permitir que usuários vejam apenas suas próprias conquistas
  CREATE POLICY "Usuários podem ver apenas suas próprias conquistas"
    ON public.user_achievements
    FOR SELECT
    USING (auth.uid() = user_id); 