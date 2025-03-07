# Configuração do Supabase para o CasalSync

## Funções para contornar o RLS

Para resolver os erros "new row violates row-level security policy for table", você precisa criar funções SQL no Supabase que contornem as políticas de segurança.

### Passos para implementar:

1. Acesse o painel do Supabase (https://app.supabase.com)
2. Selecione seu projeto
3. Vá para a seção "SQL Editor"
4. Crie uma nova consulta
5. Cole o código abaixo:

```sql
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

6. Execute a consulta para criar as funções

## Políticas de Segurança (RLS)

Agora, configure as políticas de segurança para as tabelas:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela profiles
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para a tabela couples
CREATE POLICY "Usuários podem ver seus próprios casais"
  ON couples FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Usuários podem atualizar seus próprios casais"
  ON couples FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para a tabela events
CREATE POLICY "Usuários podem ver eventos do seu casal"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = events.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem criar eventos para seu casal"
  ON events FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = events.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem atualizar eventos do seu casal"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = events.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem excluir eventos que criaram"
  ON events FOR DELETE
  USING (created_by = auth.uid());
```

## Verificação

Após implementar as funções e as políticas, teste o registro de um novo usuário. Os erros de violação de política de segurança não devem mais aparecer.