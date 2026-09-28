// Inicializar utilizadores predefinidos
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { id: 1, name: 'Administrador Covão', email: 'admin@registos.com', password: '123', isAdmin: true },
        { id: 2, name: 'João Utilizador', email: 'user@registos.com', password: '123', isAdmin: false }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Injetar a estrutura do Modal Personalizado no corpo da página automaticamente se não existir
if (!document.getElementById('globalCustomModal')) {
    const modalHTML = `
        <div id="globalCustomModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:9999; padding:1rem;">
            <div style="background:white; padding:2rem; border-radius:12px; width:100%; max-width:400px; box-shadow:0 4px 20px rgba(0,0,0,0.15); text-align:center;">
                <div id="globalModalIcon" style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
                <h3 id="globalModalTitle" style="color: var(--color-primary, #0f766e); margin-bottom:0.5rem;">Aviso</h3>
                <p id="globalModalMessage" style="color: #64748b; margin-bottom:1.5rem; font-size:0.95rem;"></p>
                <button type="button" id="globalModalBtn" onclick="fecharModalGlobal()" style="padding:0.75rem 1.25rem; border-radius:6px; border:none; font-weight:600; cursor:pointer; background-color: var(--color-primary, #0f766e); color:white; width:100%;">OK</button>
            </div>
        </div>
    `;
    document.insertAdjacentHTML('beforeend', modalHTML);
}

let globalModalCallback = null;

function mostrarPopup(titulo, mensagem, icone = '🎉', callback = null) {
    document.getElementById('globalModalTitle').innerText = titulo;
    document.getElementById('globalModalMessage').innerText = mensagem;
    document.getElementById('globalModalIcon').innerText = icone;
    document.getElementById('globalCustomModal').style.display = 'flex';
    globalModalCallback = callback;
}

function fecharModalGlobal() {
    document.getElementById('globalCustomModal').style.display = 'none';
    if (typeof globalModalCallback === 'function') {
        globalModalCallback();
        globalModalCallback = null;
    }
}

// Ouvinte global para cliques (funciona sempre, mesmo que os elementos mudem)
document.addEventListener('click', (e) => {
    const loginScreen = document.getElementById('loginScreen');
    const registerScreen = document.getElementById('registerScreen');

    // Identificar se clicou no botão/link de Criar Conta (por ID, texto ou seletor)
    const target = e.target.closest('#showRegister, [href*="register"], .btn-register');
    const isRegisterText = e.target.innerText && (e.target.innerText.toLowerCase().includes('criar conta') || e.target.innerText.toLowerCase().includes('registar'));

    if ((target || isRegisterText) && loginScreen && registerScreen) {
        e.preventDefault();
        loginScreen.style.display = 'none';
        registerScreen.style.display = 'block';
        return;
    }

    // Identificar se clicou em Voltar ao Login
    const backTarget = e.target.closest('#backToLogin, [href*="login"], .btn-back');
    const isLoginText = e.target.innerText && (e.target.innerText.toLowerCase().includes('voltar ao login') || e.target.innerText.toLowerCase().includes('fazer login'));

    if ((backTarget || isLoginText) && loginScreen && registerScreen) {
        e.preventDefault();
        registerScreen.style.display = 'none';
        loginScreen.style.display = 'block';
        return;
    }
});

// Lógica de Login e Registo mal o DOM esteja pronto
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const users = JSON.parse(localStorage.getItem('users')) || [];

            const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (found) {
                localStorage.setItem('currentUser', JSON.stringify(found));
                window.location.href = 'dashboard.html';
            } else {
                mostrarPopup('Erro de Autenticação', 'Email ou password incorretos!', '⚠️');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputs = registerForm.querySelectorAll('input');
            if (inputs.length < 3) {
                mostrarPopup('Atenção', 'O formulário de registo precisa de ter os campos necessários.', '⚠️');
                return;
            }

            const nameVal = inputs[0].value.trim();
            const emailVal = inputs[1].value.trim().toLowerCase();
            const passVal = inputs[2].value.trim();

            if (!nameVal || !emailVal || !passVal) {
                mostrarPopup('Atenção', 'Por favor, preencha todos os campos do formulário.', '⚠️');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];

            const existe = users.some(u => u.email.toLowerCase() === emailVal);
            if (existe) {
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

            registerForm.reset();
            
            mostrarPopup('Conta Criada!', 'A sua conta foi registada com sucesso. Podes agora fazer login.', '🎉', () => {
                const loginScreen = document.getElementById('loginScreen');
                const registerScreen = document.getElementById('registerScreen');
                if (registerScreen && loginScreen) {
                    registerScreen.style.display = 'none';
                    loginScreen.style.display = 'block';
                }
            });
        });
    }
});
