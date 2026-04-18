// ══════════════════════════════════════════
//  data.js — v4 | Dados estáticos completos
// ══════════════════════════════════════════

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; } 

// ── QUIZ ──
const PERGUNTAS = [
  { t: '"Na Floresta Proibida, uma bifurcação. Você..."', ops: [
    { t: "Avança pelo caminho mais sombrio sem hesitar.", c: "g" },
    { t: "Analisa pistas ao redor antes de decidir.",    c: "r" },
    { t: "Escolhe o caminho mais estratégico.",          c: "s" },
    { t: "Espera pelos amigos para decidirem juntos.",   c: "h" }
  ]},
  { t: '"Qual conquista te daria mais orgulho?"', ops: [
    { t: "Salvar alguém arriscando a própria vida.",     c: "g" },
    { t: "Descobrir um feitiço que ninguém conhecia.",   c: "r" },
    { t: "Alcançar o topo de uma organização poderosa.", c: "s" },
    { t: "Ser lembrado como alguém justo e confiável.",  c: "h" }
  ]},
  { t: '"Um baú: Somente os dignos entrarão. Você..."', ops: [
    { t: "Arromba na força — sem medo.",                 c: "g" },
    { t: "Decifra o enigma com calma.",                  c: "r" },
    { t: "Encontra uma forma alternativa e discreta.",   c: "s" },
    { t: "Busca o dono legítimo antes de tudo.",         c: "h" }
  ]},
  { t: '"Qual familiar você escolheria em Hogwarts?"', ops: [
    { t: "Um leão — poderoso e majestoso.",  c: "g" },
    { t: "Uma coruja — sábia e perspicaz.",  c: "r" },
    { t: "Uma cobra — misteriosa e astuta.", c: "s" },
    { t: "Um texugo — leal e trabalhador.",  c: "h" }
  ]},
  { t: '"Um colega é injustiçado por um professor. Você..."', ops: [
    { t: "Enfrenta o professor publicamente.",                c: "g" },
    { t: "Pesquisa as regras para um argumento irrefutável.", c: "r" },
    { t: "Age nos bastidores para reverter a situação.",      c: "s" },
    { t: "Conforta o colega e o apoia em cada passo.",       c: "h" }
  ]}
];

// ── PERSONALIZAÇÃO DO PERSONAGEM ──
const AVATARES = [
  { id: "mago_m",   emoji: "🧙‍♂️", nome: "Bruxo"       },
  { id: "mago_f",   emoji: "🧙‍♀️", nome: "Bruxa"        },
  { id: "elfo_m",   emoji: "🧝‍♂️", nome: "Élfico"       },
  { id: "elfo_f",   emoji: "🧝‍♀️", nome: "Élfica"       },
  { id: "cavaleiro",emoji: "🧑‍⚕️", nome: "Guardião"     },
  { id: "sombra",   emoji: "🥷",   nome: "Sombra"       },
  { id: "nobre",    emoji: "🤴",   nome: "Nobre"        },
  { id: "princesa", emoji: "👸",   nome: "Nobre"        },
];

const CORES_VARINHA = [
  { id: "dourada",  hex: "#ffd700", nome: "Dourada"  },
  { id: "prata",    hex: "#c0c0c0", nome: "Prata"    },
  { id: "obsidiana",hex: "#4a4a6a", nome: "Obsidiana"},
  { id: "rubi",     hex: "#e74c3c", nome: "Rubi"     },
  { id: "safira",   hex: "#3498db", nome: "Safira"   },
  { id: "esmeralda",hex: "#2ecc71", nome: "Esmeralda"},
  { id: "ametista", hex: "#9b59b6", nome: "Ametista" },
  { id: "ébano",    hex: "#8B4513", nome: "Ébano"    },
];

const CLAS = [
  { id: "thorne", nome: "Thorne", raridade: "Comum", peso: 34, icon: "🛡️", cor: "#9aa4b2", bonus: { hp: 10 }, desc: "+10 HP máximo. Clã sólido e resistente." },
  { id: "reed", nome: "Reed", raridade: "Comum", peso: 28, icon: "📘", cor: "#7faeea", bonus: { mp: 8 }, desc: "+8 MP máximo. Ideal para quem curte soltar magia cedo." },
  { id: "blackwood", nome: "Blackwood", raridade: "Raro", peso: 16, icon: "🗡️", cor: "#7df0c8", bonus: { danoPct: 0.05 }, desc: "+5% de dano em todas as magias." },
  { id: "rosier", nome: "Rosier", raridade: "Raro", peso: 11, icon: "🍀", cor: "#7de48b", bonus: { crit: 0.04 }, desc: "+4% de chance crítica. Build agressiva e consistente." },
  { id: "gaunt", nome: "Gaunt", raridade: "Epico", peso: 6, icon: "🐍", cor: "#6fc66e", bonus: { dreno: 3 }, desc: "Feitiços drenam 3 HP adicionais do alvo." },
  { id: "lestrange", nome: "Lestrange", raridade: "Epico", peso: 3.5, icon: "🔥", cor: "#ff8a5b", bonus: { danoPct: 0.08, hp: -10 }, desc: "+8% de dano, mas -10 HP máximo. Alto risco, alto impacto." },
  { id: "malfoy", nome: "Malfoy", raridade: "Mitico", peso: 1.2, icon: "👑", cor: "#d6dcff", bonus: { desconto: 0.07, ouroPct: 0.1 }, desc: "-7% em lojas e +10% de ouro nas batalhas." },
  { id: "potter", nome: "Potter", raridade: "Lendario", peso: 0.3, icon: "⚡", cor: "#ffd166", bonus: { hp: 18, mp: 12, danoPct: 0.08, crit: 0.05 }, desc: "Clã lendário. Pacote completo para virar protagonista mesmo." },
];

