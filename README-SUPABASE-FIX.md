# Instruções para Corrigir as Tabelas no Supabase

Este documento contém instruções sobre como corrigir as tabelas no Supabase para que o aplicativo CasalSync funcione corretamente.

## Problema Identificado

O aplicativo CasalSync está enfrentando problemas ao tentar criar tarefas, eventos, hábitos e itens de compras porque a estrutura das tabelas no Supabase não corresponde à estrutura esperada pelo código. Especificamente:

1. A tabela `tasks` está usando `bigint` para o campo `id` em vez de `UUID`.
2. Algumas colunas necessárias podem estar faltando ou ter nomes diferentes.
3. As políticas de segurança (RLS) podem não estar configuradas corretamente.

## Solução

Foi criado um arquivo SQL (`supabase_fix.sql`) que contém comandos para:

1. Recriar todas as tabelas com a estrutura correta
2. Adicionar políticas de segurança (RLS) para cada tabela
3. Configurar triggers para atualizar automaticamente o campo `updated_at`

## Como Aplicar a Correção

1. Faça login no painel de administração do Supabase
2. Navegue até o SQL Editor
3. Copie e cole o conteúdo do arquivo `supabase_fix.sql`
4. Execute o script

**Importante**: Este script irá excluir e recriar as tabelas, o que significa que todos os dados existentes serão perdidos. Se você tiver dados importantes, faça um backup antes de executar o script.

## Estrutura das Tabelas Corrigidas

### Tabela `tasks`
- `id`: UUID (chave primária)
- `couple_id`: UUID (não nulo)
- `created_by`: UUID (não nulo)
- `assigned_to`: UUID (pode ser nulo)
- `title`: TEXT (não nulo)
- `description`: TEXT
- `due_date`: TIMESTAMP WITH TIME ZONE
- `priority`: TEXT (padrão: 'medium')
- `status`: TEXT (padrão: 'pending')
- `completed`: BOOLEAN (padrão: FALSE)
- `created_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())
- `updated_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())

### Tabela `events`
- `id`: UUID (chave primária)
- `couple_id`: UUID (não nulo)
- `created_by`: UUID (não nulo)
- `title`: TEXT (não nulo)
- `description`: TEXT
- `start_date`: TIMESTAMP WITH TIME ZONE (não nulo)
- `end_date`: TIMESTAMP WITH TIME ZONE
- `all_day`: BOOLEAN (padrão: FALSE)
- `location`: TEXT
- `type`: TEXT (não nulo)
- `color`: TEXT (padrão: '#6366F1')
- `is_multi_day`: BOOLEAN (padrão: FALSE)
- `created_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())
- `updated_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())

### Tabela `habits`
- `id`: UUID (chave primária)
- `couple_id`: UUID (não nulo)
- `created_by`: UUID (não nulo)
- `assigned_to`: UUID (pode ser nulo)
- `title`: TEXT (não nulo)
- `description`: TEXT
- `frequency`: TEXT (não nulo)
- `target_days`: TEXT[] (padrão: '{}')
- `streak`: INTEGER (padrão: 0)
- `user1_progress`: JSONB (padrão: '{}')
- `user2_progress`: JSONB (padrão: '{}')
- `created_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())
- `updated_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())

### Tabela `shopping_items`
- `id`: UUID (chave primária)
- `couple_id`: UUID (não nulo)
- `created_by`: UUID (não nulo)
- `item`: TEXT (não nulo)
- `quantity`: INTEGER (padrão: 1)
- `list_type`: TEXT (não nulo)
- `priority`: TEXT (padrão: 'medium')
- `completed`: BOOLEAN (padrão: FALSE)
- `created_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())
- `updated_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())

### Tabela `requests`
- `id`: UUID (chave primária)
- `couple_id`: UUID (não nulo)
- `from_user_id`: UUID (não nulo)
- `to_user_id`: UUID (não nulo)
- `title`: TEXT (não nulo)
- `description`: TEXT
- `status`: TEXT (padrão: 'pending')
- `reject_reason`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())
- `updated_at`: TIMESTAMP WITH TIME ZONE (padrão: NOW())

## Políticas de Segurança (RLS)

O script também configura políticas de segurança para cada tabela, garantindo que:

1. Os usuários só possam ver, editar e excluir seus próprios dados ou dados do casal
2. Os usuários só possam criar dados para si mesmos ou para o casal
3. O acesso a dados de outros usuários seja restrito

## Após a Execução do Script

Depois de executar o script, o aplicativo CasalSync deve ser capaz de criar e gerenciar tarefas, eventos, hábitos e itens de compras corretamente. Se você ainda encontrar problemas, verifique o console do navegador para ver se há erros específicos. 