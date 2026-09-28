// Inicializar utilizadores predefinidos
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { id: 1, name: 'Administrador Covão', email: 'admin@registos.com', password: '123', isAdmin: true },
        { id: 2, name: 'João Utilizador', email: 'user@registos.com', password: '123', isAdmin: false }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Alternar entre Login e Criar Conta
const showRegister = document.getElementById('showRegister');
const backToLogin = document.getElementById('backToLogin');
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');

if (showRegister) {
    showRegister.addEventListener('click', () => {
        loginScreen.style.display = 'none';
        registerScreen.style.display = 'block';
    });
}
if (backToLogin) {
    backToLogin.addEventListener('click', () => {
        registerScreen.style.display = 'none';
        loginScreen.style.display = 'block';
    });
}

// Lógica de Login
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
            alert('Email ou password incorretos!');
        }
    });
}

// Lógica de Registo de Nova Conta (Adicionada)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Ajusta os IDs conforme os inputs que tens no teu HTML de registo (ex: regName, regEmail, regPassword)
        const nameInput = document.getElementById('regName') || document.getElementById('name');
        const emailInput = document.getElementById('regEmail') || document.getElementById('emailRegister') || document.getElementById('email');
        const passInput = document.getElementById('regPassword') || document.getElementById('passwordRegister') || document.getElementById('password');

        if (!nameInput || !emailInput || !passInput) {
            alert('Erro nos campos do formulário de registo.');
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passInput.value.trim();

        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Verificar se já existe um utilizador com o mesmo email
        const existe = users.some(u => u.email.toLowerCase() === email);
        if (existe) {
            alert('Já existe uma conta registada com este email!');
            return;
        }

        // Criar novo utilizador
        const novoUtilizador = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            isAdmin: false // Novas contas nascem sempre como utilizador normal
        };

        users.push(novoUtilizador);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Conta criada com sucesso! Podes agora fazer login.');
        
        // Voltar ao ecran de login e limpar formulário
        registerForm.reset();
        if (registerScreen && loginScreen) {
            registerScreen.style.display = 'none';
            loginScreen.style.display = 'block';
        }
    });
}
