// Funções de solicitações
const handleAddRequest = async () => {
  setLoading(true);
  
  try {
    // Verificar se o ID do casal existe
    if (!coupleData || !coupleData.id) {
      console.error("Erro: ID do casal não encontrado");
      
      // Tentar buscar os dados do casal novamente
      if (user) {
        console.log('Tentando buscar dados do casal novamente...');
        const { data: coupleInfo } = await database.couples.get(user.id);
        
        if (coupleInfo && coupleInfo.id) {
          console.log('Dados do casal recuperados com sucesso:', coupleInfo);
          setCoupleData(coupleInfo);
          
          // Continuar com a adição da solicitação usando os dados recuperados
          await addRequestWithCoupleData(coupleInfo);
          return;
        } else {
          console.error('Não foi possível recuperar os dados do casal');
          alert('Não foi possível adicionar a solicitação. Verifique se você está em um relacionamento.');
          return;
        }
      } else {
        alert('Você precisa estar logado para adicionar solicitações.');
        return;
      }
    }
    
    // Se temos os dados do casal, adicionar a solicitação
    await addRequestWithCoupleData(coupleData);
  } catch (error) {
    console.error("Erro ao adicionar solicitação:", error);
    alert(`Erro ao adicionar solicitação: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// Funções de hábitos
const handleToggleHabitProgress = async (id) => {
  setLoading(true);
  
  try {
    // Verificar se o ID do casal existe
    if (!coupleData || !coupleData.id) {
      console.error("Erro: ID do casal não encontrado");
      
      // Tentar buscar os dados do casal novamente
      if (user) {
        console.log('Tentando buscar dados do casal novamente...');
        const { data: coupleInfo } = await database.couples.get(user.id);
        
        if (coupleInfo && coupleInfo.id) {
          console.log('Dados do casal recuperados com sucesso:', coupleInfo);
          setCoupleData(coupleInfo);
          
          // Continuar com a alternância do progresso do hábito usando os dados recuperados
          await toggleHabitProgressWithCoupleData(id, coupleInfo);
          return;
        } else {
          console.error('Não foi possível recuperar os dados do casal');
          alert('Não foi possível alternar o progresso do hábito. Verifique se você está em um relacionamento.');
          return;
        }
      } else {
        alert('Você precisa estar logado para alternar o progresso do hábito.');
        return;
      }
    }
    
    // Se temos os dados do casal, alternar o progresso do hábito
    await toggleHabitProgressWithCoupleData(id, coupleData);
  } catch (error) {
    console.error("Erro ao alternar progresso do hábito:", error);
    alert(`Erro ao alternar progresso do hábito: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

const handleDeleteHabit = async (id) => {
  setLoading(true);
  
  try {
    // Verificar se o ID do casal existe
    if (!coupleData || !coupleData.id) {
      console.error("Erro: ID do casal não encontrado");
      
      // Tentar buscar os dados do casal novamente
      if (user) {
        console.log('Tentando buscar dados do casal novamente...');
        const { data: coupleInfo } = await database.couples.get(user.id);
        
        if (coupleInfo && coupleInfo.id) {
          console.log('Dados do casal recuperados com sucesso:', coupleInfo);
          setCoupleData(coupleInfo);
          
          // Continuar com a exclusão do hábito usando os dados recuperados
          await deleteHabitWithCoupleData(id, coupleInfo);
          return;
        } else {
          console.error('Não foi possível recuperar os dados do casal');
          alert('Não foi possível excluir o hábito. Verifique se você está em um relacionamento.');
          return;
        }
      } else {
        alert('Você precisa estar logado para excluir hábitos.');
        return;
      }
    }
    
    // Se temos os dados do casal, excluir o hábito
    await deleteHabitWithCoupleData(id, coupleData);
  } catch (error) {
    console.error("Erro ao excluir hábito:", error);
    alert(`Erro ao excluir hábito: ${error.message}`);
  } finally {
    setLoading(false);
  }
}; 