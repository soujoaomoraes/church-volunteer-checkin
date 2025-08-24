/**
 * Check-in Module - Check-in Form Logic
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const CheckIn = {
    // Form state
    formData: {},
    isSubmitting: false,

    /**
     * Initialize check-in functionality
     */
    init() {
        this.setupFormHandlers();
        this.setupRealTimeValidation();
        Utils.log('CheckIn module initialized');
    },

    /**
     * Setup form event handlers
     */
    setupFormHandlers() {
        const form = document.getElementById('checkin-form');
        if (!form) return;

        // Form submission
        form.addEventListener('submit', this.handleSubmit.bind(this));

        // Real-time validation on blur
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });

        // Items checkbox handling
        this.setupItemsHandlers();
    },

    /**
     * Setup items checkboxes handlers
     */
    setupItemsHandlers() {
        const checkboxes = document.querySelectorAll('input[name="itens"]');
        const outrosCheckbox = document.getElementById('outros-checkbox');
        const outrosField = document.getElementById('outros-field');
        const outrosInput = document.getElementById('outros-itens');

        // Handle "Outros" checkbox
        if (outrosCheckbox && outrosField && outrosInput) {
            outrosCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    outrosField.classList.remove('hidden');
                    outrosInput.focus();
                } else {
                    outrosField.classList.add('hidden');
                    outrosInput.value = '';
                }
            });
        }

        // Validate at least one item is selected
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.validateItems.bind(this));
        });

        if (outrosInput) {
            outrosInput.addEventListener('blur', this.validateItems.bind(this));
        }
    },

    /**
     * Setup real-time validation
     */
    setupRealTimeValidation() {
        const nameInput = document.getElementById('checkin-nome');
        const phoneInput = document.getElementById('checkin-telefone');

        // Name validation with debounce
        if (nameInput) {
            const debouncedValidation = Utils.debounce(() => {
                this.validateField({ target: nameInput });
            }, 500);

            nameInput.addEventListener('input', debouncedValidation);
        }

        // Phone formatting and validation
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                // Format phone number
                const formatted = Utils.formatPhone(e.target.value);
                e.target.value = formatted;

                // Validate if complete
                if (formatted.length >= 14) { // (XX) XXXXX-XXXX
                    this.validateField({ target: phoneInput });
                }
            });
        }
    },

    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    async handleSubmit(event) {
        event.preventDefault();

        if (this.isSubmitting) return;

        // Clear previous errors
        UI.clearErrors();

        // Collect form data
        const formData = this.collectFormData();

        // Validate form
        const validation = Validation.validateCheckinForm(formData);
        if (!validation.isValid) {
            UI.showFormErrors(validation.errors);
            this.focusFirstError();
            return;
        }

        this.isSubmitting = true;
        UI.setButtonLoading('checkin-submit', true);

        try {
            // Submit check-in
            const result = await API.submitCheckin(formData);

            if (result.success) {
                // Show success message
                UI.showToast(
                    'Check-in realizado!',
                    `${formData.nome} foi registrado com sucesso.`,
                    'success'
                );

                // Clear form
                this.clearForm();

                // Navigate back to home after delay
                setTimeout(() => {
                    UI.navigateTo('home');
                }, 2000);

                // Vibrate success pattern
                Utils.vibrate([100, 50, 100, 50, 200]);

            } else {
                throw new Error(result.message || 'Erro desconhecido');
            }

        } catch (error) {
            Utils.logError('Check-in submission failed', error);

            let errorMessage = 'Erro interno do servidor';
            
            if (error.message.includes('duplicate')) {
                errorMessage = 'Este voluntário já fez check-in hoje';
            } else if (error.message.includes('network')) {
                errorMessage = 'Erro de conexão. Verifique sua internet.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Tempo limite excedido. Tente novamente.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            UI.showToast('Erro no check-in', errorMessage, 'error');

            // If offline, show offline message
            if (!Utils.isOnline()) {
                UI.showToast(
                    'Modo offline',
                    'Check-in salvo localmente. Será enviado quando voltar online.',
                    'warning'
                );
            }

        } finally {
            this.isSubmitting = false;
            UI.setButtonLoading('checkin-submit', false);
        }
    },

    /**
     * Collect form data
     * @returns {Object} Form data object
     */
    collectFormData() {
        const form = document.getElementById('checkin-form');
        const formData = new FormData(form);
        
        // Get basic fields
        const data = {
            nome: formData.get('nome')?.trim() || '',
            telefone: formData.get('telefone')?.trim() || '',
            sessao: formData.get('sessao') || '',
            itens: [],
            outros: ''
        };

        // Get selected items
        const itemCheckboxes = document.querySelectorAll('input[name="itens"]:checked');
        itemCheckboxes.forEach(checkbox => {
            data.itens.push(checkbox.value);
        });

        // Get "outros" items if specified
        const outrosCheckbox = document.getElementById('outros-checkbox');
        if (outrosCheckbox?.checked) {
            const outrosInput = document.getElementById('outros-itens');
            const outrosValue = outrosInput?.value?.trim();
            if (outrosValue) {
                data.outros = outrosValue;
                data.itens.push(`Outros: ${outrosValue}`);
            }
        }

        // Add metadata
        data.timestamp = new Date().toISOString();
        data.data = Utils.formatDate(new Date());
        data.hora = Utils.formatTime(new Date());

        this.formData = data;
        return data;
    },

    /**
     * Validate individual field
     * @param {Event} event - Blur event
     */
    validateField(event) {
        const field = event.target;
        const fieldName = field.name;
        const value = field.value?.trim();

        let error = null;

        switch (fieldName) {
            case 'nome':
                const nameValidation = Validation.validateVolunteerName(value);
                if (!nameValidation.isValid) {
                    error = nameValidation.error;
                }
                break;

            case 'telefone':
                const phoneValidation = Validation.validatePhone(value);
                if (!phoneValidation.isValid) {
                    error = phoneValidation.error;
                }
                break;

            case 'sessao':
                if (!value) {
                    error = 'Selecione uma sessão';
                }
                break;
        }

        // Show/hide error
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = error || '';
        }

        // Update field styling
        if (error) {
            field.style.borderColor = 'var(--error)';
        } else {
            field.style.borderColor = '';
        }

        return !error;
    },

    /**
     * Clear field error on input
     * @param {Event} event - Input event
     */
    clearFieldError(event) {
        const field = event.target;
        const fieldName = field.name;

        // Clear error message
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }

        // Reset field styling
        field.style.borderColor = '';
    },

    /**
     * Validate items selection
     */
    validateItems() {
        const checkboxes = document.querySelectorAll('input[name="itens"]:checked');
        const outrosCheckbox = document.getElementById('outros-checkbox');
        const outrosInput = document.getElementById('outros-itens');
        const errorElement = document.getElementById('itens-error');

        let hasItems = checkboxes.length > 0;
        let hasValidOutros = true;

        // Check if "outros" is selected but empty
        if (outrosCheckbox?.checked) {
            const outrosValue = outrosInput?.value?.trim();
            if (!outrosValue) {
                hasValidOutros = false;
            }
        }

        let error = null;
        if (!hasItems) {
            error = 'Selecione pelo menos um item';
        } else if (!hasValidOutros) {
            error = 'Especifique os outros itens';
        }

        if (errorElement) {
            errorElement.textContent = error || '';
        }

        // Update outros input styling
        if (outrosInput && outrosCheckbox?.checked) {
            if (!hasValidOutros) {
                outrosInput.style.borderColor = 'var(--error)';
            } else {
                outrosInput.style.borderColor = '';
            }
        }

        return !error;
    },

    /**
     * Focus first field with error
     */
    focusFirstError() {
        const errorElements = document.querySelectorAll('.form-error');
        
        for (const errorElement of errorElements) {
            if (errorElement.textContent.trim()) {
                const fieldName = errorElement.id.replace('-error', '');
                const field = document.getElementById(`checkin-${fieldName}`) || 
                             document.getElementById(fieldName);
                
                if (field) {
                    field.focus();
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
        }
    },

    /**
     * Clear form and reset state
     */
    clearForm() {
        const form = document.getElementById('checkin-form');
        if (form) {
            form.reset();
        }

        // Hide "outros" field
        const outrosField = document.getElementById('outros-field');
        if (outrosField) {
            outrosField.classList.add('hidden');
        }

        // Clear errors
        UI.clearErrors();

        // Reset form data
        this.formData = {};

        // Focus first field
        const nameInput = document.getElementById('checkin-nome');
        if (nameInput) {
            nameInput.focus();
        }
    },

    /**
     * Pre-fill form with volunteer data
     * @param {Object} volunteer - Volunteer data
     */
    prefillForm(volunteer) {
        if (!volunteer) return;

        const nameInput = document.getElementById('checkin-nome');
        const phoneInput = document.getElementById('checkin-telefone');

        if (nameInput && volunteer.nome) {
            nameInput.value = volunteer.nome;
        }

        if (phoneInput && volunteer.telefone) {
            phoneInput.value = Utils.formatPhone(volunteer.telefone);
        }

        // Focus on session selection
        const sessionSelect = document.getElementById('checkin-sessao');
        if (sessionSelect) {
            sessionSelect.focus();
        }
    },

    /**
     * Get current form state
     * @returns {Object} Current form data
     */
    getCurrentFormData() {
        return { ...this.formData };
    },

    /**
     * Check if form has unsaved changes
     * @returns {boolean} Has unsaved changes
     */
    hasUnsavedChanges() {
        const form = document.getElementById('checkin-form');
        if (!form) return false;

        const currentData = this.collectFormData();
        
        // Check if any field has content
        return currentData.nome || 
               currentData.telefone || 
               currentData.sessao || 
               currentData.itens.length > 0;
    },

    /**
     * Show confirmation dialog for unsaved changes
     * @returns {boolean} User confirmed to leave
     */
    confirmLeave() {
        if (!this.hasUnsavedChanges()) return true;

        return confirm(
            'Você tem alterações não salvas. Deseja realmente sair sem fazer o check-in?'
        );
    }
};

// Make CheckIn immutable
Object.freeze(CheckIn);

// Export for use in other modules
window.CheckIn = CheckIn;
