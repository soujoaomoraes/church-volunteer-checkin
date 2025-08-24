/**
 * Sistema de validação
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const Validation = {
    /**
     * Validate volunteer name
     * @param {string} nome - Name to validate
     * @returns {Object} Validation result
     */
    validateNome(nome) {
        const result = { isValid: true, error: '' };
        
        if (!nome || Utils.isEmpty(nome)) {
            result.isValid = false;
            result.error = 'Nome é obrigatório';
            return result;
        }

        const cleanName = nome.trim();
        
        if (cleanName.length < CONFIG.VALIDATION.NOME_MIN_LENGTH) {
            result.isValid = false;
            result.error = `Nome deve ter pelo menos ${CONFIG.VALIDATION.NOME_MIN_LENGTH} caracteres`;
            return result;
        }

        if (cleanName.length > CONFIG.VALIDATION.NOME_MAX_LENGTH) {
            result.isValid = false;
            result.error = `Nome deve ter no máximo ${CONFIG.VALIDATION.NOME_MAX_LENGTH} caracteres`;
            return result;
        }

        // Check for valid characters (letters, spaces, accents)
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(cleanName)) {
            result.isValid = false;
            result.error = 'Nome deve conter apenas letras e espaços';
            return result;
        }

        return result;
    },

    /**
     * Validate phone number
     * @param {string} telefone - Phone to validate
     * @returns {Object} Validation result
     */
    validateTelefone(telefone) {
        const result = { isValid: true, error: '' };
        
        if (!telefone || Utils.isEmpty(telefone)) {
            result.isValid = false;
            result.error = 'Telefone é obrigatório';
            return result;
        }

        const cleanPhone = Utils.cleanPhone(telefone);
        
        if (cleanPhone.length !== CONFIG.VALIDATION.TELEFONE_LENGTH) {
            result.isValid = false;
            result.error = 'Telefone deve ter 11 dígitos';
            return result;
        }

        if (!CONFIG.VALIDATION.TELEFONE_PATTERN.test(cleanPhone)) {
            result.isValid = false;
            result.error = 'Formato de telefone inválido';
            return result;
        }

        return result;
    },

    /**
     * Validate session selection
     * @param {string} sessao - Session to validate
     * @returns {Object} Validation result
     */
    validateSessao(sessao) {
        const result = { isValid: true, error: '' };
        
        if (!sessao || Utils.isEmpty(sessao)) {
            result.isValid = false;
            result.error = 'Sessão é obrigatória';
            return result;
        }

        if (!CONFIG.SESSOES.includes(sessao)) {
            result.isValid = false;
            result.error = 'Sessão inválida';
            return result;
        }

        return result;
    },

    /**
     * Validate check-in form data
     * @param {Object} formData - Form data to validate
     * @returns {Object} Validation result with field errors
     */
    validateCheckinForm(formData) {
        const result = {
            isValid: true,
            errors: {},
            hasErrors: false
        };

        // Validate name
        const nomeValidation = this.validateNome(formData.nome);
        if (!nomeValidation.isValid) {
            result.errors.nome = nomeValidation.error;
            result.hasErrors = true;
        }

        // Validate phone
        const telefoneValidation = this.validateTelefone(formData.telefone);
        if (!telefoneValidation.isValid) {
            result.errors.telefone = telefoneValidation.error;
            result.hasErrors = true;
        }

        // Validate session
        const sessaoValidation = this.validateSessao(formData.sessao);
        if (!sessaoValidation.isValid) {
            result.errors.sessao = sessaoValidation.error;
            result.hasErrors = true;
        }

        // Validate "Outros" field if selected
        if (formData.itens && formData.itens.includes('Outros')) {
            if (!formData.outrosItens || Utils.isEmpty(formData.outrosItens)) {
                result.errors.outrosItens = 'Descreva os outros itens';
                result.hasErrors = true;
            }
        }

        result.isValid = !result.hasErrors;
        return result;
    },

    /**
     * Validate checkout form data
     * @param {Object} formData - Form data to validate
     * @returns {Object} Validation result
     */
    validateCheckoutForm(formData) {
        const result = {
            isValid: true,
            errors: {},
            hasErrors: false
        };

        // Check if volunteer is selected
        if (!formData.volunteerData) {
            result.errors.volunteer = 'Selecione um voluntário';
            result.hasErrors = true;
        }

        // Check if at least one item is selected for return
        if (!formData.itensDevolvidos || formData.itensDevolvidos.length === 0) {
            result.errors.itens = 'Selecione pelo menos um item para devolução';
            result.hasErrors = true;
        }

        result.isValid = !result.hasErrors;
        return result;
    },

    /**
     * Validate search query
     * @param {string} query - Search query
     * @returns {Object} Validation result
     */
    validateSearchQuery(query) {
        const result = { isValid: true, error: '' };
        
        if (!query || Utils.isEmpty(query)) {
            result.isValid = false;
            result.error = 'Digite um nome para buscar';
            return result;
        }

        if (query.trim().length < 2) {
            result.isValid = false;
            result.error = 'Digite pelo menos 2 caracteres';
            return result;
        }

        return result;
    },

    /**
     * Sanitize and prepare form data for submission
     * @param {Object} formData - Raw form data
     * @returns {Object} Sanitized form data
     */
    sanitizeFormData(formData) {
        const sanitized = {};

        // Sanitize name
        if (formData.nome) {
            sanitized.nome = Utils.sanitizeInput(formData.nome).trim();
        }

        // Clean and format phone
        if (formData.telefone) {
            sanitized.telefone = Utils.cleanPhone(formData.telefone);
        }

        // Sanitize session
        if (formData.sessao) {
            sanitized.sessao = Utils.sanitizeInput(formData.sessao);
        }

        // Handle items array
        if (formData.itens && Array.isArray(formData.itens)) {
            sanitized.itens = formData.itens
                .map(item => Utils.sanitizeInput(item))
                .filter(item => item);
        }

        // Sanitize outros itens
        if (formData.outrosItens) {
            sanitized.outrosItens = Utils.sanitizeInput(formData.outrosItens);
        }

        // Add metadata
        sanitized.timestamp = Utils.getCurrentTimestamp();
        sanitized.data = Utils.formatDate();
        sanitized.hora = Utils.formatTime();

        return sanitized;
    },

    /**
     * Check if form data has changed
     * @param {Object} currentData - Current form data
     * @param {Object} originalData - Original form data
     * @returns {boolean} True if data has changed
     */
    hasFormChanged(currentData, originalData) {
        if (!originalData) return true;

        const keys = ['nome', 'telefone', 'sessao', 'itens', 'outrosItens'];
        
        return keys.some(key => {
            const current = currentData[key];
            const original = originalData[key];
            
            if (Array.isArray(current) && Array.isArray(original)) {
                return JSON.stringify(current.sort()) !== JSON.stringify(original.sort());
            }
            
            return current !== original;
        });
    },

    /**
     * Validate API response
     * @param {Object} response - API response
     * @returns {Object} Validation result
     */
    validateApiResponse(response) {
        const result = { isValid: true, error: '' };

        if (!response) {
            result.isValid = false;
            result.error = 'Resposta vazia do servidor';
            return result;
        }

        if (typeof response !== 'object') {
            result.isValid = false;
            result.error = 'Formato de resposta inválido';
            return result;
        }

        if (!response.hasOwnProperty('success')) {
            result.isValid = false;
            result.error = 'Resposta sem status de sucesso';
            return result;
        }

        if (!response.success && !response.error) {
            result.isValid = false;
            result.error = 'Erro sem mensagem explicativa';
            return result;
        }

        return result;
    },

    /**
     * Validate volunteer data from API
     * @param {Object} volunteerData - Volunteer data
     * @returns {Object} Validation result
     */
    validateVolunteerData(volunteerData) {
        const result = { isValid: true, error: '' };

        if (!volunteerData) {
            result.isValid = false;
            result.error = 'Dados do voluntário não encontrados';
            return result;
        }

        const requiredFields = ['id', 'nome', 'telefone', 'sessao', 'data', 'hora'];
        
        for (const field of requiredFields) {
            if (!volunteerData[field]) {
                result.isValid = false;
                result.error = `Campo obrigatório ausente: ${field}`;
                return result;
            }
        }

        // Validate items array
        if (volunteerData.itens && !Array.isArray(volunteerData.itens)) {
            result.isValid = false;
            result.error = 'Lista de itens inválida';
            return result;
        }

        return result;
    },

    /**
     * Get validation error message for field
     * @param {string} field - Field name
     * @param {Object} errors - Errors object
     * @returns {string} Error message
     */
    getFieldError(field, errors) {
        return errors && errors[field] ? errors[field] : '';
    },

    /**
     * Check if field has error
     * @param {string} field - Field name
     * @param {Object} errors - Errors object
     * @returns {boolean} True if field has error
     */
    hasFieldError(field, errors) {
        return !!(errors && errors[field]);
    }
};

// Make Validation immutable
Object.freeze(Validation);

// Export for use in other modules
window.Validation = Validation;
