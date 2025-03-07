-- Script para adicionar a coluna type à tabela events
DO $$
BEGIN
    -- Verificar se a coluna type já existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'type') THEN
        -- Adicionar a coluna type com valor padrão 'event'
        ALTER TABLE public.events ADD COLUMN type VARCHAR(20) DEFAULT 'event' NOT NULL;
        
        -- Adicionar a restrição de verificação para os valores permitidos
        ALTER TABLE public.events ADD CONSTRAINT events_type_check 
            CHECK (type IN ('event', 'birthday', 'anniversary', 'holiday', 'meeting', 'reminder', 'task', 'request', 'cycle'));
        
        RAISE NOTICE 'Coluna "type" adicionada à tabela "events" com sucesso.';
    ELSE
        RAISE NOTICE 'A coluna "type" já existe na tabela "events".';
    END IF;
END
$$; 