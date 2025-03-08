import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Settings, LogOut, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Header = ({ 
  showSideMenu, 
  setShowSideMenu, 
  showMoreMenu, 
  setShowMoreMenu,
  onLogout,
  setActiveTab
}) => {
  const { user, coupleData } = useAuth();
  const userName = user?.user_metadata?.name || 'Usuário';
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Buscar notificações do usuário
  useEffect(() => {
    if (user && coupleData) {
      const fetchNotifications = async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (data && !error) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      };
      
      fetchNotifications();
      
      // Inscrever-se para atualizações em tempo real
      const subscription = supabase
        .channel('notifications-channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, coupleData]);
  
  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
        
      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Menu button - more accessible with aria-label */}
            <button 
              onClick={() => setShowSideMenu(!showSideMenu)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label={showSideMenu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={showSideMenu}
            >
              <Menu size={24} />
            </button>
            
            {/* Logo */}
            <div className="ml-2 flex items-center">
              <span className="text-xl font-bold text-purple-600">CasalSync</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Notifications - more accessible with aria-label and badge */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markAllAsRead();
                  }
                }}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 relative"
                aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
                aria-expanded={showNotifications}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications dropdown - improved for mobile */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-lg py-1 z-20 max-h-[80vh] overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Notificações</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-800 focus:outline-none focus:underline"
                      aria-label="Marcar todas como lidas"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Nenhuma notificação.
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b border-gray-100 ${!notification.read ? 'bg-purple-50' : ''}`}
                      >
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleDateString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* User menu - more accessible */}
            <div className="relative">
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center space-x-1 p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Menu do usuário"
                aria-expanded={showMoreMenu}
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <User size={16} className="text-purple-600" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">{userName}</span>
                <ChevronDown size={16} className={`transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User dropdown - improved for mobile */}
              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <button 
                    onClick={() => {
                      setActiveTab('settings');
                      setShowMoreMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    <Settings size={16} className="mr-2" />
                    Configurações
                  </button>
                  
                  <button 
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 