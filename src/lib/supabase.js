import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://gclqaqjkfubjtecqyzjp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbHFhcWprZnVianRlY3F5empwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzQwOTcsImV4cCI6MjA1NjM1MDA5N30.nYBBEYjIVTTIwnrQc0NRoWq81yY_WCbnpXgelwEHlnQ';

// Criar o cliente do Supabase com persistência de sessão
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'casalsync_auth_token',
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

// Funções de autenticação
export const auth = {
  // Registrar um novo usuário
  signUp: async (email, password, metadata) => {
    try {
      console.log('Chamando signUp com:', { email, metadata });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin,
          // Não exigir confirmação de email
          autoConfirmUser: true
        }
      });
      console.log('Resposta do signUp:', { data, error });
      
      // Se o registro foi bem-sucedido, fazer login automaticamente
      if (!error) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!loginError) {
          return { data: loginData, error: null };
        }
      }
      
      return { data, error };
    } catch (e) {
      console.error("Erro ao registrar usuário:", e);
      return { data: null, error: e };
    }
  },

  // Login com email e senha
  signIn: async (email, password) => {
    try {
      console.log('Chamando signIn com:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      console.log('Resposta do signIn:', { data, error });
      return { data, error };
    } catch (e) {
      console.error("Erro ao fazer login:", e);
      return { data: null, error: e };
    }
  },

  // Logout
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
      return { error: e };
    }
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    try {
      console.log('Chamando getCurrentUser');
      const { data, error } = await supabase.auth.getUser();
      console.log('Resposta do getCurrentUser:', { data, error });
      return { data, error };
    } catch (e) {
      console.error("Erro ao obter usuário atual:", e);
      return { data: null, error: e };
    }
  },

  // Obter sessão atual
  getSession: async () => {
    try {
      console.log('Chamando getSession');
      const { data, error } = await supabase.auth.getSession();
      console.log('Resposta do getSession:', { data, error });
      return { data, error };
    } catch (e) {
      console.error("Erro ao obter sessão:", e);
      return { data: null, error: e };
    }
  }
};

