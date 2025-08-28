
// O Logger é uma dependência, mas como não estamos usando módulos ainda,
// vamos assumir que ele está disponível no escopo global.

class DatabaseManager {
  constructor() {
    this.dbName = 'PazChurchVolunteers';
    this.dbVersion = 1;
    this.db = null;
    this.logger = new Logger('DatabaseManager');
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.logger.info(`Iniciando banco de dados '${this.dbName}' v${this.dbVersion}...`);

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        this.logger.info('Atualização do banco de dados necessária. Criando object stores...');
        this.createObjectStores(this.db);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.logger.info('Banco de dados inicializado com sucesso.');
        resolve(this.db);
      };

      request.onerror = (event) => {
        this.logger.error('Falha na inicialização do banco de dados.', { error: event.target.error });
        reject(event.target.error);
      };
    });
  }

  createObjectStores(db) {
    const stores = {
      volunteers: { keyPath: 'id', indexes: ['nome', 'ministerio', 'ativo'] },
      materials: { keyPath: 'id', indexes: ['nome', 'tipo', 'status', 'emprestadoPara'] },
      activities: { keyPath: 'id', indexes: ['voluntarioId', 'tipo', 'dataHora'] },
      settings: { keyPath: 'key' },
      errorLogs: { keyPath: 'id' },
      auditLogs: { keyPath: 'id', indexes: ['entityType', 'entityId'] },
      analytics: { keyPath: 'id' },
    };

    for (const [storeName, config] of Object.entries(stores)) {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
        if (config.indexes) {
          config.indexes.forEach(indexName => {
            store.createIndex(indexName, indexName, { unique: false });
          });
        }
        this.logger.info(`Object store '${storeName}' criada.`);
      }
    }
  }

  async _getStore(storeName, mode = 'readonly') {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async add(storeName, item) {
    const store = await this._getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        this.logger.error(`Erro ao adicionar item em '${storeName}'`, { error: event.target.error });
        reject(event.target.error);
      };
    });
  }

  async get(storeName, key) {
    const store = await this._getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        this.logger.error(`Erro ao buscar item em '${storeName}'`, { error: event.target.error });
        reject(event.target.error);
      };
    });
  }

  async getAll(storeName) {
    const store = await this._getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        this.logger.error(`Erro ao buscar todos os itens em '${storeName}'`, { error: event.target.error });
        reject(event.target.error);
      };
    });
  }

  async update(storeName, item) {
    const store = await this._getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        this.logger.error(`Erro ao atualizar item em '${storeName}'`, { error: event.target.error });
        reject(event.target.error);
      };
    });
  }

  async delete(storeName, key) {
    const store = await this._getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        this.logger.error(`Erro ao deletar item em '${storeName}'`, { error: event.target.error });
        reject(event.target.error);
      };
    });
  }
}

// Instância global para ser acessada por outros scripts
const dbManager = new DatabaseManager();
