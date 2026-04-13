// ══════════════════════════════════════════
//  online.js — Sistema online com Supabase
//  Substitui save.js quando online habilitado
// ══════════════════════════════════════════

// ── CONFIGURE AQUI ──
// Substitua pelos valores do seu projeto no painel do Supabase:
// Settings > API > Project URL e anon key
const SUPABASE_URL    = 'COLE_SUA_URL_AQUI';
const SUPABASE_ANON   = 'COLE_SUA_ANON_KEY_AQUI';

// ── CLIENTE SUPABASE ──
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── ESTADO ONLINE ──
let currentUser  = null;   // objeto do Supabase Auth
let playerRow    = null;   // linha do jogador na tabela players
let isTop1       = false;  // jogador é o top 1 atual?
let onlineMode   = false;  // true quando logado

// ──────────────────────────────────────────
//  INICIALIZAÇÃO
// ──────────────────────────────────────────
async function initOnline() {
  // Verifica sessão existente
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await carregarPerfil();
  }
  renderAuthUI();
  atualizarCapaUI();
}

// Escuta mudanças de autenticação em tempo real
sb.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    currentUser = session.user;
    await carregarPerfil();
    onlineMode = true;
    renderAuthUI();
    atualizarCapaUI();
    notif('✅ Conectado como ' + (playerRow?.username || currentUser.email));
  }
  if (event === 'SIGNED_OUT') {
    currentUser = null; playerRow = null;
    isTop1 = false; onlineMode = false;
    renderAuthUI();
    atualizarCapaUI();
  }
});

// ──────────────────────────────────────────
//  AUTENTICAÇÃO
// ──────────────────────────────────────────
async function loginGoogle() {
  await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
}

async function loginGithub() {
  await sb.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.href }
  });
}

async function loginEmail(email, senha) {
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) { notif('❌ ' + traduzirErro(error.message)); return false; }
  return true;
}

async function registrarEmail(email, senha, username) {
  if (!username || username.length < 3) { notif('❌ Nome deve ter 3+ caracteres'); return false; }
  if (username.length > 20)             { notif('❌ Nome máximo de 20 caracteres'); return false; }

  const { data, error } = await sb.auth.signUp({ email, password: senha });
  if (error) { notif('❌ ' + traduzirErro(error.message)); return false; }

  // Criar perfil do jogador
  if (data.user) {
    await criarPerfil(data.user.id, username, data.user.user_metadata?.avatar_url);
  }
  return true;
}

async function logout() {
  await sb.auth.signOut();
  notif('👋 Desconectado');
}

function traduzirErro(msg) {
  if (msg.includes('Invalid login'))    return 'Email ou senha incorretos';
  if (msg.includes('already registered')) return 'Email já cadastrado';
  if (msg.includes('Password'))         return 'Senha deve ter pelo menos 6 caracteres';
  return msg;
}

// ──────────────────────────────────────────
//  PERFIL DO JOGADOR
// ──────────────────────────────────────────
async function criarPerfil(userId, username, avatarUrl = null) {
  const { data, error } = await sb.from('players').insert({
    user_id:   userId,
    username:  username,
    avatar_url: avatarUrl,
    save_data: JSON.stringify(G)
  }).select().single();

  if (!error) playerRow = data;
}

async function carregarPerfil() {
  if (!currentUser) return;
  const { data, error } = await sb.from('players')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  if (error || !data) return;
  playerRow = data;
  isTop1    = data.is_top1;
  onlineMode = true;

  // Carregar save do servidor se existir e for mais recente
  if (data.save_data) {
    const serverSave = typeof data.save_data === 'string'
      ? JSON.parse(data.save_data)
      : data.save_data;

    const localSave = loadLocalSave();
    const serverTs  = serverSave.saveAt || 0;
    const localTs   = localSave?.saveAt || 0;

    if (serverTs > localTs) {
      G = { ...estadoInicial(), ...serverSave };
      notif('☁️ Save do servidor carregado!');
    }
  }
}

// ──────────────────────────────────────────
//  SAVE ONLINE
// ──────────────────────────────────────────
async function saveOnline() {
  if (!currentUser || !onlineMode) return;

  G.saveAt = Date.now();

  const payload = {
    casa:          G.casa,
    nivel:         G.nivel,
    xp:            G.xp,
    ouro:          G.ouro,
    hp:            G.hp,
    hp_max:        G.hpMax,
    mp:            G.mp,
    mp_max:        G.mpMax,
    bonus_dmg:     G.bonusDmg,
    kills_total:   G.killsTotal   || 0,
    kills_boss:    G.killsBoss    || 0,
    maior_dano:    G.maiorDano    || 0,
    criticos:      G.criticosTotal || 0,
    streak_max:    G.streakMax    || 0,
    total_batalhas:G.totalBatalhas || 0,
    derrotas:      G.derrotas     || 0,
    tempo_jogo:    Date.now() - (G.tempoInicio || Date.now()),
    save_data:     sanitizeSaveData(G)
  };

  const { error } = await sb.from('players')
    .update(payload)
    .eq('user_id', currentUser.id);

  if (!error) {
    // Atualizar is_top1 local após salvar
    await verificarTop1();
  }
}