// ── CASAS ──
const CASAS = {
  g: {
    nome: "Gryffindor", crest: "🦁",
    motto: "Onde moram os corajosos de coração",
    desc: "Sua bravura e determinação definem os grandes heróis.",
    traits: ["Coragem", "Bravura", "Determinação", "Nobreza"],
    theme: "th-g",
    passiva: { nome: "Adrenalina do Leão", desc: "Recupera 8 HP ao vencer cada batalha", icon: "❤️‍🔥" },
    feiticos: [
      { id: "expelliarmus", nome: "Expelliarmus",     icon: "✨", dano: [18,28], mp: 10, desc: "Desarma o inimigo" },
      { id: "patronum",     nome: "Expecto Patronum", icon: "🌟", dano: [30,45], mp: 25, desc: "Invoca um patrono" },
      { id: "incendio",     nome: "Incendio",         icon: "🔥", dano: [22,35], mp: 18, desc: "Lança chamas" },
      { id: "furia",        nome: "Fúria Gryffindor", icon: "🦁", dano: [40,55], mp: 40, desc: "Poder do leão" }
    ]
  },
  s: {
    nome: "Slytherin", crest: "🐍",
    motto: "Onde moram os astutos e ambiciosos",
    desc: "Sua mente estratégica e ambição te levam além.",
    traits: ["Astúcia", "Ambição", "Liderança", "Engenhosidade"],
    theme: "th-s",
    passiva: { nome: "Roubo de Vida", desc: "Cada feitiço rouba 4 HP do inimigo para você", icon: "🩸" },
    feiticos: [
      { id: "sectumsempra", nome: "Sectumsempra",    icon: "🗡️", dano: [22,32], mp: 12, desc: "Corte sombrio preciso" },
      { id: "avada",        nome: "Avada Kedavra",   icon: "💚", dano: [35,50], mp: 30, desc: "Maldição imperdoável" },
      { id: "serpente",     nome: "Serpente Negra",  icon: "🐍", dano: [25,38], mp: 20, desc: "Serpentes venenosas" },
      { id: "poder_s",      nome: "Poder Slytherin", icon: "⚡", dano: [42,58], mp: 45, desc: "Ambição como força" }
    ]
  },
  r: {
    nome: "Ravenclaw", crest: "🦅",
    motto: "Onde os sábios e criativos florescem",
    desc: "Sua mente é sua maior arma. Você busca conhecimento.",
    traits: ["Sabedoria", "Criatividade", "Inteligência", "Curiosidade"],
    theme: "th-r",
    passiva: { nome: "Mente Arcana", desc: "15% de desconto em todas as lojas", icon: "📚" },
    feiticos: [
      { id: "alohomora",  nome: "Alohomora",     icon: "🔮", dano: [15,25], mp:  8, desc: "Abertura mágica" },
      { id: "riddikulus", nome: "Riddikulus",    icon: "🌀", dano: [28,40], mp: 22, desc: "Transforma o medo" },
      { id: "legilimens", nome: "Legilimens",    icon: "🧠", dano: [32,44], mp: 28, desc: "Penetra na mente" },
      { id: "mente",      nome: "Mente Aguçada", icon: "🦅", dano: [44,60], mp: 42, desc: "Sabedoria pura" }
    ]
  },
  h: {
    nome: "Hufflepuff", crest: "🦡",
    motto: "Onde os leais e trabalhadores são valorizados",
    desc: "Sua bondade e dedicação são sua força.",
    traits: ["Lealdade", "Paciência", "Dedicação", "Bondade"],
    theme: "th-h",
    passiva: { nome: "Sorte do Texugo", desc: "+25% de ouro em todas as batalhas", icon: "🪙" },
    feiticos: [
      { id: "protego", nome: "Protego",           icon: "🛡️", dano: [10,20], mp:  8, desc: "Escudo reflexivo" },
      { id: "lumos",   nome: "Lumos Maxima",       icon: "☀️", dano: [25,37], mp: 20, desc: "Luz que cega" },
      { id: "laco",    nome: "Laço do Texugo",     icon: "🦡", dano: [30,42], mp: 25, desc: "Imobiliza inimigo" },
      { id: "coracao", nome: "Coração Hufflepuff", icon: "💛", dano: [38,52], mp: 38, desc: "Lealdade que fere" }
    ]
  }
};

const ATAQUE_BASICO = { id: "__basico__", nome: "Ataque Básico", icon: "🪄", dano: [6,12], mp: 0, desc: "Golpe sem magia" };

