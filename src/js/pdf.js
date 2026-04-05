/**
 * MiPlace OS System - PDF Generator
 * Generates PDF from OS content using html2canvas and jsPDF
 */

const PDFGenerator = {
    /**
     * Generate PDF from OS content
     * @returns {Promise<void>}
     */
    async generate() {
        const element = document.getElementById('os-content');
        const osNumber = document.getElementById('os-number')?.textContent || 'unknown';

        if (!element) {
            console.error('Elemento #os-content não encontrado');
            alert('Erro ao gerar PDF: elemento não encontrado');
            return;
        }

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
            alert('Por favor, preencha todos os campos obrigatórios (*) antes de gerar o PDF.');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const placeholders = [];

        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!field.value.trim()) {
                placeholders.push({ field, placeholder: field.placeholder });
                field.placeholder = '';
            }
        });

        try {
            // Show generating message
            this.showGeneratingMessage();

            // Capture element as canvas
            const canvas = await this.captureElement(element);

            // Create PDF
            const pdf = this.createPDF(canvas);

            // Save PDF
            pdf.save(`OS_${osNumber}.pdf`);

            // Restore placeholders
            placeholders.forEach(item => {
                item.field.placeholder = item.placeholder;
            });

            // Clean up
            this.hideGeneratingMessage();
            console.log(`PDF gerado: OS_${osNumber}.pdf`);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            placeholders.forEach(item => {
                item.field.placeholder = item.placeholder;
            });
            this.hideGeneratingMessage();
            alert('Erro ao gerar PDF. Verifique o console para detalhes ou use a função de impressão.');
        }
    },

    /**
     * Capture HTML element as canvas
     * @param {HTMLElement} element - Element to capture
     * @returns {Promise<HTMLCanvasElement>}
     */
    async captureElement(element) {
        return await html2canvas(element, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            ignoreElements: (element) => {
                // Skip buttons and modals
                return element.classList.contains('no-print') ||
                       element.tagName === 'BUTTON' ||
                       element.closest('.modal-overlay');
            }
        });
    },

    /**
     * Create PDF document from canvas
     * @param {HTMLCanvasElement} canvas - Canvas to convert
     * @returns {jsPDF} - PDF document
     */
    createPDF(canvas) {
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png', 1.0);

        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 10;

        // Calculate image dimensions to fit width
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Add metadata
        const osNumber = document.getElementById('os-number')?.textContent || '';
        pdf.setProperties({
            title: `OS_${osNumber}`,
            subject: 'Ordem de Serviço MiPlace',
            author: 'MiPlace',
            creator: 'MiPlace OS System'
        });

        // Add image (may span multiple pages)
        let heightLeft = imgHeight;
        let position = margin;

        // First page
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - margin - margin);

        // Additional pages if needed
        while (heightLeft > 0) {
            pdf.addPage();
            position = -(imgHeight - heightLeft) - (pdfHeight - margin - margin);
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - margin - margin);
        }

        return pdf;
    },

    /**
     * Show "generating PDF" message
     */
    showGeneratingMessage() {
        // Could add a loading overlay if needed
        const existing = document.getElementById('pdf-loading');
        if (!existing) {
            const loading = document.createElement('div');
            loading.id = 'pdf-loading';
            loading.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 20px 40px;
                    border-radius: 8px;
                    z-index: 10000;
                    font-family: sans-serif;
                ">Gerando PDF...</div>
            `;
            document.body.appendChild(loading);
        }
    },

    /**
     * Hide "generating PDF" message
     */
    hideGeneratingMessage() {
        const loading = document.getElementById('pdf-loading');
        if (loading) {
            loading.remove();
        }
    },

    /**
     * Download current form data as JSON backup
     * @param {object} data - Form data to save
     */
    downloadJSONBackup(data) {
        const osNumber = document.getElementById('os-number')?.textContent || Date.now();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OS_${osNumber}_backup.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.PDFGenerator = PDFGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}