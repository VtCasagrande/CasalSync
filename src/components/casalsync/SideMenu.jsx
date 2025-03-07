import React from 'react';
import { Home, Calendar, CheckSquare, ShoppingCart, MessageSquare, Award, X, Settings } from 'lucide-react';

const SideMenu = ({ showSideMenu, setShowSideMenu, setActiveTab, activeTab }) => {
  if (!showSideMenu) return null;
  
  // Função auxiliar para determinar a classe do botão com base na aba ativa
  const getButtonClass = (tabName) => {
    const baseClass = "flex items-center p-2 w-full text-left rounded";
    return activeTab === tabName 
      ? `${baseClass} bg-purple-100 text-purple-700 font-medium` 
      : `${baseClass} text-gray-700 hover:bg-purple-50`;
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowSideMenu(false)}>
      <div className="w-64 h-full bg-white shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={() => setShowSideMenu(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 uppercase">Principal</p>
            <button 
              onClick={() => {
                setActiveTab('home');
                setShowSideMenu(false);
              }}
              className={getButtonClass('home')}
            >
              <Home size={18} className="mr-2" /> Início
            </button>
            <button 
              onClick={() => {
                setActiveTab('calendar');
                setShowSideMenu(false);
              }}
              className={getButtonClass('calendar')}
            >
              <Calendar size={18} className="mr-2" /> Calendário
            </button>
            <button 
              onClick={() => {
                setActiveTab('tasks');
                setShowSideMenu(false);
              }}
              className={getButtonClass('tasks')}
            >
              <CheckSquare size={18} className="mr-2" /> Tarefas
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 uppercase">Funções</p>
            <button 
              onClick={() => {
                setActiveTab('shopping');
                setShowSideMenu(false);
              }}
              className={getButtonClass('shopping')}
            >
              <ShoppingCart size={18} className="mr-2" /> Compras
            </button>
            <button 
              onClick={() => {
                setActiveTab('requests');
                setShowSideMenu(false);
              }}
              className={getButtonClass('requests')}
            >
              <MessageSquare size={18} className="mr-2" /> Solicitações
            </button>
            <button 
              onClick={() => {
                setActiveTab('habits');
                setShowSideMenu(false);
              }}
              className={getButtonClass('habits')}
            >
              <Award size={18} className="mr-2" /> Hábitos
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 uppercase">Conta</p>
            <button 
              onClick={() => {
                setActiveTab('settings');
                setShowSideMenu(false);
              }}
              className={getButtonClass('settings')}
            >
              <Settings size={18} className="mr-2" /> Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu; 