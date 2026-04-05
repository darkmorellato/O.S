# MiPlace OS System 🚀

Sistema profissional de Ordem de Serviço para assistência técnica MiPlace.

## ✨ Design Visual

**Layout limpo e moderno:**
- Header com gradiente azul e detalhe lime
- Cards com bordas sutis e sombras suaves
- Formulário em seções organizadas
- Tipografia clara e hierárquica
- Espaçamento generoso e respiro visual
- Responsivo para dispositivos móveis

## 📋 Funcionalidades

- ✅ Auto-save com notificação toast
- ✅ Busca CEP automática (ViaCEP)
- ✅ Máscaras de formatação (CPF/CNPJ, telefone, data, CEP)
- ✅ Geração sequencial de números OS
- ✅ Impressão otimizada para A4
- ✅ Download PDF em alta qualidade
- ✅ Validação de campos obrigatórios
- ✅ Limpeza segura de dados sensíveis (senha não é salva)

## 🗂️ Estrutura do Projeto

```
/
├── index.html                 # HTML semântico e limpo
├── src/
│   ├── css/
│   │   ├── base.css          # Variáveis CSS e reset
│   │   ├── layout.css        # Layout principal, header, modal, welcome
│   │   ├── components.css    # Componentes: forms, botões, cards
│   │   └── print.css         # Estilos otimizados para impressão
│   └── js/
│       ├── masks.js          # Formatação de inputs
│       ├── storage.js        # Gerenciamento localStorage
│       ├── cep.js            # Serviço ViaCEP com cache
│       ├── numberGenerator.js
│       ├── ui.js             # Controlador de interface
│       ├── form.js           # Validação e autosave
│       ├── pdf.js            # Geração PDF
│       └── app.js            # Inicialização
└── README.md
```

## 🎨 Paleta de Cores

- **Primária (Lime):** `#84cc16` - Ação, destaque
- **Secundária (Blue):** `#2563eb` - Botões secundários
- **Fundo:** `#f8fafc` - Cinza muito claro
- **Texto:** `#334155` - Cinza escuro
- **Bordas:** `#e2e8f0` - Cinza claro

## 🚀 Como Usar

1. **Abrir:** Dê duplo clique em `index.html`
2. **Nova OS:** Clique no botão centralizado na tela de boas-vindas
3. **Preencher:** O formulário salva automaticamente
4. **Imprimir/PDF:** Use os botões no final
5. **Limpar:** Reinicia o formulário atual

## 🔒 Segurança

- Senha do aparelho **NÃO** é armazenada no localStorage
- Dáveis sensíveis são limpos ao gerar nova OS
- Validação básica no frontend
- Recomenda-se validação backend para produção

## 📱 Responsividade

- Desktop: layout com 2 colunas
- Tablet: ajuste de grid
- Mobile: todos os campos full-width com padding reduzido

## 🛠️ Personalização Rápida

### Alterar cores
Edite `src/css/base.css` na seção `:root`:

```css
:root {
    --color-primary: #84cc16;      /* Verde lime */
    --color-secondary: #2563eb;    /* Azul */
    /* ... */
}
```

### Modificar textos
Edite diretamente em `index.html` - todos os textos estão visíveis.

### Trocar logo
Linha 60 em `index.html`:
```html
<img src="caminho/para/sua-logo.svg" alt="Logo MiPlace" class="os-header__logo">
```

## 📄 Impressão

- Layout otimizado para A4 retrato
- Estilos separados em `print.css`
- Remove botões e elementos desnecessários
- Mantém apenas conteúdo essencial

## 🐛 Issues conhecidas

- PDF gerado via imagem pode ter resolução reduzida em telas 4K
- API ViaCEP pode ter instabilidades (sistema continua funcionando)

## 📝 Próximas melhorias (futuro)

- Backend para armazenamento definitivo
- Assinatura digital
- Dashboard com relatórios
- Histórico de OS
- Múltiplos usuários

---

**Versão:** 2.0  
**Desenvolvido:** Abril 2025  
**Tecnologias:** HTML5, CSS3, JavaScript ES6+, Tailwind CSS

✅ Pronto para produção!