// ── ÁRVORE DE HABILIDADES ──
// A cada 5 níveis o jogador escolhe 1 de 3 opções
const ARVORE_HABILIDADES = {
  // Tier 1 — Nível 5
  5: [
    { id: "foco",       nome: "Foco de Batalha",   icon: "🎯", desc: "+12% de dano em todos os feitiços",         tipo: "dano_pct",     valor: 0.12 },
    { id: "resistencia",nome: "Resistência Mágica", icon: "🛡️", desc: "+25 HP máximo permanente",                  tipo: "hp_max",       valor: 25   },
    { id: "catalise",   nome: "Catálise",           icon: "⚗️", desc: "Regenera +3 MP extra por turno de combate", tipo: "mp_regen",     valor: 3    },
  ],
  // Tier 2 — Nível 10
  10: [
    { id: "golpe_duplo",  nome: "Golpe Duplo",       icon: "⚔️", desc: "20% de chance de atacar duas vezes no mesmo turno", tipo: "golpe_duplo",  valor: 0.20 },
    { id: "escudo_arcano",nome: "Escudo Arcano",      icon: "✨", desc: "Absorve os primeiros 15 de dano de cada batalha",   tipo: "escudo_arcano",valor: 15   },
    { id: "vampirismo",   nome: "Vampirismo",         icon: "🩸", desc: "+8% do dano causado é convertido em HP",            tipo: "vampirismo",   valor: 0.08 },
  ],
  // Tier 3 — Nível 15
  15: [
    { id: "frenesi",    nome: "Frenesi",           icon: "🔥", desc: "Cada kill aumenta dano em 5% (acumula, reseta ao morrer)", tipo: "frenesi",    valor: 0.05 },
    { id: "mana_surge", nome: "Surge de Mana",     icon: "💧", desc: "Feitiços com MP > 30 causam +25% de dano",               tipo: "mana_surge",  valor: 0.25 },
    { id: "fortress",   nome: "Fortaleza",         icon: "🏰", desc: "-20% de dano recebido de todos os inimigos",             tipo: "dmg_reduc",   valor: 0.20 },
  ],
  // Tier 4 — Nível 20
  20: [
    { id: "critico_mortal",nome: "Crítico Mortal",  icon: "💀", desc: "Críticos causam 3x de dano em vez de 2x",              tipo: "critico_mult", valor: 3.0  },
    { id: "maestria",      nome: "Maestria Arcana", icon: "🌟", desc: "+20% XP de todas as batalhas permanentemente",          tipo: "xp_pct",       valor: 0.20 },
    { id: "ressurgir",     nome: "Ressurgir",       icon: "♻️", desc: "Uma vez por masmorra, volta com 30 HP ao invés de morrer", tipo: "ressurgir", valor: 30   },
  ],
  // Tier 5 — Nível 25
  25: [
    { id: "devastacao",  nome: "Devastação",       icon: "💥", desc: "+30% de dano mas -15 HP máximo",              tipo: "devastacao",  valor: 0.30 },
    { id: "arcano_puro", nome: "Arcano Puro",      icon: "🔮", desc: "Feitiços da casa custam -30% de MP",           tipo: "mp_reduc",    valor: 0.30 },
    { id: "lendario",    nome: "Lendário",         icon: "⚜️", desc: "+50 HP máx, +25 MP máx, +8% dano — o equilíbrio perfeito", tipo: "lendario", valor: 1 },
  ],
  // Tier 6 — Nível 30
  30: [
    { id: "transcendencia",nome: "Transcendência", icon: "🌌", desc: "Ao usar o feitiço mais forte, ganha imunidade a 1 ataque", tipo: "transcendencia", valor: 1 },
    { id: "colapso",      nome: "Colapso Arcano",  icon: "🌀", desc: "Inimigos com menos de 25% HP tomam +60% de dano",          tipo: "colapso",        valor: 0.60 },
    { id: "eterno",       nome: "Eterno",          icon: "∞",  desc: "HP e MP não podem cair abaixo de 1 em batalhas normais",   tipo: "eterno",         valor: 1    },
  ],
};

// ── TÍTULOS PROGRESSIVOS ──
const TITULOS = [
  { nivel:  1, titulo: "Calouro",         icon: "📜" },
  { nivel:  5, titulo: "Estudante",       icon: "📚" },
  { nivel: 10, titulo: "Bruxo",           icon: "🪄" },
  { nivel: 15, titulo: "Mago",            icon: "🔮" },
  { nivel: 20, titulo: "Arquimago",       icon: "⚡" },
  { nivel: 25, titulo: "Mestre das Artes",icon: "🌟" },
  { nivel: 30, titulo: "Lorde das Trevas",icon: "💀" },
  { nivel: 40, titulo: "O Imortal",       icon: "∞"  },
];

function getTitulo(nivel) {
  let t = TITULOS[0];
  for (const tt of TITULOS) { if (nivel >= tt.nivel) t = tt; }
  return t;
}

// ── MAGIAS LOJA ──
const MAGIAS_LOJA = [
  { id: "bombarda",    nome: "Bombarda",          icon: "💥", dano: [35, 55],  mp: 30, desc: "Explosão devastadora",                  preco:  1000, nivelMin: 3 },
  { id: "confringo",   nome: "Confringo",         icon: "🌋", dano: [40, 60],  mp: 35, desc: "Feitiço de explosão",                    preco:  1500, nivelMin: 4 },
  { id: "crucio",      nome: "Cruciatus",         icon: "⚡", dano: [45, 70],  mp: 40, desc: "Maldição da dor extrema",                preco:  2500, nivelMin: 5 },
  { id: "fiendfyre",   nome: "Fiendfyre",         icon: "🔱", dano: [55, 80],  mp: 50, desc: "Chamas infernais incontroláveis",         preco:  3000, nivelMin: 6 },
  { id: "prior",       nome: "Priori Incantatem", icon: "🌀", dano: [60, 90],  mp: 55, desc: "Eco de magias potencializado",            preco:  5000, nivelMin: 7 },
  { id: "tempestade",  nome: "Tempestade Arcana", icon: "🌪️", dano: [70, 100], mp: 60, desc: "Vendaval de energia mágica pura",         preco:  6000, nivelMin: 8 },
  { id: "morte_negra", nome: "Marca Negra",       icon: "🌑", dano: [80, 110], mp: 70, desc: "O sinal do Lorde das Trevas como arma",   preco:  8000, nivelMin: 9 },
  { id: "glacius",     nome: "Glacius Maxima",    icon: "❄️", dano: [90, 125], mp: 72, desc: "Congela o campo com pressão arcana",       preco: 11000, nivelMin: 11 },
  { id: "fulmen",      nome: "Fulmen Tempus",     icon: "🌩️", dano: [102, 138], mp: 78, desc: "Relâmpagos concentrados de alto impacto",  preco: 14500, nivelMin: 13 },
  { id: "arcis",       nome: "Arcis Nova",        icon: "☄️", dano: [118, 160], mp: 86, desc: "Rasgão de energia pura e instável",        preco: 18500, nivelMin: 15 },
  { id: "phoenix",     nome: "Chama da Fênix",    icon: "🕊️", dano: [135, 182], mp: 95, desc: "Explosão lendária com assinatura heroica", preco: 24000, nivelMin: 18 },
];

