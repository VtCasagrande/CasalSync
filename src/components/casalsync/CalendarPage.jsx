import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Edit, Trash, Clock, Calendar, List, Grid, ArrowLeft } from 'lucide-react';

const CalendarPage = ({
  events,
  handleAddEvent,
  handleEditEvent,
  handleDeleteEvent,
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  selectedDate,
  setSelectedDate,
  showEventForm,
  setShowEventForm,
  newEventForm,
  setNewEventForm,
  editingEvent,
  setEditingEvent
}) => {
  // Estado para controlar a seleção de período
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // Estado para controlar a visualização (mês, semana ou dia)
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week' ou 'day'
  const [currentWeek, setCurrentWeek] = useState(0); // Semana atual (0-5)
  const [dayViewDate, setDayViewDate] = useState(null); // Data para visualização diária

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthName = (month) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[month];
  };

  const handlePrevMonth = () => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === 'week') {
      // Modo semana
      if (currentWeek === 0) {
        // Voltar para o mês anterior
        if (currentMonth === 0) {
          setCurrentMonth(11);
          setCurrentYear(currentYear - 1);
        } else {
          setCurrentMonth(currentMonth - 1);
        }
        // Ir para a última semana do mês anterior
        setCurrentWeek(4); // Aproximadamente a última semana
      } else {
        // Voltar uma semana
        setCurrentWeek(currentWeek - 1);
      }
    } else if (viewMode === 'day') {
      // Modo dia - voltar um dia
      const currentDate = new Date(dayViewDate.split('/').reverse().join('-'));
      currentDate.setDate(currentDate.getDate() - 1);
      const newDate = `${currentDate.getDate() < 10 ? '0' + currentDate.getDate() : currentDate.getDate()}/${(currentDate.getMonth() + 1) < 10 ? '0' + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1)}/${currentDate.getFullYear()}`;
      setDayViewDate(newDate);
      setSelectedDate(newDate);
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === 'week') {
      // Modo semana
      if (currentWeek >= 4) {
        // Avançar para o próximo mês
        if (currentMonth === 11) {
          setCurrentMonth(0);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }
        // Ir para a primeira semana do próximo mês
        setCurrentWeek(0);
      } else {
        // Avançar uma semana
        setCurrentWeek(currentWeek + 1);
      }
    } else if (viewMode === 'day') {
      // Modo dia - avançar um dia
      const currentDate = new Date(dayViewDate.split('/').reverse().join('-'));
      currentDate.setDate(currentDate.getDate() + 1);
      const newDate = `${currentDate.getDate() < 10 ? '0' + currentDate.getDate() : currentDate.getDate()}/${(currentDate.getMonth() + 1) < 10 ? '0' + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1)}/${currentDate.getFullYear()}`;
      setDayViewDate(newDate);
      setSelectedDate(newDate);
    }
  };

  // Função para lidar com a seleção de datas
  const handleDateClick = (dateString) => {
    if (viewMode === 'month' || viewMode === 'week') {
      if (!isRangeSelection) {
        // Seleção normal de data única
        setSelectedDate(dateString);
        
        // Se estiver no modo mês ou semana, mudar para visualização diária
        setDayViewDate(dateString);
        setViewMode('day');
        return;
      }

      // Seleção de período
      if (!startDate) {
        // Primeira data selecionada
        setStartDate(dateString);
        setEndDate(null);
      } else if (!endDate) {
        // Segunda data selecionada
        // Garantir que a data final seja posterior à inicial
        const start = new Date(startDate.split('/').reverse().join('-'));
        const end = new Date(dateString.split('/').reverse().join('-'));
        
        if (end < start) {
          setEndDate(startDate);
          setStartDate(dateString);
        } else {
          setEndDate(dateString);
        }
      } else {
        // Reiniciar seleção
        setStartDate(dateString);
        setEndDate(null);
      }
    }
  };

  // Verificar se uma data está no intervalo selecionado
  const isDateInRange = (dateString) => {
    if (!startDate || !endDate) return false;
    
    const date = new Date(dateString.split('/').reverse().join('-'));
    const start = new Date(startDate.split('/').reverse().join('-'));
    const end = new Date(endDate.split('/').reverse().join('-'));
    
    return date >= start && date <= end;
  };

  // Verificar se uma data é a data inicial ou final do intervalo
  const isRangeEndpoint = (dateString) => {
    return dateString === startDate || dateString === endDate;
  };
  
  // Verificar se uma data é hoje
  const isToday = (dateString) => {
    const today = new Date();
    const formattedToday = `${today.getDate() < 10 ? '0' + today.getDate() : today.getDate()}/${(today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1)}/${today.getFullYear()}`;
    return dateString === formattedToday;
  };
  
  // Obter o nome do dia da semana
  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr.split('/').reverse().join('-'));
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  };

  // Função para obter a abreviação do dia da semana
  const getDayOfWeekShort = (dateStr) => {
    const date = new Date(dateStr.split('/').reverse().join('-'));
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Cabeçalho com os dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekDaysHeader = weekDays.map(day => (
      <div key={day} className="text-center text-xs font-medium text-gray-700 py-1 bg-gray-100">
        {day}
      </div>
    ));
    
    // Adicionar células vazias para os dias antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border bg-gray-50"></div>);
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${day < 10 ? '0' + day : day}/${(currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1)}/${currentYear}`;
      const formattedDate = new Date(`${currentYear}-${(currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1)}-${day < 10 ? '0' + day : day}`).toISOString().split('T')[0];
      
      // Filtrar eventos para este dia usando start_date
      const dayEvents = events.filter(event => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date).toISOString().split('T')[0];
        return eventDate === formattedDate;
      });
      
      const hasEvents = dayEvents.length > 0;
      const isSelected = selectedDate === dateString;
      const isInRange = isDateInRange(dateString);
      const isEndpoint = isRangeEndpoint(dateString);
      const isTodayDate = isToday(dateString);
      
      let cellClass = "h-12 border relative cursor-pointer ";
      
      if (isEndpoint) {
        cellClass += "bg-purple-500 text-white ";
      } else if (isInRange) {
        cellClass += "bg-purple-100 ";
      } else if (isSelected) {
        cellClass += "bg-purple-200 border-purple-500 ";
      } else if (isTodayDate) {
        cellClass += "bg-blue-100 border-blue-500 border-2 ";
      } else {
        cellClass += "hover:bg-gray-50 ";
      }
      
      days.push(
        <div 
          key={day} 
          className={cellClass}
          onClick={() => handleDateClick(dateString)}
        >
          <div className={`absolute top-1 left-1 text-sm ${isEndpoint ? 'text-white' : ''} ${isTodayDate ? 'font-bold' : ''}`}>{day}</div>
          {hasEvents && (
            <div className="absolute bottom-1 w-full flex justify-center">
              <div className="flex space-x-1">
                {dayEvents.map((event, idx) => {
                  let dotColor;
                  switch(event.type) {
                    case 'couple': dotColor = 'bg-pink-500'; break;
                    case 'work': dotColor = 'bg-blue-500'; break;
                    case 'social': dotColor = 'bg-green-500'; break;
                    case 'health': dotColor = 'bg-red-500'; break;
                    case 'cycle': dotColor = 'bg-purple-500'; break;
                    case 'birthday': dotColor = 'bg-yellow-500'; break;
                    case 'anniversary': dotColor = 'bg-orange-500'; break;
                    case 'holiday': dotColor = 'bg-green-500'; break;
                    case 'meeting': dotColor = 'bg-blue-500'; break;
                    case 'reminder': dotColor = 'bg-indigo-500'; break;
                    case 'task': dotColor = 'bg-teal-500'; break;
                    default: dotColor = 'bg-gray-500';
                  }
                  return <div key={idx} className={`w-2 h-2 rounded-full ${dotColor}`}></div>;
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div>
        <div className="grid grid-cols-7 gap-0">
          {weekDaysHeader}
          {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    if (!dayViewDate) return null;
    
    const dayOfWeek = getDayOfWeek(dayViewDate);
    const formattedDate = new Date(dayViewDate.split('/').reverse().join('-')).toISOString().split('T')[0];
    
    // Filtrar eventos para este dia usando start_date
    const dayEvents = events.filter(event => {
      if (!event.start_date) return false;
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === formattedDate;
    });
    
    // Criar slots de horário para o dia
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeString = `${hour < 10 ? '0' + hour : hour}:00`;
      const eventsAtTime = dayEvents.filter(event => {
        if (!event.time) return false;
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour === hour;
      });
      
      timeSlots.push(
        <div key={`time-${hour}`} className="flex border-b py-2">
          <div className="w-16 text-right pr-2 text-gray-500 text-sm">
            {timeString}
          </div>
          <div className="flex-1 min-h-[40px]">
            {eventsAtTime.map(event => (
              <div 
                key={event.id} 
                className="bg-purple-100 border-l-4 border-purple-500 p-2 mb-1 rounded-r"
                onClick={() => {
                  setEditingEvent(event);
                  setNewEventForm({
                    title: event.title,
                    time: event.time || '',
                    type: event.type || 'event',
                    isMultiDay: event.isMultiDay || false,
                    startDate: event.startDate,
                    endDate: event.endDate
                  });
                  setShowEventForm(true);
                }}
              >
                <div className="font-medium">{event.title}</div>
                {event.location && (
                  <div className="text-xs text-gray-600">{event.location}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button 
              onClick={() => setViewMode('month')}
              className="mr-2 p-1 rounded-full hover:bg-gray-100"
              title="Voltar para o calendário"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">{dayOfWeek}, {dayViewDate}</h2>
          </div>
          <button 
            onClick={() => {
              setNewEventForm({ 
                title: '', 
                time: '', 
                type: 'event',
                isMultiDay: false,
                startDate: dayViewDate.split('/').reverse().join('-')
              });
              setEditingEvent(null);
              setShowEventForm(true);
            }}
            className="flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <Plus size={16} className="mr-1" /> Adicionar
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[600px]">
          {timeSlots}
        </div>
      </div>
    );
  };

  const renderSelectedDateEvents = () => {
    if (viewMode === 'day') return null; // Não mostrar esta seção no modo dia
    if (!selectedDate && !startDate) return null;
    
    let title, eventsToShow;
    
    if (isRangeSelection && startDate) {
      if (endDate) {
        title = `Eventos de ${startDate} até ${endDate}`;
        // Filtrar eventos no intervalo de datas
        eventsToShow = events.filter(event => {
          const eventDate = new Date(event.start_date).toISOString().split('T')[0];
          const start = new Date(startDate.split('/').reverse().join('-'));
          const end = new Date(endDate.split('/').reverse().join('-'));
          return eventDate >= start && eventDate <= end;
        });
      } else {
        title = `Eventos em ${startDate}`;
        eventsToShow = events.filter(event => event.start_date === startDate);
      }
    } else {
      title = `Eventos em ${selectedDate}`;
      eventsToShow = events.filter(event => event.start_date === selectedDate);
    }
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">{title}</h3>
          <button 
            onClick={() => {
              setNewEventForm({ 
                title: '', 
                time: '', 
                type: 'event',
                isMultiDay: isRangeSelection && startDate && endDate
              });
              setEditingEvent(null);
              setShowEventForm(true);
            }}
            className="flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <Plus size={16} className="mr-1" /> Adicionar
          </button>
        </div>
        
        {eventsToShow.length > 0 ? (
          <div className="space-y-2">
            {eventsToShow.map(event => {
              let typeColor, typeBg;
              switch(event.type) {
                case 'couple': 
                  typeColor = 'text-pink-700'; 
                  typeBg = 'bg-pink-100';
                  break;
                case 'work': 
                  typeColor = 'text-blue-700'; 
                  typeBg = 'bg-blue-100';
                  break;
                case 'social': 
                  typeColor = 'text-green-700'; 
                  typeBg = 'bg-green-100';
                  break;
                case 'health': 
                  typeColor = 'text-red-700'; 
                  typeBg = 'bg-red-100';
                  break;
                case 'cycle': 
                  typeColor = 'text-purple-700'; 
                  typeBg = 'bg-purple-100';
                  break;
                default: 
                  typeColor = 'text-gray-700'; 
                  typeBg = 'bg-gray-100';
              }
              
              return (
                <div key={event.id} className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      {event.time && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock size={14} className="mr-1" /> {event.time}
                        </div>
                      )}
                      {event.isMultiDay && (
                        <div className="text-sm text-gray-500 mt-1">
                          {event.startDate} até {event.endDate}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => {
                          setEditingEvent(event);
                          setNewEventForm({
                            title: event.title,
                            time: event.time || '',
                            type: event.type || 'event',
                            isMultiDay: event.isMultiDay || false,
                            startDate: event.startDate,
                            endDate: event.endDate
                          });
                          setShowEventForm(true);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={`text-xs ${typeColor} ${typeBg} inline-block px-2 py-1 rounded mt-2`}>
                    {event.type === 'couple' ? 'Casal' : 
                     event.type === 'work' ? 'Trabalho' : 
                     event.type === 'social' ? 'Social' : 
                     event.type === 'health' ? 'Saúde' : 
                     event.type === 'cycle' ? 'Ciclo' : 'Evento'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Nenhum evento encontrado.</div>
        )}
      </div>
    );
  };

  const renderEventForm = () => {
    if (!showEventForm) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
            <button onClick={() => setShowEventForm(false)}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddEvent();
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Título</label>
                <input 
                  type="text" 
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({...newEventForm, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Título do evento"
                  required
                />
              </div>
              
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isMultiDay"
                  checked={newEventForm.isMultiDay}
                  onChange={(e) => setNewEventForm({...newEventForm, isMultiDay: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isMultiDay" className="text-sm text-gray-600">
                  Evento de múltiplos dias
                </label>
              </div>
              
              {newEventForm.isMultiDay ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Data de Início</label>
                    <input 
                      type="date" 
                      value={newEventForm.startDate || (startDate ? startDate.split('/').reverse().join('-') : '') || (dayViewDate ? dayViewDate.split('/').reverse().join('-') : '')}
                      onChange={(e) => setNewEventForm({...newEventForm, startDate: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Data de Término</label>
                    <input 
                      type="date" 
                      value={newEventForm.endDate || (endDate ? endDate.split('/').reverse().join('-') : '') || (dayViewDate ? dayViewDate.split('/').reverse().join('-') : '')}
                      onChange={(e) => setNewEventForm({...newEventForm, endDate: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Horário (opcional)</label>
                  <input 
                    type="time" 
                    value={newEventForm.time}
                    onChange={(e) => setNewEventForm({...newEventForm, time: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                <select 
                  value={newEventForm.type}
                  onChange={(e) => setNewEventForm({...newEventForm, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="event">Evento</option>
                  <option value="birthday">Aniversário</option>
                  <option value="anniversary">Aniversário de Relacionamento</option>
                  <option value="holiday">Feriado</option>
                  <option value="meeting">Reunião</option>
                  <option value="reminder">Lembrete</option>
                  <option value="task">Tarefa</option>
                  <option value="cycle">Ciclo</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md"
                >
                  {editingEvent ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Função para renderizar o calendário semanal
  const renderWeekView = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const days = [];
    
    // Calcular o primeiro dia da semana atual
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfWeek = new Date(currentYear, currentMonth, 1 + (currentWeek * 7));
    
    // Ajustar para garantir que não ultrapasse o mês
    if (startOfWeek.getMonth() !== currentMonth) {
      return renderCalendar(); // Voltar para a visualização mensal se a semana estiver fora do mês
    }
    
    // Criar os dias da semana
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      // Verificar se o dia ainda está no mês atual
      if (currentDate.getMonth() !== currentMonth) {
        days.push(
          <div key={`empty-week-${i}`} className="h-24 border bg-gray-50 p-2">
            <div className="text-gray-400 text-sm">{currentDate.getDate()}</div>
          </div>
        );
        continue;
      }
      
      const day = currentDate.getDate();
      const dateString = `${day < 10 ? '0' + day : day}/${(currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1)}/${currentYear}`;
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      // Filtrar eventos para este dia
      const dayEvents = events.filter(event => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date).toISOString().split('T')[0];
        return eventDate === formattedDate;
      });
      
      const hasEvents = dayEvents.length > 0;
      const isSelected = selectedDate === dateString;
      const isTodayDate = isToday(dateString);
      const dayOfWeek = getDayOfWeekShort(dateString);
      
      let cellClass = "h-24 border relative p-2 ";
      
      if (isSelected) {
        cellClass += "bg-purple-100 border-purple-500 ";
      } else if (isTodayDate) {
        cellClass += "bg-blue-50 border-blue-500 border-2 ";
      } else {
        cellClass += "hover:bg-gray-50 ";
      }
      
      days.push(
        <div key={`week-day-${i}`} className="flex flex-col">
          <div className="text-center text-xs font-medium text-gray-700 py-1 bg-gray-100">
            {dayOfWeek}
          </div>
          <div 
            className={cellClass}
            onClick={() => handleDateClick(dateString)}
          >
            <div className={`text-sm font-medium ${isTodayDate ? 'text-blue-600' : ''}`}>{day}</div>
            
            {hasEvents && (
              <div className="mt-2 space-y-1">
                {dayEvents.map((event, idx) => {
                  let eventClass;
                  switch(event.type) {
                    case 'couple': eventClass = 'bg-pink-100 text-pink-800 border-pink-200'; break;
                    case 'work': eventClass = 'bg-blue-100 text-blue-800 border-blue-200'; break;
                    case 'social': eventClass = 'bg-green-100 text-green-800 border-green-200'; break;
                    case 'health': eventClass = 'bg-red-100 text-red-800 border-red-200'; break;
                    case 'cycle': eventClass = 'bg-purple-100 text-purple-800 border-purple-200'; break;
                    case 'birthday': eventClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'; break;
                    case 'anniversary': eventClass = 'bg-orange-100 text-orange-800 border-orange-200'; break;
                    case 'holiday': eventClass = 'bg-green-100 text-green-800 border-green-200'; break;
                    case 'meeting': eventClass = 'bg-blue-100 text-blue-800 border-blue-200'; break;
                    case 'reminder': eventClass = 'bg-indigo-100 text-indigo-800 border-indigo-200'; break;
                    case 'task': eventClass = 'bg-teal-100 text-teal-800 border-teal-200'; break;
                    default: eventClass = 'bg-gray-100 text-gray-800 border-gray-200';
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={`text-xs p-1 rounded border ${eventClass} truncate cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                      }}
                    >
                      {event.time && <span className="mr-1">{event.time}</span>}
                      {event.title}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-0">
        {days}
      </div>
    );
  };

  // Função para visualizar um evento
  const handleViewEvent = (event) => {
    setEditingEvent(event);
  };

  return (
    <div className="space-y-4">
      {viewMode === 'day' ? (
        renderDayView()
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">{getMonthName(currentMonth)} {currentYear}</h2>
            <button 
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex justify-between mb-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center text-sm px-3 py-1 rounded-md ${
                  viewMode === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Grid size={16} className="mr-1" />
                Mês
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center text-sm px-3 py-1 rounded-md ${
                  viewMode === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <List size={16} className="mr-1" />
                Semana
              </button>
            </div>
            
            <button
              onClick={() => {
                setIsRangeSelection(!isRangeSelection);
                if (isRangeSelection) {
                  // Limpar seleção de período ao desativar
                  setStartDate(null);
                  setEndDate(null);
                }
              }}
              className={`flex items-center text-sm px-3 py-1 rounded-md ${
                isRangeSelection ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Calendar size={16} className="mr-1" />
              {isRangeSelection ? 'Desativar Período' : 'Selecionar Período'}
            </button>
          </div>
          
          {viewMode === 'week' ? renderWeekView() : renderCalendar()}
        </div>
      )}
      
      {renderSelectedDateEvents()}
      {renderEventForm()}
    </div>
  );
};

export default CalendarPage; 