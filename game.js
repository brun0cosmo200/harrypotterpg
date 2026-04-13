// ══════════════════════════════════════════
//  game.js — v4 | Lógica principal
// ══════════════════════════════════════════

let G = estadoInicial();

function estadoInicial() {
  return {
    // Identidade
    casa: null, qIdx: 0, votos: { g:0,s:0,r:0,h:0 },
    avatarId: "mago_m", varinhaId: "dourada", nomePersonagem: "",
    // Stats
    hp: 100, hpMax: 100, mp: 60, mpMax: 60,
    nivel: 1, xp: 0, xpNext: 100, ouro: 30,
    // Inventário
    inv: [{ id:"potion", nome:"Poção de Cura", icon:"🧪", qtd:2, desc:"Restaura 40 HP" }],
    // Combate
    inimigo: null, inBattle: false, bonusDmg: 0, zonaAtual: null,
    // Compras
    varinhasCompradas: {1:false,2:false,3:false},
    permanentesComprados: {},
    magicsAprendidas: [],
    // Habilidades da Árvore
    habilidadesAprendidas: [],   // ids das habilidades
    frenesiStacks: 0,            // acumula por kill, reseta ao morrer
    escudoArcanoAtivo: false,    // absorve primeiros 15 de dano por batalha
    ressurgirUsado: false,       // por masmorra
    transcendenciaAtiva: false,  // imunidade próximo ataque
    // Masmorras
    masmorraAtual: null,         // { zonaId, andar: 1|2|3, hpInicioMasmorra, semDano }
    masmorrasCompletas: 0,
    masmorrasPerfeitas: 0,
    zonasVisitadas: [],
    // Estatísticas
    killsTotal: 0, killsBoss: 0, killsPorTipo: {},
    maiorDano: 0, criticosTotal: 0,
    streakAtual: 0, streakMax: 0,
    totalBatalhas: 0, derrotas: 0,
    tempoInicio: Date.now(),
    // Progressão
    missoesCompletas: [],
    conquistasDesbloqueadas: [],
    diario: [],
    // Boosts
    xpBoostMult: 1.0, xpBoostExpiry: 0,
    xpBoostPassiva: false,
    chanceCritico: 0.10,
    // Status de batalha temporários
    venenoTurnos: 0, venenaoDano: 8,
    escudoInimigo: false, esquivaInimigo: false,
    buffDanoUmaBatalha: 0,   // +% dano por 1 batalha (escolha da masmorra)
    pactoSombrio: false,     // dano dobrado na próxima batalha
    // Descanso
    descansoExpiry: 0,
    saveAt: 0,
    _hash: null
  };
}

// ── HELPERS ──
function fRand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function formatOuro(n) {
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+'M';
  if (n >= 1_000)     return (n/1_000).toFixed(0)+'K';
  return String(n);
}
function formatTempo(ms) {
  const s=Math.floor(ms/1000), h=Math.floor(s/3600), m=Math.floor((s%3600)/60);
  return h>0 ? `${h}h ${m}m` : `${m}m ${s%60}s`;
}

function getDesconto() { return G.casa==='r' ? 0.85 : 1.0; }

function xpBoostAtivo() {
  if (G.xpBoostExpiry > Date.now()) return G.xpBoostMult;
  if (G.xpBoostExpiry !== 0) { G.xpBoostMult=1.0; G.xpBoostExpiry=0; }
  return G.xpBoostPassiva ? 1.15 : 1.0;
}

function getTitulo() { return getTituloFn(G.nivel); }
function getTituloFn(nivel) {
  let t = TITULOS[0];
  for (const tt of TITULOS) { if (nivel >= tt.nivel) t = tt; }
  return t;
}

function getAvatar() {
  return AVATARES.find(a => a.id === G.avatarId) || AVATARES[0];
}
function getVarinha() {
  return CORES_VARINHA.find(v => v.id === G.varinhaId) || CORES_VARINHA[0];
}

// ── CALCULAR BÔNUS DAS HABILIDADES ──
function getBonusHabilidades() {
  const h = G.habilidadesAprendidas || [];
  const tem = (id) => h.includes(id);
  return {
    danoPct:      (tem('foco') ? 0.12 : 0) + (tem('devastacao') ? 0.30 : 0) + (tem('lendario') ? 0.08 : 0),
    hpMaxBonus:   (tem('resistencia') ? 25 : 0) + (tem('lendario') ? 50 : 0) - (tem('devastacao') ? 15 : 0),
    mpMaxBonus:   (tem('lendario') ? 25 : 0) - (tem('troca_mp_hp') ? 15 : 0),
    mpRegenExtra: (tem('catalise') ? 3 : 0),
    golpeDuploPct:tem('golpe_duplo') ? 0.20 : 0,
    escudoArcano: tem('escudo_arcano') ? 15 : 0,
    vampirismoPct:tem('vampirismo') ? 0.08 : 0,
    frenesissi:   tem('frenesi'),
    manaSurgePct: tem('mana_surge') ? 0.25 : 0,
    dmgReducPct:  tem('fortress') ? 0.20 : 0,
    criticoMult:  tem('critico_mortal') ? 3.0 : 2.0,
    xpPctBonus:   (tem('maestria') ? 0.20 : 0) + (G.xpBoostPassiva ? 0.15 : 0),
    ressurgir:    tem('ressurgir'),
    colapso:      tem('colapso') ? 0.60 : 0,
    eterno:       tem('eterno'),
    arcano_puro:  tem('arcano_puro') ? 0.30 : 0,
    transcendencia:tem('transcendencia'),
  };
}

function getTodosFeiticos() {
  const base     = CASAS[G.casa].feiticos;
  const aprendidos = MAGIAS_LOJA.filter(m => G.magicsAprendidas.includes(m.id));
  const bonus    = getBonusHabilidades();
  // Custo reduzido para feitiços da casa (arcano_puro)
  const casaFeiticos = base.map(f => bonus.arcano_puro > 0
    ? { ...f, mp: Math.max(0, Math.floor(f.mp * (1 - bonus.arcano_puro))) }
    : f
  );
  return [ATAQUE_BASICO, ...casaFeiticos, ...aprendidos];
}

// ── SOM ──
let audioCtx=null, somAtivado=true;
function getAudioCtx() { if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function tocarSom(tipo) {
  if(!somAtivado) return;
  try {
    const ctx=getAudioCtx(), osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const C={ ataque:{freq:220,tipo:'sawtooth',dur:.12,vol:.15}, critico:{freq:440,tipo:'square',dur:.20,vol:.20}, dano:{freq:130,tipo:'sawtooth',dur:.15,vol:.12}, vitoria:{freq:523,tipo:'sine',dur:.40,vol:.18}, levelup:{freq:659,tipo:'sine',dur:.50,vol:.20}, compra:{freq:392,tipo:'sine',dur:.20,vol:.12}, erro:{freq:80,tipo:'square',dur:.15,vol:.10}, notif:{freq:330,tipo:'sine',dur:.18,vol:.10}, habilidade:{freq:550,tipo:'sine',dur:.60,vol:.22} };
    const c=C[tipo]||C.notif;
    osc.type=c.tipo; osc.frequency.setValueAtTime(c.freq,ctx.currentTime);
    gain.gain.setValueAtTime(c.vol,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+c.dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime+c.dur);
  } catch(e){}
}

// ══════════════════════════════════════════
//  INICIALIZAÇÃO
// ══════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  const result = loadGame();

  if (result==='tamper') {
    document.getElementById('continue-section').innerHTML=`<div class="tamper-alert">⚠️ Save corrompido detectado. Progresso resetado.</div>`;
    return;
  }

  if (result===true && G.casa) {
    const casa=CASAS[G.casa];
    document.getElementById('happ').className=casa.theme;
    const av=getAvatar(), vr=getVarinha();
    const titulo=getTitulo();
    document.getElementById('continue-section').innerHTML=`
      <div class="continue-card">
        <div class="continue-avatar">${av.emoji}</div>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:13px">${G.nomePersonagem||'Bruxo'} ${titulo.icon}</div>
          <div style="font-size:11px;opacity:.6">${titulo.titulo} · ${casa.nome}</div>
          <div style="font-size:11px;opacity:.5">Nível ${G.nivel} · ${formatOuro(G.ouro)} 🪙 · ${G.hp}/${G.hpMax} HP</div>
        </div>
        <button class="btn" onclick="continueGame()">▶ Continuar</button>
      </div>`;
    document.getElementById('start-btn').textContent='Novo Jogo';
  }

  setInterval(tickBoost, 1000);
  if (G.descansoExpiry>Date.now()) startRestCountdown();
});

