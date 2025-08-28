class CheckinComponent extends BaseComponent {
  constructor(containerId) {
    super(containerId);
    this.volunteerService = new VolunteerService();
    this.materialService = new MaterialService();
    this.checkinService = new CheckinService();
    this.selectedMaterials = new Set();
  }

  async render() {
    this.logger.info('Renderizando o formulário de Check-in/Registro...');
    const ministerios = Validator.volunteerRules.ministerio.enum;
    const template = `
      <h2>Check-in e Registro de Voluntário</h2>
      <form id="checkin-form">
        <div class="form-group">
          <label for="volunteer-name">Nome Completo*</label>
          <input type="text" id="volunteer-name" required minlength="2" maxlength="100">
        </div>
        <div class="form-group">
          <label for="volunteer-phone">Telefone (Opcional)</label>
          <input type="tel" id="volunteer-phone" maxlength="15">
        </div>
        <div class="form-group">
          <label for="volunteer-ministry">Ministério*</label>
          <select id="volunteer-ministry" required>
            <option value="" disabled selected>Selecione um ministério</option>
            ${ministerios.map(m => `<option value="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Selecionar Materiais*</label>
          <div class="materials-grid" id="materials-grid">
            <p>Carregando materiais...</p>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary" id="confirm-checkin">Confirmar Check-in</button>
        </div>
      </form>
    `;
    this.container.innerHTML = template;
    await this.loadAvailableMaterials();
    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = this.container.querySelector('#checkin-form');
    form.addEventListener('submit', (event) => this.processCheckin(event));

    const materialsGrid = this.container.querySelector('#materials-grid');
    materialsGrid.addEventListener('click', (event) => {
      const item = event.target.closest('.material-item');
      if (item) {
        const materialId = item.dataset.id;
        item.classList.toggle('selected');
        if (this.selectedMaterials.has(materialId)) {
          this.selectedMaterials.delete(materialId);
        } else {
          this.selectedMaterials.add(materialId);
        }
      }
    });
  }

  async loadAvailableMaterials() {
    this.logger.debug('Carregando materiais disponíveis...');
    const materialsGrid = this.container.querySelector('#materials-grid');
    try {
      const availableMaterials = await this.materialService.getAvailable();
      if (availableMaterials.length === 0) {
        materialsGrid.innerHTML = '<p>Nenhum material disponível no momento.</p>';
        return;
      }
      materialsGrid.innerHTML = availableMaterials.map(material => `
        <div class="material-item" data-id="${material.id}">
          <span>${material.nome}</span>
        </div>
      `).join('');
    } catch (error) {
      this.logger.error('Falha ao carregar materiais', { error });
      materialsGrid.innerHTML = '<p class="error">Erro ao carregar materiais.</p>';
    }
  }

  async processCheckin(event) {
    event.preventDefault();
    this.logger.info('Processando check-in e registro...');

    const volunteerData = {
      nome: this.container.querySelector('#volunteer-name').value,
      telefone: this.container.querySelector('#volunteer-phone').value,
      ministerio: this.container.querySelector('#volunteer-ministry').value
    };

    const materialIds = Array.from(this.selectedMaterials);

    // Validação Simples na UI
    if (!volunteerData.nome || !volunteerData.ministerio || materialIds.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios (*) e selecione pelo menos um material.');
      return;
    }

    try {
      // 1. Criar o voluntário
      const newVolunteer = await this.volunteerService.create(volunteerData);
      this.logger.info('Voluntário criado, processando check-in...', { id: newVolunteer.id });

      // 2. Fazer o check-in com o novo ID
      await this.checkinService.process(newVolunteer.id, materialIds);

      alert(`Check-in de ${newVolunteer.nome} realizado com sucesso!`);
      this.resetForm();

    } catch (error) {
      this.logger.error('Falha ao processar o check-in', { error: error.message });
      alert(`Erro: ${error.message}`);
    }
  }

  resetForm() {
    this.container.querySelector('#checkin-form').reset();
    this.selectedMaterials.clear();
    this.container.querySelectorAll('.material-item.selected').forEach(el => el.classList.remove('selected'));
    this.logger.debug('Formulário de check-in resetado.');
  }
}