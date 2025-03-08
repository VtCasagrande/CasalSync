import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, ShoppingCart, MessageSquare, Award, Heart, DropletIcon, Moon, Activity, Gift, Clock, Star, Trophy } from 'lucide-react';
import { database } from '../../lib/supabase';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HomePage = ({ 
  userType, 
  setActiveTab, 
  events, 
  tasks, 
  requests, 
  habits,
  cycleData,
  coupleData,
  user,
  partner
}) => {
  // Estados para gamificação
  const [userPoints, setUserPoints] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Obter nomes do usuário e parceiro
  const userName = user?.user_metadata?.name || 'Você';
  const partnerName = partner?.name || 'Parceiro(a)';
  
  // Buscar pontos e conquistas do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        
        // Buscar pontos do usuário
        const { data: pointsData } = await database.gamification.getUserPoints(user.id);
        if (pointsData) {
          setUserPoints(pointsData);
        } else {
          // Inicializar pontos se não existirem
          const { data: newPoints } = await database.gamification.initUserPoints(
            user.id, 
            coupleData?.id
          );
          setUserPoints(newPoints);
        }
        
        // Buscar conquistas do usuário
        const { data: achievementsData } = await database.gamification.getUserAchievements(user.id);
        if (achievementsData) {
          setAchievements(achievementsData);
        }
        
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, coupleData]);
  
  // Filtrar eventos próximos (próximos 7 dias)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.start_date);
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      return eventDate >= today && eventDate <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 3);
  
  // Filtrar tarefas pendentes
  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    })
    .slice(0, 3);
  
  // Filtrar solicitações pendentes
  const pendingRequests = requests
    .filter(req => req.status === 'pending' && req.to_user_id === user?.id)
    .slice(0, 3);
  
  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };
  
  // Renderizar card de resumo
  const renderSummaryCard = (title, icon, count, onClick, color = 'purple') => {
    const colorClasses = {
      purple: 'bg-purple-100 text-purple-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
    };
    
    return (
      <button 
        onClick={onClick}
        className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label={`Ver ${title}`}
      >
        <div className={`p-3 rounded-full ${colorClasses[color]} mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{count}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </button>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Olá, {userName}!</h1>
        
        {/* Pontos e nível */}
        {userPoints && (
          <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
            <div className="mr-3">
              <Trophy size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nível {userPoints.level}</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-yellow-500 rounded-full" 
                  style={{ width: `${(userPoints.points % 100) / 100 * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{userPoints.points} pontos</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {renderSummaryCard(
          'Eventos',
          <Calendar size={20} />,
          events.length,
          () => setActiveTab('calendar'),
          'purple'
        )}
        
        {renderSummaryCard(
          'Tarefas',
          <CheckSquare size={20} />,
          tasks.filter(t => !t.completed).length,
          () => setActiveTab('tasks'),
          'blue'
        )}
        
        {renderSummaryCard(
          'Compras',
          <ShoppingCart size={20} />,
          Object.values(shoppingLists || {}).flat().filter(i => !i.completed).length,
          () => setActiveTab('shopping'),
          'green'
        )}
        
        {renderSummaryCard(
          'Solicitações',
          <MessageSquare size={20} />,
          requests.filter(r => r.status === 'pending' && r.to_user_id === user?.id).length,
          () => setActiveTab('requests'),
          'yellow'
        )}
      </div>
      
      {/* Seção de próximos eventos */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Próximos Eventos</h2>
          <button 
            onClick={() => setActiveTab('calendar')}
            className="text-sm text-purple-600 hover:text-purple-800 focus:outline-none focus:underline"
            aria-label="Ver todos os eventos"
          >
            Ver todos
          </button>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-start p-3 hover:bg-gray-50 rounded-md">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple-100 rounded-full mr-3">
                  <Calendar size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(event.start_date)}
                    {event.time && ` às ${event.time}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-2">Nenhum evento próximo.</p>
        )}
      </div>
      
      {/* Layout de duas colunas para telas maiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarefas pendentes */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Tarefas Pendentes</h2>
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-sm text-purple-600 hover:text-purple-800 focus:outline-none focus:underline"
              aria-label="Ver todas as tarefas"
            >
              Ver todas
            </button>
          </div>
          
          {pendingTasks.length > 0 ? (
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex items-start p-3 hover:bg-gray-50 rounded-md">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full mr-3">
                    <CheckSquare size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-gray-500">Prazo: {formatDate(task.due_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-2">Nenhuma tarefa pendente.</p>
          )}
        </div>
        
        {/* Solicitações pendentes */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Solicitações</h2>
            <button 
              onClick={() => setActiveTab('requests')}
              className="text-sm text-purple-600 hover:text-purple-800 focus:outline-none focus:underline"
              aria-label="Ver todas as solicitações"
            >
              Ver todas
            </button>
          </div>
          
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="flex items-start p-3 hover:bg-gray-50 rounded-md">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-full mr-3">
                    <MessageSquare size={18} className="text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{request.title}</p>
                    <p className="text-xs text-gray-500">De: {request.from_user_id === user?.id ? 'Você' : partnerName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-2">Nenhuma solicitação pendente.</p>
          )}
        </div>
      </div>
      
      {/* Conquistas */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Suas Conquistas</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {achievements.slice(0, 4).map(achievement => (
              <div 
                key={achievement.id} 
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-full mb-2">
                  <Trophy size={24} className="text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-center text-gray-900">{achievement.title}</p>
                <p className="text-xs text-center text-gray-500 mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
          
          {achievements.length > 4 && (
            <div className="mt-3 text-center">
              <button 
                onClick={() => setActiveTab('settings')}
                className="text-sm text-purple-600 hover:text-purple-800 focus:outline-none focus:underline"
              >
                Ver todas as conquistas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage; 