// ── ZONAS / MASMORRAS ──
// Cada zona agora é uma masmorra com 3 andares
const ZONAS = [
  { id: "corredor",   nome: "Corredores de Hogwarts",      icon: "🏰", inimigos: ["fantasma","armadura"],        nivelMin:  1, xpBase:  30, ouroBase:  15 },
  { id: "biblioteca", nome: "Biblioteca Proibida",          icon: "📚", inimigos: ["sombra","livro_maldito"],     nivelMin:  3, xpBase:  45, ouroBase:  20 },
  { id: "floresta",   nome: "Floresta Proibida",            icon: "🌲", inimigos: ["aragog","centauro"],          nivelMin:  6, xpBase:  60, ouroBase:  28 },
  { id: "lago",       nome: "Lago Negro",                   icon: "🌊", inimigos: ["grindylow","sereia_negra"],   nivelMin: 10, xpBase:  75, ouroBase:  35 },
  { id: "dungeons",   nome: "Masmorras de Hogwarts",        icon: "⚗️", inimigos: ["troll","dementor"],           nivelMin: 14, xpBase:  90, ouroBase:  45 },
  { id: "cemiterio",  nome: "Cemitério de Little Hangleton",icon: "⚰️", inimigos: ["inferi","peter_pettigrew"],   nivelMin: 18, xpBase: 110, ouroBase:  55, boss: "peter_pettigrew" },
  { id: "camara",     nome: "Câmara Secreta",               icon: "🐍", inimigos: ["basilisco","tom_riddle"],     nivelMin: 22, xpBase: 130, ouroBase:  65, boss: "tom_riddle" },
  { id: "ministerio", nome: "Ministério da Magia",          icon: "🏛️", inimigos: ["auror_sombrio","acromantula"],nivelMin: 27, xpBase: 155, ouroBase:  80 },
  { id: "azkaban",    nome: "Azkaban",                      icon: "🏚️", inimigos: ["dementor_senhor","bellatrix"],nivelMin: 32, xpBase: 180, ouroBase:  95, boss: "bellatrix" },
  { id: "torre",      nome: "Torre do Mago",                icon: "🗼", inimigos: ["voldemort"],                  nivelMin: 40, xpBase: 250, ouroBase: 130, boss: "voldemort" },
];

// ── ESCOLHAS NAS MASMORRAS (andar do meio) ──
const ESCOLHAS_MASMORRA = [
  {
    id: "sangue_magico",
    titulo: "Fonte de Sangue Mágico",
    desc: "Uma fonte de energia sombria pulsa na parede. Você pode beber, mas há um custo...",
    opcoes: [
      { texto: "🩸 Beber da fonte (perde 20 HP, ganha +40% dano por 1 batalha)", acao: "buff_dano_custo_hp" },
      { texto: "🚶 Ignorar e continuar com cautela",                              acao: "skip" },
      { texto: "🔮 Tentar purificar a fonte (30% de curar 30 HP, 70% de perder 10)", acao: "risco_cura" },
    ]
  },
  {
    id: "sala_secreta",
    titulo: "Sala Secreta",
    desc: "Uma porta trancada revela uma sala. Dentro, um baú brilhante e sons de batalha ao fundo.",
    opcoes: [
      { texto: "⚔️ Enfrentar o guardião para pegar o tesouro (batalha difícil, +80% ouro)", acao: "batalha_bonus" },
      { texto: "💨 Escapar pela janela com o que está nas suas mãos",                        acao: "skip" },
      { texto: "🧪 Usar uma Poção de Cura para restaurar antes de continuar",               acao: "usar_pocao" },
    ]
  },
  {
    id: "eco_patrono",
    titulo: "Eco do Patrono",
    desc: "Um patrono espectral aparece e oferece sua bênção — mas sua forma te cobra algo.",
    opcoes: [
      { texto: "✨ Aceitar a bênção (perde 15 MP máx, ganha +20 HP máx permanente)",  acao: "troca_mp_hp" },
      { texto: "💧 Pedir restauração de mana completa (custo: 50 de ouro)",            acao: "comprar_mana" },
      { texto: "🌟 Recusar e tentar absorver a magia pura (50% gain 30 MP, 50% nada)", acao: "risco_mana" },
    ]
  },
  {
    id: "armadilha_troll",
    titulo: "Armadilha do Troll",
    desc: "Uma gaiola cai sobre você! Você pode lutar para sair ou tentar negociar.",
    opcoes: [
      { texto: "💪 Quebrar a gaiola na força (perde 25 HP, continua sem batalha)",  acao: "custo_hp_pula" },
      { texto: "🗝️ Procurar a chave escondida (50% achar e ganhar 20 ouro, 50% batalha extra)", acao: "risco_chave" },
      { texto: "⚡ Lançar Alohomora (se Ravenclaw, funciona grátis; outros: 10 MP)", acao: "alohomora" },
    ]
  },
  {
    id: "altar_sombrio",
    titulo: "Altar das Trevas",
    desc: "Um altar sombrio sussurra promessas de poder. Ao seu redor, runas antigas brilham.",
    opcoes: [
      { texto: "🌑 Fazer um pacto (perde 30 HP máx, próxima batalha causa dano dobrado)", acao: "pacto_sombrio" },
      { texto: "📖 Estudar as runas (ganha 50 XP bônus)",                                 acao: "ganhar_xp" },
      { texto: "🔥 Destruir o altar (chance de item raro ou apenas satisfação moral)",    acao: "destruir_altar" },
    ]
  },
];

