/**
 * MiPlace OS System - Password Pattern Handler
 * 3x3 grid with 4 quadrants per circle, numbers 1-36, connected lines
 */

const PasswordPattern = {
    container: null,
    hiddenInput: null,
    svgOverlay: null,
    statusText: null,
    counter: 1,
    connectionPoints: [],
    
    // Paleta de cores individuais para cada ponto (1 até 9)
    POINT_COLORS: [
        '#ef4444',  // 1: Vermelho
        '#f97316',  // 2: Laranja
        '#eab308',  // 3: Amarelo
        '#22c55e',  // 4: Verde
        '#06b6d4',  // 5: Ciano
        '#3b82f6',  // 6: Azul
        '#8b5cf6',  // 7: Roxo
        '#ec4899',  // 8: Rosa
        '#f43f5e'   // 9: Vermelho Escuro
    ],

    init() {
        this.container = document.getElementById('password-pattern-container');
        this.hiddenInput = document.getElementById('password-pattern');
        
        if (!this.container) {
            console.warn('Password pattern container not found');
            return;
        }

        this.renderGrid();
        this.loadFromStorage();
        
        window.addEventListener('resize', () => this.redrawLines());
        
        // Eventos para corrigir alinhamento da linha na impressão
        window.addEventListener('beforeprint', () => this.redrawLines());
        window.addEventListener('afterprint', () => this.redrawLines());
    },

    renderGrid() {
        this.container.innerHTML = '';
        
        // Create wrapper for grid and SVG overlay
        const wrapper = document.createElement('div');
        wrapper.className = 'pattern-grid-wrapper';
        
        // Create SVG overlay for lines
        this.svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgOverlay.classList.add('pattern-svg-overlay');
        
        // Create grid
        const grid = document.createElement('div');
        grid.className = 'pattern-grid';
        
        // Create 9 circles
        for (let i = 1; i <= 9; i++) {
            const circle = document.createElement('div');
            circle.className = 'pattern-circle';
            circle.dataset.circleId = i;
            
            // 4 quadrants: tl, tr, bl, br
            const quadrants = ['tl', 'tr', 'bl', 'br'];
            quadrants.forEach(q => {
                const quadrant = document.createElement('div');
                quadrant.className = 'pattern-quadrant';
                quadrant.dataset.circleId = i;
                quadrant.dataset.quadId = q;
                quadrant.addEventListener('click', (e) => this.handleClick(e, quadrant));
                circle.appendChild(quadrant);
            });
            
            grid.appendChild(circle);
        }
        
        wrapper.appendChild(this.svgOverlay);
        wrapper.appendChild(grid);
        this.container.appendChild(wrapper);
        
        // Create status and clear button
        const controls = document.createElement('div');
        controls.className = 'pattern-controls';
        
        this.statusText = document.createElement('span');
        this.statusText.className = 'pattern-status';
        this.statusText.textContent = 'Selecione o primeiro quadrante...';
        
        const clearBtn = document.createElement('button');
        clearBtn.className = 'pattern-clear-btn';
        clearBtn.textContent = 'Limpar';
        clearBtn.addEventListener('click', () => this.clear());
        
        controls.appendChild(this.statusText);
        controls.appendChild(clearBtn);
        this.container.appendChild(controls);
    },

    handleClick(quadrant, element) {
        if (element.classList.contains('selected')) return;
        
        element.classList.add('selected');
        
        const badge = document.createElement('span');
        badge.className = 'pattern-number-badge';
        badge.textContent = this.counter;
        element.appendChild(badge);
        
        this.connectionPoints.push({
            element: element,
            order: this.counter
        });
        
        this.statusText.textContent = `Quadrantes selecionados: ${this.counter}`;
        
        this.calculateAndDrawLine(element);
        
        this.counter++;
        this.updatePattern();
    },

    calculateAndDrawLine(quadrant) {
        const wrapper = this.container.querySelector('.pattern-grid-wrapper');
        const wrapperRect = wrapper.getBoundingClientRect();
        const quadRect = quadrant.getBoundingClientRect();
        
        const centerX = quadRect.left - wrapperRect.left + (quadRect.width / 2);
        const centerY = quadRect.top - wrapperRect.top + (quadRect.height / 2);
        
        this.connectionPoints[this.connectionPoints.length - 1].x = centerX;
        this.connectionPoints[this.connectionPoints.length - 1].y = centerY;
        
        this.drawLines();
    },

    drawLines() {
        this.svgOverlay.innerHTML = '';
        
        if (this.connectionPoints.length < 2) return;
        
        // Sort by order
        const sorted = [...this.connectionPoints].sort((a, b) => a.order - b.order);
        
        for (let i = 1; i < sorted.length; i++) {
            const p1 = sorted[i - 1];
            const p2 = sorted[i];
            
            if (p1.x === undefined || p2.x === undefined) continue;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', p1.x);
            line.setAttribute('y1', p1.y);
            line.setAttribute('x2', p2.x);
            line.setAttribute('y2', p2.y);
            line.classList.add('pattern-connection-line');
            this.svgOverlay.appendChild(line);
        }
    },

    redrawLines() {
        const wrapper = this.container.querySelector('.pattern-grid-wrapper');
        if (!wrapper) return;
        
        const wrapperRect = wrapper.getBoundingClientRect();
        
        this.connectionPoints.forEach(point => {
            if (point.element) {
                const quadRect = point.element.getBoundingClientRect();
                point.x = quadRect.left - wrapperRect.left + (quadRect.width / 2);
                point.y = quadRect.top - wrapperRect.top + (quadRect.height / 2);
            }
        });
        
        this.drawLines();
    },

    updatePattern() {
        const patternData = this.connectionPoints
            .sort((a, b) => a.order - b.order)
            .map(p => ({
                c: parseInt(p.element.dataset.circleId),
                q: p.element.dataset.quadId,
                n: p.order
            }));
        
        if (this.hiddenInput) {
            this.hiddenInput.value = JSON.stringify(patternData);
        }
        
        if (patternData.length > 0) {
            StorageManager.set('os_password_pattern', this.hiddenInput.value);
        } else {
            StorageManager.remove('os_password_pattern');
        }
    },

    loadFromStorage() {
        const saved = StorageManager.get('os_password_pattern');
        if (saved && this.hiddenInput && this.container) {
            try {
                this.hiddenInput.value = saved;
                const patternData = JSON.parse(saved);
                
                this.counter = patternData.length + 1;
                this.statusText.textContent = `Quadrantes selecionados: ${patternData.length}`;
                
                patternData.forEach(p => {
                    const circle = this.container.querySelector(`[data-circle-id="${p.c}"]`);
                    if (circle) {
                        const quadrant = circle.querySelector(`[data-quad-id="${p.q}"]`);
                        if (quadrant) {
        quadrant.classList.add('selected');
        // Aplica cor individual para cada ponto selecionado
        const pointColor = this.POINT_COLORS[this.counter - 1];
        quadrant.style.backgroundColor = pointColor;
        
        const badge = document.createElement('div');
        badge.className = 'pattern-number-badge';
        badge.textContent = this.counter;
        badge.style.backgroundColor = '#fff';
        badge.style.color = pointColor;
        quadrant.appendChild(badge);
                            
                            this.connectionPoints.push({
                                element: quadrant,
                                order: p.n
                            });
                        }
                    }
                });
                
                setTimeout(() => this.redrawLines(), 150);
            } catch (e) {
                console.error('Error loading password pattern:', e);
            }
        }
    },

    clear() {
        this.counter = 1;
        this.connectionPoints = [];
        this.statusText.textContent = 'Selecione o primeiro quadrante...';
        
        if (this.svgOverlay) {
            this.svgOverlay.innerHTML = '';
        }
        
        const quadrants = this.container.querySelectorAll('.pattern-quadrant');
        quadrants.forEach(q => {
            q.classList.remove('selected');
            q.innerHTML = '';
        });
        
        if (this.hiddenInput) {
            this.hiddenInput.value = '';
        }
        
        StorageManager.remove('os_password_pattern');
    }
};

if (typeof window !== 'undefined') {
    window.PasswordPattern = PasswordPattern;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordPattern;
}