/**
 * Check-out Module - Check-out Form Logic
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const CheckOut = {
    // Current volunteer data
    currentVolunteer: null,
    isSubmitting: false,
    searchTimeout: null,

    /**
     * Initialize check-out functionality
     */
    init() {
        this.setupSearchHandlers();
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        Utils.log('CheckOut module initialized');
    },

    /**
     * Setup volunteer search handlers
     */
    setupSearchHandlers() {
        const searchInput = document.getElementById('volunteer-search');
        if (!searchInput) return;

        // Debounced search
        const debouncedSearch = Utils.debounce(this.performSearch.bind(this), 500);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.clearSearch();
                return;
            }

            debouncedSearch(query);
        });

        // Clear search on focus if empty
        searchInput.addEventListener('focus', () => {
            if (!searchInput.value.trim()) {
                this.clearSearch();
            }
        });
    },

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        form.addEventListener('submit', this.handleSubmit.bind(this));

        // Setup return items validation
        this.setupReturnItemsValidation();
    },

    /**
     * Setup return items validation
     */
    setupReturnItemsValidation() {
        // This will be called dynamically when items are populated
        // See populateReturnItems in UI module
    },

    /**
     * Perform volunteer search
     * @param {string} query - Search query
     */
    async performSearch(query) {
        if (!query || query.length < 2) {
            this.clearSearch();
            return;
        }

        // Show loading state
        this.setSearchLoading(true);

        try {
            // Validate search query
            const validation = Validation.validateSearchQuery(query);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Busca voluntário no IndexedDB
            const checkins = await window.IndexedDB.getAllCheckins();
            const volunteer = checkins
                .filter(c => c.type === 'check-in' && c.nome.toLowerCase().includes(query.toLowerCase()))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .find(c => !c.checkoutTimestamp);
            if (volunteer) {
                this.showVolunteerFound({ ...volunteer });
            } else {
                this.showVolunteerNotFound(query);
            }

        } catch (error) {
            Utils.logError('Volunteer search failed', error);
            
            let errorMessage = 'Erro na busca';
            if (error.message.includes('network')) {
                errorMessage = 'Erro de conexão';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Tempo limite excedido';
            } else if (error.message) {
                errorMessage = error.message;
            }

            UI.showToast('Erro na busca', errorMessage, 'error');
            this.clearSearch();

        } finally {
            this.setSearchLoading(false);
        }
    },

    /**
     * Show volunteer found
     * @param {Object} volunteer - Volunteer data
     */
    showVolunteerFound(volunteer) {
        this.currentVolunteer = volunteer;

        // Update volunteer info display
        this.updateVolunteerInfo(volunteer);

        // Show volunteer info section
        const volunteerInfo = document.getElementById('volunteer-info');
        if (volunteerInfo) {
            volunteerInfo.classList.remove('hidden');
        }

        // Populate and show checkout form
        this.populateCheckoutForm(volunteer);

        // Show checkout form
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.classList.remove('hidden');
        }

        Utils.log('Volunteer found', volunteer);
    },

    /**
     * Show volunteer not found
     * @param {string} query - Search query
     */
    showVolunteerNotFound(query) {
        this.clearSearch();
        
        UI.showToast(
            'Voluntário não encontrado',
            `Nenhum voluntário encontrado para "${query}". Verifique se o nome ou telefone estão corretos.`,
            'warning'
        );
    },

    /**
     * Update volunteer info display
     * @param {Object} volunteer - Volunteer data
     */
    updateVolunteerInfo(volunteer) {
        const elements = {
            'volunteer-name': volunteer.nome,
            'volunteer-phone': Utils.formatPhone(volunteer.telefone),
            'volunteer-date': volunteer.data,
            'volunteer-time': volunteer.hora,
            'volunteer-session': volunteer.sessao
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id] || '--';
            }
        });
    },

    /**
     * Populate checkout form with volunteer items
     * @param {Object} volunteer - Volunteer data
     */
    populateCheckoutForm(volunteer) {
        const itemsContainer = document.getElementById('return-items-group');
        if (!itemsContainer) return;

        // Clear existing items
        itemsContainer.innerHTML = '';

        const items = volunteer.itens || [];
        
        if (items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="no-items-message">
                    <p>Este voluntário não possui itens para devolução.</p>
                </div>
            `;
            return;
        }

        // Create checkboxes for each item
        items.forEach((item, index) => {
            const checkboxId = `return-item-${index}`;
            
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" id="${checkboxId}" name="return-items" value="${item}">
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">${item}</span>
            `;

            itemsContainer.appendChild(label);
        });

        // Setup return items handlers
        this.setupReturnItemsHandlers();

        // Store volunteer data in form
        const form = document.getElementById('checkout-form');
        if (form) {
            form.dataset.volunteerData = JSON.stringify(volunteer);
        }
    },

    /**
     * Setup return items change handlers
     */
    setupReturnItemsHandlers() {
        const checkboxes = document.querySelectorAll('input[name="return-items"]');
        const submitBtn = document.getElementById('checkout-submit');
        const warningDiv = document.getElementById('pending-items-warning');
        const warningText = document.getElementById('pending-items-text');

        const updateSubmitState = () => {
            const totalItems = checkboxes.length;
            const selectedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
            const pendingItems = totalItems - selectedItems;

            // Enable/disable submit button
            if (submitBtn) {
                submitBtn.disabled = selectedItems === 0;
            }

            // Show/hide pending items warning
            if (warningDiv && warningText) {
                if (pendingItems > 0 && selectedItems > 0) {
                    warningText.textContent = `${pendingItems} item(ns) permanecerão pendentes de devolução.`;
                    warningDiv.classList.remove('hidden');
                } else {
                    warningDiv.classList.add('hidden');
                }
            }
        };

        // Add change listeners
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSubmitState);
        });

        // Initial state update
        updateSubmitState();
    },

    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    async handleSubmit(event) {
        event.preventDefault();

        if (this.isSubmitting || !this.currentVolunteer) return;

        // Collect form data
        const formData = this.collectFormData();

        // Validate form
        const validation = Validation.validateCheckoutForm(formData);
        if (!validation.isValid) {
            UI.showFormErrors(validation.errors);
            return;
        }

        this.isSubmitting = true;
        UI.setButtonLoading('checkout-submit', true);

        try {
            // Submit check-out
            // const result = await API.submitCheckout(formData); // Removed API call
            const result = this.updateCheckinWithCheckout(formData); // Update local storage

            if (result.success) {
                // Show success message
                const returnedCount = formData.returnedItems.length;
                const pendingCount = formData.pendingItems.length;
                
                let message = `${returnedCount} item(ns) devolvido(s) com sucesso.`;
                if (pendingCount > 0) {
                    message += ` ${pendingCount} item(ns) permanecem pendentes.`;
                }

                UI.showToast('Check-out realizado!', message, 'success');

                // Clear search and form
                this.clearAll();

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
            Utils.logError('Check-out submission failed', error);

            let errorMessage = 'Erro interno do servidor';
            
            if (error.message.includes('not_found')) {
                errorMessage = 'Voluntário não encontrado ou já fez check-out';
            } else if (error.message.includes('network')) {
                errorMessage = 'Erro de conexão. Verifique sua internet.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Tempo limite excedido. Tente novamente.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            UI.showToast('Erro no check-out', errorMessage, 'error');

            // If offline, show offline message
            if (!Utils.isOnline()) {
                UI.showToast(
                    'Modo offline',
                    'Check-out salvo localmente. Será enviado quando voltar online.',
                    'warning'
                );
            }

        } finally {
            this.isSubmitting = false;
            UI.setButtonLoading('checkout-submit', false);
        }
    },

    /**
     * Collect form data
     * @returns {Object} Form data object
     */
    collectFormData() {
        if (!this.currentVolunteer) {
            throw new Error('No volunteer selected');
        }

        const checkboxes = document.querySelectorAll('input[name="return-items"]:checked');
        const returnedItems = Array.from(checkboxes).map(cb => cb.value);
        
        const allItems = this.currentVolunteer.itens || [];
        const pendingItems = allItems.filter(item => !returnedItems.includes(item));

        const data = {
            // Volunteer identification
            nome: this.currentVolunteer.nome,
            telefone: this.currentVolunteer.telefone,
            originalData: this.currentVolunteer.data,
            originalHora: this.currentVolunteer.hora,
            sessao: this.currentVolunteer.sessao,
            
            // Items data
            returnedItems,
            pendingItems,
            allItems,
            
            // Checkout metadata
            checkoutData: Utils.formatDate(new Date()),
            checkoutHora: Utils.formatTime(new Date()),
            timestamp: new Date().toISOString()
        };

        return data;
    },

    /**
     * Search for volunteer data in local storage
     * @param {string} query - Search query
     * @returns {Object|null} Volunteer data or null
     */
    searchVolunteerData(query) {
    // Função mantida apenas para compatibilidade, mas não usada mais
    return null;
    },

    /**
     * Update check-in record with check-out information
     * @param {Object} data - Check-out data
     * @returns {Object} Success status
     */
    updateCheckinWithCheckout(data) {
        // Atualiza registro de check-in no IndexedDB
        return window.IndexedDB.getAllCheckins().then(checkins => {
            const index = checkins.findIndex(c => c.id === data.checkin_id);
            if (index !== -1) {
                const checkin = checkins[index];
                checkin.checkoutTimestamp = Utils.getCurrentTimestamp();
                checkin.checkoutData = data.checkoutData;
                checkin.checkoutHora = data.checkoutHora;
                checkin.returnedItems = data.returnedItems;
                checkin.pendingItems = data.pendingItems;
                checkin.observacoesCheckout = data.observacoes;
                // Salva todos novamente (simples, mas eficiente para poucos registros)
                return window.IndexedDB.clearCheckins().then(() =>
                    Promise.all(checkins.map(c => window.IndexedDB.addCheckin(c)))
                ).then(() => ({ success: true }));
            }
            return { success: false, message: 'Check-in record not found' };
        }).catch(error => {
            Utils.logError('Failed to update check-in with checkout data', error);
            return { success: false, message: error.message };
        });
    },

    /**
     * Set search loading state
     * @param {boolean} loading - Loading state
     */
    setSearchLoading(loading) {
        const searchInput = document.getElementById('volunteer-search');
        const spinner = document.querySelector('.search-spinner');

        if (searchInput) {
            searchInput.disabled = loading;
        }

        if (spinner) {
            spinner.classList.toggle('hidden', !loading);
        }
    },

    /**
     * Clear search results and form
     */
    clearSearch() {
        // Hide volunteer info
        const volunteerInfo = document.getElementById('volunteer-info');
        if (volunteerInfo) {
            volunteerInfo.classList.add('hidden');
        }

        // Hide checkout form
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.classList.add('hidden');
            checkoutForm.removeAttribute('data-volunteer-data');
        }

        // Clear current volunteer
        this.currentVolunteer = null;

        // Clear items container
        const itemsContainer = document.getElementById('return-items-group');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
        }

        // Hide pending items warning
        const warningDiv = document.getElementById('pending-items-warning');
        if (warningDiv) {
            warningDiv.classList.add('hidden');
        }
    },

    /**
     * Clear all search and form data
     */
    clearAll() {
        // Clear search input
        const searchInput = document.getElementById('volunteer-search');
        if (searchInput) {
            searchInput.value = '';
        }

        // Clear search results
        this.clearSearch();

        // Clear any errors
        UI.clearErrors();

        // Focus search input
        if (searchInput) {
            searchInput.focus();
        }
    },

    /**
     * Get current volunteer data
     * @returns {Object|null} Current volunteer
     */
    getCurrentVolunteer() {
        return this.currentVolunteer ? { ...this.currentVolunteer } : null;
    },

    /**
     * Check if there are unsaved changes
     * @returns {boolean} Has unsaved changes
     */
    hasUnsavedChanges() {
        if (!this.currentVolunteer) return false;

        const checkboxes = document.querySelectorAll('input[name="return-items"]:checked');
        return checkboxes.length > 0;
    },

    /**
     * Show confirmation dialog for unsaved changes
     * @returns {boolean} User confirmed to leave
     */
    confirmLeave() {
        if (!this.hasUnsavedChanges()) return true;

        return confirm(
            'Você tem itens selecionados para devolução. Deseja realmente sair sem fazer o check-out?'
        );
    }
};

// Make CheckOut immutable
Object.freeze(CheckOut);

// Export for use in other modules
window.CheckOut = CheckOut;
