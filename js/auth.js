// Simulação de base de dados local para utilizadores
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { id: 1, name: 'Sofia Administradora', email: 'admin@registos.com', password: '123', isAdmin: true },
        { id: 2, name: 'João Utilizador', email: 'user@registos.com', password: '123', isAdmin: false }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Lógica de Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem('users'));
        const found = users.find(u => u.email === email && u.password === password);

        if (found) {
            localStorage.setItem('currentUser', JSON.stringify(found));
            window.location.href = 'dashboard.html';
        } else {
            alert('Email ou password incorretos!');
        }
    });
}
