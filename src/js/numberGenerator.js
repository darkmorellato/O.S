/**
 * MiPlace OS System - Number Generator
 * Generates and manages OS (Ordem de Serviço) numbers
 */

const NumberGenerator = {
    STORAGE_KEY: 'os_ultimo_numero',
    CURRENT_KEY: 'os_numero',
    PADDING: 6, // Number of digits (e.g., 000001)

    /**
     * Generate a new OS number
     * Increments from last stored number, or starts at 1
     */
    gerar() {
        let ultimoNumero = StorageManager.get(this.STORAGE_KEY);

        // Convert to number if valid, otherwise start from 0
        if (ultimoNumero && !isNaN(parseInt(ultimoNumero))) {
            ultimoNumero = parseInt(ultimoNumero, 10);
        } else {
            ultimoNumero = 0;
        }

        // Increment and format
        const novoNumero = String(ultimoNumero + 1).padStart(this.PADDING, '0');

        // Save to storage
        StorageManager.set(this.STORAGE_KEY, novoNumero);
        StorageManager.set(this.CURRENT_KEY, novoNumero);

        // Update display
        const osNumberElement = document.getElementById('os-number');
        if (osNumberElement) {
            osNumberElement.textContent = novoNumero;
        }

        console.log(`Nova OS gerada: ${novoNumero}`);
        return novoNumero;
    },

    /**
     * Get current OS number without generating new one
     * @returns {string|null}
     */
    getCurrent() {
        return StorageManager.get(this.CURRENT_KEY);
    },

    /**
     * Set current OS number manually (useful for loading existing)
     * @param {string|number} number - OS number to set
     */
    setCurrent(number) {
        const numStr = String(number).padStart(this.PADDING, '0');
        StorageManager.set(this.CURRENT_KEY, numStr);

        const osNumberElement = document.getElementById('os-number');
        if (osNumberElement) {
            osNumberElement.textContent = numStr;
        }
    },

    /**
     * Reset counter (use with caution!)
     * @param {number} [startFrom=1] - Number to reset to
     */
    reset(startFrom = 1) {
        if (confirm('Tem certeza que deseja resetar o contador de OS? Esta ação não pode ser desfeita.')) {
            const numStr = String(startFrom).padStart(this.PADDING, '0');
            StorageManager.set(this.STORAGE_KEY, startFrom - 1);
            StorageManager.set(this.CURRENT_KEY, numStr);

            const osNumberElement = document.getElementById('os-number');
            if (osNumberElement) {
                osNumberElement.textContent = numStr;
            }

            console.log(`Contador resetado. Próxima OS será: ${numStr}`);
        }
    },

    /**
     * Initialize on page load
     * Shows the next number based on last stored, but doesn't generate yet
     */
    init() {
        const last = this.getLastNumber();
        const next = last ? String(parseInt(last, 10) + 1).padStart(this.PADDING, '0') : '000001';

        const osNumberElement = document.getElementById('os-number');
        if (osNumberElement) {
            osNumberElement.textContent = next;
        }

        console.log(`NumberGenerator: próximo número será ${next} (aguardando geração)`);
    },

    /**
     * Get the last generated number from storage
     * @returns {string|null}
     */
    getLastNumber() {
        return StorageManager.get(this.STORAGE_KEY);
    },
};

// Make available globally
if (typeof window !== 'undefined') {
    window.NumberGenerator = NumberGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumberGenerator;
}