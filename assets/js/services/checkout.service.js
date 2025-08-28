
// Dependências: Logger, dbManager, VolunteerService, MaterialService, Custom Errors

class CheckoutService {
  constructor() {
    this.logger = new Logger('CheckoutService');
    this.volunteerService = new VolunteerService();
    this.CHECKOUT_STATUS_MAP = {
      devolvido: 'disponivel',
      danificado: 'manutencao',
      nao_devolvido: 'perdido'
    };
  }

  /**
   * Processa o checkout de um voluntário.
   * @param {string} voluntarioId - O ID do voluntário.
   * @param {Object} materiaisStatus - Um objeto onde as chaves são IDs de material e os valores são o status de devolução ('devolvido', 'danificado', 'nao_devolvido').
   * @param {string} [observacoes] - Observações gerais do checkout.
   * @returns {Promise<string>} O ID da atividade de checkout criada.
   */
  async process(voluntarioId, materiaisStatus, observacoes = null) {
    this.logger.info(`Processando checkout para o voluntário ${voluntarioId}...`, { materiaisStatus });

    const transaction = dbManager.db.transaction(['volunteers', 'materials', 'activities'], 'readwrite');
    const volunteerStore = transaction.objectStore('volunteers');
    const materialStore = transaction.objectStore('materials');
    const activityStore = transaction.objectStore('activities');

    return new Promise(async (resolve, reject) => {
      try {
        // 1. Validação do Voluntário
        const volunteer = await this.volunteerService.getById(voluntarioId);
        if (!volunteer) {
          throw new BusinessRuleError('checkout', 'Voluntário não encontrado.');
        }
        if (!volunteer.checkinAtivo) {
          throw new BusinessRuleError('checkout', `Voluntário '${volunteer.nome}' não possui um check-in ativo.`);
        }

        // 2. Processamento e Validações Adicionais
        const checkinTime = new Date(volunteer.checkinAtivo.dataHora);
        const checkoutTime = new Date();
        const duracao = Math.round((checkoutTime - checkinTime) / 60000); // em minutos

        const activity = {
          id: Helpers.generateUUID(),
          voluntarioId,
          voluntarioNome: volunteer.nome,
          tipo: 'checkout',
          dataHora: checkoutTime.toISOString(),
          materiais: [],
          observacoes,
          duracao
        };

        const materialsInCheckin = volunteer.checkinAtivo.materiais;
        if (Object.keys(materiaisStatus).length !== materialsInCheckin.length) {
            throw new BusinessRuleError('checkout', 'O status de todos os materiais do check-in deve ser informado.');
        }

        // 3. Atualizar Materiais
        for (const materialId of materialsInCheckin) {
          const statusDevolucao = materiaisStatus[materialId];
          if (!statusDevolucao || !this.CHECKOUT_STATUS_MAP[statusDevolucao]) {
            throw new BusinessRuleError('checkout', `Status de devolução inválido para o material ${materialId}.`);
          }

          const material = await dbManager.get('materials', materialId);
          if (material) {
            material.status = this.CHECKOUT_STATUS_MAP[statusDevolucao];
            material.emprestadoPara = null;
            material.dataEmprestimo = null;
            materialStore.put(material);

            activity.materiais.push({ id: material.id, nome: material.nome, status: statusDevolucao });
          }
        }
        
        // 4. Adicionar Atividade de Checkout
        activityStore.add(activity);

        // 5. Atualizar Voluntário
        volunteer.checkinAtivo = null;
        volunteer.stats.horasServidas += Math.round(duracao / 60);
        volunteerStore.put(volunteer);

        transaction.oncomplete = () => {
          this.logger.info(`Checkout para '${volunteer.nome}' concluído com sucesso.`, { activityId: activity.id });
          resolve(activity.id);
        };

        transaction.onerror = (event) => {
          this.logger.error('Erro na transação de checkout.', { error: event.target.error });
          reject(new DatabaseError('checkout transaction', event.target.error));
        };

      } catch (error) {
        this.logger.warn('Falha na lógica de negócio do checkout. Abortando transação.', { error: error.message });
        transaction.abort();
        reject(error);
      }
    });
  }
}
