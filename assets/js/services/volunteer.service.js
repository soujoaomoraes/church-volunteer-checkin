
// Dependências: Logger, dbManager, Validator, Helpers, ValidationError
// Assumindo que estão disponíveis no escopo global por enquanto.

class VolunteerService {
  constructor() {
    this.logger = new Logger('VolunteerService');
    // dbManager é uma instância global
  }

  async create(data) {
    this.logger.info('Tentando criar novo voluntário...', data);

    const validationResult = Validator.validateVolunteer(data);
    if (!validationResult.isValid) {
      this.logger.warn('Falha na validação ao criar voluntário', validationResult.errors);
      // Lança o primeiro erro encontrado para simplificar
      const firstError = validationResult.errors[0];
      throw new ValidationError(firstError.field, firstError.messages[0]);
    }

    const volunteer = {
      id: Helpers.generateUUID(),
      nome: data.nome.trim(),
      telefone: data.telefone ? data.telefone.trim() : null,
      ministerio: data.ministerio,
      ativo: true,
      dataCadastro: new Date().toISOString(),
      checkinAtivo: null,
      stats: {
        totalCheckins: 0,
        horasServidas: 0,
        ultimoCheckin: null
      }
    };

    try {
      await dbManager.add('volunteers', volunteer);
      this.logger.info('Voluntário criado com sucesso!', { id: volunteer.id });
      return volunteer;
    } catch (error) {
      this.logger.error('Erro de banco de dados ao criar voluntário', { error });
      throw new DatabaseError('create volunteer', error);
    }
  }

  async search(term) {
    this.logger.debug(`Buscando voluntários com o termo: "${term}"`);
    if (!term || term.length < 2) {
      return [];
    }
    
    const allVolunteers = await dbManager.getAll('volunteers');
    // Usando o fuzzyMatch dos Helpers para uma busca mais flexível
    const filtered = allVolunteers.filter(v => Helpers.fuzzyMatch(v.nome, term));
    
    return filtered.slice(0, 10); // Limita a 10 resultados
  }

  async getActive() {
    this.logger.debug('Buscando voluntários com check-in ativo...');
    const allVolunteers = await dbManager.getAll('volunteers');
    return allVolunteers.filter(v => v.checkinAtivo !== null);
  }

  async update(id, updates) {
    this.logger.info(`Atualizando voluntário...`, { id, updates });
    const existingVolunteer = await dbManager.get('volunteers', id);
    if (!existingVolunteer) {
      throw new BusinessRuleError('update_volunteer', 'Voluntário não encontrado.');
    }

    // TODO: Adicionar validação para os campos de `updates`

    const updatedVolunteer = { ...existingVolunteer, ...updates };
    
    try {
      await dbManager.update('volunteers', updatedVolunteer);
      this.logger.info('Voluntário atualizado com sucesso!', { id });
      return updatedVolunteer;
    } catch (error) {
      this.logger.error('Erro de banco de dados ao atualizar voluntário', { error });
      throw new DatabaseError('update volunteer', error);
    }
  }
  
  async getById(id) {
    this.logger.debug(`Buscando voluntário por ID: ${id}`);
    return await dbManager.get('volunteers', id);
  }
}
