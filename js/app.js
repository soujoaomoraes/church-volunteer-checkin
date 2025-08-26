/**
 * Main Application Entry Point
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

class App {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.serviceWorker = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize core modules
            await this.initializeModules();

            // Register service worker
            await this.registerServiceWorker();

            // Setup global error handling
            this.setupErrorHandling();

            // Setup page visibility handling
            this.setupVisibilityHandling();

            // Setup beforeunload handling
            this.setupBeforeUnloadHandling();

            // Hide loading screen and show app
            this.hideLoadingScreen();

            this.isInitialized = true;
            Utils.log('Application initialized successfully');

        } catch (error) {
            Utils.logError('Application initialization failed', error);
            this.showInitializationError(error);
        }
    }

    /**
     * Initialize all application modules
     */
    async initializeModules() {
        const initSteps = [
            { name: 'Utils', module: Utils },
            { name: 'Config', module: CONFIG },
            { name: 'Validation', module: Validation },
            { name: 'API', module: API },
            { name: 'UI', module: UI },
            { name: 'CheckIn', module: CheckIn },
            { name: 'CheckOut', module: CheckOut },
            { name: 'Reports', module: Reports } // New module
        ];

        for (const step of initSteps) {
            try {
                if (step.module && typeof step.module.init === 'function') {
                    await step.module.init();
                    this.modules[step.name] = step.module;
                    Utils.log(`${step.name} module initialized`);
                }
            } catch (error) {
                Utils.logError(`Failed to initialize ${step.name} module`, error);
                throw new Error(`Module initialization failed: ${step.name}`);
            }
        }

        // Test API connection
        // await this.testAPIConnection(); // Not needed for local storage app
    }

    /**
     * Test API connection
     */
    async testAPIConnection() {
        // No API connection to test for local storage app
        Utils.log('API connection test not applicable for local storage app.');
    }

    /**
     * Register service worker for PWA functionality
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            Utils.log('Service Worker not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            this.serviceWorker = registration;

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.showUpdateAvailable();
                    }
                });
            });

            Utils.log('Service Worker registered successfully');

        } catch (error) {
            Utils.logError('Service Worker registration failed', error);
            // Don't throw - app should work without SW
        }
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            Utils.logError('Unhandled promise rejection', event.reason);
            
            // Show user-friendly error message
            if (UI && typeof UI.showToast === 'function') {
                UI.showToast(
                    'Erro inesperado',
                    'Ocorreu um erro inesperado. Tente recarregar a página.',
                    'error'
                );
            }

            // Prevent default browser error handling
            event.preventDefault();
        });

        // Global JavaScript errors
        window.addEventListener('error', (event) => {
            Utils.logError('Global JavaScript error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });

            // Show user-friendly error message for critical errors
            if (event.message && event.message.includes('ChunkLoadError')) {
                if (UI && typeof UI.showToast === 'function') {
                    UI.showToast(
                        'Erro de carregamento',
                        'Erro ao carregar recursos. Recarregue a página.',
                        'error'
                    );
                }
            }
        });
    }

    /**
     * Setup page visibility handling
     */
    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page became hidden
                Utils.log('Page hidden');
                
                // Save any pending data
                this.savePendingData();
                
            } else {
                // Page became visible
                Utils.log('Page visible');
                
                // Update time displays
                if (UI && typeof UI.updateCurrentTime === 'function') {
                    UI.updateCurrentTime();
                }
                
                // Check for offline data to sync
                // if (Utils.isOnline() && API && typeof API.syncOfflineData === 'function') {
                //     API.syncOfflineData().catch(error => {
                //         Utils.logError('Auto sync failed', error);
                //     });
                // }
                
                // Refresh stats if on home page
                if (UI && UI.currentPage === 'home' && typeof UI.loadStats === 'function') {
                    UI.loadStats().catch(error => {
                        Utils.logError('Stats refresh failed', error);
                    });
                }
            }
        });
    }

    /**
     * Setup beforeunload handling for unsaved changes
     */
    setupBeforeUnloadHandling() {
        window.addEventListener('beforeunload', (event) => {
            let hasUnsavedChanges = false;

            // Check for unsaved changes in active modules
            if (UI && UI.currentPage === 'checkin' && CheckIn && typeof CheckIn.hasUnsavedChanges === 'function') {
                hasUnsavedChanges = CheckIn.hasUnsavedChanges();
            } else if (UI && UI.currentPage === 'checkout' && CheckOut && typeof CheckOut.hasUnsavedChanges === 'function') {
                hasUnsavedChanges = CheckOut.hasUnsavedChanges();
            }

            if (hasUnsavedChanges) {
                const message = 'Você tem alterações não salvas. Deseja realmente sair?';
                event.returnValue = message;
                return message;
            }
        });
    }

    /**
     * Save any pending data before page becomes hidden
     */
    savePendingData() {
        try {
            // Save current form states to localStorage for recovery
            if (UI && UI.currentPage === 'checkin' && CheckIn && typeof CheckIn.getCurrentFormData === 'function') {
                const formData = CheckIn.getCurrentFormData();
                if (formData && Object.keys(formData).length > 0) {
                    Utils.setStorageItem('pending_checkin', formData);
                }
            } else if (UI && UI.currentPage === 'checkout' && CheckOut && typeof CheckOut.getCurrentVolunteer === 'function') {
                const volunteer = CheckOut.getCurrentVolunteer();
                if (volunteer) {
                    Utils.setStorageItem('pending_checkout', volunteer);
                }
            }
        } catch (error) {
            Utils.logError('Failed to save pending data', error);
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen and show main app
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainApp = document.getElementById('app');

        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }

        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
    }

    /**
     * Show initialization error
     * @param {Error} error - Initialization error
     */
    showInitializationError(error) {
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <h2>Erro de Inicialização</h2>
                    <p>Não foi possível inicializar a aplicação.</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Show update available notification
     */
    showUpdateAvailable() {
        if (UI && typeof UI.showToast === 'function') {
            UI.showToast(
                'Atualização disponível',
                'Uma nova versão está disponível. Recarregue a página para atualizar.',
                'warning'
            );
        }

        // Auto-reload after 10 seconds if user doesn't interact
        setTimeout(() => {
            if (confirm('Nova versão disponível. Recarregar agora?')) {
                location.reload();
            }
        }, 10000);
    }

    /**
     * Get application info
     * @returns {Object} Application information
     */
    getInfo() {
        return {
            version: '1.0.0',
            initialized: this.isInitialized,
            modules: Object.keys(this.modules),
            serviceWorker: !!this.serviceWorker,
            online: Utils.isOnline(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Restart application
     */
    async restart() {
        try {
            // Clear caches
            if (this.serviceWorker) {
                const caches = await window.caches.keys();
                await Promise.all(caches.map(cache => window.caches.delete(cache)));
            }

            // Clear storage
            localStorage.clear();
            sessionStorage.clear();

            // Reload page
            location.reload();

        } catch (error) {
            Utils.logError('Application restart failed', error);
            location.reload(); // Fallback
        }
    }
}

// Create global app instance
const app = new App();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

// Export app instance for debugging
window.app = app;

// Add some global utilities for debugging
window.debugInfo = () => {
    console.log('=== Church Volunteer System Debug Info ===');
    console.log('App Info:', app.getInfo());
    console.log('Config:', CONFIG);
    console.log('Storage:', {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage)
    });
    console.log('Current Page:', UI?.currentPage);
    console.log('Online Status:', Utils.isOnline());
    console.log('==========================================');
};

// Add global error recovery
window.recoverApp = () => {
    console.log('Attempting app recovery...');
    app.restart();
};