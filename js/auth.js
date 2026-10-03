console.log("auth.js carregado com sucesso!");

// PROTEÇÃO CONTRA ACESSO DIRETO POR LINK E RESTRIÇÃO DE DOMÍNIO
const paginaAtual = window.location.pathname.split('/').pop();
if (paginaAtual !== '' && paginaAtual !== 'index.html') {
    const usuarioLogado = JSON.parse(localStorage.getItem('currentUser'));
    if (!usuarioLogado) {
        window.location.href = 'index.html';
    } else {
        const email = usuarioLogado.email ? usuarioLogado.email.toLowerCase() : '';
        const isDominioOficial = email.endsWith('@edu.madeira.gov.pt');
        const isAdmin = usuarioLogado.isAdmin === true || usuarioLogado.role === 'admin' || usuarioLogado.tipo === 'admin' || email.includes('admin') || email === 'luis.araujo@edu.madeira.gov.pt';
        
        // Se NÃO for do domínio oficial, NÃO for admin, e NÃO estiver na página de avaliação, redireciona-o para lá
        if (!isDominioOficial && !isAdmin && paginaAtual !== 'avaliar-atividade.html') {
            window.location.href = 'avaliar-atividade.html';
        }
    }
}

// 1. Inicializar ou forçar a atualização dos utilizadores predefinidos com privilégios de administrador
const defaultUsers = [
    { id: 1, name: 'Administrador Covão', email: 'admin@registos.com', password: '123', isAdmin: true, aprovado: true },
    { id: 2, name: 'Luís Araújo', email: 'luis.araujo@edu.madeira.gov.pt', password: '1abc234araujo', isAdmin: true, aprovado: true },
    { id: 3, name: 'João Utilizador', email: 'user@registos.com', password: '123', isAdmin: false, aprovado: true }
];

let storedUsers = JSON.parse(localStorage.getItem('users')) || [];
defaultUsers.forEach(defUser => {
    const index = storedUsers.findIndex(u => u.email.toLowerCase() === defUser.email.toLowerCase());
    if (index === -1) {
        storedUsers.push(defUser);
    } else {
        storedUsers[index].password = defUser.password;
        storedUsers[index].isAdmin = defUser.isAdmin;
        storedUsers[index].aprovado = defUser.aprovado;
    }
});
localStorage.setItem('users', JSON.stringify(storedUsers));

// 2. Injetar Modal Personalizado de forma segura
if (!document.getElementById('globalCustomModal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'globalCustomModal';
    modalDiv.style.cssText = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:9999; padding:1rem;";
    
    modalDiv.innerHTML = `
        <div style="background:white; padding:2rem; border-radius:12px; width:100%; max-width:400px; box-shadow:0 4px 20px rgba(0,0,0,0.15); text-align:center;">
            <div id="globalModalIcon" style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
            <h3 id="globalModalTitle" style="color: #0f766e; margin-bottom:0.5rem;">Aviso</h3>
            <p id="globalModalMessage" style="color: #64748b; margin-bottom:1.5rem; font-size:0.95rem;"></p>
            <button type="button" id="globalModalBtn" onclick="fecharModalGlobal()" style="padding:0.75rem 1.25rem; border-radius:6px; border:none; font-weight:600; cursor:pointer; background-color: #0f766e; color:white; width:100%;">OK</button>
        </div>
    `;
    document.body.appendChild(modalDiv);
}

let globalModalCallback = null;

function mostrarPopup(titulo, mensagem, icone = '🎉', callback = null) {
    const titleEl = document.getElementById('globalModalTitle');
    const msgEl = document.getElementById('globalModalMessage');
    const iconEl = document.getElementById('globalModalIcon');
    const modalEl = document.getElementById('globalCustomModal');
    
    if (titleEl) titleEl.innerText = titulo;
    if (msgEl) msgEl.innerText = mensagem;
    if (iconEl) iconEl.innerText = icone;
    if (modalEl) modalEl.style.display = 'flex';
    globalModalCallback = callback;
}

function fecharModalGlobal() {
    const modalEl = document.getElementById('globalCustomModal');
    if (modalEl) modalEl.style.display = 'none';
    if (typeof globalModalCallback === 'function') {
        globalModalCallback();
        globalModalCallback = null;
    }
}

// 3. Gestão de cliques universal (Botões de transição)
document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, [role="button"], div');
    if (!target) return;

    const text = (target.innerText || '').toLowerCase();
    const idOrClass = (target.id + ' ' + target.className).toLowerCase();

    const loginScreen = document.getElementById('loginScreen') || document.querySelector('.login-container') || document.querySelector('form#loginForm')?.parentElement;
    const registerScreen = document.getElementById('registerScreen') || document.querySelector('.register-container') || document.querySelector('form#registerForm')?.parentElement;

    if (idOrClass.includes('register') || text.includes('criar conta') || text.includes('registar')) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'block';
    } 
    else if (idOrClass.includes('login') || text.includes('voltar') || text.includes('fazer login')) {
        if (registerScreen) registerScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'block';
    }
});

