import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Share2, Check, Loader2, Send } from 'lucide-react';

const SettingsPage = ({ setActiveTab }) => {
  const { user, partner, coupleData, logout, signOut } = useAuth();
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    hobbies: ''
  });
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    birth_date: '',
    bio: '',
    hobbies: []
  });
  
  const [coupleSettings, setCoupleSettings] = useState({
    anniversary_reminder: true,
    shared_calendar_enabled: true
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true
  });
  
  const [partnerData, setPartnerData] = useState(null);
  const [localCoupleData, setLocalCoupleData] = useState(null);
  
  const hobbiesOptions = [
    'Leitura', 'Filmes', 'Séries', 'Música', 'Dança', 'Culinária', 
    'Esportes', 'Viagens', 'Fotografia', 'Jogos', 'Arte', 'Meditação',
    'Caminhada', 'Ciclismo', 'Natação', 'Yoga', 'Jardinagem', 'Tecnologia'
  ];
  
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setLoading(false);
        return;
      }
      
      // Garantir que hobbies seja sempre um array
      setProfileData({
        ...profileData,
        hobbies: profileData.hobbies || []
      });
      
      // Buscar dados do casal
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .maybeSingle(); // Usar maybeSingle em vez de single para não gerar erro se não encontrar
      
      if (coupleError) {
        console.error('Erro ao buscar casal:', coupleError);
        setLoading(false);
        return;
      }
      
      setLocalCoupleData(coupleData);
      
      // Se não tiver dados do casal, não buscar dados do parceiro
      if (!coupleData) {
        setLoading(false);
        return;
      }
      
      // Determinar quem é o parceiro
      const partnerId = coupleData.user1_id === user.id 
        ? coupleData.user2_id 
        : coupleData.user1_id;
      
      if (partnerId) {
        await fetchPartnerData(partnerId);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
    }
  };

  const fetchPartnerData = async (partnerId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (error) throw error;
      
      if (data) {
        setPartnerData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do parceiro:', error);
    }
  };
  
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'hobbies') {
        const updatedHobbies = [...(profileData.hobbies || [])];
        if (checked) {
          updatedHobbies.push(value);
        } else {
          const index = updatedHobbies.indexOf(value);
          if (index > -1) {
            updatedHobbies.splice(index, 1);
          }
        }
        setProfileData({
          ...profileData,
          hobbies: updatedHobbies
        });
      } else {
        setProfileData({
          ...profileData,
          [name]: checked
        });
      }
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };
  
  const handleCoupleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setCoupleSettings({
      ...coupleSettings,
      [name]: checked
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  const saveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          birth_date: profileData.birth_date,
          bio: profileData.bio,
          hobbies: profileData.hobbies,
          notification_preferences: notificationSettings
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      if (localCoupleData) {
        const { error: coupleError } = await supabase
          .from('couples')
          .update({
            anniversary_reminder: coupleSettings.anniversary_reminder,
            shared_calendar_enabled: coupleSettings.shared_calendar_enabled
          })
          .eq('id', localCoupleData.id);
        
        if (coupleError) throw coupleError;
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Não foi possível salvar suas configurações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const copyPartnerCode = () => {
    if (localCoupleData?.partner_code) {
      navigator.clipboard.writeText(localCoupleData.partner_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  const sharePartnerCode = () => {
    if (localCoupleData?.partner_code) {
      const shareText = `Olá! Use este código para se conectar comigo no CasalSync: ${localCoupleData.partner_code}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Meu código de parceiro no CasalSync',
          text: shareText,
          url: window.location.origin
        }).catch(err => console.error('Erro ao compartilhar:', err));
      } else {
        // Fallback para navegadores que não suportam a API Web Share
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    }
  };
  
  const sendPartnerInvite = async () => {
    if (!partnerEmail || !localCoupleData?.partner_code) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Enviar email de convite para o parceiro
      const inviteLink = `${window.location.origin}/join?code=${localCoupleData.partner_code}`;
      const { error: inviteError } = await supabase.functions.invoke('send-partner-invite', {
        body: {
          partnerEmail,
          userName: profileData.name || user?.user_metadata?.name || 'Seu parceiro',
          inviteLink,
          partnerCode: localCoupleData.partner_code
        }
      });
      
      if (inviteError) {
        throw inviteError;
      }
      
      setSuccess(true);
      setPartnerEmail('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      setError('Não foi possível enviar o convite. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro, excluir o perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Não podemos excluir o usuário da autenticação diretamente do cliente
      // Em vez disso, vamos apenas fazer logout
      await logout();
      
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setError('Não foi possível excluir sua conta. Tente novamente mais tarde.');
      setLoading(false);
    }
  };
  
  const renderProfileTab = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
          <span className="ml-2 text-gray-600">Carregando dados do perfil...</span>
        </div>
      ) : profileData ? (
        <>
          <div>
            <label className="block text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              name="name"
              value={profileData.name || ''}
              onChange={handleProfileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone || ''}
              onChange={handleProfileChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Data de Nascimento</label>
            <input
              type="date"
              name="birth_date"
              value={profileData.birth_date || ''}
              onChange={handleProfileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Sobre Mim</label>
            <textarea
              name="bio"
              value={profileData.bio || ''}
              onChange={handleProfileChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
              placeholder="Conte um pouco sobre você..."
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Meus Hobbies (selecione até 5)</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {hobbiesOptions.map((hobby) => (
                <div key={hobby} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`hobby-${hobby}`}
                    name="hobbies"
                    value={hobby}
                    checked={profileData.hobbies && profileData.hobbies.includes(hobby)}
                    onChange={handleProfileChange}
                    disabled={profileData.hobbies && !profileData.hobbies.includes(hobby) && profileData.hobbies.length >= 5}
                    className="mr-2"
                  />
                  <label htmlFor={`hobby-${hobby}`} className="text-sm text-gray-700">
                    {hobby}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
          <span className="ml-2 text-gray-600">Carregando dados do perfil...</span>
        </div>
      )}
    </div>
  );
  
  const renderPartnerSection = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Parceiro</h2>
        
        {localCoupleData?.partner_id ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 overflow-hidden">
                {partnerData?.avatar_url ? (
                  <img 
                    src={partnerData.avatar_url} 
                    alt="Avatar do parceiro" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                    <User size={24} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">{partnerData?.name || 'Parceiro'}</h3>
                <p className="text-gray-600">{partnerData?.email || ''}</p>
              </div>
            </div>
            
            {partnerData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p>{partnerData.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de nascimento</p>
                  <p>{partnerData.birth_date ? new Date(partnerData.birth_date).toLocaleDateString() : 'Não informada'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Hobbies</p>
                  <p>{partnerData.hobbies || 'Não informados'}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4">Você ainda não está conectado a um parceiro. Convide seu parceiro para usar o CasalSync!</p>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Seu código de parceiro</h3>
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg flex-1 mr-2 font-mono">
                  {localCoupleData?.partner_code || 'Carregando...'}
                </div>
                <button 
                  onClick={sharePartnerCode}
                  className="bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200"
                  title="Compartilhar código"
                >
                  {copied ? <Check size={20} /> : <Share2 size={20} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Compartilhe este código com seu parceiro para que ele possa se conectar a você.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Enviar convite por email</h3>
              <div className="flex items-center">
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="Email do seu parceiro"
                  className="flex-1 p-2 border rounded-lg mr-2"
                />
                <button
                  onClick={sendPartnerInvite}
                  disabled={loading || !partnerEmail}
                  className={`p-2 rounded-lg ${
                    loading || !partnerEmail
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              {success && (
                <p className="text-green-500 text-sm mt-1">
                  Convite enviado com sucesso!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Configurações do Aplicativo</h3>
        
        <div className="space-y-2 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="shared_calendar_enabled"
              checked={coupleSettings.shared_calendar_enabled}
              onChange={handleCoupleSettingsChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Habilitar calendário compartilhado</span>
          </label>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Notificações</h3>
        
        <div className="space-y-2 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="email"
              checked={notificationSettings.email}
              onChange={handleNotificationChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Receber notificações por email</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="push"
              checked={notificationSettings.push}
              onChange={handleNotificationChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Receber notificações push</span>
          </label>
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Conta</h3>
        
        <div className="space-y-3">
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
          >
            Sair da Conta
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-red-800 text-white py-2 px-4 rounded hover:bg-red-900 transition duration-200"
          >
            Excluir Minha Conta
          </button>
          
          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-800 font-medium mb-3">
                Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteAccount}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-800">Configurações</h1>
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center text-purple-600 hover:text-purple-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Voltar
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeSettingsTab === 'profile' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveSettingsTab('profile')}
          >
            Perfil
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeSettingsTab === 'partner' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveSettingsTab('partner')}
          >
            Parceiro
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeSettingsTab === 'settings' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveSettingsTab('settings')}
          >
            Configurações
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Configurações salvas com sucesso!
                </div>
              )}
              
              {activeSettingsTab === 'profile' && renderProfileTab()}
              {activeSettingsTab === 'partner' && renderPartnerSection()}
              {activeSettingsTab === 'settings' && renderSettingsTab()}
              
              {activeSettingsTab === 'profile' && (
                <div className="mt-6">
                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition duration-200"
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 