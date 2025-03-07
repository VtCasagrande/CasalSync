import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Se o usuário já estiver autenticado, redirecionar para a página principal
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = () => {
    // Redirecionar para a página principal após autenticação bem-sucedida
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">CasalSync</h1>
          <p className="text-white text-opacity-80">
            Sincronize sua vida a dois
          </p>
        </div>
        
        <AuthForm onSuccess={handleAuthSuccess} />
        
        <div className="mt-8 text-center text-white text-opacity-70 text-sm">
          <p>
            CasalSync &copy; 2025 - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 