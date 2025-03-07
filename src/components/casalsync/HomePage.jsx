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
  
  // Calcular próximos eventos importantes
  const getUpcomingEvents = () => {
    if (!events || events.length === 0) return [];
    
    const now = new Date();
    const upcoming = events
      .filter(event => new Date(event.start_date) > now)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(0, 3);
      
    return upcoming;
  };
  
  // Calcular datas importantes
  const getImportantDates = () => {
    const importantDates = [];
    
    // Adicionar aniversário de relacionamento se disponível
    if (coupleData?.relationship_start_date) {
      const startDate = new Date(coupleData.relationship_start_date);
      const anniversaryThisYear = new Date(
        new Date().getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      
      // Se o aniversário deste ano já passou, mostrar o do próximo ano
      const nextAnniversary = anniversaryThisYear < new Date() 
        ? new Date(
            new Date().getFullYear() + 1,
            startDate.getMonth(),
            startDate.getDate()
          )
        : anniversaryThisYear;
      
      importantDates.push({
        title: 'Aniversário de Relacionamento',
        date: nextAnniversary,
        icon: <Heart size={16} className="text-red-500" />
      });
    }
    
    // Adicionar aniversários dos parceiros se disponíveis
    if (user?.user_metadata?.birth_date) {
      const birthDate = new Date(user.user_metadata.birth_date);
      const birthdayThisYear = new Date(
        new Date().getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );
      
      const nextBirthday = birthdayThisYear < new Date() 
        ? new Date(
            new Date().getFullYear() + 1,
            birthDate.getMonth(),
            birthDate.getDate()
          )
        : birthdayThisYear;
      
      importantDates.push({
        title: 'Seu Aniversário',
        date: nextBirthday,
        icon: <Gift size={16} className="text-blue-500" />
      });
    }
    
    if (partner?.birth_date) {
      const partnerBirthDate = new Date(partner.birth_date);
      const partnerBirthdayThisYear = new Date(
        new Date().getFullYear(),
        partnerBirthDate.getMonth(),
        partnerBirthDate.getDate()
      );
      
      const nextPartnerBirthday = partnerBirthdayThisYear < new Date() 
        ? new Date(
            new Date().getFullYear() + 1,
            partnerBirthDate.getMonth(),
            partnerBirthDate.getDate()
          )
        : partnerBirthdayThisYear;
      
      importantDates.push({
        title: `Aniversário de ${partnerName}`,
        date: nextPartnerBirthday,
        icon: <Gift size={16} className="text-pink-500" />
      });
    }
    
    // Ordenar por data mais próxima
    return importantDates.sort((a, b) => a.date - b.date);
  };

  // Componente de informações do ciclo para o homem
  const CycleInfo = () => {
    if (userType !== 'man' || !cycleData) return null;
    
    let phaseColor, phaseIcon;
    
    switch(cycleData.currentPhase) {
      case 'menstrual':
        phaseColor = 'bg-red-100 text-red-700';
        phaseIcon = <DropletIcon className="text-red-500 mr-1" size={14} />;
        break;
      case 'fértil':
        phaseColor = 'bg-green-100 text-green-700';
        phaseIcon = <Activity className="text-green-500 mr-1" size={14} />;
        break;
      default:
        phaseColor = 'bg-purple-100 text-purple-700';
        phaseIcon = <Moon className="text-purple-500 mr-1" size={14} />;
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Ciclo de {partnerName}</h3>
          <span className={`px-2 py-1 rounded-full text-xs flex items-center ${phaseColor}`}>
            {phaseIcon} {cycleData.currentPhase}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          Próximo período em: {cycleData.daysUntilNextPeriod} dias
        </p>
      </div>
    );
  };

  // Componente de acessos rápidos
  const QuickAccess = () => {
    const quickLinks = [
      { 
        title: 'Calendário', 
        icon: <Calendar size={20} className="text-blue-500" />, 
        tab: 'calendar',
        color: 'bg-blue-100'
      },
      { 
        title: 'Tarefas', 
        icon: <CheckSquare size={20} className="text-green-500" />, 
        tab: 'tasks',
        color: 'bg-green-100'
      },
      { 
        title: 'Compras', 
        icon: <ShoppingCart size={20} className="text-orange-500" />, 
        tab: 'shopping',
        color: 'bg-orange-100'
      },
      { 
        title: 'Solicitações', 
        icon: <MessageSquare size={20} className="text-purple-500" />, 
        tab: 'requests',
        color: 'bg-purple-100'
      },
      { 
        title: 'Hábitos', 
        icon: <Award size={20} className="text-indigo-500" />, 
        tab: 'habits',
        color: 'bg-indigo-100'
      }
    ];
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-3">Acessos Rápidos</h3>
        <div className="grid grid-cols-5 gap-2">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(link.tab)}
              className={`${link.color} p-3 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105`}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Componente de datas importantes
  const ImportantDates = () => {
    const importantDates = getImportantDates();
    
    if (importantDates.length === 0) return null;
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-3">Datas Importantes</h3>
        <div className="space-y-3">
          {importantDates.map((date, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div className="flex items-center">
                {date.icon}
                <span className="text-sm ml-2">{date.title}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-600">
                  {format(date.date, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Componente de próximos eventos
  const UpcomingEvents = () => {
    const upcomingEvents = getUpcomingEvents();
    
    if (upcomingEvents.length === 0) return null;
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-3">Próximos Eventos</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div className="flex items-center">
                <Calendar size={14} className="text-blue-500 mr-2" />
                <span className="text-sm">{event.title}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-600">
                  {format(new Date(event.start_date), "dd/MM - HH:mm")}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setActiveTab('calendar')}
          className="w-full mt-3 text-center text-xs text-blue-600 hover:underline"
        >
          Ver todos os eventos
        </button>
      </div>
    );
  };
  
  // Componente de gamificação
  const GamificationCard = () => {
    if (!userPoints) return null;
    
    const progressPercent = (userPoints.total_points % 100) / 100 * 100;
    const recentAchievements = achievements
      .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))
      .slice(0, 3);
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Seu Progresso</h3>
          <div className="flex items-center">
            <Trophy size={16} className="text-yellow-500 mr-1" />
            <span className="text-sm font-medium">Nível {userPoints.level}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{userPoints.total_points % 100} pontos</span>
            <span>Próximo nível: {100 - (userPoints.total_points % 100)} pontos</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        {recentAchievements.length > 0 && (
          <>
            <h4 className="text-sm font-medium mb-2">Conquistas Recentes</h4>
            <div className="space-y-2">
              {recentAchievements.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Star size={14} className="text-yellow-500 mr-2" />
                  <span>{item.achievement.title}</span>
                </div>
              ))}
            </div>
          </>
        )}
        
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-full mt-3 text-center text-xs text-blue-600 hover:underline"
        >
          Ver todas as conquistas
        </button>
      </div>
    );
  };

  // Componente de tarefas pendentes
  const PendingTasks = () => {
    if (!tasks || tasks.length === 0) return null;
    
    const pendingTasks = tasks
      .filter(task => !task.completed)
      .sort((a, b) => new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31'))
      .slice(0, 3);
    
    if (pendingTasks.length === 0) return null;
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-3">Tarefas Pendentes</h3>
        <div className="space-y-2">
          {pendingTasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div className="flex items-center">
                <CheckSquare size={14} className="text-green-500 mr-2" />
                <span className="text-sm">{task.title}</span>
              </div>
              {task.due_date && (
                <span className="text-xs text-gray-600">
                  {format(new Date(task.due_date), "dd/MM")}
                </span>
              )}
            </div>
          ))}
        </div>
        <button 
          onClick={() => setActiveTab('tasks')}
          className="w-full mt-3 text-center text-xs text-blue-600 hover:underline"
        >
          Ver todas as tarefas
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Olá, {userName}!</h2>
      
      <QuickAccess />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GamificationCard />
        <ImportantDates />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpcomingEvents />
        <PendingTasks />
      </div>
      
      <CycleInfo />
    </div>
  );
};

export default HomePage; 