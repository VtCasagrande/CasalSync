import React, { useState } from 'react';
import { Plus, Trash, Check, ShoppingCart, Edit } from 'lucide-react';
import { FaPlus, FaTrash, FaCheck, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const ShoppingPage = ({ 
  shoppingLists, 
  handleAddShoppingItem, 
  handleToggleShoppingItem, 
  handleDeleteShoppingItem,
  selectedListType,
  setSelectedListType,
  newShoppingItem,
  setNewShoppingItem,
  listTypes,
  handleAddListType,
  handleDeleteListType,
  handleEditShoppingItem,
  editingShoppingItem,
  setEditingShoppingItem,
  isPersonalShoppingItem,
  setIsPersonalShoppingItem
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showListTypeForm, setShowListTypeForm] = useState(false);
  const [newListType, setNewListType] = useState({ id: '', label: '', icon: '🛒' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newShoppingItem.name.trim()) {
      handleAddShoppingItem(selectedListType);
    }
  };

  const handleListTypeSubmit = () => {
    if (!newListType.id.trim() || !newListType.label.trim()) return;
    
    handleAddListType(newListType);
    setNewListType({ id: '', label: '', icon: '🛒' });
    setShowListTypeForm(false);
  };

  const availableIcons = ['🛒', '🥫', '🏠', '🎁', '🍎', '🥦', '🍞', '🥩', '🧀', '🍷', '🧹', '🧼', '🧻', '📝'];

  // Função para iniciar a edição de um item
  const startEditing = (item) => {
    setEditingShoppingItem({...item});
  };

  // Função para salvar a edição de um item
  const saveEdit = () => {
    handleEditShoppingItem(editingShoppingItem);
  };

  // Função para cancelar a edição
  const cancelEdit = () => {
    setEditingShoppingItem(null);
  };

  // Função para atualizar o item em edição
  const updateEditingItem = (field, value) => {
    setEditingShoppingItem({
      ...editingShoppingItem,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lista de Compras</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowListTypeForm(true)}
              className="flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
            >
              <Edit size={16} className="mr-1" /> Gerenciar Categorias
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700"
            >
              <FaPlus size={16} className="mr-1" /> Novo Item
            </button>
          </div>
        </div>

        {/* Formulário para adicionar nova categoria */}
        {showListTypeForm && (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleListTypeSubmit();
          }} className="mb-4 p-3 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800 mb-3">Adicionar Nova Categoria</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID (sem espaços)</label>
                <input 
                  type="text" 
                  value={newListType.id}
                  onChange={(e) => setNewListType({...newListType, id: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="id_da_categoria"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome da Categoria</label>
                <input 
                  type="text" 
                  value={newListType.label}
                  onChange={(e) => setNewListType({...newListType, label: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nome da categoria"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ícone</label>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewListType({...newListType, icon})}
                      className={`p-2 text-xl border rounded-md ${newListType.icon === icon ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowListTypeForm(false)}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md"
                >
                  Adicionar Categoria
                </button>
              </div>
            </div>

            {/* Lista de categorias existentes */}
            {listTypes.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Categorias Existentes</h4>
                <div className="space-y-2">
                  {listTypes.map(type => (
                    <div key={type.id} className="flex items-center justify-between p-2 bg-white border rounded-md">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                      {/* Não permitir excluir se for uma das categorias padrão */}
                      {!['daily', 'home', 'special'].includes(type.id) && (
                        <button 
                          onClick={() => handleDeleteListType(type.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

        {/* Tabs para tipos de lista */}
        <div className="flex flex-wrap border-b mb-4">
          {listTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedListType(type.id)}
              className={`px-4 py-2 font-medium text-sm ${selectedListType === type.id 
                ? 'border-b-2 border-purple-500 text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span className="mr-1">{type.icon}</span> {type.label}
            </button>
          ))}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-3 bg-purple-50 rounded-md">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Item</label>
                <input 
                  type="text" 
                  value={newShoppingItem.name}
                  onChange={(e) => setNewShoppingItem({...newShoppingItem, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nome do item"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Quantidade</label>
                <input 
                  type="number"
                  min="1"
                  value={newShoppingItem.quantity}
                  onChange={(e) => setNewShoppingItem({...newShoppingItem, quantity: parseInt(e.target.value) || 1})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Lista</label>
                <select 
                  value={selectedListType}
                  onChange={(e) => setSelectedListType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {listTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPersonal"
                  checked={isPersonalShoppingItem}
                  onChange={(e) => setIsPersonalShoppingItem(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isPersonal" className="ml-2 block text-sm text-gray-600">
                  Item pessoal (visível apenas para você)
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1 bg-purple-600 text-white rounded-md"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Lista de itens */}
        <div>
          {shoppingLists[selectedListType] && shoppingLists[selectedListType].length > 0 ? (
            <div className="space-y-2">
              {shoppingLists[selectedListType].map(item => {
                let priorityColor;
                switch(item.priority) {
                  case 'alta': priorityColor = 'bg-red-100 text-red-700'; break;
                  case 'média': priorityColor = 'bg-yellow-100 text-yellow-700'; break;
                  case 'baixa': priorityColor = 'bg-green-100 text-green-700'; break;
                  default: priorityColor = 'bg-gray-100 text-gray-700';
                }
                
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 border rounded-md ${item.completed ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                  >
                    {editingShoppingItem && editingShoppingItem.id === item.id ? (
                      // Modo de edição
                      <div className="w-full">
                        <div className="flex items-center space-x-2 mb-2">
                          <input 
                            type="text" 
                            value={editingShoppingItem.name}
                            onChange={(e) => updateEditingItem('name', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                            autoFocus
                          />
                          <input 
                            type="number"
                            min="1"
                            value={editingShoppingItem.quantity}
                            onChange={(e) => updateEditingItem('quantity', parseInt(e.target.value) || 1)}
                            className="w-20 p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`isPersonal-${editingShoppingItem.id}`}
                            checked={editingShoppingItem.is_personal}
                            onChange={(e) => updateEditingItem('is_personal', e.target.checked)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`isPersonal-${editingShoppingItem.id}`} className="ml-2 block text-sm text-gray-600">
                            Item pessoal (visível apenas para você)
                          </label>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button 
                            type="button"
                            onClick={cancelEdit}
                            className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md flex items-center"
                          >
                            <FaTimes className="mr-1" /> Cancelar
                          </button>
                          <button 
                            type="button"
                            onClick={saveEdit}
                            className="px-3 py-1 bg-purple-600 text-white rounded-md flex items-center"
                          >
                            <FaSave className="mr-1" /> Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo de visualização
                      <>
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleToggleShoppingItem(item.id, selectedListType)}
                            className={`h-5 w-5 rounded-full mr-3 flex items-center justify-center ${
                              item.completed 
                                ? 'bg-purple-500 border border-purple-500' 
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {item.completed && <Check size={14} className="text-white" />}
                          </button>
                          <div>
                            <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                              {item.name} {item.quantity > 1 && <span className="text-sm text-gray-500">x{item.quantity}</span>}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor}`}>
                                {item.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => startEditing(item)}
                            className="text-gray-400 hover:text-purple-500"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteShoppingItem(item.id, selectedListType)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">Nenhum item na lista de {listTypes.find(t => t.id === selectedListType)?.label.toLowerCase()}</p>
              <button 
                onClick={() => setShowForm(true)}
                className="mt-2 text-sm text-purple-600 hover:underline"
              >
                Adicionar um item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage; 