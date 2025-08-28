// Dependências: Logger, MaterialService, assert, Custom Errors

class MaterialServiceTests {
  constructor() {
    this.logger = new Logger('MaterialServiceTests');
    this.materialService = new MaterialService();
  }

  async runAll() {
    this.logger.info('🧪 Iniciando testes para o MaterialService...');
    try {
      await this.testCreate_ValidData_Success();
      await this.testCreate_DuplicateName_ThrowsError();
      await this.testCreate_InvalidData_ThrowsError();
      await this.testGetAvailable_ReturnsOnlyAvailable();
      await this.testUpdateStatus_ValidTransition_Success();
      await this.testUpdateStatus_InvalidTransition_ThrowsError();

      this.logger.info('✅ Todos os testes do MaterialService passaram com sucesso!');
      return true;
    } catch (error) {
      this.logger.error('❌ Testes do MaterialService falharam', { error: error.message, stack: error.stack });
      return false;
    } finally {
      // Cleanup
      const allMaterials = await dbManager.getAll('materials');
      for(const mat of allMaterials) {
          if(mat.id.startsWith('test-mat-')) {
              await dbManager.delete('materials', mat.id);
          }
      }
    }
  }

  async testCreate_ValidData_Success() {
    this.logger.debug('Testando: Criar material com dados válidos');
    const validData = { nome: 'Crachá de Teste', tipo: 'cracha' };
    
    const result = await this.materialService.create(validData);
    
    assert(result && result.id, 'O material criado deve ter um ID.');
    assert(result.nome === validData.nome, 'O nome do material está incorreto.');
    assert(result.status === 'disponivel', 'O material deve ser criado com status \'disponivel\'.');

    const fromDb = await dbManager.get('materials', result.id);
    assert(fromDb, 'O material não foi salvo no banco de dados.');
    await dbManager.delete('materials', result.id); // Cleanup
    this.logger.debug('-> Teste de criação com dados válidos passou.');
  }

  async testCreate_DuplicateName_ThrowsError() {
    this.logger.debug('Testando: Criar material com nome duplicado');
    const data = { nome: 'Crachá Duplicado', tipo: 'cracha' };
    const mat1 = await this.materialService.create(data);

    try {
      await this.materialService.create(data); // Tenta criar de novo com mesmo nome
      throw new Error('Deveria ter lançado um BusinessRuleError por nome duplicado.');
    } catch (error) {
      assert(error instanceof BusinessRuleError, 'O erro deveria ser um BusinessRuleError.');
    }
    await dbManager.delete('materials', mat1.id); // Cleanup
    this.logger.debug('-> Teste de nome duplicado passou.');
  }

  async testCreate_InvalidData_ThrowsError() {
    this.logger.debug('Testando: Criar material com dados inválidos');
    const invalidData = { nome: 'Material Inválido' }; // Falta o tipo
    try {
      await this.materialService.create(invalidData);
      throw new Error('Deveria ter lançado um ValidationError.');
    } catch (error) {
      assert(error instanceof ValidationError, 'O erro deveria ser um ValidationError.');
      assert(error.details.field === 'tipo', 'A validação deveria falhar para o campo \'tipo\'.');
    }
    this.logger.debug('-> Teste de criação com dados inválidos passou.');
  }

  async testGetAvailable_ReturnsOnlyAvailable() {
    this.logger.debug('Testando: Buscar apenas materiais disponíveis');
    const availableMat = await this.materialService.create({ id: 'test-mat-1', nome: 'Disponível', tipo: 'chave' });
    const borrowedMat = await this.materialService.create({ id: 'test-mat-2', nome: 'Emprestado', tipo: 'radio' });
    borrowedMat.status = 'emprestado';
    await dbManager.update('materials', borrowedMat);

    const availableList = await this.materialService.getAvailable();
    assert(availableList.length > 0, 'A lista de disponíveis não deveria ser vazia.');
    assert(availableList.some(m => m.id === availableMat.id), 'O material disponível deveria estar na lista.');
    assert(!availableList.some(m => m.id === borrowedMat.id), 'O material emprestado não deveria estar na lista.');
    
    await dbManager.delete('materials', availableMat.id); // Cleanup
    await dbManager.delete('materials', borrowedMat.id); // Cleanup
    this.logger.debug('-> Teste de busca de disponíveis passou.');
  }

  async testUpdateStatus_ValidTransition_Success() {
    this.logger.debug('Testando: Atualizar status com transição válida');
    const material = await this.materialService.create({ id: 'test-mat-3', nome: 'Material para Emprestar', tipo: 'equipamento' });
    const volunteerId = 'vol-123';

    const updatedMaterial = await this.materialService.updateStatus(material.id, 'emprestado', { emprestadoPara: volunteerId });

    assert(updatedMaterial.status === 'emprestado', 'O status não foi atualizado para \'emprestado\'.');
    assert(updatedMaterial.emprestadoPara === volunteerId, 'O material não foi associado ao voluntário correto.');

    await dbManager.delete('materials', material.id); // Cleanup
    this.logger.debug('-> Teste de atualização de status válida passou.');
  }

  async testUpdateStatus_InvalidTransition_ThrowsError() {
    this.logger.debug('Testando: Atualizar status com transição inválida');
    const material = await this.materialService.create({ id: 'test-mat-4', nome: 'Material para Quebrar Regra', tipo: 'outro' });

    try {
      // Tenta uma transição não permitida (disponivel -> perdido)
      await this.materialService.updateStatus(material.id, 'perdido');
      throw new Error('Deveria ter lançado um BusinessRuleError por transição de status inválida.');
    } catch (error) {
      assert(error instanceof BusinessRuleError, 'O erro deveria ser um BusinessRuleError.');
    }

    await dbManager.delete('materials', material.id); // Cleanup
    this.logger.debug('-> Teste de atualização de status inválida passou.');
  }
}
