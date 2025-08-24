/**
 * UI Module - Interface Control and Navigation
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const UI = {
    // Current page state
    currentPage: 'home',
    
    // Form validation errors
    currentErrors: {},

    /**
     * Initialize UI components and event listeners
     */
    init() {
        this.setupEventListeners();
        this.updateConnectionStatus();
        this.updateCurrentTime();
        this.loadStats();
        
        // Start periodic updates
        this.startPeriodicUpdates();
        
        Utils.log('UI initialized');
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('checkin-btn')?.addEventListener('click', () => {
            this.navigateTo('checkin');
        });

        document.getElementById('checkout-btn')?.addEventListener('click', () => {
            this.navigateTo('checkout');
        });

        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.navigateTo('home');
        });

        // Online/offline status
        window.addEventListener('online', () => {
            this.updateConnectionStatus();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus();
        });

        // Phone input formatting
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.handlePhoneInput.bind(this));
        });

        // "Outros" checkbox handling
        const outrosCheckbox = document.getElementById('outros-checkbox');
        if (outrosCheckbox) {
            outrosCheckbox.addEventListener('change', this.handleOutrosCheckbox.bind(this));
        }
    },

    /**
     * Navigate between pages
     * @param {string} page - Target page name
     */
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update header
        this.updateHeader(page);

        // Update current page state
        this.currentPage = page;

        // Clear any existing errors
        this.clearErrors();

        // Page-specific initialization
        if (page === 'checkin') {
            this.initCheckinPage();
        } else if (page === 'checkout') {
            this.initCheckoutPage();
        } else if (page === 'home') {
            this.loadStats();
        }

        Utils.log('Navigated to page', page);
    },

    /**
     * Update header based on current page
     * @param {string} page - Current page name
     */
    updateHeader(page) {
        const backBtn = document.getElementById('back-btn');
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');

        if (page === 'home') {
            backBtn.classList.add('hidden');
            pageTitle.textContent = 'Sistema de Voluntários';
            pageSubtitle.textContent = 'Igreja Central';
        } else {
            backBtn.classList.remove('hidden');
            
            if (page === 'checkin') {
                pageTitle.textContent = 'Check-in';
                pageSubtitle.textContent = 'Registrar entrada';
            } else if (page === 'checkout') {
                pageTitle.textContent = 'Check-out';
                pageSubtitle.textContent = 'Registrar saída';
            }
        }
    },

    /**
     * Initialize check-in page
     */
    initCheckinPage() {
        // Update time display
        this.updateTimeDisplay('checkin-time');
        
        // Setup autocomplete for name field
        const nameInput = document.getElementById('checkin-nome');
        if (nameInput) {
            this.setupAutocomplete(nameInput);
        }

        // Clear form
        this.clearForm('checkin-form');
    },

    /**
     * Initialize check-out page
     */
    initCheckoutPage() {
        // Update time display
        this.updateTimeDisplay('checkout-time');
        
        // Setup volunteer search
        const searchInput = document.getElementById('volunteer-search');
        if (searchInput) {
            this.setupVolunteerSearch(searchInput);
        }

        // Clear search and hide forms
        this.clearVolunteerSearch();
    },

    /**
     * Setup autocomplete for name input
     * @param {HTMLElement} input - Input element
     */
    setupAutocomplete(input) {
        const debouncedAutocomplete = Utils.debounce((value) => {
            if (value.length >= 2) {
                const suggestions = API.getCachedVolunteers(value);
                this.showAutocompleteSuggestions(input, suggestions);
            } else {
                this.hideAutocompleteSuggestions(input);
            }
        });

        input.addEventListener('input', (e) => {
            debouncedAutocomplete(e.target.value);
        });

        input.addEventListener('blur', () => {
            // Hide suggestions after a delay to allow clicking
            setTimeout(() => this.hideAutocompleteSuggestions(input), 200);
        });
    },

    /**
     * Show autocomplete suggestions
     * @param {HTMLElement} input - Input element
     * @param {Array} suggestions - Suggestion list
     */
    showAutocompleteSuggestions(input, suggestions) {
        // Remove existing suggestions
        this.hideAutocompleteSuggestions(input);

        if (suggestions.length === 0) return;

        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'autocomplete-suggestions';
        suggestionsList.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            box-shadow: 0 4px 12px var(--shadow);
            max-height: 200px;
            overflow-y: auto;
            z-index: var(--z-dropdown);
        `;

        suggestions.forEach(volunteer => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.style.cssText = `
                padding: var(--spacing-md);
                cursor: pointer;
                border-bottom: 1px solid var(--border-light);
                transition: background-color var(--transition-fast);
            `;
            item.innerHTML = `
                <div style="font-weight: 500;">${volunteer.nome}</div>
                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    ${Utils.formatPhone(volunteer.telefone)}
                </div>
            `;

            item.addEventListener('click', () => {
                input.value = volunteer.nome;
                
                // Auto-fill phone if available
                const phoneInput = document.getElementById('checkin-telefone');
                if (phoneInput && volunteer.telefone) {
                    phoneInput.value = Utils.formatPhone(volunteer.telefone);
                }

                this.hideAutocompleteSuggestions(input);
            });

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'var(--border-light)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });

            suggestionsList.appendChild(item);
        });

        // Position suggestions relative to input
        const inputContainer = input.parentElement;
        inputContainer.style.position = 'relative';
        inputContainer.appendChild(suggestionsList);
    },

    /**
     * Hide autocomplete suggestions
     * @param {HTMLElement} input - Input element
     */
    hideAutocompleteSuggestions(input) {
        const existing = input.parentElement.querySelector('.autocomplete-suggestions');
        if (existing) {
            existing.remove();
        }
    },

    /**
     * Setup volunteer search functionality
     * @param {HTMLElement} input - Search input element
     */
    setupVolunteerSearch(input) {
        const debouncedSearch = Utils.debounce(async (query) => {
            if (query.length < 2) {
                this.clearVolunteerSearch();
                return;
            }

            this.showSearchSpinner(true);

            try {
                const volunteer = await API.searchVolunteer(query);
                
                if (volunteer) {
                    this.showVolunteerInfo(volunteer);
                } else {
                    this.showVolunteerNotFound();
                }
            } catch (error) {
                Utils.logError('Volunteer search failed', error);
                this.showToast('Erro na busca', error.message, 'error');
            } finally {
                this.showSearchSpinner(false);
            }
        });

        input.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    },

    /**
     * Show/hide search spinner
     * @param {boolean} show - Show spinner
     */
    showSearchSpinner(show) {
        const spinner = document.querySelector('.search-spinner');
        if (spinner) {
            spinner.classList.toggle('hidden', !show);
        }
    },

    /**
     * Show volunteer information
     * @param {Object} volunteer - Volunteer data
     */
    showVolunteerInfo(volunteer) {
        const volunteerInfo = document.getElementById('volunteer-info');
        const checkoutForm = document.getElementById('checkout-form');

        if (volunteerInfo) {
            // Update volunteer details
            document.getElementById('volunteer-name').textContent = volunteer.nome;
            document.getElementById('volunteer-phone').textContent = Utils.formatPhone(volunteer.telefone);
            document.getElementById('volunteer-date').textContent = volunteer.data;
            document.getElementById('volunteer-time').textContent = volunteer.hora;
            document.getElementById('volunteer-session').textContent = volunteer.sessao;

            volunteerInfo.classList.remove('hidden');
        }

        if (checkoutForm) {
            this.populateReturnItems(volunteer.itens || []);
            checkoutForm.classList.remove('hidden');
            
            // Store volunteer data for form submission
            checkoutForm.dataset.volunteerData = JSON.stringify(volunteer);
        }
    },

    /**
     * Show volunteer not found message
     */
    showVolunteerNotFound() {
        this.clearVolunteerSearch();
        this.showToast('Voluntário não encontrado', CONFIG.MESSAGES.VOLUNTEER_NOT_FOUND, 'warning');
    },

    /**
     * Clear volunteer search results
     */
    clearVolunteerSearch() {
        const volunteerInfo = document.getElementById('volunteer-info');
        const checkoutForm = document.getElementById('checkout-form');

        if (volunteerInfo) {
            volunteerInfo.classList.add('hidden');
        }

        if (checkoutForm) {
            checkoutForm.classList.add('hidden');
            checkoutForm.removeAttribute('data-volunteer-data');
        }
    },

    /**
     * Populate return items checkboxes
     * @param {Array} items - Items to populate
     */
    populateReturnItems(items) {
        const container = document.getElementById('return-items-group');
        if (!container) return;

        container.innerHTML = '';

        items.forEach(item => {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" name="return-items" value="${item}">
                <span class="checkbox-custom"></span>
                <span>${item}</span>
            `;

            container.appendChild(label);
        });

        // Setup change handlers for return items
        this.setupReturnItemsHandlers();
    },

    /**
     * Setup return items change handlers
     */
    setupReturnItemsHandlers() {
        const checkboxes = document.querySelectorAll('input[name="return-items"]');
        const submitBtn = document.getElementById('checkout-submit');
        const warningDiv = document.getElementById('pending-items-warning');
        const warningText = document.getElementById('pending-items-text');

        const updateWarningAndButton = () => {
            const totalItems = checkboxes.length;
            const selectedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
            const pendingItems = totalItems - selectedItems;

            // Update submit button state
            if (submitBtn) {
                submitBtn.disabled = selectedItems === 0;
            }

            // Update warning message
            if (warningDiv && warningText) {
                if (pendingItems > 0 && selectedItems > 0) {
                    warningText.textContent = `${pendingItems} item(ns) permanecerão pendentes de devolução.`;
                    warningDiv.classList.remove('hidden');
                } else {
                    warningDiv.classList.add('hidden');
                }
            }
        };

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateWarningAndButton);
        });

        // Initial update
        updateWarningAndButton();
    },

    /**
     * Handle phone input formatting
     * @param {Event} event - Input event
     */
    handlePhoneInput(event) {
        const input = event.target;
        const formatted = Utils.formatPhone(input.value);
        input.value = formatted;
    },

    /**
     * Handle "Outros" checkbox change
     * @param {Event} event - Change event
     */
    handleOutrosCheckbox(event) {
        const outrosField = document.getElementById('outros-field');
        if (outrosField) {
            outrosField.classList.toggle('hidden', !event.target.checked);
            
            if (event.target.checked) {
                const outrosInput = document.getElementById('outros-itens');
                if (outrosInput) {
                    outrosInput.focus();
                }
            }
        }
    },

    /**
     * Update connection status indicator
     */
    updateConnectionStatus() {
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        const isOnline = Utils.isOnline();

        if (statusIcon && statusText) {
            if (isOnline) {
                statusIcon.innerHTML = `
                    <path d="m3 17 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 1v22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="m20 7 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                `;
                statusText.textContent = 'Online';
                statusText.parentElement.style.color = 'var(--success)';
            } else {
                statusIcon.innerHTML = `
                    <line x1="1" x2="23" y1="1" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="m16.72 11.06A10.94 10.94 0 0 1 19 12.55" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="m5 12.55a10.94 10.94 0 0 1 5.17-2.39" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                `;
                statusText.textContent = 'Offline';
                statusText.parentElement.style.color = 'var(--error)';
            }
        }

        // Update last sync time
        this.updateLastSyncTime();
    },

    /**
     * Update last sync time display
     */
    updateLastSyncTime() {
        const lastSyncElement = document.getElementById('last-sync');
        if (lastSyncElement) {
            const lastSync = Utils.getStorageItem(CONFIG.STORAGE_KEYS.LAST_SYNC);
            if (lastSync) {
                const date = new Date(lastSync);
                lastSyncElement.textContent = Utils.formatTime(date);
            } else {
                lastSyncElement.textContent = '--:--';
            }
        }
    },

    /**
     * Update current time displays
     */
    updateCurrentTime() {
        const timeElements = ['current-time', 'checkin-time', 'checkout-time'];
        const currentTime = Utils.formatDateTime();

        timeElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = currentTime;
            }
        });
    },

    /**
     * Update time display for specific element
     * @param {string} elementId - Element ID
     */
    updateTimeDisplay(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = Utils.formatDateTime();
        }
    },

    /**
     * Load and display statistics
     */
    async loadStats() {
        try {
            const stats = await API.getStats();
            
            document.getElementById('stat-present').textContent = stats.present || '--';
            document.getElementById('stat-today').textContent = stats.today || '--';
            document.getElementById('stat-pending').textContent = stats.pending || '--';
        } catch (error) {
            Utils.logError('Failed to load stats', error);
            
            // Show default values
            document.getElementById('stat-present').textContent = '--';
            document.getElementById('stat-today').textContent = '--';
            document.getElementById('stat-pending').textContent = '--';
        }
    },

    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        // Update time every minute
        setInterval(() => {
            this.updateCurrentTime();
        }, 60000);

        // Update stats every 5 minutes
        setInterval(() => {
            if (this.currentPage === 'home' && Utils.isOnline()) {
                this.loadStats();
            }
        }, 300000);

        // Update sync time every 30 seconds
        setInterval(() => {
            this.updateLastSyncTime();
        }, 30000);
    },

    /**
     * Sync offline data when coming back online
     */
    async syncOfflineData() {
        if (!CONFIG.FEATURES.OFFLINE_SUPPORT) return;

        try {
            const result = await API.syncOfflineData();
            
            if (result.synced > 0) {
                this.showToast(
                    'Dados sincronizados',
                    `${result.synced} registro(s) enviado(s) com sucesso`,
                    'success'
                );
            }
        } catch (error) {
            Utils.logError('Offline sync failed', error);
        }
    },

    /**
     * Clear form data
     * @param {string} formId - Form ID
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            
            // Hide "outros" field
            const outrosField = document.getElementById('outros-field');
            if (outrosField) {
                outrosField.classList.add('hidden');
            }
        }
    },

    /**
     * Show form validation errors
     * @param {Object} errors - Validation errors
     */
    showFormErrors(errors) {
        this.currentErrors = errors;

        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            const inputElement = document.getElementById(`checkin-${field}`) || 
                                document.getElementById(field);

            if (errorElement) {
                errorElement.textContent = errors[field];
            }

            if (inputElement) {
                inputElement.style.borderColor = 'var(--error)';
            }
        });
    },

    /**
     * Clear form validation errors
     */
    clearErrors() {
        this.currentErrors = {};

        // Clear error messages
        document.querySelectorAll('.form-error').forEach(element => {
            element.textContent = '';
        });

        // Reset input border colors
        document.querySelectorAll('.form-input, .form-select').forEach(element => {
            element.style.borderColor = '';
        });
    },

    /**
     * Show loading state on button
     * @param {string} buttonId - Button ID
     * @param {boolean} loading - Loading state
     */
    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const textElement = button.querySelector('.btn-text');
        const spinnerElement = button.querySelector('.btn-spinner');

        if (textElement && spinnerElement) {
            if (loading) {
                textElement.classList.add('hidden');
                spinnerElement.classList.remove('hidden');
                button.disabled = true;
            } else {
                textElement.classList.remove('hidden');
                spinnerElement.classList.add('hidden');
                button.disabled = false;
            }
        }
    },

    /**
     * Show toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning)
     */
    showToast(title, message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconMap = {
            success: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
            error: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" x2="9" y1="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" x2="15" y1="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            warning: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" x2="12" y1="9" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" x2="12.01" y1="17" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
        };

        toast.innerHTML = `
            <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                ${iconMap[type]}
            </svg>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-description">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fechar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" x2="6" y1="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="6" x2="18" y1="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        container.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, CONFIG.TOAST_DURATION);

        // Vibrate for error notifications
        if (type === 'error') {
            Utils.vibrate([100, 50, 100]);
        }
    },

    /**
     * Remove toast notification
     * @param {HTMLElement} toast - Toast element
     */
    removeToast(toast) {
        if (toast && toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }
    }
};

// Make UI immutable
Object.freeze(UI);

// Export for use in other modules
window.UI = UI;
