
class DashboardComponent extends BaseComponent {
  constructor(containerId) {
    super(containerId);
    this.volunteerService = new VolunteerService();
    // Instanciar outros serviços se necessário
  }

  async render() {
    this.logger.info('Renderizando o Dashboard...');
    this.container.innerHTML = `<p>Carregando métricas...</p>`;

    try {
      const metrics = await this.getDashboardMetrics();
      const activeVolunteers = await this.volunteerService.getActive();

      const metricsHTML = `
        <div class="dashboard-metrics">
          <div class="metric-card">
            <h3>${metrics.voluntariosAtivos}</h3>
            <p>Voluntários Ativos</p>
          </div>
          <div class="metric-card">
            <h3>${metrics.materiaisEmprestados}</h3>
            <p>Materiais Emprestados</p>
          </div>
          <div class="metric-card">
            <h3>${metrics.materiaisDisponiveis}</h3>
            <p>Materiais Disponíveis</p>
          </div>
        </div>
      `;

      const volunteersHTML = `
        <div class="dashboard-list">
          <h3>Voluntários Ativos Agora</h3>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ministério</th>
                <th>Check-in desde</th>
              </tr>
            </thead>
            <tbody>
              ${activeVolunteers.map(v => `
                <tr>
                  <td>${v.nome}</td>
                  <td>${v.ministerio}</td>
                  <td>${Helpers.formatDateTime(v.checkinAtivo.dataHora)}</td>
                </tr>
              `).join('') || '<tr><td colspan="3">Nenhum voluntário ativo no momento.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;

      this.container.innerHTML = `
        <h2>Dashboard</h2>
        ${metricsHTML}
        ${volunteersHTML}
      `;
    } catch (error) {
      this.logger.error('Falha ao renderizar o dashboard', { error });
      this.container.innerHTML = `<p class="error">Erro ao carregar o dashboard. Verifique o console.</p>`;
    }
  }

  async getDashboardMetrics() {
    // Esta função é baseada na especificação do FRD
    const allVolunteers = await dbManager.getAll('volunteers');
    const allMaterials = await dbManager.getAll('materials');

    const ativos = allVolunteers.filter(v => v.checkinAtivo !== null);
    const materiaisStatus = allMaterials.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    return {
      voluntariosAtivos: ativos.length,
      materiaisDisponiveis: materiaisStatus.disponivel || 0,
      materiaisEmprestados: materiaisStatus.emprestado || 0,
    };
  }
}
