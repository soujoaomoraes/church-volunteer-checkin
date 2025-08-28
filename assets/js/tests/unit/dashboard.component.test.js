
// Dependências: BaseComponent, DashboardComponent, Logger, assert

class DashboardComponentTests {
  constructor() {
    this.logger = new Logger('DashboardComponentTests');
  }

  async runAll() {
    this.logger.info('🧪 Iniciando testes para o DashboardComponent...');
    let success = true;
    try {
      await this.testRender_Success();
      this.logger.info('✅ Todos os testes do DashboardComponent passaram com sucesso!');
    } catch (error) {
      this.logger.error('❌ Testes do DashboardComponent falharam', { error: error.message, stack: error.stack });
      success = false;
    }
    return success;
  }

  async testRender_Success() {
    this.logger.debug('Testando: Renderização do DashboardComponent');
    
    // O container #dashboard-container já existe no test-runner.html
    const component = new DashboardComponent('dashboard-container');
    await component.render();

    const container = document.getElementById('dashboard-container');
    assert(container.innerHTML.trim() !== '', 'O container do dashboard não deveria estar vazio após a renderização.');
    
    const title = container.querySelector('h2');
    assert(title && title.innerText === 'Dashboard', 'O título do dashboard não foi renderizado corretamente.');

    const metricCards = container.querySelectorAll('.metric-card');
    assert(metricCards.length === 3, 'Deveria haver 3 cards de métricas.');

    this.logger.debug('-> Teste de renderização do dashboard passou.');
  }
}
