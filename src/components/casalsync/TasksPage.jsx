import React from 'react';
import { Plus, Trash, Check, X, Edit, Calendar, Clock, User } from 'lucide-react';

const TasksPage = ({ 
  tasks, 
  handleAddTask, 
  handleToggleTask, 
  handleDeleteTask,
  showTaskForm,
  setShowTaskForm,
  newTask,
  setNewTask,
  handleEditTask,
  editingTask,
  setEditingTask,
  loading
}) => {
  // Filtrar tarefas por status
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Tarefas</h1>
        <button 
          onClick={() => setShowTaskForm(true)}
          className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Adicionar nova tarefa"
          disabled={loading}
        >
          <Plus size={18} className="mr-1" />
          Nova Tarefa
        </button>
      </div>
      
      {/* Formulário de adição de tarefa */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Nova Tarefa</h2>
              <button 
                onClick={() => setShowTaskForm(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
                aria-label="Fechar formulário"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddTask();
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Lavar a louça"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Detalhes da tarefa"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento (opcional)
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    id="task-priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="task-assigned-to" className="block text-sm font-medium text-gray-700 mb-1">
                    Atribuir para
                  </label>
                  <select
                    id="task-assigned-to"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="me">Eu</option>
                    <option value="partner">Parceiro(a)</option>
                    <option value="couple">Ambos</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Formulário de edição de tarefa */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Editar Tarefa</h2>
              <button 
                onClick={() => setEditingTask(null)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
                aria-label="Fechar formulário"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditTask(editingTask);
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-task-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    id="edit-task-title"
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-task-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    id="edit-task-description"
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-task-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento (opcional)
                  </label>
                  <input
                    id="edit-task-due-date"
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    id="edit-task-priority"
                    value={editingTask.priority || 'medium'}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit-task-assigned-to" className="block text-sm font-medium text-gray-700 mb-1">
                    Atribuir para
                  </label>
                  <select
                    id="edit-task-assigned-to"
                    value={editingTask.assignedTo || 'me'}
                    onChange={(e) => setEditingTask({...editingTask, assignedTo: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="me">Eu</option>
                    <option value="partner">Parceiro(a)</option>
                    <option value="couple">Ambos</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Lista de tarefas pendentes */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tarefas Pendentes</h2>
        
        {pendingTasks.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">Nenhuma tarefa pendente.</p>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map(task => {
              // Determinar cores com base na prioridade
              let priorityColor;
              switch(task.priority) {
                case 'high': priorityColor = 'bg-red-100 text-red-700'; break;
                case 'medium': priorityColor = 'bg-yellow-100 text-yellow-700'; break;
                case 'low': priorityColor = 'bg-green-100 text-green-700'; break;
                default: priorityColor = 'bg-gray-100 text-gray-700';
              }
              
              // Determinar ícone com base no atribuído
              let assignedIcon;
              switch(task.assignedTo) {
                case 'partner': assignedIcon = <User size={14} className="text-pink-500" />; break;
                case 'couple': assignedIcon = <User size={14} className="text-purple-500" />; break;
                default: assignedIcon = <User size={14} className="text-blue-500" />;
              }
              
              return (
                <div 
                  key={task.id} 
                  className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="w-6 h-6 rounded-full border-2 border-purple-500 flex items-center justify-center mr-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label={`Marcar tarefa "${task.title}" como concluída`}
                  >
                    <Check size={14} className="text-transparent" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    
                    <div className="flex flex-wrap items-center mt-1 space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      
                      {task.dueDate && (
                        <span className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      
                      <span className="flex items-center text-xs text-gray-500">
                        {assignedIcon}
                        <span className="ml-1">
                          {task.assignedTo === 'me' ? 'Você' : 
                           task.assignedTo === 'partner' ? 'Parceiro(a)' : 'Ambos'}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1 text-gray-400 hover:text-purple-600 focus:outline-none focus:text-purple-600"
                      aria-label={`Editar tarefa "${task.title}"`}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                      aria-label={`Excluir tarefa "${task.title}"`}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Lista de tarefas concluídas */}
      {completedTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tarefas Concluídas</h2>
          
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-500 flex items-center justify-center mr-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label={`Marcar tarefa "${task.title}" como não concluída`}
                >
                  <Check size={14} className="text-white" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-500 line-through truncate">{task.title}</p>
                </div>
                
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                  aria-label={`Excluir tarefa "${task.title}"`}
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage; 