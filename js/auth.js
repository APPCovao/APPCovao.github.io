console.log("auth.js (Supabase) carregado com sucesso!");

// PROTEÇÃO CONTRA ACESSO DIRETO POR LINK E RESTRIÇÃO POR DOMÍNIO
const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';

if (paginaAtual !== '' && paginaAtual !== 'index.html' && paginaAtual !== 'dashboard.html') {
    const usuarioLogado = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!usuarioLogado) {
        window.location.href = 'index.html';
    } else {
        if (!usuarioLogado.isAdmin) {
            const emailUser = (usuarioLogado.email || '').toLowerCase();
            const eDominioMadeira = emailUser.endsWith('@edu.madeira.gov.pt');

            if (!eDominioMadeira) {
                const paginasPermitidas = ['avaliar-atividade.html', 'avaliar_atividades.html'];
                if (!paginasPermitidas.includes(paginaAtual)) {
                    window.location.href = 'avaliar-atividade.html';
                }
            }
        }
    }
}

// Injetar Modal Personalizado de forma segura
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

// Gestão de cliques universal (Botões de transição entre login e registo)
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

// Gestão de Submissão de Formulários com Supabase
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = loginForm.querySelector('input[type="email"]') || loginForm.querySelectorAll('input')[0];
            const passInput = loginForm.querySelector('input[type="password"]') || loginForm.querySelectorAll('input')[1];

            if (!emailInput || !passInput) return;

            const email = emailInput.value.trim();
            const password = passInput.value.trim();

            const sb = getSupabase();
            if (!sb) {
                mostrarPopup('Erro de Conexão', 'Erro ao ligar ao Supabase.', '⚠️');
                return;
            }

            try {
                const { data: users, error } = await sb
                    .from('users')
                    .select('*')
                    .ilike('email', email)
                    .eq('password', password);

                if (error || !users || users.length === 0) {
                    mostrarPopup('Erro de Autenticação', 'Email ou password incorretos!', '⚠️');
                    return;
                }

                const found = users[0];

                if (!found.is_admin && found.aprovado !== true) {
                    mostrarPopup('Conta Pendente', 'A sua conta encontra-se pendente de aprovação por um administrador.', '⏳');
                    return;
                }

                // Guardar o utilizador logado no localStorage para manter a compatibilidade rápida com as outras páginas
                localStorage.setItem('currentUser', JSON.stringify({
                    id: found.id,
                    name: found.name,
                    email: found.email,
                    isAdmin: found.is_admin,
                    aprovado: found.aprovado
                }));

                if (!found.is_admin && !found.email.toLowerCase().endsWith('@edu.madeira.gov.pt')) {
                    window.location.href = 'avaliar-atividade.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch (err) {
                console.error(err);
                mostrarPopup('Erro', 'Ocorreu um erro ao processar o login.', '⚠️');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
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

            const sb = getSupabase();
            if (!sb) {
                mostrarPopup('Erro de Conexão', 'Erro ao ligar ao Supabase.', '⚠️');
                return;
            }

            try {
                // Verificar se já existe
                const { data: existing } = await sb
                    .from('users')
                    .select('id')
                    .ilike('email', emailVal);

                if (existing && existing.length > 0) {
                    mostrarPopup('Conta Existente', 'Já existe uma conta com este email!', 'ℹ️');
                    return;
                }

                const novoUtilizador = {
                    name: nameVal,
                    email: emailVal,
                    password: passVal,
                    is_admin: false,
                    aprovado: false
                };

                const { error } = await sb.from('users').insert([novoUtilizador]);

                if (error) {
                    throw error;
                }

                registerForm.reset();

                mostrarPopup('Conta Criada!', 'Conta registada com sucesso! O acesso ficará disponível após a aprovação de um administrador.', '🎉', () => {
                    const loginScreen = document.getElementById('loginScreen') || document.querySelector('.login-container');
                    const registerScreen = document.getElementById('registerScreen') || document.querySelector('.register-container');
                    if (registerScreen) registerScreen.style.display = 'none';
                    if (loginScreen) loginScreen.style.display = 'block';
                });
            } catch (err) {
                console.error(err);
                mostrarPopup('Erro', 'Ocorreu um erro ao criar a conta.', '⚠️');
            }
        });
    }
});
