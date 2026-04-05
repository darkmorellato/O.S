/**
 * MiPlace OS System - UI Controller
 * Manages UI interactions, modals, and view transitions
 */

const UIController = {
    /**
     * Initialize UI controller
     */
    init() {
        this.setupEventListeners();
        console.log('UIController initialized');
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Button click handlers are inline in HTML for simplicity
        // This method can be extended for global hotkeys, etc.
    },

    /**
     * Show welcome screen
     */
    showWelcome() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const osContent = document.getElementById('os-content');

        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
            setTimeout(() => {
                welcomeScreen.style.display = 'flex';
                if (osContent) osContent.style.display = 'none';
            }, 10);
        }
    },

    /**
     * Hide welcome screen and show OS content
     */
    hideWelcome() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const osContent = document.getElementById('os-content');

        if (welcomeScreen) {
            // Reset form and clear any saved data
            if (window.FormHandler) {
                FormHandler.resetSilent();
            }

            // Generate new OS number
            NumberGenerator.gerar();

            welcomeScreen.classList.add('hidden');
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                if (osContent) {
                    osContent.classList.remove('hidden');

                    // Set entry date if empty (should be already set by resetSilent, but just in case)
                    const dataEntrada = document.getElementById('data-entrada');
                    if (dataEntrada && !dataEntrada.value) {
                        const hoje = new Date();
                        const dd = String(hoje.getDate()).padStart(2, '0');
                        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
                        const yyyy = hoje.getFullYear();
                        dataEntrada.value = `${dd}/${mm}/${yyyy}`;
                    }
                }
            }, 500);
        }
    },

    /**
     * Show post-print modal
     */
    showPostPrintModal() {
        const modal = document.getElementById('post-print-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Prevent scrolling while modal is open
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Hide post-print modal
     */
    hidePostPrintModal() {
        const modal = document.getElementById('post-print-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    /**
     * Start new OS after printing
     * Clears form, generates new number, resets date
     */
    startNewOS() {
        this.hidePostPrintModal();

        // Reset form and clear stored data silently
        if (window.FormHandler) {
            FormHandler.resetSilent();
        }

        // Generate new OS number
        NumberGenerator.gerar();

        console.log('New OS started');
    },

    /**
     * Show notification (simple version without Toast library)
     * @param {string} message - Message to show
     * @param {string} [type='info'] - Message type (info, success, error, warning)
     * @param {number} [duration=3000] - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existing = document.querySelector('.custom-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.textContent = message;

        // Style based on type
        const styles = {
            info: {
                background: '#dbeafe',
                border: '1px solid #3b82f6',
                color: '#1e40af'
            },
            success: {
                background: '#d1fae5',
                border: '1px solid #10b981',
                color: '#065f46'
            },
            error: {
                background: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#991b1b'
            },
            warning: {
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                color: '#92400e'
            }
        };

        const typeStyle = styles[type] || styles.info;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: ${typeStyle.background};
            border: ${typeStyle.border};
            border-radius: 8px;
            color: ${typeStyle.color};
            font-family: var(--font-family-base, sans-serif);
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    },

    /**
     * Show loading state on a button
     * @param {HTMLButtonElement} button - Button element
     * @param {string} [originalText] - Original text to restore later
     */
    showButtonLoading(button, originalText) {
        if (!button) return;

        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
                    <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite"/>
                </circle>
            </svg>
            Processando...
        `;
    },

    /**
     * Restore button to normal state
     * @param {HTMLButtonElement} button - Button element
     */
    hideButtonLoading(button) {
        if (!button) return;

        button.disabled = false;
        const originalText = button.dataset.originalText || 'OK';
        button.textContent = originalText;
    },

    /**
     * Print the OS document
     */
    print() {
        const form = document.getElementById('os-form');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalid = null;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                if (!firstInvalid) firstInvalid = field;
            }
        });

        if (!isValid) {
            alert('Por favor, preencha todos os campos obrigatórios (*) antes de imprimir.');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!field.value.trim()) {
                field.dataset.placeholder = field.placeholder;
                field.placeholder = '';
            }
        });

        window.print();

        setTimeout(() => {
            form.querySelectorAll('input, textarea, select').forEach(field => {
                if (field.dataset.placeholder) {
                    field.placeholder = field.dataset.placeholder;
                    delete field.dataset.placeholder;
                }
            });
            this.showPostPrintModal();
        }, 1000);
    },

    /**
     * Re-print the document
     */
    reprint() {
        this.hidePostPrintModal();
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                this.showPostPrintModal();
            }, 1000);
        }, 100);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.UIController = UIController;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}