
// Simple assertion function for testing
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

class DatabaseManagerTests {
  constructor() {
    this.logger = new Logger('DatabaseManagerTests');
    this.dbManager = new DatabaseManager(); // Use a separate instance for testing if needed
  }

  async runAll() {
    this.logger.info('🧪 Iniciando testes para o DatabaseManager...');
    try {
      await this.testInit();
      await this.testAddAndGet();
      await this.testUpdate();
      await this.testDelete();
      await this.testGetAll();
      this.logger.info('✅ Todos os testes do DatabaseManager passaram com sucesso!');
      return true;
    } catch (error) {
      this.logger.error('❌ Testes do DatabaseManager falharam', { error });
      return false;
    }
  }

  async testInit() {
    this.logger.debug('Testando inicialização do banco de dados...');
    const db = await this.dbManager.init();
    assert(db, 'O banco de dados deve ser inicializado.');
    assert(db.name === this.dbManager.dbName, 'O nome do banco de dados está incorreto.');
    this.logger.debug('-> Teste de inicialização passou.');
  }

  async testAddAndGet() {
    this.logger.debug('Testando adicionar e buscar item...');
    const testVolunteer = { id: 'test-id-1', nome: 'Voluntário de Teste' };
    
    await this.dbManager.add('volunteers', testVolunteer);
    const result = await this.dbManager.get('volunteers', 'test-id-1');
    
    assert(result, 'O item buscado não deve ser nulo.');
    assert(result.id === testVolunteer.id, 'O ID do item buscado está incorreto.');
    assert(result.nome === testVolunteer.nome, 'O nome do item buscado está incorreto.');
    this.logger.debug('-> Teste de adicionar e buscar passou.');
  }

  async testUpdate() {
    this.logger.debug('Testando atualização de item...');
    const updatedName = 'Voluntário de Teste Atualizado';
    const testVolunteer = { id: 'test-id-1', nome: updatedName };

    await this.dbManager.update('volunteers', testVolunteer);
    const result = await this.dbManager.get('volunteers', 'test-id-1');

    assert(result.nome === updatedName, 'O nome do voluntário não foi atualizado corretamente.');
    this.logger.debug('-> Teste de atualização passou.');
  }

  async testDelete() {
    this.logger.debug('Testando deleção de item...');
    await this.dbManager.delete('volunteers', 'test-id-1');
    const result = await this.dbManager.get('volunteers', 'test-id-1');

    assert(!result, 'O item não foi deletado corretamente e ainda existe.');
    this.logger.debug('-> Teste de deleção passou.');
  }

  async testGetAll() {
    this.logger.debug('Testando buscar todos os itens...');
    // Ensure the store is empty first
    const initialItems = await this.dbManager.getAll('settings');
    for(const item of initialItems) {
        await this.dbManager.delete('settings', item.key);
    }

    const setting1 = { key: 'setting1', value: 'value1' };
    const setting2 = { key: 'setting2', value: 'value2' };

    await this.dbManager.add('settings', setting1);
    await this.dbManager.add('settings', setting2);

    const allSettings = await this.dbManager.getAll('settings');
    assert(Array.isArray(allSettings), 'getAll deveria retornar um array.');
    assert(allSettings.length === 2, 'Deveria haver 2 settings no banco de dados.');

    // Cleanup
    await this.dbManager.delete('settings', 'setting1');
    await this.dbManager.delete('settings', 'setting2');

    this.logger.debug('-> Teste de buscar todos passou.');
  }
}

// Para executar os testes, você poderia ter um runner que chama:
// const tests = new DatabaseManagerTests();
// tests.runAll();
