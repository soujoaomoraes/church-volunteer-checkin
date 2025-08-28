
// Dependências: Logger, dbManager, VolunteerService, MaterialService, Custom Errors

class CheckinService {
  constructor() {
    this.logger = new Logger('CheckinService');
    // Services são usados para buscar dados, não para alterar o estado diretamente dentro do check-in
    this.volunteerService = new VolunteerService();
    this.materialService = new MaterialService();
  }

  /**
   * Processa o check-in de um voluntário com os materiais selecionados.
   * Esta operação é transacional.
   * @param {string} voluntarioId - O ID do voluntário.
   * @param {string[]} materiaisIds - Um array de IDs dos materiais.
   * @param {string} [observacoes] - Observações opcionais.
   * @returns {Promise<string>} O ID da atividade de check-in criada.
   */
  async process(voluntarioId, materiaisIds, observacoes = null) {
    this.logger.info(`Processando check-in para o voluntário ${voluntarioId}...`, { materiaisIds });

    const transaction = dbManager.db.transaction(['volunteers', 'materials', 'activities'], 'readwrite');
    const volunteerStore = transaction.objectStore('volunteers');
    const materialStore = transaction.objectStore('materials');
    const activityStore = transaction.objectStore('activities');

    return new Promise(async (resolve, reject) => {
      try {
        // 1. Validação do Voluntário
        const volunteer = await this.volunteerService.getById(voluntarioId);
        if (!volunteer) {
          throw new BusinessRuleError('checkin', 'Voluntário não encontrado.');
        }
        if (volunteer.checkinAtivo) {
          throw new BusinessRuleError('checkin', `Voluntário '${volunteer.nome}' já possui um check-in ativo.`);
        }

        // 2. Validação dos Materiais
        if (!materiaisIds || materiaisIds.length === 0) {
            throw new BusinessRuleError('checkin', 'Pelo menos um material deve ser selecionado para o check-in.');
        }
        const materials = await Promise.all(materiaisIds.map(id => this.materialService.getById(id)));
        const unavailableMaterials = materials.filter(m => !m || m.status !== 'disponivel');
        if (unavailableMaterials.length > 0) {
          const names = unavailableMaterials.map(m => m ? m.nome : 'ID desconhecido').join(', ');
          throw new BusinessRuleError('checkin', `Os seguintes materiais não estão disponíveis: ${names}.`);
        }

        // 3. Criar a Atividade de Check-in
        const activity = {
          id: Helpers.generateUUID(),
          voluntarioId: volunteer.id,
          voluntarioNome: volunteer.nome,
          tipo: 'checkin',
          dataHora: new Date().toISOString(),
          materiais: materials.map(m => ({ id: m.id, nome: m.nome, status: 'emprestado' })),
          observacoes
        };
        activityStore.add(activity);

        // 4. Atualizar o Voluntário
        volunteer.checkinAtivo = { id: activity.id, dataHora: activity.dataHora, materiais: materiaisIds };
        volunteer.stats.totalCheckins++;
        volunteer.stats.ultimoCheckin = activity.dataHora;
        volunteerStore.put(volunteer);

        // 5. Atualizar os Materiais
        for (const material of materials) {
          material.status = 'emprestado';
          material.emprestadoPara = volunteer.id;
          material.dataEmprestimo = activity.dataHora;
          material.stats.totalEmprestimos++;
          material.stats.ultimoEmprestimo = activity.dataHora;
          materialStore.put(material);
        }

        transaction.oncomplete = () => {
          this.logger.info(`Check-in para '${volunteer.nome}' concluído com sucesso.`, { activityId: activity.id });
          resolve(activity.id);
        };

        transaction.onerror = (event) => {
          this.logger.error('Erro na transação de check-in.', { error: event.target.error });
          reject(new DatabaseError('checkin transaction', event.target.error));
        };

      } catch (error) {
        this.logger.warn('Falha na lógica de negócio do check-in. Abortando transação.', { error: error.message });
        transaction.abort();
        reject(error);
      }
    });
  }
}
