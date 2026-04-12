// ══════════════════════════════════════════
//  game.js — Lógica principal do jogo (v2)
// ══════════════════════════════════════════

// ── ESTADO INICIAL ──
let G = estadoInicial();

function estadoInicial() {
  return {
    casa: null, qIdx: 0, votos: { g: 0, s: 0, r: 0, h: 0 },
    hp: 100, hpMax: 100, mp: 60, mpMax: 60,
    nivel: 1, xp: 0, xpNext: 100, ouro: 30,
    inv: [{ id: "potion", nome: "Poção de Cura", icon: "🧪", qtd: 2, desc: "Restaura 40 HP" }],
    inimigo: null, inBattle: false, bonusDmg: 0, zonaAtual: null,
    varinhasCompradas: { 1: false, 2: false, 3: false },
    permanentesComprados: {},
    magicsAprendidas: [],
    // Estatísticas
    killsTotal: 0, killsBoss: 0, killsPorTipo: {},
    maiorDano: 0, criticosTotal: 0,
    streakAtual: 0, streakMax: 0,
    totalBatalhas: 0, derrotas: 0,
    tempoInicio: Date.now(),
    // Missões & Conquistas
    missoesCompletas: [],
    conquistasDesbloqueadas: [],
    // XP Boost
    xpBoostMult: 1.0, xpBoostExpiry: 0,
    xpBoostPassiva: false, // anel_xp
    chanceCritico: 0.10,   // base 10%, +10% com colar
    // Status de veneno
    venenoTurnos: 0, venenaoDano: 8,
    // Estado de escudo inimigo
    escudoInimigo: false, esquivaInimigo: false,
    // Narrativa
    zonasVisitadas: [],
    // Save timestamp
    saveAt: 0,
    _hash: null
  };
}

// ── HELPERS ──
function fRand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function formatOuro(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

function formatTempo(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

function escalarInimigo(base, nivel) {
  const f = 1 + (nivel - 1) * 0.18;
  return {
    ...base,
    hpMax: Math.floor(base.hpMax * f),
    hp:    Math.floor(base.hpMax * f),
    atk:   [Math.floor(base.atk[0] * f), Math.floor(base.atk[1] * f)],
    xp:    Math.floor(base.xp   * (1 + (nivel - 1) * 0.1)),
    ouro:  Math.floor(base.ouro * (1 + (nivel - 1) * 0.1))
  };
}

function getTodosFeiticos() {
  const base      = CASAS[G.casa].feiticos;
  const aprendidos = MAGIAS_LOJA.filter(m => G.magicsAprendidas.includes(m.id));
  return [ATAQUE_BASICO, ...base, ...aprendidos];
}

function getDesconto() {
  return G.casa === 'r' ? 0.85 : 1.0;
}

function xpBoostAtivo() {
  if (G.xpBoostExpiry > Date.now()) return G.xpBoostMult;
  if (G.xpBoostExpiry !== 0) { G.xpBoostMult = 1.0; G.xpBoostExpiry = 0; }
  return G.xpBoostPassiva ? 1.15 : 1.0;
}

// ── SOM ──
let audioCtx = null;
let somAtivado = true;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tocarSom(tipo) {
  if (!somAtivado) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const configs = {
      ataque:   { freq: 220, tipo: 'sawtooth', dur: 0.12, vol: 0.15 },
      critico:  { freq: 440, tipo: 'square',   dur: 0.20, vol: 0.20 },
      dano:     { freq: 130, tipo: 'sawtooth', dur: 0.15, vol: 0.12 },
      vitoria:  { freq: 523, tipo: 'sine',     dur: 0.40, vol: 0.18 },
      levelup:  { freq: 659, tipo: 'sine',     dur: 0.50, vol: 0.20 },
      compra:   { freq: 392, tipo: 'sine',     dur: 0.20, vol: 0.12 },
      erro:     { freq:  80, tipo: 'square',   dur: 0.15, vol: 0.10 },
      notif:    { freq: 330, tipo: 'sine',     dur: 0.18, vol: 0.10 },
    };
    const c = configs[tipo] || configs.notif;
    osc.type = c.tipo;
    osc.frequency.setValueAtTime(c.freq, ctx.currentTime);
    gain.gain.setValueAtTime(c.vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + c.dur);
  } catch(e) {}
}

// ══════════════════════════════════════════
//  INICIALIZAÇÃO
// ══════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  const result = loadGame();

  if (result === 'tamper') {
    document.getElementById('continue-section').innerHTML = `
      <div class="tamper-alert">
        ⚠️ Save corrompido ou adulterado detectado.<br>
        <span style="font-size:12px;opacity:.8">O progresso foi resetado por segurança.</span>
      </div>`;
    return;
  }

  if (result === true && G.casa) {
    const casa = CASAS[G.casa];
    document.getElementById('happ').className = casa.theme;
    const saveInfo = G.saveAt ? new Date(G.saveAt).toLocaleString('pt-BR') : '—';
    document.getElementById('continue-section').innerHTML = `
      <div style="border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:1rem;margin-bottom:1rem;background:rgba(255,255,255,.05);text-align:center">
        <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:1px;opacity:.5;margin-bottom:.4rem">JOGO SALVO</div>
        <div style="font-size:18px;margin-bottom:.2rem">${casa.crest} ${casa.nome}</div>
        <div style="font-size:13px;opacity:.7">Nível ${G.nivel} · ${formatOuro(G.ouro)} 🪙 · ${G.hp}/${G.hpMax} HP</div>
        <div style="font-size:10px;opacity:.4;margin-top:4px">Salvo em ${saveInfo}</div>
        <button class="btn" style="margin:.7rem auto 0;display:block" onclick="continueGame()">▶ Continuar Aventura</button>
      </div>`;
    document.getElementById('start-btn').textContent = 'Novo Jogo (apaga save)';
  }

  // Atualizar timer de XP boost a cada segundo
  setInterval(tickBoost, 1000);
});

