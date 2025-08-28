
// Assume que a classe ValidationError está disponível no escopo global

class Validator {
  static volunteerRules = {
    nome: { required: true, minLength: 2, maxLength: 100, pattern: /^[a-zA-ZÀ-ÿ\s]+$/ },
    telefone: { required: false, pattern: /^\d{10,15}$/ },
    ministerio: { required: true, enum: ['louvor', 'recepcao', 'midia', 'infantil', 'limpeza', 'seguranca', 'outro'] }
  };

  static materialRules = {
    nome: { required: true, minLength: 2, maxLength: 50 },
    codigo: { required: false, maxLength: 20 },
    tipo: { required: true, enum: ['cracha', 'radio', 'chave', 'equipamento', 'outro'] }
  };

  static validate(data, rules) {
    const errors = [];
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      const fieldErrors = this._validateField(value, fieldRules, field);
      if (fieldErrors.length > 0) {
        errors.push({ field, messages: fieldErrors });
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static _validateField(value, rules, fieldName) {
    const errors = [];
    const hasValue = value !== null && value !== undefined && value !== '';

    if (rules.required && !hasValue) {
      errors.push('Este campo é obrigatório.');
      return errors; // Se for obrigatório e não tiver valor, não precisa de outras validações
    }

    if (hasValue) {
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`Deve ter no mínimo ${rules.minLength} caracteres.`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Deve ter no máximo ${rules.maxLength} caracteres.`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push('O formato do valor é inválido.');
        }
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`O valor deve ser um dos seguintes: ${rules.enum.join(', ')}.`);
        }
    }

    return errors;
  }

  static validateVolunteer(data) {
    return this.validate(data, this.volunteerRules);
  }

  static validateMaterial(data) {
    return this.validate(data, this.materialRules);
  }
}
