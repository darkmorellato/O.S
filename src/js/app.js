/**
 * MiPlace OS System - Main Application
 * Initializes all modules and wires up functionality
 */

const App = {
    /**
     * Initialize application
     */
    init() {
        console.log('Inicializando MiPlace OS System...');

        // Check localStorage availability
        if (!StorageManager.isAvailable()) {
            alert('ATENÇÃO: localStorage não está disponível. Os dados não serão salvos automaticamente.');
        }

        // Initialize UI controller
        UIController.init();

        // Setup input masks
        MaskUtils.setupAll();

        // Initialize form handler
        FormHandler.init();

        // Initialize password pattern handler
        PasswordPattern.init();

        // Setup CEP lookup with debounce
        this.setupCEPLookup();

        // Setup global event handlers
        this.setupGlobalHandlers();

        console.log('Sistema inicializado com sucesso!');
    },

    /**
     * Setup CEP auto-lookup on blur
     */
    setupCEPLookup() {
        const cepInput = document.getElementById('cep');

        if (cepInput) {
            cepInput.addEventListener('blur', async (e) => {
                const cep = e.target.value.replace(/\D/g, '');

                if (cep.length === 8) {
                    try {
                        const data = await CEPService.buscar(cep);
                        this.populateAddressFields(data);
                    } catch (error) {
                        UIController.showNotification(
                            `Erro ao buscar CEP: ${error.message}`,
                            'error',
                            3000
                        );
                    }
                }
            });
        }
    },

    /**
     * Populate address fields from CEP data
     * @param {object} data - CEP data from ViaCEP
     */
    populateAddressFields(data) {
        const endereco = document.getElementById('endereco');
        const cidade = document.getElementById('cidade');
        const estado = document.getElementById('estado');

        if (endereco) endereco.value = data.logradouro || '';
        if (cidade) cidade.value = data.localidade || '';
        if (estado) estado.value = data.uf || '';

        UIController.showNotification('CEP encontrado com sucesso!', 'success', 2000);
    },

    /**
     * Setup global event handlers
     */
    setupGlobalHandlers() {
        // These are attached in HTML via onclick attributes for simplicity
        // This method can be extended for keyboard shortcuts, etc.
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}

// Expose app globally for debugging if needed
if (typeof window !== 'undefined') {
    window.App = App;
}