const SAVE_KEY = 'hogwarts_rpg_v5_primary';
const SAVE_BACKUP_KEY = 'hogwarts_rpg_v5_backup';
const LEGACY_SAVE_KEY = 'hogwarts_rpg_v4';
const SAVE_META_KEY = 'hogwarts_rpg_v5_meta';
const _SECRET = 'hgwts_s3cr3t_k3y_v5';
let _autoSaveTimer = null;
let _saveFeedbackTimer = null;

function gerarHash(d) {
  const campos = [
    d.casa, d.claId, d.nomePersonagem,
    d.nivel, d.ouro, d.hp, d.hpMax, d.mp, d.mpMax,
    d.xp, d.xpNext, d.bonusDmg, d.chanceCritico,
    JSON.stringify(d.varinhasCompradas),
    JSON.stringify(d.permanentesComprados),
    JSON.stringify(d.magicsAprendidas),
    JSON.stringify(d.habilidadesAprendidas),
    JSON.stringify(d.conquistasDesbloqueadas),
    JSON.stringify(d.missoesCompletas),
    JSON.stringify(d.inv),
    JSON.stringify(d.killsPorTipo),
    _SECRET
  ].join('|');

  let hash = 0x811c9dc5;
  for (let i = 0; i < campos.length; i++) {
    hash ^= campos.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

function validarHash(d) {
  if (!d || !d._hash) return false;
  return d._hash === gerarHash(d);
}

function cloneSaveData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getSavePayload() {
  const toSave = cloneSaveData(G);
  toSave.saveAt = Date.now();
  toSave._hash = gerarHash(toSave);
  return toSave;
}

function sanitizarValores(d) {
  if (!d || typeof d !== 'object') return false;
  const checks = [
    Number.isFinite(d.nivel) && d.nivel >= 1 && d.nivel <= 99,
    Number.isFinite(d.ouro) && d.ouro >= 0 && d.ouro <= 999999999,
    Number.isFinite(d.hpMax) && d.hpMax >= 100 && d.hpMax <= 10000,
    Number.isFinite(d.mpMax) && d.mpMax >= 60 && d.mpMax <= 5000,
    Number.isFinite(d.hp) && d.hp >= 0 && d.hp <= d.hpMax,
    Number.isFinite(d.mp) && d.mp >= 0 && d.mp <= d.mpMax,
    Number.isFinite(d.xp) && d.xp >= 0,
    Number.isFinite(d.xpNext) && d.xpNext >= 100,
    Number.isFinite(d.bonusDmg) && d.bonusDmg >= 0 && d.bonusDmg <= 5000,
    typeof d.varinhasCompradas === 'object',
    typeof d.permanentesComprados === 'object',
    Array.isArray(d.magicsAprendidas),
    Array.isArray(d.habilidadesAprendidas),
    Array.isArray(d.conquistasDesbloqueadas),
    Array.isArray(d.inv)
  ];
  return checks.every(Boolean);
}

function normalizarSave(raw) {
  const base = estadoInicial();
  const data = { ...base, ...raw };
  data.inv = Array.isArray(raw?.inv)
    ? raw.inv.map(it => ({ ...it, qtd: Math.max(0, Number(it.qtd) || 0) })).filter(it => it.qtd > 0)
    : base.inv;
  data.varinhasCompradas = { ...base.varinhasCompradas, ...(raw?.varinhasCompradas || {}) };
  data.permanentesComprados = { ...base.permanentesComprados, ...(raw?.permanentesComprados || {}) };
  data.magicsAprendidas = Array.isArray(raw?.magicsAprendidas) ? [...new Set(raw.magicsAprendidas)] : [];
  data.habilidadesAprendidas = Array.isArray(raw?.habilidadesAprendidas) ? [...new Set(raw.habilidadesAprendidas)] : [];
  data.missoesCompletas = Array.isArray(raw?.missoesCompletas) ? [...new Set(raw.missoesCompletas)] : [];
  data.conquistasDesbloqueadas = Array.isArray(raw?.conquistasDesbloqueadas) ? [...new Set(raw.conquistasDesbloqueadas)] : [];
  data.diario = Array.isArray(raw?.diario) ? raw.diario.slice(-60) : [];
  data.zonasVisitadas = Array.isArray(raw?.zonasVisitadas) ? [...new Set(raw.zonasVisitadas)] : [];
  data.claHistorico = Array.isArray(raw?.claHistorico) ? raw.claHistorico.slice(-12) : [];
  data.killsPorTipo = typeof raw?.killsPorTipo === 'object' && raw.killsPorTipo ? raw.killsPorTipo : {};
  data.votos = typeof raw?.votos === 'object' && raw.votos ? { g: 0, s: 0, r: 0, h: 0, ...raw.votos } : base.votos;
  data.nomePersonagem = String(raw?.nomePersonagem || base.nomePersonagem || '').slice(0, 20);
  data.claId = raw?.claId || null;
  data.girosCla = Number.isFinite(raw?.girosCla) ? Math.max(0, raw.girosCla) : 0;
  data.claRaridade = raw?.claRaridade || null;
  data.autoSaveVersion = 5;
  data.hp = Math.min(data.hpMax, Math.max(0, data.hp));
  data.mp = Math.min(data.mpMax, Math.max(0, data.mp));
  data.xp = Math.min(Math.max(0, data.xp), Math.max(0, data.xpNext - 1));
  return data;
}

function updateSaveIndicator(msg, state = 'ok') {
  const el = document.getElementById('save-ind');
  if (!el) return;
  el.textContent = msg;
  el.dataset.state = state;
  clearTimeout(_saveFeedbackTimer);
  if (state !== 'warn') {
    _saveFeedbackTimer = setTimeout(() => {
      el.textContent = '';
      el.dataset.state = '';
    }, 2600);
  }
}

function persistPayload(payload) {
  const previous = localStorage.getItem(SAVE_KEY);
  if (previous) localStorage.setItem(SAVE_BACKUP_KEY, previous);
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  localStorage.setItem(SAVE_META_KEY, JSON.stringify({
    lastSaveAt: payload.saveAt,
    hasBackup: !!previous
  }));
}

function saveGame(kind = 'auto') {
  if (!G.casa) return false;
  try {
    const payload = getSavePayload();
    persistPayload(payload);
    const agora = new Date(payload.saveAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    updateSaveIndicator(kind === 'manual' ? `SAVE MANUAL ${agora}` : `AUTO SAVE ${agora}`);
    return true;
  } catch (e) {
    console.error('[SAVE] Erro ao salvar:', e);
    updateSaveIndicator('ERRO AO SALVAR', 'warn');
    return false;
  }
}

function manualSaveGame() {
  const ok = saveGame('manual');
  if (ok && typeof notif === 'function') notif('Save manual concluido com sucesso.');
}

function queueAutoSave(delay = 900) {
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => saveGame('auto'), delay);
}

function initAutoSave() {
  window.addEventListener('beforeunload', () => saveGame('auto'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveGame('auto');
  });
  setInterval(() => {
    if (G?.casa) saveGame('auto');
  }, 20000);
}

function tentarCarregar(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!validarHash(parsed)) return null;
    const normalized = normalizarSave(parsed);
    return sanitizarValores(normalized) ? normalized : null;
  } catch (e) {
    return null;
  }
}

