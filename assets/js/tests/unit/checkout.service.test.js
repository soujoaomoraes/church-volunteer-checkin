// Dependências: Services, Logger, assert, Custom Errors

class CheckoutServiceTests {
  constructor() {
    this.logger = new Logger('CheckoutServiceTests');
    this.checkinService = new CheckinService();
    this.checkoutService = new CheckoutService();
    this.volunteerService = new VolunteerService();
    this.materialService = new MaterialService();
  }

  async runAll() {
    this.logger.info('🧪 Iniciando testes para o CheckoutService...');
    let success = true;
    try {
      await this.testProcess_Success();
      await this.testProcess_VolunteerNotCheckedIn_ThrowsError();
      await this.testProcess_MissingMaterialStatus_ThrowsError();

      this.logger.info('✅ Todos os testes do CheckoutService passaram com sucesso!');
    } catch (error) {
      this.logger.error('❌ Testes do CheckoutService falharam', { error: error.message, stack: error.stack });
      success = false;
    } finally {
      await this.cleanupTestData();
    }
    return success;
  }

  async setupCheckedInVolunteer() {
    await this.cleanupTestData();
    const volunteer = await this.volunteerService.create({ nome: 'Voluntário de Checkout', ministerio: 'seguranca' });
    const material1 = await this.materialService.create({ nome: 'Chave de Checkout', tipo: 'chave' });
    const material2 = await this.materialService.create({ nome: 'Rádio de Checkout', tipo: 'radio' });

    await this.checkinService.process(volunteer.id, [material1.id, material2.id]);
    
    return { volunteer, material1, material2 };
  }

  async cleanupTestData() {
    const allVols = await dbManager.getAll('volunteers');
    for (const v of allVols) {
      if (v.nome.includes('Checkout')) await dbManager.delete('volunteers', v.id);
    }
    const allMats = await dbManager.getAll('materials');
    for (const m of allMats) {
      if (m.nome.includes('Checkout')) await dbManager.delete('materials', m.id);
    }
     const allActs = await dbManager.getAll('activities');
    for (const a of allActs) {
        if(a.voluntarioNome.includes('Checkout')) await dbManager.delete('activities', a.id);
    }
  }

  async testProcess_Success() {
    this.logger.debug('Testando: Processo de checkout com sucesso');
    const { volunteer, material1, material2 } = await this.setupCheckedInVolunteer();

    const checkoutStatus = {
      [material1.id]: 'devolvido',
      [material2.id]: 'danificado'
    };

    const activityId = await this.checkoutService.process(volunteer.id, checkoutStatus);
    assert(activityId, 'O ID da atividade de checkout não foi retornado.');

    // Validar estado do voluntário
    const updatedVol = await this.volunteerService.getById(volunteer.id);
    assert(updatedVol.checkinAtivo === null, 'O voluntário ainda está com check-in ativo.');

    // Validar estado dos materiais
    const updatedMat1 = await this.materialService.getById(material1.id);
    const updatedMat2 = await this.materialService.getById(material2.id);
    assert(updatedMat1.status === 'disponivel', 'O status do material 1 deveria ser \'disponivel\'.');
    assert(updatedMat2.status === 'manutencao', 'O status do material 2 deveria ser \'manutencao\'.');

    // Validar atividade
    const activity = await dbManager.get('activities', activityId);
    assert(activity && activity.tipo === 'checkout', 'A atividade de checkout não foi criada corretamente.');
    assert(activity.duracao >= 0, 'A duração do serviço não foi calculada.');

    this.logger.debug('-> Teste de sucesso no checkout passou.');
  }

  async testProcess_VolunteerNotCheckedIn_ThrowsError() {
    this.logger.debug('Testando: Erro ao fazer checkout de voluntário inativo');
    // Cria um voluntário mas não faz o check-in
    const volunteer = await this.volunteerService.create({ nome: 'Voluntário de Checkout Inativo', ministerio: 'limpeza' });

    try {
      await this.checkoutService.process(volunteer.id, {});
      throw new Error('Deveria ter lançado um BusinessRuleError para voluntário sem check-in.');
    } catch (error) {
      assert(error instanceof BusinessRuleError, 'O erro deveria ser um BusinessRuleError.');
    }
    this.logger.debug('-> Teste de erro de voluntário inativo passou.');
  }

  async testProcess_MissingMaterialStatus_ThrowsError() {
    this.logger.debug('Testando: Erro ao fazer checkout sem status para todos os materiais');
    const { volunteer, material1 } = await this.setupCheckedInVolunteer();

    const incompleteStatus = { [material1.id]: 'devolvido' }; // Falta o status do material2

    try {
      await this.checkoutService.process(volunteer.id, incompleteStatus);
      throw new Error('Deveria ter lançado um BusinessRuleError por falta de status de material.');
    } catch (error) {
      assert(error instanceof BusinessRuleError, 'O erro deveria ser um BusinessRuleError.');
    }
    this.logger.debug('-> Teste de erro de falta de status de material passou.');
  }
}
