// Configuração da Ligação ao Supabase
const SUPABASE_URL = 'https://hskjqcikiefktkaekxxo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Rg9vFNdp6xyu1X629P7DWw_XsfCZid-';

let _supabaseClient = null;

// Inicializa o cliente imediatamente se o CDN do Supabase já estiver carregado
if (window.supabase) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function getSupabase() {
    if (!_supabaseClient && window.supabase) {
        _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
}
