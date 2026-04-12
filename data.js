// ══════════════════════════════════════════
//  data.js — Todos os dados estáticos do jogo
// ══════════════════════════════════════════

// ── QUIZ ──
const PERGUNTAS = [
  { t: '"Na Floresta Proibida, uma bifurcação. Você..."', ops: [
    { t: "Avança pelo caminho mais sombrio sem hesitar.", c: "g" },
    { t: "Analisa pistas ao redor antes de decidir.",    c: "r" },
    { t: "Escolhe o caminho mais estratégico.",          c: "s" },
    { t: "Espera pelos amigos para decidirem juntos.",   c: "h" }
  ]},
  { t: '"Qual conquista te daria mais orgulho?"', ops: [
    { t: "Salvar alguém arriscando a própria vida.",           c: "g" },
    { t: "Descobrir um feitiço que ninguém conhecia.",         c: "r" },
    { t: "Alcançar o topo de uma organização poderosa.",       c: "s" },
    { t: "Ser lembrado como alguém justo e confiável.",        c: "h" }
  ]},
  { t: '"Um baú: Somente os dignos entrarão. Você..."', ops: [
    { t: "Arromba na força — sem medo.",                       c: "g" },
    { t: "Decifra o enigma com calma.",                        c: "r" },
    { t: "Encontra uma forma alternativa e discreta.",         c: "s" },
    { t: "Busca o dono legítimo antes de tudo.",               c: "h" }
  ]},
  { t: '"Qual familiar você escolheria em Hogwarts?"', ops: [
    { t: "Um leão — poderoso e majestoso.",    c: "g" },
    { t: "Uma coruja — sábia e perspicaz.",    c: "r" },
    { t: "Uma cobra — misteriosa e astuta.",   c: "s" },
    { t: "Um texugo — leal e trabalhador.",    c: "h" }
  ]},
  { t: '"Um colega é injustiçado por um professor. Você..."', ops: [
    { t: "Enfrenta o professor publicamente.",                      c: "g" },
    { t: "Pesquisa as regras para um argumento irrefutável.",       c: "r" },
    { t: "Age nos bastidores para reverter a situação.",            c: "s" },
    { t: "Conforta o colega e o apoia em cada passo.",             c: "h" }
  ]}
];