// ── INIMIGOS BASE ──
const INIMIGOS_BASE = {
  fantasma:        { nome: "Fantasma Sanguinário",  art: "👻", hpMax:  60, atk: [ 8,16], xp:  30, ouro:  12, habilidade: null,      dificuldade: 1 },
  armadura:        { nome: "Armadura Encantada",    art: "🗡️", hpMax:  80, atk: [10,18], xp:  35, ouro:  15, habilidade: "escudo",  dificuldade: 1 },
  sombra:          { nome: "Sombra Sussurrante",    art: "🌫️", hpMax:  70, atk: [ 9,17], xp:  32, ouro:  13, habilidade: "dreno_mp",dificuldade: 1 },
  livro_maldito:   { nome: "Livro Amaldiçoado",     art: "📖", hpMax:  65, atk: [11,19], xp:  38, ouro:  16, habilidade: null,      dificuldade: 1 },
  aragog:          { nome: "Aragog Menor",          art: "🕷️", hpMax: 110, atk: [14,24], xp:  55, ouro:  22, habilidade: "veneno",  dificuldade: 2 },
  centauro:        { nome: "Centauro Feroz",        art: "🏹", hpMax: 120, atk: [16,26], xp:  60, ouro:  25, habilidade: null,      dificuldade: 2 },
  grindylow:       { nome: "Grindylow das Trevas",  art: "🦑", hpMax: 105, atk: [15,25], xp:  58, ouro:  24, habilidade: "dreno_mp",dificuldade: 2 },
  sereia_negra:    { nome: "Sereia Negra",          art: "🧜", hpMax: 115, atk: [17,27], xp:  65, ouro:  28, habilidade: "cura",    dificuldade: 2 },
  troll:           { nome: "Troll das Masmorras",   art: "👾", hpMax: 180, atk: [22,36], xp:  80, ouro:  38, habilidade: "escudo",  dificuldade: 3 },
  dementor:        { nome: "Dementor",              art: "🌑", hpMax: 160, atk: [24,38], xp:  85, ouro:  40, habilidade: "dreno_mp",dificuldade: 3 },
  inferi:          { nome: "Inferi",                art: "🧟", hpMax: 200, atk: [26,40], xp: 100, ouro:  50, habilidade: "cura",    dificuldade: 3 },
  peter_pettigrew: { nome: "Peter Pettigrew",       art: "🐀", hpMax: 175, atk: [24,38], xp:  95, ouro:  48, habilidade: "esquiva", dificuldade: 3, boss: true },
  basilisco:       { nome: "Basilisco",             art: "🐲", hpMax: 260, atk: [30,46], xp: 125, ouro:  62, habilidade: "veneno",  dificuldade: 4, boss: true },
  tom_riddle:      { nome: "Tom Riddle",            art: "🪬", hpMax: 240, atk: [28,44], xp: 118, ouro:  58, habilidade: "dreno_mp",dificuldade: 4, boss: true },
  auror_sombrio:   { nome: "Auror Sombrio",         art: "🕵️", hpMax: 280, atk: [32,48], xp: 140, ouro:  70, habilidade: "escudo",  dificuldade: 4 },
  acromantula:     { nome: "Acromantula",           art: "🕸️", hpMax: 260, atk: [30,46], xp: 135, ouro:  67, habilidade: "veneno",  dificuldade: 4 },
  dementor_senhor: { nome: "Senhor dos Dementores", art: "💀", hpMax: 320, atk: [36,54], xp: 165, ouro:  85, habilidade: "dreno_mp",dificuldade: 5, boss: true },
  bellatrix:       { nome: "Bellatrix Lestrange",   art: "🖤", hpMax: 300, atk: [34,52], xp: 158, ouro:  80, habilidade: "cura",    dificuldade: 5, boss: true },
  voldemort:       { nome: "Lord Voldemort",        art: "🐍", hpMax: 450, atk: [40,62], xp: 300, ouro: 150, habilidade: "reflexo", dificuldade: 5, boss: true },
  // Guardião de sala secreta
  guardiao:        { nome: "Guardião do Tesouro",   art: "⚔️", hpMax: 200, atk: [28,42], xp:  90, ouro: 120, habilidade: "escudo",  dificuldade: 3 },
};

// ── ESCALAR INIMIGO ──
// Dificuldade balanceada: crescimento menor nos primeiros níveis, mais agressivo no fim
function escalarInimigo(base, nivel) {
  // Curva de dificuldade suavizada
  const f = 1 + Math.log(nivel) * 0.45;
  // Inimigos de elite escalam mais rápido
  const elite = base.dificuldade >= 4 ? 1.15 : 1.0;
  return {
    ...base,
    hpMax: Math.floor(base.hpMax * f * elite),
    hp:    Math.floor(base.hpMax * f * elite),
    atk:   [Math.floor(base.atk[0] * f), Math.floor(base.atk[1] * f)],
    xp:    Math.floor(base.xp   * (1 + (nivel - 1) * 0.08)),
    ouro:  Math.floor(base.ouro * (1 + (nivel - 1) * 0.08))
  };
}

