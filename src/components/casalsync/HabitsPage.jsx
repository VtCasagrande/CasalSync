import React, { useState } from 'react';
import { Plus, Trash, Award, Check, X, Flame, Edit, Clock, Calendar } from 'lucide-react';

const HabitsPage = ({ 
  habits, 
  handleAddHabit, 
  handleToggleHabitProgress, 
  handleDeleteHabit,
  handleUpdateHabit,
  showNewHabitForm,
  setShowNewHabitForm,
  newHabit,
  setNewHabit,
  userType
}) => {
  const [editingHabit, setEditingHabit] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    targetDays: [],
    time: '',
    target_count: 1
  });

  const weekDays = [
    { id: 'monday', label: 'Seg' },
    { id: 'tuesday', label: 'Ter' },
    { id: 'wednesday', label: 'Qua' },
    { id: 'thursday', label: 'Qui' },
    { id: 'friday', label: 'Sex' },
    { id: 'saturday', label: 'Sáb' },
    { id: 'sunday', label: 'Dom' }
  ];

  const handleFrequencyChange = (e, isEdit = false) => {
    const frequency = e.target.value;
    
    // Resetar os dias selecionados com base na frequência
    let targetDays = [];
    
    if (frequency === 'daily') {
      // Todos os dias da semana
      targetDays = weekDays.map(day => day.id);
    } else if (frequency === 'weekdays') {
      // Segunda a sexta
      targetDays = weekDays
        .filter(day => day.id !== 'saturday' && day.id !== 'sunday')
        .map(day => day.id);
    } else if (frequency === 'weekends') {
      // Sábado e domingo
      targetDays = ['saturday', 'sunday'];
    } else {
      // Custom - manter os dias atuais
      targetDays = isEdit ? [...editForm.targetDays] : [...newHabit.targetDays];
    }
    
    if (isEdit) {
      setEditForm({
        ...editForm,
        frequency,
        targetDays
      });
    } else {
      setNewHabit({
        ...newHabit,
        frequency,
        targetDays
      });
    }
  };
  
  const handleDayToggle = (dayId, isEdit = false) => {
    if (isEdit) {
      const isSelected = editForm.targetDays.includes(dayId);
      let updatedDays;
      
      if (isSelected) {
        // Remover o dia
        updatedDays = editForm.targetDays.filter(day => day !== dayId);
      } else {
        // Adicionar o dia
        updatedDays = [...editForm.targetDays, dayId];
      }
      
      setEditForm({
        ...editForm,
        targetDays: updatedDays,
        // Se a frequência era predefinida, mudar para personalizada
        frequency: 'custom'
      });
    } else {
      const isSelected = newHabit.targetDays.includes(dayId);
      let updatedDays;
      
      if (isSelected) {
        // Remover o dia
        updatedDays = newHabit.targetDays.filter(day => day !== dayId);
      } else {
        // Adicionar o dia
        updatedDays = [...newHabit.targetDays, dayId];
      }
      
      setNewHabit({
        ...newHabit,
        targetDays: updatedDays,
        // Se a frequência era predefinida, mudar para personalizada
        frequency: 'custom'
      });
    }
  };
  
  const getCurrentDayName = () => {
    const today = new Date().getDay();
    // Converter de 0-6 (domingo-sábado) para os IDs que usamos
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[today];
  };
  
  const isHabitActiveToday = (habit) => {
    const todayName = getCurrentDayName();
    return habit.target_days && habit.target_days.includes(todayName);
  };
  
  const startEditingHabit = (habit) => {
    setEditingHabit(habit.id);
    setEditForm({
      title: habit.title || '',
      description: habit.description || '',
      frequency: habit.frequency || 'daily',
      targetDays: habit.target_days || [],
      time: habit.time || '',
      target_count: habit.target_count || 1
    });
  };
  
  const cancelEditing = () => {
    setEditingHabit(null);
    setEditForm({
      title: '',
      description: '',
      frequency: 'daily',
      targetDays: [],
      time: '',
      target_count: 1
    });
  };
  
  const saveHabitEdit = () => {
    if (!editForm.title) {
      alert('O título do hábito é obrigatório');
      return;
    }
    
    const updatedHabit = {
      title: editForm.title,
      description: editForm.description,
      frequency: editForm.frequency,
      target_days: editForm.targetDays,
      time: editForm.time,
      target_count: parseInt(editForm.target_count)
    };
    
    handleUpdateHabit(editingHabit, updatedHabit);
    cancelEditing();
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // Verificar se já está no formato HH:MM
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString;
      }
      
      // Tentar converter de ISO para HH:MM
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Hábitos</h2>
        <button 
          onClick={() => setShowNewHabitForm(true)}
          className="bg-purple-600 text-white px-3 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Novo Hábito
        </button>
      </div>
      
      {showNewHabitForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-medium mb-3">Novo Hábito</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddHabit();
          }}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={newHabit.title}
                onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Ex: Beber água"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={newHabit.description}
                onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Descrição do hábito (opcional)"
                rows="2"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Para quem?
              </label>
              <select
                value={newHabit.assignedTo}
                onChange={(e) => setNewHabit({...newHabit, assignedTo: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="me">Para mim</option>
                <option value="partner">Para meu parceiro(a)</option>
                <option value="couple">Para nós dois</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência
              </label>
              <select
                value={newHabit.frequency}
                onChange={handleFrequencyChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="daily">Todos os dias</option>
                <option value="weekdays">Dias úteis (Seg-Sex)</option>
                <option value="weekends">Fins de semana (Sáb-Dom)</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            {newHabit.frequency === 'custom' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias da semana
                </label>
                <div className="flex space-x-2">
                  {weekDays.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        newHabit.targetDays.includes(day.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário (opcional)
              </label>
              <div className="flex items-center">
                <Clock size={16} className="mr-2 text-gray-500" />
                <input
                  type="time"
                  value={newHabit.time || ''}
                  onChange={(e) => setNewHabit({...newHabit, time: e.target.value})}
                  className="p-2 border rounded-md"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Defina um horário para receber lembretes
              </p>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta diária (quantas vezes)
              </label>
              <input
                type="number"
                min="1"
                value={newHabit.target_count}
                onChange={(e) => setNewHabit({...newHabit, target_count: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowNewHabitForm(false)}
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
      
      {habits.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Award size={48} className="mx-auto text-purple-300 mb-2" />
          <p className="text-gray-500">
            Você ainda não tem hábitos. Adicione um novo hábito para começar a acompanhar seu progresso.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white rounded-lg shadow p-4">
              {editingHabit === habit.id ? (
                // Formulário de edição
                <div className="p-2">
                  <h3 className="font-medium mb-3">Editar Hábito</h3>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="Ex: Beber água"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="Descrição do hábito (opcional)"
                      rows="2"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequência
                    </label>
                    <select
                      value={editForm.frequency}
                      onChange={(e) => handleFrequencyChange(e, true)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="daily">Todos os dias</option>
                      <option value="weekdays">Dias úteis (Seg-Sex)</option>
                      <option value="weekends">Fins de semana (Sáb-Dom)</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  
                  {editForm.frequency === 'custom' && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dias da semana
                      </label>
                      <div className="flex space-x-2">
                        {weekDays.map(day => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => handleDayToggle(day.id, true)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              editForm.targetDays.includes(day.id)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário (opcional)
                    </label>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-gray-500" />
                      <input
                        type="time"
                        value={editForm.time || ''}
                        onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                        className="p-2 border rounded-md"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Defina um horário para receber lembretes
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta diária (quantas vezes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.target_count}
                      onChange={(e) => setEditForm({...editForm, target_count: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={saveHabitEdit}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                // Visualização normal do hábito
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{habit.title}</h3>
                      {habit.description && (
                        <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                      )}
                      <div className="flex items-center mt-2 flex-wrap gap-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {habit.frequency === 'daily' ? 'Todos os dias' : 
                           habit.frequency === 'weekdays' ? 'Dias úteis' :
                           habit.frequency === 'weekends' ? 'Fins de semana' : 'Personalizado'}
                        </span>
                        {habit.time && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                            <Clock size={12} className="mr-1" />
                            {formatTime(habit.time)}
                          </span>
                        )}
                        {habit.streak > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center">
                            <Flame size={12} className="mr-1" />
                            {habit.streak} dias
                          </span>
                        )}
                        {habit.is_personal && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Pessoal
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {isHabitActiveToday(habit) && (
                        <button
                          onClick={() => handleToggleHabitProgress(habit.id)}
                          className={`mr-2 w-8 h-8 rounded-full flex items-center justify-center ${
                            habit.completed_today
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                          title="Marcar como concluído hoje"
                        >
                          {habit.completed_today ? <Check size={16} /> : null}
                        </button>
                      )}
                      
                      <button
                        onClick={() => startEditingHabit(habit)}
                        className="mr-2 text-blue-500 hover:text-blue-700"
                        title="Editar hábito"
                      >
                        <Edit size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Excluir hábito"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Progresso semanal</div>
                    <div className="flex space-x-1">
                      {weekDays.map(day => {
                        const isActive = habit.target_days && habit.target_days.includes(day.id);
                        const isCompleted = habit.progress && habit.progress[day.id];
                        const isToday = getCurrentDayName() === day.id;
                        
                        return (
                          <div
                            key={day.id}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              !isActive
                                ? 'bg-gray-100 text-gray-400'
                                : isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isToday
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {day.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitsPage; 