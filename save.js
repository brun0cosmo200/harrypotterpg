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

// ══════════════════════════════════════════
//  SAVE MANAGER — renderSaveManager()
//  Gerencia slots locais + export/import
// ══════════════════════════════════════════

const SAVE_SLOT_PREFIX = 'hogwarts_slot_';
const MAX_SLOTS = 3;

function getSlotKey(n) { return `${SAVE_SLOT_PREFIX}${n}`; }

function lerSlot(n) {
  try {
    const raw = localStorage.getItem(getSlotKey(n));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // slots não têm hash – aceitar como somente leitura de metadados
    return parsed;
  } catch (e) { return null; }
}

function salvarNoSlot(n) {
  if (!G.casa) { notif('Nenhum personagem ativo para salvar.'); return; }
  const payload = getSavePayload();
  payload._slotSavedAt = Date.now();
  try {
    localStorage.setItem(getSlotKey(n), JSON.stringify(payload));
    notif(`💾 Save salvo no Slot ${n}.`);
    renderSaveManager();
  } catch (e) {
    notif('Erro ao salvar no slot.');
  }
}

function carregarDoSlot(n) {
  const raw = localStorage.getItem(getSlotKey(n));
  if (!raw) { notif('Slot vazio.'); return; }
  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizarSave(parsed);
    if (!sanitizarValores(normalized)) { notif('Slot corrompido.'); return; }
    G = { ...estadoInicial(), ...normalized };
    saveGame('auto');
    notif(`✅ Slot ${n} carregado com sucesso!`);
    go('s-map'); renderMap();
  } catch (e) {
    notif('Erro ao carregar slot.');
  }
}

function apagarSlot(n) {
  localStorage.removeItem(getSlotKey(n));
  notif(`🗑️ Slot ${n} apagado.`);
  renderSaveManager();
}

function copiarSlotParaPrimario() {
  // já feito via carregarDoSlot — esta fn fica como alias semântico
}

function exportarSave() {
  try {
    const payload = getSavePayload();
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const area = document.getElementById('export-code-area');
    if (area) { area.value = encoded; area.select(); }
    try { document.execCommand('copy'); notif('📋 Código copiado para a área de transferência!'); }
    catch (e) { notif('Código gerado — copie manualmente.'); }
  } catch (e) {
    notif('Erro ao exportar save.');
  }
}

function importarSave() {
  const area = document.getElementById('import-code-area');
  if (!area || !area.value.trim()) { notif('Cole o código de save no campo.'); return; }
  try {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(area.value.trim()))));
    const normalized = normalizarSave(decoded);
    if (!sanitizarValores(normalized)) { notif('❌ Código inválido ou corrompido.'); return; }
    G = { ...estadoInicial(), ...normalized };
    persistPayload(getSavePayload());
    notif('✅ Save importado! Recarregando...');
    setTimeout(() => { go('s-map'); renderMap(); }, 800);
  } catch (e) {
    notif('❌ Falha ao importar. Verifique o código.');
  }
}