function sanitizeSaveData(state) {
  // Remove campos que não devem ir pro servidor (circular refs etc)
  const { _hash, inimigo, inBattle, ...clean } = state;
  return clean;
}

async function verificarTop1() {
  if (!playerRow) return;
  const { data } = await sb.from('players')
    .select('is_top1')
    .eq('user_id', currentUser.id)
    .single();

  const eraTop1 = isTop1;
  isTop1 = data?.is_top1 || false;

  if (!eraTop1 && isTop1) {
    // Acabou de virar top 1!
    setTimeout(() => mostrarModal('⚜️ VOCÊ É O TOP 1!', 'A Capa do Lorde agora é sua! Você ganhou bônus exclusivos e seu nome brilha no topo do ranking mundial!'), 500);
    tocarSom('levelup');
  }

  atualizarCapaUI();
}

// ──────────────────────────────────────────
//  EFEITOS DA CAPA DO LORDE (Top 1)
// ──────────────────────────────────────────
function getBonusCapa() {
  if (!isTop1) return { dano: 0, mpRegen: 0 };
  return { dano: 0.15, mpRegen: 3 }; // +15% dano, +3 MP/turno extra
}

function aplicarBonusCapaDano(dmg) {
  if (!isTop1) return dmg;
  return Math.floor(dmg * 1.15);
}

function atualizarCapaUI() {
  const happ = document.getElementById('happ');
  if (!happ) return;

  if (isTop1) {
    happ.classList.add('top1-active');
  } else {
    happ.classList.remove('top1-active');
  }

  // Badge no mapa
  const badge = document.getElementById('top1-badge');
  if (badge) {
    badge.style.display = isTop1 ? 'block' : 'none';
  }
}

// ──────────────────────────────────────────
//  RANKING GLOBAL
// ──────────────────────────────────────────
async function carregarRanking() {
  const { data, error } = await sb.from('ranking_global')
    .select('*')
    .limit(50);

  return error ? [] : data;
}

async function renderRanking() {
  document.getElementById('ranking-loading').style.display = 'block';
  document.getElementById('ranking-lista').innerHTML = '';

  const lista = await carregarRanking();

  document.getElementById('ranking-loading').style.display = 'none';

  if (!lista.length) {
    document.getElementById('ranking-lista').innerHTML =
      '<p style="opacity:.5;text-align:center;font-style:italic">Nenhum jogador no ranking ainda.<br>Alcance o nível 20 para aparecer!</p>';
    return;
  }

  const nomesCasas = { g: 'Gryffindor 🦁', s: 'Slytherin 🐍', r: 'Ravenclaw 🦅', h: 'Hufflepuff 🦡' };
  const meuUsername = playerRow?.username;

  document.getElementById('ranking-lista').innerHTML = lista.map(p => {
    const isEu    = p.username === meuUsername;
    const isFirst = p.posicao == 1;
    const medal   = p.posicao == 1 ? '🥇' : p.posicao == 2 ? '🥈' : p.posicao == 3 ? '🥉' : `#${p.posicao}`;
    const capa    = p.is_top1 ? '<span class="capa-badge">⚜️ LORDE</span>' : '';
    const tempo   = formatarTempoCurto(p.updated_at);

    return `
      <div class="rank-row ${isEu ? 'rank-eu' : ''} ${isFirst ? 'rank-first' : ''}">
        <div class="rank-pos">${medal}</div>
        <div class="rank-info">
          <div class="rank-nome">${p.username}${capa}</div>
          <div class="rank-casa">${nomesCasas[p.casa] || '?'} · Nível ${p.nivel}</div>
        </div>
        <div class="rank-stats">
          <div>⚔️ ${p.kills_total}</div>
          <div>👑 ${p.kills_boss}</div>
          <div>💥 ${p.maior_dano}</div>
        </div>
        <div class="rank-tempo">${tempo}</div>
      </div>`;
  }).join('');

  // Mostrar posição do jogador se não estiver no top 50
  if (meuUsername && !lista.find(p => p.username === meuUsername)) {
    const { data: myPos } = await sb.from('ranking_global')
      .select('posicao')
      .eq('username', meuUsername)
      .single();

    if (myPos) {
      document.getElementById('ranking-minha-pos').textContent =
        `Sua posição: #${myPos.posicao}`;
    } else {
      document.getElementById('ranking-minha-pos').textContent =
        `Você ainda não está no ranking (precisa de nível 20)`;
    }
  }
}

