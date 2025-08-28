// Dependências: Logger, VolunteerService, assert

class VolunteerServiceTests {
  constructor() {
    this.logger = new Logger('VolunteerServiceTests');
    this.volunteerService = new VolunteerService();
  }

  async runAll() {
    this.logger.info('🧪 Iniciando testes para o VolunteerService...');
    try {
      await this.testCreate_ValidData_Success();
      await this.testCreate_InvalidData_ThrowsError();
      await this.testSearch_ExistingName_ReturnsResults();
      await this.testSearch_NonExistingName_ReturnsEmpty();
      await this.testUpdate_Success();
      await this.testGetActive_WithActiveVolunteers_ReturnsFiltered();

      this.logger.info('✅ Todos os testes do VolunteerService passaram com sucesso!');
      return true;
    } catch (error) {
      this.logger.error('❌ Testes do VolunteerService falharam', { error: error.message, stack: error.stack });
      return false;
    } finally {
      // Cleanup: remove any test data
      const allVolunteers = await dbManager.getAll('volunteers');
      for(const vol of allVolunteers) {
          if(vol.id.startsWith('test-vol-')) {
              await dbManager.delete('volunteers', vol.id);
          }
      }
    }
  }

  async testCreate_ValidData_Success() {
    this.logger.debug('Testando: Criar voluntário com dados válidos');
    const validData = { id: 'test-vol-1', nome: 'João Teste Válido', ministerio: 'louvor' };
    
    const result = await this.volunteerService.create(validData);
    
    assert(result, 'O resultado não deve ser nulo.');
    assert(result.id, 'O voluntário criado deve ter um ID.');
    assert(result.nome === validData.nome, 'O nome do voluntário está incorreto.');
    assert(result.ativo === true, 'O voluntário deve ser criado como ativo.');

    const fromDb = await dbManager.get('volunteers', result.id);
    assert(fromDb, 'O voluntário não foi salvo no banco de dados.');
    this.logger.debug('-> Teste de criação com dados válidos passou.');
  }

  async testCreate_InvalidData_ThrowsError() {
    this.logger.debug('Testando: Criar voluntário com dados inválidos');
    const invalidData = { nome: 'J', ministerio: 'louvor' }; // Nome muito curto
    
    try {
      await this.volunteerService.create(invalidData);
      // Se chegou aqui, o teste falhou porque deveria ter lançado um erro
      throw new Error('A criação com dados inválidos deveria ter lançado um ValidationError.');
    } catch (error) {
      assert(error instanceof ValidationError, 'O erro lançado deveria ser um ValidationError.');
      assert(error.details.field === 'nome', 'O erro de validação deveria ser para o campo \'nome\'.');
    }
    this.logger.debug('-> Teste de criação com dados inválidos passou.');
  }

  async testSearch_ExistingName_ReturnsResults() {
    this.logger.debug('Testando: Buscar voluntário com nome existente');
    const volunteer = await this.volunteerService.create({ nome: 'Maria da Busca', ministerio: 'midia' });

    const results = await this.volunteerService.search('Maria');
    assert(results.length > 0, 'A busca deveria retornar resultados.');
    assert(results.some(v => v.id === volunteer.id), 'O voluntário correto não foi encontrado nos resultados.');
    this.logger.debug('-> Teste de busca com nome existente passou.');
  }

  async testSearch_NonExistingName_ReturnsEmpty() {
    this.logger.debug('Testando: Buscar voluntário com nome inexistente');
    const results = await this.volunteerService.search('NomeInexistente123');
    assert(results.length === 0, 'A busca deveria retornar um array vazio.');
    this.logger.debug('-> Teste de busca com nome inexistente passou.');
  }

  async testUpdate_Success() {
    this.logger.debug('Testando: Atualizar dados de um voluntário');
    const volunteer = await this.volunteerService.create({ nome: 'Carlos para Atualizar', ministerio: 'recepcao' });
    const newName = 'Carlos Atualizado';

    await this.volunteerService.update(volunteer.id, { nome: newName });
    const updatedVolunteer = await dbManager.get('volunteers', volunteer.id);

    assert(updatedVolunteer.nome === newName, 'O nome do voluntário não foi atualizado corretamente.');
    this.logger.debug('-> Teste de atualização passou.');
  }

  async testGetActive_WithActiveVolunteers_ReturnsFiltered() {
    this.logger.debug('Testando: Filtrar voluntários ativos');
    const activeVolunteer = await this.volunteerService.create({ nome: 'Voluntário Ativo Teste', ministerio: 'limpeza' });
    // Manually set checkinAtivo for testing purposes
    activeVolunteer.checkinAtivo = { id: 'activity-123', dataHora: new Date().toISOString(), materiais: [] };
    await dbManager.update('volunteers', activeVolunteer);

    const inactiveVolunteer = await this.volunteerService.create({ nome: 'Voluntário Inativo Teste', ministerio: 'seguranca' });

    const activeList = await this.volunteerService.getActive();
    assert(activeList.length > 0, 'A lista de ativos não deveria estar vazia.');
    assert(activeList.some(v => v.id === activeVolunteer.id), 'O voluntário ativo deveria estar na lista.');
    assert(!activeList.some(v => v.id === inactiveVolunteer.id), 'O voluntário inativo não deveria estar na lista.');
    this.logger.debug('-> Teste de filtro de ativos passou.');
  }
}
