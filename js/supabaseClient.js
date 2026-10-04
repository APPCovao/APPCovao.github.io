// Configuração da Ligação ao Supabase
const SUPABASE_URL = 'https://hskjqcikiefktkaekxxo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Rg9vFNdp6xyu1X629P7DWw_XsfCZid-';

// Carregar a biblioteca oficial do Supabase via CDN caso ainda não esteja carregada
if (typeof supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = false;
    document.head.appendChild(script);
}

let _supabaseClient = null;

function getSupabase() {
    if (!_supabaseClient && window.supabase) {
        _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
}
