/**
 * MiPlace OS System - Storage Manager
 * Handles localStorage operations with versioning and error handling
 */

const StorageManager = {
    VERSION: '1.0',
    KEYS: {
        DADOS: 'os_dados',
        ULTIMO_NUMERO: 'os_ultimo_numero',
        NUMERO_ATUAL: 'os_numero'
    },

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {any|null} - Parsed data or null
     */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsed = JSON.parse(item);

            // Handle versioning if present
            if (parsed.__version) {
                if (parsed.__version !== this.VERSION) {
                    console.warn(`Storage version mismatch for key "${key}". Expected ${this.VERSION}, got ${parsed.__version}`);
                }
                return parsed.data || parsed;
            }

            // If no version wrapper, return as is
            return parsed;
        } catch (error) {
            console.error(`Storage read error for key "${key}":`, error);
            return null;
        }
    },

    /**
     * Set data in localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @returns {boolean} - Success status
     */
    set(key, data) {
        try {
            const payload = {
                __version: this.VERSION,
                timestamp: Date.now(),
                data
            };
            localStorage.setItem(key, JSON.stringify(payload));
            return true;
        } catch (error) {
            console.error(`Storage write error for key "${key}":`, error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Storage remove error for key "${key}":`, error);
            return false;
        }
    },

    /**
     * Clear all MiPlace data from localStorage
     * @returns {boolean} - Success status
     */
    clearAll() {
        try {
            const keysToRemove = Object.values(this.KEYS);
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}