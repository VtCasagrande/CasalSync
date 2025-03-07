-- Adicionar coluna is_personal às tabelas se não existir
DO $$
BEGIN
    -- Tabela events
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_personal') THEN
        ALTER TABLE public.events ADD COLUMN is_personal BOOLEAN DEFAULT FALSE;
        
        -- Modificar a restrição de couple_id para permitir NULL quando is_personal é TRUE
        ALTER TABLE public.events ALTER COLUMN couple_id DROP NOT NULL;
        
        -- Atualizar ou criar política de segurança para eventos pessoais
        DROP POLICY IF EXISTS events_personal_policy ON public.events;
        CREATE POLICY events_personal_policy ON public.events
            USING (couple_id IN (SELECT id FROM public.couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()) OR created_by = auth.uid());
    END IF;
    
    -- Tabela tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'is_personal') THEN
        ALTER TABLE public.tasks ADD COLUMN is_personal BOOLEAN DEFAULT FALSE;
        
        -- Modificar a restrição de couple_id para permitir NULL quando is_personal é TRUE
        ALTER TABLE public.tasks ALTER COLUMN couple_id DROP NOT NULL;
        
        -- Atualizar ou criar política de segurança para tarefas pessoais
        DROP POLICY IF EXISTS tasks_personal_policy ON public.tasks;
        CREATE POLICY tasks_personal_policy ON public.tasks
            USING (couple_id IN (SELECT id FROM public.couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()) OR created_by = auth.uid());
    END IF;
    
    -- Tabela shopping_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'shopping_items' AND column_name = 'is_personal') THEN
        ALTER TABLE public.shopping_items ADD COLUMN is_personal BOOLEAN DEFAULT FALSE;
        
        -- Modificar a restrição de couple_id para permitir NULL quando is_personal é TRUE
        ALTER TABLE public.shopping_items ALTER COLUMN couple_id DROP NOT NULL;
        
        -- Atualizar ou criar política de segurança para itens de compra pessoais
        DROP POLICY IF EXISTS shopping_items_personal_policy ON public.shopping_items;
        CREATE POLICY shopping_items_personal_policy ON public.shopping_items
            USING (couple_id IN (SELECT id FROM public.couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()) OR created_by = auth.uid());
    END IF;
    
    -- Tabela habits
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'is_personal') THEN
        ALTER TABLE public.habits ADD COLUMN is_personal BOOLEAN DEFAULT FALSE;
        
        -- Modificar a restrição de couple_id para permitir NULL quando is_personal é TRUE
        ALTER TABLE public.habits ALTER COLUMN couple_id DROP NOT NULL;
        
        -- Atualizar ou criar política de segurança para hábitos pessoais
        DROP POLICY IF EXISTS habits_personal_policy ON public.habits;
        CREATE POLICY habits_personal_policy ON public.habits
            USING (couple_id IN (SELECT id FROM public.couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()) OR created_by = auth.uid());
            
        -- Atualizar ou criar política de inserção para hábitos pessoais
        DROP POLICY IF EXISTS habits_insert_policy ON public.habits;
        CREATE POLICY habits_insert_policy ON public.habits
            FOR INSERT WITH CHECK (
                auth.uid() = created_by AND
                (couple_id IN (SELECT id FROM public.couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()) OR is_personal = TRUE)
            );
    END IF;
END
$$; 