import { supabase } from './supabase';

// Lista de conquistas para inicializar o banco de dados
const achievements = [
  // Conquistas de perfil
  {
    title: 'Perfil Completo',
    description: 'Completou todas as informações do seu perfil',
    points: 20,
    icon: 'user',
    category: 'profile'
  },
  {
    title: 'Foto de Perfil',
    description: 'Adicionou uma foto de perfil',
    points: 10,
    icon: 'image',
    category: 'profile'
  },
  {
    title: 'Casal Conectado',
    description: 'Conectou-se com seu parceiro(a)',
    points: 30,
    icon: 'heart',
    category: 'profile'
  },
  
  // Conquistas de calendário
  {
    title: 'Organizador de Eventos',
    description: 'Adicionou 5 eventos ao calendário',
    points: 15,
    icon: 'calendar',
    category: 'calendar'
  },
  {
    title: 'Planejador Mestre',
    description: 'Adicionou 20 eventos ao calendário',
    points: 30,
    icon: 'calendar',
    category: 'calendar'
  },
  {
    title: 'Datas Importantes',
    description: 'Adicionou aniversário de relacionamento e aniversários pessoais',
    points: 25,
    icon: 'gift',
    category: 'calendar'
  },
  
  // Conquistas de tarefas
  {
    title: 'Iniciante em Tarefas',
    description: 'Completou 5 tarefas',
    points: 15,
    icon: 'check-square',
    category: 'tasks'
  },
  {
    title: 'Mestre das Tarefas',
    description: 'Completou 20 tarefas',
    points: 30,
    icon: 'check-square',
    category: 'tasks'
  },
  {
    title: 'Parceiro Prestativo',
    description: 'Atribuiu 10 tarefas ao seu parceiro(a)',
    points: 20,
    icon: 'users',
    category: 'tasks'
  },
  
  // Conquistas de compras
  {
    title: 'Comprador Iniciante',
    description: 'Adicionou 10 itens à lista de compras',
    points: 15,
    icon: 'shopping-cart',
    category: 'shopping'
  },
  {
    title: 'Comprador Experiente',
    description: 'Completou 20 itens da lista de compras',
    points: 30,
    icon: 'shopping-cart',
    category: 'shopping'
  },
  
  // Conquistas de solicitações
  {
    title: 'Comunicador',
    description: 'Enviou 5 solicitações',
    points: 15,
    icon: 'message-square',
    category: 'requests'
  },
  {
    title: 'Atencioso',
    description: 'Aprovou 10 solicitações do seu parceiro(a)',
    points: 25,
    icon: 'thumbs-up',
    category: 'requests'
  },
  
  // Conquistas de hábitos
  {
    title: 'Criador de Hábitos',
    description: 'Criou 3 hábitos',
    points: 20,
    icon: 'award',
    category: 'habits'
  },
  {
    title: 'Consistente',
    description: 'Manteve um hábito por 7 dias consecutivos',
    points: 30,
    icon: 'trending-up',
    category: 'habits'
  },
  {
    title: 'Disciplinado',
    description: 'Manteve um hábito por 30 dias consecutivos',
    points: 50,
    icon: 'star',
    category: 'habits'
  },
  
  // Conquistas de níveis
  {
    title: 'Nível 5',
    description: 'Alcançou o nível 5',
    points: 50,
    icon: 'award',
    category: 'levels'
  },
  {
    title: 'Nível 10',
    description: 'Alcançou o nível 10',
    points: 100,
    icon: 'award',
    category: 'levels'
  }
];

// Função para inicializar as conquistas no banco de dados
export const initializeAchievements = async () => {
  try {
    console.log('Inicializando conquistas...');
    
    // Verificar se já existem conquistas
    const { data: existingAchievements, error: checkError } = await supabase
      .from('achievements')
      .select('count');
      
    if (checkError) {
      console.error('Erro ao verificar conquistas existentes:', checkError);
      return false;
    }
    
    // Se já existirem conquistas, não fazer nada
    if (existingAchievements && existingAchievements.length > 0 && existingAchievements[0].count > 0) {
      console.log('Conquistas já inicializadas. Total:', existingAchievements[0].count);
      return true;
    }
    
    // Inserir todas as conquistas
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievements);
      
    if (error) {
      console.error('Erro ao inicializar conquistas:', error);
      return false;
    }
    
    console.log('Conquistas inicializadas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar conquistas:', error);
    return false;
  }
};

export default initializeAchievements; 