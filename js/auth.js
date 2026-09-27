// Simulação de base de dados local para utilizadores
function initUsers() {
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
        const defaultUsers = [
            { id: 1, name: 'Sofia Administradora', email: 'admin@registos.com', password: '123', isAdmin: true },
            { id: 2, name: 'João Utilizador', email: 'user@registos.com', password: '123', isAdmin: false }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Inicializa os utilizadores assim que o script carrega
initUsers();

// Lógica de Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Procura o utilizador correspondente
        const found = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput);

        if (found) {
            localStorage.setItem('currentUser', JSON.stringify(found));
            window.location.href = 'dashboard.html';
        } else {
            alert('Email ou password incorretos!');
        }
    });
}
