import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    // Se o loading do AuthContext terminar, atualize o estado local
    if (!loading) {
      setLocalLoading(false);
    }

    // Timeout de segurança para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      setLocalLoading(false);
      setTimeoutOccurred(true);
      console.log('ProtectedRoute timeout occurred');
    }, 3000); // 3 segundos de timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (localLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Se ocorreu timeout e não temos certeza sobre a autenticação, redirecionar para login
  if (timeoutOccurred && !isAuthenticated) {
    console.log('Redirecionando para login após timeout');
    return <Navigate to="/login" />;
  }

  // Redirecionar para a página de login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Renderizar o conteúdo protegido se estiver autenticado
  return children;
};

export default ProtectedRoute; 