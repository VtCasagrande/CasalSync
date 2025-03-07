import React from 'react';
import { Plus, Check, X, MessageSquare, AlertCircle, Edit, Trash, Calendar } from 'lucide-react';

const RequestsPage = ({ 
  requests, 
  handleAddRequest, 
  handleApproveRequest, 
  handleRejectRequest,
  handleConfirmReject,
  showRequestForm,
  setShowRequestForm,
  newRequest,
  setNewRequest,
  showRejectForm,
  setShowRejectForm,
  rejectReason,
  setRejectReason,
  userType,
  user,
  partner,
  handleEditRequest,
  handleSaveRequestEdit,
  handleDeleteRequest,
  editingRequest,
  setEditingRequest,
  showEditRequestForm,
  setShowEditRequestForm
}) => {
  // Filtrar solicitações por status e usuário
  const pendingRequests = requests.filter(req => 
    req.status === 'pending' && req.to_user_id === user?.id
  );
  
  const sentRequests = requests.filter(req => 
    req.from_user_id === user?.id
  );
  
  const approvedRequests = requests.filter(req => 
    req.status === 'approved' && req.to_user_id === user?.id
  );
  
  const rejectedRequests = requests.filter(req => 
    req.status === 'rejected' && req.to_user_id === user?.id
  );

  // Função para formatar a data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Solicitações</h2>
        <button 
          onClick={() => setShowRequestForm(true)}
          className="bg-purple-600 text-white px-3 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Nova Solicitação
        </button>
      </div>
      
      {showRequestForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-medium mb-3">Nova Solicitação</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddRequest();
          }}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={newRequest.title}
                onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Ex: Preciso de ajuda com..."
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Descreva sua solicitação em detalhes..."
                rows="3"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento
              </label>
              <input
                type="datetime-local"
                value={newRequest.dueDate}
                onChange={(e) => setNewRequest({...newRequest, dueDate: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-purple-600 text-white rounded-md"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Formulário de edição de solicitação */}
      {showEditRequestForm && editingRequest && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-medium mb-3">Editar Solicitação</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveRequestEdit();
          }}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={editingRequest.title}
                onChange={(e) => setEditingRequest({...editingRequest, title: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={editingRequest.description}
                onChange={(e) => setEditingRequest({...editingRequest, description: e.target.value})}
                className="w-full p-2 border rounded-md"
                rows="3"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento
              </label>
              <input
                type="datetime-local"
                value={editingRequest.due_date ? new Date(editingRequest.due_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingRequest({...editingRequest, due_date: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                value={editingRequest.priority}
                onChange={(e) => setEditingRequest({...editingRequest, priority: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowEditRequestForm(false)}
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
      
      {/* Modal de rejeição */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="font-medium mb-3">Motivo da Rejeição</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 border rounded-md mb-3"
              placeholder="Por que você está rejeitando esta solicitação?"
              rows="3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-2 bg-red-600 text-white rounded-md"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Solicitações pendentes recebidas */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Solicitações Recebidas</h3>
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{request.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>De: {request.from_user_name || request.from_user_id}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(request.created_at)}</span>
                        {request.due_date && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              Vencimento: {formatDate(request.due_date)}
                            </span>
                          </>
                        )}
                      </div>
                      {request.priority && (
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                          request.priority === 'Alta' ? 'bg-red-100 text-red-700' :
                          request.priority === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {request.priority}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-500 text-white p-2 rounded-full"
                        title="Aprovar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-500 text-white p-2 rounded-full"
                        title="Rejeitar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma solicitação pendente.</p>
          )}
        </div>
        
        {/* Solicitações enviadas */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Solicitações Enviadas</h3>
          {sentRequests.length > 0 ? (
            <div className="space-y-3">
              {sentRequests.map(request => (
                <div key={request.id} className="bg-white rounded-lg shadow p-4">
                  <div>
                    <div className="flex justify-between">
                      <h4 className="font-medium">{request.title}</h4>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-700' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {request.status === 'approved' ? 'Aprovada' :
                           request.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                        </span>
                        {request.status === 'pending' && (
                          <div className="flex ml-2">
                            <button
                              onClick={() => handleEditRequest(request)}
                              className="text-blue-500 hover:text-blue-700 mr-1"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Excluir"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>Para: {request.to_user_name || request.to_user_id}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(request.created_at)}</span>
                      {request.due_date && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            Vencimento: {formatDate(request.due_date)}
                          </span>
                        </>
                      )}
                    </div>
                    {request.priority && (
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                        request.priority === 'Alta' ? 'bg-red-100 text-red-700' :
                        request.priority === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.priority}
                      </span>
                    )}
                    {request.reject_reason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-md">
                        <p className="text-xs text-red-700">
                          <AlertCircle size={12} className="inline mr-1" />
                          Motivo da rejeição: {request.reject_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma solicitação enviada.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage; 