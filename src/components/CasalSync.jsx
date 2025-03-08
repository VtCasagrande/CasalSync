import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database, supabase } from '../lib/supabase';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from './casalsync/Header';
import SideMenu from './casalsync/SideMenu';
import HomePage from './casalsync/HomePage';
import CalendarPage from './casalsync/CalendarPage';
import TasksPage from './casalsync/TasksPage';
import ShoppingPage from './casalsync/ShoppingPage';
import RequestsPage from './casalsync/RequestsPage';
import HabitsPage from './casalsync/HabitsPage';
import SettingsPage from './casalsync/SettingsPage';
import { X } from 'lucide-react';

const CasalSync = () => {
  const { user, setUser, partner, coupleData, setCoupleData, logout } = useAuth();
  
  // Definição dos dias da semana
  const weekDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  
  // Estados principais
  const [userType, setUserType] = useState('man'); // 'man' ou 'woman'
  const [activeTab, setActiveTab] = useState('home');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Adicionando estado de erro
  
  // Estados do calendário
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEventForm, setNewEventForm] = useState({ 
    title: '', 
    time: '', 
    type: 'event',
    description: '',
    location: '',
    color: '#6366F1',
    isMultiDay: false,
    startDate: '',
    endDate: ''
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isPersonalEvent, setIsPersonalEvent] = useState(false); // Adicionando estado para controlar se é um evento pessoal
  
  // Estados das tarefas
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: 'me'
  });
  const [editingTask, setEditingTask] = useState(null);
  
  // Estados das solicitações
  const [requests, setRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'Média',
    dueDate: ''
  });
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showEditRequestForm, setShowEditRequestForm] = useState(false);
  
  // Estados da lista de compras
  const [selectedListType, setSelectedListType] = useState('daily');
  const [shoppingLists, setShoppingLists] = useState({
    daily: [],
    home: [],
    special: []
  });
  const [newShoppingItem, setNewShoppingItem] = useState({ 
    name: '', 
    quantity: 1
  });
  const [editingShoppingItem, setEditingShoppingItem] = useState(null);
  const [isPersonalShoppingItem, setIsPersonalShoppingItem] = useState(false); // Novo estado para controlar se o item é pessoal
  const [listTypes, setListTypes] = useState([
    { id: 'daily', label: 'Diárias', icon: '🥫' },
    { id: 'home', label: 'Casa', icon: '🏠' },
    { id: 'special', label: 'Especiais', icon: '🎁' }
  ]);
  
  // Estados dos hábitos
  const [habits, setHabits] = useState([]);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    target_count: '1',
    targetDays: weekDays.map(day => day.id), // Todos os dias por padrão
    time: '', // Novo campo para horário
    assignedTo: 'me' // Para quem o hábito é destinado
  });
  
  // Estados do ciclo menstrual
  const [cycleData, setCycleData] = useState({
    lastPeriodDate: '',
    cycleLength: 28,
    periodLength: 5,
    symptoms: [],
    currentPhase: 'normal',
    daysUntilNextPeriod: 14
  });

  // Função para carregar dados
  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Verificar se os dados do casal estão disponíveis
    if (!coupleData) {
      console.log('Dados do casal não disponíveis, tentando buscar novamente...');
      try {
        // Tentar buscar os dados do casal novamente
        const { data: coupleInfo } = await database.couples.get(user.id);
        
        if (coupleInfo) {
          setCoupleData(coupleInfo);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do casal:', error);
      }
    }
    
    try {
      // Buscar tarefas
      if (coupleData && coupleData.id) {
        const { data: tasksData } = await database.tasks.getAll(coupleData.id);
        if (tasksData) {
          setTasks(tasksData);
        }
        
        // Buscar eventos
        const { data: eventsData } = await database.events.getAll(coupleData.id);
        if (eventsData) {
          setEvents(eventsData);
        }
        
        // Buscar solicitações
        const { data: requestsData } = await database.requests.getAll(coupleData.id);
        if (requestsData) {
          setRequests(requestsData);
        }
        
        // Buscar itens de compras
        const { data: shoppingData } = await database.shopping.getAll(coupleData.id);
        if (shoppingData) {
          setShoppingLists(shoppingData);
        }
        
        // Buscar hábitos
        const { data: habitsData } = await database.habits.getAll(coupleData.id);
        if (habitsData) {
          setHabits(habitsData);
        }
        
        // Buscar dados do ciclo menstrual
        if (userType === 'woman') {
          const { data: cycleData } = await database.cycle.get(coupleData.id);
          if (cycleData) {
            setCycleData(cycleData);
          }
        }
      } else {
        // Carregar dados do localStorage se não tiver dados do casal
        loadLocalData();
        
        // Buscar tarefas pessoais do usuário
        try {
          // Buscar tarefas pessoais
          const { data: personalTasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('created_by', user.id)
            .eq('is_personal', true);
          
          if (personalTasksData && personalTasksData.length > 0) {
            setTasks(personalTasksData);
          }
          
          // Buscar eventos pessoais
          const { data: personalEventsData } = await supabase
            .from('events')
            .select('*')
            .eq('created_by', user.id)
            .eq('is_personal', true);
          
          if (personalEventsData && personalEventsData.length > 0) {
            setEvents(personalEventsData);
          }
          
          // Buscar itens de compra pessoais
          const { data: personalShoppingData } = await supabase
            .from('shopping_items')
            .select('*')
            .eq('created_by', user.id)
            .eq('is_personal', true);
          
          if (personalShoppingData && personalShoppingData.length > 0) {
            // Organizar por tipo de lista
            const shoppingLists = {
              daily: personalShoppingData.filter(item => item.list_type === 'daily'),
              home: personalShoppingData.filter(item => item.list_type === 'home'),
              special: personalShoppingData.filter(item => item.list_type === 'special')
            };
            setShoppingLists(shoppingLists);
          }
          
          // Buscar hábitos pessoais
          const { data: personalHabitsData } = await supabase
            .from('habits')
            .select('*')
            .eq('created_by', user.id)
            .eq('is_personal', true);
          
          if (personalHabitsData && personalHabitsData.length > 0) {
            setHabits(personalHabitsData);
          }
        } catch (error) {
          console.error('Erro ao buscar dados pessoais:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar dados do localStorage
  const loadLocalData = () => {
    try {
      if (!user) return;
      
      // Carregar tarefas
      const savedTasks = localStorage.getItem(`tasks_${user.id}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      
      // Carregar eventos
      const savedEvents = localStorage.getItem(`events_${user.id}`);
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
      
      // Carregar solicitações
      const savedRequests = localStorage.getItem(`requests_${user.id}`);
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests));
      }
      
      // Carregar itens de compras
      const savedShoppingItems = localStorage.getItem(`shopping_${user.id}`);
      if (savedShoppingItems) {
        setShoppingLists(JSON.parse(savedShoppingItems));
      }
      
      // Carregar hábitos
      const savedHabits = localStorage.getItem(`habits_${user.id}`);
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
      
      // Carregar dados do ciclo menstrual (apenas para usuários do tipo 'woman')
      if (userType === 'woman') {
        const savedCycleData = localStorage.getItem(`cycle_${user.id}`);
        if (savedCycleData) {
          setCycleData(JSON.parse(savedCycleData));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
    }
  };

  // Verificar se o usuário está autenticado e carregar dados
  useEffect(() => {
    loadData();
  }, [user, coupleData, userType]);

  useEffect(() => {
    // Removendo a chamada de loadData aqui para evitar o loop de renderização
    
    // Salvar dados no localStorage quando mudam
    if (user) {
      // Salvar tarefas
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks));
      
      // Salvar eventos
      localStorage.setItem(`events_${user.id}`, JSON.stringify(events));
      
      // Salvar solicitações
      localStorage.setItem(`requests_${user.id}`, JSON.stringify(requests));
      
      // Salvar itens de compras
      localStorage.setItem(`shopping_${user.id}`, JSON.stringify(shoppingLists));
      
      // Salvar hábitos
      localStorage.setItem(`habits_${user.id}`, JSON.stringify(habits));
      
      // Salvar dados do ciclo menstrual (apenas para usuários do tipo 'woman')
      if (userType === 'woman') {
        localStorage.setItem(`cycle_${user.id}`, JSON.stringify(cycleData));
      }
    }
  }, [user, tasks, events, requests, shoppingLists, habits, cycleData, userType]);

  // Funções auxiliares para formatação de data
  const formatDateToDB = (dateStr) => {
    // Converter de DD/MM/YYYY para YYYY-MM-DD (formato do banco)
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatDateFromDB = (dateStr) => {
    // Converter de YYYY-MM-DD para DD/MM/YYYY (formato do frontend)
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTimeFromDB = (timeStr) => {
    // Manter o formato de tempo como está (HH:MM)
    return timeStr;
  };

  // Função para criar notificação quando uma atualização é feita
  const createUpdateNotification = async (entityType, entityId, title, message) => {
    if (!user || !partner || !coupleData) return;
    
    // Criar notificação para o parceiro
    await database.notifications.createUpdateNotification(
      user.id,
      partner.id,
      coupleData.id,
      entityType,
      entityId,
      title,
      message
    );
  };
  
  // Função para adicionar pontos ao usuário
  const addUserPoints = async (points, reason) => {
    if (!user) return;
    
    await database.gamification.addPoints(user.id, points, reason);
  };

  // Função para adicionar um novo evento
  const handleAddEvent = async () => {
    try {
      if (!newEventForm.title) {
        setError('Por favor, preencha o título do evento.');
        return;
      }

      let eventData;
      
      // Verificar se o usuário tem um casal confirmado
      const coupleId = coupleData?.id;
      
      // Formatar a data selecionada para ISO string
      const formattedDate = selectedDate ? new Date(selectedDate.split('/').reverse().join('-')).toISOString() : new Date().toISOString();
      
      if (isPersonalEvent || !coupleId) {
        // Evento pessoal
        eventData = {
          title: newEventForm.title,
          start_date: newEventForm.isMultiDay && newEventForm.startDate ? new Date(newEventForm.startDate.split('/').reverse().join('-')).toISOString() : formattedDate,
          end_date: newEventForm.isMultiDay && newEventForm.endDate ? new Date(newEventForm.endDate.split('/').reverse().join('-')).toISOString() : formattedDate,
          time: newEventForm.time || null,
          type: newEventForm.type || 'event', // Garantir que o tipo seja definido
          description: newEventForm.description || '',
          location: newEventForm.location || '',
          created_by: user.id,
          is_personal: true
        };
      } else {
        // Evento do casal
        eventData = {
          title: newEventForm.title,
          start_date: newEventForm.isMultiDay && newEventForm.startDate ? new Date(newEventForm.startDate.split('/').reverse().join('-')).toISOString() : formattedDate,
          end_date: newEventForm.isMultiDay && newEventForm.endDate ? new Date(newEventForm.endDate.split('/').reverse().join('-')).toISOString() : formattedDate,
          time: newEventForm.time || null,
          type: newEventForm.type || 'event', // Garantir que o tipo seja definido
          description: newEventForm.description || '',
          location: newEventForm.location || '',
          couple_id: coupleId,
          created_by: user.id,
          is_personal: false
        };
      }
      
      console.log('Enviando evento para o Supabase:', eventData);
      
      // Enviar o evento para o Supabase
      const { data, error } = await database.events.add(eventData);
      
      if (error) {
        console.error("Erro ao adicionar evento:", error.message, error.details, error.hint);
        alert(`Erro ao adicionar evento: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Usar os dados retornados do Supabase ou criar um objeto temporário se falhar
      const tempEvent = data || {
        ...eventData,
        id: `temp_${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      // Atualizar a lista de eventos
      setEvents([...events, tempEvent]);
      
      // Limpar o formulário
      setNewEventForm({
        title: '',
        time: '',
        type: 'event',
        description: '',
        location: '',
        color: '#6366F1',
        isMultiDay: false,
        startDate: '',
        endDate: ''
      });
      
      // Fechar o formulário
      setShowEventForm(false);
      
      setLoading(false);
      return;
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      alert(`Erro ao adicionar evento: ${error.message}`);
      setLoading(false);
      return;
    }
  };

  const handleDeleteEvent = async (id) => {
    setLoading(true);
    
    try {
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a exclusão do evento usando os dados recuperados
            await deleteEventWithCoupleData(id, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível excluir o evento. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para excluir eventos.');
          return;
        }
      }
      
      // Se temos os dados do casal, excluir o evento
      await deleteEventWithCoupleData(id, coupleData);
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert(`Erro ao excluir evento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Função auxiliar para excluir evento com os dados do casal
  const deleteEventWithCoupleData = async (id, coupleInfo) => {
    try {
      console.log('Excluindo evento:', id);
      const { error } = await database.events.delete(id);
      
      if (error) {
        console.error("Erro ao excluir evento:", error.message, error.details, error.hint);
        alert(`Erro ao excluir evento: ${error.message}`);
        return;
      }
      
      console.log('Evento excluído com sucesso');
      
      // Atualizar o estado
      setEvents(events.filter(e => e.id !== id));
      
      // Fechar o formulário de edição se estiver aberto
      if (editingEvent && editingEvent.id === id) {
        setEditingEvent(null);
        setShowEventForm(false);
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert(`Erro ao excluir evento: ${error.message}`);
    }
  };

  const handleEditEvent = async (event) => {
    setLoading(true);
    
    try {
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a edição do evento usando os dados recuperados
            await editEventWithCoupleData(event, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível editar o evento. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para editar eventos.');
          return;
        }
      }
      
      // Se temos os dados do casal, editar o evento
      await editEventWithCoupleData(event, coupleData);
    } catch (error) {
      console.error("Erro ao editar evento:", error);
      alert(`Erro ao editar evento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Função auxiliar para editar evento com os dados do casal
  const editEventWithCoupleData = async (event, coupleInfo) => {
    try {
      if (!event || !event.id) {
        console.error('Evento inválido para edição:', event);
        return;
      }
      
      console.log('Editando evento:', event);
      
      // Preparar os dados de atualização
      const eventData = {
        couple_id: coupleInfo.id,
        title: event.title,
        start_date: event.startDate,
        end_date: event.endDate || event.startDate,
        time: event.time || null,
        description: event.description || '',
        location: event.location || '',
        type: event.type || 'couple',
        color: event.color || '#6366F1',
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await database.events.update(event.id, eventData);
      
      if (error) {
        console.error("Erro ao editar evento:", error.message, error.details, error.hint);
        alert(`Erro ao editar evento: ${error.message}`);
        return;
      }
      
      if (data) {
        console.log('Evento editado com sucesso:', data);
        
        // Atualizar a lista de eventos
        setEvents(events.map(e => 
          e.id === event.id 
            ? { 
                ...e, 
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate || event.startDate,
                time: event.time || null,
                description: event.description || '',
                location: event.location || '',
                type: event.type || 'couple',
                color: event.color || '#6366F1',
                updated_at: new Date().toISOString()
              }
            : e
        ));
        
        // Criar notificação para o parceiro
        if (partner?.id) {
          await createUpdateNotification(
            'event',
            event.id,
            'Evento atualizado',
            `${user.user_metadata.name} atualizou o evento: ${event.title}`
          );
        }
        
        // Limpar o formulário
        setEditingEvent(null);
        setShowEventForm(false);
      }
    } catch (error) {
      console.error('Erro ao editar evento:', error);
      alert(`Erro ao editar evento: ${error.message}`);
    }
  };

  // Função para adicionar uma nova tarefa
  const handleAddTask = async () => {
    setLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        alert('Você precisa estar logado para adicionar tarefas.');
        setLoading(false);
        return;
      }
      
      // Se não temos dados do casal, criar uma tarefa temporária associada apenas ao usuário
      if (!coupleData || !coupleData.id || !coupleData.is_confirmed) {
        console.log('Usuário sem casal confirmado, criando tarefa pessoal');
        
        const tempTask = {
          created_by: user.id,
          assigned_to: user.id,
          title: newTask.title,
          description: newTask.description || '',
          due_date: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
          priority: newTask.priority || 'medium',
          status: 'pending',
          is_personal: true // Marcar como tarefa pessoal
        };
        
        console.log('Criando tarefa pessoal:', tempTask);
        
        // Enviar a tarefa pessoal para o Supabase
        const { data, error } = await database.tasks.add(tempTask);
        
        if (error) {
          console.error("Erro ao adicionar tarefa pessoal:", error.message, error.details, error.hint);
          alert(`Erro ao adicionar tarefa pessoal: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Usar os dados retornados do Supabase ou criar um objeto temporário se falhar
        const taskToAdd = data || {
          ...tempTask,
          id: `temp_${Date.now()}`,
          created_at: new Date().toISOString(),
          completed: false
        };
        
        // Atualizar a lista de tarefas
        setTasks([...tasks, taskToAdd]);
        
        // Limpar o formulário
        setNewTask({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          assignedTo: 'me'
        });
        
        // Fechar o formulário
        setShowTaskForm(false);
        
        setLoading(false);
        return;
      }
      
      // Se temos os dados do casal, adicionar a tarefa normalmente
      const newTaskData = {
        couple_id: coupleData.id,
        created_by: user.id,
        assigned_to: newTask.assignedTo === 'partner' ? partner?.id || user.id : user.id,
        title: newTask.title,
        description: newTask.description || '',
        due_date: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        priority: newTask.priority || 'medium',
        status: 'pending',
        completed: false
      };
      
      console.log('Enviando tarefa para o Supabase:', newTaskData);
      const { data, error } = await database.tasks.add(newTaskData);
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error("Erro ao adicionar tarefa:", error.message, error.details, error.hint);
        alert(`Erro ao adicionar tarefa: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Atualizar a lista de tarefas
      setTasks([...tasks, data]);
      
      // Limpar o formulário
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        assignedTo: 'me'
      });
      
      // Fechar o formulário
      setShowTaskForm(false);
      
      // Criar notificação se a tarefa for atribuída ao parceiro
      if (newTask.assignedTo === 'partner' && partner) {
        await createUpdateNotification('task', data.id, 'Nova tarefa atribuída', `${user.name} atribuiu uma nova tarefa para você: ${newTask.title}`);
      }
      
      // Adicionar pontos ao usuário
      await addUserPoints(5, 'Criou uma nova tarefa');
      
      alert('Tarefa adicionada com sucesso!');
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      alert(`Erro ao adicionar tarefa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (id) => {
    setLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        alert('Você precisa estar logado para alternar tarefas.');
        setLoading(false);
        return;
      }
      
      // Encontrar a tarefa na lista
      const task = tasks.find(t => t.id === id);
      if (!task) {
        console.error("Tarefa não encontrada:", id);
        alert('Tarefa não encontrada.');
        setLoading(false);
        return;
      }
      
      // Se a tarefa for pessoal, alternar diretamente
      if (task.is_personal) {
        console.log('Alternando tarefa pessoal:', id);
        
        const updatedTask = { ...task, completed: !task.completed };
        
        // Atualizar no Supabase
        const { error } = await database.tasks.update(id, { completed: updatedTask.completed });
        
        if (error) {
          console.error("Erro ao alternar tarefa pessoal:", error.message, error.details, error.hint);
          alert(`Erro ao alternar tarefa pessoal: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Atualizar a lista de tarefas
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        setLoading(false);
        return;
      }
      
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a alternância da tarefa usando os dados recuperados
            await toggleTaskWithCoupleData(id, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível alternar a tarefa. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para alternar tarefas.');
          return;
        }
      }
      
      // Se temos os dados do casal, alternar a tarefa
      await toggleTaskWithCoupleData(id, coupleData);
    } catch (error) {
      console.error("Erro ao alternar tarefa:", error);
      alert(`Erro ao alternar tarefa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para alternar tarefa com os dados do casal
  const toggleTaskWithCoupleData = async (id, coupleInfo) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) {
        console.error("Tarefa não encontrada:", id);
        return;
      }
      
      const updatedTask = { ...task, completed: !task.completed };
      
      console.log('Atualizando tarefa no Supabase:', updatedTask);
      const { data, error } = await database.tasks.update(id, { completed: updatedTask.completed });
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error("Erro ao alternar tarefa:", error.message, error.details, error.hint);
        alert(`Erro ao alternar tarefa: ${error.message}`);
        return;
      }
      
      // Atualizar a lista de tarefas
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      
      // Criar notificação se a tarefa for concluída e foi atribuída pelo parceiro
      if (updatedTask.completed && task.created_by === partner?.id && task.assigned_to === user.id) {
        await createUpdateNotification('task', id, 'Tarefa concluída', `${user.name} concluiu a tarefa: ${task.title}`);
      }
      
      // Adicionar pontos ao usuário se a tarefa for concluída
      if (updatedTask.completed) {
        await addUserPoints(10, 'Concluiu uma tarefa');
      }
    } catch (error) {
      console.error("Erro ao alternar tarefa:", error);
      alert(`Erro ao alternar tarefa: ${error.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    setLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        alert('Você precisa estar logado para excluir tarefas.');
        setLoading(false);
        return;
      }
      
      // Encontrar a tarefa na lista
      const task = tasks.find(t => t.id === id);
      if (!task) {
        console.error("Tarefa não encontrada:", id);
        alert('Tarefa não encontrada.');
        setLoading(false);
        return;
      }
      
      // Se a tarefa for pessoal, excluir diretamente
      if (task.is_personal) {
        console.log('Excluindo tarefa pessoal:', id);
        
        // Excluir do Supabase
        const { error } = await database.tasks.delete(id);
        
        if (error) {
          console.error("Erro ao excluir tarefa pessoal:", error.message, error.details, error.hint);
          alert(`Erro ao excluir tarefa pessoal: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Atualizar a lista de tarefas
        setTasks(tasks.filter(t => t.id !== id));
        alert('Tarefa excluída com sucesso!');
        setLoading(false);
        return;
      }
      
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a exclusão da tarefa usando os dados recuperados
            await deleteTaskWithCoupleData(id, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível excluir a tarefa. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para excluir tarefas.');
          return;
        }
      }
      
      // Se temos os dados do casal, excluir a tarefa
      await deleteTaskWithCoupleData(id, coupleData);
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      alert(`Erro ao excluir tarefa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para excluir tarefa com os dados do casal
  const deleteTaskWithCoupleData = async (id, coupleInfo) => {
    try {
      console.log('Excluindo tarefa:', id);
      const { error } = await database.tasks.delete(id);
      
      if (error) {
        console.error("Erro ao excluir tarefa:", error.message, error.details, error.hint);
        alert(`Erro ao excluir tarefa: ${error.message}`);
        return;
      }
      
      // Atualizar a lista de tarefas
      setTasks(tasks.filter(t => t.id !== id));
      
      alert('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      alert(`Erro ao excluir tarefa: ${error.message}`);
    }
  };

  // Funções de lista de compras
  const handleAddShoppingItem = async (listType) => {
    try {
      setLoading(true);
      
      // Verificar se o nome do item foi preenchido
      if (!newShoppingItem.name.trim()) {
        alert('Por favor, digite o nome do item.');
        setLoading(false);
        return;
      }
      
      console.log('Adicionando item à lista de compras:', { ...newShoppingItem, listType });
      
      // Verificar se o usuário está autenticado
      if (!user) {
        alert('Você precisa estar logado para adicionar itens.');
        setLoading(false);
        return;
      }
      
      // Preparar dados do item
      const itemData = {
        name: newShoppingItem.name.trim(),
        quantity: newShoppingItem.quantity || 1,
        list_type: listType,
        is_personal: isPersonalShoppingItem // Usar o estado para determinar se é um item pessoal
      };
      
      // Se não tiver um parceiro confirmado, criar como item pessoal
      if (!coupleData?.id || isPersonalShoppingItem) {
        console.log('Criando item pessoal ou sem parceiro confirmado');
        itemData.is_personal = true;
        
        const { data, error } = await database.shopping.add(itemData);
        
        if (error) {
          console.error('Erro ao adicionar item pessoal:', error);
          alert(`Erro ao adicionar item: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Atualizar a lista local
        setShoppingLists(prev => ({
          ...prev,
          [listType]: [...prev[listType], data]
        }));
        
        // Limpar o formulário
        setNewShoppingItem({ name: '', quantity: 1 });
        setLoading(false);
        return;
      }
      
      // Se tiver um parceiro, adicionar como item do casal
      const { data, error } = await database.shopping.add({
        ...itemData,
        couple_id: coupleData.id
      });
      
      if (error) {
        console.error('Erro ao adicionar item:', error);
        alert(`Erro ao adicionar item: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Atualizar a lista local
      setShoppingLists(prev => ({
        ...prev,
        [listType]: [...prev[listType], data]
      }));
      
      // Limpar o formulário
      setNewShoppingItem({ name: '', quantity: 1 });
      
      // Criar notificação para o parceiro
      if (partner?.id) {
        await createUpdateNotification(
          'shopping',
          itemData.id,
          `Novo item adicionado por ${user.user_metadata.name}`,
          `${itemData.name} foi adicionado à lista de ${listTypes.find(t => t.id === listType)?.label.toLowerCase() || 'compras'}.`
        );
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao adicionar item. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const handleToggleShoppingItem = async (id) => {
    setLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        alert('Você precisa estar logado para alternar itens.');
        setLoading(false);
        return;
      }
      
      // Encontrar o item em todas as listas
      let item = null;
      let listType = null;
      
      for (const type in shoppingLists) {
        const found = shoppingLists[type].find(i => i.id === id);
        if (found) {
          item = found;
          listType = type;
          break;
        }
      }
      
      if (!item || !listType) {
        console.error("Item não encontrado:", id);
        alert('Item não encontrado.');
        setLoading(false);
        return;
      }
      
      // Se o item for pessoal, alternar diretamente
      if (item.is_personal) {
        console.log('Alternando item pessoal:', id);
        
        const updatedItem = { ...item, completed: !item.completed };
        
        // Atualizar no Supabase
        const { error } = await database.shoppingItems.update(id, { completed: updatedItem.completed });
        
        if (error) {
          console.error("Erro ao alternar item pessoal:", error.message, error.details, error.hint);
          alert(`Erro ao alternar item pessoal: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Atualizar a lista de compras
        setShoppingLists({
          ...shoppingLists,
          [listType]: shoppingLists[listType].map(i => i.id === id ? updatedItem : i)
        });
        
        setLoading(false);
        return;
      }
      
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a alternância do item usando os dados recuperados
            await toggleShoppingItemWithCoupleData(id, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível alternar o item. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para alternar itens.');
          return;
        }
      }
      
      // Se temos os dados do casal, alternar o item
      await toggleShoppingItemWithCoupleData(id, coupleData);
    } catch (error) {
      console.error("Erro ao alternar item:", error);
      alert(`Erro ao alternar item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para alternar item de compra com os dados do casal
  const toggleShoppingItemWithCoupleData = async (id, coupleInfo) => {
    try {
      // Encontrar o item em todas as listas
      let item = null;
      let listType = null;
      
      for (const type in shoppingLists) {
        const found = shoppingLists[type].find(i => i.id === id);
        if (found) {
          item = found;
          listType = type;
          break;
        }
      }
      
      if (!item || !listType) {
        console.error("Item não encontrado:", id);
        return;
      }
      
      const updatedItem = { ...item, completed: !item.completed };
      
      console.log('Atualizando item no Supabase:', updatedItem);
      const { data, error } = await database.shoppingItems.update(id, { completed: updatedItem.completed });
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error("Erro ao alternar item:", error.message, error.details, error.hint);
        alert(`Erro ao alternar item: ${error.message}`);
        return;
      }
      
      // Atualizar a lista de compras
      setShoppingLists({
        ...shoppingLists,
        [listType]: shoppingLists[listType].map(i => i.id === id ? updatedItem : i)
      });
      
      // Criar notificação se o item for concluído e foi criado pelo parceiro
      if (updatedItem.completed && item.created_by === partner.id) {
        await createUpdateNotification('shopping', id, 'Item de compra concluído', `${user.name} marcou o item como comprado: ${item.name}`);
      }
      
      // Adicionar pontos ao usuário se o item for concluído
      if (updatedItem.completed) {
        await addUserPoints(3, 'Comprou um item da lista');
      }
    } catch (error) {
      console.error("Erro ao alternar item:", error);
      alert(`Erro ao alternar item: ${error.message}`);
    }
  };

  const handleDeleteShoppingItem = async (id) => {
    setLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        alert('Você precisa estar logado para excluir itens.');
        setLoading(false);
        return;
      }
      
      // Encontrar o item em todas as listas
      let item = null;
      let listType = null;
      
      for (const type in shoppingLists) {
        const found = shoppingLists[type].find(i => i.id === id);
        if (found) {
          item = found;
          listType = type;
          break;
        }
      }
      
      if (!item || !listType) {
        console.error("Item não encontrado:", id);
        alert('Item não encontrado.');
        setLoading(false);
        return;
      }
      
      // Se o item for pessoal, excluir diretamente
      if (item.is_personal) {
        console.log('Excluindo item pessoal:', id);
        
        // Excluir do Supabase
        const { error } = await database.shoppingItems.delete(id);
        
        if (error) {
          console.error("Erro ao excluir item pessoal:", error.message, error.details, error.hint);
          alert(`Erro ao excluir item pessoal: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Atualizar a lista de compras
        setShoppingLists({
          ...shoppingLists,
          [listType]: shoppingLists[listType].filter(i => i.id !== id)
        });
        
        alert('Item excluído com sucesso!');
        setLoading(false);
        return;
      }
      
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a exclusão do item usando os dados recuperados
            await deleteShoppingItemWithCoupleData(id, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível excluir o item. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para excluir itens.');
          return;
        }
      }
      
      // Se temos os dados do casal, excluir o item
      await deleteShoppingItemWithCoupleData(id, coupleData);
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      alert(`Erro ao excluir item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para excluir item de compra com os dados do casal
  const deleteShoppingItemWithCoupleData = async (id, coupleInfo) => {
    try {
      console.log('Excluindo item:', id);
      const { error } = await database.shoppingItems.delete(id);
      
      if (error) {
        console.error("Erro ao excluir item:", error.message, error.details, error.hint);
        alert(`Erro ao excluir item: ${error.message}`);
        return;
      }
      
      // Atualizar a lista de compras
      const updatedLists = {};
      for (const type in shoppingLists) {
        updatedLists[type] = shoppingLists[type].filter(i => i.id !== id);
      }
      setShoppingLists(updatedLists);
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      alert(`Erro ao excluir item: ${error.message}`);
    }
  };

  // Funções de solicitações
  const handleApproveRequest = async (id) => {
    setLoading(true);
    
    try {
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a aprovação da solicitação usando os dados recuperados
            await approveRequestWithCoupleData(id, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível aprovar a solicitação. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para aprovar solicitações.');
          return;
        }
      }
      
      // Se temos os dados do casal, aprovar a solicitação
      await approveRequestWithCoupleData(id, coupleData);
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error);
      alert(`Erro ao aprovar solicitação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para aprovar solicitação com os dados do casal
  const approveRequestWithCoupleData = async (id, coupleInfo) => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request) {
        console.error("Solicitação não encontrada:", id);
        return;
      }
      
      console.log('Aprovando solicitação:', id);
      // Usar o novo método approve que cria automaticamente eventos para solicitações
      const { data, error } = await database.requests.approve(id);
      
      if (error) {
        console.error("Erro ao aprovar solicitação:", error.message, error.details, error.hint);
        alert(`Erro ao aprovar solicitação: ${error.message}`);
        return;
      }
      
      // Atualizar a lista de solicitações
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved', response_date: new Date().toISOString() } : r));
      
      // Criar notificação para o parceiro
      await createUpdateNotification('request', id, 'Solicitação aprovada', `${user.name} aprovou sua solicitação: ${request.title}`);
      
      // Adicionar pontos ao usuário
      await addUserPoints(5, 'Aprovou uma solicitação');
      
      alert('Solicitação aprovada com sucesso! Se havia uma data de vencimento, foi adicionada ao calendário.');
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error);
      alert(`Erro ao aprovar solicitação: ${error.message}`);
    }
  };

  const handleRejectRequest = async (id) => {
    // Mostrar formulário de rejeição
    setShowRejectForm(true);
    setRejectingRequestId(id);
  };

  const handleConfirmReject = async () => {
    setLoading(true);
    
    try {
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a rejeição da solicitação usando os dados recuperados
            await rejectRequestWithCoupleData(coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível rejeitar a solicitação. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para rejeitar solicitações.');
          return;
        }
      }
      
      // Se temos os dados do casal, rejeitar a solicitação
      await rejectRequestWithCoupleData(coupleData);
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error);
      alert(`Erro ao rejeitar solicitação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para rejeitar solicitação com os dados do casal
  const rejectRequestWithCoupleData = async (coupleInfo) => {
    try {
      const request = requests.find(r => r.id === rejectingRequestId);
      if (!request) {
        console.error("Solicitação não encontrada:", rejectingRequestId);
        return;
      }
      
      console.log('Rejeitando solicitação:', rejectingRequestId);
      const { data, error } = await database.requests.update(rejectingRequestId, { 
        status: 'rejected',
        response_date: new Date().toISOString(),
        reject_reason: rejectReason
      });
      
      if (error) {
        console.error("Erro ao rejeitar solicitação:", error.message, error.details, error.hint);
        alert(`Erro ao rejeitar solicitação: ${error.message}`);
        return;
      }
      
      // Atualizar a lista de solicitações
      setRequests(requests.map(r => r.id === rejectingRequestId ? { 
        ...r, 
        status: 'rejected', 
        response_date: new Date().toISOString(),
        reject_reason: rejectReason
      } : r));
      
      // Criar notificação para o parceiro
      await createUpdateNotification('request', rejectingRequestId, 'Solicitação rejeitada', `${user.name} rejeitou sua solicitação: ${request.title}`);
      
      // Limpar o formulário
      setRejectReason('');
      setShowRejectForm(false);
      setRejectingRequestId(null);
      
      alert('Solicitação rejeitada com sucesso!');
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error);
      alert(`Erro ao rejeitar solicitação: ${error.message}`);
    }
  };

  // Funções de hábitos
  const handleAddHabit = async () => {
    if (!user) {
      alert("Você precisa estar logado para adicionar um hábito.");
      return;
    }

    setLoading(true);

    try {
      // Verificar se temos dados do casal
      if (!coupleData || !coupleData.id || !coupleData.is_confirmed) {
        // Criar um hábito pessoal
        const newHabitData = {
          created_by: user.id,
          title: newHabit.title,
          description: newHabit.description || '',
          frequency: newHabit.frequency,
          target_count: parseInt(newHabit.target_count),
          current_count: 0,
          is_personal: true,
          target_days: newHabit.targetDays || [] // Adicionando a propriedade target_days
        };

        // Enviar o hábito pessoal para o Supabase
        const { data, error } = await database.habits.add(newHabitData);
        
        if (error) {
          console.error("Erro ao adicionar hábito pessoal:", error.message, error.details, error.hint);
          alert(`Erro ao adicionar hábito pessoal: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Usar os dados retornados do Supabase ou criar um objeto temporário se falhar
        const tempHabit = data || {
          ...newHabitData,
          id: `temp_${Date.now()}`,
          created_at: new Date().toISOString()
        };

        // Adicionar à lista local
        setHabits(prevHabits => [...prevHabits, tempHabit]);
        
        // Limpar formulário
        setNewHabit({
          title: '',
          description: '',
          frequency: 'daily',
          target_count: '1',
          targetDays: [] // Resetando targetDays
        });
        
        setShowHabitForm(false);
        setLoading(false);
        return;
      }

      // Se temos os dados do casal, adicionar o hábito normalmente
      const newHabitData = {
        couple_id: coupleData.id,
        created_by: user.id,
        title: newHabit.title,
        description: newHabit.description || '',
        frequency: newHabit.frequency,
        target_count: parseInt(newHabit.target_count),
        current_count: 0,
        target_days: newHabit.targetDays || []
      };
      
      // Enviar o hábito para o Supabase
      const { data, error } = await database.habits.add(newHabitData);
      
      if (error) {
        console.error("Erro ao adicionar hábito:", error.message, error.details, error.hint);
        alert(`Erro ao adicionar hábito: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Adicionar à lista local
      setHabits(prevHabits => [...prevHabits, data]);
      
      // Limpar formulário
      setNewHabit({
        title: '',
        description: '',
        frequency: 'daily',
        target_count: '1',
        targetDays: []
      });
      
      setShowHabitForm(false);
      
      // Criar notificação para o parceiro
      if (partner) {
        await createUpdateNotification('habit', data.id, 'Novo hábito adicionado', `${user.name} adicionou um novo hábito: ${newHabit.title}`);
      }
      
      // Adicionar pontos ao usuário
      await addUserPoints(3, 'Adicionou um novo hábito');
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao adicionar hábito:", error);
      alert("Erro ao adicionar hábito. Tente novamente.");
      setLoading(false);
    }
  };

  // Função para excluir um hábito
  const handleDeleteHabit = async (id) => {
    if (!user) {
      alert("Você precisa estar logado para excluir um hábito.");
      return;
    }

    setLoading(true);

    try {
      // Verificar se é um hábito temporário (pessoal)
      const habitToDelete = habits.find(habit => habit.id === id);
      
      if (habitToDelete && habitToDelete.is_personal) {
        // Se for um hábito pessoal, apenas remover da lista local
        setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
        alert("Hábito excluído com sucesso!");
        return;
      }

      // Se não for um hábito pessoal e não tivermos dados do casal, mostrar erro
      if (!coupleData || !coupleData.id) {
        alert("Não foi possível excluir o hábito. Dados do casal não encontrados.");
        return;
      }

      // Código para excluir hábito do banco de dados
      // ...
      
      // Por enquanto, vamos apenas remover da lista local
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
      alert("Hábito excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir hábito:", error);
      alert("Erro ao excluir hábito. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para marcar/desmarcar um hábito como concluído
  const handleToggleHabitProgress = async (habitId) => {
    if (!user) {
      alert("Você precisa estar logado para atualizar o progresso.");
      return;
    }

    setLoading(true);

    try {
      // Chamar a nova função de atualização de progresso
      const { data, error } = await database.habits.updateProgress(habitId);
      
      if (error) {
        console.error("Erro ao atualizar progresso do hábito:", error);
        alert("Erro ao atualizar progresso. Tente novamente.");
        setLoading(false);
        return;
      }
      
      // Atualizar o hábito na lista local
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === habitId ? data : habit
        )
      );
      
      // Adicionar pontos ao usuário se o hábito foi concluído
      const today = new Date().toISOString().split('T')[0];
      if (data.progress && data.progress[today]) {
        await addUserPoints(1, 'Concluiu um hábito');
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar progresso do hábito:", error);
      alert("Erro ao atualizar progresso. Tente novamente.");
      setLoading(false);
    }
  };

  // Função para editar um hábito existente
  const handleUpdateHabit = async (habitId, updates) => {
    if (!user) {
      alert("Você precisa estar logado para editar um hábito.");
      return;
    }

    setLoading(true);

    try {
      // Verificar se o hábito existe na lista local
      const habitToUpdate = habits.find(h => h.id === habitId);
      if (!habitToUpdate) {
        alert("Hábito não encontrado.");
        setLoading(false);
        return;
      }
      
      // Preparar os dados para atualização
      const updateData = {
        ...updates,
        // Manter is_personal se já existir
        is_personal: habitToUpdate.is_personal
      };
      
      // Se o hábito for atribuído a alguém específico
      if (updates.assignedTo) {
        if (updates.assignedTo === 'me') {
          updateData.assigned_to = user.id;
        } else if (updates.assignedTo === 'partner' && partner) {
          updateData.assigned_to = partner.id;
        } else {
          // Para o casal, deixar assigned_to como null
          updateData.assigned_to = null;
        }
        
        // Remover o campo assignedTo que é apenas para UI
        delete updateData.assignedTo;
      }
      
      // Atualizar o hábito no Supabase
      const { data, error } = await database.habits.update(habitId, updateData);
      
      if (error) {
        console.error("Erro ao atualizar hábito:", error);
        alert(`Erro ao atualizar hábito: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Atualizar o hábito na lista local
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === habitId ? data : habit
        )
      );
      
      // Criar notificação para o parceiro se existir
      if (partner) {
        await createUpdateNotification('habit', habitId, 'Hábito atualizado', `${user.name} atualizou o hábito: ${updates.title}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar hábito:", error);
      alert("Erro ao atualizar hábito. Tente novamente.");
      setLoading(false);
    }
  };

  // Funções de solicitações
  const handleAddRequest = async () => {
    setLoading(true);
    
    try {
      if (!user) {
        alert('Você precisa estar logado para enviar solicitações.');
        setLoading(false);
        return;
      }
      
      if (!partner) {
        alert('Você precisa ter um parceiro para enviar solicitações.');
        setLoading(false);
        return;
      }
      
      // Criar uma nova solicitação
      const newRequestData = {
        from_user_id: user.id,
        from_user_name: user.name,
        to_user_id: partner.id,
        to_user_name: partner.name,
        title: newRequest.title,
        description: newRequest.description,
        status: 'pending',
        priority: newRequest.priority,
        created_at: new Date().toISOString(),
        due_date: newRequest.dueDate ? new Date(newRequest.dueDate).toISOString() : null
      };
      
      // Enviar para o Supabase
      const { data, error } = await database.requests.add(newRequestData);
      
      if (error) {
        console.error("Erro ao adicionar solicitação:", error);
        alert(`Erro ao adicionar solicitação: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Criar um objeto temporário para adicionar à lista local
      const tempRequest = data || {
        ...newRequestData,
        id: `temp_${Date.now()}`
      };
      
      // Adicionar à lista local
      setRequests(prevRequests => [...prevRequests, tempRequest]);
      
      // Limpar o formulário
      setNewRequest({
        title: '',
        description: '',
        priority: 'Média',
        dueDate: ''
      });
      
      setShowRequestForm(false);
      
      alert('Solicitação enviada com sucesso!');
    } catch (error) {
      console.error("Erro ao adicionar solicitação:", error);
      alert(`Erro ao adicionar solicitação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para editar uma solicitação
  const handleEditRequest = async (request) => {
    setEditingRequest(request);
    setShowEditRequestForm(true);
  };

  // Função para salvar a edição de uma solicitação
  const handleSaveRequestEdit = async () => {
    if (!editingRequest) return;
    
    setLoading(true);
    
    try {
      // Verificar se o usuário é o criador da solicitação
      if (editingRequest.from_user_id !== user.id) {
        alert('Você só pode editar solicitações que você criou.');
        setLoading(false);
        return;
      }
      
      // Preparar os dados atualizados
      const updatedRequest = {
        ...editingRequest,
        updated_at: new Date().toISOString()
      };
      
      // Atualizar no Supabase
      const { data, error } = await database.requests.update(editingRequest.id, updatedRequest);
      
      if (error) {
        console.error("Erro ao atualizar solicitação:", error);
        alert(`Erro ao atualizar solicitação: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Atualizar a lista local
      setRequests(prevRequests => 
        prevRequests.map(req => req.id === editingRequest.id ? data : req)
      );
      
      // Limpar o estado de edição
      setEditingRequest(null);
      setShowEditRequestForm(false);
      
      // Notificar o parceiro sobre a atualização
      if (partner) {
        await createUpdateNotification(
          'request', 
          data.id, 
          'Solicitação atualizada', 
          `${user.name} atualizou uma solicitação: ${data.title}`
        );
      }
      
      alert('Solicitação atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao editar solicitação:", error);
      alert(`Erro ao editar solicitação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir uma solicitação
  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) return;
    
    setLoading(true);
    
    try {
      // Buscar a solicitação para verificar se o usuário é o criador
      const requestToDelete = requests.find(req => req.id === id);
      
      if (!requestToDelete) {
        alert('Solicitação não encontrada.');
        setLoading(false);
        return;
      }
      
      if (requestToDelete.from_user_id !== user.id) {
        alert('Você só pode excluir solicitações que você criou.');
        setLoading(false);
        return;
      }
      
      // Excluir do Supabase
      const { error } = await database.requests.delete(id);
      
      if (error) {
        console.error("Erro ao excluir solicitação:", error);
        alert(`Erro ao excluir solicitação: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Atualizar a lista local
      setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
      
      // Notificar o parceiro sobre a exclusão
      if (partner) {
        await createUpdateNotification(
          'request', 
          id, 
          'Solicitação excluída', 
          `${user.name} excluiu uma solicitação`
        );
      }
      
      alert('Solicitação excluída com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error);
      alert(`Erro ao excluir solicitação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar dados do ciclo menstrual
  const handleUpdateCycle = async (formData) => {
    if (!formData.lastPeriodStart) return;
    
    setLoading(true);
    
    try {
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a atualização do ciclo usando os dados recuperados
            await updateCycleWithCoupleData(formData, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível atualizar o ciclo. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para atualizar o ciclo.');
          return;
        }
      }
      
      // Se temos os dados do casal, atualizar o ciclo
      await updateCycleWithCoupleData(formData, coupleData);
    } catch (error) {
      console.error("Erro ao atualizar ciclo:", error);
      alert(`Erro ao atualizar ciclo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Função auxiliar para atualizar ciclo com os dados do casal
  const updateCycleWithCoupleData = async (formData, coupleInfo) => {
    try {
      const cycleInfo = {
        user_id: user.id,
        couple_id: coupleInfo.id,
        last_period_start: formatDateToDB(formData.lastPeriodStart),
        cycle_length: formData.cycleLength,
        period_length: formData.periodLength,
        current_phase: formData.currentPhase,
        days_until_next_period: formData.daysUntilNextPeriod
      };
      
      console.log('Enviando dados do ciclo para o Supabase:', cycleInfo);
      
      // Verificar se já existe um registro
      const { data: existingData, error: getError } = await database.cycleData.get(user.id);
      
      if (getError) {
        console.error("Erro ao verificar dados do ciclo existentes:", getError.message, getError.details, getError.hint);
        alert(`Erro ao verificar dados do ciclo: ${getError.message}`);
        return;
      }
      
      let data;
      let error;
      
      if (existingData) {
        // Atualizar registro existente
        console.log('Atualizando registro existente do ciclo');
        const result = await database.cycleData.update(user.id, cycleInfo);
        data = result.data;
        error = result.error;
      } else {
        // Criar novo registro
        console.log('Criando novo registro do ciclo');
        const result = await database.cycleData.add(cycleInfo);
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error("Erro ao atualizar ciclo:", error.message, error.details, error.hint);
        alert(`Erro ao atualizar ciclo: ${error.message}`);
        return;
      }
      
      if (data) {
        console.log('Ciclo atualizado com sucesso:', data);
        
        setCycleData({
          lastPeriodStart: formatDateFromDB(data.last_period_start),
          cycleLength: data.cycle_length,
          periodLength: data.period_length,
          symptoms: data.symptoms || [],
          currentPhase: data.current_phase,
          daysUntilNextPeriod: data.days_until_next_period
        });
        
        // Notificar o parceiro
        if (partner?.id) {
          await createUpdateNotification(
            'cycle',
            user.id,
            'Ciclo menstrual atualizado',
            `${user.user_metadata.name} atualizou os dados do ciclo menstrual.`
          );
        }
        
        alert('Dados do ciclo atualizados com sucesso!');
      }
    } catch (error) {
      console.error("Erro ao atualizar ciclo:", error);
      alert(`Erro ao atualizar ciclo: ${error.message}`);
    }
  };

  // Função para lidar com o logout
  const handleLogout = async () => {
    await logout();
  };

  // Função para editar uma tarefa
  const handleEditTask = async (task) => {
    setLoading(true);
    
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        alert('Você precisa estar logado para editar tarefas.');
        setLoading(false);
        return;
      }
      
      // Se a tarefa for pessoal, editar diretamente
      if (task.is_personal) {
        console.log('Editando tarefa pessoal:', task.id);
        
        // Preparar os dados para atualização
        const updatedTaskData = {
          title: task.title,
          description: task.description || '',
          due_date: task.due_date,
          priority: task.priority || 'medium',
          status: task.status || 'pending'
        };
        
        // Atualizar no Supabase
        const { error } = await database.tasks.update(task.id, updatedTaskData);
        
        if (error) {
          console.error("Erro ao editar tarefa pessoal:", error.message, error.details, error.hint);
          alert(`Erro ao editar tarefa pessoal: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // Atualizar a lista de tarefas
        setTasks(tasks.map(t => t.id === task.id ? {...t, ...updatedTaskData} : t));
        setEditingTask(null);
        alert('Tarefa atualizada com sucesso!');
        setLoading(false);
        return;
      }
      
      // Verificar se o ID do casal existe
      if (!coupleData || !coupleData.id) {
        console.error("Erro: ID do casal não encontrado");
        
        // Tentar buscar os dados do casal novamente
        if (user) {
          console.log('Tentando buscar dados do casal novamente...');
          const { data: coupleInfo } = await database.couples.get(user.id);
          
          if (coupleInfo && coupleInfo.id) {
            console.log('Dados do casal recuperados com sucesso:', coupleInfo);
            setCoupleData(coupleInfo);
            
            // Continuar com a edição da tarefa usando os dados recuperados
            await editTaskWithCoupleData(task, coupleInfo);
            return;
          } else {
            console.error('Não foi possível recuperar os dados do casal');
            alert('Não foi possível editar a tarefa. Verifique se você está em um relacionamento.');
            return;
          }
        } else {
          alert('Você precisa estar logado para editar tarefas.');
          return;
        }
      }
      
      // Se temos os dados do casal, editar a tarefa
      await editTaskWithCoupleData(task, coupleData);
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
      alert(`Erro ao editar tarefa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para editar tarefa com os dados do casal
  const editTaskWithCoupleData = async (task, coupleInfo) => {
    try {
      // Preparar os dados para atualização
      const updatedTaskData = {
        title: task.title,
        description: task.description || '',
        due_date: task.due_date,
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to,
        status: task.status || 'pending'
      };
      
      console.log('Atualizando tarefa no Supabase:', updatedTaskData);
      const { data, error } = await database.tasks.update(task.id, updatedTaskData);
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error("Erro ao editar tarefa:", error.message, error.details, error.hint);
        alert(`Erro ao editar tarefa: ${error.message}`);
        return;
      }
      
      // Atualizar a lista de tarefas
      setTasks(tasks.map(t => t.id === task.id ? {...t, ...updatedTaskData} : t));
      
      // Criar notificação se a tarefa for atribuída ao parceiro
      if (task.assigned_to === partner?.id) {
        await createUpdateNotification('task', task.id, 'Tarefa atualizada', `${user.name} atualizou a tarefa: ${task.title}`);
      }
      
      setEditingTask(null);
      alert('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
      alert(`Erro ao editar tarefa: ${error.message}`);
    }
  };

  // Função para editar um item de compra
  const handleEditShoppingItem = async (item) => {
    try {
      setLoading(true);
      
      // Verificar se o item tem todos os campos necessários
      if (!item || !item.id || !item.name) {
        console.error('Item inválido:', item);
        alert('Erro ao editar item. Dados incompletos.');
        setLoading(false);
        return;
      }
      
      console.log('Editando item de compra:', item);
      
      // Verificar se temos o ID do casal
      if (!coupleData?.id && !item.is_personal) {
        console.log('ID do casal não encontrado, tentando buscar novamente...');
        const { data: coupleInfo } = await database.couples.get(user.id);
        
        if (coupleInfo) {
          setCoupleData(coupleInfo);
          await editShoppingItemWithCoupleData(item, coupleInfo.id);
        } else {
          // Se não encontrar dados do casal, marcar como item pessoal
          item.is_personal = true;
          item.couple_id = null;
          await editShoppingItemWithCoupleData(item, null);
        }
      } else {
        await editShoppingItemWithCoupleData(item, item.is_personal ? null : coupleData?.id);
      }
      
      setLoading(false);
      setEditingShoppingItem(null);
    } catch (error) {
      console.error('Erro ao editar item de compra:', error);
      alert('Erro ao editar item de compra. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  // Função auxiliar para editar item com dados do casal
  const editShoppingItemWithCoupleData = async (item, coupleId) => {
    try {
      // Preparar dados do item
      const itemData = {
        ...item,
        couple_id: coupleId,
        updated_at: new Date().toISOString()
      };
      
      // Remover campos que não devem ser enviados
      delete itemData.created_at;
      
      // Atualizar item no banco de dados
      const { data, error } = await database.shopping.update(itemData);
      
      if (error) {
        throw error;
      }
      
      console.log('Item atualizado com sucesso:', data);
      
      // Atualizar a lista local
      setShoppingLists(prev => {
        const updatedLists = { ...prev };
        
        // Atualizar o item em todas as listas (caso tenha mudado de lista)
        Object.keys(updatedLists).forEach(listType => {
          updatedLists[listType] = updatedLists[listType].map(i => 
            i.id === item.id ? { ...i, ...itemData } : i
          );
        });
        
        return updatedLists;
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  };

  // Renderizar conteúdo com base na aba ativa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }
    
    // Dados de exemplo para datas importantes
    const exampleCoupleData = {
      importantDates: [
        { title: 'Aniversário de Namoro', date: '15/06/2023', daysLeft: 120 },
        { title: 'Aniversário do Parceiro', date: '22/08/2023', daysLeft: 180 },
        { title: 'Férias Planejadas', date: '10/12/2023', daysLeft: 280 }
      ]
    };
    
    switch (activeTab) {
      case 'home':
        return (
          <HomePage 
            events={events}
            tasks={tasks}
            requests={requests}
            habits={habits}
            cycleData={cycleData}
            coupleData={exampleCoupleData}
            userType={userType}
            setActiveTab={setActiveTab}
            user={user}
            partner={partner}
          />
        );
      case 'calendar':
        return (
          <CalendarPage 
            currentMonth={currentMonth}
            currentYear={currentYear}
            setCurrentMonth={setCurrentMonth}
            setCurrentYear={setCurrentYear}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            showEventForm={showEventForm}
            setShowEventForm={setShowEventForm}
            newEventForm={newEventForm}
            setNewEventForm={setNewEventForm}
            handleAddEvent={handleAddEvent}
            handleDeleteEvent={handleDeleteEvent}
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            handleUpdateEvent={handleEditEvent}
          />
        );
      case 'tasks':
        return (
          <TasksPage 
            tasks={tasks}
            showTaskForm={showTaskForm}
            setShowTaskForm={setShowTaskForm}
            newTask={newTask}
            setNewTask={setNewTask}
            handleAddTask={handleAddTask}
            handleToggleTask={handleToggleTask}
            handleDeleteTask={handleDeleteTask}
            handleEditTask={handleEditTask}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            loading={loading}
            partner={partner}
          />
        );
      case 'shopping':
        return (
          <ShoppingPage 
            shoppingLists={shoppingLists}
            selectedListType={selectedListType}
            setSelectedListType={setSelectedListType}
            listTypes={listTypes}
            handleAddShoppingItem={handleAddShoppingItem}
            handleToggleShoppingItem={handleToggleShoppingItem}
            handleDeleteShoppingItem={handleDeleteShoppingItem}
            handleEditShoppingItem={handleEditShoppingItem}
            editingShoppingItem={editingShoppingItem}
            setEditingShoppingItem={setEditingShoppingItem}
            newShoppingItem={newShoppingItem}
            setNewShoppingItem={setNewShoppingItem}
            isPersonalShoppingItem={isPersonalShoppingItem}
            setIsPersonalShoppingItem={setIsPersonalShoppingItem}
          />
        );
      case 'requests':
        return (
          <RequestsPage 
            requests={requests} 
            handleAddRequest={handleAddRequest}
            handleApproveRequest={handleApproveRequest} 
            handleRejectRequest={handleRejectRequest}
            handleConfirmReject={handleConfirmReject}
            showRequestForm={showRequestForm}
            setShowRequestForm={setShowRequestForm}
            newRequest={newRequest}
            setNewRequest={setNewRequest}
            showRejectForm={showRejectForm}
            setShowRejectForm={setShowRejectForm}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            userType={userType}
            user={user}
            partner={partner}
            handleEditRequest={handleEditRequest}
            handleSaveRequestEdit={handleSaveRequestEdit}
            handleDeleteRequest={handleDeleteRequest}
          />
        );
      case 'habits':
        return (
          <HabitsPage 
            habits={habits}
            handleAddHabit={handleAddHabit}
            handleToggleHabitProgress={handleToggleHabitProgress}
            handleDeleteHabit={handleDeleteHabit}
            handleUpdateHabit={handleUpdateHabit}
            showNewHabitForm={showHabitForm}
            setShowNewHabitForm={setShowHabitForm}
            newHabit={newHabit}
            setNewHabit={setNewHabit}
            userType={userType}
          />
        );
      case 'settings':
        return <SettingsPage setActiveTab={setActiveTab} />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showSideMenu={showSideMenu} 
        setShowSideMenu={setShowSideMenu}
        showMoreMenu={showMoreMenu}
        setShowMoreMenu={setShowMoreMenu}
        onLogout={logout}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex flex-col md:flex-row">
        <SideMenu 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          showSideMenu={showSideMenu}
          setShowSideMenu={setShowSideMenu}
        />
        
        <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CasalSync; 