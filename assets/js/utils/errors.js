
class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AppError {
  constructor(field, message, value) {
    super(`Erro de validação no campo ${field}: ${message}`, 'VALIDATION_ERROR', {
      field,
      value
    });
  }
}

class DatabaseError extends AppError {
  constructor(operation, originalError) {
    super(`Erro de banco de dados durante a operação: ${operation}`, 'DATABASE_ERROR', {
      operation,
      originalError: originalError.message
    });
  }
}

class BusinessRuleError extends AppError {
  constructor(rule, message) {
    super(message, 'BUSINESS_RULE_ERROR', { rule });
  }
}