// Funções para manipulação de dados
export const database = {
  // Funções para casais
  couples: {
    get: async (userId) => {
      try {
        // Primeiro, tente buscar onde o usuário é user1_id
        const { data: data1, error: error1 } = await supabase
          .from('couples')
          .select('*')
          .eq('user1_id', userId)
          .maybeSingle();
        
        if (data1) {
          return { data: data1, error: null };
        }
        
        // Se não encontrar, tente buscar onde o usuário é user2_id
        const { data: data2, error: error2 } = await supabase
          .from('couples')
          .select('*')
          .eq('user2_id', userId)
          .maybeSingle();
        
        if (data2) {
          return { data: data2, error: null };
        }
        
        // Se não encontrar em nenhum dos casos, retorne null
        return { data: null, error: error1 || error2 || new Error('Casal não encontrado') };
      } catch (error) {
        console.error('Erro ao buscar dados do casal:', error);
        return { data: null, error };
      }
    },
    
    create: async (userId, partnerId, additionalData = {}) => {
      try {
        // Usar RPC para contornar o RLS
        const { data, error } = await supabase.rpc('create_couple', {
          user_id: userId,
          partner_id: partnerId,
          partner_code: additionalData.partner_code || generatePartnerCode(),
          relationship_start_date: additionalData.relationship_start_date || null,
          status: additionalData.status || 'pending'
        });
        
        return { data, error };
      } catch (error) {
        console.error('Erro ao criar casal:', error);
        return { data: null, error };
      }
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('couples')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },
  
  // Funções para eventos
  events: {
    getAll: async (coupleId) => {
      try {
        // Buscar eventos do casal
        const { data: coupleEvents, error: coupleError } = await supabase
          .from('events')
          .select('*')
          .eq('couple_id', coupleId);
        
        if (coupleError) {
          console.error('Erro ao buscar eventos do casal:', coupleError);
          return { data: null, error: coupleError };
        }
        
        // Buscar eventos pessoais do usuário atual
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        
        let personalEvents = [];
        if (userId) {
          const { data: userEvents, error: userError } = await supabase
            .from('events')
            .select('*')
            .eq('created_by', userId)
            .eq('is_personal', true);
          
          if (!userError && userEvents) {
            personalEvents = userEvents;
          }
        }
        
        // Combinar os eventos
        const allEvents = [...(coupleEvents || []), ...personalEvents];
        
        return { data: allEvents, error: null };
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        return { data: null, error };
      }
    },
    
    add: async (event) => {
      console.log('Supabase: Adicionando evento', event);
      try {
        // Garantir que start_date e end_date não sejam nulos
        const eventToAdd = { ...event };
        
        if (!eventToAdd.start_date) {
          eventToAdd.start_date = new Date().toISOString();
        }
        
        if (!eventToAdd.end_date) {
          eventToAdd.end_date = eventToAdd.start_date;
        }
        
        // Garantir que o campo type não seja nulo e seja válido
        const validTypes = ['event', 'birthday', 'anniversary', 'holiday', 'meeting', 'reminder', 'task', 'request', 'cycle'];
        if (!eventToAdd.type || !validTypes.includes(eventToAdd.type)) {
          eventToAdd.type = 'event'; // Valor padrão
        }
        
        // Se o evento for pessoal, garantir que couple_id seja null
        if (eventToAdd.is_personal) {
          delete eventToAdd.couple_id; // Remover couple_id para eventos pessoais
        }
        
        const { data, error } = await supabase
          .from('events')
          .insert([eventToAdd])
          .select()
          .single();
        console.log('Supabase: Resposta da adição de evento', { data, error });
        return { data, error };
      } catch (e) {
        console.error('Supabase: Erro ao adicionar evento', e);
        return { data: null, error: e };
      }
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      return { error };
    }
  },
  
  // Funções para tarefas
  tasks: {
    getAll: async (coupleId) => {
      try {
        // Buscar tarefas do casal
        const { data: coupleTasks, error: coupleError } = await supabase
          .from('tasks')
          .select('*')
          .eq('couple_id', coupleId);
        
        if (coupleError) {
          console.error('Erro ao buscar tarefas do casal:', coupleError);
          return { data: null, error: coupleError };
        }
        
        // Buscar tarefas pessoais do usuário atual
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        
        let personalTasks = [];
        if (userId) {
          const { data: userTasks, error: userError } = await supabase
            .from('tasks')
            .select('*')
            .eq('created_by', userId)
            .eq('is_personal', true);
          
          if (!userError && userTasks) {
            personalTasks = userTasks;
          }
        }
        
        // Combinar as tarefas
        const allTasks = [...(coupleTasks || []), ...personalTasks];
        
        return { data: allTasks, error: null };
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        return { data: null, error };
      }
    },
    
    add: async (task) => {
      console.log('Supabase: Adicionando tarefa', task);
      try {
        // Se a tarefa for pessoal, garantir que couple_id seja null
        const taskToAdd = { ...task };
        if (taskToAdd.is_personal) {
          delete taskToAdd.couple_id; // Remover couple_id para tarefas pessoais
        }
        
        const { data, error } = await supabase
          .from('tasks')
          .insert([taskToAdd])
          .select()
          .single();
        console.log('Supabase: Resposta da adição de tarefa', { data, error });
        return { data, error };
      } catch (e) {
        console.error('Supabase: Erro ao adicionar tarefa', e);
        return { data: null, error: e };
      }
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      return { error };
    }
  },
  
  // Funções para solicitações
  requests: {
    getAll: async (coupleId) => {
      try {
        // Buscar solicitações do casal
        const { data: coupleRequests, error: coupleError } = await supabase
          .from('requests')
          .select('*')
          .eq('couple_id', coupleId);
        
        if (coupleError) {
          console.error('Erro ao buscar solicitações do casal:', coupleError);
          return { data: null, error: coupleError };
        }
        
        // Buscar solicitações pessoais do usuário atual
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        
        let personalRequests = [];
        if (userId) {
          // Buscar solicitações enviadas pelo usuário
          const { data: sentRequests, error: sentError } = await supabase
            .from('requests')
            .select('*')
            .eq('from_user_id', userId);
          
          // Buscar solicitações recebidas pelo usuário
          const { data: receivedRequests, error: receivedError } = await supabase
            .from('requests')
            .select('*')
            .eq('to_user_id', userId);
          
          if (!sentError && sentRequests) {
            personalRequests = [...personalRequests, ...sentRequests];
          }
          
          if (!receivedError && receivedRequests) {
            personalRequests = [...personalRequests, ...receivedRequests];
          }
        }
        
        // Combinar as solicitações e remover duplicatas
        const allRequests = [...(coupleRequests || []), ...personalRequests];
        const uniqueRequests = Array.from(new Map(allRequests.map(req => [req.id, req])).values());
        
        return { data: uniqueRequests, error: null };
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        return { data: null, error };
      }
    },
    
    add: async (request) => {
      console.log('Supabase: Adicionando solicitação', request);
      try {
        const { data, error } = await supabase
          .from('requests')
          .insert([request])
          .select()
          .single();
        console.log('Supabase: Resposta da adição de solicitação', { data, error });
        return { data, error };
      } catch (e) {
        console.error('Supabase: Erro ao adicionar solicitação', e);
        return { data: null, error: e };
      }
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);
      return { error };
    },
    
    approve: async (id) => {
      try {
        // Primeiro, buscar a solicitação para obter seus detalhes
        const { data: request, error: fetchError } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) {
          console.error('Erro ao buscar solicitação para aprovação:', fetchError);
          return { data: null, error: fetchError };
        }
        
        // Atualizar o status da solicitação para 'approved'
        const { data, error } = await supabase
          .from('requests')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao aprovar solicitação:', error);
          return { data: null, error };
        }
        
        // Se a solicitação tiver uma data de vencimento, criar um evento no calendário
        if (request.due_date) {
          // Criar um novo evento baseado na solicitação
          const newEvent = {
            title: `Solicitação: ${request.title}`,
            description: request.description,
            start_date: request.due_date,
            end_date: request.due_date, // Mesmo dia para eventos de solicitação
            created_by: request.to_user_id, // Quem aprovou a solicitação
            type: 'request', // Tipo específico para eventos de solicitação
            all_day: true, // Eventos de solicitação são para o dia todo
            is_personal: false // Não é um evento pessoal
          };
          
          // Se a solicitação tiver couple_id, adicionar ao evento
          if (request.couple_id) {
            newEvent.couple_id = request.couple_id;
          }
          
          // Adicionar o evento ao calendário
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .insert([newEvent])
            .select()
            .single();
          
          if (eventError) {
            console.error('Erro ao criar evento para solicitação aprovada:', eventError);
            // Não falhar a aprovação se o evento não puder ser criado
          } else {
            console.log('Evento criado para solicitação aprovada:', eventData);
            
            // Atualizar a solicitação com o ID do evento criado
            await supabase
              .from('requests')
              .update({ event_id: eventData.id })
              .eq('id', id);
          }
        }
        
        return { data, error: null };
      } catch (e) {
        console.error('Erro ao aprovar solicitação:', e);
        return { data: null, error: e };
      }
    },
    
    reject: async (id, reason) => {
      const { data, error } = await supabase
        .from('requests')
        .update({ 
          status: 'rejected', 
          reject_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },
  
  // Funções para itens de compras
  shoppingItems: {
    getAll: async (coupleId) => {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('couple_id', coupleId);
      return { data, error };
    },
    
    add: async (item) => {
      console.log('Supabase: Adicionando item de compra', item);
      try {
        // Se o item for pessoal, garantir que couple_id seja null
        const itemToAdd = { ...item };
        
        // Garantir que os campos obrigatórios estejam presentes
        if (!itemToAdd.name) {
          throw new Error("O nome do item é obrigatório");
        }
        
        // Garantir que o campo list_type esteja presente
        if (!itemToAdd.list_type) {
          itemToAdd.list_type = 'daily'; // Valor padrão
        }
        
        // Garantir que o campo completed esteja presente
        if (itemToAdd.completed === undefined) {
          itemToAdd.completed = false;
        }
        
        // Garantir que o campo status esteja presente e seja válido
        if (!itemToAdd.status) {
          itemToAdd.status = 'pending';
        }
        
        if (itemToAdd.is_personal) {
          delete itemToAdd.couple_id; // Remover couple_id para itens pessoais
        }
        
        const { data, error } = await supabase
          .from('shopping_items')
          .insert([itemToAdd])
          .select()
          .single();
        console.log('Supabase: Resposta da adição de item de compra', { data, error });
        return { data, error };
      } catch (e) {
        console.error('Supabase: Erro ao adicionar item de compra', e);
        return { data: null, error: e };
      }
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('shopping_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);
      return { error };
    }
  },
  
  // Alias para shoppingItems para compatibilidade
  shopping: {
    getAll: async (coupleId) => {
      try {
        // Buscar itens de compra do casal
        const { data: coupleItems, error: coupleError } = await supabase
          .from('shopping_items')
          .select('*')
          .eq('couple_id', coupleId);
        
        if (coupleError) {
          console.error('Erro ao buscar itens de compra do casal:', coupleError);
          return { data: null, error: coupleError };
        }
        
        // Buscar itens pessoais do usuário atual
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        
        let personalItems = [];
        if (userId) {
          const { data: userItems, error: userError } = await supabase
            .from('shopping_items')
            .select('*')
            .eq('created_by', userId)
            .eq('is_personal', true);
          
          if (!userError && userItems) {
            personalItems = userItems;
          }
        }
        
        // Combinar os itens
        const allItems = [...(coupleItems || []), ...personalItems];
        
        // Organizar por tipo de lista
        const result = {
          daily: allItems.filter(item => item.list_type === 'daily'),
          home: allItems.filter(item => item.list_type === 'home'),
          special: allItems.filter(item => item.list_type === 'special')
        };
        
        return { data: result, error: null };
      } catch (error) {
        console.error('Erro ao buscar itens de compra:', error);
        return { data: null, error };
      }
    },
    
    // Atualizar um item de compra
    update: async (item) => {
      try {
        console.log('Atualizando item de compra:', item);
        
        if (!item || !item.id) {
          throw new Error('ID do item é obrigatório para atualização');
        }
        
        // Verificar se o usuário está autenticado
        const { data: userData } = await auth.getCurrentUser();
        if (!userData?.user) {
          throw new Error('Usuário não autenticado');
        }
        
        // Preparar dados para atualização
        const updateData = {
          name: item.name,
          quantity: item.quantity || 1,
          list_type: item.list_type || 'daily',
          is_personal: !!item.is_personal,
          updated_at: new Date().toISOString()
        };
        
        // Se for um item pessoal, remover couple_id
        if (item.is_personal) {
          updateData.couple_id = null;
        } else if (item.couple_id) {
          updateData.couple_id = item.couple_id;
        }
        
        // Atualizar o item no banco de dados
        const { data, error } = await supabase
          .from('shopping_items')
          .update(updateData)
          .eq('id', item.id)
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao atualizar item de compra:', error);
          throw error;
        }
        
        console.log('Item de compra atualizado com sucesso:', data);
        return { data, error: null };
      } catch (error) {
        console.error('Erro ao atualizar item de compra:', error);
        return { data: null, error };
      }
    }
  },
  
  // Funções para tipos de listas de compras
  shoppingListTypes: {
    getAll: async (coupleId) => {
      const { data, error } = await supabase
        .from('shopping_list_types')
        .select('*')
        .eq('couple_id', coupleId);
      return { data, error };
    },
    
    add: async (listType) => {
      const { data, error } = await supabase
        .from('shopping_list_types')
        .insert([listType])
        .select()
        .single();
      return { data, error };
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('shopping_list_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('shopping_list_types')
        .delete()
        .eq('id', id);
      return { error };
    }
  },
  
  // Funções para hábitos
  habits: {
    getAll: async (coupleId) => {
      try {
        // Buscar hábitos do casal
        const { data: coupleHabits, error: coupleError } = await supabase
          .from('habits')
          .select('*')
          .eq('couple_id', coupleId);
        
        if (coupleError) {
          console.error('Erro ao buscar hábitos do casal:', coupleError);
          return { data: null, error: coupleError };
        }
        
        // Buscar hábitos pessoais do usuário atual
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        
        let personalHabits = [];
        if (userId) {
          const { data: userHabits, error: userError } = await supabase
            .from('habits')
            .select('*')
            .eq('created_by', userId)
            .eq('is_personal', true);
          
          if (!userError && userHabits) {
            personalHabits = userHabits;
          }
        }
        
        // Combinar os hábitos
        const allHabits = [...(coupleHabits || []), ...personalHabits];
        
        return { data: allHabits, error: null };
      } catch (error) {
        console.error('Erro ao buscar hábitos:', error);
        return { data: null, error };
      }
    },
    
    add: async (habit) => {
      console.log('Supabase: Adicionando hábito', habit);
      try {
        // Garantir que os campos obrigatórios estejam presentes
        const habitToAdd = { ...habit };
        
        // Verificar campos obrigatórios
        if (!habitToAdd.title && !habitToAdd.name) {
          throw new Error("O nome do hábito é obrigatório");
        }
        
        // Mapear name para title se necessário
        if (habitToAdd.name && !habitToAdd.title) {
          habitToAdd.title = habitToAdd.name;
          delete habitToAdd.name;
        }
        
        // Garantir que frequency esteja presente e seja válido
        if (!habitToAdd.frequency) {
          habitToAdd.frequency = 'daily';
        }
        
        // Garantir que status esteja presente e seja válido
        if (!habitToAdd.status) {
          habitToAdd.status = 'active';
        }
        
        // Garantir que current_count não seja nulo
        if (habitToAdd.current_count === undefined || habitToAdd.current_count === null) {
          habitToAdd.current_count = 0;
        }
        
        // Garantir que target_days não seja nulo
        if (!habitToAdd.target_days || !Array.isArray(habitToAdd.target_days)) {
          habitToAdd.target_days = [];
        }
        
        // Obter o usuário autenticado
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user?.id) {
          throw new Error("Usuário não autenticado");
        }
        
        // Definir created_by como o ID do usuário autenticado
        habitToAdd.created_by = userData.user.id;
        
        // Se o hábito for pessoal, garantir que couple_id seja null e is_personal seja true
        if (habitToAdd.is_personal) {
          delete habitToAdd.couple_id; // Remover couple_id para hábitos pessoais
          habitToAdd.is_personal = true;
        } else if (!habitToAdd.couple_id) {
          // Se não for pessoal e não tiver couple_id, marcar como pessoal
          habitToAdd.is_personal = true;
        }
        
        const { data, error } = await supabase
          .from('habits')
          .insert([habitToAdd])
          .select()
          .single();
          
        if (error) {
          console.error('Supabase: Erro ao adicionar hábito', error);
          return { data: null, error };
        }
        
        console.log('Supabase: Resposta da adição de hábito', { data, error });
        return { data, error };
      } catch (e) {
        console.error('Supabase: Erro ao adicionar hábito', e);
        return { data: null, error: e };
      }
    },
    
    update: async (id, updates) => {
      try {
        console.log('Supabase: Atualizando hábito', { id, updates });
        
        // Verificar se o hábito existe
        const { data: existingHabit, error: fetchError } = await supabase
          .from('habits')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error('Supabase: Erro ao buscar hábito para atualização', fetchError);
          return { data: null, error: fetchError };
        }
        
        // Preparar os dados para atualização
        const habitToUpdate = { ...updates };
        
        // Se estiver alterando para hábito pessoal, remover couple_id
        if (habitToUpdate.is_personal && habitToUpdate.is_personal !== existingHabit.is_personal) {
          delete habitToUpdate.couple_id;
        }
        
        // Garantir que os campos obrigatórios estejam presentes
        if (habitToUpdate.name && !habitToUpdate.title) {
          habitToUpdate.title = habitToUpdate.name;
          delete habitToUpdate.name;
        }
        
        // Atualizar o hábito
        const { data, error } = await supabase
          .from('habits')
          .update(habitToUpdate)
          .eq('id', id)
          .select()
          .single();
          
        console.log('Supabase: Resposta da atualização de hábito', { data, error });
        return { data, error };
      } catch (e) {
        console.error('Supabase: Erro ao atualizar hábito', e);
        return { data: null, error: e };
      }
    },
    
    // Função para registrar progresso diário do hábito
    updateProgress: async (id, date = new Date()) => {
      try {
        console.log('Supabase: Atualizando progresso do hábito', { id, date });
        
        // Formatar a data para o formato YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Buscar o hábito atual
        const { data: habit, error: fetchError } = await supabase
          .from('habits')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error('Supabase: Erro ao buscar hábito para atualizar progresso', fetchError);
          return { data: null, error: fetchError };
        }
        
        // Inicializar o objeto de progresso se não existir
        const progress = habit.progress || {};
        
        // Verificar se o hábito já foi concluído hoje
        const isCompleted = progress[formattedDate];
        
        // Atualizar o progresso (alternar entre concluído e não concluído)
        progress[formattedDate] = !isCompleted;
        
        // Calcular a sequência atual (streak)
        let streak = habit.streak || 0;
        
        if (!isCompleted) {
          // Se estamos marcando como concluído, incrementar a sequência
          streak += 1;
        } else {
          // Se estamos desmarcando, decrementar a sequência (mínimo 0)
          streak = Math.max(0, streak - 1);
        }
        
        // Atualizar o hábito com o novo progresso e sequência
        const { data, error } = await supabase
          .from('habits')
          .update({
            progress,
            streak,
            last_completed: progress[formattedDate] ? formattedDate : habit.last_completed
          })
          .eq('id', id)
          .select()
          .single();
          
        console.log('Supabase: Resposta da atualização de progresso', { data, error });
        return { data, error };
      } catch (e) {
        console.error('Supabase: Erro ao atualizar progresso do hábito', e);
        return { data: null, error: e };
      }
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      return { error };
    }
  },
  
  // Funções para dados do ciclo menstrual
  cycleData: {
    get: async (userId) => {
      const { data, error } = await supabase
        .from('cycle_data')
        .select('*')
        .eq('user_id', userId)
        .single();
      return { data, error };
    },
    
    create: async (cycleData) => {
      const { data, error } = await supabase
        .from('cycle_data')
        .insert([cycleData])
        .select()
        .single();
      return { data, error };
    },
    
    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('cycle_data')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      return { data, error };
    }
  },
  
  // Função para buscar usuário por email (útil para convidar parceiro)
  users: {
    getByEmail: async (email) => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, user_metadata')
        .eq('email', email)
        .single();
      return { data, error };
    }
  },

  // Funções para notificações
  notifications: {
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    
    getUnread: async (userId) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    
    markAsRead: async (notificationId) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();
      return { data, error };
    },
    
    markAllAsRead: async (userId) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', userId)
        .eq('read', false);
      return { data, error };
    },
    
    create: async (notification) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();
      return { data, error };
    },
    
    delete: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      return { error };
    },
    
    // Função para criar notificação de atualização
    createUpdateNotification: async (senderId, recipientId, coupleId, entityType, entityId, title, message) => {
      const notification = {
        sender_id: senderId,
        recipient_id: recipientId,
        couple_id: coupleId,
        title,
        message,
        type: 'update',
        related_entity_type: entityType,
        related_entity_id: entityId,
        read: false
      };
      
      return await database.notifications.create(notification);
    },
    
    // Função para criar notificação de conquista
    createAchievementNotification: async (recipientId, coupleId, title, message, points) => {
      const notification = {
        recipient_id: recipientId,
        couple_id: coupleId,
        title,
        message,
        type: 'achievement',
        read: false
      };
      
      return await database.notifications.create(notification);
    }
  },

  // Funções para gamificação
  gamification: {
    // Obter pontos do usuário
    getUserPoints: async (userId) => {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();
      return { data, error };
    },
    
    // Inicializar pontos do usuário
    initUserPoints: async (userId, coupleId) => {
      const { data, error } = await supabase
        .from('user_points')
        .insert([{
          user_id: userId,
          couple_id: coupleId,
          total_points: 0,
          level: 1
        }])
        .select()
        .single();
      return { data, error };
    },
    
    // Adicionar pontos ao usuário
    addPoints: async (userId, points, reason) => {
      // Primeiro, obter os pontos atuais
      const { data: userData, error: userError } = await database.gamification.getUserPoints(userId);
      
      if (userError) {
        console.error("Erro ao obter pontos do usuário:", userError);
        return { data: null, error: userError };
      }
      
      // Se o usuário não tiver pontos inicializados, retornar erro
      if (!userData) {
        console.error("Usuário não tem pontos inicializados");
        return { data: null, error: new Error("Usuário não tem pontos inicializados") };
      }
      
      // Calcular novos pontos e nível
      const newTotalPoints = userData.total_points + points;
      const newLevel = Math.floor(newTotalPoints / 100) + 1; // A cada 100 pontos, sobe um nível
      
      // Atualizar pontos do usuário
      const { data, error } = await supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          level: newLevel,
          updated_at: new Date()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao atualizar pontos:", error);
        return { data: null, error };
      }
      
      // Verificar se subiu de nível
      if (newLevel > userData.level) {
        // Criar notificação de conquista
        await database.notifications.createAchievementNotification(
          userId,
          userData.couple_id,
          "Novo nível alcançado!",
          `Parabéns! Você alcançou o nível ${newLevel}. Continue assim!`,
          points
        );
      }
      
      // Criar notificação de pontos
      await database.notifications.createAchievementNotification(
        userId,
        userData.couple_id,
        "Pontos ganhos!",
        `Você ganhou ${points} pontos por: ${reason}`,
        points
      );
      
      return { data, error: null };
    },
    
    // Obter todas as conquistas
    getAllAchievements: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('points', { ascending: true });
      return { data, error };
    },
    
    // Obter conquistas do usuário
    getUserAchievements: async (userId) => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId);
      return { data, error };
    },
    
    // Desbloquear uma conquista
    unlockAchievement: async (userId, achievementId) => {
      // Verificar se o usuário já tem essa conquista
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();
      
      if (existingAchievement) {
        return { data: existingAchievement, error: null };
      }
      
      // Obter detalhes da conquista
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
      
      if (achievementError) {
        console.error("Erro ao obter conquista:", achievementError);
        return { data: null, error: achievementError };
      }
      
      // Adicionar conquista ao usuário
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date()
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao desbloquear conquista:", error);
        return { data: null, error };
      }
      
      // Adicionar pontos ao usuário
      await database.gamification.addPoints(
        userId, 
        achievement.points, 
        `Conquista desbloqueada: ${achievement.title}`
      );
      
      // Criar notificação de conquista
      await database.notifications.createAchievementNotification(
        userId,
        null, // Não temos o couple_id aqui, precisaria buscar
        "Nova conquista desbloqueada!",
        `Você desbloqueou a conquista "${achievement.title}" e ganhou ${achievement.points} pontos!`,
        achievement.points
      );
      
      return { data, error: null };
    }
  },

  // Funções para perfis
  profiles: {
    // Obter perfil pelo ID do usuário
    get: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { data, error };
    },
    
    // Atualizar perfil
    update: async (userId, profileData) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);
      
      return { data, error };
    },

    // Buscar perfil do usuário
    getProfile: async (userId) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        return { data, error: null };
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return { data: null, error };
      }
    },
    
    // Atualizar perfil do usuário
    updateProfile: async (userId, profileData) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);
        
        if (error) throw error;
        
        return { data, error: null };
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { data: null, error };
      }
    }
  }
};

