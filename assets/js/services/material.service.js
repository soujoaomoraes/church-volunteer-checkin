
// Dependências: Logger, dbManager, Validator, Helpers, Custom Errors

class MaterialService {
  constructor() {
    this.logger = new Logger('MaterialService');
    this.MATERIAL_STATES = {
      disponivel: ['emprestado', 'manutencao'],
      emprestado: ['disponivel', 'perdido', 'manutencao'],
      manutencao: ['disponivel'],
      perdido: ['disponivel', 'manutencao']
    };
  }

  async create(data) {
    this.logger.info('Tentando criar novo material...', data);

    const validationResult = Validator.validateMaterial(data);
    if (!validationResult.isValid) {
      this.logger.warn('Falha na validação ao criar material', validationResult.errors);
      const firstError = validationResult.errors[0];
      throw new ValidationError(firstError.field, firstError.messages[0]);
    }

    // Validar unicidade do nome e código
    const allMaterials = await dbManager.getAll('materials');
    if (allMaterials.some(m => m.nome.toLowerCase() === data.nome.toLowerCase())) {
      throw new BusinessRuleError('create_material', `O nome de material '${data.nome}' já existe.`);
    }
    if (data.codigo && allMaterials.some(m => m.codigo && m.codigo.toLowerCase() === data.codigo.toLowerCase())) {
      throw new BusinessRuleError('create_material', `O código de material '${data.codigo}' já existe.`);
    }

    const material = {
      id: Helpers.generateUUID(),
      nome: data.nome.trim(),
      codigo: data.codigo ? data.codigo.trim() : null,
      tipo: data.tipo,
      status: 'disponivel', // Status inicial padrão
      emprestadoPara: null,
      dataEmprestimo: null,
      observacoes: data.observacoes || null,
      dataCadastro: new Date().toISOString(),
      stats: {
        totalEmprestimos: 0,
        ultimoEmprestimo: null
      }
    };

    try {
      await dbManager.add('materials', material);
      this.logger.info('Material criado com sucesso!', { id: material.id });
      return material;
    } catch (error) {
      this.logger.error('Erro de banco de dados ao criar material', { error });
      throw new DatabaseError('create material', error);
    }
  }

  async getAvailable(filters = {}) {
    this.logger.debug('Buscando materiais disponíveis...', { filters });
    const allMaterials = await dbManager.getAll('materials');
    let available = allMaterials.filter(m => m.status === 'disponivel');

    if (filters.tipo) {
      available = available.filter(m => m.tipo === filters.tipo);
    }
    
    return available.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async updateStatus(id, newStatus, metadata = {}) {
    this.logger.info(`Atualizando status do material '${id}' para '${newStatus}'`, metadata);
    const material = await dbManager.get('materials', id);

    if (!material) {
      throw new BusinessRuleError('update_status', 'Material não encontrado.');
    }

    const allowedTransitions = this.MATERIAL_STATES[material.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BusinessRuleError('update_status', `Transição de status de '${material.status}' para '${newStatus}' não é permitida.`);
    }

    material.status = newStatus;
    // Lógica adicional baseada no status
    switch (newStatus) {
      case 'disponivel':
        material.emprestadoPara = null;
        material.dataEmprestimo = null;
        break;
      case 'emprestado':
        if (!metadata.emprestadoPara) {
          throw new BusinessRuleError('update_status', 'É necessário informar para quem o material foi emprestado.');
        }
        material.emprestadoPara = metadata.emprestadoPara;
        material.dataEmprestimo = new Date().toISOString();
        material.stats.totalEmprestimos++;
        material.stats.ultimoEmprestimo = material.dataEmprestimo;
        break;
    }

    try {
      await dbManager.update('materials', material);
      this.logger.info('Status do material atualizado com sucesso!', { id });
      return material;
    } catch (error) {
      this.logger.error('Erro de banco de dados ao atualizar status do material', { error });
      throw new DatabaseError('update material status', error);
    }
  }
  
  async getById(id) {
    this.logger.debug(`Buscando material por ID: ${id}`);
    return await dbManager.get('materials', id);
  }
}
