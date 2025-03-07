-- Função para criar um perfil contornando o RLS
CREATE OR REPLACE FUNCTION create_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT,
  user_birth_date DATE,
  user_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função
AS $$
DECLARE
  result JSONB;
  profile_exists BOOLEAN;
BEGIN
  -- Verificar se o perfil já existe
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id
  ) INTO profile_exists;
  
  -- Só inserir se o perfil não existir
  IF NOT profile_exists THEN
    -- Inserir o novo perfil
    INSERT INTO profiles (
      id,
      email,
      name,
      phone,
      birth_date,
      user_type,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      user_email,
      user_name,
      user_phone,
      user_birth_date,
      user_type,
      NOW(),
      NOW()
    );
  END IF;
  
  -- Buscar o perfil (existente ou recém-criado)
  SELECT row_to_json(p)::JSONB INTO result
  FROM profiles p
  WHERE p.id = user_id;
  
  RETURN result;
END;
$$;

-- Função para criar um casal contornando o RLS
CREATE OR REPLACE FUNCTION create_couple(
  user1_id UUID,
  user2_id UUID,
  status TEXT,
  partner_code TEXT,
  relationship_start_date DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função
AS $$
DECLARE
  result JSONB;
  couple_exists BOOLEAN;
  couple_id UUID;
BEGIN
  -- Verificar se o casal já existe
  SELECT EXISTS (
    SELECT 1 FROM couples 
    WHERE (user1_id = $1 OR user2_id = $1)
  ) INTO couple_exists;
  
  -- Só inserir se o casal não existir
  IF NOT couple_exists THEN
    -- Gerar um novo UUID para o casal
    couple_id := uuid_generate_v4();
    
    -- Inserir o novo casal
    INSERT INTO couples (
      id,
      user1_id,
      user2_id,
      status,
      partner_code,
      relationship_start_date,
      created_at,
      updated_at
    ) VALUES (
      couple_id,
      user1_id,
      user2_id,
      status,
      partner_code,
      relationship_start_date,
      NOW(),
      NOW()
    );
  ELSE
    -- Obter o ID do casal existente
    SELECT id INTO couple_id
    FROM couples
    WHERE (user1_id = $1 OR user2_id = $1)
    LIMIT 1;
  END IF;
  
  -- Buscar o casal (existente ou recém-criado)
  SELECT row_to_json(c)::JSONB INTO result
  FROM couples c
  WHERE c.id = couple_id;
  
  RETURN result;
END;
$$;

-- Função para executar comandos SQL dinamicamente
-- Esta função permite executar comandos SQL a partir da aplicação
CREATE OR REPLACE FUNCTION execute_sql(sql_command TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Executar o comando SQL
  EXECUTE sql_command;
  
  -- Retornar sucesso
  result := json_build_object('success', true)::JSONB;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, retornar a mensagem de erro
  result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  )::JSONB;
  
  RETURN result;
END;
$$;

-- Conceder permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated; 