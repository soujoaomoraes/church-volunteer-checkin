
// Dependências: Services, Logger, assert, Custom Errors

class CheckinServiceTests {
  constructor() {
    this.logger = new Logger('CheckinServiceTests');
    this.checkinService = new CheckinService();
    this.volunteerService = new VolunteerService();
    this.materialService = new MaterialService();
  }

  async runAll() {
    this.logger.info('🧪 Iniciando testes para o CheckinService...');
    let success = true;
    try {
      await this.testProcess_Success();
      await this.testProcess_VolunteerAlreadyCheckedIn_ThrowsError();
      await this.testProcess_MaterialNotAvailable_ThrowsError();
      await this.testProcess_NoMaterials_ThrowsError();

      this.logger.info('✅ Todos os testes do CheckinService passaram com sucesso!');
    } catch (error) {
      this.logger.error('❌ Testes do CheckinService falharam', { error: error.message, stack: error.stack });
      success = false;
    } finally {
      // Cleanup: a transação de teste já deve ter sido abortada nos casos de falha
      // mas limpamos quaisquer registros que possam ter persistido.
      await this.cleanupTestData();
    }
    return success;
  }

  async setupTest() {
    await this.cleanupTestData(); // Garante um estado limpo
    const volunteer = await this.volunteerService.create({ nome: 'Voluntário de Check-in', ministerio: 'midia' });
    const material1 = await this.materialService.create({ nome: 'Rádio de Check-in', tipo: 'radio' });
    const material2 = await this.materialService.create({ nome: 'Crachá de Check-in', tipo: 'cracha' });
    return { volunteer, material1, material2 };
  }

  async cleanupTestData() {
    const allVols = await dbManager.getAll('volunteers');
    for (const v of allVols) {
      if (v.nome.includes('Check-in')) await dbManager.delete('volunteers', v.id);
    }
    const allMats = await dbManager.getAll('materials');
    for (const m of allMats) {
      if (m.nome.includes('Check-in')) await dbManager.delete('materials', m.id);
    }
    const allActs = await dbManager.getAll('activities');
    for (const a of allActs) {
        if(a.voluntarioNome.includes('Check-in')) await dbManager.delete('activities', a.id);
    }
  }

  async testProcess_Success() {
    this.logger.debug('Testando: Processo de check-in com sucesso');
    const { volunteer, material1, material2 } = await this.setupTest();

    const activityId = await this.checkinService.process(volunteer.id, [material1.id, material2.id]);

    assert(activityId, 'O ID da atividade não foi retornado.');

    // Validar estado do voluntário
    const updatedVol = await this.volunteerService.getById(volunteer.id);
    assert(updatedVol.checkinAtivo, 'O status de check-in do voluntário não foi atualizado.');
    assert(updatedVol.checkinAtivo.id === activityId, 'O ID da atividade no voluntário está incorreto.');

    // Validar estado dos materiais
    const updatedMat1 = await this.materialService.getById(material1.id);
    const updatedMat2 = await this.materialService.getById(material2.id);
    assert(updatedMat1.status === 'emprestado', 'O status do material 1 deveria ser 'emprestado'.');
    assert(updatedMat2.emprestadoPara === volunteer.id, 'O material 2 não foi associado ao voluntário correto.');

    // Validar registro da atividade
    const activity = await dbManager.get('activities', activityId);
    assert(activity, 'O registro da atividade não foi criado.');
    assert(activity.tipo === 'checkin', 'O tipo da atividade deveria ser 'checkin'.');
    assert(activity.materiais.length === 2, 'A atividade não registrou os materiais corretamente.');

    this.logger.debug('-> Teste de sucesso no check-in passou.');
  }

  async testProcess_VolunteerAlreadyCheckedIn_ThrowsError() {
    this.logger.debug('Testando: Erro ao fazer check-in de voluntário já ativo');
    const { volunteer, material1 } = await this.setupTest();
    // Primeiro check-in (válido)
    await this.checkinService.process(volunteer.id, [material1.id]);

    try {
      // Tenta o segundo check-in (inválido)
      await this.checkinService.process(volunteer.id, [material1.id]);
      throw new Error('Deveria ter lançado um BusinessRuleError para voluntário já ativo.');
    } catch (error) {
      assert(error instanceof BusinessRuleError, 'O erro deveria ser um BusinessRuleError.');
    }
    this.logger.debug('-> Teste de erro de voluntário já ativo passou.');
  }

  async testProcess_MaterialNotAvailable_ThrowsError() {
    this.logger.debug('Testando: Erro ao fazer check-in com material indisponível');
    const { volunteer, material1, material2 } = await this.setupTest();
    // Torna um material indisponível
    await this.materialService.updateStatus(material1.id, 'emprestado', { emprestadoPara: 'outro-voluntario' });

    try {
      await this.checkinService.process(volunteer.id, [material1.id, material2.id]);
      throw new Error('Deveria ter lançado um BusinessRuleError para material indisponível.');
    } catch (error) {
      assert(error instanceof BusinessRuleError, 'O erro deveria ser um BusinessRuleError.');
      assert(error.message.includes(material1.nome), 'A mensagem de erro deveria mencionar o material indisponível.');
    }
    this.logger.debug('-> Teste de erro de material indisponível passou.');
  }

  async testProcess_NoMaterials_ThrowsError() {
    this.logger.debug('Testando: Erro ao fazer check-in sem materiais');
    const { volunteer } = await this.setupTest();

    try {
      await this.checkinService.process(volunteer.id, []);
      throw new Error('Deveria ter lançado um BusinessRuleError por falta de materiais.');
    } catch (error) {
      assert(error instanceof BusinessRuleError, 'O erro deveria ser um BusinessRuleError.');
    }
    this.logger.debug('-> Teste de erro de falta de materiais passou.');
  }
}