// ── FALAS BOSS INTRO ──
const BOSS_INTRO_FALAS = {
  peter_pettigrew: "«Ah... ah... não quero brigar! Sou inofensivo... apenas um rato, apenas um servo...»",
  basilisco:       "«*HISSSS* — Uma presença ancestral e mortal envolve o ar. Não olhe nos olhos...»",
  tom_riddle:      "«Você sabe quem eu sou? Eu sou Tom Riddle... e você vai me ajudar a renascer.»",
  bellatrix:       "«Ohhh, que delícia! Deixe-me mostrar o que aprendi com meu Lorde!»",
  voldemort:       "«Você chegou até aqui para morrer. Avada Kedavra não perdoa... nem mesmo heróis.»",
  dementor_senhor: "«...lembre-se do seu pior momento... nós nos alimentamos do desespero...»",
};

// ── FALAS BOSS MORTE ──
const BOSS_FALAS = {
  peter_pettigrew: { art: "🐀", fala: "«N-não... o Lorde vai me vingar... sempre há uma saída... sempre...»" },
  basilisco:       { art: "🐲", fala: "«Mil anos... e você, um mero estudante, me derrota... Que a câmara... permaneça... eterna...»" },
  tom_riddle:      { art: "🪬", fala: "«Você destruiu minha memória... mas onde há trevas, sempre haverá um Riddle. Eu voltarei...»" },
  bellatrix:       { art: "🖤", fala: "«Como ousou?! Meu Lorde... perdoa tua serva... eu falhei... mas as trevas NUNCA morrem!»" },
  voldemort:       { art: "🐍", fala: "«Não... pode... ser... Eu sou a morte encarnada... Como um ser tão frágil pode me derrotar?! NÃO!!!»" },
  dementor_senhor: { art: "💀", fala: "«...a escuridão sempre retorna... não há vitória... apenas... atraso... O frio nunca desaparece...»" },
};

// ── DIÁRIO DE HOGWARTS (entradas por evento) ──
const DIARIO_EVENTOS = {
  peter_pettigrew: "Derrotei Peter Pettigrew. Ele chorou até o fim. Covarde até a última respiração.",
  basilisco:       "O Basilisco caiu. Mil anos de guarda... e foi por mim que terminou. Sinto o peso disso.",
  tom_riddle:      "Tom Riddle se desfez. Por um momento vi algo humano naqueles olhos. Logo passou.",
  bellatrix:       "Bellatrix não é mais. Ela riu até o fim. Não sei se tenho que sentir pena ou medo.",
  voldemort:       "Voldemort. É difícil escrever isso. O mais poderoso mago das trevas... caiu. Caiu pra mim.",
  dementor_senhor: "O Senhor dos Dementores se dissipou em névoa fria. Sinto o calor voltando aos meus ossos.",
  nivel_5:         "Nível 5. Estou ficando mais forte. Hogwarts parece um lugar diferente agora.",
  nivel_10:        "Nível 10. Os professores começam a me olhar diferente. Seja lá o que isso significa.",
  nivel_20:        "Nível 20. Arquimago. Ainda parece surreal. Quantos chegaram até aqui?",
  nivel_30:        "Nível 30. Lorde das Trevas. O título pesa. Espero fazer jus a ele pelos motivos certos.",
  habilidade:      "Aprendi algo novo hoje. Sinto a magia fluir de forma diferente dentro de mim.",
  masmorra_clear:  "Completei a masmorra sem cair. Cada andar foi uma prova. Valeu cada cicatriz.",
};

// ── LOJA ITENS ──
const LOJA_ITENS = [
  { id: "potion",        nome: "Poção de Cura",          icon: "🧪", preco:   17, desc: "Restaura 40 HP",             tipo: "consumivel", nivelMin: 1 },
  { id: "mana_pot",      nome: "Poção de Mana",           icon: "💧", preco:   27, desc: "Restaura 30 MP",             tipo: "consumivel", nivelMin: 1 },
  { id: "grande_potion", nome: "Poção Grande",             icon: "🫙", preco:   55, desc: "Restaura 80 HP",             tipo: "consumivel", nivelMin: 2 },
  { id: "elixir",        nome: "Elixir da Força",         icon: "⚗️", preco:  110, desc: "Restaura 60 HP e 40 MP",     tipo: "consumivel", nivelMin: 4 },
  { id: "potion_full",   nome: "Poção Mestra",             icon: "💎", preco:  250, desc: "HP e MP totalmente cheios",  tipo: "consumivel", nivelMin: 6 },
  { id: "giro_cla",      nome: "Giro de Família",         icon: "🎰", preco: 1800, desc: "Ganha 1 giro extra na roleta de clã", tipo: "cla", nivelMin: 4 },
  { id: "xp_pot_p",      nome: "Essência de Experiência", icon: "🌿", preco:  150, desc: "XP +50% por 5 minutos",      tipo: "xppot", nivelMin: 3,  xpBoost: 1.5, xpDuracao: 300000 },
  { id: "xp_pot_m",      nome: "Elixir do Aprendizado",   icon: "🔆", preco:  400, desc: "XP +100% por 5 minutos",     tipo: "xppot", nivelMin: 8,  xpBoost: 2.0, xpDuracao: 300000 },
  { id: "xp_pot_g",      nome: "Pergaminho Ancestral",    icon: "📿", preco:  900, desc: "XP +200% por 5 minutos",     tipo: "xppot", nivelMin: 15, xpBoost: 3.0, xpDuracao: 300000 },
  { id: "escudo",        nome: "Amuleto Protetor",        icon: "🔰", preco:   70, desc: "+15 HP máximo",              tipo: "permanente", nivelMin: 2,  limite: 1 },
  { id: "pergaminho",    nome: "Pergaminho do Sábio",      icon: "📜", preco:   90, desc: "+10 MP máximo",              tipo: "permanente", nivelMin: 3,  limite: 1 },
  { id: "colar_crit",    nome: "Colar da Sorte",          icon: "🍀", preco:  200, desc: "Chance de crítico +10%",      tipo: "permanente", nivelMin: 5,  limite: 1 },
  { id: "anel_xp",       nome: "Anel do Estudioso",       icon: "💍", preco:  350, desc: "+15% XP permanente",          tipo: "permanente", nivelMin: 7,  limite: 1 },
  { id: "varinha1", nome: "Varinha Reforçada",    icon: "🪄", preco:     80, desc: "+10 dano permanente", tipo: "varinha", nivelMin: 1, varinhaLvl: 1, limite: 1 },
  { id: "varinha2", nome: "Varinha Ancestral",    icon: "🔮", preco: 3000, desc: "+25 dano permanente", tipo: "varinha", nivelMin: 5, varinhaLvl: 2, limite: 1 },
  { id: "varinha3", nome: "Varinha das Varinhas", icon: "🌟", preco: 9000, desc: "+50 dano permanente", tipo: "varinha", nivelMin: 8, varinhaLvl: 3, limite: 1 },
];

