/**
 * MiPlace OS System - Form Handler
 * Manages form validation, auto-save, and data persistence
 */

const FormHandler = {
    form: null,
    autoSaveTimer: null,
    AUTO_SAVE_DELAY: 1200, // 1.2 second debounce
    _lastSavedHash: null,

    /**
     * Initialize the form handler
     */
    init() {
        this.form = document.getElementById('os-form');

        if (!this.form) {
            console.error('Formulário #os-form não encontrado');
            return;
        }

        this.loadSavedData();
        this.attachEventListeners();
        console.log('FormHandler initialized');
    },

    /**
     * Attach event listeners to form inputs
     */
    attachEventListeners() {
        // Use event delegation for efficiency
        this.form.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.debounce(this.handleInput.bind(this), this.AUTO_SAVE_DELAY)(e);
            }
        });

        this.form.addEventListener('change', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.handleChange(e);
            }
        });

        // Optional: prevent form submission via Enter key
        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                return false;
            }
        });
    },

    /**
     * Handle input events with debounce
     * @param {Event} e - Input event
     */
    handleInput(e) {
        this.saveField(e.target);
    },

    /**
     * Handle change events (for checkboxes, radios, selects)
     * @param {Event} e - Change event
     */
    handleChange(e) {
        this.saveField(e.target);
    },

    /**
     * Save a single field value
     * @param {HTMLInputElement|HTMLTextAreaElement} input - The input element
     */
    saveField(input) {
        const name = input.name;
        const value = input.type === 'radio' ? (input.checked ? input.value : null) : input.value;

        // Skip sensitive fields - don't save password
        if (name === 'senha') {
            return;
        }

        const currentData = this.getCurrentData();

        if (value === null || value.trim() === '') {
            delete currentData[name];
        } else {
            currentData[name] = value.trim();
        }

        // Apenas salva se os dados realmente mudaram (previne race condition)
        const currentHash = JSON.stringify(currentData);
        if (currentHash === this._lastSavedHash) {
            return;
        }
        
        this._lastSavedHash = currentHash;
        StorageManager.set(StorageManager.KEYS.DADOS, currentData);
        this.showAutoSaveNotification();
    },

    /**
     * Get current form data from all inputs
     * @returns {object} - Form data object
     */
    getCurrentData() {
        const formData = new FormData(this.form);
        const data = {};

        formData.forEach((value, key) => {
            // Remove valores vazios e null para não persistir campos apagados
            if (value !== null && value.trim() !== '') {
                data[key] = value.trim();
            }
        });

        return data;
    },

    /**
     * Save all form data (used on major actions)
     * @returns {object} - Form data
     */
    saveAll() {
        const data = this.getCurrentData();
        StorageManager.set(StorageManager.KEYS.DADOS, data);
        return data;
    },

    /**
     * Load saved data from localStorage and populate form
     */
    loadSavedData() {
        const saved = StorageManager.get(StorageManager.KEYS.DADOS);
        
        if (!saved) {
            // Primeiro acesso - preencher data de entrada automaticamente
            const dataEntrada = document.getElementById('data-entrada');
            if (dataEntrada && !dataEntrada.value) {
                const hoje = new Date();
                const dd = String(hoje.getDate()).padStart(2, '0');
                const mm = String(hoje.getMonth() + 1).padStart(2, '0');
                const yyyy = hoje.getFullYear();
                dataEntrada.value = `${dd}/${mm}/${yyyy}`;
            }
            return;
        }

        Object.keys(saved).forEach(key => {
            // Skip sensitive fields
            if (key === 'senha') return;

            const element = this.form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const radio = this.form.querySelector(`[name="${key}"][value="${saved[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = saved[key];
                }
            }
        });

        console.log('Form data loaded from storage (password excluded)');
    },

    /**
     * Show auto-save notification
     */
    showAutoSaveNotification() {
        const notification = document.getElementById('autosave-notification');
        if (notification) {
            notification.classList.remove('hidden');
            clearTimeout(this.notificationTimer);
            this.notificationTimer = setTimeout(() => {
                notification.classList.add('hidden');
            }, 2000);
        }
    },

    /**
     * Clear all form data and localStorage
     */
    clear() {
        if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
            this.form.reset();
            StorageManager.remove(StorageManager.KEYS.DADOS);

            // Clear password pattern if exists
            if (window.PasswordPattern) {
                PasswordPattern.clear();
            }

            // Reset date field
            const dataEntrada = document.getElementById('data-entrada');
            if (dataEntrada) {
                const hoje = new Date();
                const dd = String(hoje.getDate()).padStart(2, '0');
                const mm = String(hoje.getMonth() + 1).padStart(2, '0');
                const yyyy = hoje.getFullYear();
                dataEntrada.value = `${dd}/${mm}/${yyyy}`;
            }

            // Reset radio buttons to defaults
            this.form.querySelectorAll('input[type="radio"]').forEach(radio => {
                if (radio.defaultChecked) {
                    radio.checked = true;
                }
            });

            console.log('Form cleared');
        }
    },

    /**
     * Reset form silently without confirmation dialog
     * Used when starting a new OS
     */
    resetSilent() {
        if (!this.form) return;

        this.form.reset();
        StorageManager.remove(StorageManager.KEYS.DADOS);

        // Clear password pattern if exists
        if (window.PasswordPattern) {
            PasswordPattern.clear();
        }

        // Reset date field
        const dataEntrada = document.getElementById('data-entrada');
        if (dataEntrada) {
            const hoje = new Date();
            const dd = String(hoje.getDate()).padStart(2, '0');
            const mm = String(hoje.getMonth() + 1).padStart(2, '0');
            const yyyy = hoje.getFullYear();
            dataEntrada.value = `${dd}/${mm}/${yyyy}`;
        }

        // Reset radio buttons to defaults
        this.form.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (radio.defaultChecked) {
                radio.checked = true;
            }
        });

        console.log('Form reset silently');
    },

    /**
     * Get form data as plain object
     * @returns {object}
     */
    getData() {
        return this.getCurrentData();
    },

    /**
     * Validate form data
     * @returns {array} - Array of error messages, empty if valid
     */
    validate() {
        const data = this.getCurrentData();
        const errors = [];

        // Required fields validation
        const requiredFields = [
            'nome',
            'cpf_cnpj',
            'cep',
            'numero',
            'telefone',
            'marca',
            'modelo',
            'senha',
            'data_entrada',
            'problema'
        ];

        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                errors.push(`Campo obrigatório: ${this.getFieldLabel(field)}`);
            }
        });

        // Email validation if provided
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Email inválido');
        }

        // IMEI validation if provided
        if (data.imei && data.imei.length !== 15) {
            errors.push('IMEI deve conter 15 dígitos');
        }

        // CPF/CNPJ full validation with check digits
        if (data.cpf_cnpj) {
            const numbers = data.cpf_cnpj.replace(/\D/g, '');
            if (numbers.length < 11 || numbers.length > 14) {
                errors.push('CPF/CNPJ inválido');
            } else if (!this.isValidCpfCnpj(numbers)) {
                errors.push('CPF/CNPJ inválido - dígito verificador incorreto');
            }
        }

        // CEP validation
        if (data.cep && data.cep.replace(/\D/g, '').length !== 8) {
            errors.push('CEP deve conter 8 dígitos');
        }

        // Phone validation
        if (data.telefone) {
            const phoneNumbers = data.telefone.replace(/\D/g, '');
            if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
                errors.push('Telefone inválido');
            }
        }

        return errors;
    },

    /**
     * Get human-readable field label
     * @param {string} fieldName - Field name
     * @returns {string} - Label
     */
    getFieldLabel(fieldName) {
        const labels = {
            nome: 'Nome completo ou Razão Social',
            cpf_cnpj: 'CPF ou CNPJ',
            cep: 'CEP',
            numero: 'Número',
            telefone: 'Telefone',
            marca: 'Marca',
            modelo: 'Modelo',
            senha: 'Senha',
            data_entrada: 'Data de Entrada',
            problema: 'Problema relatado'
        };
        return labels[fieldName] || fieldName;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate CPF or CNPJ including check digits
     * @param {string} value - CPF or CNPJ only numbers
     * @returns {boolean}
     */
    isValidCpfCnpj(value) {
        const numbers = value.replace(/\D/g, '');
        
        if (numbers.length === 11) {
            // CPF Validation
            if (/^(\d)\1+$/.test(numbers)) return false;
            
            let sum = 0;
            for (let i = 0; i < 9; i++) sum += parseInt(numbers[i]) * (10 - i);
            let rest = sum % 11;
            let digit1 = rest < 2 ? 0 : 11 - rest;
            if (parseInt(numbers[9]) !== digit1) return false;
            
            sum = 0;
            for (let i = 0; i < 10; i++) sum += parseInt(numbers[i]) * (11 - i);
            rest = sum % 11;
            let digit2 = rest < 2 ? 0 : 11 - rest;
            return parseInt(numbers[10]) === digit2;
        }
        
        if (numbers.length === 14) {
            // CNPJ Validation
            if (/^(\d)\1+$/.test(numbers)) return false;
            
            const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
            const weights2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
            
            let sum = 0;
            for (let i = 0; i < 12; i++) sum += parseInt(numbers[i]) * weights1[i];
            let rest = sum % 11;
            let digit1 = rest < 2 ? 0 : 11 - rest;
            if (parseInt(numbers[12]) !== digit1) return false;
            
            sum = 0;
            for (let i = 0; i < 13; i++) sum += parseInt(numbers[i]) * weights2[i];
            rest = sum % 11;
            let digit2 = rest < 2 ? 0 : 11 - rest;
            return parseInt(numbers[13]) === digit2;
        }
        
        return false;
    },

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.FormHandler = FormHandler;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}