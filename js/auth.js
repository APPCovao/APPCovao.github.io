// Gestão centralizada de Autenticação e Contas

async function lidarComRegisto(event) {
    if (event) event.preventDefault();
    
    const nomeInput = document.getElementById('regNome') || document.getElementById('nome') || document.getElementById('name');
    const emailInput = document.getElementById('regEmail') || document.getElementById('email');
    const passInput = document.getElementById('regPassword') || document.getElementById('password') || document.getElementById('pass');

    if (!emailInput || !passInput) {
        alert("Erro: Campos de registo não encontrados no formulário.");
        return;
    }

    const nome = nomeInput ? nomeInput.value.trim() : 'Novo Utilizador';
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if (!email || !password) {
        alert("Por favor, preencha o email e a palavra-passe.");
        return;
    }

    const client = getSupabase();
    if (!client) {
        alert("Erro crítico: Cliente Supabase não inicializado.");
        return;
    }

    const { data, error } = await client.from('users').insert([
        {
            name: nome,
            email: email,
            password: password,
            aprovado: false,
            is_admin: false
        }
    ]).select();

    if (error) {
        console.error("Erro no registo:", error);
        alert("Erro ao criar conta (o email poderá já estar registado): " + error.message);
        return;
    }

    alert("Conta criada com sucesso! Aguarde a aprovação do administrador.");
    window.location.href = 'index.html';
}

async function lidarComLogin(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('loginEmail') || document.getElementById('email');
    const passInput = document.getElementById('loginPassword') || document.getElementById('password') || document.getElementById('pass');

    if (!emailInput || !passInput) {
        alert("Erro: Campos de login não encontrados no formulário.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if (!email || !password) {
        alert("Por favor, introduza o email e a palavra-passe.");
        return;
    }

    const client = getSupabase();
    if (!client) {
        alert("Erro crítico: Cliente Supabase não inicializado.");
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

    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}
