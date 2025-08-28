class CheckoutComponent extends BaseComponent {
  constructor(containerId) {
    super(containerId);
    this.volunteerService = new VolunteerService();
    this.checkoutService = new CheckoutService();
    this.selectedVolunteer = null;
    this.materialStatus = {}; // ex: { materialId: 'devolvido', ... }
  }

  render() {
    this.logger.info('Renderizando o formulário de Checkout...');
    const template = `
      <h2>Checkout de Voluntários</h2>
      <div class="checkout-form">
        <div id="checkout-step-1">
          <div class="form-group">
            <label for="volunteer-checkout-search">Buscar Voluntário Ativo</label>
            <input type="text" id="volunteer-checkout-search" placeholder="Digite o nome do voluntário..." autocomplete="off">
            <div class="search-results" id="checkout-search-results"></div>
          </div>
        </div>
        <div id="checkout-step-2" style="display: none;">
          <div class="selected-volunteer-details"></div>
          <div class="form-group">
            <label>Status de Devolução dos Materiais</label>
            <div class="checkout-materials-list"></div>
          </div>
          <div class="form-actions">
            <button class="btn btn--primary" id="confirm-checkout">Confirmar Checkout</button>
            <button type="button" class="btn btn--secondary" id="cancel-checkout">Cancelar</button>
          </div>
        </div>
      </div>
    `;
    this.container.innerHTML = template;
    this.attachEventListeners();
  }

  attachEventListeners() {
    const searchInput = this.container.querySelector('#volunteer-checkout-search');
    const searchResults = this.container.querySelector('#checkout-search-results');
    const confirmButton = this.container.querySelector('#confirm-checkout');
    const cancelButton = this.container.querySelector('#cancel-checkout');

    // Debounce para a busca
    searchInput.addEventListener('input', Helpers.debounce(async (e) => {
      await this.searchActiveVolunteers(e.target.value);
    }, 300));

    // Selecionar voluntário
    searchResults.addEventListener('click', async (e) => {
      const volunteerDiv = e.target.closest('.volunteer-result-item');
      if (volunteerDiv) {
        const volunteerId = volunteerDiv.dataset.id;
        this.selectedVolunteer = await this.volunteerService.getById(volunteerId);
        this.displayCheckoutDetails();
      }
    });

    // Confirmar checkout
    confirmButton.addEventListener('click', () => this.processCheckout());
    
    // Cancelar e voltar para a busca
    cancelButton.addEventListener('click', () => this.resetToSearch());
  }

  async searchActiveVolunteers(term) {
    const searchResults = this.container.querySelector('#checkout-search-results');
    if (!term || term.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    this.logger.debug(`Buscando voluntários ativos com o termo: ${term}`);
    const activeVolunteers = await this.volunteerService.getActive();
    const filtered = activeVolunteers.filter(v => Helpers.fuzzyMatch(v.nome, term));

    if (filtered.length === 0) {
      searchResults.innerHTML = '<p>Nenhum voluntário ativo encontrado.</p>';
      return;
    }

    searchResults.innerHTML = filtered.map(v => `
      <div class="volunteer-result-item" data-id="${v.id}">
        <p><strong>${v.nome}</strong> (${v.ministerio})</p>
        <small>Check-in em: ${Helpers.formatDateTime(v.checkinAtivo.dataHora)}</small>
      </div>
    `).join('');
  }

  displayCheckoutDetails() {
    this.container.querySelector('#checkout-step-1').style.display = 'none';
    this.container.querySelector('#checkout-step-2').style.display = 'block';

    const detailsDiv = this.container.querySelector('.selected-volunteer-details');
    detailsDiv.innerHTML = `<h3>Voluntário: ${this.selectedVolunteer.nome}</h3>`;

    const materialsListDiv = this.container.querySelector('.checkout-materials-list');
    const materialIds = this.selectedVolunteer.checkinAtivo.materiais;
    
    // Inicializa o status de todos os materiais como 'devolvido'
    this.materialStatus = {};
    materialIds.forEach(id => this.materialStatus[id] = 'devolvido');

    // Busca os nomes dos materiais (poderia ser otimizado)
    Promise.all(materialIds.map(id => dbManager.get('materials', id))).then(materials => {
        materialsListDiv.innerHTML = materials.map(m => `
        <div class="checkout-material-item" data-id="${m.id}">
          <span>${m.nome}</span>
          <div class="status-options">
            <button class="status-btn active" data-status="devolvido">Devolvido</button>
            <button class="status-btn" data-status="danificado">Danificado</button>
            <button class="status-btn" data-status="nao_devolvido">Não Devolvido</button>
          </div>
        </div>
      `).join('');

      // Adiciona event listeners para os botões de status
      materialsListDiv.querySelectorAll('.status-options .status-btn').forEach(btn => {
          btn.addEventListener('click', (e) => this.setMaterialStatus(e));
      });
    });
  }
  
  setMaterialStatus(event) {
      const button = event.target;
      const parent = button.closest('.checkout-material-item');
      const materialId = parent.dataset.id;
      const status = button.dataset.status;

      // Atualiza o estado interno
      this.materialStatus[materialId] = status;

      // Atualiza a UI
      parent.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      this.logger.debug(`Status do material ${materialId} definido para ${status}`);
  }

  async processCheckout() {
    if (!this.selectedVolunteer) {
      alert('Nenhum voluntário selecionado.');
      return;
    }
    
    this.logger.info(`Processando checkout para ${this.selectedVolunteer.nome}...`, this.materialStatus);

    try {
      await this.checkoutService.process(this.selectedVolunteer.id, this.materialStatus);
      alert(`Checkout de ${this.selectedVolunteer.nome} realizado com sucesso!`);
      this.resetToSearch();
    } catch (error) {
      this.logger.error('Falha ao processar o checkout', { error: error.message });
      alert(`Erro: ${error.message}`);
    }
  }

  resetToSearch() {
    this.selectedVolunteer = null;
    this.materialStatus = {};
    this.container.querySelector('#volunteer-checkout-search').value = '';
    this.container.querySelector('#checkout-search-results').innerHTML = '';
    this.container.querySelector('#checkout-step-1').style.display = 'block';
    this.container.querySelector('#checkout-step-2').style.display = 'none';
  }
}