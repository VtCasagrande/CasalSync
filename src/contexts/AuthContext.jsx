import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, database, supabase } from '../lib/supabase';

// Criar o contexto
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coupleData, setCoupleData] = useState(null);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Verificando usuário...');
        setLoading(true);
        
        const { data: sessionData } = await auth.getSession();
        console.log('Dados da sessão:', sessionData);
        
        if (sessionData?.session) {
          const { data: userData } = await auth.getCurrentUser();
          console.log('Dados do usuário:', userData);
          
          if (userData?.user) {
            setUser(userData.user);
            
            // Buscar dados do casal
            const { data: coupleInfo, error: coupleError } = await database.couples.get(userData.user.id);
            console.log('Dados do casal:', { coupleInfo, coupleError });
            
            if (coupleInfo) {
              setCoupleData(coupleInfo);
              
              // Determinar quem é o parceiro
              const partnerId = coupleInfo.user1_id === userData.user.id 
                ? coupleInfo.user2_id 
                : coupleInfo.user1_id;
              
              if (partnerId) {
                // Buscar dados do parceiro
                const { data: partnerData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', partnerId)
                  .single();
                
                console.log('Dados do parceiro:', partnerData);
                
                if (partnerData) {
                  setPartner(partnerData);
                }
              }
            } else if (coupleError) {
              console.error('Erro ao buscar dados do casal:', coupleError);
            }
          }
        } else {
          console.log('Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    // Adicionar um timeout para garantir que o loading seja finalizado mesmo em caso de erro
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 segundos de timeout

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: userData } = await auth.getCurrentUser();
          setUser(userData?.user || null);
          
          // Buscar dados do casal quando o usuário faz login
          if (userData?.user) {
            const { data: coupleInfo } = await database.couples.get(userData.user.id);
            setCoupleData(coupleInfo || null);
            
            if (coupleInfo) {
              const partnerId = coupleInfo.user1_id === userData.user.id 
                ? coupleInfo.user2_id 
                : coupleInfo.user1_id;
              
              if (partnerId) {
                const { data: partnerData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', partnerId)
                  .single();
                
                setPartner(partnerData || null);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao processar login:', error);
        } finally {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPartner(null);
        setCoupleData(null);
        setLoading(false);
      }
    });

    checkUser();

    // Limpar listener e timeout ao desmontar
    return () => {
      clearTimeout(timeoutId);
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Função para login
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Tentando fazer login com:', email);
      
      // Limpar qualquer estado anterior
      setUser(null);
      setPartner(null);
      setCoupleData(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Resposta do login:', { data, error });
      
      if (error) {
        console.error('Erro no login:', error);
        return { success: false, error };
      }
      
      if (data?.user) {
        console.log('Login bem-sucedido, usuário:', data.user);
        setUser(data.user);
        
        // Buscar dados do casal
        try {
          const { data: coupleInfo, error: coupleError } = await supabase
            .from('couples')
            .select('*')
            .or(`user1_id.eq.${data.user.id},user2_id.eq.${data.user.id}`)
            .single();
            
          console.log('Dados do casal:', { coupleInfo, coupleError });
          
          if (coupleInfo) {
            setCoupleData(coupleInfo);
            
            // Determinar quem é o parceiro
            const partnerId = coupleInfo.user1_id === data.user.id 
              ? coupleInfo.user2_id 
              : coupleInfo.user1_id;
            
            if (partnerId) {
              // Buscar dados do parceiro
              const { data: partnerData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', partnerId)
                .single();
              
              console.log('Dados do parceiro:', partnerData);
              
              if (partnerData) {
                setPartner(partnerData);
              }
            }
          }
        } catch (fetchError) {
          console.error('Erro ao buscar dados após login:', fetchError);
        }
        
        return { success: true, data };
      }
      
      return { success: false, error: new Error('Usuário não encontrado') };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Função para registrar um novo usuário
  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      
      // Registrar o usuário
      const { data, error } = await auth.signUp(email, password, userData);
      
      if (error) {
        console.error('Erro ao registrar:', error);
        return { success: false, error };
      }
      
      // Gerar código de parceiro único
      const partnerCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      // Só criar o perfil se ele não existir
      if (!existingProfile) {
        // Criar perfil do usuário usando RPC para contornar o RLS
        const { data: profileData, error: profileError } = await supabase.rpc(
          'create_profile',
          {
            user_id: data.user.id,
            user_email: email,
            user_name: userData.name || '',
            user_phone: userData.phone || '',
            user_birth_date: userData.birth_date || null,
            user_type: userData.user_type || 'other'
          }
        );
          
        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          return { success: false, error: profileError };
        }
      }
      
      // Verificar se o casal já existe
      const { data: existingCouple } = await supabase
        .from('couples')
        .select('id')
        .or(`user1_id.eq.${data.user.id},user2_id.eq.${data.user.id}`)
        .single();
      
      // Só criar o casal se ele não existir
      let coupleData = existingCouple;
      if (!existingCouple) {
        // Criar entrada na tabela de casais com RLS desativado
        const { data: newCoupleData, error: coupleError } = await supabase.rpc(
          'create_couple',
          { 
            user_id: data.user.id,
            partner_id: null,
            partner_code: partnerCode,
            relationship_start_date: null,
            status: 'pending'
          }
        );
        
        if (coupleError) {
          console.error('Erro ao criar casal:', coupleError);
          return { success: false, error: coupleError };
        }
        
        coupleData = newCoupleData;
      }
      
      // Se o usuário forneceu um email de parceiro, enviar convite
      if (userData.partner_email && userData.partner_email.trim() !== '') {
        // Enviar email de convite para o parceiro
        const inviteLink = `${window.location.origin}/join?code=${partnerCode}`;
        const { error: inviteError } = await supabase.functions.invoke('send-partner-invite', {
          body: {
            partnerEmail: userData.partner_email,
            userName: userData.name,
            inviteLink,
            partnerCode
          }
        });
        
        if (inviteError) {
          console.error('Erro ao enviar convite:', inviteError);
          // Não falhar o registro se o convite falhar
        }
      }
      
      // Atualizar o estado
      setUser(data.user);
      setCoupleData(coupleData);
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar um código de parceiro único
  const generatePartnerCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // Função para logout
  const logout = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
      // Limpar o estado antes de fazer o logout
      setUser(null);
      setPartner(null);
      setCoupleData(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
      
      console.log('Logout bem-sucedido');
      
      // Garantir que o estado está limpo
      setUser(null);
      setPartner(null);
      setCoupleData(null);
      
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Função para convidar parceiro
  const invitePartner = async (partnerEmail) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      if (!coupleData) {
        throw new Error('Dados do casal não encontrados');
      }
      
      // Verificar se o parceiro já existe
      const { data: partnerData } = await database.users.getByEmail(partnerEmail);
      
      if (partnerData) {
        // Atualizar o casal com o ID do parceiro
        const { data, error } = await database.couples.update(coupleData.id, {
          user2_id: partnerData.id,
          status: 'active'
        });
        
        if (error) throw error;
        
        setCoupleData(data);
        setPartner(partnerData);
        
        return { success: true, data };
      } else {
        // O parceiro ainda não está registrado
        // Aqui você poderia implementar o envio de um convite por email
        return { success: false, error: new Error('Parceiro não encontrado. Convide-o a se registrar.') };
      }
    } catch (error) {
      return { success: false, error };
    }
  };

  // Função auxiliar para criar um novo casal
  const createNewCouple = async (userId, partnerId, status, partnerCode, startDate) => {
    // Validando os inputs
    console.log('Criando novo casal com os seguintes parâmetros:');
    console.log('userId:', userId);
    console.log('partnerId:', partnerId);
    console.log('status:', status);
    console.log('partnerCode:', partnerCode);
    console.log('startDate:', startDate);
    
    // Verificando se o usuário existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Erro ao verificar perfil do usuário:', userError);
    } else {
      console.log('Perfil do usuário encontrado:', userData);
    }
    
    const coupleData = {
      user1_id: userId,
      user2_id: partnerId,
      status: status || 'pending',
      partner_code: partnerCode,
      relationship_start_date: startDate || null
    };
    
    console.log('Dados para inserção do casal:', coupleData);
    
    try {
      const { data: newCouple, error: insertError } = await supabase
        .from('couples')
        .insert(coupleData)
        .select();
        
      console.log('Resposta da inserção do casal:', { newCouple, insertError });
      
      if (insertError) {
        console.error('Erro ao criar casal:', insertError);
        
        // Verificando se já existe um casal para este usuário
        const { data: existingCouple, error: checkError } = await supabase
          .from('couples')
          .select('*')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .single();
          
        if (!checkError && existingCouple) {
          console.log('Casal já existe para este usuário:', existingCouple);
          setCoupleData(existingCouple);
          return existingCouple;
        }
        
        throw insertError;
      } else {
        console.log('Casal criado com sucesso:', newCouple);
        setCoupleData(newCouple[0]);
        return newCouple[0];
      }
    } catch (error) {
      console.error('Erro geral ao criar casal:', error);
      throw error;
    }
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    user,
    partner,
    coupleData,
    loading,
    login,
    register,
    logout,
    invitePartner,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 