function migrarLegacySave() {
  const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
  if (!legacy) return null;
  try {
    const parsed = JSON.parse(legacy);
    if (!validarHash(parsed)) return null;
    const normalized = normalizarSave(parsed);
    if (!sanitizarValores(normalized)) return null;
    const payload = { ...normalized };
    payload._hash = gerarHash(payload);
    persistPayload(payload);
    return normalized;
  } catch (e) {
    return null;
  }
}

function loadGame() {
  try {
    const primary = tentarCarregar(localStorage.getItem(SAVE_KEY));
    const backup = tentarCarregar(localStorage.getItem(SAVE_BACKUP_KEY));
    const legacy = primary || backup ? null : migrarLegacySave();
    const recovered = primary || backup || legacy;

    if (!recovered) return false;

    G = { ...estadoInicial(), ...recovered };

    if (!primary && backup) {
      updateSaveIndicator('BACKUP RECUPERADO', 'warn');
      setTimeout(() => saveGame('auto'), 200);
    }

    if (G.descansoExpiry && G.descansoExpiry > Date.now()) {
      startRestCountdown();
    } else if (G.descansoExpiry && G.descansoExpiry <= Date.now() && G.descansoExpiry > 0) {
      G.mp = Math.min(G.mpMax, (G.mp || 0) + 10);
      G.descansoExpiry = 0;
    }

    return true;
  } catch (e) {
    console.error('[SAVE] Erro ao carregar:', e);
    return false;
  }
}

function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_BACKUP_KEY);
    localStorage.removeItem(SAVE_META_KEY);
    localStorage.removeItem(LEGACY_SAVE_KEY);
  } catch (e) {}
}
