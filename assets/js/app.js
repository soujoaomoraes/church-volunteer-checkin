
class App {
  constructor() {
    this.logger = new Logger('App');
    this.routes = {
      '#/': 'dashboard-container',
      '#checkin': 'checkin-container',
      '#checkout': 'checkout-container'
    };
    this.components = {};
  }

  async init() {
    this.logger.info('Iniciando a aplicação...');
    await dbManager.init();

    // Instanciar componentes após o DB estar pronto
    this.components['dashboard-container'] = new DashboardComponent('dashboard-container');
    this.components['checkin-container'] = new CheckinComponent('checkin-container');
    this.components['checkout-container'] = new CheckoutComponent('checkout-container');

    window.addEventListener('hashchange', () => this.router());
    this.router(); // Lidar com a rota inicial
    this.logger.info('Aplicação iniciada e roteador configurado.');
  }

  router() {
    const path = window.location.hash || '#/';
    this.logger.debug(`Navegando para a rota: ${path}`);

    const targetContainerId = this.routes[path];

    // Esconder todos os containers
    Object.values(this.routes).forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) container.style.display = 'none';
    });

    if (targetContainerId) {
      const targetContainer = document.getElementById(targetContainerId);
      const component = this.components[targetContainerId];
      
      if (targetContainer && component) {
        targetContainer.style.display = 'block';
        component.render(); // Renderiza o componente sempre que a rota é ativada
        this.logger.info(`Componente '${component.constructor.name}' renderizado no container '${targetContainerId}'.`);
      } else {
        this.logger.warn(`Container ou componente não encontrado para a rota: ${path}`);
      }
    } else {
      this.logger.warn(`Nenhuma rota encontrada para: ${path}. Redirecionando para o dashboard.`);
      window.location.hash = '#/';
    }
  }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
