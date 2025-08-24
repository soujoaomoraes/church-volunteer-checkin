/**
 * API Module - Google Apps Script Integration
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const API = {
    /**
     * Make HTTP request with timeout and error handling
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate API response format
            const validation = Validation.validateApiResponse(data);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Tempo limite de conexão excedido');
            }
            
            if (!Utils.isOnline()) {
                throw new Error(CONFIG.MESSAGES.NETWORK_ERROR);
            }
            
            Utils.logError('API Request failed', error);
            throw error;
        }
    },

    /**
     * Submit check-in data
     * @param {Object} checkinData - Check-in form data
     * @returns {Promise<Object>} API response
     */
    async submitCheckin(checkinData) {
        Utils.log('Submitting check-in', checkinData);

        // Sanitize data before sending
        const sanitizedData = Validation.sanitizeFormData(checkinData);
        
        const payload = {
            action: 'checkin',
            ...sanitizedData,
            tipo: 'check-in'
        };

        try {
            const response = await this.makeRequest(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.success) {
                // Update last sync time
                Utils.setStorageItem(CONFIG.STORAGE_KEYS.LAST_SYNC, Utils.getCurrentTimestamp());
                
                // Cache volunteer data for future use
                this.cacheVolunteerData({
                    nome: sanitizedData.nome,
                    telefone: sanitizedData.telefone
                });

                Utils.log('Check-in successful', response);
            }

            return response;
        } catch (error) {
            // If offline, queue for later sync
            if (!Utils.isOnline() && CONFIG.FEATURES.OFFLINE_SUPPORT) {
                this.queueOfflineData('checkin', payload);
                return {
                    success: true,
                    offline: true,
                    message: CONFIG.MESSAGES.OFFLINE_MODE
                };
            }
            
            throw error;
        }
    },

    /**
     * Submit check-out data
     * @param {Object} checkoutData - Check-out form data
     * @returns {Promise<Object>} API response
     */
    async submitCheckout(checkoutData) {
        Utils.log('Submitting check-out', checkoutData);

        const payload = {
            action: 'checkout',
            nome: checkoutData.volunteerData.nome,
            telefone: checkoutData.volunteerData.telefone,
            sessao: checkoutData.volunteerData.sessao,
            itens: checkoutData.itensDevolvidos,
            checkin_id: checkoutData.volunteerData.id,
            tipo: 'check-out',
            timestamp: Utils.getCurrentTimestamp(),
            data: Utils.formatDate(),
            hora: Utils.formatTime()
        };

        try {
            const response = await this.makeRequest(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.success) {
                Utils.setStorageItem(CONFIG.STORAGE_KEYS.LAST_SYNC, Utils.getCurrentTimestamp());
                Utils.log('Check-out successful', response);
            }

            return response;
        } catch (error) {
            // If offline, queue for later sync
            if (!Utils.isOnline() && CONFIG.FEATURES.OFFLINE_SUPPORT) {
                this.queueOfflineData('checkout', payload);
                return {
                    success: true,
                    offline: true,
                    message: CONFIG.MESSAGES.OFFLINE_MODE
                };
            }
            
            throw error;
        }
    },

    /**
     * Search for volunteer by name
     * @param {string} nome - Volunteer name
     * @returns {Promise<Object>} Volunteer data or null
     */
    async searchVolunteer(nome) {
        Utils.log('Searching volunteer', nome);

        // First check local cache
        const cachedData = this.getCachedVolunteerData(nome);
        if (cachedData && !Utils.isOnline()) {
            return cachedData;
        }

        const payload = {
            action: 'search',
            nome: Utils.sanitizeInput(nome)
        };

        try {
            const response = await this.makeRequest(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.success && response.volunteer) {
                // Validate volunteer data
                const validation = Validation.validateVolunteerData(response.volunteer);
                if (!validation.isValid) {
                    throw new Error(validation.error);
                }

                // Cache the result
                this.cacheVolunteerSearchResult(nome, response.volunteer);
                
                Utils.log('Volunteer found', response.volunteer);
                return response.volunteer;
            }

            return null;
        } catch (error) {
            // If offline, try cached data
            if (!Utils.isOnline()) {
                const cached = this.getCachedVolunteerData(nome);
                if (cached) {
                    return cached;
                }
            }
            
            throw error;
        }
    },

    /**
     * Get dashboard statistics
     * @returns {Promise<Object>} Statistics data
     */
    async getStats() {
        Utils.log('Fetching stats');

        // Return cached stats if offline
        if (!Utils.isOnline()) {
            return this.getCachedStats();
        }

        const payload = {
            action: 'stats',
            date: Utils.formatDate()
        };

        try {
            const response = await this.makeRequest(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.success) {
                // Cache stats
                Utils.setStorageItem('cached_stats', {
                    data: response.stats,
                    timestamp: Utils.getCurrentTimestamp()
                });
                
                return response.stats;
            }

            return this.getDefaultStats();
        } catch (error) {
            Utils.logError('Failed to fetch stats', error);
            return this.getCachedStats();
        }
    },

    /**
     * Cache volunteer data for autocomplete
     * @param {Object} volunteerData - Volunteer data
     */
    cacheVolunteerData(volunteerData) {
        try {
            const cache = Utils.getStorageItem(CONFIG.STORAGE_KEYS.VOLUNTEER_CACHE, []);
            
            // Check if volunteer already exists in cache
            const existingIndex = cache.findIndex(v => 
                v.nome.toLowerCase() === volunteerData.nome.toLowerCase()
            );

            if (existingIndex >= 0) {
                // Update existing entry
                cache[existingIndex] = {
                    ...cache[existingIndex],
                    ...volunteerData,
                    lastUsed: Utils.getCurrentTimestamp()
                };
            } else {
                // Add new entry
                cache.push({
                    ...volunteerData,
                    lastUsed: Utils.getCurrentTimestamp()
                });
            }

            // Keep only last 50 entries, sorted by most recent
            cache.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
            const trimmedCache = cache.slice(0, 50);

            Utils.setStorageItem(CONFIG.STORAGE_KEYS.VOLUNTEER_CACHE, trimmedCache);
        } catch (error) {
            Utils.logError('Failed to cache volunteer data', error);
        }
    },

    /**
     * Get cached volunteer data for autocomplete
     * @param {string} query - Search query
     * @returns {Array} Matching volunteers
     */
    getCachedVolunteers(query = '') {
        try {
            const cache = Utils.getStorageItem(CONFIG.STORAGE_KEYS.VOLUNTEER_CACHE, []);
            
            if (!query) return cache.slice(0, 10);
            
            const lowerQuery = query.toLowerCase();
            return cache
                .filter(volunteer => 
                    volunteer.nome.toLowerCase().includes(lowerQuery)
                )
                .slice(0, 10);
        } catch (error) {
            Utils.logError('Failed to get cached volunteers', error);
            return [];
        }
    },

    /**
     * Cache volunteer search result
     * @param {string} nome - Search query
     * @param {Object} volunteerData - Volunteer data
     */
    cacheVolunteerSearchResult(nome, volunteerData) {
        try {
            const searchCache = Utils.getStorageItem('volunteer_search_cache', {});
            const key = nome.toLowerCase().trim();
            
            searchCache[key] = {
                data: volunteerData,
                timestamp: Utils.getCurrentTimestamp()
            };

            // Keep only recent searches (last 24 hours)
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            Object.keys(searchCache).forEach(searchKey => {
                const cached = searchCache[searchKey];
                if (new Date(cached.timestamp).getTime() < oneDayAgo) {
                    delete searchCache[searchKey];
                }
            });

            Utils.setStorageItem('volunteer_search_cache', searchCache);
        } catch (error) {
            Utils.logError('Failed to cache search result', error);
        }
    },

    /**
     * Get cached volunteer data from search
     * @param {string} nome - Volunteer name
     * @returns {Object|null} Cached volunteer data
     */
    getCachedVolunteerData(nome) {
        try {
            const searchCache = Utils.getStorageItem('volunteer_search_cache', {});
            const key = nome.toLowerCase().trim();
            const cached = searchCache[key];
            
            if (cached) {
                // Check if cache is still valid (1 hour)
                const oneHourAgo = Date.now() - CONFIG.CACHE_DURATION;
                if (new Date(cached.timestamp).getTime() > oneHourAgo) {
                    return cached.data;
                }
            }
            
            return null;
        } catch (error) {
            Utils.logError('Failed to get cached volunteer data', error);
            return null;
        }
    },

    /**
     * Queue data for offline sync
     * @param {string} type - Operation type
     * @param {Object} data - Data to queue
     */
    queueOfflineData(type, data) {
        try {
            const queue = Utils.getStorageItem(CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, []);
            
            queue.push({
                id: Utils.generateId(),
                type,
                data,
                timestamp: Utils.getCurrentTimestamp()
            });

            Utils.setStorageItem(CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, queue);
            Utils.log('Data queued for offline sync', { type, queueLength: queue.length });
        } catch (error) {
            Utils.logError('Failed to queue offline data', error);
        }
    },

    /**
     * Sync offline queued data
     * @returns {Promise<Object>} Sync results
     */
    async syncOfflineData() {
        if (!Utils.isOnline()) {
            return { success: false, error: 'Device is offline' };
        }

        const queue = Utils.getStorageItem(CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, []);
        if (queue.length === 0) {
            return { success: true, synced: 0 };
        }

        Utils.log('Starting offline sync', { queueLength: queue.length });

        let syncedCount = 0;
        const failedItems = [];

        for (const item of queue) {
            try {
                const response = await this.makeRequest(CONFIG.API_URL, {
                    method: 'POST',
                    body: JSON.stringify(item.data)
                });

                if (response.success) {
                    syncedCount++;
                } else {
                    failedItems.push(item);
                }
            } catch (error) {
                Utils.logError('Failed to sync item', error);
                failedItems.push(item);
            }
        }

        // Update queue with failed items only
        Utils.setStorageItem(CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, failedItems);
        
        // Update last sync time
        if (syncedCount > 0) {
            Utils.setStorageItem(CONFIG.STORAGE_KEYS.LAST_SYNC, Utils.getCurrentTimestamp());
        }

        Utils.log('Offline sync completed', { synced: syncedCount, failed: failedItems.length });

        return {
            success: true,
            synced: syncedCount,
            failed: failedItems.length
        };
    },

    /**
     * Get cached statistics
     * @returns {Object} Cached or default stats
     */
    getCachedStats() {
        const cached = Utils.getStorageItem('cached_stats', null);
        
        if (cached) {
            // Check if cache is still valid (5 minutes)
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            if (new Date(cached.timestamp).getTime() > fiveMinutesAgo) {
                return cached.data;
            }
        }
        
        return this.getDefaultStats();
    },

    /**
     * Get default statistics when no data available
     * @returns {Object} Default stats
     */
    getDefaultStats() {
        return {
            present: '--',
            today: '--',
            pending: '--'
        };
    },

    /**
     * Test API connection
     * @returns {Promise<boolean>} Connection status
     */
    async testConnection() {
        try {
            const response = await this.makeRequest(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'ping' })
            });
            
            return response.success === true;
        } catch (error) {
            Utils.logError('Connection test failed', error);
            return false;
        }
    }
};

// Make API immutable
Object.freeze(API);

// Export for use in other modules
window.API = API;
