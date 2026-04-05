/**
 * MiPlace OS System - CEP Service
 * Handles CEP lookup using ViaCEP API with caching
 */

const CEPService = {
    CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    CACHE_KEY: 'cep_cache',

    /**
     * Get CEP data from cache if available and not expired
     * @param {string} cep - CEP number (only digits)
     * @returns {object|null} - Cached data or null
     */
    getCached(cep) {
        const cache = StorageManager.get(this.CACHE_KEY) || {};
        const entry = cache[cep];

        if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.data;
        }

        return null;
    },

    /**
     * Store CEP data in cache
     * @param {string} cep - CEP number (only digits)
     * @param {object} data - CEP data to cache
     */
    cacheCEP(cep, data) {
        const cache = StorageManager.get(this.CACHE_KEY) || {};
        cache[cep] = {
            timestamp: Date.now(),
            data
        };
        StorageManager.set(this.CACHE_KEY, cache);
    },

    /**
     * Clear CEP cache
     */
    clearCache() {
        StorageManager.remove(this.CACHE_KEY);
    },

    /**
     * Look up CEP using ViaCEP API
     * @param {string} cepInput - CEP value (can include formatting)
     * @returns {Promise<object>} - CEP data
     */
    async buscar(cepInput) {
        const cep = cepInput.replace(/\D/g, '');

        if (cep.length !== 8) {
            throw new Error('CEP deve conter 8 dígitos');
        }

        // Check cache first
        const cached = this.getCached(cep);
        if (cached) {
            console.log('CEP retrieved from cache:', cep);
            return cached;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.erro) {
                throw new Error('CEP não encontrado');
            }

            // Cache successful response
            this.cacheCEP(cep, data);

            return data;
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            throw error;
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.CEPService = CEPService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CEPService;
}