/**
 * API Module - Local Storage Only
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central (100% local)
 */

// API agora é apenas um utilitário para autocomplete e cache local
const API = {
    /**
     * Cache volunteer data for autocomplete (local only)
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
     * Get cached volunteer data for autocomplete (local only)
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
     * Cache volunteer search result (local only)
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
     * Get cached volunteer data from search (local only)
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
     * Get cached statistics (local only)
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
     * Get default statistics when no data available (local only)
     * @returns {Object} Default stats
     */
    getDefaultStats() {
        return {
            present: '--',
            today: '--',
            pending: '--'
        };
    }
};

// Make API immutable
Object.freeze(API);

// Export for use in other modules
window.API = API;