// ── MISSÕES ──
const MISSOES_DEF = [
  { id: "kills_5",  nome: "Caçador Iniciante",   desc: "Derrote 5 inimigos",          tipo: "kills_total", alvo: 5,   recompensa: { ouro:   50, xp:   80 }, icon: "⚔️" },
  { id: "kills_20", nome: "Guerreiro das Trevas", desc: "Derrote 20 inimigos",         tipo: "kills_total", alvo: 20,  recompensa: { ouro:  200, xp:  300 }, icon: "🗡️" },
  { id: "kills_50", nome: "Exterminador",         desc: "Derrote 50 inimigos",         tipo: "kills_total", alvo: 50,  recompensa: { ouro:  600, xp:  800 }, icon: "💀" },
  { id: "nivel_5",  nome: "Estudante Avançado",   desc: "Alcance o nível 5",           tipo: "nivel",       alvo: 5,   recompensa: { ouro:  100, xp:    0 }, icon: "📈" },
  { id: "nivel_10", nome: "Mago Habilidoso",       desc: "Alcance o nível 10",          tipo: "nivel",       alvo: 10,  recompensa: { ouro:  300, xp:    0 }, icon: "🔮" },
  { id: "nivel_20", nome: "Mestre das Artes",      desc: "Alcance o nível 20",          tipo: "nivel",       alvo: 20,  recompensa: { ouro:  800, xp:    0 }, icon: "🌟" },
  { id: "ouro_500", nome: "Colecionador",          desc: "Acumule 500 de ouro",         tipo: "ouro",        alvo: 500, recompensa: { ouro:    0, xp:  200 }, icon: "🪙" },
  { id: "boss_1",   nome: "Caçador de Bosses",     desc: "Derrote 1 boss",              tipo: "kills_boss",  alvo: 1,   recompensa: { ouro:  400, xp:  500 }, icon: "🏆" },
  { id: "boss_3",   nome: "Lenda de Hogwarts",     desc: "Derrote 3 bosses",            tipo: "kills_boss",  alvo: 3,   recompensa: { ouro: 1500, xp: 2000 }, icon: "👑" },
  { id: "streak_5", nome: "Invicto",               desc: "Vença 5 batalhas seguidas",   tipo: "streak",      alvo: 5,   recompensa: { ouro:  250, xp:  400 }, icon: "🛡️" },
  { id: "masmorras_3", nome: "Explorador",         desc: "Complete 3 masmorras inteiras",tipo:"masmorras",   alvo: 3,   recompensa: { ouro: 1000, xp: 1200 }, icon: "🗺️" },
];

// ── CONQUISTAS ──
const CONQUISTAS_DEF = [
  { id: "primeiro_sangue", nome: "Primeiro Sangue",      desc: "Vença sua primeira batalha",         icon: "⚔️",  condicao: (s) => s.killsTotal >= 1 },
  { id: "critico_10",      nome: "Sorte do Bruxo",       desc: "Cause 10 golpes críticos",           icon: "💫",  condicao: (s) => (s.criticosTotal||0) >= 10 },
  { id: "sem_morrer_10",   nome: "Intocável",            desc: "Vença 10 batalhas seguidas",         icon: "🛡️",  condicao: (s) => (s.streakMax||0) >= 10 },
  { id: "boss_voldemort",  nome: "O Escolhido",          desc: "Derrote Lord Voldemort",             icon: "⚡",  condicao: (s) => ((s.killsPorTipo||{})["voldemort"]||0) >= 1 },
  { id: "rico",            nome: "Magnata de Galeões",   desc: "Acumule 10.000 de ouro",             icon: "👑",  condicao: (s) => s.ouro >= 10000 },
  { id: "nivel_25",        nome: "Grande Mago",          desc: "Alcance o nível 25",                 icon: "🌟",  condicao: (s) => s.nivel >= 25 },
  { id: "magias_todas",    nome: "Enciclopédia Mágica",  desc: "Aprenda todas as magias da loja",    icon: "📖",  condicao: (s) => s.magicsAprendidas.length >= MAGIAS_LOJA.length },
  { id: "dano_100",        nome: "Devastador",           desc: "Cause 100+ de dano em um golpe",     icon: "💥",  condicao: (s) => (s.maiorDano||0) >= 100 },
  { id: "arvore_3",        nome: "Trilha do Poder",      desc: "Aprenda 3 habilidades da árvore",    icon: "🌳",  condicao: (s) => (s.habilidadesAprendidas||[]).length >= 3 },
  { id: "masmorra_perfeita",nome: "Sem Arranhões",       desc: "Complete uma masmorra sem perder HP", icon: "✨",  condicao: (s) => (s.masmorrasPerfeitas||0) >= 1 },
  { id: "diario_5",        nome: "Cronista",             desc: "Registre 5 entradas no diário",      icon: "📓",  condicao: (s) => (s.diario||[]).length >= 5 },
  { id: "cla_lendario",    nome: "Sangue Lendário",      desc: "Desperte a família Potter",          icon: "⚡",  condicao: (s) => s.claId === 'potter' },
  { id: "colecao_magias",  nome: "Biblioteca Viva",      desc: "Aprenda 10 magias da loja",          icon: "📚",  condicao: (s) => (s.magicsAprendidas||[]).length >= 10 },
  { id: "rico_100k",       nome: "Cofre de Gringotes",   desc: "Acumule 100.000 de ouro",            icon: "🏦",  condicao: (s) => s.ouro >= 100000 },
  { id: "boss_5",          nome: "Predador Supremo",     desc: "Derrote 5 bosses",                   icon: "👑",  condicao: (s) => (s.killsBoss||0) >= 5 },
  { id: "streak_20",       nome: "Sem Misericórdia",     desc: "Alcance streak de 20 vitórias",      icon: "🔥",  condicao: (s) => (s.streakMax||0) >= 20 },
];

