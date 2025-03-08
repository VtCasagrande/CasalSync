import React from 'react';
import { Home, Calendar, CheckSquare, ShoppingCart, MessageSquare, Award, Settings, X } from 'lucide-react';

const SideMenu = ({ 
  activeTab, 
  setActiveTab, 
  showSideMenu, 
  setShowSideMenu 
}) => {
  // Array de itens do menu
  const menuItems = [
    { id: 'home', label: 'Início', icon: <Home size={20} /> },
    { id: 'calendar', label: 'Calendário', icon: <Calendar size={20} /> },
    { id: 'tasks', label: 'Tarefas', icon: <CheckSquare size={20} /> },
    { id: 'shopping', label: 'Compras', icon: <ShoppingCart size={20} /> },
    { id: 'requests', label: 'Solicitações', icon: <MessageSquare size={20} /> },
    { id: 'habits', label: 'Hábitos', icon: <Award size={20} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> }
  ];

  // Função para fechar o menu após selecionar um item (em dispositivos móveis)
  const handleMenuItemClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768) {
      setShowSideMenu(false);
    }
  };

  return (
    <>
      {/* Overlay para fechar o menu em dispositivos móveis */}
      {showSideMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setShowSideMenu(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Menu lateral */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
          showSideMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:static md:z-0 md:h-[calc(100vh-4rem)] md:w-56 md:shadow-none`}
        aria-label="Menu de navegação principal"
        role="navigation"
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho do menu (apenas em dispositivos móveis) */}
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <h2 className="text-xl font-bold text-purple-600">CasalSync</h2>
            <button 
              onClick={() => setShowSideMenu(false)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Itens do menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === item.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    aria-current={activeTab === item.id ? 'page' : undefined}
                  >
                    <span className="mr-3 text-purple-600">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Rodapé do menu */}
          <div className="p-4 border-t text-xs text-gray-500">
            <p>CasalSync v1.0</p>
            <p className="mt-1">© 2023 CasalSync</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideMenu; 