// Função para gerar código de parceiro
const generatePartnerCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Função para executar scripts SQL
export const executeSqlScript = async (scriptContent) => {
  try {
    console.log('Executando script SQL...');
    
    // Dividir o script em comandos individuais
    const commands = scriptContent
      .replace(/--.*$/gm, '') // Remover comentários
      .split(';')
      .filter(cmd => cmd.trim().length > 0);
    
    let results = [];
    
    // Executar cada comando individualmente
    for (const command of commands) {
      console.log(`Executando comando: ${command.substring(0, 50)}...`);
      
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_command: command
      });
      
      if (error) {
        console.error('Erro ao executar comando SQL:', error);
        results.push({ success: false, error: error.message, command });
      } else {
        console.log('Comando executado com sucesso:', data);
        results.push({ success: true, data, command });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Erro ao executar script SQL:', error);
    return { success: false, error: error.message };
  }
};

// Função para aplicar todos os scripts SQL necessários
export const applyDatabaseMigrations = async () => {
  try {
    console.log('Aplicando migrações de banco de dados...');
    
    // Definir o conteúdo dos scripts SQL diretamente
    const addIsPersonalColumnScript = `
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
    `;
    
    const addTypeColumnToEventsScript = `
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
    `;
    
    const addHabitProgressColumnsScript = `
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
    `;
    
    // Executar os scripts
    const results = [];
    results.push(await executeSqlScript(addIsPersonalColumnScript));
    results.push(await executeSqlScript(addTypeColumnToEventsScript));
    results.push(await executeSqlScript(addHabitProgressColumnsScript));
    
    console.log('Resultados das migrações:', results);
    
    return { success: true, results };
  } catch (error) {
    console.error('Erro ao aplicar migrações:', error);
    return { success: false, error: error.message };
  }
};

export default supabase; 