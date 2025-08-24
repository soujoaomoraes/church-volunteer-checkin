/**
 * Configurações centrais do sistema
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const CONFIG = {
    // API Configuration
    API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    API_TIMEOUT: 10000, // 10 seconds
    
    // Application Info
    APP_NAME: 'Sistema de Voluntários',
    APP_VERSION: '1.0.0',
    CHURCH_NAME: 'Igreja Central',
    
    // Cache Configuration
    CACHE_VERSION: 'v1',
    CACHE_NAME: 'voluntarios-cache-v1',
    CACHE_DURATION: 3600000, // 1 hour in milliseconds
    
    // UI Configuration
    DEBOUNCE_DELAY: 300, // milliseconds
    TOAST_DURATION: 5000, // 5 seconds
    LOADING_MIN_DURATION: 800, // minimum loading time for UX
    
    // Validation Rules
    VALIDATION: {
        NOME_MIN_LENGTH: 2,
        NOME_MAX_LENGTH: 100,
        TELEFONE_LENGTH: 11,
        TELEFONE_PATTERN: /^[1-9][1-9][9][0-9]{8}$/
    },
    
    // Available Sessions
    SESSOES: [
        '1º Culto (Manhã)',
        '2º Culto (Tarde)',
        '3º Culto (Noite)',
        'Ensaio',
        'Evento Especial',
        'Reunião de Liderança'
    ],
    
    // Available Items
    ITENS_DISPONIVEIS: [
        'Crachá de Identificação',
        'Rádio Comunicador',
        'Chaves (Portões/Salas)',
        'Equipamento de Som',
        'Material de Limpeza',
        'Instrumentos Musicais',
        'Material de Decoração',
        'Outros'
    ],
    
    // Local Storage Keys
    STORAGE_KEYS: {
        VOLUNTEER_CACHE: 'volunteer_cache',
        LAST_SYNC: 'last_sync',
        OFFLINE_QUEUE: 'offline_queue',
        USER_PREFERENCES: 'user_preferences'
    },
    
    // Error Messages
    MESSAGES: {
        NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
        VALIDATION_ERROR: 'Por favor, corrija os campos destacados.',
        GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
        SUCCESS_CHECKIN: 'Check-in realizado com sucesso!',
        SUCCESS_CHECKOUT: 'Check-out realizado com sucesso!',
        VOLUNTEER_NOT_FOUND: 'Voluntário não encontrado ou sem check-in pendente.',
        OFFLINE_MODE: 'Modo offline ativo. Dados serão sincronizados quando conectar.'
    },
    
    // Development Mode
    DEBUG: false, // Set to true for development
    
    // Feature Flags
    FEATURES: {
        OFFLINE_SUPPORT: true,
        DARK_MODE: true,
        PUSH_NOTIFICATIONS: false,
        ANALYTICS: false
    }
};

// Make CONFIG immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.VALIDATION);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.MESSAGES);
Object.freeze(CONFIG.FEATURES);

// Export for use in other modules
window.CONFIG = CONFIG;
