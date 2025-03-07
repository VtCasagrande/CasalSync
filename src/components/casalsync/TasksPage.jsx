import React from 'react';
import { Plus, Trash, Check } from 'lucide-react';

const TasksPage = ({ 
  tasks, 
  handleAddTask, 
  handleToggleTask, 
  handleDeleteTask,
  showTaskForm,
  setShowTaskForm,
  newTask,
  setNewTask,
  userType
}) => {
  // Filtrar tarefas por status
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tarefas</h2>
        <button 
          onClick={() => setShowTaskForm(true)}
          className="bg-purple-600 text-white px-3 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Nova Tarefa
        </button>
      </div>
      
      {showTaskForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-medium mb-3">Nova Tarefa</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Ex: Lavar a louça"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Descrição da tarefa (opcional)"
                rows="2"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de vencimento
              </label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atribuir para
              </label>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="me">Para mim</option>
                <option value="partner">Para meu parceiro(a)</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-purple-600 text-white rounded-md"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Check size={48} className="mx-auto text-purple-300 mb-2" />
          <p className="text-gray-500">
            Você não tem tarefas pendentes. Adicione uma nova tarefa para começar.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Tarefas Pendentes</h3>
          <div className="space-y-3 mb-6">
            {pendingTasks.map(task => (
              <div key={task.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-1 w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mr-3"
                    >
                      {task.completed && <Check size={12} className="text-purple-600" />}
                    </button>
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        {task.dueDate && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Vence: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority === 'high' ? 'Alta' :
                           task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {completedTasks.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Tarefas Concluídas</h3>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-lg shadow p-4 opacity-70">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-1 w-5 h-5 rounded-full bg-purple-600 border border-purple-600 flex items-center justify-center mr-3"
                        >
                          <Check size={12} className="text-white" />
                        </button>
                        <div>
                          <h4 className="font-medium line-through">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 line-through">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksPage; 