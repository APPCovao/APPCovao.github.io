// Gestão de Autenticação e Registos
async function lidarComRegisto(event) {
    if (event) event.preventDefault();
    
    const nomeInput = document.getElementById('regNome') || document.getElementById('nome');
    const emailInput = document.getElementById('regEmail') || document.getElementById('email');
    const passInput = document.getElementById('regPassword') || document.getElementById('password');

    if (!emailInput || !passInput) return;

    const nome = nomeInput ? nomeInput.value.trim() : 'Novo Utilizador';
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    const client = getSupabase();
    if (!client) {
        alert("Erro crítico: Cliente Supabase não encontrado.");
        return;
    }

    // Inserir diretamente na tabela 'users' para manter a lógica independente e compatível com o painel admin
    const { data, error } = await client.from('users').insert([
        {
            name: nome,
            email: email,
            password: password,
            aprovado: false,   // Fica pendente até aprovação do admin
            is_admin: false
        }
    ]).select();

    if (error) {
        console.error("Erro no registo:", error);
        alert("Erro ao criar conta: " + error.message);
        return;
    }

    alert("Conta criada com sucesso! Aguarde a aprovação do administrador para aceder ao sistema.");
    window.location.href = 'index.html';
}

async function lidarComLogin(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('loginEmail') || document.getElementById('email');
    const passInput = document.getElementById('loginPassword') || document.getElementById('password');

    if (!emailInput || !passInput) return;

    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    const client = getSupabase();
    if (!client) {
        alert("Erro crítico: Cliente Supabase não encontrado.");
        return;
    }

    const { data: users, error } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .limit(1);

    if (error || !users || users.length === 0) {
        alert("Email ou palavra-passe incorretos.");
        return;
    }

    const user = users[0];

    if (!user.aprovado && !user.is_admin) {
        alert("A sua conta ainda se encontra pendente de aprovação pelo administrador.");
        return;
    }

    // Guardar sessão local
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}