function formatarTempoCurto(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0)  return `${d}d atrás`;
  if (h > 0)  return `${h}h atrás`;
  if (m > 0)  return `${m}min atrás`;
  return 'agora';
}

// ──────────────────────────────────────────
//  UI DE AUTENTICAÇÃO
// ──────────────────────────────────────────
function renderAuthUI() {
  const el = document.getElementById('auth-panel');
  if (!el) return;

  if (currentUser && playerRow) {
    const capaHTML = isTop1
      ? `<div class="capa-ativa-banner">⚜️ Você é o Top 1! A Capa do Lorde está ativa.</div>`
      : '';
    el.innerHTML = `
      <div class="auth-logado">
        ${playerRow.avatar_url ? `<img src="${playerRow.avatar_url}" class="auth-avatar">` : '<div class="auth-avatar-placeholder">🧙</div>'}
        <div>
          <div style="font-family:'Cinzel',serif;font-size:13px">${playerRow.username}</div>
          <div style="font-size:11px;opacity:.5">${currentUser.email || 'Login social'}</div>
        </div>
        <button class="btn" style="font-size:11px;padding:5px 12px" onclick="logout()">Sair</button>
      </div>
      ${capaHTML}`;
  } else {
    el.innerHTML = `
      <div class="auth-form" id="auth-form-container">
        <div style="text-align:center;margin-bottom:.8rem;font-family:'Cinzel',serif;font-size:12px;opacity:.6">ENTRAR / CRIAR CONTA</div>
        <button class="btn btn-oauth" onclick="loginGoogle()">
          <img src="https://www.google.com/favicon.ico" width="14"> Entrar com Google
        </button>
        <button class="btn btn-oauth" onclick="loginGithub()">
          🐙 Entrar com GitHub
        </button>
        <div class="auth-divider">ou por e-mail</div>
        <input type="email"    id="auth-email"    class="auth-input" placeholder="Email"/>
        <input type="password" id="auth-senha"    class="auth-input" placeholder="Senha (6+ chars)"/>
        <input type="text"     id="auth-username" class="auth-input" placeholder="Nome no ranking (só no registro)"/>
        <div style="display:flex;gap:6px;margin-top:.5rem">
          <button class="btn" style="flex:1;font-size:11px" onclick="fazerLogin()">Entrar</button>
          <button class="btn" style="flex:1;font-size:11px" onclick="fazerRegistro()">Registrar</button>
        </div>
        <p style="font-size:10px;opacity:.4;text-align:center;margin-top:.5rem">
          Conta necessária para aparecer no ranking global
        </p>
      </div>`;
  }
}

async function fazerLogin() {
  const email = document.getElementById('auth-email')?.value;
  const senha = document.getElementById('auth-senha')?.value;
  if (!email || !senha) { notif('❌ Preencha email e senha'); return; }
  await loginEmail(email, senha);
}

async function fazerRegistro() {
  const email    = document.getElementById('auth-email')?.value;
  const senha    = document.getElementById('auth-senha')?.value;
  const username = document.getElementById('auth-username')?.value?.trim();
  if (!email || !senha || !username) { notif('❌ Preencha todos os campos'); return; }
  const ok = await registrarEmail(email, senha, username);
  if (ok) notif('✅ Conta criada! Confirme seu email se necessário.');
}

// ──────────────────────────────────────────
//  HOOK: sobrescreve saveGame do save.js
//  quando online mode está ativo
// ──────────────────────────────────────────
const _saveGameOriginal = typeof saveGame === 'function' ? saveGame : null;

function saveGame() {
  // Sempre salva local
  if (_saveGameOriginal) _saveGameOriginal();
  else saveLocalFallback();

  // Salva online em paralelo (sem bloquear)
  if (onlineMode && currentUser) {
    saveOnline().catch(e => console.warn('[online] save falhou:', e));
  }
}

function saveLocalFallback() {
  try {
    G.saveAt = Date.now();
    localStorage.setItem('hogwarts_rpg_v4', JSON.stringify(G));
  } catch(e) {}
}

function loadLocalSave() {
  try {
    const raw = localStorage.getItem('hogwarts_rpg_v4');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
