/**
 * Utilitários gerais do sistema
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const Utils = {
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = CONFIG.DEBOUNCE_DELAY) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format phone number to Brazilian format
     * @param {string} phone - Raw phone number
     * @returns {string} Formatted phone number
     */
    formatPhone(phone) {
        const numbers = phone.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },

    /**
     * Clean phone number (remove formatting)
     * @param {string} phone - Formatted phone number
     * @returns {string} Clean phone number
     */
    cleanPhone(phone) {
        return phone.replace(/\D/g, '');
    },

    /**
     * Format date to Brazilian format
     * @param {Date} date - Date object
     * @returns {string} Formatted date
     */
    formatDate(date = new Date()) {
        return date.toLocaleDateString('pt-BR');
    },

    /**
     * Format time to Brazilian format
     * @param {Date} date - Date object
     * @returns {string} Formatted time
     */
    formatTime(date = new Date()) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Format full date and time
     * @param {Date} date - Date object
     * @returns {string} Formatted date and time
     */
    formatDateTime(date = new Date()) {
        return date.toLocaleString('pt-BR');
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Sanitize input string
     * @param {string} input - Input string
     * @returns {string} Sanitized string
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove brackets
            .substring(0, 200); // Limit length
    },

    /**
     * Check if device is online
     * @returns {boolean} Online status
     */
    isOnline() {
        return navigator.onLine;
    },

    /**
     * Check if device is mobile
     * @returns {boolean} Mobile status
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Get current timestamp in ISO format
     * @returns {string} ISO timestamp
     */
    getCurrentTimestamp() {
        return new Date().toISOString();
    },

    /**
     * Sleep function for async operations
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after specified time
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if string is empty or whitespace
     * @param {string} str - String to check
     * @returns {boolean} True if empty
     */
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Format array as comma-separated string
     * @param {Array} arr - Array to format
     * @returns {string} Formatted string
     */
    arrayToString(arr) {
        if (!Array.isArray(arr)) return '';
        return arr.filter(item => item && item.trim()).join(', ');
    },

    /**
     * Parse comma-separated string to array
     * @param {string} str - String to parse
     * @returns {Array} Parsed array
     */
    stringToArray(str) {
        if (!str) return [];
        return str.split(',').map(item => item.trim()).filter(item => item);
    },

    /**
     * Log message (only in debug mode)
     * @param {string} message - Message to log
     * @param {*} data - Additional data to log
     */
    log(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`[${CONFIG.APP_NAME}] ${message}`, data || '');
        }
    },

    /**
     * Log error
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    logError(message, error = null) {
        console.error(`[${CONFIG.APP_NAME}] ERROR: ${message}`, error || '');
    },

    /**
     * Get user agent info
     * @returns {Object} User agent info
     */
    getUserAgent() {
        const ua = navigator.userAgent;
        return {
            isMobile: /Mobile|Android|iPhone|iPad/.test(ua),
            isIOS: /iPhone|iPad|iPod/.test(ua),
            isAndroid: /Android/.test(ua),
            isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
            isChrome: /Chrome/.test(ua),
            isFirefox: /Firefox/.test(ua)
        };
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (error) {
            this.logError('Failed to copy to clipboard', error);
            return false;
        }
    },

    /**
     * Vibrate device (if supported)
     * @param {number|Array} pattern - Vibration pattern
     */
    vibrate(pattern = 200) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    /**
     * Request notification permission
     * @returns {Promise<string>} Permission status
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            return await Notification.requestPermission();
        }
        return 'denied';
    },

    /**
     * Show notification (if permitted)
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     */
    showNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                ...options
            });
        }
    },

    /**
     * Get storage item with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored value or default
     */
    getStorageItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            this.logError(`Failed to get storage item: ${key}`, error);
            return defaultValue;
        }
    },

    /**
     * Set storage item with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            this.logError(`Failed to set storage item: ${key}`, error);
            return false;
        }
    },

    /**
     * Remove storage item
     * @param {string} key - Storage key
     */
    removeStorageItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            this.logError(`Failed to remove storage item: ${key}`, error);
        }
    },

    /**
     * Clear all app storage
     */
    clearAppStorage() {
        try {
            Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            this.logError('Failed to clear app storage', error);
        }
    }
};

// Make Utils immutable
Object.freeze(Utils);

// Export for use in other modules
window.Utils = Utils;