function renderSaveManager() {
  const el = document.getElementById('save-manager-content');
  if (!el) return;

  // ── Dados do save ativo ──
  const temSaveAtivo = !!G.casa;
  const casaAtual = CASAS[G.casa] || null;
  const nivelAtual = G.nivel || 1;
  const ouroAtual = G.ouro || 0;
  const nomeAtual = G.nomePersonagem || '—';
  const saveAtStr = G.saveAt
    ? new Date(G.saveAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
    : null;

  // ── Slot ativo (primary) ──
  const slotAtivoHTML = `
    <div class="save-section-label">SAVE ATIVO</div>
    <div class="slot-card ${temSaveAtivo ? 'slot-ocupado slot-ativo' : 'slot-vazio'}">
      ${temSaveAtivo ? `
        <div class="slot-header">
          <span class="slot-num">PRIMARY</span>
          <span class="slot-badge">🟢 Ativo</span>
          ${G.campanha?.concluida ? '<span class="slot-badge camp-badge">📖 Campanha ✓</span>' : ''}
        </div>
        <div class="slot-nome">${casaAtual?.crest || ''} ${nomeAtual}</div>
        <div class="slot-info">
          Nível ${nivelAtual} · ${casaAtual?.nome || '—'}<br>
          🪙 ${ouroAtual.toLocaleString()} · ❤️ ${G.hp}/${G.hpMax}<br>
          ${saveAtStr ? `💾 ${saveAtStr}` : ''}
        </div>
        <div class="slot-actions">
          <button class="btn" style="font-size:11px;flex:1" onclick="manualSaveGame();renderSaveManager()">💾 Salvar agora</button>
        </div>
      ` : `
        <div style="opacity:.4;font-style:italic;font-size:12px">Nenhum personagem ativo</div>
      `}
    </div>`;

  // ── Slots 1-3 ──
  const slotsHTML = Array.from({ length: MAX_SLOTS }, (_, i) => {
    const n = i + 1;
    const slot = lerSlot(n);

    if (!slot) {
      return `
        <div class="slot-card slot-vazio">
          <div class="slot-num">SLOT ${n}</div>
          <div style="font-size:11px;opacity:.4;margin:.4rem 0;font-style:italic">Vazio</div>
          <div class="slot-actions" style="margin-top:auto">
            <button class="btn" style="font-size:11px;flex:1;opacity:${temSaveAtivo?1:.4}"
              ${temSaveAtivo ? `onclick="salvarNoSlot(${n})"` : 'disabled'}>
              💾 Salvar aqui
            </button>
          </div>
        </div>`;
    }

    const casaSlot = CASAS[slot.casa] || null;
    const dtStr = slot._slotSavedAt
      ? new Date(slot._slotSavedAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
      : (slot.saveAt ? new Date(slot.saveAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—');

    return `
      <div class="slot-card slot-ocupado">
        <div class="slot-header">
          <span class="slot-num">SLOT ${n}</span>
          ${slot.campanha?.concluida ? '<span class="slot-badge camp-badge">📖 Camp ✓</span>' : ''}
        </div>
        <div class="slot-nome">${casaSlot?.crest || ''} ${slot.nomePersonagem || '—'}</div>
        <div class="slot-info">
          Nível ${slot.nivel || 1} · ${casaSlot?.nome || '—'}<br>
          🪙 ${(slot.ouro || 0).toLocaleString()}<br>
          💾 ${dtStr}
        </div>
        <div class="slot-actions">
          <button class="btn" style="font-size:10px;flex:1" onclick="carregarDoSlot(${n})">⬆️ Carregar</button>
          <button class="btn" style="font-size:10px;flex:1" onclick="salvarNoSlot(${n})">💾 Sobrescrever</button>
          <button class="btn" style="font-size:10px;background:rgba(255,60,60,.12);border-color:rgba(255,60,60,.3)"
            onclick="if(confirm('Apagar Slot ${n}?')) apagarSlot(${n})">🗑️</button>
        </div>
      </div>`;
  }).join('');

  // ── Export / Import ──
  const transferHTML = `
    <div class="save-section-label" style="margin-top:1rem">EXPORTAR / IMPORTAR</div>
    <div class="slot-card" style="gap:8px">
      <div style="font-size:11px;opacity:.6;font-style:italic;line-height:1.5">
        Use para fazer backup ou transferir seu save entre dispositivos.
      </div>
      <textarea id="export-code-area" placeholder="Clique em Exportar para gerar o código…"></textarea>
      <div class="transfer-row">
        <button class="btn" onclick="exportarSave()">📤 Exportar save ativo</button>
      </div>
      <textarea id="import-code-area" placeholder="Cole aqui o código de importação…"></textarea>
      <div class="transfer-row">
        <button class="btn" onclick="importarSave()">📥 Importar e carregar</button>
      </div>
    </div>`;

  // ── Backup automático ──
  const backupRaw = localStorage.getItem('hogwarts_rpg_v5_backup');
  let backupHTML = '';
  if (backupRaw) {
    try {
      const bk = JSON.parse(backupRaw);
      const bkDt = bk.saveAt ? new Date(bk.saveAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—';
      const bkCasa = CASAS[bk.casa] || null;
      backupHTML = `
        <div class="save-section-label" style="margin-top:1rem">BACKUP AUTOMÁTICO</div>
        <div class="slot-card slot-ocupado">
          <div class="slot-header"><span class="slot-num">BACKUP</span><span class="slot-badge" style="opacity:.6">⚙️ Auto</span></div>
          <div class="slot-nome">${bkCasa?.crest || ''} ${bk.nomePersonagem || '—'}</div>
          <div class="slot-info">Nível ${bk.nivel || 1} · ${bkCasa?.nome || '—'} · 💾 ${bkDt}</div>
          <div class="slot-actions">
            <button class="btn" style="font-size:11px;flex:1" onclick="if(confirm('Restaurar backup? O save atual será substituído.')) restaurarBackup()">♻️ Restaurar backup</button>
          </div>
        </div>`;
    } catch (e) {}
  }

  el.innerHTML = `
    <div class="save-manager-wrap">
      ${slotAtivoHTML}
      <div class="save-section-label" style="margin-top:1rem">SLOTS DE SAVE</div>
      <div class="slots-grid">${slotsHTML}</div>
      ${backupHTML}
      ${transferHTML}
    </div>`;
}

function restaurarBackup() {
  const raw = localStorage.getItem('hogwarts_rpg_v5_backup');
  if (!raw) { notif('Nenhum backup disponível.'); return; }
  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizarSave(parsed);
    if (!sanitizarValores(normalized)) { notif('Backup corrompido.'); return; }
    G = { ...estadoInicial(), ...normalized };
    saveGame('auto');
    notif('✅ Backup restaurado!');
    go('s-map'); renderMap();
  } catch (e) {
    notif('Erro ao restaurar backup.');
  }
}