// ── EVENTOS ALEATÓRIOS ──
const EVENTOS_ALEATORIOS = [
  { id: "bolsa",    chance: 0.12, icon: "💰", titulo: "Bolsa Perdida!",      efeito: (g) => { const v = rand(15,40); g.ouro += v; return `Você encontrou uma bolsa esquecida! +${v} 🪙`; } },
  { id: "galeoes",  chance: 0.08, icon: "🪙", titulo: "Galeões Antigos!",    efeito: (g) => { const v = rand(30,80); g.ouro += v; return `Uma fenda na parede esconde moedas! +${v} 🪙`; } },
  { id: "armadilha",chance: 0.10, icon: "⚠️", titulo: "Armadilha Mágica!",  efeito: (g) => { const v = rand(8,20); g.hp = Math.max(1, g.hp - v); return `Uma armadilha dispara! -${v} ❤️`; } },
  { id: "mana",     chance: 0.10, icon: "✨", titulo: "Fonte de Mana!",      efeito: (g) => { const v = rand(10,25); g.mp = Math.min(g.mpMax, g.mp + v); return `Energia mágica no ar! +${v} 💧`; } },
  { id: "erva",     chance: 0.08, icon: "🌿", titulo: "Erva Rara!",          efeito: (g) => { const v = rand(15,30); g.hp = Math.min(g.hpMax, g.hp + v); return `Erva medicinal encontrada! +${v} ❤️`; } },
  { id: "livro",    chance: 0.06, icon: "📚", titulo: "Livro Misterioso!",   efeito: (g) => { const v = rand(20,50); g.xp += v; return `Um livro de feitiços revela segredos! +${v} ⭐`; } },
  { id: "fantasma", chance: 0.07, icon: "👻", titulo: "Fantasma Amigável!",  efeito: (g) => { const v = rand(10,20); g.ouro += v; g.xp += v; return `Nick Quase-Sem-Cabeça dá uma dica! +${v}🪙 +${v}⭐`; } },
];

// ── NARRATIVA DE ZONA (primeira visita) ──
const ZONA_NARRATIVA = {
  corredor:   { texto: "Os corredores de Hogwarts ganham vida à noite. Armaduras encantadas se movem e fantasmas sussurram segredos nas paredes de pedra...", subtitulo: "Andar 1 de 3" },
  biblioteca: { texto: "As prateleiras se estendem além da visão. Livros sussurram fórmulas proibidas e sombras escorregam entre os corredores do conhecimento...", subtitulo: "Andar 1 de 3" },
  floresta:   { texto: "A Floresta Proibida. Nenhum estudante deveria estar aqui. Os galhos se fecham e sons estranhos ecoam entre as árvores ancestrais...", subtitulo: "Andar 1 de 3" },
  lago:       { texto: "As águas negras do Lago refletem a lua. Grindylows agarram os tornozelos e sereias cantam para atrair os incautos para as profundezas...", subtitulo: "Andar 1 de 3" },
  dungeons:   { texto: "As masmorras exalam frio e desespero. Trolls batem nas paredes enquanto Dementores flutuam pelos corredores, sugando toda alegria...", subtitulo: "Andar 1 de 3" },
  cemiterio:  { texto: "O cemitério de Little Hangleton. Cheiro de morte no ar. Inferi emergem das tumbas e algo muito mais sombrio aguarda no centro...", subtitulo: "Andar 1 de 3" },
  camara:     { texto: "A Câmara Secreta — o coração da lenda de Salazar Slytherin. O basilisco aguarda nas sombras. Um eco ancestral ressoa nas paredes...", subtitulo: "Andar 1 de 3" },
  ministerio: { texto: "O Ministério da Magia caiu. Aurors corrompidos patrulham enquanto Acromantulas tecem teias nos salões da lei mágica...", subtitulo: "Andar 1 de 3" },
  azkaban:    { texto: "A prisão dos pesadelos. Os Dementores reinam aqui. Uma bruxa louca ri nas sombras. O desespero é tão palpável que dói respirar...", subtitulo: "Andar 1 de 3" },
  torre:      { texto: "A Torre do Mago. O fim de tudo. Lord Voldemort aguarda com seus olhos vermelhos fixos em você. Não há retorno daqui...", subtitulo: "Andar 1 de 3" },
};