function continueGame() {
  document.getElementById('happ').className=CASAS[G.casa].theme;
  go('s-map'); renderMap();
}

function tickBoost() {
  const el=document.getElementById('xp-boost-timer');
  if(!el) return;
  if(G.xpBoostExpiry>Date.now()) {
    el.style.display='block';
    el.textContent=`⚡ XP x${G.xpBoostMult.toFixed(1)} — ${Math.ceil((G.xpBoostExpiry-Date.now())/1000)}s`;
  } else { el.style.display='none'; }
}

// ══════════════════════════════════════════
//  NAVEGAÇÃO
// ══════════════════════════════════════════
function go(id) {
  document.querySelectorAll('#happ .screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function resetAll() {
  deleteSave(); G=estadoInicial();
  document.getElementById('happ').className='th-d';
  document.getElementById('continue-section').innerHTML='';
  document.getElementById('start-btn').textContent='Colocar o Chapéu';
}

function restartRpg() {
  G.hp=G.hpMax; G.mp=G.mpMax; G.inBattle=false; G.inimigo=null;
  G.venenoTurnos=0; G.escudoInimigo=false; G.esquivaInimigo=false;
  G.streakAtual=0; G.frenesiStacks=0;
  go('s-map'); renderMap();
}

function voltarDoBolso() {
  if(G.inBattle) { go('s-battle'); renderBattle(); }
  else           { go('s-map');    renderMap();    }
}
function startQuiz() { G=estadoInicial(); go('s-quiz'); renderQ(); }
function toggleSom() { somAtivado=!somAtivado; const b=document.getElementById('btn-som'); if(b) b.textContent=somAtivado?'🔊':'🔇'; }

// ══════════════════════════════════════════
//  QUIZ
// ══════════════════════════════════════════
function renderQ() {
  const q=PERGUNTAS[G.qIdx], ops=[...q.ops].sort(()=>Math.random()-.5);
  document.getElementById('prog').innerHTML=PERGUNTAS.map((_,i)=>`<div class="dot ${i<G.qIdx?'done':''}"></div>`).join('');
  document.getElementById('qcontainer').innerHTML=`
    <p style="text-align:center;font-size:10px;font-family:'Cinzel',serif;letter-spacing:1px;opacity:.5;margin-bottom:.7rem">PERGUNTA ${G.qIdx+1} DE ${PERGUNTAS.length}</p>
    <p class="qtext">${q.t}</p>
    <div>${ops.map(o=>`<button class="btn btn-full" onclick="responder('${o.c}')">${o.t}</button>`).join('')}</div>`;
}

function responder(c) {
  G.votos[c]++; G.qIdx++;
  if(G.qIdx<PERGUNTAS.length) renderQ(); else definirCasa();
}

function definirCasa() {
  const c=Object.entries(G.votos).sort((a,b)=>b[1]-a[1])[0][0];
  G.casa=c;
  document.getElementById('happ').className=CASAS[c].theme;
  go('s-personagem'); renderPersonagem();
}

// ══════════════════════════════════════════
//  PERSONALIZAÇÃO DO PERSONAGEM
// ══════════════════════════════════════════
function renderPersonagem() {
  const casa=CASAS[G.casa];
  document.getElementById('personagem-html').innerHTML=`
    <div style="text-align:center;margin-bottom:.8rem">
      <span class="crest">${casa.crest}</span>
      <div style="font-family:'Cinzel',serif;font-size:18px;letter-spacing:2px">${casa.nome.toUpperCase()}</div>
      <div style="font-size:12px;opacity:.6;font-style:italic;margin-top:.3rem">"${casa.motto}"</div>
    </div>

    <div class="custom-section">
      <h3>✏️ Nome do Personagem</h3>
      <input type="text" id="inp-nome" class="auth-input" placeholder="Como você se chama?" maxlength="20"
        value="${G.nomePersonagem||''}" oninput="G.nomePersonagem=this.value.trim()"/>
    </div>

    <div class="custom-section">
      <h3>🧙 Aparência</h3>
      <div class="avatar-grid">
        ${AVATARES.map(a=>`
          <button class="avatar-btn ${G.avatarId===a.id?'selected':''}" onclick="selecionarAvatar('${a.id}')">
            <span style="font-size:28px">${a.emoji}</span>
            <div style="font-size:10px;opacity:.6;margin-top:2px">${a.nome}</div>
          </button>`).join('')}
      </div>
    </div>

    <div class="custom-section">
      <h3>🪄 Cor da Varinha</h3>
      <div class="varinha-grid">
        ${CORES_VARINHA.map(v=>`
          <button class="varinha-btn ${G.varinhaId===v.id?'selected':''}" onclick="selecionarVarinha('${v.id}')"
            style="border-color:${v.hex}30;${G.varinhaId===v.id?'background:'+v.hex+'20;box-shadow:0 0 8px '+v.hex+'40;':''}">
            <div class="varinha-dot" style="background:${v.hex}"></div>
            <div style="font-size:10px;opacity:.7">${v.nome}</div>
          </button>`).join('')}
      </div>
    </div>

    <div style="text-align:center;margin-top:1rem" id="preview-personagem">
      ${previewPersonagem()}
    </div>

    <button class="btn btn-center" style="margin-top:1rem" onclick="confirmarPersonagem()">
      ⚔️ Começar Aventura
    </button>`;
}

function previewPersonagem() {
  const av=getAvatar(), vr=getVarinha(), casa=CASAS[G.casa], t=getTituloFn(1);
  const nome=G.nomePersonagem||'Bruxo';
  return `<div class="preview-card">
    <span style="font-size:40px">${av.emoji}</span>
    <div>
      <div style="font-family:'Cinzel',serif;font-size:14px">${nome}</div>
      <div style="font-size:11px;opacity:.6">${t.titulo} de ${casa.nome}</div>
      <div style="display:flex;align-items:center;gap:4px;margin-top:3px;font-size:11px;opacity:.5">
        <span style="color:${vr.hex}">🪄</span> Varinha ${vr.nome}
      </div>
    </div>
  </div>`;
}

function selecionarAvatar(id) {
  G.avatarId=id;
  document.querySelectorAll('.avatar-btn').forEach(b=>b.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  document.getElementById('preview-personagem').innerHTML=previewPersonagem();
}

function selecionarVarinha(id) {
  G.varinhaId=id;
  renderPersonagem();
}

function confirmarPersonagem() {
  if (!G.nomePersonagem) {
    const inp=document.getElementById('inp-nome');
    if(inp && inp.value.trim()) G.nomePersonagem=inp.value.trim();
    else G.nomePersonagem='Bruxo';
  }
  go('s-result'); renderResultado();
}

function renderResultado() {
  const casa=CASAS[G.casa], av=getAvatar(), vr=getVarinha();
  document.getElementById('result-html').innerHTML=`
    <p style="text-align:center;font-size:10px;font-family:'Cinzel',serif;letter-spacing:2px;opacity:.5;margin-bottom:.5rem">O CHAPÉU SELETOR DECIDIU</p>
    <span class="crest">${casa.crest}</span>
    <div class="result-house">${casa.nome.toUpperCase()}</div>
    <div class="result-motto">"${casa.motto}"</div>
    <div class="result-desc">${casa.desc}</div>
    <div class="traits">${casa.traits.map(t=>`<span class="trait">${t}</span>`).join('')}</div>
    <div class="passiva-box">
      <span style="font-size:18px">${casa.passiva.icon}</span>
      <div><div style="font-family:'Cinzel',serif;font-size:11px">${casa.passiva.nome}</div>
      <div style="font-size:12px;opacity:.7">${casa.passiva.desc}</div></div>
    </div>
    <div class="preview-card" style="margin:.8rem auto">
      <span style="font-size:36px">${av.emoji}</span>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:14px">${G.nomePersonagem}</div>
        <div style="font-size:11px;opacity:.6;display:flex;align-items:center;gap:4px">
          <span style="color:${vr.hex}">🪄</span> Varinha ${vr.nome}
        </div>
      </div>
    </div>
    <button class="btn btn-center" onclick="iniciarRpg()">⚔️ Iniciar Aventura</button>
    <button class="btn btn-center" style="margin-top:6px;opacity:.5;font-size:11px" onclick="startQuiz()">Refazer o teste</button>`;
}

function iniciarRpg() {
  G.tempoInicio=Date.now();
  saveGame(); go('s-map'); renderMap();
}

// ══════════════════════════════════════════
//  STATUS BAR
// ══════════════════════════════════════════
function statusHTML() {
  const hp=Math.max(0,Math.round(G.hp/G.hpMax*100));
  const mp=Math.max(0,Math.round(G.mp/G.mpMax*100));
  const xp=Math.max(0,Math.round(G.xp/G.xpNext*100));
  const boost=G.xpBoostExpiry>Date.now();
  const t=getTitulo();
  const av=getAvatar();
  return `
    <div class="stat-box stat-personagem">
      <div style="font-size:18px">${av.emoji}</div>
      <div style="font-size:9px;font-family:'Cinzel',serif;opacity:.6">${t.icon}${G.nivel}</div>
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
      <div class="stat-label">XP ${G.xp}/${G.xpNext}${boost?' ⚡':''}</div>
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
  document.getElementById('status-top').innerHTML=statusHTML();

  // Verificar se tem habilidade pra escolher
  const tierDisponivel = Object.keys(ARVORE_HABILIDADES).find(n => {
    const nivel=parseInt(n);
    return G.nivel>=nivel && !G.habilidadesAprendidas.some(h => ARVORE_HABILIDADES[nivel]?.find(x=>x.id===h));
  });
  if(tierDisponivel) {
    setTimeout(()=>mostrarArvoreHabilidades(parseInt(tierDisponivel)), 300);
  }

  if(Math.random()<0.12) setTimeout(()=>dispararEventoAleatorio(),500);

  const t=getTitulo();
  document.getElementById('titulo-jogador').innerHTML=
    `${getAvatar().emoji} <span style="font-family:'Cinzel',serif;font-size:12px">${G.nomePersonagem||'Bruxo'}</span> <span style="opacity:.5">${t.icon} ${t.titulo}</span>`;

  document.getElementById('map-zones').innerHTML=ZONAS.map(z=>{
    const bloq=G.nivel<z.nivelMin;
    const emAndamento=G.masmorraAtual?.zonaId===z.id;
    return `
      <button class="zone-btn ${z.boss?'zone-boss':''} ${emAndamento?'zone-active':''}" onclick="entrarMasmorra('${z.id}')" ${bloq?'disabled':''}>
        <span class="zone-icon">${z.icon}</span>
        <div class="zone-name">${z.nome}</div>
        ${emAndamento?`<div class="zone-progress">⚔️ Andar ${G.masmorraAtual.andar}/3</div>`:''}
        ${z.boss?'<div class="boss-tag">👑 BOSS</div>':''}
        ${bloq?`<div class="zone-lock">🔒 Nível ${z.nivelMin}</div>`:`<div class="zone-tag">+${z.xpBase} xp 🪙${z.ouroBase}</div>`}
      </button>`;
  }).join('');

  verificarMissoes(); verificarConquistas();
}

// ══════════════════════════════════════════
//  SISTEMA DE MASMORRAS (3 andares)
// ══════════════════════════════════════════
function entrarMasmorra(zid) {
  const zona=ZONAS.find(z=>z.id===zid);

  // Retomar masmorra em andamento
  if(G.masmorraAtual?.zonaId===zid) {
    continuarMasmorra(); return;
  }

  // Nova masmorra
  G.masmorraAtual = { zonaId: zid, andar: 1, hpInicioMasmorra: G.hp, semDano: true };
  G.ressurgirUsado = false;
  G.escudoArcanoAtivo = getBonusHabilidades().escudoArcano > 0;

  if(!G.zonasVisitadas.includes(zid)) {
    G.zonasVisitadas.push(zid);
    const narr=ZONA_NARRATIVA[zid];
    if(narr) { mostrarNarrativa(`${zona.icon} ${zona.nome}`, narr.texto, ()=>iniciarAndar()); return; }
  }
  iniciarAndar();
}

function continuarMasmorra() {
  if(G.masmorraAtual.andar===2) {
    // Andar do meio = escolha
    mostrarEscolha();
  } else {
    iniciarAndar();
  }
}

function iniciarAndar() {
  const zona=ZONAS.find(z=>z.id===G.masmorraAtual.zonaId);
  const andar=G.masmorraAtual.andar;

  // Andar 3 = boss (se tiver) ou inimigo forte
  let iniId;
  if(andar===3 && zona.boss) {
    iniId=zona.boss;
    if(BOSS_INTRO_FALAS[iniId]) {
      const base=INIMIGOS_BASE[iniId];
      mostrarNarrativa(base.art+' '+base.nome, BOSS_INTRO_FALAS[iniId], ()=>_iniciarBatalha(zona,iniId));
      return;
    }
  } else {
    iniId=zona.inimigos[Math.floor(Math.random()*zona.inimigos.length)];
    // Andar 2 escolha já foi processada, vai pra batalha
    if(andar===2) { _iniciarBatalha(zona,iniId); return; }
  }

  _iniciarBatalha(zona, iniId);
}

function _iniciarBatalha(zona, iniId) {
  const base=INIMIGOS_BASE[iniId];
  const esc=escalarInimigo(base, G.nivel);
  // Andar 3 é mais difícil
  if(G.masmorraAtual?.andar===3) {
    esc.hpMax=Math.floor(esc.hpMax*1.25);
    esc.hp=esc.hpMax;
    esc.atk=[Math.floor(esc.atk[0]*1.15), Math.floor(esc.atk[1]*1.15)];
  }
  G.inimigo={...esc, id:iniId, hp:esc.hpMax};
  G.inBattle=true;
  G.escudoInimigo=false; G.esquivaInimigo=false; G.venenoTurnos=0;
  G.transcendenciaAtiva=false;

  go('s-battle'); renderBattle(); clearLog();
  addLog(`Andar ${G.masmorraAtual?.andar||1}/3 — ${G.inimigo.nome}!`, 'info');
  if(G.inimigo.habilidade) addLog(`⚠️ Habilidade: ${nomeHabilidade(G.inimigo.habilidade)}`,'warn');
}

// ── ESCOLHA DO ANDAR 2 ──
function mostrarEscolha() {
  const escolha=ESCOLHAS_MASMORRA[Math.floor(Math.random()*ESCOLHAS_MASMORRA.length)];
  const zona=ZONAS.find(z=>z.id===G.masmorraAtual.zonaId);

  const html=`
    <div class="escolha-box">
      <div style="font-size:10px;font-family:'Cinzel',serif;opacity:.5;margin-bottom:.5rem">ANDAR 2/3 — ${zona.nome}</div>
      <div style="font-size:15px;font-style:italic;line-height:1.7;margin-bottom:1rem;text-align:center">${escolha.desc}</div>
      <div>${escolha.opcoes.map((op,i)=>`
        <button class="btn btn-full escolha-btn" onclick="processarEscolha('${op.acao}')">
          ${op.texto}
        </button>`).join('')}
      </div>
    </div>`;

  document.getElementById('escolha-titulo').textContent=escolha.titulo;
  document.getElementById('escolha-content').innerHTML=html;
  go('s-escolha');
}

function processarEscolha(acao) {
  switch(acao) {
    case 'buff_dano_custo_hp':
      G.hp=Math.max(1,G.hp-20); G.buffDanoUmaBatalha=0.40;
      notif('🩸 -20 HP mas +40% de dano na próxima batalha!'); break;
    case 'skip':
      notif('Você continuou com cautela.'); break;
    case 'risco_cura':
      if(Math.random()<0.30) { G.hp=Math.min(G.hpMax,G.hp+30); notif('✨ Purificou a fonte! +30 HP!'); }
      else { G.hp=Math.max(1,G.hp-10); notif('❌ Energia sombria! -10 HP.'); } break;
    case 'batalha_bonus':
      G.masmorraAtual._bonusOuro=0.80; notif('⚔️ Guardião aguarda! +80% de ouro na batalha!'); break;
    case 'usar_pocao': {
      const p=G.inv.find(i=>i.id==='potion'&&i.qtd>0);
      if(p) { p.qtd--; G.hp=Math.min(G.hpMax,G.hp+40); notif('🧪 Usou uma Poção de Cura! +40 HP.'); }
      else   notif('❌ Sem poções!'); break; }
    case 'troca_mp_hp':
      G.mpMax=Math.max(20,G.mpMax-15); G.hpMax+=20; G.hp=Math.min(G.hp,G.hpMax);
      notif('✨ Troca feita! -15 MP máx +20 HP máx.'); break;
    case 'comprar_mana':
      if(G.ouro>=50) { G.ouro-=50; G.mp=G.mpMax; notif('💧 MP restaurado! -50 🪙'); }
      else notif('❌ Sem ouro suficiente!'); break;
    case 'risco_mana':
      if(Math.random()<0.50) { G.mp=Math.min(G.mpMax,G.mp+30); notif('⚡ Absorveu! +30 MP!'); }
      else notif('💨 Nada aconteceu.'); break;
    case 'custo_hp_pula':
      G.hp=Math.max(1,G.hp-25); notif('💪 Você quebrou a gaiola! -25 HP.'); break;
    case 'risco_chave':
      if(Math.random()<0.50) { G.ouro+=20; notif('🗝️ Achou a chave e 20 🪙!'); }
      else { notif('⚠️ Não achou a chave! Batalha extra!'); G.masmorraAtual._batalhaExtra=true; } break;
    case 'alohomora':
      if(G.casa==='r') notif('🔮 Alohomora! Abriu grátis. Vantagem Ravenclaw!');
      else if(G.mp>=10) { G.mp-=10; notif('🔮 Alohomora! Abriu com 10 MP.'); }
      else { notif('❌ MP insuficiente!'); G.masmorraAtual._batalhaExtra=true; } break;
    case 'pacto_sombrio':
      G.hp=Math.max(1,G.hpMax-30); G.hpMax=Math.max(50,G.hpMax-30); G.pactoSombrio=true;
      notif('🌑 Pacto firmado! Próxima batalha: dano dobrado.'); break;
    case 'ganhar_xp':
      G.xp+=50; notif('📖 +50 XP das runas antigas!'); verificarLevelUp(); break;
    case 'destruir_altar':
      if(Math.random()<0.40) {
        const item=LOJA_ITENS.filter(i=>i.tipo==='consumivel')[Math.floor(Math.random()*5)];
        if(item) { const ex=G.inv.find(i=>i.id===item.id); if(ex) ex.qtd++; else G.inv.push({...item,qtd:1}); notif(`💥 Altar destruído! +1 ${item.nome}`); }
      } else notif('💥 Altar destruído! Mas não havia nada dentro.'); break;
  }
  saveGame();
  // Avançar para o andar 3
  G.masmorraAtual.andar=3;
  if(G.masmorraAtual._batalhaExtra) {
    G.masmorraAtual._batalhaExtra=false;
    _iniciarBatalha(ZONAS.find(z=>z.id===G.masmorraAtual.zonaId), 'guardiao');
  } else {
    iniciarAndar();
  }
}

// ══════════════════════════════════════════
//  COMBATE
// ══════════════════════════════════════════
function nomeHabilidade(h) {
  const n={veneno:'Veneno 🐍',dreno_mp:'Drenar Mana 💧',cura:'Cura 💚',escudo:'Escudo 🛡️',esquiva:'Esquiva 💨',reflexo:'Reflexo ✨'};
  return n[h]||h;
}
function clearLog() { document.getElementById('log').innerHTML=''; }
function addLog(txt, tipo='neutral') {
  const d=document.getElementById('log');
  d.innerHTML+=`<div class="log-line log-${tipo}">${txt}</div>`;
  d.scrollTop=d.scrollHeight;
}

function renderBattle() {
  const ini=G.inimigo;
  const hpPct=Math.max(0,Math.round(ini.hp/ini.hpMax*100));
  const veneno=G.venenoTurnos>0?`<span class="status-icon">☠️${G.venenoTurnos}</span>`:'';
  const escudo=G.escudoInimigo?`<span class="status-icon">🛡️</span>`:'';
  const bonus=getBonusHabilidades();
  const vr=getVarinha();

  document.getElementById('status-battle').innerHTML=statusHTML();

  // Frenesi stacks visual
  const frenesiTxt=G.frenesiStacks>0?`<div style="font-size:10px;color:#ff9040;margin-top:3px">🔥 Frenesi x${G.frenesiStacks} (+${(G.frenesiStacks*5)}% dano)</div>`:'';
  const pactoTxt=G.pactoSombrio?`<div style="font-size:10px;color:#9b59b6;margin-top:3px">🌑 Pacto Sombrio (dano 2x)</div>`:'';
  const transcTxt=G.transcendenciaAtiva?`<div style="font-size:10px;color:#ffd700;margin-top:3px">✨ Imunidade ativa</div>`:'';

  document.getElementById('enemy-box').innerHTML=`
    <div class="enemy-art">${ini.art}</div>
    <div class="enemy-name">${ini.nome}${ini.boss?' <span style="font-size:11px;opacity:.6">👑</span>':''}</div>
    <div style="font-size:11px;opacity:.6;margin:3px 0">HP: ${ini.hp}/${ini.hpMax} ${escudo}</div>
    <div class="bar-wrap" style="max-width:180px;margin:0 auto"><div class="bar-fill bar-hp" style="width:${hpPct}%"></div></div>
    ${veneno?`<div style="font-size:10px;margin-top:4px">${veneno}</div>`:''}`;

  document.getElementById('battle-buffs').innerHTML=frenesiTxt+pactoTxt+transcTxt;

  const todos=getTodosFeiticos();
  document.getElementById('spells').innerHTML=todos.map((f,i)=>{
    const podeUsar=G.mp>=f.mp;
    const isLearn=G.magicsAprendidas.includes(f.id);
    const isBasico=f.id==='__basico__';

    // Calcular dano real com todos os bônus
    let dMin=f.dano[0]+G.bonusDmg;
    let dMax=f.dano[1]+G.bonusDmg;
    if(!isBasico) {
      dMin=Math.floor(dMin*(1+bonus.danoPct));
      dMax=Math.floor(dMax*(1+bonus.danoPct));
      if(G.frenesiStacks>0) { dMin=Math.floor(dMin*(1+G.frenesiStacks*0.05)); dMax=Math.floor(dMax*(1+G.frenesiStacks*0.05)); }
      if(G.buffDanoUmaBatalha>0) { dMin=Math.floor(dMin*(1+G.buffDanoUmaBatalha)); dMax=Math.floor(dMax*(1+G.buffDanoUmaBatalha)); }
      if(G.pactoSombrio) { dMin*=2; dMax*=2; }
    }

    // Cor da varinha nos botões de feitiço da casa
    const varinhaStyle = !isLearn && !isBasico ? `border-color:${vr.hex}25;` : '';
    const manaSurge = bonus.manaSurgePct>0 && f.mp>30 ? ' 🌀' : '';

    return `
      <button class="spell-btn ${isLearn?'spell-learned':''} ${isBasico?'spell-basico':''}"
        style="${varinhaStyle}"
        onclick="lancarFeitico(${i})" ${!podeUsar?'disabled':''}>
        <div style="font-size:16px">${f.icon}</div>
        <div class="spell-name">${f.nome}${manaSurge}</div>
        <div class="spell-cost">${f.mp===0?'Grátis':'MP:'+f.mp} | ${dMin}–${dMax}</div>
      </button>`;
  }).join('');
}

function lancarFeitico(idx) {
  if(!G.inimigo||!G.inBattle) return;
  const todos=getTodosFeiticos();
  const f=todos[idx];
  if(!f) return;
  if(G.mp<f.mp) { addLog('Mana insuficiente!','bad'); tocarSom('erro'); return; }

  G.mp-=f.mp;
  const bonus=getBonusHabilidades();
  const isBasico=f.id==='__basico__';

  // Calcular dano base
  const critico=Math.random()<G.chanceCritico;
  let dmg=fRand(f.dano[0],f.dano[1])+G.bonusDmg;

  // Bônus da árvore
  if(!isBasico) {
    dmg=Math.floor(dmg*(1+bonus.danoPct));
    if(bonus.manaSurgePct>0&&f.mp>30) dmg=Math.floor(dmg*(1+bonus.manaSurgePct));
    if(G.frenesiStacks>0) dmg=Math.floor(dmg*(1+G.frenesiStacks*0.05));
    if(G.buffDanoUmaBatalha>0) { dmg=Math.floor(dmg*(1+G.buffDanoUmaBatalha)); G.buffDanoUmaBatalha=0; }
    if(G.pactoSombrio) { dmg*=2; G.pactoSombrio=false; }
  }

  // Colapso arcano: +60% em inimigos com <25% HP
  if(bonus.colapso>0 && G.inimigo.hp < G.inimigo.hpMax*0.25) dmg=Math.floor(dmg*(1+bonus.colapso));

  if(critico) { dmg=Math.floor(dmg*bonus.criticoMult); G.criticosTotal++; }

  // Passiva Slytherin + vampirismo
  if(G.casa==='s'&&!isBasico) G.hp=Math.min(G.hpMax,G.hp+4);
  if(bonus.vampirismoPct>0&&!isBasico) G.hp=Math.min(G.hpMax,G.hp+Math.floor(dmg*bonus.vampirismoPct));

  // Escudo inimigo
  if(G.escudoInimigo) { dmg=Math.floor(dmg*0.5); G.escudoInimigo=false; addLog('🛡️ Escudo absorveu!','warn'); }

  // Reflexo Voldemort
  let dmgReflexo=0;
  if(G.inimigo.habilidade==='reflexo'&&Math.random()<0.25) dmgReflexo=Math.floor(dmg*0.20);

  // Transcendência: imunidade
  if(bonus.transcendencia&&Math.random()<0.20&&f.mp>=50&&!G.transcendenciaAtiva) {
    G.transcendenciaAtiva=true;
    addLog('✨ Transcendência ativada! Próximo ataque não causa dano.','info');
  }

  G.inimigo.hp=Math.max(0,G.inimigo.hp-dmg);
  if(dmg>(G.maiorDano||0)) G.maiorDano=dmg;

  const criticoTxt=critico?` 💫 CRÍTICO!(x${bonus.criticoMult})`:'' ;
  tocarSom(critico?'critico':'ataque');
  addLog(`${f.icon} ${f.nome}: ${dmg} de dano!${criticoTxt}`,'good');

  if(dmgReflexo>0) { G.hp=Math.max(0,G.hp-dmgReflexo); addLog(`✨ Reflexo: ${dmgReflexo} de volta!`,'bad'); }

  if(G.inimigo.hp<=0) { vencerBatalha(); return; }

  // Golpe duplo
  if(!isBasico&&bonus.golpeDuploPct>0&&Math.random()<bonus.golpeDuploPct) {
    const dmg2=Math.floor(fRand(f.dano[0],f.dano[1])*0.60);
    G.inimigo.hp=Math.max(0,G.inimigo.hp-dmg2);
    addLog(`⚔️ Golpe Duplo! +${dmg2} de dano!`,'good');
    if(G.inimigo.hp<=0) { vencerBatalha(); return; }
  }

  ataqueInimigo();
}

function ataqueInimigo() {
  const ini=G.inimigo;
  const bonus=getBonusHabilidades();
  const habChance={veneno:.35,dreno_mp:.40,cura:.30,escudo:.35,esquiva:.30,reflexo:.25};
  const hab=ini.habilidade;
  if(hab&&Math.random()<(habChance[hab]||0)) aplicarHabilidadeInimigo(hab);

  if(G.esquivaInimigo) { G.esquivaInimigo=false; addLog(`${ini.art} ${ini.nome} esquivou!`,'warn'); renderBattle(); return; }

  let dmg=fRand(ini.atk[0],ini.atk[1]);

  // Redução de dano da fortaleza
  if(bonus.dmgReducPct>0) dmg=Math.floor(dmg*(1-bonus.dmgReducPct));

  // Escudo arcano (absorve primeiro hit)
  if(G.escudoArcanoAtivo) {
    const absorvido=Math.min(dmg,bonus.escudoArcano);
    dmg=Math.max(0,dmg-absorvido);
    G.escudoArcanoAtivo=false;
    addLog(`✨ Escudo Arcano absorveu ${absorvido} de dano!`,'info');
  }

  // Imunidade da transcendência
  if(G.transcendenciaAtiva) { G.transcendenciaAtiva=false; addLog(`✨ Transcendência bloqueou o ataque!`,'info'); renderBattle(); return; }

  G.hp=Math.max(0,G.hp-dmg);
  if(dmg>0) G.masmorraAtual && (G.masmorraAtual.semDano=false);

  addLog(`${ini.art} ${ini.nome} causou ${dmg} de dano!`,'bad');
  tocarSom('dano');

  if(G.venenoTurnos>0) {
    G.hp=Math.max(0,G.hp-G.venenaoDano);
    G.venenoTurnos--;
    addLog(`☠️ Veneno: -${G.venenaoDano} (${G.venenoTurnos} restantes)`,'bad');
  }

  // Regen MP (base + catalise)
  G.mp=Math.min(G.mpMax,G.mp+5+bonus.mpRegenExtra);

  renderBattle();

  if(G.hp<=0) {
    // Ressurgir (uma vez por masmorra)
    if(bonus.ressurgir&&!G.ressurgirUsado) {
      G.ressurgirUsado=true;
      G.hp=30;
      addLog(`♻️ Ressurgir! Você voltou com 30 HP!`,'info');
      renderBattle();
    } else {
      setTimeout(gameOver,600);
    }
  }
}

function aplicarHabilidadeInimigo(hab) {
  const ini=G.inimigo;
  if(hab==='veneno')   { G.venenoTurnos=3; G.venenaoDano=8; addLog(`🐍 ${ini.nome} envenenou você! (3 turnos)`,'bad'); }
  if(hab==='dreno_mp') { const d=Math.min(G.mp,12); G.mp-=d; addLog(`💧 ${ini.nome} drenou ${d} MP!`,'bad'); }
  if(hab==='cura')     { const c=Math.floor(ini.hpMax*.15); G.inimigo.hp=Math.min(ini.hpMax,ini.hp+c); addLog(`💚 ${ini.nome} se curou em ${c} HP!`,'warn'); }
  if(hab==='escudo')   { G.escudoInimigo=true; addLog(`🛡️ ${ini.nome} ativou escudo!`,'warn'); }
  if(hab==='esquiva')  { G.esquivaInimigo=true; addLog(`💨 ${ini.nome} pronto para esquivar!`,'warn'); }
}

function verificarLevelUp() {
  let ups=0;
  while(G.xp>=G.xpNext) {
    G.xp-=G.xpNext; G.nivel++;
    G.xpNext=Math.floor(G.nivel*120); // ligeiramente mais XP necessário
    G.hpMax+=20; G.hp=G.hpMax;
    G.mpMax+=10; G.mp=G.mpMax;
    ups++; tocarSom('levelup');
    // Entrada no diário
    if([5,10,20,30].includes(G.nivel)) adicionarDiario('nivel_'+G.nivel);
  }
  return ups;
}

function vencerBatalha() {
  const ini=G.inimigo;
  G.killsTotal++; G.killsBoss+=(ini.boss?1:0);
  G.killsPorTipo[ini.id]=(G.killsPorTipo[ini.id]||0)+1;
  G.totalBatalhas++; G.streakAtual++;
  if(G.streakAtual>(G.streakMax||0)) G.streakMax=G.streakAtual;
  tocarSom('vitoria');

  // Passiva Gryffindor
  if(G.casa==='g') { G.hp=Math.min(G.hpMax,G.hp+8); addLog(`❤️‍🔥 Adrenalina! +8 HP`,'good'); }

  // Frenesi
  if(getBonusHabilidades().frenesissi) G.frenesiStacks++;

  // XP com multiplicadores
  let xpGanho=Math.floor(ini.xp*xpBoostAtivo()*(1+getBonusHabilidades().xpPctBonus));
  let ouroGanho=ini.ouro;
  if(G.casa==='h') ouroGanho=Math.floor(ouroGanho*1.25);
  if(G.masmorraAtual?._bonusOuro) { ouroGanho=Math.floor(ouroGanho*(1+G.masmorraAtual._bonusOuro)); G.masmorraAtual._bonusOuro=0; }

  G.xp+=xpGanho; G.ouro+=ouroGanho; G.inBattle=false;
  addLog(`🏆 +${xpGanho} XP | +${ouroGanho} 🪙`,'info');

  const levelUps=verificarLevelUp();
  verificarMissoes(); verificarConquistas();

  // Avançar andar da masmorra
  if(G.masmorraAtual) {
    const andarAtual=G.masmorraAtual.andar;

    if(andarAtual===3) {
      // Masmorra completa!
      concluirMasmorra(ini, xpGanho, ouroGanho, levelUps);
      return;
    } else if(andarAtual===1) {
      G.masmorraAtual.andar=2;
      saveGame();
      // Boss intro ou batalha
      if(ini.boss&&BOSS_FALAS[ini.id]) {
        setTimeout(()=>mostrarNarrativa(BOSS_FALAS[ini.id].art+' Última Fala', BOSS_FALAS[ini.id].fala, ()=>irParaVitoria(ini,xpGanho,ouroGanho,levelUps)),200);
        return;
      }
      irParaVitoria(ini, xpGanho, ouroGanho, levelUps);
    }
  } else {
    saveGame();
    irParaVitoria(ini, xpGanho, ouroGanho, levelUps);
  }
}

function concluirMasmorra(ini, xpGanho, ouroGanho, levelUps) {
  G.masmorrasCompletas++;
  if(G.masmorraAtual.semDano) G.masmorrasPerfeitas++;

  const bonusXP=Math.floor(xpGanho*0.5);
  const bonusOuro=Math.floor(ouroGanho*0.5);
  G.xp+=bonusXP; G.ouro+=bonusOuro;

  adicionarDiario('masmorra_clear');
  if(ini.boss) adicionarDiario(ini.id);

  const perfeita=G.masmorraAtual.semDano;
  G.masmorraAtual=null;
  G.frenesiStacks=0; // reseta frenesi

  verificarMissoes(); verificarConquistas();
  saveGame();

  // Boss fala final
  if(ini.boss&&BOSS_FALAS[ini.id]) {
    setTimeout(()=>mostrarNarrativa(BOSS_FALAS[ini.id].art+' Última Fala', BOSS_FALAS[ini.id].fala, ()=>{
      irParaMasmorraVitoria(ini, xpGanho+bonusXP, ouroGanho+bonusOuro, levelUps, perfeita);
    }),200);
    return;
  }
  irParaMasmorraVitoria(ini, xpGanho+bonusXP, ouroGanho+bonusOuro, levelUps, perfeita);
}

function irParaVitoria(ini, xpGanho, ouroGanho, levelUps) {
  go('s-win');
  document.getElementById('win-msg').innerHTML=`${ini.nome} derrotado!<br>+${xpGanho} XP | +${ouroGanho} 🪙`;
  document.getElementById('status-win').innerHTML=statusHTML();
  document.getElementById('level-up-banner').innerHTML=levelUps>0
    ?`<div class="level-banner">✦ NÍVEL ${G.nivel}! ${getTitulo().icon} ${getTitulo().titulo} ✦</div>`:'';
  document.getElementById('win-extra').innerHTML=
    `<button class="btn btn-center" style="margin-top:.5rem" onclick="go('s-map');renderMap()">Continuar Aventura</button>`;
}

function irParaMasmorraVitoria(ini, xpGanho, ouroGanho, levelUps, perfeita) {
  go('s-win');
  document.getElementById('win-msg').innerHTML=
    `🏰 Masmorra Completa!<br>+${xpGanho} XP | +${ouroGanho} 🪙${perfeita?' ✨ PERFEITO!':''}`;
  document.getElementById('status-win').innerHTML=statusHTML();
  document.getElementById('level-up-banner').innerHTML=levelUps>0
    ?`<div class="level-banner">✦ NÍVEL ${G.nivel}! ${getTitulo().icon} ${getTitulo().titulo} ✦</div>`:'';
  document.getElementById('win-extra').innerHTML=`
    <button class="btn btn-center" style="margin-top:.5rem" onclick="go('s-map');renderMap()">Voltar ao Mapa</button>
    <button class="btn btn-center" style="margin-top:.3rem;font-size:11px;opacity:.7" onclick="go('s-diario');renderDiario()">📓 Ver Diário</button>`;
}

function gameOver() {
  G.inBattle=false; G.derrotas++; G.streakAtual=0;
  G.frenesiStacks=0;
  // Masmorra falhou — resetar andar
  if(G.masmorraAtual) { G.masmorraAtual.andar=1; G.masmorraAtual.semDano=false; }
  go('s-gameover');
  document.getElementById('go-msg').textContent=`Você foi derrotado por ${G.inimigo.nome}. A masmorra recomeça do início...`;
  saveGame();
}

function tryFlee() {
  if(Math.random()<0.5) {
    addLog('Você fugiu!','info'); G.inBattle=false; G.streakAtual=0;
    if(G.masmorraAtual) { G.masmorraAtual.andar=1; }
    setTimeout(()=>{ go('s-map'); renderMap(); },700);
  } else { addLog('Não conseguiu fugir!','bad'); ataqueInimigo(); }
}

// ══════════════════════════════════════════
//  ÁRVORE DE HABILIDADES
// ══════════════════════════════════════════
function mostrarArvoreHabilidades(tier) {
  const opcoes=ARVORE_HABILIDADES[tier];
  if(!opcoes) return;
  const html=opcoes.map(h=>`
    <button class="habilidade-btn" onclick="aprenderHabilidade('${h.id}',${tier})">
      <span style="font-size:28px">${h.icon}</span>
      <div class="hab-nome">${h.nome}</div>
      <div class="hab-desc">${h.desc}</div>
    </button>`).join('');
  document.getElementById('arvore-titulo').textContent=`Nível ${tier} — Escolha sua Habilidade`;
  document.getElementById('arvore-opcoes').innerHTML=html;
  go('s-arvore');
}

function aprenderHabilidade(id, tier) {
  const hab=ARVORE_HABILIDADES[tier]?.find(h=>h.id===id);
  if(!hab) return;
  G.habilidadesAprendidas.push(id);

  // Aplicar efeitos permanentes imediatos
  if(id==='resistencia'||id==='lendario') { G.hpMax+=(id==='lendario'?50:25); G.hp=Math.min(G.hp+25,G.hpMax); }
  if(id==='lendario') { G.mpMax+=25; G.mp=Math.min(G.mp+25,G.mpMax); }
  if(id==='devastacao') { G.hpMax=Math.max(50,G.hpMax-15); G.hp=Math.min(G.hp,G.hpMax); }

  adicionarDiario('habilidade');
  tocarSom('habilidade');
  notif(`${hab.icon} ${hab.nome} aprendida!`);
  verificarConquistas();
  saveGame();
  go('s-map'); renderMap();
}

// ══════════════════════════════════════════
//  DIÁRIO DE HOGWARTS
// ══════════════════════════════════════════
function adicionarDiario(chave) {
  const texto=DIARIO_EVENTOS[chave];
  if(!texto) return;
  if(G.diario.find(d=>d.chave===chave)) return; // não duplicar
  G.diario.push({ chave, texto, nivel:G.nivel, data:Date.now() });
}

function renderDiario() {
  if(!G.diario||G.diario.length===0) {
    document.getElementById('diario-lista').innerHTML='<p style="opacity:.5;font-style:italic;text-align:center">Nenhuma entrada ainda.<br>Continue sua aventura...</p>';
    return;
  }
  const av=getAvatar();
  document.getElementById('diario-lista').innerHTML=[...G.diario].reverse().map(d=>`
    <div class="diario-entry">
      <div class="diario-nivel">${av.emoji} Nível ${d.nivel}</div>
      <div class="diario-texto">"${d.texto}"</div>
    </div>`).join('');
}

// ══════════════════════════════════════════
//  MODAL / NARRATIVA
// ══════════════════════════════════════════
function mostrarModal(titulo, msg) {
  document.getElementById('modal-titulo').textContent=titulo;
  document.getElementById('modal-msg').textContent=msg;
  document.getElementById('modal-btn').textContent='OK';
  document.getElementById('modal-btn').onclick=fecharModal;
  document.getElementById('modal-evento').style.display='flex';
}

function fecharModal() { document.getElementById('modal-evento').style.display='none'; }

function mostrarNarrativa(titulo, texto, callback) {
  document.getElementById('modal-titulo').textContent=titulo;
  document.getElementById('modal-msg').textContent=texto;
  const btn=document.getElementById('modal-btn');
  btn.textContent='Continuar →';
  btn.onclick=()=>{ fecharModal(); btn.textContent='OK'; btn.onclick=fecharModal; callback&&callback(); };
  document.getElementById('modal-evento').style.display='flex';
}

function dispararEventoAleatorio() {
  let roll=Math.random();
  for(const ev of EVENTOS_ALEATORIOS) {
    if(roll<ev.chance) {
      const res=ev.efeito(G); saveGame(); renderMap();
      mostrarModal(`${ev.icon} ${ev.titulo}`,res); return;
    }
    roll-=ev.chance;
  }
}

// ══════════════════════════════════════════
//  INVENTÁRIO
// ══════════════════════════════════════════
function renderInv() {
  document.getElementById('status-inv').innerHTML=statusHTML();
  const itens=G.inv.filter(i=>i.qtd>0);
  document.getElementById('inv-items').innerHTML=itens.length
    ?itens.map(it=>`<button class="item-card" onclick="usarItem('${it.id}')">${it.icon} ${it.nome} x${it.qtd}<br><span style="font-size:10px;opacity:.6">${it.desc}</span></button>`).join('')
    :'<p style="opacity:.5;font-style:italic">Inventário vazio.</p>';
}

function usarItem(id) {
  const it=G.inv.find(i=>i.id===id);
  if(!it||it.qtd<=0) return;
  const xpPot=LOJA_ITENS.find(x=>x.id===id&&x.tipo==='xppot');
  if(xpPot) { G.xpBoostMult=xpPot.xpBoost; G.xpBoostExpiry=Date.now()+xpPot.xpDuracao; notif(`${xpPot.icon} XP x${xpPot.xpBoost} por 5min!`); it.qtd--; saveGame(); renderInv(); return; }
  if(id==='potion')        { G.hp=Math.min(G.hpMax,G.hp+40); notif('🧪 +40 HP!'); }
  if(id==='mana_pot')      { G.mp=Math.min(G.mpMax,G.mp+30); notif('💧 +30 MP!'); }
  if(id==='grande_potion') { G.hp=Math.min(G.hpMax,G.hp+80); notif('🫙 +80 HP!'); }
  if(id==='elixir')        { G.hp=Math.min(G.hpMax,G.hp+60); G.mp=Math.min(G.mpMax,G.mp+40); notif('⚗️ +60 HP +40 MP!'); }
  if(id==='potion_full')   { G.hp=G.hpMax; G.mp=G.mpMax; notif('💎 HP e MP cheios!'); }
  it.qtd--; saveGame(); renderInv(); if(G.inBattle) renderBattle();
}

// ══════════════════════════════════════════
//  LOJAS
// ══════════════════════════════════════════
function _semItens() { return '<p style="opacity:.4;font-size:12px;padding:.5rem 0">Nenhum disponível ainda.</p>'; }

function renderShop() {
  document.getElementById('status-shop').innerHTML=statusHTML();
  const d=getDesconto();
  const rv=G.casa==='r'?`<div class="passiva-loja-info">📚 Mente Arcana: 15% de desconto!</div>`:'';
  const c=LOJA_ITENS.filter(it=>it.tipo==='consumivel'&&G.nivel>=it.nivelMin);
  const x=LOJA_ITENS.filter(it=>it.tipo==='xppot'&&G.nivel>=it.nivelMin);
  const e=LOJA_ITENS.filter(it=>(it.tipo==='varinha'||it.tipo==='permanente')&&G.nivel>=it.nivelMin);
  document.getElementById('shop-items').innerHTML=`${rv}
    <div class="shop-section"><h3>⚗️ Poções</h3>${c.map(it=>rowItemHTML(it,d)).join('')||_semItens()}</div>
    <div class="shop-section"><h3>⭐ Poções de XP</h3>${x.map(it=>rowItemHTML(it,d)).join('')||_semItens()}</div>
    <div class="shop-section"><h3>🪄 Equipamentos</h3>${e.map(it=>rowItemHTML(it,d)).join('')||_semItens()}</div>`;
}

function rowItemHTML(it,d=1.0) {
  let bloq=false,motivo='';
  if(it.tipo==='varinha') {
    if(G.varinhasCompradas[it.varinhaLvl]){bloq=true;motivo='Já comprado';}
    else if(it.varinhaLvl>1&&!G.varinhasCompradas[it.varinhaLvl-1]){bloq=true;motivo=`Requer tier ${it.varinhaLvl-1}`;}
  }
  if(it.tipo==='permanente'&&G.permanentesComprados[it.id]){bloq=true;motivo='Já comprado';}
  const p=Math.floor(it.preco*d), semOuro=G.ouro<p;
  const badge=bloq?`<span class="badge badge-lock">${motivo}</span>`:'';
  return `<div class="shop-row"><div class="shop-row-info">${it.icon} <strong>${it.nome}</strong>${badge}<br><span style="font-size:11px;opacity:.6">${it.desc}</span></div><button class="btn" style="padding:5px 11px;font-size:11px;white-space:nowrap" onclick="comprar('${it.id}')" ${bloq||semOuro?'disabled':''}>🪙${formatOuro(p)}</button></div>`;
}

function comprar(id) {
  const d=getDesconto(), lj=LOJA_ITENS.find(i=>i.id===id);
  if(!lj) return;
  const p=Math.floor(lj.preco*d);
  if(G.ouro<p){notif('Ouro insuficiente!');return;}
  G.ouro-=p; tocarSom('compra');
  if(lj.tipo==='varinha'){const b=lj.varinhaLvl===1?10:lj.varinhaLvl===2?25:50;G.bonusDmg+=b;G.varinhasCompradas[lj.varinhaLvl]=true;notif(`${lj.icon} +${b} dano!`);}
  else if(lj.tipo==='permanente'){
    if(id==='escudo'){G.hpMax+=15;G.hp=Math.min(G.hp+15,G.hpMax);notif('🔰 +15 HP!');}
    if(id==='pergaminho'){G.mpMax+=10;G.mp=Math.min(G.mp+10,G.mpMax);notif('📜 +10 MP!');}
    if(id==='colar_crit'){G.chanceCritico=(G.chanceCritico||.10)+.10;notif('🍀 Crítico +10%!');}
    if(id==='anel_xp'){G.xpBoostPassiva=true;notif('💍 +15% XP!');}
    G.permanentesComprados[id]=true;
  } else {
    const ex=G.inv.find(i=>i.id===id);
    if(ex) ex.qtd++; else G.inv.push({...lj,qtd:1});
    notif(`${lj.icon} ${lj.nome} comprado!`);
  }
  saveGame(); renderShop();
}

function renderMagicShop() {
  document.getElementById('status-magic').innerHTML=statusHTML();
  const d=getDesconto();
  const m=MAGIAS_LOJA.filter(m=>G.nivel>=m.nivelMin);
  document.getElementById('magic-items').innerHTML=`<div class="shop-section"><h3>📖 Pergaminhos</h3>${m.map(m=>rowMagiaHTML(m,d)).join('')||_semItens()}</div>`;
}

function rowMagiaHTML(m,d=1.0) {
  const ap=G.magicsAprendidas.includes(m.id), p=Math.floor(m.preco*d), sem=G.ouro<p;
  const badge=ap?`<span class="badge badge-learned">Aprendida</span>`:'';
  return `<div class="shop-row"><div class="shop-row-info">${m.icon} <strong>${m.nome}</strong>${badge}<br><span style="font-size:11px;opacity:.6">${m.dano[0]}–${m.dano[1]} dano | MP:${m.mp} — ${m.desc}</span></div><button class="btn" style="padding:5px 11px;font-size:11px;white-space:nowrap" onclick="aprenderMagia('${m.id}')" ${ap||sem?'disabled':''}>${ap?'✓':'🪙'+formatOuro(p)}</button></div>`;
}

function aprenderMagia(id) {
  const d=getDesconto(), m=MAGIAS_LOJA.find(i=>i.id===id);
  if(!m||G.magicsAprendidas.includes(id)){notif('Já aprendida!');return;}
  const p=Math.floor(m.preco*d);
  if(G.ouro<p){notif('Ouro insuficiente!');return;}
  G.ouro-=p; G.magicsAprendidas.push(id);
  tocarSom('compra'); notif(`${m.icon} ${m.nome} aprendida!`);
  saveGame(); renderMagicShop(); verificarConquistas();
}

// ══════════════════════════════════════════
//  DESCANSO
// ══════════════════════════════════════════
let _restTimer=null;
function renderRestShop() {
  document.getElementById('status-rest').innerHTML=statusHTML();
  const desc=G.descansoExpiry>Date.now(),rest=desc?Math.ceil((G.descansoExpiry-Date.now())/1000):0;
  document.getElementById('rest-content').innerHTML=`
    <div class="rest-box">
      <div style="font-size:40px;text-align:center;margin-bottom:.5rem">🛏️</div>
      <h3 style="text-align:center;margin-bottom:.5rem">Pousada do Bruxo Cansado</h3>
      <p style="font-size:13px;opacity:.6;text-align:center;margin-bottom:1rem;font-style:italic">"Descanse, jovem bruxo. A magia se recupera com o tempo..."</p>
      <div style="border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:1rem;background:rgba(255,255,255,.04);margin-bottom:1rem">
        <div style="font-size:13px">⏱️ 1 minuto de descanso → <strong>+10 MP</strong></div>
        <div style="font-size:11px;opacity:.5;margin-top:4px">Funciona mesmo explorando</div>
      </div>
      ${desc?`<div class="rest-timer">⏳ <span id="rest-countdown">${rest}s</span> restantes<br><small>MP: ${G.mp}/${G.mpMax}</small></div>`
            :`<button class="btn btn-center" onclick="iniciarDescanso()" ${G.mp>=G.mpMax?'disabled':''}>🛏️ Descansar (+10 MP em 1 min)</button>`}
    </div>`;
  if(desc) startRestCountdown();
}

function iniciarDescanso() {
  if(G.mp>=G.mpMax){notif('MP cheio!');return;}
  G.descansoExpiry=Date.now()+60000;
  saveGame(); renderRestShop(); startRestCountdown();
  notif('🛏️ Descansando... +10 MP em 1 minuto');
}

function startRestCountdown() {
  clearInterval(_restTimer);
  _restTimer=setInterval(()=>{
    const cd=document.getElementById('rest-countdown');
    if(cd) cd.textContent=Math.max(0,Math.ceil((G.descansoExpiry-Date.now())/1000))+'s';
    if(Date.now()>=G.descansoExpiry&&G.descansoExpiry>0) {
      clearInterval(_restTimer); G.mp=Math.min(G.mpMax,G.mp+10); G.descansoExpiry=0;
      saveGame(); notif('✨ +10 MP recuperados!'); renderRestShop();
      if(G.inBattle) renderBattle();
    }
  },1000);
}

// ══════════════════════════════════════════
//  MISSÕES & CONQUISTAS
// ══════════════════════════════════════════
function getProgressoMissao(m) {
  if(m.tipo==='kills_total') return G.killsTotal||0;
  if(m.tipo==='kills_boss')  return G.killsBoss||0;
  if(m.tipo==='nivel')       return G.nivel;
  if(m.tipo==='ouro')        return G.ouro;
  if(m.tipo==='streak')      return G.streakMax||0;
  if(m.tipo==='masmorras')   return G.masmorrasCompletas||0;
  return 0;
}

function renderMissoes() {
  document.getElementById('missoes-lista').innerHTML=MISSOES_DEF.map(m=>{
    const ok=G.missoesCompletas.includes(m.id);
    const prog=getProgressoMissao(m);
    const pct=Math.min(100,Math.floor(prog/m.alvo*100));
    return `<div class="missao-card ${ok?'missao-completa':''}">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem">
        <span style="font-size:18px">${m.icon}</span>
        <div><div style="font-family:'Cinzel',serif;font-size:12px">${m.nome} ${ok?'✅':''}</div><div style="font-size:11px;opacity:.6">${m.desc}</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:.5rem">
        <div class="bar-wrap" style="flex:1;height:6px"><div class="bar-fill" style="width:${pct}%;background:${ok?'#7dff9a':'#ffd07d'}"></div></div>
        <span style="font-size:10px;opacity:.6">${Math.min(prog,m.alvo)}/${m.alvo}</span>
      </div>
      ${ok?'':`<div style="font-size:10px;opacity:.5;margin-top:3px">🪙${m.recompensa.ouro}${m.recompensa.xp>0?' +'+m.recompensa.xp+'⭐':''}</div>`}
    </div>`;
  }).join('');
}

function verificarMissoes() {
  for(const m of MISSOES_DEF) {
    if(G.missoesCompletas.includes(m.id)) continue;
    if(getProgressoMissao(m)>=m.alvo) {
      G.missoesCompletas.push(m.id);
      G.ouro+=m.recompensa.ouro; G.xp+=m.recompensa.xp;
      tocarSom('levelup'); notif(`${m.icon} Missão: ${m.nome}! +${m.recompensa.ouro}🪙`);
    }
  }
}

function renderConquistas() {
  document.getElementById('conquistas-lista').innerHTML=CONQUISTAS_DEF.map(c=>{
    const ok=G.conquistasDesbloqueadas.includes(c.id);
    return `<div class="conquista-card ${ok?'conquista-ok':'conquista-bloq'}">
      <span style="font-size:24px">${ok?c.icon:'🔒'}</span>
      <div><div style="font-family:'Cinzel',serif;font-size:12px">${c.nome}</div><div style="font-size:11px;opacity:.6">${ok?c.desc:'???'}</div></div>
    </div>`;
  }).join('');
}

function verificarConquistas() {
  for(const c of CONQUISTAS_DEF) {
    if(G.conquistasDesbloqueadas.includes(c.id)) continue;
    try { if(c.condicao(G)) { G.conquistasDesbloqueadas.push(c.id); tocarSom('levelup'); setTimeout(()=>notif(`${c.icon} Conquista: ${c.nome}!`),500); } } catch(e){}
  }
}

// ══════════════════════════════════════════
//  ESTATÍSTICAS
// ══════════════════════════════════════════
function renderStats() {
  const t=formatTempo(Date.now()-(G.tempoInicio||Date.now()));
  const top=Object.entries(G.killsPorTipo||{}).sort((a,b)=>b[1]-a[1])[0];
  const bonus=getBonusHabilidades();
  const vr=getVarinha();
  document.getElementById('stats-content').innerHTML=`
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-item-val">${G.nivel}</div><div class="stat-item-label">Nível</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.killsTotal||0}</div><div class="stat-item-label">Mortos</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.killsBoss||0}</div><div class="stat-item-label">Bosses</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.masmorrasCompletas||0}</div><div class="stat-item-label">Masmorras</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.masmorrasPerfeitas||0}</div><div class="stat-item-label">Perfeitas</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.derrotas||0}</div><div class="stat-item-label">Derrotas</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.streakMax||0}</div><div class="stat-item-label">Streak</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.maiorDano||0}</div><div class="stat-item-label">Maior Dano</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.criticosTotal||0}</div><div class="stat-item-label">Críticos</div></div>
      <div class="stat-item"><div class="stat-item-val">${(G.habilidadesAprendidas||[]).length}</div><div class="stat-item-label">Habilidades</div></div>
      <div class="stat-item"><div class="stat-item-val">${G.conquistasDesbloqueadas.length}/${CONQUISTAS_DEF.length}</div><div class="stat-item-label">Troféus</div></div>
      <div class="stat-item"><div class="stat-item-val">${t}</div><div class="stat-item-label">Tempo</div></div>
    </div>
    <div style="border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.8rem;background:rgba(255,255,255,.03);margin-top:.5rem">
      <div style="font-family:'Cinzel',serif;font-size:10px;opacity:.5;margin-bottom:.5rem">BÔNUS ATIVOS</div>
      <div style="font-size:12px;line-height:1.8">
        <span style="color:${vr.hex}">🪄</span> Varinha ${vr.nome} &nbsp;|&nbsp;
        +${(bonus.danoPct*100).toFixed(0)}% dano &nbsp;|&nbsp;
        Crítico x${bonus.criticoMult} &nbsp;|&nbsp;
        ${bonus.dmgReducPct>0?`-${(bonus.dmgReducPct*100).toFixed(0)}% dano recebido &nbsp;|&nbsp;`:''}
        ${G.frenesiStacks>0?`🔥 Frenesi x${G.frenesiStacks}`:''}
      </div>
    </div>
    ${top?`<div style="text-align:center;font-size:11px;opacity:.5;margin-top:.5rem">Favorito: <strong>${INIMIGOS_BASE[top[0]]?.nome||top[0]}</strong> (${top[1]}x)</div>`:''}`;
}

// ══════════════════════════════════════════
//  NOTIFICAÇÃO
// ══════════════════════════════════════════
let _notifTimer=null;
function notif(msg) {
  const el=document.getElementById('notif-box');
  el.textContent=msg; el.style.display='block';
  clearTimeout(_notifTimer);
  _notifTimer=setTimeout(()=>{el.style.display='none';},2500);
}
