
class Logger {
  static LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  };

  constructor(module, logLevel = 'DEBUG') {
    this.module = module;
    this.logLevel = Logger.LOG_LEVELS[logLevel];
  }

  _log(level, message, data = {}) {
    // Não logar se o nível do log for menor que o nível da mensagem
    if (this.logLevel < level) {
      return;
    }

    const levelName = Object.keys(Logger.LOG_LEVELS).find(key => Logger.LOG_LEVELS[key] === level);
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${levelName}] [${this.module}] ${message}`;

    if (Object.keys(data).length > 0) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  error(message, data = {}) {
    this._log(Logger.LOG_LEVELS.ERROR, message, data);
    // TODO: Salvar erro no IndexedDB para análise futura
  }

  warn(message, data = {}) {
    this._log(Logger.LOG_LEVELS.WARN, message, data);
  }

  info(message, data = {}) {
    this._log(Logger.LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = {}) {
    this._log(Logger.LOG_LEVELS.DEBUG, message, data);
  }
}
