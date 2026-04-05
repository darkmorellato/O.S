/**
 * MiPlace OS System - Mask Utilities
 * Input masking for CPF/CNPJ, CEP, Phone, Date, IMEI, State
 */

const MaskUtils = {
    /**
     * Apply mask to CPF/CNPJ field
     * @param {string} value - Raw input value
     * @returns {string} - Masked value
     */
    cpfCnpj(value) {
        const numbers = value.replace(/\D/g, '').slice(0, 14);

        if (numbers.length > 11) {
            // CNPJ format: 00.000.000/0000-00
            return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        }

        // CPF format: 000.000.000-00
        return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    },

    /**
     * Apply mask to CEP field
     * @param {string} value - Raw input value
     * @returns {string} - Masked value (00000-000)
     */
    cep(value) {
        const numbers = value.replace(/\D/g, '').slice(0, 8);

        if (numbers.length > 5) {
            return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
        }

        return numbers;
    },

    /**
     * Apply mask to phone field
     * Supports both (00) 00000-0000 (11 digits) and (00) 0000-0009 (10 digits)
     * @param {string} value - Raw input value
     * @returns {string} - Masked value
     */
    phone(value) {
        const numbers = value.replace(/\D/g, '').slice(0, 11);

        if (numbers.length === 11) {
            // With DDD: (00) 00000-0000
            return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        }

        if (numbers.length > 6) {
            // (00) 0000-000 or (00) 00000-00
            return numbers.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
        }

        if (numbers.length > 2) {
            // (00) or (00) 000
            return numbers.replace(/^(\d{2})(\d{0,4})$/, '($1) $2');
        }

        return numbers;
    },

    /**
     * Apply mask to date field
     * Format: dd/mm/yyyy
     * @param {string} value - Raw input value
     * @returns {string} - Masked value
     */
    date(value) {
        const numbers = value.replace(/\D/g, '').slice(0, 8);

        if (numbers.length > 4) {
            return numbers.replace(/^(\d{2})(\d{2})(\d{4})$/, '$1/$2/$3');
        }

        if (numbers.length > 2) {
            return numbers.replace(/^(\d{2})(\d{2})$/, '$1/$2');
        }

        return numbers;
    },

    /**
     * Apply mask to IMEI field (only numbers, max 15 digits)
     * @param {string} value - Raw input value
     * @returns {string} - Clean numeric value
     */
    imei(value) {
        return value.replace(/\D/g, '').slice(0, 15);
    },

    /**
     * Apply mask to state field (UF - only uppercase letters, max 2)
     * @param {string} value - Raw input value
     * @returns {string} - Uppercase state abbreviation
     */
    state(value) {
        return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    },

    /**
     * Apply mask to an input element based on type
     * @param {HTMLInputElement} input - The input element
     * @param {string} maskType - Type of mask to apply
     */
    apply(input, maskType) {
        if (this[maskType]) {
            input.value = this[maskType](input.value);
        }
    },

    /**
     * Setup all masks on their respective inputs
     */
    setupAll() {
        const cpfCnpjInput = document.getElementById('cpf-cnpj');
        const cepInput = document.getElementById('cep');
        const telefoneInput = document.getElementById('telefone');
        const estadoInput = document.getElementById('estado');
        const imeiInput = document.getElementById('imei');
        const dataEntrada = document.getElementById('data-entrada');
        const dataSaida = document.getElementById('data-saida');

        if (cpfCnpjInput) {
            cpfCnpjInput.addEventListener('input', (e) => {
                this.apply(e.target, 'cpfCnpj');
            });
        }

        if (cepInput) {
            cepInput.addEventListener('input', (e) => {
                this.apply(e.target, 'cep');
            });
        }

        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                this.apply(e.target, 'phone');
            });
        }

        if (estadoInput) {
            estadoInput.addEventListener('input', (e) => {
                this.apply(e.target, 'state');
            });
        }

        if (imeiInput) {
            imeiInput.addEventListener('input', (e) => {
                this.apply(e.target, 'imei');
            });
        }

        const dateInputs = [dataEntrada, dataSaida].filter(Boolean);
        dateInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.apply(e.target, 'date');
            });
        });
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaskUtils;
}