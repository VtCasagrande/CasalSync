# CasalSync

CasalSync é um aplicativo para sincronização de casais, permitindo gerenciar eventos, tarefas, compras, solicitações e hábitos em conjunto.

## Funcionalidades

- **Calendário compartilhado**: Gerencie eventos do casal
- **Lista de tarefas**: Atribua e acompanhe tarefas
- **Lista de compras**: Organize compras por categorias
- **Solicitações**: Faça pedidos ao parceiro(a) e receba aprovações
- **Hábitos**: Crie e acompanhe hábitos em conjunto
- **Ciclo menstrual**: Acompanhe o ciclo menstrual e receba dicas

## Tecnologias utilizadas

- React
- Tailwind CSS
- Lucide React (ícones)
- Supabase (backend e autenticação)
- React Router (navegação)

## Como executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o Supabase:
   - Crie uma conta no [Supabase](https://supabase.io)
   - Crie um novo projeto
   - Copie a URL e a chave anônima do projeto
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
     ```
     REACT_APP_SUPABASE_URL=sua_url_do_supabase
     REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
     ```
4. Configure o banco de dados:
   - No painel do Supabase, crie as seguintes tabelas:
     - `users` (gerenciada pelo Supabase Auth)
     - `couples` (para armazenar informações do casal)
     - `events` (para armazenar eventos do calendário)
     - `tasks` (para armazenar tarefas)
     - `requests` (para armazenar solicitações)
     - `shopping_items` (para armazenar itens de compras)
     - `habits` (para armazenar hábitos)
     - `cycle_data` (para armazenar dados do ciclo menstrual)
5. Execute o projeto: `npm start`

## Estrutura do projeto

- `src/components`: Componentes React
- `src/components/casalsync`: Componentes específicos do CasalSync
- `src/styles`: Arquivos CSS
- `public`: Arquivos estáticos

## Próximos passos

- Implementar persistência de dados com Supabase
- Adicionar autenticação com Supabase
- Desenvolver versão mobile
- Implementar notificações
- Adicionar funcionalidade de convite para parceiro
- Implementar sincronização em tempo real 