function continueGame() {
  document.getElementById('happ').className = CASAS[G.casa].theme;
  go('s-map');
  renderMap();
}

function tickBoost() {
  const el = document.getElementById('xp-boost-timer');
  if (!el) return;
  if (G.xpBoostExpiry > Date.now()) {
    const restante = Math.ceil((G.xpBoostExpiry - Date.now()) / 1000);
    el.style.display = 'block';
    el.textContent = `⚡ XP x${G.xpBoostMult.toFixed(1)} — ${restante}s`;
  } else {
    el.style.display = 'none';
  }
}

// ══════════════════════════════════════════
//  NAVEGAÇÃO
// ══════════════════════════════════════════
function go(id) {
  document.querySelectorAll('#happ .screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function resetAll() {
  deleteSave();
  G = estadoInicial();
  document.getElementById('happ').className = 'th-d';
  document.getElementById('continue-section').innerHTML = '';
  document.getElementById('start-btn').textContent = 'Colocar o Chapéu';
}

function restartRpg() {
  G.hp = G.hpMax; G.mp = G.mpMax;
  G.inBattle = false; G.inimigo = null;
  G.venenoTurnos = 0; G.escudoInimigo = false; G.esquivaInimigo = false;
  G.streakAtual = 0;
  go('s-map'); renderMap();
}

function voltarDoBolso() {
  if (G.inBattle) { go('s-battle'); renderBattle(); }
  else            { go('s-map');    renderMap();    }
}

function startQuiz() {
  G = estadoInicial();
  go('s-quiz');
  renderQ();
}

function toggleSom() {
  somAtivado = !somAtivado;
  const btn = document.getElementById('btn-som');
  if (btn) btn.textContent = somAtivado ? '🔊' : '🔇';
}

// ══════════════════════════════════════════
//  QUIZ
// ══════════════════════════════════════════
function renderQ() {
  const q   = PERGUNTAS[G.qIdx];
  const ops = [...q.ops].sort(() => Math.random() - 0.5);

  document.getElementById('prog').innerHTML =
    PERGUNTAS.map((_, i) =>
      `<div class="dot ${i < G.qIdx ? 'done' : ''}"></div>`
    ).join('');

  document.getElementById('qcontainer').innerHTML = `
    <p style="text-align:center;font-size:10px;font-family:'Cinzel',serif;letter-spacing:1px;opacity:.5;margin-bottom:.7rem">
      PERGUNTA ${G.qIdx + 1} DE ${PERGUNTAS.length}
    </p>
    <p class="qtext">${q.t}</p>
    <div>
      ${ops.map(o => `<button class="btn btn-full" onclick="responder('${o.c}')">${o.t}</button>`).join('')}
    </div>`;
}

function responder(c) {
  G.votos[c]++;
  G.qIdx++;
  if (G.qIdx < PERGUNTAS.length) renderQ();
  else definirCasa();
}

function definirCasa() {
  const c    = Object.entries(G.votos).sort((a, b) => b[1] - a[1])[0][0];
  G.casa     = c;
  const casa = CASAS[c];
  document.getElementById('happ').className = casa.theme;

  document.getElementById('result-html').innerHTML = `
    <p style="text-align:center;font-size:10px;font-family:'Cinzel',serif;letter-spacing:2px;opacity:.5;margin-bottom:.5rem">
      O CHAPÉU SELETOR DECIDIU
    </p>
    <span class="crest">${casa.crest}</span>
    <div class="result-house">${casa.nome.toUpperCase()}</div>
    <div class="result-motto">"${casa.motto}"</div>
    <div class="result-desc">${casa.desc}</div>
    <div class="traits">
      ${casa.traits.map(t => `<span class="trait">${t}</span>`).join('')}
    </div>
    <div class="passiva-box">
      <span style="font-size:18px">${casa.passiva.icon}</span>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px">${casa.passiva.nome}</div>
        <div style="font-size:12px;opacity:.7">${casa.passiva.desc}</div>
      </div>
    </div>
    <button class="btn btn-center" onclick="iniciarRpg()">⚔️ Iniciar Aventura</button>
    <button class="btn btn-center" style="margin-top:6px;opacity:.5;font-size:11px" onclick="startQuiz()">
      Refazer o teste
    </button>`;

  go('s-result');
}

function iniciarRpg() {
  G.tempoInicio = Date.now();
  saveGame();
  go('s-map');
  renderMap();
}

// ══════════════════════════════════════════
//  STATUS BAR
// ══════════════════════════════════════════
function statusHTML() {
  const hp = Math.max(0, Math.round(G.hp    / G.hpMax  * 100));
  const mp = Math.max(0, Math.round(G.mp    / G.mpMax  * 100));
  const xp = Math.max(0, Math.round(G.xp    / G.xpNext * 100));
  const boostAtivo = G.xpBoostExpiry > Date.now();
  return `
    <div class="stat-box">
      <div class="stat-label">NÍV</div>
      <div class="stat-val">${G.nivel}</div>
    </div>
    <div class="stat-box" style="flex:2">
      <div class="stat-label">HP ${G.hp}/${G.hpMax}</div>
      <div class="bar-wrap"><div class="bar-fill bar-hp" style="width:${hp}%"></div></div>
    </div>
    <div class="stat-box" style="flex:2">
      <div class="stat-label">MP ${G.mp}/${G.mpMax}</div>
      <div class="bar-wrap"><div class="bar-fill bar-mp" style="width:${mp}%"></div></div>
    </div>
    <div class="stat-box" style="flex:2">
      <div class="stat-label">XP ${G.xp}/${G.xpNext}${boostAtivo ? ' ⚡' : ''}</div>
      <div class="bar-wrap"><div class="bar-fill bar-xp" style="width:${xp}%"></div></div>
    </div>
    <div class="stat-box">
      <div class="stat-label">OURO</div>
      <div class="stat-val" style="font-size:11px">🪙${formatOuro(G.ouro)}</div>
    </div>`;
}

// ══════════════════════════════════════════
//  MAPA
// ══════════════════════════════════════════
function renderMap() {
  document.getElementById('status-top').innerHTML = statusHTML();

  // Verificar evento aleatório (15% ao entrar no mapa)
  if (Math.random() < 0.15) {
    setTimeout(() => dispararEventoAleatorio(), 400);
  }

  document.getElementById('map-zones').innerHTML = ZONAS.map(z => {
    const bloq = G.nivel < z.nivelMin;
    return `
      <button class="zone-btn ${z.boss ? 'zone-boss' : ''}" onclick="entrarZona('${z.id}')" ${bloq ? 'disabled' : ''}>
        <span class="zone-icon">${z.icon}</span>
        <div class="zone-name">${z.nome}</div>
        <div class="zone-desc">${z.desc}</div>
        ${z.boss ? '<div class="boss-tag">👑 BOSS</div>' : ''}
        ${bloq
          ? `<div class="zone-lock">🔒 Nível ${z.nivelMin}</div>`
          : `<div class="zone-tag">+${z.xp} xp 🪙${z.ouro}</div>`}
      </button>`;
  }).join('');

  verificarMissoes();
  verificarConquistas();
}

// ── EVENTO ALEATÓRIO ──
function dispararEventoAleatorio() {
  let roll = Math.random();
  for (const ev of EVENTOS_ALEATORIOS) {
    if (roll < ev.chance) {
      const resultado = ev.efeito(G);
      saveGame();
      renderMap();
      mostrarModal(`${ev.icon} ${ev.titulo}`, resultado);
      return;
    }
    roll -= ev.chance;
  }
}

function mostrarModal(titulo, msg) {
  const m = document.getElementById('modal-evento');
  if (!m) return;
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-msg').textContent    = msg;
  m.style.display = 'flex';
}

function fecharModal() {
  const m = document.getElementById('modal-evento');
  if (m) m.style.display = 'none';
}

// ══════════════════════════════════════════
//  COMBATE
// ══════════════════════════════════════════
function entrarZona(zid) {
  const zona  = ZONAS.find(z => z.id === zid);
  G.zonaAtual = zona;

  // Narrativa de primeira visita
  if (!G.zonasVisitadas.includes(zid)) {
    G.zonasVisitadas.push(zid);
    const narr = ZONA_NARRATIVA[zid];
    if (narr) {
      mostrarNarrativa(zona.icon + ' ' + zona.nome, narr, () => iniciarBatalha(zona));
      return;
    }
  }

  // Boss intro
  const iniId = zona.inimigos[Math.floor(Math.random() * zona.inimigos.length)];
  const base  = INIMIGOS_BASE[iniId];
  if (base.boss && BOSS_INTRO_FALAS[iniId]) {
    mostrarNarrativa(base.art + ' ' + base.nome, BOSS_INTRO_FALAS[iniId], () => iniciarBatalha(zona));
    return;
  }

  iniciarBatalha(zona);
}

function mostrarNarrativa(titulo, texto, callback) {
  const m = document.getElementById('modal-evento');
  if (!m) { callback && callback(); return; }
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-msg').textContent    = texto;
  const btn = document.getElementById('modal-btn');
  btn.textContent = '⚔️ Entrar na Batalha';
  btn.onclick = () => { m.style.display = 'none'; btn.textContent = 'OK'; btn.onclick = fecharModal; callback && callback(); };
  m.style.display = 'flex';
}

function iniciarBatalha(zona) {
  const iniId = zona.inimigos[Math.floor(Math.random() * zona.inimigos.length)];
  const esc   = escalarInimigo(INIMIGOS_BASE[iniId], G.nivel);
  G.inimigo   = { ...esc, id: iniId, hp: esc.hpMax };
  G.inBattle  = true;
  G.escudoInimigo  = false;
  G.esquivaInimigo = false;
  G.venenoTurnos   = 0;

  go('s-battle');
  renderBattle();
  clearLog();
  addLog(`Você encontrou ${G.inimigo.nome}!`, 'info');
  if (G.inimigo.habilidade) {
    addLog(`⚠️ ${G.inimigo.nome} possui a habilidade: ${nomeHabilidade(G.inimigo.habilidade)}`, 'warn');
  }
}

function nomeHabilidade(h) {
  const nomes = { veneno: 'Veneno 🐍', dreno_mp: 'Drenar Mana 💧', cura: 'Cura Sombria 💚', escudo: 'Escudo Mágico 🛡️', esquiva: 'Esquiva 💨', reflexo: 'Reflexo ✨' };
  return nomes[h] || h;
}

function clearLog() { document.getElementById('log').innerHTML = ''; }

function addLog(txt, tipo = 'neutral') {
  const d = document.getElementById('log');
  d.innerHTML += `<div class="log-line log-${tipo}">${txt}</div>`;
  d.scrollTop  = d.scrollHeight;
}

function renderBattle() {
  const ini    = G.inimigo;
  const hpPct  = Math.max(0, Math.round(ini.hp / ini.hpMax * 100));
  const veneno = G.venenoTurnos > 0 ? `<span class="status-icon">☠️ Envenenado (${G.venenoTurnos})</span>` : '';
  const escudo = G.escudoInimigo     ? `<span class="status-icon" style="color:#7df">🛡️ Escudo</span>` : '';

  document.getElementById('status-battle').innerHTML = statusHTML();
  document.getElementById('enemy-box').innerHTML = `
    <div class="enemy-art">${ini.art}</div>
    <div class="enemy-name">${ini.nome}${ini.boss ? ' <span style="font-size:11px;opacity:.6">👑</span>' : ''}</div>
    <div style="font-size:11px;opacity:.6;margin:3px 0">HP: ${ini.hp}/${ini.hpMax} ${escudo}</div>
    <div class="bar-wrap" style="max-width:180px;margin:0 auto">
      <div class="bar-fill bar-hp" style="width:${hpPct}%"></div>
    </div>
    ${veneno ? `<div style="font-size:10px;margin-top:4px">${veneno}</div>` : ''}`;

  const todos = getTodosFeiticos();
  document.getElementById('spells').innerHTML = todos.map((f, i) => {
    const podeUsar = G.mp >= f.mp;
    const isLearn  = G.magicsAprendidas.includes(f.id);
    const isBasico = f.id === '__basico__';
    return `
      <button class="spell-btn ${isLearn ? 'spell-learned' : ''} ${isBasico ? 'spell-basico' : ''}"
        onclick="lancarFeitico(${i})" ${!podeUsar ? 'disabled' : ''}>
        <div style="font-size:16px">${f.icon}</div>
        <div class="spell-name">${f.nome}</div>
        <div class="spell-cost">${f.mp === 0 ? 'Grátis' : 'MP:' + f.mp} | ${f.dano[0] + G.bonusDmg}–${f.dano[1] + G.bonusDmg}</div>
      </button>`;
  }).join('');
}

function lancarFeitico(idx) {
  if (!G.inimigo || !G.inBattle) return;
  const todos = getTodosFeiticos();
  const f = todos[idx];
  if (!f) return;
  if (G.mp < f.mp) { addLog('Mana insuficiente!', 'bad'); tocarSom('erro'); return; }

  G.mp -= f.mp;

  // Crítico
  const critico = Math.random() < G.chanceCritico;
  let dmg = fRand(f.dano[0], f.dano[1]) + G.bonusDmg;
  if (critico) { dmg = Math.floor(dmg * 2); G.criticosTotal++; }

  // Passiva Slytherin: roubo de vida
  if (G.casa === 's' && f.id !== '__basico__') {
    G.hp = Math.min(G.hpMax, G.hp + 4);
  }

  // Escudo do inimigo: absorve 50%
  if (G.escudoInimigo) {
    dmg = Math.floor(dmg * 0.5);
    G.escudoInimigo = false;
    addLog(`🛡️ Escudo absorveu parte do dano!`, 'warn');
  }

  // Reflexo Voldemort
  let dmgReflexo = 0;
  if (G.inimigo.habilidade === 'reflexo' && Math.random() < 0.25) {
    dmgReflexo = Math.floor(dmg * 0.20);
  }

  G.inimigo.hp = Math.max(0, G.inimigo.hp - dmg);

  // Registrar maior dano
  if (dmg > (G.maiorDano || 0)) G.maiorDano = dmg;

  const criticoTxt = critico ? ' 💫 CRÍTICO!' : '';
  tocarSom(critico ? 'critico' : 'ataque');
  addLog(`${f.icon} ${f.nome}: ${dmg} de dano!${criticoTxt}`, 'good');

  if (dmgReflexo > 0) {
    G.hp = Math.max(0, G.hp - dmgReflexo);
    addLog(`✨ Voldemort refletiu ${dmgReflexo} de dano de volta!`, 'bad');
  }

  if (G.inimigo.hp <= 0) { vencerBatalha(); return; }
  ataqueInimigo();
}

function ataqueInimigo() {
  const ini = G.inimigo;

  // Habilidade especial do inimigo (chance aleatória)
  const habChance = { veneno: 0.35, dreno_mp: 0.40, cura: 0.30, escudo: 0.35, esquiva: 0.30, reflexo: 0.25 };
  const hab = ini.habilidade;
  if (hab && Math.random() < (habChance[hab] || 0)) {
    aplicarHabilidadeInimigo(hab);
  }

  // Esquiva do inimigo (Peter)
  if (G.esquivaInimigo) {
    G.esquivaInimigo = false;
    addLog(`${ini.art} ${ini.nome} esquivou do seu ataque!`, 'warn');
    renderBattle();
    return;
  }

  const dmg = fRand(ini.atk[0], ini.atk[1]);
  G.hp = Math.max(0, G.hp - dmg);
  addLog(`${ini.art} ${ini.nome} causou ${dmg} de dano!`, 'bad');
  tocarSom('dano');

  // Veneno no jogador
  if (G.venenoTurnos > 0) {
    G.hp = Math.max(0, G.hp - G.venenaoDano);
    G.venenoTurnos--;
    addLog(`☠️ Veneno causou ${G.venenaoDano} de dano! (${G.venenoTurnos} turnos restantes)`, 'bad');
  }

  // Regenera 5 MP por turno
  G.mp = Math.min(G.mpMax, G.mp + 5);

  renderBattle();
  if (G.hp <= 0) setTimeout(gameOver, 600);
}

function aplicarHabilidadeInimigo(hab) {
  const ini = G.inimigo;
  switch (hab) {
    case 'veneno':
      G.venenoTurnos = 3;
      G.venenaoDano  = 8;
      addLog(`🐍 ${ini.nome} envenenou você! (3 turnos)`, 'bad');
      break;
    case 'dreno_mp':
      const drenado = Math.min(G.mp, 12);
      G.mp -= drenado;
      addLog(`💧 ${ini.nome} drenou ${drenado} MP!`, 'bad');
      break;
    case 'cura': {
      const cura = Math.floor(ini.hpMax * 0.15);
      G.inimigo.hp = Math.min(ini.hpMax, ini.hp + cura);
      addLog(`💚 ${ini.nome} se curou em ${cura} HP!`, 'warn');
      break;
    }
    case 'escudo':
      G.escudoInimigo = true;
      addLog(`🛡️ ${ini.nome} ativou um escudo mágico!`, 'warn');
      break;
    case 'esquiva':
      G.esquivaInimigo = true;
      addLog(`💨 ${ini.nome} está pronto para esquivar!`, 'warn');
      break;
  }
}

function vencerBatalha() {
  const ini = G.inimigo;
  G.killsTotal++;
  G.killsPorTipo[ini.id] = (G.killsPorTipo[ini.id] || 0) + 1;
  G.totalBatalhas++;
  G.streakAtual++;
  if (G.streakAtual > (G.streakMax || 0)) G.streakMax = G.streakAtual;
  if (ini.boss) G.killsBoss++;

  tocarSom('vitoria');

  // Passiva Gryffindor
  if (G.casa === 'g') {
    G.hp = Math.min(G.hpMax, G.hp + 8);
    addLog(`❤️‍🔥 Adrenalina do Leão: +8 HP!`, 'good');
  }

  // XP com boost
  let xpGanho = ini.xp;
  const mult = xpBoostAtivo();
  xpGanho = Math.floor(xpGanho * mult);
  // Anel do Estudioso
  if (G.xpBoostPassiva) xpGanho = Math.floor(xpGanho * 1.15);

  // Ouro com passiva Hufflepuff
  let ouroGanho = ini.ouro;
  if (G.casa === 'h') ouroGanho = Math.floor(ouroGanho * 1.25);

  G.xp   += xpGanho;
  G.ouro += ouroGanho;
  G.inBattle = false;

  addLog(`🏆 ${ini.nome} foi derrotado! +${xpGanho} XP${mult > 1 ? ` (x${mult.toFixed(1)} boost)` : ''} | +${ouroGanho} 🪙`, 'info');

  // Level ups
  let levelUps = 0;
  while (G.xp >= G.xpNext) {
    G.xp    -= G.xpNext;
    G.nivel++;
    G.xpNext = Math.floor(G.nivel * 110);
    G.hpMax += 20; G.hp = G.hpMax;
    G.mpMax += 10; G.mp = G.mpMax;
    levelUps++;
    tocarSom('levelup');
  }

  // Verificar missões e conquistas
  verificarMissoes();
  verificarConquistas();

  saveGame();

  // Fala do boss ao morrer
  if (ini.boss && BOSS_FALAS[ini.id]) {
    const bf = BOSS_FALAS[ini.id];
    setTimeout(() => {
      mostrarNarrativa(bf.art + ' Última Fala: ' + ini.nome, bf.fala, () => {
        irParaVitoria(ini, xpGanho, ouroGanho, levelUps);
      });
    }, 200);
    return;
  }

  irParaVitoria(ini, xpGanho, ouroGanho, levelUps);
}

function irParaVitoria(ini, xpGanho, ouroGanho, levelUps) {
  go('s-win');
  document.getElementById('win-msg').innerHTML =
    `Você derrotou ${ini.nome}!<br>+${xpGanho} XP | +${ouroGanho} 🪙`;
  document.getElementById('status-win').innerHTML = statusHTML();
  document.getElementById('level-up-banner').innerHTML = levelUps > 0
    ? `<div class="level-banner">
        ✦ SUBIU PARA NÍVEL ${G.nivel}! ✦<br>
        <span style="font-size:12px;opacity:.8">Novas áreas podem estar desbloqueadas</span>
       </div>`
    : '';
}

function gameOver() {
  G.inBattle = false;
  G.derrotas++;
  G.streakAtual = 0;
  go('s-gameover');
  document.getElementById('go-msg').textContent =
    `Você foi derrotado por ${G.inimigo.nome}. Mas os bruxos não desistem...`;
}

function tryFlee() {
  if (Math.random() < 0.5) {
    addLog('Você fugiu com sucesso!', 'info');
    G.inBattle = false;
    G.streakAtual = 0;
    setTimeout(() => { go('s-map'); renderMap(); }, 700);
  } else {
    addLog('Não conseguiu fugir!', 'bad');
    ataqueInimigo();
  }
}

// ══════════════════════════════════════════
//  INVENTÁRIO
// ══════════════════════════════════════════
function renderInv() {
  document.getElementById('status-inv').innerHTML = statusHTML();
  const itens = G.inv.filter(i => i.qtd > 0);
  document.getElementById('inv-items').innerHTML = itens.length
    ? itens.map(it => `
        <button class="item-card" onclick="usarItem('${it.id}')">
          ${it.icon} ${it.nome} x${it.qtd}<br>
          <span style="font-size:10px;opacity:.6">${it.desc}</span>
        </button>`).join('')
    : '<p style="opacity:.5;font-style:italic">Inventário vazio.</p>';
}

function usarItem(id) {
  const it = G.inv.find(i => i.id === id);
  if (!it || it.qtd <= 0) return;

  // Poções de XP
  const xpPot = LOJA_ITENS.find(x => x.id === id && x.tipo === 'xppot');
  if (xpPot) {
    G.xpBoostMult   = xpPot.xpBoost;
    G.xpBoostExpiry = Date.now() + xpPot.xpDuracao;
    notif(`${xpPot.icon} XP x${xpPot.xpBoost} por 5min!`);
    it.qtd--;
    saveGame(); renderInv(); if (G.inBattle) renderBattle();
    return;
  }

  if (id === 'potion')        { G.hp = Math.min(G.hpMax, G.hp + 40); notif('🧪 +40 HP!'); }
  if (id === 'mana_pot')      { G.mp = Math.min(G.mpMax, G.mp + 30); notif('💧 +30 MP!'); }
  if (id === 'grande_potion') { G.hp = Math.min(G.hpMax, G.hp + 80); notif('🫙 +80 HP!'); }
  if (id === 'elixir')        { G.hp = Math.min(G.hpMax, G.hp + 60); G.mp = Math.min(G.mpMax, G.mp + 40); notif('⚗️ +60 HP +40 MP!'); }
  if (id === 'potion_full')   { G.hp = G.hpMax; G.mp = G.mpMax; notif('💎 HP e MP cheios!'); }

  it.qtd--;
  saveGame(); renderInv();
  if (G.inBattle) renderBattle();
}

// ══════════════════════════════════════════
//  LOJA PRINCIPAL
// ══════════════════════════════════════════
function renderShop() {
  document.getElementById('status-shop').innerHTML = statusHTML();
  const desc = getDesconto();
  const ravenAviso = G.casa === 'r' ? `<div class="passiva-loja-info">📚 Mente Arcana: 15% de desconto aplicado!</div>` : '';

  const consumiveis  = LOJA_ITENS.filter(it => it.tipo === 'consumivel' && G.nivel >= it.nivelMin);
  const xpPots       = LOJA_ITENS.filter(it => it.tipo === 'xppot'      && G.nivel >= it.nivelMin);
  const equipamentos = LOJA_ITENS.filter(it => (it.tipo === 'varinha' || it.tipo === 'permanente') && G.nivel >= it.nivelMin);

  document.getElementById('shop-items').innerHTML = `
    ${ravenAviso}
    <div class="shop-section">
      <h3>⚗️ Poções de Cura</h3>
      ${consumiveis.length ? consumiveis.map(it => rowItemHTML(it, desc)).join('') : _semItens()}
    </div>
    <div class="shop-section">
      <h3>⭐ Poções de XP</h3>
      ${xpPots.length ? xpPots.map(it => rowItemHTML(it, desc)).join('') : _semItens()}
    </div>
    <div class="shop-section">
      <h3>🪄 Equipamentos</h3>
      ${equipamentos.length ? equipamentos.map(it => rowItemHTML(it, desc)).join('') : _semItens()}
    </div>`;
}

function _semItens() {
  return '<p style="opacity:.4;font-size:12px;padding:.5rem 0">Nenhum disponível ainda.</p>';
}

function rowItemHTML(it, desc = 1.0) {
  let bloqueado = false, motivo = '';

  if (it.tipo === 'varinha') {
    if (G.varinhasCompradas[it.varinhaLvl]) {
      bloqueado = true; motivo = 'Já comprado';
    } else if (it.varinhaLvl > 1 && !G.varinhasCompradas[it.varinhaLvl - 1]) {
      bloqueado = true; motivo = `Requer tier ${it.varinhaLvl - 1}`;
    }
  }
  if (it.tipo === 'permanente' && G.permanentesComprados[it.id]) {
    bloqueado = true; motivo = 'Já comprado';
  }

  const precoFinal = Math.floor(it.preco * desc);
  const semOuro    = G.ouro < precoFinal;
  const badge      = bloqueado ? `<span class="badge badge-lock">${motivo}</span>` : '';
  const descontoTxt = desc < 1 ? ` <span style="font-size:9px;opacity:.5;text-decoration:line-through">🪙${formatOuro(it.preco)}</span>` : '';

  return `
    <div class="shop-row">
      <div class="shop-row-info">
        ${it.icon} <strong>${it.nome}</strong>${badge}<br>
        <span style="font-size:11px;opacity:.6">${it.desc}</span>
      </div>
      <button class="btn" style="padding:5px 11px;font-size:11px;white-space:nowrap"
        onclick="comprar('${it.id}')" ${bloqueado || semOuro ? 'disabled' : ''}>
        🪙${formatOuro(precoFinal)}${descontoTxt}
      </button>
    </div>`;
}

function comprar(id) {
  const desc = getDesconto();
  const lj = LOJA_ITENS.find(i => i.id === id);
  if (!lj) return;
  const preco = Math.floor(lj.preco * desc);
  if (G.ouro < preco) { notif('Ouro insuficiente!'); return; }
  G.ouro -= preco;
  tocarSom('compra');

  if (lj.tipo === 'varinha') {
    const bonus = lj.varinhaLvl === 1 ? 10 : lj.varinhaLvl === 2 ? 25 : 50;
    G.bonusDmg += bonus;
    G.varinhasCompradas[lj.varinhaLvl] = true;
    notif(`${lj.icon} +${bonus} dano permanente!`);
  } else if (lj.tipo === 'permanente') {
    if (id === 'escudo')     { G.hpMax += 15; G.hp = Math.min(G.hp + 15, G.hpMax); notif('🔰 +15 HP máximo!'); }
    if (id === 'pergaminho') { G.mpMax += 10; G.mp = Math.min(G.mp + 10, G.mpMax); notif('📜 +10 MP máximo!'); }
    if (id === 'colar_crit') { G.chanceCritico = (G.chanceCritico || 0.10) + 0.10; notif('🍀 Crítico +10%!'); }
    if (id === 'anel_xp')    { G.xpBoostPassiva = true; notif('💍 +15% XP permanente!'); }
    G.permanentesComprados[id] = true;
  } else {
    // Consumível ou xppot
    const ex = G.inv.find(i => i.id === id);
    if (ex) { ex.qtd++; }
    else    { G.inv.push({ ...lj, qtd: 1 }); }
    notif(`${lj.icon} ${lj.nome} comprado!`);
  }

  saveGame();
  renderShop();
  verificarMissoes();
  verificarConquistas();
}

// ══════════════════════════════════════════
//  LOJA DE MAGIA
// ══════════════════════════════════════════
function renderMagicShop() {
  document.getElementById('status-magic').innerHTML = statusHTML();
  const desc = getDesconto();
  const magias = MAGIAS_LOJA.filter(m => G.nivel >= m.nivelMin);

  document.getElementById('magic-items').innerHTML = `
    <div class="shop-section">
      <h3>📖 Pergaminhos de Magia</h3>
      ${magias.length ? magias.map(m => rowMagiaHTML(m, desc)).join('') : _semItens()}
    </div>`;
}

function rowMagiaHTML(m, desc = 1.0) {
  const aprendida  = G.magicsAprendidas.includes(m.id);
  const precoFinal = Math.floor(m.preco * desc);
  const semOuro    = G.ouro < precoFinal;
  const badge      = aprendida ? `<span class="badge badge-learned">Aprendida</span>` : '';
  const descontoTxt = desc < 1 && !aprendida ? ` <span style="font-size:9px;opacity:.5;text-decoration:line-through">🪙${formatOuro(m.preco)}</span>` : '';
  return `
    <div class="shop-row">
      <div class="shop-row-info">
        ${m.icon} <strong>${m.nome}</strong>${badge}<br>
        <span style="font-size:11px;opacity:.6">${m.dano[0]}–${m.dano[1]} dano | MP:${m.mp} — ${m.desc}</span>
      </div>
      <button class="btn" style="padding:5px 11px;font-size:11px;white-space:nowrap"
        onclick="aprenderMagia('${m.id}')" ${aprendida || semOuro ? 'disabled' : ''}>
        ${aprendida ? '✓' : '🪙' + formatOuro(precoFinal) + descontoTxt}
      </button>
    </div>`;
}

function aprenderMagia(id) {
  const desc = getDesconto();
  const m = MAGIAS_LOJA.find(i => i.id === id);
  if (!m || G.magicsAprendidas.includes(id)) { notif('Magia já aprendida!'); return; }
  const preco = Math.floor(m.preco * desc);
  if (G.ouro < preco) { notif('Ouro insuficiente!'); return; }
  G.ouro -= preco;
  G.magicsAprendidas.push(id);
  tocarSom('compra');
  notif(`${m.icon} ${m.nome} aprendida!`);
  saveGame();
  renderMagicShop();
  verificarConquistas();
}

// ══════════════════════════════════════════
//  LOJA DE DESCANSO
// ══════════════════════════════════════════
let _restTimer = null;
let _restEndTime = 0;

function renderRestShop() {
  document.getElementById('status-rest').innerHTML = statusHTML();

  const agora = Date.now();
  const descansando = agora < G.descansoExpiry;
  const restante = descansando ? Math.ceil((G.descansoExpiry - agora) / 1000) : 0;

  document.getElementById('rest-content').innerHTML = `
    <div class="rest-box">
      <div style="font-size:40px;text-align:center;margin-bottom:.5rem">🛏️</div>
      <h3 style="text-align:center;opacity:.8;margin-bottom:.5rem">Pousada do Bruxo Cansado</h3>
      <p style="font-size:13px;opacity:.6;text-align:center;margin-bottom:1rem;font-style:italic">
        "Descanse, jovem bruxo. A magia se recupera com o tempo..."
      </p>
      <div style="border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:1rem;background:rgba(255,255,255,.04);margin-bottom:1rem">
        <div style="font-family:'Cinzel',serif;font-size:11px;opacity:.5;margin-bottom:.5rem">RECUPERAÇÃO DE MANA</div>
        <div style="font-size:13px">⏱️ Descanse 1 minuto → recupera <strong>10 MP</strong></div>
        <div style="font-size:11px;opacity:.5;margin-top:4px">O descanso continua mesmo enquanto você explora</div>
      </div>
      ${descansando
        ? `<div id="rest-timer-box" class="rest-timer">
            ⏳ Descansando... <span id="rest-countdown">${restante}s</span> restantes<br>
            <div style="font-size:11px;opacity:.6;margin-top:4px">MP atual: ${G.mp}/${G.mpMax}</div>
           </div>`
        : `<button class="btn btn-center" onclick="iniciarDescanso()" ${G.mp >= G.mpMax ? 'disabled' : ''}>
            🛏️ Descansar (1 min → +10 MP)
           </button>
           ${G.mp >= G.mpMax ? '<p style="font-size:11px;opacity:.5;text-align:center;margin-top:4px">MP já está cheio!</p>' : ''}`}
    </div>`;

  if (descansando) startRestCountdown();
}

function iniciarDescanso() {
  if (G.mp >= G.mpMax) { notif('MP já está cheio!'); return; }
  G.descansoExpiry = Date.now() + 60000; // 1 minuto
  saveGame();
  renderRestShop();
  startRestCountdown();
  notif('🛏️ Descanso iniciado! +10 MP em 1 minuto');
}

function startRestCountdown() {
  clearInterval(_restTimer);
  _restTimer = setInterval(() => {
    const agora = Date.now();
    const cd = document.getElementById('rest-countdown');
    if (cd) cd.textContent = Math.max(0, Math.ceil((G.descansoExpiry - agora) / 1000)) + 's';

    if (agora >= G.descansoExpiry && G.descansoExpiry > 0) {
      clearInterval(_restTimer);
      G.mp = Math.min(G.mpMax, G.mp + 10);
      G.descansoExpiry = 0;
      saveGame();
      notif('✨ Descanso concluído! +10 MP recuperados!');
      renderRestShop();
      // Atualiza status na batalha se estiver em batalha
      if (G.inBattle) renderBattle();
    }
  }, 1000);
}

// ══════════════════════════════════════════
//  MISSÕES
// ══════════════════════════════════════════
function renderMissoes() {
  const lista = MISSOES_DEF.map(m => {
    const completa = G.missoesCompletas.includes(m.id);
    const progresso = getProgressoMissao(m);
    const pct = Math.min(100, Math.floor(progresso / m.alvo * 100));
    return `
      <div class="missao-card ${completa ? 'missao-completa' : ''}">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem">
          <span style="font-size:18px">${m.icon}</span>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:12px">${m.nome} ${completa ? '✅' : ''}</div>
            <div style="font-size:11px;opacity:.6">${m.desc}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:.5rem">
          <div class="bar-wrap" style="flex:1;height:6px">
            <div class="bar-fill" style="width:${pct}%;background:${completa ? '#7dff9a' : '#ffd07d'}"></div>
          </div>
          <span style="font-size:10px;opacity:.6">${Math.min(progresso, m.alvo)}/${m.alvo}</span>
        </div>
        ${completa ? '' : `<div style="font-size:10px;opacity:.5;margin-top:3px">Recompensa: 🪙${m.recompensa.ouro}${m.recompensa.xp > 0 ? ` +${m.recompensa.xp}⭐` : ''}</div>`}
      </div>`;
  }).join('');

  document.getElementById('missoes-lista').innerHTML = lista || '<p style="opacity:.5">Nenhuma missão disponível.</p>';
}

function getProgressoMissao(m) {
  switch (m.tipo) {
    case 'kills_total': return G.killsTotal || 0;
    case 'kills_boss':  return G.killsBoss  || 0;
    case 'nivel':       return G.nivel;
    case 'ouro':        return G.ouro;
    case 'streak':      return G.streakMax  || 0;
    default: return 0;
  }
}

function verificarMissoes() {
  for (const m of MISSOES_DEF) {
    if (G.missoesCompletas.includes(m.id)) continue;
    if (getProgressoMissao(m) >= m.alvo) {
      G.missoesCompletas.push(m.id);
      G.ouro += m.recompensa.ouro;
      G.xp   += m.recompensa.xp;
      tocarSom('levelup');
      notif(`${m.icon} Missão: ${m.nome} completa! +${m.recompensa.ouro}🪙${m.recompensa.xp > 0 ? ' +' + m.recompensa.xp + '⭐' : ''}`);
    }
  }
}

// ══════════════════════════════════════════
//  CONQUISTAS
// ══════════════════════════════════════════
function renderConquistas() {
  const lista = CONQUISTAS_DEF.map(c => {
    const desbloqueada = G.conquistasDesbloqueadas.includes(c.id);
    return `
      <div class="conquista-card ${desbloqueada ? 'conquista-ok' : 'conquista-bloq'}">
        <span style="font-size:24px">${desbloqueada ? c.icon : '🔒'}</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:12px">${c.nome}</div>
          <div style="font-size:11px;opacity:.6">${desbloqueada ? c.desc : '???'}</div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('conquistas-lista').innerHTML = lista;
}

function verificarConquistas() {
  for (const c of CONQUISTAS_DEF) {
    if (G.conquistasDesbloqueadas.includes(c.id)) continue;
    try {
      if (c.condicao(G)) {
        G.conquistasDesbloqueadas.push(c.id);
        tocarSom('levelup');
        setTimeout(() => notif(`${c.icon} Conquista: ${c.nome}!`), 500);
      }
    } catch(e) {}
  }
}

// ══════════════════════════════════════════
//  ESTATÍSTICAS
// ══════════════════════════════════════════
function renderStats() {
  const tempoJogo = formatTempo(Date.now() - (G.tempoInicio || Date.now()));
  const topInimigo = Object.entries(G.killsPorTipo || {}).sort((a,b) => b[1]-a[1])[0];

  document.getElementById('stats-content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-item-val">${G.nivel}</div><div class="stat-item-label">Nível</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.killsTotal || 0}</div><div class="stat-item-label">Inimigos Mortos</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.killsBoss || 0}</div><div class="stat-item-label">Bosses Derrotados</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.totalBatalhas || 0}</div><div class="stat-item-label">Batalhas Total</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.derrotas || 0}</div><div class="stat-item-label">Derrotas</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.streakMax || 0}</div><div class="stat-item-label">Maior Sequência</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.maiorDano || 0}</div><div class="stat-item-label">Maior Dano</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.criticosTotal || 0}</div><div class="stat-item-label">Críticos</div></div>
      <div class="stat-item"><div class="stat-item-val">${formatOuro(G.ouro)}</div><div class="stat-item-label">Ouro Atual</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.magicsAprendidas.length}</div><div class="stat-item-label">Magias Aprendidas</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.conquistasDesbloqueadas.length}/${CONQUISTAS_DEF.length}</div><div class="stat-item-label">Conquistas</div></div>
      <div class="stat-item"><div class="stat-item-val">${tempoJogo}</div><div class="stat-item-label">Tempo de Jogo</div></div>
    </div>
    ${topInimigo ? `<div style="text-align:center;font-size:12px;opacity:.5;margin-top:.5rem">Inimigo mais abatido: <strong>${INIMIGOS_BASE[topInimigo[0]]?.nome || topInimigo[0]}</strong> (${topInimigo[1]}x)</div>` : ''}`;
}

// ══════════════════════════════════════════
//  NOTIFICAÇÃO
// ══════════════════════════════════════════
let _notifTimer = null;
function notif(msg) {
  const el = document.getElementById('notif-box');
  el.textContent   = msg;
  el.style.display = 'block';
  clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => { el.style.display = 'none'; }, 2500);
  tocarSom('notif');
}