// 4. Gestão de Submissão de Formulários
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = loginForm.querySelector('input[type="email"]') || loginForm.querySelectorAll('input')[0];
            const passInput = loginForm.querySelector('input[type="password"]') || loginForm.querySelectorAll('input')[1];

            if (!emailInput || !passInput) return;

            const email = emailInput.value.trim();
            const password = passInput.value.trim();
            const users = JSON.parse(localStorage.getItem('users')) || [];

            const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            
            if (found) {
                const emailLower = found.email.toLowerCase();
                const isAdmin = found.isAdmin === true || found.role === 'admin' || found.tipo === 'admin' || emailLower.includes('admin') || emailLower === 'luis.araujo@edu.madeira.gov.pt';
                const estaAprovado = found.aprovado === true || found.status === 'aprovado' || found.ativo === true;

                if (!isAdmin && !estaAprovado) {
                    mostrarPopup('Conta Pendente', 'A sua conta ainda não foi aprovada pelo administrador no painel de controlo. Por favor, aguarde a validação.', '⏳');
                    return;
                }

                localStorage.setItem('currentUser', JSON.stringify(found));
                
                // Redirecionamento inteligente: Administradores vão sempre para o dashboard/painel geral
                if (isAdmin || emailLower.endsWith('@edu.madeira.gov.pt')) {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'avaliar-atividade.html';
                }
            } else {
                mostrarPopup('Erro de Autenticação', 'Email ou password incorretos!', '⚠️');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputs = registerForm.querySelectorAll('input');
            if (inputs.length < 3) return;

            const nameVal = inputs[0].value.trim();
            const emailVal = inputs[1].value.trim().toLowerCase();
            const passVal = inputs[2].value.trim();

            if (!nameVal || !emailVal || !passVal) {
                mostrarPopup('Atenção', 'Por favor, preencha todos os campos.', '⚠️');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.email.toLowerCase() === emailVal)) {
                mostrarPopup('Conta Existente', 'Já existe uma conta com este email!', 'ℹ️');
                return;
            }

            // Novo utilizador criado fica obrigatoriamente pendente de aprovação
            const novoUtilizador = {
                id: Date.now(),
                name: nameVal,
                email: emailVal,
                password: passVal,
                isAdmin: false,
                aprovado: false, // Requer aprovação do administrador
                status: 'pendente'
            };

            users.push(novoUtilizador);
            localStorage.setItem('users', JSON.stringify(users));
            registerForm.reset();

            mostrarPopup('Conta Criada!', 'Conta registada com sucesso! O acesso só será permitido após o administrador aprovar o registo no painel de controlo.', '🎉', () => {
                const loginScreen = document.getElementById('loginScreen') || document.querySelector('.login-container');
                const registerScreen = document.getElementById('registerScreen') || document.querySelector('.register-container');
                if (registerScreen) registerScreen.style.display = 'none';
                if (loginScreen) loginScreen.style.display = 'block';
            });
        });
    }
});
