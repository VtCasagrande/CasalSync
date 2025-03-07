import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CasalSync from './components/CasalSync';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import initializeAchievements from './lib/initAchievements';
import { applyDatabaseMigrations } from './lib/supabase';

function App() {
  // Inicializar conquistas e aplicar migrações quando o aplicativo é carregado
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('Inicializando aplicativo...');
        
        // Aplicar migrações de banco de dados
        const migrationsResult = await applyDatabaseMigrations();
        console.log('Resultado das migrações:', migrationsResult);
        
        // Inicializar conquistas
        await initializeAchievements();
        
        console.log('Aplicativo inicializado com sucesso!');
      } catch (error) {
        console.error('Erro ao inicializar aplicativo:', error);
      }
    };
    
    initApp();
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <CasalSync />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 