
// Dependências: Logger

class BaseComponent {
  /**
   * @param {string} containerId - O ID do elemento HTML que servirá como container para este componente.
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.logger = new Logger(this.constructor.name);

    if (!this.container) {
      const err = `O container com ID '${containerId}' não foi encontrado no DOM.`;
      this.logger.error(err);
      throw new Error(err);
    }
  }

  /**
   * Renderiza o conteúdo do componente no container. Este método deve ser sobrescrito pelas classes filhas.
   * @param {Object} [data={}] - Dados opcionais para a renderização.
   */
  render(data = {}) {
    this.logger.debug('Renderizando componente...', data);
    // A lógica de renderização específica ficará nas classes filhas.
    this.container.innerHTML = `<h2>${this.constructor.name}</h2><p>Implementar método render()</p>`;
  }

  /**
   * Limpa o conteúdo do container e remove event listeners para prevenir memory leaks.
   */
  destroy() {
    this.logger.debug('Destruindo componente e limpando o container.');
    this.container.innerHTML = '';
    // Lógica adicional de remoção de event listeners pode ser adicionada nas classes filhas.
  }

  show() {
      this.container.style.display = 'block';
  }

  hide() {
      this.container.style.display = 'none';
  }
}
