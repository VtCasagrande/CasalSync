import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

const AuthForm = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationStep, setRegistrationStep] = useState(1);
  const { login, register } = useAuth();
  
  // Estado inicial para o formulário
  const [formData, setFormData] = useState({
    // Dados básicos (Etapa 1)
    email: '',
    password: '',
    confirmPassword: '',
    
    // Dados complementares (Etapa 2)
    name: '',
    phone: '',
    birthDate: '',
    userType: 'man',
    partnerEmail: '',
    relationshipStartDate: '',
    hobbies: [],
    lastPeriodDate: '',
    cycleDuration: 28,
  });

  // Verificar se o email já existe
  const checkEmailExists = async (email) => {
    try {
      // Verificar diretamente na tabela de usuários
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();
      
      // Se encontrou dados, o email já existe
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'hobbies') {
        const updatedHobbies = [...formData.hobbies];
        if (checked) {
          updatedHobbies.push(value);
        } else {
          const index = updatedHobbies.indexOf(value);
          if (index > -1) {
            updatedHobbies.splice(index, 1);
          }
        }
        setFormData({
          ...formData,
          hobbies: updatedHobbies
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else {
      let validatedValue = value;
      
      // Validações específicas por campo
      if (name === 'email') {
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value) && value !== '') {
          setError('Por favor, digite um email válido');
        } else {
          setError(null);
        }
      } else if (name === 'phone') {
        // Formatar telefone
        validatedValue = value.replace(/\D/g, '');
        if (validatedValue.length > 11) {
          validatedValue = validatedValue.substring(0, 11);
        }
        if (validatedValue.length > 0) {
          if (validatedValue.length <= 2) {
            validatedValue = `(${validatedValue}`;
          } else if (validatedValue.length <= 6) {
            validatedValue = `(${validatedValue.substring(0, 2)}) ${validatedValue.substring(2)}`;
          } else if (validatedValue.length <= 10) {
            validatedValue = `(${validatedValue.substring(0, 2)}) ${validatedValue.substring(2, 6)}-${validatedValue.substring(6)}`;
          } else {
            validatedValue = `(${validatedValue.substring(0, 2)}) ${validatedValue.substring(2, 7)}-${validatedValue.substring(7, 11)}`;
          }
        }
      }
      
      setFormData({
        ...formData,
        [name]: validatedValue
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login normal
        const { success, error } = await login(formData.email, formData.password);
        
        if (!success) {
          setError(error?.message || 'Falha no login. Verifique suas credenciais.');
          return;
        }
        
        if (onSuccess) onSuccess();
      } else {
        // Registro em duas etapas
        if (registrationStep === 1) {
          // Validar dados básicos
          if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Por favor, preencha todos os campos');
            return;
          }

          if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
          }

          if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
          }

          // Verificar se o email já existe
          const emailExists = await checkEmailExists(formData.email);
          if (emailExists) {
            setError('Este email já está cadastrado. Por favor, faça login.');
            setIsLogin(true);
            return;
          }

          // Avançar para a próxima etapa
          setRegistrationStep(2);
        } else {
          // Validar dados complementares
          if (!formData.name || !formData.phone || !formData.birthDate) {
            setError('Por favor, preencha todos os campos obrigatórios');
            return;
          }

          // Registrar usuário com todos os dados
          const userData = {
            name: formData.name,
            phone: formData.phone,
            birth_date: formData.birthDate,
            partner_email: formData.partnerEmail,
            user_type: formData.userType,
            relationship_start_date: formData.relationshipStartDate,
            hobbies: formData.hobbies,
            last_period_date: formData.lastPeriodDate,
            cycle_duration: formData.cycleDuration
          };

          const { success, error } = await register(
            formData.email, 
            formData.password,
            userData
          );

          if (!success) {
            setError(error?.message || 'Falha no registro. Tente novamente mais tarde.');
            return;
          }

          if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Ocorreu um erro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Senha</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError(null);
          }}
          className="text-sm text-purple-600 hover:text-purple-500"
        >
          Não tem uma conta? Registre-se
        </button>
      </div>
    </form>
  );

  const renderRegistrationStep1 = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Senha</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        {loading ? 'Verificando...' : 'Continuar'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError(null);
          }}
          className="text-sm text-purple-600 hover:text-purple-500"
        >
          Já tem uma conta? Entre aqui
        </button>
      </div>
    </form>
  );

  const renderRegistrationStep2 = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Telefone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
        <select
          name="userType"
          value={formData.userType}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="man">Homem</option>
          <option value="woman">Mulher</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email do Parceiro(a) (opcional)</label>
        <input
          type="email"
          name="partnerEmail"
          value={formData.partnerEmail}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        {loading ? 'Registrando...' : 'Finalizar Registro'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setRegistrationStep(1)}
          className="text-sm text-purple-600 hover:text-purple-500"
        >
          Voltar
        </button>
      </div>
    </form>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
        {isLogin ? 'Entrar' : `Registro - Etapa ${registrationStep} de 2`}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLogin ? renderLoginForm() : (
        registrationStep === 1 ? renderRegistrationStep1() : renderRegistrationStep2()
      )}
    </div>
  );
};

export default AuthForm; 