// ── CASAS ──
const CASAS = {
  g: {
    nome: "Gryffindor", crest: "🦁",
    motto: "Onde moram os corajosos de coração",
    desc: "Sua bravura e determinação definem os grandes heróis.",
    traits: ["Coragem", "Bravura", "Determinação", "Nobreza"],
    theme: "th-g",
    passiva: { nome: "Adrenalina do Leão", desc: "Recupera 8 HP ao vencer uma batalha", icon: "❤️‍🔥" },
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

// ── ATAQUE BÁSICO (sem custo de MP) ──
const ATAQUE_BASICO = { id: "__basico__", nome: "Ataque Básico", icon: "🪄", dano: [8, 15], mp: 0, desc: "Golpe sem magia" };

// ── MAGIAS APRENDÍVEIS NA LOJA ──
const MAGIAS_LOJA = [
  { id: "bombarda",    nome: "Bombarda",          icon: "💥", dano: [35, 55],  mp: 30, desc: "Explosão devastadora",                   preco:  10000, nivelMin: 3 },
  { id: "confringo",   nome: "Confringo",         icon: "🌋", dano: [40, 60],  mp: 35, desc: "Feitiço de explosão",                     preco:  15000, nivelMin: 4 },
  { id: "crucio",      nome: "Cruciatus",         icon: "⚡", dano: [45, 70],  mp: 40, desc: "Maldição da dor extrema",                 preco:  25000, nivelMin: 5 },
  { id: "fiendfyre",   nome: "Fiendfyre",         icon: "🔱", dano: [55, 80],  mp: 50, desc: "Chamas infernais incontroláveis",          preco:  30000, nivelMin: 6 },
  { id: "prior",       nome: "Priori Incantatem", icon: "🌀", dano: [60, 90],  mp: 55, desc: "Eco de magias anteriores potencializado",  preco:  50000, nivelMin: 7 },
  { id: "tempestade",  nome: "Tempestade Arcana", icon: "🌪️", dano: [70, 100], mp: 60, desc: "Vendaval de energia mágica pura",          preco:  60000, nivelMin: 8 },
  { id: "morte_negra", nome: "Marca Negra",       icon: "🌑", dano: [80, 110], mp: 70, desc: "O sinal do Lorde das Trevas como arma",    preco:  80000, nivelMin: 9 },
];

// ── ZONAS DO MAPA ──
const ZONAS = [
  { id: "corredor",   nome: "Corredores",                    icon: "🏰", desc: "Fantasmas e armaduras",       inimigos: ["fantasma","armadura"],        xp:  30, ouro:  15, nivelMin:  1 },
  { id: "biblioteca", nome: "Biblioteca Proibida",           icon: "📚", desc: "Livros malditos e sombras",   inimigos: ["sombra","livro_maldito"],      xp:  45, ouro:  20, nivelMin:  3 },
  { id: "floresta",   nome: "Floresta Proibida",             icon: "🌲", desc: "Criaturas selvagens",         inimigos: ["aragog","centauro"],           xp:  60, ouro:  28, nivelMin:  6 },
  { id: "lago",       nome: "Lago Negro",                    icon: "🌊", desc: "Criaturas das profundezas",   inimigos: ["grindylow","sereia_negra"],    xp:  75, ouro:  35, nivelMin: 10 },
  { id: "dungeons",   nome: "Masmorras",                     icon: "⚗️", desc: "Seres das trevas",            inimigos: ["troll","dementor"],            xp:  90, ouro:  45, nivelMin: 14 },
  { id: "cemiterio",  nome: "Cemitério de Little Hangleton", icon: "⚰️", desc: "Mortos que caminham",         inimigos: ["inferi","peter_pettigrew"],    xp: 110, ouro:  55, nivelMin: 18, boss: true },
  { id: "camara",     nome: "Câmara Secreta",                icon: "🐍", desc: "O covil da serpente",         inimigos: ["basilisco","tom_riddle"],      xp: 130, ouro:  65, nivelMin: 22, boss: true },
  { id: "ministerio", nome: "Ministério da Magia",           icon: "🏛️", desc: "Aurors corrompidos",          inimigos: ["auror_sombrio","acromantula"], xp: 155, ouro:  80, nivelMin: 27 },
  { id: "azkaban",    nome: "Azkaban",                       icon: "🏚️", desc: "Horrores sem nome",           inimigos: ["dementor_senhor","bellatrix"], xp: 180, ouro:  95, nivelMin: 32, boss: true },
  { id: "torre",      nome: "Torre do Mago",                 icon: "🗼", desc: "O desafio final",             inimigos: ["voldemort"],                   xp: 250, ouro: 130, nivelMin: 40, boss: true }
];

// ── INIMIGOS BASE ──
const INIMIGOS_BASE = {
  fantasma:        { nome: "Fantasma Sanguinário",    art: "👻", hpMax:  60, atk: [ 8,16], xp:  30, ouro:  12, habilidade: null },
  armadura:        { nome: "Armadura Encantada",      art: "🗡️", hpMax:  80, atk: [10,18], xp:  35, ouro:  15, habilidade: "escudo" },
  sombra:          { nome: "Sombra Sussurrante",      art: "🌫️", hpMax:  70, atk: [ 9,17], xp:  32, ouro:  13, habilidade: "dreno_mp" },
  livro_maldito:   { nome: "Livro Amaldiçoado",       art: "📖", hpMax:  65, atk: [11,19], xp:  38, ouro:  16, habilidade: null },
  aragog:          { nome: "Aragog Menor",            art: "🕷️", hpMax: 110, atk: [14,24], xp:  55, ouro:  22, habilidade: "veneno" },
  centauro:        { nome: "Centauro Feroz",          art: "🏹", hpMax: 120, atk: [16,26], xp:  60, ouro:  25, habilidade: null },
  grindylow:       { nome: "Grindylow das Trevas",    art: "🦑", hpMax: 105, atk: [15,25], xp:  58, ouro:  24, habilidade: "dreno_mp" },
  sereia_negra:    { nome: "Sereia Negra",            art: "🧜", hpMax: 115, atk: [17,27], xp:  65, ouro:  28, habilidade: "cura" },
  troll:           { nome: "Troll das Masmorras",     art: "👾", hpMax: 180, atk: [22,36], xp:  80, ouro:  38, habilidade: "escudo" },
  dementor:        { nome: "Dementor",                art: "🌑", hpMax: 160, atk: [24,38], xp:  85, ouro:  40, habilidade: "dreno_mp" },
  inferi:          { nome: "Inferi",                  art: "🧟", hpMax: 200, atk: [26,40], xp: 100, ouro:  50, habilidade: "cura" },
  peter_pettigrew: { nome: "Peter Pettigrew",         art: "🐀", hpMax: 175, atk: [24,38], xp:  95, ouro:  48, habilidade: "esquiva", boss: true },
  basilisco:       { nome: "Basilisco",               art: "🐲", hpMax: 260, atk: [30,46], xp: 125, ouro:  62, habilidade: "veneno",   boss: true },
  tom_riddle:      { nome: "Tom Riddle",              art: "🪬", hpMax: 240, atk: [28,44], xp: 118, ouro:  58, habilidade: "dreno_mp", boss: true },
  auror_sombrio:   { nome: "Auror Sombrio",           art: "🕵️", hpMax: 280, atk: [32,48], xp: 140, ouro:  70, habilidade: "escudo" },
  acromantula:     { nome: "Acromantula",             art: "🕸️", hpMax: 260, atk: [30,46], xp: 135, ouro:  67, habilidade: "veneno" },
  dementor_senhor: { nome: "Senhor dos Dementores",   art: "💀", hpMax: 320, atk: [36,54], xp: 165, ouro:  85, habilidade: "dreno_mp", boss: true },
  bellatrix:       { nome: "Bellatrix Lestrange",     art: "🖤", hpMax: 300, atk: [34,52], xp: 158, ouro:  80, habilidade: "cura",     boss: true },
  voldemort:       { nome: "Lord Voldemort",          art: "🐍", hpMax: 450, atk: [40,62], xp: 300, ouro: 150, habilidade: "reflexo",  boss: true }
};

// ── FALAS ANTES DAS BATALHAS BOSS ──
const BOSS_INTRO_FALAS = {
  peter_pettigrew: "«Ah... ah... não quero brigar! Sou inofensivo... apenas um rato, apenas um servo...»",
  basilisco:       "«*HISSSS* — Uma presença ancestral e mortal envolve o ar. Não olhe nos olhos...»",
  tom_riddle:      "«Você sabe quem eu sou? Eu sou Tom Riddle... e você vai me ajudar a renascer.»",
  bellatrix:       "«Ohhh, que delícia! Deixe-me mostrar o que aprendi com meu Lorde... Crucio será apenas o começo!»",
  voldemort:       "«Você chegou até aqui para morrer. Avada Kedavra não perdoa... nem mesmo heróis.»",
  dementor_senhor: "«...lembre-se do seu pior momento... nós nos alimentamos do desespero...»",
};

// ── FALAS FINAIS DOS BOSSES ──
const BOSS_FALAS = {
  peter_pettigrew: { art: "🐀", fala: "«N-não... impossível! O Lorde das Trevas vai me vingar... sempre há uma saída... sempre...»" },
  basilisco:       { art: "🐲", fala: "«Mil anos... guardando este segredo... e você, um mero estudante, me derrota... Que a câmara... permaneça... eterna...»" },
  tom_riddle:      { art: "🪬", fala: "«Você destruiu minha memória... mas saiba: onde há trevas, sempre haverá um Riddle. Eu voltarei... sempre voltarei...»" },
  bellatrix:       { art: "🖤", fala: "«Como ousou?! Meu Lorde... perdoa tua serva mais fiel... eu falhei... mas as trevas... NUNCA morrem! Nunca!!!»" },
  voldemort:       { art: "🐍", fala: "«Não... pode... ser... Eu sou a morte encarnada... Como pode um ser tão frágil me derrotar?! NÃO!!! Eu sou imortal... eu... sou...»" },
  dementor_senhor: { art: "💀", fala: "«...a escuridão sempre retorna... não há vitória... apenas... atraso... O frio eterno... nunca desaparece...»" },
};

// ── LOJA — ITENS ──
const LOJA_ITENS = [
  { id: "potion",        nome: "Poção de Cura",          icon: "🧪", preco:    20, desc: "Restaura 40 HP",             tipo: "consumivel", nivelMin: 1 },
  { id: "mana_pot",      nome: "Poção de Mana",           icon: "💧", preco:    28, desc: "Restaura 30 MP",             tipo: "consumivel", nivelMin: 1 },
  { id: "grande_potion", nome: "Poção Grande",             icon: "🫙", preco:    55, desc: "Restaura 80 HP",             tipo: "consumivel", nivelMin: 2 },
  { id: "elixir",        nome: "Elixir da Força",         icon: "⚗️", preco:   110, desc: "Restaura 60 HP e 40 MP",     tipo: "consumivel", nivelMin: 4 },
  { id: "potion_full",   nome: "Poção Mestra",             icon: "💎", preco:   250, desc: "HP e MP totalmente cheios",  tipo: "consumivel", nivelMin: 6 },
  { id: "xp_pot_p",      nome: "Essência de Experiência", icon: "🌿", preco:   150, desc: "XP +50% por 5 minutos",      tipo: "xppot",      nivelMin: 3,  xpBoost: 1.5, xpDuracao: 300000 },
  { id: "xp_pot_m",      nome: "Elixir do Aprendizado",   icon: "🔆", preco:   400, desc: "XP +100% por 5 minutos",     tipo: "xppot",      nivelMin: 8,  xpBoost: 2.0, xpDuracao: 300000 },
  { id: "xp_pot_g",      nome: "Pergaminho Ancestral",    icon: "📿", preco:   900, desc: "XP +200% por 5 minutos",     tipo: "xppot",      nivelMin: 15, xpBoost: 3.0, xpDuracao: 300000 },
  { id: "escudo",        nome: "Amuleto Protetor",        icon: "🔰", preco:    70, desc: "+15 HP máximo",              tipo: "permanente", nivelMin: 2,  limite: 1 },
  { id: "pergaminho",    nome: "Pergaminho do Sábio",      icon: "📜", preco:    90, desc: "+10 MP máximo",              tipo: "permanente", nivelMin: 3,  limite: 1 },
  { id: "colar_crit",    nome: "Colar da Sorte",          icon: "🍀", preco:   200, desc: "Chance de crítico +10%",      tipo: "permanente", nivelMin: 5,  limite: 1 },
  { id: "anel_xp",       nome: "Anel do Estudioso",       icon: "💍", preco:   350, desc: "+15% XP permanente",          tipo: "permanente", nivelMin: 7,  limite: 1 },
  { id: "varinha1", nome: "Varinha Reforçada",    icon: "🪄", preco:      80, desc: "+10 dano permanente", tipo: "varinha", nivelMin: 1, varinhaLvl: 1, limite: 1 },
  { id: "varinha2", nome: "Varinha Ancestral",    icon: "🔮", preco:  300000, desc: "+25 dano permanente", tipo: "varinha", nivelMin: 5, varinhaLvl: 2, limite: 1 },
  { id: "varinha3", nome: "Varinha das Varinhas", icon: "🌟", preco:  500000, desc: "+50 dano permanente", tipo: "varinha", nivelMin: 8, varinhaLvl: 3, limite: 1 },
];

// ── MISSÕES ──
const MISSOES_DEF = [
  { id: "kills_5",     nome: "Caçador Iniciante",    desc: "Derrote 5 inimigos",          tipo: "kills_total", alvo: 5,   recompensa: { ouro:   50, xp:   80 }, icon: "⚔️" },
  { id: "kills_20",    nome: "Guerreiro das Trevas",  desc: "Derrote 20 inimigos",         tipo: "kills_total", alvo: 20,  recompensa: { ouro:  200, xp:  300 }, icon: "🗡️" },
  { id: "kills_50",    nome: "Exterminador",          desc: "Derrote 50 inimigos",         tipo: "kills_total", alvo: 50,  recompensa: { ouro:  600, xp:  800 }, icon: "💀" },
  { id: "nivel_5",     nome: "Estudante Avançado",    desc: "Alcance o nível 5",           tipo: "nivel",       alvo: 5,   recompensa: { ouro:  100, xp:    0 }, icon: "📈" },
  { id: "nivel_10",    nome: "Mago Habilidoso",       desc: "Alcance o nível 10",          tipo: "nivel",       alvo: 10,  recompensa: { ouro:  300, xp:    0 }, icon: "🔮" },
  { id: "nivel_20",    nome: "Mestre das Artes",      desc: "Alcance o nível 20",          tipo: "nivel",       alvo: 20,  recompensa: { ouro:  800, xp:    0 }, icon: "🌟" },
  { id: "ouro_500",    nome: "Colecionador",          desc: "Acumule 500 de ouro",         tipo: "ouro",        alvo: 500, recompensa: { ouro:    0, xp:  200 }, icon: "🪙" },
  { id: "boss_1",      nome: "Caçador de Bosses",     desc: "Derrote 1 boss",              tipo: "kills_boss",  alvo: 1,   recompensa: { ouro:  400, xp:  500 }, icon: "🏆" },
  { id: "boss_3",      nome: "Lenda de Hogwarts",     desc: "Derrote 3 bosses",            tipo: "kills_boss",  alvo: 3,   recompensa: { ouro: 1500, xp: 2000 }, icon: "👑" },
  { id: "streak_5",    nome: "Invicto",               desc: "Vença 5 batalhas sem morrer", tipo: "streak",      alvo: 5,   recompensa: { ouro:  250, xp:  400 }, icon: "🛡️" },
];

// ── CONQUISTAS ──
const CONQUISTAS_DEF = [
  { id: "primeiro_sangue", nome: "Primeiro Sangue",     desc: "Vença sua primeira batalha",         icon: "⚔️",  condicao: (s) => s.killsTotal >= 1 },
  { id: "critico_10",      nome: "Sorte do Bruxo",      desc: "Cause 10 golpes críticos",           icon: "💫",  condicao: (s) => (s.criticosTotal||0) >= 10 },
  { id: "sem_morrer_10",   nome: "Intocável",           desc: "Vença 10 batalhas seguidas",         icon: "🛡️",  condicao: (s) => (s.streakMax||0) >= 10 },
  { id: "boss_voldemort",  nome: "O Escolhido",         desc: "Derrote Lord Voldemort",             icon: "⚡",  condicao: (s) => ((s.killsPorTipo||{})["voldemort"]||0) >= 1 },
  { id: "rico",            nome: "Magnata de Galeões",  desc: "Acumule 10.000 de ouro",             icon: "👑",  condicao: (s) => s.ouro >= 10000 },
  { id: "nivel_25",        nome: "Grande Mago",         desc: "Alcance o nível 25",                 icon: "🌟",  condicao: (s) => s.nivel >= 25 },
  { id: "magias_todas",    nome: "Enciclopédia Mágica", desc: "Aprenda todas as magias da loja",    icon: "📖",  condicao: (s) => s.magicsAprendidas.length >= MAGIAS_LOJA.length },
  { id: "dano_100",        nome: "Devastador",          desc: "Cause 100+ de dano em um golpe",     icon: "💥",  condicao: (s) => (s.maiorDano||0) >= 100 },
];

// ── EVENTOS ALEATÓRIOS DO MAPA ──
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

const EVENTOS_ALEATORIOS = [
  { id: "bolsa",    chance: 0.12, icon: "💰", titulo: "Bolsa Perdida!",       efeito: (g) => { const v = rand(15,40); g.ouro += v; return `Você encontrou uma bolsa esquecida! +${v} 🪙`; } },
  { id: "galeoes",  chance: 0.08, icon: "🪙", titulo: "Galeões Antigos!",     efeito: (g) => { const v = rand(30,80); g.ouro += v; return `Uma fenda na parede esconde moedas antigas! +${v} 🪙`; } },
  { id: "armadilha",chance: 0.10, icon: "⚠️", titulo: "Armadilha Mágica!",   efeito: (g) => { const v = rand(8,20); g.hp = Math.max(1, g.hp - v); return `Uma armadilha dispara sobre você! -${v} ❤️`; } },
  { id: "mana",     chance: 0.10, icon: "✨", titulo: "Fonte de Mana!",       efeito: (g) => { const v = rand(10,25); g.mp = Math.min(g.mpMax, g.mp + v); return `Uma fonte de energia mágica! +${v} 💧`; } },
  { id: "erva",     chance: 0.08, icon: "🌿", titulo: "Erva Rara!",           efeito: (g) => { const v = rand(15,30); g.hp = Math.min(g.hpMax, g.hp + v); return `Uma erva medicinal nos arbustos! +${v} ❤️`; } },
  { id: "livro",    chance: 0.06, icon: "📚", titulo: "Livro Misterioso!",    efeito: (g) => { const v = rand(20,50); g.xp += v; return `Um livro de feitiços revela segredos! +${v} ⭐ XP`; } },
  { id: "fantasma", chance: 0.07, icon: "👻", titulo: "Fantasma Amigável!",   efeito: (g) => { const v = rand(10,20); g.ouro += v; g.xp += v; return `Nick Quase-Sem-Cabeça dá uma dica! +${v} 🪙 +${v} ⭐`; } },
  { id: "carta",    chance: 0.05, icon: "✉️", titulo: "Carta de Hogwarts!",  efeito: (g) => { g.hp = Math.min(g.hpMax, g.hp + 10); g.mp = Math.min(g.mpMax, g.mp + 10); return `Uma carta misteriosa te incentiva! +10 ❤️ +10 💧`; } },
];

// ── TEXTOS NARRATIVOS DE ZONA ──
const ZONA_NARRATIVA = {
  corredor:   "Os corredores de Hogwarts ganham vida à noite. Armaduras encantadas se movem e fantasmas sussurram segredos antigos...",
  biblioteca: "As prateleiras se estendem além da visão. Livros sussurram fórmulas proibidas e sombras escorregam entre os corredores...",
  floresta:   "A Floresta Proibida. Nenhum estudante deveria estar aqui. Os galhos se fecham acima enquanto sons estranhos ecoam entre as árvores...",
  lago:       "As águas negras do Lago refletem a lua. Algo se move nas profundezas. Grindylows agarram os tornozelos e sereias cantam para atrair os incautos...",
  dungeons:   "As masmorras exalam frio e desespero. Trolls batem nas paredes enquanto Dementores flutuam pelos corredores, sugando toda alegria...",
  cemiterio:  "O cemitério de Little Hangleton. Cheiro de morte no ar. Inferi emergem das tumbas e algo muito mais sombrio aguarda no centro...",
  camara:     "A Câmara Secreta — o coração da lenda de Salazar Slytherin. O basilisco aguarda nas sombras. Um eco antigo ressoa nas paredes...",
  ministerio: "O Ministério da Magia caiu. Aurors corrompidos patrulham os corredores enquanto Acromantulas tecem teias nos salões da lei...",
  azkaban:    "A prisão dos pesadelos. Os Dementores reinam aqui. Uma bruxa louca ri nas sombras. O desespero é tão palpável que dói respirar...",
  torre:      "A Torre do Mago. O fim da jornada. Lord Voldemort aguarda com seus olhos vermelhos fixos em você. Não há retorno daqui..."
};
