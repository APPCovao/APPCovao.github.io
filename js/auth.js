// Inicializar utilizadores predefinidos caso não existam
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { id: 1, name: 'Administrador Covão', email: 'admin@registos.com', password: '123', isAdmin: true },
        { id: 2, name: 'João Utilizador', email: 'user@registos.com', password: '123', isAdmin: false }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Injetar Modal Personalizado se não existir
if (!document.getElementById('globalCustomModal')) {
    const modalHTML = `
        <div id="globalCustomModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:9999; padding:1rem;">
            <div style="background:white; padding:2rem; border-radius:12px; width:100%; max-width:400px; box-shadow:0 4px 20px rgba(0,0,0,0.15); text-align:center;">
                <div id="globalModalIcon" style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
                <h3 id="globalModalTitle" style="color: #0f766e; margin-bottom:0.5rem;">Aviso</h3>
                <p id="globalModalMessage" style="color: #64748b; margin-bottom:1.5rem; font-size:0.95rem;"></p>
                <button type="button" id="globalModalBtn" onclick="fecharModalGlobal()" style="padding:0.75rem 1.25rem; border-radius:6px; border:none; font-weight:600; cursor:pointer; background-color: #0f766e; color:white; width:100%;">OK</button>
            </div>
        </div>
    `;
    document.insertAdjacentHTML('beforeend', modalHTML);
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

// Alternância de ecrãs inteligente e global baseada em cliques
document.addEventListener('click', (e) => {
    const loginScreen = document.getElementById('loginScreen') || document.querySelector('.login-screen') || document.querySelector('#loginForm')?.closest('div');
    const registerScreen = document.getElementById('registerScreen') || document.querySelector('.register-screen') || document.querySelector('#registerForm')?.closest('div');

    const target = e.target.closest('button, a, [role="button"]');
    if (!target) return;

    const text = (target.innerText || '').toLowerCase();
    const idOrClass = (target.id + ' ' + target.className).toLowerCase();

    if (idOrClass.includes('register') || text.includes('criar conta') || text.includes('registar')) {
        e.preventDefault();
        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'block';
    } else if (idOrClass.includes('login') || text.includes('voltar') || text.includes('fazer login')) {
        e.preventDefault();
        if (registerScreen) registerScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'block';
    }
});

// Processamento automático de todos os formulários da página
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = form.querySelectorAll('input');
            
            // Formulário de Registo (3 ou mais campos: Nome, Email, Password)
            if (inputs.length >= 3) {
                const nameVal = inputs[0].value.trim();
                const emailVal = inputs[1].value.trim().toLowerCase();
                const passVal = inputs[2].value.trim();

                if (!nameVal || !emailVal || !passVal) {
                    mostrarPopup('Atenção', 'Por favor, preencha todos os campos do registo.', '⚠️');
                    return;
                }

                let users = JSON.parse(localStorage.getItem('users')) || [];
                if (users.some(u => u.email.toLowerCase() === emailVal)) {
                    mostrarPopup('Conta Existente', 'Já existe uma conta registada com este email!', 'ℹ️');
                    return;
                }

                const novoUtilizador = {
                    id: Date.now(),
                    name: nameVal,
                    email: emailVal,
                    password: passVal,
                    isAdmin: false
                };

                users.push(novoUtilizador);
                localStorage.setItem('users', JSON.stringify(users));
                form.reset();

                mostrarPopup('Conta Criada!', 'Conta criada com sucesso! Podes agora fazer login.', '🎉', () => {
                    const loginScreen = document.getElementById('loginScreen') || document.querySelector('.login-screen');
                    const registerScreen = document.getElementById('registerScreen') || document.querySelector('.register-screen');
                    if (registerScreen) registerScreen.style.display = 'none';
                    if (loginScreen) loginScreen.style.display = 'block';
                });

            } 
            // Formulário de Login (2 campos: Email e Password)
            else if (inputs.length === 2) {
                const emailVal = inputs[0].value.trim();
                const passVal = inputs[1].value.trim();

                let users = JSON.parse(localStorage.getItem('users')) || [];
                const found = users.find(u => u.email.toLowerCase() === emailVal.toLowerCase() && u.password === passVal);

                if (found) {
                    localStorage.setItem('currentUser', JSON.stringify(found));
                    window.location.href = 'dashboard.html';
                } else {
                    mostrarPopup('Erro de Autenticação', 'Email ou password incorretos!', '⚠️');
                }
            }
        });
    });
});
