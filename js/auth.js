// Gestão unificada e segura de Autenticação e Registos

async function lidarComRegisto(event) {
    if (event) event.preventDefault();
    
    // Tenta encontrar os campos por vários IDs possíveis nos formulários
    const nomeInput = document.getElementById('regNome') || document.getElementById('nome') || document.getElementById('name');
    const emailInput = document.getElementById('regEmail') || document.getElementById('email');
    const passInput = document.getElementById('regPassword') || document.getElementById('password') || document.getElementById('pass');

    if (!emailInput || !passInput) {
        alert("Erro: Não foi possível encontrar os campos do formulário de registo.");
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

    // Inserir diretamente na tabela 'users'
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
        alert("Erro ao criar conta (o email já pode existir): " + error.message);
        return;
    }

    alert("Conta criada com sucesso! Aguarde a aprovação do administrador para aceder ao sistema.");
    window.location.href = 'index.html';
}

async function lidarComLogin(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('loginEmail') || document.getElementById('email');
    const passInput = document.getElementById('loginPassword') || document.getElementById('password') || document.getElementById('pass');

    if (!emailInput || !passInput) {
        alert("Erro: Não foi possível encontrar os campos do formulário de login.");
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

    // Guardar sessão local e redirecionar para o dashboard
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}
