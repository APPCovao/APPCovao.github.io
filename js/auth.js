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
