// ══════════════════════════════════════════════════════════
//  campanha-patch.js — v1
//  Enhancements visuais para a campanha sem alterar campanha.js:
//  · Efeito typewriter nas cenas narrativas
//  · Ornamentos SVG por capítulo
//  · Painel de humor de aliados em tempo real
//  · Boss preview cinematográfico
//  · Transição "virar página" entre cenas
//  · rel-fill com classes .pos/.neg
// ══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── RUNAS SVG POR CAPÍTULO ──
  const RUNAS_SVG = {
    prologo: `<svg viewBox="0 0 60 30" width="60" height="30">
      <path d="M5 15 Q15 5 30 15 Q45 5 55 15"/>
      <path d="M5 15 Q15 25 30 15 Q45 25 55 15"/>
      <circle cx="30" cy="15" r="4"/>
      <path d="M30 4 L30 11 M30 19 L30 26"/>
    </svg>`,

    cap1: `<svg viewBox="0 0 60 30" width="60" height="30">
      <path d="M10 25 L30 5 L50 25"/>
      <path d="M18 17 L42 17"/>
      <circle cx="30" cy="15" r="3"/>
      <path d="M22 25 L30 10 L38 25"/>
    </svg>`,

    cap2: `<svg viewBox="0 0 60 30" width="60" height="30">
      <rect x="20" y="8" width="20" height="14" rx="1"/>
      <path d="M30 8 L30 22 M20 15 L40 15"/>
      <path d="M14 5 Q10 15 14 25 M46 5 Q50 15 46 25"/>
    </svg>`,

    cap3: `<svg viewBox="0 0 60 30" width="60" height="30">
      <circle cx="30" cy="15" r="10"/>
      <circle cx="30" cy="15" r="5"/>
      <path d="M30 5 L30 2 M30 28 L30 25 M20 15 L17 15 M43 15 L40 15"/>
      <path d="M22.9 7.9 L20.8 5.8 M39.2 22.2 L37.1 20.1"/>
    </svg>`,

    cap4: `<svg viewBox="0 0 60 30" width="60" height="30">
      <path d="M10 25 L30 2 L50 25 Z"/>
      <path d="M20 25 L30 8 L40 25"/>
      <path d="M15 18 L45 18"/>
      <circle cx="30" cy="14" r="2"/>
    </svg>`,

    cap5: `<svg viewBox="0 0 80 30" width="80" height="30">
      <path d="M5 20 L20 5 L40 20 L60 5 L75 20"/>
      <path d="M20 5 L20 25 M60 5 L60 25"/>
      <path d="M5 20 L75 20"/>
      <circle cx="40" cy="15" r="5"/>
      <circle cx="40" cy="15" r="2"/>
    </svg>`,
  };

  // ── FALAS CONTEXTUAIS (para tooltip do painel de humor) ──
  const NPC_FALAS_PANEL = {
    dumbledore: { alto:'✨ Você me surpreende.', medio:'📜 Continue, Escolhido.', baixo:'😔 Esperava mais de você.', critico:'⚠️ Estou decepcionado.' },
    hermione:   { alto:'📚 Impressionante.', medio:'🤔 Entendo sua escolha.', baixo:'😤 Isso foi impulsivo.', critico:'😠 Completamente irresponsável.' },
    snape:      { alto:'🖼️ ...Adequado.', medio:'😒 Mediano. Mas vivo.', baixo:'💀 Imbecil.', critico:'😡 Você me envergonha.' },
    neville:    { alto:'🌿 Você é incrível!', medio:'😊 Confio em você.', baixo:'😟 Tá tudo bem com você?', critico:'😰 Algumas escolhas me assustam.' },
    luna:       { alto:'🌙 As estrelas aprovam.', medio:'🌿 Há mais de uma via.', baixo:'🍄 O vento mudou.', critico:'🌑 Sinto névoa ao seu redor.' },
    draco:      { alto:'🐉 Talvez eu tenha me enganado sobre você.', medio:'😏 Interessante.', baixo:'😒 Típico.', critico:'😤 Sabia que não podia confiar.' },
    ginny:      { alto:'⚡ Orgulhosa de você!', medio:'😊 Tá no caminho.', baixo:'🤨 Tem certeza disso?', critico:'😡 Isso foi um erro enorme.' },
  };

  function getHumorLabel(val) {
    if (val >= 30)  return 'alto';
    if (val >= 0)   return 'medio';
    if (val >= -30) return 'baixo';
    return 'critico';
  }
  function getHumorClass(val) {
    if (val >= 30)  return 'h-alto';
    if (val >= 0)   return 'h-medio';
    if (val >= -30) return 'h-baixo';
    return 'h-baixo';
  }
  function getChipHumor(val) {
    if (val >= 30)  return 'alto';
    if (val >= 0)   return 'medio';
    if (val >= -30) return 'baixo';
    return 'neutro';
  }

  // ── TYPEWRITER ──
  function typewriterEffect(el) {
    if (!el) return;
    const raw = el.innerHTML;
    el.classList.add('typewriter-active');

    // Divide em "tokens" (tags HTML ou chars simples)
    const tokens = [];
    let i = 0;
    while (i < raw.length) {
      if (raw[i] === '<') {
        const end = raw.indexOf('>', i);
        tokens.push({ tag: true, text: raw.slice(i, end + 1) });
        i = end + 1;
      } else {
        tokens.push({ tag: false, text: raw[i] });
        i++;
      }
    }

    el.innerHTML = '';
    let t = 0;
    const BASE = 22; // ms por char

    function step() {
      if (t >= tokens.length) {
        el.classList.remove('typewriter-active');
        return;
      }
      const tok = tokens[t++];
      if (tok.tag) {
        el.innerHTML += tok.text;
      } else {
        const span = document.createElement('span');
        span.className = 'char';
        span.style.animationDelay = '0ms';
        span.textContent = tok.text;
        el.appendChild(span);
      }
      const delay = tok.tag ? 0 : (tok.text === '\n' || tok.text === ' ' ? BASE * .5 : BASE);
      setTimeout(step, delay);
    }
    setTimeout(step, 80);
  }

  // ── INJETAR RUNA SVG no header ──
  function injectCapRuneSvg(capId, headerEl) {
    if (!headerEl) return;
    const svg = RUNAS_SVG[capId] || RUNAS_SVG['prologo'];
    const existing = headerEl.querySelector('.cap-rune-svg');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.className = 'cap-rune-svg';
    wrap.innerHTML = svg;

    // Insere antes do kicker
    const kicker = headerEl.querySelector('.cap-kicker');
    if (kicker) headerEl.insertBefore(wrap, kicker);
    else headerEl.prepend(wrap);
  }

  // ── PAINEL DE HUMOR ──
  function buildHumorPanel() {
    if (!window.G || !G.campanha) return '';
    const rel  = G.campanha.relacionamentos;
    const npcs = [
      { id:'dumbledore', nome:'Dumbledore', icon:'🌟' },
      { id:'hermione',   nome:'Hermione',   icon:'📚' },
      { id:'snape',      nome:'Snape',      icon:'🖼️' },
      { id:'neville',    nome:'Neville',    icon:'🌿' },
      { id:'luna',       nome:'Luna',       icon:'🌙' },
      { id:'draco',      nome:'Draco',      icon:'🐉' },
      { id:'ginny',      nome:'Ginny',      icon:'⚡' },
    ];

    const chips = npcs.map(n => {
      const val   = rel[n.id] || 0;
      const humor = getHumorLabel(val);
      const hCls  = getHumorClass(val);
      const fala  = NPC_FALAS_PANEL[n.id]?.[humor] || '';
      return `<div class="humor-npc" title="${fala}">
        <span>${n.icon}</span>
        <div class="humor-npc-dot ${hCls}"></div>
        <span class="humor-npc-nome">${n.nome.slice(0,4)}</span>
      </div>`;
    }).join('');

    return `<div class="humor-panel">
      <div class="humor-panel-label">Estado dos aliados</div>
      ${chips}
    </div>`;
  }

  // ── ENRIQUECER ALIADOS CHIPS com data-humor ──
  function enrichAliadoChips(container) {
    if (!window.G || !G.campanha) return;
    const rel = G.campanha.relacionamentos;
    container.querySelectorAll('.aliado-chip').forEach(chip => {
      // tenta inferir o NPC pelo texto do chip
      const txt = chip.textContent.toLowerCase();
      const npcId = Object.keys(rel).find(k => txt.includes(k.slice(0,4)));
      if (npcId) {
        const val = rel[npcId] || 0;
        chip.setAttribute('data-humor', getChipHumor(val));
      }
    });
  }

  // ── ENRIQUECER INIMIGO PREVIEW ──
  function enrichInimigoPrev(container) {
    const prev = container.querySelector('.inimigo-preview');
    if (!prev) return;

    // Pega dados do inimigo do _inimigoCache
    const inimigo = window._inimigoCache;
    if (!inimigo) return;

    // Já enriquecido?
    if (prev.dataset.enriched) return;
    prev.dataset.enriched = '1';

    const stars = '⭐'.repeat(inimigo.dificuldade || 3);

    prev.innerHTML = `
      <div class="inimigo-preview-inner">
        <div class="inimigo-art-wrap">
          <span class="inimigo-art-emoji">${inimigo.art}</span>
        </div>
        <div class="inimigo-nome">${inimigo.nome}</div>
        <div class="inimigo-dificuldade">
          ${Array.from({length: inimigo.dificuldade || 3}, () =>
            '<span class="dif-star">◆</span>'
          ).join('')}
        </div>
        <div class="inimigo-hp-bar">
          <div class="inimigo-hp-bar-fill"></div>
        </div>
      </div>
      <div class="inimigo-fala-wrap">
        <div class="inimigo-fala">${inimigo.fala}</div>
      </div>`;
  }

  // ── ENRIQUECER REL-FILL com classes .pos/.neg ──
  function enrichRelFills(container) {
    container.querySelectorAll('.rel-fill').forEach(el => {
      const style = el.getAttribute('style') || '';
      if (style.includes('7dff9a') || style.includes('7dff')) {
        el.classList.add('pos');
        el.style.background = '';
      } else if (style.includes('ff7d7d') || style.includes('ff7d')) {
        el.classList.add('neg');
        el.style.background = '';
      }
    });
  }

  // ── MASTER PATCH — observa mudanças no campanha-content ──
  function patchCampanhaContent() {
    const el = document.getElementById('campanha-content');
    if (!el) return;

    const run = () => {
      // 1) Runa SVG no cap-header
      const header = el.querySelector('.cap-header');
      if (header && window.G?.campanha?.capitulo) {
        injectCapRuneSvg(G.campanha.capitulo, header);

        // Ornamento de linha dupla no topo do header
        if (!header.querySelector('.cap-header-ornament')) {
          const orn = document.createElement('div');
          orn.className = 'cap-header-ornament';
          orn.innerHTML = '✦';
          header.prepend(orn);
        }
      }

      // 2) Typewriter nas cenas narrativas (só se texto não foi ainda animado)
      const cenaTexto = el.querySelector('.cena-texto:not(.tw-done)');
      if (cenaTexto && !cenaTexto.classList.contains('tw-done')) {
        cenaTexto.classList.add('tw-done');
        typewriterEffect(cenaTexto);
      }

      // 3) Boss preview enriquecido
      enrichInimigoPrev(el);

      // 4) Aliados chips com data-humor
      enrichAliadoChips(el);

      // 5) Painel de humor no rodapé
      if (!el.querySelector('.humor-panel') && window.G?.campanha?.iniciada) {
        const panel = document.createElement('div');
        panel.innerHTML = buildHumorPanel();
        el.appendChild(panel.firstElementChild || panel);
      } else {
        // Atualiza dots existentes
        const panel = el.querySelector('.humor-panel');
        if (panel && window.G?.campanha) {
          const rel  = G.campanha.relacionamentos;
          panel.querySelectorAll('.humor-npc').forEach(npc => {
            const nome = npc.querySelector('.humor-npc-nome')?.textContent;
            if (!nome) return;
            const id = Object.keys(rel).find(k => k.toLowerCase().startsWith(nome.toLowerCase()));
            if (!id) return;
            const val = rel[id] || 0;
            const dot = npc.querySelector('.humor-npc-dot');
            if (dot) {
              dot.className = 'humor-npc-dot ' + getHumorClass(val);
            }
          });
        }
      }

      // 6) Rel fills
      enrichRelFills(el);
    };

    // MutationObserver para capturar re-renders
    const obs = new MutationObserver(() => {
      requestAnimationFrame(run);
    });
    obs.observe(el, { childList: true, subtree: true });

    // Roda uma vez agora
    run();
  }

  // ── PATCH NO FINAL DA CAMPANHA ──
  function patchFinalContent() {
    const el = document.getElementById('campanha-final-content');
    if (!el) return;

    const obs = new MutationObserver(() => {
      requestAnimationFrame(() => {
        enrichRelFills(el);

        // Typewriter no final-texto
        const ft = el.querySelector('.final-texto:not(.tw-done)');
        if (ft) {
          ft.classList.add('tw-done');
          // Typewriter mais rápido para o final
          typewriterEffect(ft);
        }
      });
    });
    obs.observe(el, { childList: true, subtree: true });
  }

  // ── INICIALIZAÇÃO ──
  window.addEventListener('load', () => {
    patchCampanhaContent();
    patchFinalContent();

    // Patch no renderCampanha original — injeta humor panel sempre que renderiza
    const _origRender = window.renderCampanha;
    if (typeof _origRender === 'function') {
      window.renderCampanha = function () {
        _origRender.apply(this, arguments);
        // Pequeno delay para o DOM terminar de renderizar
        setTimeout(() => {
          const el = document.getElementById('campanha-content');
          if (!el) return;
          if (!el.querySelector('.humor-panel') && window.G?.campanha?.iniciada) {
            const panel = document.createElement('div');
            panel.innerHTML = buildHumorPanel();
            const child = panel.firstElementChild || panel;
            el.appendChild(child);
          }
        }, 60);
      };
    }

    // Patch no mostrarFeedbackRelacionamento para animar dots
    const _origFeed = window.mostrarFeedbackRelacionamento;
    if (typeof _origFeed === 'function') {
      window.mostrarFeedbackRelacionamento = function (relObj) {
        _origFeed.apply(this, arguments);
        // Após feedback, pulsa os dots afetados
        setTimeout(() => {
          const panel = document.querySelector('.humor-panel');
          if (!panel || !window.G?.campanha) return;
          const rel = G.campanha.relacionamentos;
          Object.keys(relObj || {}).forEach(npcId => {
            const val = rel[npcId] || 0;
            const nomes = panel.querySelectorAll('.humor-npc-nome');
            nomes.forEach(nameEl => {
              if (npcId.toLowerCase().startsWith(nameEl.textContent.toLowerCase())) {
                const dot = nameEl.closest('.humor-npc')?.querySelector('.humor-npc-dot');
                if (dot) {
                  dot.className = 'humor-npc-dot ' + getHumorClass(val);
                  dot.style.animation = 'none';
                  requestAnimationFrame(() => {
                    dot.style.animation = '';
                  });
                }
              }
            });
          });
        }, 350);
      };
    }
  });

})();
