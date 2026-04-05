document.addEventListener('DOMContentLoaded', () => {
    carregarDadosSalvos();
    adicionarEventListeners();
    configurarMascaras();
});

function iniciarNovaOS() {
    const welcomeScreen = document.getElementById('welcome-screen');
    welcomeScreen.classList.add('hidden');

    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        document.getElementById('os-content').style.display = 'block';
        gerarNumeroOS();
        definirDataEntrada();
    }, 500);
}

function configurarMascaras() {
    const cpfCnpj = document.getElementById('cpf-cnpj');
    const cep = document.getElementById('cep');
    const telefone = document.getElementById('telefone');
    const estado = document.getElementById('estado');
    const imei = document.getElementById('imei');
    
    cpfCnpj.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 14);
        if (value.length > 11) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        } else {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        }
        e.target.value = value;
    });
    
    imei.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 15);
    });
    
    cep.addEventListener('blur', buscarCEP);
    cep.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
        }
        e.target.value = value;
    });
    
    telefone.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (value.length === 11) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1)$2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1)$2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,4})$/, '($1)$2');
        }
        e.target.value = value;
    });
    
    estado.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    });
    
    const dataEntrada = document.getElementById('data-entrada');
    const dataSaida = document.getElementById('data-saida');
    
    [dataEntrada, dataSaida].forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '').slice(0, 8);
                if (value.length > 4) {
                    value = value.replace(/^(\d{2})(\d{2})(\d{4})$/, '$1/$2/$3');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})(\d{2})$/, '$1/$2');
                }
                e.target.value = value;
            });
        }
    });
}

async function buscarCEP() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('endereco').value = data.logradouro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf || '';
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
}

function gerarNumeroOS() {
    let ultimoNumero = localStorage.getItem('os_ultimo_numero');
    let novoNumero;
    
    if (ultimoNumero) {
        novoNumero = String(parseInt(ultimoNumero) + 1).padStart(6, '0');
    } else {
        novoNumero = '000001';
    }
    
    localStorage.setItem('os_ultimo_numero', novoNumero);
    localStorage.setItem('os_numero', novoNumero);
    document.getElementById('os-number').textContent = novoNumero;
}

function novaOrdemServico() {
    if (confirm('Isso irá limpar o formulário atual e gerar uma nova OS. Continuar?')) {
        localStorage.removeItem('os_dados');
        gerarNumeroOS();
        definirDataEntrada();
        document.getElementById('os-form').reset();
        
        // Atualiza os radios para o padrão
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (radio.defaultChecked) {
                radio.checked = true;
            }
        });
        
        alert(`Nova OS ${document.getElementById('os-number').textContent} iniciada!`);
    }
}

function definirDataEntrada() {
    const hoje = new Date();
    const dd = String(hoje.getDate()).padStart(2, '0');
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const yyyy = hoje.getFullYear();
    document.getElementById('data-entrada').value = `${dd}/${mm}/${yyyy}`;
}

function adicionarEventListeners() {
    const form = document.getElementById('os-form');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', debounce(salvarDados, 1000));
        input.addEventListener('change', salvarDados);
    });
}

function debounce(func, wait) {
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

function salvarDados() {
    const form = document.getElementById('os-form');
    const formData = new FormData(form);
    const dados = {};
    
    formData.forEach((value, key) => {
        if (dados[key]) {
            if (Array.isArray(dados[key])) {
                dados[key].push(value);
            } else {
                dados[key] = [dados[key], value];
            }
        } else {
            dados[key] = value;
        }
    });
    
    localStorage.setItem('os_dados', JSON.stringify(dados));
    
    const notification = document.getElementById('autosave-notification');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

function carregarDadosSalvos() {
    const dadosSalvos = localStorage.getItem('os_dados');
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        const form = document.getElementById('os-form');
        
        Object.keys(dados).forEach(key => {
            const element = form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${dados[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = dados[key];
                }
            }
        });
    }
}

function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
        const form = document.getElementById('os-form');
        form.reset();
        localStorage.removeItem('os_dados');
        definirDataEntrada();
    }
}

function imprimirOS() {
    window.print();
    setTimeout(() => {
        document.getElementById('post-print-modal').style.display = 'flex';
    }, 1000);
}

function reimprimirOS() {
    document.getElementById('post-print-modal').style.display = 'none';
    window.print();
    setTimeout(() => {
        document.getElementById('post-print-modal').style.display = 'flex';
    }, 1000);
}

function novaOSPosImpressao() {
    document.getElementById('post-print-modal').style.display = 'none';
    localStorage.removeItem('os_dados');
    gerarNumeroOS();
    definirDataEntrada();
    document.getElementById('os-form').reset();
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.defaultChecked) {
            radio.checked = true;
        }
    });
}

async function downloadPDF() {
    const element = document.getElementById('os-content');
    const osNumber = document.getElementById('os-number').textContent;
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`OS_${osNumber}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Tente usar a função de imprimir e selecione "Salvar como PDF".');
    }
}
