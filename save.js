// ══════════════════════════════════════════
//  save.js — Sistema de save com proteção anti-trapaça
// ══════════════════════════════════════════

const SAVE_KEY = 'hogwarts_rpg_v4';
const _SECRET  = 'hgwts_s3cr3t_k3y_v4';

function gerarHash(d) {
  const campos = [
    d.nivel, d.ouro, d.hp, d.hpMax, d.mp, d.mpMax,
    d.xp, d.bonusDmg, d.casa,
    JSON.stringify(d.varinhasCompradas),
    JSON.stringify(d.permanentesComprados),
    JSON.stringify(d.magicsAprendidas),
    _SECRET
  ].join('|');

  let hash = 0x811c9dc5;
  for (let i = 0; i < campos.length; i++) {
    hash ^= campos.charCodeAt(i);
    hash  = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

function validarHash(d) {
  if (!d || !d._hash) return false;
  return d._hash === gerarHash(d);
}

function sanitizarValores(d) {
  const MAX_NIVEL = 99;
  const MAX_OURO  = 99999999;
  const MAX_HP    = 5000;
  const MAX_MP    = 2000;
  const MAX_DMG   = 300;

  if (d.nivel < 1   || d.nivel > MAX_NIVEL) return false;
  if (d.ouro  < 0   || d.ouro  > MAX_OURO)  return false;
  if (d.hpMax < 100 || d.hpMax > MAX_HP)    return false;
  if (d.mpMax < 60  || d.mpMax > MAX_MP)    return false;
  if (d.bonusDmg < 0 || d.bonusDmg > MAX_DMG) return false;
  if (d.xp < 0 || d.xp > d.xpNext)         return false;
  if (d.hp < 0 || d.hp > d.hpMax)           return false;
  if (d.mp < 0 || d.mp > d.mpMax)           return false;

  const hpEsperado = 100 + (d.nivel - 1) * 20;
  const mpEsperado = 60  + (d.nivel - 1) * 10;
  if (d.hpMax > hpEsperado + 15) return false;
  if (d.mpMax > mpEsperado + 10) return false;

  let dmgEsperado = 0;
  if (d.varinhasCompradas[1]) dmgEsperado += 10;
  if (d.varinhasCompradas[2]) dmgEsperado += 25;
  if (d.varinhasCompradas[3]) dmgEsperado += 50;
  if (d.bonusDmg !== dmgEsperado) return false;

  return true;
}

function saveGame() {
  if (!G.casa) return;
  try {
    G.saveAt = Date.now();
    const toSave = { ...G };
    toSave._hash = gerarHash(toSave);
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    const el = document.getElementById('save-ind');
    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    el.textContent = `💾 ${agora}`;
    setTimeout(() => { el.textContent = ''; }, 2000);
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);

    if (!validarHash(saved)) {
      console.warn('[SAVE] Hash inválido.');
      localStorage.removeItem(SAVE_KEY);
      return 'tamper';
    }

    if (!sanitizarValores(saved)) {
      console.warn('[SAVE] Valores inconsistentes.');
      localStorage.removeItem(SAVE_KEY);
      return 'tamper';
    }

    G = { ...estadoInicial(), ...saved };

    // Restaurar descanso ativo se ainda não expirou
    if (G.descansoExpiry && G.descansoExpiry > Date.now()) {
      startRestCountdown();
    } else if (G.descansoExpiry && G.descansoExpiry <= Date.now() && G.descansoExpiry > 0) {
      // Descanso completou enquanto estava fora
      G.mp = Math.min(G.mpMax, (G.mp || 0) + 10);
      G.descansoExpiry = 0;
    }

    return true;
  } catch (e) {
    console.error('[SAVE] Erro:', e);
    return false;
  }
}

function deleteSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}
